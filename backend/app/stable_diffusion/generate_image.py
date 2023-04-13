from diffusers import StableDiffusionPipeline,StableDiffusionImg2ImgPipeline
from transformers import AutoTokenizer, AutoModelForSeq2SeqLM
import torch
import base64
import random
from io import BytesIO

diffusion_path = '/opt/model/idp-diffusion-2'
trans_path = '/opt/model/zh-en'

print('load diffusion ...')
# 初始化 diffusion
pipe_word2img = StableDiffusionPipeline.from_pretrained(diffusion_path, torch_dtype=torch.float16).to('cuda')

# 翻译
trans_tokenizer = AutoTokenizer.from_pretrained(trans_path)
trans_model = AutoModelForSeq2SeqLM.from_pretrained(trans_path)
def trans(text):
    tokenized_text = trans_tokenizer(text,return_tensors="pt", padding=True)
    translated = trans_model.generate(**tokenized_text)
    translated_text = [trans_tokenizer.decode(t, skip_special_tokens=True) for t in translated]
    if len(translated_text) > 0:
        return translated_text[0]
    else:
        return text

#PIL图片保存为base64编码
def PIL_base64(img, coding='utf-8'):
    img_format = img.format
    if img_format == None:
        img_format = 'JPEG'
 
    format_str = 'JPEG'
    if 'png' == img_format.lower():
        format_str = 'PNG'
    if 'gif' == img_format.lower():
        format_str = 'gif'
 
    if img.mode == 'P':
        img = img.convert('RGB')
    if img.mode == 'RGBA':
        format_str = 'PNG'
        img_format = 'PNG'
 
    output_buffer = BytesIO()
    img.save(output_buffer, quality=100, format=format_str)
    byte_data = output_buffer.getvalue()
    base64_str = 'data:image/' + img_format.lower() + ';base64,' + base64.b64encode(byte_data).decode(coding)
    return base64_str

def generate_image(text):
    prompt = trans(text)
    random_long = random.randint(1,999999999)
    generator = torch.Generator(device='cuda').manual_seed(random_long)
    images = pipe_word2img(prompt,
                            height=512,
                            width=512,
                            negative_prompt='',
                            num_images_per_prompt=1,
                            generator=generator,
                            num_inference_steps=50,
                            guidance_scale=8
                        ).images
    image_base64 = PIL_base64(images[0])
    return image_base64