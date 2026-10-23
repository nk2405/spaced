/* =========================================================================
   WESPACED.ORG — SCRIPT
   -------------------------------------------------------------------------
   Organized into small independent modules.

   Main modules:
   - Year in footer
   - Preloader
   - Starfield
   - Comet cursor
   - Navigation fade transitions
   - Sidebar navigation
   - Active navigation highlighting
   - Scroll reveal
   - Flip cards
   - Board marquee
   - World reach map
   - Founder LinkedIn links
   - Scroll progress
   - Number counters
   - Horizontal timeline
   - Contact card fan-out
   - Substack integration
   - MEMORY WALL
   - MEMORY LIGHTBOX
   - MEMORY PARALLAX
========================================================================= */


/* =========================================================================
   GLOBAL INITIALIZATION
========================================================================= */

if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}


document.addEventListener('DOMContentLoaded', () => {


  /* =======================================================================
     YEAR IN FOOTER
  ======================================================================= */

  const yearEl = document.getElementById('year');

  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }


  /* =======================================================================
     PRELOADER
  ======================================================================= */

  const preloader = document.getElementById('preloader');

  const hidePreloader = () => {
    if (preloader) {
      preloader.classList.add('hidden');
    }
  };

  // Hide once everything is loaded
  // but never make people wait more than 2.2 seconds

  window.addEventListener('load', () => {
    setTimeout(hidePreloader, 500);
  });

  setTimeout(hidePreloader, 2200);



  /* =======================================================================
     STARFIELD
     -----------------------------------------------------------------------
     Pulsing stars across the page.
  ======================================================================= */

  const starCanvas = document.getElementById('starfield');

  if (starCanvas) {

    const starCtx = starCanvas.getContext('2d');

    let stars = [];

    const STAR_COLORS = [
      '#FFFFFF',
      '#8B78C8',
      '#4DD9C0'
    ];


    function resizeStarCanvas() {

      starCanvas.width = window.innerWidth;

      starCanvas.height =
        document.documentElement.scrollHeight;

    }


    function buildStars() {

      const count =
        Math.floor(
          (
            starCanvas.width *
            starCanvas.height
          ) / 9000
        );


      stars =
        Array.from(
          { length: count },
          () => ({

            x:
              Math.random() *
              starCanvas.width,

            y:
              Math.random() *
              starCanvas.height,

            r:
              Math.random() *
              1.3 +
              0.3,

            color:
              STAR_COLORS[
                Math.floor(
                  Math.random() *
                  STAR_COLORS.length
                )
              ],

            phase:
              Math.random() *
              Math.PI *
              2,

            speed:
              Math.random() *
              0.015 +
              0.006

          })
        );

    }


    let starTime = 0;


    function drawStars() {

      starTime += 1;

      starCtx.clearRect(
        0,
        0,
        starCanvas.width,
        starCanvas.height
      );


      for (const s of stars) {

        const twinkle =
          (
            Math.sin(
              starTime *
              s.speed +
              s.phase
            ) + 1
          ) / 2;


        const alpha =
          0.25 +
          twinkle *
          0.75;


        starCtx.beginPath();

        starCtx.arc(
          s.x,
          s.y,
          s.r +
          twinkle *
          0.6,
          0,
          Math.PI * 2
        );


        starCtx.fillStyle =
          s.color;


        starCtx.globalAlpha =
          alpha;


        starCtx.fill();

      }


      starCtx.globalAlpha = 1;

      requestAnimationFrame(
        drawStars
      );

    }


    function initStarfield() {

      resizeStarCanvas();

      buildStars();

    }


    initStarfield();

    requestAnimationFrame(
      drawStars
    );


    let resizeTimeout;


    window.addEventListener(
      'resize',
      () => {

        clearTimeout(
          resizeTimeout
        );


        resizeTimeout =
          setTimeout(
            initStarfield,
            250
          );

      }
    );


    // Rebuild once content settles
    // Images can change page height

    window.addEventListener(
      'load',
      () => {

        setTimeout(
          initStarfield,
          300
        );

      }
    );

  }



  /* =======================================================================
     COMET CURSOR
  ======================================================================= */
  const cometCanvas = document.getElementById('comet-cursor');
  const isTouch = window.matchMedia('(hover: none), (pointer: coarse)').matches;

  if (!isTouch && cometCanvas) {

    const cometCtx = cometCanvas.getContext('2d');

    let particles = [];

    let mouse = {
      x: window.innerWidth / 2,
      y: window.innerHeight / 2
    };

    let lastMouse = { ...mouse };

    function resizeCometCanvas() {
      cometCanvas.width = window.innerWidth;
      cometCanvas.height = window.innerHeight;
    }

    resizeCometCanvas();

    window.addEventListener('resize', resizeCometCanvas);

        // --- pre-rendered glow sprite (replaces a gradient per particle per frame) ---
    const sprite = document.createElement('canvas');
    sprite.width = sprite.height = 64;
    const sctx = sprite.getContext('2d');
    const sg = sctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    sg.addColorStop(0, 'rgba(77,217,192,0.55)');
    sg.addColorStop(0.5, 'rgba(107,79,160,0.28)');
    sg.addColorStop(1, 'rgba(107,79,160,0)');
    sctx.fillStyle = sg;
    sctx.fillRect(0, 0, 64, 64);

        // --- the head chases the cursor; the trail follows the head ---
    const target = { x: mouse.x, y: mouse.y };
    const head = { x: mouse.x, y: mouse.y };

    window.addEventListener('mousemove', (e) => {
      cometCanvas.style.opacity = '1';
      target.x = e.clientX;
      target.y = e.clientY;
    });

    function spawn(x0, y0, x1, y1) {
      const dist = Math.hypot(x1 - x0, y1 - y0);
      const n = Math.max(Math.ceil(dist / 2), 1);
      for (let i = 1; i <= n; i++) {
        const t = i / n;
        particles.push({
          x: x0 + (x1 - x0) * t,
          y: y0 + (y1 - y0) * t,
          life: 1,
          r: Math.random() * 2 + 1.8
        });
      }
    }

    const STEP = 1 / 120;   // simulate at 120Hz regardless of real frame rate
    const FOLLOW = 28;      // higher = head sticks closer to cursor, lower = floatier
    let lastTime = performance.now();
    let acc = 0;

    function drawComet(now) {
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;
      acc += dt;

      // advance the head in small steps so the path is a smooth curve
      while (acc >= STEP) {
        acc -= STEP;
        const px = head.x, py = head.y;
        const k = 1 - Math.exp(-FOLLOW * STEP);
        head.x += (target.x - head.x) * k;
        head.y += (target.y - head.y) * k;
        spawn(px, py, head.x, head.y);
      }

      if (particles.length > 400) particles = particles.slice(particles.length - 400);

      cometCtx.clearRect(0, 0, cometCanvas.width, cometCanvas.height);

      for (let i = 0; i < particles.length; i++) particles[i].life -= dt * 2.1;
      particles = particles.filter(p => p.life > 0);

      for (const p of particles) {
        const rad = p.r * 4 * p.life + 1;
        cometCtx.globalAlpha = p.life;
        cometCtx.drawImage(sprite, p.x - rad, p.y - rad, rad * 2, rad * 2);
      }
      cometCtx.globalAlpha = 1;

      const headGrad = cometCtx.createRadialGradient(head.x, head.y, 0, head.x, head.y, 9);
      headGrad.addColorStop(0, '#FFFFFF');
      headGrad.addColorStop(0.4, '#4DD9C0');
      headGrad.addColorStop(1, 'rgba(77,217,192,0)');

      cometCtx.beginPath();
      cometCtx.fillStyle = headGrad;
      cometCtx.arc(head.x, head.y, 9, 0, Math.PI * 2);
      cometCtx.fill();

      requestAnimationFrame(drawComet);
    }

    requestAnimationFrame(drawComet);

  }



  /* =======================================================================
     FADE TRANSITION ON NAV CLICK
  ======================================================================= */

  const fadeOverlay =
    document.getElementById(
      'fade-overlay'
    );


  document
    .querySelectorAll(
      '[data-nav]'
    )
    .forEach(
      link => {

        link.addEventListener(
          'click',
          (e) => {

            const href =
              link.getAttribute(
                'href'
              );


            if (
              !href ||
              !href.startsWith('#')
            ) {
              return;
            }


            const target =
              document.querySelector(
                href
              );


            if (!target) {
              return;
            }


            e.preventDefault();


            if (fadeOverlay) {

              fadeOverlay.classList.add(
                'active'
              );

            }


            setTimeout(
              () => {

                target.scrollIntoView({
                  behavior:
                    'smooth',

                  block:
                    'start'
                });


                setTimeout(
                  () => {

                    if (fadeOverlay) {

                      fadeOverlay.classList.remove(
                        'active'
                      );

                    }

                  },
                  250
                );

              },
              220
            );


            closeAnySidebar();

          }
        );

      }
    );



  /* =======================================================================
     SIDEBAR
     -----------------------------------------------------------------------
     Mobile drawer + desktop hover/click.
  ======================================================================= */

  const navToggle =
    document.getElementById(
      'nav-toggle'
    );


  const logoToggle =
    document.getElementById(
      'logo-toggle'
    );


  const hoverZone =
    document.getElementById(
      'hover-zone'
    );


  const sidebar =
    document.getElementById(
      'sidebar'
    );


  const navScrim =
    document.getElementById(
      'nav-scrim'
    );


  const isDesktop =
    () =>
      window.matchMedia(
        '(min-width: 901px)'
      ).matches;


  let pinned = false;



  function openMobileNav() {

    if (!sidebar) return;

    sidebar.classList.add(
      'open'
    );


    if (navToggle) {

      navToggle.classList.add(
        'open'
      );


      navToggle.setAttribute(
        'aria-expanded',
        'true'
      );

    }


    if (navScrim) {

      navScrim.classList.add(
        'show'
      );

    }

  }



  function closeMobileNav() {

    if (!sidebar) return;

    sidebar.classList.remove(
      'open'
    );


    if (navToggle) {

      navToggle.classList.remove(
        'open'
      );


      navToggle.setAttribute(
        'aria-expanded',
        'false'
      );

    }


    if (navScrim) {

      navScrim.classList.remove(
        'show'
      );

    }

  }



  if (
    navToggle &&
    navScrim &&
    sidebar
  ) {

    navToggle.addEventListener(
      'click',
      () => {

        sidebar.classList.contains(
          'open'
        )
          ? closeMobileNav()
          : openMobileNav();

      }
    );


    navScrim.addEventListener(
      'click',
      closeMobileNav
    );

  }



  function peekOpen() {

    if (
      isDesktop() &&
      !pinned &&
      sidebar
    ) {

      sidebar.classList.add(
        'peek'
      );

    }

  }



  function peekClose() {

    if (
      isDesktop() &&
      !pinned &&
      sidebar
    ) {

      sidebar.classList.remove(
        'peek'
      );

    }

  }



  function setPinned(state) {

    pinned =
      state;


    if (sidebar) {

      sidebar.classList.toggle(
        'pinned',
        pinned
      );

    }


    if (logoToggle) {

      logoToggle.classList.toggle(
        'pinned',
        pinned
      );


      logoToggle.setAttribute(
        'aria-expanded',
        pinned
          ? 'true'
          : 'false'
      );

    }


    if (
      !pinned &&
      sidebar
    ) {

      sidebar.classList.remove(
        'peek'
      );

    }

  }



  if (hoverZone) {

    hoverZone.addEventListener(
      'mouseenter',
      peekOpen
    );

  }


  if (sidebar) {

    sidebar.addEventListener(
      'mouseenter',
      peekOpen
    );


    sidebar.addEventListener(
      'mouseleave',
      peekClose
    );

  }


  if (logoToggle) {

    logoToggle.addEventListener(
      'click',
      () =>
        setPinned(
          !pinned
        )
    );

  }



  document.addEventListener(
    'click',
    (e) => {

      if (
        !isDesktop() ||
        !pinned
      ) {
        return;
      }


      if (
        sidebar &&
        logoToggle &&
        !sidebar.contains(
          e.target
        ) &&
        !logoToggle.contains(
          e.target
        )
      ) {

        setPinned(
          false
        );

      }

    }
  );



  function closeAnySidebar() {

    closeMobileNav();

    setPinned(
      false
    );

  }



  /* =======================================================================
     ACTIVE NAV HIGHLIGHTING
  ======================================================================= */

  const sections =
    document.querySelectorAll(
      'main .section'
    );


  const navLinks =
    document.querySelectorAll(
      '.nav-links a'
    );


  if (
    sections.length &&
    navLinks.length
  ) {

    const navObserver =
      new IntersectionObserver(
        (entries) => {

          entries.forEach(
            entry => {

              if (
                entry.isIntersecting
              ) {

                const id =
                  entry.target.getAttribute(
                    'id'
                  );


                navLinks.forEach(
                  link => {

                    link.classList.toggle(
                      'active',
                      link.getAttribute(
                        'href'
                      ) ===
                      `#${id}`
                    );

                  }
                );

              }

            }
          );

        },
        {
          threshold:
            0.4
        }
      );


    sections.forEach(
      section =>
        navObserver.observe(
          section
        )
    );

  }



  /* =======================================================================
     SCROLL REVEAL
  ======================================================================= */

  const revealElements =
    document.querySelectorAll(
      '.reveal'
    );


  if (
    revealElements.length
  ) {

    const revealObserver =
      new IntersectionObserver(
        (entries) => {

          entries.forEach(
            entry => {

              if (
                entry.isIntersecting
              ) {

                entry.target.classList.add(
                  'in-view'
                );


                revealObserver.unobserve(
                  entry.target
                );

              }

            }
          );

        },
        {
          threshold:
            0.15,

          rootMargin:
            '0px 0px -60px 0px'
        }
      );


    revealElements.forEach(
      el =>
        revealObserver.observe(
          el
        )
    );

  }

  /* =======================================================================
     FLIP CARDS
  ======================================================================= */

  document
    .querySelectorAll(
      '.flip-card'
    )
    .forEach(
      card => {

        card.addEventListener(
          'click',
          () => {

            const flipped =
              card.classList.toggle(
                'flipped'
              );


            card.setAttribute(
              'aria-expanded',
              flipped
                ? 'true'
                : 'false'
            );

          }
        );

      }
    );



  /* =======================================================================
     BOARD MARQUEE
     -----------------------------------------------------------------------
     Duplicates board members for seamless looping.
  ======================================================================= */

  const marquee =
    document.getElementById(
      'board-marquee'
    );


  if (marquee) {

    marquee.innerHTML +=
      marquee.innerHTML;

  }



  /* =======================================================================
     MEMBERS MAP
  ======================================================================= */
  /* =======================================================================
     WORLD REACH MAP (3D GLOBE)
  ======================================================================= */

  const LOCATIONS = [
    { name: 'Abu Dhabi', lat: 24.5, lon: 54.4 },
    { name: 'Toronto', lat: 43.65, lon: -79.38 },
    { name: 'England', lat: 51.5, lon: -0.1 },
    { name: 'Mumbai', lat: 19.1, lon: 72.9 },
    { name: 'Delhi', lat: 28.61, lon: 77.21 },
    { name: 'Indore', lat: 22.72, lon: 78.86 },
    { name: 'Bangalore', lat: 12.97, lon: 77.59 },
    { name: 'Edmonton', lat: 53.4, lon: -113.49 },
    { name: 'Singapore', lat: 1.35, lon: 103.8 }
  ];

  const earthContainer = document.getElementById('earth-canvas-container');

  if (earthContainer && typeof THREE !== 'undefined') {

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(
      45,
      earthContainer.clientWidth / earthContainer.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 3;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(earthContainer.clientWidth, earthContainer.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    earthContainer.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffffff, 1.1);
    sunLight.position.set(5, 3, 5);
    scene.add(sunLight);

    const textureLoader = new THREE.TextureLoader();
    const earthTexture = textureLoader.load(
      'https://unpkg.com/three-globe@2.31.0/example/img/earth-blue-marble.jpg'
    );

    const earthGeometry = new THREE.SphereGeometry(1, 64, 64);
    const earthMaterial = new THREE.MeshStandardMaterial({
      map: earthTexture,
      roughness: 0.8,
      metalness: 0.1
    });
    const earth = new THREE.Mesh(earthGeometry, earthMaterial);
    scene.add(earth);

    function latLonToVector3(lat, lon, radius) {
      const phi = (90 - lat) * (Math.PI / 180);
      const theta = (lon + 180) * (Math.PI / 180);

      const x = -radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.cos(phi);
      const z = radius * Math.sin(phi) * Math.sin(theta);

      return new THREE.Vector3(x, y, z);
    }

    const markerMeshes = [];
    const pulseRings = [];

    LOCATIONS.forEach(loc => {
      const pos = latLonToVector3(loc.lat, loc.lon, 1.02);
      const normal = pos.clone().normalize();

      const pinGeometry = new THREE.ConeGeometry(0.012, 0.04, 12);
      const pinMaterial = new THREE.MeshStandardMaterial({
        color: 0xE23D3D,
        emissive: 0x8B1414,
        emissiveIntensity: 0.4
      });
      const pin = new THREE.Mesh(pinGeometry, pinMaterial);

      pin.position.copy(pos).add(normal.clone().multiplyScalar(0.02));
      pin.lookAt(pos.clone().add(normal));
      pin.rotateX(Math.PI / 2);

      scene.add(pin);

      // Invisible, larger hit area for easier hovering — this is what the raycaster targets
      const hitAreaGeometry = new THREE.SphereGeometry(0.06, 12, 12);
      const hitAreaMaterial = new THREE.MeshBasicMaterial({
        transparent: true,
        opacity: 0,
        depthWrite: false
      });
      const hitArea = new THREE.Mesh(hitAreaGeometry, hitAreaMaterial);
      hitArea.position.copy(pos).add(normal.clone().multiplyScalar(0.02));
      hitArea.userData.name = loc.name;
      scene.add(hitArea);
      markerMeshes.push(hitArea);

      const ringGeometry = new THREE.RingGeometry(0.015, 0.02, 24);
      const ringMaterial = new THREE.MeshBasicMaterial({
        color: 0xE23D3D,
        transparent: true,
        opacity: 0.6,
        side: THREE.DoubleSide
      });
      const ring = new THREE.Mesh(ringGeometry, ringMaterial);
      ring.position.copy(pos);
      ring.lookAt(pos.clone().add(normal));
      scene.add(ring);
      pulseRings.push(ring);
    });

    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.rotateSpeed = 0.5;
    controls.enableZoom = false;
    controls.enablePan = false;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.2;
    renderer.domElement.addEventListener('pointermove', (e) => {
    const cometMouseMoveEvent = new MouseEvent('mousemove', {
      clientX: e.clientX,
      clientY: e.clientY,
      bubbles: true
    });
    window.dispatchEvent(cometMouseMoveEvent);
    });

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    const tooltip = document.getElementById('earth-tooltip');

    function onEarthMouseMove(event) {
      const rect = earthContainer.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(markerMeshes);

      if (intersects.length > 0) {
        const hit = intersects[0].object;
        const screenPos = hit.position.clone().project(camera);

        const x = (screenPos.x * 0.5 + 0.5) * rect.width;
        const y = (-screenPos.y * 0.5 + 0.5) * rect.height;

        if (tooltip) {
          tooltip.textContent = hit.userData.name;
          tooltip.style.left = `${x}px`;
          tooltip.style.top = `${y}px`;
          tooltip.classList.add('visible');
        }

        earthContainer.style.cursor = 'pointer';
        controls.autoRotate = false;
      } else {
        if (tooltip) {
          tooltip.classList.remove('visible');
        }

        earthContainer.style.cursor = 'grab';
        controls.autoRotate = true;
      }
    }

    earthContainer.addEventListener('mousemove', onEarthMouseMove);

    earthContainer.addEventListener('mouseleave', () => {
      if (tooltip) {
        tooltip.classList.remove('visible');
      }
      controls.autoRotate = true;
    });

    function onEarthResize() {
      const width = earthContainer.clientWidth;
      const height = earthContainer.clientHeight;

      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    }

    window.addEventListener('resize', onEarthResize);

    let pulseTime = 0;

    function animateEarth() {
      requestAnimationFrame(animateEarth);
      controls.update();

      pulseTime += 0.03;
      const pulseScale = 1 + Math.sin(pulseTime) * 0.4;
      const pulseOpacity = 0.6 - Math.abs(Math.sin(pulseTime)) * 0.4;

      pulseRings.forEach(ring => {
        ring.scale.set(pulseScale, pulseScale, pulseScale);
        ring.material.opacity = pulseOpacity;
      });

      renderer.render(scene, camera);
    }

    animateEarth();
  }


  /* =======================================================================
     FOUNDER ORB → LINKEDIN
  ======================================================================= */

  document
    .querySelectorAll(
      '.founder-orb'
    )
    .forEach(
      orb => {

        orb.addEventListener(
          'click',
          () => {

            const linkedin =
              orb.getAttribute(
                'data-linkedin'
              );


            if (linkedin) {

              window.open(
                linkedin,
                '_blank',
                'noopener'
              );

            }

          }
        );


        orb.addEventListener(
          'keydown',
          (e) => {

            if (
              e.key ===
                'Enter' ||
              e.key ===
                ' '
            ) {

              e.preventDefault();


              const linkedin =
                orb.getAttribute(
                  'data-linkedin'
                );


              if (linkedin) {

                window.open(
                  linkedin,
                  '_blank',
                  'noopener'
                );

              }

            }

          }
        );

      }
    );

  document.addEventListener('DOMContentLoaded', () => {
  const openBtn = document.getElementById('open-memory-wall');
  const closeBtn = document.getElementById('album-popup-close');
  const backdrop = document.getElementById('album-popup-close-backdrop');
  const popupOverlay = document.getElementById('album-popup-overlay');

  if (openBtn && popupOverlay) {
    // Open Popup
    openBtn.addEventListener('click', (e) => {
      e.preventDefault();
      popupOverlay.classList.add('is-open');
      popupOverlay.setAttribute('aria-hidden', 'false');
      openBtn.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden'; // Prevent background scrolling
    });
  }

  function closePopup() {
    if (popupOverlay) {
      popupOverlay.classList.remove('is-open');
      popupOverlay.setAttribute('aria-hidden', 'true');
      if (openBtn) openBtn.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = ''; // Restore background scrolling
    }
  }

  // Close via button or backdrop click
  if (closeBtn) closeBtn.addEventListener('click', closePopup);
  if (backdrop) backdrop.addEventListener('click', closePopup);

  // Close via Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && popupOverlay.classList.contains('is-open')) {
      closePopup();
    }
  });
});

