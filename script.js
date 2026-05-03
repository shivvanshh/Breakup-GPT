// --- Theme Switcher ---
const themeSelector = document.getElementById('theme-selector');
const savedTheme = localStorage.getItem('breakupgpt_theme') || 'system';
if(themeSelector) themeSelector.value = savedTheme;

function applyTheme(theme) {
    if (theme === 'system') {
        const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    } else {
        document.documentElement.setAttribute('data-theme', theme);
    }
}
applyTheme(savedTheme);

if(themeSelector) {
    themeSelector.addEventListener('change', (e) => {
        localStorage.setItem('breakupgpt_theme', e.target.value);
        applyTheme(e.target.value);
    });
}

window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if (themeSelector && themeSelector.value === 'system') applyTheme('system');
});

// --- Background Hearts Animation ---
const heartsContainer = document.getElementById('hearts-container');
function createHeart() {
    const heart = document.createElement('div');
    heart.innerHTML = '💔';
    heart.classList.add('heart-bg');
    heart.style.left = Math.random() * 100 + 'vw';
    heart.style.fontSize = (Math.random() * 2 + 1) + 'rem';
    heart.style.animationDuration = (Math.random() * 5 + 5) + 's';
    heartsContainer.appendChild(heart);
    setTimeout(() => { heart.remove(); }, 10000);
}
setInterval(createHeart, 300);

// --- Context Variables ---
const chatInput = document.getElementById('chat-input');
const delaySlider = document.getElementById('delay-slider');
const seenSlider = document.getElementById('seen-slider');
const drySlider = document.getElementById('dry-slider');
const trustSlider = document.getElementById('trust-slider');

const delayVal = document.getElementById('delay-val');
const seenVal = document.getElementById('seen-val');
const dryVal = document.getElementById('dry-val');
const trustVal = document.getElementById('trust-val');
const liveFlagsCounter = document.getElementById('live-flags-counter');

// Flag mapping
const flagMap = {
    "ok": { score: 20, msg: "Monosyllabic. Classic pre-ghosting pattern. Our AI felt nothing." },
    "k": { score: 30, msg: "A single 'k'. The nuclear option of dry replies." },
    "hmm": { score: 25, msg: "Hmm. Even the AI paused after reading this." },
    "fine": { score: 40, msg: "ALERT: Fine is never fine. It is the opposite of fine." },
    "nothing": { score: 35, msg: "Nothing is never nothing. It is everything." },
    "leave it": { score: 50, msg: "Leave it = do not leave it. Danger level: HIGH." },
    "who is she": { score: 90, msg: "Three flags minimum. We don't make the rules." },
    "do whatever": { score: 95, msg: "CRITICAL. System could not process this calmly." },
    "👍": { score: 60, msg: "A thumbs up as a reply. Cold-blooded." },
    "i'm fine": { score: 45, msg: "The 'I'm' makes it worse. That's personal." },
    "it's fine": { score: 45, msg: "It. Is. Not. Fine. Never has been." },
    "okay": { score: 22, msg: "Full word 'okay' — somehow worse than 'ok'." }
};

let attachedFiles = [];

// Handle Pasting Images/Audio
chatInput.addEventListener('paste', async (e) => {
    const items = (e.clipboardData || window.clipboardData).items;
    
    for (const item of items) {
        if (item.kind === 'file') {
            const type = item.type;
            
            // Only process image, audio, or video files
            if (!type.startsWith('image/') && !type.startsWith('audio/') && !type.startsWith('video/')) {
                continue; 
            }

            const blob = item.getAsFile();
            if (!blob) continue;

            const reader = new FileReader();
            
            reader.onload = (event) => {
                // Convert to base64
                const base64String = event.target.result.split(',')[1];
                attachedFiles.push({
                    data: base64String,
                    mimeType: type
                });
                
                // Show indicator in text box based on actual type
                let fileTypeStr = '📎 File';
                if (type.startsWith('image/')) fileTypeStr = '📸 Screenshot';
                else if (type.startsWith('audio/')) fileTypeStr = '🎤 Audio';
                else if (type.startsWith('video/')) fileTypeStr = '🎥 Video';

                chatInput.value += `\n[${fileTypeStr} Attached Successfully]`;
                
                // Manually trigger input event to update red flags counter
                chatInput.dispatchEvent(new Event('input'));
            };
            reader.readAsDataURL(blob);
        }
    }
});

