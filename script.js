document.addEventListener('DOMContentLoaded', () => {
    // Connect to WebSocket server
    const ws = new WebSocket('ws://localhost:8080');
    let currentGif = 'happy-cat.gif'; // Track the current GIF
  
    // Function to interpolate between two colours
    function interpolateColour(colour1, colour2, factor) {
      const result = colour1.slice();
      for (let i = 0; i < 3; i++) {
        result[i] = Math.round(result[i] + factor * (colour2[i] - colour1[i]));
      }
      return `rgb(${result.join(',')})`;
    }
  
    // Convert hex colour to RGB array
    function hexToRgb(hex) {
      const bigint = parseInt(hex.slice(1), 16);
      return [(bigint >> 16) & 255, (bigint >> 8) & 255, bigint & 255];
    }
  
    const colour1 = hexToRgb('#FFFFFF'); // White
    const colour2 = hexToRgb('#FFA500'); // Orange
    const colour3 = hexToRgb('#FF0000'); // Red
  
    // Update BPM on the webpage
    ws.onmessage = (event) => {
      console.log('Received data:', event.data); // Debugging line
      const bpm = parseInt(event.data, 10);
      console.log('Parsed BPM:', bpm); // Debugging line
  
      if (!isNaN(bpm)) {
        document.querySelector('.bpm').textContent = bpm;
  
        // Calculate the colour based on BPM
        let colour;
        if (bpm <= 90) {
          const factor = (bpm - 60) / (80 - 60);
          colour = interpolateColour(colour1, colour2, factor);
        } else {
          const factor = (bpm - 80) / (100 - 80);
          colour = interpolateColour(colour2, colour3, factor);
        }
        document.querySelector('.bpm').style.color = colour;
  
        // Change the GIF based on BPM value
        const catGif = document.getElementById('cat-gif');
        if (bpm > 75 && currentGif !== 'sad-cat.gif') {
          catGif.src = 'sad-cat.gif';
          catGif.alt = 'Sad Cat';
          currentGif = 'sad-cat.gif';
        } else if (bpm <= 70 && currentGif !== 'happy-cat.gif') {
          catGif.src = 'happy-cat.gif';
          catGif.alt = 'Happy Cat';
          currentGif = 'happy-cat.gif';
        }
      } else {
        console.error('Invalid BPM value:', event.data); // Debugging line
      }
    };
  
    ws.onopen = () => {
      console.log('WebSocket connected');
    };
  
    ws.onclose = () => {
      console.log('WebSocket disconnected');
    };
  
    // Example: Update the position of the .bpm text
    document.documentElement.style.setProperty('--bpm-top', '935px');
    document.documentElement.style.setProperty('--bpm-left', '130px');

    document.documentElement.style.setProperty('--level-top', '890px');
    document.documentElement.style.setProperty('--level-right', '60px');
  });