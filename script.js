// ============================================================
// TECHFEST 2026 — BEYOND THE SURFACE  |  main.js  FINAL
// Ocean-themed 3D engine: particles, tendrils, jellyfish, manta,
// kelp forest, jellyfish swarm, thermal vents, aurora curtain,
// constellation, opening cinematic intro, scroll-reactive camera
// ============================================================

// ── CORE SCENE SETUP ──────────────────────────────────────────
const canvas   = document.getElementById('bg-canvas');
const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);

const scene  = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 500);
camera.position.z = 40;

let speedMultiplier = 1.0;
let mouseX = 0, mouseY = 0, tX = 0, tY = 0;
let scrollProgress = 0; // 0 to 1, used to drive scroll-based 3D motion

// ── 1. BIO-PARTICLE FIELD ──────────────────────────────────────
const pGeo = new THREE.BufferGeometry();
const PC   = 7000;
const pPos = new Float32Array(PC * 3);
const pCol = new Float32Array(PC * 3);
for (let i = 0; i < PC; i++) {
  pPos[i*3]   = (Math.random() - 0.5) * 140;
  pPos[i*3+1] = (Math.random() - 0.5) * 90;
  pPos[i*3+2] = (Math.random() - 0.5) * 90;
  const t = Math.random();
  if      (t < 0.55) { pCol[i*3]=0;   pCol[i*3+1]=0.7+Math.random()*.3; pCol[i*3+2]=1;   }
  else if (t < 0.75) { pCol[i*3]=0;   pCol[i*3+1]=1;   pCol[i*3+2]=0.6+Math.random()*.4; }
  else if (t < 0.88) { pCol[i*3]=0.2; pCol[i*3+1]=0.5; pCol[i*3+2]=1;   }
  else               { pCol[i*3]=1;   pCol[i*3+1]=0.07; pCol[i*3+2]=0.4; }
}
pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
pGeo.setAttribute('color',    new THREE.BufferAttribute(pCol, 3));
const particles = new THREE.Points(pGeo,
  new THREE.PointsMaterial({ vertexColors: true, size: 0.2, sizeAttenuation: true }));
scene.add(particles);

// ── 2. NEURAL TENDRILS ─────────────────────────────────────────
const tendrils = [];
function spawnTendril(ox, oy, oz, color = 0x00c8ff) {
  const pts = [];
  let x = ox, y = oy, z = oz;
  for (let i = 0; i < 13; i++) {
    pts.push(new THREE.Vector3(x, y, z));
    x += (Math.random() - 0.5) * 7;
    y += (Math.random() - 0.5) * 5;
    z += (Math.random() - 0.5) * 4;
  }
  const geo = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 32, 0.04, 5, false);
  const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.08 + Math.random() * 0.18 });
  const mesh = new THREE.Mesh(geo, mat);
  scene.add(mesh);
  tendrils.push({ mesh, phase: Math.random() * Math.PI * 2, speed: 0.003 + Math.random() * 0.005 });
}
for (let i = 0; i < 38; i++) {
  spawnTendril(
    (Math.random() - 0.5) * 45,
    (Math.random() - 0.5) * 28,
    (Math.random() - 0.5) * 22,
    Math.random() > 0.5 ? 0x00c8ff : 0x00ffcc
  );
}

// ── 3. JELLYFISH ORB (hero centerpiece) ────────────────────────
const jelly = new THREE.Mesh(
  new THREE.SphereGeometry(3, 32, 32),
  new THREE.MeshBasicMaterial({ color: 0x003355, transparent: true, opacity: 0.45 })
);
jelly.position.set(15, 2, -12);
scene.add(jelly);

const jellyShell = new THREE.Mesh(
  new THREE.SphereGeometry(3.1, 18, 18),
  new THREE.MeshBasicMaterial({ color: 0x00c8ff, wireframe: true, transparent: true, opacity: 0.1 })
);
jellyShell.position.copy(jelly.position);
scene.add(jellyShell);

for (let i = 0; i < 10; i++) {
  const angle = (i / 10) * Math.PI * 2;
  const pts = [];
  let cx = jelly.position.x + Math.cos(angle) * 3;
  let cy = jelly.position.y - 3;
  let cz = jelly.position.z + Math.sin(angle) * 2;
  for (let j = 0; j < 12; j++) {
    pts.push(new THREE.Vector3(cx, cy, cz));
    cx += Math.cos(angle) * 0.3 + (Math.random() - 0.5) * 1.2;
    cy -= 1 + Math.random() * 0.8;
    cz += Math.sin(angle) * 0.3 + (Math.random() - 0.5) * 0.8;
  }
  scene.add(new THREE.Mesh(
    new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 24, 0.03, 5, false),
    new THREE.MeshBasicMaterial({ color: 0x00c8ff, transparent: true, opacity: 0.22 })
  ));
}

// ── 4. SONAR RINGS ──────────────────────────────────────────────
const sonarRings = [];
for (let i = 0; i < 6; i++) {
  const g = new THREE.RingGeometry(0.1, 0.18, 80);
  const m = new THREE.MeshBasicMaterial({ color: 0x00c8ff, transparent: true, opacity: 0, side: THREE.DoubleSide });
  const mesh = new THREE.Mesh(g, m);
  mesh.position.set(10, 0, -5);
  mesh.rotation.x = Math.PI / 2;
  scene.add(mesh);
  sonarRings.push({ mesh, phase: i / 6 });
}

