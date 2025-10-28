// Import LiveKit
import { Room, RoomEvent, Track, TrackPublication, Participant, RemoteParticipant, LocalParticipant } from 'livekit-client';

// LiveKit configuration
const LIVEKIT_URL = 'ws://localhost:7880';
const API_KEY = 'APIzcxfMudEq8kZ';
const API_SECRET = 'sAdCgPUJvdmI4fNOg41Y6V1vUfYBFQ0AegddmTgujG5A';

let room = null;
let localVideoTrack = null;
let localAudioTrack = null;
let isMuted = false;
let isVideoOff = false;

// DOM elements
const joinBtn = document.getElementById('joinBtn');
const leaveBtn = document.getElementById('leaveBtn');
const muteBtn = document.getElementById('muteBtn');
const videoBtn = document.getElementById('videoBtn');
const status = document.getElementById('status');
const videoGrid = document.getElementById('videoGrid');
const roomNameInput = document.getElementById('roomName');

console.log('LiveKit loaded successfully via ES modules');
status.textContent = 'LiveKit loaded. Ready to join room.';

// Generates a random participant ID
function generateRandomParticipantName() {
    return `user_${crypto.randomUUID()}`;
}

// Event listeners
joinBtn.addEventListener('click', joinRoom);
leaveBtn.addEventListener('click', leaveRoom);
muteBtn.addEventListener('click', toggleMute);
videoBtn.addEventListener('click', toggleVideo);


// Join room
async function joinRoom() {
    try {
        const roomName = roomNameInput.value || 'test-room';
        const participantName = generateRandomParticipantName();
        
        status.textContent = `Connecting as ${participantName}...`;
        
        // Generate token
        const token = await generateToken(participantName, roomName);
        
        // Create room instance
        room = new Room();
        
        // Set up event listeners
        setupRoomEventListeners(room);
        
        // Connect to room
        await room.connect(LIVEKIT_URL, token);
        
        // Enable camera and microphone
        await room.localParticipant.enableCameraAndMicrophone();
        
        // Add local participant video
        addParticipantVideo(room.localParticipant);
        
        // Add existing participants (if any)
        room.remoteParticipants.forEach(participant => {
            console.log('Adding existing remote participant:', participant.identity);
            addParticipantVideo(participant);
            updateParticipantAudio(participant);
        });
        
        status.textContent = `Connected to room: ${roomName}`;
        updateUI(true);
        
    } catch (error) {
        console.error('Error joining room:', error);
        status.textContent = `Error: ${error.message}`;
    }
}

// Generate access token (simplified - in production, this should be done server-side)
async function generateToken(identity, roomName) {
    // For this POC, we'll use a simple approach
    // In production, you should generate tokens server-side
    const response = await fetch('/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            identity: identity,
            room: roomName
        })
    });
    
    if (!response.ok) {
        throw new Error('Failed to generate token');
    }
    
    return await response.text();
}

// Registers all room event listeners
function setupRoomEventListeners(room) {
    room.on(RoomEvent.ParticipantConnected, onParticipantConnected);
    room.on(RoomEvent.ParticipantDisconnected, onParticipantDisconnected);
    room.on(RoomEvent.TrackSubscribed, onTrackSubscribed);
    room.on(RoomEvent.TrackUnsubscribed, onTrackUnsubscribed);
    room.on(RoomEvent.Disconnected, onRoomDisconnected);
}

// ===== Room Event Handlers =====

// Adds UI elements for newly connected participant and initializes their media
function onParticipantConnected(participant) {
    console.log('Participant connected:', participant.identity);
    addParticipantVideo(participant);
    // Update video and audio immediately for remote participants
    if (participant !== room.localParticipant) {
        updateParticipantVideo(participant);
        updateParticipantAudio(participant);
    }
}

// Removes UI elements when a participant leaves the room
function onParticipantDisconnected(participant) {
    console.log('Participant disconnected:', participant.identity);
    removeParticipantVideo(participant.identity);
}

// Attaches newly subscribed track to the participant's video or audio element
function onTrackSubscribed(track, publication, participant) {
    console.log('Track subscribed:', track.kind, participant.identity);
    if (track.kind === 'video') {
        updateParticipantVideo(participant);
    } else if (track.kind === 'audio') {
        updateParticipantAudio(participant);
    }
}

// Detaches unsubscribed track from the participant's media element
function onTrackUnsubscribed(track, publication, participant) {
    console.log('Track unsubscribed:', track.kind, participant.identity);
    if (track.kind === 'video') {
        updateParticipantVideo(participant);
    } else if (track.kind === 'audio') {
        updateParticipantAudio(participant);
    }
}

// Cleans up UI when disconnected from the room
function onRoomDisconnected() {
    console.log('Disconnected from room');
    status.textContent = 'Disconnected';
    updateUI(false);
}

// Leave room
async function leaveRoom() {
    if (room) {
        await room.disconnect();
        room = null;
        videoGrid.innerHTML = '';
        status.textContent = 'Left room';
        updateUI(false);
    }
}

