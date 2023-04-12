from strings import SPECIAL_STRS

from constants import num_of_characters_to_keep

from model import load_model
from gen import get_output_batch, StreamModel
from utils import generate_prompt, post_process_stream, get_generation_config, common_post_process

generation_config = get_generation_config(
    "./llama/generation_config_default.yaml"
)

model, tokenizer = load_model(
    base="/opt/model/models--decapoda-research--llama-13b-hf/snapshots/438770a656712a5072229b62256521845d4de5ce",
    finetuned="./llama/lora-alpaca-chinese-13b"
)    

stream_model = StreamModel(model, tokenizer)

def chat_stream(
    context,
    instruction,
    state_chatbot,
):
    if len(context) > 1000 or len(instruction) > 300:
        raise Exception("context or prompt is too long!")
        
    bot_summarized_response = ''
    # user input should be appropriately formatted (don't be confused by the function name)
    instruction_display = common_post_process(instruction)
    instruction_prompt, conv_length = generate_prompt(instruction, state_chatbot, context)
    
    if conv_length > num_of_characters_to_keep:
        instruction_prompt = generate_prompt(SPECIAL_STRS["summarize"], state_chatbot, context, partial=True)[0]
        
        state_chatbot = state_chatbot + [
            (
                None, 
                "![](https://s2.gifyu.com/images/icons8-loading-circle.gif) too long conversations, so let's summarize..."
            )
        ]
        yield (state_chatbot, context)
        
        bot_summarized_response = get_output_batch(
            model, tokenizer, [instruction_prompt], generation_config
        )[0]
        bot_summarized_response = bot_summarized_response.split("### Response:")[-1].strip()
        
        state_chatbot[-1] = (
            None, 
            "✅ summarization is done and set as context"
        )
        print(f"bot_summarized_response: {bot_summarized_response}")
        yield (state_chatbot, f"{context}. {bot_summarized_response}".strip())
        
    instruction_prompt = generate_prompt(instruction, state_chatbot, f"{context} {bot_summarized_response}")[0]
    
    bot_response = stream_model(
        instruction_prompt,
        max_tokens=256,
        temperature=1,
        top_p=0.9
    )
    
    instruction_display = None if instruction_display == SPECIAL_STRS["continue"] else instruction_display
    state_chatbot = state_chatbot + [(instruction_display, None)]
    yield (state_chatbot, f"{context}. {bot_summarized_response}".strip())
    
    prev_index = 0
    agg_tokens = ""
    cutoff_idx = 0
    for tokens in bot_response:
        tokens = tokens.strip()
        cur_token = tokens[prev_index:]
        
        if "#" in cur_token and agg_tokens == "":
            cutoff_idx = tokens.find("#")
            agg_tokens = tokens[cutoff_idx:]

        if agg_tokens != "":
            if len(agg_tokens) < len("### Instruction:") :
                agg_tokens = agg_tokens + cur_token
            elif len(agg_tokens) >= len("### Instruction:"):
                if tokens.find("### Instruction:") > -1:
                    processed_response, _ = post_process_stream(tokens[:tokens.find("### Instruction:")].strip())

                    state_chatbot[-1] = (
                        instruction_display, 
                        processed_response
                    )
                    yield (state_chatbot, f"{context} {bot_summarized_response}".strip())
                    break
                else:
                    agg_tokens = ""
                    cutoff_idx = 0

        if agg_tokens == "":
            processed_response, to_exit = post_process_stream(tokens)
            state_chatbot[-1] = (instruction_display, processed_response)
            yield (state_chatbot, f"{context} {bot_summarized_response}".strip())

            if to_exit:
                break

        prev_index = len(tokens)

    yield (
        state_chatbot,
        f"{context} {bot_summarized_response}".strip()
    )