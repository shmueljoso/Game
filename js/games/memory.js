/* זיכרון: מוצאים זוגות - רכבים אמיתיים מהמוסך (עם הסמל שלהם) וכלי תחבורה.
   זיכרון, ריכוז, וזיהוי סמלים של יצרני רכב */

/* מצב "הכל מעורבב": כלי תחבורה, חיות, פירות וצעצועים */
const MEMORY_CARDS = [
  "🚗", "🚒", "🚑", "🚓", "🚌", "🚜", "🚲", "🚁", "⛵", "🚂", "✈️", "🚀",
  "🐶", "🐱", "🐰", "🦁", "🐘", "🐸", "🐵", "🐧", "🦒", "🐢", "🐟", "🦋",
  "🍎", "🍌", "🍓", "🍉", "🍇", "🥕", "🍦", "🧁",
  "⚽", "🎈", "🧸", "🌈", "⭐", "🌻", "🎁", "🥁", "☂️", "🪁",
];

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

    /* שני מצבים: רק הרכבים המצולמים מהמוסך, או הכל מעורבב. קלפים אחרים בכל משחק */
    const carsMode = this.mode() === "cars";
    const picks = carsMode
      ? shuffle(CARS.filter((c) => c.photo)).slice(0, this.pairs).map((c) => ({ key: c.id, car: c }))
      : shuffle(MEMORY_CARDS).slice(0, this.pairs).map((e) => ({ key: e, emoji: e }));
    const deck = shuffle([...picks, ...picks]);

    root.innerHTML = `
      <div class="mm-bg"></div>
      <div class="card-grid" id="mmGrid">
        ${deck
          .map(
            (face, i) => `<button class="mem-card" data-face="${face.key}" style="animation-delay:${i * 0.06}s">
                <span class="mem-back">❓</span>
                <span class="mem-face">${face.car ? this.carFace(face.car) : face.emoji}</span>
              </button>`
          )
          .join("")}
      </div>
      <div class="counter-badge" id="mmCounter">0 מתוך ${this.pairs}</div>
      <button class="mini-btn" id="mmMode">${carsMode ? "🎨 הכל מעורבב" : "🚗 רק רכבים"}</button>
    `;

    root.querySelector("#mmMode").addEventListener("click", (e) => {
      e.stopPropagation();
      App.profile.memoryMode = carsMode ? "mixed" : "cars";
      App.saveProfile();
      Sound.play("whoosh");
      App.replayGame();
      Speech.say(carsMode ? "הכל מעורבב!" : "רק רכבים!");
    });

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
      const car = CARS.find((c) => c.id === card.dataset.face);
      if (car) Speech.say(car.latin, { forceEn: true });
      else Speech.say("מצאתם זוג!");

      if (this.found === this.pairs) {
        App.later(() => App.finishGame("מצאתם את כל הזוגות"), 900);
      }
      return;
    }

    /* לא זוג - מראים רגע ואז סוגרים בעדינות */
    this.locked = true;
    const other = this.first;
    this.first = null;
    Sound.play("wrong");
    App.later(() => {
      other.classList.remove("open");
      card.classList.remove("open");
      this.locked = false;
    }, 1100);
  },

  mode() {
    return (App.profile && App.profile.memoryMode) || "cars";
  },

  /* צד הרכב בקלף: הסמל גדול למעלה והצילום מתחתיו */
  carFace(car) {
    return `<span class="mem-car">
        <svg class="mem-logo" viewBox="0 0 60 60">${emblemAt(car, 30, 30, 27, "#8a94a3")}</svg>
        <img class="mem-photo" src="${car.photo}" alt="${car.latin}" draggable="false" />
      </span>`;
  },

  stop() {},
};
