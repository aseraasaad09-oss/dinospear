// DINOSPEAR rotate V03 — on phones, every game asks once: turn the screen sideways, or keep it as it is
(function () {
  var touch = matchMedia('(pointer:coarse)').matches || /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  var me = document.currentScript, noAsk = me && me.hasAttribute('data-noask'), inFrame = window.top !== window;
  window.DS_rotBtn = function () {};
  if (!touch) return;
  var KEY = 'ds_rotate_choice'; // 'land' | 'keep' — remembered for this visit only
  var en = (document.documentElement.lang || 'ar').indexOf('en') === 0;
  try { en = (localStorage.getItem('aser_lang') || localStorage.getItem('ds_lang') || (en ? 'en' : 'ar')) === 'en'; } catch (e) {}
  var T = function (a, e) { return en ? e : a; };
  var ios = /iPhone|iPad|iPod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  var dW = Object.getOwnPropertyDescriptor(window, 'innerWidth') || Object.getOwnPropertyDescriptor(Window.prototype, 'innerWidth');
  var dH = Object.getOwnPropertyDescriptor(window, 'innerHeight') || Object.getOwnPropertyDescriptor(Window.prototype, 'innerHeight');
  var RW = function () { return dW && dW.get ? dW.get.call(window) : document.documentElement.clientWidth; };
  var RH = function () { return dH && dH.get ? dH.get.call(window) : document.documentElement.clientHeight; };
  var portrait = function () { return RH() > RW(); };
  var get = function () { try { return sessionStorage.getItem(KEY); } catch (e) { return null; } };
  var set = function (v) { try { sessionStorage.setItem(KEY, v); } catch (e) {} };

  function lockLand() {
    // V02: inside the app (an iframe) the page around us must go full screen and turn, or the phone ignores it
    if (inFrame) return new Promise(function (res) {
      var done = false, on = function (e) { if (e.data && e.data.ds === 'rotDone') { done = true; removeEventListener('message', on); res(!!e.data.ok); } };
      addEventListener('message', on); try { parent.postMessage({ ds: 'rot' }, '*'); } catch (e) { res(false); }
      setTimeout(function () { if (!done) { removeEventListener('message', on); res(false); } }, 1500);
    });
    var el = document.documentElement, fs = el.requestFullscreen || el.webkitRequestFullscreen;
    var p = fs ? Promise.resolve(fs.call(el)).catch(function () {}) : Promise.resolve();
    return p.then(function () {
      if (screen.orientation && screen.orientation.lock) return screen.orientation.lock('landscape').then(function () { return true; }).catch(function () { return false; });
      return false;
    });
  }

  // V03: when the phone will not turn by itself (iPhone, auto-rotate off, inside the app) we turn the PAGE sideways:
  // the whole game is drawn rotated, and touches/sizes are translated so joysticks, buttons and the camera still work.
  var softOn = false, patched = false;
  function patchOnce() {
    if (patched) return; patched = true;
    var on = function () { return softOn && portrait(); };
    try {
      Object.defineProperty(window, 'innerWidth', { configurable: true, get: function () { return on() ? RH() : RW(); } });
      Object.defineProperty(window, 'innerHeight', { configurable: true, get: function () { return on() ? RW() : RH(); } });
    } catch (e) {}
    [[window.MouseEvent, 'clientX', 'clientY'], [window.Touch, 'clientX', 'clientY'], [window.MouseEvent, 'pageX', 'pageY'], [window.Touch, 'pageX', 'pageY']].forEach(function (a) {
      var P = a[0] && a[0].prototype; if (!P) return;
      var gx = Object.getOwnPropertyDescriptor(P, a[1]), gy = Object.getOwnPropertyDescriptor(P, a[2]); if (!gx || !gy || !gx.get) return;
      Object.defineProperty(P, a[1], { configurable: true, get: function () { return on() ? gy.get.call(this) : gx.get.call(this); } });
      Object.defineProperty(P, a[2], { configurable: true, get: function () { return on() ? RW() - gx.get.call(this) : gy.get.call(this); } });
    });
    var mx = Object.getOwnPropertyDescriptor(MouseEvent.prototype, 'movementX'), my = Object.getOwnPropertyDescriptor(MouseEvent.prototype, 'movementY');
    if (mx && my && mx.get) {
      Object.defineProperty(MouseEvent.prototype, 'movementX', { configurable: true, get: function () { return on() ? my.get.call(this) : mx.get.call(this); } });
      Object.defineProperty(MouseEvent.prototype, 'movementY', { configurable: true, get: function () { return on() ? -mx.get.call(this) : my.get.call(this); } });
    }
    var gb = Element.prototype.getBoundingClientRect;
    Element.prototype.getBoundingClientRect = function () {
      var r = gb.call(this); if (!on()) return r;
      var W = RW(), L = r.top, T = W - r.right, w = r.height, h = r.width;
      return { left: L, top: T, right: L + w, bottom: T + h, width: w, height: h, x: L, y: T, toJSON: function () { return this; } };
    };
  }
  function softApply() {
    var b = document.body; if (!b) return;
    var want = softOn && portrait();
    if (want) {
      var W = RW(), H = RH();
      b.style.cssText += ';position:fixed!important;top:0!important;left:0!important;margin:0!important;width:' + H + 'px!important;height:' + W + 'px!important;transform-origin:0 0!important;transform:translateX(' + W + 'px) rotate(90deg)!important;overflow:hidden!important';
      document.documentElement.style.overflow = 'hidden';
    } else { ['position', 'top', 'left', 'margin', 'width', 'height', 'transform-origin', 'transform', 'overflow'].forEach(function (k) { b.style.removeProperty(k); }); }
    dispatchEvent(new Event('resize'));
  }
  function soft(v) {
    patchOnce(); softOn = v !== false; softApply();
    try { sessionStorage.setItem('ds_soft' + location.pathname, softOn ? '1' : ''); } catch (e) {}
  }
  addEventListener('orientationchange', function () { setTimeout(function () { if (softOn) softApply(); }, 300); });
  var lastP = null; addEventListener('resize', function () { var p = portrait(); if (softOn && p !== lastP) { lastP = p; softApply(); } });
  window.DS_softLand = soft;
  function hint() { soft(true); }
  function hintOld() {
    var h = document.getElementById('dsTurn');
    if (!h) {
      h = document.createElement('div'); h.id = 'dsTurn';
      h.style.cssText = 'position:fixed;inset:0;z-index:99998;background:rgba(11,16,32,.94);color:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;text-align:center;padding:24px;font:800 18px system-ui,sans-serif';
      h.innerHTML = '<svg width="86" height="86" viewBox="0 0 24 24" fill="none" stroke="#86efac" stroke-width="1.6" stroke-linecap="round"><rect x="7" y="2" width="10" height="20" rx="2" transform="rotate(-90 12 12)"/><path d="M4 7a8 8 0 0 1 6-4M20 17a8 8 0 0 1-6 4"/></svg>';
      var t = document.createElement('div'); t.textContent = T('لف الموبايل بالعرض', 'Turn your phone sideways'); h.appendChild(t);
      var s = document.createElement('div'); s.style.cssText = 'font-weight:500;font-size:14px;opacity:.8;max-width:320px;line-height:1.6';
      s.textContent = ios ? T('لو الشاشة مش بتلف: افتح مركز التحكم وقفّل «قفل الاتجاه» 🔒', 'If it does not turn: open Control Center and switch off “Orientation Lock” 🔒') : T('لو مش بتلف: شغّل «التدوير التلقائي» من فوق', 'If it does not turn: switch on “Auto-rotate” at the top');
      h.appendChild(s);
      var k = document.createElement('button'); k.type = 'button'; k.textContent = T('خليها عمودي', 'Keep it upright');
      k.style.cssText = 'margin-top:6px;padding:12px 20px;border-radius:14px;border:0;background:rgba(255,255,255,.15);color:#fff;font:800 15px system-ui,sans-serif';
      k.onclick = function () { set('keep'); h.remove(); };
      h.appendChild(k); document.body.appendChild(h);
    }
    var chk = function () { if (!portrait() && h.parentNode) h.remove(); };
    addEventListener('resize', chk); addEventListener('orientationchange', function () { setTimeout(chk, 300); });
  }
  function ask() {
    if (!portrait() || document.getElementById('dsRot')) return;
    var c = get(); if (c === 'keep') return;
    if (c === 'land') { lockLand().then(function (ok) { if (!ok && portrait()) hint(); }); return; }
    var w = document.createElement('div'); w.id = 'dsRot';
    w.style.cssText = 'position:fixed;inset:0;z-index:99999;background:rgba(11,16,32,.88);display:flex;align-items:center;justify-content:center;padding:20px;font-family:system-ui,sans-serif';
    var box = document.createElement('div');
    box.style.cssText = 'background:#0f172a;border:2px solid #22c55e;border-radius:22px;padding:20px;max-width:340px;width:100%;color:#fff;text-align:center';
    box.innerHTML = '<svg width="70" height="70" viewBox="0 0 24 24" fill="none" stroke="#86efac" stroke-width="1.6" stroke-linecap="round"><rect x="3" y="7" width="18" height="10" rx="2"/><path d="M7 12h1M16 12h1M12 3v2M12 19v2"/></svg>';
    var h = document.createElement('div'); h.style.cssText = 'font-weight:900;font-size:19px;margin:6px 0'; h.textContent = T('تلعب والشاشة بالعرض؟', 'Play with the screen sideways?'); box.appendChild(h);
    var p = document.createElement('div'); p.style.cssText = 'opacity:.85;font-size:14.5px;line-height:1.6;margin-bottom:14px'; p.textContent = T('اللعب بالعرض أسهل بكتير: الجويستيك في إيد والزراير في الإيد التانية.', 'Sideways is much easier: joystick in one hand, buttons in the other.'); box.appendChild(p);
    var b1 = document.createElement('button'); b1.type = 'button'; b1.textContent = T('اقلب الشاشة', 'Turn the screen');
    b1.style.cssText = 'display:block;width:100%;padding:14px;border-radius:14px;border:0;background:#22c55e;color:#06210f;font:900 16px system-ui,sans-serif;margin-bottom:8px';
    var b2 = document.createElement('button'); b2.type = 'button'; b2.textContent = T('سيبها كده', 'Keep it like this');
    b2.style.cssText = 'display:block;width:100%;padding:12px;border-radius:14px;border:0;background:rgba(255,255,255,.12);color:#fff;font:800 15px system-ui,sans-serif';
    b1.onclick = function () { set('land'); w.remove(); lockLand().then(function (ok) { if (!ok && portrait()) hint(); }); };
    b2.onclick = function () { set('keep'); w.remove(); };
    box.appendChild(b1); box.appendChild(b2); w.appendChild(box); document.body.appendChild(w);
  }
  window.DS_askRotate = ask;
  // V13: a round button you can drag anywhere; one tap turns the screen (turn it on in Settings)
  function unlock() {
    try { screen.orientation && screen.orientation.unlock && screen.orientation.unlock(); } catch (e) {}
    var ex = document.exitFullscreen || document.webkitExitFullscreen; if (document.fullscreenElement || document.webkitFullscreenElement) try { ex.call(document); } catch (e) {}
  }
  function rotBtn() {
    var on = false; try { on = localStorage.getItem('ds_rot_btn') === 'on'; } catch (e) {}
    var b = document.getElementById('dsRotBtn');
    if (!on || inFrame) { if (b) b.remove(); return; }
    if (b) return;
    b = document.createElement('button'); b.id = 'dsRotBtn'; b.type = 'button'; b.setAttribute('aria-label', T('اقلب الشاشة', 'Turn the screen'));
    b.innerHTML = '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="8" width="16" height="9" rx="2"/><path d="M8 4h3l-1.5-1.5M8 4l1.5 1.5M16 20h-3l1.5 1.5M16 20l-1.5-1.5"/></svg>';
    var pos = { x: innerWidth - 74, y: innerHeight * 0.45 };
    try { var sp = JSON.parse(localStorage.getItem('ds_rot_pos') || 'null'); if (sp) pos = sp; } catch (e) {}
    b.style.cssText = 'position:fixed;z-index:99990;width:56px;height:56px;border-radius:50%;border:2px solid rgba(255,255,255,.5);background:rgba(34,197,94,.85);box-shadow:0 8px 22px rgba(0,0,0,.35);display:flex;align-items:center;justify-content:center;touch-action:none;padding:0';
    var place = function () { pos.x = Math.max(6, Math.min(innerWidth - 62, pos.x)); pos.y = Math.max(6, Math.min(innerHeight - 62, pos.y)); b.style.left = pos.x + 'px'; b.style.top = pos.y + 'px'; };
    place(); addEventListener('resize', place);
    var drag = null;
    b.addEventListener('pointerdown', function (e) { drag = { id: e.pointerId, sx: e.clientX, sy: e.clientY, ox: pos.x, oy: pos.y, moved: false }; b.setPointerCapture(e.pointerId); });
    b.addEventListener('pointermove', function (e) { if (!drag) return; var dx = e.clientX - drag.sx, dy = e.clientY - drag.sy; if (Math.abs(dx) + Math.abs(dy) > 8) drag.moved = true; if (drag.moved) { pos.x = drag.ox + dx; pos.y = drag.oy + dy; place(); } });
    b.addEventListener('pointerup', function () {
      if (!drag) return; var moved = drag.moved; drag = null;
      if (moved) { try { localStorage.setItem('ds_rot_pos', JSON.stringify(pos)); } catch (e) {} return; }
      if (softOn) { soft(false); set('keep'); } else if (!portrait() || document.fullscreenElement || document.webkitFullscreenElement) { unlock(); set('keep'); }
      else { set('land'); lockLand().then(function (ok) { if (!ok && portrait()) hint(); }); }
    });
    document.body.appendChild(b);
  }
  window.DS_rotBtn = rotBtn;
  function boot() { rotBtn(); var sv = ''; try { sv = sessionStorage.getItem('ds_soft' + location.pathname); } catch (e) {} if (sv && portrait()) { soft(true); return; } if (!noAsk) setTimeout(ask, 400); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
