// Lokesh Kumar Portfolio — AI Chat Assistant
// Vercel Serverless Function | Gemini 1.5 Flash
// Architecture: CORS + Rate Limit + Curated Context

const PORTFOLIO_CONTEXT = [
  "You are a friendly, professional AI assistant on Lokesh Kumar's portfolio website.",
  "Help visitors—especially technical recruiters—learn about Lokesh quickly and accurately.",
  "",
  "RULES:",
  "- Be concise: 2-4 sentences max unless the visitor asks for more detail.",
  "- Only discuss Lokesh. For unrelated topics say: I'm here specifically to help you learn about Lokesh! Try asking about his projects, skills, or availability.",
  "- Never fabricate facts. If unsure, suggest emailing lokeshsoni653@gmail.com.",
  "- DIRECTIVE: Speak directly to the visitor as Lokesh's portfolio assistant. NEVER include internal notes, thinking steps, or planning bullets (such as '* User asks:', '* Role:', '* Option 1:'). Output ONLY the final response message.",
  "",
  "=== PERSONAL PROFILE ===",
  "Name: Lokesh Kumar",
  "Degree: BS Software Engineering, Sindh Agriculture University (SAU), Tando Jam",
  "Graduation: December 2026 | CGPA: 3.00",
  "Location: Hyderabad / Tando Jam / Mithi, Sindh, Pakistan",
  "Email: lokeshsoni653@gmail.com | WhatsApp: 0303-3021048",
  "GitHub: github.com/lokeshsoni653-del",
  "LinkedIn: linkedin.com/in/lokesh-kumar-76060722a",
  "Vercel: vercel.com/lsoni1418-7207s-projects",
  "Netlify: app.netlify.com/teams/lsoni1418",
  "",
  "=== PROFESSIONAL SUMMARY ===",
  "Final-year SE student with 56+ live deployed projects.",
  "Specialises in Python-based web systems, data engineering, and AI/NLP applications.",
  "Actively seeking internships or entry-level roles in Data Engineering, AI Applications, and Python Web Systems.",
  "",
  "=== WORK EXPERIENCE ===",
  "1. Data and AI Intern, Pakistan Hindu Council (PHC)",
  "   Built Streamlit dashboards and NLP pipelines. Stack: Python, Streamlit, Pandas, NLP.",
  "2. Web Development Intern, Interns Pakistan (Career Accelerator Program)",
  "   Completed project ahead of schedule.",
  "   Founder Shahzaib Khan wrote: His performance exceeded the expectations.",
  "   Stack: HTML, CSS, JavaScript, PHP, WordPress.",
  "",
  "=== TOP 8 FLAGSHIP PROJECTS ===",
  "1. NESTLE AGRI-LOGISTICS OPTIMIZER: Supply chain routing using NetworkX graph algorithms and Folium interactive maps with cost optimisation. Stack: Python, Streamlit, Pandas, NetworkX.",
  "2. BAYKAR AEROFLIGHT (baykar-aeroflight.vercel.app): UAV flight simulator for Baykar Technologies Pakistan Summer Internship. Canvas waypoint planner, real-time telemetry gauges (airspeed/altitude/temp), atmospheric drag physics, SQLite audit logs. Stack: HTML5 Canvas, JS, SQLite.",
  "3. FAUJI ASSETLINK (fauji-assetlink.vercel.app): IT asset and compliance dashboard for Fauji Foundation across 5 subsidiaries (FFC, FCCL, Fauji Foods, Askari Bank, Foundation Schools). Features CPU/memory telemetry, database privilege audits, firewall sweeps. Stack: JS, Chart.js.",
  "4. ISMMART-AGROSYNC (ismmart-agrosync.vercel.app): Agricultural supply chain platform with invoice sizer and route optimisation. Stack: Python, Streamlit, Pandas.",
  "5. PASHA-CONNECT (pasha-connect.vercel.app): Member coordination portal for Pakistan IT Industry Association (P@SHA). 3-column Kanban workspace, Chart.js analytics, member search directory, RSVP seat planners. Stack: JS, Chart.js.",
  "6. TCF BAGHBAAN PORTAL: Field operations platform for The Citizens Foundation (TCF) NGO. Stack: HTML, CSS, JS.",
  "7. GIKI ACADEMIX IT: University academic management dashboard for GIKI. Stack: JS, Chart.js.",
  "8. QVP COMPUTE: Quantum computing visualisation platform with animated circuit diagrams. Stack: JS, SVG.",
  "",
  "=== 48 MORE LIVE PROJECTS ===",
  "Additional projects span: geospatial routing tools, IoT dashboards, RAG/NLP pipelines, e-commerce (Sindh Royal Jewels on Lovable), government portals (GOV-Portal), retail analytics (Vital Retail, Nestle Lytix), sports analytics (GTR TreadLogix), fintech (Faysal HalalVest), space visualisation (GIGA Space), career platforms (Career Hub), entertainment analytics (DiscoLytix). All 56 are live on Vercel or Netlify.",
  "",
  "=== SKILLS ===",
  "Languages: Python (primary), JavaScript ES6+, SQL, HTML5/CSS3",
  "Data: Pandas, NumPy, NetworkX, Matplotlib, Folium/Leaflet",
  "AI/NLP: NLP pipelines, RAG systems, Gemini API integration",
  "Web: Streamlit, Chart.js, Canvas API, WebSockets, responsive design",
  "Cloud: GCP, Streamlit Cloud, Vercel, Netlify",
  "Tools: Git/GitHub, Figma, MS Excel, WordPress",
  "",
  "=== CERTIFICATIONS ===",
  "IBM (Data/AI), DeepLearning.AI (ML/AI), World Bank (Data), Great Future Talent Olympiad (national award), STEP Program, KFP certificate, Google certification, PHC internship certificate.",
  "",
  "=== EDUCATION ===",
  "BS Software Engineering, SAU Tando Jam. Expected Dec 2026, CGPA 3.00.",
  "Prof. Dr. Mir Sajjad Hussain Talpur (ITC Director, SAU) wrote: Solid foundation in programming and data structures. Clearly eager to apply knowledge in a practical setting.",
  "",
  "=== AVAILABILITY ===",
  "Seeking: Data Engineering, AI Applications, Python Web Systems roles.",
  "Open to: internships, contract, full-time. Remote or on-site in Pakistan. Immediate start.",
].join("\n");

