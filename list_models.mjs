import dotenv from 'dotenv';
dotenv.config();

const apiKey = process.env.GEMINI_API_KEY_1;
console.log("Using key:", apiKey ? apiKey.substring(0, 10) + "..." : "NO KEY FOUND");

const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
const data = await response.json();

if (data.models) {
    console.log("\n=== AVAILABLE MODELS THAT SUPPORT generateContent ===\n");
    data.models
        .filter(m => m.supportedGenerationMethods && m.supportedGenerationMethods.includes('generateContent'))
        .forEach(m => console.log(m.name));
} else {
    console.log("ERROR:", JSON.stringify(data, null, 2));
}
