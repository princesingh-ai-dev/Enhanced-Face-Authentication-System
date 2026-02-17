# 🔐 FaceGuard Auth — Secure Face Authentication System

<div align="center">

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

**Secure, real-time biometric access system with face-api.js, glassmorphism UI & local-first privacy.**

Register faces, authenticate users, and manage access — all running in the browser with zero cloud dependency.

</div>

---

## ✨ Features

- 🎥 **Real-Time Face Detection** — Browser-based face detection with face-api.js (no server-side processing)
- 🔐 **Secure Authentication** — Compares face descriptors against stored embeddings for identity verification
- 👤 **User Management** — Register new users and delete existing ones through the UI
- 🎨 **Glassmorphism UI** — Modern, responsive design with frosted glass effects
- 🏠 **Local Privacy** — All face descriptors stored locally in `embeddings.json` — your data never leaves your machine

## 🎬 How It Works

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Browser        │────▶│   face-api.js    │────▶│   Compare with  │
│   Webcam Feed    │     │   Detection +    │     │   Stored Face   │
│                  │     │   Descriptor     │     │   Embeddings    │
└─────────────────┘     └──────────────────┘     └────────┬────────┘
                                                          │
                                                    Match Found?
                                                    ├── ✅ Grant Access
                                                    └── ❌ Deny Access
```

## 📋 Prerequisites

- [Node.js](https://nodejs.org/) v14 or higher
- A webcam or camera-enabled device

## 🚀 Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/princesingh-ai-dev/Enhanced-Face-Authentication-System.git
cd Enhanced-Face-Authentication-System

# 2. Install dependencies (auto-downloads face-api.js models)
npm install

# 3. Start the server
npm start

# 4. Open http://localhost:3000 in your browser
```

## 📁 Project Structure

```
Enhanced-Face-Authentication-System/
├── server.js           # Express backend — API routes & data storage
├── download_models.js  # Auto-download face-api.js models
├── embeddings.json     # Stored face descriptors (auto-created)
├── package.json        # Dependencies & scripts
└── public/
    ├── index.html      # Main application page
    ├── script.js       # Frontend logic — camera + face-api.js
    ├── style.css       # Glassmorphism-inspired styling
    └── models/         # face-api.js neural network models
```

## 🛠️ Tech Stack

| Component | Technology |
|-----------|------------|
| Backend | Node.js + Express |
| Face Detection | face-api.js (TensorFlow.js) |
| Frontend | HTML5 + CSS3 + Vanilla JS |
| UI Design | Glassmorphism, responsive |
| Storage | Local JSON file |

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| Models not loading | Run `npm run postinstall` to download models |
| Camera not working | Check browser permissions; close other camera apps |
| "Face Mismatch" | Ensure good lighting, look directly at camera |
| Port in use | Change port in `server.js` or kill the process |

## 📄 License

MIT License — Feel free to use and modify!