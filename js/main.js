// STATE MANAGEMENT
const STATE = {
    LOCKED: 'locked',
    COUNTDOWN: 'countdown',
    UNLOCKED: 'unlocked'
};

let appState = STATE.LOCKED;
let countdownInterval = null;
let hasUserInteracted = false;

// CONFIGURATION
const CONFIG = {
    targetDate: new Date(new Date().getTime() + (1 * 06 * 1000)), // 1 minute from now
    floatingElements: ['💖', '🌟', '💝', '✨'],
    floatingCount: 8,
    typingText: 'Happy Birthday My Love 💕'
};

// PARTICLES INITIALIZATION
function createParticles(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    for (let i = 0; i < 15; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 5 + 's';
        particle.style.animationDuration = (15 + Math.random() * 10) + 's';
        container.appendChild(particle);
    }
}

// AUDIO ELEMENTS
const bgMusic = document.getElementById('bgMusic');
const loveVideo = document.getElementById('loveVideo');
let bgMusicLastTime = 0;

// AUDIO UNLOCK (CRITICAL - BACKGROUND MUSIC UNLOCK - MOBILE SAFE)
function unlockBackgroundMusic() {
    if (!bgMusic) return;
    bgMusic.volume = 0;
    bgMusic.play().then(() => {
        bgMusic.pause();
        bgMusic.currentTime = 0;
        console.log('Background music unlocked');
    }).catch(err => {
        console.log('Audio unlock blocked', err);
    });
}

// START BACKGROUND MUSIC
function startBackgroundMusic() {
    if (!hasUserInteracted || !bgMusic) return;
    bgMusic.volume = 0.6;
    bgMusic.currentTime = bgMusicLastTime || 0;
    bgMusic.play().catch(e => console.log('Music play failed', e));
}

// VIDEO MUSIC HANDOFF
if (loveVideo) {
    loveVideo.addEventListener('play', () => {
        if (bgMusic && !bgMusic.paused) {
            bgMusicLastTime = bgMusic.currentTime;
            bgMusic.pause();
        }
    });
    
    loveVideo.addEventListener('pause', () => {
        if (hasUserInteracted && bgMusic) {
            bgMusic.currentTime = bgMusicLastTime;
            bgMusic.play().catch(e => {});
        }
    });
    
    loveVideo.addEventListener('ended', () => {
        if (hasUserInteracted && bgMusic) {
            bgMusic.currentTime = bgMusicLastTime;
            bgMusic.play().catch(e => {});
        }
    });
}

// GATE SCREEN INTERACTION
document.getElementById('clickHereBtn').addEventListener('click', function() {
    hasUserInteracted = true;
    
    // Trigger vibration if available
    if (navigator.vibrate) navigator.vibrate([40, 40, 80]);
    
    // Animate button
    this.style.transform = 'scale(0.95)';
    
    // Create glow effect
    const glow = document.createElement('div');
    glow.style.cssText = `
        position: absolute; top: 50%; left: 50%; 
        transform: translate(-50%, -50%);
        width: 100px; height: 100px;
        background: radial-gradient(circle, rgba(255, 20, 147, 0.6) 0%, transparent 70%);
        border-radius: 50%; animation: glowPulse 0.8s ease-out forwards;
        pointer-events: none;
    `;
    this.appendChild(glow);
    
    // Transition to countdown
    setTimeout(transitionToCountdown, 300);
});

function transitionToCountdown() {
    const gateScreen = document.getElementById('gateScreen');
    const countdownScreen = document.getElementById('countdownScreen');
    
    gateScreen.style.animation = 'fadeOut 0.6s ease-out forwards';
    setTimeout(() => {
        gateScreen.classList.add('hidden');
        countdownScreen.classList.remove('hidden');
        appState = STATE.COUNTDOWN;
        
        // Add particles to countdown
        createParticles('countdownParticles');
        // Start countdown
        startCountdown();
    }, 600);
}

