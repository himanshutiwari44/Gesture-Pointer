const express = require('express');
const { spawn } = require('child_process');
const path = require('path');
const app = express();
const port = 3000;

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// API endpoint to take a screenshot
app.get('/api/screenshot', (req, res) => {
  const python = spawn('python', ['-c', `
import pyautogui
import time
import os

 #Create screenshots directory if it doesn't exist
if not os.path.exists('public/screenshots'):
    os.makedirs('public/screenshots')

#Take screenshot with timestamp
timestamp = time.strftime("%Y%m%d-%H%M%S")
filename = f"public/screenshots/screenshot_{timestamp}.png"
pyautogui.screenshot(filename)
print(filename)
  `]);
  
  let filename = '';
  
  python.stdout.on('data', (data) => {
    filename = data.toString().trim();
  });
  
  python.stderr.on('data', (data) => {
    console.error(`stderr: ${data}`);
    res.status(500).json({ error: data.toString() });
  });
  
  python.on('close', (code) => {
    if (code === 0) {
      res.json({ 
        success: true, 
        filename: path.basename(filename) 
      });
    } else {
      res.status(500).json({ success: false, error: `Process exited with code ${code}` });
    }
  });
});

// API endpoint to start the gesture control
app.get('/api/start-gesture-control', (req, res) => {
  // Launch the Python script as a separate process
  const pythonProcess = spawn('python', ['python/app.py']);
  
  pythonProcess.stdout.on('data', (data) => {
    console.log(`stdout: ${data}`);
  });
  
  pythonProcess.stderr.on('data', (data) => {
    console.error(`stderr: ${data}`);
  });
  
  pythonProcess.on('close', (code) => {
    console.log(`Python process exited with code ${code}`);
  });
  
  res.json({ success: true, message: 'Gesture control started' });
});

// API endpoint to check system status
app.get('/api/status', (req, res) => {
  res.json({ status: 'online' });
});

// Start the server
app.listen(port, () => {
  console.log(`Gesture Control Server running at http://localhost:${port}`);
});