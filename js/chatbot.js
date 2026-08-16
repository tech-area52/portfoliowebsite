/**
 * "Ask About Shivendra" AI Chatbot Controller (Advanced Edition)
 * Features:
 * - Real-time conversational AI & local rule matcher
 * - Dynamic context-aware follow-up suggestion chips
 * - Speech Synthesis (Read Aloud) & Voice Speech-to-Text Input
 * - Message Copying to clipboard with visual feedback
 * - Interactive action cards (Download Resume, View Projects, Email, Call)
 * - Safe markdown rendering (Links, code, bold, bullets)
 * - Conversation reset and full history management
 */

(function () {
  'use strict';

  // DOM Elements
  const chatTrigger = document.getElementById('chat-trigger');
  const chatModal = document.getElementById('chat-modal');
  const chatClose = document.getElementById('chat-close');
  const chatClear = document.getElementById('chat-clear');
  const chatMessages = document.getElementById('chat-messages');
  const chatForm = document.getElementById('chat-form');
  const chatInput = document.getElementById('chat-input');
  const chatSendBtn = document.getElementById('chat-send-btn');
  const chatMicBtn = document.getElementById('chat-mic-btn');
  const chatSuggestions = document.getElementById('chat-suggestions');

  // Conversation history for context
  let conversationHistory = [];
  let isGenerating = false;
  let currentUtterance = null;
  let recognition = null;
  let isListening = false;

  /**
   * Escape HTML special characters for security
   */
  function escapeHtml(text) {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;',
    };
    return String(text || '').replace(/[&<>"']/g, m => map[m]);
  }

  /**
   * Parse simple markdown into safe HTML (bold, links, bullet points, inline code)
   */
  function formatMarkdown(text) {
    if (!text) return '';

    let formatted = escapeHtml(text);

    // Markdown Links: [text](url) -> <a href="url" target="_blank" rel="noopener noreferrer">text ↗</a>
    formatted = formatted.replace(
      /\[([^\]]+)\]\(((?:https?:\/\/|mailto:|\/)[^\s)]+)\)/g,
      '<a href="$2" target="_blank" rel="noopener noreferrer" class="chat-link">$1 <span class="ext-icon">↗</span></a>'
    );

    // Auto-link naked URLs that are not already in anchor tags
    formatted = formatted.replace(
      /(^|[^">])(https?:\/\/[^\s<]+)/g,
      '$1<a href="$2" target="_blank" rel="noopener noreferrer" class="chat-link">$2 <span class="ext-icon">↗</span></a>'
    );

    // Bold: **text**
    formatted = formatted.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

    // Inline code: `code`
    formatted = formatted.replace(/`([^`]+)`/g, '<code class="chat-inline-code">$1</code>');

    // Convert bullet points (• or - or *)
    const lines = formatted.split('\n');
    const processedLines = lines.map(line => {
      const trimmed = line.trim();
      if (trimmed.startsWith('• ') || trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        return `<div class="chat-bullet"><span class="chat-bullet-dot">✦</span><span>${trimmed.substring(2)}</span></div>`;
      }
      return line;
    });

    formatted = processedLines.join('<br>');
    formatted = formatted.replace(/(<br>\s*){3,}/g, '<br><br>');

    return formatted;
  }

  /**
   * Determine dynamic contextual follow-up questions based on query & response
   */
  function getSmartFollowUps(query, reply) {
    const q = (query || '').toLowerCase();
    const r = (reply || '').toLowerCase();

    if (q.includes('skill') || q.includes('technolog') || q.includes('java') || q.includes('spring')) {
      return [
        "Tell me about the ExamPrep project",
        "What is his experience with MySQL & databases?",
        "How can I download his resume?"
      ];
    }

    if (q.includes('project') || q.includes('examprep') || q.includes('fleet') || q.includes('import')) {
      return [
        "What technologies were used in ExamPrep?",
        "Where can I view his GitHub code?",
        "What was his engineering process?"
      ];
    }

    if (q.includes('education') || q.includes('cgpa') || q.includes('college') || q.includes('degree')) {
      return [
        "What certifications does he hold?",
        "Tell me about his internship at SDAC Infotech",
        "Why should we hire Shivendra?"
      ];
    }

    if (q.includes('intern') || q.includes('sdac') || q.includes('experience')) {
      return [
        "What GenAI tools did he work with?",
        "What projects has he built?",
        "How can I get in touch with him?"
      ];
    }

    if (q.includes('contact') || q.includes('hire') || q.includes('phone') || q.includes('email') || q.includes('resume')) {
      return [
        "Why should we hire Shivendra?",
        "What are his key technical strengths?",
        "Tell me about his ExamPrep project"
      ];
    }

    // Default smart questions
    return [
      "What technologies does Shivendra know?",
      "Tell me about his ExamPrep project",
      "How can I download his resume?"
    ];
  }

  /**
   * Scroll chat messages container to the bottom
   */
  function scrollToBottom() {
    if (chatMessages) {
      chatMessages.scrollTo({
        top: chatMessages.scrollHeight,
        behavior: 'smooth'
      });
    }
  }

  /**
   * Read text aloud using SpeechSynthesis
   */
  function readAloud(text, btnElement) {
    if (!('speechSynthesis' in window)) {
      alert('Text-to-speech is not supported on this browser.');
      return;
    }

    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      document.querySelectorAll('.chat-listen-btn').forEach(b => {
        b.innerHTML = '🔊 Listen';
        b.classList.remove('speaking');
      });
      if (btnElement && btnElement.dataset.speaking === 'true') {
        btnElement.dataset.speaking = 'false';
        return;
      }
    }

    // Clean markdown/HTML for speech
    const cleanText = text
      .replace(/[*_#`[\]()]/g, '')
      .replace(/<[^>]*>/g, '')
      .replace(/https?:\/\/\S+/g, 'link');

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onstart = () => {
      if (btnElement) {
        btnElement.innerHTML = '⏹️ Stop';
        btnElement.classList.add('speaking');
        btnElement.dataset.speaking = 'true';
      }
    };

    utterance.onend = () => {
      if (btnElement) {
        btnElement.innerHTML = '🔊 Listen';
        btnElement.classList.remove('speaking');
        btnElement.dataset.speaking = 'false';
      }
    };

    utterance.onerror = () => {
      if (btnElement) {
        btnElement.innerHTML = '🔊 Listen';
        btnElement.classList.remove('speaking');
        btnElement.dataset.speaking = 'false';
      }
    };

    currentUtterance = utterance;
    window.speechSynthesis.speak(utterance);
  }

  /**
   * Copy plain text to clipboard with animated feedback
   */
  async function copyToClipboard(text, btnElement) {
    try {
      // Strip markdown symbols for clean copy
      const plainText = text.replace(/[*`_]/g, '');
      await navigator.clipboard.writeText(plainText);

      if (btnElement) {
        const originalHtml = btnElement.innerHTML;
        btnElement.innerHTML = '✓ Copied!';
        btnElement.classList.add('copied');
        setTimeout(() => {
          btnElement.innerHTML = originalHtml;
          btnElement.classList.remove('copied');
        }, 2000);
      }
    } catch (e) {
      console.warn('Clipboard write failed:', e);
    }
  }

  /**
   * Append a message bubble to the chat
   */
  function appendMessage(role, text, originalQuery = '') {
    if (!chatMessages) return;

    const messageRow = document.createElement('div');
    messageRow.className = `chat-msg-row ${role === 'user' ? 'user-row' : 'ai-row'}`;

    const avatar = document.createElement('div');
    avatar.className = `chat-avatar ${role === 'user' ? 'user-avatar' : 'ai-avatar'}`;
    avatar.innerHTML = role === 'user' ? '👤' : '⚡';

    const bubble = document.createElement('div');
    bubble.className = `chat-bubble ${role === 'user' ? 'user-bubble' : 'ai-bubble'}`;

    if (role === 'user') {
      bubble.innerHTML = escapeHtml(text);
    } else {
      bubble.innerHTML = formatMarkdown(text);

      // Check if we should inject quick action buttons into AI response
      const lowerText = text.toLowerCase();
      const actionPills = [];

      if (lowerText.includes('resume') || lowerText.includes('pdf')) {
        actionPills.push(`<a href="/Shivendra_Gupta_Resume.pdf" download="Shivendra_Gupta_Resume.pdf" class="chat-action-pill">📄 Download Resume PDF</a>`);
      }
      if (lowerText.includes('github') || lowerText.includes('repo')) {
        actionPills.push(`<a href="https://github.com/tech-area52" target="_blank" rel="noopener noreferrer" class="chat-action-pill">🐙 GitHub Repos</a>`);
      }
      if (lowerText.includes('contact') || lowerText.includes('email') || lowerText.includes('phone') || lowerText.includes('reach')) {
        actionPills.push(`<a href="mailto:guptashivendra697@gmail.com" class="chat-action-pill">✉️ Send Email</a>`);
        actionPills.push(`<a href="https://www.linkedin.com/in/shivendraguptatech" target="_blank" rel="noopener noreferrer" class="chat-action-pill">💼 LinkedIn</a>`);
      }

      if (actionPills.length > 0) {
        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'chat-quick-actions';
        actionsDiv.innerHTML = actionPills.join('');
        bubble.appendChild(actionsDiv);
      }

      // Bubble Controls Footer: Copy & Read Aloud
      const controlsDiv = document.createElement('div');
      controlsDiv.className = 'chat-bubble-controls';

      const copyBtn = document.createElement('button');
      copyBtn.type = 'button';
      copyBtn.className = 'chat-control-btn chat-copy-btn';
      copyBtn.innerHTML = '📋 Copy';
      copyBtn.addEventListener('click', () => copyToClipboard(text, copyBtn));

      const listenBtn = document.createElement('button');
      listenBtn.type = 'button';
      listenBtn.className = 'chat-control-btn chat-listen-btn';
      listenBtn.innerHTML = '🔊 Listen';
      listenBtn.addEventListener('click', () => readAloud(text, listenBtn));

      controlsDiv.appendChild(copyBtn);
      controlsDiv.appendChild(listenBtn);
      bubble.appendChild(controlsDiv);
    }

    messageRow.appendChild(avatar);
    messageRow.appendChild(bubble);
    chatMessages.appendChild(messageRow);

    // If AI, generate contextual follow-up suggestion chips below the message
    if (role === 'ai') {
      const followUps = getSmartFollowUps(originalQuery, text);
      if (followUps && followUps.length > 0) {
        const followUpRow = document.createElement('div');
        followUpRow.className = 'chat-followups-row';

        const label = document.createElement('span');
        label.className = 'chat-followup-label';
        label.textContent = '💡 Related:';
        followUpRow.appendChild(label);

        followUps.forEach(qText => {
          const chip = document.createElement('button');
          chip.type = 'button';
          chip.className = 'chat-followup-chip';
          chip.textContent = qText;
          chip.addEventListener('click', () => {
            sendMessage(qText);
          });
          followUpRow.appendChild(chip);
        });

        chatMessages.appendChild(followUpRow);
      }
    }

    scrollToBottom();
    return messageRow;
  }

  /**
   * Show typing loading indicator
   */
  function showTypingIndicator() {
    removeTypingIndicator();

    const indicatorRow = document.createElement('div');
    indicatorRow.id = 'chat-typing-indicator';
    indicatorRow.className = 'chat-msg-row ai-row';

    const avatar = document.createElement('div');
    avatar.className = 'chat-avatar ai-avatar';
    avatar.innerHTML = '⚡';

    const bubble = document.createElement('div');
    bubble.className = 'chat-bubble ai-bubble typing-bubble';
    bubble.innerHTML = `
      <div class="typing-dots">
        <span></span>
        <span></span>
        <span></span>
      </div>
    `;

    indicatorRow.appendChild(avatar);
    indicatorRow.appendChild(bubble);
    chatMessages.appendChild(indicatorRow);
    scrollToBottom();
  }

  /**
   * Remove typing loading indicator
   */
  function removeTypingIndicator() {
    const indicator = document.getElementById('chat-typing-indicator');
    if (indicator) {
      indicator.remove();
    }
  }

  /**
   * Open the chat modal
   */
  function openChat() {
    if (!chatModal) return;
    chatModal.classList.add('active');
    chatTrigger?.classList.add('chat-open');
    chatModal.setAttribute('aria-hidden', 'false');
    setTimeout(() => {
      chatInput?.focus();
    }, 150);
  }

  /**
   * Close the chat modal
   */
  function closeChat() {
    if (!chatModal) return;
    if (window.speechSynthesis && window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }
    chatModal.classList.remove('active');
    chatTrigger?.classList.remove('chat-open');
    chatModal.setAttribute('aria-hidden', 'true');
  }

  /**
   * Reset / Clear Conversation
   */
  function resetConversation() {
    if (window.speechSynthesis && window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }

    conversationHistory = [];

    if (chatMessages) {
      chatMessages.innerHTML = `
        <div class="chat-msg-row ai-row">
          <div class="chat-avatar ai-avatar">⚡</div>
          <div class="chat-bubble ai-bubble">
            <p>👋 <strong>Conversation reset!</strong></p>
            <p>How else can I assist you with Shivendra's skills in <strong>Java, Spring Boot, REST APIs</strong>, projects, or resume?</p>
            <div class="chat-quick-actions">
              <a href="/Shivendra_Gupta_Resume.pdf" download="Shivendra_Gupta_Resume.pdf" class="chat-action-pill">📄 Download Resume</a>
              <a href="https://github.com/tech-area52" target="_blank" rel="noopener noreferrer" class="chat-action-pill">🐙 GitHub</a>
              <a href="mailto:guptashivendra697@gmail.com" class="chat-action-pill">✉️ Send Email</a>
            </div>
          </div>
        </div>
      `;
    }

    if (chatInput) {
      chatInput.value = '';
      chatInput.focus();
    }
  }

  /**
   * Speech-to-Text / Voice Input via Web Speech API
   */
  function setupVoiceInput() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      if (chatMicBtn) {
        chatMicBtn.style.display = 'none';
      }
      return;
    }

    recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      isListening = true;
      chatMicBtn?.classList.add('recording');
      if (chatInput) chatInput.placeholder = '🎙️ Listening... speak now';
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      if (chatInput && transcript) {
        chatInput.value = transcript;
        sendMessage(transcript);
      }
    };

    recognition.onerror = (event) => {
      console.warn('Speech recognition error:', event.error);
      stopListening();
    };

    recognition.onend = () => {
      stopListening();
    };

    function startListening() {
      try {
        recognition.start();
      } catch (e) {
        console.warn('Voice recognition start error:', e);
      }
    }

    function stopListening() {
      isListening = false;
      chatMicBtn?.classList.remove('recording');
      if (chatInput) chatInput.placeholder = 'Ask a question about Shivendra...';
    }

    chatMicBtn?.addEventListener('click', (e) => {
      e.preventDefault();
      if (isListening) {
        recognition.stop();
      } else {
        startListening();
      }
    });
  }

  /**
   * Send a question to the backend chat API
   */
  async function sendMessage(text) {
    const query = (text || '').trim();
    if (!query || isGenerating) return;

    // Display user message in UI
    appendMessage('user', query);
    conversationHistory.push({ role: 'user', text: query });

    // Clear input
    if (chatInput) {
      chatInput.value = '';
    }

    // Set generating state
    isGenerating = true;
    if (chatSendBtn) chatSendBtn.disabled = true;
    showTypingIndicator();

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: query,
          history: conversationHistory.slice(-6),
        }),
      });

      removeTypingIndicator();

      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }

      const data = await response.json();
      const reply = data.reply || "I don't have that information about Shivendra at the moment.";

      appendMessage('ai', reply, query);
      conversationHistory.push({ role: 'model', text: reply });
    } catch (err) {
      console.error('Chat error:', err);
      removeTypingIndicator();
      appendMessage('ai', "I'm having trouble connecting right now. Please try again or reach out to Shivendra on [LinkedIn](https://www.linkedin.com/in/shivendraguptatech).", query);
    } finally {
      isGenerating = false;
      if (chatSendBtn) chatSendBtn.disabled = false;
      chatInput?.focus();
    }
  }

  /**
   * Initialize Chatbot Listeners
   */
  function initChatbot() {
    setupVoiceInput();

    // Toggle button click
    chatTrigger?.addEventListener('click', (e) => {
      e.stopPropagation();
      if (chatModal?.classList.contains('active')) {
        closeChat();
      } else {
        openChat();
      }
    });

    // Close button click
    chatClose?.addEventListener('click', (e) => {
      e.stopPropagation();
      closeChat();
    });

    // Clear/Reset button click
    chatClear?.addEventListener('click', (e) => {
      e.stopPropagation();
      resetConversation();
    });

    // Form submission
    chatForm?.addEventListener('submit', (e) => {
      e.preventDefault();
      sendMessage(chatInput?.value);
    });

    // Input keyboard handling (Enter to submit)
    chatInput?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage(chatInput.value);
      }
    });

    // Suggested questions click
    chatSuggestions?.addEventListener('click', (e) => {
      const button = e.target.closest('.suggestion-chip');
      if (button) {
        const question = button.getAttribute('data-question') || button.textContent;
        sendMessage(question.trim());
      }
    });

    // Close modal on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && chatModal?.classList.contains('active')) {
        closeChat();
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initChatbot);
  } else {
    initChatbot();
  }
})();
