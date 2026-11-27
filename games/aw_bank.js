// ASER WORLD web — phase 6: bank + bank card, bank heist, police and jail (numbers from Unity AserHeist.cs, AserPolice.cs, AserLife.cs, AserBankCard.cs)
import { THREE, mat, makeChar, T, beep, input, walls } from './engine.js';
import { egp } from './aw_eco.js?v=V55';

// Unity AserHeist
const WANTED_STAR = 10, GATE_LIFE = 60, CAM_OFF = 45, COOLDOWN = 600, GRACE = 3, MAX_FAILS = 3, SPOT_R = 3.2;
const SAFES = [[-19, -11], [19, -11], [-19, -2], [-19, 4], [19, -2], [19, 4]], DOORS = [[0, -5], [0, 7]], VAULT = [0, 15];
const ARRIVE = [0, -12], PANEL = [-8, -15], EXIT = [16, -15];
const CAM = [[0, 16.5, 180, 60, 0.6, 0, 6], [-20.5, -16.5, 45, 35, 0.7, 1.3, 9], [20.5, -4.5, -45, 40, 0.65, 2.6, 10]];   // x, z, yaw, amp, speed, phase, reach
const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
// Unity AserPolice / AserLife
const COP_SPEED = 7.6, COP_CATCH = 1.7, CAR_SPEED = 17, CAR_CATCH = 3.2, JAIL_TIME = 60;

