/**
 * Generates an exact, pixel-perfect 1-page PDF Resume matching Shivendra Gupta's original resume
 * Uses PDFKit for crisp typography, accurate vectors, clickable hyperlinks, and ATS-compatible formatting.
 */
const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

function generatePixelPerfectResume() {
  const outputPath = path.join(__dirname, '..', 'Shivendra_Gupta_Resume.pdf');
  
  // Create A4 document with 40pt margins
  const doc = new PDFDocument({
    size: 'A4', // 595.28 x 841.89 pt
    margins: { top: 38, bottom: 38, left: 40, right: 40 },
    autoFirstPage: true,
    info: {
      Title: 'Shivendra Gupta - Resume',
      Author: 'Shivendra Gupta',
      Subject: 'Software Developer Resume',
      Keywords: 'Java, Spring Boot, REST APIs, MySQL, Software Developer, Full-Stack'
    }
  });

  const writeStream = fs.createWriteStream(outputPath);
  doc.pipe(writeStream);

  const contentWidth = 595.28 - 80; // 515.28 pt
  const leftX = 40;
  const rightX = 40 + contentWidth;

  // Helper: Draw clean horizontal rule
  function drawDivider(y, color = '#6b7280', lineWidth = 0.6) {
    doc.save()
       .strokeColor(color)
       .lineWidth(lineWidth)
       .moveTo(leftX, y)
       .lineTo(rightX, y)
       .stroke()
       .restore();
  }

  // --- 1. HEADER ---
  doc.font('Helvetica-Bold')
     .fontSize(18)
     .fillColor('#000000')
     .text('SHIVENDRA GUPTA', leftX, 38, { characterSpacing: 0.5 });

  doc.moveDown(0.35);

  // Line 1: Location | Phone | Email
  const currentY = doc.y;
  doc.font('Helvetica')
     .fontSize(9.5)
     .fillColor('#111827');

  doc.text('Bhayander East, Thane, Maharashtra  |  +91 9372670012  |  ', leftX, currentY, { continued: true });
  doc.fillColor('#1d4ed8')
     .text('guptashivendra697@gmail.com', {
       link: 'mailto:guptashivendra697@gmail.com',
       underline: true,
       continued: false
     });

  doc.moveDown(0.2);

  // Line 2: LinkedIn | GitHub | Portfolio
  const linksY = doc.y;
  doc.font('Helvetica')
     .fontSize(9.5)
     .fillColor('#1d4ed8')
     .text('LinkedIn', leftX, linksY, { link: 'https://www.linkedin.com/in/shivendraguptatech', underline: true, continued: true });
  
  doc.fillColor('#111827')
     .text('  |  ', { underline: false, continued: true });

  doc.fillColor('#1d4ed8')
     .text('GitHub', { link: 'https://github.com/tech-area52', underline: true, continued: true });

  doc.fillColor('#111827')
     .text('  |  ', { underline: false, continued: true });

  doc.fillColor('#1d4ed8')
     .text('Portfolio', { link: 'https://tech-area52.vercel.app', underline: true, continued: false });

  doc.moveDown(0.2);

  // Line 3: Languages
  doc.font('Helvetica')
     .fontSize(9.5)
     .fillColor('#111827')
     .text('Languages: English, Hindi, Marathi', leftX);

  doc.moveDown(0.35);
  drawDivider(doc.y, '#9ca3af', 0.65);
  doc.moveDown(0.45);

  // --- 2. PROFESSIONAL SUMMARY ---
  doc.font('Helvetica-Bold')
     .fontSize(10.5)
     .fillColor('#000000')
     .text('PROFESSIONAL SUMMARY', leftX);

  doc.moveDown(0.15);
  drawDivider(doc.y, '#9ca3af', 0.5);
  doc.moveDown(0.35);

  doc.font('Helvetica')
     .fontSize(9.2)
     .fillColor('#1f2937')
     .text(
       'Bachelor of Computer Science graduate with hands-on experience in Java, Spring Boot, RESTful APIs, HTML, CSS, Bootstrap, SQL, and MySQL. Experienced in application development, responsive UI development, database integration, and Git/GitHub-based source control. Seeking an entry-level Software Developer role to build reliable applications and contribute to a development team.',
       leftX,
       doc.y,
       {
         width: contentWidth,
         align: 'left',
         lineGap: 2.2
       }
     );

  doc.moveDown(0.45);

  // --- 3. TECHNICAL SKILLS ---
  doc.font('Helvetica-Bold')
     .fontSize(10.5)
     .fillColor('#000000')
     .text('TECHNICAL SKILLS', leftX);

  doc.moveDown(0.15);
  drawDivider(doc.y, '#9ca3af', 0.5);
  doc.moveDown(0.35);

  const skills = [
    { label: 'Programming: ', val: 'Java (Core Java), Python (Basic), JavaScript (Basic)' },
    { label: 'Backend: ', val: 'Spring Boot, RESTful APIs' },
    { label: 'Frontend: ', val: 'HTML5, CSS, Bootstrap' },
    { label: 'Databases: ', val: 'MySQL, SQL, MongoDB (Basic)' },
    { label: 'Tools: ', val: 'Git, GitHub, MS Office, QGIS, SPSS, Canva' }
  ];

  skills.forEach(s => {
    const y = doc.y;
    doc.font('Helvetica-Bold')
       .fontSize(9.2)
       .fillColor('#000000')
       .text('•  ', leftX + 8, y, { continued: true })
       .text(s.label, { continued: true })
       .font('Helvetica')
       .fillColor('#1f2937')
       .text(s.val);
    doc.moveDown(0.18);
  });

  doc.moveDown(0.35);

  // --- 4. WORK EXPERIENCE ---
  doc.font('Helvetica-Bold')
     .fontSize(10.5)
     .fillColor('#000000')
     .text('WORK EXPERIENCE', leftX);

  doc.moveDown(0.15);
  drawDivider(doc.y, '#9ca3af', 0.5);
  doc.moveDown(0.35);

  doc.font('Helvetica-Bold')
     .fontSize(9.5)
     .fillColor('#000000')
     .text('Software Development Intern | SDAC Infotech, Mumbai', leftX);

  doc.moveDown(0.25);

  const experienceBullets = [
    'Assisted in developing hybrid applications integrated with Generative AI tools to improve user interactivity.',
    'Built responsive, multi-device user interfaces using HTML, CSS, Bootstrap, and Java.',
    'Worked with SQL and MySQL for relational database management, backend data retrieval, and integration.',
    'Used Git and GitHub for source code management, version tracking, and collaboration on code features.'
  ];

  experienceBullets.forEach(b => {
    const y = doc.y;
    doc.font('Helvetica-Bold')
       .fontSize(9.2)
       .fillColor('#000000')
       .text('•  ', leftX + 8, y, { continued: true })
       .font('Helvetica')
       .fillColor('#1f2937')
       .text(b, {
         width: contentWidth - 18,
         lineGap: 1.8
       });
    doc.moveDown(0.2);
  });

  doc.moveDown(0.35);

  // --- 5. EDUCATION ---
  doc.font('Helvetica-Bold')
     .fontSize(10.5)
     .fillColor('#000000')
     .text('EDUCATION', leftX);

  doc.moveDown(0.15);
  drawDivider(doc.y, '#9ca3af', 0.5);
  doc.moveDown(0.35);

  // Edu 1: Bachelor of CS
  let eduY = doc.y;
  doc.font('Helvetica-Bold')
     .fontSize(9.2)
     .fillColor('#000000')
     .text('•  ', leftX + 8, eduY, { continued: true })
     .text('Bachelor of Computer Science', { continued: true })
     .font('Helvetica')
     .fillColor('#1f2937')
     .text(' — Thakur Ramnarayan College of Arts and Commerce | ', { continued: true })
     .font('Helvetica-Bold')
     .fillColor('#000000')
     .text('CGPA: 8.5');

  doc.moveDown(0.2);

  // Edu 2: HSC
  eduY = doc.y;
  doc.font('Helvetica-Bold')
     .fontSize(9.2)
     .fillColor('#000000')
     .text('•  ', leftX + 8, eduY, { continued: true })
     .text('Higher Secondary Certificate (HSC)', { continued: true })
     .font('Helvetica')
     .fillColor('#1f2937')
     .text(' — Mother Mary Junior College of Arts, Science and Commerce | ', { continued: true })
     .font('Helvetica-Bold')
     .fillColor('#000000')
     .text('54.46%');

  doc.moveDown(0.2);

  // Edu 3: SSC
  eduY = doc.y;
  doc.font('Helvetica-Bold')
     .fontSize(9.2)
     .fillColor('#000000')
     .text('•  ', leftX + 8, eduY, { continued: true })
     .text('Secondary School Certificate (SSC)', { continued: true })
     .font('Helvetica')
     .fillColor('#1f2937')
     .text(' — K.B. Narawat High School | ', { continued: true })
     .font('Helvetica-Bold')
     .fillColor('#000000')
     .text('67.80%');

  doc.moveDown(0.35);

  // --- 6. CERTIFICATIONS & TRAINING ---
  doc.font('Helvetica-Bold')
     .fontSize(10.5)
     .fillColor('#000000')
     .text('CERTIFICATIONS & TRAINING', leftX);

  doc.moveDown(0.15);
  drawDivider(doc.y, '#9ca3af', 0.5);
  doc.moveDown(0.35);

  // Cert 1: Campus to Corporate
  let certY = doc.y;
  doc.font('Helvetica-Bold')
     .fontSize(9.2)
     .fillColor('#000000')
     .text('•  ', leftX + 8, certY, { continued: true })
     .text('Campus to Corporate Career Training', { continued: true })
     .font('Helvetica')
     .fillColor('#1f2937')
     .text(' — TNS India Foundation');

  doc.moveDown(0.12);
  doc.font('Helvetica')
     .fontSize(8.8)
     .fillColor('#374151')
     .text('Training in business communication, corporate workplace dynamics, and professional effectiveness.', leftX + 20, doc.y, {
       width: contentWidth - 20,
       lineGap: 1.5
     });

  doc.moveDown(0.25);

  // Cert 2: Android App Development
  certY = doc.y;
  doc.font('Helvetica-Bold')
     .fontSize(9.2)
     .fillColor('#000000')
     .text('•  ', leftX + 8, certY, { continued: true })
     .text('Android App Development using Kotlin', { continued: true })
     .font('Helvetica')
     .fillColor('#1f2937')
     .text(' — IIT Bombay (2025–2026)');

  doc.moveDown(0.12);
  doc.font('Helvetica')
     .fontSize(8.8)
     .fillColor('#374151')
     .text('Learned core mobile application architecture and built native Android user interfaces using Kotlin.', leftX + 20, doc.y, {
       width: contentWidth - 20,
       lineGap: 1.5
     });

  // End Document
  doc.end();

  writeStream.on('finish', () => {
    console.log('✅ Pixel-Perfect Shivendra_Gupta_Resume.pdf successfully generated!');
  });
}

generatePixelPerfectResume();
