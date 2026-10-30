# GASTECT Test Protocols & Scenarios

## Test 1: Normal Operation (SAFE)
- **Setup:** Clean air environment, no gas, no flame, room well-lit (LDR high).
- **Expected Output:**
  - MQ2 PPM < 200
  - Flame sensor > 400
  - Status banner: **SAFE (Green)**
  - 7-Segment display shows current PPM (e.g. `0042`)

## Test 2: Gas Leak Simulation (WARNING / HAZARD)
- **Setup:** Introduce lighter gas or smoke near MQ2 sensor.
- **Expected Output:**
  - MQ2 PPM rises above 200 (Warning) or 500 (Hazard)
  - Status banner turns **YELLOW (WARNING)** or **RED (HAZARD)**
  - Buzzer triggers audible tone
  - WebSocket broadcasts JSON telemetry instantly to web dashboard

## Test 3: Flame Detection (FIRE EMERGENCY)
- **Setup:** Light match or lighter within 20cm of IR flame sensor.
- **Expected Output:**
  - Flame analog reading drops below threshold
  - Status changes immediately to **FIRE HAZARD**
  - Red LED flashing and emergency buzzer active

## Test 4: Touch Sensor Alarm Silence
- **Setup:** Trigger hazard state, then press physical touch sensor on Arduino.
- **Expected Output:**
  - Buzzer mutes / silences
  - Web dashboard reflects touch sensor state (`Touched / Silenced`)

## Test 5: Historical Logging Persistence
- **Setup:** Run system for 5 minutes with various sensor inputs.
- **Expected Output:**
  - Check `database/history.db` SQLite table `readings`.
  - Verify records are correctly stored with timestamps, PPM, flame, and status.
