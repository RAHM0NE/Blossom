// Import necessary modules
const { SerialPort } = require('serialport'); // Correct import for SerialPort (destructure)
const { ReadlineParser } = require('@serialport/parser-readline'); // Correct import for ReadlineParser
const WebSocket = require('ws');

// Configure the serial port
const port = new SerialPort({
  path: 'COM3', // Replace with your actual COM port
  baudRate: 9600,
});

// Set up the parser to interpret data from the serial port
const parser = port.pipe(new ReadlineParser({ delimiter: '\n' }));

// WebSocket server
const wss = new WebSocket.Server({ port: 8080 });

// Handle WebSocket connections
wss.on('connection', (ws) => {
  console.log('WebSocket client connected');

  // Send serial data to WebSocket clients
  parser.on('data', (data) => {
    console.log('Sending BPM:', data.trim());
    ws.send(data.trim()); // Send BPM data to WebSocket client
  });

  // Handle WebSocket disconnections
  ws.on('close', () => {
    console.log('WebSocket client disconnected');
  });
});

console.log('WebSocket server running on ws://localhost:8080');
