'use strict';
// ============ 额外地块 ============
BASES.mground = (g, R) => { fill(g, '#9a7650'); speck(g, R, 10, '#86643f', 2, 2); speck(g, R, 6, '#b08a60', 2, 1); };
TILES[TILE.TALL].cut = true;
defTile('DEDGE', { draw(g, R, th) { BASES.dfloor(g, R, th); rect(g, 0, 0, 16, 16, 'rgba(0,0,0,0.12)'); } });
defTile('DEYESW', { solid: true, eye: true, draw(g, R, th) { fill(g, th.wall); for (let y = 0; y < 16; y += 4) rect(g, 0, y, 16, 1, th.wall2); ell(g, 8, 8, 6, 4, '#1a0a10'); ell(g, 8, 8, 5, 3, '#ffffff'); circ(g, 8, 8, 2, '#d02020'); rect(g, 8, 8, 1, 1, '#000'); } });
defTile('DEYEOFF', { solid: true, draw(g, R, th) { fill(g, th.wall); for (let y = 0; y < 16; y += 4) rect(g, 0, y, 16, 1, th.wall2); rect(g, 3, 8, 10, 1, '#1a0a10'); } });
defTile('EYEOFF', { solid: true, draw(g) { fill(g, '#9c7a56'); for (let y = 3; y < 16; y += 5) rect(g, 0, y, 16, 1, '#7a5a3c'); rect(g, 3, 8, 10, 1, '#2a1a10'); } });
defTile('TOWER', { solid: true, draw(g, R) { fill(g, '#5a5a70'); for (let y = 0; y < 16; y += 4) { rect(g, 0, y, 16, 1, '#3a3a50'); const o = (y / 4 % 2) * 4; for (let x = o; x < 16; x += 8) rect(g, x, y, 1, 4, '#3a3a50'); } speck(g, R, 3, '#4a8a4a', 2, 1); } });
defTile('TDOOR', { draw(g) { fill(g, '#5a5a70'); rect(g, 1, 1, 14, 15, '#0a0610'); rect(g, 2, 2, 12, 14, '#1a1428'); } });
defTile('RUIN', { solid: true, draw(g, R) { fill(g, '#8a9a7a'); for (let y = 0; y < 16; y += 4) { rect(g, 0, y, 16, 1, '#5a6a4a'); const o = (y / 4 % 2) * 4; for (let x = o; x < 16; x += 8) rect(g, x, y, 1, 4, '#5a6a4a'); } speck(g, R, 4, '#4a8a3a', 2, 1); } });
// 缩小石桩：站在上面按 J 变小 / 变大
defTile('STUMPP', { shrink: true, base: 'grass', anim: 3, draw(g, R, th, f) { ell(g, 8, 10, 7, 5, '#4e301a'); ell(g, 8, 9, 6, 4, '#a0703a'); ell(g, 8, 9, 4, 2, '#c89058'); const c = ['#7af07a', '#b0ffb0', '#d8ffd8'][f]; rect(g, 7, 6, 2, 2, c); rect(g, 6, 7, 1, 1, c); rect(g, 9, 7, 1, 1, c); rect(g, 3, 9, 1, 1, c); rect(g, 12, 9, 1, 1, c); } });
defTile('DSTUMP', { shrink: true, base: 'dfloor', anim: 3, draw(g, R, th, f) { ell(g, 8, 12, 6, 3, 'rgba(0,0,0,0.25)'); ell(g, 8, 8, 5, 5, '#2a6ab8'); ell(g, 8, 8, 4, 4, ['#8ad0ff', '#a8e0ff', '#c8f0ff'][f]); rect(g, 6, 5, 2, 2, '#ffffff'); rect(g, 10, 10, 1, 1, '#ffffff'); } });
defTile('BRAMBLE', { solid: true, draw(g, R) { fill(g, '#24481f'); speck(g, R, 16, '#3a6a2a', 2, 2); speck(g, R, 6, '#163010', 2, 2); speck(g, R, 4, '#d84040'); } });
defTile('HEDGEHOLE', { solid: true, tinyPass: true, draw(g, R) { fill(g, '#24481f'); speck(g, R, 14, '#3a6a2a', 2, 2); speck(g, R, 4, '#d84040'); ell(g, 8, 13, 3, 3, '#0a1408'); rect(g, 5, 13, 7, 3, '#0a1408'); } });
defTile('MHOLE', { solid: true, tinyPass: true, draw(g, R) { fill(g, '#6b4524'); for (let x = 1; x < 16; x += 4) rect(g, x, 0, 1, 16, '#4e301a'); speck(g, R, 5, '#8a5a30', 1, 3); ell(g, 8, 13, 3, 3, '#0a0604'); rect(g, 5, 13, 7, 3, '#0a0604'); rect(g, 4, 11, 1, 1, '#7af07a'); rect(g, 11, 11, 1, 1, '#7af07a'); } });
defTile('CRYSW', { solid: true, crystal: true, base: 'grass', anim: 3, draw(g, R, th, f) { rect(g, 4, 12, 8, 4, '#5a5a66'); rect(g, 5, 11, 6, 1, '#8a8a96'); const c = ['#4a8af0', '#6aa8ff', '#8ac0ff'][f]; ell(g, 8, 7, 4, 5, '#1a2a5a'); ell(g, 8, 7, 3, 4, c); rect(g, 6, 4, 2, 2, '#e0f0ff'); } });
defTile('CRYSWON', { solid: true, base: 'grass', draw(g) { rect(g, 4, 12, 8, 4, '#5a5a66'); rect(g, 5, 11, 6, 1, '#8a8a96'); ell(g, 8, 7, 4, 5, '#5a2a0a'); ell(g, 8, 7, 3, 4, '#ffa030'); rect(g, 6, 4, 2, 2, '#fff0c0'); } });
defTile('DSWBAR', { solid: true, switchgate: true, draw(g, R, th) { BASES.dfloor(g, R, th); for (let x = 1; x < 16; x += 4) { rect(g, x, 0, 2, 16, '#2a5a8a'); rect(g, x, 0, 1, 16, '#8ac0ff'); } } });
defTile('DTINY', { solid: true, tinyPass: true, draw(g, R, th) { fill(g, th.wall); for (let y = 0; y < 16; y += 4) { rect(g, 0, y, 16, 1, th.wall2); } ell(g, 8, 12, 3, 3, '#050308'); rect(g, 5, 12, 7, 4, '#050308'); } });
defTile('CHASM', { pit: true, draw(g, R) { fill(g, '#0a0806'); rect(g, 0, 0, 16, 3, '#5a4630'); rect(g, 0, 3, 16, 1, '#2a2018'); speck(g, R, 2, '#1a1410'); } });
defTile('TALLD', { tall: true, cut: true, draw(g, R) { BASES.rocky(g, mulberry32(5)); for (let i = 0; i < 9; i++) { const x = Math.floor(R() * 14) + 1, y = Math.floor(R() * 10) + 5; rect(g, x, y - 4, 1, 4, '#8a6a2a'); rect(g, x - 1, y - 3, 1, 2, '#8a6a2a'); rect(g, x + 1, y - 3, 1, 2, '#a8843a'); rect(g, x, y - 5, 1, 1, '#e0c070'); } } });
// 小人世界（一切都变得巨大）
defTile('MGROUND', { draw(g, R) { BASES.mground(g, R); } });
defTile('MLEAF', { draw(g, R) { fill(g, '#5aa848'); rect(g, 0, 7, 16, 2, '#3a8a30'); for (let i = 0; i < 16; i += 4) { rect(g, i, 4 + (i % 8 ? 1 : 0), 2, 1, '#3a8a30'); rect(g, i + 1, 11, 2, 1, '#3a8a30'); } speck(g, R, 4, '#7ac860'); } });
defTile('MGRASS', { solid: true, base: 'mground', draw(g, R) { const o = Math.floor(R() * 4); rect(g, 3 + o, 0, 4, 16, '#2e7a26'); rect(g, 4 + o, 0, 2, 16, '#4caa3a'); rect(g, 5 + o, 0, 1, 16, '#7ad05a'); rect(g, 10, 4, 3, 12, '#2e7a26'); rect(g, 11, 4, 1, 12, '#5ab848'); rect(g, 10, 3, 2, 1, '#2e7a26'); } });
defTile('MPEBBLE', { solid: true, base: 'mground', draw(g) { ell(g, 8, 9, 7, 6, '#3a3e44'); ell(g, 8, 9, 6, 5, '#9aa0a6'); ell(g, 6, 7, 3, 2, '#c8ccd0'); rect(g, 9, 12, 4, 1, '#7a8086'); } });
defTile('MMUSH', { solid: true, base: 'mground', draw(g) { rect(g, 6, 9, 4, 7, '#e8dcc0'); rect(g, 6, 9, 1, 7, '#c8b890'); ell(g, 8, 6, 7, 5, '#5a1010'); ell(g, 8, 6, 6, 4, '#d83a3a'); rect(g, 4, 4, 2, 2, '#fff'); rect(g, 9, 3, 2, 2, '#fff'); rect(g, 11, 6, 2, 1, '#fff'); } });
defTile('MROOT', { solid: true, draw(g, R) { fill(g, '#4e301a'); for (let x = 0; x < 16; x += 5) rect(g, x, 0, 2, 16, '#6b4524'); speck(g, R, 6, '#3a2010', 1, 3); } });
defTile('MACORN', { solid: true, base: 'mground', draw(g) { ell(g, 8, 10, 6, 6, '#5a3410'); ell(g, 8, 10, 5, 5, '#b8783a'); rect(g, 3, 3, 10, 4, '#6a4a2a'); rect(g, 3, 3, 10, 1, '#8a6a4a'); rect(g, 7, 1, 2, 2, '#4a2a10'); rect(g, 5, 8, 2, 2, '#e0a060'); } });
defTile('MEXIT', { exit: true, draw(g, R) { BASES.mground(g, R); ell(g, 8, 9, 6, 5, '#140c06'); rect(g, 7, 2, 2, 3, '#7af07a'); rect(g, 6, 3, 4, 1, '#7af07a'); } });

