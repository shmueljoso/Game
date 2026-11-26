/* תחנת כבאות: מכוונים את הצינור וסופרים לאחור את הלהבות עד שכולן כבו */

GAMES.fire = {
  title: "כבאים 🚒",
  hint: "כוונו את המים",
  say: "יש שריפה! בואו נציל את החתול",

  root: null,
  flames: [],
  left: 0,

  start(root) {
    this.root = root;
    this.left = 5;

    root.innerHTML = `
      <div class="fire-sky"></div>
      <div class="fire-ground"></div>
      <div class="fire-house" id="fireHouse">
        <div class="house-roof"></div>
        <div class="house-body">
          <div class="house-window cat-window"><span class="rescue-cat" id="fireCat">🙀</span></div>
          <div class="house-window"></div>
          <div class="house-door"></div>
        </div>
      </div>
      <div class="fire-truck" id="fireTruck">🚒</div>
      <div class="counter-badge" id="fireCounter">נשארו 5 🔥</div>
      <div class="water-jet hidden" id="waterJet"></div>
      <div class="nozzle" id="nozzle">💧</div>
    `;

    /* הלהבות יושבות על הבית עצמו (באחוזים של הבית, שרוחבו 60 וגובהו 40 יחידות),
       עם מרווח ביניהן, ולא מסתירות את החתול שבחלון */
    const house = root.querySelector("#fireHouse");
    const cat = { x: 66.8, y: 55 }; /* החלון הימני - הבית מסודר מימין לשמאל */
    const gapU = (a, b) => Math.hypot((a.x - b.x) * 0.6, (a.y - b.y) * 0.4);
    const spots = [];
    let guard = 0;
    while (spots.length < 5 && guard++ < 500) {
      const y = randBetween(22, 84);
      const roofHalf = y < 35 ? 8 + (y - 22) * 2 : 40;
      const p = { x: randBetween(50 - roofHalf, 50 + roofHalf), y };
      if (gapU(p, cat) > 10 && spots.every((s) => gapU(s, p) > 9)) spots.push(p);
    }
    this.flames = spots.map((p, i) => {
      const f = el("span", "flame", "🔥");
      f.style.left = p.x + "%";
      f.style.top = p.y + "%";
      f.style.animationDelay = i * 0.17 + "s";
      house.appendChild(f);
      return { node: f, out: false };
    });

    Sound.play("siren");
    App.later(() => {
      Sound.melody([880, 700], { gap: 0.16, type: "sine", vol: 0.12 });
      App.saySpeech(root, "מיאו! הצילו!");
    }, 1600);

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
      App.later(() => d.remove(), 520);
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
      App.later(() => s.remove(), 1000);
    }
  },

  /* החתול קופץ מהחלון אל הכבאים, ורק אחרי שרואים אותו בטוח - מסך הניצחון */
  rescue() {
    const cat = this.root.querySelector("#fireCat");
    cat.textContent = "😺";
    cat.classList.add("saved");
    Sound.play("jump");
    Sound.melody([700, 900, 1100], { gap: 0.12, type: "sine", vol: 0.13 });
    App.later(() => {
      App.saySpeech(this.root, "הצלנו את החתול!");
      App.sparkleAt(this.root, 50, 80, 10);
      for (let i = 0; i < 3; i++) {
        const h = el("span", "float-heart", "💗");
        h.style.left = 44 + i * 6 + "%";
        this.root.appendChild(h);
      }
    }, 1100);
    App.later(() => App.finishGame("כיביתם את האש והצלתם את החתול"), 3200);
  },

  stop() {},
};