// --- File Upload Button Handler ---
const fileUploadInput = document.getElementById('file-upload');
const uploadBtn = document.getElementById('upload-btn');
const filesPreview = document.getElementById('attached-files-preview');

uploadBtn.addEventListener('click', () => {
    fileUploadInput.click();
});

fileUploadInput.addEventListener('change', (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (const file of files) {
        const type = file.type;

        // Only accept image, audio, or video
        if (!type.startsWith('image/') && !type.startsWith('audio/') && !type.startsWith('video/')) continue;

        const reader = new FileReader();
        reader.onloadend = () => {
            const base64 = reader.result.split(',')[1];
            attachedFiles.push({
                data: base64,
                mimeType: type
            });

            renderFileChips();
        };
        reader.readAsDataURL(file);
    }

    // Reset input so same file can be re-uploaded
    fileUploadInput.value = '';
});

function renderFileChips() {
    filesPreview.innerHTML = '';
    attachedFiles.forEach((file, index) => {
        let icon = '📎';
        let label = 'File';
        if (file.mimeType.startsWith('image/')) { icon = '📸'; label = 'Screenshot'; }
        else if (file.mimeType.startsWith('audio/')) { icon = '🎤'; label = 'Audio'; }
        else if (file.mimeType.startsWith('video/')) { icon = '🎥'; label = 'Video'; }

        const chip = document.createElement('div');
        chip.className = 'file-chip';
        chip.innerHTML = `${icon} ${label} <span class="remove-file" data-index="${index}">✕</span>`;
        filesPreview.appendChild(chip);
    });

    // Attach remove listeners
    filesPreview.querySelectorAll('.remove-file').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const idx = parseInt(e.target.dataset.index);
            attachedFiles.splice(idx, 1);
            renderFileChips();
        });
    });
}

// Update live flags
chatInput.addEventListener('input', () => {
    const text = chatInput.value.toLowerCase();
    let count = 0;
    Object.keys(flagMap).forEach(key => {
        if(text.includes(key)) count++;
    });
    // Add fake count for attached files
    count += (attachedFiles.length * 5); 
    liveFlagsCounter.innerText = `🚩 ${count} red flags detected so far...`;
});

// Sync sliders
delaySlider.addEventListener('input', (e) => delayVal.innerText = e.target.value);
seenSlider.addEventListener('input', (e) => seenVal.innerText = e.target.value);
drySlider.addEventListener('input', (e) => dryVal.innerText = e.target.value);
trustSlider.addEventListener('input', (e) => trustVal.innerText = e.target.value + '%');

// --- Mode Selection ---
let currentMode = 'normal';
const modeBtns = document.querySelectorAll('.mode-pill');
const modeDescriptionEl = document.getElementById('mode-description');

