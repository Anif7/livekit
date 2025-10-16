# LiveKit Video Conference POC

A complete video conferencing solution built with LiveKit SFU (Selective Forwarding Unit) architecture.

## 🏗️ Project Structure

```
livekit/
├── livekit-server/           # LiveKit SFU server
│   ├── livekit-server       # LiveKit server binary
│   ├── livekit.yaml         # Server configuration
│   └── LICENSE              # LiveKit license
└── video-conference-client/ # Video conference web application
    ├── app.js               # Client-side JavaScript
    ├── server.js            # Node.js server with token generation
    ├── index.html           # Web interface
    ├── bundle.js            # Bundled client code
    ├── package.json         # Dependencies
    └── install.sh           # Installation script
```

## 🚀 Features

- **Pure SFU Architecture**: No peer-to-peer connections, all streams go through LiveKit server
- **Multi-participant Support**: Scalable video conferencing
- **WebRTC Integration**: Real-time video and audio streaming
- **Simulcast**: Multiple quality layers for adaptive streaming
- **Token-based Authentication**: Secure room access
- **External Access**: ngrok support for global access

## 🛠️ Setup Instructions

### 1. Start LiveKit Server

```bash
cd livekit-server
./livekit-server --config livekit.yaml --dev
```

### 2. Start Video Conference Client

```bash
cd video-conference-client
npm install
node server.js
```

### 3. Access the Application

- **Local**: http://localhost:3000
- **External**: Use ngrok for global access

## 🌐 External Access with ngrok

### Option 1: Separate ngrok tunnels (Recommended)

```bash
# Terminal 1: Video conference app
ngrok http 3000

# Terminal 2: LiveKit server  
ngrok tcp 7880
```

Update `app.js` with the LiveKit ngrok URL:
```javascript
const LIVEKIT_URL = 'wss://your-livekit-ngrok-url';
```

### Option 2: WebSocket proxy through HTTP server

The client includes WebSocket proxy support for single ngrok tunnel.

## 🔧 Configuration

### LiveKit Server (livekit.yaml)
```yaml
port: 7880
rtc:
  udp_port: 7881
  use_external_ip: false
  stun_servers:
    - stun.l.google.com:19302
keys:
  APIzcxfMudEq8kZ: sAdCgPUJvdmI4fNOg41Y6V1vUfYBFQ0AegddmTgujG5A
redis: {}
log_level: info
```

### Client Configuration (app.js)
```javascript
const LIVEKIT_URL = 'ws://localhost:7880';  // Local
// const LIVEKIT_URL = 'wss://your-ngrok-url';  // External
```

## 📊 Architecture

### SFU (Selective Forwarding Unit) Flow:
```
Participant A → LiveKit Server → Participant B
Participant A → LiveKit Server → Participant C
Participant B → LiveKit Server → Participant C
```

### Benefits:
- **Scalability**: N participants = N connections (not N×(N-1)/2)
- **Bandwidth Efficiency**: Each participant uploads once to server
- **Quality Control**: Server can adapt quality per participant
- **Reliability**: Centralized connection management

## 🧪 Testing

1. **Local Testing**: Open multiple browser tabs to `http://localhost:3000`
2. **External Testing**: Use ngrok URLs for multi-device testing
3. **Multi-participant**: Join same room from different devices/browsers

## 📦 Dependencies

### LiveKit Server
- LiveKit server binary (included)
- Configuration file (livekit.yaml)

### Video Conference Client
- Node.js
- Express.js
- livekit-client
- livekit-server-sdk
- esbuild (for bundling)

## 🔑 API Keys

The project includes development API keys. For production:
1. Generate new API keys
2. Update `livekit.yaml`
3. Update `server.js` and `app.js`

## 📝 License

This project includes LiveKit server components. See `livekit-server/LICENSE` for details.

## 🚀 Deployment

For production deployment:
1. Use proper API key management
2. Configure HTTPS/WSS
3. Set up proper STUN/TURN servers
4. Configure firewall rules for UDP ports
5. Use production LiveKit server setup

## 🎯 Next Steps

- Add recording capabilities
- Implement screen sharing
- Add chat functionality
- Implement room management
- Add user authentication
- Deploy to cloud infrastructure
