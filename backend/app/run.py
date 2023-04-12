from flask import Flask, Response, render_template, request, stream_with_context, make_response
import json
from generate import image, text

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
        msg = requestBody['text']
        conversationId = requestBody['conversationId']
        msgId = requestBody['msgId']
        if msg.startswith('画'):
            response = Response(stream_with_context(image(msg[1:], conversationId, msgId)), mimetype="text/event-stream")
            return response
        else:
            histories = requestBody['histories']
            response = Response(stream_with_context(text(msg, conversationId, msgId, histories)), mimetype="text/event-stream")
            return response
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
    
# @app.route('/api/conversation/exit', methods=['POST'])
# def conversation_exit():
#     try:
#         requestBody = json.loads(request.get_data(as_text=True))
#         print(requestBody)
#         delete_conversation(requestBody['conversationId'])
#         responseData = {
#             "code": 20000000,
#             "data": {
#                 "conversationId": requestBody['conversationId'],
#             },
#             "message": ""
#         }
#         response = json.dumps(responseData)
#         return response,200,{"Content-Type":"application/json"}
#     except Exception as e:
#         print(e)
#         responseData = {
#             "code": 50000000,
#             "data": {},
#             "message": str(e)
#         }
#         response = json.dumps(responseData)
#         return response,500,{"Content-Type":"application/json"}

if __name__=="__main__":
    app.run(port=8000,host="0.0.0.0",debug=False)