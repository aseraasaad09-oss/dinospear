// ASER WORLD web — phase 2: farming, mining, forge (numbers copied from Unity FarmData.cs, FarmData2.cs, AserPick.cs, AserForge.cs, FarmPlayer.cs)
import { THREE, mat, T, beep } from './engine.js';

// ---------- data ----------
export const RARITY = [['Common', 'عادي', '#bfbfbf'], ['Uncommon', 'مش منتشر', '#59d959'], ['Rare', 'نادر', '#4d8cff'], ['Epic', 'ملحمي', '#b359ff'], ['Legendary', 'أسطوري', '#ffbf26'], ['Mythic', 'خرافي', '#ff4d73'], ['Divine', 'إلهي', '#fff280'], ['Prismatic', 'منشوري', '#66ffff']];
const col = (r, g, b) => new THREE.Color(r, g, b).getHex();
// id, name, ar, rarity, price, growSeconds, sellBase, regrow, fruitsPerHarvest, color, stockChance, maxStock, shape
const S = (n, ar, r, price, grow, sell, regrow, fruits, c, chance, max, shape) => ({ n, ar, r, price, grow, sell, regrow, fruits, c, chance, max, shape });
export const SEEDS = [
  S('Carrot', 'جزر', 0, 10, 30, 18, false, 1, col(1, .5, .1), 1, 25, 1), S('Strawberry', 'فراولة', 0, 50, 60, 20, true, 2, col(.9, .1, .15), 1, 12, 0),
  S('Blueberry', 'توت أزرق', 1, 400, 90, 40, true, 3, col(.2, .25, .9), .8, 8, 0), S('Tomato', 'طماطم', 1, 800, 120, 60, true, 2, col(.95, .15, .1), .7, 6, 0),
  S('Corn', 'دُرة', 1, 1300, 150, 80, true, 1, col(1, .85, .2), .6, 5, 1), S('Potato', 'بطاطس', 1, 1800, 180, 140, false, 1, col(.7, .5, .3), .6, 5, 0),
  S('Watermelon', 'بطيخ', 2, 3000, 300, 600, false, 1, col(.15, .6, .2), .45, 4, 2), S('Pumpkin', 'قرع', 2, 4500, 360, 900, false, 1, col(1, .5, .05), .4, 4, 2),
  S('Apple', 'تفاح', 2, 6000, 420, 300, true, 3, col(.85, .05, .1), .4, 3, 3), S('Bamboo', 'بامبو', 2, 8000, 300, 500, true, 1, col(.4, .8, .3), .35, 3, 1),
  S('Banana', 'موز', 3, 20000, 600, 900, true, 3, col(1, .9, .2), .25, 3, 3), S('Coconut', 'جوز هند', 3, 35000, 720, 1500, true, 2, col(.45, .3, .15), .22, 2, 3),
  S('Cactus', 'صبّار', 3, 50000, 780, 2500, true, 1, col(.2, .6, .25), .2, 2, 1), S('Mango', 'مانجا', 3, 80000, 900, 3500, true, 2, col(1, .6, .1), .18, 2, 3),
  S('Grape', 'عنب', 4, 150000, 1200, 6000, true, 3, col(.5, .1, .6), .12, 2, 0), S('Dragon Fruit', 'دراجون فروت', 4, 300000, 1500, 12000, true, 2, col(1, .2, .6), .1, 2, 0),
  S('Mushroom', 'مشروم', 4, 500000, 1800, 25000, false, 1, col(.9, .15, .15), .08, 1, 4), S('Pepper', 'فلفل', 4, 800000, 2000, 30000, true, 3, col(.95, .1, .05), .07, 1, 1),
  S('Cacao', 'كاكاو', 5, 2e6, 2700, 6e4, true, 2, col(.4, .2, .1), .05, 1, 3), S('Beanstalk', 'شجرة الفول', 5, 5e6, 3600, 12e4, true, 2, col(.3, .9, .3), .04, 1, 1),
  S('Ember Lily', 'زنبقة النار', 5, 1e7, 4500, 25e4, true, 1, col(1, .35, .05), .03, 1, 4), S('Moon Melon', 'بطيخ القمر', 5, 2e7, 5400, 5e5, false, 1, col(.6, .7, 1), .025, 1, 2),
  S('Sunflower', 'عباد الشمس', 6, 5e7, 7200, 12e5, true, 1, col(1, .8, .1), .015, 1, 4), S('Crystal Berry', 'توت الكريستال', 6, 1e8, 9000, 25e5, true, 3, col(.5, .95, 1), .01, 1, 5),
  S('Star Fruit', 'فاكهة النجمة', 6, 25e7, 10800, 6e6, true, 2, col(1, 1, .4), .007, 1, 5), S('Golden Apple', 'التفاحة الدهب', 7, 1e9, 14400, 25e6, true, 2, col(1, .82, .2), .003, 1, 3),
  S('Rainbow Rose', 'وردة قوس قزح', 7, 25e8, 18000, 6e7, true, 1, col(1, .4, .8), .002, 1, 4)
];
// id order = Unity FarmData.Items
const I = (n, ar, sell, c) => ({ n, ar, sell, c });
export const ITEMS = [
  I('Copper Ore', 'خام نحاس', 40, col(.85, .45, .2)), I('Iron Ore', 'خام حديد', 120, col(.7, .7, .75)), I('Gold Ore', 'خام دهب', 500, col(1, .82, .2)), I('Diamond', 'ألماظ', 2500, col(.5, .95, 1)),
  I('Magic Crystal', 'كريستال سحري', 9000, col(.8, .4, 1)), I('Obsidian', 'أوبسيديان', 30000, col(.15, .1, .25)), I('Bone', 'عضمة', 25, col(.95, .93, .85)), I('Zombie Heart', 'قلب زومبي', 1500, col(.5, .9, .3)),
  I('Dungeon Gem', 'جوهرة الدانجن', 20000, col(1, .25, .35)), I('Sardine', 'سردين', 30, col(.7, .75, .85)), I('Tilapia', 'بلطي', 60, col(.55, .6, .55)), I('Catfish', 'قرموط', 150, col(.45, .4, .3)),
  I('Salmon', 'سلمون', 400, col(1, .55, .45)), I('Tuna', 'تونة', 1200, col(.3, .35, .6)), I('Golden Fish', 'سمكة دهب', 8000, col(1, .8, .15)), I('Swordfish', 'أبو سيف', 25000, col(.3, .5, .9)),
  I('Glow Fish', 'سمكة منوّرة', 90000, col(.3, 1, .8)), I('Old Boot', 'جزمة قديمة', 1, col(.35, .25, .15)), I('Stone', 'حجر', 5, col(.55, .55, .55)), I('Coal', 'فحم', 20, col(.15, .15, .15)),
  I('Wood', 'خشب', 10, col(.6, .42, .25)), I('Worm', 'دودة', 5, col(.95, .55, .6)), I('Elytra', 'جناحات ELYTRA', 50000, col(.55, .4, .75)), I('Ender Pearl', 'إندر بيرل', 800, col(.1, .55, .5))
];
const W = (n, ar, dmg, price, recipe, c) => ({ n, ar, dmg, price, recipe, c });
export const SWORDS = [
  W('Fists', 'إيدك', 6, 0, [], 0xffffff), W('Wooden Sword', 'سيف خشب', 12, 300, [], col(.6, .42, .25)), W('Copper Sword', 'سيف نحاس', 20, 1500, [0, 8], col(.85, .45, .2)),
  W('Iron Sword', 'سيف حديد', 32, 6000, [1, 10, 0, 5], col(.78, .8, .85)), W('Gold Sword', 'سيف دهب', 50, 30000, [2, 10, 1, 5], col(1, .82, .2)),
  W('Diamond Sword', 'سيف ألماظ', 80, 150000, [3, 8, 2, 5], col(.5, .95, 1)), W('Crystal Blade', 'نصل الكريستال', 130, 800000, [4, 6, 3, 4, 7, 2], col(.8, .4, 1)),
  W('Obsidian Blade', 'نصل الأوبسيديان', 210, 4e6, [5, 6, 4, 4, 8, 1], col(.25, .1, .4)), W('Rainbow Blade', 'نصل قوس قزح', 350, 25e6, [5, 10, 8, 3, 7, 10], col(1, .4, .8))
];
export const PICKS = [
  W('NO PICKAXE', 'مفيش بيكاكس', 0, 0, [], 0x808080), W('WOODEN PICKAXE', 'بيكاكس خشب', 1, 200, [], col(.6, .42, .25)), W('COPPER PICKAXE', 'بيكاكس نحاس', 2, 1000, [0, 6], col(.85, .45, .2)),
  W('IRON PICKAXE', 'بيكاكس حديد', 3, 4000, [1, 8, 0, 4], col(.78, .8, .85)), W('GOLD PICKAXE', 'بيكاكس دهب', 4, 20000, [2, 8, 1, 4], col(1, .82, .2)),
  W('DIAMOND PICKAXE', 'بيكاكس ألماظ', 5, 1e5, [3, 6, 2, 4], col(.5, .95, 1)), W('CRYSTAL PICKAXE', 'بيكاكس كريستال', 6, 5e5, [4, 5, 3, 3, 7, 2], col(.8, .4, 1)),
  W('OBSIDIAN PICKAXE', 'بيكاكس أوبسيديان', 7, 25e5, [5, 5, 4, 3, 8, 1], col(.25, .1, .4)), W('RAINBOW PICKAXE', 'بيكاكس قوس قزح', 8, 15e6, [5, 8, 8, 2, 7, 8], col(1, .4, .8))
];
// Vox.cs: rock types the pickaxe can break (hardness) and what they drop
const ROCKS = [['STONE', 'حجر', 0, 18, col(.55, .55, .55)], ['COPPER ORE', 'خام نحاس', 1, 0, col(.85, .45, .2)], ['IRON ORE', 'خام حديد', 2, 1, col(.78, .78, .82)], ['DEEP STONE', 'حجر عميق', 3, 18, col(.32, .32, .36)], ['GOLD ORE', 'خام دهب', 3, 2, col(1, .82, .2)], ['DIAMOND', 'ألماظ', 4, 3, col(.5, .95, 1)], ['MAGIC CRYSTAL', 'كريستال سحري', 5, 4, col(.8, .4, 1)]];
const ROCK_W = [30, 22, 16, 10, 10, 7, 5];
// AserForge.cs: free forge materials (id, weight, power)
const FMATS = [20, 18, 19, 6, 0, 1, 2, 3, 4, 7, 5, 8];
const FW = { 20: 1, 18: 3.5, 19: 1.2, 6: 1, 0: 3, 1: 4, 2: 5, 3: 2, 4: 1, 7: 1.5, 5: 6, 8: 2 }, FP = { 20: .5, 18: .6, 19: 1, 6: 1, 0: 3, 1: 6, 2: 10, 3: 18, 4: 28, 7: 15, 5: 45, 8: 40 };
const KINDS = [['SWORD', 'سيف'], ['KATANA', 'كاتانا'], ['HAMMER', 'مطرقة']];
export function forgeCalc(mix) {
  let total = 0, wsum = 0, pow = 0, coal = 0, best = -1, bestN = 0, second = -1, secondN = 0;
  for (const id in mix) { const c = mix[id]; if (c <= 0) continue; total += c; wsum += FW[id] * c; pow += FP[id] * c; if (+id === 19) coal += c; const sc = FP[id] * c; if (sc > bestN) { second = best; secondN = bestN; best = +id; bestN = sc; } else if (sc > secondN) { second = +id; secondN = sc; } }
  if (total < 3 || total > 60) return null;
  const avg = wsum / total, kind = avg >= 3.3 ? 2 : avg <= 1.8 ? 1 : 0, k = kind === 2 ? 1.35 : kind === 1 ? 1.05 : 1.15;
  const dmg = Math.max(8, Math.min(600, Math.round((8 + pow) * (1 + Math.min(0.5, coal / total)) * k)));
  const a = best >= 0 ? ITEMS[best].n.split(' ')[0].toUpperCase() : '', b = second >= 0 && second !== best ? ITEMS[second].n.split(' ')[0].toUpperCase() + '-' : '';
  return { kind, dmg, name: b + a + ' ' + KINDS[kind][0] };
}
export const MUT = [['', 1], ['Wet', 2], ['Golden', 20], ['Rainbow', 50], ['Shocked', 100], ['Frozen', 10], ['Moonlit', 3], ['Giant', 5]];
export function money(v) { const s = v < 0 ? '-' : ''; v = Math.abs(v); if (v >= 1e12) return s + +(v / 1e12).toFixed(2) + 'T'; if (v >= 1e9) return s + +(v / 1e9).toFixed(2) + 'B'; if (v >= 1e6) return s + +(v / 1e6).toFixed(2) + 'M'; if (v >= 1e4) return s + +(v / 1e3).toFixed(1) + 'K'; return s + Math.round(v); }
export const egp = v => money(v) + ' EGP';
const tm = s => { if (s <= 0) return T('READY', 'جاهز'); s = Math.ceil(s); return s >= 3600 ? Math.floor(s / 3600) + 'h ' + Math.floor(s % 3600 / 60) + 'm' : s >= 60 ? Math.floor(s / 60) + 'm ' + (s % 60) + 's' : s + 's'; };
const fruitValue = f => Math.max(1, Math.round(SEEDS[f.s].sell * f.w * f.w * MUT[f.m][1]));
export const xpFor = l => l <= 1 ? 0 : Math.floor(30 * Math.pow(l, 1.7));
export const maxPlants = l => Math.min(10 + l * 2, 120);
const nm = o => T(o.n, o.ar);

