'use strict';
// ============ 画布与像素图工具 ============
function makeCanvas(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
function hexToRgb(h) { h = h.replace('#', ''); if (h.length === 3) h = h.split('').map(c => c + c).join(''); const n = parseInt(h, 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }
function rgbToHex(r, g, b) { return '#' + [r, g, b].map(v => clamp(Math.round(v), 0, 255).toString(16).padStart(2, '0')).join(''); }
function shade(hex, f) { const [r, g, b] = hexToRgb(hex); if (f < 0) return rgbToHex(r * (1 + f), g * (1 + f), b * (1 + f)); return rgbToHex(r + (255 - r) * f, g + (255 - g) * f, b + (255 - b) * f); }
function mix(a, b, t) { const A = hexToRgb(a), B = hexToRgb(b); return rgbToHex(lerp(A[0], B[0], t), lerp(A[1], B[1], t), lerp(A[2], B[2], t)); }

function buildSprite(rows, pal) {
  const h = rows.length; let w = 0; for (const r of rows) w = Math.max(w, r.length);
  const c = makeCanvas(w, h), g = c.getContext('2d');
  for (let y = 0; y < h; y++) {
    const r = rows[y];
    for (let x = 0; x < r.length; x++) {
      const ch = r[x]; if (ch === '.' || ch === ' ') continue;
      const col = pal[ch]; if (!col) continue;
      g.fillStyle = col; g.fillRect(x, y, 1, 1);
    }
  }
  return c;
}
function sym(rows) { return rows.map(r => { r = r.padEnd(8, '.').slice(0, 8); return r + r.split('').reverse().join(''); }); }
function pad16(rows) { const out = rows.map(r => r.padEnd(16, '.').slice(0, 16)); while (out.length < 16) out.unshift('................'); return out.slice(0, 16); }
function flipCanvas(src) { const c = makeCanvas(src.width, src.height), g = c.getContext('2d'); g.translate(src.width, 0); g.scale(-1, 1); g.drawImage(src, 0, 0); return c; }
const _silCache = new WeakMap();
function silhouette(src, color) { let m = _silCache.get(src); if (!m) { m = {}; _silCache.set(src, m); } if (m[color]) return m[color]; const c = makeCanvas(src.width, src.height), g = c.getContext('2d'); g.drawImage(src, 0, 0); g.globalCompositeOperation = 'source-in'; g.fillStyle = color; g.fillRect(0, 0, c.width, c.height); m[color] = c; return c; }

// ============ 文字与对话框 ============
function setFont(ctx, size, bold) { ctx.font = (bold ? 'bold ' : '') + size + 'px ' + FONT; }
function drawText(ctx, text, x, y, color, size, align, shadow, bold) {
  setFont(ctx, size || 10, bold);
  ctx.textAlign = align || 'left'; ctx.textBaseline = 'top';
  if (shadow) { ctx.fillStyle = shadow === true ? 'rgba(0,0,0,0.6)' : shadow; ctx.fillText(text, x + 0.6, y + 0.6); }
  ctx.fillStyle = color || '#fff'; ctx.fillText(text, x, y);
}
function textW(ctx, text, size, bold) { setFont(ctx, size || 10, bold); return ctx.measureText(text).width; }
function wrapText(ctx, text, maxW, size) {
  setFont(ctx, size || 10);
  const out = [];
  for (const para of String(text).split('\n')) {
    let line = '';
    for (const ch of para) {
      const t = line + ch;
      if (ctx.measureText(t).width > maxW && line) { out.push(line); line = ch === ' ' ? '' : ch; }
      else line = t;
    }
    out.push(line);
  }
  return out;
}
function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath(); ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y); ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r); ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h); ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r); ctx.lineTo(x, y + r); ctx.quadraticCurveTo(x, y, x + r, y); ctx.closePath();
}
function drawBox(ctx, x, y, w, h, style) {
  if (style === 'dark') {
    ctx.fillStyle = 'rgba(28,22,40,0.92)'; roundRect(ctx, x, y, w, h, 4); ctx.fill();
    ctx.strokeStyle = '#8a7ab0'; ctx.lineWidth = 1; roundRect(ctx, x + 0.5, y + 0.5, w - 1, h - 1, 4); ctx.stroke();
    return;
  }
  ctx.fillStyle = '#7a4a24'; roundRect(ctx, x, y, w, h, 5); ctx.fill();
  ctx.fillStyle = '#f9ecc8'; roundRect(ctx, x + 2, y + 2, w - 4, h - 4, 4); ctx.fill();
  ctx.strokeStyle = '#d8b880'; ctx.lineWidth = 1; roundRect(ctx, x + 3.5, y + 3.5, w - 7, h - 7, 3); ctx.stroke();
}
function drawBar(ctx, x, y, w, h, frac, color, bg) {
  ctx.fillStyle = bg || '#3a3040'; ctx.fillRect(x, y, w, h);
  ctx.fillStyle = color; ctx.fillRect(x, y, Math.max(0, Math.round(w * clamp(frac, 0, 1))), h);
}

// ============ 人物精灵 ============
const CHAR_ROWS = (() => {
  const downTop = [
    '........', '.....kkk', '...kkhhh', '..khhhhh', '..khhhhh', '.khhhhhh', '.khhssss', '.khssess', '.khssess',
    '..kkssss', '....kccc', '..kscccc', '..ksCccc', '...kpppp',
  ];
  const down = sym(downTop.concat(['...kpppk', '...kbbk.']));
  const downB = sym(downTop).concat(['....kppkkppk....', '....kbk..kbk....']);
  const upTop = [
    '........', '.....kkk', '...kkhhh', '..khhhhh', '..khhhhh', '.khhhhhh', '.khhhhhh', '.khhhhhh', '.kHhhhhh',
    '..kkHhhh', '....kccc', '..kscccc', '..ksCccc', '...kpppp',
  ];
  const up = sym(upTop.concat(['...kpppk', '...kbbk.']));
  const upB = sym(upTop).concat(['....kppkkppk....', '....kbk..kbk....']);
  const sideTop = [
    '................', '.....kkkkk......', '....khhhhhk.....', '...khhhhhhhk....', '...khhhhhhhhk...', '..khhhhhhhhhk...',
    '..khhhhhssssk...', '..khhhhsssesk...', '..khhhhsssesk...', '...khhhssssk....', '....kkccccck....', '....kccccsck....',
    '....kcCCcsck....', '....kppppk......',
  ];
  const side = sideTop.concat(['....kpkkpk......', '....kbk.kbk.....']);
  const sideB = sideTop.concat(['.....kppk.......', '.....kbbk.......']);
  return { down, downB, up, upB, side, sideB };
})();
const charCache = {};
function charPal(look) {
  return {
    k: '#2a1a14', h: look.hair, H: shade(look.hair, -0.3), s: look.skin || '#f5cba7', e: '#1a1a2e', w: '#fff',
    c: look.shirt, C: shade(look.shirt, -0.28), p: look.pants, b: look.shoes || '#4a3020',
  };
}
function getCharFrames(look) {
  const key = JSON.stringify(look);
  if (charCache[key]) return charCache[key];
  const pal = charPal(look);
  const R = CHAR_ROWS;
  const right = [buildSprite(R.side, pal), buildSprite(R.sideB, pal)];
  const f = {
    down: [buildSprite(R.down, pal), buildSprite(R.downB, pal)],
    up: [buildSprite(R.up, pal), buildSprite(R.upB, pal)],
    right, left: right.map(flipCanvas),
  };
  if (look.beard) {
    for (const fr of f.down) { const g = fr.getContext('2d'); g.fillStyle = look.beard; g.fillRect(5, 9, 6, 2); g.fillRect(6, 11, 4, 1); }
    for (const fr of f.right.concat(f.left)) { const g = fr.getContext('2d'); g.fillStyle = look.beard; g.fillRect(fr === f.left[0] || fr === f.left[1] ? 4 : 7, 9, 5, 2); }
  }
  if (look.hat) {
    for (const k of ['down', 'up', 'left', 'right']) for (const fr of f[k]) { const g = fr.getContext('2d'); g.fillStyle = look.hat; g.fillRect(3, 1, 10, 3); g.fillRect(1, 3, 14, 1); g.fillStyle = shade(look.hat, -0.3); g.fillRect(3, 3, 10, 1); }
  }
  charCache[key] = f;
  return f;
}
function drawChar(ctx, look, dir, frame, x, y) {
  const f = getCharFrames(look);
  ctx.drawImage(f[DIR_NAMES[dir]][frame & 1], Math.round(x), Math.round(y));
}