const GROUND_BASE = { GRASS: 'grass', FLOWER: 'grass', TALL: 'grass', PATH: 'path', SAND: 'sand', SNOW: 'snow', ROCKY: 'rocky', CFLOOR: 'cfloor', DFLOOR: 'dfloor', FLOOR: 'floor', STONE: 'stone', DOPEN: 'dfloor', PLATE: 'dfloor', DEDGE: 'dfloor', TALLD: 'rocky', MGROUND: 'mground', MLEAF: 'mground' };
const BASE_TILE = { grass: 'GRASS', path: 'PATH', sand: 'SAND', snow: 'SNOW', rocky: 'ROCKY', cfloor: 'CFLOOR', dfloor: 'DFLOOR', floor: 'FLOOR', stone: 'STONE', mground: 'MGROUND' };

function newMap(id, w, h, fillName) {
  return { id, w, h, t: new Int16Array(w * h).fill(TILE[fillName || 'GRASS']), under: new Array(w * h).fill(null), warps: {}, exits: {}, signs: {}, theme: 'forest', outdoor: true, music: 'field', enemies: [], name: '', spawns: [], base: 'grass', tier: 1 };
}
function tAt(m, x, y) { if (x < 0 || y < 0 || x >= m.w || y >= m.h) return -1; return m.t[y * m.w + x]; }
function setT(m, x, y, name) { if (x < 0 || y < 0 || x >= m.w || y >= m.h) return; m.t[y * m.w + x] = typeof name === 'number' ? name : TILE[name]; }
function rectT(m, x, y, w, h, name) { for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) setT(m, i, j, name); }
function blobT(m, cx, cy, rx, ry, name) { for (let j = -ry - 1; j <= ry + 1; j++) for (let i = -rx - 1; i <= rx + 1; i++) if ((i * i) / ((rx + 0.5) ** 2) + (j * j) / ((ry + 0.5) ** 2) <= 1) setT(m, cx + i, cy + j, name); }
function borderT(m, name, th, gaps) {
  for (let y = 0; y < m.h; y++) for (let x = 0; x < m.w; x++) {
    if (!(x < th || y < th || x >= m.w - th || y >= m.h - th)) continue;
    let gap = false;
    for (const g of gaps || []) {
      if (g[0] === 'n' && y < th && x >= g[1] && x <= g[2]) gap = true;
      if (g[0] === 's' && y >= m.h - th && x >= g[1] && x <= g[2]) gap = true;
      if (g[0] === 'w' && x < th && y >= g[1] && y <= g[2]) gap = true;
      if (g[0] === 'e' && x >= m.w - th && y >= g[1] && y <= g[2]) gap = true;
    }
    if (!gap) setT(m, x, y, name);
  }
}
function scatterT(m, R, name, p, onlyOn, protect) {
  const only = (onlyOn || ['GRASS']).map(n => TILE[n]);
  for (let y = 0; y < m.h; y++) for (let x = 0; x < m.w; x++) {
    if (!only.includes(m.t[y * m.w + x])) continue;
    if (protect && protect.some(r => x >= r[0] && y >= r[1] && x < r[0] + r[2] && y < r[1] + r[3])) continue;
    if (R() < p) setT(m, x, y, name);
  }
}
const INTERIOR_BACK = {};
function stampBuilding(m, b) {
  const roof = TILE[b.roof || 'ROOF_R'];
  for (let y = b.y; y < b.y + b.h; y++) for (let x = b.x; x < b.x + b.w; x++) setT(m, x, y, y < b.y + b.h - 2 ? roof : TILE.WALL);
  const wy = b.y + b.h - 2;
  setT(m, b.x + 1, wy, 'WINDOW'); setT(m, b.x + b.w - 2, wy, 'WINDOW');
  const dx = b.x + b.door, dy = b.y + b.h - 1;
  setT(m, dx, dy, 'DOOR');
  if (b.to) { m.warps[dy * m.w + dx] = { to: b.to }; INTERIOR_BACK[b.to] = { map: m.id, x: dx, y: dy + 1 }; }
  if (b.label) (m.labels = m.labels || []).push({ x: b.x + b.w / 2, y: b.y + 0.1, text: b.label });
}
function addSign(m, x, y, text) { setT(m, x, y, 'SIGNT'); m.signs[y * m.w + x] = text; }
function addWarp(m, x, y, to) { m.warps[y * m.w + x] = { to }; }
function computeUnder(m) {
  for (let y = 0; y < m.h; y++) for (let x = 0; x < m.w; x++) {
    const i = y * m.w + x, t = TILES[m.t[i]];
    if (!t.base) continue;
    const cnt = {};
    for (const [dx, dy] of [[0, 1], [0, -1], [-1, 0], [1, 0], [1, 1], [-1, -1], [1, -1], [-1, 1]]) {
      const n = tAt(m, x + dx, y + dy); if (n < 0) continue;
      const b = GROUND_BASE[TILES[n].name]; if (b) cnt[b] = (cnt[b] || 0) + 1;
    }
    let best = null, bc = 0; for (const k in cnt) if (cnt[k] > bc) { bc = cnt[k]; best = k; }
    m.under[i] = best || m.base || t.base;
  }
}
function decorate(m, R, prot, opts) {
  opts = opts || {};
  scatterT(m, R, 'FLOWER', opts.flower ?? 0.05, ['GRASS'], prot);
  scatterT(m, R, 'TREE', opts.tree ?? 0.03, ['GRASS'], prot);
  scatterT(m, R, 'BUSH', opts.bush ?? 0.03, ['GRASS'], prot);
  scatterT(m, R, 'TALL', opts.tall ?? 0.04, ['GRASS'], prot);
}

