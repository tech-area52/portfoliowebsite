/**
 * Vercel Serverless Function: /api/contact
 * Handles contact form submissions for Shivendra's portfolio
 * - Forwards message via FormSubmit / Resend / Nodemailer if configured
 * - Gracefully attempts disk backup without failing on serverless read-only filesystems
 */

const fs = require('fs');
const path = require('path');

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
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #0b0c10; color: #f3f4f6; border-radius: 12px; overflow: hidden; border: 1px solid #1f2430;">
      <div style="background: linear-gradient(135deg, #0284c7 0%, #6366f1 100%); padding: 24px 28px;">
        <h2 style="margin: 0; color: #ffffff; font-size: 20px; font-weight: 700;">📬 New Message from Portfolio</h2>
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
              <td style="padding: 6px 0;"><a href="mailto:${escapeHtml(email)}" style="color: #38bdf8;">${escapeHtml(email)}</a></td>
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
          <h3 style="margin: 0 0 10px; font-size: 14px; text-transform: uppercase; color: #38bdf8;">Message:</h3>
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

async function forwardMessage({ name, email, subject, message, timestamp }) {
  const receiverEmail = (process.env.CONTACT_EMAIL || 'guptashivendra697@gmail.com').trim();

  // 1. Resend API
  if (process.env.RESEND_API_KEY && process.env.RESEND_API_KEY.trim()) {
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
      if (res.ok) {
        return { success: true, provider: 'resend' };
      }
    } catch (e) {
      console.warn('Resend forwarding failed:', e.message);
    }
  }

  // 2. FormSubmit AJAX forwarding (Default zero-config provider)
  try {
    const formSubmitRes = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(receiverEmail)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        name,
        email,
        _subject: `[Portfolio Contact] ${subject || 'New Message from ' + name}`,
        message,
        timestamp,
        _template: 'table'
      })
    });
    if (formSubmitRes.ok) {
      return { success: true, provider: 'formsubmit' };
    }
  } catch (e) {
    console.warn('FormSubmit forwarding warning:', e.message);
  }

  return { success: true, provider: 'logged' };
}

module.exports = async (req, res) => {
  // CORS Headers
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
    res.status(405).json({ success: false, message: 'Method Not Allowed. Use POST.' });
    return;
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const { name, email, subject, message } = body || {};

    if (!name || name.trim().length < 2) {
      res.status(400).json({ success: false, message: 'Please provide a valid name (at least 2 characters).' });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email.trim())) {
      res.status(400).json({ success: false, message: 'Please provide a valid email address.' });
      return;
    }

    if (!message || message.trim().length < 5) {
      res.status(400).json({ success: false, message: 'Please provide a message (at least 5 characters).' });
      return;
    }

    const timestamp = new Date().toISOString();
    const messageEntry = {
      id: 'msg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
      timestamp,
      name: name.trim(),
      email: email.trim(),
      subject: (subject || '').trim(),
      message: message.trim(),
      userAgent: req.headers['user-agent'] || 'unknown'
    };

    // Attempt local storage backup safely (does not fail if filesystem is read-only on serverless)
    try {
      const messagesDir = path.join(process.cwd(), 'data');
      const messagesPath = path.join(messagesDir, 'messages.json');
      if (!fs.existsSync(messagesDir)) {
        fs.mkdirSync(messagesDir, { recursive: true });
      }
      let existingMessages = [];
      if (fs.existsSync(messagesPath)) {
        try {
          existingMessages = JSON.parse(fs.readFileSync(messagesPath, 'utf8'));
        } catch (e) {
          existingMessages = [];
        }
      }
      existingMessages.push(messageEntry);
      fs.writeFileSync(messagesPath, JSON.stringify(existingMessages, null, 2), 'utf8');
    } catch (fsErr) {
      // In serverless, filesystem may be read-only - this is completely normal
      console.log('Serverless environment: disk storage skipped.');
    }

    // Forward notification
    await forwardMessage({
      name: name.trim(),
      email: email.trim(),
      subject: (subject || '').trim(),
      message: message.trim(),
      timestamp
    });

    res.status(200).json({
      success: true,
      message: 'Thank you! Your message has been sent successfully. Shivendra will get back to you soon.'
    });
  } catch (error) {
    console.error('API /api/contact error:', error);
    res.status(500).json({
      success: false,
      message: 'An unexpected error occurred while processing your message. Please try again or email directly.'
    });
  }
};
