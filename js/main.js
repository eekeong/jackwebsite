/* =============================================
   万能教 Jack 老师 - Main JavaScript
   Handles: Animations, Slider, Cart, Modals, FAQ
   ============================================= */

'use strict';

const myLocalStorage = window.safeLocalStorage || window.localStorage;

/* --------------------------------------------------
   CONFIG
   -------------------------------------------------- */
const CONFIG = {
  waLink: 'https://wa.link/jackteacher', // ← 替换为真实 wa.link
  email: 'jack@wannengteach.com',        // ← 替换为真实 email
  instagramUrl: 'https://instagram.com/jackteacher',
  facebookUrl: 'https://facebook.com/jackteacher',
};

/* --------------------------------------------------
   STATE
   -------------------------------------------------- */
let cart = [];
let selectedCoursePrice = 89;
let selectedCoursePlan = '1 个月';
let selectedCoursePlanId = '1m';
let testimonialIndex = 0;
const TESTIMONIAL_VISIBLE = getTestimonialVisible();
let TESTIMONIAL_TOTAL = 4;

/* --------------------------------------------------
   INIT on DOM Ready
   -------------------------------------------------- */
document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initMobileMenu();
  initScrollAnimations();
  initCountUp();
  initFaq();
  initTestimonialSlider();
  initCourseSlider();
  initScrollTop();
  initWaLinks();
  loadCart();
  updateCartBadges();
  initSchoolVideo();
  initAchCardSlider();
  initChallengeBubbles();
  initDynamicSchedule();
});

/* --------------------------------------------------
   NAVBAR: Scroll effect
   -------------------------------------------------- */
function initNavbar() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  // Only transparent at top on the homepage. Subpages should stay solid.
  const path = (window.location && window.location.pathname) || '';
  const isIndex = path.endsWith('index.html') || path.endsWith('/') || path === '';

  const onScroll = () => {
    if (!isIndex) {
      navbar.classList.add('scrolled');
      return;
    }
    if (window.scrollY > 20) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

/* --------------------------------------------------
   MOBILE MENU
   -------------------------------------------------- */
function initMobileMenu() {
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');
  if (!hamburger || !mobileMenu) return;

  hamburger.addEventListener('click', () => {
    const isOpen = hamburger.classList.toggle('active');
    mobileMenu.classList.toggle('open', isOpen);
    hamburger.setAttribute('aria-expanded', isOpen.toString());
    mobileMenu.setAttribute('aria-hidden', (!isOpen).toString());
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (!hamburger.contains(e.target) && !mobileMenu.contains(e.target)) {
      closeMobileMenu();
    }
  });
}

function closeMobileMenu() {
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');
  if (!hamburger || !mobileMenu) return;

  hamburger.classList.remove('active');
  mobileMenu.classList.remove('open');
  hamburger.setAttribute('aria-expanded', 'false');
  mobileMenu.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

/* --------------------------------------------------
   SCROLL ANIMATIONS (Intersection Observer)
   -------------------------------------------------- */
function initScrollAnimations() {
  const animatableSelectors = '.fade-up, .fade-in, .scale-in';
  const elements = document.querySelectorAll(animatableSelectors);

  if (!elements.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target); // Animate once
        }
      });
    },
    {
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px',
    }
  );

  elements.forEach((el) => observer.observe(el));
}

/* --------------------------------------------------
   COUNT-UP ANIMATION (hero stats)
   -------------------------------------------------- */
function initCountUp() {
  const countEls = document.querySelectorAll('[data-target]');
  if (!countEls.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );

  countEls.forEach((el) => observer.observe(el));
}

function animateCount(el) {
  const target = parseInt(el.getAttribute('data-target'), 10);
  const suffix = el.hasAttribute('data-suffix') ? el.getAttribute('data-suffix') : '+';
  const duration = 1600;
  const start = performance.now();

  const tick = (now) => {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
    const current = Math.floor(eased * target);

    el.textContent = current.toLocaleString() + (progress >= 1 ? suffix : '');

    if (progress < 1) {
      requestAnimationFrame(tick);
    }
  };

  requestAnimationFrame(tick);
}

/* --------------------------------------------------
   FAQ ACCORDION
   -------------------------------------------------- */
function initFaq() {
  // Auto-open first item
  const firstItem = document.querySelector('.faq-item');
  if (firstItem) {
    const firstBtn = firstItem.querySelector('.faq-question');
    if (firstBtn) toggleFaq(firstBtn);
  }
}

function toggleFaq(btn) {
  const item = btn.closest('.faq-item');
  if (!item) return;

  const isOpen = item.classList.contains('open');

  // Close all
  document.querySelectorAll('.faq-item.open').forEach((openItem) => {
    openItem.classList.remove('open');
    const openBtn = openItem.querySelector('.faq-question');
    if (openBtn) openBtn.setAttribute('aria-expanded', 'false');
  });

  // Open clicked if it was closed
  if (!isOpen) {
    item.classList.add('open');
    btn.setAttribute('aria-expanded', 'true');
  }
}

/* --------------------------------------------------
   TESTIMONIALS SLIDER
   -------------------------------------------------- */
function getTestimonialVisible() {
  return 1;
}

/* --------------------------------------------------
   TOUCH SWIPE GESTURE SUPPORT
   -------------------------------------------------- */
