import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import Draggable from 'react-draggable';
import useWebRTC from '../hooks/useWebRTC';
import VideoPlayer from '../components/VideoPlayer';
import Controls from '../components/Controls';
import { AlertCircle, Mic, Video } from 'lucide-react';
import { saveRecording } from '../utils/indexedDB';

export default function Room() {
  const { id: roomId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  const { 
    localStream, 
    remoteStream, 
    error, 
    connectionState,
    isRemoteMuted,
    isRemoteVideoOff,
    isScreenSharing,
    facingMode,
    toggleAudio,
    toggleVideo,
    switchCamera,
    toggleScreenShare,
    stopMedia
  } = useWebRTC(roomId);

  const [isAudioOn, setIsAudioOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isSwapped, setIsSwapped] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const isDraggingRef = useRef(false);
  const dragStartPosRef = useRef({ x: 0, y: 0 });
  const draggableRef = useRef(null);
  const [pipBounds, setPipBounds] = useState({ left: -2000, top: -2000, right: 80, bottom: 80 });
  const [dragBaseClass, setDragBaseClass] = useState('');

  const [showRecordPrompt, setShowRecordPrompt] = useState(false);
  const [showStopPrompt, setShowStopPrompt] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const recordingTypeRef = useRef('audio');
  const recordingTimeRef = useRef(0);
  const timerIntervalRef = useRef(null);

  // Prevent pull-to-refresh and vertical scrolling strictly on the Room page
  useEffect(() => {
    document.body.style.overscrollBehaviorY = 'none';
    document.body.style.overflow = 'hidden';
    
    return () => {
      document.body.style.overscrollBehaviorY = 'auto';
      document.body.style.overflow = 'auto';
    };
  }, []);

  useEffect(() => {
    let interval;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime((prev) => {
          const newTime = prev + 1;
          recordingTimeRef.current = newTime;
          return newTime;
        });
      }, 1000);
    } else {
      setRecordingTime(0);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const startRecording = async (type) => {
    setShowRecordPrompt(false);
    recordingTypeRef.current = type;
    recordedChunksRef.current = [];
    recordingTimeRef.current = 0;

    let audioContext = new (window.AudioContext || window.webkitAudioContext)();
    let destination = audioContext.createMediaStreamDestination();

    if (localStream && localStream.getAudioTracks().length > 0) {
      let localSource = audioContext.createMediaStreamSource(new MediaStream([localStream.getAudioTracks()[0]]));
      localSource.connect(destination);
    }
    
    if (remoteStream && remoteStream.getAudioTracks().length > 0) {
      let remoteSource = audioContext.createMediaStreamSource(new MediaStream([remoteStream.getAudioTracks()[0]]));
      remoteSource.connect(destination);
    }

    let finalStream = new MediaStream(destination.stream.getTracks());

    if (type === 'video' && remoteStream && remoteStream.getVideoTracks().length > 0) {
      finalStream.addTrack(remoteStream.getVideoTracks()[0]);
    }

    try {
      const mimeType = type === 'video' ? 'video/webm;codecs=vp8,opus' : 'audio/webm;codecs=opus';
      const options = MediaRecorder.isTypeSupported(mimeType) ? { mimeType } : {};
      
      const mediaRecorder = new MediaRecorder(finalStream, options);

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const blob = new Blob(recordedChunksRef.current, { type: mediaRecorder.mimeType });
        const metadata = {
          roomId,
          type: recordingTypeRef.current,
          timestamp: new Date().toISOString(),
          duration: recordingTimeRef.current,
          size: blob.size,
          blob
        };
        await saveRecording(metadata);
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Error starting recording:", err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    setShowStopPrompt(false);
  };


  useEffect(() => {
    const updateBounds = () => {
      if (draggableRef.current) {
        const el = draggableRef.current;
        const parent = el.offsetParent || document.body;
        
        // Calculate exact max travel distances to keep it strictly on-screen
        const maxLeft = -el.offsetLeft;
        const maxTop = -el.offsetTop;
        const maxRight = parent.offsetWidth - (el.offsetLeft + el.offsetWidth);
        const maxBottom = parent.offsetHeight - (el.offsetTop + el.offsetHeight);

        setPipBounds({
          left: maxLeft,
          top: maxTop,
          right: maxRight,
          bottom: maxBottom
        });
      }
    };

    // Give it a tiny delay to allow CSS layout to settle initially
    setTimeout(updateBounds, 100);
    window.addEventListener('resize', updateBounds);
    return () => window.removeEventListener('resize', updateBounds);
  }, [showControls, dragBaseClass]); // Recalculate if CSS bottom class changes or locks


  const handleToggleAudio = () => {
    const newState = toggleAudio();
    setIsAudioOn(newState);
  };

  const handleToggleVideo = () => {
    const newState = toggleVideo();
    setIsVideoOn(newState);
  };

  const handleEndCall = async () => {
    if (isRecording) {
      stopRecording();
    }
    stopMedia();
    
    // If we haven't connected yet and we called a friend directly, send cancel push
    if (connectionState !== 'connected' && location.state?.calledSubscription) {
      try {
        const serverUrl = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000';
        await fetch(`${serverUrl}/api/push`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            subscription: location.state.calledSubscription,
            payload: { type: 'cancel', roomId }
          })
        });
      } catch (e) {
        console.error('Failed to send cancel push', e);
      }
    }

    navigate('/');
  };

  const handleTogglePiP = async () => {
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else if (document.pictureInPictureEnabled) {
        let videoElement = document.getElementById('main-video-player');
        
        // Fallback: If main video isn't rendering a stream, grab the secondary (local) video
        if (!videoElement) {
          videoElement = document.getElementById('pip-video-player');
        }

        // Only request PiP if the element is actually a playing video
        if (videoElement && videoElement.readyState >= 2) {
          await videoElement.requestPictureInPicture();
        }
      }
    } catch (error) {
      console.error('Failed to toggle PiP:', error);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[#0f1115]">
        <div className="glass-panel p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Connection Error</h2>
          <p className="text-gray-400 mb-6">{error}</p>
          <button onClick={() => navigate('/')} className="btn btn-primary w-full py-3">
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 w-full h-[100dvh] bg-[#0f1115] overflow-hidden flex flex-col overscroll-none">
      
      {showRecordPrompt && (
        <div className="absolute inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="glass-panel p-6 max-w-sm w-full mx-4">
            <h3 className="text-xl font-bold mb-4 text-white">Start Recording</h3>
            <p className="text-gray-300 mb-6 text-sm">Choose what you want to record. The recording will be saved locally.</p>
            <div className="flex gap-4">
              <button 
                className="flex-1 btn btn-secondary py-3 flex flex-col items-center justify-center gap-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-all"
                onClick={() => startRecording('audio')}
              >
                <Mic className="w-6 h-6" />
                Audio Only
              </button>
              <button 
                className="flex-1 btn btn-secondary py-3 flex flex-col items-center justify-center gap-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-all "
                onClick={() => startRecording('video')}
              >
                <Video className="w-6 h-6" />
                Audio & Video
              </button>
            </div>
            <button 
              className="mt-4 w-full text-gray-400 hover:text-white py-2 text-sm transition-colors"
              onClick={() => setShowRecordPrompt(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {showStopPrompt && (
        <div className="absolute inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="glass-panel p-6 max-w-sm w-full mx-4 text-center">
            <h3 className="text-xl font-bold mb-4 text-white">Stop Recording?</h3>
            <p className="text-gray-300 mb-6 text-sm">Are you sure you want to stop the recording?</p>
            <div className="flex gap-4">
              <button 
                className="flex-1 py-2.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                onClick={() => setShowStopPrompt(false)}
              >
                Cancel
              </button>
              <button 
                className="flex-1 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors shadow-lg shadow-red-600/20"
                onClick={stopRecording}
              >
                Stop & Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Top Bar Info */}
      <div className={`absolute top-4 left-4 md:top-6 md:left-6 z-20 transition-all duration-500 ease-in-out ${showControls ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-16 pointer-events-none'}`}>
        <div className="glass-panel px-3 md:px-4 py-2 flex items-center gap-2 md:gap-3 text-sm md:text-base">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          <span className="font-medium truncate max-w-[100px] sm:max-w-none">Room: {roomId}</span>
          <span className="text-[10px] md:text-xs text-gray-500 uppercase tracking-wider ml-1 md:ml-2 border-l border-white/10 pl-2 md:pl-3">
            {connectionState}
          </span>
        </div>
        {isRecording && (
          <div 
            className="mt-2 text-red-500 flex items-center gap-2 cursor-pointer w-max ml-1"
            onClick={() => setShowStopPrompt(true)}
            title="Click to stop recording"
          >
            <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]"></div>
            <span className="font-mono text-sm drop-shadow-md">
              {String(Math.floor(recordingTime / 60)).padStart(2, '0')}:
              {String(recordingTime % 60).padStart(2, '0')}
            </span>
          </div>
        )}
      </div>


      {/* Main Video Layout */}
      <div 
        className="flex-1 w-full h-full relative cursor-pointer"
        onClick={(e) => {
          if (e.target.closest('.pip-container')) return;
          setShowControls(prev => !prev);
        }}
      >
        
        {/* Main Video (Takes up full space) */}
        <div className="absolute inset-0 z-0 bg-black">
          <VideoPlayer 
            id="main-video-player"
            stream={isSwapped ? localStream : remoteStream} 
            isLocal={isSwapped} 
            isMirrored={isSwapped && facingMode === 'user' && !isScreenSharing}
            label={isSwapped ? "You" : "Friend"}
            objectFit="contain"
            labelPosition="top-right"
            isVideoOff={isSwapped ? !isVideoOn : isRemoteVideoOff}
            isMuted={isSwapped ? !isAudioOn : false}
            isMicMuted={isSwapped ? !isAudioOn : isRemoteMuted}
          />
        </div>

        {/* PIP Video (Picture-in-Picture style) */}
        <Draggable 
          nodeRef={draggableRef}
          bounds={pipBounds}
          onStart={(e, data) => { 
            dragStartPosRef.current = { x: data.x, y: data.y };
            isDraggingRef.current = false; 
            if (!dragBaseClass) {
              setDragBaseClass(showControls ? 'bottom-32 md:bottom-40' : 'bottom-6 md:bottom-8');
            }
          }}
          onDrag={(e, data) => { 
            const dx = Math.abs(data.x - dragStartPosRef.current.x);
            const dy = Math.abs(data.y - dragStartPosRef.current.y);
            if (dx > 5 || dy > 5) {
              isDraggingRef.current = true; 
            }
          }}
          onStop={(e, data) => { 
            if (!isDraggingRef.current) {
              setIsSwapped(prev => !prev);
            }
            setTimeout(() => { isDraggingRef.current = false; }, 50); 
          }}
        >
          <div ref={draggableRef} style={{ touchAction: 'none' }} className={`pip-container absolute right-4 md:right-6 z-[100] cursor-move transition-[bottom] duration-500 ease-in-out ${dragBaseClass || (showControls ? 'bottom-32 md:bottom-40' : 'bottom-6 md:bottom-8')}`}>
            <div 
              className="w-28 sm:w-36 md:w-48 lg:w-64 aspect-[3/4] md:aspect-video transition-transform hover:scale-105 duration-300 shadow-2xl rounded-xl overflow-hidden border border-white/20"
              title="Drag to move, click to swap"
            >
              <VideoPlayer 
                id="pip-video-player"
                stream={isSwapped ? remoteStream : localStream} 
                isLocal={!isSwapped} 
                isMirrored={!isSwapped && facingMode === 'user' && !isScreenSharing}
                isVideoOff={!isSwapped ? !isVideoOn : isRemoteVideoOff}
                isMuted={!isSwapped ? !isAudioOn : false}
                isMicMuted={isSwapped ? isRemoteMuted : !isAudioOn}
                label={isSwapped ? "Friend" : "You"}
                objectFit="cover"
              />
            </div>
          </div>
        </Draggable>
      </div>

      {/* Bottom Controls */}
      <Controls 
        isAudioOn={isAudioOn}
        isVideoOn={isVideoOn}
        onToggleAudio={handleToggleAudio}
        onToggleVideo={handleToggleVideo}
        onTogglePiP={handleTogglePiP}
        onSwitchCamera={switchCamera}
        onToggleScreenShare={toggleScreenShare}
        isScreenSharing={isScreenSharing}
        onEndCall={handleEndCall}
        roomId={roomId}
        showControls={showControls}
        onStartRecordingReq={() => setShowRecordPrompt(true)}
      />
    </div>
  );
}