// ============ 野外 ============
const MAPDEF = {};
MAPDEF.village = () => {
  const m = newMap('village', 36, 26, 'GRASS'); m.name = '豆丁村'; m.theme = 'garden'; m.music = 'village';
  const R = mulberry32(11);
  borderT(m, 'TREE', 2, [['n', 12, 15], ['e', 11, 13]]);
  rectT(m, 12, 0, 4, 9, 'PATH'); rectT(m, 2, 11, 34, 2, 'PATH'); rectT(m, 26, 11, 10, 3, 'PATH');
  rectT(m, 10, 13, 2, 9, 'PATH'); rectT(m, 2, 21, 32, 1, 'PATH');
  rectT(m, 16, 8, 10, 6, 'STONE');
  rectT(m, 17, 2, 4, 5, 'TREE'); setT(m, 18, 6, 'MHOLE'); addWarp(m, 18, 6, 'm_root'); setT(m, 18, 8, 'STUMPP');
  stampBuilding(m, { x: 3, y: 3, w: 6, h: 5, door: 2, roof: 'ROOF_R', to: 'home', label: '我的蘑菇屋' });
  stampBuilding(m, { x: 25, y: 3, w: 7, h: 5, door: 3, roof: 'ROOF_B', to: 'shop', label: '瓶盖杂货铺' });
  stampBuilding(m, { x: 3, y: 15, w: 6, h: 5, door: 2, roof: 'ROOF_G', to: 'elderhouse', label: '长老家' });
  stampBuilding(m, { x: 24, y: 15, w: 8, h: 5, door: 4, roof: 'ROOF_K', to: 'dojo', label: '缝针道场' });
  rectT(m, 5, 8, 1, 3, 'PATH'); rectT(m, 28, 8, 1, 3, 'PATH'); rectT(m, 5, 20, 1, 1, 'PATH'); rectT(m, 28, 20, 1, 1, 'PATH');
  addSign(m, 11, 9, '↑ 北：后院花园\n→ 东：木头门廊（大人房子的后门）');
  addSign(m, 21, 7, '【灯笼草】\n豆丁村的灯笼草。以前它每晚都被星星糖照得亮堂堂的……\n根部好像有个蚂蚁才钻得进的小洞。');
  decorate(m, R, [[0, 9, 36, 5], [11, 0, 6, 10], [15, 1, 12, 14], [2, 2, 8, 9], [24, 2, 9, 9], [2, 14, 8, 9], [23, 14, 11, 9], [9, 12, 4, 11], [2, 20, 32, 3]]);
  m.exits = { n: { to: 'forest', off: 0 }, e: { to: 'field', off: 0 } };
  return m;
};
MAPDEF.forest = () => {
  const m = newMap('forest', 36, 26, 'GRASS'); m.name = '后院花园'; m.theme = 'garden'; m.music = 'forest';
  const R = mulberry32(22);
  borderT(m, 'TREE', 2, [['s', 12, 15]]);
  rectT(m, 12, 19, 4, 7, 'PATH'); rectT(m, 13, 10, 2, 10, 'PATH');
  rectT(m, 12, 1, 12, 4, 'RUIN'); setT(m, 17, 4, 'CAVE'); setT(m, 18, 4, 'CAVE'); addWarp(m, 17, 4, 'd1'); addWarp(m, 18, 4, 'd1');
  rectT(m, 12, 5, 12, 4, 'STONE');
  rectT(m, 11, 9, 14, 1, 'BRAMBLE'); rectT(m, 11, 1, 1, 9, 'BRAMBLE'); rectT(m, 24, 1, 1, 9, 'BRAMBLE');
  setT(m, 14, 9, 'HEDGEHOLE'); setT(m, 14, 11, 'STUMPP'); setT(m, 15, 7, 'STUMPP');
  rectT(m, 3, 4, 5, 3, 'TREE'); setT(m, 5, 6, 'MHOLE'); addWarp(m, 5, 6, 'm_forest'); setT(m, 5, 8, 'STUMPP'); rectT(m, 5, 9, 1, 4, 'PATH'); rectT(m, 5, 12, 8, 1, 'PATH');
  rectT(m, 28, 3, 5, 5, 'CHASM'); setT(m, 30, 5, 'GRASS');
  rectT(m, 3, 16, 6, 4, 'TALL'); rectT(m, 25, 13, 7, 5, 'TALL');
  addSign(m, 16, 12, '大花盆\n入口被玫瑰刺丛挡住了。\n刺丛底下有个小洞……');
  decorate(m, R, [[11, 0, 15, 13], [2, 3, 7, 10], [4, 11, 10, 3], [26, 2, 8, 7], [11, 18, 6, 8]], { tree: 0.16, tall: 0.05 });
  m.exits = { s: { to: 'village', off: 0 } };
  m.enemies = [['slime', 4], ['octo', 2]];
  return m;
};
MAPDEF.field = () => {
  const m = newMap('field', 40, 26, 'GRASS'); m.name = '木头门廊'; m.theme = 'porch'; m.music = 'field';
  const R = mulberry32(33);
  borderT(m, 'TREE', 2, [['w', 11, 13], ['e', 11, 13], ['n', 18, 21], ['s', 18, 21]]);
  rectT(m, 0, 11, 40, 3, 'PATH'); rectT(m, 18, 0, 4, 26, 'PATH');
  rectT(m, 2, 20, 36, 2, 'CHASM');
  rectT(m, 31, 1, 5, 4, 'CLIFF'); setT(m, 33, 2, 'GRASS'); setT(m, 33, 3, 'GRASS'); setT(m, 33, 4, 'CRACK');
  rectT(m, 6, 3, 3, 3, 'TREE'); setT(m, 7, 5, 'MHOLE'); addWarp(m, 7, 5, 'm_field'); setT(m, 7, 7, 'STUMPP');
  rectT(m, 4, 15, 8, 4, 'TALL'); rectT(m, 27, 15, 8, 4, 'TALL');
  addSign(m, 22, 10, '↑ 厨房   → 浴室\n↓ 地下室   ← 豆丁村');
  addSign(m, 17, 18, '前面是一条宽宽的木板缝。\n掉下去可就惨了……得想办法跳过去。');
  decorate(m, R, [[0, 10, 40, 5], [17, 0, 6, 26], [30, 0, 7, 6], [5, 2, 5, 7], [0, 19, 40, 4], [23, 2, 8, 7]], { tree: 0.04, bush: 0.04 });
  m.exits = { w: { to: 'village', off: 0 }, e: { to: 'lake', off: 0 }, n: { to: 'mountain', off: 0 }, s: { to: 'ruins', off: 0 } };
  m.enemies = [['slime2', 2], ['ladybug', 2], ['bat', 1]];
  return m;
};
MAPDEF.lake = () => {
  const m = newMap('lake', 36, 26, 'GRASS'); m.name = '浴室'; m.theme = 'bath'; m.music = 'field';
  const R = mulberry32(44);
  borderT(m, 'TREE', 2, [['w', 11, 13]]);
  rectT(m, 0, 11, 9, 3, 'PATH');
  rectT(m, 8, 2, 2, 22, 'SAND'); rectT(m, 10, 2, 24, 22, 'WATER');
  blobT(m, 19, 12, 3, 3, 'SAND'); rectT(m, 18, 8, 3, 2, 'RUIN'); setT(m, 19, 9, 'CAVE'); addWarp(m, 19, 9, 'd2');
  setT(m, 16, 11, 'CRYSW');
  rectT(m, 3, 18, 3, 3, 'TREE'); setT(m, 4, 20, 'MHOLE'); addWarp(m, 4, 20, 'm_lake'); setT(m, 4, 22, 'STUMPP');
  rectT(m, 2, 3, 5, 5, 'TALL');
  addSign(m, 7, 9, '浴缸边的地漏里好像藏着什么。\n对面那颗蓝色按钮，一按就会放下冰棍棒桥……\n可惜太远了。');
  decorate(m, R, [[0, 10, 10, 5], [2, 17, 5, 7], [7, 2, 3, 22]], { tree: 0.05 });
  m.exits = { w: { to: 'field', off: 0 } };
  m.enemies = [['crab', 3], ['slime2', 2]];
  return m;
};
MAPDEF.mountain = () => {
  const m = newMap('mountain', 36, 26, 'ROCKY'); m.name = '厨房'; m.music = 'village'; m.base = 'rocky'; m.theme = 'kitchen';
  const R = mulberry32(55);
  borderT(m, 'CLIFF', 2, [['s', 18, 21]]);
  rectT(m, 18, 7, 4, 19, 'PATH'); rectT(m, 17, 7, 1, 17, 'PATH');
  rectT(m, 14, 1, 8, 5, 'CLIFF'); setT(m, 17, 5, 'CAVE'); setT(m, 18, 5, 'CAVE'); addWarp(m, 17, 5, 'd3'); addWarp(m, 18, 5, 'd3');
  setT(m, 16, 6, 'CLIFF'); setT(m, 19, 6, 'CLIFF'); setT(m, 17, 6, 'CRACK'); setT(m, 18, 6, 'CRACK');
  rectT(m, 4, 3, 5, 4, 'CLIFF'); setT(m, 6, 6, 'MHOLE'); addWarp(m, 6, 6, 'm_mountain'); setT(m, 6, 8, 'STUMPP');
  rectT(m, 8, 13, 7, 1, 'CLIFF'); rectT(m, 24, 10, 6, 1, 'CLIFF');
  rectT(m, 3, 15, 8, 5, 'TALLD'); rectT(m, 25, 15, 8, 5, 'TALLD');
  addSign(m, 21, 8, '碗柜\n一块大饼干卡住了柜门缝。\n要是能把它炸开就好了……');
  const prot = [[16, 5, 7, 21], [3, 2, 7, 8], [13, 0, 10, 7]];
  scatterT(m, R, 'BOULDER', 0.03, ['ROCKY'], prot); scatterT(m, R, 'PINE', 0.03, ['ROCKY'], prot); scatterT(m, R, 'TALLD', 0.03, ['ROCKY'], prot);
  m.exits = { s: { to: 'field', off: 0 } };
  m.enemies = [['fly', 3], ['ant', 2], ['roach', 1]];
  return m;
};
MAPDEF.ruins = () => {
  const m = newMap('ruins', 36, 26, 'GRASS'); m.name = '地下室'; m.theme = 'basement'; m.music = 'dungeon';
  const R = mulberry32(66);
  borderT(m, 'TREE', 2, [['n', 18, 21]]);
  rectT(m, 18, 0, 4, 10, 'PATH'); rectT(m, 10, 10, 16, 5, 'STONE');
  rectT(m, 12, 15, 12, 7, 'TOWER'); setT(m, 17, 15, 'TDOOR'); setT(m, 18, 15, 'TDOOR'); addWarp(m, 17, 15, 'd4'); addWarp(m, 18, 15, 'd4');
  rectT(m, 3, 4, 5, 5, 'RUIN'); rectT(m, 4, 5, 3, 3, 'STONE'); setT(m, 5, 8, 'GATE'); setT(m, 7, 5, 'EYE');
  rectT(m, 28, 4, 4, 3, 'RUIN'); setT(m, 29, 6, 'MHOLE'); addWarp(m, 29, 6, 'm_ruins'); setT(m, 29, 8, 'STUMPP');
  for (const [x, y] of [[11, 11], [24, 11], [11, 14], [24, 14], [6, 18], [29, 18]]) setT(m, x, y, 'STATUE');
  rectT(m, 26, 12, 7, 4, 'TALL'); rectT(m, 3, 12, 6, 3, 'TALL');
  addSign(m, 22, 9, '罐头城堡\n老鼠大王就住在里面！');
  addSign(m, 9, 6, '书堆上画着一只奇怪的眼睛……');
  decorate(m, R, [[17, 0, 6, 16], [9, 9, 18, 14], [2, 3, 8, 7], [27, 3, 6, 7]], { tree: 0.06 });
  m.exits = { n: { to: 'field', off: 0 } };
  m.enemies = [['rat', 3], ['dust', 2]];
  return m;
};

