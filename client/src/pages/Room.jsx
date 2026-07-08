import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import useWebRTC from '../hooks/useWebRTC';
import VideoPlayer from '../components/VideoPlayer';
import Controls from '../components/Controls';
import { AlertCircle } from 'lucide-react';

export default function Room() {
  const { id: roomId } = useParams();
  const navigate = useNavigate();
  
  const { 
    localStream, 
    remoteStream, 
    error, 
    connectionState,
    toggleAudio,
    toggleVideo,
    stopMedia
  } = useWebRTC(roomId);

  const [isAudioOn, setIsAudioOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);

  const handleToggleAudio = () => {
    const newState = toggleAudio();
    setIsAudioOn(newState);
  };

  const handleToggleVideo = () => {
    const newState = toggleVideo();
    setIsVideoOn(newState);
  };

  const handleEndCall = () => {
    stopMedia();
    navigate('/');
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
    <div className="min-h-screen bg-[#0f1115] relative overflow-hidden flex flex-col p-4 md:p-6">
      
      {/* Top Bar Info */}
      <div className="absolute top-6 left-6 z-10">
        <div className="glass-panel px-4 py-2 flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          <span className="font-medium">Room: {roomId}</span>
          <span className="text-xs text-gray-500 uppercase tracking-wider ml-2 border-l border-white/10 pl-3">
            {connectionState}
          </span>
        </div>
      </div>

      {/* Main Video Layout */}
      <div className="flex-1 w-full max-w-7xl mx-auto flex items-center justify-center gap-4 relative">
        
        {/* Remote Video (Takes up full space) */}
        <div className="absolute inset-0 z-0">
          <VideoPlayer 
            stream={remoteStream} 
            isLocal={false} 
            label="Remote User"
          />
        </div>

        {/* Local Video (Picture-in-Picture style) */}
        <div className="absolute bottom-32 right-6 w-48 md:w-64 aspect-video z-10 transition-all hover:scale-105 duration-300">
          <VideoPlayer 
            stream={localStream} 
            isLocal={true} 
            isMuted={!isAudioOn}
            label="You"
          />
        </div>
      </div>

      {/* Bottom Controls */}
      <Controls 
        isAudioOn={isAudioOn}
        isVideoOn={isVideoOn}
        onToggleAudio={handleToggleAudio}
        onToggleVideo={handleToggleVideo}
        onEndCall={handleEndCall}
        roomId={roomId}
      />
    </div>
  );
}
