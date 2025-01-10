document.addEventListener('DOMContentLoaded', () => {
  // Connect to WebSocket server
  const ws = new WebSocket('ws://localhost:8080');
  let currentGif = 'light-fairy.gif'; // Track the current GIF
  const audio = document.getElementById('high-bpm-audio'); // Get the audio element
  const video = document.getElementById('bpm-video'); // Get the video element
  audio.volume = 0.5; // Set the volume to 50%
  let videoPlaying = false; // Flag to track if the video is playing
  let lastVideoPlayTime = 0; // Timestamp of the last time the video was played
  const cooldownTime = 1000 * 60 * 1; // 1 minute in milliseconds

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

  // Enable media playback on user interaction
  function enableMediaPlayback() {
    audio.play().then(() => {
      audio.pause();
      audio.currentTime = 0;
    }).catch(error => {
      console.error('Audio playback failed:', error);
    });

    video.play().then(() => {
      video.pause();
      video.currentTime = 0;
    }).catch(error => {
      console.error('Video playback failed:', error);
    });

    document.removeEventListener('click', enableMediaPlayback);
  }

  document.addEventListener('click', enableMediaPlayback);

  // Update BPM on the webpage
  ws.onmessage = (event) => {
    console.log('Received data:', event.data); // Debugging line
    const bpm = parseInt(event.data, 10);
    console.log('Parsed BPM:', bpm); // Debugging line

    if (!isNaN(bpm)) {
      document.querySelector('.bpm').innerHTML = `${bpm} <span class="bpm-text">BPM</span>`;

      // Calculate the colour based on BPM
      let colour;
      if (bpm <= 80) {
        const factor = (bpm - 60) / (80 - 60);
        colour = interpolateColour(colour1, colour2, factor);
      } else {
        const factor = (bpm - 80) / (100 - 80);
        colour = interpolateColour(colour2, colour3, factor);
      }
      document.querySelector('.bpm').style.color = colour;

      // Change the GIF based on BPM value
      const catGif = document.getElementById('fairy-gif');
      if (bpm > 79 && currentGif !== 'dark fairy.gif') {
        catGif.src = 'dark fairy.gif';
        catGif.alt = 'Dark Fairy';
        currentGif = 'dark fairy.gif';
      } else if (bpm <= 79 && currentGif !== 'light fairy.gif') {
        catGif.src = 'light fairy.gif';
        catGif.alt = 'Light Fairy';
        currentGif = 'light fairy.gif';
      }

      // Play or stop the audio based on BPM value
      if (bpm > 90) {
        if (audio.paused) {
          audio.play();
        }
      } else {
        if (!audio.paused) {
          audio.pause();
          audio.currentTime = 0; // Reset the audio to the beginning
        }
      }

      // Play the video based on BPM value and cooldown
      const currentTime = Date.now();
      console.log(`Current Time: ${currentTime}, Last Video Play Time: ${lastVideoPlayTime}, Cooldown Time: ${cooldownTime}`);
      console.log(`Time since last video played: ${currentTime - lastVideoPlayTime}`);
      if (bpm >= 92 && (currentTime - lastVideoPlayTime) >= cooldownTime) {
        if (!videoPlaying) {
          console.log('Playing video');
          video.style.display = 'block';
          video.play();
          videoPlaying = true;
          lastVideoPlayTime = currentTime; // Update the last play time
          console.log(`Video started at: ${lastVideoPlayTime}`);
        }
      }
    } else {
      console.error('Invalid BPM value:', event.data); // Debugging line
    }
  };

  // Event listener for when the video ends
  video.addEventListener('ended', () => {
    video.style.display = 'none';
    videoPlaying = false;
    lastVideoPlayTime = Date.now(); // Update the last play time when the video ends
    console.log(`Video ended at: ${lastVideoPlayTime}`);
  });

  ws.onopen = () => {
    console.log('WebSocket connected');
  };

  ws.onclose = () => {
    console.log('WebSocket disconnected');
  };

  // Example: Update the position of the BPM text
  document.documentElement.style.setProperty('--bpm-top', '939px');
  document.documentElement.style.setProperty('--bpm-left', '320px');

  // Example: Update the position of the LEVEL text
  document.documentElement.style.setProperty('--level-top', '890px');
  document.documentElement.style.setProperty('--level-right', '100px');

  // Example: Update the position of the .fairy text
  document.documentElement.style.setProperty('--fairy-top', '7.8px');
  document.documentElement.style.setProperty('--fairy-left', '26px');
});

// ffmpeg -i "C:\hi\tip bar.mov" -c:v libvpx-vp9 -b:v 2M -pix_fmt yuva420p "C:\hi\output2.webm"
