// ASER WORLD web — phase 5: cars, plane, ships + harbor and sea, lane races (numbers from Unity AserCars.cs, AserVehicles.cs, AserFlight.cs, AserSea.cs, AserLaneRace.cs)
import { THREE, mat, model, T, beep, view, input } from './engine.js';
import { egp } from './aw_eco.js?v=V57';

const C = (n, ar, price, speed, len, bike) => ({ n, ar, price, speed, len, bike });
export const CARS = [
  C('MOTORCYCLE', 'موتوسيكل', 3000, 2.2, 2.4, 1), C('RED TRUCK', 'نص نقل أحمر', 8000, 2.5, 4.2), C('YELLOW TRUCK', 'نص نقل أصفر', 15000, 2.8, 4.2), C('GREEN TRUCK', 'نص نقل أخضر', 25000, 3.1, 4.4),
  C('PURPLE TRUCK', 'نص نقل بنفسجي', 40000, 3.5, 4.6), C('LITTLE HATCH', 'هاتشباك صغيرة', 20000, 3.0, 4.0), C('CITY SEDAN', 'سيدان', 30000, 3.3, 4.4), C('FAMILY WAGON', 'عربية عيلة', 35000, 3.2, 4.6),
  C('YELLOW TAXI', 'تاكسي أصفر', 45000, 3.4, 4.4), C('AMBULANCE', 'إسعاف', 60000, 3.4, 5.2), C('CITY BUS', 'أتوبيس', 80000, 2.9, 8), C('SCHOOL BUS', 'أتوبيس مدرسة', 90000, 3.0, 8),
  C('BICYCLE', 'عجلة', 1000, 1.6, 1.9, 1), C('ARMY TANK', 'دبابة', 500000, 2.6, 5.2)
];
const CAR_COL = [0x1f2937, 0xdc2626, 0xeab308, 0x16a34a, 0x7c3aed, 0x60a5fa, 0xe5e7eb, 0x92400e, 0xfacc15, 0xffffff, 0x2563eb, 0xf59e0b, 0x0ea5e9, 0x4d5d32];
const PLANE_PRICE = 250000, PLANE_TRIP = 2000;
const S = (n, ar, price, speed, size) => ({ n, ar, price, speed, size });
export const SHIPS = [S('ROW BOAT', 'قارب صغير', 0, 10, 3.2), S('SAIL BOAT', 'مركب شراعي', 20000, 15, 6), S('BIG SHIP', 'سفينة كبيرة', 120000, 19, 9), S('PIRATE SHIP', 'سفينة قراصنة', 450000, 24, 13), S('GHOST SHIP', 'سفينة الأشباح', 2000000, 28, 13)];
const TRACKS = [['GREEN VALLEY', 'الوادي الأخضر', 0x4ade80], ['DESERT DUNES', 'كثبان الصحرا', 0xe9c46a], ['SNOW PEAK', 'قمة التلج', 0xf1f5f9], ['NEON CITY NIGHT', 'مدينة النيون بالليل', 0xa855f7]];
const TRACK_LV = [1, 20, 50, 100], TRACK_LEN = [900, 1200, 1500, 1800], TRACK_SEED = [2026, 77, 313, 909], LANE_W = 4.2;
const carSpeed = i => 12 + CARS[i].speed * 8;            // m/s on the web map (cars are faster than running)
const laneSpeed = i => 16 + CARS[i].speed * 5;           // Unity LaneRace.SpeedFor
const nm = o => T(o.n, o.ar);

