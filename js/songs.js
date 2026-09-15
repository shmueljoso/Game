/* נגן השירים: מנגינות ילדים קלאסיות (נחלת הכלל) שמנוגנות בזמן אמת בסינתיסייזר,
   ואפשר גם להוסיף קבצי מוזיקה משלכם - ראו songs/README.md */

const LOW = { C3: 130.81, D3: 146.83, E3: 164.81, F3: 174.61, G3: 196.0, A3: 220.0, B3: 246.94 };

/* כל שיר: [תו, מספר פעימות]. null = שקט */
const SONG_LIST = [
  {
    title: "כוכב קטן",
    emoji: "⭐",
    beat: 0.42,
    notes: [
      ["C4",1],["C4",1],["G4",1],["G4",1],["A4",1],["A4",1],["G4",2],
      ["F4",1],["F4",1],["E4",1],["E4",1],["D4",1],["D4",1],["C4",2],
      ["G4",1],["G4",1],["F4",1],["F4",1],["E4",1],["E4",1],["D4",2],
      ["G4",1],["G4",1],["F4",1],["F4",1],["E4",1],["E4",1],["D4",2],
      ["C4",1],["C4",1],["G4",1],["G4",1],["A4",1],["A4",1],["G4",2],
      ["F4",1],["F4",1],["E4",1],["E4",1],["D4",1],["D4",1],["C4",2],[null,1],
    ],
  },
  {
    title: "אחינו יעקב",
    emoji: "🔔",
    beat: 0.38,
    notes: [
      ["C4",1],["D4",1],["E4",1],["C4",1],["C4",1],["D4",1],["E4",1],["C4",1],
      ["E4",1],["F4",1],["G4",2],["E4",1],["F4",1],["G4",2],
      ["G4",0.5],["A4",0.5],["G4",0.5],["F4",0.5],["E4",1],["C4",1],
      ["G4",0.5],["A4",0.5],["G4",0.5],["F4",0.5],["E4",1],["C4",1],
      ["C4",1],["G3",1],["C4",2],["C4",1],["G3",1],["C4",2],[null,1],
    ],
  },
  {
    title: "לדוד משה",
    emoji: "🐄",
    beat: 0.36,
    notes: [
      ["G4",1],["G4",1],["G4",1],["D4",1],["E4",1],["E4",1],["D4",2],
      ["B4",1],["B4",1],["A4",1],["A4",1],["G4",2],[null,1],
      ["D4",1],["G4",1],["G4",1],["G4",1],["D4",1],["E4",1],["E4",1],["D4",2],
      ["B4",1],["B4",1],["A4",1],["A4",1],["G4",2],[null,1],
    ],
  },
  {
    title: "הגלגלים בָּאוטובוס",
    emoji: "🚌",
    beat: 0.34,
    notes: [
      ["C4",1],["F4",1],["F4",1],["F4",1],["F4",1],["A4",1],["C5",1],["A4",1],["F4",2],
      ["G4",1],["A4",1],["G4",1],["F4",1],["G4",2],["C4",1],
      ["C4",1],["F4",1],["F4",1],["F4",1],["F4",1],["A4",1],["C5",1],["A4",1],["F4",2],
      ["G4",1],["C4",1],["C4",1],["F4",3],[null,1],
    ],
  },
  {
    title: "לכבשה הקטנה",
    emoji: "🐑",
    beat: 0.36,
    notes: [
      ["E4",1],["D4",1],["C4",1],["D4",1],["E4",1],["E4",1],["E4",2],
      ["D4",1],["D4",1],["D4",2],["E4",1],["G4",1],["G4",2],
      ["E4",1],["D4",1],["C4",1],["D4",1],["E4",1],["E4",1],["E4",1],["E4",1],
      ["D4",1],["D4",1],["E4",1],["D4",1],["C4",3],[null,1],
    ],
  },
  {
    title: "גשר לונדון",
    emoji: "🌉",
    beat: 0.34,
    notes: [
      ["G4",1.5],["A4",0.5],["G4",1],["F4",1],["E4",1],["F4",1],["G4",2],
      ["D4",1],["E4",1],["F4",2],["E4",1],["F4",1],["G4",2],
      ["G4",1.5],["A4",0.5],["G4",1],["F4",1],["E4",1],["F4",1],["G4",2],
      ["D4",2],["G4",1],["E4",1],["C4",3],[null,1],
    ],
  },
];

const Songs = {
  playing: false,
  index: 0,
  timer: null,
  step: 0,
  audio: null,
  extra: [],
  onBeat: null,

  all() {
    return SONG_LIST.concat(this.extra);
  },

  /* קבצי מוזיקה שהמשפחה הוסיפה לתיקיית songs */
  async loadFolder() {
    try {
      const res = await fetch("songs/songs.json", { cache: "no-store" });
      if (!res.ok) return;
      const list = await res.json();
      list.forEach((s) => {
        if (s && s.file) this.extra.push({ title: s.title || s.file, emoji: s.emoji || "🎵", file: "songs/" + s.file });
      });
    } catch (e) {
      /* אין תיקיית שירים - מנגנים רק את המנגינות המובנות */
    }
  },

  addFiles(fileList) {
    const added = [];
    [...fileList].forEach((f) => {
      if (!f.type.startsWith("audio")) return;
      const song = { title: f.name.replace(/\.[^.]+$/, ""), emoji: "🎶", file: URL.createObjectURL(f) };
      this.extra.push(song);
      added.push(song);
    });
    return added;
  },

  play(index) {
    /* השיר תופס את מקום המוזיקה הכללית - מכבים את הלופ ברגע שהשיר מתחיל */
    Sound.stopMusic();
    this.stop();
    this.index = (index + this.all().length) % this.all().length;
    const song = this.all()[this.index];
    this.playing = true;

    if (song.file) {
      this.audio = new Audio(song.file);
      this.audio.loop = true;
      this.audio.volume = 0.8;
      this.audio.play().catch(() => {});
      this.pulse = setInterval(() => this.onBeat && this.onBeat(), 420);
      return;
    }

    Sound.init();
    this.step = 0;
    this.tick(song);
  },

  tick(song) {
    if (!this.playing) return;
    const [note, beats] = song.notes[this.step % song.notes.length];
    const dur = beats * song.beat;

    if (note) {
      const freq = NOTES[note] || LOW[note];
      if (freq) {
        Sound.tone(freq, Math.max(0.12, dur * 0.85), { type: "triangle", vol: 0.2 });
        if (this.step % 2 === 0) {
          Sound.tone(freq / 2, Math.max(0.14, dur * 0.9), { type: "sine", vol: 0.09 });
        }
      }
      if (this.onBeat) this.onBeat(note);
    }

    this.step++;
    this.timer = setTimeout(() => this.tick(song), dur * 1000);
  },

  stop() {
    this.playing = false;
    clearTimeout(this.timer);
    clearInterval(this.pulse);
    this.timer = null;
    if (this.audio) {
      this.audio.pause();
      this.audio = null;
    }
  },

  next() {
    this.play(this.index + 1);
  },

  prev() {
    this.play(this.index - 1);
  },
};
