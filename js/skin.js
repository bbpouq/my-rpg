'use strict';
// =====================================================================
//  场景皮肤：花园 / 木门廊 / 浴室 / 厨房 / 地下室（小人眼中的大人房子）
// =====================================================================
Object.assign(THEMES, {
  garden: { skin: 'garden', floor: '#8a6a48', floor2: '#7a5a3a', wall: '#6a4a2a', wall2: '#4a3018', hi: '#8a6a4a', water: '#4aa0ec' },
  porch: { skin: 'porch', floor: '#b8844e', floor2: '#9a6a3a', wall: '#7a4a24', wall2: '#5a3418', hi: '#d09a60', water: '#4aa0ec' },
  bath: { skin: 'bath', floor: '#e4eef4', floor2: '#b8c8d4', wall: '#8aa8c0', wall2: '#6a88a0', hi: '#ffffff', water: '#5ab0f0' },
  kitchen: { skin: 'kitchen', floor: '#f0e6cc', floor2: '#d8c8a8', wall: '#a06838', wall2: '#7a4a24', hi: '#c08850', water: '#4aa0ec' },
  basement: { skin: 'basement', floor: '#6a5444', floor2: '#5a4434', wall: '#4a3a30', wall2: '#33281f', hi: '#7a6450', water: '#3a6ab8' },
  pot: { floor: '#8a6448', floor2: '#76543a', wall: '#c8703e', wall2: '#8e4622', hi: '#e8946a', water: '#3d7cc4' },
  wood: { floor: '#c49060', floor2: '#a87444', wall: '#7a4a24', wall2: '#5a3418', hi: '#9a6a3a', water: '#3d7cc4' },
  junk: { floor: '#5a5466', floor2: '#4a4456', wall: '#7a7a88', wall2: '#4a4a58', hi: '#a8a8b8', water: '#3a6ab8' },
});
const skinOf = th => (th && th.skin) || 'garden';
const SKIN = { porch: {}, bath: {}, kitchen: {}, basement: {}, garden: {} };

// ---------- 门廊：木地板 ----------
SKIN.porch.GRASS = (g, R) => {
  fill(g, '#b8844e');
  for (let y = 0; y < 16; y += 8) { rect(g, 0, y + 7, 16, 1, '#7a4e28'); rect(g, 0, y, 16, 1, '#d09a60'); }
  for (let i = 0; i < 4; i++) rect(g, Math.floor(R() * 12), 1 + Math.floor(R() * 13), 3 + Math.floor(R() * 3), 1, '#a87444');
  if (R() < 0.3) { px1(g, 2, 3, '#5a3a20'); px1(g, 2, 11, '#5a3a20'); }
};
SKIN.porch.PATH = (g, R) => { fill(g, '#c8a870'); for (let y = 0; y < 16; y += 2) for (let x = (y / 2) % 2; x < 16; x += 2) px1(g, x, y, '#b08e58'); rect(g, 0, 0, 16, 1, '#e0c890'); };
SKIN.porch.TALL = (g, R) => { SKIN.porch.GRASS(g, mulberry32(4)); for (let i = 0; i < 6; i++) { const x = 1 + Math.floor(R() * 11), y = 3 + Math.floor(R() * 10), c = pick(['#d87a2a', '#c85a20', '#e8a040', '#a86030']); ell(g, x + 2, y, 3, 2, PAL.outline); ell(g, x + 2, y, 2, 1, c); px1(g, x + 2, y, shade(c, -0.3)); } };
SKIN.porch.FLOWER = (g, R) => { SKIN.porch.GRASS(g, R); const x = 4 + Math.floor(R() * 8), y = 4 + Math.floor(R() * 8); ell(g, x, y, 2, 1, '#ff9ac0'); px1(g, x, y, '#ffffff'); };
SKIN.porch.CHASM = (g) => { fill(g, '#140a04'); rect(g, 0, 0, 16, 3, '#9a6a3a'); rect(g, 0, 3, 16, 1, '#3a2010'); rect(g, 0, 13, 16, 3, '#2a1608'); };
SKIN.porch.CLIFF = (g, R) => { fill(g, '#a86e3a'); for (let x = 0; x < 16; x += 5) rect(g, x, 0, 1, 16, '#6a4220'); rect(g, 0, 7, 16, 2, '#7a4a24'); speck(g, R, 4, '#c08850', 2, 1); };

