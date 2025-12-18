// Audio Manager for Background Music and Sound Effects
export class AudioManager {
    constructor() {
        this.bgMusic = null;
        this.currentTheme = null;
        this.isMuted = false;

        // Background music sources (using placeholder URLs - replace with actual audio files)
        this.bgMusicSources = {
            lobby: 'https://assets.mixkit.co/music/preview/mixkit-tech-house-vibes-130.mp3',
            forest: 'https://assets.mixkit.co/music/preview/mixkit-forest-treasure-138.mp3',
            desert: 'https://assets.mixkit.co/music/preview/mixkit-epic-orchestra-transition-2290.mp3',
            castle: 'https://assets.mixkit.co/music/preview/mixkit-games-worldbeat-466.mp3'
        };

        // Sound effects
        this.soundEffects = {
            hit: new Audio('https://assets.mixkit.co/sfx/preview/mixkit-arcade-game-jump-coin-216.mp3'),
            perfect: new Audio('https://assets.mixkit.co/sfx/preview/mixkit-achievement-bell-600.mp3'),
            buttonHover: new Audio('https://assets.mixkit.co/sfx/preview/mixkit-select-click-1109.mp3'),
            buttonClick: new Audio('https://assets.mixkit.co/sfx/preview/mixkit-modern-click-box-check-1120.mp3')
        };

        // Preload sound effects
        Object.values(this.soundEffects).forEach(sfx => {
            sfx.volume = 0.3; // Lower volume for UI sounds
            sfx.load();
        });
    }

    playBGMusic(theme) {
        if (this.isMuted || this.currentTheme === theme) return;

        // Stop current music
        if (this.bgMusic) {
            this.bgMusic.pause();
            this.bgMusic.currentTime = 0;
        }

        // Play new theme music
        const musicUrl = this.bgMusicSources[theme];
        if (musicUrl) {
            this.bgMusic = new Audio(musicUrl);
            this.bgMusic.loop = true;
            this.bgMusic.volume = 0.3;
            this.currentTheme = theme;

            // Play with error handling
            this.bgMusic.play().catch(err => {
                console.log('Background music autoplay blocked:', err);
                // Will play on first user interaction
            });
        }
    }

    stopBGMusic() {
        if (this.bgMusic) {
            this.bgMusic.pause();
            this.bgMusic.currentTime = 0;
        }
        this.currentTheme = null;
    }

    playSoundEffect(type) {
        if (this.isMuted) return;

        const sfx = this.soundEffects[type];
        if (sfx) {
            sfx.currentTime = 0;
            sfx.play().catch(err => console.log('Sound effect error:', err));
        }
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        if (this.bgMusic) {
            this.bgMusic.muted = this.isMuted;
        }
        return this.isMuted;
    }

    setVolume(volume) {
        if (this.bgMusic) {
            this.bgMusic.volume = Math.max(0, Math.min(1, volume));
        }
    }
}
