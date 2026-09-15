/* אמבולנס: מדביקים פלסטר על כל פצע - לימוד איברי הגוף ועזרה לחבר */

GAMES.rescue = {
  title: "אמבולנס 🚑",
  hint: "גררו פלסטר לפצע",
  say: "בואו נעזור לדובי",

  root: null,
  wounds: [],
  healed: 0,

  start(root) {
    this.root = root;
    this.healed = 0;

    root.innerHTML = `
      <div class="rc-room"></div>
      <div class="rc-floor"></div>
      <span class="rc-ambulance" id="rcAmb">🚑</span>
      <div class="patient" id="rcPatient">
        <span class="patient-body">🧸</span>
      </div>
      <div class="counter-badge" id="rcCounter">0 מתוך 4</div>
      <div class="plaster-tray" id="rcTray"></div>
    `;

    Sound.play("siren");

    const parts = shuffle([
      { part: "הראש", x: 50, y: 20 },
      { part: "האוזן", x: 33, y: 17 },
      { part: "יד ימין", x: 24, y: 46 },
      { part: "יד שמאל", x: 76, y: 46 },
      { part: "הבטן", x: 50, y: 52 },
      { part: "רגל ימין", x: 36, y: 70 },
      { part: "רגל שמאל", x: 66, y: 68 },
    ]).slice(0, 4);

    const patient = root.querySelector("#rcPatient");
    this.wounds = parts.map((p) => {
      const w = el("span", "wound");
      w.style.left = p.x + "%";
      w.style.top = p.y + "%";
      patient.appendChild(w);
      return { node: w, part: p.part, healed: false };
    });

    for (let i = 0; i < 4; i++) {
      const plaster = el("span", "plaster", "🩹");
      plaster.style.left = 18 + i * 21 + "%";
      plaster.style.top = "90%";
      root.appendChild(plaster);
      makeDraggable(plaster, root, (node, x, y) => this.drop(node, x, y));
    }
  },

  drop(node, clientX, clientY) {
    const hit = this.wounds.find(
      (w) => !w.healed && distance(clientX, clientY, centerOf(w.node).x, centerOf(w.node).y) < 60
    );
    if (!hit) {
      Sound.play("wrong");
      return false;
    }

    hit.healed = true;
    hit.node.classList.add("healed");
    node.classList.add("placed");

    const rootRect = this.root.getBoundingClientRect();
    const c = centerOf(hit.node);
    node.style.left = ((c.x - rootRect.left) / rootRect.width) * 100 + "%";
    node.style.top = ((c.y - rootRect.top) / rootRect.height) * 100 + "%";
    node.style.pointerEvents = "none";

    this.healed++;
    Sound.play("pop");
    Sound.play("sparkle");
    App.sparkleAt(this.root, ((c.x - rootRect.left) / rootRect.width) * 100, ((c.y - rootRect.top) / rootRect.height) * 100, 6);
    App.saySpeech(this.root, `${hit.part} הבריאה!`);
    this.root.querySelector("#rcCounter").textContent = `${this.healed} מתוך 4`;
    this.heart();

    if (this.healed === 4) {
      this.root.querySelector("#rcPatient").classList.add("happy");
      setTimeout(() => App.finishGame("ריפאתם את דובי"), 1200);
    }
    return true;
  },

  heart() {
    const h = el("span", "float-heart", "💗");
    h.style.left = randBetween(35, 65) + "%";
    this.root.appendChild(h);
    setTimeout(() => h.remove(), 1600);
  },

  stop() {},
};
