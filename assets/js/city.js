// ===== مدينة ASER: رسم البيوت (أيزومتري زي بلوكات اللعبة) • سحب للتحريك • عجلة/قرص للتكبير • دوس على بيت =====
(function () {
  "use strict";
  var cv, ctx, W = 0, H = 0, dpr = 1;
  var houses = [], me = null, sel = null, onPick = null;
  var cam = { x: 0, y: 0, z: 1 }, TW = 64, TH = 32, PLOT = 3;     // كل بيت على قطعة 3×3 بلوكات + شارع
  var pointers = {}, drag = null, pinch = null, moved = false;

  function hash(s) { var h = 2166136261; for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  var WALLS = ["#e9d8b4", "#d9e4f2", "#f2d0c4", "#cfe8cf", "#efe2a6", "#e4cff0", "#d0d6db"];
  var ROOFS = ["#c0392b", "#2e6fd8", "#2f9e57", "#8e44ad", "#d35400", "#16a085", "#7f5539"];

  // ترتيب القطع في حلزونة حوالين نص المدينة (أول بيت في النص)
  function spiral(n) {
    var x = 0, y = 0, dx = 0, dy = -1, out = [];
    for (var i = 0; i < n; i++) {
      out.push([x, y]);
      if (x === y || (x < 0 && x === -y) || (x > 0 && x === 1 - y)) { var t = dx; dx = -dy; dy = t; }
      x += dx; y += dy;
    }
    return out;
  }
  function iso(gx, gy) { return { x: (gx - gy) * TW / 2, y: (gx + gy) * TH / 2 }; }
  function toScreen(p) { return { x: (p.x - cam.x) * cam.z + W / 2, y: (p.y - cam.y) * cam.z + H / 2 }; }

  function layout() {
    var mp = 0; houses.forEach(function (h) { if (h.plot != null && h.plot > mp) mp = h.plot; });
    var pos = spiral(Math.max(houses.length, mp + 1, 1));
    houses.forEach(function (h, i) {
      var g = pos[h.plot != null ? h.plot : i];
      h.gx = g[0] * (PLOT + 1); h.gy = g[1] * (PLOT + 1);
      var r = hash(h.name); h.wall = WALLS[r % WALLS.length]; h.roof = ROOFS[(r >>> 3) % ROOFS.length];
    });
    houses.sort(function (a, b) { return (a.gx + a.gy) - (b.gx + b.gy); });
  }

  function poly(pts, fill, stroke) {
    ctx.beginPath(); ctx.moveTo(pts[0].x, pts[0].y);
    for (var i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
    ctx.closePath(); ctx.fillStyle = fill; ctx.fill(); if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 1; ctx.stroke(); }
  }
  function shade(hex, k) {
    var n = parseInt(hex.slice(1), 16), r = n >> 16, g = (n >> 8) & 255, b = n & 255;
    return "rgb(" + Math.round(r * k) + "," + Math.round(g * k) + "," + Math.round(b * k) + ")";
  }
  // صندوق أيزومتري: (gx,gy) ركن • w,d بالبلوك • h بالبكسل
  function box(gx, gy, w, d, h, top, left, right) {
    var a = toScreen(iso(gx, gy)), b = toScreen(iso(gx + w, gy)), c = toScreen(iso(gx + w, gy + d)), e = toScreen(iso(gx, gy + d));
    var up = h * cam.z;
    poly([e, c, { x: c.x, y: c.y - up }, { x: e.x, y: e.y - up }], left);
    poly([c, b, { x: b.x, y: b.y - up }, { x: c.x, y: c.y - up }], right);
    poly([{ x: a.x, y: a.y - up }, { x: b.x, y: b.y - up }, { x: c.x, y: c.y - up }, { x: e.x, y: e.y - up }], top);
    return { x: (a.x + c.x) / 2, y: a.y - up };
  }

  function draw() {
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    var sky = ctx.createLinearGradient(0, 0, 0, H); sky.addColorStop(0, "#14306b"); sky.addColorStop(1, "#0b1a3a");
    ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H);
    var n = Math.ceil(Math.sqrt(Math.max(houses.length, 1))) + 2, R = n * (PLOT + 1);
    // الأرض والشوارع
    for (var gx = -R; gx < R; gx++) for (var gy = -R; gy < R; gy++) {
      var road = ((gx % (PLOT + 1)) + (PLOT + 1)) % (PLOT + 1) === PLOT || ((gy % (PLOT + 1)) + (PLOT + 1)) % (PLOT + 1) === PLOT;
      var p = [toScreen(iso(gx, gy)), toScreen(iso(gx + 1, gy)), toScreen(iso(gx + 1, gy + 1)), toScreen(iso(gx, gy + 1))];
      if (p[1].x < -80 || p[3].x > W + 80 || p[2].y < -80 || p[0].y > H + 80) continue;
      var g = road ? "#3a3f4b" : (((gx + gy) & 1) ? "#3f8f3a" : "#469b40");
      poly(p, g, road ? null : "rgba(0,0,0,.06)");
    }
    // البيوت
    for (var i = 0; i < houses.length; i++) {
      var h = houses[i], s = Math.max(5, Math.min(100, h.size)), k = (s - 5) / 95;
      var foot = 1.6 + k * 1.3, off = (PLOT - foot) / 2;
      var wallH = 24 + k * 50, floors = 1 + Math.floor(k * 4);
      var mine = me && h.name.toLowerCase() === me.toLowerCase();
      // جنينة صغيرة لما يكبر
      if (s >= 25) box(h.gx + 0.15, h.gy + 0.15, PLOT - 0.3, PLOT - 0.3, 2, "#5cbf4a", "#3e8a33", "#357a2b");
      var t = box(h.gx + off, h.gy + off, foot, foot, wallH, shade(h.wall, 1), shade(h.wall, 0.8), shade(h.wall, 0.65));
      // شبابيك لكل دور
      for (var f = 0; f < floors; f++) {
        var y0 = (wallH * (f + 0.35) / floors) * cam.z, c = toScreen(iso(h.gx + off + foot, h.gy + off + foot * 0.5));
        ctx.fillStyle = "rgba(255,226,120,.9)"; ctx.fillRect(c.x - 6 * cam.z, c.y - y0 - 9 * cam.z, 5 * cam.z, 6 * cam.z);
      }
      var dc = toScreen(iso(h.gx + off + foot * 0.5, h.gy + off + foot)); ctx.fillStyle = shade(h.roof, 0.55); ctx.fillRect(dc.x - 3 * cam.z, dc.y - 12 * cam.z, 7 * cam.z, 12 * cam.z);
      // السقف
      var r0 = toScreen(iso(h.gx + off + foot / 2, h.gy + off + foot / 2)), up = (wallH + 16 + k * 8) * cam.z;
      var ra = toScreen(iso(h.gx + off - 0.1, h.gy + off - 0.1)), rb = toScreen(iso(h.gx + off + foot + 0.1, h.gy + off - 0.1)),
          rc = toScreen(iso(h.gx + off + foot + 0.1, h.gy + off + foot + 0.1)), rd = toScreen(iso(h.gx + off - 0.1, h.gy + off + foot + 0.1));
      var apex = { x: r0.x, y: r0.y - up }, lift = wallH * cam.z;
      [ra, rb, rc, rd].forEach(function (q) { q.y -= lift; });
      poly([rd, rc, apex], shade(h.roof, 0.8)); poly([rc, rb, apex], shade(h.roof, 0.62)); poly([ra, rb, apex], shade(h.roof, 1)); poly([ra, rd, apex], shade(h.roof, 0.9));
      if (s >= 50) { ctx.fillStyle = "#ffd040"; ctx.fillRect(apex.x - 1, apex.y - 16 * cam.z, 2, 16 * cam.z); ctx.fillRect(apex.x, apex.y - 16 * cam.z, 10 * cam.z, 6 * cam.z); }   // علم
      h.sx = apex.x; h.sy = apex.y; h.bx = r0.x; h.by = r0.y;
      if (mine || h === sel || cam.z > 1.1 || houses.length <= 30) {
        var label = h.name + (mine ? " ★" : "");
        ctx.font = "700 " + Math.round(12 + (mine ? 2 : 0)) + "px Cairo, system-ui, sans-serif"; ctx.textAlign = "center";
        var tw = ctx.measureText(label).width + 12, ly = apex.y - (s >= 50 ? 22 : 10) * cam.z;
        ctx.fillStyle = mine ? "#ffd040" : "rgba(6,10,26,.8)"; ctx.fillRect(h.sx - tw / 2, ly - 16, tw, 19);
        ctx.fillStyle = mine ? "#3a2a00" : "#ffffff"; ctx.fillText(label, h.sx, ly - 2);
      }
    }
  }

  function resize() {
    var r = cv.getBoundingClientRect(); dpr = Math.min(window.devicePixelRatio || 1, 2);
    if (!W && r.width < 520) cam.z = 0.6;
    W = r.width; H = r.height; cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); draw();
  }
  function zoom(f, cx, cy) {
    var nz = Math.max(0.35, Math.min(3, cam.z * f)); if (cx == null) { cx = W / 2; cy = H / 2; }
    var wx = (cx - W / 2) / cam.z + cam.x, wy = (cy - H / 2) / cam.z + cam.y;
    cam.z = nz; cam.x = wx - (cx - W / 2) / cam.z; cam.y = wy - (cy - H / 2) / cam.z; draw();
  }
  function pick(x, y) {
    var best = null, bd = 1e9;
    houses.forEach(function (h) { var d = Math.hypot(h.bx - x, (h.by - y) * 0.8 - 14 * cam.z); if (d < 40 * cam.z && d < bd) { bd = d; best = h; } });
    return best;
  }
  function focus(name) {
    var h = houses.filter(function (x) { return x.name.toLowerCase() === String(name || "").toLowerCase(); })[0];
    if (!h) return false;
    var p = iso(h.gx + PLOT / 2, h.gy + PLOT / 2); cam.x = p.x; cam.y = p.y - 20; cam.z = Math.max(cam.z, 1.4); sel = h; draw(); return true;
  }

  function init(canvas, pickCb) {
    cv = canvas; ctx = cv.getContext("2d"); onPick = pickCb;
    cv.style.touchAction = "none";
    cv.addEventListener("pointerdown", function (e) { cv.setPointerCapture(e.pointerId); pointers[e.pointerId] = { x: e.offsetX, y: e.offsetY }; moved = false;
      var ids = Object.keys(pointers); if (ids.length === 2) { var a = pointers[ids[0]], b = pointers[ids[1]]; pinch = { d: Math.hypot(a.x - b.x, a.y - b.y), z: cam.z }; drag = null; } else drag = { x: e.offsetX, y: e.offsetY, cx: cam.x, cy: cam.y }; });
    cv.addEventListener("pointermove", function (e) { if (!pointers[e.pointerId]) return; pointers[e.pointerId] = { x: e.offsetX, y: e.offsetY };
      var ids = Object.keys(pointers);
      if (pinch && ids.length === 2) { var a = pointers[ids[0]], b = pointers[ids[1]], d = Math.hypot(a.x - b.x, a.y - b.y); cam.z = Math.max(0.35, Math.min(3, pinch.z * d / pinch.d)); moved = true; draw(); }
      else if (drag) { var dx = e.offsetX - drag.x, dy = e.offsetY - drag.y; if (Math.abs(dx) + Math.abs(dy) > 4) moved = true; cam.x = drag.cx - dx / cam.z; cam.y = drag.cy - dy / cam.z; draw(); } });
    function up(e) { delete pointers[e.pointerId]; if (Object.keys(pointers).length < 2) pinch = null;
      if (drag && !moved) { sel = pick(e.offsetX, e.offsetY); draw(); if (onPick) onPick(sel, e.offsetX, e.offsetY); } drag = null; }
    cv.addEventListener("pointerup", up); cv.addEventListener("pointercancel", up);
    cv.addEventListener("wheel", function (e) { e.preventDefault(); zoom(e.deltaY < 0 ? 1.12 : 1 / 1.12, e.offsetX, e.offsetY); }, { passive: false });
    window.addEventListener("resize", resize); resize();
  }

  window.AserCity = {
    init: init,
    set: function (list, myName) { houses = (list || []).map(function (h) { return { name: String(h.name), size: Number(h.size) || 5, plot: h.plot }; }); me = myName || null; layout(); if (!(me && focus(me))) draw(); },
    setMe: function (name) { me = name; draw(); },
    zoom: zoom, focus: focus, redraw: draw
  };
})();