/*=========================================================================
   ALBUM POPUP GALLERY CONTROLLER
========================================================================= */
  const openBtn = document.getElementById('open-memory-wall');
  const popupOverlay = document.getElementById('album-popup-overlay');
  const closeBtn = document.getElementById('album-popup-close');
  const backdrop = document.getElementById('album-popup-close-backdrop');

  if (!openBtn || !popupOverlay) return;

openBtn.addEventListener('click', (e) => {
  e.preventDefault();
  popupOverlay.classList.add('is-open');
  popupOverlay.setAttribute('aria-hidden', 'false');
  openBtn.setAttribute('aria-expanded', 'true');
  document.body.classList.add('album-popup-open'); // Triggers hiding UI elements & disabling sidebar

  // Wait for the opening transition/visibility to apply, then measure real image sizes
  requestAnimationFrame(() => {
    requestAnimationFrame(sizeAlbumGridItems);
  });
});

  function closePopup() {
  if (expandedItem) collapseAlbumImage(); // put any zoomed image back first

  popupOverlay.classList.remove('is-open');
  popupOverlay.setAttribute('aria-hidden', 'true');
  openBtn.setAttribute('aria-expanded', 'false');
  document.body.classList.remove('album-popup-open'); // Restores normal UI
  }

  if (closeBtn) closeBtn.addEventListener('click', closePopup);
  if (backdrop) backdrop.addEventListener('click', closePopup);

  document.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape') return;

  if (expandedItem) {
    collapseAlbumImage();   // first Escape: shrink the image back into the wall
  } else if (popupOverlay.classList.contains('is-open')) {
    closePopup();           // second Escape: close the wall
  }
});