export function setupBank(ctx) {
  const { scene, me, pos, toast, save, panel, places, extraFloors, goTo, label, block } = ctx;
  me.bank = me.bank || 0; me.heistReady = me.heistReady || 0; me.jailUntil = me.jailUntil || 0;
  if (!me.cardNo) { let s = ''; for (let i = 0; i < 12; i++) s += Math.floor(Math.random() * 10); me.cardNo = 'ASER ' + s.slice(0, 4) + ' ' + s.slice(4, 8) + ' ' + s.slice(8); }
  const sec = () => Date.now() / 1000;
  const B = places.bank, MAN = { x: B.x, z: B.z - 8 }, GATE = { x: B.x + 4, z: B.z - 11 }, JAIL = places.jail;

  // ---------- masked man + his purple gate ----------
  const man = makeChar({ skin: 0x8d5524, shirt: 0x111827, pants: 0x111827, hair: 0x111827, eyes: 0xffffff }); man.position.set(MAN.x, 0, MAN.z); man.rotation.y = Math.PI; scene.add(man);
  const mask = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.3, 0.54), mat(0x111111)); mask.position.set(MAN.x, 1.62, MAN.z); scene.add(mask);
  const gate = new THREE.Mesh(new THREE.TorusGeometry(1.6, 0.25, 10, 30), new THREE.MeshBasicMaterial({ color: 0xb060ff })); gate.position.set(GATE.x, 1.9, GATE.z); gate.visible = false; scene.add(gate);
  let gateUntil = 0;

  // ---------- the vault (3 rooms, 2 code doors, cameras, 6 safes + the giant vault) ----------
  const V = places.vault;
  const box = (w, h, d, c, x, y, z, o) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat(c, o)); m.position.set(V.x + x, y, V.z + z); m.castShadow = m.receiveShadow = true; scene.add(m); return m; };
  box(44, 1, 36, 0x374151, 0, -0.5, 0); extraFloors.push({ x0: V.x - 22, z0: V.z - 18, x1: V.x + 22, z1: V.z + 18 });
  const rect = (x0, z0, x1, z1) => ({ x0: V.x + x0 - 0.3, z0: V.z + z0 - 0.3, x1: V.x + x1 + 0.3, z1: V.z + z1 + 0.3, tall: true });
  const wall = (x0, z0, x1, z1) => { const w = Math.max(0.6, x1 - x0), d = Math.max(0.6, z1 - z0); box(w, 6, d, 0x1f2937, (x0 + x1) / 2, 3, (z0 + z1) / 2); walls.push(rect(x0, z0, x1, z1)); };
  wall(-22, -18, 22, -18); wall(-22, 18, 22, 18); wall(-22, -18, -22, 18); wall(22, -18, 22, 18);
  for (const [, dz] of DOORS) { wall(-22, dz, -1.8, dz); wall(1.8, dz, 22, dz); }
  const doorMesh = DOORS.map(([x, z]) => box(3.6, 5, 0.5, 0xb45309, x, 2.5, z));
  const doorWall = DOORS.map(([x, z]) => rect(x - 1.8, z, x + 1.8, z));
  const setDoor = (d, open) => { doorMesh[d].visible = !open; const k = walls.indexOf(doorWall[d]); if (open && k >= 0) walls.splice(k, 1); if (!open && k < 0) walls.push(doorWall[d]); };
  const safeMesh = SAFES.map(([x, z]) => box(1.6, 2, 1.2, 0x6b7280, x, 1, z, { metalness: 0.6, roughness: 0.3 }));
  const vaultMesh = box(6, 5, 1.5, 0xd4af37, VAULT[0], 2.5, VAULT[1], { metalness: 0.8, roughness: 0.25 });
  box(1.2, 1.6, 0.4, 0x0ea5e9, PANEL[0], 0.8, PANEL[1], { emissive: 0x0369a1, emissiveIntensity: 0.6 });
  const exitM = new THREE.Mesh(new THREE.TorusGeometry(1.5, 0.22, 10, 30), new THREE.MeshBasicMaterial({ color: 0x22c55e })); exitM.position.set(V.x + EXIT[0], 1.8, V.z + EXIT[1]); scene.add(exitM);
  const spots = CAM.map(c => { box(0.6, 0.6, 0.6, 0x111827, c[0], 5.5, c[1]); const m = new THREE.Mesh(new THREE.CircleGeometry(SPOT_R, 28), new THREE.MeshBasicMaterial({ color: 0xff2020, transparent: true, opacity: 0.45, depthWrite: false })); m.rotation.x = -Math.PI / 2; m.position.y = 0.05; scene.add(m); return m; });
  const camSpot = (i, t) => { const c = CAM[i], yaw = (c[2] + c[3] * Math.sin(t * c[4] + c[5])) * Math.PI / 180; return { x: V.x + c[0] + Math.sin(yaw) * c[6], z: V.z + c[1] + Math.cos(yaw) * c[6] }; };

  let H = null;   // heist run
  const L = p => ({ x: pos.x - V.x, z: pos.z - V.z });
  const nearL = (p, r) => { const l = L(); return Math.hypot(l.x - p[0], l.z - p[1]) < r; };
  function startHeist() {
    H = { opened: 0, locked: 0, loot: 0, alarm: false, camOff: 0, start: sec(), fails: [0, 0, 0, 0, 0, 0, 0], doorFails: [0, 0], doors: 0, code: null };
    setDoor(0, false); setDoor(1, false); safeMesh.forEach(s => s.material = mat(0x6b7280, { metalness: 0.6, roughness: 0.3 })); vaultMesh.visible = true;
    gateUntil = 0; gate.visible = false; pos.set(V.x + ARRIVE[0], 0, V.z + ARRIVE[1]); ctx.ground();
    toast(T("YOU'RE IN THE VAULT! DON'T STEP IN THE RED LIGHT. PRESS E AT A SAFE.", 'انت جوه الخزنة! ما تقفش في النور الأحمر. دوس E عند أي خزنة.'));
  }
  const lockAll = () => { for (let k = 0; k < 7; k++) if (!(H.opened >> k & 1)) H.locked |= 1 << k; };
  function alarm(msg) { if (H.alarm) return; H.alarm = true; lockAll(); closeCode(); toast(msg); beep(150, 0.6, 'square', 0.07); }
  // ---------- code typing (Unity TargetHeistCode) ----------
  function askCode(forWhat, code, secs, title) {
    H.code = { forWhat, code, until: sec() + secs, secs, title };
    panel('🔐 ' + title, b => {
      b.innerHTML = '<div style="text-align:center;padding:8px"><div style="font:900 30px monospace;letter-spacing:6px;color:#ffd040;direction:ltr;word-break:break-all">' + code + '</div><div id="hcT" style="margin:8px;font-weight:900;color:#f87171"></div><input id="hcIn" autocomplete="off" autocapitalize="characters" style="width:100%;font:900 24px monospace;text-align:center;padding:10px;border-radius:12px;border:2px solid #334155;background:#0b1220;color:#fff;direction:ltr"><button type="button" id="hcOk" style="margin-top:10px;width:100%;padding:12px;border-radius:12px;background:#16a34a;color:#fff;font-weight:900;font-size:18px">' + T('OK', 'تمام') + '</button></div>';
      const inp = b.querySelector('#hcIn'); setTimeout(() => inp.focus(), 50);
      const go = () => answer(inp.value.replace(/\s/g, '').toUpperCase() === code && sec() <= H.code.until + 0.6);
      b.querySelector('#hcOk').onclick = go; inp.onkeydown = e => { e.stopPropagation(); if (e.key === 'Enter') go(); };
      inp.onkeyup = e => e.stopPropagation();
    });
  }
  function closeCode() { if (H) H.code = null; const p = document.getElementById('panel'); if (p && /🔐/.test(document.getElementById('pTitle2').textContent)) p.hidden = true; input.keys.clear(); }
  function answer(ok) {
    if (!H || !H.code) return; const f = H.code.forWhat; closeCode();
    if (f === 99) { if (ok) { H.camOff = sec() + CAM_OFF; toast(T('CAMERAS OFF FOR 45 SECONDS! HURRY!', 'الكاميرات طفت 45 ثانية! بسرعة!')); beep(880, 0.2, 'triangle', 0.06); } else toast(T('WRONG! THE CAMERAS ARE STILL ON', 'غلط! الكاميرات لسه شغالة')); return; }
    if (f >= 100) { const d = f - 100; if (ok) { H.doors |= 1 << d; setDoor(d, true); toast(T('DOOR ', 'الباب ') + (d + 1) + T(' OPEN!', ' اتفتح!')); beep(880, 0.2, 'triangle', 0.06); } else { H.doorFails[d]++; if (H.doorFails[d] >= 3) alarm(T('3 WRONG CODES! ALARM! RUN TO THE EXIT!', '3 أكواد غلط! إنذار! اجري على الخروج!')); else toast(T('WRONG! ', 'غلط! ') + (3 - H.doorFails[d]) + T(' TRIES LEFT (3 WRONG = ALARM)', ' محاولات فاضلة (3 غلط = إنذار)')); beep(150, 0.2, 'square', 0.05); } return; }
    if (H.alarm) return;
    const vb = 6, lvl = Math.min(me.lvl, 150);
    if (f === 200) { if (ok) { const loot = 10 * (6000 + lvl * 600) + Math.floor(Math.random() * 30000); H.opened |= 1 << vb; H.loot += loot; vaultMesh.material = mat(0x6b7280); toast(T('THE GIANT VAULT IS OPEN!! +', 'الخزنة العملاقة اتفتحت!! +') + egp(loot) + T(' · BAG: ', ' · الشنطة: ') + egp(H.loot)); beep(990, 0.4, 'triangle', 0.07); } else { H.fails[vb]++; if (H.fails[vb] >= MAX_FAILS) { H.locked |= 1 << vb; toast(T('THE GIANT VAULT LOCKED FOREVER!', 'الخزنة العملاقة اتقفلت خالص!')); } else toast(T('WRONG OR TOO SLOW! ', 'غلط أو اتأخرت! ') + (MAX_FAILS - H.fails[vb]) + T(' TRIES LEFT', ' محاولات فاضلة')); } return; }
    if (ok) { const loot = 4000 + lvl * 600 + Math.floor(Math.random() * 4000); H.opened |= 1 << f; H.loot += loot; safeMesh[f].material = mat(0x22c55e); toast(T('SAFE OPEN! +', 'الخزنة اتفتحت! +') + egp(loot) + T(' · BAG: ', ' · الشنطة: ') + egp(H.loot)); beep(990, 0.15, 'triangle', 0.06); }
    else { H.fails[f]++; if (H.fails[f] >= MAX_FAILS) { H.locked |= 1 << f; safeMesh[f].material = mat(0x7f1d1d); toast(T('THE SAFE LOCKED FOREVER!', 'الخزنة اتقفلت خالص!')); } else toast(T('WRONG OR TOO SLOW! ', 'غلط أو اتأخرت! ') + (MAX_FAILS - H.fails[f]) + T(' TRIES LEFT ON THIS SAFE', ' محاولات فاضلة')); beep(150, 0.2, 'square', 0.05); }
  }
  const code = n => { let s = ''; for (let i = 0; i < n; i++) s += CHARS[Math.floor(Math.random() * CHARS.length)]; return s; };
  const digits = n => { let s = ''; for (let i = 0; i < n; i++) s += Math.floor(Math.random() * 10); return s; };

  // ---------- police ----------
  let wanted = null;   // { loot, stars, until }
  const cops = [];
  function copMesh(car) {
    if (!car) { const c = makeChar({ skin: 0xf1c27d, shirt: 0x1d4ed8, pants: 0x111827, hair: 0x111827 }); scene.add(c); return c; }
    const g = new THREE.Group(); const b = new THREE.Mesh(new THREE.BoxGeometry(2, 1, 4.4), mat(0xf8fafc)); b.position.y = 0.8; g.add(b); const t = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.7, 2), mat(0x111827)); t.position.y = 1.6; g.add(t);
    const l1 = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.25, 0.4), new THREE.MeshBasicMaterial({ color: 0xff0000 })), l2 = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.25, 0.4), new THREE.MeshBasicMaterial({ color: 0x0066ff })); l1.position.set(-0.4, 2.05, 0); l2.position.set(0.4, 2.05, 0); g.add(l1, l2); g.userData.lights = [l1, l2]; scene.add(g); return g;
  }
  function clearCops() { for (const c of cops) scene.remove(c.m); cops.length = 0; }
  function setWanted(loot, stars) {
    wanted = { loot, stars, until: sec() + stars * WANTED_STAR };
    const need = 1 + stars; for (let i = 0; i < need; i++) { const car = i < 2, a = Math.random() * 6.28, d = 45 + Math.random() * 30, m = copMesh(car); m.position.set(pos.x + Math.sin(a) * d, 0, pos.z + Math.cos(a) * d); cops.push({ m, car }); }
    toast(T('RUN! ', 'اجري! ') + '★'.repeat(stars) + T(' THE POLICE ARE COMING. DON\'T GET CAUGHT!', ' البوليس جاي. ما تخليهمش يمسكوك!')); beep(700, 0.3, 'sawtooth', 0.06);
  }
  function arrest() {
    const lost = wanted ? wanted.loot : 0; wanted = null; clearCops();
    me.jailUntil = sec() + JAIL_TIME; pos.set(JAIL.x, 0, JAIL.z); ctx.ground(); save();
    toast(T('BUSTED! JAIL FOR 60 SECONDS (LOST ', 'اتمسكت! سجن 60 ثانية (ضاع ') + egp(lost) + ')'); beep(120, 0.6, 'square', 0.07);
  }

  // ---------- bank panel + card ----------
  const card = () => '<div style="direction:ltr;margin:6px auto 10px;max-width:340px;aspect-ratio:1.6;border-radius:18px;padding:16px;color:#fff;background:linear-gradient(135deg,#1d4ed8,#0ea5e9);box-shadow:0 10px 30px rgba(0,0,0,.4);display:flex;flex-direction:column;justify-content:space-between;text-align:left"><div style="display:flex;justify-content:space-between;font-weight:900"><span>ASER BANK</span><span>🦖</span></div><div style="font:900 20px monospace;letter-spacing:2px">' + me.cardNo + '</div><div style="display:flex;justify-content:space-between;font-size:12px;font-weight:800"><span>' + egp(me.bank) + '</span><span>GAME CARD • NOT REAL MONEY</span></div></div>';
  const row = (html, btns) => { const d = document.createElement('div'); d.className = 'prow'; d.innerHTML = '<div>' + html + '</div>'; for (const [t, fn, dis] of btns || []) { const b = document.createElement('button'); b.type = 'button'; b.textContent = t; b.disabled = !!dis; b.onclick = fn; d.appendChild(b); } return d; };
  function bankPanel(atBank) {
    panel(T('BANK', 'البنك'), b => {
      const c = document.createElement('div'); c.innerHTML = card(); b.appendChild(c);
      b.appendChild(row('👛 ' + T('Wallet: ', 'معاك: ') + egp(me.money) + '<br>🏦 ' + T('Bank: ', 'في البنك: ') + egp(me.bank) + '<br><small>' + T('Money in the bank is safe even if you die.', 'الفلوس اللي في البنك ما بتضيعش لما تموت.') + '</small>'));
      if (!atBank) { b.appendChild(row(T('Go inside the bank to put or take money.', 'روح البنك عشان تحط أو تسحب فلوس.'), [[T('GO', 'روح'), () => { goTo(B.x, B.z + 8); document.getElementById('panel').hidden = true; }]])); return; }
      const dep = a => { if (wanted) return toast(T("THE BANK WON'T HELP A ROBBER!", 'البنك مش هيساعد حرامي!')); a = Math.min(a, me.money); if (a <= 0) return toast(T('YOU HAVE NO MONEY TO PUT', 'معاكش فلوس تحطها')); me.money -= a; me.bank += a; toast(T('PUT ', 'حطيت ') + egp(a) + T(' IN THE BANK', ' في البنك')); save(); bankPanel(true); };
      const wd = a => { if (wanted) return toast(T("THE BANK WON'T HELP A ROBBER!", 'البنك مش هيساعد حرامي!')); a = Math.min(a, me.bank); if (a <= 0) return toast(T('YOUR BANK IS EMPTY', 'البنك فاضي')); me.bank -= a; me.money += a; toast(T('TOOK ', 'سحبت ') + egp(a) + T(' FROM THE BANK', ' من البنك')); save(); bankPanel(true); };
      b.appendChild(row(T('PUT IN', 'حط'), [['1K', () => dep(1000)], ['10K', () => dep(10000)], [T('HALF', 'النص'), () => dep(Math.floor(me.money / 2))], [T('ALL', 'الكل'), () => dep(me.money)]]));
      b.appendChild(row(T('TAKE OUT', 'اسحب'), [['1K', () => wd(1000)], ['10K', () => wd(10000)], [T('HALF', 'النص'), () => wd(Math.floor(me.bank / 2))], [T('ALL', 'الكل'), () => wd(me.bank)]]));
    });
  }

  const nearW = (p, r) => Math.hypot(pos.x - p.x, pos.z - p.z) < r;
  return {
    bankPanel,
    hasWanted: () => !!wanted, inJail: () => sec() < me.jailUntil, inHeist: () => !!H,
    status() { if (sec() < me.jailUntil) return '🔒 ' + T('JAIL ', 'السجن ') + Math.ceil(me.jailUntil - sec()) + 's'; if (wanted) return '★'.repeat(Math.max(1, Math.ceil((wanted.until - sec()) / WANTED_STAR))) + ' ' + egp(wanted.loot); if (H) return '💰 ' + egp(H.loot) + (H.alarm ? ' · 🚨' : sec() < H.camOff ? ' · 📷 ' + Math.ceil(H.camOff - sec()) + 's' : ''); return ''; },
    prompt() {
      if (sec() < me.jailUntil) return [T('In jail... ', 'في السجن... ') + Math.ceil(me.jailUntil - sec()) + 's', null];
      if (H) {
        if (H.code) return null;
        if (nearL(EXIT, 3)) return [T('E: LEAVE THE VAULT', 'E: اطلع من الخزنة'), () => leave()];
        if (nearL(PANEL, 2.6)) return [T('E: TURN OFF THE CAMERAS', 'E: اطفي الكاميرات'), () => { if (H.alarm) return toast(T('TOO LATE! THE ALARM IS ON. RUN TO THE EXIT!', 'اتأخرت! الإنذار شغال. اجري على الخروج!')); if (sec() < H.camOff) return toast(T('THE CAMERAS ARE ALREADY OFF', 'الكاميرات طافية أصلاً')); askCode(99, code(7), 11, T('TURN OFF THE CAMERAS', 'اطفي الكاميرات')); }];
        for (let d = 0; d < 2; d++) if (!(H.doors >> d & 1) && nearL(DOORS[d], 3.2)) return [T('E: OPEN DOOR ', 'E: افتح الباب ') + (d + 1), () => askCode(100 + d, code(6), 9, T('OPEN THE DOOR ', 'افتح الباب ') + (d + 1) + ' · ' + (H.doorFails[d] + 1) + '/3')];
        if (nearL(VAULT, 4)) return [T('E: THE GIANT VAULT', 'E: الخزنة العملاقة'), () => { if (H.opened >> 6 & 1) return toast(T('THE GIANT VAULT IS EMPTY', 'الخزنة العملاقة فاضية')); if ((H.locked >> 6 & 1) || H.alarm) return toast(T('THE GIANT VAULT IS LOCKED FOREVER', 'الخزنة العملاقة مقفولة خالص')); askCode(200, digits(20), 25, T('GIANT VAULT · TYPE ALL 20 NUMBERS', 'الخزنة العملاقة · اكتب الـ 20 رقم')); }];
        for (let i = 0; i < 6; i++) if (nearL(SAFES[i], 2.8)) return [T('E: CRACK THE SAFE', 'E: افتح الخزنة'), () => { if (H.opened >> i & 1) return toast(T('THIS SAFE IS EMPTY', 'الخزنة دي فاضية')); if (H.locked >> i & 1) return toast(T('THIS SAFE IS LOCKED FOREVER', 'الخزنة دي مقفولة خالص')); askCode(i, code(5), 9, T('CRACK THE SAFE · ', 'افتح الخزنة · ') + (H.fails[i] + 1) + '/3'); }];
        return null;
      }
      if (nearW(MAN, 3)) return [T('E: "WANT TO ROB THE BANK?"', 'E: «عايز تسرق البنك؟»'), () => { if (wanted) return toast(T('NOT NOW!', 'مش دلوقتي!')); if (sec() < me.heistReady) return toast(T('MASKED MAN: THE BANK IS STILL ON ALERT. COME BACK IN ', 'الملثّم: البنك لسه في حالة طوارئ. ارجع بعد ') + Math.ceil((me.heistReady - sec()) / 60) + ' min'); gateUntil = sec() + GATE_LIFE; gate.visible = true; toast(T('MASKED MAN: GOOD. GO THROUGH THE PURPLE GATE NEXT TO ME. ONLY YOU CAN SEE IT.', 'الملثّم: تمام. ادخل البوابة البنفسجي اللي جنبي. انت بس اللي شايفها.')); }];
      if (nearW(B, 10)) return [T('E: BANK', 'E: البنك'), () => bankPanel(true)];
      return null;
    },
    update(dt) {
      const t = sec();
      gate.rotation.y += dt * 2; exitM.rotation.y += dt * 2;
      if (gate.visible && t > gateUntil) { gate.visible = false; toast(T('THE GATE CLOSED', 'البوابة اتقفلت')); }
      if (gate.visible && nearW(GATE, 2.2)) startHeist();
      // jail: you stay inside until the time is up
      if (t < me.jailUntil) { if (!nearW(JAIL, 3.5)) { pos.set(JAIL.x, 0, JAIL.z); ctx.ground(); } }
      else if (me.jailUntil && t - me.jailUntil < 1) { me.jailUntil = 0; pos.set(JAIL.x, 0, JAIL.z + 7); toast(T('YOU ARE FREE!', 'خرجت من السجن!')); save(); }
      // vault
      if (H) {
        const camOn = !H.alarm && t > H.camOff;
        CAM.forEach((c, i) => { const s = camSpot(i, t); spots[i].position.set(s.x, 0.05, s.z); spots[i].visible = camOn; if (camOn && t > H.start + GRACE && Math.hypot(pos.x - s.x, pos.z - s.z) < SPOT_R) alarm(T('THE CAMERA SAW YOU! ALARM! ALL SAFES LOCKED. RUN TO THE EXIT!', 'الكاميرا شافتك! إنذار! كل الخزن اتقفلت. اجري على الخروج!')); });
        if (H.code) { const left = H.code.until - t, el = document.getElementById('hcT'); if (el) el.textContent = Math.max(0, left).toFixed(1) + 's'; if (left < -0.6) answer(false); }
        if (Math.abs(pos.x - V.x) > 40 || Math.abs(pos.z - V.z) > 40) { H = null; closeCode(); }
      }
      // police chase (Unity: cops + 2 police cars for a bank robber · 1 star less every 10 s)
      if (wanted) {
        if (t > wanted.until) { me.money += wanted.loot; toast(T('YOU ESCAPED! +', 'هربت! +') + egp(wanted.loot)); beep(990, 0.4, 'triangle', 0.07); wanted = null; clearCops(); save(); }
        else for (const c of cops) {
          const dx = pos.x - c.m.position.x, dz = pos.z - c.m.position.z, d = Math.hypot(dx, dz) || 1, sp = (c.car ? CAR_SPEED : COP_SPEED) * dt;
          c.m.position.x += dx / d * Math.min(sp, d); c.m.position.z += dz / d * Math.min(sp, d); c.m.rotation.y = Math.atan2(dx, dz);
          if (c.car) { const on = Math.floor(t * 4) % 2; c.m.userData.lights[0].visible = !!on; c.m.userData.lights[1].visible = !on; } else c.m.userData.anim && c.m.userData.anim(dt, 1.3);
          if (d < (c.car ? CAR_CATCH : COP_CATCH) && pos.y < 2) { arrest(); break; }
        }
      }
    }
  };
  function leave() {
    const loot = H.loot, opened = [0, 1, 2, 3, 4, 5, 6].filter(k => H.opened >> k & 1).length; H = null; closeCode();
    me.heistReady = sec() + COOLDOWN; pos.set(MAN.x, 0, MAN.z - 3); ctx.ground(); save();
    if (loot <= 0) return toast(T("YOU LEFT WITH NOTHING. THE POLICE DIDN'T NOTICE", 'خرجت من غير حاجة. البوليس ما خدش باله'));
    setWanted(loot, Math.max(1, Math.min(5, 1 + Math.round(opened * 4 / 7))));
  }
}
