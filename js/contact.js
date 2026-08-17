/**
 * Contact Form Controller
 * Allows direct native submission to FormSubmit with loading state feedback
 */

(function () {
  'use strict';

  const form = document.getElementById('contact-form');
  if (!form) return;

  const submitBtn = document.getElementById('contact-submit-btn');

  // Provide visual feedback upon submission while allowing standard browser form submission
  form.addEventListener('submit', function () {
    if (submitBtn) {
      submitBtn.classList.add('loading');
      submitBtn.innerHTML = `
        <span class="btn-spinner"></span>
        <span>Sending Message...</span>
      `;
    }
  });
})();

