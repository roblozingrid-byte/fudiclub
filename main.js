import posthog from 'posthog-js';

// Initialize PostHog
posthog.init(import.meta.env.VITE_POSTHOG_KEY || 'phc_placeholder_key', {
  api_host: import.meta.env.VITE_POSTHOG_HOST || 'https://app.posthog.com',
  person_profiles: 'identified_only',
});

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

    const handleMove = (clientX, clientY) => {
      const rect = container.getBoundingClientRect();
      const x = clientX - rect.left - (rect.width * 0.05);
      const y = clientY - rect.top - (rect.height * 0.05);
      const isMobile = window.innerWidth <= 768;
      const lensRadius = isMobile ? '30px' : '45px';

      container.style.setProperty('--reveal-x', `${x}px`);
      container.style.setProperty('--reveal-y', `${y}px`);
      container.style.setProperty('--reveal-radius', lensRadius);
    };

    container.addEventListener('mousemove', (e) => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handleMove(e.clientX, e.clientY);
          ticking = false;
        });
        ticking = true;
      }
    });

    container.addEventListener('touchmove', (e) => {
      if (e.touches.length > 0) {
        if (!ticking) {
          window.requestAnimationFrame(() => {
            handleMove(e.touches[0].clientX, e.touches[0].clientY);
            ticking = false;
          });
          ticking = true;
        }
      }
    }, { passive: true });

    container.addEventListener('touchstart', (e) => {
      if (e.touches.length > 0) {
        if (!ticking) {
          window.requestAnimationFrame(() => {
            handleMove(e.touches[0].clientX, e.touches[0].clientY);
            ticking = false;
          });
          ticking = true;
        }
      }
    }, { passive: true });

    container.addEventListener('mouseleave', () => {
      container.style.setProperty('--reveal-radius', '0px');
    });

    container.addEventListener('touchend', () => {
      container.style.setProperty('--reveal-radius', '0px');
    });
  });
}