// ---------- 浴室：瓷砖与肥皂泡 ----------
SKIN.bath.GRASS = (g, R) => { fill(g, '#e8f0f6'); rect(g, 0, 7, 16, 1, '#b8c8d4'); rect(g, 7, 0, 1, 16, '#b8c8d4'); rect(g, 15, 0, 1, 16, '#b8c8d4'); rect(g, 0, 15, 16, 1, '#b8c8d4'); px1(g, 1, 1, '#ffffff'); px1(g, 9, 9, '#ffffff'); if (R() < 0.2) px1(g, 3 + Math.floor(R() * 10), 3 + Math.floor(R() * 10), '#c8d8e4'); };
SKIN.bath.SAND = (g, R) => { fill(g, '#9ac8e8'); for (let i = 0; i < 14; i++) px1(g, Math.floor(R() * 16), Math.floor(R() * 16), R() < 0.5 ? '#bce0f8' : '#7ab0d8'); };
SKIN.bath.PATH = (g) => { fill(g, '#f8f0f4'); for (let y = 0; y < 16; y += 4) rect(g, 0, y, 16, 2, '#f0a0b8'); };
SKIN.bath.WATER = (g, R, th, f) => { fill(g, '#62b4f0'); for (let i = 0; i < 3; i++) { const x = (Math.floor(R() * 12) + f * 2) % 13, y = 2 + i * 5; rect(g, x, y, 4, 1, '#a8daff'); } const bx = 3 + Math.floor(R() * 9), by = 3 + Math.floor(R() * 9); circ(g, bx, by, 2, '#e8f6ff'); circ(g, bx, by, 1, '#8ccaf8'); px1(g, bx - 1, by - 1, '#ffffff'); };
SKIN.bath.TALL = (g, R) => { SKIN.bath.GRASS(g, mulberry32(3)); for (const [x, y, r] of [[5, 6, 3], [11, 5, 2], [9, 11, 3], [3, 12, 2]]) { circ(g, x, y, r, '#a0c8e8'); circ(g, x, y, r - 1, '#e8f6ff'); px1(g, x - 1, y - 1, '#ffffff'); if (r > 2) px1(g, x + 1, y + 1, '#f0b0e0'); } };
SKIN.bath.FLOWER = (g, R) => { SKIN.bath.GRASS(g, R); const x = 4 + Math.floor(R() * 8), y = 4 + Math.floor(R() * 8); ell(g, x, y, 1, 2, '#62b4f0'); px1(g, x, y - 1, '#ffffff'); };
SKIN.bath.BUSH = (g, R) => { ell(g, 8, 14, 6, 2, 'rgba(0,0,0,0.2)'); rect(g, 2, 4, 12, 10, PAL.outline); rect(g, 3, 5, 10, 8, '#f0d040'); rect(g, 3, 5, 10, 2, '#f8e880'); for (let i = 0; i < 8; i++) px1(g, 4 + Math.floor(R() * 8), 7 + Math.floor(R() * 5), '#c8a020'); };
SKIN.bath.RUIN = (g) => { fill(g, '#b8c4d0'); rect(g, 0, 0, 16, 1, '#e8f0f8'); for (let x = 2; x < 16; x += 4) rect(g, x, 3, 2, 10, '#5a6878'); rect(g, 0, 15, 16, 1, '#6a7888'); };

