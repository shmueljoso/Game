/* המוסך: בוחרים באיזה רכב לשחק, וקונים רכבים חדשים במטבעות שנאספו */

const Garage = {
  returnTo: null,

  /* returnTo - המשחק שממנו הגיעו, כדי שכפתור החזרה יחזור אליו עם הרכב החדש */
  open(returnTo = null) {
    this.returnTo = returnTo;
    App.showScreen("garage");
    App.paintProfile();
    this.render();
    Sound.play("whoosh");
    Speech.say("המוסך שלי");
  },

  render() {
    const grid = document.getElementById("carGrid");
    const owned = App.profile.cars;
    const chosen = App.profile.car;
    grid.innerHTML = "";

    CARS.forEach((car) => {
      const isOwned = owned.includes(car.id);
      const isChosen = car.id === chosen;
      const card = el("button", "car-card" + (isOwned ? " owned" : " locked") + (isChosen ? " chosen" : ""));
      card.innerHTML = `
        <span class="car-art">${carSvg(car)}</span>
        <span class="car-name">${car.name}</span>
        <span class="car-latin">${car.model ? `${car.latin} · ${car.model}` : car.latin}</span>
        <span class="car-tag">${
          isChosen ? "✅ נבחר" : isOwned ? "לבחירה" : `🪙 ${car.price}`
        }</span>
      `;
      card.addEventListener("click", () => this.pick(car, isOwned));
      grid.appendChild(card);
    });
  },

  pick(car, isOwned) {
    if (isOwned) {
      App.selectCar(car.id);
      Sound.play("star");
      Speech.say(car.model ? `${car.latin} ${car.model}` : car.latin, { forceEn: true });
      this.render();
      return;
    }

    const result = App.buyCar(car.id);
    if (result === "bought") {
      Sound.play("win");
      App.confetti(30);
      const full = car.model ? `${car.latin} ${car.model}` : car.latin;
      Speech.say(full, { forceEn: true, en: `We got a ${full}` });
      this.render();
    } else {
      Sound.play("wrong");
      const need = car.price - (App.profile.coins || 0);
      this.toast(`צריך עוד ${need} מטבעות 🪙`);
      Speech.say("צריך עוד מטבעות");
    }
  },

  toast(text) {
    let box = document.getElementById("garageToast");
    if (!box) {
      box = el("div", "garage-toast");
      box.id = "garageToast";
      document.getElementById("screen-garage").appendChild(box);
    }
    box.textContent = text;
    box.classList.remove("show");
    void box.offsetWidth;
    box.classList.add("show");
  },
};