function addSwipeSupport(element, callback) {
  if (!element) return;
  
  let startX = 0;
  let startY = 0;
  let isSwiping = false;
  const threshold = 40; // swipe distance threshold in pixels
  
  element.addEventListener('touchstart', (e) => {
    if (e.touches.length !== 1) return;
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
    isSwiping = true;
  }, { passive: true });
  
  element.addEventListener('touchmove', (e) => {
    if (!isSwiping || e.touches.length !== 1) return;
    
    const diffX = e.touches[0].clientX - startX;
    const diffY = e.touches[0].clientY - startY;
    
    // If horizontal movement is greater than vertical, prevent page scroll
    if (Math.abs(diffX) > Math.abs(diffY)) {
      if (e.cancelable) {
        e.preventDefault();
      }
    } else {
      // If vertical movement is dominant, cancel the swipe detection
      isSwiping = false;
    }
  }, { passive: false }); // Must be passive: false to allow preventDefault
  
  element.addEventListener('touchend', (e) => {
    if (!isSwiping) return;
    
    const diffX = e.changedTouches[0].clientX - startX;
    const diffY = e.changedTouches[0].clientY - startY;
    
    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > threshold) {
      if (diffX > 0) {
        callback(-1); // Swipe right -> previous slide
      } else {
        callback(1);  // Swipe left -> next slide
      }
    }
    
    isSwiping = false;
  }, { passive: true });
  
  element.addEventListener('touchcancel', () => {
    isSwiping = false;
  }, { passive: true });
}

function renderTestimonials() {
  const track = document.getElementById('testimonialsTrack');
  if (!track) return;

  const testimonials = window.TestimonialDB ? window.TestimonialDB.getAll() : [];
  if (testimonials.length === 0) return;

  // Update total
  TESTIMONIAL_TOTAL = testimonials.length;

  let trackHTML = '';
  testimonials.forEach((testi, index) => {
    let stars = '';
    const ratingCount = testi.rating || 5;
    for (let s = 0; s < ratingCount; s++) {
      stars += '<span class="star-icon">★</span>';
    }

    // Determine clean video source
    let videoSrc = testi.video;
    // Add t=0.001 to mp4/mov if it's a relative path and doesn't already have it
    if (videoSrc && !videoSrc.startsWith('data:') && !videoSrc.includes('#t=')) {
      videoSrc += '#t=0.001';
    }

    trackHTML += `
      <div class="testimonial-card testimonial-video-card" role="listitem" aria-label="学生视频见证 ${index + 1}">
        <div class="testimonial-video-wrapper">
          <video class="testimonial-video" controls playsinline preload="metadata" poster="${testi.poster || ''}">
            <source src="${videoSrc}">
            您的浏览器不支持播放该视频。
          </video>
        </div>
        <div class="testimonial-card-content">
          <div class="testimonial-rating" aria-label="评分: ${ratingCount}星">
            ${stars}
          </div>
          <h3 class="testimonial-card-title">${testi.title}</h3>
          <p class="testimonial-card-desc">${testi.desc}</p>
        </div>
      </div>
    `;
  });

  track.innerHTML = trackHTML;
}

function initTestimonialSlider() {
  // Render dynamic testimonials from local DB
  renderTestimonials();

  // Initialize slider position and dots immediately
  updateSlider();

  // Recalculate on resize
  window.addEventListener('resize', debounce(() => {
    updateSlider();
  }, 200));

  // Add touch swipe support
  addSwipeSupport(
    document.getElementById('testimonialsTrack'),
    (dir) => {
      slideTestimonials(dir);
    }
  );
}

function slideTestimonials(dir) {
  const visible = getTestimonialVisible();
  const maxIndex = TESTIMONIAL_TOTAL - visible;
  
  let newIndex = testimonialIndex + dir;
  if (newIndex > maxIndex) {
    newIndex = 0; // Wrap back to the beginning
  } else if (newIndex < 0) {
    newIndex = maxIndex; // Wrap to the end
  }
  
  testimonialIndex = newIndex;
  updateSlider();
}

function goToSlide(idx) {
  const visible = getTestimonialVisible();
  const maxIndex = TESTIMONIAL_TOTAL - visible;
  testimonialIndex = Math.max(0, Math.min(idx * visible, maxIndex));
  updateSlider();
}

function updateSlider() {
  const track = document.getElementById('testimonialsTrack');
  if (!track) return;

  // Unified slider calculation for all screen widths

  const cards = track.querySelectorAll('.testimonial-card');
  if (!cards.length) return;

  // Auto-pause any video elements inside the track on slide change
  track.querySelectorAll('video').forEach(video => {
    video.pause();
  });

  const offsetPercent = testimonialIndex * 100;
  track.style.transform = `translateX(-${offsetPercent}%)`;

  // Update dots dynamically based on pages
  const dotsContainer = document.querySelector('.slider-dots');
  if (dotsContainer) {
    const visible = getTestimonialVisible();
    const pages = Math.ceil(TESTIMONIAL_TOTAL / visible);
    
    let dotsHTML = '';
    const activeDotIndex = Math.min(Math.floor(testimonialIndex / visible), pages - 1);
    
    for (let i = 0; i < pages; i++) {
      const active = i === activeDotIndex;
      dotsHTML += `<button class="slider-dot${active ? ' active' : ''}" role="tab" aria-selected="${active}" onclick="goToSlide(${i})" aria-label="第 ${i + 1} 个视频"></button>`;
    }
    dotsContainer.innerHTML = dotsHTML;
  }
}