// ---------- 厨房：格子地砖、橱柜、方糖 ----------
SKIN.kitchen.ROCKY = (g) => { fill(g, '#f2e8d0'); rect(g, 0, 0, 8, 8, '#dccaa4'); rect(g, 8, 8, 8, 8, '#dccaa4'); rect(g, 0, 0, 16, 1, '#c8b690'); rect(g, 0, 0, 1, 16, '#c8b690'); };
SKIN.kitchen.PATH = (g) => { fill(g, '#c84a3a'); rect(g, 0, 2, 16, 1, '#f0c040'); rect(g, 0, 13, 16, 1, '#f0c040'); for (let x = 2; x < 16; x += 6) { rect(g, x, 6, 3, 3, '#f0c040'); px1(g, x + 1, 7, '#c84a3a'); } };
SKIN.kitchen.CLIFF = (g, R) => { fill(g, '#a8703c'); rect(g, 1, 1, 14, 14, '#8a5a2c'); rect(g, 2, 2, 12, 12, '#b07a44'); rect(g, 2, 2, 12, 1, '#c89058'); rect(g, 12, 7, 1, 3, '#e8d8a0'); };
SKIN.kitchen.BOULDER = (g) => { ell(g, 8, 15, 7, 1, 'rgba(0,0,0,0.2)'); rect(g, 2, 2, 12, 12, PAL.outline); rect(g, 3, 3, 10, 10, '#f8f8fc'); rect(g, 3, 3, 10, 3, '#ffffff'); rect(g, 10, 6, 3, 7, '#d8dce8'); for (const [x, y] of [[5, 8], [8, 10], [6, 11]]) px1(g, x, y, '#e0e4f0'); px1(g, 5, 4, '#c0e8ff'); };
SKIN.kitchen.TALLD = (g, R) => { SKIN.kitchen.ROCKY(g, R); for (let i = 0; i < 5; i++) { const x = 2 + Math.floor(R() * 11), y = 3 + Math.floor(R() * 10); rect(g, x, y, 3, 2, PAL.outline); rect(g, x, y, 2, 1, '#e8b860'); px1(g, x + 1, y + 1, '#c08838'); } };
SKIN.kitchen.CRACK = (g) => { ell(g, 8, 15, 7, 1, 'rgba(0,0,0,0.2)'); circ(g, 8, 8, 7, PAL.outline); circ(g, 8, 8, 6, '#d8a050'); circ(g, 7, 7, 4, '#e8b868'); for (const [x, y] of [[5, 5], [10, 6], [7, 10], [11, 10]]) rect(g, x, y, 2, 2, '#5a3018'); rect(g, 8, 2, 1, 5, '#6a3a18'); rect(g, 4, 8, 4, 1, '#6a3a18'); };
SKIN.kitchen.SIGNT = null;

// ---------- 地下室：旧地板、灰尘团、书堆、罐头城堡 ----------
SKIN.basement.GRASS = (g, R) => { fill(g, '#6a5444'); for (let x = 0; x < 16; x += 8) { rect(g, x, 0, 1, 16, '#4a382c'); rect(g, x + 1, 0, 1, 16, '#806654'); } for (let i = 0; i < 3; i++) rect(g, 2 + Math.floor(R() * 12), Math.floor(R() * 14), 1, 3, '#5a4638'); };
SKIN.basement.PATH = (g) => { fill(g, '#8a3a3a'); rect(g, 0, 0, 16, 2, '#c8a050'); rect(g, 0, 14, 16, 2, '#c8a050'); for (let x = 1; x < 16; x += 5) rect(g, x, 6, 3, 3, '#5a2020'); };
SKIN.basement.STONE = (g) => { fill(g, '#7a6248'); rect(g, 0, 0, 16, 16, '#7a6248'); for (let i = 0; i < 16; i += 4) { rect(g, i, 0, 2, 16, '#86704f'); } rect(g, 0, 7, 16, 2, '#5a4836'); };
SKIN.basement.TALL = (g, R) => { SKIN.basement.GRASS(g, mulberry32(2)); for (const [x, y] of [[5, 6], [11, 10], [4, 12]]) { circ(g, x, y, 3, '#8a8a92'); circ(g, x, y, 2, '#b4b4bc'); px1(g, x - 1, y - 1, '#d8d8e0'); px1(g, x + 2, y - 3, '#8a8a92'); px1(g, x - 3, y + 1, '#8a8a92'); } };
SKIN.basement.FLOWER = (g, R) => { SKIN.basement.GRASS(g, R); px1(g, 4 + Math.floor(R() * 8), 4 + Math.floor(R() * 8), '#f0d040'); };
SKIN.basement.RUIN = (g, R) => { fill(g, '#3a2a20'); const c = ['#c84a4a', '#4a7ac8', '#4aa060', '#d8a040', '#8a5ab0']; for (let y = 0; y < 16; y += 4) { rect(g, 0, y, 16, 3, c[Math.floor(R() * 5)]); rect(g, 0, y, 16, 1, '#f0e0c0'); rect(g, 2, y + 1, 3, 1, '#f8d870'); } };
SKIN.basement.TOWER = (g, R) => { fill(g, '#8a8a98'); for (let x = 0; x < 16; x += 8) { rect(g, x, 0, 1, 16, '#5a5a68'); rect(g, x + 2, 0, 2, 16, '#c0c0cc'); } rect(g, 0, 5, 16, 1, '#5a5a68'); rect(g, 0, 11, 16, 1, '#5a5a68'); if (R() < 0.5) rect(g, 3 + Math.floor(R() * 8), 7, 3, 2, '#a85a2a'); };
SKIN.basement.BUSH = (g) => { ell(g, 8, 14, 6, 2, 'rgba(0,0,0,0.25)'); circ(g, 8, 9, 6, PAL.outline); circ(g, 8, 9, 5, '#e8e4d8'); rect(g, 5, 7, 5, 1, '#b8b4a8'); rect(g, 7, 10, 4, 1, '#b8b4a8'); px1(g, 6, 6, '#ffffff'); };
SKIN.basement.STATUE = (g) => { ell(g, 8, 15, 5, 1, 'rgba(0,0,0,0.3)'); rect(g, 4, 12, 8, 3, PAL.outline); rect(g, 5, 12, 6, 2, '#3a7a3a'); rect(g, 6, 5, 4, 7, '#3a7a3a'); circ(g, 8, 4, 2, '#3a7a3a'); rect(g, 5, 1, 6, 2, '#2a5a2a'); px1(g, 7, 6, '#6ab06a'); };

