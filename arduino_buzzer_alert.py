import requests
import serial
import time
import json
import os
from datetime import datetime

# Configuration
API_URL = "https://wildwardenserver.onrender.com/api/buzzer-status"
CHECK_INTERVAL = 5  # Time in seconds between API checks
ARDUINO_PORT = "COM4"  # Change to your Arduino port (COM3 is common on Windows)
BAUD_RATE = 9600

# Configure logging
log_file = "buzzer_alert.log"

def log_message(message):
    """Log a message with timestamp to the console and log file"""
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    log_entry = f"[{timestamp}] {message}"
    print(log_entry)
    
    with open(log_file, "a") as f:
        f.write(log_entry + "\n")

def setup_arduino():
    """Try to establish connection with the Arduino"""
    log_message("Attempting to connect to Arduino...")
    try:
        arduino = serial.Serial(ARDUINO_PORT, BAUD_RATE, timeout=1)
        log_message(f"Successfully connected to Arduino on {ARDUINO_PORT}")
        time.sleep(2)  # Wait for Arduino to reset after serial connection
        return arduino
    except serial.SerialException as e:
        log_message(f"Error connecting to Arduino: {str(e)}")
        log_message("Please check if the Arduino is connected and the port is correct.")
        return None

def check_buzzer_status():
    """Check the API for pending alerts"""
    try:
        response = requests.get(API_URL)
        response.raise_for_status()  # Raise exception for HTTP errors
        return response.json()
    except requests.exceptions.RequestException as e:
        log_message(f"Error connecting to API: {str(e)}")
        return None

def control_buzzer(arduino, buzzer_active, pending_cases_count=0):
    """Send command to Arduino to control the buzzer"""
    if not arduino:
        return False
    
    try:
        if buzzer_active:
            log_message(f"ALERT: {pending_cases_count} pending case(s) detected! Activating buzzer...")
            arduino.write(b'1')  # '1' to turn ON
        else:
            arduino.write(b'0')  # '0' to turn OFF
        
        return True
    except serial.SerialException as e:
        log_message(f"Error communicating with Arduino: {str(e)}")
        return False

def main():
    """Main function to run the buzzer alert system"""
    log_message("==== Wild Warden Arduino Buzzer Alert System ====")
    log_message("Starting up...")
    
    # Initialize variables
    arduino = setup_arduino()
    if not arduino:
        log_message("Continuing without Arduino connection. Will retry connecting...")
    
    buzzer_was_active = False
    connection_failures = 0
    
    # Main loop
    try:
        while True:
            # Try to reconnect to Arduino if not connected
            if not arduino:
                arduino = setup_arduino()
            
            # Check API for buzzer status
            status = check_buzzer_status()
            
            if status:
                buzzer_active = status.get('buzzerActive', False)
                pending_cases_count = status.get('pendingCasesCount', 0)
                cases = status.get('cases', [])
                
                # Only log when status changes or new cases
                if buzzer_active != buzzer_was_active:
                    if buzzer_active:
                        log_message(f"ALERT: {pending_cases_count} pending case(s) detected!")
                        # Log the details of each case
                        for i, case in enumerate(cases):
                            device_id = case.get('deviceId', 'Unknown')
                            timestamp = case.get('timestamp', 'Unknown time')
                            log_message(f"  Case {i+1}: Device {device_id} at {timestamp}")
                    else:
                        log_message("All clear. No pending cases.")
                
                # Control the buzzer
                control_buzzer(arduino, buzzer_active, pending_cases_count)
                buzzer_was_active = buzzer_active
                connection_failures = 0
            else:
                connection_failures += 1
                if connection_failures > 5:
                    log_message("Multiple connection failures. Will continue trying...")
                    connection_failures = 0
            
            # Wait before next check
            time.sleep(CHECK_INTERVAL)
            
    except KeyboardInterrupt:
        log_message("Program stopped by user.")
    finally:
        # Clean up
        if arduino:
            control_buzzer(arduino, False)  # Turn off buzzer
            arduino.close()
            log_message("Arduino connection closed.")
        log_message("Program terminated.")

if __name__ == "__main__":
    main() 