// ============ 灵兽 / 敌人模板 ============
const MON_TPL = {
  blob: { sym: true, rows: ['........', '........', '........', '........', '........', '......kk', '....kkaa', '...kaaca', '..kaacca', '..kaaaaa', '.kaaweaa', '.kaaeeaa', '.kbaaaar', '.kbbaaaa', '..kbbbbb', '...kkkkk'] },
  sprout: { sym: true, rows: ['........', '....kk..', '...kddk.', '....kddk', '.....kdk', '......kk', '....kkaa', '...kaaca', '..kaacca', '..kaaaaa', '.kaaweaa', '.kaaeeaa', '.kbaaaar', '.kbbaaaa', '..kbbbbb', '...kkkkk'] },
  pup: { sym: true, rows: ['........', '..k.....', '..kk....', '..kdk...', '..kdak..', '..kaaakk', '..kaaaaa', '.kaaaaaa', '.kaweaaa', '.kaeeaac', '..kaacck', '..kbacck', '...kaccc', '..kbaacc', '..kbakac', '..kkk.kk'] },
  bird: { sym: true, rows: ['........', '........', '.....k.k', '.....kdk', '....kkaa', '...kaaaa', '..kaaaaa', '..kaweaa', '..kaeeaa', 'kkkaaakd', 'kbbkaaad', '.kbbkccc', '..kbkccc', '...kcccc', '....kkkk', '.....d..'] },
  bug: { sym: true, rows: ['........', '...k....', '....k...', '.....kkk', '....kaaa', '...kawea', '...kaeea', '..kkkkkk', '.kbdaaak', 'kbaadaak', 'kbaaaaak', 'kbadaaak', 'kbaaaaak', '.kbaaaak', 'k.kkkkkk', '.k.k....'] },
  mouse: { sym: true, rows: ['........', '.kkk....', 'kdddk...', 'kdddk...', 'kddkkkkk', '.kkaaaaa', '..kaaaaa', '.kaaaaaa', '.kaweaaa', '.kaeeaaa', '.kadacca', '..kaccck', '..kaccca', '...kaaaa', '...kbkab', '...kk.kk'] },
  golem: { sym: true, rows: ['........', '........', '....kkkk', '...kaaaa', '...kacaa', '...kaaaa', '...kawea', '...kbaaa', '.kkkkkkk', 'kaabaaac', 'kacbaaaa', 'kaakaaaa', 'kbk.kbaa', 'kk..kbaa', '....kbbk', '....kkkk'] },
  ghost: { sym: true, rows: ['........', '........', '.....kkk', '....kaaa', '...kaaaa', '..kacaaa', '..kaaaaa', '.kaaeeaa', '.kaaeeaa', '.kaaaaaa', '.kaaaarr', 'kaaaaaaa', 'kaaaaaaa', 'kbaaabaa', 'kbkabkab', '.k.kk.kk'] },
  bat: { sym: true, rows: ['........', '........', '........', '......k.', 'k.....kk', 'kk...kaa', 'kbk.kaaa', 'kbbkkwea', 'kbbbkaaa', 'kbbbbkaa', 'kbkbbkar', 'k.kbk.ka', '...k...k', '........', '........', '........'] },
  crab: { sym: true, rows: ['........', '........', '.kk.....', 'kddk....', 'kd.dk...', 'kddk..k.', '.kdk.kwk', '..kdkkek', '...kkaaa', '..kaaaaa', '.kaaacaa', '.kaaaaaa', '.kbaaaaa', '..kbbbbb', '.k.k.k.k', 'k.k.k...'] },
  dragon: { sym: true, rows: ['.k......', '.kk.....', '..kk..kk', '..kakkaa', '..kaaaaa', '.kaaaaaa', '.kaweaaa', '.kaeeaaa', 'k.kaaacc', 'kdkkaccc', 'kddkaccc', 'kdddkcck', 'kddkaccc', '.kkbaacc', '...kbaak', '...kkkk.'] },
  bear: { sym: true, rows: ['........', '..kk....', '.kack...', '.kaakkkk', '..kaaaaa', '.kaaaaaa', '.kaweaaa', '.kaeeaaa', '.kaaacck', '..kaaccc', '.kkbaaaa', 'kaakcccc', 'kaakcccc', '.kkbcccc', '..kbaaaa', '..kkk.kk'] },
  star: { sym: true, rows: ['.......k', '......ka', '......ka', '.....kaa', 'kkkkkaaa', '.kaaaaaa', '..kaweaa', '...kaeea', '...kaaaa', '...kaaar', '..kaaaaa', '..kaakaa', '.kaak.ka', '.kak...k', 'kak.....', 'kk......'] },
  mushroom: { sym: true, rows: ['........', '.....kkk', '...kkddd', '..kddwdd', '.kdddddd', '.kdwwddd', 'kddddddd', 'kkkkkkkk', '..kccccc', '..kcwecc', '..kceecc', '..kccccr', '...kcccc', '...kbccc', '...kkbbb', '....kkkk'] },
  spirit: { sym: true, rows: ['........', '......kd', '.....kdd', 'k...kkaa', 'dk.kaaaa', 'ddkkawea', 'dddkaeea', 'ddddkaaa', 'dddkcccc', '.ddkcccc', '..kccccc', '...kcccc', '...kccdc', '....kccc', '.....kcc', '......kk'] },
  knight: { sym: true, rows: ['........', '.....kkk', '....kaaa', '...kaaaa', '...kaeea', '...kaeea', '...kaaaa', '....kara', '...kkkkk', '..kbaaaa', '.kakbaaa', '.kakbaaa', '..k.kbaa', '....kbak', '....kak.', '....kk..'] },
  fish: { sym: false, rows: ['................', '................', '................', '......kkkk......', '....kkddddk.....', '...kaaaaaakk...k', '..kaaaaaaaaak.kd', '.kawkaaaaaaaakdk', '.kaeaaaaaaaaadk.', 'kaaaaaaaaaaaakdk', '.krcccccccaaakdk', '..kcccccccaak.kd', '...kkccccckk...k', '.....kdkkdk.....', '......k..k......', '................'] },
  lizard: { sym: false, rows: ['................', '................', '................', '...kkkk.........', '..kaaaak........', '.kawkaaak.......', 'kaaeaaaak.......', 'krrraaaaakkk....', '.kkcaaaaaaaakk..', '...kcccaaaaaaak.', '...kcccaaaabaaak', '....kccaaabbkdk.', '....kakkbakk.kdk', '....kak.kak...k.', '....kk..kk......', '................'] },
  turtle: { sym: false, rows: ['................', '................', '................', '................', '................', '......kkkkk.....', '.....kdbdbdk....', '....kdbdbdbdk...', '.kkkkddddddddk..', 'kawakkkkkkkkkkk.', 'kaeak.kcccccck..', 'kaaaakaakkkaak..', '.kkk.kak..kak...', '......k....k....', '................', '................'] },
  wolf: { sym: false, rows: ['................', '................', '..k.k...........', '..kakk..........', '.kaaaak.........', 'kawkaaakkkkkkk..', 'kaeaaaaaaaaaaak.', 'kkaaaaaaaaaaaakk', '.krcaaaaaaaaakdk', '..kcaaaaaaabak.k', '...kcakkkkbak...', '...kak...kak....', '...kak...kak....', '...kk....kk.....', '................', '................'] },
};
function monPal(p) {
  return {
    k: p.k || '#1e1a24', a: p.a, b: p.b || shade(p.a, -0.3), c: p.c || shade(p.a, 0.45), d: p.d || shade(p.a, -0.45),
    w: '#ffffff', e: '#16141c', r: p.r || '#d8404a',
  };
}
const monCache = {};
function getMonSprite(look, flip) {
  const key = JSON.stringify(look) + (flip ? 'F' : '');
  if (monCache[key]) return monCache[key];
  const tpl = MON_TPL[look.tpl] || MON_TPL.blob;
  const rows = tpl.sym ? sym(tpl.rows) : tpl.rows;
  let c = buildSprite(rows, monPal(look));
  if (look.crown) { const g = c.getContext('2d'); g.fillStyle = '#ffd34a'; g.fillRect(6, 1, 4, 2); g.fillRect(5, 0, 1, 2); g.fillRect(10, 0, 1, 2); g.fillRect(7, 0, 2, 1); }
  if (look.horn) { const g = c.getContext('2d'); g.fillStyle = look.horn; g.fillRect(7, 0, 2, 3); }
  if (flip) c = flipCanvas(c);
  monCache[key] = c;
  return c;
}
function drawMonLook(ctx, look, x, y, scale, flip, alpha) {
  const c = getMonSprite(look, flip);
  const s = scale || 1;
  if (alpha != null && alpha < 1) ctx.globalAlpha = alpha;
  ctx.drawImage(c, Math.round(x), Math.round(y), 16 * s, 16 * s);
  ctx.globalAlpha = 1;
}

