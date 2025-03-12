<template>
    <div class="audio-player">
        <div class="player-container">
            <!-- Album artwork -->
            <div class="album-art">
                <img src="https://audio.com/s3w/audio.com.static/audio/image/09/41/1813634239204109-1813634288134986.jpeg"
                    alt="Birds of a Feather Album Art" />
            </div>

            <!-- Track info and controls -->
            <div class="track-info">
                <div class="header">
                    <div class="title-section">
                        <h2>BIRDS OF A FEATHER</h2>
                        <p>Billie Eilish</p>
                    </div>

                </div>

                <div class="player-controls">
                    <!-- Play button -->
                    <button class="play-btn" @click="togglePlay">
                        <i :class="isPlaying ? 'icon-pause' : 'icon-play'"></i>
                    </button>

                    <!-- Waveform -->
                    <div class="waveform" ref="waveformRef" @click="seekAudio">
                        <div v-for="(bar, index) in waveformBars" :key="index" class="waveform-bar"
                            :class="{ 'played': currentTime / duration > index / waveformBars.length }"
                            :style="{ height: bar + '%' }"></div>
                    </div>
                </div>
                <div class="time-display">
                    {{ formatTime(currentTime) }}-{{ formatTime(duration) }}
                </div>
            </div>
        </div>

        <!-- Karaoke section -->
        <div class="karaoke-section">
            <div class="lyrics-container" :style="{ transform: `translateY(${-currentLyricIndex * 60}px)` }">
                <p v-for="(line, index) in lyrics" :key="index"
                    :class="{ 'active': currentLyricIndex === index, 'past': index < currentLyricIndex }">
                    {{ line.text }}
                </p>
            </div>
        </div>

        <!-- Hidden audio element -->
        <audio ref="audioRef" @timeupdate="updateTime" @loadedmetadata="setDuration">
            <source src="https://drive.google.com/file/d/1HGUve7qCIHSyvHNA8FzvmkcvOorL8M8s/view" type="audio/mpeg">
            Your browser does not support the audio element.
        </audio>
    </div>
</template>

<script>
export default {
    name: 'AudioPlayer',
    data() {
        return {
            isPlaying: false,
            currentTime: 0,
            duration: 210, // Default duration in seconds (3:30)
            waveformBars: [],
            lyrics: [
                { time: 0, text: "I want you to stay" },
                { time: 5, text: "Till I'm in the grave" },
                { time: 10, text: "Till I rot away, dead and buried" },
                { time: 15, text: "Till I'm in the casket you carry" },
                { time: 20, text: "If you go, I'm going too, uh" },
                { time: 25, text: "Cause it was always you, alright" },
                { time: 30, text: "The sky isn't falling, I hear your voice calling" },
                { time: 35, text: "We'll rise above it all" },
                { time: 40, text: "Birds of a feather, fly together" },
                { time: 45, text: "Through stormy weather, we won't surrender" },
                { time: 50, text: "You and I, we're birds of a feather" },
                { time: 55, text: "We'll soar together, now and forever" },
                { time: 60, text: "When the wind blows hard, and the clouds turn dark" },
                { time: 65, text: "We'll find our way back to the light" },
                { time: 70, text: "With our wings spread wide, we'll take to the sky" },
                { time: 75, text: "And leave all our troubles behind" },
                { time: 80, text: "Birds of a feather, fly together" },
                { time: 85, text: "We'll brave any weather, light as a feather" },
                { time: 90, text: "You and I, we're birds of a feather" },
                { time: 95, text: "We'll fly forever, now and forever" },
                { time: 100, text: "When the world tries to clip our wings" },
                { time: 105, text: "We'll show them what freedom brings" },
                { time: 110, text: "With every beat of our hearts, we'll fly" },
                { time: 115, text: "Higher and higher into the sky" },
                { time: 120, text: "Birds of a feather, fly together" },
                { time: 125, text: "We'll stay the same, no matter the weather" },
                { time: 130, text: "You and I, we're birds of a feather" },
                { time: 135, text: "We'll stick together, now and forever" },
                { time: 140, text: "Now and forever" },
                { time: 145, text: "We'll fly together" },
                { time: 150, text: "Birds of a feather" },
            ],
            currentLyricIndex: 0,
        }
    },
    mounted() {
        this.generateWaveform();
        const audio = this.$refs.audioRef;
        audio.volume = 0.7;
    },
    methods: {
        togglePlay() {
            const audio = this.$refs.audioRef;
            if (this.isPlaying) {
                audio.pause();
            } else {
                audio.play();
            }
            this.isPlaying = !this.isPlaying;
        },
        updateTime() {
            this.currentTime = this.$refs.audioRef.currentTime;
            this.updateCurrentLyric();
        },
        setDuration() {
            this.duration = this.$refs.audioRef.duration;
        },
        formatTime(seconds) {
            const mins = Math.floor(seconds / 60);
            const secs = Math.floor(seconds % 60);
            return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        },
        generateWaveform() {
            this.waveformBars = Array.from({ length: 120 }, () =>
                Math.min(100, Math.max(20, 30 + Math.sin(Math.random() * 10) * 20 + Math.random() * 30))
            );
        },
        seekAudio(event) {
            if (!this.$refs.waveformRef) return;

            const waveformWidth = this.$refs.waveformRef.clientWidth;
            const clickPosition = event.offsetX;
            const seekPercentage = clickPosition / waveformWidth;

            this.$refs.audioRef.currentTime = this.duration * seekPercentage;
        },
        updateCurrentLyric() {
            for (let i = this.lyrics.length - 1; i >= 0; i--) {
                if (this.currentTime >= this.lyrics[i].time) {
                    this.currentLyricIndex = i;
                    break;
                }
            }
        },
    }
}
</script>

