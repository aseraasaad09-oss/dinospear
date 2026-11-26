// DINOSPEAR view distance V01 — chunks of 48 m. Chunk 1 is clear, fog starts very light at chunk 2
// and is strong at the last chunk. Fewer chunks = fog comes sooner = phones stay fast.
(function () {
  var CH = 48, n = 5;
  try { n = parseInt(localStorage.getItem('ds_view_chunks') || '0', 10) || (matchMedia('(pointer:coarse)').matches ? 3 : 5); } catch (e) {}
  var en = false; try { en = localStorage.getItem('aser_lang') === 'en'; } catch (e) {}
  function apply() {
    var s = window.DS_SCENE, c = window.DS_CAM;
    if (s && s.fog) { s.fog.near = CH * 1; s.fog.far = CH * n; }
    if (c) { c.far = CH * n + 40; c.updateProjectionMatrix(); }
  }
  function ui() {
    var w = document.createElement('div');
    w.style.cssText = 'position:fixed;z-index:60;bottom:max(12px,env(safe-area-inset-bottom));left:50%;transform:translateX(-50%);background:rgba(15,23,42,.8);color:#fff;border-radius:14px;padding:6px 10px;display:flex;align-items:center;gap:8px;font:700 13px system-ui,sans-serif;backdrop-filter:blur(6px)';
    var l = document.createElement('span'); var r = document.createElement('input'); r.type = 'range'; r.min = 2; r.max = 8; r.value = n; r.style.width = '110px';
    function lab() { l.textContent = (en ? 'View ' : 'مسافة الرؤية ') + n + (en ? ' chunks' : ' شنك'); }
    r.oninput = function () { n = +r.value; try { localStorage.setItem('ds_view_chunks', n); } catch (e) {} lab(); apply(); };
    lab(); w.appendChild(l); w.appendChild(r); document.body.appendChild(w);
    var hide = setTimeout(function () { w.style.opacity = '.35'; }, 5000); w.onpointerenter = w.ontouchstart = function () { w.style.opacity = '1'; };
  }
  setInterval(apply, 1500); // the town can change its fog (day / night), so keep it in step
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ui); else ui();
  window.DS_applyView = apply;
})();
