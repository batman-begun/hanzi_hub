import { audioSource, NORMAL_RATE, SLOW_RATE } from "./audio-config.js?v=0.6";
import { allDeck as deck } from "./deck-v06.js?v=0.6";
import { grade } from "./grader.js?v=0.6";
const $ = (s) => document.querySelector(s);
let mode = "numbers",
  level = 0,
  round = [],
  index = 0,
  started = false,
  checked = false,
  misses = [],
  correct = 0,
  replays = 0,
  review = false,
  composing = false,
  audio = $("#clip"),
  playToken = 0;
let stats = { answered: 0, correct: 0, sessions: 0 };
let detail = {};
try { const saved = JSON.parse(localStorage.getItem("shu-detail-v1")); if (saved && typeof saved === "object" && !Array.isArray(saved)) detail = saved; } catch {}
try {
  const saved = JSON.parse(localStorage.getItem("shu-progress-v1"));
  if (
    saved &&
    ["answered", "correct", "sessions"].every(
      (k) => Number.isSafeInteger(saved[k]) && saved[k] >= 0,
    ) &&
    saved.correct <= saved.answered
  )
    stats = saved;
} catch {}
function save() {
  try {
    localStorage.setItem("shu-progress-v1", JSON.stringify(stats));
  } catch {}
  renderStats();
}
function renderStats() {
  $("#total").textContent = stats.answered
    ? `${stats.answered} ${stats.answered === 1 ? "rep" : "reps"}. ${stats.sessions} ${stats.sessions === 1 ? "workout" : "workouts"}.`
    : "Your first rep starts here.";
  $("#personal").textContent = stats.answered
    ? `${Math.round((stats.correct / stats.answered) * 100)}% accuracy · saved on this device`
    : "Progress stays on this device.";
}
const hints = {
  numbers: [
    "0–99 · Get your ears warmed up.",
    "100–2,026 · Find the missing places.",
    "10,000–99,999 · Think in 万.",
  ],
  prices: [
    "Whole yuan · A trip to the market.",
    "Yuan, jiao, fen · Catch the small change.",
    "Larger bills · Every decimal matters.",
  ],
  times: [
    "Hours and half-hours · Ease into it.",
    "24-hour clock · Five-minute intervals.",
    "Tricky minutes · Catch the zero.",
  ],
  phones: [
    "11 digits · Get to know each digit.",
    "11 digits · Your everyday pace.",
    "11 digits · Keep up with the flow.",
  ],
};
const inputHints = {
  numbers: [
    "Type the number",
    "Use digits, e.g. 28. Press Enter to check.",
    "numeric",
  ],
  prices: ["e.g. 28.50", "Enter yuan, e.g. 28.50 or ¥28.50.", "decimal"],
  times: ["e.g. 14:05", "Use 24-hour time, e.g. 14:05.", "text"],
  phones: ["11 digits", "Spaces are fine. Enter all 11 digits.", "tel"],
};
const text = (vi, en) => $("#language").value === "vi" ? vi : en;
const newHints = {
  numbers: ["100,000–99,999,999 · 万", "100,000,000–9,999,999,999 · 亿"],
  prices: ["Larger amounts · yuan and fen", "Large amounts · yuan and fen"],
  times: ["Quarter and half hours · 24-hour clock", "Quarter and half hours · 24-hour clock"],
  phones: ["11 digits · repeated digits", "11 digits · zeros and repetition"],
  builder: ["0–99", "100–2,026", "10,000–99,999", "100,000–99,999,999", "100,000,000–9,999,999,999"]
};
for (const key of ['numbers','prices','times','phones']) hints[key].push(...newHints[key]);
hints.builder = newHints.builder;
inputHints.builder = ['e.g. 一百零五', 'Write simplified Chinese numerals, e.g. 一百零五.', 'text'];
function renderInputHint() {
  const hint = {
    numbers: text("Nhập số, ví dụ 18.235.000 hoặc 18235000; dấu phẩy hoặc khoảng trắng cũng được.", "Enter digits, e.g. 18,235,000 or 18235000; spaces are also accepted."),
    prices: text("Nhập RMB, ví dụ ¥1,250.50; dấu chấm là phần lẻ, dấu phẩy ngăn hàng nghìn.", "Enter RMB, e.g. ¥1,250.50; period for decimals and commas for thousands."),
    times: text("Nhập giờ 24 tiếng, ví dụ 14:05.", "Enter 24-hour time, e.g. 14:05."),
    phones: text("Nhập đủ 11 chữ số; có thể dùng khoảng trắng, gạch nối hoặc ngoặc.", "Enter all 11 digits; spaces, hyphens and parentheses are accepted."),
    builder: text("Viết chữ Hán giản thể, ví dụ 一千零五; thêm 零 khi cần.", "Write simplified Chinese numerals, e.g. 一千零五; include required 零.")
  };
  $("#input-hint").dataset.noTranslate = "";
  $("#input-hint").textContent = hint[mode];
  $("#answer").placeholder = ({numbers:text("Ví dụ: 18235000", "e.g. 18235000"), prices:"¥1,250.50", times:"14:05", phones:"138 0012 3456", builder:text("Ví dụ: 一百零五", "e.g. 一百零五")})[mode];
}
function shuffle(a) {
  a = [...a];
  for (let i = a.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
function stop() {
  playToken++;
  audio.pause();
  audio.currentTime = 0;
  $("#play").classList.remove("playing");
}
function reset() {
  stop();
  const candidates = shuffle(deck.filter((q) => q.mode === mode && q.level === level));
  let history = {};
  try { history = JSON.parse(localStorage.getItem("shu-history-v1")) || {}; } catch {}
  const bucket = `${mode}-${level}`, seen = new Set(history[bucket] || []);
  round = [...candidates.filter(q => !seen.has(q.id)), ...candidates.filter(q => seen.has(q.id))].slice(0, 10);
  history[bucket] = round.map(q => q.id);
  try { localStorage.setItem("shu-history-v1", JSON.stringify(history)); } catch {}
  index = 0;
  started = mode === "builder";
  checked = false;
  misses = [];
  correct = 0;
  replays = 0;
  review = false;
  $("#results").hidden = true;
  $("#practice").hidden = false;
  $("#session-label").textContent = mode === "builder" ? text("LUYỆN VIẾT CHỮ HÁN", "HANZI BUILDER") : "THE LISTENING ROOM";
  $("#level-note").textContent = hints[mode][level];
  renderQuestion();
}
function renderQuestion() {
  stop();
  checked = false;
  $("#category").textContent =
    mode.toUpperCase() + " / " + ["WARM-UP", "EVERYDAY", "CHALLENGE", "EXPERT", "MASTER"][level];
  $("#counter").textContent = started
    ? `${index + 1} / ${round.length}${review ? " · review" : ""}`
    : "10 questions · no rush";
  $("#progress").style.width = `${(index / round.length) * 100}%`;
  $("#play").hidden = mode === "builder";
  $("#slow").hidden = mode === "builder";
  $("#prompt").innerHTML = mode === "builder" ? round[index].display : started
    ? "Listen. Catch it."
    : "A little listening.<br>A lot less freezing.";
  $("#audio-status").textContent = mode === "builder" ? text("Viết số này bằng chữ Hán giản thể.", "Write this number in simplified Chinese.") : started
    ? "Tap play when you’re ready."
    : "Tap play to begin your 10-question workout.";
  $("#answer").value = "";
  $("#answer").disabled = !started;
  $("#check").disabled = !started;
  $("#answer-form label").textContent = mode === "builder" ? text("VIẾT BẰNG CHỮ HÁN", "WRITE IN HANZI") : "WHAT DID YOU HEAR?";
  $("#answer").inputMode = "text";
  renderInputHint();
  $("#feedback").hidden = true;
  $("#next-row").hidden = true;
  $("#next").innerHTML =
    index === round.length - 1
      ? "See your results <span>→</span>"
      : "Next question <span>→</span>";
}
async function play(slow = false) {
  if (!started) {
    started = true;
    renderQuestion();
  }
  stop();
  let token = playToken;
  audio.src = audioSource(round[index].id);
  audio.playbackRate = slow ? SLOW_RATE : NORMAL_RATE;
  audio.preservesPitch = true;
  $("#audio-status").textContent = slow
    ? "Slower. You’ve got time."
    : "Listening…";
  $("#play").classList.add("playing");
  audio.onended = () => {
    if (token !== playToken) return;
    $("#play").classList.remove("playing");
    $("#audio-status").textContent = checked
      ? "Replay as often as you like."
      : "Your turn. Type what you heard.";
  };
  audio.onerror = () => {
    if (token !== playToken) return;
    $("#play").classList.remove("playing");
    $("#audio-status").textContent =
      "Audio unavailable. Check your connection, then tap play to retry.";
  };
  try {
    await audio.play();
    replays++;
  } catch {
    if (token === playToken) {
      $("#play").classList.remove("playing");
      $("#audio-status").textContent = "Tap play again to enable audio.";
    }
  }
}
$("#play").onclick = () => play();
$("#slow").onclick = () => play(true);
document.addEventListener("shu-language-changed", () => {
  renderInputHint();
  if (mode === "builder") {
    $("#session-label").textContent = text("LUYỆN VIẾT CHỮ HÁN", "HANZI BUILDER");
    $("#answer-form label").textContent = text("VIẾT BẰNG CHỮ HÁN", "WRITE IN HANZI");
    $("#audio-status").textContent = checked ? text("Đối chiếu cách viết bên dưới.", "Compare the written form below.") : text("Viết số này bằng chữ Hán giản thể.", "Write this number in simplified Chinese.");
  }
});
$("#answer").addEventListener("compositionstart", () => composing = true);
$("#answer").addEventListener("compositionend", () => composing = false);
$("#answer").addEventListener("keydown", e => { if (e.key === "Enter" && (e.isComposing || composing || e.keyCode === 229)) e.preventDefault(); });
$("#answer-form").onsubmit = (e) => {
  e.preventDefault();
  if (!started || checked) return;
  if (composing) return;
  let q = round[index],
    result = grade(q, $("#answer").value, $("#language").value);
  if (result.status === "INVALID_FORMAT" || result.status === "AMBIGUOUS_UNSUPPORTED") {
    $("#input-hint").textContent = result.diagnostic === "wrong_currency" ? text("Bài này dùng nhân dân tệ (¥), không dùng ký hiệu tiền tệ khác.", "Use RMB (¥), not another currency symbol.") : text("Định dạng chưa hợp lệ. Hãy sửa rồi thử lại.", "Invalid or unsupported format. Please revise and retry.");
    $("#answer").focus();
    return;
  }
  stop();
  checked = true;
  const ok = result.isCorrect;
  if (ok) correct++;
  else misses.push(q);
  if (!review) {
    stats.answered++;
    if (ok) stats.correct++;
    const key = `${mode}-${level}`, old = detail[key];
    const entry = old && Number.isSafeInteger(old.answered) && Number.isSafeInteger(old.correct) && old.answered >= old.correct && old.correct >= 0 ? old : {answered:0,correct:0};
    entry.answered++; if(ok) entry.correct++; detail[key] = entry;
    try { localStorage.setItem("shu-detail-v1", JSON.stringify(detail)); } catch {}
    save();
  }
  $("#answer").disabled = true;
  $("#check").disabled = true;
  let box = $("#feedback");
  box.className = "feedback" + (ok ? "" : " wrong");
  box.replaceChildren();
  let strong = document.createElement("strong");
  strong.textContent = ok
    ? "Caught it. ✓"
    : `Not quite. The answer is ${mode === "builder" ? q.spoken : q.display}.`;
  let hanzi = document.createElement("span");
  hanzi.className = "hanzi";
  hanzi.lang = "zh-CN";
  hanzi.textContent = q.spoken;
  let reading = document.createElement("span");
  reading.className = "reading";
  reading.textContent = q.pinyin;
  let tip = document.createElement("p");
  tip.textContent = mode === "builder" ? text("Chú ý nhóm vạn, ức và chữ 零 nối các hàng khuyết.", "Count in groups of 万 and 亿; use 零 for gaps.") : q.tip;
  if (result.status === "CORRECT_ACCEPTED_VARIANT") tip.textContent = text("Cách viết khác hợp lệ. ", "Valid alternative. ") + tip.textContent;
  box.append(strong, hanzi, reading, tip);
  box.hidden = false;
  $("#audio-status").textContent = mode === "builder" ? text("Đối chiếu cách viết bên dưới.", "Compare the written form below.") : "Replay to connect the sound to the pattern.";
  $("#next-row").hidden = false;
  $("#next").focus({ preventScroll: true });
};
$("#next").onclick = () => {
  if (!checked) return;
  index++;
  if (index >= round.length) finish();
  else {
    renderQuestion();
    $("#answer").focus({ preventScroll: true });
  }
};
function finish() {
  stop();
  if (!review) {
    stats.sessions++;
    save();
  }
  $("#practice").hidden = true;
  $("#results").hidden = false;
  $("#progress").style.width = "100%";
  $("#counter").textContent = review ? "Review complete" : "Workout complete";
  const r = $("#results");
  r.innerHTML = `<div class="eyebrow" style="justify-content:center">${review ? "ANOTHER REP IN THE BANK" : "WORKOUT COMPLETE"}</div><div class="score">${correct}<span style="font-size:28px;letter-spacing:0;color:#98a08d">/${round.length}</span></div><h2>${correct === round.length ? "Every number. Caught." : correct >= round.length * 0.7 ? "Your ears are getting sharper." : "Small reps. Big progress."}</h2><p>${misses.length ? "Those tricky ones? They’re your next breakthrough." : "Take that confidence into the real world."}<br>Accuracy is practice feedback, not a proficiency score.</p>`;
  if (misses.length) {
    let b = document.createElement("button");
    b.className = "primary";
    b.textContent = `Practice ${misses.length} missed ${misses.length === 1 ? "question" : "questions"} →`;
    b.onclick = () => {
      round = shuffle(misses);
      misses = [];
      index = 0;
      correct = 0;
      review = true;
      $("#session-label").textContent = mode === "builder" ? text("ÔN LẠI CÂU SAI", "REVIEW MISSED QUESTIONS") : "THE SECOND LISTEN";
      $("#results").hidden = true;
      $("#practice").hidden = false;
      renderQuestion();
    };
    r.append(b);
  }
  let b = document.createElement("button");
  b.className = misses.length ? "text-button" : "primary";
  b.textContent = "Start a new workout →";
  b.onclick = reset;
  r.append(b);
  let list = document.createElement("div");
  list.className = "results-list";
  for (const q of round) {
    let row = document.createElement("div");
    row.className = "result-item";
    let a = document.createElement("strong");
    a.textContent = q.display;
    let s = document.createElement("span");
    s.lang = "zh-CN";
    s.textContent = q.spoken;
    row.append(a, s);
    list.append(row);
  }
  r.append(list);
}
for (const b of document.querySelectorAll("[data-mode]"))
  b.onclick = () => {
    mode = b.dataset.mode;
    for (const x of document.querySelectorAll("[data-mode]")) {
      x.classList.toggle("active", x === b);
      x.setAttribute("aria-pressed", String(x === b));
    }
    reset();
  };
for (const b of document.querySelectorAll("[data-level]"))
  b.onclick = () => {
    level = +b.dataset.level;
    for (const x of document.querySelectorAll("[data-level]")) {
      x.classList.toggle("selected", x === b);
      x.setAttribute("aria-pressed", String(x === b));
    }
    reset();
  };
$("#restart").onclick = reset;
$("#guide-open").onclick = () => $("#guide").showModal();
$(".close").onclick = () => $("#guide").close();
$("#privacy").onclick = () => {
  $("#guide").showModal();
  $("#privacy-heading").scrollIntoView({ block: "start" });
};
$("#erase").onclick = () => {
  if (!confirm(text("Xóa toàn bộ tiến độ trên thiết bị này? Ngôn ngữ được giữ lại.", "Clear all progress on this device? Language is retained."))) return;
  stats = { answered: 0, correct: 0, sessions: 0 };
  try { localStorage.removeItem("shu-history-v1"); localStorage.removeItem("shu-detail-v1"); detail = {}; } catch {}
  save();
  $("#erase").textContent = "Saved progress cleared ✓";
};
const menu = $("#menu"), menuToggle = $("#menu-toggle");
function closeMenu() { menu.hidden = true; menuToggle.setAttribute("aria-expanded", "false"); }
menuToggle.onclick = () => { menu.hidden = !menu.hidden; menuToggle.setAttribute("aria-expanded", String(!menu.hidden)); if (!menu.hidden) menu.querySelector("button").focus(); };
document.addEventListener("keydown", e => { if (e.key === "Escape" && !menu.hidden) { closeMenu(); menuToggle.focus(); } });
document.addEventListener("click", e => { if (!e.target.closest(".menu-wrap")) closeMenu(); });
$("#guide-open").addEventListener("click", closeMenu);
$("#info-close").onclick = () => $("#info-dialog").close();
for (const button of document.querySelectorAll('[data-info]')) button.onclick = () => {
 closeMenu(); const kind=button.dataset.info, vi=$("#language").value==='vi';
 const content = {
 changes: vi ? 'v0.6 — 5 cấp, viết chữ Hán và chấm đáp án mới; mỗi nhóm có 12 câu nên sẽ gặp lại. v0.5 (31/10/2026) — giao diện tiếng Việt và âm thanh tạo sẵn.' : 'v0.6 — five levels, Hanzi Builder and updated grading; each group has 12 questions, so repetition occurs. v0.5 (2026-10-31) — Vietnamese interface and prepared audio.',
 audio: vi ? 'Giọng Google Translate được tạo sẵn, tốc độ thường 1.0 và chậm 0.8. Đây là giọng tổng hợp, không phải bản thu người bản xứ.' : 'Prepared Google Translate synthetic voice; normal 1.0 and slow 0.8. This is not a native speaker recording.',
 progress: vi ? `Đã làm ${stats.answered} câu · đúng ${stats.correct} · ${stats.sessions} bài. Đây là kết quả luyện tập, không phải đánh giá trình độ.` : `${stats.answered} attempts · ${stats.correct} correct · ${stats.sessions} workouts. Practice accuracy is not proficiency.`,
 about: vi ? 'SHÙ — Mandarin Number Gym. Tiến độ chỉ lưu trên thiết bị; không tài khoản, ghi âm hay theo dõi. Xóa tiến độ trong Hướng dẫn.' : 'SHÙ — Mandarin Number Gym. Progress stays on this device; no account, recording or tracking. Clear progress in Help.'
 }; if (kind === 'progress') { const rows=Object.entries(detail).filter(([,x])=>x && Number.isSafeInteger(x.answered) && x.answered>0 && Number.isSafeInteger(x.correct)).map(([k,x])=>`${k}: ${x.correct}/${x.answered}`); content.progress += rows.length ? "\n" + rows.join(" · ") : ""; } $("#info-content").style.whiteSpace='pre-line'; $("#info-content").textContent=content[kind]; $("#info-dialog").showModal();
};
document.addEventListener("visibilitychange", () => {
  if (document.hidden) stop();
});
renderStats();
reset();
