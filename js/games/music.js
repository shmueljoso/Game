/* תזמורת: מקשיבים לשיר קצר וחוזרים עליו - זיכרון, קשב ומוזיקה */

const INSTRUMENTS = [
  { key: "drum",  emoji: "🥁", name: "תוף",    css: "#e8443b", freq: 180, type: "triangle" },
  { key: "bell",  emoji: "🔔", name: "פעמון",  css: "#f2b807", freq: 660, type: "sine" },
  { key: "piano", emoji: "🎹", name: "פסנתר",  css: "#2f6fd0", freq: 440, type: "square" },
  { key: "horn",  emoji: "🎺", name: "חצוצרה", css: "#3fa85f", freq: 330, type: "sawtooth" },
];

GAMES.music = {
  title: "תזמורת 🥁",
  hint: "חזרו על השיר",
  say: "בואו נעשה מוזיקה",

  root: null,
  sequence: [],
  step: 0,
  round: 0,
  rounds: 4,
  locked: true,
  timers: [],

  start(root) {
    this.root = root;
    this.round = 0;
    this.sequence = [];
    this.clearTimers();

    root.innerHTML = `
      <div class="mu-stage-bg"></div>
      <div class="mu-curtain"></div>
      <div class="instrument-row" id="muRow">
        ${INSTRUMENTS.map(
          (n) => `<button class="instrument" data-key="${n.key}" style="--c:${n.css}">
                    <span class="instrument-emoji">${n.emoji}</span>
                  </button>`
        ).join("")}
      </div>
      <div class="progress-dots" id="muDots"></div>
      <button class="mini-btn" id="muReplay">🔁 עוד פעם</button>
    `;

    root.querySelectorAll(".instrument").forEach((btn) => {
      btn.addEventListener("click", () => this.press(btn.dataset.key, btn));
    });
    root.querySelector("#muReplay").addEventListener("click", () => this.playSequence());

    this.nextRound();
  },

  nextRound() {
    if (this.round >= this.rounds) {
      App.finishGame("ניגנתם נהדר");
      return;
    }
    this.sequence.push(INSTRUMENTS[Math.floor(Math.random() * INSTRUMENTS.length)].key);
    this.step = 0;
    this.paintDots();
    App.saySpeech(this.root, "תקשיבו...");
    this.timers.push(setTimeout(() => this.playSequence(), 900));
  },

  playSequence() {
    this.locked = true;
    this.step = 0;
    this.sequence.forEach((key, i) => {
      this.timers.push(
        setTimeout(() => {
          this.hit(key, false);
          if (i === this.sequence.length - 1) {
            this.timers.push(
              setTimeout(() => {
                this.locked = false;
                App.saySpeech(this.root, "עכשיו אתם!");
              }, 600)
            );
          }
        }, i * 700)
      );
    });
  },

  /* מנגן כלי אחד ומאיר אותו */
  hit(key, byChild) {
    const inst = INSTRUMENTS.find((n) => n.key === key);
    const btn = this.root.querySelector(`.instrument[data-key="${key}"]`);
    if (!btn) return;
    btn.classList.remove("lit");
    void btn.offsetWidth;
    btn.classList.add("lit");
    Sound.tone(inst.freq, 0.35, { type: inst.type, vol: 0.18 });
    if (byChild) Sound.tone(inst.freq * 2, 0.2, { type: "sine", vol: 0.08, at: 0.05 });
  },

  press(key, btn) {
    /* מחוץ לתור אפשר תמיד לנגן סתם בשביל הכיף */
    if (this.locked) {
      this.hit(key, true);
      return;
    }

    this.hit(key, true);

    if (key !== this.sequence[this.step]) {
      btn.classList.add("wrong");
      setTimeout(() => btn.classList.remove("wrong"), 500);
      Sound.play("wrong");
      this.locked = true;
      App.saySpeech(this.root, "כמעט! מקשיבים שוב");
      this.timers.push(setTimeout(() => this.playSequence(), 1000));
      return;
    }

    this.step++;
    if (this.step >= this.sequence.length) {
      this.locked = true;
      this.round++;
      this.paintDots();
      Sound.play("star");
      App.sparkleAt(this.root, 50, 45, 10);
      App.saySpeech(this.root, "יפה מאוד!");
      this.timers.push(setTimeout(() => this.nextRound(), 1400));
    }
  },

  paintDots() {
    const dots = this.root.querySelector("#muDots");
    dots.innerHTML = Array.from({ length: this.rounds }, (_, i) =>
      `<span class="dot ${i < this.round ? "on" : ""}">⭐</span>`
    ).join("");
  },

  clearTimers() {
    this.timers.forEach(clearTimeout);
    this.timers = [];
  },

  stop() {
    this.clearTimers();
    this.locked = true;
  },
};
