/**
 * Contact Form Controller
 * Handles client-side validation, async submission, loading state, and user feedback
 */

(function () {
  'use strict';

  const form = document.getElementById('contact-form');
  if (!form) return;

  const submitBtn = document.getElementById('contact-submit-btn');
  const statusBanner = document.getElementById('contact-status');
  const nameInput = document.getElementById('contact-name');
  const emailInput = document.getElementById('contact-email');
  const subjectInput = document.getElementById('contact-subject');
  const messageInput = document.getElementById('contact-message');

  let isSubmitting = false;

  function showStatus(type, message) {
    if (!statusBanner) return;
    statusBanner.className = `contact-status-banner ${type}`;
    statusBanner.innerHTML = `
      <div class="status-icon">${type === 'success' ? '✅' : '⚠️'}</div>
      <div class="status-message">${message}</div>
    `;
    statusBanner.style.display = 'flex';
  }

  function hideStatus() {
    if (!statusBanner) return;
    statusBanner.style.display = 'none';
    statusBanner.className = 'contact-status-banner';
    statusBanner.innerHTML = '';
  }

  function setButtonState(loading) {
    if (!submitBtn) return;
    isSubmitting = loading;
    submitBtn.disabled = loading;
    if (loading) {
      submitBtn.classList.add('loading');
      submitBtn.innerHTML = `
        <span class="btn-spinner"></span>
        <span>Sending Message...</span>
      `;
    } else {
      submitBtn.classList.remove('loading');
      submitBtn.innerHTML = `
        <span>Send Message</span>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="22" y1="2" x2="11" y2="13"></line>
          <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
        </svg>
      `;
    }
  }

  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    if (isSubmitting) return;

    hideStatus();

    const name = (nameInput?.value || '').trim();
    const email = (emailInput?.value || '').trim();
    const subject = (subjectInput?.value || '').trim();
    const message = (messageInput?.value || '').trim();

    // Client-side validation
    if (!name || name.length < 2) {
      showStatus('error', 'Please provide your full name (at least 2 characters).');
      nameInput?.focus();
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      showStatus('error', 'Please enter a valid email address (e.g. name@domain.com).');
      emailInput?.focus();
      return;
    }

    if (!message || message.length < 5) {
      showStatus('error', 'Please enter a message (at least 5 characters).');
      messageInput?.focus();
      return;
    }

    setButtonState(true);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          subject,
          message,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        showStatus('success', data.message || 'Thanks! Your message has been sent successfully.');
        // Clear form on success
        form.reset();
      } else {
        // Show error and keep entered values intact
        showStatus('error', data.error || 'Failed to send message. Please try again.');
      }
    } catch (err) {
      console.error('Contact Form Submission Error:', err);
      // Keep values intact on error
      showStatus('error', 'Unable to connect to the server. Please check your internet connection and try again.');
    } finally {
      setButtonState(false);
    }
  });
})();