<style>
.audio-player {
    width: 900px;
    max-width: 1000px;
    height: 99vh;
    margin: 0 auto;
    background-color: #0d1a2a;
    padding: 24px;
    border-radius: 12px;
    color: white;
    font-family: 'Helvetica Neue', Arial, sans-serif;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
    display: block !important;
}

.player-container {
    display: flex;
    gap: 24px;
}

.album-art {
    flex-shrink: 0;
    width: 144px;
    height: 144px;
}

.album-art img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 8px;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
}

.track-info {
    flex: 1;
    display: flex;
    flex-direction: column;
}

.header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
}

.title-section p {
    font-size: 18px;
    margin: 4px 0 0 0;
    opacity: 0.8;
}

.action-buttons {
    display: flex;
    gap: 8px;
}

.player-controls {
    margin-top: 32px;
    display: flex;
    align-items: center;
    gap: 16px;
}

.play-btn {
    width: 56px;
    height: 56px;
    border-radius: 50%;
    background: linear-gradient(45deg, #111827, #10b981);
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    cursor: pointer;
    flex-shrink: 0;
    transition: all 0.3s ease;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
}

.play-btn:hover {
    transform: scale(1.1);
}

.play-btn i {
    color: white;
    font-size: 24px;
}

.waveform {
    flex: 1;
    height: 64px;
    display: flex;
    align-items: center;
    cursor: pointer;
    padding: 0 10px;
    background-color: rgba(255, 255, 255, 0.05);
    border-radius: 32px;
}

.waveform-bar {
    flex: 1;
    margin: 0 1px;
    background-color: #808080;
    transition: height 0.3s ease, background-color 0.3s ease;
}

.waveform-bar.played {
    background: linear-gradient(180deg, #111827, #10b981);
}

.player-footer {
    margin-top: 16px;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.left-section {
    display: flex;
    align-items: center;
    gap: 16px;
}

.tag {
    background-color: #1e293b;
    padding: 6px 12px;
    border-radius: 16px;
    font-size: 14px;
    font-weight: bold;
}

.listen-more {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
}

.platform {
    font-weight: bold;
    color: #feca57;
}

.time-display {
    font-size: 14px;
    font-weight: bold;
}

/* Icons */
.icon-play::before {
    content: "▶";
    margin-left: 3px;
}

.icon-pause::before {
    content: "⏸";
}

/* Karaoke section */
.karaoke-section {
    margin-top: 32px;
    padding: 24px;
    background-color: rgba(255, 255, 255, 0.05);
    border-radius: 12px;
    overflow: hidden;
    height: 400px;
}

.lyrics-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    transition: transform 0.5s ease;
}

.lyrics-container p {
    margin: 0;
    font-size: 20px;
    transition: all 0.3s ease;
    opacity: 0.6;
    text-align: center;
    width: 100%;
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.lyrics-container p.active {
    font-size: 28px;
    font-weight: bold;
    opacity: 1;
    color: #10b981;
    text-shadow: 0 0 10px #10b981;
}

.lyrics-container p.past {
    opacity: 0.3;
}

@media (max-width: 768px) {
    .audio-player {
        width: 300px;
    }

    .player-container {
        flex-direction: column;
    }

    .album-art {
        width: 100%;
        height: auto;
        max-width: 200px;
        margin: 0 auto;
    }

    .header {
        flex-direction: column;
        gap: 16px;
    }
    .waveform{
        display: none;
    }
    .karaoke-section{
        padding: 10px;
        height: 200px;
    }
    .player-controls{
        margin-left: auto;
        margin-right: auto;
    }
    .action-buttons {
        width: 100%;
        justify-content: space-between;
    }

    .lyrics-container p {
        font-size: 15px;
    }

    .lyrics-container p.active {
        font-size: 20px;
    }
}
</style>