<template>
    <div class="countup-container">
        <div class="countup-header">
            <h1>We are dating for:</h1>
            <p class="subtitle">Counting every moment since the  our journey began</p>
            <p>This doen't stop counting which means <b>we never break up</b> it counties counting that we are dating!</p>
        </div>

        <div class="countup-timer">
            <div class="time-block">
                <div class="time-value">{{ timePassed.days }}</div>
                <div class="time-label">Days</div>
            </div>
            <div class="time-separator">:</div>
            <div class="time-block">
                <div class="time-value">{{ timePassed.hours }}</div>
                <div class="time-label">Hours</div>
            </div>
            <div class="time-separator">:</div>
            <div class="time-block">
                <div class="time-value">{{ timePassed.minutes }}</div>
                <div class="time-label">Minutes</div>
            </div>
            <div class="time-separator">:</div>
            <div class="time-block">
                <div class="time-value">{{ timePassed.seconds }}</div>
                <div class="time-label">Seconds</div>
            </div>
        </div>

        <div class="milestone-container">
            <h2>Milestones</h2>
            <div class="milestones">
                <div v-for="(milestone, index) in milestones" :key="index" class="milestone-card"
                    :class="{ 'milestone-reached': milestone.days <= parseInt(timePassed.days) }">
                    <div class="milestone-days">{{ milestone.days }} days</div>
                    <div class="milestone-title">{{ milestone.title }}</div>
                    <div class="milestone-status">
                        {{ milestone.days <= parseInt(timePassed.days) ? 'Reached!' : 'Coming soon' }} </div>
                    </div>
                </div>
                <p>Much more...</p>
            </div>

            <div class="countup-footer">
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

// Start date: May 22nd, 2024
const startDate = new Date('2024-05-22T15:03:15');
const now = ref(new Date());
const isDarkMode = ref(false);
const intervalId = ref(null);

// Calculate time passed
const timePassed = computed(() => {
    const difference = now.value - startDate;

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

// Sample milestones
const milestones = [
    { days: 7, title: 'First Week' },
    { days: 30, title: 'First Month' },
    { days: 180, title: 'Six Month' },
    { days: 365, title: 'First Year' },
    { days: 730, title: 'Two Years' },
    { days: 1825, title: 'Five Years' },
    { days: 3650, title: 'Ten Years' },
    { days: 7300, title: 'Twenty Years' },
    { days: 14600, title: 'Fourty Years' },
    { days: 29200, title: 'Seventy Years' },
    { days: 58400, title: 'One hundred and Sixty Years' },
];

// Toggle between light and dark mode
const toggleTheme = () => {
    isDarkMode.value = !isDarkMode.value;
    document.body.classList.toggle('dark-mode', isDarkMode.value);
};

// Update the current time every second
onMounted(() => {
    // Check if user prefers dark mode
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        isDarkMode.value = true;
        document.body.classList.add('dark-mode');
    }

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
    --primary-color: #10b981;
    --secondary-color: #34d399;
    --background-color: #ffffff;
    --card-background: #f9fafb;
    --text-color: #1f2937;
    --text-secondary: #6b7280;
    --border-color: #e5e7eb;
    --shadow-color: rgba(0, 0, 0, 0.1);
    --milestone-bg: #ecfdf5;
    --milestone-reached-bg: #d1fae5;
    --milestone-text: #065f46;
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
    --milestone-bg: #064e3b;
    --milestone-reached-bg: #065f46;
    --milestone-text: #ecfdf5;
}

body {
    margin: 0;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    background-color: var(--background-color);
    color: var(--text-color);
    transition: background-color 0.3s ease, color 0.3s ease;
}

.countup-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    padding: 2rem;
    box-sizing: border-box;
}

.countup-header {
    text-align: center;
    margin-bottom: 3rem;
}

.countup-header h1 {
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

.countup-timer {
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

.milestone-container {
    width: 100%;
    max-width: 800px;
    margin-bottom: 2rem;
}

.milestone-container h2 {
    text-align: center;
    font-size: 1.8rem;
    margin-bottom: 1.5rem;
    color: var(--text-color);
}

.milestones {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 1rem;
}

.milestone-card {
    background-color: var(--milestone-bg);
    border-radius: 10px;
    padding: 1.5rem;
    text-align: center;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    border: 1px solid var(--border-color);
}

.milestone-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 15px var(--shadow-color);
}

.milestone-reached {
    background-color: var(--milestone-reached-bg);
    border-color: var(--primary-color);
}

.milestone-days {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--milestone-text);
    margin-bottom: 0.5rem;
}

.milestone-title {
    font-size: 1.2rem;
    font-weight: 600;
    color: var(--milestone-text);
    margin-bottom: 1rem;
}

.milestone-status {
    font-size: 0.9rem;
    font-weight: 500;
    color: var(--milestone-text);
    opacity: 0.8;
}

.milestone-reached .milestone-status {
    color: var(--primary-color);
    font-weight: 700;
}

.countup-footer {
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

/* Responsive styles */
@media (max-width: 768px) {
    .countup-timer {
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

    .countup-header h1 {
        font-size: 2rem;
    }

    .milestones {
        grid-template-columns: 1fr;
    }
}
</style>