// ── 5. MANTA RAY 3D MODEL ────────────────────────────────────────
function buildMantaRay() {
  const ray = new THREE.Group();
  const bodyGeo = new THREE.SphereGeometry(1, 16, 10);
  bodyGeo.scale(3.5, 0.35, 1.5);
  ray.add(new THREE.Mesh(bodyGeo, new THREE.MeshBasicMaterial({ color: 0x003a55, transparent: true, opacity: 0.85 })));
  ray.add(new THREE.Mesh(bodyGeo, new THREE.MeshBasicMaterial({ color: 0x00c8ff, wireframe: true, transparent: true, opacity: 0.18 })));

  function makeWing(side) {
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.bezierCurveTo(side*2, 0.5, side*5, 1.5, side*7, 0.2);
    shape.bezierCurveTo(side*6, -0.3, side*4, -1.2, side*2, -0.8);
    shape.lineTo(0, 0);
    const m = new THREE.Mesh(
      new THREE.ShapeGeometry(shape, 24),
      new THREE.MeshBasicMaterial({ color: 0x004466, transparent: true, opacity: 0.7, side: THREE.DoubleSide })
    );
    m.rotation.x = Math.PI / 2;
    m.position.y = 0.02;
    return m;
  }
  const wingL = makeWing(-1);
  const wingR = makeWing(1);
  ray.add(wingL, wingR);

  function makeEdge(side) {
    const pts = [
      new THREE.Vector3(0,0,0), new THREE.Vector3(side*3,0,0.6),
      new THREE.Vector3(side*6,0,0.1), new THREE.Vector3(side*7,0,0.2)
    ];
    return new THREE.Mesh(
      new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 20, 0.025, 5, false),
      new THREE.MeshBasicMaterial({ color: 0x00c8ff, transparent: true, opacity: 0.55 })
    );
  }
  ray.add(makeEdge(-1), makeEdge(1));

  const tailPts = [
    new THREE.Vector3(0,0,0), new THREE.Vector3(0.3,0,1.2),
    new THREE.Vector3(0.1,0,2.4), new THREE.Vector3(0.4,0,4)
  ];
  const tail = new THREE.Mesh(
    new THREE.TubeGeometry(new THREE.CatmullRomCurve3(tailPts), 20, 0.07, 5, false),
    new THREE.MeshBasicMaterial({ color: 0x00c8ff, transparent: true, opacity: 0.4 })
  );
  tail.position.z = 1.4;
  ray.add(tail);

  function makeFin(side) {
    const pts = [
      new THREE.Vector3(0,0,0), new THREE.Vector3(side*0.8,0.1,-0.8),
      new THREE.Vector3(side*1.4,0,-1.6)
    ];
    return new THREE.Mesh(
      new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 12, 0.06, 5, false),
      new THREE.MeshBasicMaterial({ color: 0x00ffcc, transparent: true, opacity: 0.5 })
    );
  }
  ray.add(makeFin(-1), makeFin(1));

  for (let i = 0; i < 12; i++) {
    const dot = new THREE.Mesh(
      new THREE.SphereGeometry(0.06, 6, 6),
      new THREE.MeshBasicMaterial({ color: 0x00ffcc, transparent: true, opacity: 0.7 })
    );
    dot.position.set((Math.random()-0.5)*4, 0.36, (Math.random()-0.5)*1.5);
    ray.add(dot);
  }

  ray.position.set(-18, 3, -6);
  ray.scale.set(1.4, 1.4, 1.4);
  scene.add(ray);
  return { ray, wingL, wingR };
}
const { ray: mantaRay, wingL, wingR } = buildMantaRay();