/*=========================================================================   
  ZOOM ANIMATION
========================================================================= */

const albumPopupItems = document.querySelectorAll('.album-popup-item');
const imageZoomBackdrop = document.getElementById('image-zoom-clone-backdrop');


let expandedItem = null;
let expandedPlaceholder = null;

function expandAlbumImage(item){
  if (expandedItem) return;
  expandedItem = item;

  const grid = document.getElementById('album-popup-grid');
  grid.style.overflowY = 'hidden'; // lock scroll while expanded

  const img = item.querySelector('img');
  const startRect = item.getBoundingClientRect();

  // Copy the grid sizing so the placeholder takes up the EXACT same grid cell
  const computedRowSpan = item.style.gridRowEnd;

  expandedPlaceholder = document.createElement('div');
  expandedPlaceholder.className = 'album-popup-item-placeholder';
  expandedPlaceholder.style.gridRowEnd = computedRowSpan;
  expandedPlaceholder.style.gridColumn = window.getComputedStyle(item).gridColumn;

  item.parentNode.insertBefore(expandedPlaceholder, item);
  document.body.appendChild(item);

  // ...rest unchanged
  // Pin the item at its exact starting screen position using transform, not top/left
  item.style.position = 'fixed';
  item.style.top = '0';
  item.style.left = '0';
  item.style.width = `${startRect.width}px`;
  item.style.height = `${startRect.height}px`;
  item.style.margin = '0';
  item.style.zIndex = '100001';
  item.style.transition = 'none';
  item.style.willChange = 'transform';
  item.style.transformOrigin = 'top left';
  item.style.transform = `translate(${startRect.left}px, ${startRect.top}px)`;

  if (img.naturalWidth && img.naturalHeight){
    item.style.aspectRatio = `${img.naturalWidth} / ${img.naturalHeight}`;
  }

  // force reflow so the browser registers the starting transform
  item.getBoundingClientRect();

  if (imageZoomBackdrop) imageZoomBackdrop.classList.add('active');

  requestAnimationFrame(() => {
    const targetWidth = Math.min(window.innerWidth * 0.85, 1000);
    const targetHeight = Math.min(window.innerHeight * 0.85, 750, targetWidth * (startRect.height / startRect.width));
    const finalWidth = Math.min(targetWidth, targetHeight * (startRect.width / startRect.height));
    const finalHeight = finalWidth * (startRect.height / startRect.width);

    const finalX = (window.innerWidth - finalWidth) / 2;
    const finalY = (window.innerHeight - finalHeight) / 2;
    const scaleX = finalWidth / startRect.width;
    const scaleY = finalHeight / startRect.height;

    item.style.transition = 'transform 0.5s cubic-bezier(0.22, 0.68, 0.28, 1)';
    item.style.transform = `translate(${finalX}px, ${finalY}px) scale(${scaleX}, ${scaleY})`;

    item.classList.add('is-expanded');
  });
}

