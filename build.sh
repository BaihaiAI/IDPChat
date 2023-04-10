#!/bin/bash
cd frontend
yarn && yarn build
cd ../backend
apt-get install git-lfs
pip install torch==1.13.1+cu117 torchvision==0.14.1+cu117 torchaudio==0.13.1 --extra-index-url https://download.pytorch.org/whl/cu117
pip install git+https://github.com/huggingface/transformers
pip install -r requirements.txt
cd app
rm -rf dist
cp -r ../../frontend/dist .
