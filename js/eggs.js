/* הפתעות במפת העיר: כמעט כל דבר שנוגעים בו עושה משהו חמוד - זז, משמיע קול או אומר משהו.
   נגיעה בדשא מצמיחה פרח, ונגיעה בשמיים מדליקה כוכב */

const Eggs = {
  lines: {
    sun: ["בוקר טוב!", "אני השמש, חם לי!", "צ'יק צ'ק אני מאירה"],
    cloud: ["טיף טיף טיף", "ירד גשם!"],
    duck: ["גע גע!", "גע גע גע!"],
    birds: ["ציוץ ציוץ!"],
    rainbow: ["קשת בענן!"],
    kite: ["וווווש!", "העפיפון עף!"],
    balloons: ["פופ!", "הבלון עף למעלה!"],
    fountain: ["ספלאש!"],
    plane: ["מטוס! שלום מטוס!"],
  },

  treeSurprises: [
    { emoji: "🍎", say: "תפוח!" },
    { emoji: "🍐", say: "אגס!" },
    { emoji: "🐦", say: "ציפור! ציוץ ציוץ" },
    { emoji: "🐿️", say: "סנאי!" },
    { emoji: "🍊", say: "תפוז!" },
  ],

  benchFriends: [
    { emoji: "🐱", say: "מיאו!" },
    { emoji: "🐶", say: "הב הב!" },
    { emoji: "🐰", say: "שלום, אני ארנב" },
    { emoji: "🐻", say: "שלום, אני דובי" },
  ],

  farmAnimals: {
    "🐑": { say: "מֶה מֶה!", s: () => Sound.melody([500, 470, 500, 470], { gap: 0.08, type: "triangle", vol: 0.12 }) },
    "🐄": { say: "מוּ!", s: () => Sound.tone(200, 0.6, { type: "sawtooth", slideTo: 140, vol: 0.12 }) },
    "🐓": { say: "קוקוריקו!", s: () => Sound.melody([600, 800, 1000, 700], { gap: 0.1, type: "square", vol: 0.08 }) },
    "🐖": { say: "אוינק אוינק!", s: () => Sound.melody([300, 240, 300], { gap: 0.1, type: "sawtooth", vol: 0.1 }) },
    "🐐": { say: "מֶה!", s: () => Sound.melody([450, 430, 450], { gap: 0.09, type: "triangle", vol: 0.12 }) },
  },

  planted: [],

  pick(list) {
    return list[Math.floor(Math.random() * list.length)];
  },

  /* מקום הנגיעה בקואורדינטות של עולם העיר */
  toWorld(e) {
    const world = document.getElementById("cityWorld");
    const svg = document.getElementById("citySvg");
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    return pt.matrixTransform(world.getScreenCTM().inverse());
  },

  /* אמוג'י שקופץ מהנקודה ונעלם; kind קובע איך הוא זז */
  spawn(x, y, emoji, kind = "float", size = 34, life = 1600) {
    const layer = document.getElementById("eggLayer");
    const t = document.createElementNS("http://www.w3.org/2000/svg", "text");
    t.setAttribute("x", x);
    t.setAttribute("y", y);
    t.setAttribute("font-size", size);
    t.setAttribute("text-anchor", "middle");
    t.setAttribute("class", "egg-fx " + kind);
    t.style.setProperty("--dx", (Math.random() * 60 - 30).toFixed(0) + "px");
    t.textContent = emoji;
    layer.appendChild(t);
    if (life) setTimeout(() => t.remove(), life);
    return t;
  },

  /* מפעילים מחדש אנימציה גם אם נוגעים שוב ושוב */
  replay(node, cls) {
    node.classList.remove(cls);
    void node.getBoundingClientRect();
    node.classList.add(cls);
  },

  say(key) {
    Speech.say(this.pick(this.lines[key]));
  },

  hit(name, node, e) {
    const p = this.toWorld(e);
    const body = node.querySelector(".egg-body") || node;

    switch (name) {
      case "sun":
        this.replay(body, "egg-spin");
        Sound.melody(["C5", "E5", "G5", "C6"], { gap: 0.08, type: "sine", vol: 0.13 });
        this.spawn(p.x, p.y - 30, "😎", "float", 40);
        this.say("sun");
        break;

      case "cloud":
        this.replay(body, "egg-squish");
        Sound.play("splash");
        for (let i = 0; i < 7; i++) {
          setTimeout(() => this.spawn(p.x - 40 + i * 13, p.y + 20, "💧", "rain", 20, 1100), i * 70);
        }
        this.say("cloud");
        break;

      case "tree": {
        this.replay(body, "egg-shake");
        Sound.noise(0.35, { freq: 2600, vol: 0.07 });
        const s = this.pick(this.treeSurprises);
        const kind = s.emoji === "🐦" ? "flyaway" : "fall";
        this.spawn(p.x, p.y, s.emoji, kind, 34, 1700);
        Speech.say(s.say);
        if (s.emoji === "🐦") Sound.melody([1800, 2200, 1900, 2400], { gap: 0.07, type: "sine", vol: 0.08 });
        else Sound.play("pop");
        break;
      }

      case "duck":
        this.replay(body, "egg-hop");
        Sound.tone(520, 0.12, { type: "square", slideTo: 380, vol: 0.1 });
        Sound.tone(520, 0.12, { type: "square", slideTo: 380, vol: 0.1, at: 0.18 });
        this.spawn(p.x, p.y, "💦", "float", 26);
        this.say("duck");
        break;

      case "birds":
        Sound.melody([1800, 2200, 1900, 2400, 2000], { gap: 0.07, type: "sine", vol: 0.08 });
        this.spawn(p.x, p.y - 10, "🎵", "float", 26);
        this.say("birds");
        break;

      case "rainbow":
        this.replay(node, "egg-glow");
        Sound.melody(["C5", "D5", "E5", "F5", "G5", "A5", "B5"], { gap: 0.06, type: "sine", vol: 0.1 });
        for (let i = 0; i < 5; i++) setTimeout(() => this.spawn(p.x - 60 + i * 30, p.y, "✨", "float", 24), i * 80);
        this.say("rainbow");
        break;

      case "kite":
        this.replay(body, "egg-loop");
        Sound.play("whoosh");
        this.say("kite");
        break;

      case "balloons":
        this.replay(body, "egg-up");
        Sound.play("pop");
        this.spawn(p.x, p.y, "🎈", "flyup", 36, 2200);
        this.say("balloons");
        break;

      case "flowers":
        this.replay(body, "egg-bloom");
        Sound.play("sparkle");
        this.spawn(p.x, p.y - 10, "🦋", "flyaway", 30, 2000);
        Speech.say("פרפר!");
        break;

      case "lamp": {
        const off = node.classList.toggle("off");
        Sound.play("click");
        Speech.say(off ? "לילה טוב פנס" : "האור דלק!");
        break;
      }

      case "fountain":
        this.replay(node, "splash");
        Sound.play("splash");
        for (let i = 0; i < 4; i++) setTimeout(() => this.spawn(p.x - 30 + i * 20, p.y - 20, "💦", "float", 24), i * 90);
        this.say("fountain");
        break;

      case "bench": {
        const f = this.pick(this.benchFriends);
        this.spawn(p.x, p.y - 6, f.emoji, "wave", 40, 2600);
        Sound.play("jump");
        Speech.say(f.say);
        break;
      }

      case "car":
        this.replay(node, "egg-honk");
        Sound.play("honk");
        this.spawn(p.x, p.y - 20, "📢", "float", 24);
        Speech.say("טוט טוט!");
        break;

      case "plane":
        Sound.tone(300, 0.6, { type: "sawtooth", slideTo: 500, vol: 0.06 });
        this.spawn(p.x, p.y, "👋", "float", 30);
        this.say("plane");
        break;

      case "farm": {
        const a = node.dataset.animal;
        const f = this.farmAnimals[a] || { say: "שלום!", s: () => Sound.play("pop") };
        this.replay(body, "egg-hop");
        f.s();
        Speech.say(f.say);
        this.spawn(p.x, p.y - 30, "💕", "float", 24);
        break;
      }

      case "mycar": {
        const car = App.currentCar();
        this.replay(node, "egg-honk");
        Sound.play("honk");
        this.spawn(p.x, p.y - 20, "⭐", "float", 26);
        Speech.say(car.model ? `${car.latin} ${car.model}` : car.latin, { forceEn: true });
        break;
      }

      case "ground":
        this.ground(p);
        break;
    }
  },

  /* דשא - צומח פרח; שמיים - נדלק כוכב */
  ground(p) {
    if (p.y < 320) {
      this.spawn(p.x, p.y, this.pick(["⭐", "🌟", "✨"]), "twinkle", 30, 1800);
      Sound.tone(1200 + Math.random() * 600, 0.25, { type: "sine", vol: 0.08 });
      return;
    }
    const flower = this.spawn(p.x, p.y + 10, this.pick(["🌷", "🌼", "🌻", "🌸", "🌹"]), "grow", 30, 0);
    this.planted.push(flower);
    if (this.planted.length > 20) this.planted.shift().remove();
    Sound.tone(600 + Math.random() * 400, 0.18, { type: "triangle", slideTo: 1200, vol: 0.1 });
    if (this.planted.length === 1 || Math.random() < 0.25) Speech.say("פרח!");
  },
};
