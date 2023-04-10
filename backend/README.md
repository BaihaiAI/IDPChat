#### Quickstart

1. Install requirements

   ```bash
   pip install -r requirements.txt
   ```

2. Startup

   ```bash
   python chat_server.py
   ```

   

#### API

1. /api/conversation/msg

   - method: POST

   - request body: 

   ```json 
   {
     "conversationId": "",
     "msgId": "",
     "parentMsgId": "",
     "text": ""
   }
   ```

   - response: 

   ```json
   {
     "code": 20000000,
     "data": {
       "conversationId": "",
       "msgId": "",
       "type": "image|text",
       "content": "data:image/jpeg;base64,xxxxxx"
     },
     "message": ""
   }
   ```

2. /api/conversation/feedback

   - method: POST
   - request body:

   ```json
   {
     "conversationId": "",
     "msgId": "",
     "feedback": "upvote|downvote"
   }
   ```

   - response:

   ```json
   {
     "code": 20000000,
     "data": {
       "conversationId": "",
       "msgId": "",
     },
     "message": ""
   }
   ```

3. /api/conversation/exit

   - method: POST
   - request body:

   ```json
   {
     "conversationId": ""
   }
   ```

   - response:

   ```json
   {
     "code": 20000000,
     "data": {
       "conversationId": ""
     },
     "message": ""
   }
   ```

   