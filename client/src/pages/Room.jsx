import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
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
    isRemoteMuted,
    toggleAudio,
    toggleVideo,
    stopMedia
  } = useWebRTC(roomId);

  const [isAudioOn, setIsAudioOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isSwapped, setIsSwapped] = useState(false);

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

  const handleTogglePiP = async () => {
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else if (document.pictureInPictureEnabled) {
        const videoElement = document.getElementById('main-video-player');
        if (videoElement) {
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
    <div className="h-[100dvh] w-full bg-[#0f1115] relative overflow-hidden flex flex-col">
      
      {/* Top Bar Info */}
      <div className="absolute top-4 left-4 md:top-6 md:left-6 z-20">
        <div className="glass-panel px-3 md:px-4 py-2 flex items-center gap-2 md:gap-3 text-sm md:text-base">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          <span className="font-medium truncate max-w-[100px] sm:max-w-none">Room: {roomId}</span>
          <span className="text-[10px] md:text-xs text-gray-500 uppercase tracking-wider ml-1 md:ml-2 border-l border-white/10 pl-2 md:pl-3">
            {connectionState}
          </span>
        </div>
      </div>


      {/* Main Video Layout */}
      <div className="flex-1 w-full h-full relative">
        
        {/* Main Video (Takes up full space) */}
        <div className="absolute inset-0 z-0 bg-black">
          <VideoPlayer 
            id="main-video-player"
            stream={isSwapped ? localStream : remoteStream} 
            isLocal={isSwapped} 
            label={isSwapped ? "You" : "Friend"}
            objectFit="contain"
            labelPosition="top-right"
            isMuted={isSwapped ? !isAudioOn : false}
            isMicMuted={isSwapped ? !isAudioOn : isRemoteMuted}
          />
        </div>

        {/* PIP Video (Picture-in-Picture style) */}
        <div 
          onClick={() => setIsSwapped(!isSwapped)}
          className="absolute bottom-32 right-4 md:bottom-40 md:right-6 w-28 sm:w-36 md:w-48 lg:w-64 aspect-[3/4] md:aspect-video z-10 transition-all hover:scale-105 duration-300 shadow-2xl rounded-xl overflow-hidden border border-white/20 cursor-pointer"
          title="Click to swap videos"
        >
          <VideoPlayer 
            stream={isSwapped ? remoteStream : localStream} 
            isLocal={!isSwapped} 
            isMuted={!isSwapped ? !isAudioOn : false}
            isMicMuted={isSwapped ? isRemoteMuted : !isAudioOn}
            label={isSwapped ? "Friend" : "You"}
            objectFit="cover"
          />
        </div>
      </div>

      {/* Bottom Controls */}
      <Controls 
        isAudioOn={isAudioOn}
        isVideoOn={isVideoOn}
        onToggleAudio={handleToggleAudio}
        onToggleVideo={handleToggleVideo}
        onTogglePiP={handleTogglePiP}
        onEndCall={handleEndCall}
        roomId={roomId}
      />
    </div>
  );
}
