// WhatsApp-only view V02: app/city.html?only=chat shows just the chat (friends, messages, stickers), nothing else
(function () {
  if (!/[?&]only=chat\b/.test(location.search)) return;
  function go() {
    var keep = document.getElementById('chatApp'); if (!keep) return setTimeout(go, 200);
    var need = document.getElementById('chatNeed');
    var path = [], n = keep; while (n && n !== document.body) { path.push(n); n = n.parentElement; }
    var needPath = []; n = need; while (n && n !== document.body) { needPath.push(n); n = n.parentElement; }
    path.forEach(function (el) { var p = el.parentElement; if (!p) return; Array.prototype.forEach.call(p.children, function (sib) { if (path.indexOf(sib) < 0 && needPath.indexOf(sib) < 0 && sib.tagName !== 'SCRIPT' && sib.tagName !== 'STYLE') sib.style.display = 'none'; }); });
    var b = document.getElementById('b-chat'); if (b) b.click();
    var t = document.getElementById('tab-chat'); if (t) t.style.display = 'flex';
    var st = document.createElement('style');
    st.textContent = 'main.app{padding:8px!important;max-width:none!important;height:100vh}main.app>.grid{display:block!important;width:100%;height:100%}main.app .panel{width:100%!important;max-width:none!important;height:100%}#chatApp{flex:1;grid-template-columns:minmax(220px,300px) 1fr!important;min-height:0}@media(max-width:640px){#chatApp{grid-template-columns:1fr!important}}';
    document.head.appendChild(st);
    document.body.style.paddingTop = '0';
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', go); else go();
})();