// ── 6. KELP FOREST (ocean-themed — replaces any generic geometry) ─
function buildKelpForest() {
  const group = new THREE.Group();
  const strands = [];

  // Anchor depth — matches the ocean-floor GridHelper at y = -18
  const FLOOR_Y = -17.5;
  const RISE    = 34; // how tall each strand grows from the floor

  for (let k = 0; k < 7; k++) {
    const pts = [];
    const baseX = -30 + k * 4 + (Math.random()-0.5)*2;
    const baseZ = -10 + (Math.random()-0.5)*6;

    for (let i = 0; i < 30; i++) {
      const frac = i / 29;
      pts.push(new THREE.Vector3(
        baseX + Math.sin(frac * Math.PI * 3 + k) * (1.5 * frac),
        FLOOR_Y + frac * RISE,
        baseZ + Math.cos(frac * Math.PI * 2 + k * 0.7) * (frac * 2)
      ));
    }

    // Root anchor — small dark holdfast disc right at the ocean floor
    const holdfast = new THREE.Mesh(
      new THREE.SphereGeometry(0.35, 8, 6),
      new THREE.MeshBasicMaterial({ color: 0x002233, transparent: true, opacity: 0.5 })
    );
    holdfast.position.copy(pts[0]);
    group.add(holdfast);

    const curve = new THREE.CatmullRomCurve3(pts);
    // Stalk now reads as a DARK SILHOUETTE rather than a glowing tube —
    // this is what makes it look like real kelp instead of neon decor
    const stalk = new THREE.Mesh(
      new THREE.TubeGeometry(curve, 60, 0.1 + Math.random()*0.06, 6, false),
      new THREE.MeshBasicMaterial({
        color: 0x012233,
        transparent: true,
        opacity: 0.55 + Math.random() * 0.15
      })
    );
    group.add(stalk);

    // Thin bioluminescent edge-line traced along the stalk (very subtle)
    const edgeLine = new THREE.Mesh(
      new THREE.TubeGeometry(curve, 60, 0.02, 4, false),
      new THREE.MeshBasicMaterial({
        color: k % 2 === 0 ? 0x00c8ff : 0x00ffcc,
        transparent: true,
        opacity: 0.18
      })
    );
    group.add(edgeLine);

    const fronds = [];
    for (let f = 5; f < 28; f += 4) {
      const frac = f / 29;
      const base = pts[f];
      const side = (Math.random() > 0.5 ? 1 : -1);
      const frondPts = [
        base.clone(),
        new THREE.Vector3(base.x + side*2, base.y + 1.5, base.z + (Math.random()-0.5)),
        new THREE.Vector3(base.x + side*3.5, base.y + 2.2, base.z + (Math.random()-0.5)*0.5)
      ];
      // Fronds also dimmed to silhouette — dark base, no longer bright cyan/teal sheets
      const frond = new THREE.Mesh(
        new THREE.TubeGeometry(new THREE.CatmullRomCurve3(frondPts), 10, 0.045, 4, false),
        new THREE.MeshBasicMaterial({ color: 0x012233, transparent: true, opacity: 0.4 + Math.random() * 0.15 })
      );
      group.add(frond);
      fronds.push(frond);
    }

    // Scattered bioluminescent nodes along the stalk (sparse glowing dots,
    // like real bioluminescent plankton clinging to kelp in the dark)
    const bioNodes = [];
    for (let n = 0; n < 5; n++) {
      const idx = 4 + Math.floor(Math.random() * 22);
      const p   = pts[idx];
      const dot = new THREE.Mesh(
        new THREE.SphereGeometry(0.06, 6, 6),
        new THREE.MeshBasicMaterial({ color: 0x00ffcc, transparent: true, opacity: 0.7 })
      );
      dot.position.copy(p);
      group.add(dot);
      bioNodes.push(dot);
    }

    // Tip stays the brightest point — the "growing point" glow
    const tip = pts[pts.length - 1];
    const tipGlow = new THREE.Mesh(
      new THREE.SphereGeometry(0.18, 7, 7),
      new THREE.MeshBasicMaterial({ color: 0x00ffcc, transparent: true, opacity: 0.85 })
    );
    tipGlow.position.copy(tip);
    group.add(tipGlow);

    strands.push({ stalk, edgeLine, fronds, bioNodes, tipGlow, phase: k });
  }

  group.position.set(-2, 0, -6);
  scene.add(group);
  return { group, strands };
}
const kelpForest = buildKelpForest();

// ── 7. JELLYFISH SWARM (replaces abstract energy-grid) ─────────
function buildJellyfishSwarm() {
  const swarm = [];
  const positions = [
    [18,8,-14], [22,-2,-18], [12,14,-10], [25,3,-22],
    [16,-8,-16], [20,10,-20], [10,-4,-12], [24,16,-15]
  ];
  positions.forEach(([x,y,z], idx) => {
    const group = new THREE.Group();
    const size  = 0.5 + Math.random() * 0.6;

    const cap = new THREE.Mesh(
      new THREE.SphereGeometry(size, 14, 10, 0, Math.PI*2, 0, Math.PI/1.8),
      new THREE.MeshBasicMaterial({
        color: idx % 2 === 0 ? 0x00c8ff : 0xa855f7,
        transparent: true, opacity: 0.35
      })
    );
    group.add(cap);

    const capWire = new THREE.Mesh(
      new THREE.SphereGeometry(size*1.03, 10, 8, 0, Math.PI*2, 0, Math.PI/1.8),
      new THREE.MeshBasicMaterial({
        color: idx % 2 === 0 ? 0x00c8ff : 0xa855f7,
        wireframe: true, transparent: true, opacity: 0.25
      })
    );
    group.add(capWire);

    const tendrilLines = [];
    for (let i = 0; i < 5; i++) {
      const angle = (i / 5) * Math.PI * 2;
      const pts = [];
      let cx = Math.cos(angle) * size * 0.6;
      let cy = -size * 0.3;
      let cz = Math.sin(angle) * size * 0.6;
      for (let j = 0; j < 8; j++) {
        pts.push(new THREE.Vector3(cx, cy, cz));
        cy -= 0.4 + Math.random() * 0.2;
        cx += (Math.random()-0.5) * 0.3;
        cz += (Math.random()-0.5) * 0.3;
      }
      const tline = new THREE.Mesh(
        new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 14, 0.015, 4, false),
        new THREE.MeshBasicMaterial({ color: 0x00ffcc, transparent: true, opacity: 0.4 })
      );
      group.add(tline);
      tendrilLines.push(tline);
    }

    group.position.set(x, y, z);
    scene.add(group);
    swarm.push({ group, phase: Math.random()*Math.PI*2, speed: 0.3+Math.random()*0.3, baseY: y, baseX: x, baseZ: z });
  });
  return swarm;
}
const jellySwarm = buildJellyfishSwarm();

