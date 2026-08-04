/* =========================================================================
   WESPACED.ORG — SCRIPT
   -------------------------------------------------------------------------
   Organized into small independent modules. Each one is commented so you
   can find and tweak a specific effect (e.g. search "COMET CURSOR" to
   change trail length or color).
========================================================================= */

if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}

document.addEventListener('DOMContentLoaded', () => {

  /* ===================== YEAR IN FOOTER ===================== */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ===================== PRELOADER ===================== */
  const preloader = document.getElementById('preloader');
  const hidePreloader = () => preloader && preloader.classList.add('hidden');
  // Hide once everything is loaded, but never make people wait more than 2.2s
  window.addEventListener('load', () => setTimeout(hidePreloader, 500));
  setTimeout(hidePreloader, 2200);

  /* ===================== STARFIELD (pulsing stars) ===================== */
  const starCanvas = document.getElementById('starfield');
  const starCtx = starCanvas.getContext('2d');
  let stars = [];
  const STAR_COLORS = ['#FFFFFF', '#8B78C8', '#4DD9C0'];

  function resizeStarCanvas(){
    starCanvas.width = window.innerWidth;
    starCanvas.height = document.documentElement.scrollHeight;
  }

  function buildStars(){
    const count = Math.floor((starCanvas.width * starCanvas.height) / 9000);
    stars = Array.from({ length: count }, () => ({
      x: Math.random() * starCanvas.width,
      y: Math.random() * starCanvas.height,
      r: Math.random() * 1.3 + 0.3,
      color: STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)],
      phase: Math.random() * Math.PI * 2,
      speed: Math.random() * 0.015 + 0.006
    }));
  }

  let starTime = 0;
  function drawStars(){
    starTime += 1;
    starCtx.clearRect(0, 0, starCanvas.width, starCanvas.height);
    for (const s of stars){
      const twinkle = (Math.sin(starTime * s.speed + s.phase) + 1) / 2; // 0..1
      const alpha = 0.25 + twinkle * 0.75;
      starCtx.beginPath();
      starCtx.arc(s.x, s.y, s.r + twinkle * 0.6, 0, Math.PI * 2);
      starCtx.fillStyle = s.color;
      starCtx.globalAlpha = alpha;
      starCtx.fill();
    }
    starCtx.globalAlpha = 1;
    requestAnimationFrame(drawStars);
  }

  function initStarfield(){
    resizeStarCanvas();
    buildStars();
  }
  initStarfield();
  requestAnimationFrame(drawStars);

  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(initStarfield, 250);
  });
  // Rebuild once content settles (images loaded can change page height)
  window.addEventListener('load', () => setTimeout(initStarfield, 300));

  /* ===================== COMET CURSOR ===================== */
  const cometCanvas = document.getElementById('comet-cursor');
  const isTouch = window.matchMedia('(hover: none), (pointer: coarse)').matches;

  if (!isTouch && cometCanvas) {
    const cometCtx = cometCanvas.getContext('2d');
    let particles = [];
    let mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    let lastMouse = { ...mouse };

    function resizeCometCanvas(){
      cometCanvas.width = window.innerWidth;
      cometCanvas.height = window.innerHeight;
    }
    resizeCometCanvas();
    window.addEventListener('resize', resizeCometCanvas);

    window.addEventListener('mousemove', (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      const dist = Math.hypot(mouse.x - lastMouse.x, mouse.y - lastMouse.y);
      const steps = Math.min(Math.max(Math.floor(dist / 4), 1), 6);
      for (let i = 0; i < steps; i++){
        const t = i / steps;
        particles.push({
          x: lastMouse.x + (mouse.x - lastMouse.x) * t,
          y: lastMouse.y + (mouse.y - lastMouse.y) * t,
          life: 1,
          r: Math.random() * 2 + 1.8
        });
      }
      lastMouse = { x: mouse.x, y: mouse.y };
      if (particles.length > 140) particles = particles.slice(particles.length - 140);
    });

    function drawComet(){
      cometCtx.clearRect(0, 0, cometCanvas.width, cometCanvas.height);

      // trail
      for (let i = 0; i < particles.length; i++){
        const p = particles[i];
        p.life -= 0.035;
      }
      particles = particles.filter(p => p.life > 0);

      for (const p of particles){
        const grad = cometCtx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 4 * p.life + 1);
        grad.addColorStop(0, `rgba(77,217,192,${0.55 * p.life})`);
        grad.addColorStop(0.5, `rgba(107,79,160,${0.28 * p.life})`);
        grad.addColorStop(1, 'rgba(107,79,160,0)');
        cometCtx.beginPath();
        cometCtx.fillStyle = grad;
        cometCtx.arc(p.x, p.y, p.r * 4 * p.life + 1, 0, Math.PI * 2);
        cometCtx.fill();
      }

      // comet head
      const headGrad = cometCtx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 9);
      headGrad.addColorStop(0, '#FFFFFF');
      headGrad.addColorStop(0.4, '#4DD9C0');
      headGrad.addColorStop(1, 'rgba(77,217,192,0)');
      cometCtx.beginPath();
      cometCtx.fillStyle = headGrad;
      cometCtx.arc(mouse.x, mouse.y, 9, 0, Math.PI * 2);
      cometCtx.fill();

      requestAnimationFrame(drawComet);
    }
    requestAnimationFrame(drawComet);
  }

  /* ===================== FADE TRANSITION ON NAV CLICK ===================== */
  const fadeOverlay = document.getElementById('fade-overlay');
  document.querySelectorAll('[data-nav]').forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (!href || !href.startsWith('#')) return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();

      fadeOverlay.classList.add('active');
      setTimeout(() => {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        setTimeout(() => fadeOverlay.classList.remove('active'), 250);
      }, 220);

      closeAnySidebar();
    });
  });

  /* ===================== SIDEBAR: mobile drawer + desktop hover/click ===================== */
  const navToggle = document.getElementById('nav-toggle');
  const logoToggle = document.getElementById('logo-toggle');
  const hoverZone = document.getElementById('hover-zone');
  const sidebar = document.getElementById('sidebar');
  const navScrim = document.getElementById('nav-scrim');
  const isDesktop = () => window.matchMedia('(min-width: 901px)').matches;

  // --- Mobile drawer (hamburger) ---
  function openMobileNav(){
    sidebar.classList.add('open');
    navToggle.classList.add('open');
    navScrim.classList.add('show');
    navToggle.setAttribute('aria-expanded', 'true');
  }
  function closeMobileNav(){
    sidebar.classList.remove('open');
    navToggle.classList.remove('open');
    navScrim.classList.remove('show');
    navToggle.setAttribute('aria-expanded', 'false');
  }
  navToggle.addEventListener('click', () => {
    sidebar.classList.contains('open') ? closeMobileNav() : openMobileNav();
  });
  navScrim.addEventListener('click', closeMobileNav);

  // --- Desktop: peek on hover, pin on logo click ---
  let pinned = false;

  function peekOpen(){ if (isDesktop() && !pinned) sidebar.classList.add('peek'); }
  function peekClose(){ if (isDesktop() && !pinned) sidebar.classList.remove('peek'); }

  function setPinned(state){
    pinned = state;
    sidebar.classList.toggle('pinned', pinned);
    logoToggle.classList.toggle('pinned', pinned);
    logoToggle.setAttribute('aria-expanded', pinned ? 'true' : 'false');
    if (!pinned) sidebar.classList.remove('peek');
  }

  hoverZone.addEventListener('mouseenter', peekOpen);
  sidebar.addEventListener('mouseenter', peekOpen);
  sidebar.addEventListener('mouseleave', peekClose);

  logoToggle.addEventListener('click', () => setPinned(!pinned));

  // Clicking outside the sidebar/logo (desktop) un-pins it
  document.addEventListener('click', (e) => {
    if (!isDesktop() || !pinned) return;
    if (!sidebar.contains(e.target) && !logoToggle.contains(e.target)){
      setPinned(false);
    }
  });

  // Closing helper used after any nav link click (mobile drawer + desktop pin/peek)
  function closeAnySidebar(){
    closeMobileNav();
    setPinned(false);
  }

  /* ===================== ACTIVE NAV HIGHLIGHTING ===================== */
  const sections = document.querySelectorAll('main .section');
  const navLinks = document.querySelectorAll('.nav-links a');

  const navObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting){
        const id = entry.target.getAttribute('id');
        navLinks.forEach(l => {
          l.classList.toggle('active', l.getAttribute('href') === `#${id}`);
        });
      }
    });
  }, { threshold: 0.4 });
  sections.forEach(s => navObserver.observe(s));

  /* ===================== SCROLL REVEAL ===================== */
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting){
        entry.target.classList.add('in-view');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });
  document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

  /* ===================== FLIP CARDS ===================== */
  document.querySelectorAll('.flip-card').forEach(card => {
    card.addEventListener('click', () => {
      const flipped = card.classList.toggle('flipped');
      card.setAttribute('aria-expanded', flipped ? 'true' : 'false');
    });
  });

  /* ===================== BOARD MARQUEE (seamless loop) ===================== */
  const marquee = document.getElementById('board-marquee');
  if (marquee){
    marquee.innerHTML += marquee.innerHTML; // duplicate members once for seamless loop
  }

  /* ===================== WORLD REACH MAP ===================== */
  // Approximate ambassador / follower locations (feel free to add more:
  // { name, lat, lon } — lat/lon are converted to x/y automatically below)
  const LOCATIONS = [
    { name: 'United Arab Emirates', lat: 24.5, lon: 54.4 },
    { name: 'Berlin', lat: 52.5, lon: 13.4 },
    { name: 'Amsterdam', lat: 52.4, lon: 4.9 },
    { name: 'England', lat: 51.5, lon: -0.1 },
    { name: 'Mumbai', lat: 19.1, lon: 72.9 },
    { name: 'Delhi', lat: 28.61, lon: 77.21 },
    { name: 'Indore', lat: 22.72, lon: 78.86},
    { name: 'Bangalore', lat: 12.97, lon: 77.59 },
    { name: 'Edmonton', lat: 53.4, lon: -113.49 },
    { name: 'Singapore', lat: 1.35, lon: 103.8 }
  ];

  const mapCanvas = document.getElementById('worldmap');
  if (mapCanvas){
    const mapCtx = mapCanvas.getContext('2d');
    let pinTime = 0;

    function latLonToXY(lat, lon, w, h){
      const x = (lon + 180) / 360 * w;

      const clampedLat = Math.max(-75, Math.min(75, lat));
      const latRad = clampedLat * Math.PI / 180;
      const mercN = Math.log(Math.tan((Math.PI / 4) + (latRad / 2)));

      const maxMercN = Math.log(Math.tan((Math.PI / 4) + (75 * Math.PI / 180 / 2)));
      const y = (h / 2) - (h * mercN / (2 * maxMercN));

      return { x, y };
    }

    function resizeMap(){
      const rect = mapCanvas.parentElement.getBoundingClientRect();
      const targetRatio = 2; // world map is naturally 2:1 (360° wide / 180° tall)

      let w = rect.width;
      let h = w / targetRatio;

      // if that height doesn't fit the box, constrain by height instead
      if (h > rect.height){
        h = rect.height;
        w = h * targetRatio;
      }

      mapCanvas.width = w;
      mapCanvas.height = h;

      // center the canvas inside its parent if it doesn't fill it exactly
      mapCanvas.style.width = `${w}px`;
      mapCanvas.style.height = `${h}px`;
      mapCanvas.style.position = 'absolute';
      mapCanvas.style.left = '50%';
      mapCanvas.style.top = '50%';
      mapCanvas.style.transform = 'translate(-50%, -50%)';
    }

    function drawWorldOutline(w, h){
      mapCtx.beginPath();
      WORLD_POLYGONS.forEach(poly => {
        poly.forEach(([lon, lat], i) => {
          const { x, y } = latLonToXY(lat, lon, w, h);
          if (i === 0) mapCtx.moveTo(x, y);
          else mapCtx.lineTo(x, y);
        });
      });
      mapCtx.strokeStyle = 'rgba(139,120,200,0.35)';
      mapCtx.lineWidth = 1;
      mapCtx.stroke();
      mapCtx.fillStyle = 'rgba(139,120,200,0.06)';
      mapCtx.fill();
    }

    function drawMap(){
      pinTime += 1;
      const w = mapCanvas.width, h = mapCanvas.height;
      mapCtx.clearRect(0, 0, w, h);

      // world coastlines
      drawWorldOutline(w, h);

      // faint lat/long dot grid on top of the outline
      mapCtx.fillStyle = 'rgba(139,120,200,0.12)';
      const gap = 22;
      for (let gx = 0; gx < w; gx += gap){
        for (let gy = 0; gy < h; gy += gap){
          mapCtx.beginPath();
          mapCtx.arc(gx, gy, 1.1, 0, Math.PI * 2);
          mapCtx.fill();
        }
      }

      // pins
      LOCATIONS.forEach((loc, i) => {
        const { x, y } = latLonToXY(loc.lat, loc.lon, w, h);
        const pulse = (Math.sin(pinTime * 0.04 + i) + 1) / 2;

        mapCtx.beginPath();
        mapCtx.arc(x, y, 4 + pulse * 10, 0, Math.PI * 2);
        mapCtx.strokeStyle = `rgba(77,217,192,${0.5 - pulse * 0.4})`;
        mapCtx.lineWidth = 1.4;
        mapCtx.stroke();

        mapCtx.beginPath();
        mapCtx.arc(x, y, 3.5, 0, Math.PI * 2);
        mapCtx.fillStyle = '#4DD9C0';
        mapCtx.shadowColor = '#4DD9C0';
        mapCtx.shadowBlur = 8;
        mapCtx.fill();
        mapCtx.shadowBlur = 0;
      });

      requestAnimationFrame(drawMap);
    }

    resizeMap();
    requestAnimationFrame(drawMap);
    window.addEventListener('resize', () => setTimeout(resizeMap, 200));

    // Simple tooltip on hover/tap
    const mapWrap = mapCanvas.parentElement;
    const tooltip = document.createElement('div');
    tooltip.style.cssText = `
      position:absolute; pointer-events:none; padding:5px 10px; border-radius:8px;
      background:#100E1F; border:1px solid rgba(139,120,200,0.4); color:#fff;
      font-family:'JetBrains Mono',monospace; font-size:12px; transform:translate(-50%,-140%);
      opacity:0; transition:opacity .2s ease; z-index:5; white-space:nowrap;
    `;
    mapWrap.style.position = 'relative';
    mapWrap.appendChild(tooltip);

    mapCanvas.addEventListener('mousemove', (e) => {
      const rect = mapCanvas.getBoundingClientRect();
      const mx = e.clientX - rect.left, my = e.clientY - rect.top;
      let found = null;
      for (const loc of LOCATIONS){
        const { x, y } = latLonToXY(loc.lat, loc.lon, mapCanvas.width, mapCanvas.height);
        if (Math.hypot(mx - x, my - y) < 14){ found = { loc, x, y }; break; }
      }
      if (found){
        tooltip.textContent = found.loc.name;
        tooltip.style.left = `${found.x}px`;
        tooltip.style.top = `${found.y}px`;
        tooltip.style.opacity = '1';
        mapCanvas.style.cursor = 'pointer';
      } else {
        tooltip.style.opacity = '0';
        mapCanvas.style.cursor = 'default';
      }
    });
    mapCanvas.addEventListener('mouseleave', () => tooltip.style.opacity = '0');
  }