function collapseAlbumImage(){
  if (!expandedItem) return;

  const item = expandedItem;
  expandedItem = null;

  const grid = document.getElementById('album-popup-grid');
  // grid.style.overflowY stays 'hidden' here — don't unlock yet

  const gridRect = grid.getBoundingClientRect();
  const endRect = expandedPlaceholder.getBoundingClientRect();

  item.classList.remove('is-expanded');

  item.style.transition = 'none';
  item.style.clipPath = 'inset(0px 0px 0px 0px)';
  item.getBoundingClientRect();

  requestAnimationFrame(() => {
    item.style.transition = 'transform 0.5s cubic-bezier(0.22, 0.68, 0.28, 1), clip-path 0.5s cubic-bezier(0.22, 0.68, 0.28, 1)';
    item.style.transform = `translate(${endRect.left}px, ${endRect.top}px)`;
    item.style.clipPath = `inset(
      ${Math.max(0, gridRect.top - endRect.top)}px
      ${Math.max(0, endRect.right - gridRect.right)}px
      ${Math.max(0, endRect.bottom - gridRect.bottom)}px
      ${Math.max(0, gridRect.left - endRect.left)}px
    )`;
  });

  if (imageZoomBackdrop) imageZoomBackdrop.classList.remove('active');

  item.addEventListener('transitionend', function handler(){
    item.removeEventListener('transitionend', handler);

    item.style.position = '';
    item.style.top = '';
    item.style.left = '';
    item.style.width = '';
    item.style.height = '';
    item.style.margin = '';
    item.style.transform = '';
    item.style.zIndex = '';
    item.style.transition = '';
    item.style.aspectRatio = '';
    item.style.willChange = '';
    item.style.transformOrigin = '';
    item.style.clipPath = '';

    expandedPlaceholder.parentNode.insertBefore(item, expandedPlaceholder);
    expandedPlaceholder.remove();
    expandedPlaceholder = null;

    grid.style.overflowY = ''; // unlock scroll now that collapse is fully done
  }, { once: true });
}


