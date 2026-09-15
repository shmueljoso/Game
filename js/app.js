/* ליבת האפליקציה: פרופיל שמור, ניווט בין מסכים, ניהול משחקים ועזרי אנימציה */

const STORAGE_KEY = "kidsGameProfile";

const GAMES = {};

const WORLDS = [
  /* אזור א - עיר הרכבים */
  { id: "fire",    label: "תחנת כבאות", emoji: "🚒", color: "#ff9a9a", roof: "#d14343", style: "tower",  x: 180,  y: 252 },
  { id: "rescue",  label: "בית חולים",  emoji: "🚑", color: "#fdfdff", roof: "#ff7b7b", style: "flat",   x: 500,  y: 248 },
  { id: "traffic", label: "הצומת",      emoji: "🚦", color: "#cdb8ff", roof: "#7b5fd6", style: "flat",   x: 820,  y: 250 },
  { id: "carwash", label: "שטיפת רכב",  emoji: "🚗", color: "#7ec8ff", roof: "#3d7fe0", style: "wash",   x: 180,  y: 458 },
  { id: "garage",  label: "המוסך",      emoji: "🔧", color: "#ffd98a", roof: "#b98330", style: "garage", x: 500,  y: 462 },
  { id: "race",    label: "מסלול מרוץ", emoji: "🏁", color: "#ffd36b", roof: "#e8a020", style: "stand",  x: 820,  y: 454 },

  /* אזור ב - הפארק */
  { id: "zoo",      label: "גן החיות",   emoji: "🦁", color: "#8fd98c", roof: "#3f9a58", style: "arch",    x: 1180, y: 262 },
  { id: "market",   label: "סופרמרקט",   emoji: "🛒", color: "#ffd0e0", roof: "#e0568a", style: "shop",    x: 1500, y: 254 },
  { id: "music",    label: "תזמורת",     emoji: "🥁", color: "#b9a6ff", roof: "#6b4fd0", style: "theater", x: 1820, y: 252 },
  { id: "shapes",   label: "אתר בנייה",  emoji: "🏗️", color: "#ffc98b", roof: "#c97b2e", style: "site",    x: 1180, y: 456 },
  { id: "delivery", label: "משלוחים",    emoji: "📦", color: "#a8d8ff", roof: "#3f7bbf", style: "depot",   x: 1500, y: 458 },
  { id: "puzzle",   label: "פאזל",       emoji: "🧩", color: "#ffe08a", roof: "#e08a2e", style: "toy",     x: 1820, y: 458 },
];

const COINS_PER_WIN = 3;

