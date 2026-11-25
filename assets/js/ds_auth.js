// DINOSPEAR — shared account rules V01
// - spaces anywhere in the name or password are ignored (removed) on sign-up AND sign-in
// - names: any letters (Arabic or English), numbers and symbols except < >  (3–16 characters)
// - passwords: anything, at least 8 characters (after removing spaces)
// - confirmation popup before sign-out and before deleting the account
(function () {
  var DSA = {};
  DSA.u = function (s) { return String(s || '').replace(/\s+/g, ''); };
  DSA.p = function (s) { return String(s || '').replace(/\s+/g, ''); };
  function utf8hex(s) {
    var b = new TextEncoder().encode(s), h = '';
    for (var i = 0; i < b.length; i++) h += ('0' + b[i].toString(16)).slice(-2);
    return h;
  }
  // same mapping as before for every name that already exists (ASCII); UTF-8 for new Arabic names
  DSA.mail = function (name, domain) {
    var n = DSA.u(name).toLowerCase(), d = '@' + (domain || 'players.aserworld.com');
    if (/^[a-z0-9_]+$/.test(n)) return n + d;
    return 'u.' + utf8hex(n) + d;
  };
  DSA.ok = function (name) {
    var n = DSA.u(name), len = Array.from(n).length;
    if (len < 3 || len > 16) return false;
    if (/[<>\u0000-\u001f\u007f]/.test(n)) return false;
    return ('u.' + utf8hex(n.toLowerCase())).length <= 64;
  };
  DSA.pok = function (pass) { return DSA.p(pass).length >= 8; };
  DSA.lang = function () { try { return localStorage.getItem('aser_lang') === 'en' ? 'en' : 'ar'; } catch (e) { return 'ar'; } };
  DSA.t = function (en, ar) { return DSA.lang() === 'en' ? en : ar; };
  DSA.urule = function () { return DSA.t('Name: 3 to 16 characters — Arabic or English letters, numbers and symbols. Spaces are ignored. Don\'t use your real name.', 'الاسم: من 3 لـ 16 — حروف عربي أو إنجليزي وأرقام ورموز. المسافات مش بتتحسب. ما تكتبش اسمك الحقيقي.'); };
  DSA.prule = function () { return DSA.t('Password: at least 8 characters — anything. Spaces are ignored. A lost password can\'t be recovered.', 'الباسورد: 8 على الأقل — أي حروف وأرقام ورموز. المسافات مش بتتحسب. لو الباسورد ضاع مش هيرجع.'); };

  // in-page confirm (never a browser popup)
  var css = '.dsa-ov{position:fixed;inset:0;z-index:2147483000;background:rgba(15,23,42,.55);display:flex;align-items:center;justify-content:center;padding:18px;font-family:Cairo,system-ui,sans-serif}' +
    '.dsa-card{background:#fff;color:#1e293b;border-radius:20px;max-width:380px;width:100%;padding:22px 20px;box-shadow:0 20px 60px rgba(0,0,0,.35);text-align:center}' +
    '.dsa-card h3{margin:0 0 8px;font-size:20px}.dsa-card p{margin:0 0 16px;color:#475569;line-height:1.7;font-size:15px}' +
    '.dsa-row{display:flex;gap:10px;justify-content:center}.dsa-row button{flex:1;border:0;border-radius:12px;padding:12px;font:700 16px Cairo,system-ui,sans-serif;cursor:pointer}' +
    '.dsa-no{background:#e2e8f0;color:#1e293b}.dsa-yes{background:#2563eb;color:#fff}.dsa-yes.danger{background:#dc2626}';
  function addCss() { if (document.getElementById('dsa-css')) return; var s = document.createElement('style'); s.id = 'dsa-css'; s.textContent = css; document.head.appendChild(s); }
  DSA.confirm = function (title, text, yes, danger) {
    addCss();
    return new Promise(function (res) {
      var ov = document.createElement('div'); ov.className = 'dsa-ov';
      ov.setAttribute('dir', DSA.lang() === 'en' ? 'ltr' : 'rtl');
      var c = document.createElement('div'); c.className = 'dsa-card'; c.setAttribute('role', 'dialog'); c.setAttribute('aria-modal', 'true');
      var h = document.createElement('h3'); h.textContent = title;
      var p = document.createElement('p'); p.textContent = text;
      var row = document.createElement('div'); row.className = 'dsa-row';
      var bn = document.createElement('button'); bn.type = 'button'; bn.className = 'dsa-no'; bn.textContent = DSA.t('Cancel', 'لأ، رجوع');
      var by = document.createElement('button'); by.type = 'button'; by.className = 'dsa-yes' + (danger ? ' danger' : ''); by.textContent = yes;
      row.appendChild(bn); row.appendChild(by); c.appendChild(h); c.appendChild(p); c.appendChild(row); ov.appendChild(c);
      var done = function (v) { ov.remove(); res(v); };
      bn.onclick = function () { done(false); }; by.onclick = function () { done(true); };
      ov.onclick = function (e) { if (e.target === ov) done(false); };
      document.body.appendChild(ov); bn.focus();
    });
  };
  DSA.confirmOut = function () { return DSA.confirm(DSA.t('Sign out?', 'تسجيل الخروج؟'), DSA.t('Are you sure you want to sign out of your account?', 'متأكد إنك عايز تسجل خروج من حسابك؟'), DSA.t('Yes, sign out', 'أيوه، سجّل خروج')); };
  DSA.confirmDelete = function () { return DSA.confirm(DSA.t('Delete account?', 'حذف الحساب؟'), DSA.t('Are you sure? Your account, house and coins will be deleted forever and can\'t come back.', 'متأكد؟ حسابك وبيتك وفلوسك هيتمسحوا خالص ومش هيرجعوا تاني.'), DSA.t('Yes, delete it', 'أيوه، امسح حسابي'), true); };
  window.DSA = DSA;
})();
