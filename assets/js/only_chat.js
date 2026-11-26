// WhatsApp-only view V01: app/city.html?only=chat shows just the chat (friends, messages, stickers), nothing else
(function () {
  if (!/[?&]only=chat\b/.test(location.search)) return;
  function go() {
    var keep = document.getElementById('chatApp'); if (!keep) return setTimeout(go, 200);
    var need = document.getElementById('chatNeed');
    var path = [], n = keep; while (n && n !== document.body) { path.push(n); n = n.parentElement; }
    var needPath = []; n = need; while (n && n !== document.body) { needPath.push(n); n = n.parentElement; }
    path.forEach(function (el) { var p = el.parentElement; if (!p) return; Array.prototype.forEach.call(p.children, function (sib) { if (path.indexOf(sib) < 0 && needPath.indexOf(sib) < 0 && sib.tagName !== 'SCRIPT' && sib.tagName !== 'STYLE') sib.style.display = 'none'; }); });
    document.body.style.paddingTop = '0';
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', go); else go();
})();