// ============ 室内 ============
function makeInterior(id, name, w, h, furn, opts) {
  const m = newMap(id, w, h, (opts && opts.floor) || 'FLOOR'); m.name = name; m.outdoor = false; m.music = (opts && opts.music) || 'village'; m.base = 'floor';
  rectT(m, 0, 0, w, 2, 'IWALL');
  for (const wx of (opts && opts.windows) || []) setT(m, wx, 1, 'IWALLW');
  const mx = Math.floor(w / 2); setT(m, mx, h - 1, 'MAT'); m.mat = { x: mx, y: h - 1 };
  for (const f of furn) setT(m, f[1], f[2], f[0]);
  for (let y = 1; y < h; y++) for (let x = 0; x < w; x++) if (tAt(m, x, y) === TILE.BED && tAt(m, x, y - 1) === TILE.BED) setT(m, x, y, 'BEDB');
  return m;
}
MAPDEF.home = () => { const m = makeInterior('home', '我的家', 10, 8, [['BED', 8, 2], ['BED', 8, 3], ['TABLE', 3, 3], ['TABLE', 4, 3], ['PLANT', 1, 2], ['POT', 1, 6], ['POT', 8, 6], ['STOVE', 5, 2], ['RUG', 4, 5]], { windows: [3, 6] }); m.isHome = true; return m; };
MAPDEF.shop = () => makeInterior('shop', '商店', 10, 8, [['SHELF', 1, 2], ['SHELF', 8, 2], ['COUNTER', 2, 3], ['COUNTER', 3, 3], ['COUNTER', 4, 3], ['COUNTER', 5, 3], ['COUNTER', 6, 3], ['COUNTER', 7, 3], ['BARREL', 1, 6], ['BARREL', 8, 6]], { windows: [3, 6] });
MAPDEF.elderhouse = () => makeInterior('elderhouse', '长老家', 10, 8, [['BOOKS', 1, 2], ['BOOKS', 2, 2], ['TABLE', 5, 3], ['BED', 8, 2], ['BED', 8, 3], ['PLANT', 1, 6], ['POT', 8, 6]], { windows: [5] });
MAPDEF.dojo = () => { const m = makeInterior('dojo', '剑术道场', 12, 9, [['STATUE', 1, 2], ['STATUE', 10, 2], ['RUG', 5, 4], ['RUG', 6, 4], ['RUG', 5, 5], ['RUG', 6, 5], ['BARREL', 1, 7], ['BARREL', 10, 7]], { windows: [3, 8] }); return m; };

