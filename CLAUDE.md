# GASTECT Project Instructions for Claude

## Project Overview
GASTECT is an IoT gas leak detection and remote alert system built for the Bizz Tycoons Competition (December 15, 2026). It combines Arduino Uno hardware, MQ2 gas sensor, flame sensor, and HC-05 Bluetooth with a Python WebSocket bridge and a Next.js web dashboard.

## Key Directories & Files
- `arduino/GASTECT_Arduino.ino`: C++ firmware for Arduino Uno.
- `bridge/bridge.py`: Python serial-to-WebSocket bridge.
- `bridge/init_db.py`: SQLite database initializer.
- `config/config.yaml`: YAML configuration (COM port, thresholds, WS port).
- `scripts/setup.sh`: One-command environment setup.
- `scripts/start.sh`: One-command local launch.
- `website/`: Next.js frontend application.
- `docs/`: Technical specifications, architecture, hardware guide, and pitch notes.

## Development Workflow
1. **Setup:** `./scripts/setup.sh`
2. **Launch:** `./scripts/start.sh`
3. **Dashboard:** http://localhost:3000
