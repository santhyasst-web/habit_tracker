/* ===========================
   NAV SCROLL
=========================== */
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 40);
}, { passive: true });

/* ===========================
   THREE.JS HERO — HUMANOID + SCENE
=========================== */
(function initHero3D() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas || typeof THREE === 'undefined') return;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.setClearColor(0x1a0005, 1);

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x1a0005, 0.055);

  const camera = new THREE.PerspectiveCamera(52, 1, 0.1, 80);
  camera.position.set(0, 0.4, 7);

  function resize() {
    const w = canvas.parentElement.clientWidth;
    const h = canvas.parentElement.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  resize();
  window.addEventListener('resize', resize);

  // ---- LIGHTING ----
  scene.add(new THREE.AmbientLight(0xfff0e8, 0.5));

  const keyLight = new THREE.DirectionalLight(0xffffff, 1.0);
  keyLight.position.set(4, 6, 5);
  keyLight.castShadow = true;
  scene.add(keyLight);

  const redFill = new THREE.PointLight(0xC8102E, 5, 14);
  redFill.position.set(-2, 2, 3);
  scene.add(redFill);

  const backLight = new THREE.PointLight(0x8B0000, 2, 10);
  backLight.position.set(3, 1, -3);
  scene.add(backLight);

  const rimLight = new THREE.PointLight(0xffddcc, 2, 8);
  rimLight.position.set(4, 3, 2);
  scene.add(rimLight);

  // ---- MATERIALS ----
  const M = (color, shine, emissive, emInt) => new THREE.MeshPhongMaterial({
    color, shininess: shine || 60,
    emissive: emissive || 0x000000,
    emissiveIntensity: emInt || 0
  });

  const skinMat  = M(0xF5C8A0, 55);
  const suitMat  = M(0x140003, 30);
  const redAccent= M(0xC8102E, 90);
  const whiteMat = M(0xF8F5F0, 50);
  const hairMat  = M(0x1C0E08, 70);
  const eyeWhite = M(0xFFFFFF, 120);
  const irisMat  = M(0xC8102E, 150, 0xC8102E, 0.6);
  const pupilMat = M(0x080000, 200);
  const phoneMat = M(0x0a0a0a, 200);
  const screenMat= M(0xC8102E, 80, 0xC8102E, 1.0);
  const lipMat   = M(0xC06060, 40);

  // ---- HUMANOID ----
  const humanoid = new THREE.Group();
  // position right-of-center, visible from waist up
  humanoid.position.set(2.4, -1.8, 0.2);

  // Helper: quick mesh
  const mk = (geo, mat) => { const m = new THREE.Mesh(geo, mat); m.castShadow = true; return m; };

  // === TORSO ===
  const torsoGroup = new THREE.Group();
  torsoGroup.position.y = 0;
  humanoid.add(torsoGroup);

  const torso = mk(new THREE.BoxGeometry(0.72, 0.86, 0.40), suitMat);
  torsoGroup.add(torso);

  // Shirt front panel
  const shirt = mk(new THREE.BoxGeometry(0.24, 0.62, 0.42), whiteMat);
  torsoGroup.add(shirt);

  // Tie
  const tie = mk(new THREE.BoxGeometry(0.072, 0.48, 0.43), redAccent);
  tie.position.y = -0.07;
  torsoGroup.add(tie);

  // Belt
  const belt = mk(new THREE.BoxGeometry(0.74, 0.065, 0.42), redAccent);
  belt.position.y = -0.41;
  torsoGroup.add(belt);

  // Suit lapels
  [-0.16, 0.16].forEach(x => {
    const lapel = mk(new THREE.BoxGeometry(0.1, 0.3, 0.42), suitMat);
    lapel.position.set(x, 0.18, 0);
    lapel.rotation.z = x < 0 ? 0.3 : -0.3;
    torsoGroup.add(lapel);
  });

  // === NECK ===
  const neck = mk(new THREE.CylinderGeometry(0.1, 0.13, 0.22, 20), skinMat);
  neck.position.y = 0.54;
  humanoid.add(neck);

  // === HEAD GROUP (rotates to track mouse) ===
  const headGroup = new THREE.Group();
  headGroup.position.y = 0.82;
  humanoid.add(headGroup);

  // Head
  const head = mk(new THREE.SphereGeometry(0.315, 48, 48), skinMat);
  headGroup.add(head);

  // Hair (top hemisphere)
  const hairDome = mk(new THREE.SphereGeometry(0.322, 32, 32, 0, Math.PI*2, 0, Math.PI*0.52), hairMat);
  hairDome.position.y = 0.02;
  headGroup.add(hairDome);

  // Side hair strips for fuller look
  [-1,1].forEach(side => {
    const sideHair = mk(new THREE.BoxGeometry(0.08, 0.18, 0.28), hairMat);
    sideHair.position.set(side * 0.29, 0.06, -0.06);
    headGroup.add(sideHair);
  });

  // Ears
  [-1, 1].forEach(side => {
    const ear = mk(new THREE.SphereGeometry(0.075, 16, 16), skinMat);
    ear.scale.set(0.55, 0.82, 0.48);
    ear.position.set(side * 0.315, 0.01, 0);
    headGroup.add(ear);
  });

  // === EYES ===
  // Eye whites
  const eyeWL = mk(new THREE.SphereGeometry(0.08, 24, 24), eyeWhite);
  eyeWL.scale.set(1, 0.82, 0.68);
  eyeWL.position.set(-0.105, 0.065, 0.268);
  headGroup.add(eyeWL);

  const eyeWR = mk(new THREE.SphereGeometry(0.08, 24, 24), eyeWhite);
  eyeWR.scale.set(1, 0.82, 0.68);
  eyeWR.position.set(0.105, 0.065, 0.268);
  headGroup.add(eyeWR);

  // Irises (colored, red glow)
  const irisL = mk(new THREE.SphereGeometry(0.047, 20, 20), irisMat);
  irisL.position.set(-0.105, 0.065, 0.31);
  headGroup.add(irisL);

  const irisR = mk(new THREE.SphereGeometry(0.047, 20, 20), irisMat);
  irisR.position.set(0.105, 0.065, 0.31);
  headGroup.add(irisR);

  // Pupils (move to track mouse)
  const pupilL = mk(new THREE.SphereGeometry(0.027, 16, 16), pupilMat);
  pupilL.position.set(-0.105, 0.065, 0.338);
  headGroup.add(pupilL);

  const pupilR = mk(new THREE.SphereGeometry(0.027, 16, 16), pupilMat);
  pupilR.position.set(0.105, 0.065, 0.338);
  headGroup.add(pupilR);

  // Store base positions for offset calculation
  const pupilLBase = pupilL.position.clone();
  const pupilRBase = pupilR.position.clone();
  const irisLBase  = irisL.position.clone();
  const irisRBase  = irisR.position.clone();

  // Eyelids (top)
  [-0.105, 0.105].forEach(x => {
    const lid = mk(new THREE.SphereGeometry(0.082, 24, 12, 0, Math.PI*2, 0, Math.PI*0.4), suitMat);
    lid.position.set(x, 0.09, 0.265);
    lid.rotation.x = 0.3;
    headGroup.add(lid);
  });

  // Eyebrows
  [-0.105, 0.105].forEach((x, i) => {
    const brow = mk(new THREE.BoxGeometry(0.105, 0.022, 0.022), hairMat);
    brow.position.set(x, 0.175, 0.282);
    brow.rotation.z = i === 0 ? 0.12 : -0.12;
    headGroup.add(brow);
  });

  // Nose
  const nose = mk(new THREE.SphereGeometry(0.038, 16, 16), skinMat);
  nose.scale.set(0.65, 0.75, 1.1);
  nose.position.set(0, -0.028, 0.302);
  headGroup.add(nose);

  // Nose tip (nostrils shape)
  [-0.032, 0.032].forEach(x => {
    const nostril = mk(new THREE.SphereGeometry(0.022, 12, 12), skinMat);
    nostril.position.set(x, -0.06, 0.292);
    headGroup.add(nostril);
  });

  // Mouth / smile
  const smileCurve = mk(
    new THREE.TorusGeometry(0.072, 0.013, 8, 24, Math.PI * 0.62),
    lipMat
  );
  smileCurve.position.set(0, -0.12, 0.288);
  smileCurve.rotation.z = Math.PI;
  smileCurve.rotation.x = -0.25;
  headGroup.add(smileCurve);

  // Chin definition
  const chin = mk(new THREE.SphereGeometry(0.09, 16, 16), skinMat);
  chin.scale.set(0.85, 0.55, 0.7);
  chin.position.set(0, -0.27, 0.14);
  headGroup.add(chin);

  // === LEFT ARM (relaxed at side) ===
  const leftArmGroup = new THREE.Group();
  leftArmGroup.position.set(-0.43, 0.28, 0);
  humanoid.add(leftArmGroup);

  const leftUA = mk(new THREE.CylinderGeometry(0.092, 0.082, 0.44, 16), suitMat);
  leftUA.position.set(-0.05, -0.22, 0);
  leftUA.rotation.z = 0.12;
  leftArmGroup.add(leftUA);

  const leftFA = mk(new THREE.CylinderGeometry(0.072, 0.068, 0.40, 16), skinMat);
  leftFA.position.set(-0.09, -0.62, 0);
  leftFA.rotation.z = 0.1;
  leftArmGroup.add(leftFA);

  const leftHand = mk(new THREE.SphereGeometry(0.092, 20, 20), skinMat);
  leftHand.scale.set(0.88, 0.68, 0.80);
  leftHand.position.set(-0.11, -0.855, 0);
  leftArmGroup.add(leftHand);

  // === RIGHT ARM (raised — holding phone to ear) ===
  const rightArmGroup = new THREE.Group();
  rightArmGroup.position.set(0.43, 0.28, 0);
  humanoid.add(rightArmGroup);

  // Upper arm: rotated up and outward
  const rightUA = mk(new THREE.CylinderGeometry(0.092, 0.082, 0.44, 16), suitMat);
  rightUA.rotation.z = -Math.PI * 0.58;
  rightUA.position.set(0.23, 0.22, 0);
  rightArmGroup.add(rightUA);

  // Forearm: bent toward head/ear
  const rightFA = mk(new THREE.CylinderGeometry(0.072, 0.068, 0.40, 16), skinMat);
  rightFA.rotation.z = -Math.PI * 0.92;
  rightFA.rotation.y = 0.22;
  rightFA.position.set(0.46, 0.40, 0.12);
  rightArmGroup.add(rightFA);

  // Right hand at ear
  const rightHand = mk(new THREE.SphereGeometry(0.092, 20, 20), skinMat);
  rightHand.scale.set(0.88, 0.68, 0.80);
  rightHand.position.set(0.57, 0.40, 0.22);
  rightArmGroup.add(rightHand);

  // === PHONE in right hand ===
  const phoneGroup = new THREE.Group();
  phoneGroup.position.set(0.56, 0.42, 0.28);
  phoneGroup.rotation.z = -0.55;
  phoneGroup.rotation.y = 0.35;
  phoneGroup.rotation.x = 0.15;

  const phoneBody = mk(new THREE.BoxGeometry(0.105, 0.215, 0.028), phoneMat);
  phoneGroup.add(phoneBody);

  const phoneScreen = mk(new THREE.BoxGeometry(0.085, 0.17, 0.030), screenMat);
  phoneGroup.add(phoneScreen);

  // Rounded phone edges (small cylinders)
  [[0,0.107,0],[0,-0.107,0]].forEach(([x,y,z]) => {
    const edge = mk(new THREE.CylinderGeometry(0.014, 0.014, 0.105, 12), phoneMat);
    edge.rotation.z = Math.PI/2;
    edge.position.set(x, y, z);
    phoneGroup.add(edge);
  });

  // Phone glow light
  const phoneGlow = new THREE.PointLight(0xC8102E, 1.2, 1.2);
  phoneGlow.position.set(0, 0, 0.04);
  phoneGroup.add(phoneGlow);

  rightArmGroup.add(phoneGroup);

  // === SHADOW PLANE ===
  const shadowGeo = new THREE.PlaneGeometry(3, 3);
  const shadowMat = new THREE.MeshBasicMaterial({ color: 0x0d0002, transparent: true, opacity: 0.3 });
  const shadowPlane = new THREE.Mesh(shadowGeo, shadowMat);
  shadowPlane.rotation.x = -Math.PI / 2;
  shadowPlane.position.set(2.4, -2.6, 0.2);
  scene.add(shadowPlane);

  scene.add(humanoid);

  // ---- BACKGROUND PARTICLES ----
  const count = 380;
  const pPos = new Float32Array(count * 3);
  for (let i = 0; i < count * 3; i++) pPos[i] = (Math.random() - 0.5) * 20;
  const pBuf = new THREE.BufferGeometry();
  pBuf.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  scene.add(new THREE.Points(pBuf, new THREE.PointsMaterial({
    color: 0xC8102E, size: 0.04, transparent: true, opacity: 0.38
  })));

  // ---- RINGS ----
  function mkRing(r, tube, color, opacity, rx, ry, rz) {
    const m = new THREE.Mesh(
      new THREE.TorusGeometry(r, tube, 8, 90),
      new THREE.MeshBasicMaterial({ color, transparent: true, opacity })
    );
    if (rx) m.rotation.x = rx;
    if (ry) m.rotation.y = ry;
    if (rz) m.rotation.z = rz;
    return m;
  }
  const ring1 = mkRing(3.2, 0.012, 0xC8102E, 0.13, Math.PI/2.4);
  scene.add(ring1);
  const ring2 = mkRing(4.8, 0.008, 0x8B0000, 0.09, Math.PI/3, 0, Math.PI/5);
  scene.add(ring2);
  const ring3 = mkRing(6.5, 0.006, 0xC8102E, 0.05, Math.PI/2, Math.PI/7);
  scene.add(ring3);

  // ---- GROUND GRID ----
  const gridHelper = new THREE.GridHelper(20, 24, 0x3D0008, 0x1A0005);
  gridHelper.position.y = -2.6;
  scene.add(gridHelper);

  // ---- MOUSE ----
  let mx = 0, my = 0;
  document.addEventListener('mousemove', e => {
    mx = (e.clientX / window.innerWidth  - 0.5) * 2;
    my = (e.clientY / window.innerHeight - 0.5) * 2;
  }, { passive: true });

  // ---- BLINK STATE ----
  let blinkTimer = 0, blinkDuration = 0, nextBlink = 3 + Math.random() * 4;

  // ---- ANIMATE ----
  let t = 0;
  function animate() {
    requestAnimationFrame(animate);
    t += 0.008;

    // --- Idle body bob + slight sway ---
    humanoid.position.y = -1.8 + Math.sin(t * 0.75) * 0.035;
    humanoid.rotation.y = Math.sin(t * 0.35) * 0.04;

    // --- Head tracks mouse ---
    const targetRotY = mx * 0.38;
    const targetRotX = -my * 0.20;
    headGroup.rotation.y += (targetRotY - headGroup.rotation.y) * 0.07;
    headGroup.rotation.x += (targetRotX - headGroup.rotation.x) * 0.07;

    // --- Pupil / iris tracking ---
    // mx, my are in -1..1 screen NDC
    const maxPupil = 0.031;
    const maxIris  = 0.022;

    pupilL.position.x = pupilLBase.x + mx * maxPupil;
    pupilL.position.y = pupilLBase.y - my * maxPupil;
    pupilR.position.x = pupilRBase.x + mx * maxPupil;
    pupilR.position.y = pupilRBase.y - my * maxPupil;
    irisL.position.x  = irisLBase.x  + mx * maxIris;
    irisL.position.y  = irisLBase.y  - my * maxIris;
    irisR.position.x  = irisRBase.x  + mx * maxIris;
    irisR.position.y  = irisRBase.y  - my * maxIris;

    // --- Blinking ---
    blinkTimer += 0.008;
    if (blinkTimer > nextBlink) {
      blinkDuration = 0.15;
      blinkTimer = 0;
      nextBlink = 2.5 + Math.random() * 5;
    }
    if (blinkDuration > 0) {
      blinkDuration -= 0.008;
      const close = Math.max(0, Math.sin((0.15 - blinkDuration) / 0.15 * Math.PI));
      eyeWL.scale.y = 0.82 - close * 0.75;
      eyeWR.scale.y = 0.82 - close * 0.75;
    } else {
      eyeWL.scale.y = 0.82;
      eyeWR.scale.y = 0.82;
    }

    // --- Eyebrow subtle raise when looking up ---
    const browRaise = Math.max(0, -my) * 0.018;
    headGroup.children.forEach(c => {
      if (c.geometry && c.geometry.parameters && c.geometry.parameters.width === 0.105) {
        // eyebrow
        c.position.y = 0.175 + browRaise;
      }
    });

    // --- Phone arm gentle sway ---
    rightArmGroup.rotation.z = Math.sin(t * 0.55) * 0.045;
    rightArmGroup.rotation.x = Math.sin(t * 0.38) * 0.025;

    // --- Left arm slight swing ---
    leftArmGroup.rotation.x = Math.sin(t * 0.55) * 0.03;

    // --- Rings ---
    ring1.rotation.z += 0.0008;
    ring2.rotation.y += 0.0005;
    ring3.rotation.x += 0.0003;
    ring3.rotation.z += 0.0004;

    // --- Lights ---
    redFill.intensity = 4.5 + Math.sin(t * 1.1) * 0.8;
    redFill.position.x = -2 + Math.sin(t * 0.4) * 0.5;
    phoneGlow.intensity = 1.0 + Math.sin(t * 2.2) * 0.4;

    // --- Camera subtle parallax ---
    camera.position.x += (mx * 0.12 - camera.position.x) * 0.025;
    camera.position.y += (-my * 0.08 + 0.4 - camera.position.y) * 0.025;
    camera.lookAt(0.5, 0, 0);

    renderer.render(scene, camera);
  }
  animate();
})();

