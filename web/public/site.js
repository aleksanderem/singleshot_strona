  // ================== APPLY TWEAKS ==================
  const html = document.documentElement;
  function applyTweaks(t) {
    html.setAttribute('data-accent', t.accent);
    html.setAttribute('data-font', t.fontPair);
    html.setAttribute('data-theme', t.theme);
    html.setAttribute('data-scroll', t.scrollIntensity);

    // mark active buttons
    document.querySelectorAll('.tweaks-options').forEach(box => {
      const key = box.dataset.key;
      box.querySelectorAll('.tweak-opt').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.value === String(t[key]));
      });
    });
    const range = document.getElementById('scrollIntensity');
    if (range) { range.value = t.scrollIntensity; document.getElementById('scrollIntensityVal').textContent = t.scrollIntensity; }
  }
  applyTweaks(TWEAKS);

  // Tweak buttons
  document.querySelectorAll('.tweaks-options').forEach(box => {
    box.addEventListener('click', e => {
      const btn = e.target.closest('.tweak-opt');
      if (!btn) return;
      const key = box.dataset.key;
      const val = btn.dataset.value;
      TWEAKS[key] = val;
      applyTweaks(TWEAKS);
      try { window.parent.postMessage({type: '__edit_mode_set_keys', edits: {[key]: val}}, '*'); } catch(e) {}
    });
  });
  const range = document.getElementById('scrollIntensity');
  if (range) {
    range.addEventListener('input', e => {
      const v = parseInt(e.target.value);
      TWEAKS.scrollIntensity = v;
      const valEl = document.getElementById('scrollIntensityVal');
      if (valEl) valEl.textContent = v;
      html.setAttribute('data-scroll', v);
      try { window.parent.postMessage({type: '__edit_mode_set_keys', edits: {scrollIntensity: v}}, '*'); } catch(e) {}
    });
  }

  // Edit-mode protocol — tweaks panel is dev-only, guard if absent
  window.addEventListener('message', (ev) => {
    const d = ev.data;
    if (!d || !d.type) return;
    const panel = document.getElementById('tweaksPanel');
    if (!panel) return;
    if (d.type === '__activate_edit_mode') panel.classList.add('show');
    if (d.type === '__deactivate_edit_mode') panel.classList.remove('show');
  });
  const tweaksCloseEl = document.getElementById('tweaksClose');
  if (tweaksCloseEl) {
    tweaksCloseEl.addEventListener('click', () => {
      document.getElementById('tweaksPanel')?.classList.remove('show');
    });
  }
  // announce availability after listener is live
  try { window.parent.postMessage({type: '__edit_mode_available'}, '*'); } catch(e) {}

  // ================== SCROLL: hero video scrubbing ==================
  const hero = document.getElementById('hero');
  const heroVideo = document.getElementById('heroVideo');
  const hudFrame = document.getElementById('hudFrame');
  const hudProg = document.getElementById('hudProg');
  const scrollBar = document.getElementById('scrollBar');

  let heroDuration = 0;
  let targetTime = 0;
  let currentTime = 0;
  let videoReady = false;

  // Smoothed progress (goni raw scroll progress za pomocą lerp \u2014 daje apple-style silky feel)
  let rawProgress = 0;
  let smoothProgress = 0;

  // Hero text reveal — scroll-driven, staggered
  // Tekst jest widoczny od początku, subtelnie się układa i znika dopiero na samym końcu
  // Title lines: outline → fill (scroll-driven)
  const heroLine1 = document.querySelector('.hero-title .line1');
  const heroLine2 = document.querySelector('.hero-title .line2');

  // Title lines — visible as outline from start, slide up + fill on scroll
  const heroTitleReveals = [
    { el: heroLine1, slideStart: 0.00, slideEnd: 0.08, fillAt: 0.08, yFrom: 24 },
    { el: heroLine2, slideStart: 0.02, slideEnd: 0.10, fillAt: 0.12, yFrom: 24 },
  ];
  // Other elements — classic fade-in after title fills
  const heroReveals = [
    { el: document.querySelector('.hero-eyebrow.reveal'),  start: 0.12, end: 0.18, yFrom: 14 },
    { el: document.querySelector('.hero-sub.reveal'),      start: 0.16, end: 0.24, yFrom: 22 },
  ];

  function updateHeroReveals(progress) {
    const outStart = 0.88, outEnd = 0.99;
    const outK = progress < outStart ? 0 : Math.min(1, (progress - outStart) / (outEnd - outStart));

    // Title lines: always visible (outline), slide up, then fill
    heroTitleReveals.forEach(r => {
      if (!r.el) return;
      // slide progress
      let k = 0;
      if (progress >= r.slideEnd) k = 1;
      else if (progress > r.slideStart) k = (progress - r.slideStart) / (r.slideEnd - r.slideStart);
      const e = 1 - Math.pow(1 - k, 3);
      const y = (1 - e) * r.yFrom + outK * -20;
      const opacity = 1 - outK;
      r.el.style.opacity = opacity.toFixed(3);
      r.el.style.transform = `translateY(${y.toFixed(2)}px)`;
      // fill
      r.el.classList.toggle('filled', progress >= r.fillAt && progress < outStart);
    });

    // Other text — classic reveal
    heroReveals.forEach(r => {
      if (!r.el) return;
      let k = 0;
      if (progress >= r.end) k = 1;
      else if (progress > r.start) k = (progress - r.start) / (r.end - r.start);
      else k = 0;
      const e = 1 - Math.pow(1 - k, 3);
      const opacity = e * (1 - outK);
      const y = (1 - e) * r.yFrom + outK * -20;
      const clipBottom = (1 - e) * 100;
      r.el.style.opacity = opacity.toFixed(3);
      r.el.style.transform = `translateY(${y.toFixed(2)}px)`;
      r.el.style.clipPath = `inset(0 0 ${clipBottom.toFixed(2)}% 0)`;
    });
  }

  // Prime the video: play briefly then pause to force buffering + allow seeking
  // Prime the video: ensure metadata loaded, then seek directly
  function primeVideo() {
    heroDuration = heroVideo.duration || 1;
    videoReady = true;
    try { heroVideo.pause(); heroVideo.currentTime = 0; } catch(e) {}
    updateHeroScrub();
  }

  if (heroVideo.readyState >= 2) {
    primeVideo();
  } else {
    heroVideo.addEventListener('loadeddata', primeVideo, { once: true });
    heroVideo.addEventListener('loadedmetadata', () => {
      if (!videoReady) primeVideo();
    }, { once: true });
    // fallback
    setTimeout(() => { if (!videoReady && heroVideo.duration) primeVideo(); }, 1500);
  }

  // scroll-driven video scrubbing \u2014 flywheel model (momentum + inertia)
  let lastScrollY = window.scrollY;
  let lastTs = performance.now();
  let velocity = 0; // progress units per second, derived from scroll delta
  let momentum = 0; // decays over time after scroll stops

  function updateHeroScrub() {
    const rect = hero.getBoundingClientRect();
    const total = hero.offsetHeight - window.innerHeight;
    const scrolled = Math.max(0, Math.min(total, -rect.top));
    rawProgress = total > 0 ? scrolled / total : 0;

    const now = performance.now();
    const dt = Math.max(0.008, (now - lastTs) / 1000);
    const dy = window.scrollY - lastScrollY;
    // velocity in progress/sec (normalized by hero scroll length)
    const v = total > 0 ? (dy / total) / dt : 0;
    // feed into momentum \u2014 rozp\u0119dza ko\u0142o
    momentum += v * 0.35;
    velocity = v;
    lastScrollY = window.scrollY;
    lastTs = now;

    const docProg = (window.scrollY) / (document.body.scrollHeight - window.innerHeight);
    if (scrollBar) scrollBar.style.width = (docProg * 100) + '%';
  }

  // Flywheel loop \u2014 progress goni raw + utrzymuje inercj\u0119
  function scrubLoop() {
    const intensity = parseInt(html.getAttribute('data-scroll') || '8') / 10;

    // catch-up to raw (soft spring) + momentum carry
    const catchup = 0.07 + intensity * 0.08;
    const overshoot = momentum * (0.006 + intensity * 0.008);
    smoothProgress += (rawProgress - smoothProgress) * catchup + overshoot;

    // friction decays momentum
    const friction = 0.80 + intensity * 0.10;
    momentum *= friction;

    // clamp (no overshoot past bounds — preserves hero edges)
    if (smoothProgress < 0) { smoothProgress = 0; momentum = 0; }
    if (smoothProgress > 1) { smoothProgress = 1; momentum = 0; }

    const p = smoothProgress;

    hero.setAttribute('data-crosshair', p > 0.25 && p < 0.85 ? 'on' : 'off');
    updateHeroReveals(p);

    if (hudFrame) hudFrame.textContent = (Math.round(p * 240)).toString().padStart(3,'0') + '/240';
    if (hudProg) hudProg.textContent = (p * 100).toFixed(2) + '%';

    if (videoReady && heroDuration > 0) {
      targetTime = p * (heroDuration - 0.05);
      if (targetTime < 0) targetTime = 0;
      if (targetTime > heroDuration) targetTime = heroDuration;

      const videoEase = 0.14 + intensity * 0.22;
      currentTime += (targetTime - currentTime) * videoEase;
      const diff = Math.abs(currentTime - heroVideo.currentTime);
      if (diff > 0.02) {
        try {
          heroVideo.pause();
          heroVideo.currentTime = currentTime;
        } catch(e) {}
      }
    }
    requestAnimationFrame(scrubLoop);
  }
  requestAnimationFrame(scrubLoop);

  window.addEventListener('scroll', updateHeroScrub, { passive: true });
  window.addEventListener('resize', updateHeroScrub);
  updateHeroScrub();
  smoothProgress = rawProgress;

  // ================== LAZY PLAY: section videos when visible (except scrub videos) ==================
  const sectionVideos = document.querySelectorAll('section video:not(#heroVideo):not(.scrub-video)');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      const v = e.target;
      if (e.isIntersecting) {
        v.play().catch(()=>{});
      } else {
        v.pause();
      }
    });
  }, { threshold: 0.15 });
  sectionVideos.forEach(v => io.observe(v));

  // ================== GENERIC SCRUB VIDEOS ==================
  // Any <video class="scrub-video"> inside a container is scrubbed based on scroll progress
  // of its nearest positioned ancestor that is a section (or the training div).
  const scrubVideos = Array.from(document.querySelectorAll('.scrub-video'));
  const scrubStates = scrubVideos.map(v => {
    // the container that defines scroll range is the nearest ancestor with class
    // "training" or a section element (height > 100vh drives the scrub)
    let container = v.closest('.training') || v.closest('section');
    return {
      video: v,
      container,
      duration: 0,
      ready: false,
      current: 0,
      target: 0,
      raw: 0,
    };
  });
  scrubStates.forEach(st => {
    const v = st.video;
    const setup = () => {
      st.duration = v.duration || 1;
      st.ready = true;
      // iOS Safari: a muted+playsinline video must be played at least once
      // before currentTime can be set programmatically. Kick it then pause
      // immediately so the very first scroll starts scrubbing cleanly.
      try {
        const p = v.play();
        if (p && typeof p.then === 'function') {
          p.then(() => { try { v.pause(); v.currentTime = 0; } catch(e) {} })
           .catch(() => { try { v.pause(); v.currentTime = 0; } catch(e) {} });
        } else {
          v.pause(); v.currentTime = 0;
        }
      } catch(e) {}
    };
    if (v.readyState >= 2) setup();
    else {
      v.addEventListener('loadeddata', setup, { once: true });
      v.addEventListener('loadedmetadata', () => { if (!st.ready) setup(); }, { once: true });
      // mobile networks: force load if metadata didn't arrive
      try { v.load(); } catch(e) {}
      setTimeout(() => { if (!st.ready && v.duration) setup(); }, 1500);
      setTimeout(() => { if (!st.ready && v.duration) setup(); }, 3500);
    }
  });

  // iOS gesture-gated wake-up: if the play() above was rejected (no user
  // gesture yet), this one-shot handler runs on first touch/scroll and
  // unlocks scrubbing for any still-locked scrub videos.
  const wakeUpScrubs = () => {
    scrubStates.forEach(st => {
      const v = st.video;
      try {
        const p = v.play();
        if (p && typeof p.then === 'function') {
          p.then(() => { try { v.pause(); } catch(e) {} }).catch(() => {});
        } else {
          v.pause();
        }
      } catch(e) {}
    });
  };
  window.addEventListener('touchstart', wakeUpScrubs, { once: true, passive: true });
  window.addEventListener('scroll', wakeUpScrubs, { once: true, passive: true });

  function updateScrubVideos() {
    scrubStates.forEach(st => {
      if (!st.container) return;
      let progress;
      const isMobile = window.innerWidth <= 860;
      const vh = window.innerHeight;
      if (isMobile) {
        // Mobile: video is no longer sticky, it scrolls with the page.
        // Track the video's box as it travels through the viewport: 0 when
        // it just entered from below, 1 when it has just left at the top.
        // That gives ~(vh + box.height) of effective scroll runway for a
        // full scrub, while the box physically moves with the user's scroll.
        const box = st.video.parentElement || st.container;
        const r = box.getBoundingClientRect();
        const denom = vh + r.height;
        progress = denom > 0 ? (vh - r.top) / denom : 0;
      } else {
        const rect = st.container.getBoundingClientRect();
        const total = st.container.offsetHeight - vh;
        if (total <= 0) {
          progress = 1 - Math.max(0, Math.min(1, (rect.top + rect.height * 0.2) / vh));
        } else {
          const scrolled = Math.max(0, Math.min(total, -rect.top));
          progress = scrolled / total;
        }
      }
      st.raw = Math.max(0, Math.min(1, progress));
    });
  }

  function scrubVideosLoop() {
    const intensity = parseInt(html.getAttribute('data-scroll') || '8') / 10;
    const ease = 0.14 + intensity * 0.22;
    scrubStates.forEach(st => {
      if (!st.ready || st.duration <= 0) return;
      st.target = Math.max(0, Math.min(st.duration - 0.05, st.raw * (st.duration - 0.05)));
      st.current += (st.target - st.current) * ease;
      const v = st.video;
      const diff = Math.abs(st.current - v.currentTime);
      // only seek when in/near viewport
      const rect = st.container.getBoundingClientRect();
      const vh = window.innerHeight;
      const inView = rect.bottom > -vh * 0.2 && rect.top < vh * 1.2;
      if (inView && diff > 0.02) {
        try { v.pause(); v.currentTime = st.current; } catch(e) {}
      }
    });
    requestAnimationFrame(scrubVideosLoop);
  }
  requestAnimationFrame(scrubVideosLoop);
  window.addEventListener('scroll', updateScrubVideos, { passive: true });
  window.addEventListener('resize', updateScrubVideos);
  updateScrubVideos();

  // ================== HUD clock ==================
  function tick() {
    const d = new Date();
    const pad = n => n.toString().padStart(2,'0');
    document.getElementById('hudTime').textContent =
      pad(d.getUTCHours()) + ':' + pad(d.getUTCMinutes()) + ':' + pad(d.getUTCSeconds());
  }
  setInterval(tick, 1000); tick();

  // ================== Reveal on scroll ==================
  const revealIO = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.style.opacity = '1';
        e.target.style.transform = 'none';
      }
    });
  }, { threshold: 0.1 });
  document.querySelectorAll('.training-copy, .about-text, .principle, .green-text, .forwhom-chips').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(24px)';
    el.style.transition = 'opacity .9s ease, transform .9s ease';
    revealIO.observe(el);
  });

  // ================== Smooth anchor scroll ==================
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href').slice(1);
      if (!id) return;
      const el = document.getElementById(id);
      if (el) { e.preventDefault(); el.scrollIntoView({behavior:'smooth', block:'start'}); }
    });
  });

  // ================== Contact Modal ==================
  const contactModal = document.getElementById('contactModal');
  const contactForm = document.getElementById('contactForm');
  const cfTraining = document.getElementById('cf-training');

  function openModal(trigger) {
    const training = trigger?.dataset?.training || '';
    if (training && cfTraining) {
      cfTraining.value = training;
    }
    contactModal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeModal() {
    contactModal.classList.remove('open');
    document.body.style.overflow = '';
  }
  // close on overlay click
  contactModal.addEventListener('click', (e) => {
    if (e.target === contactModal) closeModal();
  });
  // close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && contactModal.classList.contains('open')) closeModal();
  });

  // Where to POST contact-form submissions. Set on <body data-cms-url="..."> in
  // index.astro from PAYLOAD_URL at build time, falls back to admin subdomain.
  const cmsUrl = (document.body && document.body.dataset.cmsUrl) || 'https://admin.singleshot.pl';

  async function submitForm(e) {
    e.preventDefault();
    const submitBtn = contactForm.querySelector('button[type="submit"]');
    const originalLabel = submitBtn ? submitBtn.textContent : '';
    if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Wysyłanie…'; }

    const payload = {
      name:     document.getElementById('cf-name').value.trim(),
      email:    document.getElementById('cf-email').value.trim(),
      phone:    document.getElementById('cf-phone').value.trim() || null,
      training: cfTraining.value || null,
      message:  document.getElementById('cf-message').value.trim() || null,
      sourceUrl: window.location.href,
      userAgent: navigator.userAgent.slice(0, 200),
    };

    try {
      const res = await fetch(cmsUrl + '/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const txt = await res.text().catch(() => '');
        throw new Error('HTTP ' + res.status + ' ' + txt.slice(0, 120));
      }
      if (submitBtn) submitBtn.textContent = 'Wysłane ✓';
      contactForm.reset();
      setTimeout(() => {
        closeModal();
        if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = originalLabel; }
      }, 1400);
    } catch (err) {
      console.error('contact form submit failed', err);
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Spróbuj ponownie';
      }
      alert('Nie udało się wysłać. Spróbuj ponownie albo napisz na ' +
            (document.body.dataset.fallbackEmail || 'kontakt@singleshot.pl'));
    }
  }

  // also wire up the main CTA button
  const mainCta = document.querySelector('.cta-btn');
  if (mainCta) {
    mainCta.addEventListener('click', (e) => {
      e.preventDefault();
      openModal(null);
    });
  }
