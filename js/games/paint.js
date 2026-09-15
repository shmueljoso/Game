/* ציור חופשי: בוחרים צבע ומציירים באצבע. אין נכון ולא נכון - רק כיף ומוטוריקה */

const PAINT_COLORS = [
  { css: "#e8443b", name: "אדום" },
  { css: "#f2921d", name: "כתום" },
  { css: "#f2c811", name: "צהוב" },
  { css: "#3fa85f", name: "ירוק" },
  { css: "#2f6fd0", name: "כחול" },
  { css: "#9b6ede", name: "סגול" },
  { css: "#e86fa8", name: "ורוד" },
  { css: "#4a3222", name: "חום" },
];

GAMES.paint = {
  title: "ציור 🎨",
  hint: "ציירו באצבע",
  say: "בואו נצייר",

  root: null,
  color: PAINT_COLORS[0],
  drawing: false,

  start(root) {
    this.root = root;
    this.color = PAINT_COLORS[0];
    this.drawing = false;

    root.innerHTML = `
      <canvas class="paint-canvas" id="ptCanvas"></canvas>
      <div class="palette" id="ptPalette">
        ${PAINT_COLORS.map(
          (c, i) => `<button class="paint-dot ${i === 0 ? "active" : ""}" data-i="${i}" style="--c:${c.css}"></button>`
        ).join("")}
      </div>
      <button class="mini-btn" id="ptClear">🧽 דף חדש</button>
      <div class="counter-badge" id="ptHint">ציירו מה שבא לכם</div>
    `;

    const canvas = root.querySelector("#ptCanvas");
    const ctx = canvas.getContext("2d");
    this.ctx = ctx;
    this.canvas = canvas;

    const sizeCanvas = () => {
      const r = canvas.getBoundingClientRect();
      const snapshot = canvas.width ? ctx.getImageData(0, 0, canvas.width, canvas.height) : null;
      canvas.width = Math.round(r.width);
      canvas.height = Math.round(r.height);
      ctx.fillStyle = "#fffdf7";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      if (snapshot) ctx.putImageData(snapshot, 0, 0);
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
    };
    sizeCanvas();
    this.onResize = sizeCanvas;
    window.addEventListener("resize", this.onResize);

    root.querySelectorAll(".paint-dot").forEach((dot) => {
      dot.addEventListener("click", () => {
        root.querySelectorAll(".paint-dot").forEach((d) => d.classList.remove("active"));
        dot.classList.add("active");
        this.color = PAINT_COLORS[dot.dataset.i];
        Sound.play("pop");
        Speech.say(this.color.name);
      });
    });

    root.querySelector("#ptClear").addEventListener("click", (e) => {
      e.stopPropagation();
      ctx.fillStyle = "#fffdf7";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      Sound.play("whoosh");
      App.saySpeech(root, "דף חדש!");
    });

    const pos = (e) => {
      const r = canvas.getBoundingClientRect();
      return { x: e.clientX - r.left, y: e.clientY - r.top };
    };

    canvas.addEventListener("pointerdown", (e) => {
      this.drawing = true;
      canvas.setPointerCapture(e.pointerId);
      const p = pos(e);
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      this.dot(p);
      Sound.tone(300 + Math.random() * 400, 0.12, { type: "sine", vol: 0.06 });
    });

    canvas.addEventListener("pointermove", (e) => {
      if (!this.drawing) return;
      const p = pos(e);
      ctx.strokeStyle = this.color.css;
      ctx.lineWidth = Math.max(10, canvas.width * 0.022);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
    });

    ["pointerup", "pointercancel", "pointerleave"].forEach((ev) =>
      canvas.addEventListener(ev, () => (this.drawing = false))
    );
  },

  dot(p) {
    const ctx = this.ctx;
    ctx.fillStyle = this.color.css;
    ctx.beginPath();
    ctx.arc(p.x, p.y, Math.max(5, this.canvas.width * 0.011), 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
  },

  stop() {
    window.removeEventListener("resize", this.onResize);
    this.drawing = false;
  },
};
