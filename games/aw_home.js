// ASER WORLD web — phase 7: ASER CITY 150 houses (buy · rent · grow · enter · sell) + your own land in the wild lands
// numbers from Unity AserEstate.cs, AserHomeGrow.cs, AserLand.cs
import { THREE, mat, model, T, beep, walls } from './engine.js';
import { egp } from './aw_eco.js?v=V55';

export const HOUSE_PRICE = i => 80000 + ((i * 7919 + 13) % 17) * 60000 + (i % 5 === 0 ? 500000 : 0);
const RENT = i => Math.floor(HOUSE_PRICE(i) / 50), MAX_HOUSES = 3, RENT_EVERY = 600, PTS_PER_LV = 3;
const LV_NAMES = [['HOUSE', 'بيت'], ['BIG HOUSE', 'بيت كبير'], ['APARTMENT BUILDING', 'عمارة'], ['PALACE', 'قصر'], ['VILLAS', 'فلل'], ['SKY TOWER', 'برج'], ['ROYAL CASTLE', 'قلعة ملكية']];
const level = pts => Math.max(0, Math.min(LV_NAMES.length - 1, Math.floor(pts / PTS_PER_LV)));
const LAND_PRICE = (w, d) => { const a = w * d; return Math.round(40 * a * (1 + a / 200000)); }, MAX_LANDS = 3, MIN_SIDE = 10;
const WALL_C = [0xfef3c7, 0xe0e7ff, 0xfce7f3, 0xdcfce7, 0xf1f5f9], ROOF_C = [0x991b1b, 0x1e3a8a, 0x166534];