/* ===================== FOUNDER ORB → LINKEDIN ===================== */
  document.querySelectorAll('.founder-orb').forEach(orb => {
    orb.addEventListener('click', () => {
      const linkedin = orb.getAttribute('data-linkedin');
      if (linkedin){
        window.open(linkedin, '_blank', 'noopener');
      }
    });
    orb.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' '){
        e.preventDefault();
        const linkedin = orb.getAttribute('data-linkedin');
        if (linkedin) window.open(linkedin, '_blank', 'noopener');
      }
    });
  });
});

/* ===================== SCROLL PROGRESS BAR ===================== */
const scrollDots = document.querySelectorAll('.scroll-dot');
const dotSections = document.querySelectorAll('main .section');
const dotsFill = document.getElementById('scroll-dots-fill');

if (scrollDots.length && dotSections.length){
  const dotObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting){
        const id = entry.target.getAttribute('id');
        scrollDots.forEach(dot => {
          dot.classList.toggle('active', dot.dataset.section === id);
        });
      }
    });
  }, { threshold: 0.4 });

  dotSections.forEach(s => dotObserver.observe(s));
}

if (dotsFill){
  function updateDotsFill(){
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    dotsFill.style.height = `${progress}%`;
  }
  window.addEventListener('scroll', updateDotsFill, { passive: true });
  window.addEventListener('resize', updateDotsFill);
  updateDotsFill();
}
/* ===================== NUMBER COUNTERS ===================== */
const statNumbers = document.querySelectorAll('.stat-number');

