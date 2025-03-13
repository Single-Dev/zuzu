<template>
    <div class="audio-player">
        <div class="attention">
            ⚠️ This music streams online. If it doesn’t play, revisit this page or check your internet.
        </div>
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
            <source src="../assets/music.mp3" type="audio/mpeg">
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
                { time: 12, text: "Till I rot away, dead and buried" },
                { time: 17, text: "Till I'm in the casket you carry" },
                { time: 21, text: "If you go, I'm going too, uh" },
                { time: 25, text: "Cause it was always you, alright" },
                { time: 30, text: "And if I'm turning blue, please, don't save me" },
                { time: 35, text: "Nothing left to lose without my baby" },
                { time: 40, text: "Birds of a feather, we should stick together" },
                { time: 45, text: "I know I said I'd never think I wasn't better alone" },
                { time: 50, text: "Can't change the weather, might not be forever" },
                { time: 55, text: "But if it's forever, it's even better" },
                { time: 60, text: "And I don't know what I'm crying for" },
                { time: 65, text: "I don't think I could love you more" },
                { time: 70, text: "It might not be long, but, baby, I" },
                { time: 75, text: "I'll love you till the day that I die" },
                { time: 80, text: "Till the day that I die" },
                { time: 85, text: "Till the light leaves my eyes" },
                { time: 90, text: "Till the day that I die" },
                { time: 95, text: "I want you to see, mmm" },
                { time: 99, text: "How you look to me, huh" },
                { time: 104, text: "You wouldn't believe if I told ya" },
                { time: 108, text: "You would keep the compliments I throw ya" },
                { time: 113, text: "But you're so full of shit, hmm" },
                { time: 118, text: "Tell me it's a bit, oh" },
                { time: 122, text: "Say you don't see it, your mind's polluted" },
                { time: 127, text: "Say you wanna quit, don't be stupid" },
                { time: 131, text: "And I don't know what I'm crying for" },
                { time: 138, text: "I don't think I could love you more" },
                { time: 142, text: "It might not be long, but, baby, I" },
                { time: 148, text: "Don't wanna say goodbye" },
                { time: 152, text: "till the day that I die" },
                { time: 157, text: "till the light leaves my eyes" },
                { time: 163, text: "till the day that I die" },
                { time: 165, text: "But if it's forever, it's even better" },
                { time: 170, text: "I knew you in another life" },
                { time: 175, text: "You had the same look in your eyes" },
                { time: 180, text: "I love you, don't act so surprised" },
                { time: 184, text: "Happy birthday" },
                { time: 187, text: "It's your day" },
                { time: 191, text: "I wish long and happy life with me" },
                { time: 195, text: "Be patient" },
                { time: 197, text: "Be hardworking girl" },
                { time: 200, text: "Be happy" },
                { time: 203, text: "DO NOT BE STRESSED" },
                { time: 205, text: "DO NOT CRY" },
                { time: 207, text: "I love you soo much 💕" },
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

.attention{
    padding: 1rem;
    background-color: rgba(16, 185, 129, 0.1);
    border-left: 4px solid #10b981;
    color: #d1fae5;
    border-radius: 4px;
    margin-bottom: 1.5rem;
}

.audio-player {
    width: 900px;
    max-width: 1000px;
    height: 106vh;
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
    color:#0019fe;
    text-shadow: 0 0 10px  #0019fe;
}

.lyrics-container p.past {
    opacity: 0.3;
}

@media (max-width: 768px) {
    .audio-player {
        width: 300px;
        height: 150vh;
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
        height: 230px;
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
        font-size: 19px;
    }
}
</style>