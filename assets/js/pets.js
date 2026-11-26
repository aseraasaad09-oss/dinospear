// DINOSPEAR pets V01 (a player idea picked by the admin): dogs, cats and baby dinos made in Blender walk around the 3D town.
// Walk up to one: pet it, feed it, adopt it — or steal one from its owner (the owner runs after you!). Your pet follows you and is saved.
import * as THREE from 'three';
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.169.0/examples/jsm/loaders/GLTFLoader.js';
const en = () => { try { return localStorage.getItem('aser_lang') === 'en'; } catch (e) { return false; } };
const T = (a, e) => en() ? e : a;
const KINDS = { dog: ['كلب', 'Dog'], cat: ['قطة', 'Cat'], dinopet: ['داينو صغير', 'Baby dino'] };
const NAMES = ['بوبي', 'لولي', 'ريكس', 'ميشو', 'سنو', 'توتو', 'كوكي', 'زيزو'];
const base = new URL('../../games/models/', import.meta.url).href, loader = new GLTFLoader(), M = {};
const load = n => new Promise(r => loader.load(base + n + '.glb', g => { M[n] = g.scene; r(); }, undefined, () => r()));
const wait = () => new Promise(r => { const t = setInterval(() => { if (window.DS_SCENE && window.DS_ME) { clearInterval(t); r(); } }, 300); });
await Promise.all(['dog', 'cat', 'dinopet', 'person'].map(load)); await wait();
const scene = window.DS_SCENE, me = window.DS_ME, pets = [];
let mine = null; try { mine = JSON.parse(localStorage.getItem('ds_pet') || 'null'); } catch (e) {}
function petMesh(kind) {
  const m = M[kind].clone(true); m.scale.setScalar(1.35); m.rotation.y = Math.PI;
  const g = new THREE.Group(); g.add(m); m.traverse(o => { if (o.isMesh) o.castShadow = true; });
  g.userData.legs = ['LegFL', 'LegBR', 'LegFR', 'LegBL'].map(n => m.getObjectByName(n)); g.userData.tail = m.getObjectByName('Tail');
  return g;
}
function spawn(kind, x, z, owner) {
  const p = { kind, name: NAMES[(Math.random() * NAMES.length) | 0], mesh: petMesh(kind), pos: new THREE.Vector3(x, me.y, z), dir: Math.random() * 6, love: 0, owner: null, follow: false, t: Math.random() * 9, hop: 0 };
  scene.add(p.mesh);
  if (owner) { const o = M.person.clone(true); o.traverse(c => { if (c.isMesh) { c.castShadow = true; if (c.material.name === 'Shirt') { c.material = c.material.clone(); c.material.color.set([0xef4444, 0x8b5cf6, 0x10b981][pets.length % 3]); } } }); scene.add(o); p.owner = { mesh: o, pos: new THREE.Vector3(x + 1.5, me.y, z + 1), angry: 0, arms: ['ArmL', 'ArmR', 'LegL', 'LegR'].map(n => o.getObjectByName(n)) }; }
  pets.push(p); return p;
}
// pets around the player at the start; some walk with an owner
for (let i = 0; i < 9; i++) { const a = i / 9 * Math.PI * 2, r = 12 + (i % 3) * 9; spawn(['dog', 'cat', 'dinopet'][i % 3], me.x + Math.cos(a) * r, me.z + Math.sin(a) * r, i % 3 === 0); }
if (mine) { const p = spawn(mine.kind, me.x + 2, me.z + 2, false); p.name = mine.name; p.follow = true; p.love = 100; }

