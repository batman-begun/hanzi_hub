import { audioSource, NORMAL_RATE, SLOW_RATE } from "./audio-config.js";
import { deck, normalize } from "./engine.js";
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
  audio = $("#clip"),
  playToken = 0;
let stats = { answered: 0, correct: 0, sessions: 0 };
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
  round = shuffle(
    deck.filter((q) => q.mode === mode && q.level === level),
  ).slice(0, 10);
  index = 0;
  started = false;
  checked = false;
  misses = [];
  correct = 0;
  replays = 0;
  review = false;
  $("#results").hidden = true;
  $("#practice").hidden = false;
  $("#session-label").textContent = "THE LISTENING ROOM";
  $("#level-note").textContent = hints[mode][level];
  renderQuestion();
}
function renderQuestion() {
  stop();
  checked = false;
  $("#category").textContent =
    mode.toUpperCase() + " / " + ["WARM-UP", "EVERYDAY", "CHALLENGE"][level];
  $("#counter").textContent = started
    ? `${index + 1} / ${round.length}${review ? " · review" : ""}`
    : "10 questions · no rush";
  $("#progress").style.width = `${(index / round.length) * 100}%`;
  $("#prompt").innerHTML = started
    ? "Listen. Catch it."
    : "A little listening.<br>A lot less freezing.";
  $("#audio-status").textContent = started
    ? "Tap play when you’re ready."
    : "Tap play to begin your 10-question workout.";
  $("#answer").value = "";
  $("#answer").disabled = !started;
  $("#check").disabled = !started;
  $("#answer").placeholder = inputHints[mode][0];
  $("#answer").inputMode = inputHints[mode][2];
  $("#input-hint").textContent = inputHints[mode][1];
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
$("#answer-form").onsubmit = (e) => {
  e.preventDefault();
  if (!started || checked) return;
  let q = round[index],
    value = normalize(mode, $("#answer").value);
  if (value === null) {
    $("#input-hint").textContent = "Check the format. " + inputHints[mode][1];
    $("#answer").focus();
    return;
  }
  stop();
  checked = true;
  const ok = value === q.answer;
  if (ok) correct++;
  else misses.push(q);
  if (!review) {
    stats.answered++;
    if (ok) stats.correct++;
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
    : `Nearly. The answer is ${q.display}.`;
  let hanzi = document.createElement("span");
  hanzi.className = "hanzi";
  hanzi.lang = "zh-CN";
  hanzi.textContent = q.spoken;
  let reading = document.createElement("span");
  reading.className = "reading";
  reading.textContent = q.pinyin;
  let tip = document.createElement("p");
  tip.textContent = q.tip;
  box.append(strong, hanzi, reading, tip);
  box.hidden = false;
  $("#audio-status").textContent =
    "Replay to connect the sound to the pattern.";
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
      $("#session-label").textContent = "THE SECOND LISTEN";
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
  stats = { answered: 0, correct: 0, sessions: 0 };
  save();
  $("#erase").textContent = "Saved progress cleared ✓";
};
document.addEventListener("visibilitychange", () => {
  if (document.hidden) stop();
});
renderStats();
reset();
