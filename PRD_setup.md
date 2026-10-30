# GASTECT — Product Requirements Document (PRD)

> **Competition:** Bizz Tycoons — December 15, 2026  
> **Version:** 1.0.0  
> **Target Price:** ₹1,200 per unit  

---

## 1. Executive Summary
GASTECT is an affordable, IoT-enabled dual-hazard gas leak detection and fire monitoring system designed for Indian households. It integrates Arduino Uno hardware, MQ2 gas sensors, flame sensors, and HC-05 Bluetooth communication with a local Python WebSocket bridge and a real-time Next.js web dashboard.

## 2. Problem Statement
- **3L+ deaths annually** in India from gas-related fires and leaks.
- **₹5,000–₹50,000 cost** of existing commercial detectors — unaffordable for average families.
- **Zero remote visibility** — when away from home or sleeping, occupants have no warning until physical smell or neighbors alert them.
- **Power outages** disable standard AC-powered detectors during critical moments.

## 3. Solution & Value Proposition
- **Affordable Price:** ₹1,200 target manufacturing cost.
- **Dual-Hazard Detection:** MQ2 gas sensor (LPG, CNG, smoke) + Flame sensor (infrared fire radiation).
- **Three-Tier Alert System:** SAFE (Green), WARNING (Yellow — ventilate), DANGER (Red — evacuate + alert).
- **Remote Visibility:** Real-time web dashboard via Bluetooth + Python bridge.
- **Battery Backup:** Uninterrupted protection during power cuts.
- **Local Readout:** 7-segment LED display operates independently of smartphones.

## 4. System Architecture
1. **Hardware Layer:** Arduino Uno reads sensors (MQ2, Flame, PIR, LDR, Touch, Joystick) and transmits JSON data over Serial via HC-05 Bluetooth.
2. **Bridge Layer:** Python script reads serial port, parses JSON, logs to SQLite database, and broadcasts over WebSocket (`ws://localhost:8765`).
3. **Frontend Layer:** Next.js web dashboard connects to WebSocket, rendering real-time metrics, status colors, historical charts, and alert controls.

## 5. Functional Requirements
- **FR-1:** System must detect LPG/CNG concentration from 0 to 10,000 PPM.
- **FR-2:** System must detect fire infrared radiation via analog flame sensor.
- **FR-3:** System must categorize readings into SAFE (<200 PPM), WARNING (200–499 PPM), and DANGER (≥500 PPM).
- **FR-4:** System must broadcast sensor readings every 1 second over WebSocket.
- **FR-5:** Web dashboard must update in real-time without page reloads.
- **FR-6:** One-command setup (`./scripts/setup.sh`) must install all dependencies and configure the environment.
- **FR-7:** One-command launch (`./scripts/start.sh`) must start the bridge and website automatically.

## 6. Non-Functional Requirements
- **NFR-1:** Local-first operation with no mandatory cloud dependency.
- **NFR-2:** Low power consumption suitable for battery backup.
- **NFR-3:** Responsive UI supporting desktop and mobile browsers.
- **NFR-4:** Robust error handling and auto-reconnection for WebSocket and serial links.

## 7. Development Roadmap
- **Phase 1:** Hardware wiring & Arduino C++ firmware.
- **Phase 2:** Python bridge & SQLite database integration.
- **Phase 3:** Next.js website & WebSocket client.
- **Phase 4:** Automation scripts (`setup.sh`, `start.sh`) & documentation.
- **Phase 5:** Testing, polish, and Shark Tank pitch rehearsal.

---
*GASTECT Product Requirements Document*
