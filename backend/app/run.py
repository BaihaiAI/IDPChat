from flask import Flask, render_template, request, make_response
import json
from image import generate_image
from text import conversation_text, delete_conversation

app=Flask(__name__, template_folder='dist',
          static_folder='dist',
          static_url_path='/')

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/home')
def home():
    return render_template('index.html')

@app.route('/api/conversation/msg', methods=['POST'])
def conversation_msg():
    try:
        requestBody = json.loads(request.get_data(as_text=True))
        print(requestBody)
        content = ''
        contentType = 'text'
        msg = requestBody['text']
        conversationId = requestBody['conversationId']
        if msg.startswith('画'):
            content = generate_image(msg[1:])
            contentType = 'image'
        else:
            content = conversation_text(msg, conversationId)
            contentType = 'text'

        responseData = {
            "code": 20000000,
            "data": {
                "conversationId": conversationId,
                "msgId": requestBody['msgId'],
                "type": contentType,
                "content": content
            },
            "message": ""
        }
        response = json.dumps(responseData)
        return response,200,{"Content-Type":"application/json"}
    except Exception as e:
        print(e)
        responseData = {
            "code": 50000000,
            "data": {},
            "message": str(e)
        }
        response = json.dumps(responseData)
        return response,500,{"Content-Type":"application/json"}

@app.route('/api/conversation/feedback', methods=['POST'])
def conversation_feedback():
    try:
        requestBody = json.loads(request.get_data(as_text=True))
        print(requestBody)
        responseData = {
            "code": 20000000,
            "data": {
                "conversationId": requestBody['conversationId'],
                "msgId": requestBody['msgId'],
            },
            "message": ""
        }
        response = json.dumps(responseData)
        return response,200,{"Content-Type":"application/json"}
    except Exception as e:
        print(e)
        responseData = {
            "code": 50000000,
            "data": {},
            "message": str(e)
        }
        response = json.dumps(responseData)
        return response,500,{"Content-Type":"application/json"}
    
@app.route('/api/conversation/exit', methods=['POST'])
def conversation_exit():
    try:
        requestBody = json.loads(request.get_data(as_text=True))
        print(requestBody)
        delete_conversation(requestBody['conversationId'])
        responseData = {
            "code": 20000000,
            "data": {
                "conversationId": requestBody['conversationId'],
            },
            "message": ""
        }
        response = json.dumps(responseData)
        return response,200,{"Content-Type":"application/json"}
    except Exception as e:
        print(e)
        responseData = {
            "code": 50000000,
            "data": {},
            "message": str(e)
        }
        response = json.dumps(responseData)
        return response,500,{"Content-Type":"application/json"}

if __name__=="__main__":
    app.run(port=8000,host="0.0.0.0",debug=False)