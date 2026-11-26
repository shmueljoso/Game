/* אמבטיה לחיות: כמו שטיפת הרכב, רק לחיה מגן החיות. משפשפים את הבוץ,
   סופרים בקול, שוטפים במקלחת - והחיה יוצאת נקייה ושמחה */

const BATH_ANIMALS = [
  { emoji: "🐘", name: "הפיל", sound: () => Sound.tone(320, 0.5, { type: "square", slideTo: 180, vol: 0.1 }) },
  { emoji: "🐶", name: "הכלב", sound: () => Sound.tone(300, 0.22, { type: "square", slideTo: 500, vol: 0.14 }) },
  { emoji: "🐷", name: "החזיר", sound: () => Sound.melody([300, 240, 300], { gap: 0.1, type: "sawtooth", vol: 0.1 }) },
  { emoji: "🐻", name: "הדוב", sound: () => Sound.tone(150, 0.4, { type: "sawtooth", slideTo: 100, vol: 0.13 }) },
  { emoji: "🦁", name: "האריה", sound: () => Sound.tone(120, 0.5, { type: "sawtooth", slideTo: 80, vol: 0.14 }) },
  { emoji: "🐮", name: "הפרה", fem: true, sound: () => Sound.tone(200, 0.6, { type: "sawtooth", slideTo: 140, vol: 0.12 }) },
  { emoji: "🐑", name: "הכבשה", fem: true, sound: () => Sound.melody([500, 470, 500, 470], { gap: 0.08, type: "triangle", vol: 0.12 }) },
];

GAMES.bath = {
  title: "אמבטיה לחיות 🛁",
  hint: "שפשפו את הבוץ",
  say: "בואו נרחץ את החיה",

  root: null,
  spots: [],
  cleaned: 0,
  total: 8,
  rinsing: false,
  animal: null,

  start(root) {
    this.root = root;
    this.cleaned = 0;
    this.rinsing = false;
    this.animal = BATH_ANIMALS[Math.floor(Math.random() * BATH_ANIMALS.length)];

    root.innerHTML = `
      <div class="ba-wall"></div>
      <div class="ba-floor"></div>
      <div class="ba-tiles"></div>
      <span class="ba-duck">🦆</span>
      <div class="ba-stage">
        <span class="ba-animal" id="baAnimal">${this.animal.emoji}</span>
        <div class="dirt-layer" id="baDirt"></div>
        <div class="ba-tub"><span class="ba-foam">${Array.from({ length: 9 }, (_, i) => `<i style="--i:${i}"></i>`).join("")}</span></div>
      </div>
      <div class="counter-badge" id="baCounter">0 מתוך ${this.total}</div>
      <div class="sponge" id="baSponge">🧽</div>
    `;

    /* בוץ על גוף החיה (בחלק העליון, מעל האמבטיה), עם מרווח בין הכתמים */
    const layer = root.querySelector("#baDirt");
    const spots = [];
    let guard = 0;
    while (spots.length < this.total && guard++ < 400) {
      const p = { x: randBetween(28, 72), y: randBetween(20, 62) };
      if (spots.every((s) => Math.hypot(s.x - p.x, s.y - p.y) > 13)) spots.push(p);
    }
    this.spots = spots.map((p) => {
      const kind = ["mud", "mud", "dust", "leaf"][Math.floor(Math.random() * 4)];
      const d = el("div", `dirt-spot ${kind}`, kind === "leaf" ? "🍂" : "");
      d.style.left = p.x + "%";
      d.style.top = p.y + "%";
      d.style.setProperty("--tilt", randBetween(-50, 50) + "deg");
      d.style.setProperty("--scale", randBetween(0.9, 1.3));
      layer.appendChild(d);
      return { node: d, clean: false };
    });
    this.total = this.spots.length;
    root.querySelector("#baCounter").textContent = `0 מתוך ${this.total}`;

    App.later(() => {
      this.animal.sound();
      App.saySpeech(root, `${this.animal.name} ${this.animal.fem ? "התלכלכה" : "התלכלך"} בבוץ!`);
    }, 900);

    const sponge = root.querySelector("#baSponge");
    trackPointer(
      root,
      (clientX, clientY, xPct, yPct) => {
        sponge.style.left = xPct + "%";
        sponge.style.top = yPct + "%";
        if (!this.rinsing) this.scrub(clientX, clientY, xPct, yPct);
      },
      () => sponge.classList.add("active"),
      () => sponge.classList.remove("active")
    );
  },

  scrub(clientX, clientY, xPct, yPct) {
    this.spots.forEach((spot) => {
      if (spot.clean) return;
      const c = centerOf(spot.node);
      if (distance(clientX, clientY, c.x, c.y) > 44) return;

      spot.clean = true;
      spot.node.classList.add("gone");
      this.cleaned++;
      Sound.play("squeak");
      Sound.tone(420 + this.cleaned * 50, 0.2, { type: "triangle", vol: 0.15 });
      Speech.say(String(this.cleaned));
      this.bubbles(xPct, yPct);
      App.popNumber(this.root, xPct, yPct, this.cleaned);
      this.root.querySelector("#baCounter").textContent = `${this.cleaned} מתוך ${this.total}`;

      if (this.cleaned === this.total) App.later(() => this.rinse(), 500);
    });
  },

  bubbles(xPct, yPct) {
    for (let i = 0; i < 8; i++) {
      const b = el("span", "bubble");
      b.style.left = xPct + "%";
      b.style.top = yPct + "%";
      b.style.setProperty("--dx", randBetween(-40, 40) + "px");
      b.style.width = b.style.height = randBetween(8, 20) + "px";
      b.style.animationDelay = Math.random() * 0.2 + "s";
      this.root.appendChild(b);
      App.later(() => b.remove(), 1100);
    }
  },

  /* מקלחת מים, ואז החיה קופצת שמחה */
  rinse() {
    this.rinsing = true;
    const root = this.root;
    root.classList.add("rinsing");
    Sound.play("splash");
    App.saySpeech(root, "עכשיו מקלחת!");

    let drops = 0;
    this.dropTimer = setInterval(() => {
      const d = el("span", "drop");
      d.style.left = randBetween(26, 74) + "%";
      d.style.animationDuration = randBetween(0.5, 0.9) + "s";
      root.appendChild(d);
      App.later(() => d.remove(), 1000);
      if (++drops % 6 === 0) Sound.play("water");
    }, 60);

    App.later(() => {
      clearInterval(this.dropTimer);
      root.classList.remove("rinsing");
      root.classList.add("clean");
      this.animal.sound();
      Sound.play("sparkle");
      App.saySpeech(root, `${this.animal.name} ${this.animal.fem ? "נקייה ושמחה" : "נקי ושמח"}!`);
      for (let i = 0; i < 6; i++) {
        App.later(() => App.sparkleAt(root, randBetween(30, 70), randBetween(20, 60), 5), i * 140);
      }
      App.later(() => App.finishGame("החיה נקייה ונוצצת"), 1600);
    }, 2200);
  },

  stop() {
    clearInterval(this.dropTimer);
    this.rinsing = false;
  },
};
