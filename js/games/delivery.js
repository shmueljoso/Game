/* משלוחים: גוררים כל חבילה לבית בצבע שלה - לימוד צבעים והתאמה */

const DELIVERY_COLORS = [
  { key: "red", name: "אדום", css: "#e8443b" },
  { key: "blue", name: "כחול", css: "#2f6fd0" },
  { key: "yellow", name: "צהוב", css: "#f2b807" },
  { key: "green", name: "ירוק", css: "#3fa85f" },
];

GAMES.delivery = {
  title: "משלוחים 📦",
  hint: "כל חבילה לבית שלה",
  say: "בואו נחלק חבילות",

  root: null,
  delivered: 0,
  total: 5,

  start(root) {
    this.root = root;
    this.delivered = 0;

    const houses = shuffle(DELIVERY_COLORS);
    root.innerHTML = `
      <div class="dl-sky"></div>
      <div class="dl-road"></div>
      <div class="dl-street">
        ${houses
          .map(
            (c) => `<div class="dl-house" data-color="${c.key}">
              <span class="dl-roof" style="--c:${c.css}"></span>
              <span class="dl-door" style="--c:${c.css}"></span>
            </div>`
          )
          .join("")}
      </div>
      <span class="dl-truck">🚚</span>
      <div class="counter-badge" id="dlCounter">0 מתוך ${this.total}</div>
      <div class="parcel-slot" id="dlSlot"></div>
    `;

    this.queue = Array.from({ length: this.total }, () => houses[Math.floor(Math.random() * houses.length)]);
    this.nextParcel();
  },

  nextParcel() {
    if (this.delivered >= this.total) {
      App.finishGame("חילקתם את כל החבילות");
      return;
    }
    const spec = this.queue[this.delivered];
    const slot = this.root.querySelector("#dlSlot");
    slot.innerHTML = "";

    const parcel = el("span", "parcel dropping", "📦");
    parcel.style.setProperty("--c", spec.css);
    parcel.style.left = "50%";
    parcel.style.top = "80%";
    slot.appendChild(parcel);

    Sound.play("blocks");
    App.saySpeech(this.root, `חבילה בצבע ${spec.name}`);

    makeDraggable(parcel, this.root, (node, x, y) => this.drop(node, spec, x, y));
  },

  drop(node, spec, clientX, clientY) {
    const target = [...this.root.querySelectorAll(".dl-house")].find((h) => {
      const r = h.getBoundingClientRect();
      return clientX > r.left - 20 && clientX < r.right + 20 && clientY > r.top - 30 && clientY < r.bottom + 20;
    });
    if (!target) return false;

    if (target.dataset.color !== spec.key) {
      target.classList.add("shake");
      setTimeout(() => target.classList.remove("shake"), 400);
      Sound.play("wrong");
      App.saySpeech(this.root, "זה לא הצבע המתאים");
      return false;
    }

    node.classList.add("delivered");
    target.classList.add("got-mail");
    setTimeout(() => target.classList.remove("got-mail"), 700);
    Sound.play("pop");
    Sound.play("star");
    this.delivered++;
    this.root.querySelector("#dlCounter").textContent = `${this.delivered} מתוך ${this.total}`;

    const r = target.getBoundingClientRect();
    const rootRect = this.root.getBoundingClientRect();
    App.sparkleAt(
      this.root,
      ((r.left + r.width / 2 - rootRect.left) / rootRect.width) * 100,
      ((r.top - rootRect.top) / rootRect.height) * 100,
      7
    );
    Speech.say(spec.name);

    setTimeout(() => this.nextParcel(), 800);
    return true;
  },

  stop() {},
};