/* --------------------------------------------------
   COURSES SLIDER (Silk Smooth CSS Snap with Fallback Swipe Guide)
   -------------------------------------------------- */
function initCourseSlider() {
  const wrap = document.querySelector('.courses-track-wrap');
  if (!wrap) return;

  // Listen to manual scrolling to hide mobile guide arrow
  const swipeArrow = document.getElementById('courseSwipeArrow');
  if (swipeArrow) {
    wrap.addEventListener('scroll', () => {
      if (wrap.scrollLeft > 20) {
        swipeArrow.classList.add('fade-out');
      }
    }, { passive: true });
  }
}

function slideCourses(dir) {
  const wrap = document.querySelector('.courses-track-wrap');
  if (!wrap) return;

  const cards = wrap.querySelectorAll('.course-card');
  if (!cards.length) return;

  const cardWidth = cards[0].offsetWidth;
  const gap = window.innerWidth < 600 ? 16 : 24;
  const scrollAmount = cardWidth + gap;

  wrap.scrollBy({
    left: dir * scrollAmount,
    behavior: 'smooth'
  });

  // Hide indicator on slide
  const swipeArrow = document.getElementById('courseSwipeArrow');
  if (swipeArrow) {
    swipeArrow.classList.add('fade-out');
  }
}

function goToCourseSlide(idx) {
  const wrap = document.querySelector('.courses-track-wrap');
  if (!wrap) return;

  const cards = wrap.querySelectorAll('.course-card');
  if (!cards.length) return;

  const cardWidth = cards[0].offsetWidth;
  const gap = window.innerWidth < 600 ? 16 : 24;
  const targetOffset = idx * (cardWidth + gap);

  wrap.scrollTo({
    left: targetOffset,
    behavior: 'smooth'
  });

  const swipeArrow = document.getElementById('courseSwipeArrow');
  if (swipeArrow) {
    swipeArrow.classList.add('fade-out');
  }
}

function updateCourseSlider() {
  // CSS scroll snap-type is dominant
}

/* --------------------------------------------------
   COURSE PLAN SELECTOR
   -------------------------------------------------- */
const planData = {
  '1m': { price: 89, label: '/ 1 个月' },
  '3m': { price: 229, label: '/ 3 个月' },
  '6m': { price: 399, label: '/ 6 个月' },
  '1x': { price: 159, label: '一次性' },
};

function selectPlan(planId, price) {
  selectedCoursePlanId = planId;
  selectedCoursePrice = price;
  selectedCoursePlan = planData[planId]?.label || '';

  // Update price display
  const priceEl = document.getElementById('selectedCoursePrice');
  const periodEl = document.getElementById('selectedCoursePeriod');
  if (priceEl) priceEl.textContent = `RM ${price}`;
  if (periodEl) periodEl.textContent = planData[planId]?.label || '';

  // Update detail link dynamically
  const detailBtn = document.getElementById('heroDetailCourseBtn');
  if (detailBtn) {
    detailBtn.href = `course-detail.html?id=sej-live-${planId}`;
  }

  // Update button styles
  document.querySelectorAll('.plan-btn').forEach((btn) => {
    btn.classList.remove('plan-btn-active');
    btn.setAttribute('aria-pressed', 'false');
  });
  const activeBtn = document.getElementById(`plan${planId}`);
  if (activeBtn) {
    activeBtn.classList.add('plan-btn-active');
    activeBtn.setAttribute('aria-pressed', 'true');
  }

  // Animate price
  if (priceEl) {
    priceEl.style.transform = 'scale(1.15)';
    priceEl.style.color = 'var(--pink)';
    setTimeout(() => {
      priceEl.style.transform = '';
    }, 300);
  }
}

/* --------------------------------------------------
   CART LOGIC (Integrated with central Cart engine in app.js)
   -------------------------------------------------- */
function getCentralProductId(id) {
  if (id === 'book') return 'wanneng-book';
  if (id === 'bundle') return 'wanneng-vip-bundle';
  if (id === 'course') return `sej-live-${selectedCoursePlanId || '1m'}`;
  return id;
}

function loadCart() {
  Cart.updateUI();
  updateStudentLoginButtons();
}

function saveCart() {
  // Central Cart class handles its own saving
}

function addToCart(id) {
  const centralId = getCentralProductId(id);
  const success = Cart.add(centralId);
  if (success) {
    animateCartIcon();
    renderCartItems();
  }
}

function buyNow(id) {
  const centralId = getCentralProductId(id);
  const cartItems = Cart.get();
  if (!cartItems.includes(centralId)) {
    cartItems.push(centralId);
    Cart.save(cartItems);
  }
  showToast('⚡', '正在为您直达安全结账页...');
  setTimeout(() => {
    window.location.href = 'checkout.html';
  }, 500);
}

function removeFromCart(id) {
  Cart.remove(id);
  renderCartItems();
}

function updateCartBadges() {
  Cart.updateUI();
}

function animateCartIcon() {
  const btn = document.getElementById('navCartBtn');
  if (!btn) return;
  btn.style.transform = 'scale(1.3)';
  btn.style.color = 'var(--pink)';
  setTimeout(() => {
    btn.style.transform = '';
    btn.style.color = '';
  }, 400);
}

function getCartTotal() {
  return Cart.getTotal();
}

/* --------------------------------------------------
   CART MODAL
   -------------------------------------------------- */
