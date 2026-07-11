import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getContacts, saveContact, deleteContact } from '../utils/indexedDB';
import { Users, UserPlus, Phone, Copy, Check, Trash2, X, QrCode } from 'lucide-react';

const publicVapidKey = 'BN5Xh3_NVY2vrWf8Px8jlflcZ-uI03IGGKJw1C6SRztjSozxGg4XzEeX_rcXqhI6revltjMlj9K6QAJzX5D95gI';

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export default function Contacts() {
  const [contacts, setContacts] = useState([]);
  const [myCode, setMyCode] = useState('');
  const [showMyCode, setShowMyCode] = useState(false);
  const [showAddFriend, setShowAddFriend] = useState(false);
  const [friendName, setFriendName] = useState('');
  const [friendCode, setFriendCode] = useState('');
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    const data = await getContacts();
    setContacts(data);
  };

  const generateMyCode = async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      alert('Push notifications are not supported by your browser.');
      return;
    }
    
    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        alert('You must enable notifications to get your calling code.');
        return;
      }
      
      const registration = await navigator.serviceWorker.ready;
      let subscription = await registration.pushManager.getSubscription();
      
      if (!subscription) {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(publicVapidKey)
        });
      }
      
      const subJson = JSON.stringify(subscription);
      const base64Str = btoa(subJson);
      setMyCode(base64Str);
      setShowMyCode(true);
    } catch (e) {
      console.error(e);
      alert('Failed to generate code.');
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(myCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAddFriend = async (e) => {
    e.preventDefault();
    if (!friendName || !friendCode) return;
    try {
      atob(friendCode); // Test if it's base64
      await saveContact({ name: friendName, subscriptionStr: friendCode, timestamp: Date.now() });
      setFriendName('');
      setFriendCode('');
      setShowAddFriend(false);
      loadContacts();
    } catch (e) {
      alert('Invalid Friend Code format.');
    }
  };

  const callFriend = async (contact) => {
    try {
      const subscription = JSON.parse(atob(contact.subscriptionStr));
      const roomId = Math.random().toString(36).substring(2, 10);
      
      const serverUrl = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000';
      await fetch(`${serverUrl}/api/push`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscription,
          payload: { url: `/room/${roomId}`, title: 'Incoming Video Call', body: 'A friend is calling you!' }
        })
      });
      
      navigate(`/room/${roomId}`, { state: { calledSubscription: subscription } });
    } catch (e) {
      console.error(e);
      alert('Failed to call friend. Ensure they have the app installed.');
    }
  };

  return (
    <div className="w-full mt-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-medium flex items-center gap-2">
          <Users className="w-5 h-5 text-indigo-400" />
          Friends
        </h3>
        <div className="flex gap-2">
          <button onClick={generateMyCode} className="p-2 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 transition-colors" title="My Code">
            <QrCode className="w-4 h-4" />
          </button>
          <button onClick={() => setShowAddFriend(true)} className="p-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 transition-colors" title="Add Friend">
            <UserPlus className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {contacts.length === 0 ? (
          <div className="text-center p-4 bg-white/5 rounded-xl border border-white/5 text-gray-500 text-sm">
            No friends added yet.
          </div>
        ) : (
          contacts.map(contact => (
            <div key={contact.id} className="flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 transition-colors">
              <span className="text-gray-200 font-medium">{contact.name}</span>
              <div className="flex gap-2">
                <button 
                  onClick={() => callFriend(contact)}
                  className="w-8 h-8 rounded-full bg-emerald-500/20 hover:bg-emerald-500 flex items-center justify-center text-emerald-400 hover:text-white transition-all shadow-lg hover:shadow-emerald-500/50"
                >
                  <Phone className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => {
                    deleteContact(contact.id);
                    loadContacts();
                  }}
                  className="w-8 h-8 rounded-full bg-red-500/10 hover:bg-red-500/20 flex items-center justify-center text-red-400 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* My Code Modal */}
      {showMyCode && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="glass-panel p-6 max-w-sm w-full mx-4 relative">
            <button onClick={() => setShowMyCode(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white"><X className="w-5 h-5"/></button>
            <h3 className="text-xl font-bold mb-2 text-white">Your Calling Code</h3>
            <p className="text-sm text-gray-400 mb-4">Send this code to your friends so they can call you.</p>
            <div className="bg-black/50 p-3 rounded-lg flex items-center gap-3 mb-4">
              <code className="text-indigo-400 text-xs break-all line-clamp-3">{myCode}</code>
              <button onClick={copyCode} className="p-2 shrink-0 rounded-md bg-white/10 hover:bg-white/20 text-white transition-colors">
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Friend Modal */}
      {showAddFriend && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="glass-panel p-6 max-w-sm w-full mx-4 relative">
            <button onClick={() => setShowAddFriend(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white"><X className="w-5 h-5"/></button>
            <h3 className="text-xl font-bold mb-4 text-white">Add a Friend</h3>
            <form onSubmit={handleAddFriend} className="space-y-4">
              <div>
                <input 
                  type="text" required placeholder="Friend's Name" 
                  value={friendName} onChange={e => setFriendName(e.target.value)}
                  className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-white placeholder-gray-500"
                />
              </div>
              <div>
                <textarea 
                  required placeholder="Paste their Calling Code here..." rows="3"
                  value={friendCode} onChange={e => setFriendCode(e.target.value)}
                  className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-white placeholder-gray-500 resize-none text-xs font-mono"
                ></textarea>
              </div>
              <button type="submit" className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-medium transition-all shadow-lg shadow-emerald-500/20">
                Save Friend
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
