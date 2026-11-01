import { deck as legacy, pinyin } from './engine.js?v=0.6';
import { formatCardinal } from './cardinal.js?v=0.6';
const numeric = [
 [18, 23, 45, 67, 80, 99, 10, 11, 20, 34, 56, 78],
 [101, 110, 205, 250, 507, 999, 1000, 1005, 1010, 2026, 1888, 1208],
 [10000, 10001, 10100, 11000, 20005, 30408, 50000, 60006, 90090, 99001, 99999, 12345],
 [100000, 100001, 120005, 1000000, 1000200, 1020000, 18235000, 20000500, 30001001, 88888888, 99999999, 50000005],
 [100000000, 100000001, 100010001, 1026000000, 1000000001, 2000300040, 3200500010, 5006007008, 9000000000, 9999999999, 1234567890, 1002003004]
];
const prices = [
 [100005,120050,200008,300100,500005,1000000,1000005,1234567,2000500,5000088,8888808,9999999],
 [10000005,10000050,12000008,20000101,30005005,50000050,80008008,100000001,200030004,500000005,888888888,999999999]
];
const phones = [
 ['13000000001','13111111112','13222222223','13333333334','13444444445','13555555556','13666666667','13777777778','13888888889','13999999990','13001000100','13100100100'],
 ['13000100001','13101010101','13202020202','13303030303','13404040404','13505050505','13606060606','13707070707','13808080808','13909090909','13000010000','13111101111']
];
const times = [
 [[0,15],[1,30],[2,45],[3,15],[4,30],[5,45],[6,15],[7,30],[8,45],[9,15],[10,30],[11,45]],
 [[12,15],[13,30],[14,45],[15,15],[16,30],[17,45],[18,15],[19,30],[20,45],[21,15],[22,30],[23,45]]
];
const chars='零一二三四五六七八九';
function record(mode, level, i) {
  let answer, spoken, display, tip;
  if (mode === 'numbers') { answer=String(numeric[level][i]); spoken=formatCardinal(answer); display=BigInt(answer).toLocaleString('en-US'); tip='Count in groups of 万 and 亿; 零 bridges missing places.'; }
  if (mode === 'prices') { let fen=prices[level-3][i], yuan=Math.floor(fen/100), j=Math.floor(fen%100/10), f=fen%10; answer=`${yuan}.${String(fen%100).padStart(2,'0')}`; display='¥'+answer; spoken=formatCardinal(yuan)+'元'+(j?chars[j]+'角':'')+(f?(!j?'零':'')+chars[f]+'分':''); tip='元 = yuan · 角 = 0.10 yuan · 分 = 0.01 yuan.'; }
  if (mode === 'times') { let [h,m]=times[level-3][i]; answer=`${h}:${String(m).padStart(2,'0')}`; display=answer; spoken=(h===2?'两':formatCardinal(h))+'点'+({15:'一刻',30:'半',45:'四十五分'}[m]); tip='24-hour clock; 一刻 means 15 minutes and 半 means 30 minutes.'; }
  if (mode === 'phones') { answer=phones[level-3][i]; display=answer.slice(0,3)+' '+answer.slice(3,7)+' '+answer.slice(7); spoken=[...answer].map(x=>x==='1'?'幺':chars[+x]).join('，'); tip='Phone numbers are read digit by digit. 幺 means 1.'; }
  return {id:`${mode}-${level}-${i}`,mode,level,answer,spoken,display,pinyin:pinyin(spoken),tip};
}
export const newListening = ['numbers','prices','times','phones'].flatMap(mode=>[3,4].flatMap(level=>Array.from({length:12},(_,i)=>record(mode,level,i))));
export const builder = numeric.flatMap((values,level)=>values.map((value,i)=>({id:`builder-${level}-${i}`,mode:'builder',level,answer:String(value),display:BigInt(value).toLocaleString('en-US'),spoken:formatCardinal(value),pinyin:pinyin(formatCardinal(value)),tip:'Use simplified Chinese numerals and include necessary 零 bridges.'})));
export const allDeck = [...legacy,...newListening,...builder];
