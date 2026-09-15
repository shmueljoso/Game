/* מצב ילד: מסך מלא, המסך לא נכבה, והיציאה דורשת לחיצה ארוכה של מבוגר.
   נעילה אמיתית מפני מעבר לאפליקציות אחרות היא הגדרה של מערכת ההפעלה -
   לכן מסבירים למבוגר איך להפעיל "הצמדת מסך" באנדרואיד / "גישה מודרכת" באייפון */

const KidMode = {
  on: false,
  wakeLock: null,
  holdTimer: null,

  init() {
    this.btn = document.getElementById("kidLockBtn");
    this.btn.addEventListener("pointerdown", () => this.pressStart());
    ["pointerup", "pointerleave", "pointercancel"].forEach((ev) =>
      this.btn.addEventListener(ev, () => this.pressEnd())
    );

    document.getElementById("kidTipClose").addEventListener("click", () => {
      document.getElementById("kidTip").classList.add("hidden");
      this.enable();
    });

    /* אם המערכת יצאה ממסך מלא (למשל כפתור חזרה) - מסמנים שהמצב כבוי */
    document.addEventListener("fullscreenchange", () => {
      if (!document.fullscreenElement && this.on) this.disable(true);
    });

    /* כשחוזרים לאפליקציה מבקשים שוב שהמסך לא ייכבה */
    document.addEventListener("visibilitychange", () => {
      if (this.on && document.visibilityState === "visible") this.requestWakeLock();
    });
  },

  pressStart() {
    if (!this.on) {
      /* בפעם הראשונה מסבירים למבוגר מה זה עושה */
      if (!App.profile.sawKidTip) {
        App.profile.sawKidTip = true;
        App.saveProfile();
        document.getElementById("kidTip").classList.remove("hidden");
        return;
      }
      this.enable();
      return;
    }

    /* ליציאה צריך להחזיק - ילד בן שלוש לא יעשה את זה בטעות */
    this.btn.classList.add("holding");
    Sound.play("click");
    this.holdTimer = setTimeout(() => this.disable(), 2500);
  },

  pressEnd() {
    clearTimeout(this.holdTimer);
    this.btn.classList.remove("holding");
  },

  async enable() {
    this.on = true;
    document.body.classList.add("kid-mode");
    this.btn.textContent = "🔒";
    this.btn.classList.add("locked");
    Sound.play("star");

    try {
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen({ navigationUI: "hide" });
      }
    } catch (e) {
      /* דפדפנים מסוימים לא מרשים מסך מלא - שאר ההגנות עדיין פועלות */
    }
    this.requestWakeLock();
  },

  async disable(systemExit) {
    this.on = false;
    document.body.classList.remove("kid-mode");
    this.btn.textContent = "🔓";
    this.btn.classList.remove("locked", "holding");
    Sound.play("pop");

    if (this.wakeLock) {
      try {
        await this.wakeLock.release();
      } catch (e) {
        /* כבר שוחרר */
      }
      this.wakeLock = null;
    }
    if (!systemExit && document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
  },

  async requestWakeLock() {
    if (!("wakeLock" in navigator)) return;
    try {
      this.wakeLock = await navigator.wakeLock.request("screen");
    } catch (e) {
      /* לא נורא - פשוט המסך עלול להיכבות לבד */
    }
  },
};