// ============ 小人世界 ============
const MINIS = {
  m_root: { name: '灯笼草根下', back: { map: 'village', x: 18, y: 7 }, reward: 'heartp', seed: 101, enemies: ['ant', 'ant', 'ladybug'] },
  m_forest: { name: '蚯蚓洞', back: { map: 'forest', x: 5, y: 7 }, reward: 'heartp', seed: 202, enemies: ['ant', 'ladybug', 'ladybug'] },
  m_field: { name: '木板夹缝', back: { map: 'field', x: 7, y: 6 }, reward: 'wallet', seed: 303, enemies: ['ant', 'ant', 'spider'] },
  m_lake: { name: '墙缝里的苔藓', back: { map: 'lake', x: 4, y: 21 }, reward: 'heartp', seed: 404, enemies: ['ladybug', 'spider', 'ant'], water: true },
  m_mountain: { name: '踢脚线后面', back: { map: 'mountain', x: 6, y: 7 }, reward: 'heartp', seed: 505, enemies: ['spider', 'spider', 'ant'], rock: true },
  m_ruins: { name: '蚂蚁王国', back: { map: 'ruins', x: 29, y: 7 }, reward: 'wallet', seed: 606, enemies: ['ant', 'ant', 'ant', 'spider'] },
};
for (const k in MINIS) INTERIOR_BACK[k] = MINIS[k].back;
function genMini(id) {
  const D = MINIS[id], W = 22, H = 14;
  for (let attempt = 0; attempt < 200; attempt++) {
    const R = mulberry32(D.seed + attempt * 977);
    const m = newMap(id, W, H, 'MGROUND'); m.name = D.name; m.mini = true; m.outdoor = false; m.music = 'forest'; m.base = 'mground';
    borderT(m, 'MROOT', 1);
    const sx = 11, sy = 12;
    setT(m, sx, 13, 'MEXIT'); m.mat = { x: sx, y: 13 };
    const cx = rint(R, 3, 18), cy = rint(R, 2, 3);
    rectT(m, 3, 5, 16, 1, 'MLEAF');
    const prot = (x, y) => (Math.abs(x - sx) <= 1 && y >= 10) || (Math.abs(x - cx) <= 1 && Math.abs(y - cy) <= 1);
    for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) {
      if (prot(x, y)) continue;
      const r = R();
      if (r < 0.15) setT(m, x, y, 'MGRASS'); else if (r < 0.2) setT(m, x, y, D.rock ? 'MPEBBLE' : 'MPEBBLE'); else if (r < 0.23) setT(m, x, y, D.rock ? 'MPEBBLE' : 'MMUSH'); else if (r < 0.25) setT(m, x, y, 'MACORN');
    }
    if (D.water) { blobT(m, rint(R, 5, 16), rint(R, 6, 9), 2, 1, 'WATER'); }
    // 连通检查
    const pass = (x, y) => { const t = TILES[tAt(m, x, y)]; return t && !t.solid && !t.water; };
    const seen = new Set([sy * W + sx]); const q = [[sx, sy]];
    while (q.length) { const [x, y] = q.shift(); for (const [dx, dy] of DIRS) { const nx = x + dx, ny = y + dy, k = ny * W + nx; if (!seen.has(k) && pass(nx, ny)) { seen.add(k); q.push([nx, ny]); } } }
    if (!seen.has(cy * W + cx)) continue;
    const cells = [...seen].filter(k => Math.abs(k % W - sx) + Math.abs(((k / W) | 0) - sy) > 5);
    m.start = { x: sx + 0.5, y: sy + 0.5 };
    m.spawns.push({ type: 'chest', x: cx, y: cy, item: D.reward, cid: 'mini' });
    for (const k of D.enemies) { const c = rpick(R, cells); m.spawns.push({ type: 'enemy', kind: k, x: c % W, y: (c / W) | 0 }); }
    for (let i = 0; i < 5; i++) { const c = rpick(R, cells); m.spawns.push({ type: 'pickup', x: c % W, y: (c / W) | 0, item: R() < 0.3 ? 'rupee5' : 'rupee' }); }
    return m;
  }
  throw new Error('mini gen failed ' + id);
}

