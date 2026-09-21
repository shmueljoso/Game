/* בועות צבע: נוגעים בכל בועה שרוצים - היא תמיד מתפוצצת. בלי לפספס, בלי כישלון.
   מיועד לגיל שנתיים: מטרות ענקיות, תגובה מיידית לכל נגיעה, לומדים צבעים דרך המשחק */

const BUBBLE_COLORS = [
  { css: "#ff6b6b", name: "אדום" },
  { css: "#4d96ff", name: "כחול" },
  { css: "#ffd93d", name: "צהוב" },
  { css: "#6bcB77", name: "ירוק" },
  { css: "#ff8fab", name: "ורוד" },
  { css: "#b085ff", name: "סגול" },
];

GAMES.bubbles = {
  title: "בועות צבע 🫧",
  hint: "געו בכל בועה!",
  say: "בואו נפוצץ בועות",

  root: null,
  pops: 0,
  goal: 10,
  spawnTimer: null,

  start(root) {
    this.root = root;
    this.pops = 0;

    root.innerHTML = `
      <div class="bb-sky"></div>
      <div class="bb-water"></div>
      <div class="bubble-field" id="bbField"></div>
      <div class="progress-dots" id="bbDots"></div>
    `;

    this.paintDots();
    for (let i = 0; i < 4; i++) {
      setTimeout(() => this.spawn(), i * 350);
    }
    this.spawnTimer = setInterval(() => this.spawn(), 1400);
  },

  spawn() {
    if (!this.root) return;
    const field = this.root.querySelector("#bbField");
    if (!field || field.children.length >= 6) return;

    const color = BUBBLE_COLORS[Math.floor(Math.random() * BUBBLE_COLORS.length)];
    const bubble = el("button", "bubble-big");
    bubble.style.setProperty("--c", color.css);
    bubble.style.left = randBetween(10, 90) + "%";
    bubble.style.setProperty("--dur", randBetween(6, 10) + "s");
    bubble.style.setProperty("--drift", randBetween(-30, 30) + "px");
    bubble.dataset.color = color.name;
    field.appendChild(bubble);

    const clear = () => bubble.remove();
    bubble.addEventListener("animationend", clear);
    bubble.addEventListener("pointerdown", (e) => {
      e.stopPropagation();
      this.pop(bubble, color);
    });
  },

  pop(bubble, color) {
    if (bubble.classList.contains("popped")) return;
    bubble.classList.add("popped");
    const rect = bubble.getBoundingClientRect();
    const rootRect = this.root.getBoundingClientRect();
    const xPct = ((rect.left + rect.width / 2 - rootRect.left) / rootRect.width) * 100;
    const yPct = ((rect.top + rect.height / 2 - rootRect.top) / rootRect.height) * 100;

    Sound.play("pop");
    Sound.tone(500 + Math.random() * 300, 0.2, { type: "sine", slideTo: 1000, vol: 0.16 });
    App.sparkleAt(this.root, xPct, yPct, 8);
    Speech.say(color.name);

    setTimeout(() => bubble.remove(), 160);

    this.pops++;
    this.paintDots();
    if (this.pops % this.goal === 0) {
      setTimeout(() => App.finishGame("כל הכבוד על כל הבועות"), 300);
    } else {
      setTimeout(() => this.spawn(), 120);
    }
  },

  paintDots() {
    const dots = this.root.querySelector("#bbDots");
    if (!dots) return;
    const n = this.pops % this.goal;
    dots.innerHTML = Array.from({ length: this.goal }, (_, i) =>
      `<span class="dot ${i < n ? "on" : ""}">🫧</span>`
    ).join("");
  },

  stop() {
    clearInterval(this.spawnTimer);
    this.spawnTimer = null;
  },
};