/* ===========================
   SCROLL REVEAL
=========================== */
const revealEls = document.querySelectorAll('.reveal, .reveal-3d');
const revealObs = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObs.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });
revealEls.forEach(el => revealObs.observe(el));

/* ===========================
   COUNTER ANIMATION
=========================== */
function animateCounter(el) {
  const target = parseInt(el.dataset.target, 10);
  const prefix = el.dataset.prefix || '';
  const suffix = el.dataset.suffix || '';
  const dur    = 1800;
  const start  = performance.now();
  const run = now => {
    const p = Math.min((now - start) / dur, 1);
    const e = 1 - Math.pow(1 - p, 3);
    el.textContent = prefix + Math.round(e * target) + suffix;
    if (p < 1) requestAnimationFrame(run);
  };
  requestAnimationFrame(run);
}
const cntObs = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.querySelectorAll('[data-target]').forEach(animateCounter);
      cntObs.unobserve(entry.target);
    }
  });
}, { threshold: 0.3 });
document.querySelectorAll('.stats-grid').forEach(el => cntObs.observe(el));

/* ===========================
   3D CARD TILT
=========================== */
document.querySelectorAll('.tia-card, .founding-benefit').forEach(card => {
  card.addEventListener('mousemove', e => {
    const r = card.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width  - 0.5;
    const y = (e.clientY - r.top)  / r.height - 0.5;
    card.style.transform = `perspective(700px) rotateX(${-y*10}deg) rotateY(${x*10}deg) translateZ(10px)`;
  });
  card.addEventListener('mouseleave', () => { card.style.transform = ''; });
});

