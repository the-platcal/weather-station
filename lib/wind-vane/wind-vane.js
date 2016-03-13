var child = require('child_process');
var python = child.spawn( 'python', ['/home/pi/weather-station/lib/wind-vane/wind-vane.py', '']);