<template>
    <div class="countdown-container">
        <div class="countdown-header">
            <h1>Countdown to your birthday</h1>
            <p class="subtitle">Time remaining until next birthday (it automatically counts down to next birthday)</p>
            <p>This never stop counting down to your birthday <b>wishing that long life to you :)</b></p>
        </div>

        <div class="countdown-timer">
            <div class="time-block">
                <div class="time-value">{{ timeLeft.days }}</div>
                <div class="time-label">Days</div>
            </div>
            <div class="time-separator">:</div>
            <div class="time-block">
                <div class="time-value">{{ timeLeft.hours }}</div>
                <div class="time-label">Hours</div>
            </div>
            <div class="time-separator">:</div>
            <div class="time-block">
                <div class="time-value">{{ timeLeft.minutes }}</div>
                <div class="time-label">Minutes</div>
            </div>
            <div class="time-separator">:</div>
            <div class="time-block">
                <div class="time-value">{{ timeLeft.seconds }}</div>
                <div class="time-label">Seconds</div>
            </div>
        </div>

        <div v-if="isExpired" class="expired-message">
            <h2>Finally, today</h2>
            <p>Congarts, I wish long and happy life with me :)</p>
        </div>

        <div class="countdown-footer">
            <!-- <button class="toggle-button" @click="toggleTheme">
                <moon v-if="isDarkMode" />
                <sun v-else />
                {{ isDarkMode ? 'Light Mode' : 'Dark Mode' }}
            </button> -->
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { Moon, Sun } from 'lucide-vue-next';

const getNextBirthday = () => {
  const now = new Date();
  const birthdayMonth = 3; // For March (0-indexed, so 3 = March)
  const birthdayDay = 25; // 10th March

  // Get the current year
  let nextBirthdayYear = now.getFullYear();

  // If the birthday has already passed this year, set the next birthday to next year
  if (now.getMonth() > birthdayMonth || (now.getMonth() === birthdayMonth && now.getDate() > birthdayDay)) {
    nextBirthdayYear += 1;
  }

  // Return the next birthday date
  return new Date(nextBirthdayYear, birthdayMonth, birthdayDay);
};

// Define the target date based on the next birthday
const targetDate = ref(getNextBirthday());
const now = ref(new Date());
const intervalId = ref(null);

// Calculate time left
const timeLeft = computed(() => {
    const difference = targetDate.value - now.value;

    // If the countdown is over (it's the target date or past)
    if (difference <= 0) {
        targetDate.value = getNextBirthday(); // Update to next year's birthday once expired
        return {
            days: '00',
            hours: '00',
            minutes: '00',
            seconds: '00'
        };
    }

    // Calculate time units
    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((difference % (1000 * 60)) / 1000);

    // Pad with zeros for consistent display
    return {
        days: days.toString().padStart(2, '0'),
        hours: hours.toString().padStart(2, '0'),
        minutes: minutes.toString().padStart(2, '0'),
        seconds: seconds.toString().padStart(2, '0')
    };
});

// Check if countdown has expired (target date has passed or is today)
const isExpired = computed(() => {
    return targetDate.value <= now.value;
});

// Update the current time every second
onMounted(() => {
    intervalId.value = setInterval(() => {
        now.value = new Date();
    }, 1000);
});

// Clean up interval when component is unmounted
onBeforeUnmount(() => {
    if (intervalId.value) {
        clearInterval(intervalId.value);
    }
});

</script>

<style>
:root {
    --primary-color: #4f46e5;
    --secondary-color: #818cf8;
    --background-color: #ffffff;
    --card-background: #f9fafb;
    --text-color: #1f2937;
    --text-secondary: #6b7280;
    --border-color: #e5e7eb;
    --shadow-color: rgba(0, 0, 0, 0.1);
}

body.dark-mode {
    --primary-color: #6366f1;
    --secondary-color: #818cf8;
    --background-color: #111827;
    --card-background: #1f2937;
    --text-color: #f9fafb;
    --text-secondary: #d1d5db;
    --border-color: #374151;
    --shadow-color: rgba(0, 0, 0, 0.3);
}

body {
    margin: 0;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    background-color: var(--background-color);
    color: var(--text-color);
    transition: background-color 0.3s ease, color 0.3s ease;
}

.countdown-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    padding: 2rem;
    box-sizing: border-box;
}

.countdown-header {
    text-align: center;
    margin-bottom: 3rem;
}

.countdown-header h1 {
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
    margin-top: 0;
}

.countdown-timer {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    margin-bottom: 3rem;
}

.time-block {
    display: flex;
    flex-direction: column;
    align-items: center;
    background-color: var(--card-background);
    border-radius: 12px;
    padding: 1.5rem;
    min-width: 120px;
    box-shadow: 0 4px 6px var(--shadow-color);
    border: 1px solid var(--border-color);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.time-block:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 15px var(--shadow-color);
}

.time-value {
    font-size: 3.5rem;
    font-weight: 700;
    color: var(--primary-color);
}

.time-label {
    font-size: 1rem;
    font-weight: 500;
    color: var(--text-secondary);
    margin-top: 0.5rem;
    text-transform: uppercase;
    letter-spacing: 1px;
}

.time-separator {
    font-size: 2.5rem;
    font-weight: 700;
    color: var(--text-secondary);
    margin: 0 0.25rem;
    align-self: flex-start;
    margin-top: 1.5rem;
}

.expired-message {
    text-align: center;
    background-color: var(--card-background);
    border-radius: 12px;
    padding: 2rem;
    margin-bottom: 2rem;
    border: 1px solid var(--border-color);
    box-shadow: 0 4px 6px var(--shadow-color);
    animation: pulse 2s infinite;
}

.expired-message h2 {
    font-size: 1.8rem;
    margin-bottom: 0.5rem;
    color: var(--primary-color);
}

.expired-message p {
    font-size: 1.2rem;
    color: var(--text-secondary);
}

.countdown-footer {
    margin-top: 2rem;
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

@keyframes pulse {
    0% {
        box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.4);
    }

    70% {
        box-shadow: 0 0 0 10px rgba(99, 102, 241, 0);
    }

    100% {
        box-shadow: 0 0 0 0 rgba(99, 102, 241, 0);
    }
}

/* Responsive styles */
@media (max-width: 768px) {
    .countdown-timer {
        flex-wrap: wrap;
        gap: 1rem;
    }

    .time-block {
        min-width: 80px;
        padding: 1rem;
    }

    .time-value {
        font-size: 2.5rem;
    }

    .time-separator {
        display: none;
    }

    .countdown-header h1 {
        font-size: 2rem;
    }
}
</style>