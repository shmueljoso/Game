/* צלליות: לכל דבר יש צל. גוררים את הדבר לצל שלו - או פשוט נוגעים בצל הנכון.
   חיות, חפצים, כלי תחבורה ומכונית מהמוסך. תפיסה חזותית והתאמת צורות */

const SHADOW_ITEMS = [
  { e: "🐶", n: "כלב" }, { e: "🐱", n: "חתול" }, { e: "🐘", n: "פיל" }, { e: "🦒", n: "ג'ירפה" },
  { e: "🐰", n: "ארנב" }, { e: "🦁", n: "אריה" }, { e: "🐢", n: "צב" }, { e: "🐟", n: "דג" },
  { e: "🦋", n: "פרפר" }, { e: "🐌", n: "חילזון" }, { e: "🦆", n: "ברווז" }, { e: "🐴", n: "סוס" },
  { e: "🐧", n: "פינגווין" }, { e: "🦀", n: "סרטן" }, { e: "🐙", n: "תמנון" },
  { e: "☂️", n: "מטריה" }, { e: "🎈", n: "בלון" }, { e: "⭐", n: "כוכב" }, { e: "🌙", n: "ירח" },
  { e: "🍎", n: "תפוח" }, { e: "🍌", n: "בננה" }, { e: "🔑", n: "מפתח" }, { e: "🎸", n: "גיטרה" },
  { e: "🧸", n: "דובי" }, { e: "⚽", n: "כדור" }, { e: "🌲", n: "עץ" }, { e: "🏠", n: "בית" },
  { e: "🍦", n: "גלידה" }, { e: "👟", n: "נעל" }, { e: "🪁", n: "עפיפון" }, { e: "🌻", n: "חמנייה" },
  { e: "🚁", n: "מסוק" }, { e: "✈️", n: "מטוס" }, { e: "🚲", n: "אופניים" }, { e: "🚂", n: "רכבת" },
  { e: "⛵", n: "סירה" }, { e: "🚜", n: "טרקטור" }, { e: "🚀", n: "טיל" }, { e: "🚒", n: "כבאית" },
];

GAMES.shadows = {
  title: "צלליות 👤",
  hint: "גררו כל דבר לצל שלו",
  say: "בואו נמצא את הצל",

  root: null,
  round: 0,
  rounds: 5,
  target: null,
  locked: false,

  start(root) {
    this.root = root;
    this.round = 0;

    root.innerHTML = `
      <div class="sd-bg"></div>
      <div class="sd-spot"></div>
      <div class="sd-row" id="sdRow"></div>
      <div class="sd-slot" id="sdSlot"></div>
      <div class="progress-dots" id="sdDots"></div>
    `;
    this.nextRound();
  },

  /* שלושה צללים שונים; לפעמים אחד מהם הוא מכונית מצולמת מהמוסך */
  pickThree() {
    const items = shuffle(SHADOW_ITEMS).slice(0, 3).map((it) => ({ key: it.e, emoji: it.e, name: it.n }));
    const photoCars = CARS.filter((c) => c.photo);
    if (photoCars.length && Math.random() < 0.4) {
      const car = photoCars[Math.floor(Math.random() * photoCars.length)];
      items[Math.floor(Math.random() * 3)] = { key: car.id, car, name: car.name };
    }
    return items;
  },

  art(item) {
    return item.car
      ? `<img class="sd-art photo" src="${item.car.photo}" alt="" draggable="false" />`
      : `<span class="sd-art">${item.emoji}</span>`;
  },

  nextRound() {
    if (this.round >= this.rounds) {
      App.finishGame("מצאתם את כל הצלליות");
      return;
    }
    this.locked = false;
    const three = this.pickThree();
    this.target = three[Math.floor(Math.random() * 3)];

    const row = this.root.querySelector("#sdRow");
    row.innerHTML = three
      .map((it, i) => `<button class="sd-shadow" data-key="${it.key}" style="animation-delay:${i * 0.1}s">${this.art(it)}</button>`)
      .join("");
    row.querySelectorAll(".sd-shadow").forEach((s) => s.addEventListener("click", () => this.tryMatch(s)));

    const slot = this.root.querySelector("#sdSlot");
    slot.innerHTML = "";
    const piece = el("span", "sd-piece dropping", this.art(this.target));
    piece.style.left = "50%";
    piece.style.top = "80%";
    slot.appendChild(piece);
    this.piece = piece;
    makeDraggable(piece, this.root, (node, x, y) => {
      const hit = [...this.root.querySelectorAll(".sd-shadow")].find((s) => {
        const r = s.getBoundingClientRect();
        return x > r.left - 20 && x < r.right + 20 && y > r.top - 20 && y < r.bottom + 20;
      });
      return hit ? this.tryMatch(hit) : false;
    });

    this.paintDots();
    Sound.play("blocks");
    App.saySpeech(this.root, `איפה הצל של ה${this.target.name}?`);
  },

  tryMatch(shadow) {
    if (this.locked) return false;
    if (shadow.dataset.key !== this.target.key) {
      shadow.classList.remove("shake");
      void shadow.offsetWidth;
      shadow.classList.add("shake");
      Sound.play("wrong");
      App.saySpeech(this.root, "זה לא הצל, נסו עוד");
      return false;
    }

    this.locked = true;
    shadow.classList.add("lit");
    this.piece.classList.add("gone");
    Sound.play("star");
    const r = shadow.getBoundingClientRect();
    const rootRect = this.root.getBoundingClientRect();
    App.sparkleAt(
      this.root,
      ((r.left + r.width / 2 - rootRect.left) / rootRect.width) * 100,
      ((r.top + r.height / 2 - rootRect.top) / rootRect.height) * 100,
      10
    );
    if (this.target.car) App.saySpeech(this.root, this.target.name, { en: this.target.car.latin, forceEn: true });
    else App.saySpeech(this.root, `${this.target.name}!`);

    this.round++;
    this.paintDots();
    App.later(() => this.nextRound(), 1600);
    return true;
  },

  paintDots() {
    const dots = this.root.querySelector("#sdDots");
    dots.innerHTML = Array.from({ length: this.rounds }, (_, i) =>
      `<span class="dot ${i < this.round ? "on" : ""}">⭐</span>`
    ).join("");
  },

  stop() {},
};
