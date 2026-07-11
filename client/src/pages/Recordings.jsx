import { useState, useEffect } from 'react';
import { getAllRecordings, deleteRecording } from '../utils/indexedDB';
import { Video, Mic, Trash2, Download, AlertCircle, Clock, Calendar, Hash, HardDrive, Play, X } from 'lucide-react';

export default function Recordings() {
  const [recordings, setRecordings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [previewRec, setPreviewRec] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    fetchRecordings();
  }, []);

  const fetchRecordings = async () => {
    try {
      setLoading(true);
      const data = await getAllRecordings();
      // Sort by newest first
      data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      setRecordings(data);
    } catch (err) {
      console.error("Failed to load recordings", err);
      setError("Failed to load recordings");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (recording) => {
    const url = URL.createObjectURL(recording.blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    
    // File extension based on type
    const ext = recording.type === 'video' ? 'webm' : 'webm'; 
    a.download = `VCall_${recording.roomId}_${new Date(recording.timestamp).getTime()}.${ext}`;
    
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const handleDeleteClick = (id) => {
    setDeleteId(id);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteRecording(deleteId);
      setRecordings(recordings.filter(rec => rec.id !== deleteId));
      setDeleteId(null);
    } catch (err) {
      console.error("Failed to delete recording", err);
      setError("Failed to delete recording");
      setDeleteId(null);
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const formatSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f1115] text-white p-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f1115] text-white p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-12 mt-4 flex flex-col items-center justify-center text-center">
          <div className="inline-flex items-center justify-center p-3.5 mb-5 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 shadow-2xl shadow-blue-500/20 backdrop-blur-md">
            <Video className="w-8 h-8 text-blue-400" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-400 to-emerald-400 drop-shadow-sm">
              Saved Sessions
            </span>
          </h1>
          <p className="text-gray-400 max-w-lg mx-auto text-sm md:text-base leading-relaxed">
            Captured call recordings are stored locally on your device.
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl flex items-center gap-3 mb-8">
            <AlertCircle className="w-5 h-5" />
            <p>{error}</p>
          </div>
        )}

        {recordings.length === 0 && !error ? (
          <div className="glass-panel p-12 text-center flex flex-col items-center justify-center min-h-[400px]">
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-4">
              <Video className="w-10 h-10 text-gray-500" />
            </div>
            <h2 className="text-xl font-medium text-white mb-2">No recordings found</h2>
            <p className="text-gray-400 max-w-sm">Recordings are saved locally in your browser. Start a call and record it to see it here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recordings.map((rec) => (
              <div key={rec.id} className="glass-panel p-5 group hover:border-white/20 transition-all">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${rec.type === 'video' ? 'bg-blue-500/20 text-blue-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                      {rec.type === 'video' ? <Video className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                    </div>
                    <div>
                      <h3 className="font-medium text-white capitalize">{rec.type} Recording</h3>
                      <div className="flex items-center text-xs text-gray-400 mt-1 gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(rec.timestamp).toLocaleDateString()} | {new Date(rec.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 mb-6">
                  <div className="flex items-center justify-between text-sm text-gray-300 bg-white/5 p-2 rounded-md">
                    <div className="flex items-center gap-2 text-gray-400"><Hash className="w-4 h-4" /> Room</div>
                    <span className="font-mono text-white truncate max-w-[120px]">{rec.roomId}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-300 bg-white/5 p-2 rounded-md">
                    <div className="flex items-center gap-2 text-gray-400"><Clock className="w-4 h-4" /> Duration</div>
                    <span className="font-mono text-white">{formatTime(rec.duration)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-300 bg-white/5 p-2 rounded-md">
                    <div className="flex items-center gap-2 text-gray-400"><HardDrive className="w-4 h-4" /> Size</div>
                    <span className="font-mono text-white">{formatSize(rec.size)}</span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button 
                    onClick={() => handleDownload(rec)}
                    className="flex-1 btn btn-secondary py-2 flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white text-sm"
                  >
                    <Download className="w-4 h-4" /> Download
                  </button>
                  <button 
                    onClick={() => setPreviewRec(rec)}
                    className="p-2 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 transition-colors"
                    title="Preview recording"
                  >
                    <Play className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDeleteClick(rec.id)}
                    className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
                    title="Delete recording"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {previewRec && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="glass-panel w-full max-w-4xl relative overflow-hidden flex flex-col">
            <div className="p-4 border-b border-white/10 flex justify-between items-center bg-black/40">
              <h3 className="font-medium text-white flex items-center gap-2">
                {previewRec.type === 'video' ? <Video className="w-5 h-5 text-blue-400" /> : <Mic className="w-5 h-5 text-emerald-400" />}
                Preview {previewRec.type} Recording
              </h3>
              <button 
                onClick={() => setPreviewRec(null)}
                className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 bg-black flex items-center justify-center min-h-[300px]">
              {previewRec.type === 'video' ? (
                <video 
                  src={URL.createObjectURL(previewRec.blob)} 
                  controls 
                  autoPlay 
                  className="w-full h-auto max-h-[70vh] rounded-lg bg-black shadow-lg"
                />
              ) : (
                <audio 
                  src={URL.createObjectURL(previewRec.blob)} 
                  controls 
                  autoPlay 
                  className="w-full max-w-md shadow-lg"
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="glass-panel p-6 max-w-sm w-full mx-4 text-center relative overflow-hidden">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500/20">
              <Trash2 className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-xl font-bold mb-2 text-white">Delete Recording?</h3>
            <p className="text-gray-400 mb-8 text-sm">
              Are you sure you want to delete this recording?
            </p>
            <div className="flex gap-4">
              <button 
                className="flex-1 py-2.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors font-medium"
                onClick={() => setDeleteId(null)}
              >
                Cancel
              </button>
              <button 
                className="flex-1 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors shadow-lg shadow-red-600/20 font-medium"
                onClick={confirmDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
