# BreakupGPT — Implementation Plan v2.0

> **Project:** BreakupGPT (Bollywood AI Edition)
> **Event:** INFINITY 2K26 — Jain's Got Latent
> **Last Updated:** April 28, 2026

---

## 1. Architecture Overview

### Tech Stack
| Layer | Technology |
|---|---|
| **Frontend** | HTML5, Vanilla CSS3 (Glassmorphism), ES6 JavaScript |
| **Backend** | Node.js + Express.js (v4.19) |
| **AI Engine** | Google Gemini 2.5 Flash via REST API |
| **Key Mgmt** | 7-key round-robin rotation with auto-failover |
| **Config** | dotenv (`.env` with `GEMINI_API_KEY_1` through `GEMINI_API_KEY_7`) |

### Data Flow
```
User Input (text/audio/image)
    → Frontend (base64 encoding)
        → Express Backend (/api/analyze)
            → Gemini 2.5 Flash (with key rotation)
                → Parse BREAKUP_SCORE + TOXICITY_SCORE
                    → JSON response → Frontend rendering
```

---

## 2. Backend Implementation

### 2.1 API Key Rotation (`server.js`)
- **7 Gemini API keys** loaded from `.env` at startup
- **Round-robin rotation**: Each request uses the next key in sequence (Key 1 → 2 → ... → 7 → 1)
- **Auto-failover**: On `429` (rate limit) or `503` (high demand), automatically retries with the next key
- **Full cycle retry**: Tries all 7 keys before returning an error
- **Logging**: Terminal logs show which key is being used and whether it succeeded or failed

### 2.2 API Endpoints
| Endpoint | Method | Purpose |
|---|---|---|
| `/api/analyze` | POST | Analyzes chat text + media, returns AI verdict with scores |
| `/api/excuse` | POST | Generates a context-aware, savage excuse using AI |
| `/` | GET | Serves the static frontend files |

### 2.3 Score Parsing
The AI is prompted to include `BREAKUP_SCORE: [0-100]` and `TOXICITY_SCORE: [0-100]` tags in its response. The backend:
1. Extracts both scores via regex
2. Clamps them to 0–100
3. Strips the tags from the display text
4. Returns `{ analysis, breakupScore, toxicityScore }` as clean JSON

### 2.4 Excuse Generator
- Uses the chat context + previous AI analysis as prompt input
- Falls back to 5 hardcoded GenZ excuses if all API keys are exhausted

---

## 3. Frontend Implementation

### 3.1 Input System
- **Chat textarea** for pasting raw conversation text
- **File upload** with drag-and-drop support for images and audio
- **File preview chips** showing attached files with remove buttons
- **4 interactive sliders**:
  - 🕐 Reply Delay (0–300 minutes)
  - 👁️ Seen-Zone Count (0–50)
  - 💬 Dry Reply Count (0–30)
  - 🧠 Trust Issues Level (0–100%)

### 3.2 Relationship Modes (20 Total)
| Mode | Multiplier | Description |
|---|---|---|
| 💥 Normal | 1.0x | Standard analysis |
| ☠️ Toxic Couple | +0.3 | Blocking & unblocking every 3 business days |
| 🌍 Long Distance | +0.2 | 90% buffering video calls, 10% trust issues |
| 👻 Situationship | +0.5 | "Going with the flow" (drowning) |
| 🤡 Delusional | -0.2 | Ignoring red flags because "they're stressed" |
| 🔕 Ghosting | +0.6 | Haven't replied since Tuesday |
| 🩹 Rebound | +0.4 | Using someone to get over the ex |
| 🧲 Clingy | +0.35 | "I saw you typing..." |
| 🎭 FWB | +0.45 | Catching feelings (prohibited) |
| 🍞 Breadcrumbing | +0.55 | Dropping just enough hints |
| 💬 Talking Stage | +0.25 | "Talking" for 6 months |
| 🔗 Entanglement | +0.7 | Not cheating if it's an "entanglement" |
| 📸 Soft Launch | +0.15 | Posting hands, hiding faces |
| 📋 Roster | +0.65 | Dating 5 people, disappointing all |
| 💣 Love Bombing | +0.5 | "Never felt this way" — sent to 3 people |
| 🪑 Benching | +0.4 | On the bench, not in the game |
| 🧟 Zombie-ing | +0.55 | Ex liked your 2022 pic |
| 🛸 Orbiting | +0.35 | Won't text, watches every story |
| 🐱 Catfish | +0.8 | Video call didn't match the profile |
| 🤫 Sneaky Link | +0.6 | "Don't post me" |

### 3.3 Results Dashboard (7 Cards)
1. **The Verdict** — Animated donut chart counting from 0% to AI score with color transitions (green → orange → red)
2. **Red Flags Detected** — AI-generated bullet points from chat analysis
3. **Toxicity Meter** — Gradient progress bar with 25 random labels across 5 severity tiers
4. **Bollywood Diagnosis** — 26 random Bollywood movie reference quotes
5. **AI's Final Savage Line** — 27 random savage one-liners
6. **AI Analysis** — Full AI response with formatted text
7. **Excuse Generator** — AI-powered context-aware excuse generation

### 3.4 Animations & UX
- **Verdict counter animation**: 0% → target% in 20ms steps with `textContent` (SVG-compatible)
- **Donut chart color transitions**: Green (≤40%) → Orange (≤70%) → Red (>70%)
- **Rain overlay** with random falling drops for dramatic effect
- **Card shake & pulse-red** effects for high breakup scores (>85%)
- **Confetti explosion** on the meme number (69%)
- **Loading sequence** with multi-step progress bar

---

## 4. Dynamic Content System

### Toxicity Labels (5 tiers × 5 phrases = 25 unique labels)
| Tier | Score Range | Sample |
|---|---|---|
| 🟢 Low | 0–20% | "Healthy? In THIS economy? Respect." |
| 🟡 Mild | 21–40% | "Minor turbulence. Seatbelts recommended." |
| 🟠 Medium | 41–60% | "Like a 3-star Zomato review of love." |
| 🔴 High | 61–80% | "Our servers filed an HR complaint." |
| ☠️ Critical | 81–100% | "Toxicity level: Chernobyl." |

### Bollywood Quotes (26 unique)
From Kabir Singh to Munna Bhai, every analysis pulls a fresh reference.

### Savage AI Lines (27 unique)
From WiFi stability jokes to communist parade references, never the same twice.

---

## 5. Error Handling & Resilience

- **Key exhaustion**: After cycling all 7 keys, returns a user-friendly "try again in a minute" error
- **Excuse fallback**: If AI fails, hardcoded GenZ excuses prevent a blank screen
- **Network errors**: Caught and logged per-key, never crashes the server
- **Payload limits**: Express configured for 50MB payloads (audio/image support)

---

## 6. Future Roadmap

- [ ] **Loading state** for the Excuse Generator button
- [ ] **Key health dashboard** — Track which keys are exhausted vs active
- [ ] **Export to Instagram** — Canvas screenshot of the diagnosis card
- [ ] **Spotify integration** — Auto-play a sad Bollywood song based on diagnosis
- [ ] **Serverless migration** — Move to Cloud Functions for public deployment
- [ ] **Chat history** — Store past analyses in localStorage
