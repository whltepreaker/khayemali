/* ==========================================================================
   Soft-Pink Shimmering Unicorn & Starry Canvas Web Experience
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    initStarfieldCanvas();
    initUnicornFollower();
    initClickSparkleEffects();
    initAudioController();
});

/* --------------------------------------------------------------------------
   1. Starfield Canvas & Sparkle Particle Engine
   -------------------------------------------------------------------------- */
function initStarfieldCanvas() {
    const canvas = document.getElementById('starfieldCanvas');
    const ctx = canvas.getContext('2d');

    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    window.addEventListener('resize', () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    });

    // Generate Stars and Shimmering Particles
    const numStars = 140;
    const stars = [];

    const colors = [
        'rgba(255, 255, 255, ',
        'rgba(255, 182, 193, ',
        'rgba(255, 209, 220, ',
        'rgba(225, 190, 231, ',
        'rgba(255, 240, 245, '
    ];

    for (let i = 0; i < numStars; i++) {
        stars.push({
            x: Math.random() * width,
            y: Math.random() * height,
            radius: Math.random() * 2.2 + 0.5,
            colorPrefix: colors[Math.floor(Math.random() * colors.length)],
            alpha: Math.random(),
            speed: Math.random() * 0.015 + 0.005,
            velocityY: -(Math.random() * 0.2 + 0.05), // gentle upward float
            direction: Math.random() > 0.5 ? 1 : -1,
            isSparkle: Math.random() > 0.55
        });
    }

    function drawStar(star) {
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fillStyle = star.colorPrefix + star.alpha + ')';
        ctx.shadowBlur = star.radius * 5;
        ctx.shadowColor = 'rgba(255, 105, 180, 0.85)';
        ctx.fill();

        // Cross shimmer flare for special sparkles
        if (star.isSparkle && star.alpha > 0.4) {
            ctx.save();
            ctx.strokeStyle = star.colorPrefix + (star.alpha * 0.75) + ')';
            ctx.lineWidth = 0.8;
            const len = star.radius * 3.8;

            ctx.beginPath();
            ctx.moveTo(star.x - len, star.y);
            ctx.lineTo(star.x + len, star.y);
            ctx.moveTo(star.x, star.y - len);
            ctx.lineTo(star.x, star.y + len);
            ctx.stroke();
            ctx.restore();
        }
    }

    function animate() {
        ctx.clearRect(0, 0, width, height);

        stars.forEach(star => {
            star.alpha += star.speed * star.direction;
            star.y += star.velocityY;

            if (star.y < 0) {
                star.y = height;
                star.x = Math.random() * width;
            }

            if (star.alpha >= 1) {
                star.alpha = 1;
                star.direction = -1;
            } else if (star.alpha <= 0.05) {
                star.alpha = 0.05;
                star.direction = 1;
                star.x = Math.random() * width;
            }
            drawStar(star);
        });

        requestAnimationFrame(animate);
    }

    animate();
}

/* --------------------------------------------------------------------------
   2. Unicorn Cursor Follower (Linear Interpolation LERP & Trail Particles)
   -------------------------------------------------------------------------- */
