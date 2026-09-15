/* אתר בנייה: מכניסים כל צורה לחור המתאים - לימוד צורות וצבעים */

const SHAPE_TYPES = [
  { key: "circle", name: "עיגול" },
  { key: "square", name: "ריבוע" },
  { key: "triangle", name: "משולש" },
];

const SHAPE_COLORS = [
  { css: "#e23b3b", name: "אדום" },
  { css: "#3b7de2", name: "כחול" },
  { css: "#f0b400", name: "צהוב" },
  { css: "#49a95f", name: "ירוק" },
];

GAMES.shapes = {
  title: "אתר בנייה 🏗️",
  hint: "גררו לחור המתאים",
  say: "בואו נכניס את הצורות",

  root: null,
  queue: [],
  done: 0,
  total: 6,

  start(root) {
    this.root = root;
    this.done = 0;
    this.queue = Array.from({ length: this.total }, (_, i) => ({
      type: SHAPE_TYPES[i % SHAPE_TYPES.length],
      color: SHAPE_COLORS[Math.floor(Math.random() * SHAPE_COLORS.length)],
    }));
    this.queue = shuffle(this.queue);

    root.innerHTML = `
      <div class="sh-sky"></div>
      <div class="sh-ground"></div>
      <span class="crane" id="shCrane">🏗️</span>
      <div class="sorter-box">
        ${SHAPE_TYPES.map(
          (t) => `<div class="hole ${t.key}" data-shape="${t.key}"><span class="hole-label">${t.name}</span></div>`
        ).join("")}
      </div>
      <div class="counter-badge" id="shCounter">0 מתוך ${this.total}</div>
      <div class="shape-slot" id="shSlot"></div>
    `;

    this.nextShape();
  },

  nextShape() {
    if (this.done >= this.total) {
      App.finishGame("סידרתם את כל הצורות");
      return;
    }
    const spec = this.queue[this.done];
    const slot = this.root.querySelector("#shSlot");
    slot.innerHTML = "";

    const shape = el("span", `shape ${spec.type.key} dropping`);
    shape.style.setProperty("--c", spec.color.css);
    shape.style.left = "50%";
    shape.style.top = "74%";
    slot.appendChild(shape);
    shape.dataset.shape = spec.type.key;

    Sound.play("blocks");
    Speech.say(`${spec.type.name} ${spec.color.name}`);
    App.saySpeech(this.root, `${spec.type.name} ${spec.color.name}`);

    makeDraggable(shape, this.root, (node, x, y) => this.drop(node, spec, x, y));
  },

  drop(node, spec, clientX, clientY) {
    const holes = [...this.root.querySelectorAll(".hole")];
    const target = holes.find((h) => {
      const r = h.getBoundingClientRect();
      return clientX > r.left - 20 && clientX < r.right + 20 && clientY > r.top - 20 && clientY < r.bottom + 20;
    });

    if (!target) return false;

    if (target.dataset.shape !== spec.type.key) {
      target.classList.add("shake");
      setTimeout(() => target.classList.remove("shake"), 400);
      Sound.play("wrong");
      App.saySpeech(this.root, "זה לא מתאים, נסו שוב");
      return false;
    }

    node.classList.add("sunk");
    target.classList.add("filled");
    setTimeout(() => target.classList.remove("filled"), 600);
    Sound.play("pop");
    Sound.play("star");
    this.done++;
    this.root.querySelector("#shCounter").textContent = `${this.done} מתוך ${this.total}`;

    const r = target.getBoundingClientRect();
    const rootRect = this.root.getBoundingClientRect();
    App.sparkleAt(
      this.root,
      ((r.left + r.width / 2 - rootRect.left) / rootRect.width) * 100,
      ((r.top + r.height / 2 - rootRect.top) / rootRect.height) * 100,
      7
    );

    setTimeout(() => this.nextShape(), 700);
    return true;
  },

  stop() {},
};
