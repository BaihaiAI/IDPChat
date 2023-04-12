import json
from stable_diffusion.generate_image import generate_image
from llama.generate_text import chat_stream

def image(msg, conversationId, msgId):
    content = generate_image(msg)
    data = {
        "code": 20000000,
        "data": {
            "conversationId": conversationId,
            "msgId": msgId,
            "type": 'image',
            "content": content
        },
        "message": ""
    }
    result = json.dumps(data)
    yield result

def text(msg, conversationId, msgId, histories):
    i = 0
    while i < len(histories):
        history = histories[i]
        histories[i] = (history['q'], history['a'])
        i += 1
        
    stream = chat_stream('', msg, histories)
    for s in stream:
        (response, _) = s
        (_, content) = response[-1]
        data = {
            "code": 20000000,
            "data": {
                "conversationId": conversationId,
                "msgId": msgId,
                "type": 'text',
                "content": content
            },
            "message": ""
        }
        result = json.dumps(data, ensure_ascii=False)
        yield result