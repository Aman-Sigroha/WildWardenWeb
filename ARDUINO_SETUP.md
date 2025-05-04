# Wild Warden Arduino Buzzer Integration

This document explains how to set up the Arduino-based buzzer alert system that integrates with the Wild Warden rescue platform.

## Hardware Requirements

1. Arduino Uno (or compatible board)
2. Piezo buzzer
3. Jumper wires
4. USB cable (to connect Arduino to computer)
5. Computer with Python installed

## Hardware Setup

1. Connect the buzzer to the Arduino:
   - Connect the positive (longer) pin of the buzzer to digital pin 9 on the Arduino
   - Connect the negative (shorter) pin of the buzzer to GND on the Arduino

   ![Buzzer Connection Diagram](https://i.imgur.com/6uRVJsc.png)

2. Connect the Arduino to your computer using the USB cable

## Software Setup

### Arduino Setup

1. Install the Arduino IDE from [arduino.cc](https://www.arduino.cc/en/software) if you don't have it already
2. Open the Arduino IDE
3. Open the `arduino_buzzer_controller.ino` sketch file located in the `arduino_buzzer_controller` folder
4. Select your Arduino board type under Tools > Board
5. Select the correct COM port under Tools > Port
6. Click the Upload button (right arrow icon) to upload the sketch to your Arduino
7. Verify that the upload was successful - you should see a brief flash of the onboard LED and a short beep from the buzzer

### Python Setup

1. Make sure you have Python 3.6 or newer installed
2. Install the required Python packages:
   ```
   pip install pyserial requests
   ```
3. Update the COM port in the Python script if needed:
   - Open `arduino_buzzer_alert.py` in a text editor
   - Find the line `ARDUINO_PORT = "COM3"` and change "COM3" to match your Arduino's COM port
   - On Windows, you can find the COM port in the Arduino IDE or Device Manager
   - On macOS/Linux, it's usually something like "/dev/ttyACM0" or "/dev/ttyUSB0"

## Running the System

1. Make sure the Arduino is connected to your computer and the buzzer is properly connected
2. Open a command prompt or terminal
3. Navigate to the directory containing `arduino_buzzer_alert.py`
4. Run the script:
   ```
   python arduino_buzzer_alert.py
   ```
5. The script will:
   - Connect to the Arduino
   - Start monitoring the Wild Warden server for pending alerts
   - Activate the buzzer when a new distress signal is detected
   - Log all activities to the console and to `buzzer_alert.log`

6. To stop the script, press Ctrl+C in the terminal

## Troubleshooting

### Arduino Not Detected
- Verify that the Arduino is properly connected to the computer
- Check that the correct COM port is selected in the Python script
- Try a different USB port or cable

### Buzzer Not Working
- Check the buzzer connections to the Arduino
- Make sure the buzzer is connected to pin 9 and GND
- Try testing the buzzer with a simple test sketch to verify it's functional

### API Connection Issues
- Check your internet connection
- Verify that the Wild Warden server is running and accessible
- The script will automatically retry connections, but you may need to check your network settings

## Customization

You can customize various aspects of the system:

- `CHECK_INTERVAL` in the Python script controls how often the system checks for new alerts (default: 5 seconds)
- For a different buzzer pattern, modify the Arduino sketch's `loop()` function
- To use a different pin for the buzzer, change `BUZZER_PIN` in the Arduino sketch

## Logs

All system activities are logged to:
- The console (real-time)
- `buzzer_alert.log` file (persistent)

The logs include timestamps, connection status, and alert details. 