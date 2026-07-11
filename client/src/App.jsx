import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Home from './pages/Home';
import Room from './pages/Room';
import Recordings from './pages/Recordings';
import { Phone, X } from 'lucide-react';

function NavigationHandler() {
  const navigate = useNavigate();
  const [incomingCall, setIncomingCall] = useState(null);

  useEffect(() => {
    let vibrateInterval;

    const handleMessage = (event) => {
      if (!event.data) return;

      if (event.data.type === 'NAVIGATE') {
        navigate(event.data.url);
      } else if (event.data.type === 'INCOMING_CALL') {
        setIncomingCall(event.data.data);
        // Trigger continuous vibration
        if (navigator.vibrate) {
          navigator.vibrate([500, 200, 500, 200]);
          vibrateInterval = setInterval(() => {
            navigator.vibrate([500, 200, 500, 200]);
          }, 1500);
        }
      } else if (event.data.type === 'CANCEL_CALL') {
        // Check if the cancellation is for the current incoming call
        setIncomingCall(prev => {
          if (prev && event.data.roomId && prev.roomId !== event.data.roomId) {
            return prev;
          }
          if (navigator.vibrate) navigator.vibrate(0);
          if (vibrateInterval) clearInterval(vibrateInterval);
          return null;
        });
      }
    };
    
    if (navigator.serviceWorker) {
      navigator.serviceWorker.addEventListener('message', handleMessage);
    }
    
    return () => {
      if (navigator.serviceWorker) {
        navigator.serviceWorker.removeEventListener('message', handleMessage);
      }
      if (navigator.vibrate) navigator.vibrate(0);
      if (vibrateInterval) clearInterval(vibrateInterval);
    };
  }, [navigate]);

  const handleAnswer = () => {
    if (navigator.vibrate) navigator.vibrate(0);
    navigate(incomingCall.url || `/room/${incomingCall.roomId}`);
    setIncomingCall(null);
  };

  const handleDecline = () => {
    if (navigator.vibrate) navigator.vibrate(0);
    setIncomingCall(null);
  };

  return (
    <>
      {incomingCall && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <div className="glass-panel p-8 max-w-sm w-full mx-4 flex flex-col items-center text-center relative border border-white/20 shadow-2xl shadow-indigo-500/20">
            
            {/* Pulsing Avatar/Icon */}
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-indigo-500 rounded-full animate-ping opacity-75"></div>
              <div className="relative w-20 h-20 bg-indigo-600 rounded-full flex items-center justify-center shadow-lg">
                <Phone className="w-10 h-10 text-white animate-pulse" />
              </div>
            </div>

            <h2 className="text-2xl font-bold text-white mb-2">{incomingCall.title || 'Incoming Call'}</h2>
            <p className="text-gray-300 mb-8">{incomingCall.body || 'Someone is calling you...'}</p>

            <div className="flex gap-4 w-full">
              <button 
                onClick={handleDecline}
                className="flex-1 py-3 px-4 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/50 text-red-500 font-medium transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <X className="w-5 h-5" />
                Decline
              </button>
              <button 
                onClick={handleAnswer}
                className="flex-1 py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/30 hover:scale-105 active:scale-95 cursor-pointer"
              >
                <Phone className="w-5 h-5" />
                Answer
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function App() {
  return (
    <Router>
      <NavigationHandler />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/room/:id" element={<Room />} />
        <Route path="/record" element={<Recordings />} />
      </Routes>
    </Router>
  );
}

export default App;
