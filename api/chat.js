/**
 * Vercel Serverless Function: /api/chat
 * Handles conversational queries for "Ask About Shivendra" AI Assistant
 * - Securely calls Google Gemini API (GEMINI_API_KEY remains 100% server-side)
 * - Falls back to localized intelligent knowledge engine if Gemini is unavailable
 */

const fs = require('fs');
const path = require('path');

// Load profile knowledge base
let profileData = null;
try {
  const profilePath = path.join(process.cwd(), 'data', 'shivendra-profile.json');
  if (fs.existsSync(profilePath)) {
    profileData = JSON.parse(fs.readFileSync(profilePath, 'utf8'));
  }
} catch (e) {
  console.warn('Could not read shivendra-profile.json from disk:', e.message);
}

// Fallback hardcoded profile data if file cannot be read in serverless runtime
if (!profileData) {
  profileData = {
    personal: {
      name: "Shivendra Gupta",
      careerFocus: "Java Backend Developer | Aspiring Full-Stack Developer",
      location: "Bhayander East, Thane, Maharashtra, India",
      phone: "+91 9372670012",
      email: "guptashivendra697@gmail.com",
      education: "Bachelor of Computer Science (B.Sc. CS)",
      university: "Thakur Ramnarayan College of Arts and Commerce, University of Mumbai",
      graduationYear: "2026",
      cgpa: "8.5"
    },
    contact: {
      linkedIn: "https://www.linkedin.com/in/shivendraguptatech",
      gitHub: "https://github.com/tech-area52"
    },
    technicalSkills: [
      "Java (Core Java)", "Spring Boot", "RESTful APIs", "Spring MVC", "Spring Data JPA",
      "Hibernate", "MySQL", "SQL", "HTML5", "CSS3", "Bootstrap", "JavaScript",
      "Python (Basic)", "MongoDB (Basic)", "Postman", "Git", "GitHub", "IntelliJ IDEA"
    ],
    currentlyLearning: [
      "Data Structures and Algorithms (DSA) in Java",
      "Advanced Spring Boot & Spring Security",
      "Microservices Architecture",
      "Cloud Deployment & Docker"
    ],
    projects: [
      {
        name: "ExamPrep",
        subtitle: "AI-Powered Exam Preparation Platform",
        description: "An exam preparation platform designed to help students practice and prepare for exams through quizzes and structured learning.",
        technologies: ["Java", "Spring Boot", "REST APIs", "MySQL", "JavaScript"],
        features: ["AI-generated quiz questions", "Topic/subject-based practice", "Quiz attempts and score tracking", "Student-focused learning experience"],
        architecture: "Spring Boot REST Controller • JPA Service Layer • MySQL Database"
      },
      {
        name: "Fleet Management System",
        subtitle: "Centralized Fleet Operations & Logistics",
        description: "A web application designed to manage fleet-related operations and business information through a centralized system.",
        technologies: ["Java", "Spring Boot", "MySQL", "REST APIs", "Bootstrap"],
        features: ["Fleet and vehicle record management", "Driver and route allocation", "Maintenance and status tracking", "Relational database integration"],
        architecture: "Spring Boot MVC • JPA Data Layer • Relational MySQL"
      },
      {
        name: "Import-Export Management System",
        subtitle: "Trade, Inventory & Shipment Tracking",
        description: "A web application for managing import-export products, inventory and related business operations through a centralized system.",
        technologies: ["Java", "Spring Boot", "MySQL", "Hibernate", "REST APIs"],
        features: ["Product and shipment management", "Import/export transaction records", "Inventory level and stock tracking", "Order processing and database operations"],
        architecture: "Spring Boot REST APIs • Hibernate ORM • MySQL Schema"
      }
    ]
  };
}

