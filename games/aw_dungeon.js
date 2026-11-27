// ASER WORLD web — phase 4: dungeon gates E–S + 6 far dungeons (numbers from Unity AserEvents.cs AserGates, AserDungeons.cs, FarmData2.cs)
import { THREE, mat, T, beep } from './engine.js';
import { egp, ITEMS } from './aw_eco.js?v=V57';
import { MONSTERS } from './aw_fight.js?v=V57';

// ---------- gates ----------
const RANKS = ['E', 'D', 'C', 'B', 'A', 'S'];
const RANK_COL = [0x9999a6, 0x4dd966, 0x4d99ff, 0xbf59ff, 0xff8c1a, 0xff2633];
const START_FLOOR = [1, 4, 8, 12, 17, 24], GATE_BOSS = [3, 3, 5, 6, 6, 4], GATE_W = [30, 25, 20, 13, 8, 4];
const EVERY = 900, OPEN = 300, INSIDE = 900, WAVES = 3;
const floorReward = f => Math.round(250 * Math.pow(1.35, Math.max(0, f - 1)));
// ---------- far dungeons ----------
const D_NEED = [10, 30, 60, 100, 160, 250];
const D_INFO = [['GOBLIN FORT', 'قلعة العفاريت', 3, 0x2f7d32], ['SAND TEMPLE', 'معبد الرمل', 9, 0xd4a373], ['FROZEN TOMB', 'المقبرة المتلجة', 5, 0xdbeafe], ['SWAMP CRYPT', 'سرداب المستنقع', 4, 0x4d7c0f], ['DRAGON KEEP', 'حصن التنين', 6, 0x7c2d12], ['OLD CASTLE RUINS', 'أطلال القلعة القديمة', 3, 0x9ca3af]];
const HALF = 24, D_COST = 25000, D_BACK = 900;

