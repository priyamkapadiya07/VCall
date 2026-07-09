import { useEffect, useRef } from 'react';
import { User, MicOff } from 'lucide-react';

export default function VideoPlayer({ stream, isLocal, isMuted, isMicMuted, label, objectFit = 'cover', labelPosition = 'bottom-left' }) {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  const getLabelClasses = () => {
    switch (labelPosition) {
      case 'top-right': return 'top-4 right-4';
      case 'top-left': return 'top-4 left-4';
      case 'bottom-right': return 'bottom-4 right-4';
      case 'bottom-left': 
      default: return 'bottom-4 left-4';
    }
  };


  if (!stream) {
    return (
      <div className="w-full h-full bg-gray-900 rounded-2xl flex items-center justify-center relative overflow-hidden shadow-lg border border-white/5">
        <div className="w-24 h-24 rounded-full bg-gray-800 flex items-center justify-center animate-pulse">
          <User className="w-12 h-12 text-gray-600" />
        </div>
        <div className={`absolute ${getLabelClasses()} bg-black/60 px-3 py-1.5 rounded-lg backdrop-blur-sm text-sm text-white/90`}>
          Waiting...
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative group rounded-2xl overflow-hidden bg-black shadow-lg border border-white/5">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={isLocal || isMuted}
        className={`w-full h-full ${isLocal ? 'scale-x-[-1]' : ''}`}
        style={{ objectFit: objectFit }}
      />
      
      {/* Label and Status */}
      <div className={`absolute ${getLabelClasses()} flex items-center gap-2 z-10`}>
        <div className="bg-black/60 px-3 py-1.5 rounded-lg backdrop-blur-sm text-sm font-medium text-white shadow-sm flex items-center gap-2 border border-white/5">
          <span>{label || (isLocal ? 'You' : 'Remote User')}</span>
          {isMicMuted && (
            <span className="flex items-center gap-1 text-red-400 border-l border-white/10 pl-1.5 md:pl-2">
              <MicOff className="w-3.5 h-3.5 animate-pulse" />
              {/* <span className="hidden sm:inline text-[10px] uppercase tracking-wider font-semibold">Muted</span> */}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
