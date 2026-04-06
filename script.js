/* ========================================
   درع النار - Fire Fighting Company
   Main JavaScript File
   ======================================== */

"use strict";

// ==================== DOM READY ====================
document.addEventListener('DOMContentLoaded', () => {
  initScrollProgress();
  initNavbar();
  initMobileMenu();
  initHeroSlider();
  initRevealAnimations();
  initCounters();
  initServicesSlider();
  initTestimonialsSlider();
  initSmoothScroll();
  initContactForm();
  initLazyLoading();
});

// ==================== SCROLL PROGRESS BAR ====================
function initScrollProgress() {
  const bar = document.createElement('div');
  bar.id = 'scroll-progress';
  document.body.prepend(bar);

  window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = scrollTop / docHeight;
    bar.style.transform = `scaleX(${progress})`;
  }, { passive: true });
}

// ==================== NAVBAR ====================
function initNavbar() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  let lastScrollY = 0;
  let ticking = false;

  window.addEventListener('scroll', () => {
    lastScrollY = window.scrollY;
    if (!ticking) {
      requestAnimationFrame(() => {
        if (lastScrollY > 60) {
          navbar.classList.add('scrolled');
        } else {
          navbar.classList.remove('scrolled');
        }
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });

  // Active nav links on scroll
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinks.forEach(link => {
          link.style.color = link.getAttribute('href') === `#${id}`
            ? 'rgb(239, 68, 68)'
            : '';
        });
      }
    });
  }, { threshold: 0.5 });

  sections.forEach(section => observer.observe(section));
}

// ==================== MOBILE MENU ====================
function initMobileMenu() {
  const toggle = document.getElementById('menu-toggle');
  const menu = document.getElementById('mobile-menu');
  if (!toggle || !menu) return;

  let isOpen = false;

  toggle.addEventListener('click', () => {
    isOpen = !isOpen;
    toggle.classList.toggle('active', isOpen);
    menu.classList.toggle('mobile-menu-closed', !isOpen);
    menu.classList.toggle('mobile-menu-open', isOpen);
  });

  // Close on link click
  menu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      isOpen = false;
      toggle.classList.remove('active');
      menu.classList.add('mobile-menu-closed');
      menu.classList.remove('mobile-menu-open');
    });
  });
}

// ==================== HERO SLIDER ====================
function initHeroSlider() {
  const slides = document.querySelectorAll('.hero-slide');
  const dots = document.querySelectorAll('.hero-dot');
  if (!slides.length) return;

  let current = 0;
  let interval;

  function goTo(index) {
    slides[current].classList.remove('active');
    dots[current]?.classList.remove('active', 'w-8', 'bg-red-500');
    dots[current]?.classList.add('w-2', 'bg-white/30');

    current = (index + slides.length) % slides.length;

    slides[current].classList.add('active');
    dots[current]?.classList.add('active', 'w-8', 'bg-red-500');
    dots[current]?.classList.remove('w-2', 'bg-white/30');
  }

  function next() {
    goTo(current + 1);
  }

  // Auto play
  interval = setInterval(next, 5000);

  // Dots click
  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => {
      clearInterval(interval);
      goTo(i);
      interval = setInterval(next, 5000);
    });
  });

  // Pause on hover
  const heroSection = document.getElementById('home');
  heroSection?.addEventListener('mouseenter', () => clearInterval(interval));
  heroSection?.addEventListener('mouseleave', () => {
    interval = setInterval(next, 5000);
  });
}

// ==================== REVEAL ANIMATIONS ====================
function initRevealAnimations() {
  const elements = document.querySelectorAll('.reveal');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        // Stagger delay for siblings
        const siblings = [...entry.target.parentElement.children]
          .filter(el => el.classList.contains('reveal'));
        const index = siblings.indexOf(entry.target);

        setTimeout(() => {
          entry.target.classList.add('visible');
        }, index * 100);

        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px'
  });

  elements.forEach(el => observer.observe(el));
}

// ==================== COUNTERS ANIMATION ====================
function initCounters() {
  const counters = document.querySelectorAll('.counter');
  if (!counters.length) return;

  const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.dataset.target, 10);
        const duration = 2000;
        const start = performance.now();

        function update(now) {
          const elapsed = now - start;
          const progress = Math.min(elapsed / duration, 1);
          const easedProgress = easeOutCubic(progress);
          el.textContent = Math.floor(easedProgress * target);

          if (progress < 1) {
            requestAnimationFrame(update);
          } else {
            el.textContent = target;
          }
        }

        requestAnimationFrame(update);
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(counter => observer.observe(counter));
}