function openCart() {
  const modal = document.getElementById('cartModal');
  if (modal) {
    renderCartItems();
    openModal('cartModal');
  } else {
    window.location.href = 'cart.html';
  }
}

function renderCartItems() {
  const emptyEl = document.getElementById('cartEmpty');
  const itemsEl = document.getElementById('cartItems');
  const listEl = document.getElementById('cartItemList');
  const totalEl = document.getElementById('cartTotal');

  if (!emptyEl || !itemsEl || !listEl || !totalEl) return;

  const items = Cart.getDetails();

  if (items.length === 0) {
    emptyEl.style.display = 'block';
    itemsEl.style.display = 'none';
    return;
  }

  emptyEl.style.display = 'none';
  itemsEl.style.display = 'block';

  listEl.innerHTML = items
    .map(
      (item) => `
    <li style="display:flex; align-items:center; justify-content:space-between; gap:12px; padding:12px 0; border-bottom:1px solid var(--gray-200);">
      <div style="flex:1;">
        <div style="font-size:0.9rem; font-weight:700; color:var(--dark);">${escapeHtml(item.title)}</div>
        <div style="font-size:0.75rem; color:var(--gray-muted);">${escapeHtml(item.notes || item.form || '')}</div>
      </div>
      <div style="font-family:'Nunito',sans-serif; font-weight:800; color:var(--pink); font-size:1rem;">RM ${item.price.toFixed(2)}</div>
      <button
        onclick="removeFromCart('${item.id}')"
        style="width:28px;height:28px;border-radius:50%;border:none;background:var(--gray-100);cursor:pointer;display:flex;align-items:center;justify-content:center;color:var(--gray-muted);font-size:1rem; transition:background 0.2s;"
        onmouseover="this.style.background='var(--pink-bg)'; this.style.color='var(--pink)';"
        onmouseout="this.style.background='var(--gray-100)'; this.style.color='var(--gray-muted)';"
        aria-label="移除 ${escapeHtml(item.title)}"
      >×</button>
    </li>
  `
    )
    .join('');

  totalEl.textContent = `RM ${Cart.getTotal().toFixed(2)}`;
}

/* --------------------------------------------------
   CHECKOUT (Go to Local Premium Checkout Page)
   -------------------------------------------------- */
function proceedCheckout() {
  const items = Cart.getDetails();
  if (items.length === 0) return;

  closeModal('cartModal');
  showToast('💳', '正在前往收银结算台...');

  setTimeout(() => {
    window.location.href = 'checkout.html';
  }, 600);
}

/* --------------------------------------------------
   STUDENT LOGIN & DYNAMIC BUTTONS
   -------------------------------------------------- */
function updateStudentLoginButtons() {
  const currentStudent = myLocalStorage.getItem('jack_current_student');
  
  // Clean up any existing dropdown first to prevent duplicate registrations
  const oldDropdown = document.getElementById('studentProfileDropdown');
  if (oldDropdown) {
    if (typeof oldDropdown.remove === 'function') {
      oldDropdown.remove();
    } else if (oldDropdown.parentNode) {
      oldDropdown.parentNode.removeChild(oldDropdown);
    }
  }

  const navLoginBtn = document.getElementById('navLoginBtn');
  if (!navLoginBtn) return;

  if (currentStudent) {
    try {
      const student = JSON.parse(currentStudent);
      if (student && student.name) {
        // Update Desktop Login button with a custom template
        navLoginBtn.innerHTML = `<span style="display:inline-flex; align-items:center; gap:6px;">👤 ${student.name} <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="margin-left:2px; transition: transform 0.25s;"><polyline points="6 9 12 15 18 9"/></svg></span>`;
        navLoginBtn.setAttribute('aria-label', '查看个人账户');
        
        // Remove direct click redirection
        navLoginBtn.onclick = null;
        
        // Create the gorgeous profile dropdown
        const dropdown = document.createElement('div');
        dropdown.id = 'studentProfileDropdown';
        dropdown.className = 'student-profile-dropdown';
        dropdown.style.display = 'none';
        dropdown.innerHTML = `
          <div class="dropdown-header">
            <div class="student-avatar">🎓</div>
            <div class="student-info">
              <div class="student-name">${student.name}</div>
              <div class="student-email">${student.email || 'student@wannengjiao.com'}</div>
            </div>
          </div>
          <div class="dropdown-divider"></div>
          <a href="student.html" class="dropdown-item">📊 进入学生中心</a>
          <button id="btn-dropdown-logout" class="dropdown-item logout-btn">🚪 退出登录</button>
        `;
        
        // Find the actions wrapper inside the navbar
        const navActions = navLoginBtn.parentElement;
        if (navActions) {
          navActions.appendChild(dropdown);
        }

        // Toggle dropdown click listener
        const toggleDropdown = (event) => {
          event.stopPropagation();
          const isOpen = dropdown.style.display === 'flex';
          dropdown.style.display = isOpen ? 'none' : 'flex';
          const arrowSvg = navLoginBtn.querySelector('svg');
          if (arrowSvg) {
            arrowSvg.style.transform = isOpen ? 'rotate(0deg)' : 'rotate(180deg)';
          }
        };

        // Clear existing click listeners and add the toggle listener
        navLoginBtn.removeEventListener('click', toggleDropdown);
        navLoginBtn.addEventListener('click', toggleDropdown);

        // Bind dynamic logout button click inside dropdown
        const dropdownLogoutBtn = dropdown.querySelector('#btn-dropdown-logout');
        if (dropdownLogoutBtn) {
          dropdownLogoutBtn.addEventListener('click', (event) => {
            event.stopPropagation();
            myLocalStorage.removeItem('jack_current_student');
            dropdown.style.display = 'none';
            
            // Reload page or re-initialize to completely reset nav bar and badges
            window.location.reload();
          });
        }

        // Close dropdown when clicking outside
        const closeDropdownOnOutsideClick = (e) => {
          if (!navLoginBtn.contains(e.target) && !dropdown.contains(e.target)) {
            dropdown.style.display = 'none';
            const arrowSvg = navLoginBtn.querySelector('svg');
            if (arrowSvg) {
              arrowSvg.style.transform = 'rotate(0deg)';
            }
          }
        };
        document.removeEventListener('click', closeDropdownOnOutsideClick);
        document.addEventListener('click', closeDropdownOnOutsideClick);
        
        // Update Mobile Bottom nav login item
        const bottomLoginSpan = document.querySelector('#bottomLogin span');
        if (bottomLoginSpan) {
          bottomLoginSpan.textContent = student.name;
        }
      }
    } catch (e) {
      console.error("Failed to parse student session in updateStudentLoginButtons:", e);
    }
  } else {
    // Restore standard button if not logged in
    navLoginBtn.textContent = '学生登录';
    navLoginBtn.setAttribute('aria-label', '学生登录');
    navLoginBtn.onclick = () => { openLogin(); };
  }
}

