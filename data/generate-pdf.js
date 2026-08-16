/**
 * Generates a clean, valid, professional 1-page PDF Resume for Shivendra Gupta
 */
const fs = require('fs');
const path = require('path');

function createResumePdf() {
  const contentLines = [
    { text: "SHIVENDRA GUPTA", size: 18, bold: true, y: 790 },
    { text: "Bhayander East, Thane, Maharashtra | +91 9372670012 | guptashivendra697@gmail.com", size: 10, y: 772 },
    { text: "Languages: English, Hindi, Marathi | LinkedIn: shivendraguptatech | GitHub: tech-area52", size: 10, y: 758 },

    { text: "------------------------------------------------------------------------------------------------------------------------------------------------", size: 8, y: 746 },
    { text: "PROFESSIONAL SUMMARY", size: 12, bold: true, y: 732 },
    { text: "Bachelor of Computer Science graduate with hands-on experience in Java, Spring Boot, RESTful APIs, HTML, CSS, Bootstrap,", size: 9.5, y: 718 },
    { text: "SQL, and MySQL. Experienced in application development, responsive UI development, database integration, and Git/GitHub-based", size: 9.5, y: 706 },
    { text: "source control. Seeking an entry-level Software Developer role to build reliable applications and contribute to a development team.", size: 9.5, y: 694 },

    { text: "------------------------------------------------------------------------------------------------------------------------------------------------", size: 8, y: 682 },
    { text: "TECHNICAL SKILLS", size: 12, bold: true, y: 668 },
    { text: "• Programming: Java (Core Java), Python (Basic), JavaScript (Basic)", size: 9.5, y: 654 },
    { text: "• Backend: Spring Boot, RESTful APIs, Spring MVC, Spring Data JPA, Hibernate, JDBC", size: 9.5, y: 642 },
    { text: "• Frontend: HTML5, CSS3, Bootstrap, JavaScript", size: 9.5, y: 630 },
    { text: "• Databases: MySQL, SQL, MongoDB (Basic)", size: 9.5, y: 618 },
    { text: "• Tools: Git, GitHub, Postman, IntelliJ IDEA, Eclipse, MS Office, QGIS, SPSS, Canva", size: 9.5, y: 606 },
    { text: "• Core Concepts: Object-Oriented Programming (OOP), MVC Architecture, CRUD Operations, DSA", size: 9.5, y: 594 },

    { text: "------------------------------------------------------------------------------------------------------------------------------------------------", size: 8, y: 582 },
    { text: "WORK EXPERIENCE", size: 12, bold: true, y: 568 },
    { text: "Software Development Intern | SDAC Infotech, Mumbai", size: 10.5, bold: true, y: 554 },
    { text: "• Assisted in developing hybrid applications integrated with Generative AI tools to improve user interactivity.", size: 9.5, y: 540 },
    { text: "• Built responsive, multi-device user interfaces using HTML, CSS, Bootstrap, and Java.", size: 9.5, y: 528 },
    { text: "• Worked with SQL and MySQL for relational database management, backend data retrieval, and integration.", size: 9.5, y: 516 },
    { text: "• Used Git and GitHub for source code management, version tracking, and collaboration on code features.", size: 9.5, y: 504 },

    { text: "------------------------------------------------------------------------------------------------------------------------------------------------", size: 8, y: 492 },
    { text: "PROJECTS", size: 12, bold: true, y: 478 },
    { text: "Student Management System (Spring Boot, Spring Data JPA, MySQL, REST API, Postman)", size: 10, bold: true, y: 464 },
    { text: "• Built complete CRUD backend with Controller -> Service -> Repository -> Database layered architecture.", size: 9.5, y: 452 },
    { text: "Nexus Finance API & Travelogue Portal (Java, Spring Boot, MySQL, REST APIs, JS)", size: 10, bold: true, y: 438 },
    { text: "• Engineered secure financial transaction endpoints and interactive multi-tier full-stack application.", size: 9.5, y: 426 },

    { text: "------------------------------------------------------------------------------------------------------------------------------------------------", size: 8, y: 414 },
    { text: "EDUCATION", size: 12, bold: true, y: 400 },
    { text: "• Bachelor of Computer Science (B.Sc. CS) | Thakur Ramnarayan College of Arts & Commerce (Mumbai University) - CGPA: 8.5 (2026)", size: 9.5, y: 386 },
    { text: "• Higher Secondary Certificate (HSC) | Mother Mary Junior College of Arts, Science and Commerce - 54.46%", size: 9.5, y: 374 },
    { text: "• Secondary School Certificate (SSC) | K.B. Narawat High School - 67.80%", size: 9.5, y: 362 },

    { text: "------------------------------------------------------------------------------------------------------------------------------------------------", size: 8, y: 350 },
    { text: "CERTIFICATIONS & TRAINING", size: 12, bold: true, y: 336 },
    { text: "• Android App Development using Kotlin — IIT Bombay (2025–2026)", size: 9.5, bold: true, y: 322 },
    { text: "  Learned core mobile application architecture and built native Android user interfaces using Kotlin.", size: 9, y: 310 },
    { text: "• Campus to Corporate Career Training — TNS India Foundation", size: 9.5, bold: true, y: 296 },
    { text: "  Training in business communication, corporate workplace dynamics, and professional effectiveness.", size: 9, y: 284 }
  ];

  // Build PDF Stream
  let stream = "BT\n";
  contentLines.forEach(line => {
    const font = line.bold ? "/F2" : "/F1";
    stream += `${font} ${line.size} Tf\n`;
    stream += `50 ${line.y} Td\n`;
    const escaped = line.text.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
    stream += `(${escaped}) Tj\n`;
    stream += `-50 -${line.y} Td\n`;
  });
  stream += "ET\n";

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
  console.log('Shivendra_Gupta_Resume.pdf successfully generated!');
}

createResumePdf();
