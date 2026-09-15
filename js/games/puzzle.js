/* פאזל: מרכיבים מחדש את הרכב שבחרתם במוסך - תפיסה מרחבית והתמדה */

GAMES.puzzle = {
  title: "פאזל 🧩",
  hint: "הרכיבו את הרכב",
  say: "בואו נרכיב את הרכב",

  root: null,
  placed: 0,

  start(root) {
    this.root = root;
    this.placed = 0;
    const car = App.currentCar();
    const art = carSvg(car);

    root.innerHTML = `
      <div class="pz-bg"></div>
      <div class="pz-board" id="pzBoard">
        <div class="pz-ghost">${art}</div>
        ${[0, 1, 2, 3]
          .map(
            (i) => `<div class="pz-slot" data-idx="${i}"
                      style="left:${(i % 2) * 50}%; top:${Math.floor(i / 2) * 50}%"></div>`
          )
          .join("")}
      </div>
      <div class="counter-badge" id="pzCounter">0 מתוך 4</div>
      <button class="mini-btn" id="pzSwap">🔧 רכב אחר</button>
      <div class="pz-tray" id="pzTray"></div>
    `;

    root.querySelector("#pzSwap").addEventListener("click", (e) => {
      e.stopPropagation();
      Sound.play("click");
      Garage.open();
    });

    const tray = root.querySelector("#pzTray");
    shuffle([0, 1, 2, 3]).forEach((idx, slot) => {
      const piece = el("span", "pz-piece");
      piece.dataset.idx = idx;
      piece.innerHTML = `<span class="pz-art" style="left:${-(idx % 2) * 100}%; top:${-Math.floor(idx / 2) * 100}%">${art}</span>`;
      piece.style.left = 14 + slot * 24 + "%";
      piece.style.top = "74%";
      tray.appendChild(piece);
      makeDraggable(piece, root, (node, x, y) => this.drop(node, x, y));
    });

    App.saySpeech(root, car.name, { en: car.latin, say: car.say });
  },

  drop(node, clientX, clientY) {
    const idx = node.dataset.idx;
    const slot = this.root.querySelector(`.pz-slot[data-idx="${idx}"]`);
    const r = slot.getBoundingClientRect();
    const near =
      clientX > r.left - 40 && clientX < r.right + 40 && clientY > r.top - 40 && clientY < r.bottom + 40;

    if (!near) {
      Sound.play("wrong");
      return false;
    }

    /* מצמידים בדיוק למקום שלו על הלוח */
    const rootRect = this.root.getBoundingClientRect();
    node.style.left = ((r.left + r.width / 2 - rootRect.left) / rootRect.width) * 100 + "%";
    node.style.top = ((r.top + r.height / 2 - rootRect.top) / rootRect.height) * 100 + "%";
    node.classList.add("locked");
    node.style.pointerEvents = "none";
    slot.classList.add("filled");

    this.placed++;
    Sound.play("pop");
    Sound.play("sparkle");
    this.root.querySelector("#pzCounter").textContent = `${this.placed} מתוך 4`;
    App.sparkleAt(
      this.root,
      ((r.left + r.width / 2 - rootRect.left) / rootRect.width) * 100,
      ((r.top + r.height / 2 - rootRect.top) / rootRect.height) * 100,
      6
    );

    if (this.placed === 4) {
      this.root.querySelector("#pzBoard").classList.add("solved");
      setTimeout(() => App.finishGame("הרכבתם את הרכב"), 1000);
    }
    return true;
  },

  stop() {},
};
