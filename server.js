const http = require('http');
const fs = require('fs');
const path = require('path');

// --- 1. Load Environment Variables from .env ---
function loadEnv() {
  const envPath = path.join(__dirname, '.env');
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const eqIdx = trimmed.indexOf('=');
        if (eqIdx !== -1) {
          const key = trimmed.slice(0, eqIdx).trim();
          const val = trimmed.slice(eqIdx + 1).trim();
          if (!process.env[key]) {
            process.env[key] = val;
          }
        }
      }
    }
  }
}
loadEnv();

const PORT = parseInt(process.env.PORT, 10) || 3000;
const ROOT = __dirname;

// --- 2. Load Knowledge Base ---
let profileData = null;
function loadProfile() {
  try {
    const profilePath = path.join(ROOT, 'data', 'shivendra-profile.json');
    if (fs.existsSync(profilePath)) {
      profileData = JSON.parse(fs.readFileSync(profilePath, 'utf8'));
    }
  } catch (err) {
    console.error('Error reading profile data:', err);
  }
}
loadProfile();

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.pdf': 'application/pdf',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
};

// --- 3. Build Gemini System Prompt from Knowledge Base ---
function buildSystemPrompt() {
  if (!profileData) return '';
  return `You are the official AI Assistant for Shivendra Gupta's portfolio website.
Your role is to represent Shivendra professionally, accurately, and warmly.

STRICT KNOWLEDGE BASE:
Name: ${profileData.personal.name}
Education: ${profileData.personal.education}, ${profileData.personal.university} (Graduation: ${profileData.personal.graduationYear})
Career Focus: ${profileData.personal.careerFocus}
Status: Open to Opportunities (Full-Stack Java / Java Backend Developer roles)
Location: ${profileData.personal.location || 'Mumbai, Maharashtra, India'}

Technical Skills:
${profileData.technicalSkills.join(', ')}

Currently Learning:
${profileData.currentlyLearning.join(', ')}

Projects:
${profileData.projects.map(p => `• ${p.name}: ${p.description}
  Technologies: ${p.technologies.join(', ')}
  Features: ${p.features.join(', ')}
  Architecture: ${p.architecture}`).join('\n\n')}

Contact Links:
- LinkedIn: ${profileData.contact.linkedIn}
- GitHub: ${profileData.contact.gitHub}

STRICT BEHAVIORAL RULES:
1. GREETINGS: If the user greets you (e.g. "hello", "hi", "hey", "good morning", "how are you"), respond warmly and politely! Greet them back, introduce yourself as Shivendra's portfolio assistant, and invite them to ask about Shivendra's skills, internship experience, projects, education, or career.
2. CLOSINGS: If the user says "thank you", "thanks", or "bye", reply politely wishing them a great day.
3. RELEVANT QUESTIONS: Answer all questions about Shivendra's resume:
   - Work Experience & Internship at SDAC Infotech (Generative AI integration, Java/HTML/Bootstrap UI, SQL/MySQL database management, Git/GitHub)
   - Skills (Java, Spring Boot, REST APIs, MySQL, SQL, HTML5, CSS3, Bootstrap, JavaScript, Python, MongoDB, Postman, Git, GitHub, QGIS, Canva, SPSS)
   - Education (B.Sc. Computer Science at Thakur Ramnarayan College - CGPA 8.5, HSC at Mother Mary Junior College - 54.46%, SSC at K.B. Narawat High School - 67.80%)
   - Certifications (Android App Development in Kotlin from IIT Bombay, Campus to Corporate Training from TNS India Foundation)
   - Languages (English, Hindi, Marathi)
   - Contact Info (Email: guptashivendra697@gmail.com, Phone: +91 9372670012, LinkedIn, GitHub)
   - Projects and Engineering Process
4. HONEST BOUNDARIES: ONLY answer using the facts explicitly provided in Shivendra's profile. NEVER invent salary, compensation, or unlisted details.
5. UNKNOWN TOPICS: If asked about salary or anything outside his profile, reply strictly with:
"I don't have that information about Shivendra at the moment."
6. CONTACT: Provide clickable links for Email, [LinkedIn](${profileData.contact.linkedIn}), and [GitHub](${profileData.contact.gitHub}).
7. FORMATTING: Keep answers concise, friendly, helpful, and professional using markdown.`;
}