function initUnicornFollower() {
    const unicorn = document.getElementById('unicornFollower');

    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 3;
    let currentX = targetX;
    let currentY = targetY;

    // Trail particles array
    const trailParticles = [];

    window.addEventListener('mousemove', (e) => {
        targetX = e.clientX;
        targetY = e.clientY;
        createTrailParticle(e.clientX, e.clientY);
    });

    window.addEventListener('touchmove', (e) => {
        if (e.touches.length > 0) {
            targetX = e.touches[0].clientX;
            targetY = e.touches[0].clientY;
            createTrailParticle(e.touches[0].clientX, e.touches[0].clientY);
        }
    });

    function createTrailParticle(x, y) {
        if (Math.random() > 0.4) return; // limit frequency

        const particle = document.createElement('div');
        particle.className = 'click-heart';
        const symbols = ['✨', '💖', '⭐', '🌸', '💕'];
        particle.textContent = symbols[Math.floor(Math.random() * symbols.length)];

        // Offset slightly
        const offsetX = (Math.random() - 0.5) * 30;
        const offsetY = (Math.random() - 0.5) * 30;

        particle.style.left = (x + offsetX) + 'px';
        particle.style.top = (y + offsetY) + 'px';
        particle.style.fontSize = (Math.random() * 12 + 10) + 'px';

        document.body.appendChild(particle);

        setTimeout(() => {
            particle.remove();
        }, 1200);
    }

    function renderUnicorn() {
        // Smooth linear interpolation (LERP)
        currentX += (targetX - currentX) * 0.08;
        currentY += (targetY - currentY) * 0.08;

        // Calculate slight rotation based on direction
        const deltaX = targetX - currentX;
        const tilt = Math.max(-15, Math.min(15, deltaX * 0.15));

        // Offset unicorn so cursor point aligns nicely near the horn/head
        const posX = currentX - 60;
        const posY = currentY - 60;

        unicorn.style.transform = `translate3d(${posX}px, ${posY}px, 0) rotate(${tilt}deg)`;

        requestAnimationFrame(renderUnicorn);
    }

    renderUnicorn();
}

/* --------------------------------------------------------------------------
   3. Click Sparkle / Heart Burst Effect
   -------------------------------------------------------------------------- */
function initClickSparkleEffects() {
    window.addEventListener('click', (e) => {
        const count = 8;
        const symbols = ['💖', '✨', '🌸', '💕', '⭐'];

        for (let i = 0; i < count; i++) {
            const burst = document.createElement('div');
            burst.className = 'click-heart';
            burst.textContent = symbols[Math.floor(Math.random() * symbols.length)];

            const angle = (i / count) * Math.PI * 2;
            const distance = Math.random() * 60 + 20;
            const x = e.clientX + Math.cos(angle) * distance;
            const y = e.clientY + Math.sin(angle) * distance;

            burst.style.left = e.clientX + 'px';
            burst.style.top = e.clientY + 'px';
            burst.style.fontSize = (Math.random() * 16 + 14) + 'px';

            document.body.appendChild(burst);

            // Animate outwards
            setTimeout(() => {
                burst.style.transform = `translate(${Math.cos(angle) * distance}px, ${Math.sin(angle) * distance - 40}px) scale(1.2)`;
                burst.style.opacity = '0';
            }, 20);

            setTimeout(() => burst.remove(), 1200);
        }
    });
}

/* --------------------------------------------------------------------------
   4. Ambient Music / Sound Synth Controller (Web Audio API)
   -------------------------------------------------------------------------- */
function initAudioController() {
    const musicBtn = document.getElementById('musicToggleBtn');
    const musicText = document.getElementById('musicText');
    const musicIcon = document.getElementById('musicIcon');

    let audioCtx = null;
    let isPlaying = false;
    let intervalId = null;

    // Gentle romantic melody notes (Pentatonic F Major / D Minor dream scale)
    const notes = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25];

    function playDreamyNote() {
        if (!audioCtx) return;

        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        // Select soft random frequency
        const freq = notes[Math.floor(Math.random() * notes.length)];
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

        // Soft envelope
        gain.gain.setValueAtTime(0, audioCtx.currentTime);
        gain.gain.linearRampToValueAtTime(0.08, audioCtx.currentTime + 0.3);
        gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 2.5);

        osc.connect(gain);
        gain.connect(audioCtx.destination);

        osc.start();
        osc.stop(audioCtx.currentTime + 2.6);
    }

    musicBtn.addEventListener('click', () => {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }

        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }

        if (!isPlaying) {
            isPlaying = true;
            musicText.textContent = 'در حال پخش طنین جادویی...';
            musicIcon.textContent = '🎶';
            playDreamyNote();
            intervalId = setInterval(playDreamyNote, 800);
        } else {
            isPlaying = false;
            musicText.textContent = 'طنین جادویی رویایی';
            musicIcon.textContent = '🎵';
            clearInterval(intervalId);
        }
    });
}
