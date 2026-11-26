/* טיימר הורים: ההורה בוחר כמה דקות משחקים, שעון חמוד סופר למטה בראש המסך,
   ובסוף מסך "זהו להיום" שרק מבוגר יכול לסגור (בלחיצה ארוכה) */

const TIMER_KEY = "kidsGameTimer";
const TIMER_CHOICES = [1, 3, 5, 10, 15];
const HOLD_MS = 2000;

const PlayTimer = {
  endsAt: 0,
  total: 0,
  tick: null,
  warned: false,

  init() {
    this.btn = document.getElementById("timerBtn");
    this.chip = document.getElementById("timerChip");
    this.panel = document.getElementById("timerPanel");
    this.endScreen = document.getElementById("timerEnd");

    document.getElementById("timerChoices").innerHTML = TIMER_CHOICES.map(
      (m) => `<button class="timer-choice" data-min="${m}"><b>${m}</b><span>${m === 1 ? "דקה" : "דקות"}</span></button>`
    ).join("");
    this.panel.querySelectorAll(".timer-choice").forEach((b) =>
      b.addEventListener("click", () => this.start(Number(b.dataset.min)))
    );
    document.getElementById("timerOff").addEventListener("click", () => this.cancel());
    document.getElementById("timerClose").addEventListener("click", () => this.closePanel());

    /* כשהטיימר רץ - רק לחיצה ארוכה פותחת את ההגדרות, כדי שהילד לא יבטל אותו */
    this.holdable(this.btn, () => this.openPanel(), () => !this.running());
    this.holdable(document.getElementById("timerEndBtn"), () => this.dismissEnd(), () => false);

    try {
      const saved = JSON.parse(localStorage.getItem(TIMER_KEY) || "null");
      if (saved && saved.endsAt > Date.now()) {
        this.endsAt = saved.endsAt;
        this.total = saved.total;
        this.run();
      }
    } catch (e) {
      /* אין טיימר שמור */
    }
  },

  running() {
    return this.endsAt > Date.now();
  },

  /* כפתור שנפתח בנגיעה רגילה כש-quick() מחזיר true, ואחרת רק אחרי החזקה */
  holdable(node, action, quick) {
    let timer = null;
    const end = () => {
      clearTimeout(timer);
      node.classList.remove("holding");
    };
    node.addEventListener("pointerdown", (e) => {
      e.preventDefault();
      if (quick()) {
        Sound.play("click");
        action();
        return;
      }
      node.classList.add("holding");
      Sound.play("click");
      timer = setTimeout(() => {
        end();
        action();
      }, HOLD_MS);
    });
    ["pointerup", "pointerleave", "pointercancel"].forEach((ev) => node.addEventListener(ev, end));
  },

  openPanel() {
    this.panel.classList.remove("hidden");
    document.getElementById("timerOff").classList.toggle("hidden", !this.running());
    Sound.play("pop");
  },

  closePanel() {
    this.panel.classList.add("hidden");
  },

  start(minutes) {
    this.total = minutes * 60000;
    this.endsAt = Date.now() + this.total;
    this.save();
    this.closePanel();
    this.run();
    Sound.play("star");
    Speech.say(minutes === 1 ? "יש לנו דקה אחת לשחק!" : `יש לנו ${minutes} דקות לשחק!`);
  },

  cancel() {
    this.endsAt = 0;
    this.save();
    this.stopTick();
    this.closePanel();
    Sound.play("pop");
  },

  save() {
    try {
      localStorage.setItem(TIMER_KEY, JSON.stringify({ endsAt: this.endsAt, total: this.total }));
    } catch (e) {
      /* בלי שמירה */
    }
  },

  run() {
    this.warned = this.endsAt - Date.now() <= 60000;
    document.body.classList.add("timer-on");
    this.chip.classList.remove("hidden");
    clearInterval(this.tick);
    this.tick = setInterval(() => this.update(), 250);
    this.update();
  },

  stopTick() {
    clearInterval(this.tick);
    this.tick = null;
    document.body.classList.remove("timer-on");
    this.chip.classList.add("hidden");
    this.chip.classList.remove("last-minute", "last-seconds");
  },

  update() {
    const left = Math.max(0, this.endsAt - Date.now());
    const sec = Math.ceil(left / 1000);
    this.chip.querySelector(".tc-time").textContent = `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, "0")}`;
    this.chip.style.setProperty("--left", ((left / this.total) * 100).toFixed(1) + "%");
    this.chip.classList.toggle("last-minute", sec <= 60);
    this.chip.classList.toggle("last-seconds", sec <= 10);

    if (!this.warned && sec <= 60) {
      this.warned = true;
      Sound.melody(["G5", "E5", "G5"], { gap: 0.14, type: "sine", vol: 0.14 });
      Speech.say("עוד דקה וזהו!");
    }
    if (left <= 0) this.finish();
  },

  /* נגמר הזמן: עוצרים הכול ומראים מסך לילה טוב */
  finish() {
    this.stopTick();
    this.endsAt = 0;
    this.save();
    App.goCity();
    Sound.stopMusic();
    if (typeof Songs !== "undefined" && Songs.playing) Songs.stop();

    const name = App.profile && App.profile.name ? ` ${App.profile.name}` : "";
    document.getElementById("timerEndText").textContent = `נתראה בפעם הבאה${name}!`;
    renderCompanion(document.getElementById("timerEndMascot"), App.profile.companion, "happy");
    this.endScreen.classList.remove("hidden");
    Sound.melody(["C6", "G5", "E5", "C5"], { gap: 0.28, type: "sine", vol: 0.14 });
    setTimeout(() => Speech.say(`זהו להיום! נתראה בפעם הבאה${name}`), 600);
  },

  dismissEnd() {
    this.endScreen.classList.add("hidden");
    Sound.play("pop");
    Sound.startMusic();
  },
};
