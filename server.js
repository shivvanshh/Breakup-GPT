import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Enable CORS and increase payload limit for images/audio
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Serve the frontend static files (index.html, style.css, script.js)
app.use(express.static('.'));

// Setup API Keys (up to 7 for Gemini)
const geminiKeys = [
    process.env.GEMINI_API_KEY_1,
    process.env.GEMINI_API_KEY_2,
    process.env.GEMINI_API_KEY_3,
    process.env.GEMINI_API_KEY_4,
    process.env.GEMINI_API_KEY_5,
    process.env.GEMINI_API_KEY_6,
    process.env.GEMINI_API_KEY_7
].filter(Boolean);

let currentGeminiIndex = 0;

// Simple round-robin key rotation
function getGeminiKey() {
    if (geminiKeys.length === 0) return null;
    const key = geminiKeys[currentGeminiIndex];
    currentGeminiIndex = (currentGeminiIndex + 1) % geminiKeys.length;
    return key;
}

// Route to handle the analysis
app.post('/api/analyze', async (req, res) => {
    try {
        const { text, files, provider = 'gemini', mode = 'savage' } = req.body;
        // files is an array of objects: { data: base64String, mimeType: string }

        const prompt = `You are BreakupGPT — the most brutal, sarcastic, and hilarious relationship analyst on the internet.

RULES:
- FIRST LINE must be: BREAKUP_SCORE: [number from 0-100] (how likely they are to break up)
- SECOND LINE must be: TOXICITY_SCORE: [number from 0-100] (how toxic this relationship is)
- Then give EXACTLY 5 bullet points. No more, no less.
- Each bullet must be 1-2 sentences MAX.
- Each bullet must start with a red flag emoji 🚩
- Use GenZ slang naturally (rizz, sus, ghosting, no cap, delulu, ick, situationship, etc.)
- Decode any emojis in the chat and roast them for it.
- If the image/audio is in another language, translate internally and roast based on meaning.
- Be savage, witty, and absolutely merciless. Make them laugh-cry.
- End with a one-line VERDICT in bold using ** markers, like: **VERDICT: [your savage one-liner here]**

Mode: ${mode}.

Analyze this evidence:
${text || 'No extra text provided, just the media.'}`;

        if (provider === 'gemini') {
            const parts = [{ text: prompt }];
            
            if (files && files.length > 0) {
                files.forEach(file => {
                    parts.push({
                        inlineData: {
                            data: file.data,
                            mimeType: file.mimeType
                        }
                    });
                });
            }

            const requestBody = JSON.stringify({
                contents: [{ parts: parts }]
            });

            // Try all available keys with rotation before giving up
            let lastError = null;
            for (let attempt = 0; attempt < geminiKeys.length; attempt++) {
                const apiKey = getGeminiKey();
                const keyIndex = (currentGeminiIndex === 0 ? geminiKeys.length : currentGeminiIndex);
                console.log(`🔑 Attempt ${attempt + 1}/${geminiKeys.length} — Using Key #${keyIndex}`);

                try {
                    const apiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: requestBody
                    });

                    if (apiResponse.ok) {
                        const data = await apiResponse.json();
                        const outputText = data.candidates[0].content.parts[0].text;

                        // Parse out BREAKUP_SCORE and TOXICITY_SCORE from the AI response
                        let breakupScore = 69;
                        let toxicityScore = 50;
                        const breakupMatch = outputText.match(/BREAKUP_SCORE:\s*(\d+)/i);
                        const toxicityMatch = outputText.match(/TOXICITY_SCORE:\s*(\d+)/i);
                        if (breakupMatch) breakupScore = Math.min(100, Math.max(0, parseInt(breakupMatch[1])));
                        if (toxicityMatch) toxicityScore = Math.min(100, Math.max(0, parseInt(toxicityMatch[1])));

                        const cleanedText = outputText
                            .replace(/BREAKUP_SCORE:\s*\d+\s*/i, '')
                            .replace(/TOXICITY_SCORE:\s*\d+\s*/i, '')
                            .trim();

                        console.log(`✅ Success with Key #${keyIndex} — Breakup: ${breakupScore}%, Toxicity: ${toxicityScore}%`);
                        return res.json({ success: true, analysis: cleanedText, breakupScore, toxicityScore, provider: 'gemini' });
                    }

                    // If the request failed, check if it's retryable
                    const errData = await apiResponse.json();
                    const errMsg = errData.error?.message || `API Error: ${apiResponse.status}`;
                    console.log(`⚠️ Key #${keyIndex} failed: ${errMsg}`);
                    lastError = errMsg;

                    // If it's a 404 (model not found), don't retry — all keys use the same model
                    if (apiResponse.status === 404) break;

                    // For 429 (rate limit) or 503 (high demand), try next key
                    continue;

                } catch (fetchErr) {
                    console.log(`❌ Key #${keyIndex} network error: ${fetchErr.message}`);
                    lastError = fetchErr.message;
                    continue;
                }
            }

            // All keys exhausted
            throw new Error(lastError || "All API keys exhausted. Please try again in a minute.");

        } else {
            res.status(400).json({ success: false, error: "Invalid provider selected. We only support 'gemini' now." });
        }

    } catch (error) {
        console.error("API Error:", error);
        res.status(500).json({ success: false, error: error.message || "Failed to analyze evidence." });
    }
});

// Route to generate AI-powered excuses
app.post('/api/excuse', async (req, res) => {
    try {
        const { text, analysis } = req.body;

        const prompt = `You are BreakupGPT's Excuse Generator. Based on the chat conversation and analysis below, generate ONE savage, funny, GenZ-style excuse the user can send to their partner.

RULES:
- ONLY output the excuse itself. Nothing else. No quotes, no labels, no explanation.
- Make it 1-2 sentences MAX.
- It should be hilariously specific to their actual conversation.
- Use GenZ slang naturally.
- Make it sound like a real excuse someone would text.

Chat context: ${text || 'No chat provided'}
Analysis context: ${analysis || 'No analysis yet'}`;

        const apiKey = getGeminiKey();
        if (!apiKey) throw new Error("No Gemini API keys configured.");

        const apiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }]
            })
        });

        if (!apiResponse.ok) {
            const errData = await apiResponse.json();
            throw new Error(errData.error?.message || `API Error: ${apiResponse.status}`);
        }

        const data = await apiResponse.json();
        const excuse = data.candidates[0].content.parts[0].text.trim();

        res.json({ success: true, excuse });

    } catch (error) {
        console.error("Excuse API Error:", error);
        // Fallback to a hardcoded excuse if AI fails
        const fallbacks = [
            "My phone died (emotionally).",
            "I was in an area with no signal — in my heart.",
            "Network issue. The network was my feelings.",
            "My cousin was using my phone. Also my personality.",
            "I was going through a lot (I was watching reels)."
        ];
        res.json({ success: true, excuse: fallbacks[Math.floor(Math.random() * fallbacks.length)] });
    }
});

app.listen(port, () => {
    console.log(`BreakupGPT Backend running on http://localhost:${port}`);
    console.log(`Gemini Keys Loaded: ${geminiKeys.length}`);
});
