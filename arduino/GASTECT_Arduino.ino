/*
  GASTECT — Arduino Uno Firmware
  Dual-Hazard Gas & Flame Detection System
  Bizz Tycoons Competition
*/

const int pinMQ2 = A0;
const int pinFlame = A1;
const int pinLDR = A2;
const int pinPIR = 2;
const int pinTouch = 3;
const int pinJoystickX = A3;
const int pinJoystickY = A4;
const int pinJoystickSW = 4;
const int pinLED_Green = 5;
const int pinLED_Yellow = 6;
const int pinLED_Red = 7;
const int pinBuzzer = 8;
const int pinServo = 9;
const int pinBattery = A5;

void setup() {
  Serial.begin(9600);
  pinMode(pinPIR, INPUT);
  pinMode(pinTouch, INPUT_PULLUP);
  pinMode(pinJoystickSW, INPUT_PULLUP);
  pinMode(pinLED_Green, OUTPUT);
  pinMode(pinLED_Yellow, OUTPUT);
  pinMode(pinLED_Red, OUTPUT);
  pinMode(pinBuzzer, OUTPUT);
}

void loop() {
  int ppm = analogRead(pinMQ2);
  int flame = analogRead(pinFlame);
  int ldr = analogRead(pinLDR);
  bool motion = digitalRead(pinPIR);
  bool touch = digitalRead(pinTouch);
  int battery = map(analogRead(pinBattery), 0, 1023, 0, 100);

  String status = "SAFE";
  if (ppm >= 500 || flame >= 400) {
    status = "DANGER";
    digitalWrite(pinLED_Red, HIGH);
    digitalWrite(pinLED_Yellow, LOW);
    digitalWrite(pinLED_Green, LOW);
    digitalWrite(pinBuzzer, HIGH);
  } else if (ppm >= 200 || flame >= 200) {
    status = "WARNING";
    digitalWrite(pinLED_Red, LOW);
    digitalWrite(pinLED_Yellow, HIGH);
    digitalWrite(pinLED_Green, LOW);
    digitalWrite(pinBuzzer, LOW);
  } else {
    status = "SAFE";
    digitalWrite(pinLED_Red, LOW);
    digitalWrite(pinLED_Yellow, LOW);
    digitalWrite(pinLED_Green, HIGH);
    digitalWrite(pinBuzzer, LOW);
  }

  // Print JSON line over Serial (HC-05 Bluetooth)
  Serial.print("{");
  Serial.print("\"ppm\":"); Serial.print(ppm);
  Serial.print(",\"flame\":"); Serial.print(flame);
  Serial.print(",\"ldr\":"); Serial.print(ldr);
  Serial.print(",\"motion\":"); Serial.print(motion ? "true" : "false");
  Serial.print(",\"touch\":"); Serial.print(touch ? "false" : "true");
  Serial.print(",\"battery\":"); Serial.print(battery);
  Serial.print(",\"status\":\""); Serial.print(status); Serial.print("\"");
  Serial.println("}");

  delay(1000);
}
