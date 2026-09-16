/* חיבור כל החלקים והפעלת האפליקציה */

function buildCompanionGrid() {
  const grid = document.getElementById("companionGrid");
  grid.innerHTML = "";
  Object.values(COMPANIONS).forEach((c) => {
    const card = el("button", "companion-card");
    card.dataset.key = c.key;
    card.innerHTML = `<span class="companion-avatar"></span><span class="companion-label">${c.label}</span>`;
    card.addEventListener("click", () => {
      document.querySelectorAll(".companion-card").forEach((x) => x.classList.remove("chosen"));
      card.classList.add("chosen");
      renderCompanion(card.querySelector(".companion-avatar"), c.key, "happy");
      Sound.play("star");
      Speech.say(c.say || c.label, { en: c.latin });
      App.setCompanion(c.key);
      setTimeout(() => {
        if (App.profile.name) {
          App.goCity();
        } else {
          App.showScreen("name");
          App.paintProfile();
        }
      }, 600);
    });
    grid.appendChild(card);
    renderCompanion(card.querySelector(".companion-avatar"), c.key, "idle");
  });
}

function bindUI() {
  document.getElementById("nameGo").addEventListener("click", () => {
    App.setName(document.getElementById("nameInput").value);
    Sound.play("win");
    App.goCity();
  });

  document.getElementById("nameSkip").addEventListener("click", () => {
    App.setName("");
    App.goCity();
  });

  document.getElementById("profileBtn").addEventListener("click", () => {
    Sound.play("click");
    App.showScreen("select");
  });

  document.getElementById("garageBack").addEventListener("click", () => {
    Sound.play("click");
    App.goCity();
  });

  document.getElementById("backBtn").addEventListener("click", () => {
    Sound.play("click");
    App.goCity();
  });

  document.getElementById("replayBtn").addEventListener("click", () => {
    Sound.play("click");
    App.replayGame();
  });

  document.getElementById("toCityBtn").addEventListener("click", () => {
    Sound.play("click");
    App.goCity();
  });

  const musicBtn = document.getElementById("musicBtn");
  musicBtn.addEventListener("click", () => {
    const on = Sound.toggleMusic();
    Sound.sfxOn = on;
    musicBtn.textContent = on ? "🎵" : "🔇";
    musicBtn.classList.toggle("off", !on);
  });

  /* כפתור התקנה - כרום מודיע מתי אפשר להתקין, ואז מציגים אותו */
  let installEvent = null;
  const installBtn = document.getElementById("installBtn");
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    installEvent = e;
    installBtn.classList.remove("hidden");
  });
  installBtn.addEventListener("click", async () => {
    if (!installEvent) return;
    Sound.play("click");
    installEvent.prompt();
    await installEvent.userChoice;
    installEvent = null;
    installBtn.classList.add("hidden");
  });
  window.addEventListener("appinstalled", () => installBtn.classList.add("hidden"));

  /* הדפדפן מרשה סאונד רק אחרי נגיעה ראשונה של המשתמש */
  const wake = () => {
    Sound.init();
    Sound.startMusic();
    document.removeEventListener("pointerdown", wake);
  };
  document.addEventListener("pointerdown", wake);
}

/* שמירת המשחק במכשיר - כך הוא נפתח מיד וגם עובד בלי אינטרנט */
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js").catch(() => {
      /* בלי service worker המשחק עדיין עובד, פשוט בלי מצב אופליין */
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  Speech.init();
  KidMode.init();
  Songs.loadFolder();
  Logos.load();
  App.profile = App.loadProfile();
  buildCompanionGrid();
  bindUI();
  City.build();

  if (App.profile && App.profile.companion) {
    App.showScreen("city");
    App.paintProfile();
    City.refreshStars();
  } else {
    App.showScreen("select");
  }
});
