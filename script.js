document.addEventListener('DOMContentLoaded', () => {
  // Connect to WebSocket server
  const ws = new WebSocket('ws://localhost:8080');
  let currentGif = 'light-fairy.gif'; // Track the current GIF
  const audio = document.getElementById('high-bpm-audio'); // Get the audio element
  const video = document.getElementById('bpm-video'); // Get the video element
  const popupText = document.getElementById('popup-text'); // Get the popup text element
  const redOverlay = document.getElementById('red-overlay'); // Get the red overlay element
  audio.volume = 0.5; // Set the volume to 50%
  let videoPlaying = false; // Flag to track if the video is playing
  let lastVideoPlayTime = 0; // Timestamp of the last time the video was played
  const cooldownTime = 1 * 60 * 1000; // 1 minute in milliseconds

  // Array of text options
  const textOptions = [
    "I'm wilting, take a deep breath!",
    "Relax and let our flower grow.",
    "Our other self might be taking over...Be careful!",
    "Take a deep breath, the inner game is yours to win.",
    "Remember. Stay relaxed. Stay concentrated. You got this!",
    "The ego-mind is powerful, do your best to fight it and stay calm!",
    "Quiet our other half, friend. We're in control here.",
    "Your negative judgements are nothing but our other selves' reactions. Let them go :)",
    "See your plays as they are. Only then can you improve them.",
    "Have faith in your ability, you're improving with every play!",
    "Take a step back and be more aware, Self 1 is lurking!",
    "You're losing the inner game. Take a breath to turn it around!",
    "If you know how to do something, let it happen. If not, let yourself learn.",
    "You've come so far...don't let Self 1 take over now!",
    "You are more than the outcome of this game.",
    "Allow me as your Self 2 to have some fun, I've got this!",
    "I'm your greatest resource, friend. Use me wisely!",
    "Hey! Listen! Stay aware in the moment, okay?!",
    "Ask yourself, how would you like to play this next part?",
    "Encourage your plays, but don't force them!",
    "Don't think of a habit as bad, rather ask yourself! What function does it serve?",
    "Hey! Don't try too hard. Just let it happen.",
    "Trust in me! I'll do the changes for you, simply relax, friend.",
    "In true competition no person is defeated. Don't stop learning.",
    "Stay determined and trust in me, friend.",
    "My power's fading...! Don't let our other self rob the fun from us!",
    "Focus. I'll do the rest from there.",
    "Patience is key to good plays. Leave the rest to me.",
  ];

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
      if (bpm > 90 && currentGif !== 'dark fairy.gif') {
        catGif.src = 'dark fairy.gif';
        catGif.alt = 'Dark Fairy';
        currentGif = 'dark fairy.gif';
      } else if (bpm <= 90 && currentGif !== 'light fairy.gif') {
        catGif.src = 'light fairy.gif';
        catGif.alt = 'Light Fairy';
        currentGif = 'light fairy.gif';
      }

      // Play or stop the audio based on BPM value
      if (bpm > 120) {
        if (audio.paused) {
          audio.play();
          // Show the red overlay and apply the animation
          redOverlay.classList.add('active');
          redOverlay.classList.remove('inactive');
        }
      } else {
        if (!audio.paused) {
          audio.pause();
          audio.currentTime = 0; // Reset the audio to the beginning
          // Hide the red overlay
          redOverlay.classList.add('inactive');
          redOverlay.classList.remove('active');
        }
      }

      // Play the video and show text based on BPM value and cooldown
      const currentTime = Date.now();
      console.log(`Current Time: ${currentTime}, Last Video Play Time: ${lastVideoPlayTime}, Cooldown Time: ${cooldownTime}`);
      console.log(`Time since last video played: ${currentTime - lastVideoPlayTime}`);
      if (bpm >= 85 && (currentTime - lastVideoPlayTime) >= cooldownTime) {
        if (!videoPlaying) {
          console.log('Playing video');
          video.style.display = 'block';
          video.play();
          videoPlaying = true;
          lastVideoPlayTime = currentTime; // Update the last play time
          console.log(`Video started at: ${lastVideoPlayTime}`);

          // Randomly select and display text
          const randomText = textOptions[Math.floor(Math.random() * textOptions.length)];
          popupText.innerHTML = randomText;
          popupText.classList.remove('fade-out');
          popupText.classList.add('fade-in');
          popupText.style.display = 'block';

          // Hide the text a few seconds before the video ends
          const hideTextTime = video.duration - 1.45; // 1.45 seconds before the video ends
          setTimeout(() => {
            popupText.classList.remove('fade-in');
            popupText.classList.add('fade-out');
            setTimeout(() => {
              popupText.style.display = 'none'; // Hide the text after fade-out animation
            }, 1000); // Match the duration of the fade-out animation
          }, hideTextTime * 1000); // Convert to milliseconds
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
  document.documentElement.style.setProperty('--fairy-top', '10px');
  document.documentElement.style.setProperty('--fairy-left', '27px');

  // Example: Update the position of the .advice text
  document.documentElement.style.setProperty('--advice-top', '56px');
  document.documentElement.style.setProperty('--advice-left', '138px');
});