// ---------- the floating button (works with touch and mouse) + key P ----------
const ui = document.createElement('div');
ui.style.cssText = 'position:fixed;z-index:70;left:50%;bottom:max(96px,env(safe-area-inset-bottom));transform:translateX(-50%);display:none;gap:8px;background:rgba(15,23,42,.85);padding:8px;border-radius:18px;backdrop-filter:blur(6px);font:800 14px system-ui,sans-serif';
document.body.appendChild(ui);
const toast = (m) => { const t = document.createElement('div'); t.textContent = m; t.style.cssText = 'position:fixed;z-index:71;left:50%;top:18%;transform:translateX(-50%);background:rgba(15,23,42,.9);color:#fff;padding:10px 16px;border-radius:14px;font:800 16px system-ui,sans-serif'; document.body.appendChild(t); setTimeout(() => t.remove(), 1800); };
function btn(label, color, fn) { const b = document.createElement('button'); b.type = 'button'; b.textContent = label; b.style.cssText = 'border:0;border-radius:12px;padding:10px 14px;color:#fff;font:800 14px system-ui,sans-serif;cursor:pointer;background:' + color; b.onclick = e => { e.stopPropagation(); fn(); }; ui.appendChild(b); }
const hearts = [];
function heart(p) { const h = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 6), new THREE.MeshBasicMaterial({ color: 0xf43f5e })); h.position.copy(p.pos).add(new THREE.Vector3(0, 1.1, 0)); scene.add(h); hearts.push({ h, t: 0 }); }
let near = null, shown = null;
function save() { const f = pets.find(p => p.follow); try { localStorage.setItem('ds_pet', f ? JSON.stringify({ kind: f.kind, name: f.name }) : 'null'); } catch (e) {} }
function adopt(p) { pets.forEach(q => { if (q !== p && q.follow) q.follow = false; }); p.follow = true; save(); toast(T(p.name + ' بقى معاك! 🐾', p.name + ' is yours now! 🐾')); }
function drawUi() {
  if (shown === near) return; shown = near; ui.innerHTML = '';
  if (!near) { ui.style.display = 'none'; return; }
  ui.style.display = 'flex';
  const p = near, kn = KINDS[p.kind][en() ? 1 : 0], lab = document.createElement('span'); lab.style.cssText = 'color:#fff;align-self:center;padding:0 6px'; lab.textContent = p.name + ' · ' + kn; ui.appendChild(lab);
  btn(T('دلّعه', 'Pet'), '#ec4899', () => { p.love += 20; p.hop = 0.5; heart(p); toast(T('❤️ ' + p.name + ' مبسوط', '❤️ ' + p.name + ' is happy')); });
  btn(T('أكّله', 'Feed'), '#f59e0b', () => { p.love += 30; p.hop = 0.6; heart(p); heart(p); toast(T('🍖 ' + p.name + ' كل', '🍖 ' + p.name + ' ate')); });
  if (p.follow) btn(T('سيبه', 'Let go'), '#64748b', () => { p.follow = false; save(); toast(T(p.name + ' رجع يتمشى', p.name + ' walks free again')); shown = null; });
  else if (p.owner) btn(T('اسرقه!', 'Steal!'), '#ef4444', () => { adopt(p); p.owner.angry = 6; toast(T('صاحبه بيجري وراك! اجري!', 'The owner is chasing you! Run!')); shown = null; });
  else btn(T('اتبنّاه', 'Adopt'), '#22c55e', () => { if (p.love < 40) return toast(T('لسه مش واثق فيك — دلّعه أو أكّله الأول', 'Not sure about you yet — pet or feed it first')); adopt(p); shown = null; });
}
addEventListener('keydown', e => { if (e.code === 'KeyG' && near) { const b = ui.querySelectorAll('button')[0]; b && b.click(); } });

// ---------- loop ----------
let last = performance.now();
(function tick(now) {
  const dt = Math.min(0.05, (now - last) / 1000); last = now;
  near = null; let best = 3;
  pets.forEach(p => {
    p.t += dt; p.hop = Math.max(0, p.hop - dt);
    let target = null, sp = 1.2;
    if (p.follow) { const d = p.pos.distanceTo(me); if (d > 2.2) { target = me; sp = Math.min(7, 1.5 + d * 1.2); } }
    else if (p.owner) { const o = p.owner; o.pos.y = p.pos.y; if (o.pos.distanceTo(p.pos) > 1.6) { const v = p.pos.clone().sub(o.pos).setY(0).normalize(); o.pos.addScaledVector(v, dt * 1.4); } }
    if (!target && !p.follow) { if (p.t > 4) { p.t = 0; p.dir += (Math.random() - 0.5) * 2.4; } const fwd = new THREE.Vector3(Math.sin(p.dir), 0, Math.cos(p.dir)); p.pos.addScaledVector(fwd, sp * 0.6 * dt); }
    if (target) { const v = target.clone().sub(p.pos).setY(0); p.dir = Math.atan2(v.x, v.z); p.pos.addScaledVector(v.normalize(), sp * dt); }
    p.pos.y += (me.y - p.pos.y) * Math.min(1, dt * 3);
    p.mesh.position.set(p.pos.x, p.pos.y + Math.abs(Math.sin(p.hop * 12)) * 0.25 * (p.hop > 0), p.pos.z); p.mesh.rotation.y = p.dir;
    const moving = target || !p.follow, sw = Math.sin(now / 90) * 0.6 * (moving ? 1 : 0);
    const L = p.mesh.userData.legs; if (L[0]) { L[0].rotation.x = sw; L[1].rotation.x = sw; L[2].rotation.x = -sw; L[3].rotation.x = -sw; }
    if (p.mesh.userData.tail) p.mesh.userData.tail.rotation.z = Math.sin(now / (p.love > 30 ? 60 : 200)) * 0.6;
    if (p.owner) {
      const o = p.owner, oa = o.arms;
      if (o.angry > 0) { o.angry -= dt; const v = me.clone().sub(o.pos).setY(0); if (v.length() > 1.2) o.pos.addScaledVector(v.normalize(), 5.2 * dt); else if (p.follow) { p.follow = false; save(); o.angry = 0; toast(T('صاحبه مسكك ورجّعه!', 'The owner caught you and took it back!')); } o.mesh.rotation.y = Math.atan2(v.x, v.z); }
      else o.mesh.rotation.y = p.dir;
      o.mesh.position.copy(o.pos); const s2 = Math.sin(now / (o.angry > 0 ? 70 : 140)) * 0.6; if (oa[0]) { oa[0].rotation.x = -s2; oa[1].rotation.x = s2; oa[2].rotation.x = s2; oa[3].rotation.x = -s2; }
    }
    const d = p.pos.distanceTo(me); if (d < best) { best = d; near = p; }
  });
  hearts.forEach(h => { h.t += dt; h.h.position.y += dt * 1.2; h.h.material.transparent = true; h.h.material.opacity = 1 - h.t; if (h.t > 1) scene.remove(h.h); });
  for (let i = hearts.length - 1; i >= 0; i--) if (hearts[i].t > 1) hearts.splice(i, 1);
  drawUi();
  requestAnimationFrame(tick);
})(last);
