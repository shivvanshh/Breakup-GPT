# 💔 BreakupGPT (Bollywood AI Edition)

> **Built for INFINITY 2K26 — Jain's Got Latent** 🎤✨

BreakupGPT is an AI-powered web application that analyzes chat messages, screenshots, and audio clips to predict a breakup with savage, dramatic, and hilariously accurate relationship diagnoses — powered by **Google Gemini 2.5 Flash**.

---

## 🚀 Features

### 🤖 Real AI Analysis
- Powered by **Google Gemini 2.5 Flash** — no static logic or keyword heuristics
- Dynamic, context-aware analysis with GenZ slang, Bollywood references, and brutal honesty
- Returns scored metrics: **Breakup Probability** and **Toxicity Level** (0–100%)

### 🔑 Smart API Key Rotation
- **7 API keys** running in round-robin rotation
- Auto-failover: if one key hits rate limits, the system automatically tries the next
- Full cycle retry ensures maximum uptime during live demos

### 📱 Multimodal Input Support
- **Text**: Paste raw chat conversations, GenZ slang, or emojis
- **Images**: Upload chat screenshots — the AI reads them directly via native OCR
- **Audio**: Upload voice notes — the AI analyzes **tone, pauses, and emotion**, not just words
- Drag-and-drop file upload with preview chips

### 💬 20 Relationship Modes
Covers every type of modern GenZ relationship:

| | | |
|---|---|---|
| 💥 Normal | ☠️ Toxic Couple | 🌍 Long Distance |
| 👻 Situationship | 🤡 Delusional | 🔕 Ghosting |
| 🩹 Rebound | 🧲 Clingy | 🎭 FWB |
| 🍞 Breadcrumbing | 💬 Talking Stage | 🔗 Entanglement |
| 📸 Soft Launch | 📋 Roster | 💣 Love Bombing |
| 🪑 Benching | 🧟 Zombie-ing | 🛸 Orbiting |
| 🐱 Catfish | 🤫 Sneaky Link | |

Each mode has a unique doom multiplier and savage description.

### 📊 Results Dashboard (7 Cards)
1. **🎯 The Verdict** — Animated donut chart that counts up from 0% to the AI score
2. **🚩 Red Flags Detected** — AI-generated bullet points from your chat
3. **🔥 Toxicity Meter** — Gradient bar with 25 unique random labels
4. **🎬 Bollywood Diagnosis** — 26 unique Bollywood movie reference roasts
5. **💀 AI's Final Savage Line** — 27 unique savage one-liners (never repeats)
6. **📝 AI Analysis** — Full formatted AI response
7. **😈 Excuse Generator** — AI-powered, context-aware excuse generation

### 🎭 Interactive Sliders
- 🕐 Reply Delay (0–300 mins)
- 👁️ Seen-Zone Count (0–50)
- 💬 Dry Reply Count (0–30)
- 🧠 Trust Issues Level (0–100%)

---

## 🛠️ Tech Stack

| Component | Technology |
|---|---|
| Frontend | HTML5, Vanilla CSS3, ES6 JavaScript |
| Backend | Node.js + Express.js |
| AI Engine | Google Gemini 2.5 Flash (REST API) |
| Key Management | 7-key round-robin with auto-failover |
| Styling | Glassmorphism, CSS Variables, Dark Theme |
| Animations | CSS transitions, SVG donut chart, confetti |

---

## 💻 How to Run

### Prerequisites
- Node.js (v18+)
- 1–7 Google Gemini API Keys

### Setup

1. **Clone the repo**
   ```bash
   git clone <repo-url>
   cd "Jain's Got Latent"
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure API keys** — Create a `.env` file:
   ```env
   GEMINI_API_KEY_1=your_key_here
   GEMINI_API_KEY_2=your_key_here
   GEMINI_API_KEY_3=your_key_here
   GEMINI_API_KEY_4=your_key_here
   GEMINI_API_KEY_5=your_key_here
   GEMINI_API_KEY_6=your_key_here
   GEMINI_API_KEY_7=your_key_here
   ```

4. **Start the server**
   ```bash
   npm start
   ```

5. **Open in browser**
   ```
   http://localhost:3000
   ```

---

## 📡 API Endpoints

| Endpoint | Method | Description |
|---|---|---|
| `POST /api/analyze` | POST | Analyze chat text + media files |
| `POST /api/excuse` | POST | Generate AI-powered savage excuse |
| `GET /` | GET | Serve the frontend |

### Example: Analyze Request
```json
{
  "text": "she said 'k' and I haven't recovered since",
  "files": [
    { "data": "<base64>", "mimeType": "image/png" }
  ],
  "mode": "toxic"
}
```

### Example: Response
```json
{
  "success": true,
  "analysis": "🚩 The single 'k' carries more emotional damage than...",
  "breakupScore": 87,
  "toxicityScore": 72,
  "provider": "gemini"
}
```

---

## 🎤 Live Demo Tips

1. **Ask a volunteer** to share a vague text they received (like "k" or "hmm ok")
2. **Drag the sliders** dramatically — max out "Seen-Zone Count" for laughs
3. **Select a spicy mode** — try 🤫 Sneaky Link or 🧟 Zombie-ing for audience reactions
4. **Hit Analyze** and watch the donut chart count up live
5. **Generate an Excuse** after the verdict for the perfect savage response
6. **Upload audio** — sigh into the mic and let Gemini analyze the emotional damage

---

## 📁 Project Structure

```
Jain's Got Latent/
├── index.html          # Main UI (input, results dashboard)
├── style.css           # Glassmorphism styling, animations
├── script.js           # Frontend logic, sliders, API calls
├── server.js           # Express backend, key rotation, AI endpoints
├── package.json        # Node.js dependencies
├── .env                # API keys (not committed)
├── .env.example        # Template for API keys
├── implementation_plan.md
└── README.md
```

---

## ⚠️ Known Limitations

- **Free-tier rate limits**: If all 7 keys are exhausted simultaneously, the system shows a "try again" message
- **Audio file size**: Large audio files (>50MB) may hit the Express payload limit
- **Gemini latency**: Occasional high latency during peak demand; the retry loop mitigates this

---

*Disclaimer: BreakupGPT uses real AI, but the results are designed for entertainment, satire, and maximum chaos. Do not make life decisions based on this app. 💀*
