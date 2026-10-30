#!/bin/bash
echo "Starting GASTECT in Vercel Hybrid Tunnel Mode..."

# 1. Start Python bridge in background
python bridge/bridge.py &
BRIDGE_PID=$!

# 2. Start ngrok tunnel on port 8765
if command -v ngrok &> /dev/null; then
    echo "Starting ngrok tunnel for WebSocket..."
    ngrok http 8765 &
    NGROK_PID=$!
else
    echo "ngrok not found. Please install ngrok or configure Cloudflare tunnel for remote Vercel access."
fi

# 3. Start Next.js development server
cd website
npm run dev

# Cleanup on exit
trap "kill $BRIDGE_PID $NGROK_PID" EXIT