// ---------- 花园：陶土花盆神殿 ----------
SKIN.garden.RUIN = (g, R) => { fill(g, '#c8703e'); rect(g, 0, 0, 16, 2, '#e8946a'); rect(g, 0, 2, 16, 1, '#8e4622'); for (let i = 0; i < 3; i++) px1(g, Math.floor(R() * 16), 4 + Math.floor(R() * 11), '#a85a30'); rect(g, 0, 15, 16, 1, '#8e4622'); };

// ---------- 包装：根据皮肤选择绘制 ----------
for (const nm of ['GRASS', 'PATH', 'SAND', 'TALL', 'TALLD', 'FLOWER', 'CHASM', 'CLIFF', 'WATER', 'BUSH', 'BOULDER', 'CRACK', 'RUIN', 'TOWER', 'STONE', 'STATUE', 'ROCKY']) {
  const t = TILES[TILE[nm]], orig = t.draw;
  t.draw = function (g, R, th, f) { const fn = SKIN[skinOf(th)][nm]; if (fn) fn(g, R, th, f); else orig.call(this, g, R, th, f); };
}
for (const [bn, nm] of [['grass', 'GRASS'], ['path', 'PATH'], ['sand', 'SAND'], ['rocky', 'ROCKY'], ['stone', 'STONE']]) {
  const orig = BASES[bn];
  BASES[bn] = (g, R, th) => { const fn = th && SKIN[skinOf(th)][nm]; if (fn) fn(g, R, th); else orig(g, R, th); };
}

// ---------- 村子：蘑菇屋、瓶盖屋顶、叶子屋顶、罐头屋顶 ----------
TILES[TILE.ROOF_R].draw = (g, R) => { fill(g, '#d84040'); rect(g, 0, 15, 16, 1, '#a02828'); for (let i = 0; i < 2; i++) { const x = 2 + Math.floor(R() * 10), y = 2 + Math.floor(R() * 9); circ(g, x, y, 2, '#fff4e8'); px1(g, x - 1, y - 1, '#ffffff'); } rect(g, 0, 0, 16, 1, '#f07060'); };
TILES[TILE.ROOF_B].draw = (g) => { fill(g, '#4a78d0'); for (let x = 0; x < 16; x += 3) rect(g, x, 0, 1, 16, '#2e58a8'); rect(g, 0, 0, 16, 2, '#7aa8f0'); };
TILES[TILE.ROOF_G].draw = (g, R) => { fill(g, '#4aa850'); for (let y = 0; y < 16; y += 5) for (let x = (y / 5 % 2) * 4; x < 16; x += 8) { ell(g, x + 4, y + 3, 4, 2, '#2e7a34'); ell(g, x + 4, y + 2, 3, 1, '#6ac860'); rect(g, x + 1, y + 3, 6, 1, '#3e9040'); } };
TILES[TILE.ROOF_K].draw = (g) => { fill(g, '#a8acb8'); for (let x = 0; x < 16; x += 4) { rect(g, x, 0, 1, 16, '#7a7e8a'); rect(g, x + 1, 0, 1, 16, '#d0d4e0'); } };
TILES[TILE.WALL].draw = (g) => { fill(g, '#f4ead4'); rect(g, 0, 0, 16, 2, 'rgba(0,0,0,0.12)'); for (let y = 4; y < 12; y += 4) rect(g, (y * 3) % 12, y, 3, 1, '#e0d0b0'); rect(g, 0, 13, 16, 3, '#c8b898'); rect(g, 0, 13, 16, 1, '#e0d4bc'); };

