# One-to-One Video Calling Web Application

A temporary, modern one-to-one video calling web application built with the MERN stack (React, Node.js, Express, Socket.IO, WebRTC). This application focuses on simplicity and privacy—no database is used, and user information is never stored. Rooms exist only while users are connected.

## Features

- 🎥 High-quality WebRTC video and audio
- ⚡ Real-time signaling with Socket.IO
- 🔒 No database, no accounts, completely anonymous
- 🎨 Modern, responsive dark theme UI with Tailwind CSS
- 📱 Mobile and desktop friendly

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn

## Local Development Setup

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
   - Click "New Meeting" to generate a room.
   - Copy the URL or Room ID and open it in another tab or browser to simulate a second user.

## Environment Variables

### Server (`server/.env` - optional for local dev)
```env
PORT=5000
CLIENT_URL=http://localhost:5173
```
*Note for production: Set `CLIENT_URL` to your Vercel deployment URL.*

### Client (`client/.env`)
```env
VITE_SERVER_URL=http://localhost:5000
```
*Note for production: Set `VITE_SERVER_URL` to your Render deployment URL.*

## Deployment Guide

### Deploying the Backend (Render)

1. Push your code to a GitHub repository.
2. Go to [Render.com](https://render.com/) and create a new **Web Service**.
3. Connect your GitHub repository.
4. Configure the service:
   - **Root Directory**: `server`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. Add Environment Variables:
   - `CLIENT_URL`: The URL where your frontend will be deployed (e.g., `https://your-frontend.vercel.app`).
6. Deploy the service and copy the generated Render URL.

### Deploying the Frontend (Vercel)

1. Go to [Vercel.com](https://vercel.com/) and create a new Project.
2. Import your GitHub repository.
3. Configure the project:
   - **Framework Preset**: Vite
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Add Environment Variables:
   - `VITE_SERVER_URL`: The URL of your deployed Render backend (e.g., `https://your-backend.onrender.com`).
5. Deploy the project.

## Architecture & Code Quality
- **Signaling**: Socket.IO is used exclusively for signaling (exchanging offer, answer, and ICE candidates).
- **Media**: Video and audio are transmitted peer-to-peer via WebRTC. Media never passes through the Express server.
- **Components**: UI is broken down into reusable React components (`VideoPlayer`, `Controls`).
- **Custom Hook**: All WebRTC logic is encapsulated inside `hooks/useWebRTC.js` for clean separation of concerns.
