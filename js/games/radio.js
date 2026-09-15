/* הרדיו: בוחרים שיר, לוחצים נגן, והדמות רוקדת. אפשר גם להוסיף שירים מהמכשיר */

GAMES.radio = {
  title: "רדיו 🎧",
  hint: "בחרו שיר",
  say: "בואו נשמע שיר",

  root: null,

  start(root) {
    this.root = root;

    root.innerHTML = `
      <div class="rd-bg"></div>
      <div class="rd-floor"></div>
      <div class="boombox" id="rdBox">
        <div class="bb-top">
          <span class="bb-handle"></span>
        </div>
        <div class="bb-body">
          <span class="bb-speaker left"></span>
          <span class="bb-screen" id="rdTitle">בחרו שיר</span>
          <span class="bb-speaker right"></span>
        </div>
      </div>
      <div class="rd-dancer" id="rdDancer"></div>
      <div class="song-row" id="rdSongs"></div>
      <div class="rd-controls">
        <button class="rd-btn" id="rdPrev">⏮</button>
        <button class="rd-btn big" id="rdPlay">▶</button>
        <button class="rd-btn" id="rdNext">⏭</button>
      </div>
      <button class="mini-btn" id="rdAdd">➕ שיר מהמכשיר</button>
      <input type="file" id="rdFile" accept="audio/*" multiple hidden />
    `;

    renderCompanion(root.querySelector("#rdDancer"), App.profile.companion, "happy");
    this.renderSongs();

    root.querySelector("#rdPlay").addEventListener("click", () => this.toggle());
    root.querySelector("#rdNext").addEventListener("click", () => this.jump(1));
    root.querySelector("#rdPrev").addEventListener("click", () => this.jump(-1));

    const fileInput = root.querySelector("#rdFile");
    root.querySelector("#rdAdd").addEventListener("click", () => fileInput.click());
    fileInput.addEventListener("change", () => {
      const added = Songs.addFiles(fileInput.files);
      this.renderSongs();
      if (added.length) {
        Sound.play("star");
        App.saySpeech(this.root, `נוספו ${added.length} שירים`);
      }
    });

    /* פעימות השיר מזיזות את הרמקולים ואת הדמות */
    Songs.onBeat = () => this.beat();
    this.paint();
  },

  renderSongs() {
    const row = this.root.querySelector("#rdSongs");
    row.innerHTML = "";
    Songs.all().forEach((song, i) => {
      const btn = el("button", "song-card", `<span class="song-emoji">${song.emoji}</span><span class="song-title">${song.title}</span>`);
      btn.addEventListener("click", () => {
        Songs.play(i);
        Sound.play("click");
        this.paint();
        App.saySpeech(this.root, song.title);
      });
      row.appendChild(btn);
    });
    this.paint();
  },

  toggle() {
    if (Songs.playing) {
      Songs.stop();
      Sound.play("click");
    } else {
      Songs.play(Songs.index);
    }
    this.paint();
  },

  jump(dir) {
    Sound.play("click");
    if (dir > 0) Songs.next();
    else Songs.prev();
    this.paint();
  },

  beat() {
    const box = this.root.querySelector("#rdBox");
    const dancer = this.root.querySelector("#rdDancer");
    if (!box) return;
    box.classList.remove("beat");
    dancer.classList.remove("beat");
    void box.offsetWidth;
    box.classList.add("beat");
    dancer.classList.add("beat");

    const note = el("span", "float-note", ["🎵", "🎶", "🎼"][Math.floor(Math.random() * 3)]);
    note.style.left = randBetween(30, 70) + "%";
    this.root.appendChild(note);
    setTimeout(() => note.remove(), 1600);
  },

  paint() {
    const song = Songs.all()[Songs.index];
    const titleEl = this.root.querySelector("#rdTitle");
    const playBtn = this.root.querySelector("#rdPlay");
    if (!titleEl) return;
    titleEl.textContent = song ? song.title : "בחרו שיר";
    playBtn.textContent = Songs.playing ? "⏸" : "▶";
    this.root.classList.toggle("playing", Songs.playing);
    this.root.querySelectorAll(".song-card").forEach((c, i) => {
      c.classList.toggle("active", i === Songs.index && Songs.playing);
    });
  },

  stop() {
    Songs.onBeat = null;
    Songs.stop();
  },
};
