/* זיכרון: מוצאים זוגות של כלי תחבורה - זיכרון, ריכוז והתאמה */

const MEMORY_CARDS = ["🚗", "🚒", "🚑", "🚓", "🚌", "🚜", "🚲", "🚁", "⛵", "🚂"];

GAMES.memory = {
  title: "זיכרון 🧠",
  hint: "מצאו זוגות",
  say: "בואו נמצא זוגות",

  root: null,
  first: null,
  locked: false,
  found: 0,
  pairs: 4,

  start(root) {
    this.root = root;
    this.first = null;
    this.locked = false;
    this.found = 0;

    /* קלפים אחרים ובסדר אחר בכל משחק */
    const picks = shuffle(MEMORY_CARDS).slice(0, this.pairs);
    const deck = shuffle([...picks, ...picks]);

    root.innerHTML = `
      <div class="mm-bg"></div>
      <div class="card-grid" id="mmGrid">
        ${deck
          .map(
            (face, i) => `<button class="mem-card" data-face="${face}" style="animation-delay:${i * 0.06}s">
                <span class="mem-back">❓</span>
                <span class="mem-face">${face}</span>
              </button>`
          )
          .join("")}
      </div>
      <div class="counter-badge" id="mmCounter">0 מתוך ${this.pairs}</div>
    `;

    root.querySelectorAll(".mem-card").forEach((card) => {
      card.addEventListener("click", () => this.flip(card));
    });
  },

  flip(card) {
    if (this.locked || card.classList.contains("open") || card.classList.contains("done")) return;

    card.classList.add("open");
    Sound.play("pop");

    if (!this.first) {
      this.first = card;
      return;
    }

    if (this.first.dataset.face === card.dataset.face) {
      const pair = [this.first, card];
      this.first = null;
      this.found++;
      Sound.play("star");
      pair.forEach((c) => c.classList.add("done"));
      this.root.querySelector("#mmCounter").textContent = `${this.found} מתוך ${this.pairs}`;
      App.sparkleAt(this.root, 50, 50, 8);
      Speech.say("מצאתם זוג!");

      if (this.found === this.pairs) {
        setTimeout(() => App.finishGame("מצאתם את כל הזוגות"), 900);
      }
      return;
    }

    /* לא זוג - מראים רגע ואז סוגרים בעדינות */
    this.locked = true;
    const other = this.first;
    this.first = null;
    Sound.play("wrong");
    setTimeout(() => {
      other.classList.remove("open");
      card.classList.remove("open");
      this.locked = false;
    }, 1100);
  },

  stop() {},
};
