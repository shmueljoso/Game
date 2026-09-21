/* Service worker: שומר את כל המשחק במטמון כדי שיעבוד גם בלי אינטרנט
   ויהיה אפשר להתקין אותו כאפליקציה */

const CACHE = "little-city-v4";

const ASSETS = [
  "./",
  "./manifest.webmanifest",
  "./css/style.css",
  "./js/audio.js",
  "./js/characters.js",
  "./js/cars.js",
  "./js/app.js",
  "./js/city.js",
  "./js/garage.js",
  "./js/boot.js",
  "./js/games/carwash.js",
  "./js/games/race.js",
  "./js/games/fire.js",
  "./js/games/zoo.js",
  "./js/games/traffic.js",
  "./js/games/rescue.js",
  "./js/games/shapes.js",
  "./js/games/delivery.js",
  "./js/games/music.js",
  "./js/games/market.js",
  "./js/games/puzzle.js",
  "./js/games/radio.js",
  "./js/games/memory.js",
  "./js/games/paint.js",
  "./js/games/bubbles.js",
  "./js/games/peekaboo.js",
  "./js/games/bigcolors.js",
  "./js/songs.js",
  "./js/kidmode.js",
  "./logos/logos.json",
  "./songs/songs.json",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-maskable-512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) =>
        Promise.allSettled(
          ASSETS.map((url) =>
            cache.add(url).catch((err) => console.warn("[sw] skipped caching", url, err))
          )
        )
      )
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

/* קודם מהמטמון (מהיר ועובד אופליין), וברקע מרעננים לגרסה חדשה */
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      const fresh = fetch(event.request)
        .then((response) => {
          if (response && response.status === 200 && response.type === "basic") {
            const copy = response.clone();
            caches.open(CACHE).then((cache) => cache.put(event.request, copy));
          }
          return response;
        })
        .catch(() => cached || (event.request.mode === "navigate" ? caches.match("./") : undefined));

      return cached || fresh;
    })
  );
});