const modeDescriptions = {
    'normal': '💥 Normal Mode: Just your average, everyday impending doom.',
    'toxic': '☠️ Toxic Couple Mode: Blocking and unblocking each other every 3 business days.',
    'long-distance': '🌍 Long Distance Mode: 90% buffering video calls, 10% trust issues.',
    'situationship': '👻 Situationship Mode: "We are just going with the flow" (You are drowning).',
    'delusional': '🤡 Delusional Mode: Ignoring red flags because "they are just stressed right now".',
    'ghosting': '🔕 Ghosting Mode: They haven\'t replied since Tuesday, but they watched your story.',
    'rebound': '🩹 Rebound Mode: Using someone else to get over your ex. (It won\'t work).',
    'clingy': '🧲 Clingy Mode: "Why didn\'t you reply? I saw you typing..."',
    'fwb': '🎭 FWB Mode: Catching feelings is strictly prohibited. (You already did).',
    'breadcrumbing': '🍞 Breadcrumbing Mode: Dropping just enough hints to keep you hooked.',
    'talking-stage': '💬 Talking Stage: You\'ve been "talking" for 6 months. That IS the relationship.',
    'entanglement': '🔗 Entanglement Mode: It\'s not cheating if you call it an "entanglement" — right, Jada?',
    'soft-launch': '📸 Soft Launch Mode: Posting a hand on the story but hiding the face. Very secure.',
    'roster': '📋 Roster Mode: You\'re dating 5 people and somehow disappointing all of them equally.',
    'love-bombing': '💣 Love Bombing Mode: "I\'ve never felt this way before" — sent to 3 people today.',
    'benching': '🪑 Benching Mode: You\'re not in the game, you\'re on the bench. Warm the seat.',
    'zombie-ing': '🧟 Zombie-ing Mode: Your ex rose from the dead. They liked your pic from 2022.',
    'orbiting': '🛸 Orbiting Mode: They won\'t text you but will watch every single story within 2 seconds.',
    'catfish': '🐱 Catfish Mode: The vibe was perfect until the video call didn\'t match the profile pic.',
    'sneaky-link': '🤫 Sneaky Link Mode: "Don\'t post me" — the national anthem of this relationship.'
};

modeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        modeBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentMode = btn.getAttribute('data-mode');
        if (modeDescriptionEl) modeDescriptionEl.innerText = modeDescriptions[currentMode] || '';
    });
});

// --- Calculation Logic ---
function calculateResults() {
    const text = chatInput.value.toLowerCase();
    let totalScore = 10; // Base score
    let flagsFound = [];

    // Check easter egg
    if (text.includes("i love you")) {
        return { isEasterEgg: true };
    }

    // Keyword logic
    Object.keys(flagMap).forEach(key => {
        if(text.includes(key)) {
            totalScore += flagMap[key].score;
            flagsFound.push({ word: key, msg: flagMap[key].msg });
        }
    });
    
    if (totalScore > 100) totalScore = 100;

    const delay = parseInt(delaySlider.value);
    const seen = parseInt(seenSlider.value);
    const dry = parseInt(drySlider.value);
    const trust = parseInt(trustSlider.value);

    // Sliders math
    totalScore += (delay * 1.5) + (seen * 2) + (dry * 1.8) + (trust * 0.4);

    // Mode multipliers
    let baseScore = totalScore;
    let multiplier = 1.0;
    let selectedMode = currentMode;

    if (selectedMode === 'toxic') multiplier += 0.3;
    if (selectedMode === 'long-distance') multiplier += 0.2;
    if (selectedMode === 'situationship') multiplier += 0.5;
    if (selectedMode === 'delusional') multiplier -= 0.2;
    if (selectedMode === 'ghosting') multiplier += 0.6;
    if (selectedMode === 'rebound') multiplier += 0.4;
    if (selectedMode === 'clingy') multiplier += 0.35;
    if (selectedMode === 'fwb') multiplier += 0.45;
    if (selectedMode === 'breadcrumbing') multiplier += 0.55;
    if (selectedMode === 'talking-stage') multiplier += 0.25;
    if (selectedMode === 'entanglement') multiplier += 0.7;
    if (selectedMode === 'soft-launch') multiplier += 0.15;
    if (selectedMode === 'roster') multiplier += 0.65;
    if (selectedMode === 'love-bombing') multiplier += 0.5;
    if (selectedMode === 'benching') multiplier += 0.4;
    if (selectedMode === 'zombie-ing') multiplier += 0.55;
    if (selectedMode === 'orbiting') multiplier += 0.35;
    if (selectedMode === 'catfish') multiplier += 0.8;
    if (selectedMode === 'sneaky-link') multiplier += 0.6;

    let finalProbability = Math.min(99.9, Math.round(baseScore * multiplier));

    if (currentMode === 'situationship') {
        finalProbability = Math.floor(Math.random() * 31) + 45; // 45 to 75
    }

    const timeRemainingDays = Math.max(0, Math.round((100 - finalProbability) * 0.8));
    const toxicity = Math.min(100, Math.round(finalProbability * 0.9 + (trust * 0.1)));

    return {
        probability: finalProbability,
        timeDays: timeRemainingDays,
        toxicity: toxicity,
        flags: flagsFound
    };
}