const App = {
  profile: null,
  currentGame: null,

  /* ---------- פרופיל ---------- */
  loadProfile() {
    let saved = null;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      saved = raw ? JSON.parse(raw) : null;
    } catch (e) {
      saved = null;
    }
    if (!saved) return null;

    if (saved.companion === "hevhev") saved.companion = "havhav";
    saved.stars = saved.stars || 0;
    saved.coins = saved.coins || 0;
    saved.done = saved.done || {};
    saved.cars = saved.cars && saved.cars.length ? saved.cars : ["toyota"];
    saved.car = saved.cars.includes(saved.car) ? saved.car : saved.cars[0];
    return saved;
  },

  saveProfile() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.profile));
    } catch (e) {
      /* אחסון לא זמין - המשחק ימשיך לעבוד בלי שמירה */
    }
  },

  setCompanion(key) {
    this.profile = this.profile || { stars: 0, coins: 0, done: {}, cars: ["toyota"], car: "toyota" };
    this.profile.companion = key;
    this.saveProfile();
  },

  setName(name) {
    this.profile.name = (name || "").trim();
    this.saveProfile();
  },

  addStar(gameId) {
    this.profile.stars = (this.profile.stars || 0) + 1;
    this.profile.done = this.profile.done || {};
    this.profile.done[gameId] = (this.profile.done[gameId] || 0) + 1;
    this.profile.coins = (this.profile.coins || 0) + COINS_PER_WIN;
    this.saveProfile();
    this.paintProfile();
  },

  buyCar(id) {
    const car = getCar(id);
    if (this.profile.cars.includes(id)) return "owned";
    if ((this.profile.coins || 0) < car.price) return "poor";
    this.profile.coins -= car.price;
    this.profile.cars.push(id);
    this.profile.car = id;
    this.saveProfile();
    this.paintProfile();
    return "bought";
  },

  selectCar(id) {
    if (!this.profile.cars.includes(id)) return false;
    this.profile.car = id;
    this.saveProfile();
    return true;
  },

  currentCar() {
    return getCar(this.profile && this.profile.car);
  },

  /* ---------- ניווט ---------- */
  showScreen(name) {
    document.querySelectorAll(".screen").forEach((s) => s.classList.add("hidden"));
    document.getElementById(`screen-${name}`).classList.remove("hidden");
  },

  paintProfile() {
    if (!this.profile) return;
    ["cityMascot", "gameMascot", "nameMascot"].forEach((id) => {
      const elm = document.getElementById(id);
      if (elm) renderCompanion(elm, this.profile.companion, "idle");
    });
    const nameEl = document.getElementById("playerName");
    if (nameEl) nameEl.textContent = this.profile.name || "שלום!";
    document.querySelectorAll(".js-stars").forEach((n) => (n.textContent = this.profile.stars || 0));
    document.querySelectorAll(".js-coins").forEach((n) => (n.textContent = this.profile.coins || 0));
  },

  goCity() {
    this.stopGame();
    this.showScreen("city");
    this.paintProfile();
    City.refreshStars();
    Sound.startMusic();
  },

  openGame(id) {
    const game = GAMES[id];
    if (!game) return;
    this.stopGame();
    this.currentGame = id;
    document.getElementById("gameTitle").textContent = game.title;
    document.getElementById("gameHint").textContent = game.hint || "";
    this.showScreen("game");
    this.paintProfile();

    /* אלמנט חדש בכל פתיחה - כך מאזיני המגע של המשחק הקודם נעלמים איתו */
    const root = document.createElement("div");
    root.id = "gameRoot";
    root.className = "game-root " + id;
    document.getElementById("gameRoot").replaceWith(root);
    Sound.play("whoosh");
    game.start(root);
    if (game.say) Speech.say(game.say);
  },

  stopGame() {
    if (this.currentGame && GAMES[this.currentGame] && GAMES[this.currentGame].stop) {
      GAMES[this.currentGame].stop();
    }
    document.getElementById("winOverlay").classList.add("hidden");
    this.currentGame = null;
  },

  replayGame() {
    const id = this.currentGame;
    if (id) this.openGame(id);
  },

  /* ---------- סיום משחק ---------- */
  finishGame(text, opts = {}) {
    const id = this.currentGame;
    if (id) this.addStar(id);
    const name = this.profile && this.profile.name ? ` ${this.profile.name}` : "";
    const msg = (text || "כל הכבוד") + name + "!";
    document.getElementById("winText").textContent = msg;
    document.getElementById("winStars").textContent = "⭐".repeat(opts.stars || 3);
    document.getElementById("winCoins").textContent = `+${COINS_PER_WIN} 🪙`;
    renderCompanion(document.getElementById("winMascot"), this.profile.companion, "happy");
    document.getElementById("winOverlay").classList.remove("hidden");
    this.confetti();
    Sound.play("win");
    Speech.say(msg);
  },

  /* ---------- אפקטים ---------- */
  confetti(count = 46) {
    const layer = document.getElementById("confettiLayer");
    const colors = ["#ff6b6b", "#ffd93d", "#6bcB77", "#4d96ff", "#ff8fab", "#b085ff"];
    for (let i = 0; i < count; i++) {
      const piece = document.createElement("span");
      piece.className = "confetti-piece";
      piece.style.left = Math.random() * 100 + "vw";
      piece.style.background = colors[i % colors.length];
      piece.style.animationDelay = Math.random() * 0.5 + "s";
      piece.style.setProperty("--spin", Math.random() * 720 - 360 + "deg");
      layer.appendChild(piece);
      setTimeout(() => piece.remove(), 2600);
    }
  },

  /* ניצוצות בנקודה מסוימת בתוך אלמנט הורה */
  sparkleAt(parent, xPct, yPct, count = 6) {
    for (let i = 0; i < count; i++) {
      const s = document.createElement("span");
      s.className = "spark";
      s.style.left = xPct + "%";
      s.style.top = yPct + "%";
      s.style.setProperty("--dx", (Math.random() * 80 - 40) + "px");
      s.style.setProperty("--dy", (-Math.random() * 70 - 20) + "px");
      s.style.animationDelay = Math.random() * 0.15 + "s";
      parent.appendChild(s);
      setTimeout(() => s.remove(), 900);
    }
  },

  /* מספר קופץ - משמש לספירה בקול ובעין */
  popNumber(parent, xPct, yPct, value) {
    const n = document.createElement("span");
    n.className = "pop-number";
    n.textContent = value;
    n.style.left = xPct + "%";
    n.style.top = yPct + "%";
    parent.appendChild(n);
    setTimeout(() => n.remove(), 1100);
  },

  /* בועת דיבור של הדמות המלווה בתוך משחק */
  saySpeech(parent, text) {
    let bubble = parent.querySelector(".speech-bubble");
    if (!bubble) {
      bubble = document.createElement("div");
      bubble.className = "speech-bubble";
      parent.appendChild(bubble);
    }
    bubble.textContent = text;
    bubble.classList.remove("pulse");
    void bubble.offsetWidth;
    bubble.classList.add("pulse");
    Speech.say(text);
  },
};

