const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;
const STATE_FILE = path.join(__dirname, 'canvas-state.json');

// Serve static assets
app.use(express.static(__dirname));

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

let actionHistory = [];

// Load persisted state if exists
if (fs.existsSync(STATE_FILE)) {
    try {
        const data = fs.readFileSync(STATE_FILE, 'utf-8');
        actionHistory = JSON.parse(data);
        console.log(`[Server] Loaded ${actionHistory.length} actions from persistent state.`);
    } catch (err) {
        console.error('[Server] Error reading state file:', err);
        actionHistory = [];
    }
}

function saveState() {
    try {
        fs.writeFileSync(STATE_FILE, JSON.stringify(actionHistory), 'utf-8');
    } catch (err) {
        console.error('[Server] Error saving state:', err);
    }
}

wss.on('connection', (ws) => {
    console.log('[WebSocket] Client connected.');

    // Send existing canvas history to newly connected client
    ws.send(JSON.stringify({ type: 'init', actions: actionHistory }));

    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            if (data.type === 'draw_action') {
                const action = data.action;
                if (action.tool === 'clear') {
                    actionHistory = [action];
                } else {
                    actionHistory.push(action);
                }
                saveState();

                // Broadcast action to all other connected clients
                wss.clients.forEach((client) => {
                    if (client !== ws && client.readyState === WebSocket.OPEN) {
                        client.send(JSON.stringify({ type: 'draw_action', action }));
                    }
                });
            } else if (data.type === 'clear') {
                actionHistory = [{ tool: 'clear', timestamp: Date.now() }];
                saveState();
                wss.clients.forEach((client) => {
                    if (client.readyState === WebSocket.OPEN) {
                        client.send(JSON.stringify({ type: 'clear' }));
                    }
                });
            } else if (data.type === 'cursor_move') {
                // Broadcast cursor position of boyfriend/girlfriend to partner
                wss.clients.forEach((client) => {
                    if (client !== ws && client.readyState === WebSocket.OPEN) {
                        client.send(JSON.stringify({
                            type: 'remote_cursor',
                            x: data.x,
                            y: data.y,
                            userName: data.userName || 'همراه شما'
                        }));
                    }
                });
            }
        } catch (err) {
            console.error('[WebSocket] Error processing message:', err);
        }
    });

    ws.on('close', () => {
        console.log('[WebSocket] Client disconnected.');
    });
});

server.listen(PORT, () => {
    console.log(`[Server] Shadi Celestial Paint App running at http://localhost:${PORT}`);
});