// --- Loading Sequence ---
const analyzeBtn = document.getElementById('analyze-btn');
const loadingOverlay = document.getElementById('loading-overlay');
const loadingCard = document.getElementById('loading-card');
const progressBar = document.getElementById('progress-bar');
const resultsSection = document.getElementById('results-section');

const steps = [
    "✅ Reading chat messages...",
    "✅ Detecting emotional damage...",
    "✅ Scanning 'hmm' frequency...",
    "✅ Loading Bollywood heartbreak dataset (2,847 films)...",
    "✅ Cross-referencing with Karan Johar's diary...",
    "✅ Calculating silence periods...",
    "✅ Measuring trust issue velocity...",
    "✅ Consulting your ex's perspective...",
    "<span class='load-warning'>⚠️ WARNING: Results may cause self-reflection.</span>",
    "✅ Finalising heartbreak report..."
];

analyzeBtn.addEventListener('click', async () => {
    loadingCard.innerHTML = '';
    progressBar.style.width = '0%';
    loadingOverlay.classList.add('active');
    
    let stepIndex = 0;
    const interval = setInterval(() => {
        if (stepIndex < steps.length - 2) {
            const el = document.createElement('div');
            el.className = 'load-step';
            el.innerHTML = steps[stepIndex];
            loadingCard.appendChild(el);
            setTimeout(() => el.classList.add('visible'), 50);
            
            progressBar.style.width = ((stepIndex + 1) * 10) + '%';
            stepIndex++;
        }
    }, 600);

    try {
        // Send data to our new backend!
        const response = await fetch('http://localhost:3000/api/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                text: chatInput.value,
                files: attachedFiles,
                mode: currentMode
            })
        });

        const data = await response.json();
        clearInterval(interval);

        // Finish loading animation
        progressBar.style.width = '100%';
        const finalStep = document.createElement('div');
        finalStep.className = 'load-step visible';
        finalStep.innerHTML = "✅ Generating AI brutal roast...";
        loadingCard.appendChild(finalStep);

        setTimeout(() => {
            loadingOverlay.classList.remove('active');
            
            let stats;

            if (data.success) {
                // Save for excuse generator context
                lastAnalysis = data.analysis;
                
                // Split the AI response into individual bullet points
                const lines = data.analysis
                    .split('\n')
                    .map(l => l.trim())
                    .filter(l => l.length > 0);
                
                const flags = lines.map(line => {
                    const cleaned = line.replace(/^[\-\*•]\s*/, '');
                    return { word: "🚩", msg: cleaned };
                });

                const bp = data.breakupScore || 69;
                const tox = data.toxicityScore || 50;

                stats = {
                    probability: bp,
                    timeDays: Math.max(0, Math.round((100 - bp) * 0.8)),
                    toxicity: tox,
                    flags: flags,
                    isEasterEgg: false
                };
            } else {
                stats = calculateResults();
                stats.flags = [{ word: "Error", msg: data.error }];
            }

            console.log("Final stats:", stats);
            showResults(stats);
        }, 1000);

    } catch (err) {
        clearInterval(interval);
        alert("Cannot connect to backend! Is the Node.js server running?");
        loadingOverlay.classList.remove('active');
    }
});

// --- Show Results ---
const cardVerdict = document.getElementById('card-verdict');
const verdictCircle = document.getElementById('verdict-circle');
const verdictPercentage = document.getElementById('verdict-percentage');
const timeRemaining = document.getElementById('time-remaining');
const redFlagsList = document.getElementById('red-flags-list');
const toxFill = document.getElementById('tox-fill');
const toxLabel = document.getElementById('tox-label');
const bollywoodQuote = document.getElementById('bollywood-quote');
const savageQuote = document.getElementById('savage-quote');
const rainOverlay = document.getElementById('rain-overlay');

