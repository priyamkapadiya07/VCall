import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Video, Keyboard, Plus } from 'lucide-react';

export default function Home() {
  const [roomId, setRoomId] = useState('');
  const navigate = useNavigate();

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

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="glass-panel w-full max-w-4xl grid md:grid-cols-2 overflow-hidden">
        {/* Left Section - Hero */}
        <div className="p-10 flex flex-col justify-center bg-indigo-950/30">
          <div className="mb-8">
            <div className="inline-flex items-center justify-center p-3 bg-indigo-500/20 rounded-xl mb-6">
              <Video className="w-8 h-8 text-indigo-400" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
              Welcome to VCall
            </h1>
          </div>
        </div>

        {/* Right Section - Actions */}
        <div className="p-10 flex flex-col justify-center border-l border-white/5 bg-black/20">
          <div className="space-y-6">
            <button 
              onClick={createRoom}
              className="btn btn-primary w-full py-4 text-lg font-medium group"
            >
              <Plus className="w-6 h-6 mr-2 transition-transform group-hover:rotate-90" />
              New Meeting
            </button>

            <div className="relative flex items-center py-2">
              <div className="flex-grow border-t border-white/10"></div>
              <span className="flex-shrink-0 mx-4 text-gray-500 text-sm">or join an existing one</span>
              <div className="flex-grow border-t border-white/10"></div>
            </div>

            <form onSubmit={handleJoin} className="space-y-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Keyboard className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Enter a room code or link"
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-white placeholder-gray-500 transition-all"
                />
              </div>
              <button 
                type="submit" 
                disabled={!roomId.trim()}
                className="btn btn-secondary w-full py-4 text-lg font-medium"
              >
                Join Meeting
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