// ============ 地下城（程序生成，固定种子） ============
const DUNGEONS = {
  d1: { name: '大花盆', theme: 'pot', seed: 1201, gates: ['lock', 'item', 'tiny', 'lock'], item: 'boomerang', boss: 'beetle', enemies: ['slime', 'bat', 'ant', 'ladybug'], hazard: 'PIT', from: { map: 'forest', x: 17, y: 5 }, tier: 1 },
  d2: { name: '地漏深处', theme: 'tide', seed: 2203, gates: ['lock', 'switch', 'tiny', 'item', 'lock'], item: 'bombs', boss: 'crabking', enemies: ['slime2', 'crab', 'octo', 'fly'], hazard: 'DWATER', from: { map: 'lake', x: 19, y: 10 }, tier: 2 },
  d3: { name: '碗柜迷宫', theme: 'wood', seed: 3307, gates: ['lock', 'crack', 'switch', 'item', 'lock'], item: 'feather', boss: 'lavagolem', enemies: ['ant', 'roach', 'fly', 'rat'], hazard: 'PIT', from: { map: 'mountain', x: 17, y: 7 }, tier: 3 },
  d4: { name: '罐头城堡', theme: 'junk', seed: 4409, gates: ['lock', 'pit', 'tiny', 'crack', 'item', 'lock', 'switch'], item: 'bow', boss: 'wizard', enemies: ['knight', 'rat', 'dust', 'roach'], hazard: 'PIT', from: { map: 'ruins', x: 17, y: 14 }, tier: 4 },
};
const ITEM_GATE = { boomerang: 'switch', bombs: 'crack', feather: 'pit', bow: 'eye' };
const GATE_TILE = { lock: 'DLOCK', boss: 'DBOSS', eye: 'DEYE', crack: 'DCRACK', switch: 'DSWBAR', pit: 'PIT', tiny: 'DTINY' };
const RW = 20, RH = 11;
const ROOM_TPL = {
  empty: [],
  pillars: [[3, 2, 1, 1, 'STATUE'], [16, 2, 1, 1, 'STATUE'], [3, 8, 1, 1, 'STATUE'], [16, 8, 1, 1, 'STATUE']],
  columns: [[4, 2, 1, 1, 'STATUE'], [7, 2, 1, 1, 'STATUE'], [12, 2, 1, 1, 'STATUE'], [15, 2, 1, 1, 'STATUE'], [4, 8, 1, 1, 'STATUE'], [7, 8, 1, 1, 'STATUE'], [12, 8, 1, 1, 'STATUE'], [15, 8, 1, 1, 'STATUE']],
  pools: [[2, 1, 4, 2, 'HZ'], [14, 1, 4, 2, 'HZ'], [2, 8, 4, 2, 'HZ'], [14, 8, 4, 2, 'HZ']],
  blocks: [[3, 3, 3, 1, 'DWALL'], [14, 3, 3, 1, 'DWALL'], [3, 7, 3, 1, 'DWALL'], [14, 7, 3, 1, 'DWALL']],
};
function genDungeon(id) {
  const D = DUNGEONS[id];
  const GW = 6, GH = 6;
  let R, path, attempt = 0;
  const gates = D.gates.map(g => g === 'item' ? ITEM_GATE[D.item] : g);
  const itemGateIdx = D.gates.indexOf('item');
  const L = gates.length + 4;
  while (true) {
    R = mulberry32(D.seed + attempt * 7919); attempt++;
    const sx = Math.floor(GW / 2), sy = GH - 1;
    path = [[sx, sy]]; const used = new Set([sx + ',' + sy]);
    let ok = true;
    while (path.length < L) {
      const [cx, cy] = path[path.length - 1];
      const opts = [];
      for (const [dx, dy, w] of [[0, -1, 3], [-1, 0, 2], [1, 0, 2], [0, 1, 0.6]]) {
        const nx = cx + dx, ny = cy + dy;
        if (nx < 0 || ny < 0 || nx >= GW || ny >= GH || used.has(nx + ',' + ny)) continue;
        if (ny === GH - 1 && path.length > 1 && dy !== 0) continue;
        for (let k = 0; k < w * 10; k++) opts.push([nx, ny]);
      }
      if (!opts.length) { ok = false; break; }
      const nxt = rpick(R, opts); path.push(nxt); used.add(nxt[0] + ',' + nxt[1]);
    }
    if (ok) break;
    if (attempt > 500) throw new Error('dungeon gen failed');
  }
  const n = gates.length; const gateEdges = [];
  for (let k = 0; k < n; k++) gateEdges.push(Math.floor((k + 0.5) * (L - 2) / n));
  gateEdges.push(L - 2);
  const allGates = gates.concat(['boss']);
  const segOf = i => gateEdges.filter(e => e < i).length;
  const R2 = {};
  path.forEach((p, i) => { R2[p[0] + ',' + p[1]] = { gx: p[0], gy: p[1], seg: segOf(i), onPath: true, pi: i, links: {} }; });
  const link = (a, b, type) => {
    const dx = b.gx - a.gx, dy = b.gy - a.gy;
    const da = dx === 1 ? 'e' : dx === -1 ? 'w' : dy === 1 ? 's' : 'n';
    const db = { e: 'w', w: 'e', s: 'n', n: 's' }[da];
    a.links[da] = { to: b, type }; b.links[db] = { to: a, type };
  };
  for (let i = 0; i < path.length - 1; i++) { const gi = gateEdges.indexOf(i); link(R2[path[i][0] + ',' + path[i][1]], R2[path[i + 1][0] + ',' + path[i + 1][1]], gi >= 0 ? allGates[gi] : 'open'); }
  const tryBranch = (room, len) => {
    let cur = room;
    for (let s = 0; s < len; s++) {
      const opts = [];
      for (const [dx, dy] of [[0, -1], [-1, 0], [1, 0], [0, 1]]) { const nx = cur.gx + dx, ny = cur.gy + dy; if (nx < 0 || ny < 0 || nx >= GW || ny >= GH || R2[nx + ',' + ny]) continue; opts.push([nx, ny]); }
      if (!opts.length) return;
      const [nx, ny] = rpick(R, opts);
      const nr = { gx: nx, gy: ny, seg: room.seg, onPath: false, links: {} };
      R2[nx + ',' + ny] = nr; link(cur, nr, 'open'); cur = nr;
    }
  };
  for (let i = 0; i < path.length - 1; i++) { const r = R2[path[i][0] + ',' + path[i][1]]; if (R() < 0.5 || i === 0) tryBranch(r, R() < 0.35 ? 2 : 1); }
  const allRooms = Object.values(R2);
  const start = R2[path[0][0] + ',' + path[0][1]], bossRoom = R2[path[L - 1][0] + ',' + path[L - 1][1]];
  allRooms.forEach(r => { r.chest = null; r.kind = 'normal'; });
  start.kind = 'start'; bossRoom.kind = 'boss';
  for (let k = 0; k < allGates.length; k++) {
    const g = allGates[k];
    let need = null;
    if (g === 'lock') need = { item: 'key' }; else if (g === 'boss') need = { item: 'bosskey' }; else if (k === itemGateIdx) need = { item: D.item, big: true };
    if (!need) continue;
    let cands = allRooms.filter(r => r.seg === k && !r.chest && r !== bossRoom && !r.onPath);
    if (!cands.length) cands = allRooms.filter(r => r.seg === k && !r.chest && r !== bossRoom && r !== start);
    if (!cands.length) cands = allRooms.filter(r => r.seg <= k && !r.chest && r !== bossRoom);
    if (!cands.length) cands = [start];
    rpick(R, cands).chest = need;
  }
  const m = newMap(id, GW * RW, GH * RH, 'VOID');
  m.name = D.name; m.theme = D.theme; m.outdoor = false; m.music = 'dungeon'; m.isDungeon = true; m.dng = id; m.base = 'dfloor'; m.tier = D.tier;
  m.rooms = {}; m.doors = []; m.gridW = GW; m.gridH = GH;
  for (const r of allRooms) {
    const ox = r.gx * RW, oy = r.gy * RH;
    r.ox = ox; r.oy = oy; r.key = r.gx + ',' + r.gy; r.doorTiles = [];
    m.rooms[r.key] = r;
    rectT(m, ox, oy, RW, RH, 'DWALL'); rectT(m, ox + 1, oy + 1, RW - 2, RH - 2, 'DEDGE'); rectT(m, ox + 2, oy + 2, RW - 4, RH - 4, 'DFLOOR');
    const special = r.kind !== 'normal' || Object.values(r.links).some(l => ['eye', 'switch', 'tiny'].includes(l.type));
    let tpl = special ? 'empty' : rpick(R, ['empty', 'pillars', 'columns', 'pools', 'blocks', 'pools']);
    if (r.kind === 'boss') tpl = 'pillars';
    r.tpl = tpl;
    for (const f of ROOM_TPL[tpl]) rectT(m, ox + f[0], oy + f[1], f[2], f[3], f[4] === 'HZ' ? D.hazard : f[4]);
  }
  let doorId = 0;
  for (const r of allRooms) {
    for (const dir in r.links) {
      if (dir !== 'e' && dir !== 's') continue;
      const l = r.links[dir], o = l.to;
      const tiles = [];
      if (dir === 'e') for (let j = 4; j <= 6; j++) { tiles.push([r.ox + RW - 1, r.oy + j]); tiles.push([r.ox + RW, r.oy + j]); }
      else for (let i = 9; i <= 10; i++) { tiles.push([r.ox + i, r.oy + RH - 1]); tiles.push([r.ox + i, r.oy + RH]); }
      const d = { id: doorId++, type: l.type, tiles, a: r.key, b: o.key };
      m.doors.push(d);
      for (const [x, y] of tiles) setT(m, x, y, l.type === 'open' ? 'DOPEN' : GATE_TILE[l.type]);
      const before = r.onPath && o.onPath ? (r.pi < o.pi ? r : o) : r;
      d.room = before.key;
      if (l.type === 'eye') setT(m, before.ox + 4, before.oy, 'DEYESW');
      if (l.type === 'switch') { rectT(m, before.ox + 15, before.oy + 1, 3, 3, D.hazard === 'LAVA' ? 'LAVA' : 'PIT'); setT(m, before.ox + 16, before.oy + 2, 'CRYSW'); m.under[(before.oy + 2) * m.w + before.ox + 16] = 'dfloor'; }
      if (l.type === 'tiny') {
        // 两边房间各放一个缩小石桩
        if (dir === 'e') { setT(m, r.ox + RW - 4, r.oy + 2, 'DSTUMP'); setT(m, o.ox + 3, o.oy + 2, 'DSTUMP'); }
        else { setT(m, r.ox + 6, r.oy + RH - 3, 'DSTUMP'); setT(m, o.ox + 6, o.oy + 2, 'DSTUMP'); }
      }
    }
  }
  for (const d of m.doors) for (const [x, y] of d.tiles) { const rk = Math.floor(x / RW) + ',' + Math.floor(y / RH); m.rooms[rk].doorTiles.push([x, y, d.id]); }
  setT(m, start.ox + 9, start.oy + RH - 1, 'EXIT'); setT(m, start.ox + 10, start.oy + RH - 1, 'EXIT');
  m.start = { x: start.ox + 10, y: start.oy + RH - 2.5 };
  let cid = 0;
  const free = (x, y) => { const nm = TILES[tAt(m, x, y)].name; return nm === 'DFLOOR' || nm === 'DEDGE'; };
  for (const r of allRooms) {
    const ox = r.ox, oy = r.oy;
    if (r.kind === 'boss') { m.spawns.push({ type: 'boss', kind: D.boss, x: ox + 10, y: oy + 3, room: r.key }); continue; }
    if (r.kind !== 'start') {
      const cnt = 2 + Math.floor(R() * (1.5 + D.tier * 0.5));
      r.enemies = R() < 0.85 || !!r.chest;
      if (r.enemies) for (let i = 0; i < cnt; i++) {
        let x, y, t = 0; do { x = ox + 2 + Math.floor(R() * 16); y = oy + 2 + Math.floor(R() * 7); t++; } while ((!free(x, y) || (Math.abs(x - ox - 10) < 3 && Math.abs(y - oy - 5) < 2)) && t < 50);
        m.spawns.push({ type: 'enemy', kind: rpick(R, D.enemies), x, y, room: r.key });
      }
    }
    if (r.chest) m.spawns.push({ type: 'chest', x: ox + 14, y: oy + 5, item: r.chest.item, big: r.chest.big, hidden: r.enemies && R() < 0.6, room: r.key, cid: 'c' + (cid++) });
    else if (r.kind === 'normal' && !r.onPath && r.tpl === 'empty' && R() < 0.75) {
      setT(m, ox + 7, oy + 2, 'PLATE');
      m.spawns.push({ type: 'block', x: ox + 4, y: oy + 2, room: r.key });
      m.spawns.push({ type: 'chest', x: ox + 14, y: oy + 5, item: 'loot', hidden: 'plate', room: r.key, cid: 'c' + (cid++) });
    } else if (r.kind === 'normal' && R() < 0.35) m.spawns.push({ type: 'chest', x: ox + 14, y: oy + 5, item: 'loot', hidden: r.enemies, room: r.key, cid: 'c' + (cid++) });
    const pc = Math.floor(R() * 4);
    for (let i = 0; i < pc; i++) { const c = rpick(R, [[1, 1], [18, 1], [1, 9], [18, 9], [2, 1], [17, 9]]); if (free(ox + c[0], oy + c[1])) setT(m, ox + c[0], oy + c[1], 'POT'); }
  }
  return m;
}

// ============ 地图读取 ============
const mapCache = {};
function getMap(id) {
  if (mapCache[id]) return mapCache[id];
  let m;
  if (DUNGEONS[id]) m = genDungeon(id);
  else if (MINIS[id]) m = genMini(id);
  else if (MAPDEF[id]) m = MAPDEF[id]();
  else throw new Error('未知地图 ' + id);
  computeUnder(m);
  mapCache[id] = m;
  return m;
}
function initMaps() { for (const k in MAPDEF) getMap(k); }
const WORLD_LAYOUT = { forest: [1, 0], mountain: [2, 0], village: [1, 1], field: [2, 1], lake: [3, 1], ruins: [2, 2] };