// COUNTDOWN LOGIC
function startCountdown() {
    updateCountdownDisplay();
    countdownInterval = setInterval(() => {
        const now = new Date().getTime();
        const distance = CONFIG.targetDate.getTime() - now;
        
        if (distance < 0) {
            clearInterval(countdownInterval);
            completeCountdown();
        } else {
            updateCountdownDisplay();
        }
    }, 100);
}

function updateCountdownDisplay() {
    const now = new Date().getTime();
    const distance = CONFIG.targetDate.getTime() - now;
    
    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);
    
    document.getElementById('days').textContent = String(days).padStart(2, '0');
    document.getElementById('hours').textContent = String(hours).padStart(2, '0');
    document.getElementById('minutes').textContent = String(minutes).padStart(2, '0');
    document.getElementById('seconds').textContent = String(seconds).padStart(2, '0');
}

function completeCountdown() {
    appState = STATE.UNLOCKED;
    
    // Trigger fireworks
    playFireworks();
    
    // Trigger vibration pattern
    if (navigator.vibrate) navigator.vibrate([100, 50, 100, 50, 200]);
    
    // Play whisper sound
    playWhisper();
    
    // Fade out countdown
    const countdownScreen = document.getElementById('countdownScreen');
    countdownScreen.style.animation = 'fadeOut 2s ease-out forwards';
    
    setTimeout(() => {
        countdownScreen.classList.add('hidden');
        // Enable scrolling
        document.body.style.overflow = 'auto';
        // Show main content
        const mainContent = document.getElementById('mainContent');
        mainContent.classList.remove('hidden');
        mainContent.style.animation = 'fadeIn 1s ease-out forwards';
        
        // Start animations
        setTimeout(startTypingAnimation, 1000);
        setTimeout(initializeFloatingElements, 1000);
        setTimeout(initializeScrollReveal, 1000);
    }, 2000);
}

// FIREWORKS ANIMATION
function playFireworks() {
    const canvas = document.getElementById('fireworksCanvas');
    canvas.classList.remove('hidden');
    
    // Resize canvas to window size
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const ctx = canvas.getContext('2d');
    let particles = [];
    
    class Particle {
        constructor(x, y) {
            this.x = x;
            this.y = y;
            this.vx = (Math.random() - 0.5) * 15;
            this.vy = (Math.random() - 0.5) * 15;
            this.alpha = 1;
            this.decay = Math.random() * 0.02 + 0.015;
            this.radius = Math.random() * 3 + 1;
            this.color = ['#ff1493', '#ffd700', '#ffb6d9', '#ff69b4'][Math.floor(Math.random() * 4)];
        }
        
        update() {
            this.x += this.vx;
            this.y += this.vy;
            this.vy += 0.3; // gravity
            this.alpha -= this.decay;
        }
        
        draw(ctx) {
            ctx.globalAlpha = this.alpha;
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1;
        }
    }
    
    // Create multiple bursts
    function createBurst() {
        const x = window.innerWidth / 2 + (Math.random() - 0.5) * 400;
        const y = window.innerHeight / 2 + (Math.random() - 0.5) * 300;
        for (let i = 0; i < 50; i++) {
            particles.push(new Particle(x, y));
        }
    }
    
    // Initial bursts
    createBurst();
    setTimeout(createBurst, 300);
    setTimeout(createBurst, 600);
    
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.globalCompositeOperation = 'lighter';
        
        for (let i = particles.length - 1; i >= 0; i--) {
            particles[i].update();
            particles[i].draw(ctx);
            
            if (particles[i].alpha <= 0) {
                particles.splice(i, 1);
            }
        }
        
        ctx.globalCompositeOperation = 'source-over';
        
        if (particles.length > 0) {
            requestAnimationFrame(animate);
        } else {
            canvas.classList.add('hidden');
        }
    }
    
    animate();
}

