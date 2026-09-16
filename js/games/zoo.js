/* גן החיות: מוצאים את החיה הנכונה - לימוד שמות חיות והקולות שלהן */

const ZOO_ANIMALS = [
  { emoji: "🦁", name: "אריה", sound: () => Sound.tone(120, 0.5, { type: "sawtooth", slideTo: 80, vol: 0.14 }) },
  { emoji: "🐘", name: "פיל", sound: () => Sound.tone(320, 0.5, { type: "square", slideTo: 180, vol: 0.1 }) },
  { emoji: "🐒", name: "קוף", sound: () => Sound.melody([880, 1200, 990, 1320], { gap: 0.09, type: "sine", vol: 0.12 }) },
  { emoji: "🦒", name: "ג'ירפה", sound: () => Sound.melody([400, 600, 800], { gap: 0.12, type: "triangle", vol: 0.12 }) },
  { emoji: "🐸", name: "צפרדע", sound: () => Sound.melody([180, 150, 180, 150], { gap: 0.1, type: "square", vol: 0.1 }) },
  { emoji: "🐧", name: "פינגווין", sound: () => Sound.melody([700, 500], { gap: 0.1, type: "square", vol: 0.1 }) },
  { emoji: "🐮", name: "פרה", sound: () => Sound.tone(200, 0.6, { type: "sawtooth", slideTo: 140, vol: 0.12 }) },
  { emoji: "🐴", name: "סוס", sound: () => Sound.melody([300, 340, 300, 260], { gap: 0.08, type: "triangle", vol: 0.12 }) },
];

GAMES.zoo = {
  title: "גן החיות 🦁",
  hint: "מצאו את החיה",
  say: "בואו נכיר את החיות",

  root: null,
  round: 0,
  rounds: 5,
  target: null,
  locked: false,

  start(root) {
    this.root = root;
    this.round = 0;
    this.locked = false;

    root.innerHTML = `
      <div class="zoo-sky"></div>
      <div class="zoo-ground"></div>
      <div class="zoo-fence"></div>
      <div class="question-bar">
        <span class="q-text" id="zooQuestion">איפה ה...</span>
        <span class="q-target" id="zooTarget">❓</span>
      </div>
      <div class="animal-row" id="animalRow"></div>
      <div class="progress-dots" id="zooDots"></div>
    `;

    this.nextRound();
  },

  nextRound() {
    if (this.round >= this.rounds) {
      App.finishGame("הכרתם את כל החיות");
      return;
    }
    this.locked = false;
    const picks = shuffle(ZOO_ANIMALS).slice(0, 4);
    this.target = picks[Math.floor(Math.random() * picks.length)];

    const row = this.root.querySelector("#animalRow");
    row.innerHTML = "";
    picks.forEach((a, i) => {
      const card = el("button", "animal-card", `<span class="animal-emoji">${a.emoji}</span>`);
      card.style.animationDelay = i * 0.12 + "s";
      card.addEventListener("click", () => this.pick(a, card));
      row.appendChild(card);
    });

    this.root.querySelector("#zooTarget").textContent = this.target.emoji;
    this.root.querySelector("#zooQuestion").textContent = `איפה ה${this.target.name}?`;
    this.paintDots();
    Speech.say(`איפה ה${this.target.name}?`);
    Sound.play("beep");
  },

  pick(animal, card) {
    if (this.locked) return;

    if (animal.emoji !== this.target.emoji) {
      card.classList.add("wrong");
      Sound.play("wrong");
      setTimeout(() => card.classList.remove("wrong"), 500);
      return;
    }

    this.locked = true;
    card.classList.add("correct");
    animal.sound();
    setTimeout(() => Speech.say(animal.name), 450);
    App.sparkleAt(this.root, 50, 55, 10);
    this.round++;
    this.paintDots();
    setTimeout(() => {
      Sound.play("star");
      this.nextRound();
    }, 1400);
  },

  paintDots() {
    const dots = this.root.querySelector("#zooDots");
    dots.innerHTML = Array.from({ length: this.rounds }, (_, i) =>
      `<span class="dot ${i < this.round ? "on" : ""}">⭐</span>`
    ).join("");
  },

  stop() {},
};