// ---------- setup ----------
export function setupEco(ctx) {
  const { scene, me, pos, toast, save, gainXp, places, trees, panel } = ctx;
  // fill old saves
  me.money = me.money ?? 100; if (me.money === 0 && !me.ecoV) me.money = 100;
  me.ecoV = 1; me.seeds = me.seeds || SEEDS.map((_, i) => (i === 0 ? 3 : 0)); me.items = me.items || ITEMS.map(() => 0);
  while (me.items.length < ITEMS.length) me.items.push(0);
  me.fruits = me.fruits || []; me.plants = me.plants || []; me.pick = me.pick ?? 1; me.sword = me.sword ?? 0; me.forged = me.forged || null; me.held = me.held ?? 4; me.bought = me.bought || {};
  me.elytra = me.elytra || 0;

  // ----- seed shop stock: same on every device (seeded by the 5-minute slot, like the Unity server restock every 300 s) -----
  const slot = () => Math.floor(Date.now() / 300000);
  function stock() {
    const sl = slot(); let r = sl * 9301 + 49297; const rnd = () => ((r = (r * 233280 + 1) % 2147483647) / 2147483647);
    return SEEDS.map((d, i) => { const st = rnd() < d.chance ? 1 + Math.floor(rnd() * d.max) : 0; return Math.max(0, st - (me.bought[sl + ':' + i] || 0)); });
  }

  // ----- garden (your own plot in ASER TOWN) -----
  const G = places.garden; // {x0,z0,x1,z1}
  const inGarden = p => p.x > G.x0 + 0.5 && p.x < G.x1 - 0.5 && p.z > G.z0 + 0.5 && p.z < G.z1 - 0.5;
  const soil = new THREE.Mesh(new THREE.BoxGeometry(G.x1 - G.x0, 0.2, G.z1 - G.z0), mat(0x6b4423)); soil.position.set((G.x0 + G.x1) / 2, 0.1, (G.z0 + G.z1) / 2); soil.receiveShadow = true; scene.add(soil);
  for (const [x, z, w, d] of [[(G.x0 + G.x1) / 2, G.z0, G.x1 - G.x0, 0.3], [(G.x0 + G.x1) / 2, G.z1, G.x1 - G.x0, 0.3], [G.x0, (G.z0 + G.z1) / 2, 0.3, G.z1 - G.z0], [G.x1, (G.z0 + G.z1) / 2, 0.3, G.z1 - G.z0]]) { const f = new THREE.Mesh(new THREE.BoxGeometry(w, 0.8, d), mat(0xfef3c7)); f.position.set(x, 0.4, z); scene.add(f); }
  const plantMeshes = new Map();
  const progress = p => Math.min(1, (Date.now() - p.t) / 1000 / SEEDS[p.s].grow);
  function plantMesh(p) {
    const d = SEEDS[p.s], g = new THREE.Group(); g.position.set(p.x, 0.2, p.z);
    const tree = d.shape === 3, tall = d.shape === 1, big = d.shape === 2;
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(tree ? 0.18 : 0.06, tree ? 0.25 : 0.08, tree ? 2.4 : tall ? 1.4 : 0.6, 6), mat(tree ? 0x6b4423 : 0x2f9e44)); stem.position.y = (tree ? 2.4 : tall ? 1.4 : 0.6) / 2; g.add(stem);
    const leaf = new THREE.Mesh(tree ? new THREE.SphereGeometry(1.2, 10, 8) : new THREE.ConeGeometry(0.45, 0.6, 6), mat(0x3fae4a)); leaf.position.y = tree ? 2.8 : tall ? 1.2 : 0.55; g.add(leaf);
    const fr = new THREE.Group(); const n = Math.max(1, d.fruits);
    for (let i = 0; i < n; i++) { const m = new THREE.Mesh(d.shape === 5 ? new THREE.OctahedronGeometry(big ? 0.6 : 0.22) : d.shape === 4 ? new THREE.ConeGeometry(0.3, 0.3, 8) : new THREE.SphereGeometry(big ? 0.6 : 0.2, 10, 8), mat(d.c, d.shape === 5 ? { emissive: d.c, emissiveIntensity: 0.5 } : null)); const a = i / n * 6.28; m.position.set(Math.cos(a) * (tree ? 0.9 : 0.25), tree ? 2.5 : tall ? 1.5 : big ? 0.5 : 0.75, Math.sin(a) * (tree ? 0.9 : 0.25)); fr.add(m); }
    g.add(fr); g.userData = { fr, stem, leaf }; scene.add(g); plantMeshes.set(p, g); return g;
  }
  me.plants.forEach(plantMesh);
  function refreshPlant(p) { const g = plantMeshes.get(p) || plantMesh(p); const k = progress(p); g.scale.setScalar(0.35 + k * 0.65); g.userData.fr.visible = k >= 1; }

  // ----- quarry rocks on THE FORGE CAVES island -----
  const C = places.cave; const rocks = [];
  let rs = 4242; const rr = () => ((rs = (rs * 16807) % 2147483647) / 2147483647);
  const rockGeo = new THREE.DodecahedronGeometry(1.2, 0);
  for (let i = 0; i < 70; i++) {
    let x, z; do { x = C.x + (rr() - 0.5) * 160; z = C.z + (rr() - 0.5) * 160; } while (Math.hypot(x - C.x, z - C.z) < 18);
    let w = rr() * 100, t = 0; while (w > ROCK_W[t]) { w -= ROCK_W[t]; t++; } t = Math.min(t, ROCKS.length - 1);
    const m = new THREE.Mesh(rockGeo, mat(ROCKS[t][4], t >= 5 ? { emissive: ROCKS[t][4], emissiveIntensity: 0.35 } : null)); m.position.set(x, 0.8, z); m.rotation.set(rr() * 3, rr() * 3, 0); m.castShadow = true; scene.add(m);
    rocks.push({ x, z, t, hp: 3, back: 0, m });
  }

  // ----- equip bar: 1 SWORD · 2 FRUIT · 3 FIGHTING STYLE · 4 PICKAXE · 5 PORTAL GUN · 6-9 seeds (Unity AserEquip) -----
  const bar = document.getElementById('equip');
  const seedSlots = () => { const l = []; me.seeds.forEach((c, i) => { if (c > 0 && l.length < 4) l.push(i); }); return l; };
  function drawBar() {
    const ss = seedSlots(); bar.innerHTML = '';
    const sw = me.forged && me.forged.dmg > SWORDS[me.sword].dmg ? { n: me.forged.name, ar: me.forged.name } : SWORDS[me.sword];
    const fr = ext.fruit && ext.fruit();
    const cells = [['⚔️', nm(sw)], ['🍉', fr || T('NO FRUIT', 'مفيش فاكهة'), fr ? 0 : 1], ['🥋', ext.style ? ext.style() : T('STYLE', 'أسلوب')], ['⛏️', nm(PICKS[me.pick])], ['🌀', T('PORTAL', 'بوابة'), 1]];
    ss.forEach(i => cells.push(['🌱', nm(SEEDS[i]) + ' ×' + me.seeds[i]]));
    cells.forEach((c, i) => { const b = document.createElement('button'); b.type = 'button'; b.className = (me.held === i + 1 ? 'on ' : '') + (c[2] ? 'soon' : ''); b.innerHTML = '<s>' + (i + 1) + '</s><i>' + c[0] + '</i><em>' + c[1] + '</em>'; b.onclick = () => hold(i + 1); bar.appendChild(b); });
  }
  const ext = {};
  function hold(n) { const ss = seedSlots(); if (n >= 6 && !ss[n - 6] && ss[n - 6] !== 0) return; if (n === 5) { toast(T('Coming in a next version', 'جاي في نسخة جاية')); return; } if (n === 2 && !(ext.fruit && ext.fruit())) { toast(T('Eat a fruit first (FRUIT shop)', 'كُل فاكهة الأول (محل الفاكهة)')); return; } me.held = n; drawBar(); }
  const heldSeed = () => (me.held >= 6 ? seedSlots()[me.held - 6] : undefined);
  drawBar();

  // ----- panels: seed shop, sell shop, forge -----
  const row = (html, btn, fn, dis) => { const d = document.createElement('div'); d.className = 'prow'; d.innerHTML = '<div>' + html + '</div>'; if (btn) { const b = document.createElement('button'); b.type = 'button'; b.textContent = btn; b.disabled = !!dis; b.onclick = fn; d.appendChild(b); } return d; };
  const rTag = r => '<b style="color:' + RARITY[r][2] + '">' + T(RARITY[r][0], RARITY[r][1]) + '</b>';
  function seedShop() {
    const st = stock(), left = 300 - Math.floor(Date.now() / 1000) % 300;
    panel(T('SEED SHOP', 'محل البذور'), body => {
      body.appendChild(row('💰 ' + egp(me.money) + ' · ' + T('RESTOCK IN ', 'التجديد بعد ') + tm(left)));
      SEEDS.forEach((d, i) => body.appendChild(row('🌱 <b>' + nm(d) + '</b> ' + rTag(d.r) + '<br><small>' + egp(d.price) + ' · ' + tm(d.grow) + (d.regrow ? T(' · regrows', ' · بتطرح تاني') : '') + ' · ' + T('stock ', 'المتاح ') + st[i] + ' · ' + T('you have ', 'معاك ') + me.seeds[i] + '</small>', st[i] ? T('BUY', 'اشتري') : T('OUT', 'خلص'), () => buySeed(i), !st[i] || me.money < d.price)));
    });
  }
  function buySeed(i) { const st = stock(); const d = SEEDS[i]; if (!st[i]) return toast(T('OUT OF STOCK! WAIT FOR THE RESTOCK', 'خلص! استنى التجديد')); if (me.money < d.price) return toast(T('NOT ENOUGH MONEY (EGP)', 'فلوسك مش كفاية')); me.money -= d.price; me.seeds[i]++; const k = slot() + ':' + i; me.bought[k] = (me.bought[k] || 0) + 1; for (const key in me.bought) if (+key.split(':')[0] < slot()) delete me.bought[key]; beep(660, 0.08, 'triangle', 0.05); save(); drawBar(); seedShop(); }
  function sellShop() {
    panel(T('SELL SHOP', 'محل البيع'), body => {
      const tot = me.fruits.reduce((a, f) => a + fruitValue(f), 0);
      body.appendChild(row('🍎 ' + T('Fruits in your backpack: ', 'الفاكهة في شنطتك: ') + me.fruits.length + ' / 100<br><small>' + egp(tot) + '</small>', T('SELL ALL', 'بيع الكل'), () => { me.money += tot; me.fruits = []; beep(880, 0.12, 'triangle', 0.06); toast(T('Sold for ', 'بعت بـ ') + egp(tot)); save(); sellShop(); }, !me.fruits.length));
      me.fruits.slice(0, 30).forEach((f, k) => body.appendChild(row((MUT[f.m][0] ? '<b style="color:#ffd040">' + MUT[f.m][0].toUpperCase() + '</b> ' : '') + nm(SEEDS[f.s]) + ' <small>' + f.w.toFixed(2) + ' KG · ' + egp(fruitValue(f)) + '</small>', T('SELL', 'بيع'), () => { me.money += fruitValue(f); me.fruits.splice(k, 1); save(); sellShop(); })));
      ITEMS.forEach((it, id) => { if (me.items[id] > 0 && id !== 22) body.appendChild(row('📦 ' + nm(it) + ' ×' + me.items[id] + ' <small>' + egp(it.sell) + T(' each', ' للواحدة') + '</small>', T('SELL 1', 'بيع 1'), () => { me.items[id]--; me.money += it.sell; save(); sellShop(); })); });
    });
  }
  const recTxt = r => { let s = ''; for (let k = 0; k + 1 < r.length; k += 2) s += '<span style="color:' + (me.items[r[k]] >= r[k + 1] ? '#9cff9c' : '#ff7070') + '">' + me.items[r[k]] + '/' + r[k + 1] + ' ' + nm(ITEMS[r[k]]) + '</span> '; return s || T('NO MATERIALS NEEDED', 'من غير خامات'); };
  const hasRec = r => { for (let k = 0; k + 1 < r.length; k += 2) if (me.items[r[k]] < r[k + 1]) return false; return true; };
  const payRec = r => { for (let k = 0; k + 1 < r.length; k += 2) me.items[r[k]] -= r[k + 1]; };
  let ftab = 0, mix = {};
  function forge() {
    panel(T('WORKSHOP', 'الورشة'), body => {
      const tabs = document.createElement('div'); tabs.className = 'tabs';
      [['SWORD', 'سيف'], ['PICKAXE', 'بيكاكس'], ['CRAFT ITEMS', 'صنع حاجات']].forEach((t, i) => { const b = document.createElement('button'); b.type = 'button'; b.textContent = T(t[0], t[1]); b.className = i === ftab ? 'on' : ''; b.onclick = () => { ftab = i; forge(); }; tabs.appendChild(b); });
      body.appendChild(tabs); body.appendChild(row('💰 ' + egp(me.money)));
      if (ftab === 0) {
        body.appendChild(row(T('WEAPONS ARE ONLY MADE HERE · NO SHOP SELLS THEM', 'السلاح بيتعمل هنا بس · مفيش محل بيبيعه')));
        SWORDS.forEach((d, i) => { if (!i) return; const owned = me.sword >= i; body.appendChild(row('<b style="color:#' + new THREE.Color(d.c).getHexString() + '">' + nm(d) + '</b> · ' + T('DAMAGE ', 'الضرب ') + d.dmg + ' · ' + egp(d.price) + '<br><small>' + recTxt(d.recipe) + '</small>', owned ? T('OWNED', 'معاك') : T('MAKE', 'اعمل'), () => { if (me.money < d.price) return toast(T('YOU NEED ', 'محتاج ') + egp(d.price)); if (!hasRec(d.recipe)) return toast(T('Not enough materials', 'الخامات مش كفاية')); me.money -= d.price; payRec(d.recipe); me.sword = i; toast(T('YOU MADE THE ', 'عملت ') + nm(d) + '!'); beep(990, 0.2, 'triangle', 0.06); save(); drawBar(); forge(); }, owned || me.money < d.price || !hasRec(d.recipe))); });
      } else if (ftab === 1) {
        body.appendChild(row(T('YOU NEED A BETTER PICKAXE TO MINE HARDER ROCKS', 'محتاج بيكاكس أحسن عشان تكسر صخر أصعب')));
        PICKS.forEach((d, i) => { if (!i) return; const owned = me.pick >= i, next = i === me.pick + 1; body.appendChild(row('<b style="color:#' + new THREE.Color(d.c).getHexString() + '">' + nm(d) + '</b> · ' + T('MINES LEVEL ', 'بيكسر مستوى ') + i + ' · ' + egp(d.price) + '<br><small>' + recTxt(d.recipe) + '</small>', owned ? T('OWNED', 'معاك') : next ? T('MAKE', 'اعمل') : T('LOCKED', 'مقفول'), () => { if (me.money < d.price) return toast(T('YOU NEED ', 'محتاج ') + egp(d.price)); me.money -= d.price; payRec(d.recipe); me.pick = i; toast(T('YOU MADE THE ', 'عملت ') + nm(d) + T('! NOW YOU CAN MINE HARDER ROCKS', '! دلوقتي تقدر تكسر صخر أصعب')); beep(990, 0.2, 'triangle', 0.06); save(); drawBar(); forge(); }, owned || !next || me.money < d.price || !hasRec(d.recipe))); });
      } else {
        const ely = [23, 3, 20, 10, 1, 5];
        body.appendChild(row('🪽 <b>ELYTRA</b> · 50K EGP<br><small>' + recTxt(ely) + '</small>', T('MAKE', 'اعمل'), () => { me.money -= 50000; payRec(ely); me.items[22]++; toast(T('YOU MADE ELYTRA WINGS!', 'عملت جناحات ELYTRA!')); save(); forge(); }, me.money < 50000 || !hasRec(ely)));
        body.appendChild(row('<b>' + T('FREE FORGE', 'الحداد الحر') + '</b><br><small>' + T('Put 3–60 materials together: heavy = hammer, light = katana, in between = sword. Coal makes it stronger. Fee 200 EGP.', 'حط من 3 لـ 60 خامة مع بعض: تقيل = مطرقة، خفيف = كاتانا، في النص = سيف. الفحم بيقويه. الرسوم 200.') + '</small>'));
        FMATS.forEach(id => { if (!me.items[id] && !mix[id]) return; const d = document.createElement('div'); d.className = 'prow'; d.innerHTML = '<div>' + nm(ITEMS[id]) + ' <small>' + (mix[id] || 0) + ' / ' + me.items[id] + '</small></div>'; const m = document.createElement('button'); m.type = 'button'; m.textContent = '−'; m.onclick = () => { mix[id] = Math.max(0, (mix[id] || 0) - 1); forge(); }; const p = document.createElement('button'); p.type = 'button'; p.textContent = '+'; p.onclick = () => { mix[id] = Math.min(me.items[id], (mix[id] || 0) + 1); forge(); }; d.append(m, p); body.appendChild(d); });
        const c = forgeCalc(mix);
        body.appendChild(row(c ? '⚒️ <b>' + c.name + '</b> · ' + T('DAMAGE ', 'الضرب ') + c.dmg : T('Add at least 3 materials', 'زوّد 3 خامات على الأقل'), T('FORGE', 'اطرق'), () => { if (me.money < 200) return toast(T('THE FORGE COSTS 200 EGP', 'الحداد بـ 200')); for (const id in mix) if (me.items[id] < mix[id]) return; me.money -= 200; for (const id in mix) me.items[id] -= mix[id]; me.forged = { name: c.name, dmg: c.dmg }; mix = {}; toast(T('YOU FORGED A ', 'عملت ') + c.name + ' · ' + c.dmg); beep(990, 0.2, 'triangle', 0.06); save(); drawBar(); forge(); }, !c || me.money < 200));
      }
    });
  }
  function bag() {
    panel(T('BACKPACK', 'الشنطة'), body => {
      body.appendChild(row('💰 ' + egp(me.money) + ' · ⛏️ ' + nm(PICKS[me.pick]) + ' · ⚔️ ' + nm(SWORDS[me.sword]) + (me.forged ? ' / ' + me.forged.name + ' (' + me.forged.dmg + ')' : '')));
      SEEDS.forEach((d, i) => { if (me.seeds[i]) body.appendChild(row('🌱 ' + nm(d) + ' ×' + me.seeds[i])); });
      ITEMS.forEach((d, i) => { if (me.items[i]) body.appendChild(row('📦 ' + nm(d) + ' ×' + me.items[i])); });
      body.appendChild(row('🍎 ' + T('Fruits: ', 'فاكهة: ') + me.fruits.length + ' / 100'));
    });
  }

  // ----- interaction (E / ✋) -----
  let mineCd = 0, chopCd = 0;
  const near = (p, r) => Math.hypot(pos.x - p.x, pos.z - p.z) < r;
  function prompt() {
    if (ext.prompt) { const p = ext.prompt(); if (p) return p; }
    if (near(places.seedShop, 10)) return [T('E: SEED SHOP', 'E: محل البذور'), seedShop];
    if (near(places.sell, 10)) return [T('E: SELL SHOP', 'E: محل البيع'), sellShop];
    if (near(places.forge, 10)) return [T('E: WORKSHOP', 'E: الورشة'), forge];
    if (ext.fruitShop && places.fruit && near(places.fruit, 10)) return [T('E: FRUIT SHOP', 'E: محل الفاكهة'), ext.fruitShop];
    const ripe = me.plants.find(p => progress(p) >= 1 && near(p, 1.8));
    if (ripe) return [T('E: HARVEST ', 'E: احصد ') + nm(SEEDS[ripe.s]), () => harvest(ripe)];
    const hs = heldSeed();
    const grow = me.plants.find(p => near(p, 1.1)); if (grow) return [nm(SEEDS[grow.s]) + ' · ' + tm(SEEDS[grow.s].grow * (1 - progress(grow))), null];
    if (hs !== undefined && inGarden(pos)) return [T('E: PLANT ', 'E: ازرع ') + nm(SEEDS[hs]), () => plant(hs)];
    if (me.held === 4) { const r = rocks.find(r => !r.back && near(r, 2.4)); if (r) return [T('E: MINE ', 'E: اكسر ') + T(ROCKS[r.t][0], ROCKS[r.t][1]), () => mine(r)]; }
    if (me.held === 1) { const t = trees.find(t => near(t, 2)); if (t) return [T('E: CHOP WOOD', 'E: اقطع خشب'), chop]; }
    const g = me.plants.find(p => near(p, 1.8)); if (g) return [nm(SEEDS[g.s]) + ' · ' + tm(SEEDS[g.s].grow * (1 - progress(g))), null];
    if (inGarden(pos) && hs === undefined) return [T('Hold a seed (6–9) to plant', 'امسك بذرة (6–9) عشان تزرع'), null];
    return null;
  }
  function plant(s) {
    if (me.plants.length >= maxPlants(me.lvl)) return toast(T('GARDEN IS FULL! LEVEL UP (', 'الجنينة اتملت! كبّر مستواك (') + maxPlants(me.lvl) + ' MAX)');
    const min = SEEDS[s].shape === 3 ? 2.6 : 1.1;
    if (me.plants.some(p => Math.hypot(p.x - pos.x, p.z - pos.z) < Math.max(min, SEEDS[p.s].shape === 3 ? 2.6 : 1.1))) return toast(T('TOO CLOSE TO ANOTHER PLANT', 'قريب أوي من زرعة تانية'));
    me.seeds[s]--; let w = 0.7 + Math.random() * 0.6; if (Math.random() < 0.08) w *= 1.3 + Math.random() * 0.7;
    const p = { s, x: pos.x, z: pos.z, t: Date.now(), w }; me.plants.push(p); plantMesh(p); beep(440, 0.08, 'sine', 0.05);
    if (!me.seeds[s]) me.held = 4; save(); drawBar();
  }
  function rollMut() { const r = Math.random(); return r < 0.001 ? 3 : r < 0.01 ? 2 : 0; }   // no weather yet: rainbow 0.1% · golden 1%
  function harvest(p) {
    const d = SEEDS[p.s]; if (me.fruits.length + d.fruits > 100) return toast(T('YOUR BACKPACK IS FULL! SELL YOUR FRUITS', 'شنطتك اتملت! بيع الفاكهة'));
    let v = 0; for (let i = 0; i < d.fruits; i++) { const m = rollMut(), f = { s: p.s, w: +(p.w * (0.9 + Math.random() * 0.2)).toFixed(2), m }; me.fruits.push(f); v += fruitValue(f); if (m >= 2) toast(T('You got a ', 'طلعلك ') + MUT[m][0].toUpperCase() + ' ' + nm(d) + '!'); }
    if (Math.random() < 0.2) { me.items[21]++; toast(T('YOU FOUND A WORM! (FISH BAIT • PET FOOD)', 'لقيت دودة! (طُعم للسمك • أكل للحيوانات)')); }
    if (d.regrow) { p.t = Date.now(); p.w = 0.7 + Math.random() * 0.6; } else { me.plants.splice(me.plants.indexOf(p), 1); scene.remove(plantMeshes.get(p)); plantMeshes.delete(p); }
    beep(720, 0.1, 'triangle', 0.05); gainXp(5 + d.r * d.r * 6); save();
  }
  function mine(r) {
    if (performance.now() < mineCd) return; mineCd = performance.now() + 380;
    if (ROCKS[r.t][2] > me.pick) return toast(T('TOO HARD! MAKE A BETTER PICKAXE AT THE FORGE', 'صعب أوي! اعمل بيكاكس أحسن في الورشة'));
    beep(180 + r.hp * 40, 0.06, 'square', 0.04); r.m.scale.setScalar(0.7 + r.hp * 0.1);
    if (--r.hp > 0) return;
    const drop = ROCKS[r.t][3], n = Math.ceil((1 + Math.floor(Math.random() * 2)) * (Math.random() < 0.25 ? 1.5 : 1));
    me.items[drop] += n; if (Math.random() < 0.3) me.items[19]++; if (drop !== 18 && Math.random() < 0.5) me.items[18]++;
    toast('+' + n + ' ' + nm(ITEMS[drop])); gainXp(3 + ROCKS[r.t][2] * 4); r.back = performance.now() + 60000; r.m.visible = false; save();
  }
  function chop() { if (performance.now() < chopCd) return; chopCd = performance.now() + 600; me.items[20]++; beep(240, 0.06, 'square', 0.04); toast('+1 ' + nm(ITEMS[20])); save(); }

  // ----- per-frame -----
  let pT = 0, last = null;
  return {
    link(o) { Object.assign(ext, o); drawBar(); }, near,
    bag, hold, drawBar, seedShop, sellShop, forge,
    keys(hit) { for (let n = 1; n <= 9; n++) if (hit('Digit' + n)) hold(n); },
    use() { const p = prompt(); if (p && p[1]) p[1](); },
    update(dt) {
      for (const r of rocks) if (r.back && performance.now() > r.back) { r.back = 0; r.hp = 3; r.m.visible = true; r.m.scale.setScalar(1); }
      if ((pT += dt) > 0.2) { pT = 0; me.plants.forEach(refreshPlant); const p = prompt(), txt = p ? p[0] : ''; if (txt !== last) { last = txt; const e = document.getElementById('prompt'); e.textContent = txt; e.hidden = !txt; } }
    }
  };
}
