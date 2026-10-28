/* =========================================================
   Sawqly Marketing Agency — سوقلى
   Interactions: sticky header, mobile nav, scroll reveal,
   counters, accordion, gallery lightbox, contact hand-off.
   ========================================================= */
(function () {
  'use strict';

  var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Footer year ---------- */
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Sticky header ---------- */
  var header = document.getElementById('siteHeader');
  const toTop = document.getElementById('toTop');
  if (toTop) toTop.style.display = 'none';

  function onScroll() {
    var y = window.scrollY || window.pageYOffset;
    if (header) header.classList.toggle('is-stuck', y > 24);
    if (toTop) toTop.classList.toggle('is-visible', y > 620);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  if (toTop) {
    toTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: prefersReduced ? 'auto' : 'smooth' });
    });
  }

  /* ---------- Mobile navigation ---------- */
  var navToggle = document.getElementById('navToggle');
  var mainNav = document.getElementById('mainNav');

  function setNav(open) {
    if (!mainNav || !navToggle) return;
    mainNav.classList.toggle('is-open', open);
    document.body.classList.toggle('nav-open', open);
    navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    navToggle.setAttribute('aria-label', open ? 'إغلاق القائمة' : 'فتح القائمة');
  }

  if (navToggle && mainNav) {
    navToggle.addEventListener('click', function () {
      setNav(!mainNav.classList.contains('is-open'));
    });

    mainNav.addEventListener('click', function (e) {
      if (e.target.closest('a')) setNav(false);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && mainNav.classList.contains('is-open')) setNav(false);
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth > 980) setNav(false);
    });
  }

  /* ---------- Active nav link on scroll ---------- */
  var sections = Array.prototype.slice.call(
    document.querySelectorAll('main section[id]')
  );
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.nav-link'));

  if ('IntersectionObserver' in window && sections.length && navLinks.length) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var id = entry.target.id;
        navLinks.forEach(function (link) {
          link.classList.toggle('is-active', link.getAttribute('href') === '#' + id);
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });

    sections.forEach(function (s) { spy.observe(s); });
  }

  /* ---------- Scroll reveal ---------- */
  var revealEls = Array.prototype.slice.call(document.querySelectorAll('.reveal'));

  if (!('IntersectionObserver' in window) || prefersReduced) {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  } else {
    var revealObserver = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry, i) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        var delay = Math.min(i * 70, 280);
        window.setTimeout(function () { el.classList.add('is-visible'); }, delay);
        obs.unobserve(el);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

    revealEls.forEach(function (el) { revealObserver.observe(el); });

    // safety net: anything still hidden after load offset gets shown
    window.setTimeout(function () {
      revealEls.forEach(function (el) {
        var box = el.getBoundingClientRect();
        if (box.top < window.innerHeight && box.bottom > 0) el.classList.add('is-visible');
      });
    }, 900);
  }

  /* ---------- Number counters ---------- */
  var counters = Array.prototype.slice.call(document.querySelectorAll('.stat-num'));

  function runCounter(el) {
    var target = parseFloat(el.getAttribute('data-count')) || 0;
    var suffix = el.getAttribute('data-suffix') || '';
    var duration = 1400;
    var start = null;

    if (prefersReduced) {
      el.textContent = target + suffix;
      return;
    }

    function tick(now) {
      if (start === null) start = now;
      var progress = Math.min((now - start) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(target * eased) + suffix;
      if (progress < 1) window.requestAnimationFrame(tick);
    }
    window.requestAnimationFrame(tick);
  }

  if (counters.length) {
    if ('IntersectionObserver' in window) {
      var countObserver = new IntersectionObserver(function (entries, obs) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          runCounter(entry.target);
          obs.unobserve(entry.target);
        });
      }, { threshold: 0.5 });
      counters.forEach(function (c) { countObserver.observe(c); });
    } else {
      counters.forEach(runCounter);
    }
  }

  /* ---------- FAQ accordion ---------- */
  var accItems = Array.prototype.slice.call(document.querySelectorAll('.acc-item'));

  accItems.forEach(function (item) {
    var trigger = item.querySelector('.acc-trigger');
    if (!trigger) return;
    trigger.addEventListener('click', function () {
      var isOpen = item.classList.contains('is-open');

      accItems.forEach(function (other) {
        other.classList.remove('is-open');
        var t = other.querySelector('.acc-trigger');
        if (t) t.setAttribute('aria-expanded', 'false');
      });

      if (!isOpen) {
        item.classList.add('is-open');
        trigger.setAttribute('aria-expanded', 'true');
      }
    });
  });

  /* ---------- Gallery lightbox ---------- */
  var lightbox = document.getElementById('lightbox');
  var lightboxImg = document.getElementById('lightboxImg');
  var lightboxCaption = document.getElementById('lightboxCaption');
  var lightboxClose = document.getElementById('lightboxClose');
  var lastFocused = null;

  function openLightbox(src, caption, altText) {
    if (!lightbox || !lightboxImg) return;
    lastFocused = document.activeElement;
    lightboxImg.src = src;
    lightboxImg.alt = altText || caption || 'صورة من أعمال سوقلى';
    if (lightboxCaption) lightboxCaption.textContent = caption || '';
    lightbox.hidden = false;
    window.requestAnimationFrame(function () { lightbox.classList.add('is-open'); });
    document.body.style.overflow = 'hidden';
    if (lightboxClose) lightboxClose.focus();
  }

  function closeLightbox() {
    if (!lightbox || lightbox.hidden) return;
    lightbox.classList.remove('is-open');
    document.body.style.overflow = '';
    window.setTimeout(function () {
      lightbox.hidden = true;
      lightboxImg.removeAttribute('src');
    }, 240);
    if (lastFocused && typeof lastFocused.focus === 'function') lastFocused.focus();
  }

  document.querySelectorAll('.work-open').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var img = btn.querySelector('img');
      openLightbox(
        btn.getAttribute('data-full'),
        btn.getAttribute('data-caption'),
        img ? img.getAttribute('alt') : ''
      );
    });
  });

  if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
  if (lightbox) {
    lightbox.addEventListener('click', function (e) {
      if (e.target === lightbox) closeLightbox();
    });
  }
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeLightbox();
  });

  /* ---------- Contact form → Messenger hand-off ---------- */
  var PAGE_ID = '61595443958005';
  var form = document.getElementById('contactForm');
  var status = document.getElementById('formStatus');

  function setStatus(text, kind) {
    if (!status) return;
    status.textContent = text;
    status.classList.remove('is-error', 'is-ok');
    if (kind) status.classList.add(kind);
  }

  function markError(field, hasError) {
    var wrap = field.closest('.field');
    if (wrap) wrap.classList.toggle('has-error', hasError);
  }

  if (form) {
    form.addEventListener('input', function (e) {
      if (e.target.matches('input, textarea')) markError(e.target, false);
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var nameEl = document.getElementById('cName');
      var msgEl = document.getElementById('cMessage');
      var phoneEl = document.getElementById('cPhone');
      var businessEl = document.getElementById('cBusiness');
      var serviceEl = document.getElementById('cService');

      var name = nameEl.value.trim();
      var message = msgEl.value.trim();

      if (name.length < 2) {
        markError(nameEl, true);
        nameEl.focus();
        setStatus('اكتب اسمك الأول عشان نعرف نناديك.', 'is-error');
        return;
      }
      if (message.length < 5) {
        markError(msgEl, true);
        msgEl.focus();
        setStatus('اكتب لنا سطرين عن نشاطك والمطلوب.', 'is-error');
        return;
      }

      var lines = [
        'مرحباً سوقلى 👋',
        'الاسم: ' + name
      ];
      if (phoneEl && phoneEl.value.trim()) lines.push('واتساب: ' + phoneEl.value.trim());
      if (businessEl && businessEl.value.trim()) lines.push('نشاطي: ' + businessEl.value.trim());
      if (serviceEl && serviceEl.value) lines.push('الخدمة المطلوبة: ' + serviceEl.value);
      lines.push('التفاصيل: ' + message);

      var body = lines.join('\n');

      // Best effort: copy the composed message so it can be pasted in Messenger.
      var copied = false;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(body).then(function () {
          setStatus('تم تجهيز رسالتك ونسخها ✅ الصقها في محادثة ماسنجر وأرسلها.', 'is-ok');
        }).catch(function () {
          setStatus('تم تجهيز رسالتك ✅ اكتبها لنا في محادثة ماسنجر.', 'is-ok');
        });
        copied = true;
      }

      if (!copied) {
        setStatus('تم تجهيز رسالتك ✅ اكتبها لنا في محادثة ماسنجر.', 'is-ok');
      }

      // Open the Facebook page inbox (Messenger) in a new tab.
      window.open('https://m.me/' + PAGE_ID, '_blank', 'noopener');

      form.reset();
    });
  }
})();
