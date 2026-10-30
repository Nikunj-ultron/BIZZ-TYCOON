# GASTECT: 3-Minute Shark Tank / Competition Pitch Script

## 1. The Hook (0:00 - 0:30)
> *"Every year, over 3 lakh families face devastating tragedies from silent gas leaks and residential fires across India. Current detectors cost between ₹5,000 and ₹50,000 — far too expensive for average households. And when you are away from home? You have zero remote awareness."*

## 2. The Solution: GASTECT (0:30 - 1:30)
> *"Meet **GASTECT** — an ultra-affordable, dual-hazard IoT safety system built for just **₹1,200**. GASTECT combines an Arduino Uno microcontroller with professional-grade MQ2 gas sensors, IR flame detection, PIR motion awareness, and HC-05 Bluetooth telemetry. 
> 
> Unlike traditional standalone alarms that only beep in an empty house, GASTECT streams real-time telemetry over a Python WebSocket bridge straight to a lightning-fast Next.js web dashboard and logs every reading to a local SQLite database."*

## 3. Live Demo Walkthrough (1:30 - 2:30)
> *"Watch how simple it is:
> 1. With one command (`./scripts/start.sh`), our Python bridge connects to the Arduino Bluetooth module.
> 2. The Next.js dashboard instantly displays live MQ2 gas concentration in PPM, flame status, and battery levels.
> 3. When I introduce gas or smoke, the system shifts instantly from **SAFE** (Green) to **HAZARD** (Red), triggers the buzzer, and records the event in SQLite for historical analytics."*

## 4. Market Potential & Conclusion (2:30 - 3:00)
> *"Targeting residential homes, kitchens, hostels, and small businesses, GASTECT bridges the gap between industrial safety and household affordability. With zero-friction one-command setup, modular TypeScript components, and Vercel cloud deployment readiness, GASTECT is ready to save lives. Thank you!"*