function openLogin() {
  window.location.href = 'student.html';
}

/* --------------------------------------------------
   GENERIC MODAL
   -------------------------------------------------- */
function openModal(id) {
  const overlay = document.getElementById(id);
  if (!overlay) return;
  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal(id) {
  const overlay = document.getElementById(id);
  if (!overlay) return;
  overlay.classList.remove('open');
  document.body.style.overflow = '';
}

// Close modals on ESC
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    ['cartModal', 'loginModal'].forEach(closeModal);
    closeMobileMenu();
  }
});

/* --------------------------------------------------
   TOAST NOTIFICATION
   -------------------------------------------------- */
function showToast(icon, message, duration = 3000) {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `<span class="toast-icon" aria-hidden="true">${icon}</span><span>${escapeHtml(message)}</span>`;

  container.appendChild(toast);

  // Animate in
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      toast.classList.add('show');
    });
  });

  // Remove after duration
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 500);
  }, duration);
}

/* --------------------------------------------------
   SCROLL TO TOP
   -------------------------------------------------- */
function initScrollTop() {
  const btn = document.getElementById('scrollTopBtn');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    btn.classList.toggle('show', window.scrollY > 400);
  }, { passive: true });
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* --------------------------------------------------
   SCROLL TO COURSES
   -------------------------------------------------- */
function scrollToCourses() {
  const section = document.getElementById('courses');
  if (section) {
    const offset = 80;
    const top = section.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  }
}

/* --------------------------------------------------
   WA LINKS
   -------------------------------------------------- */
function initWaLinks() {
  const links = document.querySelectorAll('#footerWaLink, #loginWaLink');
  links.forEach((link) => {
    link.href = CONFIG.waLink;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
  });
}

/* --------------------------------------------------
   BOTTOM NAV ACTIVE STATE
   -------------------------------------------------- */
const sectionIds = [
  'home',
  'pain-points',
  'teacher',
  'testimonials',
  'school-tour',
  'notes-sample',
  'courses',
  'how',
  'faq'
];
const navMap = {
  home: 'bottomHome',
  'pain-points': 'bottomCourses',
  teacher: 'bottomCourses',
  testimonials: 'bottomCourses',
  'school-tour': 'bottomCourses',
  'notes-sample': 'bottomCourses',
  courses: 'bottomCourses',
  how: 'bottomCourses',
  faq: 'bottomCourses',
};

window.addEventListener('scroll', debounce(() => {
  let current = 'home';
  sectionIds.forEach((id) => {
    const el = document.getElementById(id);
    if (el && window.scrollY >= el.offsetTop - 120) {
      current = id;
    }
  });

  document.querySelectorAll('.bottom-nav-item').forEach((item) => {
    item.classList.remove('active');
  });

  const activeId = navMap[current];
  const activeEl = document.getElementById(activeId);
  if (activeEl) activeEl.classList.add('active');
}, 100), { passive: true });

/* --------------------------------------------------
   UTILITY: Debounce
   -------------------------------------------------- */
function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

/* --------------------------------------------------
   UTILITY: Escape HTML
   -------------------------------------------------- */
