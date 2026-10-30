"""Python WebSocket bridge and serial reader for GASTECT IoT system."""
import asyncio
import json
import os
import sqlite3
import serial
import serial.tools.list_ports
import websockets
import yaml

from init_db import init_db


def detect_serial_port():
    """Detect available Arduino COM ports automatically."""
    try:
        ports = [port.device for port in serial.tools.list_ports.comports()]
    except (serial.SerialException, OSError):
        ports = []

    preferred = [
        'COM3', 'COM4', 'COM5',
        '/dev/ttyUSB0', '/dev/ttyUSB1', '/dev/ttyACM0', '/dev/ttyACM1',
        '/dev/serial0', '/dev/serial1'
    ]

    for port in preferred:
        if port in ports:
            return port

    return ports[0] if ports else None


def load_config():
    """Load and validate configuration from config.yaml."""
    config_path = os.path.join(os.path.dirname(__file__), '../config/config.yaml')
    try:
        with open(config_path, 'r', encoding='utf-8') as f:
            raw_config = yaml.safe_load(f) or {}
    except FileNotFoundError as exc:
        raise RuntimeError(f"Configuration file not found: {config_path}") from exc

    if not isinstance(raw_config, dict):
        raise RuntimeError("Configuration file is empty or invalid.")

    serial_cfg = raw_config.get('serial', {})
    ws_cfg = raw_config.get('websocket', {})
    selected_port = serial_cfg.get('port') or detect_serial_port()

    if not selected_port:
        raise RuntimeError(
            'No serial port configured and no Arduino device was detected. '
            'Set config/config.yaml serial.port to your COM/tty device.'
        )

    return {
        'port': selected_port,
        'baud_rate': int(serial_cfg.get('baud_rate', 9600)),
        'ws_port': int(ws_cfg.get('port', 8765)),
    }


config = load_config()
PORT = config['port']
BAUD = config['baud_rate']
WS_PORT = config['ws_port']
DB_PATH = os.path.join(os.path.dirname(__file__), '../database/history.db')

connected_clients = set()


def save_reading(data):
    """Save sensor telemetry reading to SQLite history database."""
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute(
            '''INSERT INTO readings (ppm, flame, ldr, motion, touch, battery, status)
                         VALUES (?, ?, ?, ?, ?, ?, ?)''',
            (
                data.get('ppm', 0),
                data.get('flame', 0),
                data.get('ldr', 0),
                1 if data.get('motion') else 0,
                1 if data.get('touch') else 0,
                data.get('battery', 100),
                data.get('status', 'SAFE'),
            ),
        )
        conn.commit()
        conn.close()
    except sqlite3.Error as err:
        print("Database error:", err)


async def handler(websocket):
    """Handle incoming WebSocket client connections."""
    connected_clients.add(websocket)
    try:
        async for _message in websocket:
            # Handle client commands if any
            pass
    except websockets.exceptions.ConnectionClosed:
        pass
    finally:
        connected_clients.remove(websocket)


async def broadcast_serial():
    """Read serial data from Arduino and broadcast to WebSocket clients."""
    while True:
        try:
            with serial.Serial(PORT, BAUD, timeout=1) as ser:
                print(f"Connected to serial port {PORT} at {BAUD} baud.")
                while True:
                    line = ser.readline().decode('utf-8', errors='ignore').strip()
                    if line:
                        try:
                            data = json.loads(line)
                            save_reading(data)
                            if connected_clients:
                                payload = json.dumps(data)
                                await asyncio.gather(
                                    *[client.send(payload) for client in connected_clients]
                                )
                        except json.JSONDecodeError:
                            pass
                    await asyncio.sleep(0.05)
        except (serial.SerialException, OSError) as err:
            print(f"Serial connection error ({err}). Retrying in 2 seconds...")
            await asyncio.sleep(2)


async def main():
    """Start WebSocket server and serial broadcast loop."""
    init_db()
    async with websockets.serve(handler, "localhost", WS_PORT):
        print(f"WebSocket server started at ws://localhost:{WS_PORT}")
        await broadcast_serial()


if __name__ == '__main__':
    asyncio.run(main())
