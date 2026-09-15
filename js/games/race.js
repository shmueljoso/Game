/* משחק מרוץ: לוחצים מהר כדי להאיץ את המכונית ולנצח את מכונית המחשב */

const RaceGame = {
  playerProgress: 0,
  cpuProgress: 0,
  finished: false,
  cpuTimer: null,

  start() {
    document.getElementById("raceWin").classList.add("hidden");
    this.playerProgress = 0;
    this.cpuProgress = 0;
    this.finished = false;

    this.playerCar = document.getElementById("playerCar");
    this.cpuCar = document.getElementById("cpuCar");
    this.playerCar.style.left = "0%";
    this.cpuCar.style.left = "0%";

    this.bindTap();
    this.startCpu();
  },

  bindTap() {
    const btn = document.getElementById("tapBtn");
    btn.onpointerdown = () => {
      if (this.finished) return;
      this.playerProgress = Math.min(100, this.playerProgress + rand(3, 6));
      this.updateCar(this.playerCar, this.playerProgress);
      bump(this.playerCar);
      dust(document.getElementById("trackPlayer"), this.playerProgress);
      if (this.playerProgress >= 100) this.finish("player");
    };
  },

  startCpu() {
    clearInterval(this.cpuTimer);
    this.cpuTimer = setInterval(() => {
      if (this.finished) return;
      this.cpuProgress = Math.min(100, this.cpuProgress + rand(2, 5));
      this.updateCar(this.cpuCar, this.cpuProgress);
      bump(this.cpuCar);
      if (this.cpuProgress >= 100) this.finish("cpu");
    }, 260);
  },

  updateCar(el, progress) {
    const track = el.parentElement;
    const trackWidth = track.clientWidth;
    const carWidth = 46;
    const usable = trackWidth - carWidth - 10;
    const left = (progress / 100) * usable;
    el.style.left = left + "px";
  },

  finish(winner) {
    this.finished = true;
    clearInterval(this.cpuTimer);

    const text = document.getElementById("raceWinText");
    text.textContent = winner === "player" ? "ניצחתם! כל הכבוד! 🏆" : "כמעט! ננסה שוב? 💪";

    document.getElementById("raceWin").classList.remove("hidden");
    if (App.profile) {
      renderCompanion(
        document.getElementById("raceWinMascot"),
        App.profile.companion,
        winner === "player" ? "happy" : "idle"
      );
    }
    if (winner === "player") App.celebrate();
  },
};

function rand(min, max) {
  return Math.random() * (max - min) + min;
}

function bump(el) {
  el.classList.remove("bump");
  void el.offsetWidth;
  el.classList.add("bump");
}

function dust(track, progress) {
  const p = document.createElement("span");
  p.className = "dust";
  p.style.left = Math.max(0, progress - 4) + "%";
  track.appendChild(p);
  setTimeout(() => p.remove(), 500);
}
