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
      Speech.say(c.label);
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

  /* הדפדפן מרשה סאונד רק אחרי נגיעה ראשונה של המשתמש */
  const wake = () => {
    Sound.init();
    Sound.startMusic();
    document.removeEventListener("pointerdown", wake);
  };
  document.addEventListener("pointerdown", wake);
}

document.addEventListener("DOMContentLoaded", () => {
  Speech.init();
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
