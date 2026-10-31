import { test } from "node:test";
import assert from "node:assert/strict";
import { number, question, normalize, deck } from "../dist/engine.js";
test("number boundaries, zero bridges, ten prefix and 万", () => {
  for (const [n, s] of [
    [0, "零"],
    [10, "十"],
    [11, "十一"],
    [20, "二十"],
    [101, "一百零一"],
    [110, "一百一十"],
    [1001, "一千零一"],
    [1010, "一千零一十"],
    [10000, "一万"],
    [10001, "一万零一"],
    [10010, "一万零一十"],
    [10100, "一万零一百"],
    [11000, "一万一千"],
    [20005, "二万零五"],
    [99999, "九万九千九百九十九"],
  ])
    assert.equal(number(n), s);
  for (const n of [-1, 1.5, 100000, NaN]) assert.throws(() => number(n));
});
test("exhaustive 0–99999 structural invariants", () => {
  const seen = new Set();
  for (let n = 0; n < 100000; n++) {
    let s = number(n);
    assert.ok(s);
    assert.ok(!s.includes("零零"));
    if (n) assert.ok(!s.endsWith("零"));
    assert.ok(!seen.has(s), `${n}: duplicate ${s}`);
    seen.add(s);
  }
});
test("money zero and decimal edge cases", () => {
  for (const [v, s] of [
    [0, "零元"],
    [105, "一元零五分"],
    [110, "一元一角"],
    [1010, "十元一角"],
    [99999, "九百九十九元九角九分"],
  ])
    assert.equal(question("prices", v).spoken, s);
  assert.equal(normalize("prices", "￥１,２０５.５"), "1205.50");
  assert.equal(normalize("prices", "1.005"), null);
  assert.equal(normalize("prices", "-1"), null);
});
test("clock midnight, two, leading zero, invalid times", () => {
  assert.equal(question("times", [0, 0]).spoken, "零点");
  assert.equal(question("times", [2, 5]).spoken, "两点零五分");
  assert.equal(question("times", [23, 59]).answer, "23:59");
  assert.equal(normalize("times", "０２：０５"), "2:05");
  for (const s of ["24:00", "12:60", "-1:05", "2:5"])
    assert.equal(normalize("times", s), null);
});
test("phone digits and answer normalization", () => {
  assert.equal(
    question("phones", "13010002001").spoken,
    "幺，三，零，幺，零，零，零，二，零，零，幺",
  );
  assert.equal(normalize("phones", "130 1000 2001"), "13010002001");
  assert.equal(normalize("phones", "1301000200"), null);
  assert.equal(normalize("numbers", "０１,００１"), "1001");
  assert.equal(normalize("numbers", "1e3"), null);
});
test("balanced deck, unique IDs and roundtrip answers", () => {
  assert.equal(deck.length, 144);
  assert.equal(new Set(deck.map((q) => q.id)).size, 144);
  for (const mode of ["numbers", "prices", "times", "phones"])
    for (let level = 0; level < 3; level++)
      assert.equal(
        deck.filter((q) => q.mode === mode && q.level === level).length,
        12,
      );
  for (const q of deck) {
    assert.equal(normalize(q.mode, q.answer), q.answer);
    assert.ok(!q.pinyin.includes("undefined"));
  }
});
test("every generated cardinal decodes to its original value independently", () => {
  const digits = Object.fromEntries(
    [..."零一二三四五六七八九"].map((c, i) => [c, i]),
  );
  const units = { 十: 10, 百: 100, 千: 1000 };
  function decode(s) {
    let total = 0,
      group = 0,
      digit = 0;
    for (const c of s) {
      if (c in digits) digit = digits[c];
      else if (c === "万") {
        total += (group + digit) * 10000;
        group = 0;
        digit = 0;
      } else {
        group += (digit || 1) * units[c];
        digit = 0;
      }
    }
    return total + group + digit;
  }
  for (let n = 0; n < 100000; n++) assert.equal(decode(number(n)), n);
});

test("each mode and level has twelve distinct answers", () => {
  for (const mode of ["numbers", "prices", "times", "phones"])
    for (let level = 0; level < 3; level++)
      assert.equal(
        new Set(
          deck
            .filter((q) => q.mode === mode && q.level === level)
            .map((q) => q.answer),
        ).size,
        12,
      );
});