const bollywoodQuotes = [
    "Communication breakdown detected. Kabir Singh energy: confirmed.",
    "This relationship has officially entered interval block. Second half: uncertain.",
    "Emotional mismatch at cinematic levels. Karan Johar is crying.",
    "Main character energy detected — in both of you. That is the problem.",
    "Plot twist probability: 94%. Sequel: not recommended.",
    "This has more red flags than the sets of Love Aaj Kal. Both versions.",
    "Trust issues detected at DDLJ climax frequency.",
    "Devdas would look at this chat and say 'bro get help'.",
    "Even Rahul from KKHH moved on faster than you two.",
    "This relationship is giving 'Humpty Sharma Ki Dulhania' but without the happy ending.",
    "Raj would have missed that train on purpose after reading this.",
    "Your chat has more drama than all 3 seasons of Sacred Games combined.",
    "Simran would NOT have jumped off that train for this situationship.",
    "Kal Ho Naa Ho energy — except the expiry date is today.",
    "Bunny from YJHD ran away from responsibilities. You're running from reality.",
    "Geet from Jab We Met had better solo character arc. Take notes.",
    "This is giving Cocktail vibes — someone is always the backup plan.",
    "Even Chatur from 3 Idiots has better rizz than whoever typed this.",
    "Your relationship has less chemistry than Tubelight. And that's saying something.",
    "Bajirao would NOT have fought Mastani's family for this conversation.",
    "This chat is the emotional equivalent of Race 3 dialogue. Painful.",
    "SRK ran through airports for love. You can't even reply on time.",
    "Poo from K3G would rate this relationship a zero. Not even a ten.",
    "Your DMs are giving Dabangg energy — all show, no substance.",
    "This situationship has more plot holes than Dhoom 3.",
    "Munna Bhai would prescribe a jaadu ki jhappi, but even that won't fix this."
];

const savageQuotes = [
    "Even your WiFi is more stable than this relationship.",
    "Your relationship has worse uptime than a government website.",
    "Error 404: Commitment not found on either device.",
    "This connection timed out. On both ends.",
    "We've seen healthier situationships in season finales.",
    "Our AI needed a moment after reading this. It sends its condolences.",
    "Stability rating: worse than India's 4G in a lift.",
    "If this relationship was an app, it would crash on launch.",
    "You two communicate like two bluetooth devices that refuse to pair.",
    "This chat is the human equivalent of 'your free trial has expired'.",
    "Even ChatGPT would ghost you after reading this conversation.",
    "Your relationship runs on copium and unread messages.",
    "If red flags were crypto, you'd be a billionaire by now.",
    "This is giving 'read at 11:32 PM, replied next century' energy.",
    "NASA couldn't find signs of commitment in this conversation.",
    "Your relationship has more trust issues than a public WiFi network.",
    "Therapy isn't a suggestion at this point. It's a system requirement.",
    "Even autocorrect can't fix what's wrong with this relationship.",
    "You're not in a relationship, you're in a group project where nobody contributes.",
    "This situationship is buffering. And the internet is never coming back.",
    "Your love language is passive aggression. Fluent in it, apparently.",
    "If this chat was a password, it would be 'weak' with a red warning.",
    "This is giving 'we need to talk' but neither of you ever does.",
    "Your relationship has more red flags than a communist parade.",
    "Our AI wanted to swipe left on this entire conversation.",
    "Delete the chat, delete the contact, delete the memories. Factory reset.",
    "Two people, seven red flags, zero communication skills. Impressive."
];

