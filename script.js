/* ========================================================
   SHADI CELESTIAL SOFT-PINK REALTIME COLLABORATIVE PAINT APP
   ======================================================== */

document.addEventListener('DOMContentLoaded', () => {

    /* ----------------------------------------------------
       1. STARFIELD CANVAS BACKDROP
       ---------------------------------------------------- */
    const starfieldCanvas = document.getElementById('starfieldCanvas');
    const starCtx = starfieldCanvas.getContext('2d');

    let stars = [];
    let shootingStars = [];
    const numStars = 140;

    function resizeStarfield() {
        starfieldCanvas.width = window.innerWidth;
        starfieldCanvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resizeStarfield);
    resizeStarfield();

    class Star {
        constructor() {
            this.reset();
        }
        reset() {
            this.x = Math.random() * starfieldCanvas.width;
            this.y = Math.random() * starfieldCanvas.height;
            this.size = Math.random() * 2 + 0.5;
            this.baseAlpha = Math.random() * 0.7 + 0.3;
            this.alpha = this.baseAlpha;
            this.twinkleSpeed = Math.random() * 0.03 + 0.005;
            this.color = ['#ffffff', '#fcc2d7', '#ff7597', '#ffd700', '#da77f2'][Math.floor(Math.random() * 5)];
        }
        update() {
            this.alpha += this.twinkleSpeed;
            if (this.alpha > 1 || this.alpha < 0.2) {
                this.twinkleSpeed = -this.twinkleSpeed;
            }
        }
        draw() {
            starCtx.save();
            starCtx.globalAlpha = Math.max(0.1, Math.min(1, this.alpha));
            starCtx.fillStyle = this.color;
            starCtx.shadowBlur = this.size * 4;
            starCtx.shadowColor = this.color;
            starCtx.beginPath();
            starCtx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            starCtx.fill();
            starCtx.restore();
        }
    }

    class ShootingStar {
        constructor() {
            this.reset();
        }
        reset() {
            this.x = Math.random() * starfieldCanvas.width * 0.8;
            this.y = Math.random() * (starfieldCanvas.height * 0.4);
            this.length = Math.random() * 80 + 40;
            this.speed = Math.random() * 8 + 6;
            this.angle = Math.PI / 4;
            this.opacity = 1;
            this.active = true;
        }
        update() {
            this.x += Math.cos(this.angle) * this.speed;
            this.y += Math.sin(this.angle) * this.speed;
            this.opacity -= 0.015;
            if (this.opacity <= 0 || this.x > starfieldCanvas.width || this.y > starfieldCanvas.height) {
                this.active = false;
            }
        }
        draw() {
            if (!this.active) return;
            starCtx.save();
            starCtx.globalAlpha = this.opacity;
            const grad = starCtx.createLinearGradient(
                this.x, this.y,
                this.x - Math.cos(this.angle) * this.length,
                this.y - Math.sin(this.angle) * this.length
            );
            grad.addColorStop(0, '#ffffff');
            grad.addColorStop(0.5, '#ff7597');
            grad.addColorStop(1, 'transparent');

            starCtx.strokeStyle = grad;
            starCtx.lineWidth = 2;
            starCtx.beginPath();
            starCtx.moveTo(this.x, this.y);
            starCtx.lineTo(
                this.x - Math.cos(this.angle) * this.length,
                this.y - Math.sin(this.angle) * this.length
            );
            starCtx.stroke();
            starCtx.restore();
        }
    }

    for (let i = 0; i < numStars; i++) {
        stars.push(new Star());
    }

    setInterval(() => {
        if (Math.random() < 0.4 && shootingStars.length < 3) {
            shootingStars.push(new ShootingStar());
        }
    }, 2000);

    function animateStarfield() {
        starCtx.clearRect(0, 0, starfieldCanvas.width, starfieldCanvas.height);
        stars.forEach(s => { s.update(); s.draw(); });
        shootingStars = shootingStars.filter(ss => ss.active);
        shootingStars.forEach(ss => { ss.update(); ss.draw(); });
        requestAnimationFrame(animateStarfield);
    }
    animateStarfield();


    /* ----------------------------------------------------
       2. DYNAMIC UNICORN CURSOR FOLLOWER
       ---------------------------------------------------- */
    const unicornFollower = document.getElementById('unicornFollower');
    const trailContainer = document.getElementById('trailSparkles');

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let unicornX = mouseX;
    let unicornY = mouseY;
    let lastUnicornX = unicornX;

    window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        sendCursorPosition(mouseX, mouseY);
    });

    function createSparkle(x, y) {
        if (Math.random() > 0.35) return;
        const sparkle = document.createElement('div');
        sparkle.className = 'sparkle-particle';
        const colors = ['#ffffff', '#ff7597', '#fcc2d7', '#ffd700', '#da77f2'];
        const color = colors[Math.floor(Math.random() * colors.length)];
        const size = Math.random() * 8 + 3;

        sparkle.style.left = `${x + (Math.random() * 20 - 10)}px`;
        sparkle.style.top = `${y + (Math.random() * 20 - 10)}px`;
        sparkle.style.width = `${size}px`;
        sparkle.style.height = `${size}px`;
        sparkle.style.backgroundColor = color;
        sparkle.style.boxShadow = `0 0 8px ${color}`;

        trailContainer.appendChild(sparkle);
        setTimeout(() => sparkle.remove(), 900);
    }

    function animateUnicorn() {
        const ease = 0.12;
        unicornX += (mouseX - unicornX) * ease;
        unicornY += (mouseY - unicornY) * ease;

        const vx = unicornX - lastUnicornX;
        lastUnicornX = unicornX;
        const tilt = Math.max(-25, Math.min(25, vx * 1.5));

        unicornFollower.style.transform = `translate(${unicornX}px, ${unicornY}px) rotate(${tilt}deg)`;

        if (Math.abs(vx) > 0.5) {
            createSparkle(unicornX, unicornY);
        }

        requestAnimationFrame(animateUnicorn);
    }
    animateUnicorn();


    /* ----------------------------------------------------
       3. WEBSOCKET REAL-TIME SYNC & BACKEND CONNECTIVITY
       ---------------------------------------------------- */
    const syncStatusText = document.getElementById('syncStatusText');
    const remoteCursor = document.getElementById('remoteCursor');
    let ws;

    function connectWebSocket() {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${window.location.host}`;
        ws = new WebSocket(wsUrl);

        ws.onopen = () => {
            console.log('[WS] Connected to paint server.');
            syncStatusText.textContent = 'متصل به بوم مشترک ✨ (آماده هم‌زمانی)';
            syncStatusText.style.color = '#51cf66';
        };

        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                if (data.type === 'init') {
                    actionHistory = data.actions || [];
                    redrawAllCanvasActions();
                } else if (data.type === 'draw_action') {
                    actionHistory.push(data.action);
                    renderAction(data.action);
                } else if (data.type === 'clear') {
                    actionHistory = [];
                    clearCanvasLocal();
                } else if (data.type === 'remote_cursor') {
                    updateRemoteCursor(data.x, data.y, data.userName);
                }
            } catch (err) {
                console.error('[WS] Error parsing message:', err);
            }
        };

        ws.onclose = () => {
            syncStatusText.textContent = 'قطع ارتباط - تلاش مجدد...';
            syncStatusText.style.color = '#ff8787';
            setTimeout(connectWebSocket, 3000);
        };
    }

    function broadcastAction(action) {
        if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'draw_action', action }));
        }
    }

    function broadcastClear() {
        if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'clear' }));
        }
    }

    function sendCursorPosition(x, y) {
        if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'cursor_move', x, y, userName: 'همراه شما' }));
        }
    }

    function updateRemoteCursor(x, y, name) {
        remoteCursor.classList.remove('hidden');
        remoteCursor.style.transform = `translate(${x}px, ${y}px)`;
        if (name) {
            document.getElementById('remoteCursorName').textContent = name;
        }
    }

    connectWebSocket();


    /* ----------------------------------------------------
       4. PAINT CANVAS ENGINE & TOOLS
       ---------------------------------------------------- */
    const canvas = document.getElementById('paintCanvas');
    const ctx = canvas.getContext('2d');

    // UI Tools Controls
    const toolBtns = document.querySelectorAll('.tool-btn');
    const colorSwatches = document.querySelectorAll('.color-swatch');
    const customColorPicker = document.getElementById('customColorPicker');
    const brushSizeSlider = document.getElementById('brushSizeSlider');
    const brushSizeVal = document.getElementById('brushSizeVal');
    const clearBtn = document.getElementById('clearBtn');
    const saveBtn = document.getElementById('saveBtn');

    // Text Modal Controls
    const textModal = document.getElementById('textModal');
    const textInput = document.getElementById('textInput');
    const confirmTextBtn = document.getElementById('confirmTextBtn');
    const cancelTextBtn = document.getElementById('cancelTextBtn');
    let pendingTextCoords = null;

    // Active tool state
    let currentTool = 'brush'; // 'brush', 'heart', 'line', 'rect', 'text', 'eraser'
    let currentColor = '#ff7597';
    let currentSize = 5;

    let isDrawing = false;
    let startX = 0;
    let startY = 0;
    let currentStroke = [];
    let actionHistory = [];

    function redrawAllCanvasActions() {
        clearCanvasLocal();
        actionHistory.forEach(act => renderAction(act));
    }

    // Setup Canvas scale & handle resize without erasing artwork
    function fitCanvasResolution() {
        const rect = canvas.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
            canvas.width = rect.width;
            canvas.height = rect.height;
            redrawAllCanvasActions();
        }
    }
    fitCanvasResolution();
    window.addEventListener('resize', fitCanvasResolution);

    // Event Listeners for Tool Selection
    toolBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            toolBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentTool = btn.dataset.tool;
        });
    });

    colorSwatches.forEach(swatch => {
        swatch.addEventListener('click', () => {
            colorSwatches.forEach(s => s.classList.remove('active'));
            swatch.classList.add('active');
            currentColor = swatch.dataset.color;
            customColorPicker.value = currentColor;
        });
    });

    customColorPicker.addEventListener('input', (e) => {
        currentColor = e.target.value;
        colorSwatches.forEach(s => s.classList.remove('active'));
    });

    brushSizeSlider.addEventListener('input', (e) => {
        currentSize = parseInt(e.target.value);
        brushSizeVal.textContent = `${currentSize}px`;
    });

    clearBtn.addEventListener('click', () => {
        if (confirm('آیا از پاک کردن کل بوم اطمینان دارید؟')) {
            actionHistory = [];
            clearCanvasLocal();
            broadcastClear();
        }
    });

    saveBtn.addEventListener('click', () => {
        const link = document.createElement('a');
        link.download = 'shadi-celestial-artwork.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
    });

    // Canvas Pointer Event Helpers
    function getCanvasCoords(e) {
        const rect = canvas.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        return {
            x: clientX - rect.left,
            y: clientY - rect.top
        };
    }

    canvas.addEventListener('pointerdown', (e) => {
        const coords = getCanvasCoords(e);
        startX = coords.x;
        startY = coords.y;

        if (currentTool === 'text') {
            pendingTextCoords = coords;
            textModal.classList.remove('hidden');
            textInput.value = '';
            textInput.focus();
            return;
        }

        if (currentTool === 'heart') {
            const action = {
                tool: 'heart',
                x: coords.x,
                y: coords.y,
                size: currentSize * 6,
                color: currentColor
            };
            actionHistory.push(action);
            renderAction(action);
            broadcastAction(action);
            return;
        }

        isDrawing = true;
        currentStroke = [{ x: coords.x, y: coords.y }];
    });

    canvas.addEventListener('pointermove', (e) => {
        if (!isDrawing) return;
        const coords = getCanvasCoords(e);

        if (currentTool === 'brush' || currentTool === 'eraser') {
            currentStroke.push({ x: coords.x, y: coords.y });

            // Draw segment locally immediately
            ctx.save();
            ctx.beginPath();
            const p1 = currentStroke[currentStroke.length - 2];
            const p2 = currentStroke[currentStroke.length - 1];
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = currentTool === 'eraser' ? '#0d0414' : currentColor;
            ctx.lineWidth = currentSize;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            if (currentTool === 'brush') {
                ctx.shadowBlur = currentSize;
                ctx.shadowColor = currentColor;
            }
            ctx.stroke();
            ctx.restore();
        }
    });

    canvas.addEventListener('pointerup', (e) => {
        if (!isDrawing) return;
        isDrawing = false;
        const coords = getCanvasCoords(e);

        if (currentTool === 'brush' || currentTool === 'eraser') {
            const action = {
                tool: currentTool,
                points: currentStroke,
                color: currentTool === 'eraser' ? '#0d0414' : currentColor,
                size: currentSize
            };
            actionHistory.push(action);
            broadcastAction(action);
        } else if (currentTool === 'line') {
            const action = {
                tool: 'line',
                x1: startX,
                y1: startY,
                x2: coords.x,
                y2: coords.y,
                color: currentColor,
                size: currentSize
            };
            actionHistory.push(action);
            renderAction(action);
            broadcastAction(action);
        } else if (currentTool === 'rect') {
            const action = {
                tool: 'rect',
                x: startX,
                y: startY,
                w: coords.x - startX,
                h: coords.y - startY,
                color: currentColor,
                size: currentSize
            };
            actionHistory.push(action);
            renderAction(action);
            broadcastAction(action);
        }
    });

    // Confirm Text Modal Insertion
    confirmTextBtn.addEventListener('click', () => {
        const text = textInput.value.trim();
        if (text && pendingTextCoords) {
            const action = {
                tool: 'text',
                text: text,
                x: pendingTextCoords.x,
                y: pendingTextCoords.y,
                color: currentColor,
                size: Math.max(16, currentSize * 3)
            };
            actionHistory.push(action);
            renderAction(action);
            broadcastAction(action);
        }
        textModal.classList.add('hidden');
        pendingTextCoords = null;
    });

    cancelTextBtn.addEventListener('click', () => {
        textModal.classList.add('hidden');
        pendingTextCoords = null;
    });

    // Local Canvas Action Renderer
    function renderAction(action) {
        if (!action) return;
        ctx.save();

        if (action.tool === 'brush' || action.tool === 'eraser') {
            if (action.points && action.points.length > 0) {
                ctx.beginPath();
                ctx.moveTo(action.points[0].x, action.points[0].y);
                for (let i = 1; i < action.points.length; i++) {
                    ctx.lineTo(action.points[i].x, action.points[i].y);
                }
                ctx.strokeStyle = action.color;
                ctx.lineWidth = action.size;
                ctx.lineCap = 'round';
                ctx.lineJoin = 'round';
                if (action.tool === 'brush') {
                    ctx.shadowBlur = action.size;
                    ctx.shadowColor = action.color;
                }
                ctx.stroke();
            }
        } else if (action.tool === 'line') {
            ctx.beginPath();
            ctx.moveTo(action.x1, action.y1);
            ctx.lineTo(action.x2, action.y2);
            ctx.strokeStyle = action.color;
            ctx.lineWidth = action.size;
            ctx.lineCap = 'round';
            ctx.shadowBlur = action.size;
            ctx.shadowColor = action.color;
            ctx.stroke();
        } else if (action.tool === 'rect') {
            ctx.beginPath();
            ctx.rect(action.x, action.y, action.w, action.h);
            ctx.strokeStyle = action.color;
            ctx.lineWidth = action.size;
            ctx.shadowBlur = action.size;
            ctx.shadowColor = action.color;
            ctx.stroke();
        } else if (action.tool === 'heart') {
            drawHeartPath(ctx, action.x, action.y, action.size, action.color);
        } else if (action.tool === 'text') {
            ctx.font = `${action.size}px 'Vazirmatn', sans-serif`;
            ctx.fillStyle = action.color;
            ctx.shadowBlur = 10;
            ctx.shadowColor = action.color;
            ctx.fillText(action.text, action.x, action.y);
        }

        ctx.restore();
    }

    function drawHeartPath(c, x, y, size, color) {
        c.save();
        c.beginPath();
        const topCurveHeight = size * 0.3;
        c.moveTo(x, y + topCurveHeight);
        c.bezierCurveTo(x, y, x - size / 2, y, x - size / 2, y + topCurveHeight);
        c.bezierCurveTo(x - size / 2, y + (size + topCurveHeight) / 2, x, y + size, x, y + size);
        c.bezierCurveTo(x, y + size, x + size / 2, y + (size + topCurveHeight) / 2, x + size / 2, y + topCurveHeight);
        c.bezierCurveTo(x + size / 2, y, x, y, x, y + topCurveHeight);
        c.closePath();
        c.fillStyle = color;
        c.shadowBlur = 15;
        c.shadowColor = color;
        c.fill();
        c.restore();
    }

    function clearCanvasLocal() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#0d0414';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    clearCanvasLocal();


    /* ----------------------------------------------------
       5. AUDIO SYNTHESIZER & HEART BURST INTERACTIVITY
       ---------------------------------------------------- */
    const musicBtn = document.getElementById('musicToggleBtn');
    let audioCtx = null;
    let isPlayingAudio = false;
    let audioInterval = null;

    const chords = [
        [261.63, 329.63, 392.00, 523.25], // C Major / Soft synth
        [220.00, 261.63, 329.63, 440.00], // A Minor / Dreamy
        [174.61, 220.00, 261.63, 349.23], // F Major / Warm
        [196.00, 246.94, 293.66, 392.00]  // G Major
    ];

    function playCelestialChord() {
        if (!audioCtx) return;
        const chord = chords[Math.floor(Math.random() * chords.length)];
        chord.forEach((freq, idx) => {
            setTimeout(() => {
                try {
                    const osc = audioCtx.createOscillator();
                    const gain = audioCtx.createGain();
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(freq * 1.5, audioCtx.currentTime);

                    gain.gain.setValueAtTime(0.001, audioCtx.currentTime);
                    gain.gain.exponentialRampToValueAtTime(0.08, audioCtx.currentTime + 1.2);
                    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 4.0);

                    osc.connect(gain);
                    gain.connect(audioCtx.destination);
                    osc.start();
                    osc.stop(audioCtx.currentTime + 4.2);
                } catch (e) {}
            }, idx * 280);
        });
    }

    musicBtn.addEventListener('click', () => {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }

        if (isPlayingAudio) {
            clearInterval(audioInterval);
            isPlayingAudio = false;
            musicBtn.querySelector('.audio-text').textContent = 'طنین رویایی';
            musicBtn.style.background = 'rgba(42, 14, 48, 0.65)';
        } else {
            isPlayingAudio = true;
            playCelestialChord();
            audioInterval = setInterval(playCelestialChord, 4500);
            musicBtn.querySelector('.audio-text').textContent = 'موسیقی در حال پخش... ✨';
            musicBtn.style.background = 'rgba(255, 117, 151, 0.4)';
        }
    });

    // Heart Burst Trigger
    const heartBurstBtn = document.getElementById('heartBurstBtn');
    const mainHeart = document.getElementById('mainHeart');

    function triggerHeartBurst(e) {
        const x = e ? e.clientX : window.innerWidth / 2;
        const y = e ? e.clientY : window.innerHeight / 2;

        for (let i = 0; i < 24; i++) {
            const heart = document.createElement('div');
            heart.className = 'burst-heart';
            heart.textContent = ['❤️', '💖', '✨', '🌸', '💕', '⭐'][Math.floor(Math.random() * 6)];
            heart.style.left = `${x}px`;
            heart.style.top = `${y}px`;

            const angle = Math.random() * Math.PI * 2;
            const dist = Math.random() * 220 + 80;
            const dx = Math.cos(angle) * dist;
            const dy = Math.sin(angle) * dist;
            const rot = (Math.random() - 0.5) * 360;

            heart.style.setProperty('--dx', `${dx}px`);
            heart.style.setProperty('--dy', `${dy}px`);
            heart.style.setProperty('--rot', `${rot}deg`);

            document.body.appendChild(heart);
            setTimeout(() => heart.remove(), 1400);
        }
    }

    heartBurstBtn.addEventListener('click', triggerHeartBurst);
    mainHeart.addEventListener('click', triggerHeartBurst);
});