export function setupHome(ctx) {
  const { scene, me, pos, toast, save, panel, label, city, avoid, wild, room, extraFloors, goTo } = ctx;
  me.houses = me.houses || []; me.lands = me.lands || []; me.rentT = me.rentT || 0;

  // ---------- 150 houses on a grid in ASER CITY (cells near the police/jail stay free) ----------
  const H = []; const pitch = 11, cols = 16, rows = 10, x0 = city.x - (cols - 1) * pitch / 2, z0 = city.z - (rows - 1) * pitch / 2;
  for (let r = 0; r < rows && H.length < 150; r++) for (let c = 0; c < cols && H.length < 150; c++) {
    const x = x0 + c * pitch, z = z0 + r * pitch; if (avoid.some(a => Math.hypot(x - a.x, z - a.z) < 13)) continue;
    H.push({ i: H.length, x, z, door: { x, z: z + 4.2 } });
  }
  const bodyI = new THREE.InstancedMesh(new THREE.BoxGeometry(7, 4, 7), new THREE.MeshStandardMaterial({ roughness: 0.8 }), H.length);
  const roofI = new THREE.InstancedMesh(new THREE.ConeGeometry(5.66, 3.6, 4), new THREE.MeshStandardMaterial({ roughness: 0.7 }), H.length);
  const doorI = new THREE.InstancedMesh(new THREE.BoxGeometry(1.4, 2.4, 0.15), mat(0x7c2d12), H.length);
  const o = new THREE.Object3D(), col = new THREE.Color();
  H.forEach((h, k) => {
    o.position.set(h.x, 2, h.z); o.rotation.set(0, 0, 0); o.scale.set(1, 1, 1); o.updateMatrix(); bodyI.setMatrixAt(k, o.matrix); bodyI.setColorAt(k, col.setHex(WALL_C[k % 5]));
    o.position.set(h.x, 5.8, h.z); o.rotation.set(0, Math.PI / 4, 0); o.updateMatrix(); roofI.setMatrixAt(k, o.matrix); roofI.setColorAt(k, col.setHex(ROOF_C[(k * 7) % 3]));
    o.position.set(h.x, 1.2, h.z + 3.55); o.rotation.set(0, 0, 0); o.updateMatrix(); doorI.setMatrixAt(k, o.matrix);
    walls.push({ x0: h.x - 3.5, z0: h.z - 3.5, x1: h.x + 3.5, z1: h.z + 3.5, tall: true });
  });
  for (const m of [bodyI, roofI, doorI]) { m.castShadow = m.receiveShadow = true; scene.add(m); }
  label(T('ASER CITY · 150 HOUSES', 'ASER CITY · 150 بيت'), '#ffd040', 4, city.x, 16, city.z - 60);
  // your houses get a bigger shape every level (the instance is hidden under it)
  const owned = new Map();
  function shapeFor(lv) {
    const g = new THREE.Group(), b = (w, h, d, c, x, y, z) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat(c)); m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; g.add(m); return m; };
    const roof = (w, y, c) => { const m = new THREE.Mesh(new THREE.ConeGeometry(w * 0.72, w * 0.5, 4), mat(c)); m.rotation.y = Math.PI / 4; m.position.y = y; g.add(m); };
    if (lv === 0) { b(7, 4, 7, 0xfef3c7, 0, 2, 0); roof(7.6, 5.8, 0xb91c1c); }
    else if (lv === 1) { b(8.6, 5, 8.6, 0xfde68a, 0, 2.5, 0); roof(9.2, 6.6, 0x1d4ed8); b(3, 2, 3, 0xfde68a, 3.5, 6, 0); }
    else if (lv === 2) { b(8.6, 12, 8.6, 0xe5e7eb, 0, 6, 0); for (let y = 2; y < 12; y += 3) b(8.7, 0.8, 8.7, 0x93c5fd, 0, y, 0); }
    else if (lv === 3) { b(9.4, 7, 9.4, 0xfffbeb, 0, 3.5, 0); for (const [x, z] of [[-4.3, -4.3], [4.3, -4.3], [-4.3, 4.3], [4.3, 4.3]]) b(1.4, 10, 1.4, 0xfcd34d, x, 5, z); const d = new THREE.Mesh(new THREE.SphereGeometry(3.2, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2), mat(0xfbbf24)); d.position.y = 7; g.add(d); }
    else if (lv === 4) { b(4.2, 5, 9, 0xf5f5f4, -2.4, 2.5, 0); b(4.2, 5, 9, 0xf5f5f4, 2.4, 2.5, 0); b(9.6, 0.4, 9.6, 0x0ea5e9, 0, 0.2, 0); roof(5, 6.4, 0x78350f); }
    else if (lv === 5) { b(6, 22, 6, 0x1e293b, 0, 11, 0); for (let y = 2; y < 22; y += 2.5) b(6.1, 0.6, 6.1, 0x38bdf8, 0, y, 0); }
    else { b(10, 8, 10, 0x9ca3af, 0, 4, 0); for (const [x, z] of [[-5, -5], [5, -5], [-5, 5], [5, 5]]) { b(2.6, 13, 2.6, 0x6b7280, x, 6.5, z); const c = new THREE.Mesh(new THREE.ConeGeometry(2, 3, 8), mat(0x7c3aed)); c.position.set(x, 14.5, z); g.add(c); } b(4, 12, 4, 0x6b7280, 0, 6, 0); }
    return g;
  }
  const hideInst = (k, hide) => { bodyI.getMatrixAt(k, o.matrix); o.matrix.decompose(o.position, o.quaternion, o.scale); o.scale.setScalar(hide ? 0.001 : 1); o.updateMatrix(); bodyI.setMatrixAt(k, o.matrix); bodyI.instanceMatrix.needsUpdate = true; roofI.getMatrixAt(k, o.matrix); o.matrix.decompose(o.position, o.quaternion, o.scale); o.scale.setScalar(hide ? 0.001 : 1); o.updateMatrix(); roofI.setMatrixAt(k, o.matrix); roofI.instanceMatrix.needsUpdate = true; };
  function refreshOwned() {
    for (const [k, v] of owned) { scene.remove(v.g); if (v.sign) scene.remove(v.sign); hideInst(k, false); } owned.clear();
    for (const mh of me.houses) { const h = H[mh.i]; if (!h) continue; const lv = level(mh.pts), g = shapeFor(lv); g.position.set(h.x, 0, h.z); scene.add(g); hideInst(h.i, true); owned.set(h.i, { g, sign: label(T('YOUR ', '') + T(LV_NAMES[lv][0], LV_NAMES[lv][1]) + T('', ' بتاعك'), '#ffd040', 1.8, h.x, lv === 5 ? 25 : lv === 2 ? 15 : 11, h.z) }); }
  }
  refreshOwned();

  // ---------- inside your house (one room far away, furniture grows with the level) ----------
  const R = room; let inside = null;
  const roomG = new THREE.Group(); scene.add(roomG);
  { const f = new THREE.Mesh(new THREE.BoxGeometry(24, 1, 18), mat(0xd6b48a)); f.position.set(R.x, -0.5, R.z); scene.add(f); extraFloors.push({ x0: R.x - 12, z0: R.z - 9, x1: R.x + 12, z1: R.z + 9 });
    for (const [w, d, x, z] of [[24, 0.5, 0, -9], [24, 0.5, 0, 9], [0.5, 18, -12, 0], [0.5, 18, 12, 0]]) { const m = new THREE.Mesh(new THREE.BoxGeometry(w, 5, d), mat(0xfef3c7)); m.position.set(R.x + x, 2.5, R.z + z); scene.add(m); walls.push({ x0: R.x + x - w / 2 - 0.2, z0: R.z + z - d / 2 - 0.2, x1: R.x + x + w / 2 + 0.2, z1: R.z + z + d / 2 + 0.2, tall: true }); } }
  const exitRing = new THREE.Mesh(new THREE.TorusGeometry(1.3, 0.2, 10, 30), new THREE.MeshBasicMaterial({ color: 0x22c55e })); exitRing.position.set(R.x, 1.6, R.z + 7.5); scene.add(exitRing);
  function furnish(lv) {
    while (roomG.children.length) roomG.remove(roomG.children[0]);
    const put = (n, x, z, ry, s, fb) => { const m = model(n); if (m) { m.position.set(R.x + x, 0, R.z + z); m.rotation.y = ry || 0; if (s) m.scale.setScalar(s); roomG.add(m); } else if (fb) { const b = new THREE.Mesh(new THREE.BoxGeometry(fb[0], fb[1], fb[2]), mat(fb[3])); b.position.set(R.x + x, fb[1] / 2, R.z + z); roomG.add(b); } };
    put('bed', -8, -6, 0, 1, [2, 0.8, 3, 0x6d28d9]); put('sofa', 6, -6, 0, 1, [3, 1, 1.2, 0x2563eb]);
    if (lv >= 1) put('table', 0, -2, 0, 1, [2, 0.9, 1.2, 0x92400e]);
    if (lv >= 2) put('shelf', 10, 2, -Math.PI / 2, 1, [0.6, 2.2, 2, 0x78350f]);
    if (lv >= 3) put('lamp', -10, 6, 0, 1, [0.4, 2, 0.4, 0xfacc15]);
    if (lv >= 4) put('wardrobe', -10, 0, Math.PI / 2, 1, [0.8, 2.4, 2, 0x92400e]);
    if (lv >= 5) put('tower', 9, 6, 0, 0.3, [1, 3, 1, 0x64748b]);
    if (lv >= 6) put('chest', 0, 4, 0, 1.2, [1.4, 1, 1, 0xd4af37]);
  }
  function enter(mh) { inside = mh; furnish(level(mh.pts)); pos.set(R.x, 0, R.z + 5); ctx.ground(); toast(T('WELCOME HOME! (YOUR ', 'أهلاً بيك في البيت! (') + T(LV_NAMES[level(mh.pts)][0], LV_NAMES[level(mh.pts)][1]) + ')'); }
  function leaveHome() { const h = H[inside.i]; inside = null; pos.set(h.door.x, 0, h.door.z + 2); ctx.ground(); }

  // ---------- panels ----------
  const row = (html, btns) => { const d = document.createElement('div'); d.className = 'prow'; d.innerHTML = '<div>' + html + '</div>'; for (const [t, fn, dis] of btns || []) { const b = document.createElement('button'); b.type = 'button'; b.textContent = t; b.disabled = !!dis; b.onclick = fn; d.appendChild(b); } return d; };
  const mine = i => me.houses.find(h => h.i === i);
  const close = () => { document.getElementById('panel').hidden = true; };
  function housePanel(i) {
    const m = mine(i);
    panel(T('HOUSE #', 'بيت رقم ') + (i + 1), b => {
      b.appendChild(row((m ? '<b style="color:#86efac">' + T('THIS IS YOUR HOUSE', 'ده بيتك') + '</b> · ' + T(LV_NAMES[level(m.pts)][0], LV_NAMES[level(m.pts)][1]) + ' · ' + T('next level in ', 'المستوى الجاي بعد ') + Math.max(0, (level(m.pts) + 1) * PTS_PER_LV - m.pts) * 10 + ' min' : '<b style="color:#86efac">' + T('FOR SALE', 'للبيع') + '</b> · ' + T('PRICE ', 'السعر ') + egp(HOUSE_PRICE(i))) + '<br><small>' + T('RENT: ', 'الإيجار: ') + egp(RENT(i)) + T(' EVERY 10 MINUTES (WHILE YOU PLAY) · MAX 3 HOUSES · your house grows every 30 minutes and never shrinks', ' كل 10 دقايق (وانت بتلعب) · أقصى حاجة 3 بيوت · بيتك بيكبر كل نص ساعة وعمره ما بيصغر') + '</small>'));
      if (m) b.appendChild(row('', [[T('ENTER', 'ادخل'), () => { close(); enter(m); }], [T('SELL ', 'بيع ') + egp(Math.floor(HOUSE_PRICE(i) * 6 / 10)), () => { const back = Math.floor(HOUSE_PRICE(i) * 6 / 10); me.houses = me.houses.filter(h => h.i !== i); me.money += back; toast(T('YOU SOLD HOUSE #', 'بعت البيت رقم ') + (i + 1) + T(' FOR ', ' بـ ') + egp(back)); save(); refreshOwned(); close(); }]]));
      else b.appendChild(row('', [[T('BUY ', 'اشتري ') + egp(HOUSE_PRICE(i)), () => { if (me.houses.length >= MAX_HOUSES) return toast(T('YOU CAN HAVE 3 HOUSES MAX', 'أقصى حاجة 3 بيوت')); if (me.money < HOUSE_PRICE(i)) return toast(T('YOU NEED ', 'محتاج ') + egp(HOUSE_PRICE(i))); me.money -= HOUSE_PRICE(i); me.houses.push({ i, pts: 0 }); toast(T('YOU BOUGHT HOUSE #', 'اشتريت البيت رقم ') + (i + 1) + T('! RENT: ', '! الإيجار: ') + egp(RENT(i)) + T(' EVERY 10 MIN · PHONE > MY HOUSES', ' كل 10 دقايق · التليفون ← بيوتي')); beep(990, 0.3, 'triangle', 0.06); save(); refreshOwned(); close(); }, me.houses.length >= MAX_HOUSES || me.money < HOUSE_PRICE(i)]]));
    });
  }
  function myHouses() {
    panel(T('MY HOUSES', 'بيوتي'), b => {
      b.appendChild(row('💰 ' + egp(me.money) + ' · ' + me.houses.length + ' / 3' + '<br><small>' + T('Next rent in ', 'الإيجار الجاي بعد ') + Math.ceil((RENT_EVERY - me.rentT) / 60) + ' min</small>', [[T('GO TO ASER CITY', 'روح ASER CITY'), () => { close(); goTo(city.x, city.z - 62); }]]));
      if (!me.houses.length) b.appendChild(row(T('You have no houses yet. Walk to any door in ASER CITY and press E.', 'لسه معندكش بيوت. روح لأي باب في ASER CITY ودوس E.')));
      me.houses.forEach(m => b.appendChild(row('🏠 #' + (m.i + 1) + ' · ' + T(LV_NAMES[level(m.pts)][0], LV_NAMES[level(m.pts)][1]) + '<br><small>' + T('rent ', 'إيجار ') + egp(RENT(m.i)) + '</small>', [[T('GO', 'روح'), () => { close(); const h = H[m.i]; goTo(h.door.x, h.door.z + 2); }], [T('ENTER', 'ادخل'), () => { close(); enter(m); }]])));
    });
  }

  // ---------- your land (wild lands: Unity AserLand) ----------
  const W = wild;
  { const g = new THREE.Mesh(new THREE.BoxGeometry(W.size, 1, W.size), mat(0x5b8c3a)); g.position.set(W.x, -0.5, W.z); g.receiveShadow = true; scene.add(g); const s = new THREE.Mesh(new THREE.BoxGeometry(W.size - 4, 20, W.size - 4), mat(0x6b4f2c)); s.position.set(W.x, -11, W.z); scene.add(s); extraFloors.push({ x0: W.x - W.size / 2, z0: W.z - W.size / 2, x1: W.x + W.size / 2, z1: W.z + W.size / 2 }); label(T('THE WILD LANDS · claim your own land (PHONE > MY LAND)', 'الأراضي البرية · اشتري أرضك (التليفون ← أرضي)'), '#bbf7d0', 4, W.x, 14, W.z - W.size / 2 + 20); }
  const landObjs = [];
  function drawLands() {
    for (const o2 of landObjs) scene.remove(o2); landObjs.length = 0;
    me.lands.forEach(c => { const g = new THREE.Group(); const per = 2 * (c.w + c.d), n = Math.min(80, Math.max(4, Math.floor(per / 12)));
      for (let k = 0; k < n; k++) { const t = k / n * per; let x, z; if (t < c.w) { x = c.x0 + t; z = c.z0; } else if (t < c.w + c.d) { x = c.x0 + c.w; z = c.z0 + t - c.w; } else if (t < 2 * c.w + c.d) { x = c.x0 + c.w - (t - c.w - c.d); z = c.z0 + c.d; } else { x = c.x0; z = c.z0 + c.d - (t - 2 * c.w - c.d); } const p = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 2.2, 6), mat(0xffd040, { emissive: 0x806000, emissiveIntensity: 0.5 })); p.position.set(x, 1.1, z); g.add(p); }
      for (const [x, z] of [[c.x0, c.z0], [c.x0 + c.w, c.z0], [c.x0, c.z0 + c.d], [c.x0 + c.w, c.z0 + c.d]]) { const f = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.8, 0.05), mat(0xdc2626)); f.position.set(x + 0.6, 3.2, z); g.add(f); const p = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 3.6, 6), mat(0xe5e7eb)); p.position.set(x, 1.8, z); g.add(p); }
      scene.add(g); landObjs.push(g); landObjs.push(label(T('YOUR LAND', 'أرضك') + ' · ' + c.w + ' × ' + c.d + ' m', '#fde68a', 2, c.x0 + c.w / 2, 5, c.z0 + c.d / 2)); });
  }
  drawLands();
  const inWild = (x0, z0, w, d) => x0 >= W.x - W.size / 2 && z0 >= W.z - W.size / 2 && x0 + w <= W.x + W.size / 2 && z0 + d <= W.z + W.size / 2;
  function landPanel() {
    panel(T('MY LAND', 'أرضي'), b => {
      b.appendChild(row(T('Stand in the WILD LANDS, type the length × width in metres, and claim the land in front of you. Bigger land costs more per metre. 3 lands max. Selling gives back half.', 'اقف في الأراضي البرية، واكتب الطول × العرض بالمتر، واشتري الأرض اللي قدامك. كل ما تكبر المتر بيغلى. أقصى حاجة 3 أراضي. البيع بيرجعلك النص.'), [[T('GO TO THE WILD LANDS', 'روح الأراضي البرية'), () => { close(); goTo(W.x, W.z - W.size / 2 + 8); }]]));
      const f = document.createElement('div'); f.className = 'prow'; f.innerHTML = '<div style="direction:ltr;display:flex;gap:6px;align-items:center"><input id="lnL" type="number" min="10" value="40" style="width:80px;padding:8px;border-radius:10px;border:0;font-weight:900"> × <input id="lnW" type="number" min="10" value="30" style="width:80px;padding:8px;border-radius:10px;border:0;font-weight:900"> m <span id="lnP" style="font-weight:900;color:#ffd040"></span></div>';
      const btn = document.createElement('button'); btn.type = 'button'; btn.textContent = T('CLAIM HERE', 'اشتري هنا'); f.appendChild(btn); b.appendChild(f);
      const lI = f.querySelector('#lnL'), wI = f.querySelector('#lnW'), pr = f.querySelector('#lnP');
      const upd = () => { const l = +lI.value, w = +wI.value; pr.textContent = l >= MIN_SIDE && w >= MIN_SIDE ? '= ' + egp(LAND_PRICE(l, w)) : ''; };
      for (const i of [lI, wI]) { i.oninput = upd; i.onkeydown = e => e.stopPropagation(); i.onkeyup = e => e.stopPropagation(); } upd();
      btn.onclick = () => {
        const l = Math.round(+lI.value), w = Math.round(+wI.value);
        if (me.lands.length >= MAX_LANDS) return toast(T('YOU CAN OWN 3 LANDS MAX • SELL ONE FIRST', 'أقصى حاجة 3 أراضي • بيع واحدة الأول'));
        if (!(l >= MIN_SIDE && w >= MIN_SIDE)) return toast(T('Each side must be at least 10 m', 'كل ضلع 10 متر على الأقل'));
        const c = { x0: Math.round(pos.x - w / 2), z0: Math.round(pos.z + 2), w, d: l };
        if (!inWild(c.x0, c.z0, c.w, c.d)) return toast(T("CAN'T CLAIM HERE: it must be inside the wild lands", 'ما ينفعش هنا: لازم تبقى جوه الأراضي البرية'));
        if (me.lands.some(o2 => c.x0 < o2.x0 + o2.w && c.x0 + c.w > o2.x0 && c.z0 < o2.z0 + o2.d && c.z0 + c.d > o2.z0)) return toast(T("CAN'T CLAIM HERE: it touches your other land", 'ما ينفعش هنا: داخلة في أرضك التانية'));
        const p2 = LAND_PRICE(l, w); if (me.money < p2) return toast(T('THIS LAND COSTS ', 'الأرض دي بـ ') + egp(p2));
        me.money -= p2; me.lands.push(c); toast(T('THIS LAND IS YOURS! ', 'الأرض دي بقت بتاعتك! ') + w + ' × ' + l + ' m · -' + egp(p2)); beep(990, 0.3, 'triangle', 0.06); save(); drawLands(); landPanel();
      };
      me.lands.forEach((c, k) => b.appendChild(row('🚩 ' + c.w + ' × ' + c.d + ' m', [[T('GO', 'روح'), () => { close(); goTo(c.x0 + c.w / 2, c.z0 + c.d / 2); }], [T('SELL ', 'بيع ') + egp(Math.floor(LAND_PRICE(c.w, c.d) / 2)), () => { me.money += Math.floor(LAND_PRICE(c.w, c.d) / 2); me.lands.splice(k, 1); toast(T('LAND SOLD', 'الأرض اتباعت')); save(); drawLands(); landPanel(); }]])));
    });
  }

  let onLand = -1;
  return {
    myHouses, landPanel, inHouse: () => !!inside,
    prompt() {
      if (inside) { if (Math.hypot(pos.x - exitRing.position.x, pos.z - exitRing.position.z) < 2.5) return [T('E: GO OUTSIDE', 'E: اطلع برا'), leaveHome]; return null; }
      if (Math.abs(pos.x - city.x) > 100 || Math.abs(pos.z - city.z) > 100) return null;
      let best = null, bd = 2.6; for (const h of H) { const d = Math.hypot(pos.x - h.door.x, pos.z - h.door.z); if (d < bd) { bd = d; best = h; } }
      if (!best) return null; const m = mine(best.i);
      return [m ? T('E: YOUR HOUSE #', 'E: بيتك رقم ') + (best.i + 1) : T('E: HOUSE #', 'E: البيت رقم ') + (best.i + 1) + T(' FOR SALE (', ' للبيع (') + egp(HOUSE_PRICE(best.i)) + ')', () => housePanel(best.i)];
    },
    update(dt) {
      exitRing.rotation.y += dt * 2;
      if (inside && (Math.abs(pos.x - R.x) > 30 || Math.abs(pos.z - R.z) > 30)) inside = null;
      // rent + growth: every 10 minutes of play (Unity AserEstateTick)
      if (me.houses.length) { me.rentT += dt; if (me.rentT >= RENT_EVERY) { me.rentT = 0; let sum = 0, grew = false; for (const m of me.houses) { sum += RENT(m.i); const b = level(m.pts); m.pts++; if (level(m.pts) > b) grew = true; } me.money += sum; toast(T('RENT! YOUR ', 'إيجار! بيوتك (') + me.houses.length + T(' HOUSE(S) PAID YOU ', ') دفعولك ') + egp(sum) + (grew ? T(' · YOUR HOUSE GREW!', ' · بيتك كبر!') : '')); beep(880, 0.3, 'triangle', 0.06); save(); if (grew) refreshOwned(); } }
      // walking onto your land
      const k = me.lands.findIndex(c => pos.x > c.x0 && pos.x < c.x0 + c.w && pos.z > c.z0 && pos.z < c.z0 + c.d);
      if (k !== onLand) { onLand = k; if (k >= 0) toast(T('WELCOME TO YOUR LAND (', 'أهلاً بيك في أرضك (') + me.lands[k].w + ' × ' + me.lands[k].d + ' m)'); }
    }
  };
}
