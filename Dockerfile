FROM idp-chat-base:stable
COPY backend /opt/backend
EXPOSE 8000
WORKDIR /opt/backend/app
ENTRYPOINT ["python", "/opt/backend/app/run.py"]