/* תחנת כבאות: מכוונים את הצינור וסופרים לאחור את הלהבות עד שכולן כבו */

GAMES.fire = {
  title: "כבאים 🚒",
  hint: "כוונו את המים",
  say: "בואו נכבה את האש",

  root: null,
  flames: [],
  left: 0,

  start(root) {
    this.root = root;
    this.left = 5;

    root.innerHTML = `
      <div class="fire-sky"></div>
      <div class="fire-ground"></div>
      <div class="fire-house">
        <div class="house-roof"></div>
        <div class="house-body">
          <div class="house-window"></div>
          <div class="house-window"></div>
          <div class="house-door"></div>
        </div>
        <span class="rescue-cat hidden" id="fireCat">🐱</span>
      </div>
      <div class="fire-truck" id="fireTruck">🚒</div>
      <div class="counter-badge" id="fireCounter">נשארו 5 🔥</div>
      <div class="water-jet hidden" id="waterJet"></div>
      <div class="nozzle" id="nozzle">💧</div>
    `;

    const spots = [
      { x: 47, y: 30 }, { x: 60, y: 24 }, { x: 72, y: 34 },
      { x: 54, y: 46 }, { x: 68, y: 50 },
    ];
    this.flames = spots.map((p, i) => {
      const f = el("span", "flame", "🔥");
      f.style.left = p.x + "%";
      f.style.top = p.y + "%";
      f.style.animationDelay = i * 0.17 + "s";
      root.appendChild(f);
      return { node: f, out: false };
    });

    Sound.play("siren");

    const jet = root.querySelector("#waterJet");
    const nozzle = root.querySelector("#nozzle");
    let spraying = false;

    trackPointer(
      root,
      (clientX, clientY, xPct, yPct) => {
        nozzle.style.left = xPct + "%";
        nozzle.style.top = yPct + "%";
        if (!spraying) return;
        this.aimJet(jet, clientX, clientY);
        this.splash(xPct, yPct);
        this.hitFlames(clientX, clientY, xPct, yPct);
      },
      () => {
        spraying = true;
        jet.classList.remove("hidden");
        Sound.play("water");
      },
      () => {
        spraying = false;
        jet.classList.add("hidden");
      }
    );
  },

  aimJet(jet, clientX, clientY) {
    const rootRect = this.root.getBoundingClientRect();
    const truck = centerOf(this.root.querySelector("#fireTruck"));
    const dx = clientX - truck.x;
    const dy = clientY - truck.y;
    jet.style.left = ((truck.x - rootRect.left) / rootRect.width) * 100 + "%";
    jet.style.top = ((truck.y - rootRect.top) / rootRect.height) * 100 + "%";
    jet.style.width = Math.hypot(dx, dy) + "px";
    jet.style.transform = `rotate(${(Math.atan2(dy, dx) * 180) / Math.PI}deg)`;
  },

  splash(xPct, yPct) {
    for (let i = 0; i < 3; i++) {
      const d = el("span", "water-drop");
      d.style.left = xPct + "%";
      d.style.top = yPct + "%";
      d.style.setProperty("--dx", randBetween(-30, 30) + "px");
      d.style.setProperty("--dy", randBetween(10, 40) + "px");
      this.root.appendChild(d);
      setTimeout(() => d.remove(), 520);
    }
  },

  hitFlames(clientX, clientY, xPct, yPct) {
    this.flames.forEach((flame) => {
      if (flame.out) return;
      const c = centerOf(flame.node);
      if (distance(clientX, clientY, c.x, c.y) > 46) return;

      flame.out = true;
      flame.node.classList.add("out");
      this.left--;

      Sound.play("steam");
      Sound.tone(900 - this.left * 90, 0.22, { type: "sine", vol: 0.13 });
      this.steam(xPct, yPct);
      App.popNumber(this.root, xPct, yPct, this.left);
      Speech.say(String(this.left));

      const counter = this.root.querySelector("#fireCounter");
      counter.textContent = this.left > 0 ? `נשארו ${this.left} 🔥` : "כל האש כבתה! 🎉";

      if (this.left === 0) this.rescue();
    });
  },

  steam(xPct, yPct) {
    for (let i = 0; i < 6; i++) {
      const s = el("span", "steam-puff");
      s.style.left = xPct + "%";
      s.style.top = yPct + "%";
      s.style.setProperty("--dx", randBetween(-35, 35) + "px");
      s.style.animationDelay = i * 0.05 + "s";
      this.root.appendChild(s);
      setTimeout(() => s.remove(), 1000);
    }
  },

  rescue() {
    const cat = this.root.querySelector("#fireCat");
    cat.classList.remove("hidden");
    Sound.tone(700, 0.3, { type: "sine", slideTo: 500, vol: 0.14 });
    App.saySpeech(this.root, "הצלנו את החתול!");
    setTimeout(() => App.finishGame("כיביתם את האש"), 1300);
  },

  stop() {},
};
