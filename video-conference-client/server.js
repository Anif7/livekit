const express = require('express');
const { AccessToken } = require('livekit-server-sdk');
const path = require('path');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const port = 3000;

// Middleware
app.use(express.json());
app.use(express.static('.'));

// WebSocket proxy to LiveKit server
app.use('/rtc', createProxyMiddleware({
    target: 'ws://localhost:7880',
    ws: true,
    changeOrigin: true,
    logLevel: 'debug'
}));

// API Key and Secret (from your LiveKit server)
const API_KEY = 'APIzcxfMudEq8kZ';
const API_SECRET = 'sAdCgPUJvdmI4fNOg41Y6V1vUfYBFQ0AegddmTgujG5A';

// Generate access token
app.post('/token', async (req, res) => {
    try {
        const { identity, room } = req.body;
        
        if (!identity || !room) {
            return res.status(400).json({ error: 'Identity and room are required' });
        }
        
        // Create access token
        const at = new AccessToken(API_KEY, API_SECRET, {
            identity: identity,
        });
        
        // Add grants
        at.addGrant({
            room: room,
            roomJoin: true,
            canPublish: true,
            canSubscribe: true,
        });
        
        // Generate JWT token (await the promise)
        const token = await at.toJwt();
        
        res.send(token);
    } catch (error) {
        console.error('Error generating token:', error);
        res.status(500).json({ error: 'Failed to generate token' });
    }
});

// Serve the main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, () => {
    console.log(`🚀 Video Conference Server running at http://localhost:${port}`);
    console.log(`📹 LiveKit Server: ws://localhost:7880`);
    console.log(`🔑 API Key: ${API_KEY}`);
});