// AUDIO FUNCTIONS
function playWhisper() {
    if (!hasUserInteracted) return;
    
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        // Soft whisper-like frequency
        oscillator.frequency.value = 200;
        oscillator.frequency.exponentialRampToValueAtTime(100, audioContext.currentTime + 0.5);
        
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
    } catch (e) {
        console.log('Audio context unavailable');
    }
}

// TYPING ANIMATION
function startTypingAnimation() {
    const typingText = document.getElementById('typingText');
    let index = 0;
    
    function type() {
        if (index < CONFIG.typingText.length) {
            typingText.textContent = CONFIG.typingText.slice(0, index + 1);
            index++;
            // Random delay per character for natural feel
            const delay = Math.random() * 100 + 50;
            setTimeout(type, delay);
        }
    }
    type();
}

// FLOATING ELEMENTS
function initializeFloatingElements() {
    const container = document.getElementById('floatingElements');
    for (let i = 0; i < CONFIG.floatingCount; i++) {
        const element = document.createElement('div');
        const emoji = CONFIG.floatingElements[i % CONFIG.floatingElements.length];
        element.className = 'floating-element';
        element.textContent = emoji;
        element.style.left = Math.random() * 100 + '%';
        element.style.top = Math.random() * 100 + '%';
        element.style.animationDuration = (8 + Math.random() * 4) + 's';
        element.style.animationDelay = Math.random() * 2 + 's';
        
        element.addEventListener('click', (e) => {
            e.stopPropagation();
            popElement(element);
        });
        
        container.appendChild(element);
    }
}

function popElement(element) {
    if (navigator.vibrate) navigator.vibrate(30);
    playPopSound();
    element.classList.add('popped');
    setTimeout(() => element.remove(), 600);
}

// SCROLL REVEAL ANIMATIONS
function initializeScrollReveal() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                // Stagger animation for child elements
                const children = entry.target.querySelectorAll('.message-line, .gallery-item, .special-card, .gift-message p, .promise-content p');
                children.forEach((child, index) => {
                    setTimeout(() => child.classList.add('animate-in'), index * 100);
                });
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // Observe all content sections
    document.querySelectorAll('.content-section').forEach(section => {
        observer.observe(section);
    });
}

// PHOTO ANIMATION
function handlePhotoAnimation() {
    const photo = document.getElementById('profilePhoto');
    // Wait for photo section to be visible
    setTimeout(() => {
        // Make photo sticky after animation completes
        photo.classList.add('sticky');
        photo.style.animation = 'none';
    }, 2300);
}

// INITIALIZATION
function initialize() {
    // Disable scrolling initially
    document.body.style.overflow = 'hidden';
    
    // Create particles on gate screen
    createParticles('particlesContainer');
    
    // Add CSS keyframes for animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeOut { to { opacity: 0; filter: blur(10px); transform: scale(0.95); } }
        @keyframes fadeIn { from { opacity: 0; filter: blur(10px); } to { opacity: 1; filter: blur(0); } }
        @keyframes glowPulse { from { opacity: 1; transform: scale(0); } to { opacity: 0; transform: scale(1); } }
        @keyframes popAnimation { 0% { transform: scale(1); opacity: 1; } 100% { transform: scale(0); opacity: 0; } }
    `;
    document.head.appendChild(style);
    
    // Unlock audio
    unlockBackgroundMusic();
    
    // Audio toggle button
    const audioToggleBtn = document.getElementById('audioToggleBtn');
    audioToggleBtn.addEventListener('click', () => {
        if (bgMusic.paused) {
            startBackgroundMusic();
            audioToggleBtn.textContent = '🔊';
        } else {
            bgMusic.pause();
            bgMusicLastTime = bgMusic.currentTime;
            audioToggleBtn.textContent = '🔇';
        }
    });
}

// Start initialization when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
} else {
    initialize();
}

// Handle window resize for canvas
window.addEventListener('resize', () => {
    const canvas = document.getElementById('fireworksCanvas');
    if (!canvas.classList.contains('hidden')) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
});
