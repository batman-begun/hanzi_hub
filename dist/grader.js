import { parseCardinal } from './cardinal.js?v=0.6';
function digits(s) { return s.normalize('NFKC').trim(); }
function integer(s, locale) {
  if (/^\d+$/.test(s)) return s.replace(/^0+(?=\d)/,'');
  const marks = locale==='vi' ? '[., ]' : '[, ]';
  if (!new RegExp(`^\\d{1,3}(${marks}\\d{3})+$`).test(s)) return null;
  const groups=s.match(/[., ]/g); if (new Set(groups).size!==1) return null;
  return s.replace(/[., ]/g,'').replace(/^0+(?=\d)/,'');
}
export function grade(q, input, locale='vi') {
  const s=digits(input); let value=null, diagnostic='invalid_format';
  if (q.mode==='builder') { const p=parseCardinal(s); if(p) { value=p.value; diagnostic=p.variant?'supported_alternative':'canonical'; } else if (/^[一二三四五六七八九两][百千万亿][一二三四五六七八九两]$/.test(s)) return {status:'AMBIGUOUS_UNSUPPORTED',isCorrect:false,diagnostic:'ambiguous_numeral'}; }
  if (q.mode==='numbers') { value=integer(s,locale); if (value !== null && (value.length > 10 || BigInt(value) > 9999999999n)) value=null; }
  if (q.mode==='phones' && /^[\d ()-]+$/.test(s)) { let x=s.replace(/[ ()-]/g,''); if(/^\d{11}$/.test(x)) value=x; }
  if (q.mode==='times') { let m=s.match(/^(\d{1,2}):(\d{2})$/); if(m && +m[1]<24 && +m[2]<60) value=`${+m[1]}:${m[2]}`; }
  if (q.mode==='prices') {
    if (/[$€£]/.test(s)) diagnostic='wrong_currency';
    else {
      let x=s.replace(/^[¥]\s*/,'');
      // A period is always the decimal separator; comma groups thousands.
      let m=x.match(/^(\d+|\d{1,3}(?:,\d{3})+)(?:\.(\d{1,2}))?$/);
      if(m) value=m[1].replace(/,/g,'').replace(/^0+(?=\d)/,'')+'.'+(m[2]||'').padEnd(2,'0');
    }
  }
  if(value===null) return {status:'INVALID_FORMAT',isCorrect:false,diagnostic};
  const correct=value===q.answer;
  const canonical=correct && (q.mode==='builder'?s===q.spoken:s===q.answer);
  return {status:correct?(canonical?'CORRECT_CANONICAL':'CORRECT_ACCEPTED_VARIANT'):'INCORRECT_MEANING',isCorrect:correct,diagnostic:correct?(canonical?'canonical':'supported_alternative'):'wrong_value',value};
}
