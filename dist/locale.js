import { translate } from "./translations.js?v=0.6";
// Keep canonical English per node so switching languages preserves live form,
// audio, feedback and focus state. Observe only changed DOM subtrees.
let language = "vi";
try {
  const saved = localStorage.getItem("shu-language-v1");
  if (saved === "en" || saved === "vi") language = saved;
} catch {}
const originals = new WeakMap();
const attributes = new WeakMap();
const selector = document.querySelector("#language");
function text(node) {
  if (
    node.parentElement?.closest(
      'script,style,[data-no-translate], [lang="zh-CN"]',
    )
  )
    return;
  const old = originals.get(node);
  const source = old && node.data === old.output ? old.source : node.data;
  const output = translate(source, language);
  originals.set(node, { source, output });
  if (node.data !== output) node.data = output;
}
function element(el) {
  for (const name of ["aria-label", "placeholder"]) {
    if (!el.hasAttribute(name)) continue;
    let record = attributes.get(el) || {};
    const value = el.getAttribute(name),
      old = record[name];
    const source = old && value === old.output ? old.source : value;
    const output = translate(source, language);
    record[name] = { source, output };
    attributes.set(el, record);
    if (value !== output) el.setAttribute(name, output);
  }
}
function localize(root) {
  if (root.nodeType === 3) {
    text(root);
    return;
  }
  if (root.nodeType !== 1) return;
  element(root);
  const walker = document.createTreeWalker(
    root,
    NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT,
  );
  while (walker.nextNode()) {
    const n = walker.currentNode;
    if (n.nodeType === 3) text(n);
    else element(n);
  }
}
const observer = new MutationObserver((records) => {
  observer.disconnect();
  for (const r of records) {
    if (r.type === "childList") for (const n of r.addedNodes) localize(n);
    else if (r.type === "characterData") text(r.target);
    else element(r.target);
  }
  observe();
});
function observe() {
  observer.observe(document.body, {
    subtree: true,
    childList: true,
    characterData: true,
    attributes: true,
    attributeFilter: ["placeholder", "aria-label"],
  });
}
function apply() {
  observer.disconnect();
  document.documentElement.lang = language;
  selector.value = language;
  localize(document.body);
  document.title =
    language === "vi"
      ? "SHÙ 数字 — Luyện nghe số tiếng Trung"
      : "SHÙ 数字 — Mandarin Number Gym";
  const description =
    language === "vi"
      ? "Luyện nghe số đếm, giá tiền, giờ giấc và số điện thoại tiếng Trung. Mỗi lượt 10 câu, không cần tài khoản."
      : "Free Mandarin listening workouts for numbers, prices, times and phone numbers. No account needed.";
  document.querySelector('meta[name="description"]').content = description;
  observe();
  document.dispatchEvent(new Event("shu-language-changed"));
}
selector.addEventListener("change", () => {
  language = selector.value;
  try {
    localStorage.setItem("shu-language-v1", language);
  } catch {}
  apply();
});
apply();
