# VCall: Premium Peer-to-Peer Video Calling

A completely private, secure, and modern one-to-one video calling web application built with the MERN stack (React, Node.js, Express, Socket.IO, WebRTC). This application focuses on simplicity and privacy—no database is used for the core application, and user information is never stored.

## ✨ Core Features

- **🎥 High-Quality WebRTC:** Crystal clear, peer-to-peer video and audio streams.
- **⚡ Real-Time Signaling:** Lightning-fast connection establishment via Socket.IO.
- **🔒 Secure & Private:** No database, no accounts, completely anonymous. Rooms exist only while users are connected.
- **🖥️ Screen Sharing:** Native desktop screen sharing with seamless hot-swapping between camera and screen.
- **🔄 Smart Camera Switch:** Toggle between front and back mobile cameras with robust hardware fallbacks.
- **📌 Draggable Picture-in-Picture:** Custom PiP overlay that can be freely dragged anywhere on the screen with smart edge-clamping.
- **📱 Native Mobile App Feel:** Hideable controls, disabled pull-to-refresh on calls, disabled zooming, and touch-friendly UI.

## 🔴 Local Call Recording (New!)

VCall now supports secure, fully local call recording! Your recordings are never uploaded to a server—they are saved directly to your browser's IndexedDB.

- **Audio Only or Video & Audio:** Choose what you want to capture before starting.
- **Pulsing Indicator:** A sleek recording timer and red dot appears so you know exactly when you're recording.
- **Local Storage Management:** Preview your recordings in a built-in media player, download them as `.webm` files directly to your device, or delete them when you're done.

### How to Access the Recordings Page (Easter Egg) 🕵️‍♂️
Because privacy is our priority, the `/record` dashboard is completely hidden from the main UI. To access it:
- **On Desktop:** Go to the Home Page and **Triple-Click (3 times fast)** on the "Secure & Private" icon/text.
- **On Mobile:** Go to the Home Page and **Long-Press (1 second)** on the "Secure & Private" icon/text.
*(Alternatively, you can just type `/record` into your browser's address bar).*

## 📲 Progressive Web App (PWA)

VCall is fully configured as a Progressive Web App. You can install it directly onto your Desktop, Android, or iOS device!
- **Offline Access:** Once installed, you can open the app and view your saved recordings locally even without an internet connection.
- **Native Experience:** Runs in standalone mode without a browser address bar, completely preventing accidental zooms or pull-to-refreshes.
- **How to Install:** Simply visit the website on a supported browser (like Chrome or Safari). An "Install App" button will smoothly appear in the top right corner of the home screen!

## 🚀 Local Development Setup

1. **Clone the repository** (or download the source code).
2. **Setup the Server (Backend)**
   ```bash
   cd server
   npm install
   npm run dev
   ```
   The backend will start on `http://localhost:5000`.

3. **Setup the Client (Frontend)**
   Open a new terminal window.
   ```bash
   cd client
   npm install
   npm run dev
   ```
   The frontend will start on `http://localhost:5173`.

4. **Test Locally**
   - Open `http://localhost:5173` in your browser.
   - Click "Start New Meeting" to generate a room.
   - Copy the Room ID and open it in another tab or browser to simulate a second user.

## 🌍 Deployment Guide

### Deploying the Backend (Render)
1. Push your code to a GitHub repository.
2. Go to [Render.com](https://render.com/) and create a new **Web Service**.
3. Connect your GitHub repository and set the Root Directory to `server`.
4. Build Command: `npm install` | Start Command: `npm start`
5. Add Environment Variable: `CLIENT_URL` = `https://your-frontend.vercel.app`

### Deploying the Frontend (Vercel)
1. Go to [Vercel.com](https://vercel.com/) and create a new Project.
2. Import your GitHub repository and set the Root Directory to `client`.
3. Framework Preset: **Vite**
4. Add Environment Variable: `VITE_SERVER_URL` = `https://your-backend.onrender.com`
5. Deploy the project! The PWA Service Worker and Manifest will be built automatically.
