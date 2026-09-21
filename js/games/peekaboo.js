/* מי מתחבא: נוגעים בענן הגדול והחיה קופצת החוצה עם קול ושם.
   בלי מטרה לפספס - כל נגיעה על הענן עובדת, בלי צעד שני */

const PEEK_ITEMS = [
  { emoji: "🐶", name: "כלב", sound: () => Sound.tone(300, 0.22, { type: "square", slideTo: 500, vol: 0.14 }) },
  { emoji: "🐱", name: "חתול", sound: () => Sound.melody([700, 900], { gap: 0.1, type: "sine", vol: 0.14 }) },
  { emoji: "🐰", name: "ארנב", sound: () => Sound.tone(600, 0.14, { type: "sine", slideTo: 900, vol: 0.13 }) },
  { emoji: "🐻", name: "דובי", sound: () => Sound.tone(150, 0.3, { type: "sawtooth", slideTo: 100, vol: 0.13 }) },
  { emoji: "🚗", name: "מכונית", sound: () => Sound.play("engine") },
  { emoji: "🚌", name: "אוטובוס", sound: () => Sound.play("honk") },
  { emoji: "🚂", name: "רכבת", sound: () => Sound.melody([260, 260, 340], { gap: 0.1, type: "square", vol: 0.13 }) },
  { emoji: "✈️", name: "מטוס", sound: () => Sound.tone(400, 0.4, { type: "sine", slideTo: 800, vol: 0.12 }) },
];

GAMES.peekaboo = {
  title: "מי מתחבא? 🙈",
  hint: "געו בענן!",
  say: "בואו נראה מי מתחבא",

  root: null,
  reveals: 0,
  goal: 8,
  item: null,
  open: false,
  timer: null,

  start(root) {
    this.root = root;
    this.reveals = 0;

    root.innerHTML = `
      <div class="pk-sky"></div>
      <div class="pk-ground"></div>
      <div class="peek-stage" id="pkStage">
        <span class="peek-item" id="pkItem"></span>
        <button class="peek-cloud" id="pkCloud">☁️</button>
      </div>
      <div class="progress-dots" id="pkDots"></div>
    `;

    this.paintDots();
    this.nextItem();
    this.root.querySelector("#pkCloud").addEventListener("pointerdown", () => this.reveal());
  },

  nextItem() {
    this.item = PEEK_ITEMS[Math.floor(Math.random() * PEEK_ITEMS.length)];
    this.open = false;
    const cloud = this.root.querySelector("#pkCloud");
    const itemEl = this.root.querySelector("#pkItem");
    itemEl.textContent = this.item.emoji;
    itemEl.classList.remove("shown");
    cloud.classList.remove("hidden-away");
  },

  reveal() {
    if (this.open) return;
    this.open = true;

    const cloud = this.root.querySelector("#pkCloud");
    cloud.classList.add("hidden-away");
    this.root.querySelector("#pkItem").classList.add("shown");
    Sound.play("pop");
    this.item.sound();
    App.saySpeech(this.root, this.item.name);
    App.sparkleAt(this.root, 50, 46, 8);

    this.reveals++;
    this.paintDots();

    if (this.reveals % this.goal === 0) {
      this.timer = setTimeout(() => App.finishGame("מצאתם את כולם"), 1300);
    } else {
      this.timer = setTimeout(() => this.nextItem(), 1600);
    }
  },

  paintDots() {
    const dots = this.root.querySelector("#pkDots");
    if (!dots) return;
    const n = this.reveals % this.goal;
    dots.innerHTML = Array.from({ length: this.goal }, (_, i) =>
      `<span class="dot ${i < n ? "on" : ""}">⭐</span>`
    ).join("");
  },

  stop() {
    clearTimeout(this.timer);
  },
};
