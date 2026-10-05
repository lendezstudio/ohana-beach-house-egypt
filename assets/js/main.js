/* Ohana Beach House: interactions. No dependencies. */
(() => {
  'use strict';

  const CONFIG = window.OHANA_CONFIG || {};
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => Array.from(root.querySelectorAll(s));
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  document.documentElement.classList.add('js');

  // Review aid: ?qa=900 renders full-page screenshots with viewport-height sections pinned to 900px
  const qa = parseInt(new URLSearchParams(location.search).get('qa'), 10);
  if (qa) {
    const s = document.createElement('style');
    s.textContent = `.hero{min-height:${qa}px!important}.nights{--nights-h:clamp(640px,${qa}px,980px)}
      .js .reveal{opacity:1!important;transform:none!important}.js .reveal--img img{transform:none!important}`;
    document.head.appendChild(s);
  }

  $$('[data-year]').forEach((el) => { el.textContent = new Date().getFullYear(); });

  /* ---------- Header state ---------- */
  const header = $('[data-header]');
  const hero = $('.hero');
  const onScroll = () => {
    const past = window.scrollY > Math.min(120, (hero?.offsetHeight || 600) * 0.15);
    header.classList.toggle('is-scrolled', past);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile menu ---------- */
  const toggle = $('[data-menu-toggle]');
  const menu = $('[data-mobile-menu]');
  const setMenu = (open) => {
    toggle.setAttribute('aria-expanded', String(open));
    toggle.querySelector('.menu-toggle__label').textContent = open ? 'Close' : 'Menu';
    header.classList.toggle('menu-open', open);
    document.body.classList.toggle('is-locked', open);
    if (open) {
      menu.hidden = false;
      requestAnimationFrame(() => menu.classList.add('is-open'));
      menu.querySelector('a')?.focus({ preventScroll: true });
    } else {
      menu.classList.remove('is-open');
      setTimeout(() => { if (!menu.classList.contains('is-open')) menu.hidden = true; }, 600);
    }
  };
  toggle.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'));
  menu.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') { setMenu(false); toggle.focus(); }
  });
  window.matchMedia('(min-width: 1024px)').addEventListener('change', (e) => { if (e.matches) setMenu(false); });

  /* ---------- Hero crossfade ---------- */
  const slides = $$('.hero__slide');
  const dots = $$('[data-hero-dots] li');
  const SLIDE_MS = 7000;
  document.documentElement.style.setProperty('--slide-ms', SLIDE_MS + 'ms');
  if (slides.length > 1 && !reduceMotion) {
    let current = 0;
    let timer;
    const go = (i) => {
      slides[current].classList.remove('is-active'); dots[current]?.classList.remove('is-active');
      current = (i + slides.length) % slides.length;
      slides[current].classList.add('is-active');
      const dot = dots[current];
      if (dot) { dot.classList.remove('is-active'); void dot.offsetWidth; dot.classList.add('is-active'); }
    };
    const start = () => { clearInterval(timer); timer = setInterval(() => go(current + 1), SLIDE_MS); };
    // ?slide=2 opens on a given slide (handy for reviewing crops)
    const requested = parseInt(new URLSearchParams(location.search).get('slide'), 10);
    if (requested > 1 && requested <= slides.length) go(requested - 1);
    // pause while the hero is off screen or the tab is hidden
    new IntersectionObserver(([entry]) => (entry.isIntersecting ? start() : clearInterval(timer))).observe(hero);
    document.addEventListener('visibilitychange', () => (document.hidden ? clearInterval(timer) : start()));
  }

  /* ---------- Reveal on scroll ---------- */
  const reveals = $$('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    // stagger siblings that enter together
    const io = new IntersectionObserver((entries) => {
      let n = 0;
      entries.filter((e) => e.isIntersecting).forEach((e) => {
        e.target.style.setProperty('--d', Math.min(n++ * 0.08, 0.32) + 's');
        e.target.classList.add('is-visible');
        io.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add('is-visible'));
  }

  /* ---------- Active nav link ---------- */
  const navLinks = $$('.nav__list a');
  const sectionFor = new Map(navLinks.map((a) => [$(a.getAttribute('href')), a]));
  const navIO = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      const link = sectionFor.get(e.target);
      if (link && e.isIntersecting) { navLinks.forEach((l) => l.classList.remove('is-current')); link.classList.add('is-current'); }
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  sectionFor.forEach((_, section) => section && navIO.observe(section));

  /* ---------- Contact details from config ---------- */
  const contact = CONFIG.contact || {};
  if (contact.whatsapp) {
    $$('[data-whatsapp]').forEach((a) => { a.href = contact.whatsapp; a.hidden = false; });
  }
  const loc = CONFIG.location || {};
  if (loc.mapUrl) {
    $$('[data-directions]').forEach((a) => { a.href = loc.mapUrl; a.hidden = false; });
    const note = $('.visit__pin-note');
    if (note) note.textContent = 'Tap “Get Directions” to open the map.';
  }
  if (loc.mapEmbedUrl) {
    const map = $('[data-map]');
    map.classList.add('has-embed');
    map.innerHTML = `<iframe src="${encodeURI(loc.mapEmbedUrl)}" title="Map showing Ohana Beach House in New Alamein City" loading="lazy" referrerpolicy="no-referrer-when-downgrade" allowfullscreen></iframe>`;
  }

  /* ---------- Mobile sticky bar ---------- */
  const bar = $('[data-mobile-bar]');
  const contactSection = $('#contact');
  if (bar) {
    let pastHero = false, atContact = false;
    const sync = () => bar.classList.toggle('is-visible', pastHero && !atContact);
    new IntersectionObserver(([e]) => { pastHero = !e.isIntersecting; sync(); }, { threshold: 0.35 }).observe(hero);
    new IntersectionObserver(([e]) => { atContact = e.isIntersecting; sync(); }, { threshold: 0.15 }).observe(contactSection);
  }

  /* ---------- Inquiry type preselect from CTAs ---------- */
  const form = $('[data-inquiry-form]');
  $$('[data-inquiry]').forEach((a) => a.addEventListener('click', () => {
    const select = form?.elements.inquiryType;
    if (select) select.value = a.dataset.inquiry;
  }));

  /* ---------- Events ---------- */
  const escapeHtml = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const safeUrl = (u) => (/^(https?:|mailto:|tel:|#|assets\/)/i.test(u || '') ? u : '');
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const upcoming = (CONFIG.events || [])
    .filter((ev) => ev && ev.title && ev.date && new Date(ev.date + 'T23:59:59') >= today)
    .sort((a, b) => a.date.localeCompare(b.date));

  if (upcoming.length) {
    const list = $('[data-events-list]');
    list.innerHTML = upcoming.map((ev) => {
      const d = new Date(ev.date + 'T12:00:00');
      const day = d.toLocaleDateString('en-GB', { day: '2-digit' });
      const mon = d.toLocaleDateString('en-GB', { month: 'short' });
      const full = d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
      const meta = [full, ev.startTime && `From ${ev.startTime}`].filter(Boolean).join(' · ');
      const img = safeUrl(ev.image) || 'assets/img/night-stage-960.webp';
      const ticket = safeUrl(ev.ticketUrl), details = safeUrl(ev.detailsUrl);
      return `
        <article class="event-card reveal is-visible">
          <figure class="event-card__media">
            <img src="${escapeHtml(img)}" alt="${escapeHtml(ev.imageAlt || ev.title)}" loading="lazy">
            <p class="event-card__date"><strong>${day}</strong><span>${mon}</span></p>
          </figure>
          <div class="event-card__body">
            <p class="event-card__meta">${escapeHtml(meta)}</p>
            <h3>${escapeHtml(ev.title)}</h3>
            ${ev.description ? `<p>${escapeHtml(ev.description)}</p>` : ''}
            ${ev.lineup?.length ? `<p class="event-card__lineup"><strong>Lineup:</strong> ${ev.lineup.map(escapeHtml).join(' · ')}</p>` : ''}
            ${ev.organizer ? `<p>Presented by ${escapeHtml(ev.organizer)}</p>` : ''}
            ${ev.entryNote ? `<p>${escapeHtml(ev.entryNote)}</p>` : ''}
            <div class="event-card__actions">
              ${ticket ? `<a class="btn btn--solid" href="${escapeHtml(ticket)}" target="_blank" rel="noopener">Get Tickets</a>` : `<a class="btn btn--solid" href="#contact" data-inquiry="Event">Reserve</a>`}
              ${details ? `<a class="btn btn--ghost-light" href="${escapeHtml(details)}" target="_blank" rel="noopener">View Event</a>` : ''}
            </div>
          </div>
        </article>`;
    }).join('');
    list.hidden = false;
    $('[data-events-empty]').hidden = true;
    $$('[data-inquiry]', list).forEach((a) => a.addEventListener('click', () => { if (form) form.elements.inquiryType.value = 'Event'; }));

    // Structured data for confirmed public events
    const ld = document.createElement('script');
    ld.type = 'application/ld+json';
    ld.textContent = JSON.stringify(upcoming.map((ev) => ({
      '@context': 'https://schema.org', '@type': 'Event', name: ev.title,
      startDate: ev.startTime ? `${ev.date}T${ev.startTime}` : ev.date,
      eventStatus: 'https://schema.org/EventScheduled', eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
      description: ev.description || undefined, image: ev.image ? new URL(ev.image, location.href).href : undefined,
      location: { '@type': 'Place', name: 'Ohana Beach House', address: { '@type': 'PostalAddress', addressLocality: 'New Alamein City', addressCountry: 'EG' } },
      organizer: ev.organizer ? { '@type': 'Organization', name: ev.organizer } : undefined,
      offers: ev.ticketUrl ? { '@type': 'Offer', url: ev.ticketUrl } : undefined,
    })));
    document.head.appendChild(ld);
  }

  /* ---------- Gallery lightbox ---------- */
  const lb = $('[data-lightbox]');
  const items = $$('[data-gallery] button');
  if (lb && items.length && typeof lb.showModal === 'function') {
    const img = $('[data-lb-img]', lb), cap = $('[data-lb-caption]', lb);
    let index = 0, opener = null;
    const show = (i) => {
      index = (i + items.length) % items.length;
      const b = items[index], thumb = b.querySelector('img');
      img.src = b.dataset.full; img.alt = thumb.alt;
      cap.textContent = `${b.dataset.caption || ''}  ·  ${index + 1} / ${items.length}`;
    };
    items.forEach((b, i) => b.addEventListener('click', () => { opener = b; show(i); lb.showModal(); document.body.classList.add('is-locked'); }));
    lb.addEventListener('close', () => { document.body.classList.remove('is-locked'); opener?.focus(); });
    $('[data-lb-close]', lb).addEventListener('click', () => lb.close());
    $('[data-lb-prev]', lb).addEventListener('click', () => show(index - 1));
    $('[data-lb-next]', lb).addEventListener('click', () => show(index + 1));
    lb.addEventListener('click', (e) => { if (e.target === lb || e.target.classList.contains('lightbox__figure')) lb.close(); });
    lb.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') show(index - 1);
      if (e.key === 'ArrowRight') show(index + 1);
    });
    let x0 = null;
    lb.addEventListener('touchstart', (e) => { x0 = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener('touchend', (e) => {
      if (x0 === null) return;
      const dx = e.changedTouches[0].clientX - x0;
      if (Math.abs(dx) > 50) show(index + (dx < 0 ? 1 : -1));
      x0 = null;
    });
  }

  /* ---------- Inquiry form ---------- */
  if (form) {
    const status = $('[data-form-status]');
    const submit = form.querySelector('button[type="submit"]');
    const phone = `<a href="${contact.phoneHref || 'tel:+201022411190'}">${contact.phoneDisplay || '+20 102 241 1190'}</a>`;
    const setStatus = (type, html) => { status.className = 'inquiry__status is-' + type; status.innerHTML = html; };

    // Dates in the past make no sense for a visit
    const dateInput = form.elements.date;
    if (dateInput) dateInput.min = new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10);

    const validate = () => {
      let ok = true;
      ['name', 'phone', 'inquiryType'].forEach((n) => {
        const el = form.elements[n];
        const valid = n === 'phone' ? /[0-9]{6,}/.test(el.value.replace(/[\s()+-]/g, '')) : el.value.trim() !== '';
        el.closest('.field').classList.toggle('is-invalid', !valid);
        el.setAttribute('aria-invalid', String(!valid));
        if (!valid && ok) { el.focus(); ok = false; }
      });
      return ok;
    };
    form.addEventListener('input', (e) => {
      const f = e.target.closest('.field');
      if (f?.classList.contains('is-invalid')) { f.classList.remove('is-invalid'); e.target.removeAttribute('aria-invalid'); }
    });

    const deliver = async (data) => {
      const cfg = CONFIG.form || {};
      if (cfg.provider === 'formspree' || cfg.provider === 'webhook') {
        const res = await fetch(cfg.endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(data) });
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return true;
      }
      if (cfg.provider === 'emailjs') {
        const { serviceId, templateId, publicKey } = cfg.emailjs || {};
        const res = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ service_id: serviceId, template_id: templateId, user_id: publicKey, template_params: data }),
        });
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return true;
      }
      return false; // not connected
    };

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (form.elements.company_website.value) return; // bot
      if (!validate()) { setStatus('error', 'Please add your name, a phone number and the inquiry type.'); return; }
      const data = Object.fromEntries(new FormData(form).entries());
      delete data.company_website;
      data.source = 'Ohana website';
      submit.disabled = true;
      try {
        const sent = await deliver(data);
        if (sent) {
          setStatus('success', 'Thank you, your inquiry has been sent. The Ohana team will get back to you.');
          form.reset();
        } else {
          setStatus('info', `Online inquiries aren’t connected yet, so this message has <strong>not</strong> been sent. Please call Ohana on ${phone} or message the team on <a href="${contact.facebook}" target="_blank" rel="noopener">Facebook</a>.`);
        }
      } catch (err) {
        setStatus('error', `Sorry, the inquiry couldn’t be sent. Please try again or call ${phone}.`);
      } finally {
        submit.disabled = false;
      }
    });
  }
})();
