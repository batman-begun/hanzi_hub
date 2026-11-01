// Conservative Simplified Chinese cardinal grammar, limited to the v0.6 range.
const digits = '零一二三四五六七八九';
const MAX = 9999999999n;

export function formatCardinal(value) {
  const text = String(value);
  if (!/^(0|[1-9]\d*)$/.test(text) || BigInt(text) > MAX) throw new RangeError('Expected integer 0–9999999999');
  let n = BigInt(text);
  if (n === 0n) return '零';
  const groups = [Number(n / 100000000n), Number(n / 10000n % 10000n), Number(n % 10000n)];
  const labels = ['亿', '万', ''];
  function group(v) {
    let result = '', gap = false;
    for (const [unit, label] of [[1000, '千'], [100, '百'], [10, '十'], [1, '']]) {
      const digit = Math.floor(v / unit) % 10;
      if (digit) { if (gap) result += '零'; result += digits[digit] + label; gap = false; }
      else if (result && v % unit) gap = true;
    }
    return result;
  }
  let result = '', gap = false;
  for (let i = 0; i < groups.length; i++) {
    const v = groups[i];
    if (!v) { if (result && groups.slice(i + 1).some(Boolean)) gap = true; continue; }
    if (result && (gap || v < 1000)) result += '零';
    result += group(v) + labels[i];
    gap = false;
  }
  return result.startsWith('一十') ? result.slice(1) : result;
}

// Match against the canonical rendering after decoding; accepted alternatives are
// deliberately restricted to grammatical 两 before 百/千/万/亿.
export function parseCardinal(input) {
  const s = String(input).normalize('NFKC').trim();
  if (!s || !/^[零一二三四五六七八九两十百千万亿]+$/.test(s)) return null;
  let total = 0n, section = 0n, digit = null, lastSmall = 10000n, lastBig = 10000000000n;
  for (const c of s) {
    const d = digits.indexOf(c);
    if (c === '零') { if (s === '零') return { value: '0', canonical: '零', variant: false }; if (digit !== null) return null; continue; }
    if (d >= 0 || c === '两') {
      if (digit !== null) return null;
      digit = BigInt(c === '两' ? 2 : d);
      continue;
    }
    const unit = ({十:10n, 百:100n, 千:1000n, 万:10000n, 亿:100000000n})[c];
    if (unit < 10000n) {
      if (unit >= lastSmall || digit === 0n) return null;
      section += (digit === null ? 1n : digit) * unit;
      digit = null; lastSmall = unit;
    } else {
      if (unit >= lastBig) return null;
      section += digit ?? 0n;
      if (section === 0n) return null;
      total += section * unit; section = 0n; digit = null; lastSmall = 10000n; lastBig = unit;
    }
  }
  const value = total + section + (digit ?? 0n);
  if (value > MAX) return null;
  const canonical = formatCardinal(value);
  // Rendered forms establish zero bridges and reject colloquial omissions.
  const normalized = s.replace(/两(?=[百千万亿])/g, '二');
  if (normalized !== canonical && !(canonical.startsWith('十') && normalized === '一' + canonical)) return null;
  return { value: String(value), canonical, variant: s !== canonical };
}
