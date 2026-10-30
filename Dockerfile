FROM python:3.10-slim AS bridge-base

WORKDIR /app
COPY bridge/requirements.txt bridge/
RUN pip install --no-cache-dir -r bridge/requirements.txt

COPY bridge/ bridge/
COPY config/ config/

EXPOSE 8765
CMD ["python", "bridge/bridge.py"]