function escapeHtml(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/* --------------------------------------------------
   SCHOOL TOUR VIDEO AUTOPLAY & MUTE CONTROLS
   -------------------------------------------------- */
function initSchoolVideo() {
  const video = document.getElementById('schoolTourVideo');
  const muteBtn = document.getElementById('videoMuteBtn');
  const muteIcon = document.getElementById('muteIcon');
  const unmuteIcon = document.getElementById('unmuteIcon');
  const muteBtnText = document.getElementById('muteBtnText');

  if (!video || !muteBtn) return;

  // Make sure standard controls are disabled & loop/playsinline are active
  video.removeAttribute('controls');
  video.setAttribute('loop', '');
  video.setAttribute('playsinline', '');

  // Request: default is mute off (sound on)
  video.muted = false;

  const updateUI = () => {
    if (video.muted) {
      if (muteIcon) muteIcon.style.display = 'inline';
      if (unmuteIcon) unmuteIcon.style.display = 'none';
      if (muteBtnText) muteBtnText.textContent = '🔇 声音: 关闭';
    } else {
      if (muteIcon) muteIcon.style.display = 'none';
      if (unmuteIcon) unmuteIcon.style.display = 'inline';
      if (muteBtnText) muteBtnText.textContent = '🔊 声音: 开启';
    }
  };

  // Sync initial UI
  updateUI();

  const playVideoSafely = () => {
    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise.then(() => {
        updateUI();
      }).catch(error => {
        console.log("Unmuted autoplay prevented by browser policy. Falling back to muted autoplay...");
        video.muted = true;
        updateUI();
        video.play().catch(err => {
          console.error("Muted autoplay also failed:", err);
        });
      });
    }
  };

  // Setup Intersection Observer to play only when scrolled to
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          playVideoSafely();
        } else {
          video.pause();
        }
      });
    }, {
      threshold: 0.15
    });
    observer.observe(video);
  } else {
    // Fallback if IntersectionObserver is not supported
    playVideoSafely();
  }

  // Handle manual Mute Button Toggle
  muteBtn.addEventListener('click', () => {
    video.muted = !video.muted;
    updateUI();
    
    // Ensure the video plays if it was paused
    if (video.paused) {
      video.play().catch(err => console.error("Play failed on user toggle:", err));
    }
  });

  // progressive unmute on click inside the school tour video section only
  const schoolTourSection = document.getElementById('school-tour');
  const unmuteOnInteraction = () => {
    if (video.muted) {
      video.muted = false;
      updateUI();
    }
    if (schoolTourSection) {
      schoolTourSection.removeEventListener('click', unmuteOnInteraction);
      schoolTourSection.removeEventListener('touchstart', unmuteOnInteraction);
    }
  };

  if (schoolTourSection) {
    schoolTourSection.addEventListener('click', unmuteOnInteraction, { once: true });
    schoolTourSection.addEventListener('touchstart', unmuteOnInteraction, { once: true });
  }
}

/* --------------------------------------------------
   PRODUCT CARD: Hover shimmer effect
   -------------------------------------------------- */
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.course-card').forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      card.style.setProperty('--mouse-x', `${x}%`);
      card.style.setProperty('--mouse-y', `${y}%`);
    });
  });
});

/* --------------------------------------------------
   SMOOTH ENTRANCE for hero elements
   -------------------------------------------------- */
window.addEventListener('load', () => {
  document.body.classList.add('loaded');

  // Trigger hero animations (supports legacy .hero and modern .hero-v2 layouts)
  const heroElements = document.querySelectorAll('.hero .hero-badge-wrap, .hero .hero-title, .hero .hero-subtitle, .hero .hero-cta, .hero .hero-stats, .hero-v2 .hero-v2-title, .hero-v2 .hero-v2-subtitle, .hero-v2 .hero-v2-inner > *');
  heroElements.forEach((el) => {
    el.style.opacity = '1';
  });

  // Handle cross-page and page-load smooth scroll anchors with 80px offset
  if (window.location.hash) {
    const targetId = window.location.hash.substring(1);
    const targetElement = document.getElementById(targetId);
    if (targetElement) {
      setTimeout(() => {
        const offset = 80;
        const targetTop = targetElement.getBoundingClientRect().top + window.pageYOffset - offset;
        window.scrollTo({
          top: targetTop,
          behavior: 'smooth'
        });
      }, 400); // Small timeout to ensure DOM is fully ready and painted
    }
  }

  // Smooth scroll for internal link clicks
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (href === '#' || href === '') return;
      
      const targetElement = document.getElementById(href.substring(1));
      if (targetElement) {
        e.preventDefault();
        const offset = 80;
        const targetTop = targetElement.getBoundingClientRect().top + window.pageYOffset - offset;
        window.scrollTo({
          top: targetTop,
          behavior: 'smooth'
        });
        
        // If mobile dropdown menu is open, close it
        closeMobileMenu();
      }
    });
  });
});

/* --------------------------------------------------
   ACHIEVEMENT CARDS SLIDER
   -------------------------------------------------- */
