/* הגדרות הדמויות המלוות: הבהב (כלב), ג'ורג'י (קוף) ודובי (דובי)
   הבהב וג'ורג'י מעוצבים בהשראת הבובות האמיתיות של המשפחה.
   כל דמות מיוצרת כ-SVG וקטורי כדי שתיראה חדה בכל גודל ותתמוך במצבי רוח */

const COMPANIONS = {
  havhav: {
    key: "havhav",
    label: "הבהב",
    latin: "Hav Hav",
    say: "הב הב",
    bg: "#fbeedc",
    render(mood) {
      return baseHead({
        bodyColor: "#f3e6d2",
        eyeColor: "#5c3a1e",
        mouthColor: "#4a3222",
        ears: `
          <path d="M20 32 Q-2 50 8 94 Q26 102 34 78 Q40 48 20 32 Z" fill="#3f2a1a"/>
          <path d="M100 32 Q122 50 112 94 Q94 102 86 78 Q80 48 100 32 Z" fill="#3f2a1a"/>
        `,
        eyebrows: `
          <path d="M38 46 Q47 38 55 45" stroke="#4a3222" stroke-width="3" fill="none" stroke-linecap="round"/>
          <path d="M65 45 Q73 38 82 46" stroke="#4a3222" stroke-width="3" fill="none" stroke-linecap="round"/>
        `,
        snout: `<ellipse cx="60" cy="80" rx="27" ry="20" fill="#fbf4e9"/>
                <ellipse cx="60" cy="75" rx="10" ry="7" fill="#6b4226"/>`,
        extra: `<ellipse cx="60" cy="98" rx="8" ry="11" fill="#f2a2ad"/>`,
        mood,
      });
    },
  },
  georgie: {
    key: "georgie",
    label: "ג'ורג'י",
    latin: "Georgie",
    say: "ג׳ורג׳י",
    bg: "#f3e2cf",
    render(mood) {
      return baseHead({
        bodyColor: "#8b6239",
        eyeColor: "#2a1c10",
        mouthColor: "#4a3222",
        ears: `
          <circle cx="18" cy="60" r="14" fill="#8b6239"/>
          <circle cx="102" cy="60" r="14" fill="#8b6239"/>
          <circle cx="18" cy="60" r="7" fill="#e8cda3"/>
          <circle cx="102" cy="60" r="7" fill="#e8cda3"/>
        `,
        snout: `<ellipse cx="60" cy="68" rx="30" ry="32" fill="#e8cda3"/>`,
        extra: `<ellipse cx="60" cy="16" rx="14" ry="10" fill="#8b6239"/>`,
        noseDots: true,
        mood,
      });
    },
  },
  bear: {
    key: "bear",
    label: "דובי",
    latin: "Dubi",
    say: "דובי",
    bg: "#ffe0cf",
    render(mood) {
      return baseHead({
        bodyColor: "#b06a3d",
        eyeColor: "#3a2c22",
        mouthColor: "#3a2c22",
        ears: `
          <circle cx="26" cy="24" r="16" fill="#8f4f28"/>
          <circle cx="94" cy="24" r="16" fill="#8f4f28"/>
          <circle cx="26" cy="24" r="8" fill="#d69a67"/>
          <circle cx="94" cy="24" r="8" fill="#d69a67"/>
        `,
        snout: `<ellipse cx="60" cy="82" rx="20" ry="15" fill="#f3d9b1"/>
                <ellipse cx="60" cy="78" rx="7" ry="5" fill="#3a2c22"/>`,
        mood,
      });
    },
  },
};

function baseHead({
  bodyColor,
  ears,
  snout,
  mood,
  eyeColor = "#3a2c22",
  mouthColor = "#3a2c22",
  eyebrows = "",
  extra = "",
  noseDots = false,
}) {
  const happy = mood === "happy";
  const eyes = happy
    ? `<path d="M42 58 Q47 50 52 58" stroke="${eyeColor}" stroke-width="4" fill="none" stroke-linecap="round"/>
       <path d="M68 58 Q73 50 78 58" stroke="${eyeColor}" stroke-width="4" fill="none" stroke-linecap="round"/>`
    : `<circle cx="47" cy="56" r="5" fill="${eyeColor}"/>
       <circle cx="73" cy="56" r="5" fill="${eyeColor}"/>
       <circle cx="48.5" cy="54.5" r="1.6" fill="#fff"/>
       <circle cx="74.5" cy="54.5" r="1.6" fill="#fff"/>`;

  const mouth = happy
    ? `<path d="M48 90 Q60 102 72 90" stroke="${mouthColor}" stroke-width="4" fill="none" stroke-linecap="round"/>`
    : `<path d="M52 90 Q60 95 68 90" stroke="${mouthColor}" stroke-width="3" fill="none" stroke-linecap="round"/>`;

  const nose = noseDots
    ? `<ellipse cx="52" cy="80" rx="3" ry="4" fill="#3a2c22"/>
       <ellipse cx="68" cy="80" rx="3" ry="4" fill="#3a2c22"/>`
    : "";

  return `
  <svg viewBox="0 0 120 120" class="companion-svg" xmlns="http://www.w3.org/2000/svg">
    ${ears}
    <circle cx="60" cy="60" r="48" fill="${bodyColor}"/>
    <circle cx="60" cy="60" r="48" fill="url(#shine)" opacity="0.5"/>
    ${snout}
    ${nose}
    <circle cx="40" cy="76" r="7" fill="#ffb7a1" opacity="0.5"/>
    <circle cx="80" cy="76" r="7" fill="#ffb7a1" opacity="0.5"/>
    ${eyebrows}
    ${eyes}
    ${mouth}
    ${extra}
    <defs>
      <radialGradient id="shine" cx="35%" cy="25%" r="60%">
        <stop offset="0%" stop-color="#ffffff" stop-opacity="0.55"/>
        <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
      </radialGradient>
    </defs>
  </svg>`;
}

function renderCompanion(el, key, mood = "idle") {
  const c = COMPANIONS[key];
  if (!el || !c) return;
  el.innerHTML = c.render(mood);
  el.style.setProperty("--badge", c.bg);
}