export function setupDungeon(ctx) {
  const { scene, me, pos, fight, toast, save, gainXp, panel, floors, label, goTown } = ctx;
  me.dng = me.dng || [0, 0, 0, 0, 0, 0]; me.gateDone = me.gateDone || -1;
  const sec = () => Date.now() / 1000;
  const pm = (c, w, d, h, x, y, z, o) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat(c, o)); m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; scene.add(m); return m; };
  function arena(cx, cz, ground, wall, plat) {
    pm(ground, plat, plat, 1, cx, -0.5, cz); pm(0x3f3f46, plat - 2, plat - 2, 14, cx, -8, cz);
    floors.push({ x0: cx - plat / 2, z0: cz - plat / 2, x1: cx + plat / 2, z1: cz + plat / 2 });
    // walls of the arena with a door on the −z side (Unity: Gate = centre − Half − 8 on z)
    for (const s of [-1, 1]) { pm(wall, 1.5, HALF * 2, 6, cx + s * HALF, 3, cz); pm(wall, HALF - 4, 1.5, 6, cx + s * (HALF / 2 + 2), 3, cz - HALF); }
    pm(wall, HALF * 2, 1.5, 6, cx, 3, cz + HALF);
    for (const [x, z] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) pm(wall, 3, 3, 10, cx + x * HALF, 5, cz + z * HALF);
  }

  // ----- the gate arena (Unity DungeonPos) far below the map view -----
  const GA = { x: 0, z: -1500 };
  arena(GA.x, GA.z, 0x1e1b4b, 0x312e81, 70);
  const exitPortal = new THREE.Mesh(new THREE.TorusGeometry(2.2, 0.35, 10, 30), new THREE.MeshBasicMaterial({ color: 0x22d3ee })); exitPortal.position.set(GA.x, 2.6, GA.z - HALF - 6); scene.add(exitPortal);
  // ----- the 6 far dungeons (Unity: angle i·60°+20°, in the wild lands away from the islands) -----
  const D = D_INFO.map((d, i) => { const a = (i * 60 + 20) * Math.PI / 180, r = 650 + i * 110; return { i, n: d[0], ar: d[1], boss: d[2], col: d[3], x: Math.cos(a) * r, z: Math.sin(a) * r }; });
  for (const d of D) { arena(d.x, d.z, d.col, 0x57534e, 110); label(T(d.n, d.ar) + ' · LV ' + D_NEED[d.i] + '+', '#ffd040', 3, d.x, 12, d.z - HALF - 2); }

  // ----- gate in ASER TOWN: same timetable on every device (every 15 min, open 5 min) -----
  const slot = () => Math.floor(sec() / EVERY);
  function rankOf(s) { let r = (s * 2654435761) % 4294967296 / 4294967296 * 100; for (let i = 0; i < 6; i++) { r -= GATE_W[i]; if (r <= 0) return i; } return 0; }
  const SPOTS = [[30, -45], [-30, -45], [55, -20], [-55, -20], [0, -55], [50, 30]];
  const gateSpot = s => { const p = SPOTS[s % SPOTS.length]; return { x: p[0], z: p[1] }; };
  const gateOpen = () => sec() % EVERY < OPEN;
  const gateMesh = new THREE.Group();
  const ringM = new THREE.Mesh(new THREE.TorusGeometry(3.2, 0.45, 12, 40), new THREE.MeshBasicMaterial({ color: 0xffffff })); ringM.position.y = 3.8; gateMesh.add(ringM);
  const inner = new THREE.Mesh(new THREE.CircleGeometry(2.9, 32), new THREE.MeshBasicMaterial({ color: 0x111827, transparent: true, opacity: 0.85, side: THREE.DoubleSide })); inner.position.y = 3.8; gateMesh.add(inner);
  scene.add(gateMesh); let gateLabel = null, gateKey = -1;

  // ----- runs -----
  let run = null;   // { kind:'gate'|'dng', i/rank, wave, floor, mobs:[], boss, next, enteredAt }
  const alive = m => fight.mobs.includes(m);
  function clearRun() { if (!run) return; for (const m of run.mobs) if (alive(m)) fight.remove(m); if (run.boss && alive(run.boss)) fight.remove(run.boss); run = null; }
  function spawnWave() {
    run.wave++;
    if (run.kind === 'gate') {
      const f = START_FLOOR[run.rank] + run.wave - 1; run.floor = f;
      if (run.wave > WAVES) { run.boss = fight.spawn(GATE_BOSS[run.rank], f, GA.x, GA.z + 16, 'gate'); for (let i = 0; i < 2 + run.rank; i++) run.mobs.push(fight.spawn(Math.random() < 0.5 ? 0 : 1, f, GA.x + (Math.random() - .5) * 36, GA.z + 6 + Math.random() * 14, 'gate')); toast(T('THE GATE BOSS IS HERE: ', 'بوس البوابة وصل: ') + MONSTERS[GATE_BOSS[run.rank]].n + '!'); return; }
      const n = Math.min(4 + run.wave * 2 + run.rank, 16);
      for (let i = 0; i < n; i++) { const r = Math.random(); run.mobs.push(fight.spawn(r < 0.5 ? 0 : r < 0.8 ? 1 : 2, f, GA.x + (Math.random() - .5) * 40, GA.z + 4 + Math.random() * 18, 'gate')); }
      toast(RANKS[run.rank] + T('-RANK GATE · WAVE ', '-RANK · الموجة ') + run.wave + '/' + WAVES + ' · ' + n);
    } else {
      const d = D[run.i];
      if (run.wave > WAVES) { run.boss = fight.spawn(d.boss, 1 + run.i, d.x, d.z + 10, 'dng'); toast('BOSS: ' + MONSTERS[d.boss].n + '!'); return; }
      const n = 4 + run.wave * 2 + run.i;
      for (let k = 0; k < n; k++) { const a = k * Math.PI * 2 / n; run.mobs.push(fight.spawn(run.i === 3 ? 2 : (k % 3 === 0 ? 1 : 0), 3 + run.i * 3 + run.wave, d.x + Math.cos(a) * 15, d.z + Math.sin(a) * 15, 'dng')); }
      toast(T('WAVE ', 'الموجة ') + run.wave + ' / 3');
    }
    beep(330, 0.2, 'sawtooth', 0.05);
  }
  function finish() {
    if (run.kind === 'gate') {
      const r = run.rank, reward = floorReward(run.floor) * 6, gems = 10 + r * 15;
      me.money += reward; me.gems += gems; me.items[8] += 1 + r; if (r >= 4) me.items[5] += 2 + r; me.gateDone = run.slot;
      toast(T('GATE CLEARED! +', 'البوابة اتقفلت! +') + egp(reward) + ' +' + gems + ' 💎 +' + (1 + r) + ' ' + T(ITEMS[8].n, ITEMS[8].ar));
      gainXp(200 * (r + 1)); fight.fruitXp(30); run = null; setTimeout(() => goTown(), 3000);
    } else {
      const i = run.i, m = 30000 * (i + 1) * (i + 1) + me.lvl * 500, g = 10 + i * 12;
      me.money += m; me.gems += g; if (Math.random() < 0.25 + i * 0.08) me.items[23]++;
      me.dng[i] = sec() + D_BACK; toast(T('DUNGEON CLEARED! +', 'الدانجن خلص! +') + egp(m) + ' +' + g + ' 💎');
      gainXp(400 * (i + 1)); fight.fruitXp(50); run = null;
    }
    beep(880, 0.4, 'triangle', 0.07); save();
  }
  const inBox = (c, pad) => Math.abs(pos.x - c.x) < HALF + pad && Math.abs(pos.z - c.z) < HALF + pad;

  // ----- phone panel -----
  const row = (html, btn, fn, dis) => { const d = document.createElement('div'); d.className = 'prow'; d.innerHTML = '<div>' + html + '</div>'; if (btn) { const b = document.createElement('button'); b.type = 'button'; b.textContent = btn; b.disabled = !!dis; b.onclick = fn; d.appendChild(b); } return d; };
  const mmss = s => Math.floor(s / 60) + ':' + String(Math.floor(s % 60)).padStart(2, '0');
  function open() {
    panel(T('DUNGEONS + GATE', 'الدانجن + البوابة'), b => {
      const s = slot(), left = EVERY - sec() % EVERY, r = rankOf(s);
      b.appendChild(row('💰 ' + egp(me.money) + ' · 💎 ' + me.gems + ' · LV ' + me.lvl));
      if (gateOpen()) b.appendChild(row('🌀 <b style="color:#' + new THREE.Color(RANK_COL[r]).getHexString() + '">' + RANKS[r] + '-RANK GATE</b><br><small>' + T('Closes in ', 'بتقفل بعد ') + mmss(OPEN - sec() % EVERY) + T(' · 3 waves + boss · 15 min inside', ' · 3 موجات + بوس · 15 دقيقة جوه') + (me.gateDone === s ? T(' · you cleared this one', ' · انت قفلتها خلاص') : '') + '</small>', T('GO', 'روح'), () => { const g = gateSpot(s); pos.set(g.x, 0, g.z - 6); document.getElementById('panel').hidden = true; }, me.gateDone === s));
      else b.appendChild(row('🌀 ' + T('Next gate in ', 'البوابة الجاية بعد ') + mmss(left) + '<br><small>' + T('A gate opens every 15 minutes for 5 minutes (E, D, C, B, A or S)', 'بوابة بتفتح كل 15 دقيقة لمدة 5 دقايق (E أو D أو C أو B أو A أو S)') + '</small>'));
      D.forEach(d => { const back = me.dng[d.i] - sec(), lock = me.lvl < D_NEED[d.i]; b.appendChild(row('🏰 <b>' + T(d.n, d.ar) + '</b> · LV ' + D_NEED[d.i] + '+<br><small>BOSS: ' + MONSTERS[d.boss].n + (back > 0 ? T(' · back in ', ' · بيرجع بعد ') + mmss(back) : '') + ' · ' + T('travel ', 'السفر ') + egp(D_COST) + '</small>', lock ? T('LOCKED', 'مقفول') : T('TRAVEL', 'سافر'), () => { if (me.money < D_COST) return toast(T('TRAVEL COSTS ', 'السفر بـ ') + egp(D_COST)); me.money -= D_COST; pos.set(d.x, 0, d.z - HALF - 8); document.getElementById('panel').hidden = true; toast(T(d.n, d.ar) + T(' · WALK INSIDE TO START!', ' · ادخل جوه عشان تبدأ!')); save(); }, lock || me.money < D_COST)); });
    });
  }

  let warnT = 0, spin = 0;
  return {
    open,
    prompt() {
      const s = slot(), g = gateSpot(s);
      if (gateOpen() && Math.hypot(pos.x - g.x, pos.z - g.z) < 5) return me.gateDone === s ? [T('You already cleared this gate', 'انت قفلت البوابة دي خلاص'), null] : [T('E: ENTER THE ', 'E: ادخل ') + RANKS[rankOf(s)] + '-RANK GATE', () => { clearRun(); run = { kind: 'gate', rank: rankOf(s), slot: s, wave: 0, floor: 1, mobs: [], boss: null, next: sec() + 2, enteredAt: sec() }; pos.set(GA.x, 0, GA.z - HALF + 4); toast(T('YOU HAVE 15 MINUTES! CLEAR 3 WAVES + THE BOSS', 'معاك 15 دقيقة! خلّص 3 موجات + البوس')); }];
      if (Math.hypot(pos.x - exitPortal.position.x, pos.z - exitPortal.position.z) < 4) return [T('E: LEAVE THE GATE', 'E: اطلع من البوابة'), () => { clearRun(); goTown(); }];
      return null;
    },
    update(dt) {
      spin += dt; ringM.rotation.z = spin; exitPortal.rotation.y = spin;
      // gate in town
      const s = slot(), open = gateOpen(); gateMesh.visible = open;
      if (open && gateKey !== s) { gateKey = s; const g = gateSpot(s), r = rankOf(s); gateMesh.position.set(g.x, 0, g.z); ringM.material.color.setHex(RANK_COL[r]); if (gateLabel) scene.remove(gateLabel); gateLabel = label(RANKS[r] + '-RANK GATE', '#' + new THREE.Color(RANK_COL[r]).getHexString(), 2.4, g.x, 9, g.z); toast(T('A ', 'بوابة ') + RANKS[r] + T('-RANK DUNGEON GATE APPEARED! · PHONE → GATE', '-RANK ظهرت في ASER TOWN! · التليفون ← البوابة')); }
      if (gateLabel) gateLabel.visible = open;
      // start a far dungeon when you walk inside
      if (!run) for (const d of D) if (inBox(d, 0)) {
        if ((warnT -= dt) > 0) break; warnT = 8;
        if (me.dng[d.i] > sec()) { toast(T(d.n, d.ar) + T(' IS EMPTY... IT COMES BACK IN ', ' فاضي... بيرجع بعد ') + Math.ceil((me.dng[d.i] - sec()) / 60) + ' MIN'); break; }
        if (me.lvl < D_NEED[d.i]) { toast(T(d.n, d.ar) + T(' NEEDS LEVEL ', ' محتاج مستوى ') + D_NEED[d.i] + '+'); break; }
        run = { kind: 'dng', i: d.i, wave: 0, mobs: [], boss: null, next: sec() + 1.5 }; toast(T(d.n, d.ar) + T('! DEFEAT 3 WAVES AND THE BOSS', '! اهزم 3 موجات والبوس')); break;
      }
      if (!run) return;
      // leave / time out
      const c = run.kind === 'gate' ? GA : D[run.i];
      if (!inBox(c, run.kind === 'gate' ? 30 : 80)) { clearRun(); return; }
      if (run.kind === 'gate' && sec() - run.enteredAt > INSIDE) { toast(T('YOUR 15 MINUTES IN THE GATE ARE OVER!', 'الـ 15 دقيقة بتوعك خلصوا!')); clearRun(); goTown(); return; }
      run.mobs = run.mobs.filter(alive); if (run.boss && !alive(run.boss)) run.boss = 'dead';
      if (run.mobs.length || (run.boss && run.boss !== 'dead')) return;
      if (run.boss === 'dead') return finish();
      if (run.wave === 0) { if (sec() < run.next) return; return spawnWave(); }
      if (!run.waited) {
        run.waited = true; run.next = sec() + 6;
        if (run.kind === 'gate') { const r2 = floorReward(run.floor); me.money += r2; toast(T('WAVE ', 'الموجة ') + run.wave + T(' CLEARED! +', ' خلصت! +') + egp(r2) + (run.wave >= WAVES ? T(' · THE BOSS IS COMING...', ' · البوس جاي...') : '')); save(); }
        return;
      }
      if (sec() < run.next) return;
      run.waited = false; spawnWave();
    }
  };
}
