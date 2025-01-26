const { SerialPort } = require('serialport'); 
const { ReadlineParser } = require('@serialport/parser-readline'); 
const WebSocket = require('ws');

// configure the serial port
const port = new SerialPort({
  path: 'COM3', // Replace with your actual COM port
  baudRate: 9600,
});

// set up the parser to interpret data from the serial port
const parser = port.pipe(new ReadlineParser({ delimiter: '\n' }));

// WebSocket server
const wss = new WebSocket.Server({ port: 8080 });

// handle WebSocket connections
wss.on('connection', (ws) => {
  console.log('WebSocket client connected');

  // send serial data to WebSocket clients
  parser.on('data', (data) => {
    console.log('Sending BPM:', data.trim());
    ws.send(data.trim()); // send BPM data to WebSocket client
  });

  // handle WebSocket disconnections
  ws.on('close', () => {
    console.log('WebSocket client disconnected');
  });
});

console.log('WebSocket server running on ws://localhost:8080');
