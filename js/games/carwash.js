/* משחק שטיפת מכונית: גוררים ספוגית מעל כתמי לכלוך עד שהמכונית נוצצת */

const CarWashGame = {
  dirtSpots: [],
  cleaned: 0,
  total: 0,

  DIRT_POSITIONS: [
    { x: 22, y: 30 },
    { x: 40, y: 50 },
    { x: 60, y: 28 },
    { x: 78, y: 48 },
    { x: 50, y: 62 },
    { x: 30, y: 68 },
  ],

  start() {
    document.getElementById("carwashWin").classList.add("hidden");
    this.cleaned = 0;
    this.total = this.DIRT_POSITIONS.length;
    this.buildScene();
    this.renderProgress();
    this.bindSponge();
  },

  buildScene() {
    const scene = document.getElementById("carScene");
    scene.innerHTML = `
      <svg class="car-svg" viewBox="0 0 300 160" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="150" cy="148" rx="120" ry="8" fill="#00000022"/>
        <path d="M40 110 Q40 70 90 65 Q110 40 190 40 Q230 40 245 65 Q270 70 270 110 Z"
              fill="#4d96ff" stroke="#2d6fd6" stroke-width="3"/>
        <path d="M105 68 Q120 48 190 48 Q220 48 232 68 Z" fill="#bfe3ff" opacity="0.85"/>
        <rect x="40" y="100" width="230" height="22" rx="10" fill="#3d7fe0"/>
        <circle class="wheel" cx="95" cy="128" r="20" fill="#2b2b2b"/>
        <circle cx="95" cy="128" r="8" fill="#c9c9c9"/>
        <circle class="wheel" cx="215" cy="128" r="20" fill="#2b2b2b"/>
        <circle cx="215" cy="128" r="8" fill="#c9c9c9"/>
        <circle cx="60" cy="95" r="6" fill="#fff6cc"/>
        <circle cx="248" cy="95" r="6" fill="#ffd1d1"/>
      </svg>
      <div class="dirt-layer" id="dirtLayer"></div>
    `;

    const layer = document.getElementById("dirtLayer");
    this.dirtSpots = this.DIRT_POSITIONS.map((pos, i) => {
      const el = document.createElement("div");
      el.className = "dirt-spot";
      el.style.left = pos.x + "%";
      el.style.top = pos.y + "%";
      el.dataset.index = i;
      layer.appendChild(el);
      return { el, x: pos.x, y: pos.y, clean: false };
    });
  },

  renderProgress() {
    const row = document.getElementById("carwashProgress");
    row.innerHTML = "";
    for (let i = 0; i < this.total; i++) {
      const star = document.createElement("span");
      star.className = "star" + (i < this.cleaned ? " lit" : "");
      star.textContent = "⭐";
      row.appendChild(star);
    }
  },

  bindSponge() {
    const stage = document.getElementById("carwashStage");
    const sponge = document.getElementById("sponge");

    const move = (clientX, clientY) => {
      const rect = stage.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;
      sponge.style.transform = `translate(${x - 28}px, ${y - 28}px)`;
      this.checkCollisions(clientX, clientY);
    };

    stage.onpointermove = (e) => move(e.clientX, e.clientY);
    stage.onpointerdown = (e) => {
      sponge.classList.add("active");
      move(e.clientX, e.clientY);
    };
    stage.onpointerup = () => sponge.classList.remove("active");
    stage.onpointerleave = () => sponge.classList.remove("active");
  },

  checkCollisions(clientX, clientY) {
    this.dirtSpots.forEach((spot) => {
      if (spot.clean) return;
      const r = spot.el.getBoundingClientRect();
      const sx = r.left + r.width / 2;
      const sy = r.top + r.height / 2;
      const dist = Math.hypot(clientX - sx, clientY - sy);
      if (dist < 40) this.cleanSpot(spot);
    });
  },

  cleanSpot(spot) {
    spot.clean = true;
    spot.el.classList.add("gone");
    this.spawnBubbles(spot.el);
    this.cleaned++;
    this.renderProgress();
    if (this.cleaned >= this.total) {
      setTimeout(() => this.win(), 400);
    }
  },

  spawnBubbles(atEl) {
    const layer = document.getElementById("dirtLayer");
    for (let i = 0; i < 6; i++) {
      const b = document.createElement("span");
      b.className = "bubble";
      b.style.left = atEl.style.left;
      b.style.top = atEl.style.top;
      b.style.setProperty("--dx", (Math.random() * 40 - 20) + "px");
      b.style.animationDelay = Math.random() * 0.15 + "s";
      layer.appendChild(b);
      setTimeout(() => b.remove(), 900);
    }
  },

  win() {
    document.getElementById("carwashWin").classList.remove("hidden");
    if (App.profile) {
      renderCompanion(
        document.getElementById("carwashWinMascot"),
        App.profile.companion,
        "happy"
      );
    }
    App.celebrate();
  },
};
