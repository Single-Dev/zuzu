<template>
    <div class="welcome-container" :class="{ 'iframe-fullscreen': isFullScreen }">
      <div v-if="!isFullScreen" class="welcome-content">
        <div class="welcome-header">
          <h1>Welcome to Zara Hainin's website</h1>
          <p class="subtitle">I would give you unexpected gift if we were together but since we are far I decided to create a site for you.</p>
        </div>
        
        <div class="info-cards">
          <div class="info-card">
            <maximize-icon class="card-icon" />
            <h2>Full screen</h2>
            <p>Click "Full Screen" button bellow to have better expirience because it is out of this site</p>
          </div>
          <div class="info-card">
            <MousePointerClick  class="card-icon" />
            <h2>Explode</h2>
            <p>Click ballons 18times</p>
          </div>
          <div class="info-card">
            <MinimizeIcon class="card-icon" />
            <h2>Come back</h2>
            <p>Come back site by clicking "Exit Full Screen" and discover your own site</p>
          </div>
        </div>
      </div>
      
      <div class="iframe-container" :class="{ 'fullscreen': isFullScreen }">
        <div v-if="!isFullScreen" class="iframe-header">
          <h2>Or you can just preview it</h2>
          <button class="fullscreen-toggle" @click="toggleFullScreen">
            <maximize-icon v-if="!isFullScreen" />
            <minimize-icon v-else />
            {{ isFullScreen ? 'Exit Full Screen' : 'Full Screen' }}
          </button>
        </div>
        <iframe 
          src="https://gifft.me/o/d/lp28ygt9k6s8w7n0fqqoc3f6"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen
        ></iframe>
        <button v-if="isFullScreen" class="fullscreen-toggle exit-fullscreen" @click="toggleFullScreen">
          <minimize-icon />
          Exit Full Screen
        </button>
        <p>if it isn't working just open <a href="https://gifft.me/o/d/lp28ygt9k6s8w7n0fqqoc3f6">this site <b>(click to visit)</b></a> and come back here </p>
      </div>
      
      <div v-if="!isFullScreen" class="welcome-footer">
        <!-- <button class="toggle-button" @click="toggleTheme">
          <moon-icon v-if="isDarkMode" />
          <sun-icon v-else />
          {{ isDarkMode ? 'Light Mode' : 'Dark Mode' }}
        </button> -->
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  import { MousePointerClick , MoonIcon, SunIcon, MaximizeIcon, MinimizeIcon } from 'lucide-vue-next';
  
  const isDarkMode = ref(true);
  const isFullScreen = ref(false);
  
  const toggleTheme = () => {
    isDarkMode.value = !isDarkMode.value;
    document.body.classList.toggle('dark-mode', isDarkMode.value);
  };
  
  const toggleFullScreen = () => {
    isFullScreen.value = !isFullScreen.value;
    if (isFullScreen.value) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  };
  </script>
  
  <style scoped>
  :root {
    --primary-color: #10b981;
    --secondary-color: #34d399;
    --background-color: #ffffff;
    --card-background: #f9fafb;
    --text-color: #1f2937;
    --text-secondary: #6b7280;
    --border-color: #e5e7eb;
    --shadow-color: rgba(0, 0, 0, 0.1);
  }
  
  body.dark-mode {
    --primary-color: #10b981;
    --secondary-color: #34d399;
    --background-color: #111827;
    --card-background: #1f2937;
    --text-color: #f9fafb;
    --text-secondary: #d1d5db;
    --border-color: #374151;
    --shadow-color: rgba(0, 0, 0, 0.3);
  }
  
  .welcome-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    padding: 2rem;
    box-sizing: border-box;
    background-color: var(--background-color);
    color: var(--text-color);
    transition: background-color 0.3s ease, color 0.3s ease;
  }
  
  .welcome-container.iframe-fullscreen {
    padding: 0;
  }
  
  .welcome-content {
    width: 100%;
    max-width: 1200px;
    margin-bottom: 2rem;
  }
  
  .welcome-header {
    text-align: center;
    margin-bottom: 3rem;
  }
  
  .welcome-header h1 {
    font-size: 2.5rem;
    margin-bottom: 0.5rem;
    background: linear-gradient(to right, var(--primary-color), var(--secondary-color));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  
  .subtitle {
    font-size: 1.2rem;
    color: var(--text-secondary);
    width: 700px;
    margin-left: auto;
    margin-right: auto;
  }
  
  .info-cards {
    display: flex;
    justify-content: center;
    gap: 2rem;
    flex-wrap: wrap;
  }
  
  .info-card {
    background-color: var(--card-background);
    border-radius: 12px;
    padding: 1.5rem;
    width: 250px;
    text-align: center;
    box-shadow: 0 4px 6px var(--shadow-color);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
  }
  
  .info-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 15px var(--shadow-color);
  }
  
  .card-icon {
    width: 48px;
    height: 48px;
    color: var(--primary-color);
    margin-bottom: 1rem;
  }
  
  .info-card h2 {
    font-size: 1.3rem;
    margin-bottom: 0.5rem;
    color: var(--primary-color);
  }
  
  .info-card p {
    color: var(--text-secondary);
  }
  
  .iframe-container {
    width: 100%;
    max-width: 800px;
    margin-bottom: 2rem;
    position: relative;
  }
  
  .iframe-container.fullscreen {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    max-width: none;
    margin: 0;
    z-index: 1000;
  }
  
  .iframe-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }
  
  .iframe-header h2 {
    font-size: 1.3rem;
    color: var(--primary-color);
    margin: 0;
  }
  
  .iframe-container iframe {
    width: 100%;
    height: 450px;
    border: none;
    border-radius: 12px;
    box-shadow: 0 4px 6px var(--shadow-color);
  }
  
  .iframe-container.fullscreen iframe {
    height: 100%;
    border-radius: 0;
    box-shadow: none;
  }
  
  .fullscreen-toggle {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background-color: var(--card-background);
    color: var(--text-color);
    border: 1px solid var(--border-color);
    border-radius: 8px;
    padding: 0.5rem 1rem;
    font-size: 0.9rem;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.3s ease, transform 0.2s ease;
  }
  
  .fullscreen-toggle:hover {
    background-color: var(--primary-color);
    color: white;
  }
  
  .exit-fullscreen {
    position: absolute;
    top: 1rem;
    right: 1rem;
    z-index: 1001;
  }
  
  .welcome-footer {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
  }
  
  .cta-button {
    background-color: var(--primary-color);
    color: white;
    border: none;
    border-radius: 8px;
    padding: 1rem 2rem;
    font-size: 1.2rem;
    font-weight: bold;
    cursor: pointer;
    transition: background-color 0.3s ease, transform 0.2s ease;
  }
  
  .cta-button:hover {
    background-color: var(--secondary-color);
    transform: translateY(-2px);
  }
  
  .toggle-button {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background-color: var(--card-background);
    color: var(--text-color);
    border: 1px solid var(--border-color);
    border-radius: 8px;
    padding: 0.75rem 1.25rem;
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.3s ease, transform 0.2s ease;
  }
  
  .toggle-button:hover {
    background-color: var(--primary-color);
    color: white;
    transform: translateY(-2px);
  }
  
  @media (max-width: 768px) {
    .welcome-header h1 {
      font-size: 2rem;
    }
    
    .subtitle{
      width: 250px;
    }

    .info-card {
      width: 100%;
      max-width: 300px;
    }
    
    .iframe-container iframe {
      height: 300px;
    }
  
    .iframe-container.fullscreen iframe {
      height: 100%;
    }
  }
  </style>