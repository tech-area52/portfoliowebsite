/**
 * Generates an exact, crystal-clear 1-page PDF Resume matching Shivendra Gupta's Google Doc resume.
 * Uses native PDFKit vector geometry, proper Helvetica encoding, crisp circular bullets, and clickable hyperlinks.
 */
const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

function generatePixelPerfectResume() {
  const outputPath = path.join(__dirname, '..', 'Shivendra_Gupta_Resume.pdf');
  
  // Create A4 document with 40pt top/bottom, 42pt left/right
  const doc = new PDFDocument({
    size: 'A4', // 595.28 x 841.89 pt
    margins: { top: 38, bottom: 38, left: 42, right: 42 },
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

  const leftX = 42;
  const rightX = 553.28;
  const contentWidth = rightX - leftX; // 511.28 pt

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

  // Helper: Draw crisp bullet dot
  function drawBullet(x, y, radius = 2.0, color = '#000000') {
    doc.save()
       .fillColor(color)
       .circle(x, y, radius)
       .fill()
       .restore();
  }

  // --- 1. HEADER ---
  doc.font('Helvetica-Bold')
     .fontSize(17)
     .fillColor('#000000')
     .text('SHIVENDRA GUPTA', leftX, 38, { characterSpacing: 0.3 });

  doc.moveDown(0.35);

  // Line 1: Location | Phone | Email
  const line1Y = doc.y;
  doc.font('Helvetica')
     .fontSize(9.5)
     .fillColor('#000000');

  const locPhoneText = 'Bhayander East, Thane, Maharashtra   |   +91 9372670012   |   ';
  const locPhoneWidth = doc.widthOfString(locPhoneText);
  
  doc.text(locPhoneText, leftX, line1Y, { continued: false });
  
  doc.fillColor('#1155cc')
     .text('guptashivendra697@gmail.com', leftX + locPhoneWidth, line1Y, {
       link: 'mailto:guptashivendra697@gmail.com',
       underline: true,
       continued: false
     });

  doc.y = line1Y + 14;
  drawDivider(doc.y, '#5c768d', 0.85);
  doc.moveDown(0.32);

  // Line 2: LinkedIn | GitHub | Portfolio
  const linksY = doc.y;
  doc.font('Helvetica')
     .fontSize(9.5);

  // LinkedIn
  doc.fillColor('#1155cc')
     .text('LinkedIn', leftX, linksY, { link: 'https://www.linkedin.com/in/shivendraguptatech', underline: true });
  const linkedInWidth = doc.widthOfString('LinkedIn');

  // Separator 1
  doc.fillColor('#000000')
     .text('   |   ', leftX + linkedInWidth, linksY, { underline: false });
  const sep1Width = doc.widthOfString('   |   ');

  // GitHub
  const ghX = leftX + linkedInWidth + sep1Width;
  doc.fillColor('#1155cc')
     .text('GitHub', ghX, linksY, { link: 'https://github.com/tech-area52', underline: true });
  const ghWidth = doc.widthOfString('GitHub');

  // Separator 2
  doc.fillColor('#000000')
     .text('   |   ', ghX + ghWidth, linksY, { underline: false });
  const sep2Width = doc.widthOfString('   |   ');

  // Portfolio
  const portX = ghX + ghWidth + sep2Width;
  doc.fillColor('#1155cc')
     .text('Portfolio', portX, linksY, { link: 'https://portfoliowebsite-delta-ten.vercel.app', underline: true });

  doc.y = linksY + 14;

  // Line 3: Languages
  doc.font('Helvetica')
     .fontSize(9.5)
     .fillColor('#000000')
     .text('Languages: English, Hindi, Marathi', leftX, doc.y);

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
    { label: 'Programming:', val: ' Java (Core Java), Python (Basic), JavaScript (Basic)' },
    { label: 'Backend:', val: ' Spring Boot, RESTful APIs' },
    { label: 'Frontend:', val: ' HTML5, CSS, Bootstrap' },
    { label: 'Databases:', val: ' MySQL, SQL, MongoDB (Basic)' },
    { label: 'Tools:', val: ' Git, GitHub, MS Office, QGIS, SPSS, Canva' }
  ];

  skills.forEach(s => {
    const curY = doc.y;
    // Draw clean vector bullet dot
    drawBullet(leftX + 4, curY + 5, 2.0);

    doc.font('Helvetica-Bold')
       .fontSize(9.2)
       .fillColor('#000000');
    const labelWidth = doc.widthOfString(s.label);
    doc.text(s.label, leftX + 13, curY, { continued: false });

    doc.font('Helvetica')
       .fillColor('#000000')
       .text(s.val, leftX + 13 + labelWidth, curY, {
         width: contentWidth - 13 - labelWidth,
         lineGap: 1.5
       });

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
    const curY = doc.y;
    drawBullet(leftX + 4, curY + 5, 2.0);

    doc.font('Helvetica')
       .fontSize(9.2)
       .fillColor('#000000')
       .text(b, leftX + 13, curY, {
         width: contentWidth - 13,
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

  // Edu 1: Bachelor of Computer Science
  let curEduY = doc.y;
  drawBullet(leftX + 4, curEduY + 5, 2.0);

  doc.font('Helvetica-Bold')
     .fontSize(9.2)
     .fillColor('#000000');
  const d1 = 'Bachelor of Computer Science';
  const w1 = doc.widthOfString(d1);
  doc.text(d1, leftX + 13, curEduY, { continued: false });

  doc.font('Helvetica')
     .fillColor('#000000');
  const i1 = ' — Thakur Ramnarayan College of Arts and Commerce | ';
  const wi1 = doc.widthOfString(i1);
  doc.text(i1, leftX + 13 + w1, curEduY, { continued: false });

  doc.font('Helvetica-Bold')
     .fillColor('#000000')
     .text('CGPA: 8.5', leftX + 13 + w1 + wi1, curEduY, { continued: false });

  doc.y = curEduY + 13;
  doc.moveDown(0.18);

  // Edu 2: HSC
  curEduY = doc.y;
  drawBullet(leftX + 4, curEduY + 5, 2.0);

  doc.font('Helvetica-Bold')
     .fontSize(9.2)
     .fillColor('#000000');
  const d2 = 'Higher Secondary Certificate (HSC)';
  const w2 = doc.widthOfString(d2);
  doc.text(d2, leftX + 13, curEduY, { continued: false });

  doc.font('Helvetica')
     .fillColor('#000000');
  const i2 = ' — Mother Mary Junior College of Arts, Science and Commerce | ';
  const wi2 = doc.widthOfString(i2);
  doc.text(i2, leftX + 13 + w2, curEduY, { continued: false });

  doc.font('Helvetica-Bold')
     .fillColor('#000000')
     .text('54.46%', leftX + 13 + w2 + wi2, curEduY, { continued: false });

  doc.y = curEduY + 13;
  doc.moveDown(0.18);

  // Edu 3: SSC
  curEduY = doc.y;
  drawBullet(leftX + 4, curEduY + 5, 2.0);

  doc.font('Helvetica-Bold')
     .fontSize(9.2)
     .fillColor('#000000');
  const d3 = 'Secondary School Certificate (SSC)';
  const w3 = doc.widthOfString(d3);
  doc.text(d3, leftX + 13, curEduY, { continued: false });

  doc.font('Helvetica')
     .fillColor('#000000');
  const i3 = ' — K.B. Narawat High School | ';
  const wi3 = doc.widthOfString(i3);
  doc.text(i3, leftX + 13 + w3, curEduY, { continued: false });

  doc.font('Helvetica-Bold')
     .fillColor('#000000')
     .text('67.80%', leftX + 13 + w3 + wi3, curEduY, { continued: false });

  doc.y = curEduY + 13;
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
  let curCertY = doc.y;
  drawBullet(leftX + 4, curCertY + 5, 2.0);

  doc.font('Helvetica-Bold')
     .fontSize(9.2)
     .fillColor('#000000');
  const c1 = 'Campus to Corporate Career Training';
  const wc1 = doc.widthOfString(c1);
  doc.text(c1, leftX + 13, curCertY, { continued: false });

  doc.font('Helvetica')
     .fillColor('#000000')
     .text(' — TNS India Foundation', leftX + 13 + wc1, curCertY, { continued: false });

  doc.y = curCertY + 12.5;
  doc.font('Helvetica')
     .fontSize(8.8)
     .fillColor('#1f2937')
     .text('Training in business communication, corporate workplace dynamics, and professional effectiveness.', leftX + 13, doc.y, {
       width: contentWidth - 13,
       lineGap: 1.5
     });

  doc.moveDown(0.28);

  // Cert 2: Android App Development
  curCertY = doc.y;
  drawBullet(leftX + 4, curCertY + 5, 2.0);

  doc.font('Helvetica-Bold')
     .fontSize(9.2)
     .fillColor('#000000');
  const c2 = 'Android App Development using Kotlin';
  const wc2 = doc.widthOfString(c2);
  doc.text(c2, leftX + 13, curCertY, { continued: false });

  doc.font('Helvetica')
     .fillColor('#000000')
     .text(' — IIT Bombay (2025–2026)', leftX + 13 + wc2, curCertY, { continued: false });

  doc.y = curCertY + 12.5;
  doc.font('Helvetica')
     .fontSize(8.8)
     .fillColor('#1f2937')
     .text('Learned core mobile application architecture and built native Android user interfaces using Kotlin.', leftX + 13, doc.y, {
       width: contentWidth - 13,
       lineGap: 1.5
     });

  // End Document
  doc.end();

  writeStream.on('finish', () => {
    console.log('✅ Crystal-Clear Shivendra_Gupta_Resume.pdf successfully generated!');
  });
}

generatePixelPerfectResume();