// Toggle mute
function toggleMute() {
    if (room && room.localParticipant.audioTrack) {
        isMuted = !isMuted;
        room.localParticipant.setMicrophoneEnabled(!isMuted);
        muteBtn.textContent = isMuted ? 'Unmute Audio' : 'Mute Audio';
    }
}

// Toggle video
function toggleVideo() {
    if (room && room.localParticipant.videoTrack) {
        isVideoOff = !isVideoOff;
        room.localParticipant.setCameraEnabled(!isVideoOff);
        videoBtn.textContent = isVideoOff ? 'Turn On Video' : 'Turn Off Video';
    }
}

// Add participant video
function addParticipantVideo(participant) {
    const videoContainer = document.createElement('div');
    videoContainer.className = 'video-container';
    videoContainer.id = `participant-${participant.identity}`;
    
    const video = document.createElement('video');
    video.autoplay = true;
    video.playsInline = true;
    video.id = `video-${participant.identity}`;
    
    // Add audio element for remote participants
    if (participant !== room.localParticipant) {
        const audio = document.createElement('audio');
        audio.autoplay = true;
        audio.id = `audio-${participant.identity}`;
        videoContainer.appendChild(audio);
    }
    
    const info = document.createElement('div');
    info.className = 'participant-info';
    info.textContent = participant.identity;
    
    videoContainer.appendChild(video);
    videoContainer.appendChild(info);
    videoGrid.appendChild(videoContainer);
    
    updateParticipantVideo(participant);
    if (participant !== room.localParticipant) {
        updateParticipantAudio(participant);
    }
}

// Update participant video
function updateParticipantVideo(participant) {
    const video = document.getElementById(`video-${participant.identity}`);
    if (!video) return;
    
    console.log('Updating video for participant:', participant.identity);
    console.log('Video track publications:', participant.videoTrackPublications.size);
    console.log('Is local participant:', participant === room.localParticipant);
    
    // Get video track from track publications
    let videoTrackPublication = null;
    
    // Try different methods to get video track
    if (participant.videoTrackPublications.size > 0) {
        videoTrackPublication = Array.from(participant.videoTrackPublications.values())[0];
    }
    
    // Alternative: try to get by name
    if (!videoTrackPublication) {
        videoTrackPublication = participant.getTrackPublicationByName('camera');
    }
    
    // For local participant, try to get from localParticipant
    if (!videoTrackPublication && participant === room.localParticipant) {
        const localVideoTrack = room.localParticipant.videoTrack;
        if (localVideoTrack) {
            console.log('Using local video track');
            video.srcObject = new MediaStream([localVideoTrack.mediaStreamTrack]);
            video.play().catch(e => console.error('Video play error:', e));
            return;
        }
    }
    
    console.log('Video track publication:', videoTrackPublication);
    
    if (videoTrackPublication && videoTrackPublication.track) {
        console.log('Setting video source for:', participant.identity);
        video.srcObject = new MediaStream([videoTrackPublication.track.mediaStreamTrack]);
        video.play().catch(e => console.error('Video play error:', e));
    } else {
        console.log('No video track found for:', participant.identity);
        // For remote participants, try to wait a bit and retry
        if (participant !== room.localParticipant) {
            console.log('Retrying video update for remote participant:', participant.identity);
            setTimeout(() => {
                updateParticipantVideo(participant);
            }, 1000);
        }
    }
}

// Update participant audio
function updateParticipantAudio(participant) {
    const audio = document.getElementById(`audio-${participant.identity}`);
    if (!audio) return;
    
    console.log('Updating audio for participant:', participant.identity);
    console.log('Audio track publications:', participant.audioTrackPublications.size);
    
    // Get audio track from track publications
    let audioTrackPublication = null;
    
    // Try different methods to get audio track
    if (participant.audioTrackPublications.size > 0) {
        audioTrackPublication = Array.from(participant.audioTrackPublications.values())[0];
    }
    
    // Alternative: try to get by name
    if (!audioTrackPublication) {
        audioTrackPublication = participant.getTrackPublicationByName('microphone');
    }
    
    console.log('Audio track publication:', audioTrackPublication);
    
    if (audioTrackPublication && audioTrackPublication.track) {
        console.log('Setting audio source for:', participant.identity);
        audio.srcObject = new MediaStream([audioTrackPublication.track.mediaStreamTrack]);
        audio.play().catch(e => console.error('Audio play error:', e));
    } else {
        console.log('No audio track found for:', participant.identity);
        // For remote participants, try to wait a bit and retry
        console.log('Retrying audio update for remote participant:', participant.identity);
        setTimeout(() => {
            updateParticipantAudio(participant);
        }, 1000);
    }
}

// Remove participant video
function removeParticipantVideo(identity) {
    const container = document.getElementById(`participant-${identity}`);
    if (container) {
        container.remove();
    }
}

// Update UI state
function updateUI(connected) {
    joinBtn.disabled = connected;
    leaveBtn.disabled = !connected;
    muteBtn.disabled = !connected;
    videoBtn.disabled = !connected;
}