// ── 8. THERMAL VENTS ─────────────────────────────────────────────
function buildThermalVents() {
  const group = new THREE.Group();
  const positions = [[-20,-14,-8],[20,-14,-12],[-5,-14,-18],[10,-14,-6],[-15,-14,-20]];
  positions.forEach(([x,,z]) => {
    const pts = [];
    for (let i = 0; i < 20; i++) {
      pts.push(new THREE.Vector3(
        x + Math.sin(i * 0.4) * 0.5, -14 + i * 1.4, z + Math.cos(i * 0.4) * 0.5
      ));
    }
    const curve = new THREE.CatmullRomCurve3(pts);
    group.add(new THREE.Mesh(
      new THREE.TubeGeometry(curve, 40, 0.18, 6, false),
      new THREE.MeshBasicMaterial({ color: 0x00ffcc, transparent: true, opacity: 0.22 })
    ));
    const pGeo2 = new THREE.BufferGeometry();
    const pArr  = new Float32Array(60 * 3);
    for (let i = 0; i < 60; i++) {
      pArr[i*3]   = x + (Math.random()-0.5)*3;
      pArr[i*3+1] = -14 + 20 * 1.4 + Math.random()*4;
      pArr[i*3+2] = z + (Math.random()-0.5)*3;
    }
    pGeo2.setAttribute('position', new THREE.BufferAttribute(pArr, 3));
    group.add(new THREE.Points(pGeo2,
      new THREE.PointsMaterial({ color: 0x00ffcc, size: 0.18, transparent: true, opacity: 0.5 })));
  });
  scene.add(group);
  return group;
}
const thermalVents = buildThermalVents();