// ============ 物品图标 ============
const ICON_TPL = {
  seed: ['................', '......kkkk......', '.....kaaaak.....', '......kkkk......', '.....kaaaak.....', '....kaaaaaak....', '...kaaddddaak...', '...kaddddddak...', '...kadddcddak...', '...kaaddddaak...', '....kaaaaaak....', '.....kkkkkk.....'],
  fruit: ['................', '.......kk.......', '......kddk......', '.....kkddkk.....', '....kaaccaak....', '...kaacwcaaak...', '...kaccaaaaak...', '..kaaaaaaaaaak..', '..kaaaaaaaaabk..', '..kaaaaaaaabbk..', '...kaaaaaabbk...', '...kbaaaabbbk...', '....kbbbbbbk....', '.....kkkkkk.....'],
  long: ['................', '.........k.k....', '........kdkdk...', '.........kdk....', '........kaak....', '.......kacak....', '......kaaak.....', '.....kacaak.....', '.....kaaak......', '....kaaak.......', '....kaak........', '...kabk.........', '...kbk..........', '...kk...........'],
  leafy: ['................', '.....kk..kk.....', '....kddkkddk....', '...kdddkdddk....', '...kddkdddkk....', '....kkaaaak.....', '...kaacaaaak....', '..kaaaaacaaak...', '..kacaaaaaaak...', '..kaaaacaaaak...', '...kaaaaaaak....', '....kbbbbbk.....', '.....kkkkk......'],
  berry: ['................', '.......kk.......', '......kddk......', '.....kddkk......', '....kaak.kaak...', '...kacak.kacak..', '...kaaak.kaaak..', '....kkkaakkk....', '.....kacaak.....', '....kaaaaaak....', '.....kaaaak.....', '......kkkk......'],
  fish: ['................', '................', '................', '.......kkkk.....', '.....kkaaaak..kk', '....kaacaaaakkdk', '...kawkaaaaaaddk', '...kaaaaaaaaakdk', '....kbbbbbbaakdk', '.....kkbbbbbk.kk', '.......kkkkk....'],
  ore: ['................', '................', '......kkkk......', '....kkaaaakk....', '...kaadaaacak...', '..kaaaaaddaaak..', '..kadaaaaaaaak..', '..kaaaaadaaaak..', '..kbaddaaaadak..', '...kbbaaaabbk...', '....kkbbbbkk....', '......kkkk......'],
  gem: ['................', '................', '.....kkkkkk.....', '....kccwccak....', '...kcwccaaaak...', '..kccccaaaaabk..', '..kkkkkkkkkkkk..', '...kaaaaaaabk...', '....kaaaaabk....', '.....kaaabk.....', '......kabk......', '.......kk.......'],
  potion: ['................', '......kkkk......', '......kddk......', '.......kk.......', '......kwwk......', '.....kwaaak.....', '....kaawaaak....', '...kaaaaaaaak...', '...kacaaaaaak...', '...kaaaaaaabk...', '....kbaaaabk....', '.....kkkkkk.....'],
  ball: ['................', '.....kkkkkk.....', '....kaaacaak....', '...kaaaaacaak...', '..kaaaaaaaaaak..', '..kaaaaaaaaaak..', '..kkkkkwwkkkkk..', '..kdddkwwkdddk..', '..kdddddddddk...', '...kdddddddk....', '....kddddddk....', '.....kkkkkk.....'],
  wood: ['................', '................', '....kkkkkkkkk...', '...kcaaaaaaaak..', '..kcbcaaaaaaak..', '..kbcbaaaaaaak..', '..kcbcaaaaaaak..', '...kcaaaaaaaak..', '....kkkkkkkkk...'],
  gel: ['................', '................', '................', '.......kk.......', '......kaak......', '.....kacaak.....', '....kawcaaak....', '...kaaaaaaaak...', '...kaaaaaaaak...', '....kbbbbbbk....', '.....kkkkkk.....'],
  wing: ['................', '..kk............', '..kakk..........', '..kaaakk........', '...kaaaakk......', '...kabaaaakk....', '....kabaaaaak...', '....kaabaaaak...', '.....kaabbaak...', '......kkaaak....', '........kkk.....'],
  bone: ['................', '..kk............', '.kwwk...........', '.kwwwk..........', '..kwwwk.........', '...kwwwk........', '....kwwwk.......', '.....kwwwk......', '......kwwwk.kk..', '.......kwwwkwwk.', '........kwwwwk..', '.........kwwk...', '..........kk....'],
  shell: ['................', '................', '.......kk.......', '.....kkaakk.....', '....kacaacak....', '...kaacaacaak...', '...kcaacacaak...', '..kaacaacaacak..', '..kaacaacaacak..', '...kkkkkkkkkk...', '.....kbbbbk.....', '......kkkk......'],
  mush: ['................', '................', '.....kkkkkk.....', '...kkaawaaakk...', '..kaawaaaawaak..', '..kaaaaawaaaak..', '..kkkkkkkkkkkk..', '.....kccck......', '.....kccck......', '.....kcccck.....', '......kkkk......'],
  flower: ['................', '......kkk.......', '.....kaaak......', '...kkakakakk....', '..kaaakdkaaak...', '...kkakakakk....', '.....kaaak......', '......kkk.......', '.......kk.......', '....kk.kk.......', '....kddkk.......', '.....kkkk.......', '.......kk.......'],
  star: ['................', '.......kk.......', '......kaak......', '......kaak......', '.kkkkkacaakkkkk.', '.kaaaaaacaaaaak.', '..kaaawaaaaaak..', '...kaaaaaaaak...', '....kaaaaaak....', '...kaaakkaaak...', '...kaak..kaak...', '..kaak....kaak..', '..kkk......kkk..'],
  food: ['................', '................', '......d.d.d.....', '.......d.d......', '...kkkkkkkkkk...', '..kaaaacaaaaak..', '..kaacaaaacaak..', '..kkkkkkkkkkkk..', '...kwwwwwwwwk...', '....kwwwwwwk....', '.....kkkkkk.....'],
  bar: ['................', '................', '................', '.......kkkkkkk..', '.....kkcwcccak..', '...kkcccccaakk..', '..kaaaaaaaakk...', '..kaaaaaabk.....', '..kkkkkkkk......'],
  bag: ['................', '......kkkk......', '.....kaaaak.....', '......kkkk......', '.....kaaaak.....', '....kaaaaaak....', '...kaaaaaaaak...', '...kaaaddaaak...', '...kaaddddaak...', '...kaaaddaaak...', '....kaaaaaak....', '.....kkkkkk.....'],
  // 工具与道具
  hoe: ['................', '..kkkkkk........', '..kddddk........', '..kkkdkkk.......', '....kkkak.......', '......kak.......', '.......kak......', '........kak.....', '.........kak....', '..........kak...', '...........kak..', '............kk..'],
  can: ['................', '................', '.....kkkkk......', '....k.....k.....', '...kkkkkkkkk....', '..kaaaaaaaaak.kk', '..kacaaaaaaakkdk', '..kaaaaaaaaaakk.', '..kaaaaaaaaaak..', '..kbaaaaaaabk...', '...kbbbbbbbk....', '....kkkkkkk.....'],
  pick: ['................', '...kkkkkkkk.....', '..kddddddddk....', '.kddkkkkkkddk...', '.kdk..kak..kdk..', '.kk...kak...kk..', '......kak.......', '......kak.......', '......kak.......', '......kak.......', '......kak.......', '......kkk.......'],
  axe: ['................', '.....kkkk.......', '....kddddkk.....', '...kddddkakk....', '...kdddkkak.....', '....kkkkkak.....', '........kak.....', '........kak.....', '........kak.....', '........kak.....', '........kak.....', '........kkk.....'],
  rod: ['...............k', '..............kd', '.............kak', '............kak.', '...........kak..', '..........kak..d', '.........kak...d', '........kak....d', '.......kak.....d', '......kak......d', '....kkkk......kk', '....kddk......kk', '....kkkk........', '...kak..........', '..kak...........', '..kk............'],
  sword: ['..............kk', '.............kwk', '............kwck', '...........kwck.', '..........kwck..', '.........kwck...', '........kwck....', '...kk..kwck.....', '...kdkkwck......', '....kdkck.......', '....kkdk........', '...kakkdk.......', '..kak...kk......', '.kak............', '.kk.............'],
  bow: ['................', '.....kkk........', '....kaak.......k', '...kak.........w', '..kak.........w.', '..kak........w..', '.kak........w...', '.kak.......w....', '.kak......w.....', '..kak....w......', '..kak...w.......', '...kak.w........', '....kaak........', '.....kkk........'],
  bomb: ['................', '..........d.d...', '.........kkd....', '........kk.d....', '.....kkkkk......', '...kkaaaaakk....', '..kaacaaaaaak...', '..kacaaaaaaak...', '..kaaaaaaaaak...', '..kaaaaaaaaak...', '..kaaaaaaaaak...', '...kaaaaaaak....', '....kkkkkkk.....'],
  arrow: ['................', '.............kk.', '............kwk.', '...........kwk..', '..........kak...', '.........kak....', '........kak.....', '.......kak......', '......kak.......', '..kd.kak........', '..kddak.........', '...kdd..........', '..kddd..........', '..kk............'],
  firerod: ['................', '...........kkk..', '..........kdddk.', '..........kdcdk.', '..........kdddk.', '.........kakkk..', '........kak.....', '.......kak......', '......kak.......', '.....kak........', '....kak.........', '...kak..........', '...kk...........'],
  fins: ['................', '................', '..kkkk..........', '.kaaaak.........', '.kaacaak........', '.kaaaaaakk......', '..kaaaaaaakk....', '...kbaaaaaaak...', '....kkbbbbbbk...', '......kkkkkk....'],
  key: ['................', '................', '....kkk.........', '...kaaak........', '..kak.kak.......', '..kak.kakkkkkkk.', '..kak.kaaaaaaaak', '...kaaakkkkakak.', '....kkk....k.k..'],
  bosskey: ['................', '...kkkkk........', '..kaaaaak.......', '.kakkkkkak......', '.kak.d.kakkkkkk.', '.kak...kaaaaaaak', '.kakkkkkakkakkak', '..kaaaaak.kak.k.', '...kkkkk..kk....'],
  heart: ['................', '................', '...kkk...kkk....', '..kaaak.kaaak...', '.kawaaakaaaaak..', '.kaaaaaaaaaaak..', '.kaaaaaaaaaaak..', '..kaaaaaaaaak...', '...kaaaaaaak....', '....kaaaaak.....', '.....kaaak......', '......kak.......', '.......k........'],
  letter: ['................', '................', '..kkkkkkkkkkkk..', '..kwkwwwwwwkwk..', '..kwwkwwwwkwwk..', '..kwwwkwwkwwwk..', '..kwwwwkkwwwwk..', '..kwwwwwwwwwwk..', '..kwwwwwwwwwwk..', '..kkkkkkkkkkkk..'],
  crystal: ['................', '.......kk.......', '......kcak......', '.....kcwaak.....', '....kccaaaak....', '....kcaaaabk....', '....kcaaaabk....', '....kcaaaabk....', '.....kaaabk.....', '......kabk......', '.......kk.......'],
  sprinkler: ['................', '.......kk.......', '......kddk......', '..d...kwwk...d..', '...d..kddk..d...', '......kddk......', '....kkkddkkk....', '...kaaaaaaaak...', '...kacaaaaaak...', '...kbaaaaaabk...', '....kkkkkkkk....'],
  coin: ['................', '................', '.....kkkkkk.....', '....kaaaaaak....', '...kaacccaaak...', '...kacaaaabak...', '...kacaaaabak...', '...kaabbbbaak...', '....kaaaaaak....', '.....kkkkkk.....'],
};
const iconCache = {};
function getIcon(item) {
  if (!item) return null;
  const key = item.id;
  if (iconCache[key]) return iconCache[key];
  const tpl = ICON_TPL[item.icon] || ICON_TPL.fruit;
  const col = item.color || '#e0a040';
  const pal = { k: '#2a1c18', a: col, b: shade(col, -0.3), c: shade(col, 0.45), d: item.color2 || '#4caa3a', w: '#ffffff' };
  if (item.icon === 'ore' || item.icon === 'bar') { pal.a = item.icon === 'ore' ? '#8a8a92' : col; pal.c = '#b8b8c0'; pal.b = '#5a5a62'; pal.d = col; if (item.icon === 'bar') { pal.a = col; pal.c = shade(col, 0.5); pal.b = shade(col, -0.3); } }
  if (item.icon === 'pick' || item.icon === 'hoe' || item.icon === 'axe') { pal.a = '#9a6232'; pal.d = col; }
  if (item.icon === 'sword') { pal.c = col; pal.a = '#7a4a24'; pal.d = '#d8b040'; }
  if (item.icon === 'bow') { pal.a = '#9a6232'; }
  if (item.icon === 'arrow') { pal.a = '#9a6232'; pal.d = '#e04848'; pal.w = '#d0d0d8'; }
  if (item.icon === 'bomb') { pal.d = '#ffb020'; }
  if (item.icon === 'firerod') { pal.a = '#9a6232'; pal.d = '#ff5a20'; pal.c = '#ffe060'; }
  if (item.icon === 'rod') { pal.a = '#b07a40'; pal.d = '#e0e0e0'; }
  if (item.icon === 'ball') { pal.d = '#f4f4f4'; }
  if (item.icon === 'potion') { pal.d = '#a07040'; }
  if (item.icon === 'sprinkler') { pal.d = '#6ab0f0'; }
  const c = buildSprite(pad16(tpl), pal);
  iconCache[key] = c;
  return c;
}

