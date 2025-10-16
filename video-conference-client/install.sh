#!/bin/bash

echo "🚀 Setting up LiveKit Video Conference Client..."

# Install dependencies
echo "📦 Installing dependencies..."
npm install

echo "✅ Setup complete!"
echo ""
echo "To start the video conference:"
echo "1. Make sure LiveKit server is running: ./livekit-server --config livekit.yaml --dev"
echo "2. Start this server: npm start"
echo "3. Open browser: http://localhost:3000"
echo ""
echo "Your LiveKit server should be running on ws://localhost:7880"