// ---------- 高物体（遮挡主角）：三叶草、盆栽、洗发水瓶、玻璃瓶、纸箱 ----------
const _origCanopy = ART.canopy.bind(ART);
ART.canopy = function (kind, v, trunk) {
  if (kind === 'tree' || kind === 'pine') return _origCanopy(kind, v, trunk);
  const key = kind + v + (trunk ? 't' : '');
  if (this.treeCache[key]) return this.treeCache[key];
  const c = makeCanvas(32, 32), g = c.getContext('2d'), R = mulberry32(v * 131 + 7), O = PAL.outline;
  if (kind === 'clover') {
    if (trunk) { rect(g, 14, 18, 4, 13, O); rect(g, 15, 18, 2, 13, '#5aa848'); }
    for (const [x, y] of [[10, 10], [22, 10], [16, 19]]) { circ(g, x - 2, y, 6, O); circ(g, x + 2, y, 6, O); }
    for (const [x, y] of [[10, 10], [22, 10], [16, 19]]) { circ(g, x - 2, y, 5, '#3e9a3c'); circ(g, x + 2, y, 5, '#3e9a3c'); circ(g, x - 2, y - 1, 3, '#5cb848'); }
    for (const [x, y] of [[10, 10], [22, 10], [16, 19]]) { rect(g, x, y - 4, 1, 8, '#2c7a30'); px1(g, x - 3, y - 2, '#8ade66'); ell(g, x, y, 3, 2, 'rgba(255,255,255,0.12)'); }
    circ(g, 16, 14, 2, '#2c7a30');
  } else if (kind === 'blades') {
    for (const [x, h, w] of [[8, 26, 3], [13, 31, 4], [19, 28, 3], [24, 22, 3]]) { rect(g, x - 1, 31 - h, w + 2, h, O); rect(g, x, 32 - h, w, h - 1, '#4caa3a'); rect(g, x, 32 - h, 1, h - 1, '#7ad05a'); rect(g, x + w - 1, 32 - h, 1, h - 1, '#2e7a26'); }
  } else if (kind === 'pot') {
    rect(g, 8, 20, 16, 11, O); rect(g, 9, 21, 14, 9, '#c8703e'); rect(g, 7, 18, 18, 4, O); rect(g, 8, 19, 16, 2, '#e8946a'); rect(g, 9, 24, 3, 6, '#e08a5a');
    for (const [x, y, r] of [[16, 9, 7], [10, 13, 5], [22, 13, 5]]) circ(g, x, y, r + 1, O);
    for (const [x, y, r] of [[16, 9, 7], [10, 13, 5], [22, 13, 5]]) { circ(g, x, y, r, '#3e9a3c'); circ(g, x - 2, y - 2, Math.max(1, r - 3), '#6cc850'); }
  } else if (kind === 'bottle') {
    const col = ['#f070a0', '#60b0f0', '#f0c040'][v];
    rect(g, 7, 6, 18, 25, O); rect(g, 8, 7, 16, 23, col); rect(g, 9, 8, 3, 21, shade(col, 0.4)); rect(g, 21, 8, 2, 21, shade(col, -0.25));
    rect(g, 11, 14, 10, 8, '#ffffff'); rect(g, 12, 16, 8, 1, shade(col, -0.2)); rect(g, 12, 18, 6, 1, shade(col, -0.2));
    rect(g, 11, 0, 10, 7, O); rect(g, 12, 1, 8, 5, '#f8f8f8'); rect(g, 12, 1, 8, 1, '#ffffff');
  } else if (kind === 'jar') {
    rect(g, 10, 3, 12, 28, O); rect(g, 11, 10, 10, 20, '#5a2a10'); rect(g, 12, 11, 2, 18, '#8a4a20'); rect(g, 13, 3, 6, 8, O); rect(g, 14, 4, 4, 6, '#5a2a10'); rect(g, 12, 1, 8, 3, '#e04040'); rect(g, 12, 16, 8, 7, '#f0e8d0'); rect(g, 13, 18, 6, 1, '#c84040');
  } else if (kind === 'box') {
    rect(g, 1, 6, 30, 25, O); rect(g, 2, 7, 28, 23, '#c8945a'); rect(g, 2, 7, 28, 6, '#dcaa70'); rect(g, 2, 13, 28, 1, '#9a6a38'); rect(g, 14, 7, 4, 6, '#e8d8a0'); rect(g, 24, 16, 4, 4, '#9a6a38'); rect(g, 4, 25, 8, 1, '#9a6a38');
  }
  this.treeCache[key] = c;
  return c;
};
const OVER_KIND = { garden: { tree: 'clover', pine: 'blades' }, porch: { tree: 'pot', pine: 'pot' }, bath: { tree: 'bottle', pine: 'bottle' }, kitchen: { tree: 'jar', pine: 'jar' }, basement: { tree: 'box', pine: 'box' } };
ART.tallList = function (m, x0, y0, x1, y1, cx, cy) {
  const out = [], sk = skinOf(THEMES[m.theme]), map = OVER_KIND[sk] || OVER_KIND.garden;
  for (let y = Math.max(0, y0); y <= Math.min(m.h - 1, y1 + 2); y++) for (let x = Math.max(0, x0 - 1); x <= Math.min(m.w - 1, x1 + 1); x++) {
    const t = TILES[m.t[y * m.w + x]]; if (!t.over) continue;
    const below = tAt(m, x, y + 1), trunk = below < 0 || !TILES[below].over;
    const kind = map[t.over] || t.over;
    const spr = this.canopy(kind, (x * 5 + y * 3) % 3, trunk);
    out.push({ sortY: () => (y + 1) * TS - 1, draw: () => ctx.drawImage(spr, x * TS - cx - 8, y * TS - cy - 16) });
  }
  return out;
};
const _origOverlay = ART.overlay;
ART.overlay = function (ctx, m, x, y, px, py) {
  const sk = skinOf(THEMES[m.theme]);
  ART.noFringe = sk !== 'garden';
  ART.lip = sk === 'kitchen' ? '#f4f0e8' : sk === 'porch' ? '#d09a60' : null;
  _origOverlay(ctx, m, x, y, px, py);
};