export function setupRide(ctx) {
  const { scene, me, pos, player, toast, save, gainXp, panel, label, block, hasFloor, places, extraFloors, camera } = ctx;
  me.cars = me.cars || 0; me.car = me.car ?? -1; me.carPos = me.carPos || null; me.plane = me.plane || false; me.planePos = me.planePos || null; me.ships = me.ships || 1; me.ship = me.ship ?? 0; me.best = me.best || [0, 0, 0, 0]; me.chests = me.chests || {};
  let mode = null;   // null | 'car' | 'plane' | 'ship' | 'race'
  let speed = 0, heading = 0, vyv = 0, alt = 0, callT = 0;
  const now = () => performance.now() / 1000;

  // ---------- meshes ----------
  function carMesh(i) {
    const g = new THREE.Group(), d = CARS[i], col = CAR_COL[i];
    const glb = model(d.bike ? 'bike' : 'car');
    if (glb && i !== 13) { glb.scale.setScalar(d.bike ? 1 : d.len / 4.2); g.add(glb); glb.traverse(o => { if (o.isMesh && /body|paint|car/i.test(o.material.name || '')) { o.material = o.material.clone(); o.material.color.setHex(col); } }); }
    else {
      const b = (w, h, l, c, y, z) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, l), mat(c)); m.position.set(0, y, z || 0); m.castShadow = true; g.add(m); return m; };
      if (d.bike) { b(0.3, 0.6, d.len, col, 0.7); b(0.1, 0.7, 0.1, 0x111111, 1.2, d.len * 0.35); }
      else { b(2, 0.9, d.len, col, 0.75); b(1.8, 0.8, d.len * 0.5, i === 13 ? col : 0x93c5fd, 1.55, -0.1); if (i === 13) { const gun = b(0.3, 0.3, 3, 0x334155, 1.6, 2); gun.position.z = 2.2; } }
      for (const [x, z] of [[-1, 1], [1, 1], [-1, -1], [1, -1]]) { if (d.bike && x > 0) continue; const w = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.3, 14), mat(0x111111)); w.rotation.z = Math.PI / 2; w.position.set(d.bike ? 0 : x * 1.05, 0.42, z * d.len * 0.33); g.add(w); }
    }
    return g;
  }
  function planeMesh() {
    const g = new THREE.Group(), b = (w, h, l, c, x, y, z) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, l), mat(c)); m.position.set(x, y, z); m.castShadow = true; g.add(m); };
    b(1.4, 1.4, 8, 0xf8fafc, 0, 1.4, 0); b(11, 0.2, 1.8, 0x2563eb, 0, 1.4, 0.4); b(4, 0.2, 1.1, 0x2563eb, 0, 1.8, -3.4); b(0.2, 1.6, 1.1, 0xdc2626, 0, 2.5, -3.4); b(0.9, 0.7, 1.2, 0x93c5fd, 0, 2.1, 1.8);
    return g;
  }
  function shipMesh(i) {
    const s = SHIPS[i], g = new THREE.Group(), k = s.size / 6;
    const glb = model('boat'); if (glb) { glb.scale.setScalar(k * 1.2); g.add(glb); }
    else { const hull = new THREE.Mesh(new THREE.BoxGeometry(2.4 * k, 1.2 * k, s.size), mat(i === 4 ? 0x334155 : 0x7c4a1e)); hull.position.y = 0.4; g.add(hull); }
    if (i > 0) { const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.12 * k, 0.12 * k, 5 * k, 8), mat(0x5b3a1e)); mast.position.y = 2.6 * k; g.add(mast); const sail = new THREE.Mesh(new THREE.PlaneGeometry(3 * k, 3.4 * k), new THREE.MeshStandardMaterial({ color: i === 4 ? 0x94a3b8 : i === 3 ? 0x111827 : 0xf8fafc, side: THREE.DoubleSide, transparent: i === 4, opacity: 0.7 })); sail.position.y = 3 * k; g.add(sail); }
    return g;
  }
  let carObj = null, planeObj = null, shipObj = null;
  function placeCar() { if (carObj) scene.remove(carObj); carObj = null; if (me.car >= 0 && me.carPos) { carObj = carMesh(me.car); carObj.position.set(me.carPos.x, 0, me.carPos.z); carObj.rotation.y = me.carPos.h || 0; scene.add(carObj); } }
  function placePlane() { if (planeObj) scene.remove(planeObj); planeObj = null; if (me.plane && me.planePos) { planeObj = planeMesh(); planeObj.position.set(me.planePos.x, 0, me.planePos.z); planeObj.rotation.y = me.planePos.h || 0; scene.add(planeObj); } }
  placeCar(); placePlane();

  // ---------- CAR DEALER + RACE building in ASER TOWN ----------
  const D = places.dealer, R = places.race;
  block(D.x, D.z, 14, 10, 5, 0x1e3a8a); label(T('CAR DEALER', 'محل العربيات'), '#93c5fd', 2.2, D.x, 8, D.z);
  block(R.x, R.z, 12, 9, 5, 0x18181b); label('🏁 RACE', '#ff3030', 2.2, R.x, 8, R.z);

  // ---------- SEA + ASER HARBOR (Unity AserSea: harbor, 5 ships, 14 islets with treasure, shipwreck) ----------
  const SEA = places.sea;   // {x0,z0,x1,z1}
  const water = new THREE.Mesh(new THREE.PlaneGeometry(SEA.x1 - SEA.x0, SEA.z1 - SEA.z0), new THREE.MeshStandardMaterial({ color: 0x1e6fd9, roughness: 0.2, metalness: 0.1, transparent: true, opacity: 0.92 }));
  water.rotation.x = -Math.PI / 2; water.position.set((SEA.x0 + SEA.x1) / 2, -0.4, (SEA.z0 + SEA.z1) / 2); scene.add(water);
  const H = places.harbor;   // harbor platform (walkable)
  const hp = new THREE.Mesh(new THREE.BoxGeometry(60, 1, 30), mat(0x8b5a2b)); hp.position.set(H.x, -0.5, H.z); hp.receiveShadow = true; scene.add(hp);
  extraFloors.push({ x0: H.x - 30, z0: H.z - 15, x1: H.x + 30, z1: H.z + 15 });
  label('⚓ ASER HARBOR', '#7dd3fc', 3, H.x, 9, H.z); block(H.x + 20, H.z + 8, 8, 6, 4, 0x0f766e); label(T('SHIPS', 'السفن'), '#ffffff', 1.6, H.x + 20, 6, H.z + 8);
  const inSea = p => p.x > SEA.x0 && p.x < SEA.x1 && p.z > SEA.z0 && p.z < SEA.z1 && !hasFloor(p);
  let rs = 1717; const rnd = () => ((rs = (rs * 16807) % 2147483647) / 2147483647);
  const islets = [];
  for (let i = 0; i < 14; i++) {
    let x, z, k = 0; do { x = SEA.x0 + 40 + rnd() * (SEA.x1 - SEA.x0 - 80); z = SEA.z0 + 40 + rnd() * (SEA.z1 - SEA.z0 - 80); k++; } while ((Math.hypot(x - H.x, z - H.z) < 120 || hasFloor({ x, z })) && k < 30);
    const r = 8 + rnd() * 10; const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r + 2, 1.6, 20), mat(0xe9d8a6)); m.position.set(x, -0.2, z); scene.add(m);
    const palm = new THREE.Mesh(new THREE.ConeGeometry(2.2, 3, 7), mat(0x2f9e44)); palm.position.set(x, 4.2, z); scene.add(palm); const tr = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.3, 3, 6), mat(0x7c4a1e)); tr.position.set(x, 2, z); scene.add(tr);
    const chest = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.9, 0.8), mat(0xb45309)); chest.position.set(x + r * 0.5, 1.05, z); scene.add(chest);
    extraFloors.push({ x0: x - r, z0: z - r, x1: x + r, z1: z + r }); islets.push({ x, z, r, chest, i });
  }
  { const w = new THREE.Mesh(new THREE.BoxGeometry(5, 3, 16), mat(0x3f2a1c)); w.position.set(SEA.x0 + 120, 0.2, SEA.z1 - 200); w.rotation.set(0.3, 0.7, 0.25); scene.add(w); label(T('SHIPWRECK', 'حطام سفينة'), '#e5e7eb', 1.6, w.position.x, 5, w.position.z); }

  // ---------- lane race tracks (far away, like Unity OriginOf) ----------
  let race = null;
  function buildRace(t, car) {
    const ox = places.raceOrigin.x + t * 60, oz = places.raceOrigin.z, L = TRACK_LEN[t], g = new THREE.Group();
    const road = new THREE.Mesh(new THREE.BoxGeometry(LANE_W * 3 + 2, 1, L + 40), mat(t === 3 ? 0x111827 : 0x374151)); road.position.set(ox, -0.5, oz + L / 2); g.add(road);
    const side = new THREE.Mesh(new THREE.BoxGeometry(60, 0.8, L + 40), mat(TRACKS[t][2])); side.position.set(ox, -0.7, oz + L / 2); g.add(side);
    for (const s of [-1, 1]) for (let z = 0; z < L; z += 8) { const l = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.05, 3), mat(0xffffff)); l.position.set(ox + s * LANE_W / 2, 0.03, oz + z); g.add(l); }
    let r = TRACK_SEED[t]; const nr = () => ((r = (r * 16807 + 11) % 2147483647) / 2147483647);
    const obs = [];
    for (let z = 60; z < L - 40; z += 22 - t * 2 + nr() * 10) { const free = Math.floor(nr() * 3); for (let l = 0; l < 3; l++) { if (l === free) { if (nr() < 0.6) obs.push({ z, l, k: 2 }); continue; } const k = nr(); obs.push({ z, l, k: k < 0.45 ? 0 : k < 0.85 ? 1 : 3 }); } }
    for (const o of obs) {
      const x = ox + (o.l - 1) * LANE_W, z = oz + o.z;
      const m = o.k === 0 ? new THREE.Mesh(new THREE.BoxGeometry(LANE_W - 0.6, 0.8, 0.6), mat(0xf97316)) : o.k === 1 ? new THREE.Mesh(new THREE.BoxGeometry(LANE_W - 0.4, 3, 0.8), mat(0xdc2626)) : o.k === 2 ? new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.6, 0.15, 14), mat(0xffd040, { emissive: 0xaa8800, emissiveIntensity: 0.5 })) : new THREE.Mesh(new THREE.BoxGeometry(LANE_W - 0.6, 0.6, 3), mat(0x22c55e));
      m.position.set(x, o.k === 0 ? 0.4 : o.k === 1 ? 1.5 : o.k === 2 ? 1 : 0.3, z); if (o.k === 2) m.rotation.x = Math.PI / 2; if (o.k === 3) m.rotation.x = -0.2; g.add(m); o.m = m;
    }
    const fin = new THREE.Mesh(new THREE.BoxGeometry(LANE_W * 3 + 2, 0.4, 2), mat(0xffffff)); fin.position.set(ox, 6, oz + L); g.add(fin);
    scene.add(g);
    const ride = carMesh(car); scene.add(ride);
    race = { t, car, g, obs, ox, oz, L, z: 0, lane: 1, x: 0, y: 0, vy: 0, time: -3, coins: 0, slow: 0, ride, back: { x: pos.x, z: pos.z } };
    player.visible = false; mode = 'race'; toast(T('3… 2… 1…', '3… 2… 1…'));
  }
  function endRace(done) {
    const r = race; scene.remove(r.g); scene.remove(r.ride); race = null; mode = null; player.visible = true; pos.set(r.back.x, 0, r.back.z);
    if (!done) return toast(T('Race cancelled', 'السباق اتلغى'));
    const lm = r.L / 900, win = Math.round((Math.max(1500, 14000 * lm - r.time * 160) + Math.min(120, r.coins) * 100) * (1 + r.t * 0.6));
    me.money += win; const best = !me.best[r.t] || r.time < me.best[r.t]; if (best) me.best[r.t] = +r.time.toFixed(2);
    toast('🏁 ' + r.time.toFixed(1) + 's · +' + egp(win) + (best ? T(' · NEW BEST!', ' · أحسن وقت جديد!') : '')); gainXp(50 * (r.t + 1)); beep(880, 0.4, 'triangle', 0.07); save();
  }

  // ---------- panels ----------
  const row = (html, btn, fn, dis) => { const d = document.createElement('div'); d.className = 'prow'; d.innerHTML = '<div>' + html + '</div>'; if (btn) { const b = document.createElement('button'); b.type = 'button'; b.textContent = btn; b.disabled = !!dis; b.onclick = fn; d.appendChild(b); } return d; };
  const owns = i => (me.cars >> i) & 1;
  function dealer() {
    panel(T('CAR DEALER', 'محل العربيات'), b => {
      b.appendChild(row('💰 ' + egp(me.money) + (me.car >= 0 ? ' · 🚗 ' + nm(CARS[me.car]) : '')));
      CARS.forEach((c, i) => b.appendChild(row((c.bike ? '🏍️ ' : i === 13 ? '🪖 ' : '🚗 ') + '<b>' + nm(c) + '</b><br><small>' + T('speed ', 'السرعة ') + c.speed + ' · ' + Math.round(carSpeed(i) * 3.6) + ' km/h</small>', owns(i) ? (me.car === i ? T('YOURS', 'بتاعتك') : T('USE', 'استخدم')) : egp(c.price), () => { if (!owns(i)) { if (me.money < c.price) return toast(T('YOU NEED ', 'محتاج ') + egp(c.price)); me.money -= c.price; me.cars |= 1 << i; } me.car = i; me.carPos = { x: D.x + 10, z: D.z + 9, h: 0 }; placeCar(); toast(nm(c) + T(' is parked outside!', ' راكنة برا!')); save(); dealer(); }, me.car === i || (!owns(i) && me.money < c.price))));
      b.appendChild(row('✈️ <b>' + T('PLANE', 'طيارة') + '</b><br><small>' + T('W/S speed · A/D turn · Space/Ctrl up/down · E get out (parks there)', 'W/S السرعة · A/D لف · Space/Ctrl فوق/تحت · E انزل (بتتركن مكانها)') + '</small>', me.plane ? T('OWNED', 'معاك') : egp(PLANE_PRICE), () => { if (me.money < PLANE_PRICE) return toast(T('A PLANE COSTS ', 'الطيارة بـ ') + egp(PLANE_PRICE)); me.money -= PLANE_PRICE; me.plane = true; me.planePos = { x: D.x - 14, z: D.z + 14, h: 0 }; placePlane(); toast(T('Your plane is parked outside!', 'طيارتك راكنة برا!')); save(); dealer(); }, me.plane || me.money < PLANE_PRICE));
    });
  }
  function shipShop() {
    panel(T('SHIPS', 'السفن'), b => {
      b.appendChild(row('💰 ' + egp(me.money) + ' · ⛵ ' + nm(SHIPS[me.ship])));
      SHIPS.forEach((s, i) => { const own = (me.ships >> i) & 1; b.appendChild(row('⛵ <b>' + nm(s) + '</b><br><small>' + T('speed ', 'السرعة ') + s.speed + (i >= 2 ? T(' · cannons', ' · مدافع') : '') + '</small>', own ? (me.ship === i ? T('YOURS', 'بتاعتك') : T('USE', 'استخدم')) : (s.price ? egp(s.price) : T('FREE', 'ببلاش')), () => { if (!own) { if (me.money < s.price) return toast(T('YOU NEED ', 'محتاج ') + egp(s.price)); me.money -= s.price; me.ships |= 1 << i; } me.ship = i; save(); shipShop(); }, me.ship === i || (!own && me.money < s.price))); });
    });
  }
  function raceMenu() {
    panel('🏁 RACE MASTER', b => {
      b.appendChild(row(T('Pick a track. Your car runs by itself: A/D change lane · Space jumps the low walls · collect coins · fastest time wins.', 'اختار حلبة. العربية بتجري لوحدها: A/D تغيّر الحارة · Space تنط فوق الحواجز الواطية · لمّ الفلوس · أسرع وقت يكسب.')));
      if (me.car < 0) b.appendChild(row(T('You need a car first (CAR DEALER)', 'محتاج عربية الأول (محل العربيات)')));
      TRACKS.forEach((t, i) => b.appendChild(row('<b>' + T(t[0], t[1]) + '</b> · LV ' + TRACK_LV[i] + '+ · ' + TRACK_LEN[i] + 'm<br><small>' + (me.best[i] ? T('best ', 'أحسن وقت ') + me.best[i] + 's' : T('no time yet', 'لسه مفيش وقت')) + '</small>', me.lvl < TRACK_LV[i] ? T('LOCKED', 'مقفول') : T('RACE', 'سابق'), () => { document.getElementById('panel').hidden = true; buildRace(i, me.car); }, me.car < 0 || me.lvl < TRACK_LV[i])));
    });
  }
  let callFrom = null;
  function callCar() { if (me.car < 0) return toast(T('Buy a car first (CAR DEALER)', 'اشتري عربية الأول (محل العربيات)')); const to = { x: pos.x + 3, z: pos.z + 3 }; callFrom = { x: to.x + 20, z: to.z + 20 }; me.carPos = { x: to.x, z: to.z, h: Math.atan2(-20, -20) }; placeCar(); carObj.position.set(callFrom.x, 0, callFrom.z); callT = 2.2; toast(T('Your car is driving to you...', 'عربيتك جاية لك...')); save(); }
  function callPlane() { if (!me.plane) return toast(T('BUY A PLANE FIRST (', 'اشتري طيارة الأول (') + egp(PLANE_PRICE) + ')'); if (me.money < PLANE_TRIP) return toast(T('YOU NEED ', 'محتاج ') + egp(PLANE_TRIP)); me.money -= PLANE_TRIP; me.planePos = { x: pos.x + 8, z: pos.z + 6, h: heading }; placePlane(); toast(T('YOUR PLANE IS HERE  -', 'طيارتك وصلت  -') + egp(PLANE_TRIP)); save(); }

  // ---------- enter / leave ----------
  const near = (o, r) => o && Math.hypot(pos.x - o.x, pos.z - o.z) < r;
  function enter(kind) {
    mode = kind; player.visible = false; speed = 0;
    if (kind === 'car') { heading = me.carPos.h || 0; pos.set(me.carPos.x, 0, me.carPos.z); }
    if (kind === 'plane') { heading = me.planePos.h || 0; pos.set(me.planePos.x, 0, me.planePos.z); alt = 0; speed = 0; }
    if (kind === 'ship') { heading = Math.PI; shipObj = shipMesh(me.ship); scene.add(shipObj); pos.set(H.x, 0, H.z - 22); }
    toast(kind === 'car' ? T('W/S drive · A/D steer · E get out', 'W/S سوق · A/D لف · E انزل') : kind === 'plane' ? T('W/S speed · A/D turn · Space/Ctrl up/down · E get out', 'W/S السرعة · A/D لف · Space/Ctrl فوق/تحت · E انزل') : T('W/S sail · A/D steer · E back to the harbor', 'W/S ابحر · A/D لف · E ارجع الميناء'));
  }
  function leave() {
    if (mode === 'car') { me.carPos = { x: pos.x, z: pos.z, h: heading }; pos.x += Math.cos(heading) * 2.2; pos.z -= Math.sin(heading) * 2.2; }
    if (mode === 'plane') { me.planePos = { x: pos.x, z: pos.z, h: heading }; if (alt > 1) { toast(T('You jumped out of the plane!', 'نطّيت من الطيارة!')); } pos.y = alt; pos.x += 3; ctx.setVy(0); }
    if (mode === 'ship') { scene.remove(shipObj); shipObj = null; pos.set(H.x, 0, H.z); }
    mode = null; player.visible = true; save();
  }
  function prompt() {
    if (mode === 'car' || mode === 'plane' || mode === 'ship') return [T('E: GET OUT', 'E: انزل'), leave];
    if (near(D, 12)) return [T('E: CAR DEALER', 'E: محل العربيات'), dealer];
    if (near(R, 12)) return [T('E: RACE MASTER', 'E: سباق'), raceMenu];
    if (near({ x: H.x + 20, z: H.z + 8 }, 8)) return [T('E: SHIPS', 'E: السفن'), shipShop];
    if (near({ x: H.x, z: H.z - 12 }, 7)) return [T('E: SAIL ', 'E: اركب ') + nm(SHIPS[me.ship]), () => enter('ship')];
    if (carObj && near(carObj.position, 3.5) && !callT) return [T('E: DRIVE ', 'E: سوق ') + nm(CARS[me.car]), () => enter('car')];
    if (planeObj && near(planeObj.position, 6)) return [T('E: FLY THE PLANE', 'E: طير بالطيارة'), () => enter('plane')];
    const isl = islets.find(o => near(o.chest.position, 2.5));
    if (isl) { const t = me.chests[isl.i] || 0, left = t + 1200 - Date.now() / 1000; if (left > 0) return [T('Empty chest · back in ', 'الصندوق فاضي · بيتملى بعد ') + Math.ceil(left / 60) + ' min', null]; return [T('E: OPEN THE TREASURE', 'E: افتح الكنز'), () => { const v = 2000 + Math.floor(Math.random() * 8000) + me.lvl * 100; me.money += v; me.chests[isl.i] = Date.now() / 1000; toast('💰 +' + egp(v)); beep(990, 0.3, 'triangle', 0.06); save(); }]; }
    return null;
  }
  // raw (camera-free) input: undo engine's camera rotation
  function turnCam(target, k) { const d = ((target - view.yaw) % (Math.PI * 2) + Math.PI * 3) % (Math.PI * 2) - Math.PI; view.yaw += d * Math.min(1, k); }
  function raw(inp) { const c = Math.cos(view.yaw), s = Math.sin(view.yaw); return { x: inp.x * c - inp.z * s, z: inp.x * s + inp.z * c }; }

  return {
    dealer, raceMenu, shipShop, callCar, callPlane, prompt,
    goSea() { pos.set(H.x, 0, H.z + 4); },
    active: () => !!mode, mode: () => mode, inSea, carObj: () => carObj,
    camDist: () => mode === 'plane' ? 20 : mode === 'ship' ? SHIPS[me.ship].size * 1.5 + 8 : mode === 'race' ? 11 : mode === 'car' ? CARS[me.car].len * 1.4 + 5 : 0,
    speedKmh: () => Math.round(Math.abs(mode === 'race' ? (race ? laneSpeed(race.car) : 0) : speed) * 3.6),
    // returns true when this module moved the player this frame
    control(dt, inp, hit) {
      if (callT > 0 && carObj && callFrom) { callT = Math.max(0, callT - dt); const k = 1 - callT / 2.2; carObj.position.set(callFrom.x + (me.carPos.x - callFrom.x) * k, 0, callFrom.z + (me.carPos.z - callFrom.z) * k); }
      if (!mode) return false;
      const r = raw(inp), throttle = -r.z, steer = r.x;
      if (mode === 'race') {
        const R2 = race; if (!R2) return false; R2.time += dt;
        if (R2.time < 0) { pos.set(R2.ox, 0, R2.oz - 6); }
        else {
          if (hit('KeyA') || hit('ArrowLeft') || (steer < -0.6 && !R2.held)) { R2.lane = Math.max(0, R2.lane - 1); R2.held = true; }
          if (hit('KeyD') || hit('ArrowRight') || (steer > 0.6 && !R2.held)) { R2.lane = Math.min(2, R2.lane + 1); R2.held = true; }
          if (Math.abs(steer) < 0.3) R2.held = false;
          if (hit('Space') && R2.y <= 0) R2.vy = 9;
          R2.vy -= 26 * dt; R2.y = Math.max(0, R2.y + R2.vy * dt); if (R2.y <= 0) R2.vy = Math.max(0, R2.vy);
          R2.x += ((R2.lane - 1) * LANE_W - R2.x) * Math.min(1, dt * 10);
          const sp = laneSpeed(R2.car) * (now() < R2.slow ? 0.3 : 1); const z0 = R2.z; R2.z += sp * dt;
          for (const o of R2.obs) { if (o.done || o.z < z0 || o.z > R2.z || o.l !== R2.lane) continue; o.done = true; if (o.k === 2) { R2.coins++; o.m.visible = false; beep(1200, 0.05, 'sine', 0.04); } else if (o.k === 3) { R2.vy = 11; } else if (o.k === 0 && R2.y > 0.7) { } else { R2.slow = now() + 1; beep(100, 0.2, 'square', 0.06); toast(T('CRASH!', 'اتخبطت!')); } }
          pos.set(R2.ox + R2.x, 0, R2.oz + R2.z);
          if (R2.z >= R2.L) { endRace(true); return true; }
        }
        R2.ride.position.set(R2.ox + R2.x, R2.y, R2.oz + R2.z); R2.ride.rotation.y = 0; turnCam(Math.PI, dt * 4);
        if (hit('Escape')) endRace(false);
        return true;
      }
      if (mode === 'car') {
        const top = carSpeed(me.car);
        speed += (throttle * (throttle * speed < 0 ? 40 : 18) - speed * 0.6) * dt; speed = Math.max(-top * 0.35, Math.min(top, speed)); if (!throttle) speed *= Math.pow(0.4, dt);
        heading -= steer * dt * 1.8 * Math.min(1, Math.abs(speed) / 6) * Math.sign(speed || 1);
        const dx = Math.sin(heading) * speed * dt, dz = Math.cos(heading) * speed * dt, nx = { x: pos.x + dx, z: pos.z + dz };
        if (hasFloor(nx)) ctx.move(dx, dz); else speed = 0;
        carObj.position.set(pos.x, 0, pos.z); carObj.rotation.y = heading; me.carPos = { x: pos.x, z: pos.z, h: heading };
      } else if (mode === 'plane') {
        speed += throttle * 14 * dt; speed = Math.max(0, Math.min(70, speed));
        heading -= steer * dt * 1.1;
        const up = input.keys.has('Space') ? 1 : (input.keys.has('ControlLeft') || input.keys.has('Run') || input.keys.has('ShiftLeft')) ? -1 : 0;
        if (speed > 18) alt += up * 12 * dt; else alt = Math.max(0, alt - 6 * dt);
        alt = Math.max(0, Math.min(250, alt)); if (alt <= 0.01 && !hasFloor(pos)) alt = 0.5;
        pos.x += Math.sin(heading) * speed * dt; pos.z += Math.cos(heading) * speed * dt; pos.y = alt;
        planeObj.position.set(pos.x, alt, pos.z); planeObj.rotation.set(-up * 0.15, heading, steer * 0.35);
      } else if (mode === 'ship') {
        const s = SHIPS[me.ship]; speed += (throttle * 8 - speed * 0.4) * dt; speed = Math.max(-3, Math.min(s.speed, speed));
        heading -= steer * dt * 0.9;
        const nx = { x: pos.x + Math.sin(heading) * speed * dt, z: pos.z + Math.cos(heading) * speed * dt };
        if (inSea(nx)) { pos.x = nx.x; pos.z = nx.z; } else speed = 0;
        pos.y = 0; shipObj.position.set(pos.x, -0.3 + Math.sin(now() * 1.6) * 0.12, pos.z); shipObj.rotation.set(Math.sin(now()) * 0.03, heading, Math.sin(now() * 1.3) * 0.04);
      }
      turnCam(heading + Math.PI, dt * 3);
      return true;
    }
  };
}
