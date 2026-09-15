/* קטלוג הרכבים של המוסך + מנוע ציור: כל רכב מצויר כ-SVG לפי סוג מרכב וצבע */

const CARS = [
  { id: "toyota",  name: "טויוטה", type: "hatch", color: "#e8443b", price: 0 },
  { id: "mazda",   name: "מאזדה",  type: "sedan", color: "#2f6fd0", price: 3 },
  { id: "hyundai", name: "יונדאי", type: "suv",   color: "#cdd3db", price: 6 },
  { id: "skoda",   name: "סקודה",  type: "wagon", color: "#2f9e63", price: 9 },
  { id: "geely",   name: "ג'ילי",  type: "sedan", color: "#f2921d", price: 12 },
  { id: "byd",     name: "BYD",    type: "sport", color: "#19bcd0", price: 16 },
  { id: "jeep",    name: "ג'יפ",   type: "jeep",  color: "#7d8b46", price: 20 },
  { id: "racer",   name: "מכונית מרוץ", type: "sport", color: "#ffd21e", price: 25 },
];

/* מידות המרכב לכל סוג רכב (במערכת קואורדינטות 360x190) */
const BODY_SPECS = {
  hatch: { bodyTop: 96, bodyLeft: 40, bodyRight: 316, cabinLeft: 76, cabinRight: 244, roofY: 50, slant: 26, wheelR: 23, wheels: [104, 258] },
  sedan: { bodyTop: 98, bodyLeft: 34, bodyRight: 326, cabinLeft: 92, cabinRight: 244, roofY: 54, slant: 30, wheelR: 23, wheels: [100, 262] },
  suv:   { bodyTop: 86, bodyLeft: 38, bodyRight: 322, cabinLeft: 80, cabinRight: 268, roofY: 40, slant: 20, wheelR: 27, wheels: [104, 262] },
  wagon: { bodyTop: 94, bodyLeft: 36, bodyRight: 324, cabinLeft: 86, cabinRight: 284, roofY: 48, slant: 24, wheelR: 23, wheels: [102, 264] },
  jeep:  { bodyTop: 84, bodyLeft: 44, bodyRight: 318, cabinLeft: 84, cabinRight: 276, roofY: 38, slant: 12, wheelR: 29, wheels: [106, 258] },
  sport: { bodyTop: 104, bodyLeft: 30, bodyRight: 330, cabinLeft: 112, cabinRight: 238, roofY: 70, slant: 34, wheelR: 22, wheels: [100, 264] },
};

function shade(hex, amount) {
  const n = parseInt(hex.slice(1), 16);
  const clamp = (v) => Math.max(0, Math.min(255, v));
  const r = clamp(((n >> 16) & 255) + amount);
  const g = clamp(((n >> 8) & 255) + amount);
  const b = clamp((n & 255) + amount);
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

function carSvg(car, opts = {}) {
  const s = BODY_SPECS[car.type];
  const dark = shade(car.color, -45);
  const light = shade(car.color, 38);
  const bodyBottom = 142;
  const glass = "#d6ecff";

  const cabin = `M ${s.cabinLeft} ${s.bodyTop}
     C ${s.cabinLeft + 4} ${s.roofY + 10}, ${s.cabinLeft + s.slant - 8} ${s.roofY}, ${s.cabinLeft + s.slant} ${s.roofY}
     L ${s.cabinRight - s.slant} ${s.roofY}
     C ${s.cabinRight - s.slant + 8} ${s.roofY}, ${s.cabinRight - 4} ${s.roofY + 10}, ${s.cabinRight} ${s.bodyTop} Z`;

  const winTop = s.roofY + 8;
  const winBottom = s.bodyTop - 8;
  const frontWin = `M ${s.cabinLeft + s.slant + 3} ${winTop}
      L ${s.cabinLeft + 13} ${winBottom} L ${(s.cabinLeft + s.cabinRight) / 2 - 6} ${winBottom}
      L ${(s.cabinLeft + s.cabinRight) / 2 - 6} ${winTop} Z`;
  const rearWin = `M ${(s.cabinLeft + s.cabinRight) / 2 + 6} ${winTop}
      L ${(s.cabinLeft + s.cabinRight) / 2 + 6} ${winBottom} L ${s.cabinRight - 13} ${winBottom}
      L ${s.cabinRight - s.slant - 3} ${winTop} Z`;

  const wheels = s.wheels
    .map(
      (x) => `
      <g class="car-wheel" style="transform-origin:${x}px ${bodyBottom}px">
        <circle cx="${x}" cy="${bodyBottom}" r="${s.wheelR}" fill="#2b2b30"/>
        <circle cx="${x}" cy="${bodyBottom}" r="${s.wheelR * 0.52}" fill="#e6e8ec"/>
        <circle cx="${x}" cy="${bodyBottom}" r="${s.wheelR * 0.18}" fill="#9aa0aa"/>
        <rect x="${x - 1.6}" y="${bodyBottom - s.wheelR * 0.5}" width="3.2" height="${s.wheelR}" rx="1.6" fill="#b9bec6"/>
        <rect x="${x - s.wheelR * 0.5}" y="${bodyBottom - 1.6}" width="${s.wheelR}" height="3.2" rx="1.6" fill="#b9bec6"/>
      </g>`
    )
    .join("");

  const roofRack =
    car.type === "jeep"
      ? `<rect x="${s.cabinLeft + 6}" y="${s.roofY - 9}" width="${s.cabinRight - s.cabinLeft - 12}" height="7" rx="3.5" fill="${dark}"/>`
      : "";

  const spoiler =
    car.type === "sport"
      ? `<rect x="${s.bodyRight - 44}" y="${s.bodyTop - 14}" width="44" height="8" rx="4" fill="${dark}"/>`
      : "";

  return `
  <svg viewBox="0 0 360 190" class="car-svg" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="180" cy="171" rx="142" ry="10" fill="#00000022"/>
    ${roofRack}${spoiler}
    <path d="${cabin}" fill="${car.color}" stroke="${dark}" stroke-width="3" stroke-linejoin="round"/>
    <path d="${frontWin}" fill="${glass}" opacity="0.95"/>
    <path d="${rearWin}" fill="${glass}" opacity="0.95"/>
    <path d="${frontWin}" fill="#ffffff" opacity="0.35"/>
    <rect x="${s.bodyLeft}" y="${s.bodyTop}" width="${s.bodyRight - s.bodyLeft}" height="${bodyBottom - s.bodyTop + 6}"
          rx="${car.type === "jeep" ? 12 : 22}" fill="${car.color}" stroke="${dark}" stroke-width="3"/>
    <rect x="${s.bodyLeft + 10}" y="${s.bodyTop + 6}" width="${s.bodyRight - s.bodyLeft - 20}" height="9" rx="4.5" fill="${light}" opacity="0.7"/>
    <rect x="${s.bodyLeft}" y="${bodyBottom - 10}" width="${s.bodyRight - s.bodyLeft}" height="14" rx="7" fill="${dark}" opacity="0.65"/>
    <rect x="${s.bodyLeft + 4}" y="${s.bodyTop + 26}" width="18" height="12" rx="6" fill="#fff4c2"/>
    <rect x="${s.bodyRight - 22}" y="${s.bodyTop + 26}" width="18" height="12" rx="6" fill="#ffc9c9"/>
    <rect x="${(s.cabinLeft + s.cabinRight) / 2 - 4}" y="${s.bodyTop + 4}" width="8" height="10" rx="4" fill="${dark}"/>
    ${wheels}
  </svg>`;
}

function getCar(id) {
  return CARS.find((c) => c.id === id) || CARS[0];
}
