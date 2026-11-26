// DINOSPEAR service worker V08
// • every update of the site reaches the phone app by itself (new version = auto reload)
// • works with no internet: offline page, article and the offline games stay saved
const V = 'dinospear-v36';
const CORE = ['./', 'index.html', 'offline.html', 'article.html', 'manifest.webmanifest', 'favicon.svg',
  'assets/css/style.css', 'assets/js/home.js', 'assets/js/events.js', 'assets/js/translate.js', 'assets/js/pets.js', 'assets/js/game_admin.js', 'assets/js/only_chat.js', 'assets/js/helper_kb.js', 'assets/vendor/supabase-2.45.4.js', 'assets/js/viewdist.js', 'games/models/dog.glb', 'games/models/cat.glb', 'games/models/dinopet.glb', 'assets/js/icons.js', 'assets/js/ds_auth.js', 'assets/js/config.js', 'key.js',
  'assets/img/logo_v02.svg', 'assets/img/dino_v03.svg', 'assets/img/dinospear.svg', 'assets/img/icon-192.png', 'assets/img/icon-512.png',
  'demo/index.html', 'games/engine.js', 'games/tt_world.js', 'games/models/boat.glb', 'games/models/cactus.glb', 'games/models/car.glb', 'games/models/chest.glb', 'games/models/coin.glb', 'games/models/crystal.glb', 'games/models/dragon.glb', 'games/models/ghost.glb', 'games/models/house.glb', 'games/models/mushroom.glb', 'games/models/palm.glb', 'games/models/portal.glb', 'games/models/robot.glb', 'games/models/rocket.glb', 'games/models/snowman.glb', 'games/models/star.glb', 'games/models/sword.glb', 'games/models/tower.glb', 'games/ui.css', 'games/killer.html', 'games/hide.html', 'games/moto.html', 'games/mm.html', 'games/models/person.glb', 'games/models/key.glb', 'games/models/creature.glb', 'games/models/tree.glb', 'games/models/rock.glb', 'games/models/bush.glb', 'games/models/bike.glb', 'games/models/sofa.glb', 'games/models/table.glb', 'games/models/shelf.glb', 'games/models/bed.glb', 'games/models/wardrobe.glb', 'games/models/crate.glb', 'games/models/lamp.glb', 'https://cdn.jsdelivr.net/npm/three@0.169.0/examples/jsm/environments/RoomEnvironment.js', 'https://cdn.jsdelivr.net/npm/three@0.169.0/examples/jsm/loaders/GLTFLoader.js', 'https://cdn.jsdelivr.net/npm/three@0.169.0/examples/jsm/utils/BufferGeometryUtils.js', 'games/text.html', 'games/zombie.html', 'assets/js/rotate.js',
  'https://cdn.jsdelivr.net/npm/three@0.169.0/build/three.module.min.js'];
['00_dragon','01_rocket','02_lightning','03_ice','04_shadow','05_gravity','06_slipper','07_mammoth','08_trex','09_magma','10_light','11_quake','12_buddha','13_phoenix','14_leopard','15_spider','16_string','17_venom','18_sound','19_sand','20_barrier','21_spirit','22_bomb','23_spike','24_rubber','25_portal','26_kitsune','27_black_hole','28_creation','29_wind','30_time','31_magnet','32_water','33_dough','34_gas','35_meme','36_star','37_pyramids','38_glitch'].forEach(f => CORE.push('assets/img/fruits/' + f + '.png'));
const CDN = ['cdn.jsdelivr.net', 'unpkg.com', 'esm.sh', 'fonts.googleapis.com', 'fonts.gstatic.com'];

self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(caches.open(V).then(c => Promise.all(CORE.map(u => c.add(new Request(u, { cache: 'reload' })).catch(() => {})))));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(k => Promise.all(k.filter(x => x !== V).map(x => caches.delete(x)))).then(() => self.clients.claim()));
});
self.addEventListener('message', e => { if (e.data === 'skip') self.skipWaiting(); });

function save(req, res) { if (res && (res.ok || res.type === 'opaque')) { const cp = res.clone(); caches.open(V).then(c => c.put(req, cp)); } return res; }
function timeout(ms) { return new Promise((_, no) => setTimeout(() => no(new Error('slow')), ms)); }

self.addEventListener('fetch', e => {
  const r = e.request; if (r.method !== 'GET') return;
  const u = new URL(r.url);
  const same = u.origin === location.origin, cdn = CDN.includes(u.hostname);
  if (!same && !cdn) return;
  if (same && u.pathname.endsWith('/version.json')) return;     // update check always asks the internet                                   // Supabase and other sites: never cached
  if (cdn) { e.respondWith(caches.match(r).then(hit => hit || fetch(r).then(res => save(r, res)))); return; }   // libraries never change
  if (r.mode === 'navigate') {
    e.respondWith(Promise.race([fetch(r, { cache: 'no-store' }), timeout(6000)]).then(res => save(r, res))
      .catch(() => caches.match(r, { ignoreSearch: true }).then(hit => hit || caches.match('offline.html'))));
    return;
  }
  e.respondWith(fetch(r, { cache: 'no-cache' }).then(res => save(r, res)).catch(() => caches.match(r, { ignoreSearch: true })));
});