// ---------- 地下城装饰：橡皮鸭、茶杯、罐头、嫩芽 ----------
THEMES.pot.deco = 'sprout'; THEMES.tide.deco = 'duck'; THEMES.wood.deco = 'cup'; THEMES.junk.deco = 'can';
(() => {
  const t = TILES[TILE.STATUE], orig = t.draw, O = PAL.outline;
  t.draw = function (g, R, th, f) {
    const d = th && th.deco;
    if (d === 'duck') { ell(g, 8, 14, 6, 2, 'rgba(0,0,0,0.25)'); ell(g, 8, 11, 7, 4, O); ell(g, 8, 11, 6, 3, '#f8d838'); circ(g, 10, 6, 4, O); circ(g, 10, 6, 3, '#f8d838'); rect(g, 13, 6, 3, 2, '#f08020'); px1(g, 11, 5, O); rect(g, 4, 9, 4, 1, '#fff070'); }
    else if (d === 'cup') { ell(g, 8, 14, 6, 2, 'rgba(0,0,0,0.25)'); rect(g, 2, 4, 11, 10, O); rect(g, 3, 5, 9, 8, '#f4f4f8'); rect(g, 3, 5, 9, 2, '#6a3a18'); rect(g, 12, 6, 3, 5, O); rect(g, 13, 7, 1, 3, '#f4f4f8'); rect(g, 4, 9, 7, 1, '#4a8ad0'); }
    else if (d === 'can') { ell(g, 8, 14, 6, 2, 'rgba(0,0,0,0.3)'); rect(g, 3, 2, 10, 12, O); rect(g, 4, 3, 8, 10, '#b8bcc8'); rect(g, 4, 6, 8, 4, '#d84848'); rect(g, 5, 3, 2, 10, '#e0e4f0'); rect(g, 4, 3, 8, 1, '#8a8e9a'); }
    else if (d === 'sprout') { ell(g, 8, 14, 5, 2, 'rgba(0,0,0,0.25)'); rect(g, 7, 6, 2, 9, '#3e8a30'); ell(g, 5, 5, 4, 2, O); ell(g, 11, 5, 4, 2, O); ell(g, 5, 5, 3, 1, '#6cc850'); ell(g, 11, 5, 3, 1, '#6cc850'); ell(g, 8, 14, 4, 1, '#6a4428'); }
    else orig.call(this, g, R, th, f);
  };
})();
