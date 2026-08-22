/**
 * Generates an exact, pixel-perfect 1-page PDF Resume matching Shivendra Gupta's Google Doc resume.
 * Uses PDFKit with accurate typography, vector icons, hyperlinks, and ATS-friendly layout.
 */
const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

function generatePixelPerfectResume() {
  const outputPath = path.join(__dirname, '..', 'Shivendra_Gupta_Resume.pdf');
  
  // Create A4 document with balanced margins
  const doc = new PDFDocument({
    size: 'A4', // 595.28 x 841.89 pt
    margins: { top: 40, bottom: 40, left: 45, right: 45 },
    autoFirstPage: true,
    info: {
      Title: 'Shivendra Gupta - Resume',
      Author: 'Shivendra Gupta',
      Subject: 'Software Developer Resume',
      Keywords: 'Java, Spring Boot, RESTful APIs, MySQL, Software Developer, Full-Stack'
    }
  });

  const writeStream = fs.createWriteStream(outputPath);
  doc.pipe(writeStream);

  const leftX = 45;
  const rightX = 550;
  const contentWidth = rightX - leftX; // 505 pt

  // Helper: Draw clean horizontal rule
  function drawDivider(y, color = '#5c768d', lineWidth = 0.75) {
    doc.save()
       .strokeColor(color)
       .lineWidth(lineWidth)
       .moveTo(leftX, y)
       .lineTo(rightX, y)
       .stroke()
       .restore();
  }

  // Vector Icon Helpers for Header
  function drawPinIcon(x, y) {
    doc.save()
       .strokeColor('#dc2626')
       .fillColor('#dc2626')
       .circle(x + 4, y + 4, 3)
       .fill()
       .moveTo(x + 1.5, y + 5)
       .lineTo(x + 4, y + 9)
       .lineTo(x + 6.5, y + 5)
       .fill()
       .fillColor('#ffffff')
       .circle(x + 4, y + 4, 1.2)
       .fill()
       .restore();
  }

  function drawPhoneIcon(x, y) {
    doc.save()
       .strokeColor('#1e293b')
       .fillColor('#1e293b')
       .roundedRect(x + 1, y + 1, 6.5, 9.5, 1.5)
       .fill()
       .fillColor('#ffffff')
       .rect(x + 2, y + 2.5, 4.5, 6)
       .fill()
       .fillColor('#ffffff')
       .circle(x + 4.25, y + 9.2, 0.6)
       .fill()
       .restore();
  }

  function drawMailIcon(x, y) {
    doc.save()
       .strokeColor('#2563eb')
       .fillColor('#2563eb')
       .roundedRect(x + 0.5, y + 1.5, 9, 7, 1)
       .fill()
       .strokeColor('#ffffff')
       .lineWidth(0.8)
       .moveTo(x + 1.5, y + 2.5)
       .lineTo(x + 5, y + 5.2)
       .lineTo(x + 8.5, y + 2.5)
       .stroke()
       .restore();
  }

  function drawBriefcaseIcon(x, y) {
    doc.save()
       .strokeColor('#0284c7')
       .fillColor('#0284c7')
       .roundedRect(x + 0.5, y + 2.5, 9, 6.5, 1)
       .fill()
       .strokeColor('#0284c7')
       .lineWidth(0.8)
       .moveTo(x + 3, y + 2.5)
       .lineTo(x + 3, y + 1)
       .lineTo(x + 7, y + 1)
       .lineTo(x + 7, y + 2.5)
       .stroke()
       .restore();
  }

  function drawCodeIcon(x, y) {
    doc.save()
       .strokeColor('#334155')
       .fillColor('#334155')
       .roundedRect(x + 0.5, y + 1.5, 9, 6.5, 1)
       .fill()
       .strokeColor('#334155')
       .lineWidth(1)
       .moveTo(x + 0.5, y + 8.5)
       .lineTo(x + 9.5, y + 8.5)
       .stroke()
       .restore();
  }

  function drawGlobeIcon(x, y) {
    doc.save()
       .strokeColor('#0d9488')
       .lineWidth(0.8)
       .circle(x + 4.5, y + 5, 4)
       .stroke()
       .moveTo(x + 0.5, y + 5)
       .lineTo(x + 8.5, y + 5)
       .stroke()
       .ellipse(x + 4.5, y + 5, 2, 4)
       .stroke()
       .restore();
  }

  // --- 1. HEADER ---
  doc.font('Helvetica-Bold')
     .fontSize(18)
     .fillColor('#000000')
     .text('SHIVENDRA GUPTA', leftX, 40, { characterSpacing: 0.5 });

  doc.moveDown(0.35);

  // Line 1: Location | Phone | Email
  let curY = doc.y;
  drawPinIcon(leftX, curY);
  
  doc.font('Helvetica')
     .fontSize(9.5)
     .fillColor('#000000')
     .text('  Bhayander East, Thane, Maharashtra  |  ', leftX + 10, curY, { continued: true });

  const phoneX = doc.x;
  drawPhoneIcon(phoneX, curY);
  doc.text('   +91 9372670012  |  ', phoneX + 11, curY, { continued: true });

  const mailX = doc.x;
  drawMailIcon(mailX, curY);
  doc.fillColor('#1155cc')
     .text('   guptashivendra697@gmail.com', mailX + 12, curY, {
       link: 'mailto:guptashivendra697@gmail.com',
       underline: true,
       continued: false
     });

  doc.moveDown(0.25);
  drawDivider(doc.y, '#5c768d', 1.0);
  doc.moveDown(0.3);

  // Line 2: LinkedIn | GitHub | Portfolio
  curY = doc.y;
  drawBriefcaseIcon(leftX, curY);
  doc.font('Helvetica')
     .fontSize(9.5)
     .fillColor('#1155cc')
     .text('  LinkedIn', leftX + 11, curY, { link: 'https://www.linkedin.com/in/shivendraguptatech', underline: true, continued: true });
  
  doc.fillColor('#000000')
     .text('  |  ', { underline: false, continued: true });

  const ghX = doc.x;
  drawCodeIcon(ghX, curY);
  doc.fillColor('#1155cc')
     .text('   GitHub', ghX + 11, curY, { link: 'https://github.com/tech-area52', underline: true, continued: true });

  doc.fillColor('#000000')
     .text('  |  ', { underline: false, continued: true });

  const portX = doc.x;
  drawGlobeIcon(portX, curY);
  doc.fillColor('#1155cc')
     .text('   Portfolio', portX + 11, curY, { link: 'https://tech-area52.vercel.app', underline: true, continued: false });

  doc.moveDown(0.22);

  // Line 3: Languages
  doc.font('Helvetica')
     .fontSize(9.5)
     .fillColor('#000000')
     .text('Languages: English, Hindi, Marathi', leftX);

  doc.moveDown(0.45);

  // --- 2. PROFESSIONAL SUMMARY ---
  doc.font('Helvetica-Bold')
     .fontSize(10.5)
     .fillColor('#000000')
     .text('PROFESSIONAL SUMMARY', leftX);

  doc.moveDown(0.12);
  drawDivider(doc.y, '#5c768d', 0.65);
  doc.moveDown(0.35);

  doc.font('Helvetica')
     .fontSize(9.2)
     .fillColor('#000000')
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

  doc.moveDown(0.12);
  drawDivider(doc.y, '#5c768d', 0.65);
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
       .text('●  ', leftX + 4, y, { continued: true })
       .text(s.label, { continued: true })
       .font('Helvetica')
       .fillColor('#000000')
       .text(s.val);
    doc.moveDown(0.2);
  });

  doc.moveDown(0.35);

  // --- 4. WORK EXPERIENCE ---
  doc.font('Helvetica-Bold')
     .fontSize(10.5)
     .fillColor('#000000')
     .text('WORK EXPERIENCE', leftX);

  doc.moveDown(0.12);
  drawDivider(doc.y, '#5c768d', 0.65);
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
       .text('●  ', leftX + 4, y, { continued: true })
       .font('Helvetica')
       .fillColor('#000000')
       .text(b, {
         width: contentWidth - 14,
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

  doc.moveDown(0.12);
  drawDivider(doc.y, '#5c768d', 0.65);
  doc.moveDown(0.35);

  // Edu 1: Bachelor of CS
  let eduY = doc.y;
  doc.font('Helvetica-Bold')
     .fontSize(9.2)
     .fillColor('#000000')
     .text('●  ', leftX + 4, eduY, { continued: true })
     .text('Bachelor of Computer Science', { continued: true })
     .font('Helvetica')
     .fillColor('#000000')
     .text(' — Thakur Ramnarayan College of Arts and Commerce | ', { continued: true })
     .font('Helvetica-Bold')
     .fillColor('#000000')
     .text('CGPA: 8.5');

  doc.moveDown(0.22);

  // Edu 2: HSC
  eduY = doc.y;
  doc.font('Helvetica-Bold')
     .fontSize(9.2)
     .fillColor('#000000')
     .text('●  ', leftX + 4, eduY, { continued: true })
     .text('Higher Secondary Certificate (HSC)', { continued: true })
     .font('Helvetica')
     .fillColor('#000000')
     .text(' — Mother Mary Junior College of Arts, Science and Commerce | ', { continued: true })
     .font('Helvetica-Bold')
     .fillColor('#000000')
     .text('54.46%');

  doc.moveDown(0.22);

  // Edu 3: SSC
  eduY = doc.y;
  doc.font('Helvetica-Bold')
     .fontSize(9.2)
     .fillColor('#000000')
     .text('●  ', leftX + 4, eduY, { continued: true })
     .text('Secondary School Certificate (SSC)', { continued: true })
     .font('Helvetica')
     .fillColor('#000000')
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

  doc.moveDown(0.12);
  drawDivider(doc.y, '#5c768d', 0.65);
  doc.moveDown(0.35);

  // Cert 1: Campus to Corporate
  let certY = doc.y;
  doc.font('Helvetica-Bold')
     .fontSize(9.2)
     .fillColor('#000000')
     .text('●  ', leftX + 4, certY, { continued: true })
     .text('Campus to Corporate Career Training', { continued: true })
     .font('Helvetica')
     .fillColor('#000000')
     .text(' — TNS India Foundation');

  doc.moveDown(0.15);
  doc.font('Helvetica')
     .fontSize(8.8)
     .fillColor('#222222')
     .text('Training in business communication, corporate workplace dynamics, and professional effectiveness.', leftX + 16, doc.y, {
       width: contentWidth - 16,
       lineGap: 1.5
     });

  doc.moveDown(0.28);

  // Cert 2: Android App Development
  certY = doc.y;
  doc.font('Helvetica-Bold')
     .fontSize(9.2)
     .fillColor('#000000')
     .text('●  ', leftX + 4, certY, { continued: true })
     .text('Android App Development using Kotlin', { continued: true })
     .font('Helvetica')
     .fillColor('#000000')
     .text(' — IIT Bombay (2025–2026)');

  doc.moveDown(0.15);
  doc.font('Helvetica')
     .fontSize(8.8)
     .fillColor('#222222')
     .text('Learned core mobile application architecture and built native Android user interfaces using Kotlin.', leftX + 16, doc.y, {
       width: contentWidth - 16,
       lineGap: 1.5
     });

  // End Document
  doc.end();

  writeStream.on('finish', () => {
    console.log('✅ Pixel-Perfect Shivendra_Gupta_Resume.pdf successfully generated!');
  });
}

generatePixelPerfectResume();