function buildSystemPrompt() {
  return `You are the official AI Assistant for Shivendra Gupta's portfolio website.
Your role is to represent Shivendra professionally, accurately, and warmly.

STRICT KNOWLEDGE BASE:
Name: ${profileData.personal.name}
Education: ${profileData.personal.education}, ${profileData.personal.university} (CGPA: 8.5, Graduation: 2026)
Career Focus: ${profileData.personal.careerFocus}
Status: Open to Opportunities (Entry-Level Java Backend / Software Developer roles)
Location: ${profileData.personal.location}
Phone: ${profileData.personal.phone}
Email: ${profileData.personal.email}

Technical Skills:
${profileData.technicalSkills.join(', ')}

Currently Learning:
${profileData.currentlyLearning.join(', ')}

Projects:
${profileData.projects.map(p => `• ${p.name} (${p.subtitle}): ${p.description}
  Technologies: ${p.technologies.join(', ')}
  Features: ${p.features.join(', ')}
  Architecture: ${p.architecture}`).join('\n\n')}

Experience:
• Software Development Intern | SDAC Infotech, Mumbai
  - Assisted in developing hybrid applications integrated with Generative AI tools to improve user interactivity.
  - Built responsive, multi-device user interfaces using HTML, CSS, Bootstrap, and Java.
  - Worked with SQL and MySQL for relational database management and backend data retrieval.
  - Used Git and GitHub for version control.

Certifications:
1. Android App Development using Kotlin — IIT Bombay
2. Campus to Corporate Career Training — TNS India Foundation

Languages: English, Hindi, Marathi

STRICT BEHAVIORAL RULES:
1. GREETINGS: If greeted, respond warmly and invite questions about Shivendra's skills, projects, internship, or resume.
2. RELEVANT QUESTIONS: Provide accurate facts from his resume.
3. HONEST BOUNDARIES: Never invent salaries, unlisted compensation, or fake facts. If asked for unknown info, say: "I don't have that information about Shivendra at the moment."
4. CONTACT: Provide clickable markdown links for Email, [LinkedIn](${profileData.contact.linkedIn}), [GitHub](${profileData.contact.gitHub}), and [Download Resume](/Shivendra_Gupta_Resume.pdf).
5. Keep answers concise, clear, and professional.`;
}