function initAchCardSlider() {
  const wrap = document.querySelector('.achievement-cards-wrap');
  const track = document.getElementById('achCardsTrack');
  if (!wrap || !track) return;

  // 1. Dynamically render the cards from localStorage database
  let cardsData = [];
  try {
    cardsData = window.HeroCardDB ? window.HeroCardDB.getAll() : [];
  } catch (e) {
    console.error("HeroCardDB is not ready or failed:", e);
  }

  // Self-healing fallback if database returns empty or is not loaded
  if (!cardsData || cardsData.length === 0) {
    cardsData = [
      { id: "hero-1", title: "9分逆袭97分！🔥", desc: "就算9分，我们都不定义他是弱生！找到适合的方法，半年突变97分！", image: "images/见证/1.png" },
      { id: "hero-2", title: "历史全班第一！🏆", desc: "停学2年，本来只希望全科PASS，两个月蜕变8个A！我们让学生看见【我是可以的】！", image: "images/见证/23.png" },
      { id: "hero-3", title: "不及格到稳拿 A！✨", desc: "万能口诀与答题模板加持，抛弃死记硬背，Sejarah 拿 A 原来这么轻松！", image: "images/见证/30.png" },
      { id: "hero-4", title: "从 G 逆袭到 A-！📉", desc: "从不及格边缘到傲人成绩，每一次提分都是对努力最好的证明！", image: "images/见证/37.png" },
      { id: "hero-5", title: "双位数暴涨奇迹！📈", desc: "运用心理学记忆曲线，把历史章节变成追剧故事，提分势不可挡！", image: "images/见证/39.png" },
      { id: "hero-6", title: "考前冲刺稳夺 A！💪", desc: "最后两个月加入特训班，精准切中满分得分点，写短短也能拿满分！", image: "images/见证/48.png" },
      { id: "hero-7", title: "零基础完美跨越！🎓", desc: "不用担心基础差，Jack 老师带你从零梳理脉络，考试信心加倍！", image: "images/见证/50.png" },
      { id: "hero-8", title: "满分答题套路！🎯", desc: "掌握考官最爱的满分关键词模板，直击得分要害，拒绝枯燥死记！", image: "images/见证/54.png" },
      { id: "hero-9", title: "全班提分榜样！🌟", desc: "用最聪明的《合心法》复习笔记，带领全班掀起 Sejarah 冲 A 狂潮！", image: 'images/Card_Photo/60.png' },
      { id: "hero-10", title: "创造及格奇迹！💎", desc: "曾经最头疼的科目变成拿分王牌，用实力证明：我也绝对做得到！", image: "images/Card_Photo/2.png" }
    ];
  }

  if (cardsData && cardsData.length > 0) {
    track.innerHTML = "";
    cardsData.forEach((c, idx) => {
      const cardEl = document.createElement("div");
      // Use 'visible' directly instead of 'fade-up' to prevent 0-opacity loading block 
      // when IntersectionObserver initializes prior to dynamic card injection
      cardEl.className = `ach-card visible delay-${(idx % 3) + 1}`;
      cardEl.innerHTML = `
        <div class="ach-card-img-wrap">
          <img src="${c.image}" alt="${c.title}" loading="lazy" />
        </div>
        <div class="ach-card-body">
          <div class="ach-card-title">${c.title}</div>
          <p class="ach-card-desc">${c.desc}</p>
        </div>
      `;
      track.appendChild(cardEl);
    });
  }

  // 2. Only run seamless infinite scroll on desktop
  if (window.innerWidth > 767) {
    // Clone all cards and append them to the track to make it infinite
    const cards = Array.from(track.children);
    cards.forEach(card => {
      const clone = card.cloneNode(true);
      // Remove fade-up animations from clones so they don't delay visibility
      clone.classList.remove('fade-up', 'delay-1', 'delay-2', 'delay-3');
      track.appendChild(clone);
    });

    let isHovered = false;
    wrap.addEventListener('mouseenter', () => isHovered = true);
    wrap.addEventListener('mouseleave', () => isHovered = false);

    // Disable snap and smooth scroll via inline styles to ensure zero conflict with the script
    wrap.style.scrollSnapType = 'none';
    wrap.style.scrollBehavior = 'auto';

    let speed = 0.8; // Smooth, premium desktop scrolling speed (px/frame)

    function scrollStep() {
      if (window.innerWidth > 767) {
        if (!isHovered) {
          wrap.scrollLeft += speed;
          // Calculate the original track width on the fly so it's always perfectly accurate
          const originalWidth = track.scrollWidth / 2;
          if (wrap.scrollLeft >= originalWidth) {
            wrap.scrollLeft = 0;
          }
        }
        requestAnimationFrame(scrollStep);
      }
    }
    requestAnimationFrame(scrollStep);
  }
}

/* --------------------------------------------------
   CHALLENGE BUBBLES INTERACTIVE CLOUD (MOBILE ONLY)
   -------------------------------------------------- */
function initChallengeBubbles() {
  const bubblesWrap = document.querySelector('.challenge-bubbles-wrap');
  const focusCard = document.getElementById('challengeFocusCard');
  if (!bubblesWrap || !focusCard) return;

  const bubbles = bubblesWrap.querySelectorAll('.bubble-item');
  if (!bubbles.length) return;

  const emojiEl = focusCard.querySelector('.focus-emoji');
  const textEl = focusCard.querySelector('.focus-text');

  const updateFocusCard = (bubble) => {
    const emoji = bubble.querySelector('.bubble-emoji')?.textContent || '👉';
    const text = bubble.querySelector('.bubble-text')?.textContent || '';

    // Remove active from all
    bubbles.forEach(b => b.classList.remove('active'));
    // Add active to current
    bubble.classList.add('active');

    // Smooth transition
    focusCard.classList.add('updating');
    setTimeout(() => {
      if (emojiEl) emojiEl.textContent = emoji;
      if (textEl) textEl.textContent = text;
      focusCard.classList.remove('updating');
    }, 150);
  };

  // Click handler
  bubbles.forEach(bubble => {
    bubble.addEventListener('click', (e) => {
      // Only execute custom behavior on mobile viewports (< 768px)
      if (window.innerWidth < 768) {
        e.preventDefault();
        updateFocusCard(bubble);
      }
    });
  });

  // Auto-select first bubble on mobile init to make it interactive immediately
  const handleResizeInit = () => {
    if (window.innerWidth < 768) {
      const activeBubble = bubblesWrap.querySelector('.bubble-item.active');
      if (!activeBubble && bubbles[0]) {
        updateFocusCard(bubbles[0]);
      }
    } else {
      // Clear active classes if user resizes back to desktop
      bubbles.forEach(b => b.classList.remove('active'));
    }
  };

  window.addEventListener('resize', debounce(handleResizeInit, 200));
  // Call once immediately
  handleResizeInit();
}

