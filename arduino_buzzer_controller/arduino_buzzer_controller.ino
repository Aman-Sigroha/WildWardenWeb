/*
 * Wild Warden - Arduino Buzzer Controller
 * 
 * This sketch receives commands from the Python script via serial
 * and controls a buzzer accordingly.
 * 
 * Connection:
 * - Buzzer positive pin to Arduino digital pin 9
 * - Buzzer negative pin to Arduino GND
 */

// Pin definitions
const int BUZZER_PIN = 9;
const int LED_PIN = 13;  // Onboard LED for visual feedback

// Variables
char command;
bool alarmActive = false;
unsigned long lastPatternChange = 0;
int patternState = LOW;

void setup() {
  // Initialize serial communication
  Serial.begin(9600);
  
  // Initialize pins
  pinMode(BUZZER_PIN, OUTPUT);
  pinMode(LED_PIN, OUTPUT);
  
  // Set initial states
  digitalWrite(BUZZER_PIN, LOW);
  digitalWrite(LED_PIN, LOW);
  
  // Quick startup test - short beep
  digitalWrite(BUZZER_PIN, HIGH);
  digitalWrite(LED_PIN, HIGH);
  delay(200);
  digitalWrite(BUZZER_PIN, LOW);
  digitalWrite(LED_PIN, LOW);
  
  // Ready message
  Serial.println("Wild Warden Buzzer Controller Ready");
}

void loop() {
  // Check if serial data is available
  if (Serial.available() > 0) {
    // Read the incoming command
    command = Serial.read();
    
    // Process command
    if (command == '1') {
      // Activate alarm
      alarmActive = true;
      Serial.println("Alarm activated");
    } 
    else if (command == '0') {
      // Deactivate alarm
      alarmActive = false;
      digitalWrite(BUZZER_PIN, LOW);
      digitalWrite(LED_PIN, LOW);
      Serial.println("Alarm deactivated");
    }
  }
  
  // Handle active alarm with pattern
  if (alarmActive) {
    unsigned long currentMillis = millis();
    
    // Pattern timing - alternates every 500ms
    if (currentMillis - lastPatternChange >= 500) {
      lastPatternChange = currentMillis;
      
      // Toggle state
      patternState = (patternState == LOW) ? HIGH : LOW;
      
      // Update buzzer and LED
      digitalWrite(BUZZER_PIN, patternState);
      digitalWrite(LED_PIN, patternState);
    }
  }
} 