albumPopupItems.forEach(item => {
  item.addEventListener('click', (e) => {
    if (expandedItem === item){
      collapseAlbumImage();
    } else if (!expandedItem){
      e.stopPropagation();
      expandAlbumImage(item);
    }
    // if expandedItem is some OTHER item, ignore the click entirely (prevents opening a second image while one is already open)
  });
});

if (imageZoomBackdrop){
  imageZoomBackdrop.addEventListener('click', collapseAlbumImage);
}

function sizeAlbumGridItems() {
  const grid = document.getElementById('album-popup-grid');
  if (!grid) return;
  const rowHeight = 4; // must match grid-auto-rows value above
  const gap = 0;

  grid.querySelectorAll('.album-popup-item img').forEach(img => {
    const resize = () => {
      const item = img.closest('.album-popup-item');
      const rowSpan = Math.ceil((img.getBoundingClientRect().height + gap) / (rowHeight + gap)) + 1;
      item.style.gridRowEnd = 'span ' + rowSpan;
    };
    if (img.complete) resize();
    else img.addEventListener('load', resize);
  });
}

window.addEventListener('resize', sizeAlbumGridItems);
document.addEventListener('DOMContentLoaded', sizeAlbumGridItems);


/*=======================================================================
  SCROLL PROGRESS BAR
======================================================================= */

  const scrollDots =
    document.querySelectorAll(
      '.scroll-dot'
    );


  const dotSections =
    document.querySelectorAll(
      'main .section'
    );


  const dotsFill =
    document.getElementById(
      'scroll-dots-fill'
    );


  if (
    scrollDots.length &&
    dotSections.length
  ) {

    const dotObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting){
          const id = entry.target.getAttribute('id');
          scrollDots.forEach(dot => {
            dot.classList.toggle('active', dot.dataset.section === id);
          });
        }
      });
    }, {
      threshold: 0,
      rootMargin: '-45% 0px -45% 0px'
    });


    dotSections.forEach(
      section =>
        dotObserver.observe(
          section
        )
    );

  }



  if (
    dotsFill
  ) {

    function updateDotsFill() {

      const scrollTop =
        window.scrollY;


      const docHeight =
        document.documentElement
          .scrollHeight -
        window.innerHeight;


      const progress =
        docHeight >
        0

          ? (
              scrollTop /
              docHeight
            ) *
            100

          : 0;


      dotsFill.style.height =
        `${progress}%`;

    }


    window.addEventListener(
      'scroll',
      updateDotsFill,
      {
        passive:
          true
      }
    );


    window.addEventListener(
      'resize',
      updateDotsFill
    );


    updateDotsFill();

  }



  /* =======================================================================
     NUMBER COUNTERS
  ======================================================================= */

  const statNumbers =
    document.querySelectorAll(
      '.stat-number'
    );


  if (
    statNumbers.length
  ) {

    const statObserver =
      new IntersectionObserver(
        (entries) => {

          entries.forEach(
            entry => {

              if (
                entry.isIntersecting
              ) {

                const el =
                  entry.target;


                const target =
                  parseInt(
                    el.dataset.target,
                    10
                  );


                const duration =
                  1500;


                const startTime =
                  performance.now();



                function animateCount(
                  now
                ) {

                  const elapsed =
                    now -
                    startTime;


                  const progress =
                    Math.min(
                      elapsed /
                      duration,
                      1
                    );


                  const eased =
                    1 -
                    Math.pow(
                      1 -
                      progress,
                      3
                    );


                  el.textContent =
                    Math.floor(
                      eased *
                      target
                    );


                  if (
                    progress <
                    1
                  ) {

                    requestAnimationFrame(
                      animateCount
                    );

                  } else {

                    el.textContent =
                      target;

                  }

                }


                requestAnimationFrame(
                  animateCount
                );


                statObserver.unobserve(
                  el
                );

              }

            }
          );

        },
        {
          threshold:
            0.5
        }
      );


    statNumbers.forEach(
      el =>
        statObserver.observe(
          el
        )
    );

  }



  /* =======================================================================
     HORIZONTAL SCROLL TIMELINE
  ======================================================================= */

  const timelineWrap =
    document.getElementById(
      'timeline-wrap'
    );


  const timelineTrack =
    document.getElementById(
      'timeline-track'
    );


  if (
    timelineWrap &&
    timelineTrack
  ) {


    function positionTimelineLine() {

      const dots =
        document.querySelectorAll(
          '.timeline-dot'
        );


      const line =
        document.querySelector(
          '.timeline-line'
        );


      if (
        !dots.length ||
        !line
      ) {
        return;
      }


      const firstDot =
        dots[0];


      const lastDot =
        dots[
          dots.length -
          1
        ];


      const firstLeft =
        firstDot.offsetParent ===
        lastDot.offsetParent

          ? firstDot.parentElement.offsetLeft +
            firstDot.offsetLeft +
            firstDot.offsetWidth /
            2

          : 0;


      const lastLeft =
        lastDot.parentElement.offsetLeft +
        lastDot.offsetLeft +
        lastDot.offsetWidth /
        2;


      line.style.left =
        `${firstLeft}px`;


      line.style.width =
        `${lastLeft - firstLeft}px`;

    }


    positionTimelineLine();


    window.addEventListener(
      'resize',
      positionTimelineLine
    );



    let isDown =
      false;


    let startX;


    let scrollLeft;


    let rafId =
      null;



    timelineTrack.addEventListener(
      'mousedown',
      (e) => {

        isDown =
          true;


        startX =
          e.pageX -
          timelineTrack.offsetLeft;


        scrollLeft =
          timelineTrack.scrollLeft;

      }
    );


    window.addEventListener(
      'mouseup',
      () => {

        isDown =
          false;

      }
    );


    timelineTrack.addEventListener(
      'mousemove',
      (e) => {

        if (
          !isDown
        ) {
          return;
        }


        e.preventDefault();


        const x =
          e.pageX -
          timelineTrack.offsetLeft;


        const walk =
          (
            x -
            startX
          ) *
          1.5;


        if (
          rafId
        ) {

          cancelAnimationFrame(
            rafId
          );

        }


        rafId =
          requestAnimationFrame(
            () => {

              timelineTrack.scrollLeft =
                scrollLeft -
                walk;

            }
          );

      }
    );

  }



  /* =======================================================================
     CONTACT CARD FAN-OUT
  ======================================================================= */

  const cardFan =
    document.getElementById(
      'card-fan'
    );


  if (
    cardFan
  ) {

    const cards =
      Array.from(
        cardFan.querySelectorAll(
          '.fan-card'
        )
      );


    const cardFanObserver =
      new IntersectionObserver(
        (entries) => {

          entries.forEach(
            entry => {

              if (
                entry.isIntersecting
              ) {

                cardFan.classList.add(
                  'spread'
                );


                cardFanObserver.unobserve(
                  entry.target
                );

              }

            }
          );

        },
        {
          threshold:
            0.3
        }
      );


    cardFanObserver.observe(
      cardFan
    );



    cards.forEach(
      card => {

        card.addEventListener(
          'mouseenter',
          () => {

            const hoveredIndex =
              parseInt(
                card.dataset.i,
                10
              );


            cards.forEach(
              c => {

                const i =
                  parseInt(
                    c.dataset.i,
                    10
                  );


                const distance =
                  i -
                  hoveredIndex;


                if (
                  distance ===
                  0
                ) {

                  c.style.setProperty(
                    '--push',
                    '0px'
                  );

                } else {

                  const magnitude =
                    50 /
                    Math.sqrt(
                      Math.abs(
                        distance
                      )
                    );


                  const push =
                    distance >
                    0

                      ? magnitude

                      : -magnitude;


                  c.style.setProperty(
                    '--push',
                    `${push}px`
                  );

                }

              }
            );

          }
        );


        card.addEventListener(
          'mouseleave',
          () => {

            cards.forEach(
              c =>
                c.style.setProperty(
                  '--push',
                  '0px'
                )
            );

          }
        );

      }
    );
  }
  
  document.getElementById('substack-form').addEventListener('submit', function(e) {
  const btn = document.getElementById('subscribe-btn');
  const emailInput = this.querySelector('input[type="email"]');
  
  // Only trigger if email is valid and filled out
  if (emailInput.value.trim() !== '') {
    // Change button text to a checkmark and add greyed-out class
    btn.innerHTML = '✓';
    btn.classList.add('success-state');
    emailInput.disabled = true;
  }
});

}); // END DOMContentLoaded




