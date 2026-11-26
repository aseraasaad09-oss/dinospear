// THE TEXT — story world V02
// Turns a story + the player's choices into a real 3D game you play in 3rd or 1st person (never from the top).
// The story decides the places, the things in the world, the enemies, the friends and the quests of every chapter;
// the choices decide the map shape, time of day, weather, enemies, attack, difficulty and controls.
import { THREE, preload, model, hasModel, makeChar, beep as beep0, T, store, view, cycleView, camDir } from './engine.js';
let SND = 1; const beep = (f, d, t, v) => { if (SND > 0) beep0(f, d, t, (v || 0.05) * SND); };
const COLORS = { red: '#ef4444', 'أحمر': '#ef4444', 'احمر': '#ef4444', blue: '#3b82f6', 'أزرق': '#3b82f6', 'ازرق': '#3b82f6', green: '#22c55e', 'أخضر': '#22c55e', 'اخضر': '#22c55e', yellow: '#facc15', 'أصفر': '#facc15', 'اصفر': '#facc15', black: '#111827', 'أسود': '#111827', 'اسود': '#111827', white: '#f8fafc', 'أبيض': '#f8fafc', 'ابيض': '#f8fafc', purple: '#a855f7', 'بنفسجي': '#a855f7', 'موف': '#a855f7', orange: '#f97316', 'برتقالي': '#f97316', pink: '#ec4899', 'بمبي': '#ec4899', 'وردي': '#ec4899', gold: '#eab308', 'دهبي': '#eab308', 'ذهبي': '#eab308', grey: '#9ca3af', gray: '#9ca3af', 'رمادي': '#9ca3af', brown: '#92400e', 'بني': '#92400e' };
const colorWord = w => { w = String(w || '').toLowerCase(); const k = Object.keys(COLORS).find(c => w.indexOf(c) >= 0); return k ? COLORS[k] : null; };

