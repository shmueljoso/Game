/* מפת העיר: עולם ברוחב שני מסכים. עוברים בין האזורים עם חיצים גדולים,
   והמצלמה מחליקה על פני הכביש המתעקל */

const ROAD_PATH =
  "M -60 352 C 140 296, 300 420, 500 384 C 700 348, 830 300, 1060 344 " +
  "C 1260 388, 1420 300, 1620 352 C 1790 396, 1900 330, 2060 356";

const AREAS = [
  { name: "עיר הרכבים" },
  { name: "הפארק" },
];

const City = {
  area: 0,

  build() {
    const stage = document.getElementById("cityStage");
    stage.innerHTML = `
      <svg class="city-svg" id="citySvg" viewBox="0 0 1000 600" preserveAspectRatio="xMidYMid slice"
           xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#7cc8f5"/>
            <stop offset="55%" stop-color="#c2e9ff"/>
            <stop offset="100%" stop-color="#ffeccd"/>
          </linearGradient>
          <linearGradient id="grass" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#93da74"/>
            <stop offset="100%" stop-color="#5fb04a"/>
          </linearGradient>
          <linearGradient id="hillBack" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#a9dd8f"/>
            <stop offset="100%" stop-color="#7cc767"/>
          </linearGradient>
          <linearGradient id="pond" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#8fd8f5"/>
            <stop offset="100%" stop-color="#4fb3e0"/>
          </linearGradient>
          <radialGradient id="sunGlow">
            <stop offset="0%" stop-color="#fff6b0" stop-opacity="0.95"/>
            <stop offset="100%" stop-color="#fff6b0" stop-opacity="0"/>
          </radialGradient>
        </defs>

        <g class="world" id="cityWorld">
          <rect x="-60" y="-60" width="2120" height="720" fill="url(#sky)"/>

          <g class="sun-group">
            <circle r="120" fill="url(#sunGlow)"/>
            <g class="sun-rays">
              ${Array.from({ length: 12 }, (_, i) =>
                `<rect x="-5" y="-86" width="10" height="28" rx="5" fill="#ffe27a" opacity="0.9" transform="rotate(${i * 30})"/>`
              ).join("")}
            </g>
            <circle r="44" fill="#ffd93d"/>
            <circle r="44" fill="#fff3a8" opacity="0.45"/>
          </g>

          <g class="rainbow" opacity="0.4">
            ${["#ff8a8a", "#ffc46b", "#ffe86b", "#8fe08f", "#8fc9ff", "#c9a3ff"].map(
              (c, i) => `<path d="M 150 318 A 200 200 0 0 1 550 318" fill="none" stroke="${c}"
                           stroke-width="10" transform="translate(0 ${i * 10})"/>`
            ).join("")}
          </g>

          ${balloons(1180, 150)} ${kite(1650, 140)}

          ${cloud(170, 96, 1.1)} ${cloud(560, 62, 0.85)} ${cloud(880, 130, 1.2)}
          ${cloud(1320, 90, 1.0)} ${cloud(1760, 120, 1.15)}

          <g class="birds">
            <path d="M0 0 q9 -9 18 0 q9 -9 18 0" stroke="#5b6b7a" stroke-width="3" fill="none" stroke-linecap="round"/>
            <path d="M44 26 q7 -7 14 0 q7 -7 14 0" stroke="#5b6b7a" stroke-width="2.5" fill="none" stroke-linecap="round"/>
          </g>

          <path d="M-60 330 Q 120 250 300 318 Q 470 250 640 312 Q 820 248 1000 322
                   Q 1180 252 1360 316 Q 1540 250 1720 314 Q 1900 250 2060 320
                   L2060 620 L-60 620 Z" fill="url(#hillBack)"/>
          <path d="M-60 356 Q 200 300 420 352 Q 660 300 1000 358
                   Q 1300 302 1560 356 Q 1820 300 2060 358 L2060 620 L-60 620 Z" fill="url(#grass)"/>

          <path d="${ROAD_PATH}" fill="none" stroke="#5d5d69" stroke-width="66" stroke-linecap="round"/>
          <path d="${ROAD_PATH}" fill="none" stroke="#72727f" stroke-width="58" stroke-linecap="round"/>
          <path d="${ROAD_PATH}" fill="none" stroke="#fff3c4" stroke-width="5" stroke-dasharray="26 26" opacity="0.9"/>

          <g class="pond-group">
            <ellipse cx="1500" cy="566" rx="130" ry="34" fill="#4c9f3a" opacity="0.3"/>
            <ellipse cx="1500" cy="564" rx="118" ry="27" fill="url(#pond)"/>
            <ellipse class="ripple" cx="1478" cy="562" rx="18" ry="6" fill="none" stroke="#ffffff" stroke-width="2.5" opacity="0.7"/>
            <ellipse class="ripple r2" cx="1524" cy="568" rx="14" ry="5" fill="none" stroke="#ffffff" stroke-width="2" opacity="0.6"/>
            <text x="1470" y="560" font-size="26">🦆</text>
          </g>

          ${tree(330, 250, 0.72)} ${tree(660, 248, 0.7)} ${tree(980, 252, 0.72)}
          ${tree(30, 506, 0.85)} ${tree(340, 510, 0.92)} ${tree(660, 506, 0.85)} ${tree(978, 510, 0.9)}
          ${tree(1330, 250, 0.72)} ${tree(1660, 248, 0.7)} ${tree(1990, 252, 0.7)}
          ${tree(1030, 508, 0.85)} ${tree(1340, 512, 0.92)} ${tree(1660, 506, 0.85)} ${tree(1990, 510, 0.9)}
          ${flowers(60, 470)} ${flowers(640, 470)} ${flowers(1060, 470)} ${flowers(1700, 466)}
          ${lamp(340, 424)} ${lamp(1040, 420)} ${lamp(1700, 424)}
          ${bench(640, 556)} ${bench(1340, 556)}

          <g id="hotspots"></g>
        </g>
      </svg>
    `;

    const layer = stage.querySelector("#hotspots");
    WORLDS.forEach((w, i) => {
      const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
      g.setAttribute("transform", `translate(${w.x},${w.y})`);
      g.setAttribute("class", "hotspot");
      g.dataset.id = w.id;
      g.innerHTML = `
        <g class="hotspot-inner" style="animation-delay:${(i % 6) * 0.3}s">
          <!-- אזור נגיעה מלא: ב-SVG נוגעים רק בצורות שצוירו, אז בלי זה נגיעה בין הצורות לא נחשבת -->
          <rect class="tap-pad" x="-92" y="-156" width="184" height="212" fill="transparent"/>
          <ellipse cx="0" cy="6" rx="92" ry="17" fill="#3f7d34" opacity="0.28"/>
          ${BUILDINGS[w.style](w)}
          <g class="b-tag">
            <rect x="-72" y="18" width="144" height="34" rx="17" fill="#ffffff" opacity="0.94"/>
            <text class="b-label" x="0" y="41" text-anchor="middle">${w.label}</text>
          </g>
          <g class="b-badge" opacity="0">
            <circle cx="66" cy="-104" r="19" fill="#ffd93d" stroke="#e0a800" stroke-width="3"/>
            <text x="66" y="-97" text-anchor="middle" font-size="20">⭐</text>
          </g>
        </g>
      `;
      g.addEventListener("click", () => {
        Sound.play("pop");
        g.classList.add("tapped");
        setTimeout(() => {
          g.classList.remove("tapped");
          if (w.id === "garage") Garage.open();
          else App.openGame(w.id);
        }, 220);
      });
      layer.appendChild(g);
    });

    ["🚕", "🚌", "🚙", "🏍️"].forEach((emoji, i) => {
      const car = document.createElementNS("http://www.w3.org/2000/svg", "text");
      car.setAttribute("font-size", "30");
      car.setAttribute("class", "road-car");
      car.textContent = emoji;
      car.style.offsetPath = `path("${ROAD_PATH}")`;
      car.style.animationDuration = 26 + i * 8 + "s";
      car.style.animationDelay = -i * 7 + "s";
      stage.querySelector("#cityWorld").appendChild(car);
    });

    document.getElementById("cityNext").addEventListener("click", () => this.go(this.area + 1));
    document.getElementById("cityPrev").addEventListener("click", () => this.go(this.area - 1));

    this.go(this.area);
    this.fit();
    window.addEventListener("resize", () => this.fit());
    this.refreshStars();
  },

  /* מזיזים את המצלמה לאזור אחר בעיר */
  go(index) {
    this.area = Math.max(0, Math.min(AREAS.length - 1, index));
    const world = document.getElementById("cityWorld");
    if (world) world.style.transform = `translateX(${-this.area * 1000}px)`;
    document.getElementById("cityPrev").classList.toggle("hidden", this.area === 0);
    document.getElementById("cityNext").classList.toggle("hidden", this.area === AREAS.length - 1);
    const name = document.getElementById("areaName");
    if (name) name.textContent = AREAS[this.area].name;
    Sound.play("whoosh");
  },

  /* חיתוך מותר רק למעלה ולמטה (שמיים ודשא). מסך פחות רחב מהציור - מיישרים לקרקע
     והשמיים של הרקע ממשיכים מעל, כך שלעולם לא נחתך מבנה בצדדים */
  fit() {
    const svg = document.getElementById("citySvg");
    if (!svg) return;
    const wideEnough = window.innerWidth / window.innerHeight >= 1000 / 600;
    svg.setAttribute("preserveAspectRatio", wideEnough ? "xMidYMid slice" : "xMidYMax meet");
  },

  refreshStars() {
    const done = (App.profile && App.profile.done) || {};
    document.querySelectorAll(".hotspot").forEach((g) => {
      const badge = g.querySelector(".b-badge");
      if (badge) badge.setAttribute("opacity", done[g.dataset.id] ? "1" : "0");
    });
  },
};

