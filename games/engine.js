// DINOSPEAR mini-game engine V01 — shared by Zombie Lab and Hide & Seek
// three.js scene, blocky characters, wall collision, line of sight, phone joystick + keyboard, AR/EN text
import * as THREE from 'three';
export { THREE };

// ---------- language ----------
let lang = 'ar';
try { lang = localStorage.getItem('aser_lang') || localStorage.getItem('ds_lang') || 'ar'; } catch (e) {}
if (lang !== 'en') lang = 'ar';
export const L = () => lang;
export const T = (en, ar) => (lang === 'en' ? en : ar);
export function setLang(l) {
  lang = l; try { localStorage.setItem('aser_lang', l); } catch (e) {}
  document.documentElement.lang = l; document.documentElement.dir = l === 'ar' ? 'rtl' : 'ltr';
  document.querySelectorAll('[data-en]').forEach(el => { el.textContent = l === 'en' ? el.dataset.en : el.dataset.ar; });
}
export const store = {
  get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
};

// ---------- scene ----------
export function makeWorld(opts) {
  const o = Object.assign({ sky: 0x0b1020, fog: 0x0b1020, fogNear: 18, fogFar: 60, ambient: 0.55, sun: 1.1 }, opts || {});
  const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
  renderer.domElement.className = 'gl';
  document.getElementById('app').appendChild(renderer.domElement);
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(o.sky);
  scene.fog = new THREE.Fog(o.fog, o.fogNear, o.fogFar);
  const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 200);
  scene.add(new THREE.HemisphereLight(0xdbeafe, 0x1e293b, o.ambient));
  const sun = new THREE.DirectionalLight(0xffffff, o.sun);
  sun.position.set(18, 30, 12); sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  const s = sun.shadow.camera; s.left = -40; s.right = 40; s.top = 40; s.bottom = -40; s.far = 90;
  scene.add(sun); scene.add(sun.target);
  function resize() {
    const w = innerWidth, h = innerHeight;
    renderer.setSize(w, h, false); camera.aspect = w / h;
    camera.fov = w < h ? 68 : 55; camera.updateProjectionMatrix();
  }
  addEventListener('resize', resize); resize();
  return { renderer, scene, camera, sun };
}

// ---------- materials & boxes ----------
const matCache = {};
export function mat(color, extra) {
  const key = color + JSON.stringify(extra || {});
  if (!matCache[key]) matCache[key] = new THREE.MeshStandardMaterial(Object.assign({ color, roughness: 0.75, metalness: 0.05 }, extra || {}));
  return matCache[key];
}
// walls[] holds 2D rectangles {x0,z0,x1,z1} for collision and sight
export const walls = [];
export function box(scene, x, z, w, d, h, color, o) {
  o = o || {};
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat(color, o.mat));
  m.position.set(x, (o.y || 0) + h / 2, z);
  m.castShadow = o.shadow !== false; m.receiveShadow = true;
  scene.add(m);
  if (o.solid !== false) walls.push({ x0: x - w / 2, z0: z - d / 2, x1: x + w / 2, z1: z + d / 2, tall: h > 1.2, mesh: m });
  return m;
}
export function floor(scene, w, d, color, tile) {
  const c = document.createElement('canvas'); c.width = c.height = 256;
  const g = c.getContext('2d'); const col = new THREE.Color(color);
  g.fillStyle = '#' + col.getHexString(); g.fillRect(0, 0, 256, 256);
  g.strokeStyle = 'rgba(0,0,0,.18)'; g.lineWidth = 4; g.strokeRect(0, 0, 256, 256);
  g.fillStyle = 'rgba(255,255,255,.05)'; g.fillRect(8, 8, 120, 120); g.fillRect(136, 136, 112, 112);
  const tex = new THREE.CanvasTexture(c); tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(w / (tile || 2), d / (tile || 2)); tex.colorSpace = THREE.SRGBColorSpace;
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.9 }));
  m.rotation.x = -Math.PI / 2; m.receiveShadow = true; scene.add(m); return m;
}

