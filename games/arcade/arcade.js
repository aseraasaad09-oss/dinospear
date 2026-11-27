// DINOSPEAR ARCADE V01 — one small engine for the 10 new games (canvas 960×540, side view, phone + keyboard, AR/EN)
// game({ id, title:[en,ar], help:[en,ar], sky:[top,bottom], pads:'lr'|'none', btns:[{k,label:[en,ar],col}], init(G), update(G,dt), draw(G,cx) })
let lang = 'ar'; try { lang = localStorage.getItem('aser_lang') || 'ar'; } catch (e) {} if (lang !== 'en') lang = 'ar';
export const T = (en, ar) => (lang === 'en' ? en : ar);
export const INK = '#0b0b12';
const store = { get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } }, set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} } };

// ---------- drawing helpers (cartoon ink: fill + thick dark outline) ----------
export function ink(cx, w) { cx.lineWidth = w || 4; cx.strokeStyle = INK; cx.lineJoin = 'round'; cx.lineCap = 'round'; cx.stroke(); }
export function blob(cx, x, y, rx, ry, fill, lw) { cx.beginPath(); cx.ellipse(x, y, Math.abs(rx), Math.abs(ry), 0, 0, 6.283); cx.fillStyle = fill; cx.fill(); if (lw !== 0) ink(cx, lw); }
export function rr(cx, x, y, w, h, r, fill, lw) { cx.beginPath(); if (cx.roundRect) cx.roundRect(x, y, w, h, r); else cx.rect(x, y, w, h); cx.fillStyle = fill; cx.fill(); if (lw !== 0) ink(cx, lw); }
export function tri(cx, a, b, c, fill, lw) { cx.beginPath(); cx.moveTo(a[0], a[1]); cx.lineTo(b[0], b[1]); cx.lineTo(c[0], c[1]); cx.closePath(); cx.fillStyle = fill; cx.fill(); if (lw !== 0) ink(cx, lw); }
export function eye(cx, x, y, r, lx, ly) { blob(cx, x, y, r, r * 1.1, '#fff', 2.5); const a = Math.atan2(ly - y, lx - x); blob(cx, x + Math.cos(a) * r * 0.4, y + Math.sin(a) * r * 0.4, r * 0.5, r * 0.55, INK, 0); }
export function text(cx, s, x, y, size, col, align) { s = String(s); cx.font = '900 ' + size + 'px system-ui,Segoe UI'; cx.direction = /[؀-ۿ]/.test(s) ? 'rtl' : 'ltr'; cx.textAlign = align || 'center'; cx.lineWidth = Math.max(3, size / 6); cx.strokeStyle = INK; cx.strokeText(s, x, y); cx.fillStyle = col || '#fff'; cx.fillText(s, x, y); cx.textAlign = 'start'; }
// the DINOSPEAR mascot, small (used as the hero in several games)
export function dino(cx, x, y, s, col, face, t, pose) {
  cx.save(); cx.translate(x, y); cx.scale(s * (face || 1), s);
  const run = pose === 'run' ? Math.sin(t * 18) : 0;
  tri(cx, [-10, -26], [-36, -12 + run * 3], [-8, -12], col, 3);
  rr(cx, -12 + run * 6, -18, 10, 18, 4, '#1e293b', 3); rr(cx, 3 - run * 6, -18, 10, 18, 4, '#1e293b', 3);
  blob(cx, 0, -32, 17, 19, col, 3.5); blob(cx, 5, -30, 9, 12, 'rgba(255,255,255,.5)', 0);
  tri(cx, [-14, -62], [-22, -70], [-10, -70], '#fde047', 3); blob(cx, 4, -60, 16, 14, col, 3.5); blob(cx, 17, -56, 11, 8, col, 3.5);
  blob(cx, 9, -64, 5, 5.5, '#fff', 2); blob(cx, 11, -64, 2.6, 3, INK, 0);
  cx.restore();
}

// ---------- sounds (no files) ----------
let ac = null;
export function beep(f, d, type, vol) { try { ac = ac || new (window.AudioContext || window.webkitAudioContext)(); const o = ac.createOscillator(), g = ac.createGain(); o.type = type || 'square'; o.frequency.value = f; g.gain.value = vol || 0.05; o.connect(g); g.connect(ac.destination); o.start(); g.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + (d || 0.1)); o.stop(ac.currentTime + (d || 0.1)); } catch (e) {} }