// ==================== SERVICES SLIDER ====================
function initServicesSlider() {
  const track = document.getElementById('services-track');
  const prevBtn = document.getElementById('services-prev');
  const nextBtn = document.getElementById('services-next');
  if (!track) return;

  const cards = track.querySelectorAll('.service-card');
  const cardWidth = 384 + 24; // card w + gap
  let currentIndex = 0;
  let maxIndex;
  let isDragging = false;
  let startX = 0;
  let scrollLeft = 0;
  let autoInterval;

  function getVisibleCards() {
    const sliderWidth = track.parentElement.offsetWidth;
    return Math.floor(sliderWidth / cardWidth) || 1;
  }

  function updateMaxIndex() {
    const visible = getVisibleCards();
    maxIndex = Math.max(0, cards.length - visible);
  }

  function goTo(index) {
    updateMaxIndex();
    currentIndex = Math.max(0, Math.min(index, maxIndex));
    track.style.transform = `translateX(${currentIndex * cardWidth}px)`;
  }

  // Auto-play
  autoInterval = setInterval(() => {
    updateMaxIndex();
    if (currentIndex >= maxIndex) {
      goTo(0);
    } else {
      goTo(currentIndex + 1);
    }
  }, 3500);

  prevBtn?.addEventListener('click', () => {
    clearInterval(autoInterval);
    goTo(currentIndex - 1);
    autoInterval = setInterval(() => {
      updateMaxIndex();
      goTo(currentIndex >= maxIndex ? 0 : currentIndex + 1);
    }, 3500);
  });

  nextBtn?.addEventListener('click', () => {
    clearInterval(autoInterval);
    updateMaxIndex();
    goTo(currentIndex >= maxIndex ? 0 : currentIndex + 1);
    autoInterval = setInterval(() => {
      updateMaxIndex();
      goTo(currentIndex >= maxIndex ? 0 : currentIndex + 1);
    }, 3500);
  });

  // Touch/Drag support
  const slider = track.parentElement;

  slider.addEventListener('mousedown', (e) => {
    isDragging = true;
    startX = e.pageX;
    slider.style.cursor = 'grabbing';
  });

  window.addEventListener('mouseup', () => {
    isDragging = false;
    slider.style.cursor = 'grab';
  });

  window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    const diff = e.pageX - startX;
    if (Math.abs(diff) > 50) {
      isDragging = false;
      if (diff < 0) goTo(currentIndex + 1);
      else goTo(currentIndex - 1);
    }
  });

  // Touch events
  let touchStartX = 0;
  slider.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
  }, { passive: true });

  slider.addEventListener('touchend', (e) => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) goTo(currentIndex + 1);
      else goTo(currentIndex - 1);
    }
  });

  window.addEventListener('resize', () => {
    updateMaxIndex();
    if (currentIndex > maxIndex) goTo(maxIndex);
  });
}

// ==================== TESTIMONIALS SLIDER ====================
function initTestimonialsSlider() {
  const track = document.getElementById('testimonials-track');
  const prevBtn = document.getElementById('testimonials-prev');
  const nextBtn = document.getElementById('testimonials-next');
  if (!track) return;

  const cards = track.querySelectorAll('.testimonial-card');
  const cardWidth = 384 + 24;
  let currentIndex = 0;
  let maxIndex;
  let autoInterval;

  function updateMax() {
    const visible = Math.floor(track.parentElement.offsetWidth / cardWidth) || 1;
    maxIndex = Math.max(0, cards.length - visible);
  }

  function goTo(index) {
    updateMax();
    currentIndex = Math.max(0, Math.min(index, maxIndex));
    track.style.transform = `translateX(${currentIndex * cardWidth}px)`;
  }

  autoInterval = setInterval(() => {
    updateMax();
    goTo(currentIndex >= maxIndex ? 0 : currentIndex + 1);
  }, 4000);

  prevBtn?.addEventListener('click', () => {
    clearInterval(autoInterval);
    goTo(currentIndex - 1);
    autoInterval = setInterval(() => {
      updateMax();
      goTo(currentIndex >= maxIndex ? 0 : currentIndex + 1);
    }, 4000);
  });

  nextBtn?.addEventListener('click', () => {
    clearInterval(autoInterval);
    updateMax();
    goTo(currentIndex >= maxIndex ? 0 : currentIndex + 1);
    autoInterval = setInterval(() => {
      updateMax();
      goTo(currentIndex >= maxIndex ? 0 : currentIndex + 1);
    }, 4000);
  });

  // Touch events
  let touchStartX = 0;
  track.parentElement.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
  }, { passive: true });

  track.parentElement.addEventListener('touchend', (e) => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) goTo(currentIndex + 1);
      else goTo(currentIndex - 1);
    }
  });

  window.addEventListener('resize', () => {
    updateMax();
    if (currentIndex > maxIndex) goTo(maxIndex);
  });
}