// ── 9. AURORA CURTAIN ────────────────────────────────────────────
function buildAuroraCurtain() {
  const W = 40, H = 20;
  const geo = new THREE.PlaneGeometry(60, 30, W, H);
  const mat = new THREE.MeshBasicMaterial({
    color: 0x00c8ff, transparent: true, opacity: 0.04, side: THREE.DoubleSide
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.rotation.x = Math.PI / 2;
  mesh.position.set(0, 12, -20);
  scene.add(mesh);
  return mesh;
}
const auroraCurtain = buildAuroraCurtain();

// ── 10. PLANKTON CONSTELLATION (bio-themed star sphere) ──────────
function buildConstellation() {
  const group = new THREE.Group();
  const stars = [];
  for (let i = 0; i < 40; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi   = Math.acos(2*Math.random()-1);
    const r     = 22 + Math.random() * 4;
    const pos   = new THREE.Vector3(
      r * Math.sin(phi) * Math.cos(theta),
      r * Math.sin(phi) * Math.sin(theta),
      r * Math.cos(phi) - 10
    );
    const dot = new THREE.Mesh(
      new THREE.SphereGeometry(0.15, 5, 5),
      new THREE.MeshBasicMaterial({ color: 0x00ffcc, transparent: true, opacity: 0.6 })
    );
    dot.position.copy(pos);
    group.add(dot);
    stars.push(pos);
  }
  for (let i = 0; i < stars.length; i++) {
    for (let j = i+1; j < stars.length; j++) {
      if (stars[i].distanceTo(stars[j]) > 14) continue;
      const pts   = [stars[i], stars[j]];
      const curve = new THREE.CatmullRomCurve3(pts);
      group.add(new THREE.Mesh(
        new THREE.TubeGeometry(curve, 4, 0.02, 3, false),
        new THREE.MeshBasicMaterial({ color: 0x00c8ff, transparent: true, opacity: 0.1 })
      ));
    }
  }
  scene.add(group);
  return group;
}
const constellation = buildConstellation();

// ── 11. FLOATING ICOSAHEDRA / OCTAHEDRA ──────────────────────────
const floaters = [];
const floaterColors = [0x00c8ff, 0x00ffcc, 0xa855f7, 0xff6b6b, 0x4fc3f7];
for (let i = 0; i < 8; i++) {
  const size = 0.4 + Math.random() * 0.7;
  const geo  = Math.random() > 0.5
    ? new THREE.IcosahedronGeometry(size, 0)
    : new THREE.OctahedronGeometry(size);
  const mat = new THREE.MeshBasicMaterial({
    color: floaterColors[i % floaterColors.length],
    wireframe: true, transparent: true, opacity: 0.25 + Math.random() * 0.25
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set((Math.random()-0.5)*50, (Math.random()-0.5)*30, (Math.random()-0.5)*15);
  scene.add(mesh);
  floaters.push({ mesh, rx: Math.random()*0.01+0.003, ry: Math.random()*0.01+0.002, floatPhase: Math.random()*Math.PI*2 });
}

// ── 12. PIXEL DEBRIS ──────────────────────────────────────────────
const debris = new THREE.Group();
for (let i = 0; i < 80; i++) {
  const s = 0.06 + Math.random() * 0.22;
  const m = new THREE.Mesh(
    new THREE.BoxGeometry(s, s, s),
    new THREE.MeshBasicMaterial({ color: Math.random() > 0.5 ? 0x00c8ff : 0xa855f7, transparent: true, opacity: 0.5 })
  );
  m.position.set((Math.random()-0.5)*50, (Math.random()-0.5)*30, (Math.random()-0.5)*12);
  debris.add(m);
}
scene.add(debris);

// ── 13. SUBTLE OCEAN-FLOOR GRID ───────────────────────────────────
const gridHelper = new THREE.GridHelper(100, 30, 0x001a2a, 0x001a2a);
gridHelper.position.y = -18;
gridHelper.material.transparent = true;
gridHelper.material.opacity = 0.35;
scene.add(gridHelper);

// ── 14. ABOUT SECTION — MINI GEODESIC SCENE ──────────────────────
let aboutRenderer, aboutScene, aboutCamera, aboutGeo, aboutRing1, aboutRing2;
function initAboutScene() {
  const aboutCanvas = document.getElementById('about-canvas');
  if (!aboutCanvas) return;
  aboutRenderer = new THREE.WebGLRenderer({ canvas: aboutCanvas, alpha: true, antialias: true });
  aboutRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  aboutRenderer.setSize(320, 320);
  aboutScene  = new THREE.Scene();
  aboutCamera = new THREE.PerspectiveCamera(60, 1, 0.1, 200);
  aboutCamera.position.z = 18;

  const geoMesh = new THREE.Mesh(
    new THREE.IcosahedronGeometry(5, 3),
    new THREE.MeshBasicMaterial({ color: 0x00c8ff, wireframe: true, transparent: true, opacity: 0.3 })
  );
  aboutScene.add(geoMesh);

  const inner = new THREE.Mesh(
    new THREE.IcosahedronGeometry(4.6, 2),
    new THREE.MeshBasicMaterial({ color: 0x003355, transparent: true, opacity: 0.4 })
  );
  aboutScene.add(inner);

  const ring1 = new THREE.Mesh(
    new THREE.TorusGeometry(7.5, 0.04, 6, 100),
    new THREE.MeshBasicMaterial({ color: 0x00c8ff, transparent: true, opacity: 0.2 })
  );
  ring1.rotation.x = Math.PI / 3;
  aboutScene.add(ring1);

  const ring2 = new THREE.Mesh(
    new THREE.TorusGeometry(7.5, 0.04, 6, 100),
    new THREE.MeshBasicMaterial({ color: 0xa855f7, transparent: true, opacity: 0.15 })
  );
  ring2.rotation.x = -Math.PI / 4;
  ring2.rotation.z = Math.PI / 5;
  aboutScene.add(ring2);

  for (let i = 0; i < 6; i++) {
    const n = new THREE.Mesh(
      new THREE.SphereGeometry(0.22, 6, 6),
      new THREE.MeshBasicMaterial({ color: 0x00ffcc, transparent: true, opacity: 0.8 })
    );
    n.position.set(
      Math.cos((i/6)*Math.PI*2)*7.5, Math.sin((i/6)*Math.PI*2)*2, Math.sin((i/6)*Math.PI*2)*7.5
    );
    aboutScene.add(n);
  }

  const dotGeo = new THREE.BufferGeometry();
  const dPos   = new Float32Array(200 * 3);
  for (let i = 0; i < 200; i++) {
    dPos[i*3]=(Math.random()-0.5)*25; dPos[i*3+1]=(Math.random()-0.5)*25; dPos[i*3+2]=(Math.random()-0.5)*25;
  }
  dotGeo.setAttribute('position', new THREE.BufferAttribute(dPos, 3));
  aboutScene.add(new THREE.Points(dotGeo,
    new THREE.PointsMaterial({ color: 0xff69b4, size: 0.18, transparent: true, opacity: 0.6 })));

  aboutGeo = geoMesh; aboutRing1 = ring1; aboutRing2 = ring2;
}
initAboutScene();

// ── 15. OPENING CINEMATIC INTRO ───────────────────────────────────
function runIntro() {
  const overlay  = document.getElementById('intro-overlay');
  const barFill  = document.getElementById('intro-bar-fill');
  const statusEl = document.getElementById('intro-status');
  const iCanvas  = document.getElementById('intro-canvas');
  if (!overlay) return;

  const iRen = new THREE.WebGLRenderer({ canvas: iCanvas, alpha: true, antialias: true });
  iRen.setPixelRatio(Math.min(devicePixelRatio, 2));
  iRen.setSize(window.innerWidth, window.innerHeight);
  const iScene = new THREE.Scene();
  const iCam   = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 300);
  iCam.position.z = 32;

  const tunnelRings = [];
  for (let i = 0; i < 30; i++) {
    const r = 3 + i * 0.5;
    const g = new THREE.TorusGeometry(r, 0.04, 6, 80);
    const m = new THREE.MeshBasicMaterial({
      color: i % 3 === 0 ? 0x00c8ff : i % 3 === 1 ? 0x00ffcc : 0xa855f7,
      transparent: true, opacity: 0.15 + (1 - i / 30) * 0.3
    });
    const mesh = new THREE.Mesh(g, m);
    mesh.position.z = -i * 2.5;
    mesh.rotation.z = i * 0.15;
    iScene.add(mesh);
    tunnelRings.push(mesh);
  }

  const coreMesh = new THREE.Mesh(
    new THREE.IcosahedronGeometry(3, 2),
    new THREE.MeshBasicMaterial({ color: 0x00c8ff, wireframe: true, transparent: true, opacity: 0.5 })
  );
  iScene.add(coreMesh);

  const bGeo = new THREE.BufferGeometry();
  const bCount = 2000;
  const bPos = new Float32Array(bCount * 3);
  const bVel = new Float32Array(bCount * 3);
  const bCol = new Float32Array(bCount * 3);
  for (let i = 0; i < bCount; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi   = Math.acos(2 * Math.random() - 1);
    const spd = 0.08 + Math.random() * 0.18;
    bVel[i*3]   = Math.sin(phi) * Math.cos(theta) * spd;
    bVel[i*3+1] = Math.sin(phi) * Math.sin(theta) * spd;
    bVel[i*3+2] = Math.cos(phi) * spd;
    const t = Math.random();
    if (t < 0.5) { bCol[i*3]=0; bCol[i*3+1]=0.8; bCol[i*3+2]=1; }
    else if (t < 0.75) { bCol[i*3]=0; bCol[i*3+1]=1; bCol[i*3+2]=0.7; }
    else { bCol[i*3]=0.66; bCol[i*3+1]=0.33; bCol[i*3+2]=1; }
  }
  bGeo.setAttribute('position', new THREE.BufferAttribute(bPos, 3));
  bGeo.setAttribute('color',    new THREE.BufferAttribute(bCol, 3));
  const burstPts = new THREE.Points(bGeo,
    new THREE.PointsMaterial({ vertexColors: true, size: 0.18, sizeAttenuation: true }));
  iScene.add(burstPts);

  const msgs = [
    'INITIALISING CORE SYSTEMS...', 'CALIBRATING DEPTH SONAR...',
    'LOADING BIOLUMINESCENT GRID...', 'NEURAL TENDRIL NETWORK ONLINE...',
    'MANTA ARRAY DEPLOYED...', 'WELCOME TO THE DEEP'
  ];
  let msgIdx = 0;
  const msgInterval = setInterval(() => {
    if (statusEl && msgIdx < msgs.length) statusEl.textContent = msgs[msgIdx++];
  }, 600);

  let progress = 0;
  const barInterval = setInterval(() => {
    progress += 100 / 38;
    if (barFill) barFill.style.width = Math.min(progress, 100) + '%';
    if (progress >= 100) clearInterval(barInterval);
  }, 100);

  const iClock = new THREE.Clock();
  let introDone = false;
  function introLoop() {
    if (introDone) return;
    requestAnimationFrame(introLoop);
    const t = iClock.getElapsedTime();
    tunnelRings.forEach((ring, i) => {
      ring.position.z = (-i * 2.5 + t * 14) % 75 - 5;
      ring.rotation.z = i * 0.15 + t * 0.3;
      ring.material.opacity = Math.max(0, 0.12 + (1 - Math.abs(ring.position.z) / 75) * 0.3);
    });
    coreMesh.rotation.x = t * 0.5;
    coreMesh.rotation.y = t * 0.7;
    const coreScale = Math.min(1 + t * 0.4, 3.5);
    coreMesh.scale.set(coreScale, coreScale, coreScale);
    coreMesh.material.opacity = Math.max(0, 0.5 - (t - 2.5) * 0.5);
    const posAttr = burstPts.geometry.attributes.position;
    for (let i = 0; i < bCount; i++) {
      posAttr.array[i*3]   += bVel[i*3]   * Math.min(t * 1.5, 1.5) * 0.1;
      posAttr.array[i*3+1] += bVel[i*3+1] * Math.min(t * 1.5, 1.5) * 0.1;
      posAttr.array[i*3+2] += bVel[i*3+2] * Math.min(t * 1.5, 1.5) * 0.1;
    }
    posAttr.needsUpdate = true;
    iCam.position.z = 32 + t * 2;
    iRen.render(iScene, iCam);
  }
  introLoop();

  setTimeout(() => {
    introDone = true;
    clearInterval(msgInterval);
    overlay.classList.add('hide');
    document.body.style.overflow = '';
    setTimeout(() => iRen.dispose(), 1300);
  }, 4200);
}
runIntro();

// ── 16. MOUSE PARALLAX ────────────────────────────────────────────
document.addEventListener('mousemove', e => {
  mouseX = (e.clientX / window.innerWidth  - 0.5) * 2;
  mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
});

// ── 17. SCROLL → DEPTH GAUGE + ACTIVE NAV + 3D SCROLL DRIVE ───────
const dgFill  = document.getElementById('dg-fill');
const depthEl = document.getElementById('depth-read');

function onScrollUpdate() {
  const max = document.body.scrollHeight - window.innerHeight;
  scrollProgress = max > 0 ? window.scrollY / max : 0;
  const depth = Math.round(scrollProgress * 2000);
  if (dgFill)  dgFill.style.height = (scrollProgress * 100) + '%';
  if (depthEl) depthEl.textContent = 'DEPTH: ' + String(depth).padStart(4, '0') + 'm';
}
window.addEventListener('scroll', onScrollUpdate);
onScrollUpdate();

const sections = document.querySelectorAll('.section');
const navLinks = document.querySelectorAll('.nav-links a');
window.addEventListener('scroll', () => {
  let current = '';
  sections.forEach(s => { if (window.scrollY >= s.offsetTop - 200) current = s.id; });
  navLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + current));
});

// ── 18. SCROLL REVEAL ──────────────────────────────────────────────
const revealEls = document.querySelectorAll('.reveal');
function checkReveal() {
  revealEls.forEach(el => {
    if (el.getBoundingClientRect().top < window.innerHeight * 0.88) el.classList.add('vis');
  });
}
window.addEventListener('scroll', checkReveal);
checkReveal();

// ── 19. HUD CONTROLS ────────────────────────────────────────────────
const freqEl = document.getElementById('freq-val');
const tempEl = document.getElementById('temp-val');
setInterval(() => {
  if (freqEl) freqEl.textContent = (3.826 + (Math.random()-0.5)*0.04).toFixed(3) + ' kn';
  if (tempEl) tempEl.textContent = (4.2   + (Math.random()-0.5)*0.8).toFixed(1)  + ' °C';
}, 1100);

const coreData = {
  '#00bfff': { mode: 'SUNLIT_CURRENTS', node: 'CURRENT_STABLE'  },
  '#a855f7': { mode: 'TWILIGHT_DRIFT',  node: 'PRESSURE_STABLE' },
  '#10b981': { mode: 'ABYSSAL_FLUX',    node: 'BIOLUME_LOCKED'  }
};
window.setCore = function(btn, colorHex) {
  document.querySelectorAll('.htab').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  const d = coreData[colorHex];
  if (document.getElementById('core-mode'))        document.getElementById('core-mode').textContent = d.mode;
  if (document.getElementById('node-status-text')) document.getElementById('node-status-text').textContent = d.node;
};

window.updateSpeed = function(val) {
  speedMultiplier = val / 10;
  const el = document.getElementById('speed-out');
  if (el) el.textContent = speedMultiplier.toFixed(1) + 'x';
};

// ── 20. OCEAN AMBIENT MUSIC ──────────────────────────────────────────
let audioCtx = null, isPlaying = false, masterGain = null;
function buildOceanAudio() {
  audioCtx   = new (window.AudioContext || window.webkitAudioContext)();
  masterGain = audioCtx.createGain();
  masterGain.gain.setValueAtTime(0, audioCtx.currentTime);
  masterGain.connect(audioCtx.destination);
  function osc(freq, type, gainV) {
    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, audioCtx.currentTime);
    g.gain.setValueAtTime(gainV, audioCtx.currentTime);
    o.connect(g); g.connect(masterGain); o.start();
  }
  osc(40, 'sine', 0.16);
  osc(110, 'sine', 0.06);
  osc(528, 'sine', 0.022);
  function spawnBubble() {
    if (!isPlaying || !audioCtx) return;
    const bo = audioCtx.createOscillator();
    const be = audioCtx.createGain();
    bo.type = 'sine';
    bo.frequency.setValueAtTime(600 + Math.random()*800, audioCtx.currentTime);
    bo.frequency.exponentialRampToValueAtTime(200, audioCtx.currentTime + 0.3);
    be.gain.setValueAtTime(0.035, audioCtx.currentTime);
    be.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.35);
    bo.connect(be); be.connect(masterGain); bo.start(); bo.stop(audioCtx.currentTime + 0.4);
    setTimeout(spawnBubble, 900 + Math.random()*2800);
  }
  return spawnBubble;
}
let spawnBubbleFn = null;
const musicBtn   = document.getElementById('music-btn');
const musicIcon  = document.getElementById('music-icon');
const musicLabel = document.getElementById('music-label');
if (musicBtn) musicBtn.addEventListener('click', () => {
  if (!audioCtx) spawnBubbleFn = buildOceanAudio();
  if (!isPlaying) {
    audioCtx.resume();
    masterGain.gain.setTargetAtTime(1, audioCtx.currentTime, 1.4);
    isPlaying = true;
    musicBtn.classList.add('playing');
    musicIcon.innerHTML = '<span class="eq-bars"><span class="eq-bar"></span><span class="eq-bar"></span><span class="eq-bar"></span><span class="eq-bar"></span></span>';
    musicLabel.textContent = 'PLAYING';
    if (spawnBubbleFn) spawnBubbleFn();
  } else {
    masterGain.gain.setTargetAtTime(0, audioCtx.currentTime, 0.7);
    isPlaying = false;
    musicBtn.classList.remove('playing');
    musicIcon.textContent = '♪';
    musicLabel.textContent = 'AMBIENCE';
  }
});

