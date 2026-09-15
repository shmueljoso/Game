/* הצומת: נוסעים רק כשירוק ועוצרים באדום - לימוד צבעים ובטיחות בדרכים */

GAMES.traffic = {
  title: "רמזור 🚦",
  hint: "סעו רק בירוק!",
  say: "נוסעים רק כשהרמזור ירוק",

  root: null,
  light: "red",
  steps: 0,
  goal: 5,
  timer: null,

  start(root) {
    this.root = root;
    this.steps = 0;
    this.light = "red";

    root.innerHTML = `
      <div class="tr-sky"></div>
      <div class="tr-road">
        <div class="tr-dashes"></div>
      </div>
      <div class="tr-sidewalk"></div>
      <div class="traffic-light" id="trLight">
        <span class="lamp red"></span>
        <span class="lamp yellow"></span>
        <span class="lamp green"></span>
      </div>
      <span class="tr-walker" id="trWalker">🧸</span>
      <span class="tr-house">🏫</span>
      <span class="tr-car" id="trCar">🚗</span>
      <div class="counter-badge" id="trCounter">0 מתוך ${this.goal}</div>
      <button class="tap-btn" id="trGo">סעו! 🚗</button>
      <div class="light-word" id="trWord">אדום</div>
    `;

    root.querySelector("#trGo").addEventListener("pointerdown", () => this.tryGo());
    this.cycle();
  },

  cycle() {
    const order = [
      { color: "red", word: "אדום", ms: 2600 },
      { color: "green", word: "ירוק", ms: 3000 },
      { color: "yellow", word: "צהוב", ms: 900 },
    ];
    let i = 0;
    const step = () => {
      const now = order[i % order.length];
      this.light = now.color;
      const lightBox = this.root.querySelector("#trLight");
      lightBox.className = "traffic-light on-" + now.color;
      const word = this.root.querySelector("#trWord");
      word.textContent = now.word;
      word.className = "light-word w-" + now.color;
      Sound.play("click");
      Speech.say(now.word);
      this.root.querySelector("#trWalker").classList.toggle("waving", now.color === "red");
      i++;
      this.timer = setTimeout(step, now.ms);
    };
    step();
  },

  tryGo() {
    if (this.steps >= this.goal) return;
    const car = this.root.querySelector("#trCar");

    if (this.light !== "green") {
      car.classList.remove("shake");
      void car.offsetWidth;
      car.classList.add("shake");
      Sound.play("wrong");
      App.saySpeech(this.root, this.light === "red" ? "אדום - עוצרים!" : "צהוב - מחכים!");
      return;
    }

    this.steps++;
    car.style.left = 6 + (this.steps / this.goal) * 74 + "%";
    car.classList.remove("boost");
    void car.offsetWidth;
    car.classList.add("boost");
    Sound.play("engine");
    Sound.tone(500 + this.steps * 60, 0.18, { type: "triangle", vol: 0.12 });
    this.root.querySelector("#trCounter").textContent = `${this.steps} מתוך ${this.goal}`;

    if (this.steps === 1) App.saySpeech(this.root, "ירוק - אפשר לנסוע!");
    if (this.steps >= this.goal) {
      clearTimeout(this.timer);
      Sound.play("honk");
      setTimeout(() => App.finishGame("הגעתם בבטחה"), 800);
    }
  },

  stop() {
    clearTimeout(this.timer);
  },
};
