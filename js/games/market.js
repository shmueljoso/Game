/* סופרמרקט: שמים בעגלה בדיוק כמה שביקשו - לימוד ספירה עד חמש */

const MARKET_ITEMS = [
  { emoji: "🍎", name: "תפוחים" },
  { emoji: "🍌", name: "בננות" },
  { emoji: "🥕", name: "גזרים" },
  { emoji: "🍇", name: "ענבים" },
  { emoji: "🍞", name: "לחמים" },
];

GAMES.market = {
  title: "סופרמרקט 🛒",
  hint: "כמה שביקשו",
  say: "בואו נקנה בסופר",

  root: null,
  round: 0,
  rounds: 4,
  need: 0,
  inCart: 0,
  item: null,
  locked: false,

  start(root) {
    this.root = root;
    this.round = 0;

    root.innerHTML = `
      <div class="mk-wall"></div>
      <div class="mk-floor"></div>
      <div class="shelf-row" id="mkShelf"></div>
      <div class="mk-cart" id="mkCart">
        <span class="cart-emoji">🛒</span>
        <span class="cart-items" id="mkCartItems"></span>
      </div>
      <div class="counter-badge" id="mkCounter"></div>
      <div class="progress-dots" id="mkDots"></div>
    `;

    this.nextRound();
  },

  nextRound() {
    if (this.round >= this.rounds) {
      App.finishGame("סיימתם את הקניות");
      return;
    }
    this.locked = false;
    this.inCart = 0;
    this.need = 1 + Math.floor(Math.random() * 5);
    this.item = MARKET_ITEMS[Math.floor(Math.random() * MARKET_ITEMS.length)];

    const shelf = this.root.querySelector("#mkShelf");
    shelf.innerHTML = "";
    /* תמיד יש יותר פריטים ממה שצריך, כדי שבאמת יספרו */
    for (let i = 0; i < 6; i++) {
      const it = el("button", "shelf-item", this.item.emoji);
      it.style.animationDelay = i * 0.08 + "s";
      it.addEventListener("click", () => this.take(it));
      shelf.appendChild(it);
    }

    this.root.querySelector("#mkCartItems").innerHTML = "";
    this.paint();
    this.paintDots();
    App.saySpeech(this.root, `שימו ${this.need} ${this.item.name} בעגלה`);
    Sound.play("beep");
  },

  take(node) {
    if (this.locked || node.classList.contains("taken")) return;

    node.classList.add("taken");
    this.inCart++;
    Sound.play("pop");
    Sound.tone(420 + this.inCart * 60, 0.18, { type: "triangle", vol: 0.14 });
    Speech.say(String(this.inCart));

    const chip = el("span", "cart-item", this.item.emoji);
    this.root.querySelector("#mkCartItems").appendChild(chip);
    this.paint();

    if (this.inCart === this.need) {
      this.locked = true;
      Sound.play("star");
      App.sparkleAt(this.root, 50, 70, 10);
      App.saySpeech(this.root, `יופי! ${this.need} בדיוק`);
      this.round++;
      this.paintDots();
      setTimeout(() => this.nextRound(), 1600);
    } else if (this.inCart > this.need) {
      this.locked = true;
      Sound.play("wrong");
      App.saySpeech(this.root, "אופס, יותר מדי! מתחילים שוב");
      setTimeout(() => {
        this.inCart = 0;
        this.locked = false;
        this.root.querySelector("#mkCartItems").innerHTML = "";
        this.root.querySelectorAll(".shelf-item").forEach((n) => n.classList.remove("taken"));
        this.paint();
      }, 1500);
    }
  },

  paint() {
    this.root.querySelector("#mkCounter").textContent = `צריך ${this.need} · בעגלה ${this.inCart}`;
  },

  paintDots() {
    const dots = this.root.querySelector("#mkDots");
    dots.innerHTML = Array.from({ length: this.rounds }, (_, i) =>
      `<span class="dot ${i < this.round ? "on" : ""}">⭐</span>`
    ).join("");
  },

  stop() {},
};
