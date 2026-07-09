import { useState, useEffect, useRef, useCallback } from 'react';
import socket from '../services/socket';

const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    {
      urls: 'turn:openrelay.metered.ca:80',
      username: 'openrelayproject',
      credential: 'openrelayproject'
    },
    {
      urls: 'turn:openrelay.metered.ca:443',
      username: 'openrelayproject',
      credential: 'openrelayproject'
    }
  ]
};

export default function useWebRTC(roomId) {
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [error, setError] = useState(null);
  const [connectionState, setConnectionState] = useState('connecting'); // connecting, connected, disconnected
  const [isRemoteMuted, setIsRemoteMuted] = useState(false);
  
  const peerConnectionRef = useRef(null);
  const remoteUserRef = useRef(null);
  const pendingCandidatesRef = useRef([]);
  const streamRef = useRef(null);

  useEffect(() => {
    let mounted = true;

    const initWebRTC = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          }
        });

        if (!mounted) {
          // If component unmounted while waiting for media, stop tracks and abort
          stream.getTracks().forEach(track => track.stop());
          return;
        }

        streamRef.current = stream;
        setLocalStream(stream);

        // Join room signaling
        socket.emit('join-room', roomId);
      } catch (err) {
        if (!mounted) return;
        console.error("Media access error:", err);
        if (err.name === 'NotAllowedError') {
          setError('Camera or microphone permission denied.');
        } else if (err.name === 'NotFoundError') {
          setError('No camera or microphone found.');
        } else {
          setError('Could not access camera/microphone.');
        }
      }
    };

    initWebRTC();

    return () => {
      mounted = false;
      // Cleanup
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
      }
      socket.emit('leave-room');
    };
  }, [roomId]);

  const createPeerConnection = useCallback((remoteSocketId) => {
    const pc = new RTCPeerConnection(ICE_SERVERS);

    // Add local tracks to peer connection
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        pc.addTrack(track, streamRef.current);
      });
    }

    // Handle remote tracks
    pc.ontrack = (event) => {
      setRemoteStream((prevStream) => {
        if (prevStream) {
          const hasTrack = prevStream.getTracks().some(t => t.id === event.track.id);
          if (!hasTrack) prevStream.addTrack(event.track);
          return prevStream;
        }
        return new MediaStream([event.track]);
      });
    };

    // Handle ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit('ice-candidate', {
          to: remoteSocketId,
          candidate: event.candidate
        });
      }
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'connected') {
        setConnectionState('connected');
      } else if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
        setConnectionState('disconnected');
        setRemoteStream(null);
      }
    };

    pc.oniceconnectionstatechange = () => {
      if (pc.iceConnectionState === 'connected' || pc.iceConnectionState === 'completed') {
        setConnectionState('connected');
      } else if (pc.iceConnectionState === 'failed' || pc.iceConnectionState === 'disconnected') {
        setConnectionState('disconnected');
        setRemoteStream(null);
      }
    };

    peerConnectionRef.current = pc;
    return pc;
  }, []);

  useEffect(() => {
    // Room is full
    socket.on('room-full', () => {
      setError('Room is full. Maximum 2 users allowed.');
      socket.disconnect();
    });

    // When another user joins
    socket.on('user-connected', async (userId) => {
      console.log('SIGNALING: User connected', userId);
      remoteUserRef.current = userId;
      
      // Send our current mute state to the newly connected user
      if (streamRef.current) {
        const audioTrack = streamRef.current.getAudioTracks()[0];
        const isSelfMuted = audioTrack ? !audioTrack.enabled : false;
        socket.emit('toggle-mute', {
          to: userId,
          isMuted: isSelfMuted
        });
      }

      const pc = createPeerConnection(userId);
      
      try {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        console.log('SIGNALING: Sending offer to', userId);
        socket.emit('offer', {
          to: userId,
          offer: pc.localDescription
        });
      } catch (err) {
        console.error('SIGNALING ERROR creating offer:', err);
      }
    });

    // When we receive an offer
    socket.on('offer', async (data) => {
      console.log('SIGNALING: Received offer from', data.from);
      remoteUserRef.current = data.from;
      
      // Send our current mute state to the offerer
      if (streamRef.current) {
        const audioTrack = streamRef.current.getAudioTracks()[0];
        const isSelfMuted = audioTrack ? !audioTrack.enabled : false;
        socket.emit('toggle-mute', {
          to: data.from,
          isMuted: isSelfMuted
        });
      }

      if (peerConnectionRef.current) {
        console.log('SIGNALING: Closing existing peer connection before creating new one for offer');
        peerConnectionRef.current.close();
      }

      const pc = createPeerConnection(data.from);
      
      try {
        await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        
        console.log('SIGNALING: Sending answer to', data.from);
        socket.emit('answer', {
          to: data.from,
          answer: pc.localDescription
        });

        // Add any pending candidates now that remote description is set
        while (pendingCandidatesRef.current.length > 0) {
          const candidate = pendingCandidatesRef.current.shift();
          console.log('SIGNALING: Adding pending ICE candidate after offer');
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        }
      } catch (err) {
        console.error('SIGNALING ERROR handling offer:', err);
      }
    });

    // When we receive an answer
    socket.on('answer', async (data) => {
      console.log('SIGNALING: Received answer from', data.from);
      if (peerConnectionRef.current) {
        try {
          await peerConnectionRef.current.setRemoteDescription(
            new RTCSessionDescription(data.answer)
          );
          // Add any pending candidates
          while (pendingCandidatesRef.current.length > 0) {
            const candidate = pendingCandidatesRef.current.shift();
            console.log('SIGNALING: Adding pending ICE candidate after answer');
            await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
          }
        } catch (err) {
          console.error('SIGNALING ERROR handling answer:', err);
        }
      } else {
        console.error('SIGNALING ERROR: Received answer but no peer connection exists');
      }
    });

    // When we receive an ICE candidate
    socket.on('ice-candidate', async (data) => {
      console.log('SIGNALING: Received ICE candidate');
      if (data.candidate) {
        if (peerConnectionRef.current && peerConnectionRef.current.remoteDescription) {
          try {
            await peerConnectionRef.current.addIceCandidate(
              new RTCIceCandidate(data.candidate)
            );
          } catch (e) {
            console.error("SIGNALING ERROR adding ice candidate", e);
          }
        } else {
          console.log('SIGNALING: Queuing ICE candidate (no remote description yet)');
          // Queue candidate if remote description is not set yet
          pendingCandidatesRef.current.push(data.candidate);
        }
      }
    });

    // When remote user disconnects
    socket.on('user-disconnected', () => {
      setConnectionState('disconnected');
      setRemoteStream(null);
      setIsRemoteMuted(false);
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
        peerConnectionRef.current = null;
      }
    });

    // When remote user toggles their mute state
    socket.on('toggle-mute', (data) => {
      console.log('SIGNALING: Remote mute state changed', data.isMuted);
      setIsRemoteMuted(data.isMuted);
    });

    return () => {
      socket.off('room-full');
      socket.off('user-connected');
      socket.off('offer');
      socket.off('answer');
      socket.off('ice-candidate');
      socket.off('user-disconnected');
      socket.off('toggle-mute');
    };
  }, [createPeerConnection]);

  const toggleAudio = useCallback(() => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        console.log('MUTE_DEBUG: Local audio track enabled status changed to:', audioTrack.enabled, 'remoteUserRef:', remoteUserRef.current);
        if (remoteUserRef.current) {
          console.log('MUTE_DEBUG: Emitting toggle-mute to:', remoteUserRef.current, 'isMuted:', !audioTrack.enabled);
          socket.emit('toggle-mute', {
            to: remoteUserRef.current,
            isMuted: !audioTrack.enabled
          });
        } else {
          console.warn('MUTE_DEBUG: Cannot emit toggle-mute because remoteUserRef.current is null/undefined');
        }
        return audioTrack.enabled;
      }
    }
    return false;
  }, [localStream]);

  const toggleVideo = useCallback(() => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        return videoTrack.enabled;
      }
    }
    return false;
  }, [localStream]);

  const stopMedia = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
  }, [localStream]);

  return {
    localStream,
    remoteStream,
    error,
    connectionState,
    isRemoteMuted,
    toggleAudio,
    toggleVideo,
    stopMedia
  };
}
