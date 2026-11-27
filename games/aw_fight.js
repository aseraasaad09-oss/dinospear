// ASER WORLD web — phase 3: power fruits, fighting styles, monsters (numbers from Unity AserFruits.cs, AserFruitsPlus.cs, AserStyles.cs, FarmData2.cs, Zombie.cs, AserSkyWorld.cs)
import { THREE, mat, makeChar, T, beep } from './engine.js';
import { egp, ITEMS, SWORDS } from './aw_eco.js?v=V56';

// ---------- fruits (no SECRET/admin fruits here: they are never sold or rolled) ----------
const RAR = [['COMMON', 'عادي', '#bbbbbb'], ['UNCOMMON', 'مش منتشر', '#6bff6b'], ['RARE', 'نادر', '#4fa8ff'], ['MYTHIC', 'خرافي', '#c060ff'], ['LEGENDARY', 'أسطوري', '#ffc830']];
const rarityOf = (p, g) => g > 160 ? 4 : g > 100 || p > 65000 ? 3 : g > 0 || p > 35000 ? 2 : p > 15000 ? 1 : 0;
const c3 = (r, g, b) => new THREE.Color(r, g, b).getHex();
const F = (n, ar, price, gems, col, moves) => { const r = rarityOf(price, gems); return { n, ar, price: price * 25, gems: gems * 2, r, col, moves }; };
const M = (n, k, range, dmg, cd) => ({ n, k, range, dmg, cd });
export const FRUITS = [
  F('DRAGON FRUIT', 'فاكهة التنين', 60000, 0, c3(1, .35, .15), [M('FIRE BREATH', 'Burn', 14, 30, 4), M('FLAME BURST', 'Blast', 7, 40, 7), M('DRAGON DASH', 'Dash', 45, 20, 5), M('DRAGON FORM', 'Transform', 25, 30, 60)]),
  F('ROCKET FRUIT', 'فاكهة الصاروخ', 8000, 0, c3(1, .75, .2), [M('ROCKET JUMP', 'Jump', 24, 15, 4), M('MISSILE', 'Meteor', 16, 35, 6), M('MISSILE STORM', 'Rain', 14, 18, 9), M('ROCKET MODE', 'Transform', 20, 20, 60)]),
  F('LIGHTNING FRUIT', 'فاكهة البرق', 12000, 0, c3(1, 1, .4), [M('THUNDER DASH', 'Lightning', 20, 30, 4), M('LIGHTNING BEAM', 'Chain', 20, 35, 6), M('STORM STRIKE', 'Rain', 22, 45, 5), M('POWERFUL THUNDER', 'Transform', 20, 40, 60)]),
  F('ICE FRUIT', 'فاكهة التلج', 20000, 0, c3(.5, .9, 1), [M('ICE SPIKES', 'FreezeBeam', 16, 28, 4), M('FROST NOVA', 'Freeze', 9, 25, 8), M('ICE SLIDE', 'Dash', 40, 10, 4), M('ICE GIANT', 'Transform', 25, 30, 60)]),
  F('SHADOW FRUIT', 'فاكهة الضل', 0, 50, c3(.3, .2, .45), [M('VANISH', 'Invis', 8, 0, 20), M('SHADOW GRAB', 'Pull', 12, 25, 7), M('SHADOW STEP', 'Teleport', 18, 15, 3), M('SHADOW LORD', 'Transform', 20, 35, 60)]),
  F('GRAVITY FRUIT', 'فاكهة الجاذبية', 0, 80, c3(.6, .4, 1), [M('ZERO GRAVITY', 'Float', 10, 0, 15), M('GRAVITY PULL', 'Pull', 14, 25, 7), M('METEOR', 'Meteor', 18, 50, 9), M('GRAVITY KING', 'Transform', 20, 40, 60)]),
  F('MAMMOTH FRUIT', 'فاكهة الماموث', 90000, 0, c3(.55, .38, .22), [M('TUSK CHARGE', 'Dash', 50, 40, 5), M('EARTH STOMP', 'Freeze', 10, 45, 8), M('TRUNK THROW', 'Pull', 13, 30, 7), M('MAMMOTH FORM', 'Transform', 30, 45, 60)]),
  F('T-REX FRUIT', 'فاكهة التي ركس', 120000, 0, c3(.35, .6, .25), [M('JAW BITE', 'Leech', 6, 70, 4), M('ROAR', 'Knock', 12, 25, 8), M('TAIL SPIN', 'Spin', 7, 22, 9), M('T-REX FORM', 'Transform', 30, 50, 60)]),
  F('MAGMA FRUIT', 'فاكهة الحمم', 45000, 0, c3(1, .45, .1), [M('MAGMA FIST', 'Meteor', 16, 55, 6), M('LAVA POOL', 'Poison', 7, 12, 10), M('ERUPTION', 'Eruption', 18, 40, 8), M('MAGMA GIANT', 'Transform', 25, 45, 60)]),
  F('LIGHT FRUIT', 'فاكهة النور', 50000, 0, c3(1, .97, .6), [M('LIGHT BEAM', 'Beam', 30, 40, 4), M('LIGHT SPEED', 'Teleport', 28, 0, 3), M('LIGHT RAIN', 'LaserRain', 16, 30, 9), M('POWERFUL LIGHT', 'Transform', 20, 40, 60)]),
  F('QUAKE FRUIT', 'فاكهة الزلزال', 0, 120, c3(.9, .9, .95), [M('QUAKE PUNCH', 'Knock', 10, 45, 6), M('TREMOR', 'Slam', 10, 55, 7), M('SEA QUAKE', 'Wave', 22, 35, 10), M('QUAKE GIANT', 'Transform', 25, 45, 60)]),
  F('BUDDHA FRUIT', 'فاكهة بوذا', 70000, 0, c3(1, .82, .3), [M('PALM STRIKE', 'Knock', 10, 40, 5), M('MEDITATE', 'Heal', 0, 35, 14), M('HEAVEN IMPACT', 'Slam', 12, 70, 8), M('GIANT BUDDHA', 'Transform', 30, 35, 60)]),
  F('PHOENIX FRUIT', 'فاكهة الفينكس', 0, 150, c3(.3, .75, 1), [M('BLUE FLAME', 'Burn', 16, 25, 4), M('REBIRTH', 'Heal', 0, 45, 16), M('PHOENIX DIVE', 'Dash', 45, 35, 5), M('PHOENIX FORM', 'Transform', 30, 35, 60)]),
  F('LEOPARD FRUIT', 'فاكهة الفهد', 0, 140, c3(.95, .7, .25), [M('CLAW RUSH', 'Dash', 40, 35, 3), M('POUNCE', 'Jump', 18, 40, 5), M('FERAL SPIN', 'Spin', 6, 25, 8), M('LEOPARD FORM', 'Transform', 30, 40, 60)]),
  F('SPIDER FRUIT', 'فاكهة العنكبوت', 35000, 0, c3(.45, .15, .5), [M('WEB SHOT', 'FreezeBeam', 18, 20, 5), M('WEB TRAP', 'Trap', 6, 50, 8), M('VENOM BITE', 'Poison', 6, 14, 9), M('SPIDER QUEEN', 'Transform', 30, 40, 60)]),
  F('STRING FRUIT', 'فاكهة الخيوط', 40000, 0, c3(.95, .95, 1), [M('STRING WHIP', 'Beam', 20, 35, 4), M('PUPPET PULL', 'Pull', 16, 25, 7), M('BIRD CAGE', 'Cage', 16, 40, 10), M('STRING KING', 'Transform', 20, 40, 60)]),
  F('VENOM FRUIT', 'فاكهة السم', 55000, 0, c3(.55, .2, .75), [M('POISON SPIT', 'Burn', 15, 22, 4), M('TOXIC CLOUD', 'Poison', 9, 14, 9), M('HYDRA BITE', 'Leech', 7, 55, 6), M('VENOM HYDRA', 'Transform', 25, 40, 60)]),
  F('SOUND FRUIT', 'فاكهة الصوت', 25000, 0, c3(.3, 1, .8), [M('SOUND WAVE', 'Knock', 16, 30, 5), M('BASS DROP', 'Slam', 12, 45, 8), M('ECHO STEP', 'Teleport', 20, 20, 3), M('SOUND KING', 'Transform', 20, 40, 60)]),
  F('SAND FRUIT', 'فاكهة الرمل', 18000, 0, c3(.9, .78, .45), [M('SAND BLADE', 'Beam', 18, 35, 4), M('DESERT SPIRAL', 'Wave', 18, 28, 9), M('QUICKSAND', 'Freeze', 10, 20, 9), M('SAND GOLEM', 'Transform', 25, 40, 60)]),
  F('BARRIER FRUIT', 'فاكهة الحاجز', 30000, 0, c3(.6, .95, 1), [M('BARRIER WALL', 'Wall', 10, 20, 7), M('BOUNCE SHIELD', 'Shield', 6, 0, 14), M('BARRIER CAGE', 'Freeze', 8, 15, 9), M('BARRIER KNIGHT', 'Transform', 25, 35, 60)]),
  F('SPIRIT FRUIT', 'فاكهة الروح', 0, 100, c3(.7, .9, 1), [M('SOUL GRAB', 'Chain', 14, 35, 6), M('GHOST WALK', 'Invis', 6, 0, 15), M('SPIRIT BOMB', 'Meteor', 18, 70, 10), M('SPIRIT FORM', 'Transform', 20, 40, 60)]),
  F('BOMB FRUIT', 'فاكهة القنابل', 15000, 0, c3(.25, .25, .3), [M('BOMB THROW', 'Meteor', 15, 50, 5), M('LAND MINE', 'Trap', 5, 70, 8), M('BOMB RAIN', 'Rain', 12, 28, 10), M('BOMB GIANT', 'Transform', 20, 45, 60)]),
  F('SPIKE FRUIT', 'فاكهة الشوك', 16000, 0, c3(.75, .75, .8), [M('SPIKE BURST', 'Blast', 8, 40, 5), M('SPIKE WALL', 'Wall', 10, 35, 8), M('SPIKE RAIN', 'Eruption', 18, 30, 8), M('SPIKE BEAST', 'Transform', 25, 45, 60)]),
  F('RUBBER FRUIT', 'فاكهة المطاط', 65000, 0, c3(1, .55, .45), [M('RUBBER PISTOL', 'Beam', 18, 35, 3), M('RUBBER ROCKET', 'Dash', 50, 25, 4), M('GATLING', 'Barrage', 14, 12, 8), M('GEAR FIVE', 'Transform', 25, 50, 60)]),
  F('PORTAL FRUIT', 'فاكهة البوابات', 0, 110, c3(.4, .4, 1), [M('PORTAL STEP', 'Teleport', 30, 0, 3), M('DIMENSION PULL', 'Pull', 18, 30, 7), M('PORTAL TRAP', 'Trap', 7, 55, 9), M('PORTAL MASTER', 'Transform', 20, 40, 60)]),
  F('KITSUNE FRUIT', 'فاكهة الكيتسوني', 0, 250, c3(.35, .65, 1), [M('FOX FIRE', 'Orbs', 4, 22, 10), M('FOX DASH', 'Dash', 45, 25, 4), M('SPIRIT FLAMES', 'Rain', 14, 30, 10), M('KITSUNE FORM', 'Transform', 30, 50, 60)]),
  F('BLACK HOLE FRUIT', 'فاكهة الثقب الأسود', 0, 300, c3(.25, .1, .45), [M('BLACK HOLE', 'BlackHole', 12, 18, 9), M('EVENT HORIZON', 'Pull', 18, 35, 6), M('VOID STEP', 'Teleport', 26, 20, 3), M('POWERFUL VOID', 'Transform', 25, 55, 60)]),
  F('CREATION FRUIT', 'فاكهة الخلق', 0, 280, c3(.95, .85, .4), [M('CREATE WALL', 'Wall', 10, 30, 6), M('DOMAIN CUBE', 'Domain', 9, 80, 12), M('BLOCK CAGE', 'Freeze', 9, 30, 9), M('CREATOR FORM', 'Transform', 25, 50, 60)]),
  F('WIND FRUIT', 'فاكهة الهوا', 25000, 0, c3(.75, 1, .9), [M('GUST', 'Knock', 16, 30, 4), M('TORNADO', 'Tornado', 7, 14, 10), M('AIR DASH', 'Dash', 50, 20, 3), M('STORM FORM', 'Transform', 25, 40, 60)]),
  F('TIME FRUIT', 'فاكهة الوقت', 0, 200, c3(.85, .75, 1), [M('TIME STOP', 'TimeStop', 14, 20, 14), M('REWIND', 'Heal', 0, 40, 15), M('TIME SKIP', 'Teleport', 24, 25, 3), M('CHRONO FORM', 'Transform', 25, 50, 60)]),
  F('MAGNET FRUIT', 'فاكهة المغناطيس', 40000, 0, c3(.85, .2, .25), [M('MAGNET PULL', 'Pull', 18, 25, 6), M('IRON SHOT', 'Boulder', 22, 40, 8), M('MAGNET PUSH', 'Knock', 16, 35, 7), M('SCRAP METEOR', 'Meteor', 16, 60, 9)]),
  F('WATER FRUIT', 'فاكهة المية', 0, 90, c3(.2, .55, 1), [M('WATER BULLETS', 'Barrage', 16, 14, 6), M('BIG WAVE', 'Wave', 22, 35, 8), M('WATER JET', 'Dash', 45, 20, 4), M('WATER SPOUT', 'Tornado', 8, 16, 10)]),
  F('DOUGH FRUIT', 'فاكهة العجين', 0, 160, c3(.95, .9, .75), [M('DOUGH FIST', 'Meteor', 12, 55, 6), M('DONUT ROLL', 'Dash', 45, 30, 4), M('STICKY DOUGH', 'Freeze', 10, 25, 9), M('MOCHI SPEAR', 'Beam', 22, 50, 6)]),
  F('GAS FRUIT', 'فاكهة الغاز', 35000, 0, c3(.5, .8, .3), [M('GAS CLOUD', 'Poison', 9, 14, 9), M('TOXIC BLAST', 'Blast', 9, 40, 7), M('GAS STEP', 'Teleport', 22, 15, 3), M('GAS EXPLOSION', 'Nova', 12, 60, 12)]),
  F('MEME FRUIT', 'فاكهة الميم', 12000, 0, c3(1, .85, .2), [M('BONK', 'Meteor', 10, 40, 5), M('CONFUSE', 'Knock', 14, 25, 7), M('MEME DANCE', 'Spin', 7, 18, 9), M('TROLL STEP', 'Teleport', 22, 0, 3)]),
  F('STAR FRUIT', 'فاكهة النجمة', 0, 220, c3(1, .95, .55), [M('STAR SHOT', 'Barrage', 18, 18, 6), M('SHOOTING STAR', 'Dash', 50, 30, 4), M('STAR FALL', 'LaserRain', 16, 35, 10), M('SUPERNOVA', 'Nova', 14, 80, 13)])
];
// Unity AserFruitsX: fruit level 0..300, XP per level 5 + lv/2, damage × (1 + lv/250)
const FRUIT_MAX = 300, needFx = lv => 5 + Math.floor(lv / 2), lvMult = lv => 1 + Math.min(lv, FRUIT_MAX) / 250;
// Unity AserGacha: 400K, ×1.3 every roll, back to normal after 24 h · weights by rarity
const GACHA_BASE = 400000, GACHA_GROW = 1.3, GACHA_W = [45, 28, 15, 8, 4];
// Unity AserStyles
const S = (n, ar, z, x, price, dmg, range, cdZ, cdX, col, passive) => ({ n, ar, z, x, price, dmg, range, cdZ, cdX, col, passive });
export const STYLES = [
  S('BASIC FIGHTING', 'قتال عادي', 'SHOULDER BASH', 'SPIN KICK', 0, 1, 2.6, 5, 7, c3(1, .85, .6), ['NO SPECIAL POWER (LEARN A REAL STYLE!)', 'من غير قدرة خاصة']),
  S('KARATE', 'كاراتيه', 'FLYING KICK', 'PALM STRIKE', 600000, 1.5, 2.9, 5, 6, 0xffffff, ['EVERY 4TH HIT STUNS THE ENEMY', 'كل رابع ضربة بتشل العدو']),
  S('BOXING', 'بوكس', 'UPPERCUT', 'RAPID JABS', 1500000, 2, 2.5, 4, 8, c3(1, .2, .2), ['EVERY HIT IN A COMBO HITS HARDER', 'كل ضربة في الكومبو أقوى']),
  S('SUPER HUMAN', 'سوبر هيومان', 'SUPER DASH', 'GROUND SMASH', 5000000, 3, 3.2, 4, 9, c3(1, .8, .2), ['TAKE 30% LESS DAMAGE WHILE YOU HOLD IT', 'بتاخد ضرر أقل 30%']),
  S('ELECTRIC CLAW', 'مخلب الكهربا', 'LIGHTNING CLAW', 'VOLT DASH', 12000000, 4, 3.4, 6, 5, c3(.4, .9, 1), ['YOUR PUNCHES JUMP TO ONE MORE ENEMY', 'الضربة بتنط لعدو كمان']),
  S('DRAGON TALON', 'مخلب التنين', 'DRAGON CLAW', 'FLAME UPPERCUT', 25000000, 5.5, 3.6, 6, 8, c3(1, .4, .1), ['YOUR HITS SET ENEMIES ON FIRE', 'ضربك بيولّع العدو']),
  S('SHARK FIST', 'قبضة القرش', 'WATER BODY', 'SHARK BITE', 40000000, 7, 3.4, 7, 7, c3(.25, .6, 1), ['EVERY HIT HEALS YOU', 'كل ضربة بتعالجك'])
];
// Unity FarmData2.Zombies (island monsters 0-3, ghost 14)
const MON = [
  { n: 'Mud Golem', ar: 'جولم الطين', hp: 70, dmg: 7, sp: 2.4, rw: 18, sc: 1, skin: c3(.45, .33, .22) },
  { n: 'Cave Spider', ar: 'عنكبوت الكهف', hp: 45, dmg: 5, sp: 4.6, rw: 22, sc: .9, skin: c3(.2, .18, .22) },
  { n: 'Blast Blob', ar: 'الكورة المتفجرة', hp: 40, dmg: 35, sp: 3.1, rw: 30, sc: 1, skin: c3(1, .55, .15) },
  { n: 'STONE KING', ar: 'ملك الحجر', hp: 1400, dmg: 26, sp: 2.6, rw: 600, sc: 2.2, skin: c3(.5, .5, .58) },
  { n: 'SHADOW MONARCH', ar: 'ملك الضلال', hp: 9000, dmg: 48, sp: 3.4, rw: 8000, sc: 3.2, skin: c3(.18, .1, .32) },
  { n: 'FROST GIANT', ar: 'عملاق التلج', hp: 2600, dmg: 32, sp: 2.4, rw: 1500, sc: 2.6, skin: c3(.6, .85, 1) },
  { n: 'LAVA TITAN', ar: 'تايتن الحمم', hp: 4200, dmg: 38, sp: 2.6, rw: 3000, sc: 2.9, skin: c3(.95, .35, .08) },
  { n: 'PUMPKIN KING', ar: 'ملك القرع', hp: 7000, dmg: 40, sp: 3, rw: 6000, sc: 3, skin: c3(1, .5, .08) },
  { n: 'EVIL SANTA', ar: 'سانتا الشرير', hp: 7000, dmg: 40, sp: 3, rw: 6000, sc: 3, skin: c3(.85, .1, .12) },
  { n: 'PHARAOH GUARDIAN', ar: 'حارس الفرعون', hp: 7000, dmg: 40, sp: 3, rw: 6000, sc: 3, skin: c3(1, .8, .25) }
];
export const MONSTERS = MON;
const floorHp = f => Math.pow(1.25, Math.max(0, f - 1)), floorDmg = f => Math.pow(1.14, Math.max(0, f - 1));
const nm = o => T(o.n, o.ar);

