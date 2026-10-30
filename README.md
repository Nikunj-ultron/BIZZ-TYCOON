# GASTECT: IoT Gas Leak & Fire Detection System

> Built for **Bizz Tycoons Competition (December 15, 2026)**.  
> Affordable, dual-hazard (gas + fire) IoT safety system with real-time web dashboard, SQLite history logging, and remote alerts.

---

## 🚀 Quick Start (One Command)

Clone the repository and run the setup script:

```bash
git clone https://github.com/nikunj-alt/BIZZ-TYCOON.git GASTECT_Project
cd GASTECT_Project
./scripts/setup.sh
```

To start the local system (Python WebSocket bridge + Next.js web dashboard):

```bash
./scripts/start.sh
```

Open your browser at **http://localhost:3000**.

---

## 📂 Project Structure

```
GASTECT_Project/
├── .gitignore
├── LICENSE
├── PRD_setup.md
├── README.md
├── vercel.json
├── Dockerfile
├── arduino/
│   └── GASTECT_Arduino.ino          # C++ Arduino firmware
├── bridge/
│   ├── bridge.py                    # Python serial-to-WebSocket bridge
│   ├── init_db.py                   # SQLite history DB initializer
│   └── requirements.txt             # Python dependencies
├── config/
│   ├── config.yaml                  # YAML configuration
│   └── bridge.ini                   # INI configuration alternative
├── database/
│   └── history.db                   # SQLite historical logs
├── scripts/
│   ├── setup.sh                     # Environment setup
│   ├── start.sh                     # Local launch script
│   └── start-vercel-mode.sh         # Tunnel + Vercel launcher
├── website/
│   ├── pages/
│   │   ├── index.js                 # Main dashboard
│   │   └── about.js                 # Project info & team
│   ├── components/
│   │   ├── Display.tsx              # Sensor readout tile
│   │   ├── StatusIndicator.tsx      # SAFE / WARNING / HAZARD banner
│   │   ├── SevenSegment.tsx         # SVG 7-segment PPM readout
│   │   ├── HistoryGraph.tsx         # Historical trend chart
│   │   └── Controls.tsx             # Valve / buzzer controls
│   ├── styles/
│   │   globals.css
│   ├── package.json
│   └── tsconfig.json
└── docs/
    ├── test_protocols.md            # Demo test scenarios
    └── pitch_notes.md               # 3-minute Shark Tank pitch script
```

---

## 🛠️ Hardware Stack (Target BOM: ₹1200)

| Component | Function | Pin / Interface |
|-----------|----------|-----------------|
| **Arduino Uno** | Microcontroller | USB / Serial |
| **MQ2 Sensor** | LPG/Smoke/Methane PPM | Analog A0 |
| **Flame Sensor** | IR Fire detection | Analog A1 |
| **HC-05** | Bluetooth HC-05 module | Serial TX/RX (9600 baud) |
| **PIR Sensor** | Motion detection | Digital Pin |
| **LDR** | Day/Night ambient light | Analog Pin |
| **Touch Sensor** | Alarm silence button | Digital Pin |
| **7-Segment Display** | Local PPM readout | Pins 8-13 |
| **Buzzer / LEDs** | Audible/visual alerts | PWM / Digital |

---

## 🌐 Vercel & Remote Mode

For deploying the frontend on Vercel while keeping the physical Bluetooth/serial bridge running locally on your computer:
1. Run `./scripts/start-vercel-mode.sh` to start the bridge and public tunnel (ngrok/Cloudflare).
2. Set `NEXT_PUBLIC_WS_URL` in Vercel to your public tunnel WebSocket URL.

---

## 👥 Team Bizz Tycoons
- **Competition Date:** December 15, 2026
- **Repository:** https://github.com/nikunj-alt/BIZZ-TYCOON.git
