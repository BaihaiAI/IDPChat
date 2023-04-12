IDPChat是开放的中文多模态模型，基于预训练大预言模型LLaMA和开源文生图预训练模型Stable Diffusion构建。

#### Requirement
1. 操作系统：Ubuntu 20+
2. cuda 11+, python3.7+
3. CPU: 10核，GPU: 1个，内存: 20G

#### Quickstart
1. 下载 stable-diffusion 模型到本地，模型下载地址：https://huggingface.co/stabilityai/stable-diffusion-2-1
2. 下载 llama 模型到本地，模型下载地址：https://huggingface.co/decapoda-research/llama-7b-hf/tree/main
3. 下载中文翻译模型本地，模型下载地址：https://huggingface.co/Helsinki-NLP/opus-mt-zh-en/tree/main
4. 修改 ./backend/app/stable_diffusion/generate_image.py 文件，设置 diffusion_path 的值为本地 stable-diffusion 模型存储路径，设置 trans_path 的值为本地中文翻译模型的存储路径
5. 修改 ./backend/app/llama/generate_text.py 文件，设置 load_model 的 base 参数值为本地 llama 模型的存储路径
6. 执行 build.sh 脚本进行编译
7. 编译成功后执行 run.sh 脚本启动服务
8. 服务启动成功后，在浏览器中打开 http://127.0.0.1:8000