/* ---------- עזרי DOM כלליים למשחקים ---------- */

function el(tag, className, html) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (html !== undefined) node.innerHTML = html;
  return node;
}

function centerOf(node) {
  const r = node.getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
}

function distance(ax, ay, bx, by) {
  return Math.hypot(ax - bx, ay - by);
}

function randBetween(min, max) {
  return Math.random() * (max - min) + min;
}

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* מעקב אחרי אצבע/עכבר בתוך אזור משחק, עם ניקוי נוח */
function trackPointer(root, onMove, onDown, onUp) {
  const handler = (e) => {
    const r = root.getBoundingClientRect();
    onMove(e.clientX, e.clientY, ((e.clientX - r.left) / r.width) * 100, ((e.clientY - r.top) / r.height) * 100);
  };
  root.addEventListener("pointermove", handler);
  root.addEventListener("pointerdown", (e) => {
    if (onDown) onDown(e);
    handler(e);
  });
  root.addEventListener("pointerup", (e) => onUp && onUp(e));
  root.addEventListener("pointerleave", (e) => onUp && onUp(e));
}

/* גרירה של אלמנט בודד בתוך אזור המשחק */
function makeDraggable(node, root, onDrop) {
  let dragging = false;
  let startRect = null;

  /* האחוזים של left/top נמדדים מול ההורה הממוקם של האלמנט, לא מול כל הבמה */
  const moveTo = (clientX, clientY) => {
    const r = (node.offsetParent || root).getBoundingClientRect();
    node.style.left = ((clientX - r.left) / r.width) * 100 + "%";
    node.style.top = ((clientY - r.top) / r.height) * 100 + "%";
  };

  node.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    dragging = true;
    startRect = { left: node.style.left, top: node.style.top };
    node.classList.add("dragging");
    node.setPointerCapture(e.pointerId);
    Sound.play("click");
  });

  node.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    moveTo(e.clientX, e.clientY);
  });

  const end = (e) => {
    if (!dragging) return;
    dragging = false;
    node.classList.remove("dragging");
    const accepted = onDrop(node, e.clientX, e.clientY);
    if (!accepted && startRect) {
      node.style.left = startRect.left;
      node.style.top = startRect.top;
    }
  };

  node.addEventListener("pointerup", end);
  node.addEventListener("pointercancel", end);
}