/* =========================================================================
   SUBSTACK BLOG INTEGRATION
========================================================================= */


const SUBSTACK_RSS =
  'https://spacedorg.substack.com/feed';


const BLOG_CONTAINER =
  document.getElementById(
    'blog-container'
  );

async function fetchViaRss2Json() {
  const res = await fetch(
    'https://api.rss2json.com/v1/api.json?rss_url=' + encodeURIComponent(SUBSTACK_RSS)
  );
  if (!res.ok) throw new Error('rss2json HTTP ' + res.status);
  const data = await res.json();
  if (data.status && data.status !== 'ok') throw new Error('rss2json: ' + data.message);
  if (!data.items || !data.items.length) throw new Error('rss2json: no items');
  return data.items;
}

async function fetchViaProxy() {
  const res = await fetch('https://substackblog.niteesh-kumar.workers.dev');
  
  if (!res.ok) throw new Error('proxy HTTP ' + res.status);
  const xml = new DOMParser().parseFromString(await res.text(), 'text/xml');
  const items = [...xml.querySelectorAll('item')].map(item => ({
    title: item.querySelector('title')?.textContent || '',
    link: item.querySelector('link')?.textContent || '',
    pubDate: item.querySelector('pubDate')?.textContent || '',
    description: item.querySelector('description')?.textContent || '',
    thumbnail: item.querySelector('enclosure')?.getAttribute('url') || ''
  }));
  if (!items.length) throw new Error('proxy: no items');
  return items;
}

