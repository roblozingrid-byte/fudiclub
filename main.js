import posthog from 'posthog-js';

// Initialize PostHog
posthog.init(import.meta.env.VITE_POSTHOG_KEY || 'phc_t68UYpC6MhUBAvyNwyKZgZztEWs5WqUFzqBhV7ApvmkM', {
  api_host: import.meta.env.VITE_POSTHOG_HOST || 'https://us.i.posthog.com',
  person_profiles: 'identified_only',
  defaults: '2026-05-30',
});

let isScrollTrackingInitialized = false;

export function initScrollDepthTracking() {
  if (isScrollTrackingInitialized) return;
  isScrollTrackingInitialized = true;

  const milestones = [25, 50, 75, 90, 100];
  const reachedMilestones = new Set();
  let ticking = false;

  const checkScrollDepth = () => {
    const scrollPosition = window.scrollY || window.pageYOffset || document.documentElement.scrollTop;
    const windowHeight = window.innerHeight || document.documentElement.clientHeight;
    const docHeight = Math.max(
      document.body.scrollHeight,
      document.documentElement.scrollHeight,
      document.body.offsetHeight,
      document.documentElement.offsetHeight,
      document.body.clientHeight,
      document.documentElement.clientHeight
    );

    const totalScrollable = docHeight - windowHeight;
    if (totalScrollable <= 0) return;

    const currentPercentage = Math.min(100, Math.round(((scrollPosition + windowHeight) / docHeight) * 100));

    milestones.forEach((milestone) => {
      if (currentPercentage >= milestone && !reachedMilestones.has(milestone)) {
        reachedMilestones.add(milestone);
        posthog.capture('scroll_depth', {
          depth: milestone,
          scroll_percentage: currentPercentage,
          page_path: window.location.pathname,
          page_title: document.title,
        });
      }
    });
  };

  window.addEventListener(
    'scroll',
    () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          checkScrollDepth();
          ticking = false;
        });
        ticking = true;
      }
    },
    { passive: true }
  );

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', checkScrollDepth, { once: true });
  } else {
    checkScrollDepth();
  }
}

// Iniciar automáticamente el rastreo de scroll
initScrollDepthTracking();


export function initFAQ() {
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    question.addEventListener('click', () => {
      faqItems.forEach(otherItem => {
        if (otherItem !== item) otherItem.classList.remove('active');
      });
      item.classList.toggle('active');
    });
  });
}

export function initDynamicHeader() {
  const headerLogo = document.querySelector('.header-logo');
  const heroLogo = document.querySelector('.hero-logo-relief');

  if (!headerLogo || !heroLogo) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) {
        headerLogo.classList.add('grown');
      } else {
        headerLogo.classList.remove('grown');
      }
    });
  }, {
    threshold: 0
  });

  observer.observe(heroLogo);
}

export function initMysteryReveal() {
  const containers = document.querySelectorAll('.mystery-item-container');

  containers.forEach(container => {
    let ticking = false;
    let isMobileRevealed = false;

    const isTouchDevice = () => window.matchMedia("(hover: none) and (pointer: coarse)").matches || window.innerWidth <= 768;

    const handleMove = (clientX, clientY) => {
      const rect = container.getBoundingClientRect();
      const x = clientX - rect.left - (rect.width * 0.05);
      const y = clientY - rect.top - (rect.height * 0.05);
      const lensRadius = '45px'; 

      container.style.setProperty('--reveal-x', `${x}px`);
      container.style.setProperty('--reveal-y', `${y}px`);
      container.style.setProperty('--reveal-radius', lensRadius);
    };

    container.addEventListener('mousemove', (e) => {
      if (isTouchDevice()) return; // Ignorar si es tactil o movil
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handleMove(e.clientX, e.clientY);
          ticking = false;
        });
        ticking = true;
      }
    });

    container.addEventListener('mouseleave', () => {
      if (isTouchDevice()) return;
      container.style.setProperty('--reveal-radius', '0px');
    });
  });
}
