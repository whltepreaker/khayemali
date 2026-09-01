/**
 * ==========================================================================
 * ✨ SHADI & THE CELESTIAL UNICORN - DYNAMIC SCRIPT & INTERACTION ENGINE ✨
 * ==========================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
    // --- Initialize Starfield & Shooting Stars Canvas ---
    initStarfieldCanvas();

    // --- Initialize Unicorn Cursor Follower with Spring/LERP Physics ---
    initUnicornFollower();

    // --- Initialize Secret Love Cards ---
    initLoveCards();

    // --- Initialize Heart Burst Interactive Effects ---
    initHeartBurstEffects();

    // --- Initialize Web Audio Ambient Sound Generator ---
    initAudioSynthesizer();
});

/* ==========================================================================
   1. STARFIELD & SHOOTING STARS CANVAS ENGINE
   ========================================================================== */
function initStarfieldCanvas() {
    const canvas = document.getElementById('starfieldCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    window.addEventListener('resize', () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
        createStars();
    });

    const numStars = Math.floor((width * height) / 3000);
    const stars = [];
    const shootingStars = [];

    const starColors = ['#ffffff', '#ffb3c6', '#ffd43b', '#f7aef8', '#eebefa'];

    function createStars() {
        stars.length = 0;
        for (let i = 0; i < numStars; i++) {
            stars.push({
                x: Math.random() * width,
                y: Math.random() * height,
                radius: Math.random() * 1.6 + 0.3,
                color: starColors[Math.floor(Math.random() * starColors.length)],
                alpha: Math.random(),
                speed: Math.random() * 0.02 + 0.005,
                twinkleDirection: Math.random() > 0.5 ? 1 : -1
            });
        }
    }

    function spawnShootingStar() {
        if (shootingStars.length < 3 && Math.random() < 0.03) {
            const startX = Math.random() * width * 0.8;
            const startY = Math.random() * height * 0.5;
            const length = Math.random() * 80 + 100;
            const angle = (Math.PI / 180) * (Math.random() * 15 + 30); // 30-45 deg

            shootingStars.push({
                x: startX,
                y: startY,
                length: length,
                speed: Math.random() * 6 + 8,
                angle: angle,
                dx: Math.cos(angle),
                dy: Math.sin(angle),
                life: 1,
                decay: Math.random() * 0.015 + 0.015,
                thickness: Math.random() * 1.5 + 1
            });
        }
    }

    createStars();

    function animateCanvas() {
        ctx.clearRect(0, 0, width, height);

        // --- Render Twinkling Stars ---
        for (let i = 0; i < stars.length; i++) {
            const s = stars[i];
            s.alpha += s.speed * s.twinkleDirection;
            if (s.alpha >= 1) {
                s.alpha = 1;
                s.twinkleDirection = -1;
            } else if (s.alpha <= 0.1) {
                s.alpha = 0.1;
                s.twinkleDirection = 1;
            }

            ctx.save();
            ctx.globalAlpha = s.alpha;
            ctx.fillStyle = s.color;
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
            ctx.fill();

            // Glow for larger stars
            if (s.radius > 1.2) {
                ctx.shadowBlur = 8;
                ctx.shadowColor = s.color;
                ctx.fill();
            }
            ctx.restore();
        }

        // --- Render Shooting Stars ---
        spawnShootingStar();
        for (let i = shootingStars.length - 1; i >= 0; i--) {
            const ss = shootingStars[i];
            ss.x += ss.dx * ss.speed;
            ss.y += ss.dy * ss.speed;
            ss.life -= ss.decay;

            if (ss.life <= 0 || ss.x > width || ss.y > height) {
                shootingStars.splice(i, 1);
                continue;
            }

            ctx.save();
            ctx.globalAlpha = ss.life;
            const tailX = ss.x - ss.dx * ss.length;
            const tailY = ss.y - ss.dy * ss.length;

            const grad = ctx.createLinearGradient(ss.x, ss.y, tailX, tailY);
            grad.addColorStop(0, '#ffffff');
            grad.addColorStop(0.3, '#ffb3c6');
            grad.addColorStop(1, 'rgba(255, 179, 198, 0)');

            ctx.strokeStyle = grad;
            ctx.lineWidth = ss.thickness;
            ctx.lineCap = 'round';

            ctx.beginPath();
            ctx.moveTo(ss.x, ss.y);
            ctx.lineTo(tailX, tailY);
            ctx.stroke();
            ctx.restore();
        }

        requestAnimationFrame(animateCanvas);
    }

    animateCanvas();
}

/* ==========================================================================
   2. UNICORN CURSOR FOLLOWER WITH LERP PHYSICS & TRAIL SPARKLES
   ========================================================================== */
function initUnicornFollower() {
    const follower = document.getElementById('unicornFollower');
    if (!follower) return;

    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 2;
    let currentX = targetX;
    let currentY = targetY;

    let lastSparkleTime = 0;

    // Track mouse / touch position
    window.addEventListener('mousemove', (e) => {
        targetX = e.clientX;
        targetY = e.clientY;
    });

    window.addEventListener('touchmove', (e) => {
        if (e.touches.length > 0) {
            targetX = e.touches[0].clientX;
            targetY = e.touches[0].clientY;
        }
    }, { passive: true });

    function updateFollower() {
        // Linear Interpolation (LERP) for smooth, floaty physics
        const ease = 0.08;
        const dx = targetX - currentX;
        const dy = targetY - currentY;

        currentX += dx * ease;
        currentY += dy * ease;

        // Dynamic tilt based on movement direction
        const tilt = Math.max(-15, Math.min(15, dx * 0.15));

        follower.style.transform = `translate3d(${currentX}px, ${currentY}px, 0) rotate(${tilt}deg)`;

        // Emit sparkling trail particles if moving
        const distMoved = Math.hypot(dx, dy);
        const now = Date.now();
        if (distMoved > 2 && now - lastSparkleTime > 60) {
            spawnTrailParticle(currentX, currentY);
            lastSparkleTime = now;
        }

        requestAnimationFrame(updateFollower);
    }

    requestAnimationFrame(updateFollower);
}