// ---------- the game shell ----------
export function game(cfg) {
  const W = 960, H = 540;
  document.documentElement.lang = lang; document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  document.title = cfg.title[0] + ' — DINOSPEAR ARCADE';
  const st = document.createElement('style');
  st.textContent = `*{box-sizing:border-box;-webkit-tap-highlight-color:transparent}html,body{margin:0;height:100%;background:#05070f;overflow:hidden;font-family:system-ui,Segoe UI,sans-serif;color:#fff;touch-action:none;user-select:none}
canvas{position:fixed;inset:0;width:100%;height:100%;display:block}
.ov{position:fixed;inset:0;display:grid;place-items:center;background:rgba(2,6,23,.72);z-index:5;padding:16px}.ov[hidden]{display:none}
.card{max-width:520px;width:100%;background:#0f172a;border:3px solid #334155;border-radius:22px;padding:20px;text-align:center;box-shadow:0 20px 60px #000a}
.card h1{margin:0 0 6px;font-size:clamp(26px,6vw,40px)}.card p{line-height:1.7;opacity:.92;margin:6px 0;white-space:pre-line}
.row{display:flex;gap:10px;justify-content:center;flex-wrap:wrap;margin-top:14px}
.b{border:0;border-radius:14px;padding:12px 22px;font:900 17px system-ui;cursor:pointer;background:#86efac;color:#052e16}.b.s{background:#334155;color:#fff}
.pads{position:fixed;bottom:max(14px,env(safe-area-inset-bottom));left:12px;right:12px;display:flex;justify-content:space-between;pointer-events:none;z-index:3;direction:ltr}
.pads div{display:flex;gap:10px}.pads button{pointer-events:auto;width:74px;height:74px;border-radius:50%;border:3px solid #0008;background:rgba(15,23,42,.7);color:#fff;font:900 15px system-ui;touch-action:none}
.pads button.on{filter:brightness(1.6)}
@media (pointer:fine){.pads{display:none}}
.top{position:fixed;top:10px;left:10px;right:10px;display:flex;justify-content:space-between;z-index:4;pointer-events:none;direction:ltr}.top button{pointer-events:auto;border:0;border-radius:12px;padding:8px 12px;background:rgba(15,23,42,.8);color:#fff;font:900 14px system-ui}`;
  document.head.appendChild(st);
  const cv = document.createElement('canvas'); document.body.appendChild(cv); const cx = cv.getContext('2d');
  let scale = 1, ox = 0, oy = 0;
  function size() { const d = Math.min(devicePixelRatio || 1, 2); cv.width = innerWidth * d; cv.height = innerHeight * d; scale = Math.min(cv.width / W, cv.height / H); ox = (cv.width - W * scale) / 2; oy = (cv.height - H * scale) / 2; }
  addEventListener('resize', size); size();
  // UI: top bar, overlay card, phone pads
  const top = document.createElement('div'); top.className = 'top'; top.innerHTML = '<button type="button" data-x="back">✕</button><button type="button" data-x="lang">' + (lang === 'ar' ? 'English' : 'عربي') + '</button>'; document.body.appendChild(top);
  top.querySelector('[data-x="back"]').onclick = () => { location.href = 'index.html'; };
  top.querySelector('[data-x="lang"]').onclick = () => { try { localStorage.setItem('aser_lang', lang === 'ar' ? 'en' : 'ar'); } catch (e) {} location.reload(); };
  const ov = document.createElement('div'); ov.className = 'ov'; document.body.appendChild(ov);
  const pads = document.createElement('div'); pads.className = 'pads'; document.body.appendChild(pads);
  // input
  const keys = {}, pressed = {}, touch = {};
  const MAP = { ArrowLeft: 'left', KeyA: 'left', ArrowRight: 'right', KeyD: 'right', ArrowUp: 'up', KeyW: 'up', ArrowDown: 'down', KeyS: 'down', Space: 'a', KeyJ: 'a', KeyZ: 'a', KeyK: 'b', KeyX: 'b', ShiftLeft: 'b', Enter: 'a' };
  (cfg.keys || []).forEach(k => (MAP[k[0]] = k[1]));
  addEventListener('keydown', e => { const k = MAP[e.code]; if (!k) return; if (!keys[k]) pressed[k] = true; keys[k] = true; if (/Arrow|Space/.test(e.code)) e.preventDefault(); });
  addEventListener('keyup', e => { const k = MAP[e.code]; if (k) keys[k] = false; });
  let mouseDown = false; const mouse = { x: 0, y: 0 };
  const toW = e => { const r = cv.getBoundingClientRect(), d = cv.width / r.width; return { x: ((e.clientX - r.left) * d - ox) / scale, y: ((e.clientY - r.top) * d - oy) / scale }; };
  cv.addEventListener('pointerdown', e => { mouseDown = true; Object.assign(mouse, toW(e)); pressed.tap = true; keys.tap = true; });
  addEventListener('pointermove', e => Object.assign(mouse, toW(e)));
  addEventListener('pointerup', () => { mouseDown = false; keys.tap = false; pressed.untap = true; });
  function padBtn(parent, k, label, col) {
    const b = document.createElement('button'); b.type = 'button'; b.textContent = label; if (col) b.style.background = col;
    b.addEventListener('pointerdown', e => { e.preventDefault(); e.stopPropagation(); if (!touch[k]) pressed[k] = true; touch[k] = true; b.classList.add('on'); });
    const up = () => { touch[k] = false; b.classList.remove('on'); }; b.addEventListener('pointerup', up); b.addEventListener('pointercancel', up); b.addEventListener('pointerleave', up); parent.appendChild(b);
  }
  const L = document.createElement('div'), R = document.createElement('div'); pads.append(L, R);
  if (cfg.pads === 'lr') { padBtn(L, 'left', '◀'); padBtn(L, 'right', '▶'); }
  (cfg.btns || []).forEach(b => padBtn(R, b.k, T(b.label[0], b.label[1]), b.col));
  // the game object handed to every game
  const G = {
    W, H, cx, T, t: 0, score: 0, state: 'menu', shake: 0, parts: [], mouse,
    key: k => !!(keys[k] || touch[k] || (k === 'tap' && mouseDown)), hit: k => !!pressed[k],
    best: () => store.get('arc_best_' + cfg.id, 0),
    burst(x, y, col, n, sp) { for (let k = 0; k < (n || 10); k++) { const a = Math.random() * 6.28, s = (sp || 240) * (0.3 + Math.random()); this.parts.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 80, t: 0.4 + Math.random() * 0.4, col, r: 2 + Math.random() * 4 }); } },
    over(msg) {
      if (this.state !== 'play') return; this.state = 'over'; this.shake = 0.5; beep(150, 0.4, 'sawtooth', 0.06);
      const best = Math.max(this.best(), Math.floor(this.score)), nb = Math.floor(this.score) >= best && this.score > 0; store.set('arc_best_' + cfg.id, best);
      setTimeout(() => card(msg || T('Game over!', 'خسرت!'), T('Score: ', 'النقط: ') + Math.floor(this.score) + ' · ' + T('Best: ', 'الأحسن: ') + best + (nb ? ' 🏆 ' + T('NEW!', 'جديد!') : ''), T('Play again', 'العب تاني')), 700);
    },
    win(msg) { if (this.state !== 'play') return; this.state = 'over'; beep(880, 0.3, 'triangle', 0.06); const best = Math.max(this.best(), Math.floor(this.score)); store.set('arc_best_' + cfg.id, best); setTimeout(() => card('🏆 ' + (msg || T('You won!', 'كسبت!')), T('Score: ', 'النقط: ') + Math.floor(this.score) + ' · ' + T('Best: ', 'الأحسن: ') + best, T('Play again', 'العب تاني')), 600); }
  };
  function card(title, body, btn) {
    ov.hidden = false; ov.innerHTML = '<div class="card"><h1></h1><p></p><div class="row"><button type="button" class="b" data-go></button><button type="button" class="b s" data-home></button></div></div>';
    ov.querySelector('h1').textContent = title; ov.querySelector('p').textContent = body; ov.querySelector('[data-go]').textContent = btn; ov.querySelector('[data-home]').textContent = T('All games', 'كل الألعاب');
    ov.querySelector('[data-go]').onclick = start; ov.querySelector('[data-home]').onclick = () => { location.href = 'index.html'; };
  }
  function start() { ov.hidden = true; G.t = 0; G.score = 0; G.parts = []; G.shake = 0; G.state = 'play'; for (const k in pressed) delete pressed[k]; cfg.init(G); beep(520, 0.08, 'triangle'); beep(780, 0.12, 'triangle'); }
  card(T(cfg.title[0], cfg.title[1]), T(cfg.help[0], cfg.help[1]) + (G.best() ? '\n' + T('Best: ', 'الأحسن: ') + G.best() : ''), T('Play', 'العب'));
  cfg.init(G); G.state = 'menu';
  addEventListener('blur', () => { for (const k in keys) keys[k] = false; });
  let last = performance.now();
  (function frame(now) {
    const dt = Math.min(0.033, (now - last) / 1000); last = now;
    if (G.state === 'play') { G.t += dt; cfg.update(G, dt); }
    G.parts.forEach(p => { p.t -= dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 700 * dt; }); G.parts = G.parts.filter(p => p.t > 0);
    G.shake = Math.max(0, G.shake - dt);
    cx.setTransform(1, 0, 0, 1, 0, 0); cx.fillStyle = '#05070f'; cx.fillRect(0, 0, cv.width, cv.height);
    const sx = G.shake ? (Math.random() - 0.5) * 18 * G.shake : 0, sy = G.shake ? (Math.random() - 0.5) * 18 * G.shake : 0;
    cx.setTransform(scale, 0, 0, scale, ox + sx * scale, oy + sy * scale);
    cx.save(); cx.beginPath(); cx.rect(0, 0, W, H); cx.clip();
    const g = cx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, cfg.sky[0]); g.addColorStop(1, cfg.sky[1]); cx.fillStyle = g; cx.fillRect(0, 0, W, H);
    cfg.draw(G, cx);
    G.parts.forEach(p => { cx.globalAlpha = Math.max(0, p.t * 2); cx.fillStyle = p.col; cx.beginPath(); cx.arc(p.x, p.y, p.r, 0, 6.28); cx.fill(); }); cx.globalAlpha = 1;
    if (G.state === 'play' && !cfg.noScore) text(cx, String(Math.floor(G.score)), W / 2, 58, 44, '#fde047');
    cx.restore();
    for (const k in pressed) delete pressed[k];
    requestAnimationFrame(frame);
  })(last);
  return G;
}
