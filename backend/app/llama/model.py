from peft import PeftModel
from transformers import LlamaTokenizer, LlamaForCausalLM

def load_model(
    base="llama-7b-hf",
    finetuned="alpaca-lora-7b",
):
    tokenizer = LlamaTokenizer.from_pretrained(base)
    tokenizer.pad_token_id = 0
    tokenizer.padding_side = "left"

    model = LlamaForCausalLM.from_pretrained(
        base,
        load_in_8bit=True,
        device_map={'': 0},
    )
    
    model = PeftModel.from_pretrained(model, finetuned, device_map={'': 0})
    return model, tokenizer