// ============ 作物生长图 ============
const CROP_TPL = [
  ['................', '................', '................', '................', '................', '................', '................', '................', '................', '................', '................', '.....d....d.....', '......d..d......', '................'],
  ['................', '................', '................', '................', '................', '................', '................', '................', '......k.........', '.....kgk.kk.....', '......kgkgk.....', '.......kgk......', '........g.......', '........g.......'],
  ['................', '................', '................', '................', '.....kk...kk....', '....kgGk.kGgk...', '.....kgGkGgk....', '..kk..kggGk..kk.', '.kgGk..kgk..kGgk', '..kgGk.kgk.kGgk.', '...kggkkgkkggk..', '.....kkgggkk....', '.......kgk......', '........g.......'],
  ['................', '................', '.....kk..kk.....', '....kaak.kaak...', '...kacak.kcaak..', '...kaaakgkaaak..', '....kkkgGkkkk...', '..kk..kgGk..kk..', '.kgGk.kaak.kGgk.', '..kgGkacaakkGgk.', '...kggkaakkggk..', '.....kkgggkk....', '.......kgk......', '........g.......'],
];
const cropCache = {};
function getCropSprite(stage, color) {
  const key = stage + color;
  if (cropCache[key]) return cropCache[key];
  const c = buildSprite(pad16(CROP_TPL[stage]), { k: '#1e3a14', g: '#4caa3a', G: '#2e7a26', d: '#5a3a1a', a: color, c: shade(color, 0.5) });
  cropCache[key] = c;
  return c;
}

// ============ 地块绘制 ============
const THEMES = {
  forest: { floor: '#7d8c62', floor2: '#6d7c54', wall: '#3e5a34', wall2: '#2c4426', hi: '#5c7c4a', water: '#3d7cc4' },
  tide: { floor: '#6a8aa8', floor2: '#5a7a98', wall: '#2a4a6a', wall2: '#1c3450', hi: '#4a6a8a', water: '#2a62b8' },
  lava: { floor: '#7a5a48', floor2: '#6a4a3a', wall: '#4a2a20', wall2: '#331a14', hi: '#6a3a2a', water: '#e0501c' },
  ice: { floor: '#b4d0e4', floor2: '#a0c0d8', wall: '#5a88b0', wall2: '#406a90', hi: '#7aa8d0', water: '#4a8ee0' },
  shadow: { floor: '#544468', floor2: '#463858', wall: '#2a1a3a', wall2: '#1c1028', hi: '#4a3466', water: '#3a2a6a' },
  cave: { floor: '#7a6a58', floor2: '#6a5a4a', wall: '#4a3c30', wall2: '#352a22', hi: '#64543f', water: '#3d7cc4' },
  cave2: { floor: '#5a6070', floor2: '#4c5262', wall: '#33384a', wall2: '#24283a', hi: '#4a5068', water: '#3d7cc4' },
  cave3: { floor: '#704848', floor2: '#603c3c', wall: '#402424', wall2: '#2e1818', hi: '#5a3030', water: '#e0501c' },
  cave4: { floor: '#4a5a5a', floor2: '#3c4a4a', wall: '#1e2e30', wall2: '#142022', hi: '#2e4648', water: '#3a6ab8' },
};

function speck(g, R, n, col, w, h) { g.fillStyle = col; for (let i = 0; i < n; i++) g.fillRect(Math.floor(R() * 16), Math.floor(R() * 16), w || 1, h || 1); }
function fill(g, col) { g.fillStyle = col; g.fillRect(0, 0, 16, 16); }
function circ(g, cx, cy, r, col) { g.fillStyle = col; for (let y = -r; y <= r; y++) for (let x = -r; x <= r; x++) if (x * x + y * y <= r * r + r * 0.6) g.fillRect(Math.round(cx + x), Math.round(cy + y), 1, 1); }
function ell(g, cx, cy, rx, ry, col) { g.fillStyle = col; for (let y = -ry; y <= ry; y++) for (let x = -rx; x <= rx; x++) if ((x * x) / (rx * rx + 0.5) + (y * y) / (ry * ry + 0.5) <= 1) g.fillRect(Math.round(cx + x), Math.round(cy + y), 1, 1); }
function rect(g, x, y, w, h, col) { g.fillStyle = col; g.fillRect(x, y, w, h); }

