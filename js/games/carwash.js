/* שטיפת רכב: משפשפים עם הספוגית, סופרים כל כתם שנעלם, ולסיום שטיפה וברק */

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
      <div class="cw-shower">
        <div class="cw-pipe"></div>
      </div>
      <div class="car-holder" id="cwCar">
        <svg viewBox="0 0 320 170" class="cw-car-svg">
          <ellipse cx="160" cy="158" rx="128" ry="9" fill="#00000022"/>
          <path d="M42 112 Q42 70 92 64 Q112 36 196 36 Q238 36 252 64 Q282 70 282 112 Z"
                fill="#4d96ff" stroke="#2d6fd6" stroke-width="3"/>
          <path d="M108 66 Q122 46 196 46 Q226 46 238 66 Z" fill="#cfeaff" opacity="0.9"/>
          <rect x="42" y="102" width="240" height="22" rx="11" fill="#3d7fe0"/>
          <circle class="cw-wheel" cx="98" cy="130" r="21" fill="#2b2b2b"/>
          <circle cx="98" cy="130" r="8" fill="#d5d5d5"/>
          <circle class="cw-wheel" cx="226" cy="130" r="21" fill="#2b2b2b"/>
          <circle cx="226" cy="130" r="8" fill="#d5d5d5"/>
          <circle cx="62" cy="94" r="7" fill="#fff6cc"/>
          <circle cx="266" cy="94" r="7" fill="#ffd1d1"/>
          <path class="cw-smile" d="M140 92 Q160 106 180 92" stroke="#2d6fd6" stroke-width="4" fill="none" stroke-linecap="round"/>
        </svg>
        <div class="dirt-layer" id="cwDirt"></div>
      </div>
      <div class="counter-badge" id="cwCounter">0 מתוך 6</div>
      <div class="sponge" id="cwSponge">🧽</div>
    `;

    const dirtLayer = root.querySelector("#cwDirt");
    const positions = [
      { x: 24, y: 44 }, { x: 40, y: 62 }, { x: 56, y: 40 },
      { x: 72, y: 58 }, { x: 64, y: 74 }, { x: 33, y: 76 },
    ];
    this.spots = positions.map((p) => {
      const d = el("div", "dirt-spot");
      d.style.left = p.x + "%";
      d.style.top = p.y + "%";
      d.style.setProperty("--tilt", randBetween(-40, 40) + "deg");
      dirtLayer.appendChild(d);
      return { node: d, clean: false };
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

  scrub(clientX, clientY, xPct, yPct) {
    this.spots.forEach((spot) => {
      if (spot.clean) return;
      const c = centerOf(spot.node);
      if (distance(clientX, clientY, c.x, c.y) > 44) return;

      spot.clean = true;
      spot.node.classList.add("gone");
      this.cleaned++;

      Sound.play("squeak");
      Sound.tone(440 + this.cleaned * 70, 0.2, { type: "triangle", vol: 0.16 });
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
      b.style.width = b.style.height = randBetween(8, 16) + "px";
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
      d.style.left = randBetween(18, 82) + "%";
      d.style.animationDuration = randBetween(0.5, 0.9) + "s";
      root.appendChild(d);
      setTimeout(() => d.remove(), 1000);
      if (++drops % 6 === 0) Sound.play("water");
    }, 70);

    setTimeout(() => {
      clearInterval(this.dropTimer);
      root.classList.remove("rinsing");
      root.classList.add("shiny");
      Sound.play("sparkle");
      for (let i = 0; i < 5; i++) {
        setTimeout(() => App.sparkleAt(root, randBetween(28, 72), randBetween(35, 70), 5), i * 150);
      }
      setTimeout(() => App.finishGame("המכונית נוצצת"), 900);
    }, 2200);
  },

  stop() {
    clearInterval(this.dropTimer);
    this.rinsing = false;
  },
};