async function fetchSubstackItems() {
  try {
    return await fetchViaProxy();      // your Worker
  } catch (err) {
    console.warn('Worker failed, trying rss2json:', err);
    return await fetchViaRss2Json();
  }
}

async function loadSubstackPosts() {

  if (
    !BLOG_CONTAINER
  ) {

    return;

  }



  try {

    const items = await fetchSubstackItems();
    const latestPosts = items.slice(0, 3);

    BLOG_CONTAINER.innerHTML =
      latestPosts
        .map(
          createBlogCard
        )
        .join('');



  } catch (
    error
  ) {

    console.error(
      'SPACED Substack Error:',
      error
    );



    BLOG_CONTAINER.innerHTML = `

      <div
        class="blog-error"
      >

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



/* =========================================================================
   CREATE BLOG CARD
========================================================================= */


function createBlogCard(
  post
) {

  const image =
    post.thumbnail ||
    post.enclosure?.link ||
    '';


  const date =
    new Date(
      post.pubDate
    ).toLocaleDateString(
      'en-US',
      {
        year:
          'numeric',

        month:
          'short',

        day:
          'numeric'
      }
    );


  const description =
    stripHTML(
      post.description ||
      ''
    );


  const shortDescription =
    description.length >
    140

      ? description.substring(
          0,
          140
        ) +
        '...'

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

            <div
              class="blog-card-image"
            >

              <img
                src="${image}"
                alt=""
                loading="lazy"
              >

            </div>

          `
          : ''
      }


      <div
        class="blog-card-content"
      >

        <span
          class="blog-card-date"
        >
          ${date}
        </span>


        <h3>
          ${escapeHTML(
            post.title
          )}
        </h3>


        <p>
          ${escapeHTML(
            shortDescription
          )}
        </p>


        <span
          class="blog-read"
        >
          Read on Substack →
        </span>

      </div>

    </a>

  `;

}



/* =========================================================================
   REMOVE HTML FROM SUBSTACK DESCRIPTION
========================================================================= */


function stripHTML(
  html
) {

  const temporaryElement =
    document.createElement(
      'div'
    );


  temporaryElement.innerHTML =
    html;


  return (
    temporaryElement.textContent ||
    temporaryElement.innerText ||
    ''
  );

}



/* =========================================================================
   ESCAPE HTML
========================================================================= */


function escapeHTML(
  text
) {

  const element =
    document.createElement(
      'div'
    );


  element.textContent =
    text;


  return element.innerHTML;

}



/* =========================================================================
   START SUBSTACK BLOG
========================================================================= */


loadSubstackPosts();