const BASES = {
  grass(g, R) { fill(g, '#6db544'); speck(g, R, 12, '#5ca23a'); speck(g, R, 5, '#8bd35a', 1, 2); },
  path(g, R) { fill(g, '#d8b67a'); speck(g, R, 10, '#c6a066'); speck(g, R, 5, '#e8cd98'); if (R() < 0.5) rect(g, Math.floor(R() * 13), Math.floor(R() * 13), 2, 2, '#b8955c'); },
  sand(g, R) { fill(g, '#efdfa6'); speck(g, R, 10, '#dcc88c'); speck(g, R, 6, '#fff4cc'); },
  snow(g, R) { fill(g, '#eef4fb'); speck(g, R, 8, '#d4e2f1'); speck(g, R, 4, '#ffffff'); },
  rocky(g, R) { fill(g, '#c39d72'); speck(g, R, 12, '#ab855c'); speck(g, R, 5, '#d8b88e'); if (R() < 0.4) rect(g, Math.floor(R() * 13), Math.floor(R() * 13), 2, 1, '#8a6a48'); },
  field(g, R) { fill(g, '#b88e5a'); speck(g, R, 14, '#a67c4a'); speck(g, R, 6, '#c9a06a'); },
  floor(g, R) { fill(g, '#c8925a'); for (let y = 0; y < 16; y += 4) rect(g, 0, y, 16, 1, '#a87440'); const o = Math.floor(R() * 8); for (let y = 0; y < 16; y += 4) rect(g, (o + y * 2) % 16, y, 1, 4, '#a87440'); speck(g, R, 4, '#d8a46a'); },
  stone(g, R) { fill(g, '#cbc6b6'); rect(g, 0, 0, 16, 1, '#aaa596'); rect(g, 0, 0, 1, 16, '#aaa596'); rect(g, 0, 8, 16, 1, '#aaa596'); rect(g, 8, 0, 1, 8, '#aaa596'); speck(g, R, 5, '#dcd8ca'); },
  dfloor(g, R, th) { fill(g, th.floor); rect(g, 0, 0, 16, 1, th.floor2); rect(g, 0, 0, 1, 16, th.floor2); speck(g, R, 6, th.floor2); speck(g, R, 3, shade(th.floor, 0.15)); },
  cfloor(g, R, th) { fill(g, th.floor); speck(g, R, 14, th.floor2); speck(g, R, 5, shade(th.floor, 0.15)); if (R() < 0.4) rect(g, Math.floor(R() * 13), Math.floor(R() * 13), 2, 2, th.floor2); },
};

// 地块定义：name -> {solid, base, draw, ...}
const TILE = {};
const TILES = [];
function defTile(name, props) { const id = TILES.length; props.name = name; props.id = id; TILES.push(props); TILE[name] = id; return id; }