const toxicityLabels = {
    low: [
        "Surprisingly stable. Are you sure this is a real relationship?",
        "Healthy? In THIS economy? Respect.",
        "Green flags detected. Our AI is confused.",
        "Wholesome energy. Did you paste the wrong chat?",
        "0 toxicity? Either you're lying or this is a Disney movie."
    ],
    mild: [
        "Mild spice. Manageable. Hydrate. 🌶️",
        "Some yellow flags. Nothing therapy can't fix. Probably.",
        "It's giving 'we're fine' but with a suspicious pause.",
        "Slightly sus. Not emergency-level, but keep your eyes open.",
        "Minor turbulence. Seatbelts recommended but not required."
    ],
    medium: [
        "Medium chaos. Netflix would consider a documentary.",
        "This is the 'calm before the storm' phase. Buckle up.",
        "Toxicity at levels that require ventilation. Open a window.",
        "50/50 energy. Could go either way. Our AI is stress-eating.",
        "Moderate damage detected. Like a 3-star Zomato review of love."
    ],
    high: [
        "This is the interval scene in a Bollywood film. It gets worse.",
        "High toxicity. Handle with emotional hazmat suit.",
        "Our servers filed an HR complaint after processing this.",
        "This relationship is a fire hazard. Evacuate immediately.",
        "Danger zone. Even Google Maps can't reroute you out of this."
    ],
    critical: [
        "SYSTEM OVERLOAD. Our servers need therapy after this. ☠️",
        "CRITICAL TOXICITY. This chat violated the Geneva Convention.",
        "Maximum damage. Even flex tape can't fix this relationship.",
        "CODE RED. Our AI is requesting hazard pay for reading this.",
        "Toxicity level: Chernobyl. Evacuate your feelings immediately."
    ]
};

function showResults(data) {
    document.getElementById('input-section').style.display = 'none';
    document.getElementById('hero').style.display = 'none';
    resultsSection.classList.add('active');
    window.scrollTo(0, 0);

    // Hide rain and shake classes initially
    rainOverlay.classList.remove('active');
    rainOverlay.innerHTML = '';
    cardVerdict.classList.remove('shake', 'pulse-red');

    // Easter Egg handler
    if (data.isEasterEgg) {
        animatePercentage(0, 99, (val) => {
            if(val === 99) {
                timeRemaining.innerText = "Relax. Love is not a variable our model can process. Yet.";
                toxLabel.innerText = "SYSTEM OVERLOAD. Our servers need therapy after this. ☠️";
                toxFill.style.width = '100%';
                verdictCircle.style.stroke = "#ef4444";
            }
        });
        redFlagsList.innerHTML = `<li class="red-flag-item"><strong>"i love you"</strong>: Detected. AI cannot compute.</li>`;
        return revealCards();
    }

    // Normal handler
    animatePercentage(0, data.probability, (val) => {
        if(val === 69) {
            confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        }
    });

    if(data.probability > 75) cardVerdict.classList.add('pulse-red');
    if(data.probability > 95) cardVerdict.classList.add('shake');
    if(data.probability > 90) {
        rainOverlay.classList.add('active');
        for(let i=0; i<50; i++) {
            const drop = document.createElement('div');
            drop.className = 'drop';
            drop.style.left = Math.random() * 100 + 'vw';
            drop.style.animationDuration = (Math.random() * 0.5 + 0.5) + 's';
            drop.style.animationDelay = Math.random() * 2 + 's';
            rainOverlay.appendChild(drop);
        }
    }

    const randomMins = Math.floor(Math.random() * 59) + 1;
    timeRemaining.innerText = `${data.timeDays} days ${randomMins} minutes`;

    // Red Flags
    redFlagsList.innerHTML = '';
    if(data.flags.length === 0) {
        redFlagsList.innerHTML = `<li class="red-flag-item">No specific keyword flags. But the vibe is still off.</li>`;
    } else {
        data.flags.forEach(f => {
            redFlagsList.innerHTML += `<li class="red-flag-item"><strong>"${f.word}"</strong>: ${f.msg}</li>`;
        });
    }

    // Toxicity — pick a random label from the matching range
    setTimeout(() => { toxFill.style.width = data.toxicity + '%'; }, 500);
    let toxGroup;
    if(data.toxicity <= 20) toxGroup = toxicityLabels.low;
    else if(data.toxicity <= 40) toxGroup = toxicityLabels.mild;
    else if(data.toxicity <= 60) toxGroup = toxicityLabels.medium;
    else if(data.toxicity <= 80) toxGroup = toxicityLabels.high;
    else toxGroup = toxicityLabels.critical;
    toxLabel.innerText = toxGroup[Math.floor(Math.random() * toxGroup.length)];

    // Quotes
    bollywoodQuote.innerText = `"${bollywoodQuotes[Math.floor(Math.random() * bollywoodQuotes.length)]}"`;
    savageQuote.innerText = `"${savageQuotes[Math.floor(Math.random() * savageQuotes.length)]}"`;

    revealCards();
}