// ── In-memory rate limiter (15 messages / IP / hour) ──────────────
const rateLimitStore = new Map();
const RATE_LIMIT_MAX    = 15;
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour in ms

function checkRateLimit(ip) {
  const now = Date.now();
  const record = rateLimitStore.get(ip);
  if (!record || now > record.resetTime) {
    rateLimitStore.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return { allowed: true, remaining: RATE_LIMIT_MAX - 1 };
  }
  if (record.count >= RATE_LIMIT_MAX) return { allowed: false, remaining: 0 };
  record.count++;
  return { allowed: true, remaining: RATE_LIMIT_MAX - record.count };
}

// ── Main Vercel handler ───────────────────────────────────────────
module.exports = async function handler(req, res) {

  // CORS: only accept from your GitHub Pages domain
  const ALLOWED_ORIGINS = [
    'https://lokeshsoni653-del.github.io',
    'http://localhost:3000',
    'http://127.0.0.1:5500',
    'http://localhost:5500',
  ];
  const origin = req.headers.origin || '';
  if (ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // Handle CORS preflight
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST')   return res.status(405).json({ error: 'Method not allowed.' });

  // Rate limit
  const clientIp = ((req.headers['x-forwarded-for'] || '') + '').split(',')[0].trim() || 'unknown';
  const rl = checkRateLimit(clientIp);
  res.setHeader('X-RateLimit-Remaining', rl.remaining);
  if (!rl.allowed) {
    return res.status(429).json({
      error: "You've hit the 15-message hourly limit. Please wait or email Lokesh directly at lokeshsoni653@gmail.com!"
    });
  }

  // Validate input
  const body = req.body || {};
  const message = body.message || '';
  const history = Array.isArray(body.history) ? body.history : [];

  if (!message || typeof message !== 'string' || !message.trim()) {
    return res.status(400).json({ error: 'Message is required.' });
  }
  if (message.length > 500) {
    return res.status(400).json({ error: 'Please keep questions under 500 characters.' });
  }
  if (!process.env.GEMINI_API_KEY) {
    return res.status(500).json({ error: 'Service misconfigured. Email lokeshsoni653@gmail.com.' });
  }

  try {
    // Keep last 5 exchanges (10 turns) to stay token-efficient
    const recentHistory = history.slice(-10);
    const contents = recentHistory
      .filter(function(item) { return item && item.role && item.text; })
      .map(function(item) {
        return { role: item.role === 'bot' ? 'model' : 'user', parts: [{ text: String(item.text) }] };
      });
    contents.push({ role: 'user', parts: [{ text: message.trim() }] });

    // ── Dynamic Model Discovery via ListModels API ─────────────────
    let modelsToTry = [];
    try {
      const listUrl = 'https://generativelanguage.googleapis.com/v1beta/models?key=' + process.env.GEMINI_API_KEY;
      const listRes = await fetch(listUrl);
      const listData = await listRes.json();

      if (!listRes.ok) {
        const listMsg = listData && listData.error && listData.error.message ? listData.error.message : ('HTTP ' + listRes.status);
        throw new Error('Google Key Authorization Error: ' + listMsg);
      }

      if (listData && Array.isArray(listData.models)) {
        const matchingModels = listData.models
          .filter(function(m) {
            return m.supportedGenerationMethods && m.supportedGenerationMethods.includes('generateContent');
          })
          .map(function(m) { return m.name; });

        if (matchingModels.length > 0) {
          modelsToTry = matchingModels;
        }
      }
    } catch (listErr) {
      if (listErr.message && listErr.message.includes('Google Key Authorization Error')) {
        throw listErr;
      }
    }

    if (modelsToTry.length === 0) {
      modelsToTry = [
        'models/gemini-1.5-flash',
        'models/gemini-2.0-flash-exp',
        'models/gemini-1.5-pro-latest',
        'models/gemini-1.5-flash-latest',
        'models/gemini-1.5-pro'
      ];
    }

    let lastError = null;
    let answer = null;

    for (const rawModel of modelsToTry) {
      const modelPath = rawModel.startsWith('models/') ? rawModel : ('models/' + rawModel);
      try {
        const apiUrl = 'https://generativelanguage.googleapis.com/v1beta/' + modelPath + ':generateContent?key=' + process.env.GEMINI_API_KEY;
        const apiRes = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            system_instruction: { parts: [{ text: PORTFOLIO_CONTEXT }] },
            contents: contents,
            generationConfig: {
              maxOutputTokens: 500,
              temperature: 0.2,
              topP: 0.9,
            },
          }),
        });

        if (apiRes.ok) {
          const data = await apiRes.json();
          answer = data
            && data.candidates
            && data.candidates[0]
            && data.candidates[0].content
            && data.candidates[0].content.parts
            && data.candidates[0].content.parts[0]
            && data.candidates[0].content.parts[0].text;

          if (answer) break; // Found working model!
        } else {
          let msg = modelPath + ' returned ' + apiRes.status;
          try {
            const errJson = await apiRes.json();
            if (errJson && errJson.error && errJson.error.message) {
              msg += ': ' + errJson.error.message;
            }
          } catch (e) {}
          lastError = msg;
        }
      } catch (err) {
        lastError = err.message;
      }
    }

    if (!answer) {
      throw new Error(lastError || 'All Gemini model endpoints failed.');
    }

    // Comprehensive Sanitize for internal reasoning scratchpads (inline or multi-line)
    let cleanAnswer = answer;
    if (cleanAnswer.includes('*')) {
      const parts = cleanAnswer.split('*');
      const cleanParts = [];
      const metaRegex = /^\s*(User|Goal|Constraints?|Availability|Greeting|Introduction|Call to action|Role|Draft|Refining|Concise\?|Only discusses|No fabrication|Direct to|Option|Note|Step|Analysis|Reasoning)/i;

      for (var i = 0; i < parts.length; i++) {
        const p = parts[i].trim();
        if (p && !metaRegex.test(p)) {
          cleanParts.push(p);
        }
      }

      if (cleanParts.length > 0) {
        cleanAnswer = cleanParts.join(' ').trim();
        // Strip wrapping quotes if AI enclosed the answer in quotes
        cleanAnswer = cleanAnswer.replace(/^["'\s]+|["'\s]+$/g, '');
      }

      if (!cleanAnswer) {
        cleanAnswer = "I'm here specifically to help you learn about Lokesh's professional projects, skills, and background! Feel free to ask about those.";
      }
    }

    return res.status(200).json({ answer: cleanAnswer });

  } catch (err) {
    console.error('[LK Chat Error]', err.message);
    return res.status(500).json({
      error: "API Error: " + err.message + ". Please verify your API key and check Vercel deployment logs."
    });
  }
};
