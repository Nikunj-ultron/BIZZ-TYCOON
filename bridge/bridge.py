import asyncio
import json
import sqlite3
import os
import serial
import websockets
import yaml

# Load configuration
config_path = os.path.join(os.path.dirname(__file__), '../config/config.yaml')
with open(config_path, 'r') as f:
    config = yaml.safe_load(f)

PORT = config['serial']['port']
BAUD = config['serial']['baud_rate']
WS_PORT = config['websocket']['port']
DB_PATH = os.path.join(os.path.dirname(__file__), '../database/history.db')

connected_clients = set()

def save_reading(data):
    try:
        conn = sqlite3.connect(DB_PATH)
        c = conn.cursor()
        c.execute('''INSERT INTO readings (ppm, flame, ldr, motion, touch, battery, status)
                     VALUES (?, ?, ?, ?, ?, ?, ?)''',
                  (data.get('ppm', 0), data.get('flame', 0), data.get('ldr', 0),
                   1 if data.get('motion') else 0, 1 if data.get('touch') else 0,
                   data.get('battery', 100), data.get('status', 'SAFE')))
        conn.commit()
        conn.close()
    except Exception as e:
        print("Database error:", e)

async def handler(websocket, path):
    connected_clients.add(websocket)
    try:
        async for message in websocket:
            # Handle client commands if any
            pass
    except websockets.exceptions.ConnectionClosed:
        pass
    finally:
        connected_clients.remove(websocket)

async def broadcast_serial():
    while True:
        try:
            ser = serial.Serial(PORT, BAUD, timeout=1)
            print(f"Connected to serial port {PORT} at {BAUD} baud.")
            while True:
                line = ser.readline().decode('utf-8', errors='ignore').strip()
                if line:
                    try:
                        data = json.loads(line)
                        save_reading(data)
                        if connected_clients:
                            message = json.dumps(data)
                            await asyncio.gather(*[client.send(message) for client in connected_clients])
                    except json.JSONDecodeError:
                        pass
                await asyncio.sleep(0.05)
        except Exception as e:
            print(f"Serial connection error ({e}). Retrying in 2 seconds...")
            await asyncio.sleep(2)

async def main():
    server = await websockets.serve(handler, "localhost", WS_PORT)
    print(f"WebSocket server started at ws://localhost:{WS_PORT}")
    await broadcast_serial()

if __name__ == '__main__':
    asyncio.run(main())