/* --------------------------------------------------
   DYNAMIC SCHEDULE RENDERER
   -------------------------------------------------- */
function initDynamicSchedule() {
  const container = document.getElementById("dynamic-schedule-container");
  if (!container) return;
  
  const schedules = window.ScheduleDB ? window.ScheduleDB.getAll() : [];
  if (schedules.length === 0) {
    container.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 60px; color: var(--gray-muted); font-size: 1.1rem; font-weight: 700; background: var(--white); border-radius: var(--r-lg); border: 1px dashed var(--gray-200); box-shadow: var(--shadow-sm);">暂无排课计划！请联系客服获取最新开课通知。</div>`;
    return;
  }
  
  container.innerHTML = "";
  schedules.forEach(s => {
    const card = document.createElement("div");
    card.className = "schedule-card fade-up visible";
    card.style.cssText = "background: var(--white); border: 1px solid var(--gray-200); border-radius: var(--r-lg); box-shadow: var(--shadow-sm); padding: 30px; display: flex; flex-direction: column; justify-content: space-between; gap: 16px; transition: all 0.3s ease; position:relative; overflow:hidden;";
    
    // Status Badge classes
    let badgeStyle = "background: var(--pink-bg); color: var(--pink);";
    if (s.status === "Hot") badgeStyle = "background: #fee2e2; color: #ef4444;";
    else if (s.status === "Limited Seats") badgeStyle = "background: #ffedd5; color: #f97316;";
    else if (s.status === "New Class") badgeStyle = "background: #dbeafe; color: #3b82f6;";
    
    card.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; border-bottom: 1px solid var(--gray-200); padding-bottom: 15px; margin-bottom: 5px;">
        <span style="font-family: var(--font-title); font-size: 1.1rem; font-weight: 800; color: var(--purple); display: flex; align-items: center; gap: 6px;">📅 ${s.day}</span>
        <span style="${badgeStyle} font-size: 11px; font-weight: 800; padding: 4px 10px; border-radius: var(--r-full); text-transform: uppercase;">${s.status}</span>
      </div>
      
      <div style="display:flex; flex-direction:column; gap:12px; flex:1;">
        <div style="font-family: var(--font-title); font-size: 1.25rem; font-weight: 900; color: var(--dark); line-height: 1.35;">${s.courseTitle}</div>
        
        <div style="display:flex; align-items:center; gap:8px; font-size:0.92rem; color: var(--gray-light); font-weight: 700;">
          <span>⏰ 上课时间:</span>
          <span style="background:var(--pink-bg); color:var(--pink); padding:2px 8px; border-radius:var(--r-sm); font-weight:800;">${s.time}</span>
        </div>
        
        <div style="display:flex; align-items:center; gap:8px; font-size:0.88rem; color: var(--gray-light);">
          <span>👨‍🏫 任课讲师:</span>
          <strong style="color:var(--dark);">${s.teacher}</strong>
        </div>
        
        <div style="display:flex; align-items:center; gap:8px; font-size:0.88rem; color: var(--gray-light);">
          <span>💻 授课形式:</span>
          <strong>${s.format}</strong>
        </div>
        
        ${s.notes ? `
        <div style="background:var(--gray-50); border:1px dashed var(--gray-200); border-radius:var(--r-md); padding:10px 14px; font-size:0.85rem; color:var(--pink); font-weight:700; line-height:1.4;">
          🎁 课程包含福利：${s.notes}
        </div>` : ""}
      </div>
      
      <div style="margin-top:15px; border-top: 1px solid var(--gray-100); padding-top: 15px; display:flex; gap:10px;">
        <a href="shop.html" class="btn btn-primary" style="flex:1; text-align:center; padding:10px 12px; font-size:13px; font-weight:800; border:none; border-radius:var(--r-md); background:linear-gradient(135deg, var(--pink), var(--pink-light)); color:white; text-decoration:none; box-shadow:var(--shadow-pink); display:inline-flex; align-items:center; justify-content:center;">🛍️ 立即报名选课</a>
        <a href="https://wa.link/jackteacher" target="_blank" class="btn btn-outline" style="flex:1; text-align:center; padding:10px 12px; font-size:13px; font-weight:800; border:1px solid var(--gray-200); border-radius:var(--r-md); color:var(--dark); text-decoration:none; display:inline-flex; align-items:center; justify-content:center; background:var(--white);" onmouseover="this.style.background='var(--gray-50)'" onmouseout="this.style.background='var(--white)'">💬 客服/家长咨询</a>
      </div>
    `;
    
    // Add premium hover visual feedbacks
    card.addEventListener("mouseenter", () => {
      card.style.transform = "translateY(-6px)";
      card.style.boxShadow = "var(--shadow-pink-lg)";
      card.style.borderColor = "var(--pink-pale)";
    });
    card.addEventListener("mouseleave", () => {
      card.style.transform = "translateY(0)";
      card.style.boxShadow = "var(--shadow-sm)";
      card.style.borderColor = "var(--gray-200)";
    });
    
    container.appendChild(card);
  });
}