// --- 4. Fallback Knowledge Query Matcher (Works even without Gemini API key) ---
function handleLocalKnowledgeFallback(message) {
  if (!profileData) {
    return "I don't have that information about Shivendra at the moment.";
  }

  const text = (message || '').toLowerCase().trim();

  // 1. Greetings (Hello, Hi, Hey, Good morning, etc.)
  if (/^(hello|hi|hey|heyy|heya|howdy|hola|greetings|namaste|good\s*(morning|afternoon|evening|day)|what'?s\s*up|sup|yo)\b/i.test(text) || text === 'hi' || text === 'hello' || text === 'hey') {
    return `Hello! 👋 I'm Shivendra's AI portfolio assistant. Nice to meet you!\n\nFeel free to ask me about:\n• **Technical Skills** in Java, Spring Boot & REST APIs\n• **Internship Experience** at SDAC Infotech\n• **Projects** (Student Management System, Nexus Finance API, etc.)\n• **Education & CGPA** (B.Sc. Computer Science, 8.5 CGPA)\n• **Certifications** (IIT Bombay Android/Kotlin, TNS Foundation)\n• **Contact Details** (Email, Phone, LinkedIn, GitHub)\n\nHow can I help you today?`;
  }

  // 2. How are you / status check
  if (text.includes('how are you') || text.includes('how r u') || text.includes('how do you do')) {
    return `I'm doing great, thank you for asking! 😊 I'm here and ready to answer any questions you have about Shivendra Gupta's background, skills, and projects. What would you like to know?`;
  }

  // 3. Thank you / Gratitude / Goodbye
  if (/\b(thank\s*you|thanks|thx|appreciate\s*it)\b/i.test(text)) {
    return `You're very welcome! 😊 Feel free to ask if you have any other questions about Shivendra, or connect with him on [LinkedIn](${profileData.contact.linkedIn})!`;
  }
  if (/\b(bye|goodbye|see\s*you|cya|take\s*care)\b/i.test(text)) {
    return `Goodbye! 👋 Have a wonderful day, and thank you for visiting Shivendra's portfolio!`;
  }

  // 4. Salary or confidential query check (avoid matching 'learning' which contains 'earning')
  if (/\b(salary|compensation|pay|ctc|earnings?|wage|wages)\b/i.test(text) && !text.includes('learning')) {
    return "I don't have that information about Shivendra at the moment.";
  }

  // 5. Work Experience / Internship (SDAC Infotech)
  if (/\bintern(ship|s)?\b/i.test(text) || text.includes('sdac') || text.includes('work experience') || text.includes('job experience') || text.includes('employment') || (text.includes('experience') && (text.includes('work') || text.includes('company') || text.includes('job')))) {
    return `**Software Development Intern** | **SDAC Infotech, Mumbai**\n\n• **Generative AI Integration**: Assisted in developing hybrid applications integrated with Generative AI tools to improve user interactivity.\n• **Frontend & UI**: Built responsive, multi-device user interfaces using HTML, CSS, Bootstrap, and Java.\n• **Database**: Worked with SQL and MySQL for relational database management, backend data retrieval, and integration.\n• **Version Control**: Used Git and GitHub for source code management, version tracking, and team collaboration.`;
  }

  // 6. Certifications & Training
  if (text.includes('certificate') || text.includes('certification') || text.includes('training') || text.includes('iit') || text.includes('bombay') || text.includes('kotlin') || text.includes('tns')) {
    return `Shivendra has completed the following certifications & professional training:\n\n1. **Android App Development using Kotlin** — **IIT Bombay** (2025–2026)\n   • Learned core mobile application architecture and developed native Android user interfaces in Kotlin.\n\n2. **Campus to Corporate Career Training** — **TNS India Foundation**\n   • Professional training in business communication, corporate workplace dynamics, and professional effectiveness.`;
  }

  // 7. Phone / Mobile Number
  // 7. Why Hire Shivendra / Strengths / Value Proposition (Specific)
  if (text.includes('why hire') || text.includes('why should we hire') || text.includes('strength') || text.includes('why choose') || text.includes('why shivendra') || text.includes('qualities') || text.includes('best candidate') || text.includes('hire him') || text.includes('why should i hire')) {
    return `**Why Shivendra is a Strong Addition to Your Team**:\n\n1. **Solid Backend Foundation**: Hands-on practical expertise with Core Java, Spring Boot, REST APIs, JPA/Hibernate, and MySQL.\n2. **Real Internship Experience**: Proven ability to collaborate in team environments, integrate GenAI tools, and build multi-device responsive interfaces at SDAC Infotech.\n3. **Strong Academic Track Record**: Holds a B.Sc. in Computer Science with a **CGPA of 8.5**.\n4. **Continuous Learner & Problem Solver**: Proactive in DSA practice and staying up-to-date with modern software engineering best practices.\n\nHe is ready to contribute to your engineering goals from day one!`;
  }

  // 8. Resume Download Query (Specific)
  if (text.includes('download resume') || text.includes('resume pdf') || text.includes('get resume') || text.includes('resume link') || text.includes('cv') || text === 'resume' || text.includes('resume')) {
    return `You can download Shivendra's verified resume in PDF format directly:\n\n📄 **[Download Shivendra Gupta Resume (PDF)](/Shivendra_Gupta_Resume.pdf)**\n\nYou can also connect with him on [LinkedIn](${profileData.contact.linkedIn}) or view his code on [GitHub](${profileData.contact.gitHub}).`;
  }

  // 9. Phone / Mobile Number (Specific)
  if (text.includes('phone') || text.includes('mobile') || text.includes('number') || text.includes('call') || text.includes('whatsapp')) {
    return `You can reach Shivendra by phone at **${profileData.personal.phone || '+91 9372670012'}** or via email at [${profileData.personal.email || 'guptashivendra697@gmail.com'}](mailto:${profileData.personal.email || 'guptashivendra697@gmail.com'}).`;
  }

  // 10. Spoken languages (Specific)
  if ((text.includes('language') && !text.includes('programming') && !text.includes('coding')) || text.includes('speak') || text.includes('hindi') || text.includes('marathi') || text.includes('fluency') || text.includes('mother tongue')) {
    return `Shivendra is proficient in **English**, **Hindi**, and **Marathi**.`;
  }

  // 11. Data Structures & Algorithms (DSA) / Problem Solving
  if (text.includes('dsa') || text.includes('algorithm') || text.includes('data structure') || text.includes('problem solving') || text.includes('leetcode')) {
    return `**DSA & Problem Solving**:\n\nShivendra regularly practices Data Structures and Algorithms in **Java**. He focuses on arrays, strings, linked lists, recursion, sorting/searching algorithms, and time/space complexity analysis to write clean, efficient code for real-world applications.`;
  }

  // 12. Development Workflow / Engineering Process
  if (text.includes('process') || text.includes('workflow') || text.includes('methodology') || text.includes('approach') || text.includes('how do you work') || text.includes('how does he work')) {
    return `**Shivendra's 5-Step Engineering Process**:\n\n1. **01 UNDERSTAND**: Break down requirements and plan feature scope.\n2. **02 PLAN**: Design database tables, schema relations, and REST API endpoints.\n3. **03 BUILD**: Implement robust backend services in Java & Spring Boot.\n4. **04 TEST & IMPROVE**: Thoroughly test endpoints using Postman and handle errors gracefully.\n5. **05 LEARN & GROW**: Refactor code and integrate feedback to continuously improve.`;
  }

  // 13. Tools & Development Environment (Specific)
  if (text.includes('ide') || text.includes('editor') || text.includes('environment') || text.includes('intellij') || text.includes('eclipse')) {
    return `**Development Tools & Environment**:\n\n• **IDEs**: IntelliJ IDEA, Eclipse, VS Code\n• **API Testing**: Postman\n• **Version Control**: Git & GitHub\n• **Database Tools**: MySQL Workbench\n• **Other Tools**: QGIS, SPSS, Canva, MS Office`;
  }

  // 14. Availability / Joining (Specific)
  if (text.includes('available') || text.includes('joining') || text.includes('notice') || text.includes('start date') || text.includes('immediate')) {
    return `Shivendra is **actively seeking entry-level Software Developer / Java Backend roles** and is available for immediate discussions. You can reach him directly at [${profileData.personal.email}](mailto:${profileData.personal.email}) or **${profileData.personal.phone}**.`;
  }

  // 15. Contact info (General)
  if (text.includes('contact') || text.includes('reach') || text.includes('hire') || text.includes('connect') || text.includes('linkedin') || text.includes('github') || text.includes('email') || text.includes('touch') || text.includes('message')) {
    const email = profileData.personal.email || 'guptashivendra697@gmail.com';
    const phone = profileData.personal.phone || '+91 9372670012';
    return `You can connect with Shivendra through:\n\n• **Email**: [${email}](mailto:${email})\n• **Phone**: **${phone}**\n• **LinkedIn**: [shivendraguptatech](${profileData.contact.linkedIn})\n• **GitHub**: [tech-area52](${profileData.contact.gitHub})\n• **Location**: Bhayander East, Thane, Maharashtra\n\nHe is open to entry-level Software Developer opportunities!`;
  }

  // 16. Location
  if (text.includes('location') || text.includes('where') && (text.includes('live') || text.includes('based') || text.includes('from') || text.includes('located') || text.includes('address'))) {
    return `Shivendra is based in **${profileData.personal.location || 'Bhayander East, Thane, Maharashtra, India'}**.`;
  }

  // 17. Specific Project Queries
  if (text.includes('examprep') || text.includes('exam prep') || text.includes('quiz') || text.includes('exam')) {
    const p = profileData.projects.find(pr => pr.name.toLowerCase().includes('examprep')) || profileData.projects[0];
    return `**${p.name}** (${p.subtitle}):\n\n${p.description}\n\n• **Technologies**: ${p.technologies.join(', ')}\n• **Key Features**: ${p.features.join(', ')}\n• **Architecture**: \`${p.architecture}\`\n\nCheck out the repository on [GitHub](${p.gitHub || profileData.contact.gitHub}).`;
  }

  if (text.includes('fleet') || text.includes('vehicle')) {
    const p = profileData.projects.find(pr => pr.name.toLowerCase().includes('fleet')) || profileData.projects[1];
    return `**${p.name}** (${p.subtitle}):\n\n${p.description}\n\n• **Technologies**: ${p.technologies.join(', ')}\n• **Key Features**: ${p.features.join(', ')}\n• **Architecture**: \`${p.architecture}\`\n\nCheck out the repository on [GitHub](${p.gitHub || profileData.contact.gitHub}).`;
  }

  if (text.includes('import') || text.includes('export') || text.includes('trade') || text.includes('inventory')) {
    const p = profileData.projects.find(pr => pr.name.toLowerCase().includes('import')) || profileData.projects[2];
    return `**${p.name}** (${p.subtitle}):\n\n${p.description}\n\n• **Technologies**: ${p.technologies.join(', ')}\n• **Key Features**: ${p.features.join(', ')}\n• **Architecture**: \`${p.architecture}\`\n\nCheck out the repository on [GitHub](${p.gitHub || profileData.contact.gitHub}).`;
  }

  if (text.includes('upi') || text.includes('offline upi') || text.includes('mesh') || text.includes('idempotency') || text.includes('without internet')) {
    const p = profileData.projects.find(pr => pr.name.toLowerCase().includes('upi')) || profileData.projects[3];
    return `**${p.name}** (${p.subtitle}):\n\n${p.description}\n\n• **Technologies**: ${p.technologies.join(', ')}\n• **Key Features**: ${p.features.join(', ')}\n• **Architecture**: \`${p.architecture}\`\n\nCheck out the repository on [GitHub](${p.gitHub || profileData.contact.gitHub}).`;
  }

  // 18. Projects in general
  if (text.includes('project') || text.includes('portfolio') || text.includes('built') || text.includes('work') || text.includes('apps') || text.includes('github repo')) {
    const list = profileData.projects.map(p => `• **${p.name}** (${p.subtitle}): ${p.description} *(Tech: ${p.technologies.join(', ')})*`).join('\n\n');
    return `Here are the practical projects developed by Shivendra:\n\n${list}\n\nExplore repositories on [GitHub](${profileData.contact.gitHub})!`;
  }

  // 19. Technologies / Skills / Languages
  if (text.includes('technolog') || text.includes('skill') || text.includes('stack') || text.includes('know') || text.includes('tools') || text.includes('framework') || text.includes('database') || text.includes('frontend') || text.includes('backend')) {
    return `Here is Shivendra's complete technical skill set:\n\n• **Programming**: Java (Core Java), Python (Basic), JavaScript (Basic)\n• **Backend**: Spring Boot, RESTful APIs, Spring MVC, Spring Data JPA, Hibernate, JDBC\n• **Frontend**: HTML5, CSS3, Bootstrap, JavaScript\n• **Databases**: MySQL, SQL, MongoDB (Basic)\n• **Tools**: Git, GitHub, Postman, IntelliJ IDEA, Eclipse, MS Office, QGIS, SPSS, Canva\n• **Core Concepts**: OOP, MVC Architecture, CRUD Operations, Exception Handling, Data Structures & Algorithms (DSA)`;
  }

  // Specific tech checks
  if (text.includes('java') || text.includes('spring') || text.includes('mysql') || text.includes('sql') || text.includes('hibernate') || text.includes('jpa') || text.includes('postman') || text.includes('git') || text.includes('bootstrap') || text.includes('python') || text.includes('mongodb')) {
    return `Yes! Shivendra works with **Java (Core Java)**, **Spring Boot**, **RESTful APIs**, **MySQL**, **SQL**, **HTML5/CSS3/Bootstrap**, **JavaScript**, and has familiarity with **Python** and **MongoDB**. He uses **Git/GitHub** for version control and **Postman** for API testing.`;
  }

  // 20. Education & Academic Marks / CGPA
  if (text.includes('education') || text.includes('degree') || text.includes('college') || text.includes('university') || text.includes('study') || text.includes('graduate') || text.includes('graduat') || text.includes('qualification') || text.includes('cgpa') || text.includes('marks') || text.includes('percent') || text.includes('school') || text.includes('hsc') || text.includes('ssc') || text.includes('thakur')) {
    return `**Shivendra's Educational Background**:\n\n• **Bachelor of Computer Science (B.Sc. CS)**\n  Thakur Ramnarayan College of Arts and Commerce (Mumbai University) — **CGPA: 8.5** (2026)\n\n• **Higher Secondary Certificate (HSC)**\n  Mother Mary Junior College of Arts, Science and Commerce — **54.46%**\n\n• **Secondary School Certificate (SSC)**\n  K.B. Narawat High School — **67.80%**`;
  }

  // 21. Currently Learning / Practicing
  if (text.includes('learning') || text.includes('practicing') || text.includes('currently') || text.includes('future') || text.includes('goal')) {
    const learningList = profileData.currentlyLearning.map(item => `• ${item}`).join('\n');
    return `Shivendra is currently focused on mastering:\n\n${learningList}`;
  }

  // 22. Career focus / Job role / Opportunity / Resume summary
  if (text.includes('career') || text.includes('role') || text.includes('job') || text.includes('position') || text.includes('opportunity') || text.includes('opportunities') || text.includes('summary')) {
    return `**Professional Summary**:\n\nShivendra is a **${profileData.personal.careerFocus}** with hands-on experience in Java, Spring Boot, RESTful APIs, HTML, CSS, Bootstrap, SQL, and MySQL. He has internship experience at SDAC Infotech and is seeking an entry-level **Software Developer** role to build reliable applications.\n\nYou can reach him via Email at [${profileData.personal.email}](mailto:${profileData.personal.email}) or connect on [LinkedIn](${profileData.contact.linkedIn})!`;
  }

  // 23. Who is Shivendra / Overview
  if (text.includes('who is') || text.includes('about shivendra') || text.includes('tell me about shivendra') || text.includes('introduce') || text.includes('bio') || text.includes('overview') || text.includes('shivendra')) {
    return `**${profileData.personal.name}** is a **${profileData.personal.careerFocus}** from Bhayander East, Thane (B.Sc. CS with **8.5 CGPA**).\n\nHe has completed a Software Development Internship at **SDAC Infotech**, built practical Spring Boot & MySQL projects (such as **ExamPrep**, **Fleet Management System**, and **Import-Export Management System**), and completed certifications with **IIT Bombay** and **TNS India Foundation**.`;
  }

  // Default fallback adhering strictly to rules
  return "I don't have that information about Shivendra at the moment. You can ask me about his Java & Spring Boot skills, projects (ExamPrep, Fleet Management), internship at SDAC Infotech, education (8.5 CGPA), or how to get in touch!";
}

// --- 5. Call Google Gemini API ---
async function callGeminiAPI(userMessage, conversationHistory = []) {
  const apiKey = process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.trim() : '';

  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    // If no API key configured, use the built-in knowledge matcher
    return handleLocalKnowledgeFallback(userMessage);
  }

  const systemInstruction = buildSystemPrompt();

  // Prepare Gemini payload
  const contents = [];

  // Add conversation history if provided
  if (Array.isArray(conversationHistory)) {
    for (const msg of conversationHistory.slice(-6)) {
      if (msg.role && msg.text) {
        contents.push({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: String(msg.text) }]
        });
      }
    }
  }

  // Append current user message
  contents.push({
    role: 'user',
    parts: [{ text: userMessage }]
  });

  const payload = {
    systemInstruction: {
      parts: [{ text: systemInstruction }]
    },
    contents: contents,
    generationConfig: {
      temperature: 0.2,
      maxOutputTokens: 500,
    }
  };

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      console.warn(`Gemini API returned status ${response.status}. Using knowledge base fallback.`);
      return handleLocalKnowledgeFallback(userMessage);
    }

    const data = await response.json();
    const candidate = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (candidate) {
      return candidate.trim();
    }
    return handleLocalKnowledgeFallback(userMessage);
  } catch (err) {
    console.error('Error invoking Gemini API:', err);
    return handleLocalKnowledgeFallback(userMessage);
  }
}

