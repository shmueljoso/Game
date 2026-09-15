/* מפת העיר: הציור הראשי שממנו בוחרים משחק. הכל SVG כדי שיתאים לכל גודל מסך */

const City = {
  build() {
    const stage = document.getElementById("cityStage");
    stage.innerHTML = `
      <svg class="city-svg" viewBox="0 0 1000 600" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#9fd8ff"/>
            <stop offset="70%" stop-color="#d7f0ff"/>
            <stop offset="100%" stop-color="#fdf3dd"/>
          </linearGradient>
          <linearGradient id="grass" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#8fd36f"/>
            <stop offset="100%" stop-color="#6bbd52"/>
          </linearGradient>
        </defs>

        <rect width="1000" height="600" fill="url(#sky)"/>

        <g class="sun-group">
          <g class="sun-rays">
            ${Array.from({ length: 12 }, (_, i) =>
              `<rect x="-4" y="-78" width="8" height="26" rx="4" fill="#ffe27a" transform="rotate(${i * 30})"/>`
            ).join("")}
          </g>
          <circle r="40" fill="#ffd93d"/>
          <circle r="40" fill="#fff3a8" opacity="0.5"/>
        </g>

        ${cloud(140, 80, 1)}
        ${cloud(520, 50, 0.8)}
        ${cloud(830, 120, 1.1)}

        <g class="birds">
          <path d="M0 0 q8 -8 16 0 q8 -8 16 0" stroke="#5b6b7a" stroke-width="3" fill="none" stroke-linecap="round"/>
          <path d="M40 22 q6 -6 12 0 q6 -6 12 0" stroke="#5b6b7a" stroke-width="2.5" fill="none" stroke-linecap="round"/>
        </g>

        <path d="M0 300 Q160 250 330 296 Q520 240 700 292 Q860 252 1000 298 L1000 340 L0 340 Z" fill="#7cc95f" opacity="0.75"/>
        <rect x="0" y="300" width="1000" height="300" fill="url(#grass)"/>

        <!-- כביש ראשי -->
        <rect x="0" y="322" width="1000" height="54" fill="#6f6f7a"/>
        <rect x="0" y="322" width="1000" height="5" fill="#8d8d99"/>
        <rect x="0" y="371" width="1000" height="5" fill="#8d8d99"/>
        <g>
          ${Array.from({ length: 14 }, (_, i) =>
            `<rect x="${i * 72 + 10}" y="346" width="38" height="6" rx="3" fill="#fff5c9"/>`
          ).join("")}
        </g>

        <g class="traffic-flow">
          <text class="road-car car-a" x="-60" y="345" font-size="34">🚕</text>
          <text class="road-car car-b" x="-60" y="345" font-size="34">🚌</text>
          <text class="road-car car-c" x="1060" y="372" font-size="34">🚙</text>
        </g>

        ${tree(60, 470, 1.1)} ${tree(360, 520, 0.9)} ${tree(640, 470, 1)} ${tree(935, 520, 1.15)}
        ${bush(255, 540)} ${bush(700, 545)} ${bush(430, 470)}

        <g id="hotspots"></g>

        <text class="map-hint" x="500" y="586" text-anchor="middle">לחצו על מקום בעיר כדי לשחק</text>
      </svg>
    `;

    const layer = stage.querySelector("#hotspots");
    WORLDS.forEach((w, i) => {
      const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
      g.setAttribute("transform", `translate(${w.x},${w.y})`);
      g.setAttribute("class", "hotspot");
      g.dataset.id = w.id;
      g.innerHTML = `
        <g class="hotspot-inner" style="animation-delay:${i * 0.25}s">
          <ellipse class="glow" cx="0" cy="98" rx="82" ry="15" fill="#ffffff" opacity="0.35"/>
          ${buildingShape(w)}
          <text class="b-label" x="0" y="124" text-anchor="middle">${w.label}</text>
          <text class="b-star" x="54" y="-38" text-anchor="middle" opacity="0">⭐</text>
        </g>
      `;
      g.addEventListener("click", () => {
        Sound.play("pop");
        g.classList.add("tapped");
        setTimeout(() => App.openGame(w.id), 220);
      });
      layer.appendChild(g);
    });

    this.refreshStars();
  },

  refreshStars() {
    const done = (App.profile && App.profile.done) || {};
    document.querySelectorAll(".hotspot").forEach((g) => {
      const star = g.querySelector(".b-star");
      if (star) star.setAttribute("opacity", done[g.dataset.id] ? "1" : "0");
    });
  },
};

function buildingShape(w) {
  const bw = 128;
  const bh = 92;
  return `
    <rect x="${-bw / 2}" y="0" width="${bw}" height="${bh}" rx="11" fill="${w.color}" stroke="#00000018" stroke-width="2"/>
    <path d="M${-bw / 2 - 12} 2 L0 -44 L${bw / 2 + 12} 2 Z" fill="${w.roof}"/>
    <rect x="-27" y="${bh - 50}" width="54" height="50" rx="8" fill="#ffffffcc"/>
    <text x="0" y="${bh - 13}" text-anchor="middle" font-size="36">${w.emoji}</text>
    <circle cx="${-bw / 2 + 22}" cy="22" r="11" fill="#ffffffaa"/>
    <circle cx="${bw / 2 - 22}" cy="22" r="11" fill="#ffffffaa"/>
  `;
}

function cloud(x, y, scale) {
  return `
    <g class="cloud" style="--x:${x}px; --s:${scale}">
      <g transform="translate(${x},${y}) scale(${scale})">
        <ellipse cx="0" cy="0" rx="42" ry="26" fill="#ffffff"/>
        <ellipse cx="34" cy="8" rx="32" ry="20" fill="#ffffff"/>
        <ellipse cx="-32" cy="8" rx="28" ry="18" fill="#ffffff"/>
      </g>
    </g>`;
}

function tree(x, y, scale) {
  return `
    <g class="tree" transform="translate(${x},${y}) scale(${scale})">
      <rect x="-7" y="-26" width="14" height="34" rx="6" fill="#8b5a2b"/>
      <circle cx="0" cy="-48" r="30" fill="#49a95f"/>
      <circle cx="-20" cy="-32" r="20" fill="#5cb86e"/>
      <circle cx="20" cy="-32" r="20" fill="#3f9a55"/>
    </g>`;
}

function bush(x, y) {
  return `
    <g transform="translate(${x},${y})">
      <ellipse cx="0" cy="0" rx="26" ry="16" fill="#57b268"/>
      <ellipse cx="-14" cy="4" rx="16" ry="11" fill="#4aa159"/>
      <ellipse cx="14" cy="4" rx="16" ry="11" fill="#63bd73"/>
    </g>`;
}
