FROM idp-chat-base:stable
COPY backend /opt/backend
EXPOSE 8000
ENTRYPOINT ["python", "/opt/backend/app/run.py"]