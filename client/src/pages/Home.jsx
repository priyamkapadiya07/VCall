import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Video, Keyboard, Plus, Sparkles, Shield, Zap, DownloadCloud } from 'lucide-react';
import Contacts from '../components/Contacts';

export default function Home() {
  const [roomId, setRoomId] = useState('');
  const navigate = useNavigate();

  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    // If already running as an installed PWA, do not show install prompt
    if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) {
      return;
    }

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    const handleAppInstalled = () => {
      setIsInstallable(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Also listen for display-mode changes just in case
    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    const handleMediaQueryChange = (e) => {
      if (e.matches) {
        setIsInstallable(false);
      }
    };
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleMediaQueryChange);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleMediaQueryChange);
      }
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstallable(false);
      }
      setDeferredPrompt(null);
    }
  };

  const handleJoin = (e) => {
    e.preventDefault();
    if (roomId.trim()) {
      navigate(`/room/${roomId.trim()}`);
    }
  };

  const createRoom = () => {
    const id = Math.random().toString(36).substring(2, 10);
    navigate(`/room/${id}`);
  };

  const clickCountRef = useRef(0);
  const clickTimerRef = useRef(null);
  const longPressTimerRef = useRef(null);

  const handleSecretClick = () => {
    clickCountRef.current += 1;
    if (clickCountRef.current === 3) {
      navigate('/record');
      clickCountRef.current = 0;
    }
    if (clickTimerRef.current) clearTimeout(clickTimerRef.current);
    clickTimerRef.current = setTimeout(() => {
      clickCountRef.current = 0;
    }, 500);
  };

  const handleSecretTouchStart = () => {
    longPressTimerRef.current = setTimeout(() => {
      navigate('/record');
    }, 800);
  };

  const handleSecretTouchEnd = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-8 bg-[#0a0a0a] relative overflow-hidden">
      
      {/* Install App Button */}
      {isInstallable && (
        <div className="fixed glass-panel top-4 right-4 md:top-8 md:right-8 z-50">
          <button 
            onClick={handleInstallClick}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-white/10 to-white/20 hover:from-white/30 hover:to-white/10 text-white text-sm font-medium rounded-2xl  transition-all hover:scale-101 cursor-pointer"
          >
            <DownloadCloud className="w-4 h-4" />
            Install App
          </button>
        </div>
      )}

      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/20 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[120px]"></div>
      </div>

      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 lg:gap-16 items-center relative z-10">
        
        {/* Left Section - Hero Visual */}
        <div className="order-2 lg:order-1 flex flex-col justify-center items-center lg:items-start text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8 backdrop-blur-md">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span className="text-sm font-medium text-gray-300">Premium Video Calling</span>
          </div>
          
          <h1 className="text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight mb-6 text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-200 to-purple-400 leading-tight">
            Connect <br className="hidden lg:block"/>
            <span className="text-white">Seamlessly.</span>
          </h1>
          
          <p className="text-lg text-gray-400 mb-10 max-w-lg leading-relaxed">
            Experience ultra-low latency, peer-to-peer video calls with crystal clear audio. No downloads, no accounts, just pure connection.
          </p>

          <div className="w-full max-w-md glass-panel p-6 shadow-2xl border-white/10 relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
            
            <button 
              onClick={createRoom}
              className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-lg flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/25 transition-all hover:scale-[1.02] active:scale-[0.98] mb-6 cursor-pointer"
            >
              <Video className="w-5 h-5" />
              Start New Meeting
            </button>

            <div className="relative flex items-center py-4 mb-2">
              <div className="flex-grow border-t border-white/10"></div>
              <span className="flex-shrink-0 mx-4 text-gray-500 text-sm font-medium uppercase tracking-wider">or join existing</span>
              <div className="flex-grow border-t border-white/10"></div>
            </div>

            <form onSubmit={handleJoin} className="relative flex flex-col sm:flex-row gap-3">
              <div className="relative flex-grow">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Keyboard className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Enter room code"
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-black/40 border border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-white placeholder-gray-500 transition-all font-medium"
                />
              </div>
              <button 
                type="submit" 
                disabled={!roomId.trim()}
                className="px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/5 text-white font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg backdrop-blur-md cursor-pointer whitespace-nowrap"
              >
                Join
              </button>
            </form>

            {/* Contacts Integration */}
            <Contacts />
          </div>

          {/* Features Row */}
          <div className="grid grid-cols-2 gap-4 sm:gap-6 mt-12 w-full max-w-md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center shrink-0">
                <Zap className="w-5 h-5 text-indigo-400" />
              </div>
              <span className="text-sm font-medium text-gray-300">Fast P2P Connection</span>
            </div>
            <div 
              className="flex items-center gap-3 cursor-pointer select-none"
              onClick={handleSecretClick}
              onTouchStart={handleSecretTouchStart}
              onTouchEnd={handleSecretTouchEnd}
              onTouchCancel={handleSecretTouchEnd}
            >
              <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center shrink-0">
                <Shield className="w-5 h-5 text-purple-400" />
              </div>
              <span className="text-sm font-medium text-gray-300">Secure & Private</span>
            </div>
          </div>
        </div>

        {/* Right Section - 3D Image */}
        <div className="order-1 lg:order-2 flex justify-center items-center relative perspective-1000 mb-8 lg:mb-0 mt-5">
          <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/20 to-cyan-500/20 rounded-full blur-3xl scale-90 mix-blend-screen"></div>
          <img 
            src="/hero-image.png" 
            alt="Global Connection" 
            className="w-full max-w-[280px] sm:max-w-md lg:max-w-xl object-contain drop-shadow-[0_0_40px_rgba(99,102,241,0.2)] animate-float"
            style={{ 
              animation: 'float 6s ease-in-out infinite' 
            }}
          />
        </div>
        
      </div>
    </div>
  );
}