/* ---------- מבנים: לכל מקום בעיר צורה משלו ---------- */

const BUILDINGS = {
  /* שער כניסה מקושת - גן החיות */
  arch: (w) => `
    <rect x="-76" y="-96" width="22" height="96" rx="8" fill="${w.roof}"/>
    <rect x="54" y="-96" width="22" height="96" rx="8" fill="${w.roof}"/>
    <path d="M-76 -96 Q0 -168 76 -96 L76 -74 Q0 -142 -76 -74 Z" fill="${w.color}" stroke="${w.roof}" stroke-width="4"/>
    <rect x="-54" y="-74" width="108" height="74" rx="10" fill="#cdeccd" opacity="0.65"/>
    <text x="0" y="-22" text-anchor="middle" font-size="46">${w.emoji}</text>
    <text x="0" y="-112" text-anchor="middle" font-size="24">🌴</text>`,

  /* תחנת כבאות עם מגדל */
  tower: (w) => `
    <rect x="-82" y="-118" width="40" height="118" rx="8" fill="${w.roof}"/>
    <path d="M-86 -118 L-62 -146 L-38 -118 Z" fill="#a83232"/>
    <circle cx="-62" cy="-96" r="11" fill="#ffe9a8"/>
    <rect x="-44" y="-86" width="126" height="86" rx="10" fill="${w.color}" stroke="${w.roof}" stroke-width="4"/>
    <rect x="-48" y="-98" width="134" height="18" rx="9" fill="${w.roof}"/>
    <path d="M-30 0 L-30 -56 Q19 -76 68 -56 L68 0 Z" fill="#fdf0e0"/>
    <rect x="-30" y="-58" width="98" height="10" rx="5" fill="${w.roof}"/>
    <text x="19" y="-14" text-anchor="middle" font-size="44">${w.emoji}</text>`,

  /* מבנה מודרני עם גגון - בית חולים והצומת */
  flat: (w) => `
    <rect x="-78" y="-104" width="156" height="104" rx="14" fill="${w.color}" stroke="#00000022" stroke-width="3"/>
    <rect x="-86" y="-116" width="172" height="20" rx="10" fill="${w.roof}"/>
    <rect x="-60" y="-88" width="34" height="28" rx="7" fill="#bfe3ff"/>
    <rect x="-14" y="-88" width="34" height="28" rx="7" fill="#bfe3ff"/>
    <rect x="32" y="-88" width="34" height="28" rx="7" fill="#bfe3ff"/>
    <path d="M-54 -46 Q0 -60 54 -46 L54 -38 Q0 -52 -54 -38 Z" fill="${w.roof}" opacity="0.85"/>
    <rect x="-34" y="-40" width="68" height="40" rx="8" fill="#ffffffcc"/>
    <text x="0" y="-8" text-anchor="middle" font-size="40">${w.emoji}</text>`,

  /* אתר בנייה עם פיגומים */
  site: (w) => `
    <rect x="-70" y="-84" width="140" height="84" rx="8" fill="${w.color}" stroke="${w.roof}" stroke-width="4"/>
    <g stroke="${w.roof}" stroke-width="5" opacity="0.7">
      <line x1="-70" y1="-56" x2="70" y2="-56"/>
      <line x1="-70" y1="-28" x2="70" y2="-28"/>
      <line x1="-26" y1="-84" x2="-26" y2="0"/>
      <line x1="26" y1="-84" x2="26" y2="0"/>
    </g>
    <rect x="-78" y="-96" width="156" height="16" rx="8" fill="#ffd93d"/>
    <text x="0" y="-26" text-anchor="middle" font-size="44">${w.emoji}</text>
    <line x1="-62" y1="-150" x2="-62" y2="-84" stroke="#e8a020" stroke-width="7"/>
    <line x1="-62" y1="-150" x2="-124" y2="-150" stroke="#e8a020" stroke-width="7"/>
    <line x1="-118" y1="-150" x2="-118" y2="-122" stroke="#b9822a" stroke-width="3"/>
    <rect x="-128" y="-124" width="20" height="14" rx="4" fill="#c97b2e"/>`,

  /* מנהרת שטיפה */
  wash: (w) => `
    <path d="M-80 0 L-80 -66 Q0 -132 80 -66 L80 0 L44 0 L44 -60 Q0 -108 -44 -60 L-44 0 Z"
          fill="${w.color}" stroke="${w.roof}" stroke-width="4"/>
    <path d="M-44 -60 Q0 -108 44 -60 L44 -48 Q0 -94 -44 -48 Z" fill="${w.roof}" opacity="0.5"/>
    ${[-30, -10, 10, 30].map(
      (x, i) => `<rect class="wash-brush" x="${x - 4}" y="-58" width="8" height="34" rx="4"
                    fill="${["#ff8fab", "#ffd93d", "#6bcB77", "#4d96ff"][i]}" style="animation-delay:${i * 0.18}s"/>`
    ).join("")}
    <text x="0" y="-8" text-anchor="middle" font-size="40">${w.emoji}</text>
    <text x="-64" y="-76" font-size="22">💦</text>`,

  /* מוסך עם דלת נגררת */
  garage: (w) => `
    <rect x="-80" y="-92" width="160" height="92" rx="10" fill="${w.color}" stroke="${w.roof}" stroke-width="4"/>
    <path d="M-88 -92 L0 -138 L88 -92 Z" fill="${w.roof}"/>
    <rect x="-54" y="-70" width="108" height="70" rx="8" fill="#f6f2ea"/>
    <g fill="${w.roof}" opacity="0.35">
      <rect x="-54" y="-70" width="108" height="8" rx="4"/>
      <rect x="-54" y="-54" width="108" height="8" rx="4"/>
      <rect x="-54" y="-38" width="108" height="8" rx="4"/>
    </g>
    <text x="0" y="-12" text-anchor="middle" font-size="40">${w.emoji}</text>
    <circle cx="0" cy="-112" r="15" fill="#fff" opacity="0.9"/>
    <text x="0" y="-104" text-anchor="middle" font-size="18">🚗</text>`,

  /* יציע מסלול המרוץ */
  stand: (w) => `
    <path d="M-84 0 L-84 -40 L-30 -40 L-30 -72 L34 -72 L34 -104 L84 -104 L84 0 Z"
          fill="${w.color}" stroke="${w.roof}" stroke-width="4" stroke-linejoin="round"/>
    <g fill="${w.roof}" opacity="0.5">
      <rect x="-78" y="-34" width="48" height="10" rx="5"/>
      <rect x="-24" y="-66" width="52" height="10" rx="5"/>
      <rect x="40" y="-98" width="38" height="10" rx="5"/>
    </g>
    <rect x="-84" y="-122" width="168" height="18" rx="9" fill="#ffffffee"/>
    <g>${Array.from({ length: 12 }, (_, i) =>
      `<rect x="${-84 + i * 14}" y="${-122 + (i % 2 ? 9 : 0)}" width="14" height="9" fill="#2b2b30" opacity="0.85"/>`
    ).join("")}</g>
    <text x="0" y="-12" text-anchor="middle" font-size="40">${w.emoji}</text>`,

  /* חנות עם סוכך פסים - הסופרמרקט */
  shop: (w) => `
    <rect x="-80" y="-100" width="160" height="100" rx="12" fill="${w.color}" stroke="${w.roof}" stroke-width="4"/>
    <rect x="-86" y="-116" width="172" height="18" rx="9" fill="${w.roof}"/>
    <path d="M-84 -74 L84 -74 L70 -44 L-70 -44 Z" fill="#ffffff"/>
    <g>${Array.from({ length: 6 }, (_, i) =>
      `<path d="M${-84 + i * 28} -74 L${-70 + i * 28} -74 L${-56 + i * 23.3} -44 L${-70 + i * 23.3} -44 Z" fill="${w.roof}"/>`
    ).join("")}</g>
    <rect x="-50" y="-40" width="100" height="40" rx="8" fill="#fff8e8"/>
    <text x="0" y="-8" text-anchor="middle" font-size="38">${w.emoji}</text>
    <text x="0" y="-84" text-anchor="middle" font-size="22">🍎</text>`,

  /* במת מוזיקה עם וילונות */
  theater: (w) => `
    <rect x="-84" y="-104" width="168" height="104" rx="12" fill="${w.color}" stroke="${w.roof}" stroke-width="4"/>
    <path d="M-92 -104 Q0 -150 92 -104 Z" fill="${w.roof}"/>
    <path d="M-70 -96 Q-52 -50 -62 0 L-70 0 Z" fill="${w.roof}" opacity="0.85"/>
    <path d="M70 -96 Q52 -50 62 0 L70 0 Z" fill="${w.roof}" opacity="0.85"/>
    <rect x="-46" y="-78" width="92" height="78" rx="8" fill="#2f2440" opacity="0.8"/>
    <text x="0" y="-26" text-anchor="middle" font-size="40">${w.emoji}</text>
    <text x="-30" y="-104" font-size="22">🎵</text>
    <text x="22" y="-116" font-size="18">🎶</text>`,

  /* מחסן משלוחים */
  depot: (w) => `
    <rect x="-84" y="-92" width="168" height="92" rx="10" fill="${w.color}" stroke="${w.roof}" stroke-width="4"/>
    <path d="M-92 -92 L-60 -126 L60 -126 L92 -92 Z" fill="${w.roof}"/>
    <rect x="-58" y="-70" width="116" height="70" rx="8" fill="#f3ece0"/>
    <g fill="${w.roof}" opacity="0.3">
      <rect x="-58" y="-70" width="116" height="9" rx="4.5"/>
      <rect x="-58" y="-52" width="116" height="9" rx="4.5"/>
    </g>
    <text x="0" y="-14" text-anchor="middle" font-size="38">${w.emoji}</text>
    <rect x="-40" y="-122" width="80" height="22" rx="11" fill="#ffffffdd"/>
    <text x="0" y="-105" text-anchor="middle" font-size="18">📮</text>`,

  /* חנות צעצועים צבעונית - הפאזל */
  toy: (w) => `
    <rect x="-80" y="-96" width="160" height="96" rx="14" fill="${w.color}" stroke="${w.roof}" stroke-width="4"/>
    <path d="M-88 -96 L0 -140 L88 -96 Z" fill="${w.roof}"/>
    <circle cx="-46" cy="-66" r="16" fill="#ff8fab"/>
    <rect x="-16" y="-82" width="32" height="32" rx="6" fill="#4d96ff"/>
    <path d="M46 -82 L64 -50 L28 -50 Z" fill="#6bcB77"/>
    <rect x="-46" y="-40" width="92" height="40" rx="8" fill="#fff8e8"/>
    <text x="0" y="-8" text-anchor="middle" font-size="36">${w.emoji}</text>`,
};

/* ---------- קישוטי נוף ---------- */

function cloud(x, y, scale) {
  return `
    <g class="cloud">
      <g transform="translate(${x},${y}) scale(${scale})">
        <ellipse cx="0" cy="0" rx="46" ry="27" fill="#ffffff"/>
        <ellipse cx="36" cy="9" rx="34" ry="21" fill="#ffffff"/>
        <ellipse cx="-34" cy="9" rx="30" ry="19" fill="#ffffff"/>
        <ellipse cx="4" cy="-14" rx="26" ry="18" fill="#ffffff"/>
      </g>
    </g>`;
}

function tree(x, y, scale) {
  return `
    <g class="tree" transform="translate(${x},${y}) scale(${scale})">
      <rect x="-8" y="-30" width="16" height="38" rx="7" fill="#8b5a2b"/>
      <circle cx="0" cy="-56" r="34" fill="#4aa85c"/>
      <circle cx="-24" cy="-38" r="23" fill="#5cbd6c"/>
      <circle cx="24" cy="-38" r="23" fill="#3f9a52"/>
      <circle cx="-9" cy="-70" r="18" fill="#63c473" opacity="0.9"/>
    </g>`;
}

function flowers(x, y) {
  return `
    <g transform="translate(${x},${y})">
      ${[0, 26, 52].map(
        (dx, i) => `<g transform="translate(${dx},${i % 2 ? 8 : 0})">
            <circle r="6" fill="${["#ff8fab", "#ffd93d", "#c9a3ff"][i]}"/>
            <circle r="2.4" fill="#fff8d8"/>
          </g>`
      ).join("")}
    </g>`;
}

function lamp(x, y) {
  return `
    <g transform="translate(${x},${y})">
      <rect x="-3" y="-72" width="6" height="72" rx="3" fill="#6d7a86"/>
      <path d="M-3 -72 Q-3 -86 12 -86" stroke="#6d7a86" stroke-width="6" fill="none" stroke-linecap="round"/>
      <circle cx="14" cy="-82" r="9" fill="#ffe9a8"/>
      <circle cx="14" cy="-82" r="16" fill="#ffe9a8" opacity="0.25"/>
    </g>`;
}

function bench(x, y) {
  return `
    <g transform="translate(${x},${y})">
      <rect x="-30" y="-16" width="60" height="8" rx="4" fill="#b5813f"/>
      <rect x="-30" y="-30" width="60" height="7" rx="3.5" fill="#c99457"/>
      <rect x="-24" y="-8" width="6" height="14" rx="3" fill="#8b5a2b"/>
      <rect x="18" y="-8" width="6" height="14" rx="3" fill="#8b5a2b"/>
    </g>`;
}

function balloons(x, y) {
  return `
    <g class="balloons" transform="translate(${x},${y})">
      ${[
        { dx: 0, dy: 0, c: "#ff8fab" },
        { dx: 34, dy: 18, c: "#ffd93d" },
        { dx: -30, dy: 22, c: "#8fc9ff" },
      ].map(
        (b) => `<g transform="translate(${b.dx},${b.dy})">
            <ellipse cx="0" cy="0" rx="20" ry="25" fill="${b.c}"/>
            <path d="M0 25 q6 20 -2 40" stroke="#ffffff" stroke-width="2" fill="none" opacity="0.8"/>
          </g>`
      ).join("")}
    </g>`;
}

function kite(x, y) {
  return `
    <g class="kite" transform="translate(${x},${y})">
      <path d="M0 -26 L22 0 L0 30 L-22 0 Z" fill="#ff8fab" stroke="#ffffff" stroke-width="2"/>
      <path d="M0 30 q10 18 -4 28 q14 10 2 26" stroke="#ffffff" stroke-width="2.5" fill="none"/>
    </g>`;
}