if (statNumbers.length){
  const statObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting){
        const el = entry.target;
        const target = parseInt(el.dataset.target, 10);
        const duration = 1500; // ms
        const startTime = performance.now();

        function animateCount(now){
          const elapsed = now - startTime;
          const progress = Math.min(elapsed / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
          el.textContent = Math.floor(eased * target);

          if (progress < 1){
            requestAnimationFrame(animateCount);
          } else {
            el.textContent = target;
          }
        }

        requestAnimationFrame(animateCount);
        statObserver.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  statNumbers.forEach(el => statObserver.observe(el));
}
/* ===================== HORIZONTAL SCROLL TIMELINE ===================== */
const timelineWrap = document.getElementById('timeline-wrap');
const timelineTrack = document.getElementById('timeline-track');

if (timelineWrap && timelineTrack){
  function updateTimeline(){
    const rect = timelineWrap.getBoundingClientRect();
    const wrapHeight = timelineWrap.offsetHeight;
    const viewportHeight = window.innerHeight;
    const scrolled = -rect.top;
    const scrollRange = wrapHeight - viewportHeight;
    let progress = scrolled / scrollRange;
    progress = Math.min(Math.max(progress, 0), 1);

    const trackWidth = timelineTrack.scrollWidth - window.innerWidth;
    const translateX = -progress * trackWidth;

    timelineTrack.style.transform = `translateX(${translateX}px)`;
  }

function positionTimelineLine(){
  const dots = document.querySelectorAll('.timeline-dot');
  const line = document.querySelector('.timeline-line');
  if (!dots.length || !line) return;

  const firstDot = dots[0];
  const lastDot = dots[dots.length - 1];

  // Get each dot's center position relative to .timeline-track (their common offsetParent)
  const firstLeft = firstDot.offsetParent === lastDot.offsetParent
    ? firstDot.parentElement.offsetLeft + firstDot.offsetLeft + firstDot.offsetWidth / 2
    : 0;
  const lastLeft = lastDot.parentElement.offsetLeft + lastDot.offsetLeft + lastDot.offsetWidth / 2;

  line.style.left = `${firstLeft}px`;
  line.style.width = `${lastLeft - firstLeft}px`;
}

// Call once on load, and again on resize (since layout/widths can change)
positionTimelineLine();
window.addEventListener('resize', positionTimelineLine);

  window.addEventListener('scroll', updateTimeline, { passive: true });
  window.addEventListener('resize', updateTimeline);
  updateTimeline();
  positionTimelineLine();
}

/* ===================== CONTACT CARD FAN-OUT ===================== */
document.addEventListener('DOMContentLoaded', () => {
  const cardFan = document.getElementById('card-fan');
  if (!cardFan) return;

  const cards = Array.from(cardFan.querySelectorAll('.fan-card'));

  const cardFanObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting){
        cardFan.classList.add('spread');
        cardFanObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  cardFanObserver.observe(cardFan);

  cards.forEach(card => {
    card.addEventListener('mouseenter', () => {
      const hoveredIndex = parseInt(card.dataset.i, 10);

      cards.forEach(c => {
        const i = parseInt(c.dataset.i, 10);
        const distance = i - hoveredIndex;

        if (distance === 0){
          c.style.setProperty('--push', '0px');
        } else {
          const magnitude = 50 / Math.sqrt(Math.abs(distance));
          const push = distance > 0 ? magnitude : -magnitude;
          c.style.setProperty('--push', `${push}px`);
        }
      });
    });

    card.addEventListener('mouseleave', () => {
      cards.forEach(c => c.style.setProperty('--push', '0px'));
    });
  });
});
/* =============================================================
   SUBSTACK BLOG INTEGRATION
============================================================== */

const SUBSTACK_RSS =
  "https://spacedorg.substack.com/feed";

const BLOG_CONTAINER =
  document.getElementById("blog-container");


async function loadSubstackPosts() {

  // Make sure the blog container exists
  if (!BLOG_CONTAINER) {
    return;
  }

  try {

    /*
      We use rss2json to convert
      Substack's RSS feed into JSON
      that JavaScript can read.
    */

    const apiURL =
      "https://api.rss2json.com/v1/api.json?rss_url="
      + encodeURIComponent(SUBSTACK_RSS);


    const response =
      await fetch(apiURL);


    if (!response.ok) {
      throw new Error(
        "Could not load Substack feed."
      );
    }


    const data =
      await response.json();


    if (
      !data.items ||
      data.items.length === 0
    ) {

      throw new Error(
        "No Substack posts found."
      );

    }


    /*
      Get the three most recent
      Substack posts.
    */

    const latestPosts =
      data.items.slice(0, 3);


    /*
      Replace the loading message
      with the actual blog cards.
    */

    BLOG_CONTAINER.innerHTML =
      latestPosts
        .map(
          createBlogCard
        )
        .join("");


  } catch (error) {

    console.error(
      "SPACED Substack Error:",
      error
    );


    /*
      If something goes wrong,
      show a fallback link to Substack.
    */

    BLOG_CONTAINER.innerHTML = `

      <div class="blog-error">

        <p>
          We couldn't load our latest stories.
        </p>

        <br>

        <a
          href="https://spacedorg.substack.com/"
          target="_blank"
          rel="noopener"
          class="btn btn-primary"
        >
          Visit SPACED on Substack →
        </a>

      </div>

    `;

  }

}


/* =============================================================
   CREATE A BLOG CARD
============================================================== */

function createBlogCard(post) {

  /*
    Try to find an image
    from the Substack post.
  */

  const image =
    post.thumbnail ||
    post.enclosure?.link ||
    "";


  /*
    Format the publication date.
  */

  const date =
    new Date(
      post.pubDate
    ).toLocaleDateString(
      "en-US",
      {
        year: "numeric",
        month: "short",
        day: "numeric"
      }
    );


  /*
    Remove HTML tags from
    the article description.
  */

  const description =
    stripHTML(
      post.description || ""
    );


  /*
    Keep the preview short.
  */

  const shortDescription =
    description.length > 140
      ? description.substring(
          0,
          140
        ) + "..."
      : description;


  return `

    <a
      class="blog-card"
      href="${post.link}"
      target="_blank"
      rel="noopener"
    >

      ${
        image
        ? `
          <div class="blog-card-image">

            <img
              src="${image}"
              alt=""
              loading="lazy"
            >

          </div>
        `
        : ""
      }


      <div class="blog-card-content">

        <span class="blog-card-date">
          ${date}
        </span>

        <h3>
          ${escapeHTML(post.title)}
        </h3>

        <p>
          ${escapeHTML(shortDescription)}
        </p>

        <span class="blog-read">
          Read on Substack →
        </span>

      </div>

    </a>

  `;

}


/* =============================================================
   REMOVE HTML FROM SUBSTACK DESCRIPTION
============================================================== */

function stripHTML(html) {

  const temporaryElement =
    document.createElement(
      "div"
    );

  temporaryElement.innerHTML =
    html;

  return (
    temporaryElement.textContent ||
    temporaryElement.innerText ||
    ""
  );

}


/* =============================================================
   ESCAPE HTML
============================================================== */

function escapeHTML(text) {

  const element =
    document.createElement(
      "div"
    );

  element.textContent =
    text;

  return element.innerHTML;

}


/* =============================================================
   START SUBSTACK BLOG
============================================================== */

loadSubstackPosts();