defTile('VOID', { solid: true, draw(g) { fill(g, '#000'); } });
defTile('GRASS', { draw(g, R) { BASES.grass(g, R); } });
defTile('FLOWER', { draw(g, R) { BASES.grass(g, R); const cols = ['#ffffff', '#ff7ab8', '#ffd84a', '#7ac8ff', '#ff6a5a']; for (let i = 0; i < 3; i++) { const x = 2 + Math.floor(R() * 11), y = 2 + Math.floor(R() * 11), c = cols[Math.floor(R() * cols.length)]; rect(g, x - 1, y, 3, 1, c); rect(g, x, y - 1, 1, 3, c); rect(g, x, y, 1, 1, '#f0b020'); } } });
defTile('TALL', { tall: true, draw(g, R) { fill(g, '#4f9a35'); for (let i = 0; i < 9; i++) { const x = Math.floor(R() * 14) + 1, y = Math.floor(R() * 10) + 5; rect(g, x, y - 4, 1, 4, '#3a7d26'); rect(g, x - 1, y - 3, 1, 2, '#3a7d26'); rect(g, x + 1, y - 3, 1, 2, '#3a7d26'); rect(g, x, y - 5, 1, 1, '#86d456'); } } });
defTile('PATH', { draw(g, R) { BASES.path(g, R); } });
defTile('SAND', { draw(g, R) { BASES.sand(g, R); } });
defTile('FIELD', { till: true, draw(g, R) { BASES.field(g, R); } });
defTile('SOIL', { soil: true, draw(g, R) { fill(g, '#94653c'); for (let y = 2; y < 16; y += 4) { rect(g, 1, y, 14, 1, '#77502c'); rect(g, 1, y + 1, 14, 1, '#a8774a'); } } });
defTile('WATER', { water: true, solid: true, anim: 3, draw(g, R, th, f) { fill(g, '#4b8fe0'); speck(g, R, 5, '#3f80d0'); for (let i = 0; i < 3; i++) { const y = (Math.floor(R() * 14) + 1); const x = (Math.floor(R() * 10) + f * 2) % 14; rect(g, x, y, 3, 1, '#80bbf4'); } } });
defTile('BRIDGE', { draw(g) { fill(g, '#a8763e'); for (let x = 0; x < 16; x += 4) rect(g, x, 0, 1, 16, '#7c5428'); rect(g, 0, 0, 16, 2, '#5c3c1c'); rect(g, 0, 14, 16, 2, '#5c3c1c'); } });
defTile('VBRIDGE', { draw(g) { fill(g, '#a8763e'); for (let y = 0; y < 16; y += 4) rect(g, 0, y, 16, 1, '#7c5428'); rect(g, 0, 0, 2, 16, '#5c3c1c'); rect(g, 14, 0, 2, 16, '#5c3c1c'); } });
defTile('TREE', { solid: true, base: 'grass', draw(g, R) { rect(g, 6, 11, 4, 5, '#6b4524'); rect(g, 6, 11, 1, 5, '#4e301a'); circ(g, 8, 7, 7, '#1f4d23'); circ(g, 8, 7, 6, '#3f8f3a'); circ(g, 6, 5, 3, '#5aaa4a'); rect(g, 5, 4, 2, 1, '#7cc860'); speck(g, R, 3, '#2f7a30'); } });
defTile('PINE', { solid: true, base: 'grass', draw(g) { rect(g, 7, 13, 2, 3, '#5a3a1c'); for (let i = 0; i < 3; i++) { const y = 1 + i * 4, w = 3 + i * 2; for (let r = 0; r < 6; r++) { const ww = Math.min(w, Math.floor(r * 1.2) + 1); rect(g, 8 - ww, y + r, ww * 2, 1, r === 0 ? '#173d22' : '#2d6e3a'); rect(g, 8 - ww, y + r, 1, 1, '#173d22'); rect(g, 7 + ww, y + r, 1, 1, '#173d22'); } } rect(g, 6, 3, 2, 1, '#4a9a50'); rect(g, 5, 7, 2, 1, '#4a9a50'); } });
defTile('SPINE', { solid: true, base: 'snow', draw(g) { rect(g, 7, 13, 2, 3, '#5a3a1c'); for (let i = 0; i < 3; i++) { const y = 1 + i * 4, w = 3 + i * 2; for (let r = 0; r < 6; r++) { const ww = Math.min(w, Math.floor(r * 1.2) + 1); rect(g, 8 - ww, y + r, ww * 2, 1, r < 2 ? '#ffffff' : '#2d5e4a'); } } } });
defTile('BUSH', { solid: true, cut: true, base: 'grass', draw(g, R) { circ(g, 8, 9, 6, '#1f4d23'); circ(g, 8, 9, 5, '#4aa040'); circ(g, 6, 7, 2, '#6cc058'); speck(g, R, 2, '#2f7a30'); } });
defTile('ROCK', { solid: true, pick: 1, hp: 1, base: 'grass', draw(g) { ell(g, 8, 10, 6, 5, '#4a4e54'); ell(g, 8, 10, 5, 4, '#9aa0a6'); ell(g, 6, 8, 2, 1, '#c8ccd0'); rect(g, 9, 12, 3, 1, '#7a8086'); } });
defTile('COPPER', { solid: true, pick: 1, hp: 2, ore: 'copper', base: 'cfloor', draw(g) { ell(g, 8, 10, 6, 5, '#4a4e54'); ell(g, 8, 10, 5, 4, '#8a8f96'); rect(g, 5, 8, 2, 2, '#e08a4a'); rect(g, 9, 11, 2, 1, '#e08a4a'); rect(g, 10, 7, 1, 2, '#e08a4a'); } });
defTile('IRON', { solid: true, pick: 2, hp: 3, ore: 'iron', base: 'cfloor', draw(g) { ell(g, 8, 10, 6, 5, '#3a3e44'); ell(g, 8, 10, 5, 4, '#7a7f86'); rect(g, 5, 8, 2, 2, '#e8e8f4'); rect(g, 9, 11, 2, 1, '#d0d0e0'); rect(g, 10, 7, 1, 2, '#e8e8f4'); } });
defTile('GOLD', { solid: true, pick: 3, hp: 4, ore: 'gold', base: 'cfloor', draw(g) { ell(g, 8, 10, 6, 5, '#3a3e44'); ell(g, 8, 10, 5, 4, '#7a7066'); rect(g, 5, 8, 2, 2, '#ffd84a'); rect(g, 9, 11, 2, 1, '#ffd84a'); rect(g, 10, 7, 1, 2, '#fff09a'); } });
defTile('MYTHRIL', { solid: true, pick: 4, hp: 5, ore: 'mythril', base: 'cfloor', draw(g) { ell(g, 8, 10, 6, 5, '#2a2e44'); ell(g, 8, 10, 5, 4, '#5a6080'); rect(g, 5, 8, 2, 2, '#6af0f0'); rect(g, 9, 11, 2, 1, '#a0ffff'); rect(g, 10, 7, 1, 2, '#6af0f0'); } });
defTile('GEMROCK', { solid: true, pick: 2, hp: 3, ore: 'gem', base: 'cfloor', draw(g) { ell(g, 8, 10, 6, 5, '#3a3e44'); ell(g, 8, 10, 5, 4, '#7a7f86'); rect(g, 6, 8, 2, 2, '#e060f0'); rect(g, 9, 11, 2, 1, '#60f080'); rect(g, 10, 7, 1, 2, '#f06060'); } });
defTile('CROCK', { solid: true, pick: 1, hp: 1, base: 'cfloor', draw(g) { ell(g, 8, 10, 6, 5, '#3e342c'); ell(g, 8, 10, 5, 4, '#8a7a6a'); ell(g, 6, 8, 2, 1, '#aa9a88'); } });
defTile('BOULDER', { solid: true, base: 'grass', draw(g) { ell(g, 8, 8, 7, 7, '#3a3e44'); ell(g, 8, 8, 6, 6, '#80868c'); ell(g, 6, 5, 3, 2, '#a8aeb4'); rect(g, 9, 11, 4, 1, '#5a6066'); } });
defTile('CRACK', { solid: true, bomb: true, base: 'rocky', draw(g) { ell(g, 8, 8, 7, 7, '#3a3e44'); ell(g, 8, 8, 6, 6, '#8a8278'); rect(g, 7, 3, 1, 4, '#2a2420'); rect(g, 8, 6, 1, 3, '#2a2420'); rect(g, 6, 9, 2, 1, '#2a2420'); rect(g, 9, 9, 1, 4, '#2a2420'); rect(g, 4, 7, 3, 1, '#2a2420'); } });
defTile('ICE', { solid: true, melt: true, base: 'snow', draw(g) { rect(g, 1, 1, 14, 14, '#5aa8d0'); rect(g, 2, 2, 12, 12, '#a8e4f8'); rect(g, 3, 3, 4, 1, '#ffffff'); rect(g, 3, 3, 1, 4, '#ffffff'); rect(g, 10, 11, 3, 1, '#7ac0e0'); } });
defTile('FENCE', { solid: true, base: 'grass', draw(g) { rect(g, 0, 5, 16, 2, '#8a5a2a'); rect(g, 0, 10, 16, 2, '#8a5a2a'); rect(g, 0, 5, 16, 1, '#c08850'); rect(g, 0, 10, 16, 1, '#c08850'); rect(g, 2, 2, 3, 13, '#6a4220'); rect(g, 11, 2, 3, 13, '#6a4220'); rect(g, 2, 2, 3, 1, '#c08850'); rect(g, 11, 2, 3, 1, '#c08850'); } });
defTile('CLIFF', { solid: true, draw(g, R) { fill(g, '#9c7a56'); for (let y = 3; y < 16; y += 5) rect(g, 0, y, 16, 1, '#7a5a3c'); speck(g, R, 6, '#86664a'); speck(g, R, 4, '#b8946c'); } });
defTile('SCLIFF', { solid: true, draw(g, R) { fill(g, '#a8b8c8'); for (let y = 3; y < 16; y += 5) rect(g, 0, y, 16, 1, '#8090a4'); speck(g, R, 5, '#e8f0f8'); rect(g, 0, 0, 16, 2, '#f4f8fc'); } });
defTile('ROCKY', { draw(g, R) { BASES.rocky(g, R); } });
defTile('SNOW', { draw(g, R) { BASES.snow(g, R); } });
defTile('LAVA', { hurt: true, solid: false, lava: true, anim: 3, draw(g, R, th, f) { fill(g, '#d8461a'); speck(g, R, 6, '#b0300e'); for (let i = 0; i < 3; i++) { const x = (Math.floor(R() * 12) + f * 3) % 13, y = Math.floor(R() * 13); rect(g, x, y, 3, 2, '#ffa020'); rect(g, x + 1, y, 1, 1, '#ffe060'); } } });
defTile('STUMP', { solid: true, axe: 1, base: 'grass', draw(g) { ell(g, 8, 11, 6, 4, '#4e301a'); ell(g, 8, 10, 5, 3, '#8a5a30'); ell(g, 8, 9, 4, 2, '#c08a50'); ell(g, 8, 9, 2, 1, '#a07040'); } });
defTile('CAVE', { draw(g) { fill(g, '#9c7a56'); ell(g, 8, 10, 6, 7, '#140c08'); rect(g, 2, 10, 12, 6, '#140c08'); rect(g, 3, 4, 2, 1, '#7a5a3c'); } });
defTile('WALL', { solid: true, draw(g) { fill(g, '#efe0bc'); for (let y = 3; y < 16; y += 4) rect(g, 0, y, 16, 1, '#cdb88c'); rect(g, 0, 0, 1, 16, '#b09a70'); rect(g, 15, 0, 1, 16, '#b09a70'); } });
defTile('WINDOW', { solid: true, draw(g) { fill(g, '#efe0bc'); for (let y = 3; y < 16; y += 4) rect(g, 0, y, 16, 1, '#cdb88c'); rect(g, 3, 3, 10, 9, '#6a4a2a'); rect(g, 4, 4, 8, 7, '#8ad0f4'); rect(g, 7, 4, 1, 7, '#6a4a2a'); rect(g, 4, 7, 8, 1, '#6a4a2a'); rect(g, 5, 5, 1, 1, '#ffffff'); } });
defTile('DOOR', { door: true, draw(g) { fill(g, '#efe0bc'); rect(g, 2, 1, 12, 15, '#5a3a1a'); rect(g, 3, 2, 10, 14, '#8a5a2c'); rect(g, 3, 8, 10, 1, '#6a4220'); rect(g, 11, 9, 1, 2, '#f0c040'); } });
for (const [nm, col] of [['ROOF_R', '#c8483c'], ['ROOF_B', '#3c6ac8'], ['ROOF_G', '#3c9a5a'], ['ROOF_Y', '#d89a2c'], ['ROOF_P', '#8a4ab0'], ['ROOF_K', '#5a5a6a']]) {
  defTile(nm, { solid: true, roof: true, draw(g) { fill(g, col); for (let y = 0; y < 16; y += 4) { rect(g, 0, y + 3, 16, 1, shade(col, -0.35)); for (let x = (y / 4 % 2) * 4; x < 16; x += 8) rect(g, x, y, 1, 3, shade(col, -0.2)); } rect(g, 0, 0, 16, 1, shade(col, 0.3)); } });
}
defTile('EYE', { solid: true, eye: true, draw(g, R) { fill(g, '#9c7a56'); for (let y = 3; y < 16; y += 5) rect(g, 0, y, 16, 1, '#7a5a3c'); ell(g, 8, 8, 6, 4, '#2a1a10'); ell(g, 8, 8, 5, 3, '#ffffff'); circ(g, 8, 8, 2, '#d02020'); rect(g, 8, 8, 1, 1, '#000'); } });
defTile('GATE', { solid: true, base: 'path', draw(g) { for (let x = 1; x < 16; x += 4) { rect(g, x, 0, 2, 16, '#4a4a56'); rect(g, x, 0, 1, 16, '#8a8a9a'); } rect(g, 0, 2, 16, 2, '#3a3a46'); rect(g, 0, 12, 16, 2, '#3a3a46'); } });
defTile('STONE', { draw(g, R) { BASES.stone(g, R); } });
defTile('SIGNT', { solid: true, base: 'grass', draw(g) { rect(g, 7, 9, 2, 7, '#6a4220'); rect(g, 2, 3, 12, 8, '#5a3a1a'); rect(g, 3, 4, 10, 6, '#c8925a'); rect(g, 4, 6, 8, 1, '#8a5a2c'); rect(g, 4, 8, 6, 1, '#8a5a2c'); } });
defTile('FOUNT', { solid: true, base: 'stone', anim: 3, draw(g, R, th, f) { ell(g, 8, 9, 7, 6, '#8a8a90'); ell(g, 8, 9, 6, 5, '#5a9ae8'); rect(g, 7, 2, 2, 7, '#aaaab0'); rect(g, 6 - f % 2, 1 + f, 1, 2, '#c0e0ff'); rect(g, 9 + f % 2, 1 + f, 1, 2, '#c0e0ff'); rect(g, 7, 0, 2, 1, '#e0f0ff'); } });
// 室内
defTile('FLOOR', { draw(g, R) { BASES.floor(g, R); } });
defTile('IWALL', { solid: true, draw(g) { fill(g, '#e9d4a8'); for (let x = 2; x < 16; x += 6) rect(g, x, 0, 2, 13, '#ddc494'); rect(g, 0, 13, 16, 3, '#8a6a44'); rect(g, 0, 13, 16, 1, '#a8885e'); } });
defTile('IWALLW', { solid: true, draw(g) { fill(g, '#e9d4a8'); rect(g, 0, 13, 16, 3, '#8a6a44'); rect(g, 3, 2, 10, 9, '#6a4a2a'); rect(g, 4, 3, 8, 7, '#9ad8f8'); rect(g, 7, 3, 1, 7, '#6a4a2a'); rect(g, 5, 4, 1, 2, '#fff'); } });
defTile('BED', { solid: true, base: 'floor', draw(g) { rect(g, 1, 0, 14, 16, '#6a4220'); rect(g, 2, 1, 12, 4, '#ffffff'); rect(g, 2, 5, 12, 10, '#d84848'); rect(g, 2, 5, 12, 1, '#f07070'); rect(g, 4, 8, 8, 1, '#b83030'); rect(g, 4, 11, 8, 1, '#b83030'); } });
defTile('BEDB', { solid: true, base: 'floor', draw(g) { rect(g, 1, 0, 14, 15, '#6a4220'); rect(g, 2, 0, 12, 13, '#d84848'); rect(g, 4, 3, 8, 1, '#b83030'); rect(g, 4, 7, 8, 1, '#b83030'); rect(g, 2, 13, 12, 2, '#8a5a30'); } });
defTile('TABLE', { solid: true, base: 'floor', draw(g) { rect(g, 1, 3, 14, 9, '#7a4a24'); rect(g, 1, 3, 14, 7, '#b07840'); rect(g, 2, 4, 12, 1, '#c89058'); rect(g, 2, 12, 2, 3, '#5a3418'); rect(g, 12, 12, 2, 3, '#5a3418'); } });
defTile('SHELF', { solid: true, draw(g) { fill(g, '#7a4a24'); rect(g, 1, 1, 14, 14, '#a06a38'); rect(g, 1, 5, 14, 1, '#5a3418'); rect(g, 1, 10, 14, 1, '#5a3418'); const c = ['#e05050', '#50a0e0', '#f0d040', '#60c060', '#c070e0']; for (let i = 0; i < 4; i++) { rect(g, 2 + i * 3, 2, 2, 3, c[i]); rect(g, 3 + i * 3, 7, 2, 3, c[(i + 2) % 5]); rect(g, 2 + i * 3, 12, 2, 3, c[(i + 4) % 5]); } } });
defTile('BOOKS', { solid: true, draw(g) { fill(g, '#6a3a1a'); rect(g, 1, 1, 14, 14, '#8a5428'); for (let r = 0; r < 3; r++) { for (let i = 0; i < 7; i++) rect(g, 2 + i * 2, 2 + r * 5, 1, 4, ['#c04040', '#4060c0', '#40a060', '#d0a030'][(i + r) % 4]); rect(g, 1, 6 + r * 5, 14, 1, '#5a3418'); } } });
defTile('COUNTER', { solid: true, base: 'floor', draw(g) { rect(g, 0, 2, 16, 14, '#7a4a24'); rect(g, 0, 2, 16, 5, '#c89058'); rect(g, 0, 7, 16, 1, '#5a3418'); for (let x = 2; x < 16; x += 5) rect(g, x, 9, 3, 5, '#6a3e1c'); } });
defTile('PC', { solid: true, base: 'floor', pc: true, draw(g) { rect(g, 2, 3, 12, 9, '#5a5a6a'); rect(g, 3, 4, 10, 6, '#3ab0f0'); rect(g, 4, 5, 4, 1, '#c0f0ff'); rect(g, 5, 12, 6, 2, '#6a6a7a'); rect(g, 3, 14, 10, 2, '#4a4a5a'); } });
defTile('RUG', { draw(g) { fill(g, '#b83a3a'); rect(g, 1, 1, 14, 14, '#d84a4a'); rect(g, 3, 3, 10, 10, '#e8c050'); rect(g, 4, 4, 8, 8, '#d84a4a'); } });
defTile('MAT', { exit: true, draw(g, R) { BASES.floor(g, R); rect(g, 2, 4, 12, 10, '#5a8a3a'); rect(g, 3, 5, 10, 8, '#7aaa4a'); } });
defTile('PLANT', { solid: true, base: 'floor', draw(g) { rect(g, 5, 11, 6, 5, '#b05a2a'); rect(g, 5, 11, 6, 1, '#d07a3a'); circ(g, 8, 7, 5, '#1f5a23'); circ(g, 8, 7, 4, '#3f9f3a'); rect(g, 6, 4, 2, 2, '#6cc058'); } });
defTile('BARREL', { solid: true, base: 'floor', draw(g) { ell(g, 8, 9, 6, 7, '#5a3418'); ell(g, 8, 9, 5, 6, '#9a6232'); rect(g, 2, 5, 12, 1, '#4a4a52'); rect(g, 2, 12, 12, 1, '#4a4a52'); ell(g, 8, 3, 4, 1, '#b07a44'); } });
defTile('ANVIL', { solid: true, base: 'floor', draw(g) { rect(g, 2, 5, 12, 3, '#3a3a44'); rect(g, 0, 5, 3, 2, '#3a3a44'); rect(g, 5, 8, 6, 4, '#2a2a34'); rect(g, 3, 12, 10, 3, '#3a3a44'); rect(g, 2, 5, 12, 1, '#7a7a88'); } });
defTile('FURNACE', { solid: true, anim: 3, draw(g, R, th, f) { fill(g, '#5a5a62'); for (let y = 0; y < 16; y += 4) rect(g, 0, y, 16, 1, '#3a3a42'); rect(g, 3, 6, 10, 8, '#1a1010'); rect(g, 4, 9 - f % 2, 8, 5, '#e05a10'); rect(g, 5, 11, 6, 3, '#ffb020'); rect(g, 7, 12 - f % 3, 2, 2, '#fff070'); } });
defTile('HEALER', { solid: true, healer: true, base: 'floor', anim: 3, draw(g, R, th, f) { rect(g, 1, 2, 14, 13, '#d8d8e0'); rect(g, 1, 2, 14, 2, '#f0f0f8'); rect(g, 3, 5, 10, 6, f === 1 ? '#ff8ab0' : '#e05a8a'); rect(g, 7, 6, 2, 4, '#fff'); rect(g, 6, 7, 4, 2, '#fff'); rect(g, 2, 12, 12, 2, '#9a9aa8'); } });
defTile('STOVE', { solid: true, draw(g) { fill(g, '#4a4a52'); rect(g, 1, 1, 14, 14, '#6a6a74'); circ(g, 5, 5, 2, '#2a2a30'); circ(g, 11, 5, 2, '#2a2a30'); rect(g, 3, 9, 10, 5, '#3a3a42'); rect(g, 4, 10, 8, 1, '#8a8a94'); } });
defTile('TV', { solid: true, base: 'floor', draw(g) { rect(g, 1, 3, 14, 10, '#3a3a44'); rect(g, 2, 4, 12, 8, '#6ac8a0'); rect(g, 3, 5, 3, 2, '#c0ffe0'); rect(g, 5, 13, 6, 3, '#5a3418'); } });
// 地下城
defTile('DFLOOR', { draw(g, R, th) { BASES.dfloor(g, R, th); } });
defTile('DWALL', { solid: true, draw(g, R, th) { fill(g, th.wall); for (let y = 0; y < 16; y += 4) { rect(g, 0, y, 16, 1, th.wall2); const o = (y / 4 % 2) * 4; for (let x = o; x < 16; x += 8) rect(g, x, y, 1, 4, th.wall2); } speck(g, R, 3, th.hi); } });
defTile('DOPEN', { draw(g, R, th) { BASES.dfloor(g, R, th); rect(g, 0, 0, 16, 16, 'rgba(0,0,0,0.25)'); } });
defTile('DLOCK', { solid: true, lock: 'key', draw(g, R, th) { fill(g, th.wall2); rect(g, 1, 1, 14, 14, '#6a4220'); rect(g, 2, 2, 12, 12, '#a06a30'); rect(g, 5, 4, 6, 7, '#e8c040'); rect(g, 7, 6, 2, 2, '#2a1a10'); rect(g, 7.5, 8, 1, 2, '#2a1a10'); } });
defTile('DBOSS', { solid: true, lock: 'boss', draw(g, R, th) { fill(g, th.wall2); rect(g, 1, 1, 14, 14, '#5a1a1a'); rect(g, 2, 2, 12, 12, '#8a2a2a'); circ(g, 8, 7, 4, '#e8e0d0'); rect(g, 6, 6, 1, 2, '#1a0a0a'); rect(g, 9, 6, 1, 2, '#1a0a0a'); rect(g, 6, 11, 4, 2, '#e8e0d0'); rect(g, 7, 12, 1, 1, '#1a0a0a'); } });
defTile('DSHUT', { solid: true, draw(g, R, th) { BASES.dfloor(g, R, th); for (let x = 1; x < 16; x += 4) { rect(g, x, 0, 2, 16, '#3a3a46'); rect(g, x, 0, 1, 16, '#9a9aaa'); } } });
defTile('DCRACK', { solid: true, bomb: true, draw(g, R, th) { fill(g, th.wall); for (let y = 0; y < 16; y += 4) rect(g, 0, y, 16, 1, th.wall2); rect(g, 7, 1, 1, 5, '#0a0a0a'); rect(g, 8, 5, 1, 5, '#0a0a0a'); rect(g, 5, 9, 3, 1, '#0a0a0a'); rect(g, 9, 9, 1, 5, '#0a0a0a'); rect(g, 3, 6, 4, 1, '#0a0a0a'); } });
defTile('DICE', { solid: true, melt: true, draw(g, R, th) { BASES.dfloor(g, R, th); rect(g, 1, 1, 14, 14, '#5aa8d0'); rect(g, 2, 2, 12, 12, '#b8ecff'); rect(g, 3, 3, 4, 1, '#fff'); rect(g, 3, 3, 1, 4, '#fff'); } });
defTile('DEYE', { solid: true, eyegate: true, draw(g, R, th) { BASES.dfloor(g, R, th); for (let x = 1; x < 16; x += 4) { rect(g, x, 0, 2, 16, '#2a4a8a'); rect(g, x, 0, 1, 16, '#7aa0ea'); } } });
defTile('DWATER', { water: true, solid: true, anim: 3, draw(g, R, th, f) { fill(g, th.water); speck(g, R, 4, shade(th.water, -0.15)); for (let i = 0; i < 3; i++) { const y = Math.floor(R() * 14) + 1, x = (Math.floor(R() * 10) + f * 2) % 14; rect(g, x, y, 3, 1, shade(th.water, 0.35)); } } });
defTile('STATUE', { solid: true, base: 'dfloor', draw(g) { rect(g, 3, 12, 10, 4, '#5a5a66'); rect(g, 4, 3, 8, 10, '#8a8a96'); rect(g, 5, 1, 6, 4, '#9a9aa6'); rect(g, 6, 2, 1, 1, '#2a2a34'); rect(g, 9, 2, 1, 1, '#2a2a34'); rect(g, 4, 3, 1, 10, '#aaaab6'); } });
defTile('PIT', { pit: true, draw(g, R, th) { fill(g, '#050308'); rect(g, 0, 0, 16, 3, shade(th.floor2, -0.5)); } });
defTile('TORCH', { solid: true, torch: true, base: 'dfloor', draw(g) { rect(g, 4, 10, 8, 6, '#4a3a2a'); rect(g, 3, 7, 10, 4, '#6a5a4a'); rect(g, 4, 7, 8, 1, '#8a7a6a'); rect(g, 5, 8, 6, 2, '#1a1010'); } });
defTile('TORCHL', { solid: true, torch: true, lit: true, base: 'dfloor', anim: 3, draw(g, R, th, f) { rect(g, 4, 10, 8, 6, '#4a3a2a'); rect(g, 3, 7, 10, 4, '#6a5a4a'); ell(g, 8, 4 - (f % 2), 3, 4, '#ff7a20'); ell(g, 8, 5, 2, 2, '#ffd040'); rect(g, 7 + (f % 2), 1, 1, 2, '#ffa030'); } });
defTile('PLATE', { plate: true, draw(g, R, th) { BASES.dfloor(g, R, th); rect(g, 2, 2, 12, 12, '#5a5a66'); rect(g, 3, 3, 10, 10, '#8a8a9a'); rect(g, 3, 3, 10, 1, '#b0b0c0'); } });
defTile('EXIT', { exit: true, draw(g, R, th) { fill(g, '#1a1410'); for (let i = 0; i < 4; i++) rect(g, 1, 1 + i * 4, 14, 3, shade(th.floor, -0.1 - i * 0.12)); } });
defTile('LADDERD', { ladderDown: true, draw(g, R, th) { BASES.cfloor(g, R, th); rect(g, 2, 2, 12, 12, '#0a0606'); rect(g, 4, 1, 2, 13, '#9a6232'); rect(g, 10, 1, 2, 13, '#9a6232'); for (let y = 3; y < 14; y += 3) rect(g, 4, y, 8, 1, '#c08850'); } });
defTile('LADDERU', { ladderUp: true, draw(g, R, th) { BASES.cfloor(g, R, th); rect(g, 4, 0, 2, 16, '#9a6232'); rect(g, 10, 0, 2, 16, '#9a6232'); for (let y = 2; y < 16; y += 3) rect(g, 4, y, 8, 1, '#c08850'); } });
defTile('POT', { solid: true, cut: true, pot: true, base: 'dfloor', draw(g) { ell(g, 8, 10, 6, 5, '#5a2a14'); ell(g, 8, 10, 5, 4, '#b8683a'); rect(g, 5, 3, 6, 3, '#5a2a14'); rect(g, 6, 3, 4, 2, '#8a4a24'); rect(g, 5, 8, 2, 2, '#d8885a'); } });
defTile('CFLOOR', { draw(g, R, th) { BASES.cfloor(g, R, th); } });
defTile('CWALL', { solid: true, draw(g, R, th) { fill(g, th.wall); speck(g, R, 10, th.wall2, 2, 2); speck(g, R, 5, th.hi, 2, 1); } });
defTile('DARKG', { tall: true, draw(g, R, th) { BASES.cfloor(g, R, th); for (let i = 0; i < 8; i++) { const x = Math.floor(R() * 14) + 1, y = Math.floor(R() * 10) + 5; rect(g, x, y - 4, 1, 4, '#4a3a6a'); rect(g, x - 1, y - 3, 1, 2, '#3a2a5a'); rect(g, x + 1, y - 3, 1, 2, '#3a2a5a'); rect(g, x, y - 5, 1, 1, '#9a7ad0'); } } });
defTile('CRYSTALT', { solid: true, base: 'dfloor', anim: 3, draw(g, R, th, f) { ell(g, 8, 13, 6, 2, '#3a3a46'); const c = ['#7af0ff', '#a0f8ff', '#c8ffff'][f]; rect(g, 6, 2, 4, 11, c); rect(g, 5, 4, 6, 7, c); rect(g, 6, 3, 1, 8, '#fff'); } });
defTile('SHRUB', { solid: true, cut: true, base: 'snow', draw(g, R) { circ(g, 8, 9, 6, '#3a5a4a'); circ(g, 8, 9, 5, '#6a9a80'); circ(g, 7, 6, 3, '#f4f8fc'); } });