// ==================== SMOOTH SCROLL ====================
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (targetId === '#') return;

      const target = document.querySelector(targetId);
      if (!target) return;

      e.preventDefault();
      const offset = 80;
      const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - offset;

      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });
    });
  });
}

// ==================== CONTACT FORM ====================
function initContactForm() {
  const submitBtn = document.getElementById('submit-form');
  const successMsg = document.getElementById('form-success');
  if (!submitBtn) return;

  submitBtn.addEventListener('click', () => {
    const inputs = document.querySelectorAll('#contact-form input, #contact-form textarea, #contact-form select');
    let isValid = true;

    inputs.forEach(input => {
      if (input.value.trim() === '') {
        input.style.borderColor = '#ef4444';
        isValid = false;
        setTimeout(() => {
          input.style.borderColor = '';
        }, 2000);
      }
    });

    if (isValid) {
      submitBtn.textContent = 'جاري الإرسال...';
      submitBtn.disabled = true;

      setTimeout(() => {
        submitBtn.classList.add('hidden');
        successMsg.classList.remove('hidden');
        inputs.forEach(input => input.value = '');

        setTimeout(() => {
          submitBtn.classList.remove('hidden');
          successMsg.classList.add('hidden');
          submitBtn.innerHTML = `
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/></svg>
            أرسل الطلب
          `;
          submitBtn.disabled = false;
        }, 4000);
      }, 1500);
    }
  });
}

// ==================== LAZY LOADING ====================
function initLazyLoading() {
  const images = document.querySelectorAll('img[loading="lazy"]');

  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.src; // Trigger native lazy load
          img.classList.add('loaded');
          imageObserver.unobserve(img);
        }
      });
    }, {
      rootMargin: '200px'
    });

    images.forEach(img => imageObserver.observe(img));
  }
}

// ==================== PARALLAX EFFECTS ====================
window.addEventListener('scroll', () => {
  const scrollY = window.scrollY;

  // Subtle parallax on hero particles
  document.querySelectorAll('.particle').forEach((particle, i) => {
    const speed = 0.1 + (i * 0.05);
    particle.style.transform = `translateY(${-scrollY * speed}px)`;
  });
}, { passive: true });

// ==================== PERFORMANCE: PRELOAD HERO IMAGES ====================
const heroImages = [
  'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1920&q=80',
  'https://images.unsplash.com/photo-1612540139150-4b5a198eecac?w=1920&q=80',
];

heroImages.forEach(url => {
  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = 'image';
  link.href = url;
  document.head.appendChild(link);
});

// ==================== CURSOR GLOW EFFECT (DESKTOP ONLY) ====================
if (window.matchMedia('(pointer: fine)').matches) {
  const cursor = document.createElement('div');
  cursor.style.cssText = `
    position: fixed;
    width: 20px;
    height: 20px;
    background: radial-gradient(circle, rgba(239,68,68,0.4), transparent);
    border-radius: 50%;
    pointer-events: none;
    z-index: 9998;
    transform: translate(-50%, -50%);
    transition: transform 0.1s ease, opacity 0.3s ease;
    mix-blend-mode: screen;
  `;
  document.body.appendChild(cursor);

  document.addEventListener('mousemove', (e) => {
    cursor.style.left = e.clientX + 'px';
    cursor.style.top = e.clientY + 'px';
  });

  document.addEventListener('mouseleave', () => { cursor.style.opacity = '0'; });
  document.addEventListener('mouseenter', () => { cursor.style.opacity = '1'; });

  document.querySelectorAll('a, button').forEach(el => {
    el.addEventListener('mouseenter', () => {
      cursor.style.transform = 'translate(-50%, -50%) scale(2.5)';
    });
    el.addEventListener('mouseleave', () => {
      cursor.style.transform = 'translate(-50%, -50%) scale(1)';
    });
  });
}