export function setupFight(ctx) {
  const { scene, me, pos, player, toast, save, gainXp, panel, islands, zombie, maxHp, respawn, redraw, yaw } = ctx;
  me.power = me.power ?? -1; me.fruitBag = me.fruitBag || FRUITS.map(() => 0); me.fLv = me.fLv || FRUITS.map(() => 0); me.fXp = me.fXp || FRUITS.map(() => 0);
  me.style = me.style ?? 0; me.styles = me.styles ?? 1; me.gacha = me.gacha || []; me.gems = me.gems || 0;
  const mobs = []; const cds = {}; const fx = [];
  let shieldUntil = 0, invisUntil = 0, floatUntil = 0, formUntil = 0, timeStopUntil = 0, atkCd = 0, styleHits = 0;
  const now = () => performance.now() / 1000;
  const face = () => { const a = player.rotation.y; return { x: Math.sin(a), z: Math.cos(a) }; };

  // ---------- monsters ----------
  function spawn(type, floor, x, z, zone) {
    const d = MON[type], g = makeChar({ skin: d.skin, shirt: d.skin, pants: 0x1f2937, hair: d.skin, glow: type === 2 ? 0xff7a00 : 0xff3030 });
    g.scale.setScalar(d.sc * 1.1); g.position.set(x, 0, z); scene.add(g);
    const bar = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.1), new THREE.MeshBasicMaterial({ color: 0xef4444 })); bar.position.y = 2.3; bar.visible = false; g.add(bar);
    const m = { d, g, bar, floor, zone, maxHp: Math.round(d.hp * floorHp(floor)), dmg: Math.round(d.dmg * floorDmg(floor)), sp: d.sp * (1 + Math.min(0.4, (floor - 1) * 0.03)), rw: Math.round(d.rw * Math.pow(1.25, floor - 1)), home: { x, z }, cd: 0, frozen: 0, dot: 0, dotT: 0 };
    m.hp = m.maxHp; mobs.push(m); return m;
  }
  function kill(m) {
    scene.remove(m.g); mobs.splice(mobs.indexOf(m), 1);
    me.money += m.rw; let drop = '';
    if (Math.random() < 0.5) { me.items[6]++; drop = ' · +1 ' + nm(ITEMS[6]); }
    if (Math.random() < 0.05) { me.items[7]++; drop += ' · +1 ' + nm(ITEMS[7]); }
    if (m.zone === 'zombie') { if (Math.random() < 0.03) { me.items[23]++; drop += ' · +1 ' + nm(ITEMS[23]); } if (Math.random() < 0.01) { me.items[22]++; drop += ' · 🪽 ELYTRA!'; } }
    toast('+' + egp(m.rw) + drop); gainXp(10 + m.floor * 3);
    if (me.power >= 0 && heldFruit) fruitXp(3);
    if (api.onKill) api.onKill(m);
    save();
  }
  function hurt(m, dmg, o) {
    if (!m || m.hp <= 0) return; o = o || {};
    m.hp -= dmg; m.g.userData.flash = 0.15;
    if (o.freeze) m.frozen = now() + o.freeze; if (o.dot) { m.dot = o.dot; m.dotT = now() + 3; }
    if (o.push) { const dx = m.g.position.x - pos.x, dz = m.g.position.z - pos.z, d = Math.hypot(dx, dz) || 1; m.g.position.x += dx / d * o.push; m.g.position.z += dz / d * o.push; }
    if (o.pull) { const f = face(); m.g.position.x = pos.x + f.x * 2; m.g.position.z = pos.z + f.z * 2; }
    if (m.hp <= 0) kill(m);
  }
  const dist = m => Math.hypot(m.g.position.x - pos.x, m.g.position.z - pos.z);
  const inCone = (m, range, deg) => { const d = dist(m); if (d > range) return false; const f = face(), dx = (m.g.position.x - pos.x) / (d || 1), dz = (m.g.position.z - pos.z) / (d || 1); return d < 1.2 || dx * f.x + dz * f.z > Math.cos(deg * Math.PI / 180); };
  const nearest = r => { let b = null, bd = r; for (const m of mobs) { const d = dist(m); if (d < bd) { bd = d; b = m; } } return b; };

  // where monsters live (Unity: IslandSpawns on the island you are on · Zombie Island pillars)
  let spawnT = 0;
  function spawner(dt) {
    if ((spawnT -= dt) > 0) return; spawnT = 1.2;
    const isl = islands.find(s => Math.abs(pos.x - s.x) < s.size / 2 + 20 && Math.abs(pos.z - s.z) < s.size / 2 + 20);
    for (const m of [...mobs]) if (Math.hypot(m.g.position.x - pos.x, m.g.position.z - pos.z) > 260) { scene.remove(m.g); mobs.splice(mobs.indexOf(m), 1); }
    if (!isl) return;
    if (isl.zombie) { if (mobs.filter(m => m.zone === 'zombie').length < 14) { const p = zombie.pillars[Math.floor(Math.random() * zombie.pillars.length)]; spawn(Math.floor(Math.random() * 3), 3 + Math.floor(Math.random() * 6), p.x + (Math.random() - .5) * 6, p.z + (Math.random() - .5) * 6, 'zombie'); } return; }
    if (!isl.mobs) return;
    if (mobs.filter(m => m.zone === isl.name).length < 16) {
      let x, z, k = 0; do { x = isl.x + (Math.random() - .5) * (isl.size - 30); z = isl.z + (Math.random() - .5) * (isl.size - 30); k++; } while (Math.hypot(x - pos.x, z - pos.z) < 25 && k < 9);
      spawn(Math.floor(Math.random() * 4 * (Math.random() < 0.85 ? 0.75 : 1)), isl.lava ? 12 + Math.floor(Math.random() * 8) : 8 + Math.floor(Math.random() * 6), x, z, isl.name);
    }
  }

  // ---------- visuals ----------
  function ring(x, z, r, col, life) { const m = new THREE.Mesh(new THREE.RingGeometry(Math.max(0.1, r - 0.6), r, 40), new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.75, side: THREE.DoubleSide, depthWrite: false })); m.rotation.x = -Math.PI / 2; m.position.set(x, 0.15, z); scene.add(m); fx.push({ m, life, t: 0, grow: true }); }
  function ball(x, y, z, r, col, life, vy) { const m = new THREE.Mesh(new THREE.SphereGeometry(r, 16, 12), new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.8 })); m.position.set(x, y, z); scene.add(m); fx.push({ m, life, t: 0, vy: vy || 0 }); return m; }
  function beam(len, col, w) { const f = face(), m = new THREE.Mesh(new THREE.BoxGeometry(w || 0.5, w || 0.5, len), new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.85 })); m.position.set(pos.x + f.x * len / 2, 1.2 + pos.y, pos.z + f.z * len / 2); m.rotation.y = Math.atan2(f.x, f.z); scene.add(m); fx.push({ m, life: 0.3, t: 0 }); }

  // ---------- fruit moves (Unity MoveKind, grouped) ----------
  const fruitLv = () => me.fLv[me.power] || 0;
  function fruitXp(n) { const f = me.power; if (f < 0 || me.fLv[f] >= FRUIT_MAX) return; me.fXp[f] += n; while (me.fLv[f] < FRUIT_MAX && me.fXp[f] >= needFx(me.fLv[f])) { me.fXp[f] -= needFx(me.fLv[f]); me.fLv[f]++; if (me.fLv[f] % 10 === 0) toast(nm(FRUITS[f]) + T(' level ', ' ليفل ') + me.fLv[f]); } }
  let heldFruit = false;
  function useMove(slot) {
    if (me.power < 0) return toast(T('Eat a fruit first (FRUIT shop)', 'كُل فاكهة الأول (محل الفاكهة)'));
    const fr = FRUITS[me.power], mv = fr.moves[slot]; if (!mv) return;
    const key = me.power + ':' + slot; if (now() < (cds[key] || 0)) return toast(mv.n + ' · ' + Math.ceil(cds[key] - now()) + 's');
    cds[key] = now() + mv.cd;
    const dmg = Math.round(mv.dmg * lvMult(fruitLv()) * (now() < formUntil ? 1.5 : 1)), col = fr.col, f = face(), r = mv.range;
    const area = (rad, o) => { ring(pos.x, pos.z, rad, col, 0.5); for (const m of [...mobs]) if (dist(m) < rad) hurt(m, dmg, o); };
    switch (mv.k) {
      case 'Beam': case 'Chain': case 'Lightning': case 'Boulder': beam(r, col, mv.k === 'Boulder' ? 1.4 : 0.5); for (const m of [...mobs]) if (inCone(m, r, 14)) hurt(m, dmg); break;
      case 'FreezeBeam': beam(r, col); for (const m of [...mobs]) if (inCone(m, r, 14)) hurt(m, dmg, { freeze: 2.5 }); break;
      case 'Burn': beam(r, col, 1.2); for (const m of [...mobs]) if (inCone(m, r, 22)) hurt(m, dmg, { dot: dmg * 0.25 }); break;
      case 'Barrage': for (let i = 0; i < 6; i++) setTimeout(() => { beam(r, col, 0.25); for (const m of [...mobs]) if (inCone(m, r, 12)) hurt(m, dmg); }, i * 90); break;
      case 'Orbs': for (let i = 0; i < 3; i++) ball(pos.x + Math.sin(i * 2.1) * 2, 1.4, pos.z + Math.cos(i * 2.1) * 2, 0.4, col, 1.2); area(r + 2); break;
      case 'Blast': case 'Slam': case 'Spin': case 'Nova': case 'Eruption': case 'Domain': area(mv.k === 'Eruption' ? r * 0.6 : r); if (mv.k === 'Nova' || mv.k === 'Domain') ball(pos.x, 1, pos.z, r * 0.5, col, 0.5); break;
      case 'Knock': case 'Wave': area(r * (mv.k === 'Wave' ? 0.7 : 1), { push: 6 }); break;
      case 'Freeze': case 'Cage': case 'Trap': case 'Wall': area(r, { freeze: 3 }); break;
      case 'Poison': area(r, { dot: dmg * 0.4 }); break;
      case 'Tornado': case 'BlackHole': { const c = { x: pos.x + f.x * 6, z: pos.z + f.z * 6 }; ball(c.x, 1.5, c.z, 1.6, col, 2); for (const m of [...mobs]) if (Math.hypot(m.g.position.x - c.x, m.g.position.z - c.z) < r) { m.g.position.x += (c.x - m.g.position.x) * 0.7; m.g.position.z += (c.z - m.g.position.z) * 0.7; hurt(m, dmg * 3, { freeze: 2 }); } ring(c.x, c.z, r, col, 0.8); break; }
      case 'TimeStop': timeStopUntil = now() + 4; area(r, { freeze: 4 }); toast(T('TIME STOP!', 'الوقت وقف!')); break;
      case 'Pull': for (const m of [...mobs]) if (inCone(m, r, 30)) hurt(m, dmg, { pull: true }); beam(r, col, 0.3); break;
      case 'Meteor': case 'Rain': case 'LaserRain': case 'SkyMissile': { const t = nearest(r * 1.5); const c = t ? { x: t.g.position.x, z: t.g.position.z } : { x: pos.x + f.x * r * 0.7, z: pos.z + f.z * r * 0.7 }; const n = mv.k === 'Meteor' || mv.k === 'SkyMissile' ? 1 : 6; for (let i = 0; i < n; i++) setTimeout(() => { const x = c.x + (n > 1 ? (Math.random() - .5) * 8 : 0), z = c.z + (n > 1 ? (Math.random() - .5) * 8 : 0); ball(x, 14, z, n > 1 ? 0.5 : 1.3, col, 0.5, -28); setTimeout(() => { ring(x, z, n > 1 ? 2.5 : 4.5, col, 0.4); for (const m of [...mobs]) if (Math.hypot(m.g.position.x - x, m.g.position.z - z) < (n > 1 ? 2.5 : 4.5)) hurt(m, dmg); }, 450); }, i * 120); break; }
      case 'Dash': { const d = Math.min(20, r * 0.45); ctx.move(f.x * d, f.z * d); for (const m of [...mobs]) if (dist(m) < 3.5) hurt(m, dmg); ring(pos.x, pos.z, 2.5, col, 0.3); break; }
      case 'Teleport': ctx.move(f.x * Math.min(20, r * 0.6), f.z * Math.min(20, r * 0.6)); ring(pos.x, pos.z, 1.5, col, 0.3); if (dmg) for (const m of [...mobs]) if (dist(m) < 3) hurt(m, dmg); break;
      case 'Jump': ctx.jump(16); setTimeout(() => area(5), 700); break;
      case 'Float': floatUntil = now() + 8; ctx.jump(6); toast(T('Zero gravity!', 'من غير جاذبية!')); break;
      case 'Invis': invisUntil = now() + 6; player.visible = false; setTimeout(() => (player.visible = true), 6000); toast(T('Invisible!', 'اختفيت!')); break;
      case 'Heal': me.hp = Math.min(maxHp(), me.hp + dmg * 3); ring(pos.x, pos.z, 2, 0x4ade80, 0.6); toast('+' + dmg * 3 + ' HP'); break;
      case 'Shield': shieldUntil = now() + 8; ball(pos.x, 1, pos.z, 1.4, col, 0.6); toast(T('Shield: less damage', 'درع: ضرر أقل')); break;
      case 'Leech': { let hit = 0; for (const m of [...mobs]) if (inCone(m, r, 40)) { hurt(m, dmg); hit++; } if (hit) me.hp = Math.min(maxHp(), me.hp + dmg / 2); ring(pos.x, pos.z, r, col, 0.3); break; }
      case 'Transform': formUntil = now() + 25; player.scale.setScalar(1.8); setTimeout(() => player.scale.setScalar(1), 25000); area(r * 0.4); toast(mv.n + '!'); break;
    }
    beep(300 + slot * 120, 0.12, 'sawtooth', 0.04); fruitXp(1); save();
  }

  // ---------- melee: sword (1) or fighting style (3) ----------
  function swordDmg() { const s = SWORDS[me.sword].dmg, f = me.forged ? me.forged.dmg : 0; return Math.max(s, f); }
  function attack() {
    if (now() < atkCd) return; atkCd = now() + 0.45;
    let dmg, range, o = {};
    if (me.held === 1) { dmg = swordDmg(); range = 2.6 + (me.sword > 0 ? 1 : 0); }
    else if (me.held === 3) { const st = STYLES[me.style]; dmg = Math.round(6 * st.dmg * (1 + me.lvl / 100)); range = st.range; styleHits++; if (me.style === 1 && styleHits % 4 === 0) o.freeze = 1.5; if (me.style === 2) dmg = Math.round(dmg * (1 + Math.min(4, styleHits % 5) * 0.1)); if (me.style === 5) o.dot = dmg * 0.2; }
    else return false;
    const hits = mobs.filter(m => inCone(m, range, 60));
    if (me.held === 3 && me.style === 4 && hits.length) { const extra = mobs.find(m => !hits.includes(m) && dist(m) < range + 4); if (extra) hits.push(extra); }
    hits.forEach(m => hurt(m, dmg, o));
    if (hits.length && me.held === 3 && me.style === 6) me.hp = Math.min(maxHp(), me.hp + dmg * 0.15);
    player.userData.swing = 0.25; beep(hits.length ? 220 : 160, 0.06, 'square', 0.04); return true;
  }
  function styleMove(slot) {
    const st = STYLES[me.style], key = 's' + me.style + slot, cd = slot ? st.cdX : st.cdZ;
    if (now() < (cds[key] || 0)) return toast((slot ? st.x : st.z) + ' · ' + Math.ceil(cds[key] - now()) + 's'); cds[key] = now() + cd;
    const dmg = Math.round(6 * st.dmg * (1 + me.lvl / 100) * 2.5);
    if (slot === 0) { const f = face(); ctx.move(f.x * 6, f.z * 6); for (const m of [...mobs]) if (dist(m) < 3.5) hurt(m, dmg, { push: 4 }); }
    else { ring(pos.x, pos.z, st.range + 3, st.col, 0.4); for (const m of [...mobs]) if (dist(m) < st.range + 3) hurt(m, dmg, { push: 5 }); }
    toast(slot ? st.x : st.z); beep(260, 0.1, 'sawtooth', 0.05);
  }

  // ---------- shops ----------
  const row = (html, btn, fn, dis) => { const d = document.createElement('div'); d.className = 'prow'; d.innerHTML = '<div>' + html + '</div>'; if (btn) { const b = document.createElement('button'); b.type = 'button'; b.textContent = btn; b.disabled = !!dis; b.onclick = fn; d.appendChild(b); } return d; };
  const rTag = r => '<b style="color:' + RAR[r][2] + '">' + T(RAR[r][0], RAR[r][1]) + '</b>';
  const gachaN = () => { const t = Date.now(); me.gacha = me.gacha.filter(x => t - x < 864e5); return me.gacha.length; };
  const gachaPrice = () => Math.round(GACHA_BASE * Math.pow(GACHA_GROW, gachaN()));
  function eat(i) { if (!me.fruitBag[i]) return; me.fruitBag[i]--; me.power = i; toast(T('You ate the ', 'كلت ') + nm(FRUITS[i]) + T('! Hold 2 and press Z X C V', '! امسك 2 ودوس Z X C V')); beep(520, 0.25, 'triangle', 0.06); save(); redraw(); }
  function fruitShop() {
    panel(T('FRUIT SHOP', 'محل الفاكهة'), b => {
      b.appendChild(row('💰 ' + egp(me.money) + ' · 💎 ' + me.gems + (me.power >= 0 ? ' · ' + T('Your power: ', 'قدرتك: ') + nm(FRUITS[me.power]) + ' (LV ' + fruitLv() + ')' : '')));
      b.appendChild(row('🎲 <b>' + T('RANDOM FRUIT', 'فاكهة عشوائية') + '</b><br><small>' + T('The price goes up ×1.3 every roll and resets after 24 hours.', 'السعر بيزيد ×1.3 كل لفة وبيرجع بعد 24 ساعة.') + '</small>', egp(gachaPrice()), () => {
        const p = gachaPrice(); if (me.money < p) return toast(T('NOT ENOUGH MONEY', 'فلوسك مش كفاية'));
        me.money -= p; me.gacha.push(Date.now()); let w = Math.random() * 100, r = 0; while (r < 4 && w > GACHA_W[r]) { w -= GACHA_W[r]; r++; }
        const pool = FRUITS.map((f, i) => i).filter(i => FRUITS[i].r === r); const i = pool[Math.floor(Math.random() * pool.length)]; me.fruitBag[i]++;
        toast('🎲 ' + nm(FRUITS[i]) + ' — ' + T(RAR[r][0], RAR[r][1])); save(); fruitShop();
      }, me.money < gachaPrice()));
      FRUITS.forEach((f, i) => {
        const own = me.fruitBag[i];
        b.appendChild(row('<b style="color:#' + new THREE.Color(f.col).getHexString() + '">' + nm(f) + '</b> ' + rTag(f.r) + '<br><small>' + f.moves.map(m => m.n).join(' · ') + (own ? ' · ' + T('in bag: ', 'في الشنطة: ') + own : '') + '</small>',
          own ? T('EAT', 'كُل') : f.gems ? '💎 ' + f.gems : egp(f.price), () => { if (own) return eat(i); if (f.gems) { if (me.gems < f.gems) return toast(T('You need ', 'محتاج ') + f.gems + T(' gems (clear gates and dungeons)', ' جوهرة (اقفل بوابات ودانجن)')); me.gems -= f.gems; me.fruitBag[i]++; toast(T('Bought ', 'اشتريت ') + nm(f)); save(); return fruitShop(); } if (me.money < f.price) return toast(T('NOT ENOUGH MONEY', 'فلوسك مش كفاية')); me.money -= f.price; me.fruitBag[i]++; toast(T('Bought ', 'اشتريت ') + nm(f)); save(); fruitShop(); }, !own && (f.gems ? me.gems < f.gems : me.money < f.price)));
      });
    });
  }
  function styleShop() {
    panel(T('FIGHTING STYLES', 'أساليب القتال'), b => {
      b.appendChild(row('💰 ' + egp(me.money) + ' · ' + T('Hold 3 · click / F to punch · Z X for moves', 'امسك 3 · F للضرب · Z X للحركات')));
      STYLES.forEach((s, i) => { const own = (me.styles >> i) & 1, on = me.style === i; b.appendChild(row('<b style="color:#' + new THREE.Color(s.col).getHexString() + '">' + nm(s) + '</b> · ×' + s.dmg + '<br><small>Z ' + s.z + ' · X ' + s.x + ' · ' + T(s.passive[0], s.passive[1]) + '</small>', on ? T('USING', 'شغّال') : own ? T('USE', 'استخدم') : egp(s.price), () => { if (!own) { if (me.money < s.price) return toast(T('NOT ENOUGH MONEY', 'فلوسك مش كفاية')); me.money -= s.price; me.styles |= 1 << i; } me.style = i; save(); redraw(); styleShop(); }, on || (!own && me.money < s.price))); });
    });
  }

  // ---------- per frame ----------
  const api = {
    fruitShop, styleShop, attack, mobs, spawn, fruitXp, onKill: null,
    remove(m) { scene.remove(m.g); const k = mobs.indexOf(m); if (k >= 0) mobs.splice(k, 1); },
    fruitName: () => (me.power >= 0 ? nm(FRUITS[me.power]) + ' ' + fruitLv() : null), styleName: () => nm(STYLES[me.style]),
    keys(hit, held) {
      heldFruit = held === 2;
      if (held === 2) { const k = ['KeyZ', 'KeyX', 'KeyC', 'KeyV']; for (let i = 0; i < 4; i++) if (hit(k[i])) useMove(i); }
      if (held === 3) { if (hit('KeyZ')) styleMove(0); if (hit('KeyX')) styleMove(1); }
      if (hit('KeyF')) attack();
    },
    move: useMove, styleMove,
    float: () => now() < floatUntil,
    damageTaken(d) { if (now() < shieldUntil) d *= 0.5; if (me.held === 3 && me.style === 3) d *= 0.7; return d; },
    update(dt) {
      spawner(dt);
      const t = now(), stop = t < timeStopUntil;
      for (const m of [...mobs]) {
        const g = m.g, d = dist(m);
        if (m.dot && t < m.dotT) { m.hp -= m.dot * dt; if (m.hp <= 0) { kill(m); continue; } }
        m.bar.visible = m.hp < m.maxHp && d > 2.5; if (m.bar.visible) { m.bar.scale.x = Math.max(0.01, m.hp / m.maxHp); m.bar.lookAt(ctx.camera.position); }
        if (g.userData.flash > 0) { g.userData.flash -= dt; g.visible = Math.floor(g.userData.flash * 30) % 2 === 0; } else g.visible = true;
        if (stop || t < m.frozen) continue;
        const chase = d < 28 && t > invisUntil && me.hp > 0;
        const tx = chase ? pos.x : m.home.x, tz = chase ? pos.z : m.home.z, dx = tx - g.position.x, dz = tz - g.position.z, dd = Math.hypot(dx, dz);
        if (dd > (chase ? 1.4 : 2)) { const s = Math.min(dd, m.sp * dt * (chase ? 1 : 0.4)); g.position.x += dx / dd * s; g.position.z += dz / dd * s; g.rotation.y = Math.atan2(dx, dz); g.userData.anim && g.userData.anim(dt, 1, true); }
        if (chase && d < 1.8 && (m.cd -= dt) <= 0) { m.cd = 1.2; ctx.hurtMe(api.damageTaken(m.dmg)); if (m.d.n === 'Blast Blob') { ring(g.position.x, g.position.z, 3, 0xff7a00, 0.4); scene.remove(g); mobs.splice(mobs.indexOf(m), 1); } }
      }
      for (const e of [...fx]) { e.t += dt; if (e.grow) e.m.scale.setScalar(0.3 + e.t / e.life); if (e.vy) e.m.position.y = Math.max(0.5, e.m.position.y + e.vy * dt); e.m.material.opacity = Math.max(0, 0.85 * (1 - e.t / e.life)); if (e.t > e.life) { scene.remove(e.m); e.m.geometry.dispose(); fx.splice(fx.indexOf(e), 1); } }
    }
  };
  return api;
}