/* ===========================
   DEMO TRANSCRIPT LOOP
=========================== */
function loopTranscript() {
  document.querySelectorAll('.t-line').forEach((l, i) => {
    l.style.opacity = '0';
    l.style.animation = 'none';
    void l.offsetWidth;
    l.style.animation = '';
    l.style.animationDelay = (0.3 + i * 0.9) + 's';
    l.style.animationFillMode = 'forwards';
  });
}
loopTranscript();
setInterval(loopTranscript, 10000);

/* ===========================
   PARALLAX HERO TITLE
=========================== */
const heroTitle = document.querySelector('.hero-title');
window.addEventListener('scroll', () => {
  if (heroTitle) heroTitle.style.transform = `translateY(${window.scrollY * 0.14}px)`;
}, { passive: true });

/* ===========================
   FAQ ACCORDION
=========================== */
document.querySelectorAll('.faq-question').forEach(btn => {
  btn.addEventListener('click', () => {
    const isOpen = btn.getAttribute('aria-expanded') === 'true';
    // Close all
    document.querySelectorAll('.faq-question').forEach(b => {
      b.setAttribute('aria-expanded', 'false');
      b.nextElementSibling.classList.remove('open');
    });
    // Open clicked if it was closed
    if (!isOpen) {
      btn.setAttribute('aria-expanded', 'true');
      btn.nextElementSibling.classList.add('open');
    }
  });
});

/* ===========================
   RE-OBSERVE NEW REVEAL ELS
=========================== */
document.querySelectorAll('.reveal, .reveal-3d').forEach(el => {
  if (!el.classList.contains('visible')) revealObs.observe(el);
});