function spawnTrailParticle(x, y) {
    const particle = document.createElement('div');
    particle.className = 'trail-particle';

    const symbols = ['✦', '✨', '💖', '⭐', '🌸'];
    const symbol = symbols[Math.floor(Math.random() * symbols.length)];

    particle.textContent = symbol;
    particle.style.left = `${x}px`;
    particle.style.top = `${y}px`;
    particle.style.fontSize = `${Math.random() * 14 + 10}px`;

    const colors = ['#ff8787', '#f783ac', '#da77f2', '#ffd43b', '#ffffff'];
    particle.style.color = colors[Math.floor(Math.random() * colors.length)];

    // Random spread direction
    const angle = Math.random() * Math.PI * 2;
    const distance = Math.random() * 30 + 15;
    const dx = Math.cos(angle) * distance;
    const dy = Math.sin(angle) * distance;

    particle.style.setProperty('--dx', `${dx}px`);
    particle.style.setProperty('--dy', `${dy}px`);

    document.body.appendChild(particle);

    setTimeout(() => {
        if (particle.parentNode) {
            particle.parentNode.removeChild(particle);
        }
    }, 900);
}

/* ==========================================================================
   3. INTERACTIVE SECRET LOVE CARDS
   ========================================================================== */
function initLoveCards() {
    const cards = document.querySelectorAll('.love-card');
    cards.forEach((card) => {
        card.addEventListener('click', () => {
            card.classList.toggle('flipped');

            // Sparkle burst on flip
            const rect = card.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            triggerHeartBurst(centerX, centerY, 8);
        });
    });
}

/* ==========================================================================
   4. HEART BURST EFFECTS
   ========================================================================== */
function initHeartBurstEffects() {
    const burstBtn = document.getElementById('heartBurstBtn');
    const mainHeart = document.getElementById('mainHeart');

    if (burstBtn) {
        burstBtn.addEventListener('click', (e) => {
            const rect = burstBtn.getBoundingClientRect();
            const x = rect.left + rect.width / 2;
            const y = rect.top + rect.height / 2;
            triggerHeartBurst(x, y, 35);
        });
    }

    if (mainHeart) {
        mainHeart.addEventListener('click', (e) => {
            const rect = mainHeart.getBoundingClientRect();
            const x = rect.left + rect.width / 2;
            const y = rect.top + rect.height / 2;
            triggerHeartBurst(x, y, 25);
        });
    }

    // Also burst on clicking anywhere on background
    window.addEventListener('click', (e) => {
        // Don't duplicate if button or card clicked
        if (e.target.closest('.magic-btn') || e.target.closest('.love-card') || e.target.closest('.audio-btn')) return;
        triggerHeartBurst(e.clientX, e.clientY, 12);
    });
}

function triggerHeartBurst(x, y, count = 20) {
    const heartTypes = ['💖', '💕', '💗', '✨', '🌸', '❤️'];

    for (let i = 0; i < count; i++) {
        const heart = document.createElement('div');
        heart.className = 'trail-particle';
        heart.textContent = heartTypes[Math.floor(Math.random() * heartTypes.length)];
        heart.style.left = `${x}px`;
        heart.style.top = `${y}px`;
        heart.style.fontSize = `${Math.random() * 20 + 16}px`;

        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 120 + 50;
        const dx = Math.cos(angle) * speed;
        const dy = Math.sin(angle) * speed;

        heart.style.setProperty('--dx', `${dx}px`);
        heart.style.setProperty('--dy', `${dy}px`);

        document.body.appendChild(heart);

        setTimeout(() => {
            if (heart.parentNode) {
                heart.parentNode.removeChild(heart);
            }
        }, 900);
    }
}

/* ==========================================================================
   5. AMBIENT WEB AUDIO SYNTHESIZER
   ========================================================================== */
function initAudioSynthesizer() {
    const btn = document.getElementById('musicToggleBtn');
    if (!btn) return;

    let audioCtx = null;
    let isPlaying = false;
    let timerId = null;

    btn.addEventListener('click', () => {
        if (!isPlaying) {
            startSynthesizer();
            btn.classList.add('playing');
            btn.querySelector('.audio-text').textContent = 'توقف طنین';
            isPlaying = true;
        } else {
            stopSynthesizer();
            btn.classList.remove('playing');
            btn.querySelector('.audio-text').textContent = 'طنین رویایی';
            isPlaying = false;
        }
    });

    function startSynthesizer() {
        if (!audioCtx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            audioCtx = new AudioContext();
        }

        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }

        // Dreamy pentatonic chord frequencies (C major / A minor celestial notes)
        const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50];

        function playCelestialNote() {
            if (!isPlaying) return;

            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();

            const freq = notes[Math.floor(Math.random() * notes.length)];
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

            // Soft envelope
            gain.gain.setValueAtTime(0.001, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.12, audioCtx.currentTime + 0.8);
            gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 3.5);

            osc.connect(gain);
            gain.connect(audioCtx.destination);

            osc.start();
            osc.stop(audioCtx.currentTime + 3.6);

            // Schedule next note
            const nextTime = Math.random() * 800 + 400;
            timerId = setTimeout(playCelestialNote, nextTime);
        }

        playCelestialNote();
    }

    function stopSynthesizer() {
        if (timerId) clearTimeout(timerId);
        if (audioCtx && audioCtx.state === 'running') {
            audioCtx.suspend();
        }
    }
}
