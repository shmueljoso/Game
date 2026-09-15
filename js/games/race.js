/* מרוץ מכוניות: בוחרים צבע (לימוד צבעים), ספירה לאחור, ולוחצים מהר כדי לנצח */

const CAR_COLORS = [
  { key: "red", name: "אדום", css: "#e23b3b", emoji: "🚗" },
  { key: "blue", name: "כחול", css: "#3b7de2", emoji: "🚙" },
  { key: "yellow", name: "צהוב", css: "#f0b400", emoji: "🚕" },
];

GAMES.race = {
  title: "מרוץ מכוניות 🏁",
  hint: "לחצו מהר!",
  say: "בואו נתחרה",

  root: null,
  running: false,
  finished: false,
  player: 0,
  cpus: [],
  timers: [],

  start(root) {
    this.root = root;
    this.running = false;
    this.finished = false;
    this.player = 0;
    this.cpus = [];
    this.timers.forEach(clearInterval);
    this.timers = [];

    root.innerHTML = `
      <div class="race-bg"><div class="race-scroll" id="raceScroll"></div></div>
      <div class="color-pick" id="colorPick">
        <h2>איזה צבע המכונית שלכם?</h2>
        <div class="color-row">
          ${CAR_COLORS.map(
            (c) => `<button class="color-btn" data-color="${c.key}" style="--c:${c.css}">
                      <span class="color-dot"></span><span>${c.name}</span>
                    </button>`
          ).join("")}
        </div>
      </div>
    `;

    const scroll = root.querySelector("#raceScroll");
    scroll.innerHTML = Array.from({ length: 10 }, (_, i) =>
      `<span class="scenery" style="left:${i * 12}%">${["🌳", "🌲", "🏠", "🌻"][i % 4]}</span>`
    ).join("");

    root.querySelectorAll(".color-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const color = CAR_COLORS.find((c) => c.key === btn.dataset.color);
        Sound.play("pop");
        Speech.say(color.name);
        this.buildTrack(color);
      });
    });
  },

  buildTrack(color) {
    const root = this.root;
    root.querySelector("#colorPick").remove();

    const rivals = [
      { emoji: "🚓", css: "#2b2b2b", speed: 3.0 },
      { emoji: "🚚", css: "#5aa469", speed: 2.6 },
    ];

    root.insertAdjacentHTML(
      "beforeend",
      `
      <div class="race-tracks">
        <div class="track" id="lane0">
          <span class="lane-flag">🏁</span>
          <span class="racer player" id="racer0" style="--c:${color.css}">${color.emoji}</span>
        </div>
        ${rivals
          .map(
            (r, i) => `<div class="track" id="lane${i + 1}">
              <span class="lane-flag">🏁</span>
              <span class="racer" id="racer${i + 1}">${r.emoji}</span>
            </div>`
          )
          .join("")}
      </div>
      <button class="tap-btn" id="goBtn" disabled>מוכנים?</button>
      <div class="countdown" id="countdown"></div>
      <div class="place-badge hidden" id="placeBadge"></div>
      `
    );

    this.cpus = rivals.map((r, i) => ({ progress: 0, speed: r.speed, node: root.querySelector(`#racer${i + 1}`) }));
    this.playerNode = root.querySelector("#racer0");

    const btn = root.querySelector("#goBtn");
    btn.addEventListener("pointerdown", () => this.tap());

    this.countdown();
  },

  countdown() {
    const box = this.root.querySelector("#countdown");
    const steps = ["3", "2", "1", "צאו!"];
    steps.forEach((s, i) => {
      const t = setTimeout(() => {
        box.textContent = s;
        box.classList.remove("beat");
        void box.offsetWidth;
        box.classList.add("beat");
        Sound.play(i === 3 ? "go" : "beep");
        Speech.say(s);
        if (i === 3) {
          box.classList.add("fade");
          this.begin();
        }
      }, i * 800);
      this.timers.push(t);
    });
  },

  begin() {
    this.running = true;
    const btn = this.root.querySelector("#goBtn");
    btn.disabled = false;
    btn.textContent = "לחצו מהר! 👆";
    this.root.classList.add("racing");
    Sound.play("crowd");

    this.cpus.forEach((cpu) => {
      const timer = setInterval(() => {
        if (!this.running) return;
        cpu.progress = Math.min(100, cpu.progress + randBetween(cpu.speed * 0.6, cpu.speed));
        this.place(cpu.node, cpu.progress);
        if (cpu.progress >= 100) this.finish(false);
      }, 300);
      this.timers.push(timer);
    });
  },

  tap() {
    if (!this.running) return;
    this.player = Math.min(100, this.player + randBetween(3.5, 6));
    this.place(this.playerNode, this.player);
    this.playerNode.classList.remove("boost");
    void this.playerNode.offsetWidth;
    this.playerNode.classList.add("boost");
    Sound.play("engine");
    this.dust();
    if (this.player >= 100) this.finish(true);
  },

  place(node, progress) {
    node.style.left = `calc(${progress}% * 0.86 + 6px)`;
  },

  dust() {
    const puff = el("span", "dust");
    puff.style.left = `calc(${this.player}% * 0.86)`;
    this.root.querySelector("#lane0").appendChild(puff);
    setTimeout(() => puff.remove(), 520);
  },

  finish(playerWon) {
    if (this.finished) return;
    this.finished = true;
    this.running = false;
    this.timers.forEach(clearInterval);
    this.timers = [];
    this.root.classList.remove("racing");

    const badge = this.root.querySelector("#placeBadge");
    badge.classList.remove("hidden");
    badge.textContent = playerWon ? "🏆 מקום ראשון!" : "💪 כמעט!";

    setTimeout(() => {
      App.finishGame(playerWon ? "ניצחתם במרוץ" : "מרוץ מעולה");
    }, 800);
  },

  stop() {
    this.running = false;
    this.timers.forEach(clearInterval);
    this.timers = [];
  },
};
