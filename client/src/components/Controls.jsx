import { useState } from 'react';
import { Mic, MicOff, Video, VideoOff, PictureInPicture, PhoneOff, Copy, Check } from 'lucide-react';

export default function Controls({ 
  isAudioOn, 
  isVideoOn, 
  onToggleAudio, 
  onToggleVideo, 
  onTogglePiP,
  onEndCall,
  roomId
}) {
  const [copied, setCopied] = useState(false);

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
      <div className="glass-panel px-6 py-4 flex items-center gap-4 shadow-2xl">
        
        {/* Copy Link Button */}
        <button
          onClick={copyLink}
          className="p-4 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 transition-all flex items-center gap-2 group relative cursor-pointer"
          title="Copy invite link"
        >
          {copied ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
            {copied ? 'Copied!' : 'Copy Link'}
          </div>
        </button>

        <div className="w-px h-8 bg-white/10 mx-2"></div>

        {/* Audio Toggle */}
        <button
          onClick={onToggleAudio}
          className={`p-4 rounded-xl transition-all cursor-pointer ${
            isAudioOn 
              ? 'bg-white/10 hover:bg-white/20 text-white' 
              : 'bg-red-500/20 text-red-500 hover:bg-red-500/30'
          }`}
        >
          {isAudioOn ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
        </button>

        {/* Video Toggle */}
        <button
          onClick={onToggleVideo}
          className={`p-4 rounded-xl transition-all cursor-pointer ${
            isVideoOn 
              ? 'bg-white/10 hover:bg-white/20 text-white' 
              : 'bg-red-500/20 text-red-500 hover:bg-red-500/30'
          }`}
        >
          {isVideoOn ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
        </button>

        {/* Picture in Picture */}
        <button
          onClick={onTogglePiP}
          className="p-4 rounded-xl transition-all cursor-pointer bg-white/10 hover:bg-white/20 text-white hidden sm:block"
          title="Picture-in-Picture"
        >
          <PictureInPicture className="w-6 h-6" />
        </button>

        <div className="w-px h-8 bg-white/10 mx-2"></div>

        {/* End Call */}
        <button
          onClick={onEndCall}
          className="p-4 rounded-xl bg-red-600 hover:bg-red-700 text-white transition-all shadow-lg shadow-red-600/20 cursor-pointer"
          title="End Call"
        >
          <PhoneOff className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}