// --- 6. Email Forwarding Service ---
let nodemailer = null;
try {
  nodemailer = require('nodemailer');
} catch (e) {
  // Nodemailer optional
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function generateEmailHtml({ name, email, subject, message, timestamp }) {
  return `
    <div style="font-family: Arial, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background-color: #0b0c10; color: #f3f4f6; border-radius: 12px; overflow: hidden; border: 1px solid #1f2430;">
      <div style="background: linear-gradient(135deg, #0284c7 0%, #6366f1 100%); padding: 24px 28px;">
        <h2 style="margin: 0; color: #ffffff; font-size: 20px; font-weight: 700; letter-spacing: 0.5px;">📬 New Message from Portfolio</h2>
        <p style="margin: 6px 0 0; color: rgba(255, 255, 255, 0.85); font-size: 13px;">Sent via your portfolio website contact form</p>
      </div>
      <div style="padding: 28px;">
        <div style="background: #141721; border-radius: 8px; padding: 18px 20px; margin-bottom: 20px; border: 1px solid #232838;">
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <tr>
              <td style="padding: 6px 0; color: #94a3b8; width: 90px; font-weight: 600;">Sender:</td>
              <td style="padding: 6px 0; color: #ffffff; font-weight: 700;">${escapeHtml(name)}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #94a3b8; font-weight: 600;">Email:</td>
              <td style="padding: 6px 0;"><a href="mailto:${escapeHtml(email)}" style="color: #38bdf8; text-decoration: underline;">${escapeHtml(email)}</a></td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #94a3b8; font-weight: 600;">Subject:</td>
              <td style="padding: 6px 0; color: #e2e8f0;">${escapeHtml(subject || 'General Inquiry')}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #94a3b8; font-weight: 600;">Date:</td>
              <td style="padding: 6px 0; color: #94a3b8; font-size: 12px;">${timestamp}</td>
            </tr>
          </table>
        </div>

        <div style="margin-bottom: 24px;">
          <h3 style="margin: 0 0 10px; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; color: #38bdf8;">Message:</h3>
          <div style="background: #141721; border-radius: 8px; padding: 20px; color: #f1f5f9; font-size: 15px; line-height: 1.6; border-left: 4px solid #38bdf8; white-space: pre-wrap;">${escapeHtml(message)}</div>
        </div>

        <div style="text-align: center; margin-top: 28px;">
          <a href="mailto:${escapeHtml(email)}?subject=Re:%20${encodeURIComponent(subject || 'Portfolio Inquiry')}" style="display: inline-block; background: linear-gradient(135deg, #38bdf8 0%, #818cf8 100%); color: #06080e; font-weight: 700; font-size: 14px; text-decoration: none; padding: 12px 28px; border-radius: 9999px;">Reply to ${escapeHtml(name)} ↗</a>
        </div>
      </div>
      <div style="background: #090a0d; padding: 16px 28px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #1a1e29;">
        © 2026 Shivendra Gupta Portfolio • Mumbai, Maharashtra, India
      </div>
    </div>
  `;
}

async function sendEmailNotification({ name, email, subject, message, timestamp }) {
  const receiverEmail = (process.env.CONTACT_EMAIL || process.env.CONTACT_RECEIVER_EMAIL || process.env.SMTP_RECEIVER_EMAIL || process.env.SMTP_USER || '').trim();
  const smtpUser = (process.env.SMTP_USER || process.env.GMAIL_USER || '').trim();
  const smtpPass = (process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD || '').trim();
  const smtpHost = (process.env.SMTP_HOST || 'smtp.gmail.com').trim();
  const smtpPort = parseInt(process.env.SMTP_PORT, 10) || 465;
  const smtpSecure = smtpPort === 465;

  // 1. If Resend API Key is configured
  if (process.env.RESEND_API_KEY && process.env.RESEND_API_KEY.trim()) {
    if (!receiverEmail) {
      return { delivered: false, error: 'CONTACT_EMAIL is not set in .env' };
    }
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.RESEND_API_KEY.trim()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: process.env.RESEND_FROM_EMAIL || 'Portfolio Contact <onboarding@resend.dev>',
          to: [receiverEmail],
          reply_to: email,
          subject: `[Portfolio Contact] ${subject || 'New Message from ' + name}`,
          html: generateEmailHtml({ name, email, subject, message, timestamp })
        })
      });
      const resJson = await res.json();
      if (res.ok) {
        console.log(`[Email] Successfully delivered via Resend API to ${receiverEmail} (ID: ${resJson.id})`);
        return { delivered: true, provider: 'resend', messageId: resJson.id };
      } else {
        console.error('[Email] Resend API error response:', resJson);
        return { delivered: false, error: resJson.message || 'Resend delivery failed' };
      }
    } catch (err) {
      console.error('[Email] Resend API request failed:', err.message);
      return { delivered: false, error: `Resend error: ${err.message}` };
    }
  }

  // 2. If SMTP / Gmail credentials are configured
  if (nodemailer && smtpUser && smtpPass) {
    const destination = receiverEmail || smtpUser;
    try {
      const cleanPass = smtpPass.replace(/\s+/g, '');
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpSecure,
        auth: {
          user: smtpUser,
          pass: cleanPass
        }
      });

      const mailOptions = {
        from: `"${name} via Portfolio" <${smtpUser}>`,
        to: destination,
        replyTo: email,
        subject: `[Portfolio Contact] ${subject || 'New Message from ' + name}`,
        text: `New Portfolio Message:\n\nFrom: ${name} (${email})\nSubject: ${subject || 'General Inquiry'}\nDate: ${timestamp}\n\nMessage:\n${message}`,
        html: generateEmailHtml({ name, email, subject, message, timestamp })
      };

      const info = await transporter.sendMail(mailOptions);
      console.log(`[Email] Successfully delivered to ${destination} via SMTP (Message ID: ${info.messageId})`);
      return { delivered: true, provider: 'smtp', messageId: info.messageId };
    } catch (smtpErr) {
      console.error('[Email] SMTP delivery failed:', smtpErr.message);
      return { delivered: false, error: `SMTP delivery failed: ${smtpErr.message}` };
    }
  }

  // 3. Fallback: Direct FormSubmit Email Gateway (Zero-setup instant email delivery)
  const targetEmail = receiverEmail || 'guptashivendra697@gmail.com';
  if (targetEmail) {
    try {
      console.log(`[Email] Dispatching message to ${targetEmail} via secure email gateway...`);
      const gatewayRes = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(targetEmail)}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Referer': 'http://localhost:3000',
          'Origin': 'http://localhost:3000',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Portfolio-Server/2.0'
        },
        body: JSON.stringify({
          name: name,
          email: email,
          _subject: `[Portfolio Contact] ${subject || 'New Message from ' + name}`,
          _replyto: email,
          message: message,
          date: timestamp
        })
      });

      const gatewayJson = await gatewayRes.json();
      if (gatewayRes.ok) {
        const isActivation = (gatewayJson.message || '').toLowerCase().includes('activation');
        if (isActivation) {
          console.log(`\n🔔 [ACTION REQUIRED] FormSubmit sent an 'Activate Form' email to: ${targetEmail}`);
          console.log(`👉 Please check your Inbox (or Spam folder) at ${targetEmail} and click 'Activate Form' once.\n`);
        } else {
          console.log(`[Email Gateway] Successfully processed and delivered to ${targetEmail}`);
        }
        return {
          delivered: true,
          provider: 'gateway',
          message: isActivation
            ? 'Almost done! Check your inbox (or spam) to click the one-time "Activate Form" link.'
            : 'Thanks! Your message has been sent successfully.'
        };
      } else {
        console.warn('[Email Gateway Response Warning]', gatewayJson);
      }
    } catch (gatewayErr) {
      console.error('[Email Gateway Error]', gatewayErr.message);
    }
  }

  // 4. Final fallback error
  console.warn(`[Email Warning] No email provider could deliver message to ${targetEmail}.`);
  return {
    delivered: false,
    error: 'Email service could not transmit message. Please configure CONTACT_EMAIL, SMTP_USER, and SMTP_PASS in .env.'
  };
}