function handleLocalKnowledgeFallback(message) {
  const text = (message || '').toLowerCase().trim();

  // 1. Greetings
  if (/^(hello|hi|hey|heyy|heya|howdy|hola|greetings|namaste|good\s*(morning|afternoon|evening|day)|what'?s\s*up|sup|yo)\b/i.test(text) || text === 'hi' || text === 'hello' || text === 'hey') {
    return `Hello! 👋 I'm Shivendra's AI portfolio assistant. Nice to meet you!\n\nFeel free to ask me about:\n• **Technical Skills** in Java, Spring Boot & REST APIs\n• **Projects** (ExamPrep, Fleet Management, Import-Export)\n• **Internship Experience** at SDAC Infotech\n• **Education & CGPA** (B.Sc. Computer Science, 8.5 CGPA)\n• **Certifications** (IIT Bombay Android/Kotlin, TNS Foundation)\n• **Download Resume** in PDF format\n\nHow can I help you today?`;
  }

  // 2. Status / How are you
  if (text.includes('how are you') || text.includes('how r u') || text.includes('how do you do')) {
    return `I'm doing great, thank you for asking! 😊 I'm here and ready to answer any questions you have about Shivendra Gupta's background, skills, and projects. What would you like to know?`;
  }

  // 3. Thank you / Bye
  if (/\b(thank\s*you|thanks|thx|appreciate\s*it)\b/i.test(text)) {
    return `You're very welcome! 😊 Feel free to ask if you have any other questions about Shivendra, or connect with him on [LinkedIn](${profileData.contact.linkedIn})!`;
  }
  if (/\b(bye|goodbye|see\s*you|cya|take\s*care)\b/i.test(text)) {
    return `Goodbye! 👋 Have a wonderful day, and thank you for visiting Shivendra's portfolio!`;
  }

  // 4. Confidential salary check
  if (/\b(salary|compensation|pay|ctc|earnings?|wage|wages)\b/i.test(text) && !text.includes('learning')) {
    return "I don't have that information about Shivendra at the moment.";
  }

  // 5. Work Experience / Internship (SDAC Infotech)
  if (text.includes('intern') || text.includes('sdac') || text.includes('work experience') || text.includes('job experience') || text.includes('employment') || (text.includes('experience') && (text.includes('work') || text.includes('company') || text.includes('job')))) {
    return `**Software Development Intern** | **SDAC Infotech, Mumbai**\n\n• **Generative AI Integration**: Assisted in developing hybrid applications integrated with Generative AI tools to improve user interactivity.\n• **Frontend & UI**: Built responsive, multi-device user interfaces using HTML, CSS, Bootstrap, and Java.\n• **Database**: Worked with SQL and MySQL for relational database management, backend data retrieval, and integration.\n• **Version Control**: Used Git and GitHub for source code management, version tracking, and team collaboration.`;
  }

  // 6. Certifications & Training
  if (text.includes('certificate') || text.includes('certification') || text.includes('training') || text.includes('iit') || text.includes('bombay') || text.includes('kotlin') || text.includes('tns')) {
    return `Shivendra has completed the following certifications & professional training:\n\n1. **Android App Development using Kotlin** — **IIT Bombay** (2025–2026)\n   • Learned core mobile application architecture and developed native Android user interfaces in Kotlin.\n\n2. **Campus to Corporate Career Training** — **TNS India Foundation**\n   • Professional training in business communication, corporate workplace dynamics, and professional effectiveness.`;
  }

  // 7. Why Hire Shivendra / Strengths / Value Proposition
  if (text.includes('why hire') || text.includes('why should we hire') || text.includes('strength') || text.includes('why choose') || text.includes('why shivendra') || text.includes('qualities') || text.includes('best candidate') || text.includes('hire him') || text.includes('why should i hire')) {
    return `**Why Shivendra is a Strong Addition to Your Team**:\n\n1. **Solid Backend Foundation**: Hands-on practical expertise with Core Java, Spring Boot, REST APIs, JPA/Hibernate, and MySQL.\n2. **Real Internship Experience**: Proven ability to collaborate in team environments, integrate GenAI tools, and build multi-device responsive interfaces at SDAC Infotech.\n3. **Strong Academic Track Record**: Holds a B.Sc. in Computer Science with a **CGPA of 8.5**.\n4. **Continuous Learner & Problem Solver**: Proactive in DSA practice and staying up-to-date with modern software engineering best practices.\n\nHe is ready to contribute to your engineering goals from day one!`;
  }

  // 8. Resume Download Query
  if (text.includes('download resume') || text.includes('resume pdf') || text.includes('get resume') || text.includes('resume link') || text.includes('cv') || text === 'resume' || text.includes('resume')) {
    return `You can download Shivendra's verified resume in PDF format directly:\n\n📄 **[Download Shivendra Gupta Resume (PDF)](/Shivendra_Gupta_Resume.pdf)**\n\nYou can also connect with him on [LinkedIn](${profileData.contact.linkedIn}) or view his code on [GitHub](${profileData.contact.gitHub}).`;
  }

  // 9. Phone / Mobile Number
  if (text.includes('phone') || text.includes('mobile') || text.includes('number') || text.includes('call') || text.includes('whatsapp')) {
    return `You can reach Shivendra by phone at **${profileData.personal.phone}** or via email at [${profileData.personal.email}](mailto:${profileData.personal.email}).`;
  }

  // 10. Spoken languages
  if ((text.includes('language') && !text.includes('programming') && !text.includes('coding')) || text.includes('speak') || text.includes('hindi') || text.includes('marathi') || text.includes('fluency') || text.includes('mother tongue')) {
    return `Shivendra is proficient in **English**, **Hindi**, and **Marathi**.`;
  }

  // 11. Data Structures & Algorithms (DSA)
  if (text.includes('dsa') || text.includes('algorithm') || text.includes('data structure') || text.includes('problem solving') || text.includes('leetcode')) {
    return `**DSA & Problem Solving**:\n\nShivendra regularly practices Data Structures and Algorithms in **Java**. He focuses on arrays, strings, linked lists, recursion, sorting/searching algorithms, and time/space complexity analysis to write clean, efficient code for real-world applications.`;
  }

  // 12. Development Workflow / Engineering Process
  if (text.includes('process') || text.includes('workflow') || text.includes('methodology') || text.includes('approach') || text.includes('how do you work') || text.includes('how does he work')) {
    return `**Shivendra's 5-Step Engineering Process**:\n\n1. **01 UNDERSTAND**: Break down requirements and plan feature scope.\n2. **02 PLAN**: Design database tables, schema relations, and REST API endpoints.\n3. **03 BUILD**: Implement robust backend services in Java & Spring Boot.\n4. **04 TEST & IMPROVE**: Thoroughly test endpoints using Postman and handle errors gracefully.\n5. **05 LEARN & GROW**: Refactor code and integrate feedback to continuously improve.`;
  }

  // 13. Tools & Development Environment
  if (text.includes('ide') || text.includes('editor') || text.includes('environment') || text.includes('intellij') || text.includes('eclipse')) {
    return `**Development Tools & Environment**:\n\n• **IDEs**: IntelliJ IDEA, Eclipse, VS Code\n• **API Testing**: Postman\n• **Version Control**: Git & GitHub\n• **Database Tools**: MySQL Workbench\n• **Other Tools**: QGIS, SPSS, Canva, MS Office`;
  }

  // 14. Availability / Joining
  if (text.includes('available') || text.includes('joining') || text.includes('notice') || text.includes('start date') || text.includes('immediate')) {
    return `Shivendra is **actively seeking entry-level Software Developer / Java Backend roles** and is available for immediate discussions. You can reach him directly at [${profileData.personal.email}](mailto:${profileData.personal.email}) or **${profileData.personal.phone}**.`;
  }

  // 15. Contact info
  if (text.includes('contact') || text.includes('reach') || text.includes('hire') || text.includes('connect') || text.includes('linkedin') || text.includes('github') || text.includes('email') || text.includes('touch') || text.includes('message')) {
    return `You can connect with Shivendra through:\n\n• **Email**: [${profileData.personal.email}](mailto:${profileData.personal.email})\n• **Phone**: **${profileData.personal.phone}**\n• **LinkedIn**: [shivendraguptatech](${profileData.contact.linkedIn})\n• **GitHub**: [tech-area52](${profileData.contact.gitHub})\n• **Location**: Bhayander East, Thane, Maharashtra\n\nHe is open to entry-level Software Developer opportunities!`;
  }

  // 16. Specific Project Queries
  if (text.includes('examprep') || text.includes('exam prep') || text.includes('quiz') || text.includes('exam')) {
    const p = profileData.projects[0];
    return `**${p.name}** (${p.subtitle}):\n\n${p.description}\n\n• **Technologies**: ${p.technologies.join(', ')}\n• **Key Features**: ${p.features.join(', ')}\n• **Architecture**: \`${p.architecture}\`\n\nCheck out the repository on [GitHub](${profileData.contact.gitHub}).`;
  }

  if (text.includes('fleet') || text.includes('vehicle')) {
    const p = profileData.projects[1];
    return `**${p.name}** (${p.subtitle}):\n\n${p.description}\n\n• **Technologies**: ${p.technologies.join(', ')}\n• **Key Features**: ${p.features.join(', ')}\n• **Architecture**: \`${p.architecture}\`\n\nCheck out the repository on [GitHub](${profileData.contact.gitHub}).`;
  }

  if (text.includes('import') || text.includes('export') || text.includes('trade') || text.includes('inventory')) {
    const p = profileData.projects[2];
    return `**${p.name}** (${p.subtitle}):\n\n${p.description}\n\n• **Technologies**: ${p.technologies.join(', ')}\n• **Key Features**: ${p.features.join(', ')}\n• **Architecture**: \`${p.architecture}\`\n\nCheck out the repository on [GitHub](${profileData.contact.gitHub}).`;
  }

  // 17. Projects in general
  if (text.includes('project') || text.includes('portfolio') || text.includes('built') || text.includes('work') || text.includes('apps') || text.includes('github repo')) {
    const list = profileData.projects.map(p => `• **${p.name}** (${p.subtitle}): ${p.description} *(Tech: ${p.technologies.join(', ')})*`).join('\n\n');
    return `Here are the practical projects developed by Shivendra:\n\n${list}\n\nExplore repositories on [GitHub](${profileData.contact.gitHub})!`;
  }

  // 18. Technologies / Skills
  if (text.includes('technolog') || text.includes('skill') || text.includes('stack') || text.includes('know') || text.includes('tools') || text.includes('framework') || text.includes('database') || text.includes('frontend') || text.includes('backend')) {
    return `Here is Shivendra's complete technical skill set:\n\n• **Programming**: Java (Core Java), Python (Basic), JavaScript (Basic)\n• **Backend**: Spring Boot, RESTful APIs, Spring MVC, Spring Data JPA, Hibernate, JDBC\n• **Frontend**: HTML5, CSS3, Bootstrap, JavaScript\n• **Databases**: MySQL, SQL, MongoDB (Basic)\n• **Tools**: Git, GitHub, Postman, IntelliJ IDEA, Eclipse, MS Office, QGIS, SPSS, Canva\n• **Core Concepts**: OOP, MVC Architecture, CRUD Operations, Exception Handling, Data Structures & Algorithms (DSA)`;
  }

  // 19. Education & CGPA
  if (text.includes('education') || text.includes('degree') || text.includes('college') || text.includes('university') || text.includes('study') || text.includes('graduate') || text.includes('cgpa') || text.includes('marks') || text.includes('thakur')) {
    return `**Shivendra's Educational Background**:\n\n• **Bachelor of Computer Science (B.Sc. CS)**\n  Thakur Ramnarayan College of Arts and Commerce (Mumbai University) — **CGPA: 8.5** (2026)\n\n• **Higher Secondary Certificate (HSC)**\n  Mother Mary Junior College — **54.46%**\n\n• **Secondary School Certificate (SSC)**\n  K.B. Narawat High School — **67.80%**`;
  }

  // 20. Who is Shivendra / Overview
  if (text.includes('who is') || text.includes('about shivendra') || text.includes('tell me about shivendra') || text.includes('introduce') || text.includes('bio') || text.includes('overview') || text.includes('shivendra')) {
    return `**${profileData.personal.name}** is a **${profileData.personal.careerFocus}** from Bhayander East, Thane (B.Sc. CS with **8.5 CGPA**).\n\nHe has completed a Software Development Internship at **SDAC Infotech**, built practical Spring Boot & MySQL projects (**ExamPrep**, **Fleet Management System**, and **Import-Export Management System**), and completed certifications with **IIT Bombay** and **TNS India Foundation**.`;
  }

  return "I don't have that information about Shivendra at the moment. You can ask me about his Java & Spring Boot skills, projects (ExamPrep, Fleet Management), internship at SDAC Infotech, education (8.5 CGPA), or how to get in touch!";
}

async function callGeminiAPI(userMessage, conversationHistory = []) {
  const apiKey = (process.env.GEMINI_API_KEY || '').trim();

  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    return handleLocalKnowledgeFallback(userMessage);
  }

  const systemInstruction = buildSystemPrompt();
  const contents = [];

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
      console.warn(`Gemini API error status: ${response.status}. Using knowledge fallback.`);
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

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed. Use POST.' });
    return;
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const { message, history } = body || {};

    if (!message || typeof message !== 'string') {
      res.status(400).json({ error: 'Missing or invalid "message" parameter' });
      return;
    }

    const reply = await callGeminiAPI(message.trim(), history || []);
    res.status(200).json({ reply });
  } catch (error) {
    console.error('API /api/chat error:', error);
    res.status(500).json({
      error: 'Internal server error processing chat message',
      reply: "I'm having trouble connecting right now. Please reach out to Shivendra on LinkedIn or email!"
    });
  }
};
