const chars = "零一二三四五六七八九";
const py = {
  零: "líng",
  一: "yī",
  二: "èr",
  三: "sān",
  四: "sì",
  五: "wǔ",
  六: "liù",
  七: "qī",
  八: "bā",
  九: "jiǔ",
  十: "shí",
  百: "bǎi",
  千: "qiān",
  万: "wàn",
  两: "liǎng",
  元: "yuán",
  角: "jiǎo",
  分: "fēn",
  点: "diǎn",
  幺: "yāo",
};
export const pinyin = (s) => [...s].map((c) => py[c] || c).join(" ");
export function number(n) {
  if (!Number.isInteger(n) || n < 0 || n > 99999)
    throw new RangeError("Expected integer 0–99999");
  if (n === 0) return "零";
  function group(v) {
    let s = "",
      zero = false;
    for (const [u, label] of [
      [1000, "千"],
      [100, "百"],
      [10, "十"],
      [1, ""],
    ]) {
      let d = Math.floor(v / u) % 10;
      if (d) {
        if (zero) s += "零";
        s += chars[d] + label;
        zero = false;
      } else if (s && v % u) zero = true;
    }
    return s;
  }
  let s =
    n >= 10000
      ? chars[Math.floor(n / 10000)] +
        "万" +
        (n % 10000 ? (n % 10000 < 1000 ? "零" : "") + group(n % 10000) : "")
      : group(n);
  return s.startsWith("一十") ? s.slice(1) : s;
}
export function question(mode, value, id = "custom") {
  let spoken, answer, display, tip;
  if (mode === "numbers") {
    answer = String(value);
    spoken = number(value);
    display = Number(value).toLocaleString("en-US");
    tip =
      "Listen for units: 十 = 10 · 百 = 100 · 千 = 1,000 · 万 = 10,000. A 零 marks a gap.";
  } else if (mode === "prices") {
    const yuan = Math.floor(value / 100),
      jiao = Math.floor((value % 100) / 10),
      fen = value % 10;
    answer = (value / 100).toFixed(2);
    display = "¥" + answer;
    spoken =
      number(yuan) +
      "元" +
      (jiao ? chars[jiao] + "角" : "") +
      (fen ? (!jiao ? "零" : "") + chars[fen] + "分" : "");
    tip =
      "元 = yuan · 角 = 0.10 yuan · 分 = 0.01 yuan. We use the explicit 元 / 角 / 分 reading.";
  } else if (mode === "times") {
    const [h, m] = value;
    answer = `${h}:${String(m).padStart(2, "0")}`;
    display = answer;
    spoken =
      (h === 2 ? "两" : number(h)) +
      "点" +
      (m === 0 ? "" : (m < 10 ? "零" : "") + number(m) + "分");
    tip =
      "24-hour clock. 点 separates hours and minutes; 零 comes before single-digit minutes. 两点 means 2 o’clock.";
  } else if (mode === "phones") {
    answer = value;
    display =
      value.slice(0, 3) + " " + value.slice(3, 7) + " " + value.slice(7);
    spoken = [...value]
      .map((x) => (x === "1" ? "幺" : chars[Number(x)]))
      .join("，");
    tip =
      "Phone numbers are read digit by digit. 一 is often read 幺 (yāo) to make “one” clearer. These are fictional practice strings.";
  } else throw new RangeError("Unknown mode");
  return { id, mode, answer, display, spoken, pinyin: pinyin(spoken), tip };
}
export function normalize(mode, input) {
  let s = input
    .trim()
    .replace(/[０-９]/g, (c) => String(c.charCodeAt(0) - 65296));
  if (mode === "numbers") {
    s = s.replace(/[ ,，]/g, "");
    return /^\d+$/.test(s) ? String(Number(s)) : null;
  }
  if (mode === "prices") {
    s = s.replace(/[¥￥,，\s]/g, "");
    return /^\d+(\.\d{1,2})?$/.test(s) ? Number(s).toFixed(2) : null;
  }
  if (mode === "phones") {
    s = s.replace(/[\s()-]/g, "");
    return /^\d{11}$/.test(s) ? s : null;
  }
  if (mode === "times") {
    s = s.replace("：", ":").replace(".", ":");
    let m = s.match(/^(\d{1,2}):(\d{2})$/);
    return m && +m[1] < 24 && +m[2] < 60 ? `${+m[1]}:${m[2]}` : null;
  }
  return null;
}
export function makeDeck() {
  let deck = [];
  const nums = [
    [0, 1, 2, 7, 10, 11, 16, 20, 28, 40, 67, 99],
    [100, 101, 110, 200, 205, 250, 507, 999, 1000, 1001, 1010, 2026],
    [
      10000, 10001, 10010, 10100, 11000, 20005, 30408, 50000, 60006, 90090,
      99001, 99999,
    ],
  ];
  const prices = [
    [100, 200, 500, 900, 1000, 1200, 1500, 1800, 2000, 2800, 3500, 9900],
    [105, 110, 208, 250, 305, 680, 990, 1205, 1580, 2008, 2890, 9999],
    [
      10005, 10050, 10101, 20008, 25050, 30009, 50480, 60808, 88008, 99999,
      12345, 88888,
    ],
  ];
  for (const mode of ["numbers", "prices", "times", "phones"])
    for (let level = 0; level < 3; level++)
      for (let i = 0; i < 12; i++) {
        let value =
          mode === "numbers"
            ? nums[level][i]
            : mode === "prices"
              ? prices[level][i]
              : mode === "times"
                ? [
                    level === 0 ? (i + 1) % 12 : (i * 7 + level) % 24,
                    level === 0
                      ? [0, 30, 0, 30, 0, 30, 0, 30, 0, 30, 0, 30][i]
                      : level === 1
                        ? [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 0][i]
                        : [1, 2, 3, 4, 6, 7, 8, 9, 11, 21, 41, 59][i],
                  ]
                : "1" +
                  String(30 + ((i * 5 + level * 3) % 70)).padStart(2, "0") +
                  Array.from(
                    { length: 8 },
                    (_, k) => (i * 3 + k * (level + 2) + level) % 10,
                  ).join("");
        deck.push({ ...question(mode, value, `${mode}-${level}-${i}`), level });
      }
  return deck;
}
export const deck = makeDeck();
