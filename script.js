/* ==========================================================================
   Celestial Soft-Pink Theme Engine & Interactive Dynamics
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    initStarfieldCanvas();
    initUnicornFollower();
    initClickSparkleEffects();
    initAudioController();
    initScrollAnimations();
});

/* --------------------------------------------------------------------------
   Scroll-Driven Reveal Animations (IntersectionObserver)
   -------------------------------------------------------------------------- */
function initScrollAnimations() {
    const cards = document.querySelectorAll('.story-card');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, {
        threshold: 0.12
    });

    cards.forEach(card => observer.observe(card));
}

/* --------------------------------------------------------------------------
   1. Multi-Layered Starfield Canvas & Shooting Star Particle Engine
   -------------------------------------------------------------------------- */
function initStarfieldCanvas() {
    const canvas = document.getElementById('starfieldCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    window.addEventListener('resize', () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    });

    const numStars = 190;
    const stars = [];
    const meteors = [];

    const colors = [
        'rgba(255, 255, 255, ',
        'rgba(251, 191, 36, ',  // Amber/Gold
        'rgba(255, 182, 193, ', // Light Rose
        'rgba(244, 114, 182, ', // Pink Accent
        'rgba(216, 180, 254, '  // Soft Violet
    ];

    for (let i = 0; i < numStars; i++) {
        stars.push({
            x: Math.random() * width,
            y: Math.random() * height,
            radius: Math.random() * 2.2 + 0.4,
            colorPrefix: colors[Math.floor(Math.random() * colors.length)],
            alpha: Math.random(),
            speed: Math.random() * 0.016 + 0.004,
            velocityY: -(Math.random() * 0.22 + 0.04),
            direction: Math.random() > 0.5 ? 1 : -1,
            isSparkle: Math.random() > 0.45,
            flareAngle: Math.random() * Math.PI
        });
    }

    function createMeteor() {
        if (meteors.length >= 2 || Math.random() > 0.015) return;
        meteors.push({
            x: Math.random() * width * 0.8 + width * 0.1,
            y: Math.random() * height * 0.3,
            length: Math.random() * 90 + 50,
            speed: Math.random() * 5.5 + 3.5,
            angle: Math.PI / 4 + (Math.random() - 0.5) * 0.2,
            alpha: 1,
            life: 0
        });
    }

    function drawStar(star) {
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fillStyle = star.colorPrefix + star.alpha + ')';
        ctx.shadowBlur = star.radius * 5;
        ctx.shadowColor = 'rgba(244, 114, 182, 0.8)';
        ctx.fill();

        if (star.isSparkle && star.alpha > 0.4) {
            ctx.save();
            ctx.strokeStyle = star.colorPrefix + (star.alpha * 0.8) + ')';
            ctx.lineWidth = 0.9;
            const len = star.radius * 4;

            ctx.translate(star.x, star.y);
            ctx.rotate(star.flareAngle);

            ctx.beginPath();
            ctx.moveTo(-len, 0);
            ctx.lineTo(len, 0);
            ctx.moveTo(0, -len);
            ctx.lineTo(0, len);
            ctx.stroke();
            ctx.restore();
        }
    }

    function drawMeteors() {
        for (let i = meteors.length - 1; i >= 0; i--) {
            const m = meteors[i];
            const endX = m.x - Math.cos(m.angle) * m.length;
            const endY = m.y - Math.sin(m.angle) * m.length;

            const grad = ctx.createLinearGradient(m.x, m.y, endX, endY);
            grad.addColorStop(0, 'rgba(255, 255, 255, ' + m.alpha + ')');
            grad.addColorStop(0.3, 'rgba(255, 182, 193, ' + (m.alpha * 0.6) + ')');
            grad.addColorStop(1, 'rgba(255, 255, 255, 0)');

            ctx.beginPath();
            ctx.moveTo(m.x, m.y);
            ctx.lineTo(endX, endY);
            ctx.strokeStyle = grad;
            ctx.lineWidth = 2.2;
            ctx.stroke();

            m.x += Math.cos(m.angle) * m.speed;
            m.y += Math.sin(m.angle) * m.speed;
            m.alpha -= 0.012;

            if (m.alpha <= 0 || m.x > width || m.y > height) {
                meteors.splice(i, 1);
            }
        }
    }

    function animate() {
        ctx.clearRect(0, 0, width, height);

        stars.forEach(star => {
            star.alpha += star.speed * star.direction;
            star.y += star.velocityY;
            star.flareAngle += 0.004;

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

        createMeteor();
        drawMeteors();

        requestAnimationFrame(animate);
    }

    animate();
}

/* --------------------------------------------------------------------------
   2. Unicorn Cursor Follower (Linear Interpolation LERP & Trail Particles)
   -------------------------------------------------------------------------- */
function initUnicornFollower() {
    const unicorn = document.getElementById('unicornFollower');
    if (!unicorn) return;

    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 3;
    let currentX = targetX;
    let currentY = targetY;

    let velX = 0;
    let velY = 0;
    let wingFlap = 0;

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
        if (Math.random() > 0.38) return;

        const particle = document.createElement('div');
        particle.className = 'click-heart';
        particle.textContent = '✦';

        const offsetX = (Math.random() - 0.5) * 35;
        const offsetY = (Math.random() - 0.5) * 35;

        particle.style.left = (x + offsetX) + 'px';
        particle.style.top = (y + offsetY) + 'px';
        particle.style.fontSize = (Math.random() * 12 + 8) + 'px';
        particle.style.color = Math.random() > 0.5 ? '#f472b6' : '#ffffff';
        particle.style.pointerEvents = 'none';

        document.body.appendChild(particle);

        setTimeout(() => {
            particle.remove();
        }, 1000);
    }

    function renderUnicorn() {
        const prevX = currentX;
        const prevY = currentY;

        currentX += (targetX - currentX) * 0.075;
        currentY += (targetY - currentY) * 0.075;

        velX = currentX - prevX;
        velY = currentY - prevY;

        const speed = Math.sqrt(velX * velX + velY * velY);

        const tilt = Math.max(-20, Math.min(20, velX * 1.8));
        const scale = 1 + Math.min(0.14, speed * 0.01);

        wingFlap += 0.08 + Math.min(0.2, speed * 0.02);
        const wingScaleY = 0.85 + Math.sin(wingFlap) * 0.25;

        const wingFront = unicorn.querySelector('.wing-front');
        const wingBack = unicorn.querySelector('.wing-back');
        if (wingFront && wingBack) {
            wingFront.style.transformOrigin = '115px 90px';
            wingBack.style.transformOrigin = '105px 95px';
            wingFront.style.transform = `scaleY(${wingScaleY})`;
            wingBack.style.transform = `scaleY(${0.9 + Math.cos(wingFlap) * 0.2})`;
        }

        const posX = currentX - 65;
        const posY = currentY - 65;

        unicorn.style.transform = `translate3d(${posX}px, ${posY}px, 0) rotate(${tilt}deg) scale(${scale})`;

        requestAnimationFrame(renderUnicorn);
    }

    renderUnicorn();
}

/* --------------------------------------------------------------------------
   3. Click Celestial Sparkle Burst Effect
   -------------------------------------------------------------------------- */
function initClickSparkleEffects() {
    window.addEventListener('click', (e) => {
        const count = 7;
        const symbols = ['✦', '✧', '⋆', '✨'];

        for (let i = 0; i < count; i++) {
            const burst = document.createElement('div');
            burst.className = 'click-heart';
            burst.textContent = symbols[Math.floor(Math.random() * symbols.length)];
            burst.style.color = Math.random() > 0.5 ? '#be185d' : '#f472b6';

            const angle = (i / count) * Math.PI * 2;
            const distance = Math.random() * 55 + 20;

            burst.style.left = e.clientX + 'px';
            burst.style.top = e.clientY + 'px';
            burst.style.fontSize = (Math.random() * 14 + 10) + 'px';

            document.body.appendChild(burst);

            setTimeout(() => {
                burst.style.transform = `translate(${Math.cos(angle) * distance}px, ${Math.sin(angle) * distance - 30}px) scale(1.1)`;
                burst.style.opacity = '0';
            }, 20);

            setTimeout(() => burst.remove(), 1100);
        }
    });
}

/* --------------------------------------------------------------------------
   4. Ambient Music / Sound Synth Controller (Web Audio API)
   -------------------------------------------------------------------------- */
function initAudioController() {
    const musicBtn = document.getElementById('musicToggleBtn');
    const musicText = document.getElementById('musicText');

    let audioCtx = null;
    let isPlaying = false;

    // Gentle romantic melody notes (Pentatonic F Major / D Minor dream scale)
    const notes = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25];

    function playDreamyNote() {
        if (!audioCtx) return;

        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        const freq = notes[Math.floor(Math.random() * notes.length)];
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

        gain.gain.setValueAtTime(0, audioCtx.currentTime);
        gain.gain.linearRampToValueAtTime(0.07, audioCtx.currentTime + 0.35);
        gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 2.6);

        osc.connect(gain);
        gain.connect(audioCtx.destination);

        osc.start();
        osc.stop(audioCtx.currentTime + 2.7);
    }

    if (musicBtn) {
        musicBtn.addEventListener('click', () => {
            if (!audioCtx) {
                audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            }

            if (audioCtx.state === 'suspended') {
                audioCtx.resume();
            }

            if (!isPlaying) {
                isPlaying = true;
                if (musicText) musicText.textContent = 'در حال پخش طنین جادویی...';
                playDreamyNote();
                setInterval(playDreamyNote, 850);
            } else {
                isPlaying = false;
                if (musicText) musicText.textContent = 'طنین جادویی رویایی';
            }
        });
    }
}
