import { test } from 'node:test';
import assert from 'node:assert/strict';
import { formatCardinal, parseCardinal } from '../dist/cardinal.js';

test('large cardinal boundaries and zero bridges', () => {
  for (const [value, hanzi] of [[0,'零'], [10,'十'], [11,'十一'], [101,'一百零一'], [1005,'一千零五'], [10000,'一万'], [100000,'十万'], [100000000,'一亿'], [18235000,'一千八百二十三万五千'], [1026000000,'十亿二千六百万'], [100010001,'一亿零一万零一'], [9999999999,'九十九亿九千九百九十九万九千九百九十九']]) {
    assert.equal(formatCardinal(value), hanzi);
    assert.equal(parseCardinal(hanzi)?.value, String(value));
  }
});
test('rejects malformed and unsupported numerals', () => {
  for (const s of ['一千五','一千五百零','两十','一百零零五','一亿万','-1','1e3']) assert.equal(parseCardinal(s), null, s);
  assert.equal(parseCardinal('两百')?.value, '200');
  for (const s of ['-1', '1.5', '1e3', '10000000000']) assert.throws(() => formatCardinal(s));
});
test('cardinal round trips across boundaries and sampled range', () => {
  for(let n=0;n<100000;n++){ const s=formatCardinal(n); assert.equal(parseCardinal(s)?.value,String(n),`${n}: ${s}`); }
  let x=1n; for(let i=0;i<10000;i++){ x=(x*48271n)%9999999999n; const s=formatCardinal(x); assert.equal(parseCardinal(s)?.value,String(x),`${x}: ${s}`); }
});
