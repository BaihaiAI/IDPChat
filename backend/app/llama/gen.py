import gc
import copy
import time

import torch

from transformers import (
    AutoModelForCausalLM,
    AutoModelForSeq2SeqLM,
    AutoTokenizer,
    LogitsProcessorList,
    MinNewTokensLengthLogitsProcessor,
    TemperatureLogitsWarper,
    TopPLogitsWarper,
    MinLengthLogitsProcessor
)

def get_output_batch(
    model, tokenizer, prompts, generation_config
):
    if len(prompts) == 1:
        encoding = tokenizer(prompts, return_tensors="pt")
        input_ids = encoding["input_ids"].cuda()
        generated_id = model.generate(
            input_ids=input_ids,
            generation_config=generation_config,
            max_new_tokens=256
        )

        decoded = tokenizer.batch_decode(generated_id)
        del input_ids, generated_id
        torch.cuda.empty_cache()
        return decoded
    else:
        encodings = tokenizer(prompts, padding=True, return_tensors="pt").to('cuda')
        generated_ids = model.generate(
            **encodings,
            generation_config=generation_config,
            max_new_tokens=256
        )

        decoded = tokenizer.batch_decode(generated_ids)
        del encodings, generated_ids
        torch.cuda.empty_cache()
        return decoded


# StreamModel is borrowed from basaran project
# please find more info about it -> https://github.com/hyperonym/basaran
class StreamModel:
    """StreamModel wraps around a language model to provide stream decoding."""

    def __init__(self, model, tokenizer):
        super().__init__()
        self.model = model
        self.tokenizer = tokenizer
        self.device = "cuda" if torch.cuda.is_available() else "cpu"

        self.processor = LogitsProcessorList()
        self.processor.append(TemperatureLogitsWarper(0.9))
        self.processor.append(TopPLogitsWarper(0.75))


    def __call__(
        self,
        prompt,
        min_tokens=0,
        max_tokens=16,
        temperature=1.0,
        top_p=1.0,
        n=1,
        logprobs=0,
    ):
        """Create a completion stream for the provided prompt."""
        input_ids = self.tokenize(prompt)
        logprobs = max(logprobs, 0)

        # bigger than 1
        chunk_size = 2
        chunk_count = 0
        
        # Generate completion tokens.
        final_tokens = torch.empty(0)
        
        for tokens in self.generate(
            input_ids[None, :].repeat(n, 1),
            logprobs=logprobs,
            min_new_tokens=min_tokens,
            max_new_tokens=max_tokens,
            temperature=temperature,
            top_p=top_p,
        ):
            if chunk_count < chunk_size:
                chunk_count = chunk_count + 1        
            
            final_tokens = torch.cat((final_tokens, tokens.to("cpu")))

            if chunk_count == chunk_size-1:
                chunk_count = 0
                yield self.tokenizer.decode(final_tokens, skip_special_tokens=True)

        if chunk_count > 0:
            yield self.tokenizer.decode(final_tokens, skip_special_tokens=True)
                
        del final_tokens, input_ids
        if self.device == "cuda": 
            torch.cuda.empty_cache()

    def _infer(self, model_fn, **kwargs):
        with torch.inference_mode():
            return model_fn(**kwargs)

    def tokenize(self, text):
        """Tokenize a string into a tensor of token IDs."""
        batch = self.tokenizer.encode(text, return_tensors="pt")
        return batch[0].to(self.device)

    def generate(self, input_ids, logprobs=0, **kwargs):
        """Generate a stream of predicted tokens using the language model."""

        # Store the original batch size and input length.
        batch_size = input_ids.shape[0]
        input_length = input_ids.shape[-1]

        # Separate model arguments from generation config.
        config = self.model.generation_config
        config = copy.deepcopy(config)
        kwargs = config.update(**kwargs)
        kwargs["output_attentions"] = False
        kwargs["output_hidden_states"] = False
        kwargs["use_cache"] = True

        # Collect special token IDs.
        pad_token_id = config.pad_token_id
        bos_token_id = config.bos_token_id
        eos_token_id = config.eos_token_id
        if isinstance(eos_token_id, int):
            eos_token_id = [eos_token_id]
        if pad_token_id is None and eos_token_id is not None:
            pad_token_id = eos_token_id[0]

        # Generate from eos if no input is specified.
        if input_length == 0:
            input_ids = input_ids.new_ones((batch_size, 1)).long()
            if eos_token_id is not None:
                input_ids = input_ids * eos_token_id[0]
            input_length = 1

        # Keep track of which sequences are already finished.
        unfinished = input_ids.new_ones(batch_size)

        # Start auto-regressive generation.
        while True:
            inputs = self.model.prepare_inputs_for_generation(
                input_ids, **kwargs
            )  # noqa: E501

            outputs = self._infer(
                self.model,
                **inputs,
                # return_dict=True,
                output_attentions=False,
                output_hidden_states=False,
            )

            # Pre-process the probability distribution of the next tokens.
            logits = outputs.logits[:, -1, :]
            with torch.inference_mode():
                logits = self.processor(input_ids, logits)
            probs = torch.nn.functional.softmax(logits, dim=-1)

            # Select deterministic or stochastic decoding strategy.
            if (config.top_p is not None and config.top_p <= 0) or (
                config.temperature is not None and config.temperature <= 0
            ):
                tokens = torch.argmax(probs, dim=-1)[:, None]
            else:
                tokens = torch.multinomial(probs, num_samples=1)

            tokens = tokens.squeeze(1)

            # Finished sequences should have their next token be a padding.
            if pad_token_id is not None:
                tokens = tokens * unfinished + pad_token_id * (1 - unfinished)

            # Append selected tokens to the inputs.
            input_ids = torch.cat([input_ids, tokens[:, None]], dim=-1)

            # Mark sequences with eos tokens as finished.
            if eos_token_id is not None:
                not_eos = sum(tokens != i for i in eos_token_id)
                unfinished = unfinished.mul(not_eos.long())

            # Set status to -1 if exceeded the max length.
            status = unfinished.clone()
            if input_ids.shape[-1] - input_length >= config.max_new_tokens:
                status = 0 - status

            # Yield predictions and status.
            yield tokens

            # Stop when finished or exceeded the max length.
            if status.max() <= 0:
                break
    