// ---------- blocky character ----------
export function makeChar(c) {
  c = Object.assign({ skin: 0xf2c49b, shirt: 0x2563eb, pants: 0x1e293b, hair: 0x3b2314, eyes: 0x111111, glow: null }, c || {});
  const g = new THREE.Group();
  const part = (w, h, d, color, x, y, z) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat(color)); m.position.set(x, y, z); m.castShadow = true; g.add(m); return m; };
  const body = part(0.62, 0.72, 0.36, c.shirt, 0, 1.06, 0);
  const head = part(0.52, 0.52, 0.5, c.skin, 0, 1.72, 0);
  const hair = new THREE.Mesh(new THREE.BoxGeometry(0.54, 0.14, 0.52), mat(c.hair)); hair.position.set(0, 0.28, 0); head.add(hair);
  const eyeM = c.glow ? new THREE.MeshBasicMaterial({ color: c.glow }) : mat(c.eyes);
  [-0.12, 0.12].forEach(x => { const e = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.09, 0.02), eyeM); e.position.set(x, 0.04, 0.26); head.add(e); });
  const armL = part(0.2, 0.68, 0.22, c.skin, -0.42, 1.08, 0), armR = part(0.2, 0.68, 0.22, c.skin, 0.42, 1.08, 0);
  const legL = part(0.26, 0.7, 0.28, c.pants, -0.16, 0.35, 0), legR = part(0.26, 0.7, 0.28, c.pants, 0.16, 0.35, 0);
  [armL, armR, legL, legR].forEach(p => { p.geometry.translate(0, -0.3, 0); p.position.y += 0.3; });
  // blob shadow keeps characters grounded on weak phones
  const sh = new THREE.Mesh(new THREE.CircleGeometry(0.42, 20), new THREE.MeshBasicMaterial({ color: 0, transparent: true, opacity: 0.25, depthWrite: false }));
  sh.rotation.x = -Math.PI / 2; sh.position.y = 0.02; g.add(sh);
  let t = 0;
  g.userData.anim = (dt, speed, zombie) => {
    t += dt * (3 + speed * 2.2);
    const a = Math.sin(t) * Math.min(1, speed) * 0.7;
    legL.rotation.x = a; legR.rotation.x = -a;
    if (zombie) { armL.rotation.x = armR.rotation.x = -1.45 + Math.sin(t * 0.5) * 0.08; }
    else { armL.rotation.x = -a; armR.rotation.x = a; }
    body.position.y = 1.06 + Math.abs(Math.sin(t)) * 0.04 * Math.min(1, speed);
  };
  g.userData.head = head; g.userData.body = body;
  return g;
}

// ---------- collision & sight ----------
export function moveCircle(p, dx, dz, r) {
  p.x += dx;
  for (const w of walls) if (p.z > w.z0 - r && p.z < w.z1 + r && p.x > w.x0 - r && p.x < w.x1 + r) p.x = dx > 0 ? w.x0 - r : w.x1 + r;
  p.z += dz;
  for (const w of walls) if (p.x > w.x0 - r && p.x < w.x1 + r && p.z > w.z0 - r && p.z < w.z1 + r) p.z = dz > 0 ? w.z0 - r : w.z1 + r;
}
function segHitsRect(ax, az, bx, bz, w) {
  let t0 = 0, t1 = 1; const dx = bx - ax, dz = bz - az;
  const clip = (p, q) => { if (p === 0) return q >= 0; const r = q / p; if (p < 0) { if (r > t1) return false; if (r > t0) t0 = r; } else { if (r < t0) return false; if (r < t1) t1 = r; } return true; };
  return clip(-dx, ax - w.x0) && clip(dx, w.x1 - ax) && clip(-dz, az - w.z0) && clip(dz, w.z1 - az) && t0 < t1;
}
export function canSee(a, b) {
  for (const w of walls) if (w.tall && segHitsRect(a.x, a.z, b.x, b.z, w)) return false;
  return true;
}
export const dist = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);

