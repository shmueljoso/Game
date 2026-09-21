/* צבעים גדולים: לוחצים על כל עיגול ענק, המסך מתצבע לרגע והדמות אומרת את שם הצבע.
   אין תשובה נכונה או שגויה - כל נגיעה חוגגת */

const BIG_COLORS = [
  { css: "#ff6b6b", name: "אדום" },
  { css: "#4d96ff", name: "כחול" },
  { css: "#ffd93d", name: "צהוב" },
  { css: "#6bcB77", name: "ירוק" },
  { css: "#ff8fab", name: "ורוד" },
  { css: "#b085ff", name: "סגול" },
];

GAMES.bigcolors = {
  title: "צבעים 🌈",
  hint: "געו בכל עיגול!",
  say: "בואו נלמד צבעים",

  root: null,
  taps: 0,
  goal: 12,

  start(root) {
    this.root = root;
    this.taps = 0;

    root.innerHTML = `
      <div class="cl-bg"></div>
      <div class="flash-tint" id="clFlash"></div>
      <div class="color-grid" id="clGrid">
        ${BIG_COLORS.map(
          (c, i) => `<button class="color-circle" data-i="${i}" style="--c:${c.css}"></button>`
        ).join("")}
      </div>
      <div class="progress-dots" id="clDots"></div>
    `;

    this.paintDots();
    this.root.querySelectorAll(".color-circle").forEach((btn) => {
      btn.addEventListener("pointerdown", () => this.tap(BIG_COLORS[btn.dataset.i], btn));
    });
  },

  tap(color, btn) {
    btn.classList.remove("bounce");
    void btn.offsetWidth;
    btn.classList.add("bounce");

    const flash = this.root.querySelector("#clFlash");
    flash.style.background = color.css;
    flash.classList.remove("flashing");
    void flash.offsetWidth;
    flash.classList.add("flashing");

    Sound.play("star");
    Speech.say(color.name);

    const r = btn.getBoundingClientRect();
    const rootRect = this.root.getBoundingClientRect();
    App.sparkleAt(
      this.root,
      ((r.left + r.width / 2 - rootRect.left) / rootRect.width) * 100,
      ((r.top + r.height / 2 - rootRect.top) / rootRect.height) * 100,
      6
    );

    this.taps++;
    this.paintDots();
    if (this.taps % this.goal === 0) {
      setTimeout(() => App.finishGame("איזה יופי של צבעים"), 500);
    }
  },

  paintDots() {
    const dots = this.root.querySelector("#clDots");
    if (!dots) return;
    const n = this.taps % this.goal;
    dots.innerHTML = Array.from({ length: this.goal }, (_, i) =>
      `<span class="dot ${i < n ? "on" : ""}">⭐</span>`
    ).join("");
  },

  stop() {},
};