// ---------- 1) reading the story ----------
const has = (t, re) => re.test(t);
const THEMES = {
  forest: { re: /(غاب[ةه]|شجر|أشجار|اشجار|forest|tree|jungle|woods)/i, ground: 0x4d8b3a, sky: 0x9fd8ff, props: ['tree', 'tree', 'bush', 'rock', 'mushroom'] },
  desert: { re: /(صحرا|رمل|جمل|هرم|desert|sand|camel|pyramid|dune)/i, ground: 0xe3c07a, sky: 0xffe0a8, props: ['cactus', 'rock', 'palm', 'rock'] },
  ice: { re: /(تلج|ثلج|جليد|شتا|snow|ice|frozen|winter|arctic)/i, ground: 0xeaf4ff, sky: 0xcfe6ff, props: ['snowman', 'rock', 'crystal', 'tree'] },
  space: { re: /(فضاء|صاروخ|كوكب|مريخ|قمر|نجم|space|rocket|planet|mars|moon|alien|galaxy)/i, ground: 0x6b5b95, sky: 0x0b0f2a, props: ['crystal', 'rock', 'rocket', 'crystal'] },
  city: { re: /(مدين[ةه]|شارع|مبنى|عربي[ةه]|city|street|building|car|town)/i, ground: 0x6b7280, sky: 0xa9d6ff, props: ['house', 'car', 'tree', 'house'] },
  sea: { re: /(بحر|جزير[ةه]|شاطئ|سفين[ةه]|مركب|قرصان|sea|island|beach|ship|boat|pirate|ocean)/i, ground: 0xf1d79a, sky: 0x8fd3ff, props: ['palm', 'rock', 'boat', 'chest'] },
  volcano: { re: /(بركان|حمم|نار|لهب|volcano|lava|fire|flame)/i, ground: 0x3f2a22, sky: 0x4a1d12, props: ['rock', 'crystal', 'rock'] },
  castle: { re: /(قلع[ةه]|قصر|ملك|أمير|اميرة|أميرة|مملك[ةه]|castle|king|queen|prince|princess|kingdom|knight)/i, ground: 0x7aa35a, sky: 0xb7dcff, props: ['tower', 'tree', 'house', 'rock'] },
  haunted: { re: /(شبح|أشباح|اشباح|مسكون|رعب|مقبر[ةه]|ghost|haunted|scary|grave|spooky)/i, ground: 0x2f3b2f, sky: 0x1b1530, props: ['tree', 'rock', 'house', 'mushroom'] },
  cave: { re: /(كهف|كهوف|مغار[ةه]|منجم|cave|mine|underground|tunnel)/i, ground: 0x4b4b55, sky: 0x15151c, props: ['crystal', 'rock', 'rock', 'mushroom'] },
  farm: { re: /(مزرع[ةه]|بقر|فراخ|حقل|farm|cow|field|barn|chicken)/i, ground: 0x6fae47, sky: 0xa8dcff, props: ['house', 'tree', 'bush', 'crate'] }
};
const THINGS = [  // words in the story → real objects placed in that chapter's world
  ['house', /(بيت|بيوت|منزل|house|home|cottage)/i], ['tower', /(قلع[ةه]|برج|قصر|castle|tower|palace)/i], ['car', /(عربي[ةه]|سيار[ةه]|car|truck)/i],
  ['boat', /(مركب|سفين[ةه]|قارب|boat|ship)/i], ['rocket', /(صاروخ|rocket|spaceship)/i], ['chest', /(كنز|صندوق|treasure|chest|gold)/i],
  ['crystal', /(كريستال|جوهر[ةه]|حجر سحري|crystal|gem|jewel|diamond)/i], ['mushroom', /(فطر|مشروم|mushroom)/i], ['palm', /(نخل[ةه]|palm)/i],
  ['cactus', /(صبار|cactus)/i], ['snowman', /(رجل التلج|رجل الثلج|snowman)/i], ['dog', /(كلب|جرو|dog|puppy)/i], ['cat', /(قط[ةه]?|بس[ةه]|cat|kitten)/i],
  ['dinopet', /(داينو|ديناصور|dino)/i], ['tree', /(شجر[ةه]|tree)/i], ['crate', /(صندوق خشب|كرتون|box|crate)/i]
];
const ITEMS = [  // things the hero can be asked to FIND
  ['key', /(مفتاح|key)/i, ['Key', 'المفتاح']], ['chest', /(كنز|treasure)/i, ['Treasure', 'الكنز']], ['crystal', /(كريستال|جوهر[ةه]|حجر|crystal|gem|stone|jewel)/i, ['Crystal', 'الجوهرة']],
  ['sword', /(سيف|sword)/i, ['Sword', 'السيف']], ['coin', /(عمل[ةه]|فلوس|دهب|ذهب|coin|gold|money)/i, ['Coins', 'العملات']], ['star', /(نجم|نجوم|star)/i, ['Stars', 'النجوم']]
];
const FOES = { robot: /(روبوت|آلي|robot|machine|drone)/i, ghost: /(شبح|أشباح|اشباح|ghost|spirit)/i, dragon: /(تنين|dragon)/i, creature: /(وحش|زومبي|مخلوق|monster|zombie|creature|beast)/i, soldier: /(جنود|جندي|حراس|حارس|عصاب[ةه]|حرامي|لص|soldier|guard|thief|bandit|pirate|قرصان)/i };
const VERBS = {
  find: /(دو[ّ]?ر|يدور|بيدور|لقى|لاقى|يلاقي|بحث|يبحث|دور على|find|found|search|look for|seek)/i,
  rescue: /(أنقذ|انقذ|ينقذ|خلص|يخلص|حرر|ساعد|rescue|save|saved|free|help)/i,
  fight: /(هزم|يهزم|حارب|يحارب|ضرب|قاتل|فاز على|defeat|beat|fight|fought|battle|attack|kill)/i,
  escape: /(هرب|يهرب|جري|يجري|نجا|escape|run away|ran|flee|chase)/i,
  talk: /(قال|سأل|كلم|يكلم|حكى|said|asked|told|talk|spoke)/i,
  travel: /(سافر|راح|وصل|مشي|يمشي|عبر|طار|travel|went|reach|arrive|walk|cross|journey|flew)/i,
  build: /(بنى|يبني|صلح|يصلح|عمل|build|built|fix|repair|make)/i,
  collect: /(جمع|يجمع|لم|يلم|collect|gather|pick up)/i
};
function hash(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
function rng(seed) { let s = seed % 2147483646 + 1; return () => (s = (s * 16807) % 2147483647, (s - 1) / 2147483646); }
function names(story) {
  const out = [];
  (story.match(/(?:اسمه|اسمها|يدعى|تدعى|named|called)\s+([^\s,.،!?؟]{2,16})/gi) || []).forEach(m => out.push(m.split(/\s+/).pop()));
  const cnt = {}; (story.match(/\b[A-Z][a-z]{2,14}\b/g) || []).forEach(w => { if (!/^(The|And|But|When|Then|One|They|She|He|It|In|On|At|After|Before|There|This|That|His|Her|Once|Suddenly|Finally|Inside|Outside|With|Every|Chapter)$/.test(w)) cnt[w] = (cnt[w] || 0) + 1; });
  Object.keys(cnt).sort((a, b) => cnt[b] - cnt[a]).forEach(w => { if (out.indexOf(w) < 0) out.push(w); });
  return out.slice(0, 6);
}
const WORD_KEYS = ['w_ground', 'w_sky', 'w_tree', 'w_build', 'w_water', 'w_wx', 'w_item', 'w_treasure', 'w_weapon', 'w_power', 'w_food', 'w_animal', 'w_vehicle', 'w_enemy1', 'w_enemy2', 'w_bossk', 'w_friendk', 'w_mood', 'w_time', 'w_extra1', 'w_extra2', 'w_extra3', 'w_goal'];
export function analyse(story, title, ans) {
  story = String(story || ''); ans = ans || {};
  const W = WORD_KEYS.map(k => ans[k] || '').filter(Boolean).join(' . ');   // V03: the player's own words change every chapter's world
  let paras = story.split(/\n\s*\n|\n(?=\s*(?:الفصل|فصل|chapter|part)\b)/i).map(p => p.trim()).filter(p => p.length > 3);
  if (paras.length < 2) { const sent = story.split(/(?<=[.!?؟])\s+/).filter(Boolean); const n = Math.min(6, Math.max(1, Math.ceil(sent.length / 3))); paras = []; for (let c = 0; c < n; c++) paras.push(sent.slice(Math.floor(c * sent.length / n), Math.floor((c + 1) * sent.length / n)).join(' ')); }
  if (paras.length > 8) { const m = []; for (let k = 0; k < 8; k++) m.push(paras.slice(Math.floor(k * paras.length / 8), Math.floor((k + 1) * paras.length / 8)).join(' ')); paras = m; }
  const nm = names(story), hero = ans.n_hero || nm[0] || title || T('Hero', 'البطل'), friends = [ans.n_friend1, ans.n_friend2, ans.n_friend3].filter(Boolean).concat(nm.slice(1, 4)).slice(0, 3);
  const score = t => Object.keys(THEMES).map(k => [k, (t.match(new RegExp(THEMES[k].re.source, 'gi')) || []).length]).sort((a, b) => b[1] - a[1]);
  const whole = score(story + ' ' + W), mainTheme = whole[0][1] ? whole[0][0] : ['forest', 'city', 'castle', 'sea', 'space'][hash(story) % 5];
  let foe = Object.keys(FOES).find(k => FOES[k].test((ans.w_enemy1 || '') + ' ' + (ans.w_bossk || ''))) || Object.keys(FOES).find(k => FOES[k].test(story + ' ' + W)) || null;
  const quotes = (story.match(/[«"“]([^»"”]{4,90})[»"”]/g) || []).map(q => q.slice(1, -1));
  if (ans.x_chap && ans.x_chap !== 'all') paras = paras.slice(0, +ans.x_chap);
  const chapters = paras.map((p0, i) => {
    const place = ans['w_place' + (i + 1)] || '', p = p0 + ' ' + W + ' ' + place + ' ' + place;
    const sc = score(place ? place : p), theme = sc[0][1] ? sc[0][0] : mainTheme, last = i === paras.length - 1;
    const things = THINGS.filter(t => t[1].test(p)).map(t => t[0]);
    const item = ITEMS.find(t => t[1].test(p));
    const q = [];
    if (VERBS.talk.test(p) && friends.length) q.push({ k: 'talk', who: friends[i % friends.length] });
    if (item && (VERBS.find.test(p) || VERBS.collect.test(p) || true)) q.push({ k: 'find', item: item[0], label: item[2], n: /(كل|all|many|كتير)/i.test(p) || item[0] === 'coin' || item[0] === 'star' ? 5 : 1 });
    else if (VERBS.collect.test(p)) q.push({ k: 'find', item: 'star', label: ['Stars', 'النجوم'], n: 4 });
    if (VERBS.rescue.test(p)) q.push({ k: 'rescue', who: friends[(i + 1) % Math.max(1, friends.length)] || T('your friend', 'صاحبك') });
    if (VERBS.build.test(p)) q.push({ k: 'build', n: 3 });
    if (VERBS.fight.test(p) || (last && foe)) q.push({ k: last && (foe === 'dragon' || /(زعيم|ملك الشر|boss|king of|dragon|تنين)/i.test(p) || foe) ? 'boss' : 'fight', n: 3 });
    if (VERBS.escape.test(p)) q.push({ k: 'escape' });
    if (!q.length || VERBS.travel.test(p)) q.push({ k: 'reach' });
    const seen = {}; const quests = q.filter(x => !seen[x.k] && (seen[x.k] = 1)).slice(0, 3);
    const night = /(ليل|ظلام|مظلم|نجوم|قمر|night|dark|moon|midnight)/i.test(p), rain = /(مطر|عاصف[ةه]|rain|storm)/i.test(p), snow = /(تلج|ثلج|snow)/i.test(p);
    return { text: p0, title: ans['l_ch' + (i + 1)] || '', seed: hash(p + i + (ans.map || '')), theme, things, quests, night, rain, snow, line: quotes[i] || '' };
  });
  return { v: 2, hero, friends, foe, chapters, theme: mainTheme };
}

// ---------- 2) the game ----------
const KIND_MODEL = { robot: 'robot', ghost: 'ghost', dragon: 'dragon', creature: 'creature', soldier: 'person' };
const ALL_MODELS = ['person', 'tree', 'rock', 'bush', 'key', 'creature', 'dog', 'cat', 'dinopet', 'crate', 'house', 'tower', 'car', 'boat', 'rocket', 'robot', 'dragon', 'ghost', 'chest', 'sword', 'cactus', 'palm', 'snowman', 'mushroom', 'crystal', 'star', 'coin', 'portal'];

export async function playWorld(g, opts) {
  opts = opts || {};
  const ans = Object.assign({ genre: 'story', type: 'adv', map: 'auto', time: 'auto', weather: 'auto', enemy: 'auto', attack: 'sword', level: '2', color: '#22c55e', hand: 'r', joy: 'm', dash: 'yes', djump: 'no', cam: '3rd' }, g.ans || {});
  const spec = (g.spec && g.spec.v === 2) ? g.spec : analyse(g.story, g.title, ans);
  // V03: every one of the 100 answers changes something
  const pick = (k, m, d) => (m[ans[k]] !== undefined ? m[ans[k]] : d);
  const X = { size: pick('x_size', { s: 0.75, l: 1.35 }, 1), speed: pick('x_speed', { slow: 0.7, fast: 1.35, super: 1.8 }, 1), jump: pick('x_jump', { low: 0.8, high: 1.3, moon: 1.75 }, 1), hp: +ans.x_hp || 5,
    inv: pick('x_inv', { short: 0.5, long: 2 }, 1), range: pick('x_range', { short: 0.7, long: 1.7 }, 1), rate: pick('x_rate', { slow: 1.5, fast: 0.55 }, 1), shot: pick('x_shot', { slow: 0.6, fast: 1.6 }, 1), dashp: pick('x_dashp', { weak: 0.7, strong: 1.45 }, 1),
    foes: pick('x_foes', { few: 0.5, many: 1.7, swarm: 2.6 }, 1), fspeed: pick('x_fspeed', { slow: 0.7, fast: 1.4 }, 1), fhp: pick('x_fhp', { weak: -9, tough: 2 }, 0), fsize: pick('x_fsize', { s: 0.7, l: 1.4 }, 1), fdmg: +ans.x_fdmg || 1, bsize: pick('x_bsize', { huge: 1.6 }, 1), bhp: pick('x_bhp', { weak: 0.5, tough: 1.8 }, 1),
    grav: pick('x_grav', { light: 0.55, heavy: 1.5 }, 1), fog: pick('x_fog', { clear: 2.2, thick: 0.45 }, 1), light: pick('x_light', { dim: 0.55, bright: 1.5 }, 1), sky: ans.x_sky && ans.x_sky !== 'auto' ? ans.x_sky : null, wx: pick('x_wx', { light: 0.4, heavy: 2.2 }, 1),
    hearts: pick('x_hearts', { none: 0, many: 2.5 }, 1), time: pick('x_time', { short: 0.7, long: 1.6 }, 1), camd: pick('x_camd', { close: 0.75, far: 1.35 }, 1), fov: pick('x_fov', { narrow: -10, wide: 14 }, 0), shake: ans.x_shake !== 'no', snd: pick('x_sound', { quiet: 0.35, off: 0 }, 1), cards: ans.x_cards || 'yes',
    heroCol: colorWord(ans.w_color1), foeCol: colorWord(ans.w_color2) };
  SND = X.snd;
  if (/(bow|arrow|gun|laser|قوس|سهم|مسدس|ليزر|بندقي)/i.test(ans.w_weapon || '')) ans.attack = 'shoot'; else if (/(sword|knife|سيف|سكين)/i.test(ans.w_weapon || '')) ans.attack = 'sword';
  const root = document.createElement('div'); root.className = 'ttw';
  root.innerHTML = `<style>
.ttw [hidden]{display:none!important}
.ttw{position:fixed;inset:0;direction:ltr;z-index:60;background:#000;font-family:system-ui,sans-serif;color:#fff;touch-action:none;user-select:none}
.ttw canvas{display:block;width:100%;height:100%}
.ttw .tt-hud{position:absolute;top:10px;inset-inline:10px;display:flex;gap:8px;flex-wrap:wrap;align-items:center;pointer-events:none}
.ttw .tt-pill{background:rgba(15,23,42,.72);border-radius:999px;padding:6px 12px;font:800 13px system-ui;box-shadow:0 3px 10px rgba(0,0,0,.3)}
.ttw .tt-x{pointer-events:auto;border:0;cursor:pointer;color:#fff}
.ttw .tt-obj{position:absolute;top:52px;left:10px;direction:auto;max-width:min(360px,70vw);background:rgba(15,23,42,.72);border-radius:14px;padding:8px 12px;font:700 13px/1.5 system-ui;pointer-events:none}
.ttw .tt-obj b{color:#facc15}.ttw .tt-obj .done{opacity:.5;text-decoration:line-through}
.ttw .tt-boss{position:absolute;top:12px;left:50%;transform:translateX(-50%);width:min(320px,60vw);height:12px;border-radius:9px;background:#0008;overflow:hidden;display:none}
.ttw .tt-boss i{display:block;height:100%;background:linear-gradient(90deg,#ef4444,#f97316)}
.ttw .tt-card{position:absolute;inset:0;display:grid;place-items:center;background:rgba(2,6,23,.78);backdrop-filter:blur(4px)}
.ttw .tt-card>div{direction:rtl;max-width:min(620px,90vw);max-height:80vh;overflow:auto;background:#0f172a;border:2px solid #334155;border-radius:20px;padding:20px 22px;text-align:start}
.ttw .tt-card h3{margin:0 0 8px;color:#facc15;font:900 20px system-ui}.ttw .tt-card p{white-space:pre-line;line-height:1.7;font:600 15px/1.7 system-ui;margin:0 0 14px}
.ttw .tt-card button{border:0;border-radius:12px;padding:10px 18px;font:900 15px system-ui;background:#facc15;color:#3a2a00;cursor:pointer;margin-inline-end:8px}
.ttw .tt-card button.g{background:#334155;color:#fff}
.ttw .tt-say{position:absolute;bottom:150px;left:50%;transform:translateX(-50%);max-width:80vw;background:#fff;color:#111;border-radius:14px;padding:8px 14px;font:700 14px system-ui;display:none}
.ttw .tt-toast{position:absolute;top:40%;left:50%;transform:translate(-50%,-50%);font:900 clamp(18px,4vw,30px) system-ui;text-shadow:0 3px 12px #000;pointer-events:none;opacity:0;transition:opacity .3s}
.ttw .tt-toast.on{opacity:1}
.ttw .tt-joy{position:absolute;bottom:22px;width:130px;height:130px;border-radius:50%;background:rgba(255,255,255,.12);border:2px solid rgba(255,255,255,.25);touch-action:none}
.ttw .tt-joy i{position:absolute;left:50%;top:50%;width:54px;height:54px;margin:-27px;border-radius:50%;background:rgba(255,255,255,.55)}
.ttw .tt-btns{position:absolute;bottom:22px;display:grid;grid-template-columns:repeat(2,70px);gap:10px}
.ttw .tt-btns button{width:70px;height:70px;border-radius:50%;border:0;background:rgba(15,23,42,.7);color:#fff;font:900 13px system-ui;box-shadow:0 4px 0 #0006;touch-action:none}
.ttw .tt-btns button.a{background:#ef4444}.ttw .tt-btns button.j{background:#2563eb}
.ttw .tt-keys{position:absolute;bottom:8px;left:50%;transform:translateX(-50%);font:600 11px system-ui;opacity:.75;white-space:nowrap}
@media (hover:hover) and (pointer:fine){.ttw .tt-joy,.ttw .tt-btns{display:none}}
@media (hover:none){.ttw .tt-keys{display:none}}
</style>
<div class="tt-hud"><button class="tt-pill tt-x" data-r="exit">✕</button><span class="tt-pill" data-r="hp"></span><span class="tt-pill" data-r="ch"></span><button class="tt-pill tt-x" data-r="cam"></button></div>
<div class="tt-boss" data-r="boss"><i></i></div><div class="tt-obj" data-r="obj"></div><div class="tt-say" data-r="say"></div><div class="tt-toast" data-r="toast"></div>
<div class="tt-joy" data-r="joy"><i></i></div><div class="tt-btns" data-r="btns"><button class="j" data-b="jump"></button><button class="a" data-b="act"></button><button data-b="use"></button><button data-b="dash"></button></div>
<div class="tt-keys" data-r="keys"></div><div class="tt-card" data-r="card" hidden><div><h3></h3><p></p><span></span></div></div>`;
  document.body.appendChild(root); document.body.style.overflow = 'hidden';
  const $ = r => root.querySelector('[data-r="' + r + '"]');
  const left = ans.hand === 'l', js = { s: 104, m: 130, l: 160 }[ans.joy] || 130;
  Object.assign($('joy').style, { width: js + 'px', height: js + 'px', [left ? 'right' : 'left']: '22px' }); $('btns').style[left ? 'left' : 'right'] = '18px';
  const B = k => root.querySelector('[data-b="' + k + '"]');
  B('jump').textContent = T('Jump', 'نط'); B('act').textContent = ans.attack === 'none' ? T('Hide', 'استخبى') : ans.attack === 'shoot' ? T('Shoot', 'اضرب نار') : T('Hit', 'اضرب');
  B('use').textContent = T('Use', 'استخدم'); B('dash').textContent = T('Dash', 'اندفع'); if (ans.dash !== 'yes') B('dash').style.visibility = 'hidden';
  $('keys').textContent = T('WASD/arrows move · mouse drag turns · Space jump · F/click hit · E use · Shift dash · V camera', 'WASD/الأسهم للحركة · اسحب بالماوس تلف · Space نط · F/كليك اضرب · E استخدم · Shift اندفاع · V الكاميرا');

  const camNames = [['3rd person', 'شخص تالت'], ['Shoulder', 'ورا الكتف'], ['1st person', 'من عينيك']];
  if (ans.cam === '1st' && view.mode !== 2) view.mode = 2;
  const camLbl = () => { $('cam').textContent = '🎥 ' + T(camNames[view.mode][0], camNames[view.mode][1]); };
  $('cam').onclick = () => { cycleView(); camLbl(); }; camLbl();

  await preload(ALL_MODELS);
  const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75)); renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.toneMapping = THREE.ACESFilmicToneMapping;
  root.insertBefore(renderer.domElement, root.firstChild);
  const camera = new THREE.PerspectiveCamera(62, 1, 0.1, 400);
  const resize = () => { renderer.setSize(innerWidth, innerHeight, false); camera.aspect = innerWidth / innerHeight; camera.fov = (innerWidth < innerHeight ? 72 : 60) + X.fov; camera.updateProjectionMatrix(); };
  addEventListener('resize', resize); resize();

  // ----- input (own, so the game works the same on phone and PC) -----
  const keys = new Set(), pressed = new Set(); const joy = { x: 0, z: 0, on: false };
  const kd = e => { if (/INPUT|TEXTAREA/.test(document.activeElement && document.activeElement.tagName)) return; if (!keys.has(e.code)) pressed.add(e.code); keys.add(e.code); if (/Space|Arrow/.test(e.code)) e.preventDefault(); if (e.code === 'KeyV') { cycleView(); camLbl(); } };
  const ku = e => keys.delete(e.code);
  addEventListener('keydown', kd); addEventListener('keyup', ku);
  (() => { const b = $('joy'), k = b.firstChild; let id = null; const R = js * 0.36;
    const set = e => { const r = b.getBoundingClientRect(); let dx = e.clientX - r.left - r.width / 2, dy = e.clientY - r.top - r.height / 2; const m = Math.hypot(dx, dy); if (m > R) { dx *= R / m; dy *= R / m; } k.style.transform = `translate(${dx}px,${dy}px)`; joy.x = dx / R; joy.z = dy / R; };
    b.addEventListener('pointerdown', e => { id = e.pointerId; joy.on = true; b.setPointerCapture(id); set(e); e.stopPropagation(); });
    b.addEventListener('pointermove', e => { if (e.pointerId === id) set(e); });
    const end = () => { id = null; joy.on = false; joy.x = joy.z = 0; k.style.transform = ''; }; b.addEventListener('pointerup', end); b.addEventListener('pointercancel', end); })();
  root.querySelectorAll('[data-b]').forEach(b => { const code = { jump: 'Space', act: 'KeyF', use: 'KeyE', dash: 'ShiftLeft' }[b.dataset.b];
    b.addEventListener('pointerdown', e => { e.preventDefault(); e.stopPropagation(); pressed.add(code); keys.add(code); });
    const up = () => keys.delete(code); b.addEventListener('pointerup', up); b.addEventListener('pointercancel', up); b.addEventListener('pointerleave', up); });
  // drag on the picture to turn the camera; mouse click = hit
  let drag = null, moved = 0;
  renderer.domElement.addEventListener('pointerdown', e => { drag = { id: e.pointerId, x: e.clientX, y: e.clientY }; moved = 0; });
  addEventListener('pointermove', e => { if (!drag || e.pointerId !== drag.id) return; const dx = e.clientX - drag.x, dy = e.clientY - drag.y; moved += Math.abs(dx) + Math.abs(dy); view.yaw -= dx * 0.008; pitch = Math.max(-0.5, Math.min(0.6, pitch + dy * 0.004)); drag.x = e.clientX; drag.y = e.clientY; });
  const pu = e => { if (drag && e.pointerId === drag.id) { if (moved < 8 && e.pointerType === 'mouse') pressed.add('KeyF'); drag = null; } };
  addEventListener('pointerup', pu);
  let pitch = 0.1;

  // ----- world -----
  let scene, H, chIdx = 0, state = 'card', solids = [], foes = [], pickups = [], npcs = [], shots = [], quests = [], qi = 0, exitP = null, mats = {}, wx = null, groundAt = () => 0, bounds = 60;
  const R0 = rng(hash(g.title + g.story));
  const lvl = +ans.level || 2, hero = { pos: new THREE.Vector3(), vy: 0, ground: true, hp: X.hp, maxHp: X.hp, inv: 0, dir: 0, cd: 0, dash: 0, dashCd: 0, jumps: 0, hidden: false, carry: null, parts: 0, mesh: null };
  const col = new THREE.Color(X.heroCol || ans.color || '#22c55e').getHex();
  function M(c, o) { const k = c + JSON.stringify(o || {}); return mats[k] || (mats[k] = new THREE.MeshStandardMaterial(Object.assign({ color: c, roughness: 0.8 }, o || {}))); }
  function addSolid(x, z, r, h) { solids.push({ x, z, r, h: h || 3 }); }
  function put(name, x, z, s, rot, colours) {
    const m = model(name, colours); if (!m) return null;
    m.scale.setScalar(s || 1); m.position.set(x, groundAt(x, z), z); m.rotation.y = rot || 0; scene.add(m); return m;
  }
  function clearWorld() { if (scene) scene.traverse(o => { if (o.geometry) o.geometry.dispose(); }); solids = []; foes = []; pickups = []; npcs = []; shots = []; }

  // V03: hat, pet that follows you, sparkle trail (from the questions)
  let pet = null, trailT = 0;
  function addLook() {
    const head = hero.mesh.getObjectByName('Head') || hero.mesh;
    if (ans.x_hat === 'crown') { const c = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.26, 0.18, 6, 1, true), M(0xfacc15, { metalness: 0.8, roughness: 0.25, side: THREE.DoubleSide })); c.position.y = 0.36; head.add(c); }
    if (ans.x_hat === 'cap') { const c = new THREE.Mesh(new THREE.SphereGeometry(0.27, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), M(0xef4444)); c.position.y = 0.2; head.add(c); const b = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.03, 0.2), M(0xef4444)); b.position.set(0, 0.2, 0.25); head.add(b); }
    if (ans.x_hat === 'helmet') { const c = new THREE.Mesh(new THREE.SphereGeometry(0.33, 18, 12, 0, Math.PI * 2, 0, Math.PI / 1.8), M(0x94a3b8, { metalness: 0.7, roughness: 0.3 })); c.position.y = 0.12; head.add(c); }
    pet = null;
    if (ans.x_pet && ans.x_pet !== 'none') { pet = model(ans.x_pet); if (pet) { pet.scale.setScalar(0.8); scene.add(pet); pet.position.copy(hero.pos); if (ans.n_pet && window.__ttLabel) pet.add(window.__ttLabel(ans.n_pet)); } }
  }
  function lookTick(dt) {
    if (pet) { const tx = hero.pos.x + 1.4, tz = hero.pos.z + 1.2, dx = tx - pet.position.x, dz = tz - pet.position.z, d = Math.hypot(dx, dz); if (d > 0.4) { pet.position.x += dx * Math.min(1, dt * 3); pet.position.z += dz * Math.min(1, dt * 3); pet.rotation.y = Math.atan2(dx, dz); } pet.position.y = groundAt(pet.position.x, pet.position.z); }
    if (ans.x_trail === 'yes' && (trailT -= dt) < 0) { trailT = 0.06; const sp = new THREE.Mesh(new THREE.SphereGeometry(0.07, 6, 4), new THREE.MeshBasicMaterial({ color: 0xfde047, transparent: true })); sp.position.set(hero.pos.x + (Math.random() - 0.5) * 0.4, hero.pos.y + 0.3 + Math.random() * 0.8, hero.pos.z + (Math.random() - 0.5) * 0.4); scene.add(sp); let life = 0.6; const f = () => { life -= 0.03; sp.material.opacity = life; sp.position.y += 0.01; if (life > 0) requestAnimationFrame(f); else scene.remove(sp); }; f(); }
  }
  function buildChapter(i) {
    clearWorld();
    const ch = spec.chapters[i], R = rng(ch.seed), th = THEMES[ch.theme] || THEMES.forest;
    scene = new THREE.Scene();
    const night = ans.time === 'night' || (ans.time === 'auto' && (ch.night || ch.theme === 'space' || ch.theme === 'haunted')), sunset = ans.time === 'sunset';
    const sky = new THREE.Color(night ? 0x1b2552 : sunset ? 0xff9a62 : th.sky);
    if (X.sky) sky.set(X.sky); scene.background = sky; scene.fog = new THREE.Fog(sky, (ch.theme === 'cave' ? 14 : 40) * X.fog, (ch.theme === 'cave' ? 55 : 140) * X.fog);
    scene.add(new THREE.HemisphereLight(night ? 0x6877b8 : 0xffffff, th.ground, (night ? 0.85 : 0.95) * X.light));
    const sun = new THREE.DirectionalLight(night ? 0xaab8ff : sunset ? 0xffc08a : 0xffffff, (night ? 0.9 : 1.6) * X.light);
    sun.position.set(30, 50, 20); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048);
    Object.assign(sun.shadow.camera, { left: -45, right: 45, top: 45, bottom: -45, far: 140 }); scene.add(sun, sun.target); H = { sun };
    if (night) for (let k = 0; k < 4; k++) { const p = new THREE.PointLight(0xffd27a, 30, 22); p.position.set((R() - 0.5) * 60, 4, (R() - 0.5) * 60); scene.add(p); }
    // map shape: from the choice, or from the story
    const auto = { sea: 'island', city: 'city', castle: 'path', cave: 'maze', haunted: 'maze', volcano: 'levels', space: 'island', desert: 'path', ice: 'island', forest: 'path', farm: 'island' }[ch.theme] || 'island';
    const shape = ans.map && ans.map !== 'auto' ? ans.map : (ans.type === 'plat' ? 'levels' : ans.type === 'arena' ? 'arena' : ans.type === 'sneak' ? 'maze' : auto);
    H.shape = shape;
    const gTex = groundTex(th.ground, ch.theme);
    groundAt = () => 0; bounds = 60;
    const addGround = (geo, y) => { const m = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ map: gTex, roughness: 0.95 })); m.rotation.x = -Math.PI / 2; m.position.y = y || 0; m.receiveShadow = true; scene.add(m); return m; };
    const start = new THREE.Vector3(0, 0, 0); let goal = new THREE.Vector3(0, 0, -40);
    const spots = [];   // free places for quests
    if (shape === 'island') {
      bounds = 52; addGround(new THREE.CircleGeometry(bounds, 64));
      const water = new THREE.Mesh(new THREE.PlaneGeometry(600, 600), new THREE.MeshStandardMaterial({ color: ch.theme === 'volcano' ? 0xff4d00 : ch.theme === 'space' ? 0x1e1b4b : 0x2b8fd6, roughness: 0.2, metalness: 0.1, emissive: ch.theme === 'volcano' ? 0x7a1800 : 0 }));
      water.rotation.x = -Math.PI / 2; water.position.y = -0.35; scene.add(water); H.water = water;
      start.set(0, 0, 36); goal.set(0, 0, -38);
      for (let k = 0; k < 28; k++) { const a = R() * 6.28, d = 8 + R() * 38; spots.push(new THREE.Vector3(Math.cos(a) * d, 0, Math.sin(a) * d)); }
    } else if (shape === 'path' || shape === 'levels') {
      const len = shape === 'levels' ? 120 : 160; bounds = 999;
      if (shape === 'path') {
        addGround(new THREE.PlaneGeometry(70, len + 40)).position.z = -len / 2 + 10;
        const road = new THREE.Mesh(new THREE.PlaneGeometry(6, len + 30), M(ch.theme === 'city' ? 0x374151 : 0xc9a86a)); road.rotation.x = -Math.PI / 2; road.position.set(0, 0.02, -len / 2 + 10); road.receiveShadow = true; scene.add(road);
        H.side = 32; start.set(0, 0, 14); goal.set(0, 0, -len + 6);
        for (let z = 0; z > -len; z -= 6) { spots.push(new THREE.Vector3((R() - 0.5) * 30, 0, z)); }
      } else {
        // floating platforms going up (3D platform game)
        H.plats = []; let x = 0, y = 0, z = 0; const pm = M(th.ground), pm2 = M(0xf8fafc);
        const plat = (px, py, pz, w, d) => { const b = new THREE.Mesh(new THREE.BoxGeometry(w, 1, d), pm); b.position.set(px, py - 0.5, pz); b.castShadow = b.receiveShadow = true; scene.add(b); const t = new THREE.Mesh(new THREE.BoxGeometry(w + 0.1, 0.12, d + 0.1), pm2); t.position.set(px, py + 0.02, pz); scene.add(t); H.plats.push({ x0: px - w / 2, x1: px + w / 2, z0: pz - d / 2, z1: pz + d / 2, y: py }); };
        plat(0, 0, 0, 14, 14);
        for (let k = 0; k < 22; k++) { z -= 5.5 + R() * 2.5; x = Math.max(-14, Math.min(14, x + (R() - 0.5) * 9)); y += (R() < 0.6 ? 0.9 : -0.4) * (1 + lvl * 0.15); y = Math.max(0, y); const w = 3.4 + R() * 3 - lvl * 0.3; plat(x, y, z, w, w); if (k % 2) spots.push(new THREE.Vector3(x, y, z)); }
        z -= 8; plat(x, y, z, 14, 14); goal.set(x, y, z);
        groundAt = (px, pz) => { let best = -99; for (const p of H.plats) if (px > p.x0 && px < p.x1 && pz > p.z0 && pz < p.z1 && p.y > best) best = p.y; return best; };
        const sea = new THREE.Mesh(new THREE.PlaneGeometry(800, 800), M(ch.theme === 'volcano' || ch.theme === 'space' ? 0xff4d00 : 0x2b8fd6, { emissive: ch.theme === 'volcano' ? 0x661400 : 0 })); sea.rotation.x = -Math.PI / 2; sea.position.y = -6; scene.add(sea);
        start.set(0, 0, 3);
      }
    } else if (shape === 'city') {
      bounds = 70; addGround(new THREE.PlaneGeometry(150, 150));
      for (let gx = -2; gx <= 2; gx++) for (let gz = -2; gz <= 2; gz++) {
        const cx = gx * 26, cz = gz * 26;
        if (gx === 0 && gz === 2) continue;
        const road1 = new THREE.Mesh(new THREE.PlaneGeometry(8, 150), M(0x374151)); road1.rotation.x = -Math.PI / 2; road1.position.set(cx + 13, 0.02, 0); scene.add(road1);
        const road2 = new THREE.Mesh(new THREE.PlaneGeometry(150, 8), M(0x374151)); road2.rotation.x = -Math.PI / 2; road2.position.set(0, 0.02, cz + 13); scene.add(road2);
        const hgt = 6 + R() * 18, w = 9 + R() * 6; const b = new THREE.Mesh(new THREE.BoxGeometry(w, hgt, w), M([0xf4e3c3, 0xcbd5e1, 0xfca5a5, 0x93c5fd, 0xfde68a][(R() * 5) | 0]));
        b.position.set(cx, hgt / 2, cz); b.castShadow = b.receiveShadow = true; scene.add(b); solids.push({ box: true, x0: cx - w / 2, x1: cx + w / 2, z0: cz - w / 2, z1: cz + w / 2, h: hgt });
        for (let wy = 2; wy < hgt - 1; wy += 3) { const win = new THREE.Mesh(new THREE.PlaneGeometry(w * 0.8, 1), M(night ? 0xffe28a : 0x9bd8ff, { emissive: night ? 0xffc94a : 0, emissiveIntensity: 0.8 })); win.position.set(cx, wy, cz + w / 2 + 0.02); scene.add(win); }
        spots.push(new THREE.Vector3(cx + 13, 0, cz + 6), new THREE.Vector3(cx + 6, 0, cz + 13));
      }
      start.set(0, 0, 52); goal.set(-52, 0, -52);
    } else if (shape === 'maze') {
      const N = 9 + Math.min(4, lvl), C = 8; bounds = 999; addGround(new THREE.PlaneGeometry(N * C + 20, N * C + 20));
      const wallM = M(ch.theme === 'cave' ? 0x57534e : ch.theme === 'haunted' ? 0x3f3f46 : ch.theme === 'ice' ? 0xbfdbfe : 0x6b8e4e);
      const vis = [], cells = []; for (let a = 0; a < N; a++) { vis.push(new Array(N).fill(false)); cells.push([]); for (let b = 0; b < N; b++) cells[a].push({ n: 1, s: 1, e: 1, w: 1 }); }
      const st = [[0, 0]]; vis[0][0] = true;
      while (st.length) { const [a, b] = st[st.length - 1]; const nb = [[a - 1, b, 'w', 'e'], [a + 1, b, 'e', 'w'], [a, b - 1, 'n', 's'], [a, b + 1, 's', 'n']].filter(([x2, y2]) => x2 >= 0 && y2 >= 0 && x2 < N && y2 < N && !vis[x2][y2]);
        if (!nb.length) { st.pop(); continue; } const [x2, y2, d1, d2] = nb[(R() * nb.length) | 0]; cells[a][b][d1] = 0; cells[x2][y2][d2] = 0; vis[x2][y2] = true; st.push([x2, y2]); }
      for (let k = 0; k < N * 1.5; k++) { const a = 1 + (R() * (N - 2)) | 0, b = 1 + (R() * (N - 2)) | 0; cells[a][b].e = 0; cells[a + 1][b].w = 0; }
      const off = -N * C / 2, wh = ch.theme === 'cave' ? 5 : 3.4;
      const wall = (x0, z0, x1, z1) => { const w = Math.max(0.8, x1 - x0), d = Math.max(0.8, z1 - z0); const m = new THREE.Mesh(new THREE.BoxGeometry(w, wh, d), wallM); m.position.set((x0 + x1) / 2, wh / 2, (z0 + z1) / 2); m.castShadow = m.receiveShadow = true; scene.add(m); solids.push({ box: true, x0: (x0 + x1) / 2 - w / 2, x1: (x0 + x1) / 2 + w / 2, z0: (z0 + z1) / 2 - d / 2, z1: (z0 + z1) / 2 + d / 2, h: wh }); };
      for (let a = 0; a < N; a++) for (let b = 0; b < N; b++) { const x = off + a * C, z = off + b * C; if (cells[a][b].n) wall(x, z - 0.4, x + C, z + 0.4); if (cells[a][b].w) wall(x - 0.4, z, x + 0.4, z + C); if (a === N - 1) wall(x + C - 0.4, z, x + C + 0.4, z + C); if (b === N - 1 && !(a === 0)) wall(x, z + C - 0.4, x + C, z + C + 0.4); if ((a + b) % 2 === 1) spots.push(new THREE.Vector3(x + C / 2, 0, z + C / 2)); }
      if (ch.theme === 'cave') { const roof = new THREE.Mesh(new THREE.PlaneGeometry(N * C + 20, N * C + 20), M(0x1c1917)); roof.rotation.x = Math.PI / 2; roof.position.y = wh; scene.add(roof); }
      start.set(off + C / 2, 0, off + (N - 1) * C + C / 2 + 6); goal.set(off + (N - 1) * C + C / 2, 0, off + C / 2);
    } else { // arena
      bounds = 30; addGround(new THREE.CircleGeometry(bounds, 64));
      const ring = new THREE.Mesh(new THREE.TorusGeometry(bounds, 1.2, 10, 64), M(0x78716c)); ring.rotation.x = Math.PI / 2; ring.position.y = 0.8; scene.add(ring);
      for (let k = 0; k < 6; k++) { const a = k / 6 * 6.28; const p = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 1.1, 5, 12), M(0xd6d3d1)); p.position.set(Math.cos(a) * 16, 2.5, Math.sin(a) * 16); p.castShadow = true; scene.add(p); addSolid(p.position.x, p.position.z, 1.1, 5); }
      for (let k = 0; k < 16; k++) { const a = R() * 6.28, d = 5 + R() * 22; spots.push(new THREE.Vector3(Math.cos(a) * d, 0, Math.sin(a) * d)); }
      start.set(0, 0, 22); goal.set(0, 0, 0);
    }
    // props from the theme + every thing the story names
    const clearOf = (x, z, r) => Math.hypot(x - start.x, z - start.z) > r && Math.hypot(x - goal.x, z - goal.z) > r && !solids.some(s => s.box ? x > s.x0 - 2 && x < s.x1 + 2 && z > s.z0 - 2 && z < s.z1 + 2 : Math.hypot(x - s.x, z - s.z) < s.r + 2);
    const scatter = (name, n, scale, solidR) => { for (let k = 0; k < n; k++) { let x, z, tries = 0; do { if (shape === 'path') { x = (R() < 0.5 ? -1 : 1) * (5 + R() * 28); z = 10 - R() * 170; } else if (shape === 'levels') { x = (R() - 0.5) * 120; z = -R() * 160; } else { const a = R() * 6.28, d = 6 + R() * (Math.min(bounds, 70) - 6); x = Math.cos(a) * d; z = Math.sin(a) * d; } } while (!clearOf(x, z, 7) && ++tries < 12);
      if (shape === 'levels') { const m = put(name, x, z, scale * 1.4); if (m) m.position.y = -6; continue; }
      const m = put(name, x, z, scale * (0.8 + R() * 0.5), R() * 6.28); if (m && solidR) addSolid(x, z, solidR * scale, 4); } };
    if (shape !== 'maze') th.props.forEach((p, k) => scatter(p, shape === 'city' ? 4 : 10 - k, p === 'house' || p === 'tower' ? 1.4 : 1.2, { tree: 0.7, rock: 1, house: 2.6, tower: 2, cactus: 0.5, palm: 0.4, snowman: 0.9, crystal: 0.6, car: 1.6, boat: 1.5, rocket: 1, mushroom: 0.6 }[p] || 0));
    ch.things.forEach(t => scatter(t, t === 'house' || t === 'tower' ? 2 : 3, t === 'house' || t === 'tower' ? 1.5 : 1.1, { house: 2.6, tower: 2, car: 1.6, boat: 1.5, rocket: 1, chest: 0.6, crate: 0.6 }[t] || 0));
    if (shape === 'maze') ch.things.concat(th.props).slice(0, 5).forEach((t, k) => { const s = spots[(k * 7) % spots.length]; if (s && ['house', 'tower', 'car', 'boat', 'rocket'].indexOf(t) < 0) put(t, s.x + 1.5, s.z + 1.5, 0.9); });
    // weather
    const w = ans.weather !== 'auto' ? ans.weather : ch.snow || ch.theme === 'ice' ? 'snow' : ch.rain ? 'rain' : 'clear';
    if (w !== 'clear') { const n = Math.round(1600 * X.wx), geo = new THREE.BufferGeometry(), pos = new Float32Array(n * 3); for (let k = 0; k < n; k++) { pos[k * 3] = (R() - 0.5) * 80; pos[k * 3 + 1] = R() * 30; pos[k * 3 + 2] = (R() - 0.5) * 80; } geo.setAttribute('position', new THREE.BufferAttribute(pos, 3)); wx = new THREE.Points(geo, new THREE.PointsMaterial({ color: w === 'snow' ? 0xffffff : 0x9cc8ff, size: w === 'snow' ? 0.22 : 0.08, transparent: true, opacity: 0.85 })); wx.userData.snow = w === 'snow'; scene.add(wx); } else wx = null;
    if (night) { const sg = new THREE.BufferGeometry(), sp = new Float32Array(900); for (let k = 0; k < 300; k++) { const a = R() * 6.28, b = R() * 1.4; sp[k * 3] = Math.cos(a) * Math.cos(b) * 250; sp[k * 3 + 1] = Math.sin(b) * 250 + 20; sp[k * 3 + 2] = Math.sin(a) * Math.cos(b) * 250; } sg.setAttribute('position', new THREE.BufferAttribute(sp, 3)); scene.add(new THREE.Points(sg, new THREE.PointsMaterial({ color: 0xffffff, size: 1.2, sizeAttenuation: false }))); }

    // hero
    hero.mesh = makeChar({ shirt: col, pants: 0x1e293b, hair: 0x3b2314 });
    if (ans.attack === 'sword') { const sw = model('sword'); if (sw) { sw.scale.setScalar(0.7); sw.rotation.x = Math.PI / 2; const hand = hero.mesh.getObjectByName('HandR') || hero.mesh; sw.position.set(0, -0.05, 0.25); hand.add(sw); hero.sword = sw; } }
    hero.mesh.scale.multiplyScalar(X.size); addLook(); scene.add(hero.mesh); hero.pos.copy(start); hero.pos.y = groundAt(start.x, start.z); hero.vy = 0; hero.inv = 1.5; hero.hidden = false; hero.carry = null; hero.parts = 0;
    view.yaw = Math.atan2(start.x - goal.x, start.z - goal.z);
    // goal portal
    exitP = put('portal', goal.x, goal.z, 1.4, view.yaw); if (exitP) exitP.visible = false; H.goal = goal; H.spots = spots;
    // quests of this chapter
    quests = ch.quests.map(q => Object.assign({ done: false, got: 0 }, q)); qi = 0;
    if (ans.genre === 'action' && !quests.some(q => q.k === 'fight' || q.k === 'boss')) quests.unshift({ k: 'fight', n: 3 + lvl, done: false, got: 0 });
    if (ans.type === 'arena') quests = [{ k: 'waves', n: 3, got: 0, done: false }];
    if (ans.type === 'rush') H.timer = 70 + quests.length * 25 - lvl * 10; else H.timer = 0;
    // enemies wander everywhere (more when harder)
    const fk = ans.enemy !== 'auto' ? ans.enemy : (spec.foe || ({ space: 'robot', haunted: 'ghost', city: 'soldier', castle: 'soldier', volcano: 'creature', cave: 'creature' }[ch.theme] || 'creature'));
    H.foeKind = fk === 'dragon' ? 'creature' : fk; H.bossKind = fk === 'dragon' || spec.foe === 'dragon' ? 'dragon' : fk === 'robot' ? 'robot' : 'creature';
    if (ans.type !== 'arena') for (let k = 0; k < Math.round((2 + lvl * 2 + i) * X.foes); k++) { const s = spots[(R() * spots.length) | 0]; if (s && s.distanceTo(start) > 14) spawnFoe(s.x, s.z, false); }
    setupQuest();
  }
  function groundTex(c, theme) {
    const cv = document.createElement('canvas'); cv.width = cv.height = 256; const x = cv.getContext('2d'), base = new THREE.Color(c);
    x.fillStyle = '#' + base.getHexString(); x.fillRect(0, 0, 256, 256);
    const R = rng(hash(theme));
    for (let k = 0; k < 900; k++) { const l = (R() - 0.5) * 0.18; const cc = base.clone().offsetHSL(0, 0, l); x.fillStyle = '#' + cc.getHexString(); const s = 2 + R() * 6; x.fillRect(R() * 256, R() * 256, s, s); }
    const t = new THREE.CanvasTexture(cv); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(40, 40); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t;
  }
  function spawnFoe(x, z, boss) {
    const kind = boss ? H.bossKind : H.foeKind;
    let m = kind === 'soldier' ? makeChar({ shirt: 0x991b1b, pants: 0x111827, hair: 0x111111, glow: 0xff3333 }) : model(KIND_MODEL[kind] || 'creature');
    if (!m) m = makeChar({ shirt: 0x7f1d1d });
    const s = (boss ? (kind === 'dragon' ? 1.6 : 2.2) * X.bsize : (kind === 'dragon' ? 0.7 : 1) * X.fsize);
    if (X.foeCol && !boss) m.traverse(o => { if (o.isMesh && o.material && o.material.color) { o.material = o.material.clone(); o.material.color.lerp(new THREE.Color(X.foeCol), 0.6); } });
    m.scale.multiplyScalar(s); m.position.set(x, groundAt(x, z), z); scene.add(m);
    const f = { m, pos: new THREE.Vector3(x, groundAt(x, z), z), home: new THREE.Vector3(x, 0, z), hp: boss ? Math.max(3, Math.round((10 + lvl * 4) * X.bhp)) : Math.max(1, 1 + (lvl > 2 ? 1 : 0) + X.fhp), max: 0, boss, kind, t: Math.random() * 6, speed: ((boss ? 2.6 : 2.2) + lvl * 0.5) * X.fspeed, r: (boss ? 1.8 * X.bsize : 0.7 * X.fsize), cd: 0, alive: true, fly: kind === 'ghost' || kind === 'dragon' };
    f.max = f.hp; foes.push(f); return f;
  }
  function spot(far) { const s = H.spots; let best = s[0]; for (let k = 0; k < 8; k++) { const c = s[(Math.random() * s.length) | 0]; if (c && (!best || (c.distanceTo(hero.pos) > (far || 15)))) { best = c; break; } } return best || new THREE.Vector3(10, 0, 10); }
  function addPickup(name, p, kind, extra) {
    const m = model(name === 'key' ? 'key' : name) || new THREE.Mesh(new THREE.OctahedronGeometry(0.5), M(0xfacc15, { emissive: 0xb45309 }));
    m.scale.setScalar(name === 'chest' ? 1 : 1.2); const y = groundAt(p.x, p.z); m.position.set(p.x, y + (name === 'chest' ? 0 : 0.9), p.z); scene.add(m);
    const glow = new THREE.PointLight(0xffd54a, 8, 6); glow.position.set(p.x, y + 1.6, p.z); scene.add(glow);
    const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 30, 8, 1, true), new THREE.MeshBasicMaterial({ color: 0xfff1a8, transparent: true, opacity: 0.35, depthWrite: false })); beam.position.set(p.x, y + 15, p.z); scene.add(beam);
    pickups.push(Object.assign({ m, glow, beam, pos: new THREE.Vector3(p.x, y, p.z), kind, alive: true, spin: name !== 'chest' }, extra || {}));
  }
  function addNpc(name, p, role) {
    const m = makeChar({ shirt: [0xf59e0b, 0xa855f7, 0x14b8a6, 0xec4899][npcs.length % 4], hair: 0x111827 }); m.position.set(p.x, groundAt(p.x, p.z), p.z); scene.add(m);
    const tag = label(name); tag.position.y = 2.6; m.add(tag);
    const n = { m, pos: new THREE.Vector3(p.x, groundAt(p.x, p.z), p.z), name, role, follow: false }; npcs.push(n); return n;
  }
  function label(text) { const cv = document.createElement('canvas'); cv.width = 256; cv.height = 64; const x = cv.getContext('2d'); x.fillStyle = 'rgba(15,23,42,.8)'; x.beginPath(); x.roundRect(4, 8, 248, 48, 22); x.fill(); x.fillStyle = '#facc15'; x.font = 'bold 28px system-ui'; x.textAlign = 'center'; x.fillText(String(text).slice(0, 16), 128, 43); const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(cv), depthTest: false })); s.scale.set(2.4, 0.6, 1); return s; }

  function setupQuest() {
    while (qi < quests.length && quests[qi].done) qi++;
    if (qi >= quests.length) { // all done → the portal opens
      if (exitP) exitP.visible = true; quests.push({ k: 'portal', done: false, got: 0 }); qi = quests.length - 1; toast(T('The portal is open!', 'البوابة اتفتحت!')); objective(); return;
    }
    const q = quests[qi];
    if (q.k === 'find') { for (let k = 0; k < q.n; k++) addPickup(q.item, spot(14), 'q'); }
    if (q.k === 'talk') addNpc(q.who, spot(10), 'talk');
    if (q.k === 'rescue') { const p = spot(25); const n = addNpc(q.who, p, 'rescue'); for (let k = 0; k < 2 + lvl; k++) spawnFoe(p.x + (Math.random() - 0.5) * 8, p.z + (Math.random() - 0.5) * 8); n.cage = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.2, 2.6, 10, 1, true), new THREE.MeshStandardMaterial({ color: 0x94a3b8, wireframe: true })); n.cage.position.set(p.x, n.pos.y + 1.3, p.z); scene.add(n.cage); }
    if (q.k === 'build') { for (let k = 0; k < q.n; k++) addPickup('crate', spot(12), 'part'); q.site = spot(8); const pad = new THREE.Mesh(new THREE.CylinderGeometry(2, 2, 0.2, 24), M(0x22c55e, { emissive: 0x14532d })); pad.position.set(q.site.x, groundAt(q.site.x, q.site.z) + 0.1, q.site.z); scene.add(pad); q.pad = pad; }
    if (q.k === 'fight') { for (let k = 0; k < q.n; k++) { const s = spot(12); spawnFoe(s.x, s.z).q = true; } }
    if (q.k === 'boss') { const s = H.goal.clone(); s.z += 6; H.boss = spawnFoe(s.x, s.z, true); H.boss.q = true; toast((ans.n_boss ? ans.n_boss + ' — ' : '') + (ans.l_boss || T('The boss is here!', 'الزعيم ظهر!'))); }
    if (q.k === 'escape') { H.timer = (45 - lvl * 5) * X.time; for (let k = 0; k < 3 + lvl; k++) { const a = Math.random() * 6.28; spawnFoe(hero.pos.x + Math.cos(a) * 18, hero.pos.z + Math.sin(a) * 18).hunt = true; } if (exitP) exitP.visible = true; }
    if (q.k === 'reach') { if (exitP) exitP.visible = true; }
    if (q.k === 'waves') { H.wave = 0; nextWave(); }
    objective();
  }
  function nextWave() { H.wave++; for (let k = 0; k < Math.round((3 + H.wave * 2 + lvl) * X.foes); k++) { const a = Math.random() * 6.28; spawnFoe(Math.cos(a) * 26, Math.sin(a) * 26).q = true; } if (H.wave === 3) { H.boss = spawnFoe(0, -20, true); H.boss.q = true; } toast(T('Wave ', 'موجة ') + H.wave + '/3'); }
  function qText(q) {
    const nm = (q.k === 'find' && ans.n_item) ? ans.n_item : q.label ? T(q.label[0], q.label[1]) : '';
    return { find: T('Find ', 'لاقي ') + nm + (q.n > 1 ? ` (${q.got}/${q.n})` : ''), talk: T('Talk to ', 'كلّم ') + q.who, rescue: T('Rescue ', 'أنقذ ') + q.who + T(' and bring them to the portal', ' ورجّعه للبوابة'), build: T('Bring the parts to the green circle', 'هات القطع للدايرة الخضرا') + ` (${q.got}/${q.n})`,
      fight: T('Beat the enemies', 'اهزم الأعداء') + ` (${q.got}/${q.n})`, boss: T('Beat the boss', 'اهزم الزعيم'), escape: T('Escape to the portal!', 'اهرب للبوابة!'), reach: T('Reach the portal', 'اوصل للبوابة'), portal: T('Go into the portal', 'ادخل البوابة'), waves: T('Survive the waves', 'اصمد قدام الموجات') + ` (${H.wave || 0}/3)` }[q.k] || '';
  }
  function objective() {
    $('obj').innerHTML = '<b>' + T('Goal', 'المطلوب') + '</b><br>' + quests.filter(q => q.k !== 'portal' || !q.done).map((q, k) => `<div class="${q.done ? 'done' : ''}">${k === qi ? '▶ ' : '• '}${escH(qText(q))}</div>`).join('') + (H.timer ? `<div>⏱ ${Math.ceil(H.timer)}</div>` : '');
    $('hp').textContent = '❤️'.repeat(Math.max(0, hero.hp)) + '🤍'.repeat(Math.max(0, hero.maxHp - hero.hp));
    $('ch').textContent = T('Chapter ', 'الفصل ') + (chIdx + 1) + '/' + spec.chapters.length;
  }
  const escH = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  function toast(m) { const t = $('toast'); t.textContent = m; t.classList.add('on'); clearTimeout(toast.h); toast.h = setTimeout(() => t.classList.remove('on'), 1700); }
  function say(m) { const s = $('say'); s.textContent = m; s.style.display = 'block'; clearTimeout(say.h); say.h = setTimeout(() => s.style.display = 'none', 3200); }
  function questDone() { quests[qi].done = true; beep(880, 0.15, 'triangle'); beep(1320, 0.2, 'triangle'); qi++; setupQuest(); }

  function card(title, text, btns) {
    const c = $('card'); c.hidden = false; c.querySelector('h3').textContent = title; c.querySelector('p').textContent = text;
    const sp = c.querySelector('span'); sp.innerHTML = ''; btns.forEach(([t, fn, gr]) => { const b = document.createElement('button'); b.textContent = t; if (gr) b.className = 'g'; b.onclick = () => { c.hidden = true; fn(); }; sp.appendChild(b); });
  }
  function startChapter(i) {
    chIdx = i; state = 'card'; const ch = spec.chapters[i];
    buildChapter(i); objective();
    card(T('Chapter ', 'الفصل ') + (i + 1) + ' — ' + (ch.title || ans.n_world || g.title), (i === 0 && ans.l_intro ? ans.l_intro + '\n\n' : '') + (ans.genre === 'action' || X.cards === 'short' ? quests.map(qText).join('\n') : ch.text + '\n\n🎯 ' + quests.map(qText).join(' · ')), [[T('Play', 'العب'), () => { state = 'play'; }]]);
  }
  function chapterWin() {
    state = 'card'; beep(660, 0.2, 'triangle'); beep(990, 0.3, 'triangle');
    if (chIdx + 1 < spec.chapters.length) { store.set('tt_prog_' + g.id, chIdx + 1); card(T('Chapter done!', 'الفصل خلص!'), T('Great! On to the next part of the story.', 'برافو! يلا على الجزء اللي بعده من القصة.'), [[T('Next chapter', 'الفصل اللي بعده'), () => startChapter(chIdx + 1)]]); }
    else { store.set('tt_prog_' + g.id, 0); card('🏆 ' + T('You finished ', 'خلّصت ') + g.title, ans.l_win || T('The end. You can play it again or go back and change the story or the choices.', 'النهاية. تقدر تلعبها تاني أو ترجع تغيّر القصة أو الاختيارات.'), [[T('Play again', 'العب تاني'), () => startChapter(0)], [T('Back', 'ارجع'), exit, true]]); }
  }
  function hurt(n) {
    if (hero.inv > 0 || hero.hidden || (window.DS_ADM || {}).powerful) return;
    hero.hp -= (n || 1) * X.fdmg; hero.inv = 1.2 * X.inv; beep(140, 0.25, 'sawtooth'); H.shake = X.shake ? 0.35 : 0; objective();
    if (hero.hp <= 0) { state = 'card'; hero.hp = hero.maxHp; card(T('Ouch!', 'آي!'), ans.l_lose || T('Try this chapter again.', 'جرّب الفصل ده تاني.'), [[T('Try again', 'جرّب تاني'), () => startChapter(chIdx)], [T('Back', 'ارجع'), exit, true]]); }
  }

  // ----- every frame -----
  const tmp = new THREE.Vector3(); let last = performance.now(), raf = 0, alive = true, t = 0;
  function step(dt) {
    t += dt;
    // move (forward = where the camera looks)
    let ix = 0, iz = 0; if (keys.has('KeyW') || keys.has('ArrowUp')) iz -= 1; if (keys.has('KeyS') || keys.has('ArrowDown')) iz += 1; if (keys.has('KeyA') || keys.has('ArrowLeft')) ix -= 1; if (keys.has('KeyD') || keys.has('ArrowRight')) ix += 1;
    if (joy.on) { ix = joy.x; iz = joy.z; } const mag = Math.min(1, Math.hypot(ix, iz)); if (mag > 1e-3) { ix /= Math.hypot(ix, iz); iz /= Math.hypot(ix, iz) || 1; }
    const d = camDir(ix, iz); let sp = 6.5 * X.speed * mag;
    if ((pressed.has('ShiftLeft') || pressed.has('ShiftRight')) && ans.dash === 'yes' && hero.dashCd <= 0) { hero.dash = 0.22; hero.dashCd = 1; beep(420, 0.08); }
    if (hero.dash > 0) { sp = 22 * X.dashp; hero.dash -= dt; } hero.dashCd -= dt;
    const vx = (hero.dash > 0 && mag < 0.1 ? -Math.sin(hero.dir) : d.x) * sp, vz = (hero.dash > 0 && mag < 0.1 ? -Math.cos(hero.dir) : d.z) * sp;
    if (!hero.hidden) { tryMove(hero.pos, vx * dt, vz * dt, 0.5); if (mag > 0.05) hero.dir = Math.atan2(-d.x, -d.z); }
    // jump & gravity
    const gy = groundAt(hero.pos.x, hero.pos.z);
    if (pressed.has('Space') && !hero.hidden && (hero.ground || (ans.djump === 'yes' && hero.jumps < 2))) { hero.vy = 9.5 * X.jump; hero.ground = false; hero.jumps++; beep(520, 0.08, 'sine'); }
    hero.vy -= 24 * X.grav * dt; hero.pos.y += hero.vy * dt;
    if (hero.pos.y <= gy && hero.vy <= 0 && gy > -50 && hero.pos.y > gy - 1.2) { hero.pos.y = gy; hero.vy = 0; hero.ground = true; hero.jumps = 0; } else if (hero.pos.y > gy + 0.05) hero.ground = false;
    if (hero.pos.y < -8) { hurt(1); const s = H.lastSafe || new THREE.Vector3(0, 0, 3); hero.pos.copy(s); hero.vy = 0; }
    if (hero.ground && H.shape === 'levels') H.lastSafe = hero.pos.clone();
    if (H.water && Math.hypot(hero.pos.x, hero.pos.z) > bounds - 0.6) { const a = Math.atan2(hero.pos.z, hero.pos.x); hero.pos.x = Math.cos(a) * (bounds - 0.6); hero.pos.z = Math.sin(a) * (bounds - 0.6); }
    if (H.shape === 'arena' && Math.hypot(hero.pos.x, hero.pos.z) > bounds - 1.4) { const a = Math.atan2(hero.pos.z, hero.pos.x); hero.pos.x = Math.cos(a) * (bounds - 1.4); hero.pos.z = Math.sin(a) * (bounds - 1.4); }
    if (H.side) hero.pos.x = Math.max(-H.side, Math.min(H.side, hero.pos.x));
    hero.mesh.position.copy(hero.pos); hero.mesh.rotation.y = hero.dir; if (hero.mesh.userData.anim) hero.mesh.userData.anim(dt, mag * (hero.dash > 0 ? 2 : 1));
    hero.mesh.visible = !hero.hidden && view.mode !== 2 && !(hero.inv > 0 && Math.sin(t * 30) > 0.3);
    hero.inv -= dt; hero.cd -= dt;
    // attack
    if (pressed.has('KeyF')) attack();
    // use (E): talk, hide in a bush, drop parts
    if (pressed.has('KeyE')) use();
    // pickups
    pickups.forEach(p => { if (!p.alive) return; if (p.spin) p.m.rotation.y += dt * 2; p.m.position.y = p.pos.y + (p.spin ? 0.9 + Math.sin(t * 3) * 0.2 : 0);
      if (p.pos.distanceTo(hero.pos) < 1.6) { p.alive = false; scene.remove(p.m, p.glow, p.beam); beep(1200, 0.08, 'sine');
        const q = quests[qi]; if (p.kind === 'q' && q && q.k === 'find') { q.got++; toast(qText(q)); if (q.got >= q.n) questDone(); else objective(); }
        if (p.kind === 'part' && q && q.k === 'build') { hero.parts++; toast(T('Part picked up — take it to the green circle', 'خدت قطعة — وديها للدايرة الخضرا')); }
        if (p.kind === 'heart') { hero.hp = Math.min(hero.maxHp, hero.hp + 1); objective(); } } });
    const q = quests[qi];
    if (q && q.k === 'build' && hero.parts > 0 && q.site && hero.pos.distanceTo(q.site) < 2.6) { q.got += hero.parts; hero.parts = 0; toast(qText(q)); if (q.got >= q.n) { put(spec.chapters[chIdx].things.find(x => ['house', 'boat', 'rocket', 'car', 'tower'].indexOf(x) >= 0) || 'house', q.site.x, q.site.z, 1.2); questDone(); } else objective(); }
    // npcs
    npcs.forEach(n => { if (n.follow) { tmp.copy(hero.pos).sub(n.pos); tmp.y = 0; const dd = tmp.length(); if (dd > 2.2) { tmp.normalize().multiplyScalar(Math.min(6, dd * 2) * dt); tryMove(n.pos, tmp.x, tmp.z, 0.5); n.m.rotation.y = Math.atan2(tmp.x, tmp.z); } n.pos.y = groundAt(n.pos.x, n.pos.z); n.m.position.copy(n.pos); if (n.m.userData.anim) n.m.userData.anim(dt, dd > 2.2 ? 1 : 0); }
      else { n.m.rotation.y = Math.atan2(hero.pos.x - n.pos.x, hero.pos.z - n.pos.z); if (n.m.userData.anim) n.m.userData.anim(dt, 0); }
      if (!n.done && n.pos.distanceTo(hero.pos) < 2.4) { if (n.role === 'talk') say(n.name + ': ' + T('Press E (Use) to talk', 'دوس E (استخدم) عشان تتكلم')); if (n.role === 'rescue' && !n.follow && !foes.some(f => f.alive && f.pos.distanceTo(n.pos) < 9)) { n.follow = true; if (n.cage) scene.remove(n.cage); say(n.name + ': ' + T('Thank you! I\'ll follow you.', 'شكراً! هامشي وراك.')); } } });
    if (q && q.k === 'rescue') { const n = npcs.find(x => x.role === 'rescue' && x.follow); if (n && exitP) { exitP.visible = true; if (n.pos.distanceTo(H.goal) < 4) { n.done = true; questDone(); } } }
    // enemies
    foes.forEach(f => {
      if (!f.alive) return; f.t += dt; f.cd -= dt;
      const dd = f.pos.distanceTo(hero.pos), sees = !hero.hidden && (dd < (f.boss ? 40 : 15 + lvl * 2) || f.hunt);
      let tx, tz; if (sees) { tx = hero.pos.x - f.pos.x; tz = hero.pos.z - f.pos.z; } else { tx = Math.sin(f.t * 0.4) * 4 + f.home.x - f.pos.x; tz = Math.cos(f.t * 0.3) * 4 + f.home.z - f.pos.z; }
      const l = Math.hypot(tx, tz); if (l > 0.8) { const s = f.speed * (sees ? 1 : 0.4) * dt; tryMove(f.pos, tx / l * s, tz / l * s, f.r * 0.6); f.m.rotation.y = Math.atan2(tx, tz) + (f.kind === 'dragon' || f.kind === 'robot' || f.kind === 'creature' || f.kind === 'ghost' ? Math.PI : 0); }
      const fy = groundAt(f.pos.x, f.pos.z); f.pos.y = f.fly ? Math.max(fy, 0) + 1 + Math.sin(f.t * 2) * 0.4 : fy > -50 ? fy : f.pos.y;
      f.m.position.copy(f.pos); if (f.m.userData.anim) f.m.userData.anim(dt, sees ? 1.2 : 0.5, true);
      if (dd < f.r + 0.7 && Math.abs(f.pos.y - hero.pos.y) < 2.2 && f.cd <= 0) { f.cd = 1; hurt(f.boss ? 2 : 1); }
      if (f.boss && f.cd <= 0 && dd < 22 && dd > 5 && Math.random() < dt * 0.8) { f.cd = 1.2; shoot(f.pos, hero.pos, true); }
      if (ans.attack === 'stomp' && hero.vy < -2 && dd < f.r + 0.8 && hero.pos.y > f.pos.y + 0.6) { damage(f, 1); hero.vy = 8; }
    });
    if (H.boss && H.boss.alive) { $('boss').style.display = 'block'; $('boss').firstChild.style.width = (H.boss.hp / H.boss.max * 100) + '%'; } else $('boss').style.display = 'none';
    // shots
    shots.forEach(s => { s.m.position.addScaledVector(s.v, dt); s.life -= dt;
      if (s.bad) { if (s.m.position.distanceTo(tmp.copy(hero.pos).setY(hero.pos.y + 1)) < 0.9) { s.life = 0; hurt(1); } }
      else foes.forEach(f => { if (f.alive && s.life > 0 && s.m.position.distanceTo(tmp.copy(f.pos).setY(f.pos.y + 1)) < f.r + 0.4) { s.life = 0; damage(f, 1); } });
      if (s.life <= 0) scene.remove(s.m); });
    shots = shots.filter(s => s.life > 0);
    // goal / timer
    if (q && (q.k === 'portal' || q.k === 'reach' || q.k === 'escape') && exitP && exitP.visible && hero.pos.distanceTo(H.goal) < 3) { if (q.k === 'portal') return chapterWin(); questDone(); }
    if (q && q.k === 'waves' && !foes.some(f => f.alive && f.q)) { q.got = H.wave; if (H.wave >= 3) questDone(); else nextWave(); objective(); }
    if (H.timer) { H.timer -= dt; if (((H.timer * 10) | 0) % 10 === 0) objective(); if (H.timer <= 0) { H.timer = 0; state = 'card'; card(T('Time is up!', 'الوقت خلص!'), T('Try this chapter again.', 'جرّب الفصل ده تاني.'), [[T('Try again', 'جرّب تاني'), () => startChapter(chIdx)], [T('Back', 'ارجع'), exit, true]]); } }
    if (exitP) { exitP.rotation.y += dt * 0.6; }
    if (wx) { const a = wx.geometry.attributes.position; for (let k = 0; k < a.count; k++) { let y = a.getY(k) - dt * (wx.userData.snow ? 2.5 : 22); if (y < 0) y += 30; a.setY(k, y); } a.needsUpdate = true; wx.position.set(hero.pos.x, 0, hero.pos.z); }
    if (H.water) H.water.position.y = -0.35 + Math.sin(t) * 0.06;
    H.sun.position.set(hero.pos.x + 30, 50, hero.pos.z + 20); H.sun.target.position.copy(hero.pos);
  }
  function tryMove(p, dx, dz, r) {
    const ok = (x, z) => !solids.some(s => s.box ? (x > s.x0 - r && x < s.x1 + r && z > s.z0 - r && z < s.z1 + r && p.y < s.h - 0.3) : (Math.hypot(x - s.x, z - s.z) < s.r + r && p.y < s.h));
    if (ok(p.x + dx, p.z)) p.x += dx; if (ok(p.x, p.z + dz)) p.z += dz;
    if (H.shape === 'city') { p.x = Math.max(-72, Math.min(72, p.x)); p.z = Math.max(-72, Math.min(72, p.z)); }
  }
  function attack() {
    if (hero.cd > 0 || hero.hidden) return;
    if (ans.attack === 'none') { use(); return; }
    hero.cd = (ans.attack === 'shoot' ? 0.28 : 0.4) * X.rate;
    if (ans.attack === 'shoot') { const from = hero.pos.clone(); from.y += 1.2; const to = from.clone().add(new THREE.Vector3(-Math.sin(view.yaw), 0, -Math.cos(view.yaw)).multiplyScalar(30)); hero.dir = view.yaw; shoot(from, to, false); return; }
    beep(300, 0.07, 'square'); if (hero.sword) { hero.sword.rotation.z = 1.4; setTimeout(() => { if (hero.sword) hero.sword.rotation.z = 0; }, 160); }
    const fw = new THREE.Vector3(-Math.sin(hero.dir), 0, -Math.cos(hero.dir));
    foes.forEach(f => { if (!f.alive) return; tmp.copy(f.pos).sub(hero.pos); tmp.y = 0; const dd = tmp.length(); if (dd < 2.6 * X.range + f.r && tmp.normalize().dot(fw) > 0.2) damage(f, 1); });
  }
  function shoot(from, to, bad) { const v = new THREE.Vector3().subVectors(to, from); v.y += bad ? 1 : 0; v.normalize().multiplyScalar(bad ? 14 * X.fspeed : 26 * X.shot); const m = new THREE.Mesh(new THREE.SphereGeometry(bad ? 0.35 : 0.2, 10, 8), new THREE.MeshBasicMaterial({ color: bad ? 0xff4d1f : 0xfff27a })); m.position.copy(from); if (bad) m.position.y += 1.2; scene.add(m); shots.push({ m, v, life: 2, bad }); beep(bad ? 200 : 900, 0.06, 'square'); }
  function damage(f, n) {
    f.hp -= n; f.m.position.y += 0.3; beep(220, 0.08, 'square');
    if (f.hp <= 0) { f.alive = false; scene.remove(f.m); if (Math.random() < 0.25 * X.hearts) addPickup('heart', f.pos, 'heart');
      const q = quests[qi]; if (q && (q.k === 'fight' && f.q)) { q.got++; if (q.got >= q.n) questDone(); else objective(); }
      if (q && q.k === 'boss' && f.boss) { toast(T('Boss beaten!', 'الزعيم اتهزم!')); questDone(); } }
  }
  function use() {
    const n = npcs.find(x => !x.done && x.pos.distanceTo(hero.pos) < 2.6 && x.role === 'talk');
    if (n) { const ch = spec.chapters[chIdx]; const line = ans.l_friend || ch.line || (ch.text.split(/(?<=[.!?؟])\s+/)[1] || ch.text).slice(0, 120); say(n.name + ': ' + line); n.done = true; const q = quests[qi]; if (q && q.k === 'talk') setTimeout(questDone, 900); return; }
    if (hero.hidden) { hero.hidden = false; toast(T('You came out', 'خرجت')); return; }
    if (ans.attack === 'none' || ans.type === 'sneak') { hero.hidden = true; toast(T('Hidden… enemies can\'t see you', 'استخبيت… الأعداء مش شايفينك')); }
  }

  function frame(now) {
    if (!alive) return; const dt = Math.min(0.05, (now - last) / 1000); last = now;
    if (state === 'play') { step(dt); lookTick(dt); }
    // camera: 3rd person / shoulder / 1st person, never from the top
    const m = view.mode || 0, s = Math.sin(view.yaw), c = Math.cos(view.yaw), z = (view.zoom || 1) * X.camd;
    if (m === 2) { camera.position.set(hero.pos.x, hero.pos.y + 1.65, hero.pos.z); camera.lookAt(hero.pos.x - s * 10, hero.pos.y + 1.65 - pitch * 8, hero.pos.z - c * 10); }
    else { let bk = (m === 1 ? 3 : 6) * z; const hgt = (m === 1 ? 2.2 : 3) + pitch * 5;
      for (let k = 0; k < 8 && bk > 1.2; k++) { const cx = hero.pos.x + s * bk, cz = hero.pos.z + c * bk; if (!solids.some(o => o.box && cx > o.x0 && cx < o.x1 && cz > o.z0 && cz < o.z1 && hero.pos.y + hgt < o.h + 0.5)) break; bk *= 0.75; }
      tmp.set(hero.pos.x + s * bk + (m === 1 ? c * 0.8 : 0), hero.pos.y + hgt, hero.pos.z + c * bk - (m === 1 ? s * 0.8 : 0));
      camera.position.lerp(tmp, 1 - Math.pow(0.0004, dt)); camera.lookAt(hero.pos.x - s * 3, hero.pos.y + 1.4, hero.pos.z - c * 3); }
    if (H && H.shake > 0) { H.shake -= dt; camera.position.x += (Math.random() - 0.5) * H.shake; camera.position.y += (Math.random() - 0.5) * H.shake; }
    renderer.render(scene, camera); pressed.clear();
    raf = requestAnimationFrame(frame);
  }
  function exit() {
    alive = false; cancelAnimationFrame(raf); removeEventListener('keydown', kd); removeEventListener('keyup', ku); removeEventListener('resize', resize); removeEventListener('pointerup', pu);
    clearWorld(); renderer.dispose(); root.remove(); document.body.style.overflow = ''; if (opts.onExit) opts.onExit();
  }
  $('exit').onclick = exit;
  window.DS_GAME = { name: 'THE TEXT', cmds: [['heal', T('Full hearts', 'قلوب كاملة')], ['skip', T('Finish chapter', 'خلّص الفصل')], ['kill', T('Beat all enemies', 'اهزم كل الأعداء')]], run: c => { if (c === 'heal') { hero.hp = hero.maxHp; objective(); } if (c === 'skip') chapterWin(); if (c === 'kill') foes.forEach(f => f.alive && damage(f, 99)); } };
  startChapter(Math.min(store.get('tt_prog_' + g.id, 0), spec.chapters.length - 1));
  raf = requestAnimationFrame(frame);
  return exit;
}
