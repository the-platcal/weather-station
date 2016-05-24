#!/bin/bash


forever start /home/pi/weather-station/lib/camera.js
forever start /home/pi/weather-station/weather-station.js


touch /ram/wind-vane.json
nohup python /home/pi/weather-station/lib/wind-vane/wind-vane.py &

touch /ram/anemometer.json
sudo node /home/pi/weather-station/lib/anemometer/anemometer.js &

touch /ram/am2302.json
nohup sudo python /home/pi/weather-station/lib/Adafruit_Python_DHT/examples/AdafruitDHT1.py 2302 4 &
