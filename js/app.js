/* ניהול כללי: פרופיל שמור, ניווט בין מסכים, קונפטי */

const STORAGE_KEY = "kidsGameProfile";

const App = {
  profile: null,

  init() {
    this.profile = this.loadProfile();
    this.buildCompanionGrid();
    this.bindNav();

    if (this.profile) {
      this.showScreen("home");
      this.paintMascots();
    } else {
      this.showScreen("select");
    }
  },

  loadProfile() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  },

  saveProfile(companionKey) {
    this.profile = { companion: companionKey, savedAt: Date.now() };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.profile));
    } catch (e) {
      /* אחסון לא זמין - ממשיכים בלי שמירה */
    }
  },

  buildCompanionGrid() {
    const grid = document.getElementById("companionGrid");
    grid.innerHTML = "";
    Object.values(COMPANIONS).forEach((c) => {
      const card = document.createElement("button");
      card.className = "companion-card";
      card.dataset.key = c.key;
      card.innerHTML = `
        <span class="companion-avatar"></span>
        <span class="companion-label">${c.label}</span>
      `;
      card.addEventListener("click", () => this.pickCompanion(c.key, card));
      grid.appendChild(card);
      renderCompanion(card.querySelector(".companion-avatar"), c.key, "idle");
    });
  },

  pickCompanion(key, cardEl) {
    document
      .querySelectorAll(".companion-card")
      .forEach((c) => c.classList.remove("chosen"));
    cardEl.classList.add("chosen");
    renderCompanion(cardEl.querySelector(".companion-avatar"), key, "happy");

    this.saveProfile(key);
    setTimeout(() => {
      this.showScreen("home");
      this.paintMascots();
    }, 550);
  },

  paintMascots() {
    if (!this.profile) return;
    const key = this.profile.companion;
    ["homeMascot", "carwashMascot", "raceMascot"].forEach((id) => {
      const el = document.getElementById(id);
      if (el) renderCompanion(el, key, "idle");
    });
  },

  bindNav() {
    document.getElementById("mascotBtn").addEventListener("click", () => {
      this.showScreen("select");
    });

    document.querySelectorAll(".world-card[data-game]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const game = btn.dataset.game;
        this.showScreen(game);
        this.paintMascots();
        if (game === "carwash") CarWashGame.start();
        if (game === "race") RaceGame.start();
      });
    });

    document.querySelectorAll("[data-back]").forEach((btn) => {
      btn.addEventListener("click", () => this.showScreen("home"));
    });

    document.querySelectorAll("[data-replay]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const game = btn.dataset.replay;
        if (game === "carwash") CarWashGame.start();
        if (game === "race") RaceGame.start();
      });
    });
  },

  showScreen(name) {
    document.querySelectorAll(".screen").forEach((s) => s.classList.add("hidden"));
    document.getElementById(`screen-${name}`).classList.remove("hidden");
  },

  celebrate(mascotKey) {
    const layer = document.getElementById("confettiLayer");
    const colors = ["#ff6b6b", "#ffd93d", "#6bcB77", "#4d96ff", "#ff8fab"];
    for (let i = 0; i < 40; i++) {
      const piece = document.createElement("span");
      piece.className = "confetti-piece";
      piece.style.left = Math.random() * 100 + "vw";
      piece.style.background = colors[i % colors.length];
      piece.style.animationDelay = Math.random() * 0.4 + "s";
      piece.style.transform = `rotate(${Math.random() * 360}deg)`;
      layer.appendChild(piece);
      setTimeout(() => piece.remove(), 2200);
    }
  },
};

document.addEventListener("DOMContentLoaded", () => App.init());
