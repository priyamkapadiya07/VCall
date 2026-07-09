import { useEffect, useRef } from 'react';
import { User, MicOff } from 'lucide-react';

export default function VideoPlayer({ stream, isLocal, isMirrored = false, isMuted, isMicMuted, label, objectFit = 'cover', labelPosition = 'bottom-left', id }) {
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
      <div className="w-full h-full bg-gray-900 flex items-center justify-center relative overflow-hidden shadow-lg border border-white/5">
        <div className="w-24 h-24 rounded-full bg-gray-800 flex items-center justify-center animate-pulse">
          <User className="w-12 h-12 text-gray-600" />
        </div>
        <div className={`absolute ${getLabelClasses()} text-sm text-white/90`}>
          Waiting...
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative group rounded-xl overflow-hidden bg-black shadow-lg border border-white/5">
      <video
        id={id}
        ref={videoRef}
        autoPlay
        playsInline
        muted={isLocal || isMuted}
        draggable={false}
        className={`w-full h-full pointer-events-none ${isMirrored ? 'scale-x-[-1]' : ''}`}
        style={{ objectFit: objectFit }}
      />
      
      {/* Label and Status */}
      <div className={`absolute ${getLabelClasses()} flex items-center gap-2 z-10`}>
        <div className="flex items-center gap-2">
          <span>{label || (isLocal ? 'You' : 'Friend')}</span>
          {isMicMuted && (
            <span className="flex items-center gap-1 text-red-400 pl-1.5 md:pl-2">
              <MicOff className="w-3.5 h-3.5 animate-pulse" />
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