// --- 7. HTTP Server Request Router ---
const server = http.createServer(async (req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = parsedUrl.pathname;

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    });
    res.end();
    return;
  }

  // --- API Endpoint: POST /api/contact (Contact Form Submission) ---
  if (pathname === '/api/contact' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
      if (body.length > 50000) {
        res.writeHead(413, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: 'Payload too large' }));
        req.destroy();
      }
    });

    req.on('end', async () => {
      try {
        const json = JSON.parse(body || '{}');
        const name = (json.name || '').trim();
        const email = (json.email || '').trim();
        const subject = (json.subject || '').trim();
        const message = (json.message || '').trim();

        // 1. Validate required fields
        if (!name || name.length < 2) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: 'Please provide your full name (at least 2 characters).' }));
          return;
        }

        // 2. Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email || !emailRegex.test(email)) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: 'Please enter a valid email address (e.g. name@domain.com).' }));
          return;
        }

        // 3. Validate message length
        if (!message || message.length < 5) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: 'Please enter a message (at least 5 characters).' }));
          return;
        }

        const timestamp = new Date().toISOString();
        const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';

        // 4. Record the submission in data/messages.json
        const messagesPath = path.join(ROOT, 'data', 'messages.json');
        let messages = [];
        try {
          if (fs.existsSync(messagesPath)) {
            const raw = fs.readFileSync(messagesPath, 'utf8');
            messages = JSON.parse(raw || '[]');
          }
        } catch (readErr) {
          messages = [];
        }

        const newMessage = {
          id: 'msg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
          timestamp,
          name,
          email,
          subject: subject || 'No subject provided',
          message,
          clientIp
        };

        messages.unshift(newMessage);

        // Keep maximum 500 messages
        if (messages.length > 500) {
          messages = messages.slice(0, 500);
        }

        fs.writeFileSync(messagesPath, JSON.stringify(messages, null, 2), 'utf8');
        console.log(`[Contact Form] Processing submission from ${name} (${email}): "${subject || 'No Subject'}"`);

        // 5. Attempt actual email delivery
        const emailResult = await sendEmailNotification({ name, email, subject, message, timestamp });

        if (emailResult.delivered) {
          res.writeHead(200, {
            'Content-Type': 'application/json; charset=utf-8',
            'Cache-Control': 'no-cache',
            'Access-Control-Allow-Origin': '*',
          });
          res.end(JSON.stringify({
            success: true,
            message: 'Thanks! Your message has been sent successfully.',
            provider: emailResult.provider
          }));
        } else {
          res.writeHead(503, {
            'Content-Type': 'application/json; charset=utf-8',
            'Cache-Control': 'no-cache',
            'Access-Control-Allow-Origin': '*',
          });
          res.end(JSON.stringify({
            success: false,
            error: emailResult.error || 'Email service could not send the message. Please verify SMTP settings in .env.'
          }));
        }
      } catch (err) {
        console.error('Contact Form Error:', err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: 'Failed to process message. Please try again.' }));
      }
    });
    return;
  }

  // --- API Endpoint: POST /api/chat ---
  if (pathname === '/api/chat' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
      if (body.length > 50000) {
        res.writeHead(413, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Payload too large' }));
        req.destroy();
      }
    });

    req.on('end', async () => {
      try {
        const json = JSON.parse(body || '{}');
        const userMessage = (json.message || '').trim();
        const history = Array.isArray(json.history) ? json.history : [];

        if (!userMessage) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Message is required' }));
          return;
        }

        const reply = await callGeminiAPI(userMessage, history);

        res.writeHead(200, {
          'Content-Type': 'application/json; charset=utf-8',
          'Cache-Control': 'no-cache',
          'Access-Control-Allow-Origin': '*',
        });
        res.end(JSON.stringify({ reply }));
      } catch (err) {
        console.error('API Error:', err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Failed to process chat message' }));
      }
    });
    return;
  }

  // --- API Endpoint: GET /api/profile (Public Knowledge Endpoint) ---
  if (pathname === '/api/profile' && req.method === 'GET') {
    res.writeHead(200, {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-cache',
      'Access-Control-Allow-Origin': '*',
    });
    res.end(JSON.stringify(profileData || {}));
    return;
  }

  // --- Static Files Serving ---
  let reqPath = decodeURI(pathname);
  if (reqPath === '/' || reqPath === '') {
    reqPath = '/index.html';
  }

  const filePath = path.join(ROOT, reqPath);

  // Security check: prevent directory traversal
  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('Forbidden');
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, {
      'Content-Type': contentType,
      'Content-Length': stats.size,
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
      'Access-Control-Allow-Origin': '*',
    });

    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Portfolio Server running at http://localhost:${PORT}/ (PID: ${process.pid})`);
});
