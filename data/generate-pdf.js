/**
 * Generates a clean, valid, professional 1-page PDF Resume matching Shivendra Gupta's updated resume
 */
const fs = require('fs');
const path = require('path');

function createResumePdf() {
  // Page height: 842pt (A4), width: 595pt
  // Margin left: 45pt, right: 550pt (width: 505pt)
  const leftX = 45;
  const lineEndX = 550;

  // We will build drawing commands & text stream
  let stream = "";

  // Helper for drawing horizontal rule
  function drawLine(y) {
    stream += `q 0.8 0.8 0.85 RG 0.75 w ${leftX} ${y} m ${lineEndX} ${y} l S Q\n`;
  }

  const content = [
    // Header
    { text: "SHIVENDRA GUPTA", font: "/F2", size: 20, x: leftX, y: 795, color: "0.08 0.08 0.12 rg" },
    { text: "Bhayander East, Thane, Maharashtra   |   +91 9372670012   |   guptashivendra697@gmail.com", font: "/F1", size: 9.5, x: leftX, y: 775, color: "0.2 0.2 0.25 rg" },
    { text: "LinkedIn: shivendraguptatech   |   GitHub: tech-area52   |   Portfolio: tech-area52.vercel.app", font: "/F1", size: 9.5, x: leftX, y: 760, color: "0.2 0.2 0.25 rg" },
    { text: "Languages: English, Hindi, Marathi", font: "/F1", size: 9.5, x: leftX, y: 745, color: "0.25 0.25 0.3 rg" },

    // Professional Summary
    { rule: 735 },
    { text: "PROFESSIONAL SUMMARY", font: "/F2", size: 11, x: leftX, y: 720, color: "0.08 0.08 0.12 rg" },
    { text: "Bachelor of Computer Science graduate with hands-on experience in Java, Spring Boot, RESTful APIs,", font: "/F1", size: 9.2, x: leftX, y: 704, color: "0.2 0.2 0.2 rg" },
    { text: "HTML, CSS, Bootstrap, SQL, and MySQL. Experienced in application development, responsive UI", font: "/F1", size: 9.2, x: leftX, y: 691, color: "0.2 0.2 0.2 rg" },
    { text: "development, database integration, and Git/GitHub-based source control. Seeking an entry-level Software", font: "/F1", size: 9.2, x: leftX, y: 678, color: "0.2 0.2 0.2 rg" },
    { text: "Developer role to build reliable applications and contribute to a development team.", font: "/F1", size: 9.2, x: leftX, y: 665, color: "0.2 0.2 0.2 rg" },

    // Technical Skills
    { rule: 652 },
    { text: "TECHNICAL SKILLS", font: "/F2", size: 11, x: leftX, y: 637, color: "0.08 0.08 0.12 rg" },
    { text: "•  Programming: ", font: "/F2", size: 9.2, x: leftX, y: 621, color: "0.15 0.15 0.15 rg", inline: "Java (Core Java), Python (Basic), JavaScript (Basic)" },
    { text: "•  Backend: ", font: "/F2", size: 9.2, x: leftX, y: 607, color: "0.15 0.15 0.15 rg", inline: "Spring Boot, RESTful APIs" },
    { text: "•  Frontend: ", font: "/F2", size: 9.2, x: leftX, y: 593, color: "0.15 0.15 0.15 rg", inline: "HTML5, CSS, Bootstrap" },
    { text: "•  Databases: ", font: "/F2", size: 9.2, x: leftX, y: 579, color: "0.15 0.15 0.15 rg", inline: "MySQL, SQL, MongoDB (Basic)" },
    { text: "•  Tools: ", font: "/F2", size: 9.2, x: leftX, y: 565, color: "0.15 0.15 0.15 rg", inline: "Git, GitHub, MS Office, QGIS, SPSS, Canva" },

    // Work Experience
    { rule: 552 },
    { text: "WORK EXPERIENCE", font: "/F2", size: 11, x: leftX, y: 537, color: "0.08 0.08 0.12 rg" },
    { text: "Software Development Intern  |  SDAC Infotech, Mumbai", font: "/F2", size: 9.8, x: leftX, y: 521, color: "0.1 0.1 0.15 rg" },
    { text: "•  Assisted in developing hybrid applications integrated with Generative AI tools to improve user interactivity.", font: "/F1", size: 9.2, x: leftX, y: 506, color: "0.2 0.2 0.2 rg" },
    { text: "•  Built responsive, multi-device user interfaces using HTML, CSS, Bootstrap, and Java.", font: "/F1", size: 9.2, x: leftX, y: 492, color: "0.2 0.2 0.2 rg" },
    { text: "•  Worked with SQL and MySQL for relational database management, backend data retrieval, and integration.", font: "/F1", size: 9.2, x: leftX, y: 478, color: "0.2 0.2 0.2 rg" },
    { text: "•  Used Git and GitHub for source code management, version tracking, and collaboration on code features.", font: "/F1", size: 9.2, x: leftX, y: 464, color: "0.2 0.2 0.2 rg" },

    // Education
    { rule: 450 },
    { text: "EDUCATION", font: "/F2", size: 11, x: leftX, y: 435, color: "0.08 0.08 0.12 rg" },
    { text: "•  Bachelor of Computer Science — Thakur Ramnarayan College of Arts and Commerce  |  CGPA: 8.5", font: "/F2", size: 9.2, x: leftX, y: 419, color: "0.12 0.12 0.15 rg" },
    { text: "•  Higher Secondary Certificate (HSC) — Mother Mary Junior College of Arts, Science and Commerce  |  54.46%", font: "/F1", size: 9.2, x: leftX, y: 403, color: "0.2 0.2 0.2 rg" },
    { text: "•  Secondary School Certificate (SSC) — K.B. Narawat High School  |  67.80%", font: "/F1", size: 9.2, x: leftX, y: 387, color: "0.2 0.2 0.2 rg" },

    // Certifications & Training
    { rule: 373 },
    { text: "CERTIFICATIONS & TRAINING", font: "/F2", size: 11, x: leftX, y: 358, color: "0.08 0.08 0.12 rg" },
    { text: "•  Campus to Corporate Career Training — TNS India Foundation", font: "/F2", size: 9.2, x: leftX, y: 342, color: "0.12 0.12 0.15 rg" },
    { text: "   Training in business communication, corporate workplace dynamics, and professional effectiveness.", font: "/F1", size: 9.0, x: leftX, y: 328, color: "0.3 0.3 0.3 rg" },
    { text: "•  Android App Development using Kotlin — IIT Bombay (2025–2026)", font: "/F2", size: 9.2, x: leftX, y: 310, color: "0.12 0.12 0.15 rg" },
    { text: "   Learned core mobile application architecture and built native Android user interfaces using Kotlin.", font: "/F1", size: 9.0, x: leftX, y: 296, color: "0.3 0.3 0.3 rg" }
  ];

  function escapePdf(str) {
    return str.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
  }

  content.forEach(item => {
    if (item.rule) {
      drawLine(item.rule);
      return;
    }

    if (item.inline) {
      // Bold title followed by regular text
      stream += `BT\n`;
      stream += `${item.color || '0 0 0 rg'}\n`;
      stream += `${item.font} ${item.size} Tf\n`;
      stream += `${item.x} ${item.y} Td\n`;
      stream += `(${escapePdf(item.text)}) Tj\n`;
      stream += `/F1 ${item.size} Tf\n`;
      stream += `(${escapePdf(item.inline)}) Tj\n`;
      stream += `ET\n`;
    } else {
      stream += `BT\n`;
      stream += `${item.color || '0 0 0 rg'}\n`;
      stream += `${item.font} ${item.size} Tf\n`;
      stream += `${item.x} ${item.y} Td\n`;
      stream += `(${escapePdf(item.text)}) Tj\n`;
      stream += `ET\n`;
    }
  });

  const streamLength = Buffer.byteLength(stream);

  const objects = [
    `1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n`,
    `2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n`,
    `3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R /F2 6 0 R >> >> >>\nendobj\n`,
    `4 0 obj\n<< /Length ${streamLength} >>\nstream\n${stream}\nendstream\nendobj\n`,
    `5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n`,
    `6 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj\n`
  ];

  let pdf = "%PDF-1.4\n";
  const xref = [0];
  let offset = Buffer.byteLength(pdf);

  objects.forEach(obj => {
    xref.push(offset);
    pdf += obj;
    offset = Buffer.byteLength(pdf);
  });

  const xrefStart = offset;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (let i = 1; i <= objects.length; i++) {
    pdf += String(xref[i]).padStart(10, '0') + " 00000 n \n";
  }
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF\n`;

  fs.writeFileSync(path.join(__dirname, '..', 'Shivendra_Gupta_Resume.pdf'), Buffer.from(pdf, 'latin1'));
  console.log('Shivendra_Gupta_Resume.pdf successfully generated from updated resume!');
}

createResumePdf();