// ── 21. MAIN ANIMATION LOOP (scroll-reactive) ─────────────────────────
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  const t = clock.getElapsedTime() * speedMultiplier;

  tX += (mouseX - tX) * 0.035;
  tY += (mouseY - tY) * 0.035;

  // Sonar rings
  sonarRings.forEach(r => {
    const phase = (t * 0.2 + r.phase) % 1;
    const scale = phase * 30;
    r.mesh.scale.set(scale, scale, scale);
    r.mesh.material.opacity = Math.max(0, (1 - phase) * 0.2);
  });

  // Tendrils shimmer
  tendrils.forEach(td => {
    td.mesh.material.opacity = 0.05 + Math.abs(Math.sin(t * td.speed * 50 + td.phase)) * 0.22;
  });

  // Jelly bob + pulse
  jelly.position.y      = 2 + Math.sin(t * 0.38) * 1.1;
  jellyShell.position.y = jelly.position.y;
  jelly.rotation.y      = t * 0.1;
  jellyShell.rotation.y = -t * 0.07;
  const ps = 1 + Math.sin(t * 1.2) * 0.06;
  jelly.scale.set(ps, ps, ps);
  jellyShell.scale.copy(jelly.scale);

  // Manta ray glide — also drifts deeper as you scroll
  const rt = t * 0.12;
  mantaRay.position.x = -14 + Math.sin(rt) * 8;
  mantaRay.position.y =  3  + Math.sin(rt * 2) * 3.5 - scrollProgress * speedMultiplier * 6;
  mantaRay.position.z = -6  + Math.cos(rt) * 3;
  mantaRay.rotation.y = -Math.atan2(Math.cos(rt) * 8 * 0.12, 4) + Math.PI;
  mantaRay.rotation.z =  Math.atan2(Math.cos(rt * 2) * 3.5 * 0.12 * 2, 4) * 0.4;
  const flap = Math.sin(t * 1.4) * 0.22;
  wingL.rotation.z =  flap;
  wingR.rotation.z = -flap;
  mantaRay.children.forEach((c, i) => {
    if (i >= 9) c.material.opacity = 0.35 + Math.abs(Math.sin(t * 2 + i)) * 0.5;
  });

  // Kelp forest — gentle sway + sinks deeper into the dark as you scroll
  kelpForest.group.rotation.z = Math.sin(t * 0.15) * 0.04;
  kelpForest.group.position.y = Math.sin(t * 0.2) * 0.5 - scrollProgress * speedMultiplier * 4;
  kelpForest.strands.forEach((s, i) => {
    // Stalk stays a steady dark silhouette (barely flickers — it's a plant, not a light source)
    s.stalk.material.opacity = 0.5 + Math.sin(t * 0.3 + s.phase) * 0.08;
    // Thin glowing edge-line shimmers gently along the stalk
    s.edgeLine.material.opacity = 0.1 + Math.abs(Math.sin(t * 0.5 + s.phase)) * 0.14;
    // Tip is the brightest "growing point" — pulses like bioluminescence
    s.tipGlow.material.opacity = 0.55 + Math.abs(Math.sin(t * 1.5 + s.phase)) * 0.35;
    // Fronds stay dark/silhouetted, barely shifting
    s.fronds.forEach((f, fi) => {
      f.material.opacity = 0.32 + Math.sin(t * 0.4 + fi * 0.3 + s.phase) * 0.1;
    });
    // Sparse bio-nodes twinkle independently like clinging plankton
    s.bioNodes.forEach((n, ni) => {
      n.material.opacity = 0.3 + Math.abs(Math.sin(t * 1.8 + ni * 1.7 + s.phase)) * 0.5;
    });
  });

  // Jellyfish swarm — pulsing caps + drifting motion, reacts to scroll
  jellySwarm.forEach(j => {
    const jt = t * j.speed + j.phase;
    j.group.position.y = j.baseY + Math.sin(jt) * 1.8 - scrollProgress * speedMultiplier * 8;
    j.group.position.x = j.baseX + Math.sin(jt * 0.6) * 1.2;
    j.group.position.z = j.baseZ + Math.cos(jt * 0.5) * 1.5;
    const pulse = 1 + Math.sin(jt * 2) * 0.15;
    j.group.scale.set(pulse, pulse, pulse);
    j.group.rotation.y = jt * 0.3;
  });

  // Floaters
  floaters.forEach(f => {
    f.mesh.rotation.x = t * f.rx;
    f.mesh.rotation.y = t * f.ry;
    f.mesh.position.y += Math.sin(t * 0.5 + f.floatPhase) * 0.003;
  });

  // Debris drift — slow rotation tied loosely to scroll
  debris.rotation.y = t * 0.01 + scrollProgress * speedMultiplier * 0.5;
  debris.rotation.x = t * 0.005;

  // Thermal vents shimmer
  thermalVents.children.forEach((child, i) => {
    if (child.material) child.material.opacity = 0.15 + Math.abs(Math.sin(t * 0.8 + i * 0.5)) * 0.2;
  });

  // Aurora curtain wave
  if (auroraCurtain) {
    const pos = auroraCurtain.geometry.attributes.position;
    const W = 40, H = 20;
    for (let ix = 0; ix <= W; ix++) {
      for (let iy = 0; iy <= H; iy++) {
        const idx = iy * (W + 1) + ix;
        const ox  = pos.getX(idx);
        pos.setZ(idx, Math.sin(ox * 0.15 + t * 0.6) * 1.5 + Math.sin(ox * 0.08 + t * 0.4) * 2);
      }
    }
    pos.needsUpdate = true;
    auroraCurtain.material.opacity = 0.025 + Math.abs(Math.sin(t * 0.3)) * 0.025;
  }

  // Constellation slow orbit
  constellation.rotation.y = t * 0.015 + scrollProgress * speedMultiplier * 0.3;
  constellation.rotation.x = Math.sin(t * 0.08) * 0.05;

  // Grid subtle shift
  gridHelper.position.z = Math.sin(t * 0.05) * 2;

  // Particles drift + scroll parallax
  particles.rotation.y = t * 0.006;
  particles.rotation.x = t * 0.003;

  // ── SCROLL-REACTIVE CAMERA ──
  // Camera dives deeper and drifts as user scrolls, in addition to mouse parallax
  const scrollCamY = -scrollProgress * 22;
  const scrollCamZ = 40 - scrollProgress * 14;
  const scrollFOVShift = scrollProgress * 8;

  camera.position.x += (tX * 5 - camera.position.x) * 0.025;
  camera.position.y += (scrollCamY - tY * 3 - camera.position.y) * 0.04;
  camera.position.z += (scrollCamZ - camera.position.z) * 0.04;
  camera.fov = 70 + scrollFOVShift;
  camera.updateProjectionMatrix();

  renderer.render(scene, camera);

  // About geodesic mini-scene
  if (aboutRenderer && aboutScene && aboutCamera && aboutGeo) {
    aboutGeo.rotation.y   = t * 0.14;
    aboutGeo.rotation.x   = t * 0.06;
    aboutRing1.rotation.z = t * 0.09;
    aboutRing2.rotation.y = t * 0.07;
    aboutRenderer.render(aboutScene, aboutCamera);
  }
}
animate();

// ── 22. RESIZE ───────────────────────────────────────────────────────
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

