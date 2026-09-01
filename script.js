/* ==========================================================================
   Celestial Soft-Pink Theme Engine & Interactive Dynamics
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    initStarfieldCanvas();
    initUnicornFollower();
    initClickSparkleEffects();
    initAudioController();
    initUnicornMiniGame();
});

// Global Unicorn Position for Mini-Game Collision Detection
let unicornGlobalPos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };

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

        unicornGlobalPos.x = currentX;
        unicornGlobalPos.y = currentY;

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

/* --------------------------------------------------------------------------
   5. Unicorn Interactive Mini-Game Engine
   -------------------------------------------------------------------------- */
function initUnicornMiniGame() {
    const gameCanvas = document.getElementById('gameCanvas');
    if (!gameCanvas) return;
    const ctx = gameCanvas.getContext('2d');

    const scoreDisplay = document.getElementById('scoreDisplay');
    const highScoreDisplay = document.getElementById('highScoreDisplay');
    const startBtn = document.getElementById('startGameBtn');
    const gameBtnText = document.getElementById('gameBtnText');
    const loveToast = document.getElementById('loveToast');
    const toastMessage = document.getElementById('toastMessage');

    let isGameRunning = false;
    let score = 0;
    let highScore = localStorage.getItem('shadi_unicorn_highscore') || 0;
    if (highScoreDisplay) highScoreDisplay.textContent = highScore;

    let items = [];
    let particles = [];
    let popups = [];

    const itemTypes = [
        { symbol: '💖', points: 100, color: '#ec4899', radius: 22, rarity: 0.4 },
        { symbol: '⭐', points: 150, color: '#f59e0b', radius: 20, rarity: 0.3 },
        { symbol: '💎', points: 250, color: '#a855f7', radius: 24, rarity: 0.15 },
        { symbol: '🧁', points: 200, color: '#f43f5e', radius: 22, rarity: 0.15 }
    ];

    const loveMessages = [
        "شادی جان، تو زیباترین رویای منی! 💕",
        "با هر لبخندت جهان من روشن‌تر میشه! ✨",
        "تک‌شاخ جادویی هم تورو خیلی دوست داره! 🦄",
        "هر ستاره، نشانه‌ای از عشق بی‌کران من به توست! 🌟",
        "تو فرشتهٔ مهربون دنیای منی شادی! 💖",
        "بی‌نهایت دوست دارم شادی عزیزم! ❤️"
    ];

    function resizeCanvas() {
        const rect = gameCanvas.parentElement.getBoundingClientRect();
        gameCanvas.width = rect.width;
        gameCanvas.height = rect.height;
    }

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    function spawnItem() {
        if (!isGameRunning) return;

        const rand = Math.random();
        let cumulative = 0;
        let selected = itemTypes[0];

        for (const type of itemTypes) {
            cumulative += type.rarity;
            if (rand <= cumulative) {
                selected = type;
                break;
            }
        }

        items.push({
            x: Math.random() * (gameCanvas.width - 60) + 30,
            y: -30,
            speedY: Math.random() * 2.2 + 1.8,
            speedX: Math.sin(Math.random() * Math.PI * 2) * 0.8,
            symbol: selected.symbol,
            points: selected.points,
            color: selected.color,
            radius: selected.radius,
            rotation: 0,
            rotSpeed: (Math.random() - 0.5) * 0.05
        });
    }

    function createCollectBurst(x, y, color) {
        for (let i = 0; i < 12; i++) {
            const angle = (i / 12) * Math.PI * 2;
            const speed = Math.random() * 4 + 2;
            particles.push({
                x, y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                radius: Math.random() * 4 + 2,
                color,
                alpha: 1,
                life: 1
            });
        }
    }

    function showPopupText(text, x, y, color) {
        popups.push({
            text, x, y,
            color,
            alpha: 1,
            vy: -1.5
        });
    }

    function triggerLoveToast() {
        if (!loveToast || !toastMessage) return;
        const msg = loveMessages[Math.floor(Math.random() * loveMessages.length)];
        toastMessage.textContent = msg;
        loveToast.classList.remove('hidden');

        setTimeout(() => {
            loveToast.classList.add('hidden');
        }, 3200);
    }

    function checkCollision(item) {
        const rect = gameCanvas.getBoundingClientRect();
        const unicornCanvasX = unicornGlobalPos.x - rect.left;
        const unicornCanvasY = unicornGlobalPos.y - rect.top;

        const dist = Math.hypot(item.x - unicornCanvasX, item.y - unicornCanvasY);
        return dist < (item.radius + 38);
    }

    function gameLoop() {
        ctx.clearRect(0, 0, gameCanvas.width, gameCanvas.height);

        // Draw items
        for (let i = items.length - 1; i >= 0; i--) {
            const item = items[i];
            item.y += item.speedY;
            item.x += item.speedX;
            item.rotation += item.rotSpeed;

            // Draw item glow
            ctx.save();
            ctx.shadowBlur = 12;
            ctx.shadowColor = item.color;
            ctx.font = `${item.radius * 1.6}px sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(item.symbol, item.x, item.y);
            ctx.restore();

            // Collision Check
            if (checkCollision(item)) {
                score += item.points;
                if (scoreDisplay) scoreDisplay.textContent = score;

                if (score > highScore) {
                    highScore = score;
                    localStorage.setItem('shadi_unicorn_highscore', highScore);
                    if (highScoreDisplay) highScoreDisplay.textContent = highScore;
                }

                createCollectBurst(item.x, item.y, item.color);
                showPopupText(`+${item.points}`, item.x, item.y - 10, item.color);

                if (score % 500 === 0 || Math.random() < 0.2) {
                    triggerLoveToast();
                }

                items.splice(i, 1);
                continue;
            }

            if (item.y > gameCanvas.height + 40) {
                items.splice(i, 1);
            }
        }

        // Draw particles
        for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.alpha -= 0.03;

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.globalAlpha = Math.max(0, p.alpha);
            ctx.fill();
            ctx.globalAlpha = 1;

            if (p.alpha <= 0) {
                particles.splice(i, 1);
            }
        }

        // Draw popup text
        for (let i = popups.length - 1; i >= 0; i--) {
            const pop = popups[i];
            pop.y += pop.vy;
            pop.alpha -= 0.025;

            ctx.save();
            ctx.font = 'bold 18px Vazirmatn, sans-serif';
            ctx.fillStyle = pop.color;
            ctx.globalAlpha = Math.max(0, pop.alpha);
            ctx.fillText(pop.text, pop.x, pop.y);
            ctx.restore();

            if (pop.alpha <= 0) {
                popups.splice(i, 1);
            }
        }

        if (isGameRunning) {
            requestAnimationFrame(gameLoop);
        }
    }

    let spawnInterval = null;

    if (startBtn) {
        startBtn.addEventListener('click', () => {
            if (!isGameRunning) {
                isGameRunning = true;
                score = 0;
                if (scoreDisplay) scoreDisplay.textContent = '0';
                items = [];
                particles = [];
                popups = [];
                if (gameBtnText) gameBtnText.textContent = 'بازی در حال اجراست... ✨';
                startBtn.style.opacity = '0.85';

                spawnInterval = setInterval(spawnItem, 550);
                gameLoop();
                triggerLoveToast();
            } else {
                isGameRunning = false;
                clearInterval(spawnInterval);
                if (gameBtnText) gameBtnText.textContent = 'شروع مجدد بازی';
                startBtn.style.opacity = '1';
            }
        });
    }
}
