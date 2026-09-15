/* מנוע סאונד: כל הצלילים נוצרים בזמן אמת עם Web Audio API - בלי קבצים חיצוניים */

const NOTES = {
  C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.0, A4: 440.0, B4: 493.88,
  C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99, A5: 880.0, B5: 987.77,
  C6: 1046.5,
};

const Sound = {
  ctx: null,
  master: null,
  musicGain: null,
  sfxOn: true,
  musicOn: true,
  musicTimer: null,
  musicStep: 0,

  init() {
    if (this.ctx) {
      if (this.ctx.state === "suspended") this.ctx.resume();
      return;
    }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    this.ctx = new AC();
    this.master = this.ctx.createGain();
    this.master.gain.value = 0.85;
    this.master.connect(this.ctx.destination);
    this.musicGain = this.ctx.createGain();
    this.musicGain.gain.value = 0.045;
    this.musicGain.connect(this.master);
  },

  tone(freq, dur = 0.2, opts = {}) {
    if (!this.ctx || !this.sfxOn) return;
    const { type = "sine", vol = 0.16, at = 0, slideTo = 0, dest = null } = opts;
    const t0 = this.ctx.currentTime + at;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(Math.max(50, slideTo), t0 + dur);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(vol, t0 + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(g);
    g.connect(dest || this.master);
    osc.start(t0);
    osc.stop(t0 + dur + 0.05);
  },

  noise(dur = 0.3, opts = {}) {
    if (!this.ctx || !this.sfxOn) return;
    const { vol = 0.12, at = 0, freq = 1400, q = 0.7 } = opts;
    const t0 = this.ctx.currentTime + at;
    const frames = Math.floor(this.ctx.sampleRate * dur);
    const buf = this.ctx.createBuffer(1, frames, this.ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < frames; i++) data[i] = Math.random() * 2 - 1;
    const src = this.ctx.createBufferSource();
    src.buffer = buf;
    const filter = this.ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = freq;
    filter.Q.value = q;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(vol, t0);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    src.connect(filter);
    filter.connect(g);
    g.connect(this.master);
    src.start(t0);
    src.stop(t0 + dur);
  },

  melody(seq, opts = {}) {
    const { gap = 0.15, type = "triangle", vol = 0.17 } = opts;
    seq.forEach((n, i) => {
      const f = typeof n === "string" ? NOTES[n] : n;
      if (f) this.tone(f, gap * 0.95, { type, vol, at: i * gap });
    });
  },

  play(name) {
    if (!this.ctx) this.init();
    if (!this.ctx || !this.sfxOn) return;
    switch (name) {
      case "pop":
        this.tone(560, 0.14, { type: "sine", slideTo: 1100, vol: 0.18 });
        break;
      case "squeak":
        this.tone(900, 0.12, { type: "sine", slideTo: 1500, vol: 0.12 });
        break;
      case "splash":
        this.noise(0.35, { freq: 900, vol: 0.14 });
        break;
      case "water":
        this.noise(0.18, { freq: 2200, vol: 0.07 });
        break;
      case "sparkle":
        this.melody(["G5", "C6"], { gap: 0.08, type: "sine", vol: 0.12 });
        break;
      case "click":
        this.tone(420, 0.07, { type: "square", vol: 0.09 });
        break;
      case "engine":
        this.tone(140, 0.12, { type: "sawtooth", slideTo: 190, vol: 0.09 });
        break;
      case "honk":
        this.tone(330, 0.18, { type: "square", vol: 0.12 });
        this.tone(440, 0.18, { type: "square", vol: 0.1, at: 0.02 });
        break;
      case "siren":
        for (let i = 0; i < 3; i++) {
          this.tone(700, 0.25, { type: "sine", vol: 0.1, at: i * 0.5 });
          this.tone(520, 0.25, { type: "sine", vol: 0.1, at: i * 0.5 + 0.25 });
        }
        break;
      case "beep":
        this.tone(660, 0.16, { type: "square", vol: 0.13 });
        break;
      case "go":
        this.tone(990, 0.35, { type: "square", vol: 0.15 });
        break;
      case "wrong":
        this.tone(220, 0.22, { type: "sawtooth", slideTo: 150, vol: 0.1 });
        break;
      case "star":
        this.melody(["E5", "G5", "C6"], { gap: 0.1, vol: 0.15 });
        break;
      case "win":
        this.melody(["C5", "E5", "G5", "C6", "G5", "C6"], { gap: 0.14, vol: 0.18 });
        break;
      case "whoosh":
        this.noise(0.3, { freq: 600, vol: 0.09 });
        break;
      case "steam":
        this.noise(0.4, { freq: 3000, vol: 0.08 });
        break;
      case "crowd":
        this.noise(0.8, { freq: 500, vol: 0.06, q: 0.4 });
        break;
      case "jump":
        this.tone(400, 0.16, { type: "triangle", slideTo: 800, vol: 0.13 });
        break;
      case "roar":
        this.tone(110, 0.5, { type: "sawtooth", slideTo: 70, vol: 0.12 });
        break;
      case "blocks":
        this.tone(300, 0.1, { type: "square", vol: 0.1 });
        this.tone(200, 0.12, { type: "square", vol: 0.08, at: 0.06 });
        break;
    }
  },

  /* מנגינת רקע עליזה בלולאה */
  MUSIC: ["C5", "E5", "G5", "E5", "F5", "A5", "G5", "E5", "D5", "F5", "A5", "F5", "C5", "E5", "G5", "C5"],

  startMusic() {
    /* כששיר מתנגן ברדיו הוא תופס את מקום המוזיקה - לא מנגנים את שניהם יחד */
    if (typeof Songs !== "undefined" && Songs.playing) return;
    if (!this.ctx) this.init();
    if (!this.ctx || !this.musicOn || this.musicTimer) return;
    const beat = 0.34;
    const playBar = () => {
      if (!this.musicOn || !this.ctx) return;
      for (let i = 0; i < 4; i++) {
        const note = NOTES[this.MUSIC[this.musicStep % this.MUSIC.length]];
        this.tone(note, beat * 0.8, {
          type: "triangle", vol: 0.5, at: i * beat, dest: this.musicGain,
        });
        if (i % 2 === 0) {
          this.tone(note / 2, beat * 0.9, {
            type: "sine", vol: 0.35, at: i * beat, dest: this.musicGain,
          });
        }
        this.musicStep++;
      }
    };
    playBar();
    this.musicTimer = setInterval(playBar, beat * 4 * 1000);
  },

  stopMusic() {
    clearInterval(this.musicTimer);
    this.musicTimer = null;
  },

  toggleMusic() {
    this.musicOn = !this.musicOn;
    if (this.musicOn) this.startMusic();
    else this.stopMusic();
    return this.musicOn;
  },
};

/* דיבור: מעדיפים קול עברי. אם במכשיר יש רק קול אנגלי, אומרים את הגרסה הלועזית
   (למשל Hav Hav במקום הבהב) כדי שההגייה תהיה נכונה ולא אותיות מבולבלות */
const Speech = {
  voices: { he: null, en: null },

  init() {
    if (!("speechSynthesis" in window)) return;
    const pick = () => {
      try {
        const list = window.speechSynthesis.getVoices() || [];
        const byLang = (prefix) => list.find((v) => (v.lang || "").toLowerCase().startsWith(prefix)) || null;
        this.voices.he = byLang("he");
        this.voices.en = byLang("en");
      } catch (e) {
        /* אין קולות זמינים - פשוט לא מדברים */
      }
    };
    pick();
    window.speechSynthesis.onvoiceschanged = pick;
  },

  /* text - עברית. opts.en - איך לומר את זה באנגלית, כשזה השם הלועזי של המותג או הדמות.
     opts.forceEn - תמיד להגות באנגלית (לשמות מותגים כמו טויוטה/BYD), גם כשיש קול עברי -
     כי שם מותג לועזי נשמע נכון רק בהגייה אנגלית, לא משנה איזה קול המכשיר מעדיף */
  say(text, opts = {}) {
    if (!Sound.sfxOn) return;

    let voice, phrase;
    if (opts.forceEn && this.voices.en) {
      voice = this.voices.en;
      phrase = opts.en || text;
    } else {
      const hebrew = this.voices.he;
      voice = hebrew || this.voices.en;
      phrase = hebrew ? text : opts.en || text;
    }
    if (!voice || !phrase) return;

    try {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(phrase);
      u.voice = voice;
      u.lang = voice.lang;
      u.rate = 0.9;
      u.pitch = 1.2;
      window.speechSynthesis.speak(u);
    } catch (e) {
      /* אם הדפדפן לא תומך פשוט ממשיכים בלי דיבור */
    }
  },
};
