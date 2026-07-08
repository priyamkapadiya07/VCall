import { useEffect, useRef } from 'react';
import { User, MicOff } from 'lucide-react';

export default function VideoPlayer({ stream, isLocal, isMuted, label, objectFit = 'cover' }) {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  if (!stream) {
    return (
      <div className="w-full h-full bg-gray-900 rounded-2xl flex items-center justify-center relative overflow-hidden shadow-lg border border-white/5">
        <div className="w-24 h-24 rounded-full bg-gray-800 flex items-center justify-center animate-pulse">
          <User className="w-12 h-12 text-gray-600" />
        </div>
        <div className="absolute bottom-4 left-4 bg-black/60 px-3 py-1.5 rounded-lg backdrop-blur-sm text-sm text-white/90">
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
      <div className="absolute bottom-4 left-4 flex items-center gap-2">
        <div className="bg-black/60 px-3 py-1.5 rounded-lg backdrop-blur-sm text-sm font-medium text-white shadow-sm flex items-center gap-2">
          {label || (isLocal ? 'You' : 'Remote User')}
        </div>
      </div>
    </div>
  );
}
