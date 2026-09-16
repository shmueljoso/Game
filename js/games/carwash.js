/* שטיפת רכב: בוחרים רכב מהמוסך, משפשפים לכלוכים מכל הסוגים,
   סופרים כל אחד בקול, ולסיום שוטפים במים ומקבלים מכונית נוצצת */

const DIRT_KINDS = [
  { kind: "mud", label: "בוץ" },
  { kind: "dust", label: "אבק" },
  { kind: "leaf", label: "עלה" },
  { kind: "splat", label: "כתם" },
];

GAMES.carwash = {
  title: "שטיפת רכב 🧽",
  hint: "שפשפו את הלכלוך",
  say: "בואו נשטוף את המכונית",

  spots: [],
  cleaned: 0,
  root: null,
  rinsing: false,

  start(root) {
    this.root = root;
    this.cleaned = 0;
    this.rinsing = false;

    root.innerHTML = `
      <div class="cw-sky"></div>
      <div class="cw-floor"></div>
      <div class="cw-arch">
        <div class="cw-arch-top"></div>
        <div class="cw-brushes">
          ${Array.from({ length: 10 }, (_, i) => `<span style="animation-delay:${i * 0.12}s"></span>`).join("")}
        </div>
      </div>
      <div class="car-holder" id="cwCar">
        ${carSvg(App.currentCar())}
        <div class="dirt-layer" id="cwDirt"></div>
      </div>
      <div class="counter-badge" id="cwCounter">0 מתוך 10</div>
      <button class="mini-btn" id="cwSwap">🔧 רכב אחר</button>
      <div class="sponge" id="cwSponge">🧽</div>
    `;

    /* לכלוך פזור על כל גוף הרכב, בכמה סוגים שונים */
    const positions = this.scatter();
    const dirtLayer = root.querySelector("#cwDirt");
    this.spots = positions.map((p, i) => {
      const kind = DIRT_KINDS[Math.floor(Math.random() * DIRT_KINDS.length)];
      const d = el("div", `dirt-spot ${kind.kind}`, kind.kind === "leaf" ? "🍂" : "");
      d.style.left = p.x + "%";
      d.style.top = p.y + "%";
      d.style.setProperty("--tilt", randBetween(-50, 50) + "deg");
      d.style.setProperty("--scale", randBetween(0.8, 1.25));
      dirtLayer.appendChild(d);
      return { node: d, clean: false };
    });
    root.querySelector("#cwCounter").textContent = `0 מתוך ${this.spots.length}`;

    root.querySelector("#cwSwap").addEventListener("click", (e) => {
      e.stopPropagation();
      Sound.play("click");
      Garage.open();
    });

    const sponge = root.querySelector("#cwSponge");
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

  /* פיזור אקראי על גוף הרכב ועל התא, עם מרווח כדי ששני כתמים לא ישבו זה על זה */
  scatter() {
    const zones = [
      { x: [12, 88], y: [52, 62] },
      { x: [26, 72], y: [32, 44] },
    ];
    const spots = [];
    let guard = 0;
    while (spots.length < 10 && guard++ < 400) {
      const zone = zones[spots.length % 2 === 0 ? 0 : Math.random() < 0.6 ? 0 : 1];
      const p = { x: randBetween(zone.x[0], zone.x[1]), y: randBetween(zone.y[0], zone.y[1]) };
      if (spots.every((s) => Math.hypot(s.x - p.x, (s.y - p.y) * 0.5) > 9)) spots.push(p);
    }
    return spots;
  },

  scrub(clientX, clientY, xPct, yPct) {
    this.spots.forEach((spot) => {
      if (spot.clean) return;
      const c = centerOf(spot.node);
      if (distance(clientX, clientY, c.x, c.y) > 42) return;

      spot.clean = true;
      spot.node.classList.add("gone");
      this.cleaned++;

      Sound.play("squeak");
      Sound.tone(420 + this.cleaned * 45, 0.2, { type: "triangle", vol: 0.16 });
      Speech.say(String(this.cleaned));

      this.bubbles(xPct, yPct);
      App.popNumber(this.root, xPct, yPct, this.cleaned);
      this.root.querySelector("#cwCounter").textContent = `${this.cleaned} מתוך ${this.spots.length}`;

      if (this.cleaned === this.spots.length) setTimeout(() => this.rinse(), 500);
    });
  },

  bubbles(xPct, yPct) {
    for (let i = 0; i < 7; i++) {
      const b = el("span", "bubble");
      b.style.left = xPct + "%";
      b.style.top = yPct + "%";
      b.style.setProperty("--dx", randBetween(-40, 40) + "px");
      b.style.width = b.style.height = randBetween(8, 18) + "px";
      b.style.animationDelay = Math.random() * 0.2 + "s";
      this.root.appendChild(b);
      setTimeout(() => b.remove(), 1100);
    }
  },

  /* שלב סיום: מקלחת מים ואז ברק */
  rinse() {
    this.rinsing = true;
    const root = this.root;
    root.classList.add("rinsing");
    Sound.play("splash");
    App.saySpeech(root, "עכשיו שוטפים במים!");

    let drops = 0;
    this.dropTimer = setInterval(() => {
      const d = el("span", "drop");
      d.style.left = randBetween(14, 86) + "%";
      d.style.animationDuration = randBetween(0.5, 0.9) + "s";
      root.appendChild(d);
      setTimeout(() => d.remove(), 1000);
      if (++drops % 6 === 0) Sound.play("water");
    }, 60);

    setTimeout(() => {
      clearInterval(this.dropTimer);
      root.classList.remove("rinsing");
      root.classList.add("shiny");
      Sound.play("sparkle");
      for (let i = 0; i < 6; i++) {
        setTimeout(() => App.sparkleAt(root, randBetween(24, 76), randBetween(35, 70), 5), i * 140);
      }
      setTimeout(() => App.finishGame("המכונית נוצצת"), 900);
    }, 2200);
  },

  stop() {
    clearInterval(this.dropTimer);
    this.rinsing = false;
  },
};