// ---------- input: keyboard + phone joystick + action buttons ----------
export const input = { x: 0, z: 0, run: false, keys: new Set(), pressed: new Set() };
addEventListener('keydown', e => {
  if (!input.keys.has(e.code)) input.pressed.add(e.code);
  input.keys.add(e.code);
  if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) e.preventDefault();
});
addEventListener('keyup', e => input.keys.delete(e.code));
addEventListener('blur', () => input.keys.clear());
const joy = { active: false, x: 0, z: 0, id: null };
export function setupJoystick() {
  const base = document.getElementById('joy'), knob = document.getElementById('knob');
  if (!base) return;
  const R = 46;
  const set = (cx, cy) => {
    const r = base.getBoundingClientRect(); let dx = cx - (r.left + r.width / 2), dy = cy - (r.top + r.height / 2);
    const m = Math.hypot(dx, dy); if (m > R) { dx *= R / m; dy *= R / m; }
    knob.style.transform = `translate(${dx}px,${dy}px)`; joy.x = dx / R; joy.z = dy / R;
  };
  base.addEventListener('pointerdown', e => { joy.active = true; joy.id = e.pointerId; base.setPointerCapture(e.pointerId); set(e.clientX, e.clientY); });
  base.addEventListener('pointermove', e => { if (joy.active && e.pointerId === joy.id) set(e.clientX, e.clientY); });
  const end = () => { joy.active = false; joy.x = joy.z = 0; knob.style.transform = ''; };
  base.addEventListener('pointerup', end); base.addEventListener('pointercancel', end);
}
export function bindButton(id, code) {
  const b = document.getElementById(id); if (!b) return;
  b.addEventListener('pointerdown', e => { e.preventDefault(); input.pressed.add(code); input.keys.add(code); });
  const up = () => input.keys.delete(code);
  b.addEventListener('pointerup', up); b.addEventListener('pointercancel', up); b.addEventListener('pointerleave', up);
}
export function readInput() {
  let x = 0, z = 0; const k = input.keys;
  if (k.has('KeyW') || k.has('ArrowUp')) z -= 1; if (k.has('KeyS') || k.has('ArrowDown')) z += 1;
  if (k.has('KeyA') || k.has('ArrowLeft')) x -= 1; if (k.has('KeyD') || k.has('ArrowRight')) x += 1;
  if (joy.active) { x = joy.x; z = joy.z; }
  const m = Math.hypot(x, z); if (m > 1) { x /= m; z /= m; }
  input.x = x; input.z = z; input.run = k.has('ShiftLeft') || k.has('ShiftRight') || k.has('Run');
  return input;
}
export const hit = code => input.pressed.has(code);
export const endFrame = () => input.pressed.clear();

// ---------- small sounds (no files needed) ----------
let ac = null;
export function beep(f, d, type, vol) {
  try {
    ac = ac || new (window.AudioContext || window.webkitAudioContext)();
    const o = ac.createOscillator(), g = ac.createGain();
    o.type = type || 'square'; o.frequency.value = f; g.gain.value = vol || 0.05;
    o.connect(g); g.connect(ac.destination); o.start();
    g.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + (d || 0.12)); o.stop(ac.currentTime + (d || 0.12));
  } catch (e) {}
}

// ---------- camera zoom: pinch with two fingers on phones, mouse wheel on PC (a player idea picked by the admin) ----------
export const view = { zoom: store.get('ds_zoom', 1) };
const clampZoom = z => Math.max(0.45, Math.min(1.6, z));
addEventListener('wheel', e => { view.zoom = clampZoom(view.zoom * (e.deltaY > 0 ? 1.08 : 0.93)); store.set('ds_zoom', view.zoom); }, { passive: true });
{
  const pts = new Map(); let d0 = 0, z0 = 1;
  addEventListener('pointerdown', e => { if (e.target.tagName !== 'CANVAS') return; pts.set(e.pointerId, e); if (pts.size === 2) { const [a, b] = [...pts.values()]; d0 = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY); z0 = view.zoom; } });
  addEventListener('pointermove', e => { if (!pts.has(e.pointerId)) return; pts.set(e.pointerId, e); if (pts.size === 2 && d0 > 0) { const [a, b] = [...pts.values()]; const d = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY); view.zoom = clampZoom(z0 * d0 / Math.max(20, d)); } });
  const up = e => { if (pts.delete(e.pointerId) && pts.size < 2 && d0) { d0 = 0; store.set('ds_zoom', view.zoom); } };
  addEventListener('pointerup', up); addEventListener('pointercancel', up);
}

// ---------- camera follow (third person, a bit above) ----------
export function follow(camera, target, dt, height, back) {
  const z = view.zoom, want = new THREE.Vector3(target.x, (height || 9) * z, target.z + (back || 8) * z);
  camera.position.lerp(want, 1 - Math.pow(0.001, dt));
  camera.lookAt(target.x, 0.8, target.z - 1);
}
