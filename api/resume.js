const fs = require('fs');
const path = require('path');

module.exports = (req, res) => {
  try {
    const pdfPath = path.join(process.cwd(), 'Shivendra_Gupta_Resume.pdf');
    if (fs.existsSync(pdfPath)) {
      const fileBuffer = fs.readFileSync(pdfPath);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'inline; filename="Shivendra_Gupta_Resume.pdf"');
      res.setHeader('Cache-Control', 'public, max-age=3600, must-revalidate');
      return res.status(200).send(fileBuffer);
    }
    return res.status(404).send('Resume file not found');
  } catch (err) {
    console.error('Error serving resume:', err);
    return res.status(500).send('Internal Server Error');
  }
};
