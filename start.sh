#!/bin/bash

# LiveKit Video Conference Startup Script

echo "🚀 Starting LiveKit Video Conference POC..."

# Function to cleanup background processes
cleanup() {
    echo "🛑 Shutting down servers..."
    pkill -f "livekit-server"
    pkill -f "node server.js"
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Start LiveKit server in background
echo "📹 Starting LiveKit server..."
cd livekit-server
./livekit-server --config livekit.yaml --dev &
LIVEKIT_PID=$!

# Wait a moment for LiveKit to start
sleep 2

# Start video conference client
echo "🎥 Starting video conference client..."
cd ../video-conference-client
node server.js &
CLIENT_PID=$!

echo ""
echo "✅ Servers started successfully!"
echo "🌐 Video Conference: http://localhost:3000"
echo "📹 LiveKit Server: ws://localhost:7880"
echo ""
echo "Press Ctrl+C to stop all servers"

# Wait for background processes
wait
