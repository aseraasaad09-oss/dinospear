// DINOSPEAR rotate V01 — on phones, every game asks once: turn the screen sideways, or keep it as it is
(function () {
  var touch = matchMedia('(pointer:coarse)').matches || /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  if (!touch) return;
  var KEY = 'ds_rotate_choice'; // 'land' | 'keep' — remembered for this visit only
  var en = (document.documentElement.lang || 'ar').indexOf('en') === 0;
  try { en = (localStorage.getItem('aser_lang') || localStorage.getItem('ds_lang') || (en ? 'en' : 'ar')) === 'en'; } catch (e) {}
  var T = function (a, e) { return en ? e : a; };
  var ios = /iPhone|iPad|iPod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  var portrait = function () { return innerHeight > innerWidth; };
  var get = function () { try { return sessionStorage.getItem(KEY); } catch (e) { return null; } };
  var set = function (v) { try { sessionStorage.setItem(KEY, v); } catch (e) {} };

  function lockLand() {
    var el = document.documentElement, fs = el.requestFullscreen || el.webkitRequestFullscreen;
    var p = fs ? Promise.resolve(fs.call(el)).catch(function () {}) : Promise.resolve();
    return p.then(function () {
      if (screen.orientation && screen.orientation.lock) return screen.orientation.lock('landscape').then(function () { return true; }).catch(function () { return false; });
      return false;
    });
  }
  function hint() { // iPhone can't turn the screen by itself: show a small "turn your phone" card until it is sideways
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
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { setTimeout(ask, 400); });
  else setTimeout(ask, 400);
})();