// 每个地块使用哪种"底色"
TILES.forEach(t => { if (!t.base) t.base = null; });
const BASE_OF = { grass: 'GRASS', snow: 'SNOW', sand: 'SAND', rocky: 'ROCKY', cfloor: 'CFLOOR', dfloor: 'DFLOOR', floor: 'FLOOR', path: 'PATH', stone: 'STONE' };

const tileCache = {};
function getTileSprite(id, variant, frame, themeName, baseName) {
  const t = TILES[id];
  const key = id + '|' + variant + '|' + frame + '|' + themeName + '|' + (t.base ? baseName : '');
  let c = tileCache[key];
  if (c) return c;
  c = makeCanvas(16, 16);
  const g = c.getContext('2d');
  const th = THEMES[themeName] || THEMES.forest;
  const R = mulberry32(id * 977 + variant * 131 + 7);
  if (t.base) {
    const bn = baseName || t.base;
    const fn = BASES[bn] || BASES.grass;
    fn(g, mulberry32(variant * 31 + 3), th);
  }
  t.draw(g, R, th, frame || 0);
  tileCache[key] = c;
  return c;
}

// ============ 简易特效粒子 ============
const Particles = {
  list: [],
  add(x, y, n, color, speed, life, grav) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2, s = (speed || 40) * (0.4 + Math.random() * 0.8);
      this.list.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - (grav ? 30 : 0), life: (life || 0.5) * (0.6 + Math.random() * 0.6), max: life || 0.5, color, grav: grav || 0, size: Math.random() < 0.3 ? 2 : 1 });
    }
  },
  text(x, y, txt, color) { this.list.push({ x, y, vx: 0, vy: -20, life: 1, max: 1, text: txt, color: color || '#fff' }); },
  update(dt) {
    for (let i = this.list.length - 1; i >= 0; i--) {
      const p = this.list[i];
      p.life -= dt; if (p.life <= 0) { this.list.splice(i, 1); continue; }
      p.x += p.vx * dt; p.y += p.vy * dt; p.vy += p.grav * dt;
      if (!p.text) { p.vx *= 0.96; p.vy *= 0.96; }
    }
  },
  draw(ctx, cx, cy) {
    for (const p of this.list) {
      ctx.globalAlpha = clamp(p.life / p.max * 1.5, 0, 1);
      if (p.text) drawText(ctx, p.text, p.x - cx, p.y - cy, p.color, 8, 'center', true, true);
      else { ctx.fillStyle = p.color; ctx.fillRect(Math.round(p.x - cx), Math.round(p.y - cy), p.size, p.size); }
    }
    ctx.globalAlpha = 1;
  }
};
