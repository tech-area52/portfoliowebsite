/**
 * Smooth Scroll-Driven Video Frame Canvas Animation & Navigation
 * Renders 240 high-resolution frames with DPR scaling, LERP smoothing & progressive preloading
 */

(function () {
  'use strict';

  // Configuration Constants
  const FRAME_COUNT = 240;
  const LERP_FACTOR = 0.09; // Smoothing factor (0.05 = heavier momentum, 0.15 = snappy)
  const MIN_READY_FRAMES = 8; // Minimum frames loaded before unlocking interactive view
  
  // Format frame URL: frames/frame_000000.jpg -> frames/frame_000239.jpg
  const getFrameUrl = (index) => `frames/frame_${String(index).padStart(6, '0')}.jpg`;

  // DOM Elements
  const canvas = document.getElementById('animation-canvas');
  const ctx = canvas ? canvas.getContext('2d', { alpha: false }) : null;
  const loader = document.getElementById('loader');
  const progressBar = document.getElementById('progress-bar');
  const progressText = document.getElementById('progress-text');

  // State
  const frameImages = new Array(FRAME_COUNT).fill(null);
  let loadedCount = 0;
  let targetProgress = 0;
  let currentProgress = 0;
  let lastDrawnFrameIndex = -1;
  let isLoaderDismissed = false;
  let needsResize = true;

  if (ctx) {
    // Set high quality image rendering
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
  }

  /**
   * Resize Canvas to match window dimensions and device pixel ratio
   */
  function handleResize() {
    if (!canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2); // Cap at 2x for optimal performance
    const displayWidth = window.innerWidth;
    const displayHeight = window.innerHeight;

    if (canvas.width !== displayWidth * dpr || canvas.height !== displayHeight * dpr) {
      canvas.width = displayWidth * dpr;
      canvas.height = displayHeight * dpr;
      needsResize = true;
    }
    updateScroll();
  }

  /**
   * Find closest available loaded frame if current target is still loading
   */
  function getClosestLoadedFrame(index) {
    if (frameImages[index]?.complete && frameImages[index]?.naturalWidth > 0) {
      return frameImages[index];
    }
    
    // Search outwards for nearest available frame
    for (let offset = 1; offset < FRAME_COUNT; offset++) {
      const prev = index - offset;
      if (prev >= 0 && frameImages[prev]?.complete && frameImages[prev]?.naturalWidth > 0) {
        return frameImages[prev];
      }
      const next = index + offset;
      if (next < FRAME_COUNT && frameImages[next]?.complete && frameImages[next]?.naturalWidth > 0) {
        return frameImages[next];
      }
    }
    return null;
  }

  /**
   * Draw a specific frame onto the canvas with cover object-fit calculation
   */
  function drawFrame(frameIndex) {
    if (!ctx || !canvas) return;
    const img = getClosestLoadedFrame(frameIndex);
    if (!img) return;

    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    const imgWidth = img.naturalWidth || 1920;
    const imgHeight = img.naturalHeight || 1080;

    const canvasRatio = canvasWidth / canvasHeight;
    const imgRatio = imgWidth / imgHeight;

    let drawWidth, drawHeight, offsetX, offsetY;

    // Cover math: scale image to completely fill canvas preserving aspect ratio
    if (canvasRatio > imgRatio) {
      drawWidth = canvasWidth;
      drawHeight = canvasWidth / imgRatio;
      offsetX = 0;
      offsetY = (canvasHeight - drawHeight) / 2;
    } else {
      drawHeight = canvasHeight;
      drawWidth = canvasHeight * imgRatio;
      offsetX = (canvasWidth - drawWidth) / 2;
      offsetY = 0;
    }

    ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
    lastDrawnFrameIndex = frameIndex;
  }

  /**
   * Dismiss the loading overlay with smooth fade
   */
  function dismissLoader() {
    if (isLoaderDismissed) return;
    isLoaderDismissed = true;
    if (loader) {
      loader.classList.add('hidden');
    }
  }

  /**
   * Update preloader UI progress
   */
  function updateProgress() {
    const percentage = Math.min(100, Math.floor((loadedCount / FRAME_COUNT) * 100));
    if (progressBar) progressBar.style.width = `${percentage}%`;
    if (progressText) progressText.textContent = `${percentage}%`;

    // Once 100% loaded or initial buffer ready, dismiss loader
    if (loadedCount >= FRAME_COUNT) {
      setTimeout(dismissLoader, 150);
    } else if (loadedCount >= MIN_READY_FRAMES && !isLoaderDismissed) {
      setTimeout(dismissLoader, 250);
    }
  }

  /**
   * Preload all frame images with high-throughput managed queue
   */
  function preloadFrames() {
    // 1. Immediately load frame 0 to paint canvas without delay
    const firstImg = new Image();
    firstImg.src = getFrameUrl(0);
    firstImg.onload = () => {
      frameImages[0] = firstImg;
      loadedCount++;
      updateProgress();
      handleResize();
      drawFrame(0);
      setTimeout(dismissLoader, 200);
    };
    firstImg.onerror = () => {
      setTimeout(dismissLoader, 400);
    };

    // 2. Load frames progressively in concurrent queue of 8 workers
    const CONCURRENCY = 8;
    let nextIndex = 1;

    function loadNext() {
      if (nextIndex >= FRAME_COUNT) return;
      const index = nextIndex++;
      const img = new Image();
      img.src = getFrameUrl(index);
      img.onload = () => {
        frameImages[index] = img;
        loadedCount++;
        updateProgress();
        loadNext();
      };
      img.onerror = () => {
        loadedCount++;
        updateProgress();
        loadNext();
      };
    }

    for (let c = 0; c < CONCURRENCY; c++) {
      loadNext();
    }

    // Immediate dismissal safety fallback
    setTimeout(dismissLoader, 800);
  }

  /**
   * Track scroll position and calculate target scroll progress (0.0 to 1.0)
   */
  function updateScroll() {
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    if (maxScroll > 0) {
      targetProgress = Math.min(Math.max(window.scrollY / maxScroll, 0), 1);
    } else {
      targetProgress = 0;
    }
  }

  /**
   * Main Animation Render Loop
   * Uses Linear Interpolation (LERP) for liquid smooth transition between frames
   */
  function renderLoop() {
    // LERP math: smoothly interpolate currentProgress towards targetProgress
    const delta = targetProgress - currentProgress;
    currentProgress += delta * LERP_FACTOR;

    // Clamp when close enough to stop unnecessary calculations
    if (Math.abs(delta) < 0.0001) {
      currentProgress = targetProgress;
    }

    // Map progress to exact frame index [0, FRAME_COUNT - 1]
    const targetFrameIndex = Math.min(
      Math.max(Math.round(currentProgress * (FRAME_COUNT - 1)), 0),
      FRAME_COUNT - 1
    );

    // Only redraw when the target frame has changed or on window resize
    if (targetFrameIndex !== lastDrawnFrameIndex || needsResize) {
      drawFrame(targetFrameIndex);
      needsResize = false;
    }

    requestAnimationFrame(renderLoop);
  }

  /**
   * Setup Smooth Scrolling for Anchor Links
   */
  function setupSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        const targetId = this.getAttribute('href').slice(1);
        if (!targetId) return;
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
          e.preventDefault();
          targetElement.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      });
    });
  }

  /**
   * Setup Sticky Navbar, Mobile Toggle, and ScrollSpy Active Highlighting
   */
  function setupNavbar() {
    const header = document.getElementById('site-header');
    const toggle = document.getElementById('nav-toggle');
    const menu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-menu .nav-link[href^="#"]');

    // 1. Mobile Menu Open / Close
    if (toggle && menu) {
      function toggleMenu(forceClose = false) {
        const isOpen = forceClose ? false : !menu.classList.contains('open');
        menu.classList.toggle('open', isOpen);
        toggle.classList.toggle('open', isOpen);
        toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      }

      toggle.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleMenu();
      });

      // Close menu when a navigation item is clicked
      navLinks.forEach(link => {
        link.addEventListener('click', () => {
          toggleMenu(true);
        });
      });

      // Close when clicking outside header
      document.addEventListener('click', (e) => {
        if (header && !header.contains(e.target) && menu.classList.contains('open')) {
          toggleMenu(true);
        }
      });

      // Close on Escape key
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && menu.classList.contains('open')) {
          toggleMenu(true);
        }
      });
    }

    // 2. ScrollSpy - Dynamic Active Section Highlighting
    const sectionIds = ['home', 'skills', 'process', 'projects', 'about', 'contact'];
    const sections = sectionIds
      .map(id => ({ id, el: document.getElementById(id) }))
      .filter(s => s.el !== null);

    function updateActiveNavLink() {
      const scrollY = window.scrollY;

      // Toggle sticky scrolled appearance
      if (header) {
        header.classList.toggle('scrolled', scrollY > 20);
      }

      // Determine currently active section
      const scrollPosition = scrollY + 120; // Offset for navbar height + buffer
      let currentActiveId = '';

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i];
        const rect = section.el.getBoundingClientRect();
        const top = rect.top + scrollY;
        if (scrollPosition >= top) {
          currentActiveId = section.id;
          break;
        }
      }

      if (!currentActiveId && sections.length > 0) {
        currentActiveId = 'home';
      }

      navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === `#${currentActiveId}`) {
          link.classList.add('active');
        } else {
          link.classList.remove('active');
        }
      });
    }

    window.addEventListener('scroll', updateActiveNavLink, { passive: true });
    updateActiveNavLink();
  }

  /**
   * Setup Project Details Interactive Modal
   */
  function setupProjectModal() {
    const modal = document.getElementById('project-modal');
    const modalBody = document.getElementById('project-modal-body');
    const closeBtn = document.getElementById('project-modal-close');

    if (!modal || !modalBody) return;

    const projectDetails = {
      examprep: {
        num: '01',
        title: 'ExamPrep',
        sub: 'AI-Powered Exam Preparation Platform',
        overview: 'An interactive exam preparation platform designed to help students practice and prepare for exams through quizzes and structured learning.',
        problem: 'Students often struggle to find focused, topic-specific practice material and quick self-assessment tools to identify weak areas before test days.',
        contribution: 'Developed core RESTful backend services using Java and Spring Boot, designed MySQL database tables for storing subjects, questions, and attempt records, and integrated question generation and scoring workflow.',
        technologies: ['Java', 'Spring Boot', 'REST APIs', 'MySQL', 'JavaScript', 'HTML5 & CSS3'],
        features: [
          'AI-generated quiz questions based on subjects and difficulty',
          'Topic-wise and subject-based structured practice sessions',
          'Quiz attempt logging with real-time score calculation',
          'Review summary showing correct answers and explanations',
          'Clean, student-focused interface for distraction-free learning'
        ],
        architecture: 'Layered MVC Architecture (Controller → Service → Repository → Database)',
        github: 'https://github.com/tech-area52'
      },
      fleet: {
        num: '02',
        title: 'Fleet Management System',
        sub: 'Centralized Fleet Operations & Logistics',
        overview: 'A web application designed to manage fleet-related operations and business information through a centralized system.',
        problem: 'Transportation and logistics workflows often face delays due to unorganized vehicle tracking, disconnected driver allocations, and missing maintenance records.',
        contribution: 'Engineered backend business logic with Spring Boot, structured relational tables in MySQL, implemented modular REST endpoints, and verified operations using Postman.',
        technologies: ['Java', 'Spring Boot', 'MySQL', 'REST APIs', 'Bootstrap', 'Git'],
        features: [
          'Centralized vehicle registration, status, and fleet inventory records',
          'Driver profile assignment and delivery route allocation',
          'Periodic maintenance scheduling and service history logging',
          'Relational database integration for accurate records retrieval',
          'Clean, layered MVC architecture for maintainable backend code'
        ],
        architecture: 'Layered MVC Architecture with MySQL Database Integration',
        github: 'https://github.com/tech-area52'
      },
      importexport: {
        num: '03',
        title: 'Import-Export Management System',
        sub: 'Trade, Inventory & Shipment Tracking',
        overview: 'A web application for managing import-export products, inventory and related business operations through a centralized system.',
        problem: 'International trade businesses deal with complex inventory tracking, multiple product categories, customs documentation, and transaction histories across shipments.',
        contribution: 'Designed relational schema in MySQL, configured Hibernate/JPA object-relational mapping, built CRUD REST endpoints for trade records, and created structured status workflows.',
        technologies: ['Java', 'Spring Boot', 'MySQL', 'Hibernate', 'REST APIs', 'HTML/CSS'],
        features: [
          'Product catalog and international shipment record logging',
          'Import and export transaction tracking with timestamps',
          'Warehouse inventory level tracking to prevent stockouts',
          'Order processing lifecycle and shipment status updates',
          'Reliable relational database management with Hibernate ORM'
        ],
        architecture: 'Layered Architecture with Hibernate ORM and MySQL Database',
        github: 'https://github.com/tech-area52'
      }
    };

    function openModal(projectId) {
      const data = projectDetails[projectId];
      if (!data) return;

      const techChipsHtml = data.technologies.map(t => `<span class="tech-chip">${t}</span>`).join('');
      const featuresHtml = data.features.map(f => `<li><span class="feat-dot">✦</span><span>${f}</span></li>`).join('');

      modalBody.innerHTML = `
        <div class="modal-header-section">
          <span class="modal-proj-num">PROJECT ${data.num}</span>
          <h3 id="project-modal-title" class="modal-proj-title">${data.title}</h3>
          <p class="modal-proj-sub">${data.sub}</p>
        </div>

        <div class="modal-body-section">
          <div>
            <h5 class="modal-block-title">Overview</h5>
            <p class="modal-block-text">${data.overview}</p>
          </div>

          <div>
            <h5 class="modal-block-title">Problem It Solves</h5>
            <p class="modal-block-text">${data.problem}</p>
          </div>

          <div>
            <h5 class="modal-block-title">My Contribution</h5>
            <p class="modal-block-text">${data.contribution}</p>
          </div>

          <div>
            <h5 class="modal-block-title">Technologies Used</h5>
            <div class="project-tags-cloud" style="margin-top: 0.35rem;">${techChipsHtml}</div>
          </div>

          <div>
            <h5 class="modal-block-title">Key Features</h5>
            <ul class="modal-feature-list" style="margin-top: 0.35rem;">${featuresHtml}</ul>
          </div>

          <div>
            <h5 class="modal-block-title">Architecture & Implementation</h5>
            <p class="modal-block-text"><code>${data.architecture}</code></p>
          </div>
        </div>

        <div class="modal-actions">
          <a href="${data.github}" target="_blank" rel="noopener noreferrer" class="project-action-btn btn-github">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.1-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2z"/></svg>
            <span>View on GitHub</span>
            <span class="btn-arrow">↗</span>
          </a>
        </div>
      `;

      modal.classList.add('open');
      modal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    }

    function closeModal() {
      modal.classList.remove('open');
      modal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }

    // Attach click listeners to "View Details" buttons
    document.querySelectorAll('.btn-details[data-modal]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const modalId = btn.getAttribute('data-modal');
        openModal(modalId);
      });
    });

    if (closeBtn) {
      closeBtn.addEventListener('click', closeModal);
    }

    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeModal();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('open')) {
        closeModal();
      }
    });
  }

  /**
   * Initialize
   */
  function init() {
    setupSmoothScroll();
    setupNavbar();
    setupProjectModal();
    handleResize();
    window.addEventListener('resize', handleResize, { passive: true });
    window.addEventListener('scroll', updateScroll, { passive: true });

    // Initial update in case page was refreshed while scrolled
    updateScroll();

    // Start preloader and animation loop
    preloadFrames();
    requestAnimationFrame(renderLoop);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

