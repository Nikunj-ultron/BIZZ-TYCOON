# GASTECT — WebSocket API Specification

> **Version:** 1.0  
> **Date:** October 28, 2026  
> **Endpoint:** `ws://localhost:8765`  
> **Protocol:** WebSocket (RFC 6455)

---

## 📋 Overview

The GASTECT Python bridge exposes a WebSocket server that broadcasts real-time sensor data from the Arduino via HC-05 Bluetooth. The Next.js website connects to this endpoint to display live readings and status.

## 🔌 Connection Details

| Property | Value |
|----------|-------|
| **URL** | `ws://localhost:8765` |
| **Protocol** | WebSocket |
| **Message Format** | JSON (text frames) |
| **Update Frequency** | Every 1,000ms (1 Hz) |
| **Max Concurrent Clients** | Unlimited (tested up to 10) |
| **Authentication** | None (local-only deployment) |
| **Encryption** | None (ws:// not wss:// — local network only) |

---

## 📥 Server → Client Messages

The bridge broadcasts the following JSON object to all connected clients every second:

### Message Schema

```json
{
  "ppm": 42,
  "flame": 85,
  "ldr": 650,
  "motion": false,
  "touch": false,
  "battery": 95,
  "status": "SAFE",
  "armed": true,
  "silenced": false,
  "timestamp": "2026-10-28T14:30:00Z"
}
```

### Field Descriptions

| Field | Type | Range | Description |
|-------|------|-------|-------------|
| `ppm` | integer | 0–10,000 | Gas concentration in parts per million |
| `flame` | integer | 0–1023 | Flame sensor analog reading (fire intensity) |
| `ldr` | integer | 0–1023 | Ambient light level (lower = darker) |
| `motion` | boolean | true/false | PIR motion detection state |
| `touch` | boolean | true/false | Touch sensor pressed state |
| `battery` | integer | 0–100 | Battery level percentage |
| `status` | string | `"SAFE"` \| `"WARNING"` \| `"DANGER"` | Overall system status |
| `armed` | boolean | true/false | Whether system is armed (joystick toggle) |
| `silenced` | boolean | true/false | Whether alarm has been manually silenced |
| `timestamp` | string | ISO 8601 | Server timestamp of reading |

### Status Thresholds

| Status | PPM Range | Flame Range | Color | Action |
|--------|-----------|-------------|-------|--------|
| SAFE | < 200 | < 200 | 🟢 Green | Normal monitoring |
| WARNING | 200–499 | 200–399 | 🟡 Yellow | Ventilate area |
| DANGER | ≥ 500 | ≥ 400 | 🔴 Red | Evacuate + alert |

---

## 📤 Client → Server Messages (Optional)

The website can send commands back to the Arduino via the bridge:

### Silence Alarm

```json
{
  "command": "silence"
}
```

### Toggle System Arm/Disarm

```json
{
  "command": "toggle_armed"
}
```

### Adjust Sensitivity

```json
{
  "command": "set_threshold",
  "sensor": "gas",
  "level": "warning",
  "value": 400
}
```

### Command Response

The bridge echoes back confirmation:

```json
{
  "ack": true,
  "command": "silence",
  "timestamp": "2026-10-28T14:30:05Z"
}
```

---

## 🔄 Connection Lifecycle

### 1. Connection Establishment

```javascript
const ws = new WebSocket('ws://localhost:8765');

ws.onopen = () => {
  console.log('Connected to GASTECT bridge');
};

ws.onclose = () => {
  console.log('Disconnected. Retrying...');
  // Auto-reconnect logic
};

ws.onerror = (error) => {
  console.error('WebSocket error:', error);
};
```

### 2. Receiving Data

```javascript
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  
  // Update UI
  updatePpmDisplay(data.ppm);
  updateStatus(data.status);
  updateFlameReading(data.flame);
  updateBattery(data.battery);
  
  // Trigger alert if danger
  if (data.status === 'DANGER') {
    triggerDangerAlert();
  }
};
```

### 3. Sending Commands

```javascript
ws.send(JSON.stringify({
  command: 'silence'
}));
```

---

## ⚠️ Error Handling

### Connection Errors

| Error Code | Meaning | Action |
|------------|---------|--------|
| 1006 | Abnormal closure | Bridge may be down; check `python bridge/bridge.py` |
| 1011 | Internal error | Restart bridge script |
| ECONNREFUSED | Port not listening | Start Python bridge before opening website |

### Reconnection Strategy

```javascript
let reconnectAttempts = 0;
const maxReconnectAttempts = 10;

function connect() {
  const ws = new WebSocket('ws://localhost:8765');
  
  ws.onclose = () => {
    if (reconnectAttempts < maxReconnectAttempts) {
      reconnectAttempts++;
      setTimeout(connect, 2000 * reconnectAttempts);
    }
  };
}
```

---

## 📊 Example Data Stream

```
← Client connects
→ {"ppm":42,"flame":85,"ldr":650,"motion":false,"touch":false,"battery":95,"status":"SAFE","armed":true,"silenced":false,"timestamp":"2026-10-28T14:30:00Z"}
→ {"ppm":45,"flame":82,"ldr":648,"motion":false,"touch":false,"battery":95,"status":"SAFE","armed":true,"silenced":false,"timestamp":"2026-10-28T14:30:01Z"}
→ {"ppm":320,"flame":90,"ldr":645,"motion":true,"touch":false,"battery":94,"status":"WARNING","armed":true,"silenced":false,"timestamp":"2026-10-28T14:30:02Z"}
→ {"ppm":850,"flame":150,"ldr":640,"motion":true,"touch":false,"battery":94,"status":"DANGER","armed":true,"silenced":false,"timestamp":"2026-10-28T14:30:03Z"}
← Client: {"command":"silence"}
→ {"ack":true,"command":"silence","timestamp":"2026-10-28T14:30:04Z"}
→ {"ppm":840,"flame":145,"ldr":640,"motion":true,"touch":true,"battery":94,"status":"DANGER","armed":true,"silenced":true,"timestamp":"2026-10-28T14:30:05Z"}
```

---

## 🛡️ Security Notes

- **Local-only:** WebSocket binds to `127.0.0.1:8765`, not accessible from external networks
- **No authentication:** Intended for trusted local environment (competition demo)
- **No encryption:** ws:// protocol sufficient for localhost communication
- **No data persistence in transit:** Messages are ephemeral; history stored in local SQL database only

---

## 🧪 Testing the API

### Using Python WebSocket Client

```python
import asyncio
import websockets

async def test():
    async with websockets.connect("ws://localhost:8765") as ws:
        for _ in range(5):
            message = await ws.recv()
            print(message)
            await asyncio.sleep(1)

asyncio.run(test())
```

### Using JavaScript Browser Console

```javascript
const ws = new WebSocket('ws://localhost:8765');
ws.onmessage = (e) => console.log(JSON.parse(e.data));
```

---

## 🔄 Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | Oct 28, 2026 | Initial API specification |

---

*API Specification maintained by GASTECT Development Team*