#!/bin/bash
set -e

if [ ! -f .setup_done ]; then
    echo "Setup not completed. Running ./scripts/setup.sh first..."
    ./scripts/setup.sh
fi

echo "Starting Python WebSocket bridge..."
python bridge/bridge.py &
BRIDGE_PID=$!

sleep 2

echo "Starting Next.js website..."
cd website
npm run dev &
NEXT_PID=$!
cd ..

echo "=== GASTECT is running! ==="
echo "Dashboard: http://localhost:3000"
echo "WebSocket: ws://localhost:8765"

trap "kill $BRIDGE_PID $NEXT_PID 2>/dev/null" EXIT
wait