function revealCards() {
    const cards = document.querySelectorAll('.result-card');
    cards.forEach((c, i) => {
        setTimeout(() => c.classList.add('visible'), i * 200 + 100);
    });
}

function animatePercentage(start, end, callback) {
    let current = start;
    // Set initial value immediately
    verdictPercentage.textContent = current + '%';
    verdictCircle.style.strokeDasharray = `${current}, 100`;

    if (end <= 0) {
        callback(0);
        return;
    }

    const interval = setInterval(() => {
        current++;
        verdictPercentage.textContent = current + '%';
        verdictCircle.style.strokeDasharray = `${current}, 100`;
        
        if(current <= 40) verdictCircle.style.stroke = "#10b981"; // green
        else if(current <= 70) verdictCircle.style.stroke = "#f59e0b"; // orange
        else verdictCircle.style.stroke = "#ef4444"; // red

        callback(current);

        if(current >= end) clearInterval(interval);
    }, 20);
}

// --- Action Buttons ---
let lastAnalysis = ''; // Store the last AI analysis for the excuse generator

document.getElementById('excuse-btn').addEventListener('click', async () => {
    const box = document.getElementById('excuse-box');
    box.style.display = 'block';
    box.innerText = '🤔 AI is cooking up a custom excuse...';

    try {
        const response = await fetch('http://localhost:3000/api/excuse', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                text: chatInput.value,
                analysis: lastAnalysis
            })
        });

        const data = await response.json();
        if (data.success) {
            box.innerText = '😇 ' + data.excuse;
        } else {
            box.innerText = '😅 My phone died (emotionally).';
        }
    } catch (err) {
        box.innerText = '😅 My phone died (emotionally).';
    }
});

document.getElementById('reset-btn').addEventListener('click', () => {
    resultsSection.classList.remove('active');
    document.getElementById('input-section').style.display = 'flex';
    document.getElementById('hero').style.display = 'flex';
    document.querySelectorAll('.result-card').forEach(c => c.classList.remove('visible'));
    chatInput.value = '';
    attachedFiles = []; // Clear pasted images/audio
    delaySlider.value = 0; seenSlider.value = 0; drySlider.value = 0; trustSlider.value = 0;
    delayVal.innerText = '0'; seenVal.innerText = '0'; dryVal.innerText = '0'; trustVal.innerText = '0%';
    liveFlagsCounter.innerText = "🚩 0 red flags detected so far...";
    document.getElementById('excuse-box').style.display = 'none';
    window.scrollTo(0, document.getElementById('input-section').offsetTop);
});

document.getElementById('live-mode-btn').addEventListener('click', () => {
    document.getElementById('reset-btn').click();
    chatInput.value = '';
    chatInput.placeholder = "Sir/Ma'am, paste your chat here... we'll handle the rest.";
    document.getElementById('live-badge').style.display = 'block';
});



// --- Easter Eggs ---
setTimeout(() => {
    document.getElementById('easter-popup').classList.add('show');
}, 4000);

document.getElementById('dismiss-popup').addEventListener('click', () => {
    document.getElementById('easter-popup').classList.remove('show');
});
