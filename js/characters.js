/* הגדרות הדמויות המלוות (כלב, דובי, קופיף) בסגנון בובת פלאש חמודה
   כל דמות מיוצרת כ-SVG וקטורי כדי שתיראה חדה בכל גודל ותתמוך במצבי רוח */

const COMPANIONS = {
  dog: {
    key: "dog",
    label: "כלבלב",
    bg: "#ffe9d6",
    render(mood) {
      return baseHead({
        bodyColor: "#f0b96e",
        ears: `
          <path d="M22 34 Q2 50 10 92 Q26 100 34 78 Q40 50 22 34 Z" fill="#d1893f"/>
          <path d="M98 34 Q118 50 110 92 Q94 100 86 78 Q80 50 98 34 Z" fill="#d1893f"/>
        `,
        snout: `<ellipse cx="60" cy="80" rx="26" ry="19" fill="#fff6ec"/>
                <ellipse cx="60" cy="76" rx="9" ry="6" fill="#3a2c22"/>`,
        mood,
      });
    },
  },
  bear: {
    key: "bear",
    label: "דובי",
    bg: "#ffe0cf",
    render(mood) {
      return baseHead({
        bodyColor: "#b06a3d",
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
  monkey: {
    key: "monkey",
    label: "קופיף",
    bg: "#ffedd0",
    render(mood) {
      return baseHead({
        bodyColor: "#6b4226",
        ears: `
          <circle cx="14" cy="58" r="19" fill="#6b4226"/>
          <circle cx="106" cy="58" r="19" fill="#6b4226"/>
          <circle cx="14" cy="58" r="11" fill="#f0dcc0"/>
          <circle cx="106" cy="58" r="11" fill="#f0dcc0"/>
        `,
        snout: `<ellipse cx="60" cy="66" rx="32" ry="34" fill="#f0dcc0"/>
                <ellipse cx="60" cy="86" rx="8" ry="5" fill="#3a2c22"/>`,
        mood,
      });
    },
  },
};

function baseHead({ bodyColor, ears, snout, mood }) {
  const happy = mood === "happy";
  const eyes = happy
    ? `<path d="M42 58 Q47 50 52 58" stroke="#3a2c22" stroke-width="4" fill="none" stroke-linecap="round"/>
       <path d="M68 58 Q73 50 78 58" stroke="#3a2c22" stroke-width="4" fill="none" stroke-linecap="round"/>`
    : `<circle cx="47" cy="56" r="5" fill="#3a2c22"/>
       <circle cx="73" cy="56" r="5" fill="#3a2c22"/>
       <circle cx="48.5" cy="54.5" r="1.6" fill="#fff"/>
       <circle cx="74.5" cy="54.5" r="1.6" fill="#fff"/>`;

  const mouth = happy
    ? `<path d="M48 90 Q60 102 72 90" stroke="#3a2c22" stroke-width="4" fill="none" stroke-linecap="round"/>`
    : `<path d="M52 90 Q60 95 68 90" stroke="#3a2c22" stroke-width="3" fill="none" stroke-linecap="round"/>`;

  return `
  <svg viewBox="0 0 120 120" class="companion-svg" xmlns="http://www.w3.org/2000/svg">
    ${ears}
    <circle cx="60" cy="60" r="48" fill="${bodyColor}"/>
    <circle cx="60" cy="60" r="48" fill="url(#shine)" opacity="0.5"/>
    ${snout}
    <circle cx="40" cy="76" r="7" fill="#ffb7a1" opacity="0.6"/>
    <circle cx="80" cy="76" r="7" fill="#ffb7a1" opacity="0.6"/>
    ${eyes}
    ${mouth}
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
