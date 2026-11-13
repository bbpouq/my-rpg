'use strict';
// 额外地块
defTile('DEDGE', { draw(g, R, th) { BASES.dfloor(g, R, th); rect(g, 0, 0, 16, 16, 'rgba(0,0,0,0.12)'); rect(g, 2, 2, 12, 12, 'rgba(255,255,255,0.05)'); } });
defTile('DEYESW', { solid: true, eye: true, draw(g, R, th) { fill(g, th.wall); for (let y = 0; y < 16; y += 4) rect(g, 0, y, 16, 1, th.wall2); ell(g, 8, 8, 6, 4, '#1a0a10'); ell(g, 8, 8, 5, 3, '#ffffff'); circ(g, 8, 8, 2, '#d02020'); rect(g, 8, 8, 1, 1, '#000'); } });
defTile('DEYEOFF', { solid: true, draw(g, R, th) { fill(g, th.wall); for (let y = 0; y < 16; y += 4) rect(g, 0, y, 16, 1, th.wall2); ell(g, 8, 8, 6, 2, '#1a0a10'); rect(g, 3, 8, 10, 1, '#5a3030'); } });
defTile('EYEOFF', { solid: true, draw(g) { fill(g, '#9c7a56'); for (let y = 3; y < 16; y += 5) rect(g, 0, y, 16, 1, '#7a5a3c'); rect(g, 3, 8, 10, 1, '#2a1a10'); } });
defTile('TOWER', { solid: true, draw(g, R) { fill(g, '#3a2a4a'); for (let y = 0; y < 16; y += 4) { rect(g, 0, y, 16, 1, '#241830'); const o = (y / 4 % 2) * 4; for (let x = o; x < 16; x += 8) rect(g, x, y, 1, 4, '#241830'); } speck(g, R, 3, '#6a4a8a'); } });
defTile('TDOOR', { draw(g) { fill(g, '#3a2a4a'); rect(g, 2, 2, 12, 14, '#0a0610'); rect(g, 3, 3, 10, 13, '#1a0e24'); ell(g, 8, 8, 2, 2, '#a050f0'); } });
defTile('RUIN', { solid: true, draw(g, R) { fill(g, '#8a9a7a'); for (let y = 0; y < 16; y += 4) { rect(g, 0, y, 16, 1, '#5a6a4a'); const o = (y / 4 % 2) * 4; for (let x = o; x < 16; x += 8) rect(g, x, y, 1, 4, '#5a6a4a'); } speck(g, R, 4, '#4a8a3a', 2, 1); } });

function tallVariant(name, base, c1, c2, c3) {
  defTile(name, { tall: true, draw(g, R) { BASES[base](g, mulberry32(5)); for (let i = 0; i < 10; i++) { const x = Math.floor(R() * 14) + 1, y = Math.floor(R() * 10) + 5; rect(g, x, y - 4, 1, 4, c1); rect(g, x - 1, y - 3, 1, 2, c1); rect(g, x + 1, y - 3, 1, 2, c2); rect(g, x, y - 5, 1, 1, c3); } } });
}
tallVariant('TALLD', 'rocky', '#8a6a2a', '#a8843a', '#e0c070');
tallVariant('TALLS', 'snow', '#5a8a7a', '#7aa898', '#ffffff');
tallVariant('TALLB', 'sand', '#3a8a6a', '#5aa880', '#9ae0b0');
const GROUND_BASE = { GRASS: 'grass', FLOWER: 'grass', TALL: 'grass', PATH: 'path', SAND: 'sand', SNOW: 'snow', ROCKY: 'rocky', CFLOOR: 'cfloor', DFLOOR: 'dfloor', FLOOR: 'floor', STONE: 'stone', FIELD: 'field', SOIL: 'field', DOPEN: 'dfloor', PLATE: 'dfloor', DARKG: 'cfloor', DEDGE: 'dfloor', TALLD: 'rocky', TALLS: 'snow', TALLB: 'sand' };
const BASE_TILE = { field: 'FIELD', grass: 'GRASS', path: 'PATH', sand: 'SAND', snow: 'SNOW', rocky: 'ROCKY', cfloor: 'CFLOOR', dfloor: 'DFLOOR', floor: 'FLOOR', stone: 'STONE' };

function newMap(id, w, h, fillName) {
  return {
    id, w, h, t: new Int16Array(w * h).fill(TILE[fillName || 'GRASS']), under: new Array(w * h).fill(null),
    warps: {}, exits: {}, signs: {}, theme: 'forest', outdoor: true, music: 'field', enc: null, enemies: [], fish: null,
    forage: null, name: '', spawns: [], base: 'grass', tier: 1,
  };
}
function tAt(m, x, y) { if (x < 0 || y < 0 || x >= m.w || y >= m.h) return -1; return m.t[y * m.w + x]; }
function setT(m, x, y, name) { if (x < 0 || y < 0 || x >= m.w || y >= m.h) return; m.t[y * m.w + x] = typeof name === 'number' ? name : TILE[name]; }
function rectT(m, x, y, w, h, name) { for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) setT(m, i, j, name); }
function blobT(m, cx, cy, rx, ry, name, R) {
  for (let j = -ry - 1; j <= ry + 1; j++) for (let i = -rx - 1; i <= rx + 1; i++) {
    const d = (i * i) / ((rx + 0.5) * (rx + 0.5)) + (j * j) / ((ry + 0.5) * (ry + 0.5));
    if (d <= 1 - (R ? R() * 0.15 : 0)) setT(m, cx + i, cy + j, name);
  }
}
function borderT(m, name, th, gaps) {
  for (let y = 0; y < m.h; y++) for (let x = 0; x < m.w; x++) {
    if (x < th || y < th || x >= m.w - th || y >= m.h - th) {
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
  if (b.w >= 9) { setT(m, b.x + 1, wy + 1, 'WINDOW'); setT(m, b.x + b.w - 2, wy + 1, 'WINDOW'); }
  const dx = b.x + b.door, dy = b.y + b.h - 1;
  setT(m, dx, dy, 'DOOR');
  if (b.to) { m.warps[dy * m.w + dx] = { to: b.to }; INTERIOR_BACK[b.to] = { map: m.id, x: dx, y: dy + 1 }; }
  if (b.label) (m.labels = m.labels || []).push({ x: b.x + b.w / 2, y: b.y + 0.2, text: b.label });
}
function addSign(m, x, y, text) { setT(m, x, y, 'SIGNT'); m.signs[y * m.w + x] = text; }
function addWarp(m, x, y, to, tx, ty, dir) { m.warps[y * m.w + x] = { to, x: tx, y: ty, dir }; }
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

// ============ 野外地图 ============
const MAPDEF = {};
MAPDEF.farm = () => {
  const m = newMap('farm', 40, 26, 'GRASS'); m.name = '星露农场'; m.music = 'farm'; m.fish = 'pond'; m.isFarm = true;
  const R = mulberry32(101);
  borderT(m, 'TREE', 2, [['n', 18, 21], ['e', 10, 13]]);
  rectT(m, 18, 0, 4, 3, 'PATH'); rectT(m, 19, 3, 2, 6, 'PATH');
  rectT(m, 6, 7, 1, 11, 'PATH'); rectT(m, 6, 8, 15, 1, 'PATH');
  rectT(m, 8, 10, 24, 8, 'FIELD');
  rectT(m, 32, 11, 8, 2, 'PATH'); rectT(m, 36, 10, 4, 4, 'PATH');
  blobT(m, 5, 21, 3, 2, 'WATER'); blobT(m, 3, 20, 2, 1, 'WATER');
  const prot = [[2, 1, 10, 8], [6, 7, 16, 3], [7, 9, 26, 10], [30, 9, 10, 6], [16, 0, 8, 5]];
  scatterT(m, R, 'FLOWER', 0.05, ['GRASS'], prot);
  scatterT(m, R, 'STUMP', 0.012, ['GRASS'], prot);
  scatterT(m, R, 'ROCK', 0.015, ['GRASS'], prot);
  scatterT(m, R, 'BUSH', 0.012, ['GRASS'], prot);
  scatterT(m, R, 'TREE', 0.015, ['GRASS'], prot.concat([[0, 17, 10, 9]]));
  // 农田里的杂物
  scatterT(m, R, 'ROCK', 0.03, ['FIELD']); scatterT(m, R, 'STUMP', 0.02, ['FIELD']);
  stampBuilding(m, { x: 3, y: 2, w: 7, h: 5, door: 3, roof: 'ROOF_R', to: 'home' });
  addSign(m, 21, 9, '星露农场 —— 爷爷留下的土地。\n北：迷雾森林    东：晨星村');
  m.exits = { n: { to: 'forest', off: 0 }, e: { to: 'village', off: 0 } };
  m.forage = [['dandelion', 3, [0]], ['wildberry', 3, [1, 2]], ['herb', 3], ['mushroom', 1, [2]], ['snowyam', 2, [3]]];
  return m;
};
MAPDEF.village = () => {
  const m = newMap('village', 44, 28, 'GRASS'); m.name = '晨星村'; m.music = 'village'; m.fish = 'river';
  const R = mulberry32(202);
  borderT(m, 'TREE', 2, [['w', 10, 13], ['e', 11, 12], ['s', 20, 23], ['n', 20, 23]]);
  rectT(m, 2, 2, 40, 3, 'WATER');
  rectT(m, 20, 0, 4, 1, 'ROCKY'); rectT(m, 19, 1, 6, 1, 'ROCKY'); rectT(m, 2, 5, 40, 1, 'SAND');
  rectT(m, 0, 11, 44, 2, 'PATH'); rectT(m, 0, 10, 3, 4, 'PATH');
  rectT(m, 20, 5, 4, 23, 'PATH');
  rectT(m, 2, 22, 40, 1, 'PATH');
  rectT(m, 16, 14, 12, 5, 'STONE'); rectT(m, 21, 16, 2, 1, 'FOUNT');
  stampBuilding(m, { x: 3, y: 6, w: 7, h: 5, door: 3, roof: 'ROOF_B', to: 'elderhouse', label: '村长家' });
  stampBuilding(m, { x: 11, y: 6, w: 8, h: 5, door: 4, roof: 'ROOF_G', to: 'lab', label: '灵兽研究所' });
  stampBuilding(m, { x: 25, y: 6, w: 7, h: 5, door: 3, roof: 'ROOF_R', to: 'store', label: '杂货店' });
  stampBuilding(m, { x: 34, y: 6, w: 7, h: 5, door: 3, roof: 'ROOF_P', to: 'clinic', label: '灵兽中心' });
  stampBuilding(m, { x: 3, y: 17, w: 7, h: 5, door: 3, roof: 'ROOF_K', to: 'smith', label: '铁匠铺' });
  stampBuilding(m, { x: 11, y: 18, w: 6, h: 4, door: 3, roof: 'ROOF_Y', to: 'xuehouse' });
  stampBuilding(m, { x: 29, y: 16, w: 11, h: 6, door: 5, roof: 'ROOF_Y', to: 'arena', label: '灵兽竞技场' });
  addSign(m, 19, 13, '【村告示板】');
  addSign(m, 3, 13, '晨星村 —— 欢迎！\n西：星露农场  东：珊瑚海滩  南：微风草原\n北边的河对岸是赤焰山。');
  const prot = [[0, 9, 44, 5], [19, 5, 6, 23], [2, 5, 40, 7], [2, 16, 40, 8], [15, 13, 14, 7]];
  scatterT(m, R, 'FLOWER', 0.07, ['GRASS'], prot);
  scatterT(m, R, 'TREE', 0.03, ['GRASS'], prot);
  scatterT(m, R, 'BUSH', 0.02, ['GRASS'], prot);
  m.exits = { w: { to: 'farm', off: 0 }, e: { to: 'beach', off: 0 }, s: { to: 'meadow', off: 0 }, n: { to: 'mountain', off: 0 } };
  return m;
};
MAPDEF.meadow = () => {
  const m = newMap('meadow', 44, 30, 'GRASS'); m.name = '微风草原'; m.music = 'field'; m.fish = 'pond'; m.tier = 1;
  const R = mulberry32(303);
  borderT(m, 'TREE', 2, [['n', 20, 23]]);
  rectT(m, 20, 0, 4, 8, 'PATH'); rectT(m, 8, 7, 30, 2, 'PATH'); rectT(m, 8, 7, 2, 18, 'PATH'); rectT(m, 36, 7, 2, 18, 'PATH'); rectT(m, 8, 23, 30, 2, 'PATH');
  rectT(m, 3, 3, 14, 3, 'TALL'); rectT(m, 26, 3, 14, 3, 'TALL');
  rectT(m, 12, 11, 8, 9, 'TALL'); rectT(m, 24, 11, 9, 9, 'TALL');
  rectT(m, 3, 11, 4, 11, 'TALL'); rectT(m, 3, 26, 38, 2, 'TALL');
  blobT(m, 22, 15, 2, 2, 'WATER');
  rectT(m, 39, 11, 3, 11, 'TALL');
  const prot = [[19, 0, 6, 9], [7, 6, 32, 4], [7, 6, 4, 20], [35, 6, 4, 20], [7, 22, 32, 4]];
  scatterT(m, R, 'FLOWER', 0.08, ['GRASS'], prot);
  scatterT(m, R, 'TREE', 0.05, ['GRASS'], prot);
  scatterT(m, R, 'BUSH', 0.03, ['GRASS'], prot);
  scatterT(m, R, 'ROCK', 0.01, ['GRASS'], prot);
  addSign(m, 24, 6, '微风草原\n草丛里经常有野生灵兽出没！');
  m.exits = { n: { to: 'village', off: 0 } };
  m.enc = [['mousy', 2, 5, 30], ['chirp', 2, 5, 30], ['beetle', 3, 5, 15], ['sprig', 4, 6, 3], ['ember', 4, 6, 3], ['bubbo', 4, 6, 3], ['jelly', 3, 6, 12], ['zapper', 4, 7, 6], ['glowbug', 4, 6, 4]];
  m.enemies = [['slime', 3]];
  m.forage = [['dandelion', 3, [0]], ['wildberry', 3, [1, 2]], ['herb', 3]];
  return m;
};
MAPDEF.forest = () => {
  const m = newMap('forest', 40, 32, 'GRASS'); m.name = '迷雾森林'; m.music = 'forest'; m.fish = 'river'; m.tier = 1;
  const R = mulberry32(404);
  borderT(m, 'TREE', 2, [['s', 18, 21]]);
  rectT(m, 18, 26, 4, 6, 'PATH'); rectT(m, 19, 7, 2, 20, 'PATH');
  rectT(m, 6, 13, 14, 2, 'PATH'); rectT(m, 20, 18, 18, 2, 'PATH');
  rectT(m, 28, 2, 3, 28, 'WATER'); rectT(m, 28, 18, 3, 2, 'BRIDGE');
  // 神殿
  rectT(m, 14, 2, 12, 5, 'RUIN'); setT(m, 19, 6, 'CAVE'); setT(m, 20, 6, 'CAVE');
  rectT(m, 17, 7, 6, 2, 'STONE');
  addWarp(m, 19, 6, 'd1'); addWarp(m, 20, 6, 'd1');
  // 矿洞
  rectT(m, 3, 9, 5, 4, 'CLIFF'); setT(m, 5, 12, 'CAVE'); addWarp(m, 5, 12, 'mine');
  rectT(m, 4, 13, 3, 2, 'PATH');
  rectT(m, 3, 20, 9, 6, 'TALL'); rectT(m, 22, 10, 5, 6, 'TALL'); rectT(m, 32, 4, 6, 10, 'TALL'); rectT(m, 32, 22, 6, 6, 'TALL'); rectT(m, 10, 3, 3, 6, 'TALL');
  const prot = [[17, 0, 6, 32], [13, 1, 14, 10], [2, 8, 7, 8], [5, 12, 16, 4], [19, 17, 20, 4], [27, 0, 5, 32]];
  scatterT(m, R, 'TREE', 0.22, ['GRASS'], prot);
  scatterT(m, R, 'BUSH', 0.05, ['GRASS'], prot);
  scatterT(m, R, 'FLOWER', 0.04, ['GRASS'], prot);
  scatterT(m, R, 'STUMP', 0.01, ['GRASS'], prot);
  addSign(m, 21, 10, '森林神殿\n—— 封印着森之水晶的古老神殿 ——');
  addSign(m, 7, 15, '旧矿洞\n越深处越危险，也越有宝藏。');
  m.exits = { s: { to: 'farm', off: 0 } };
  m.enc = [['beetle', 5, 9, 20], ['shroom', 6, 10, 20], ['glowbug', 6, 9, 15], ['chirp', 5, 8, 15], ['wisp', 6, 10, 10], ['sprig', 6, 9, 4], ['zapper', 7, 10, 8], ['bat', 6, 9, 10]];
  m.enemies = [['slime', 4], ['bat', 2]];
  m.forage = [['mushroom', 4], ['wildberry', 3, [1, 2]], ['herb', 4], ['dandelion', 2, [0]]];
  return m;
};
MAPDEF.beach = () => {
  const m = newMap('beach', 40, 28, 'SAND'); m.name = '珊瑚海滩'; m.music = 'field'; m.fish = 'sea'; m.base = 'sand'; m.tier = 2;
  const R = mulberry32(505);
  rectT(m, 0, 0, 40, 2, 'TREE'); rectT(m, 0, 0, 2, 28, 'TREE'); rectT(m, 0, 11, 2, 2, 'PATH');
  rectT(m, 2, 2, 6, 24, 'GRASS'); rectT(m, 0, 11, 12, 2, 'PATH');
  rectT(m, 30, 0, 10, 28, 'WATER'); rectT(m, 0, 22, 40, 6, 'WATER'); rectT(m, 0, 22, 2, 6, 'TREE');
  blobT(m, 30, 12, 2, 6, 'SAND', R);
  rectT(m, 31, 14, 6, 1, 'BRIDGE');
  // 潮汐洞窟
  rectT(m, 20, 2, 9, 5, 'CLIFF'); setT(m, 23, 6, 'CAVE'); addWarp(m, 23, 6, 'd2'); setT(m, 23, 7, 'GATE'); setT(m, 27, 6, 'EYE');
  stampBuilding(m, { x: 9, y: 3, w: 6, h: 4, door: 3, roof: 'ROOF_B', to: 'fisherhut', label: '渔夫小屋' });
  rectT(m, 4, 15, 8, 5, 'TALLB'); rectT(m, 18, 16, 8, 4, 'TALLB');
  const prot = [[0, 10, 14, 4], [8, 2, 8, 6], [19, 2, 11, 8], [28, 13, 10, 3]];
  scatterT(m, R, 'TREE', 0.06, ['GRASS'], prot);
  scatterT(m, R, 'FLOWER', 0.06, ['GRASS'], prot);
  scatterT(m, R, 'ROCK', 0.015, ['SAND'], prot);
  addSign(m, 21, 9, '潮汐洞窟\n传说洞口的封印之眼只能用箭射开……');
  m.exits = { w: { to: 'village', off: 0 } };
  m.enc = [['starfish', 10, 14, 25], ['crabby', 10, 14, 25], ['jelly', 10, 13, 15], ['turtle', 11, 15, 10], ['chirp', 10, 13, 10], ['bubbo', 11, 14, 4], ['zapper', 11, 14, 6]];
  m.enemies = [['crab', 4]];
  m.forage = [['shell', 5], ['coral', 2]];
  return m;
};
MAPDEF.mountain = () => {
  const m = newMap('mountain', 44, 30, 'ROCKY'); m.name = '赤焰山'; m.music = 'forest'; m.fish = 'lake'; m.base = 'rocky'; m.tier = 3;
  const R = mulberry32(606);
  borderT(m, 'CLIFF', 2, [['s', 20, 23], ['n', 21, 22]]);
  rectT(m, 20, 25, 4, 5, 'PATH'); rectT(m, 21, 3, 2, 22, 'PATH');
  setT(m, 21, 2, 'CRACK'); setT(m, 22, 2, 'CRACK'); setT(m, 21, 0, 'ROCKY'); setT(m, 22, 0, 'ROCKY');
  // 火山洞
  rectT(m, 30, 2, 10, 6, 'CLIFF'); setT(m, 34, 7, 'CAVE'); addWarp(m, 34, 7, 'd3');
  blobT(m, 36, 11, 3, 2, 'LAVA', R); blobT(m, 28, 12, 1, 1, 'LAVA');
  rectT(m, 23, 9, 12, 2, 'PATH'); rectT(m, 33, 8, 2, 2, 'PATH');
  // 山湖
  blobT(m, 8, 9, 4, 3, 'WATER', R);
  rectT(m, 4, 16, 10, 7, 'TALLD'); rectT(m, 26, 16, 12, 7, 'TALLD'); rectT(m, 4, 3, 10, 3, 'TALLD');
  // 山脊
  rectT(m, 14, 13, 6, 1, 'CLIFF'); rectT(m, 24, 14, 8, 1, 'CLIFF');
  const prot = [[19, 0, 6, 30], [22, 8, 14, 4], [29, 1, 12, 8]];
  scatterT(m, R, 'ROCK', 0.03, ['ROCKY'], prot);
  scatterT(m, R, 'COPPER', 0.02, ['ROCKY'], prot);
  scatterT(m, R, 'IRON', 0.012, ['ROCKY'], prot);
  scatterT(m, R, 'BOULDER', 0.02, ['ROCKY'], prot);
  scatterT(m, R, 'PINE', 0.02, ['ROCKY'], prot);
  addSign(m, 24, 26, '赤焰山\n小心山上的火焰蝙蝠！');
  addSign(m, 23, 4, '前方是霜雪高原。\n巨石挡住了去路……也许能炸开？');
  m.exits = { s: { to: 'village', off: 0 }, n: { to: 'snow', off: -1 } };
  m.enc = [['salamand', 16, 21, 25], ['pebble', 16, 20, 25], ['drake', 18, 22, 3], ['swifty', 17, 21, 15], ['bat', 16, 20, 10], ['ironhorn', 18, 22, 8], ['ember', 17, 20, 4], ['thundra', 19, 22, 5]];
  m.enemies = [['firebat', 4], ['skel', 2]];
  m.forage = [['fireflower', 2], ['herb', 2], ['mushroom', 2]];
  return m;
};
MAPDEF.snow = () => {
  const m = newMap('snow', 40, 30, 'SNOW'); m.name = '霜雪高原'; m.music = 'snow'; m.fish = 'snow'; m.base = 'snow'; m.tier = 4;
  const R = mulberry32(707);
  borderT(m, 'SPINE', 2, [['s', 20, 21]]);
  rectT(m, 20, 25, 2, 5, 'PATH'); rectT(m, 19, 8, 3, 18, 'PATH');
  // 冰晶神殿
  rectT(m, 3, 3, 10, 5, 'SCLIFF'); setT(m, 8, 7, 'CAVE'); addWarp(m, 8, 7, 'd4'); rectT(m, 7, 8, 3, 2, 'PATH'); rectT(m, 9, 9, 11, 1, 'PATH');
  // 暗影之塔
  rectT(m, 16, 0, 8, 7, 'TOWER'); setT(m, 19, 6, 'TDOOR'); setT(m, 20, 6, 'TDOOR'); addWarp(m, 19, 6, 'd5'); addWarp(m, 20, 6, 'd5');
  setT(m, 19, 7, 'ICE'); setT(m, 20, 7, 'ICE'); rectT(m, 18, 7, 1, 1, 'SCLIFF'); rectT(m, 21, 7, 1, 1, 'SCLIFF');
  blobT(m, 30, 18, 5, 3, 'WATER', R);
  rectT(m, 3, 12, 12, 7, 'TALLS'); rectT(m, 25, 4, 12, 7, 'TALLS'); rectT(m, 4, 22, 12, 5, 'TALLS');
  const prot = [[18, 0, 5, 30], [2, 2, 18, 9]];
  scatterT(m, R, 'SPINE', 0.07, ['SNOW'], prot);
  scatterT(m, R, 'SHRUB', 0.03, ['SNOW'], prot);
  scatterT(m, R, 'ROCK', 0.01, ['SNOW'], prot);
  addSign(m, 22, 10, '暗影之塔\n入口被永不融化的寒冰封住了。');
  addSign(m, 10, 10, '冰晶神殿');
  m.exits = { s: { to: 'mountain', off: 1 } };
  m.enc = [['snowball', 24, 29, 25], ['frostwolf', 25, 30, 15], ['wisp', 24, 28, 10], ['swifty', 24, 28, 10], ['sprite', 26, 30, 6], ['icebear', 28, 31, 4], ['turtle', 24, 28, 10], ['bubbo', 25, 28, 3]];
  m.enemies = [['wolf', 4], ['wisp2', 2]];
  m.forage = [['snowyam', 3], ['crystalfruit', 2]];
  return m;
};

// ============ 室内 ============
function makeInterior(id, name, w, h, furn, opts) {
  const m = newMap(id, w, h, opts && opts.floor || 'FLOOR'); m.name = name; m.outdoor = false; m.music = opts && opts.music || 'village'; m.base = 'floor';
  rectT(m, 0, 0, w, 2, 'IWALL');
  for (const wx of (opts && opts.windows) || []) setT(m, wx, 1, 'IWALLW');
  const mx = Math.floor(w / 2); setT(m, mx, h - 1, 'MAT'); m.mat = { x: mx, y: h - 1 };
  for (const f of furn) setT(m, f[1], f[2], f[0]);
  for (let y = 1; y < h; y++) for (let x = 0; x < w; x++) if (tAt(m, x, y) === TILE.BED && tAt(m, x, y - 1) === TILE.BED) setT(m, x, y, 'BEDB');
  return m;
}
MAPDEF.home = () => {
  const m = makeInterior('home', '我的小屋', 12, 9, [['BED', 10, 2], ['BED', 10, 3], ['TV', 3, 2], ['PLANT', 1, 2], ['TABLE', 5, 4], ['TABLE', 6, 4], ['PC', 8, 2], ['STOVE', 1, 4], ['RUG', 5, 6], ['RUG', 6, 6], ['BARREL', 1, 7]], { windows: [3, 7], music: 'farm' });
  m.isHome = true; return m;
};
MAPDEF.store = () => makeInterior('store', '莉莉杂货店', 12, 9, [['SHELF', 1, 2], ['SHELF', 2, 2], ['SHELF', 9, 2], ['SHELF', 10, 2], ['COUNTER', 3, 4], ['COUNTER', 4, 4], ['COUNTER', 5, 4], ['COUNTER', 6, 4], ['COUNTER', 7, 4], ['BARREL', 10, 6], ['BARREL', 1, 6], ['PLANT', 10, 4]], { windows: [4, 7] });
MAPDEF.smith = () => makeInterior('smith', '大熊铁匠铺', 12, 9, [['FURNACE', 2, 2], ['FURNACE', 3, 2], ['ANVIL', 7, 3], ['COUNTER', 3, 4], ['COUNTER', 4, 4], ['COUNTER', 5, 4], ['COUNTER', 6, 4], ['BARREL', 10, 2], ['BARREL', 10, 3], ['SHELF', 9, 2]], { windows: [6] });
MAPDEF.clinic = () => makeInterior('clinic', '灵兽中心', 12, 9, [['HEALER', 5, 2], ['HEALER', 6, 2], ['COUNTER', 3, 4], ['COUNTER', 4, 4], ['COUNTER', 5, 4], ['COUNTER', 6, 4], ['COUNTER', 7, 4], ['COUNTER', 8, 4], ['PC', 10, 2], ['PLANT', 1, 2], ['PLANT', 1, 7], ['PLANT', 10, 7]], { windows: [3, 8] });
MAPDEF.lab = () => makeInterior('lab', '灵兽研究所', 14, 10, [['BOOKS', 1, 2], ['BOOKS', 2, 2], ['BOOKS', 3, 2], ['BOOKS', 10, 2], ['BOOKS', 11, 2], ['BOOKS', 12, 2], ['TABLE', 6, 4], ['TABLE', 7, 4], ['PC', 5, 2], ['PC', 8, 2], ['PLANT', 1, 8], ['PLANT', 12, 8]], { windows: [6] });
MAPDEF.elderhouse = () => makeInterior('elderhouse', '村长家', 12, 9, [['BOOKS', 1, 2], ['SHELF', 2, 2], ['TABLE', 5, 3], ['TABLE', 6, 3], ['RUG', 5, 5], ['RUG', 6, 5], ['PLANT', 10, 2], ['BED', 10, 6], ['BED', 10, 7], ['STOVE', 8, 2]], { windows: [4, 7] });
MAPDEF.xuehouse = () => makeInterior('xuehouse', '小雪的家', 10, 8, [['BED', 1, 2], ['BED', 1, 3], ['TABLE', 5, 3], ['PLANT', 8, 2], ['SHELF', 3, 2], ['RUG', 5, 5]], { windows: [6] });
MAPDEF.fisherhut = () => makeInterior('fisherhut', '渔夫小屋', 10, 8, [['BARREL', 1, 2], ['BARREL', 2, 2], ['TABLE', 5, 3], ['BED', 8, 2], ['BED', 8, 3], ['SHELF', 4, 2]], { windows: [6] });
MAPDEF.arena = () => { const m = makeInterior('arena', '灵兽竞技场', 16, 12, [['STATUE', 2, 2], ['STATUE', 13, 2], ['COUNTER', 6, 3], ['COUNTER', 7, 3], ['COUNTER', 8, 3], ['COUNTER', 9, 3], ['PLANT', 1, 10], ['PLANT', 14, 10]], { floor: 'STONE', music: 'village' }); rectT(m, 5, 6, 6, 3, 'RUG'); m.base = 'stone'; return m; };

// ============ 地下城（程序生成，固定种子） ============
const DUNGEONS = {
  d1: { name: '森林神殿', theme: 'forest', seed: 1201, gates: ['lock', 'item', 'lock'], item: 'bow', boss: 'treant', tier: 1, enemies: ['slime', 'bat', 'skel', 'slime'], hazard: 'PIT', from: { map: 'forest', x: 19, y: 7 }, crystal: '森之水晶', guardian: 'gforest', glv: 20 },
  d2: { name: '潮汐洞窟', theme: 'tide', seed: 2203, gates: ['lock', 'eye', 'item', 'lock'], item: 'fins', boss: 'crabking', tier: 2, enemies: ['slime2', 'crab', 'octo', 'bat'], hazard: 'DWATER', from: { map: 'beach', x: 23, y: 7 }, crystal: '潮之水晶', guardian: 'gsea', glv: 28 },
  d3: { name: '熔岩矿坑', theme: 'lava', seed: 3307, gates: ['lock', 'water', 'item', 'lock', 'eye'], item: 'bombs', boss: 'lavagolem', tier: 3, enemies: ['firebat', 'skel', 'wisp', 'octo2'], hazard: 'LAVA', from: { map: 'mountain', x: 34, y: 8 }, crystal: '炎之水晶', guardian: 'gfire', glv: 36 },
  d4: { name: '冰晶神殿', theme: 'ice', seed: 4409, gates: ['lock', 'crack', 'item', 'lock', 'eye'], item: 'firerod', boss: 'icedragon', tier: 4, enemies: ['wolf', 'wisp2', 'knight', 'slime3'], hazard: 'PIT', from: { map: 'snow', x: 8, y: 8 }, crystal: '冰之水晶', guardian: 'gice', glv: 44 },
  d5: { name: '暗影之塔', theme: 'shadow', seed: 5501, gates: ['lock', 'eye', 'crack', 'ice', 'lock', 'water'], item: null, boss: 'shadowlord', tier: 5, enemies: ['knight2', 'wisp3', 'bat3', 'skel3'], hazard: 'PIT', from: { map: 'snow', x: 19, y: 8 }, crystal: null, glv: 55 },
};
const ITEM_GATE = { bow: 'eye', fins: 'water', bombs: 'crack', firerod: 'ice' };
const GATE_TILE = { lock: 'DLOCK', boss: 'DBOSS', eye: 'DEYE', crack: 'DCRACK', ice: 'DICE', water: 'DWATER' };
const RW = 30, RH = 17;
const ROOM_TPL = {
  empty: [],
  pillars: [[4, 3, 2, 2, 'STATUE'], [24, 3, 2, 2, 'STATUE'], [4, 12, 2, 2, 'STATUE'], [24, 12, 2, 2, 'STATUE']],
  columns: [[6, 3, 1, 1, 'STATUE'], [10, 3, 1, 1, 'STATUE'], [19, 3, 1, 1, 'STATUE'], [23, 3, 1, 1, 'STATUE'], [6, 13, 1, 1, 'STATUE'], [10, 13, 1, 1, 'STATUE'], [19, 13, 1, 1, 'STATUE'], [23, 13, 1, 1, 'STATUE']],
  pools: [[3, 2, 7, 3, 'HZ'], [20, 2, 7, 3, 'HZ'], [3, 12, 7, 3, 'HZ'], [20, 12, 7, 3, 'HZ']],
  blocks: [[5, 4, 4, 1, 'DWALL'], [21, 4, 4, 1, 'DWALL'], [5, 12, 4, 1, 'DWALL'], [21, 12, 4, 1, 'DWALL'], [9, 2, 1, 3, 'DWALL'], [20, 2, 1, 3, 'DWALL'], [9, 12, 1, 3, 'DWALL'], [20, 12, 1, 3, 'DWALL']],
  moat: [[2, 5, 9, 1, 'HZ'], [19, 5, 9, 1, 'HZ'], [2, 11, 9, 1, 'HZ'], [19, 11, 9, 1, 'HZ']],
  torches: [[3, 2, 1, 1, 'TORCH'], [26, 2, 1, 1, 'TORCH'], [3, 14, 1, 1, 'TORCH'], [26, 14, 1, 1, 'TORCH']],
};
function genDungeon(id) {
  const D = DUNGEONS[id];
  const GW = 6, GH = 6;
  let R, path, rooms, attempt = 0;
  const gates = D.gates.map(g => g === 'item' ? ITEM_GATE[D.item] : g);
  const itemGateIdx = D.gates.indexOf('item');
  const L = gates.length + 4;
  // 1. 主路径
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
    if (ok) { rooms = used; break; }
    if (attempt > 500) throw new Error('dungeon gen failed');
  }
  // 2. 门的位置
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
  for (let i = 0; i < path.length - 1; i++) {
    const gi = gateEdges.indexOf(i);
    link(R2[path[i][0] + ',' + path[i][1]], R2[path[i + 1][0] + ',' + path[i + 1][1]], gi >= 0 ? allGates[gi] : 'open');
  }
  // 3. 支路房间
  const side = [];
  const tryBranch = (room, len) => {
    let cur = room;
    for (let s = 0; s < len; s++) {
      const opts = [];
      for (const [dx, dy] of [[0, -1], [-1, 0], [1, 0], [0, 1]]) {
        const nx = cur.gx + dx, ny = cur.gy + dy;
        if (nx < 0 || ny < 0 || nx >= GW || ny >= GH || R2[nx + ',' + ny]) continue;
        opts.push([nx, ny]);
      }
      if (!opts.length) return;
      const [nx, ny] = rpick(R, opts);
      const nr = { gx: nx, gy: ny, seg: room.seg, onPath: false, links: {} };
      R2[nx + ',' + ny] = nr; side.push(nr); link(cur, nr, 'open'); cur = nr;
    }
  };
  for (let i = 0; i < path.length - 1; i++) { const r = R2[path[i][0] + ',' + path[i][1]]; if (R() < 0.55 || i === 0) tryBranch(r, R() < 0.4 ? 2 : 1); }
  // 4. 放置必需物品
  const allRooms = Object.values(R2);
  const start = R2[path[0][0] + ',' + path[0][1]], bossRoom = R2[path[L - 1][0] + ',' + path[L - 1][1]];
  allRooms.forEach(r => { r.chest = null; r.kind = 'normal'; });
  start.kind = 'start'; bossRoom.kind = 'boss';
  for (let k = 0; k < allGates.length; k++) {
    const g = allGates[k];
    let need = null;
    if (g === 'lock') need = { item: 'key', n: 1 };
    else if (g === 'boss') need = { item: 'bosskey', n: 1 };
    else if (k === itemGateIdx) need = { item: D.item, n: 1, big: true };
    if (!need) continue;
    const seg = k;
    let cands = allRooms.filter(r => r.seg === seg && !r.chest && r !== bossRoom && !r.onPath);
    if (!cands.length) cands = allRooms.filter(r => r.seg === seg && !r.chest && r !== bossRoom && r !== start);
    if (!cands.length) cands = allRooms.filter(r => r.seg <= seg && !r.chest && r !== bossRoom);
    if (!cands.length) cands = [start];
    const r = rpick(R, cands); r.chest = need;
  }
  if (!D.item) { /* 最终塔无道具 */ }
  // 5. 构建地图
  const m = newMap(id, GW * RW, GH * RH, 'VOID');
  m.name = D.name; m.theme = D.theme; m.outdoor = false; m.music = 'dungeon'; m.isDungeon = true; m.dng = id; m.base = 'dfloor'; m.tier = D.tier;
  m.rooms = {}; m.doors = [];
  const hz = D.hazard;
  let cid = 0;
  for (const r of allRooms) {
    const ox = r.gx * RW, oy = r.gy * RH;
    r.ox = ox; r.oy = oy; r.key = r.gx + ',' + r.gy; r.doorTiles = [];
    m.rooms[r.key] = r;
    rectT(m, ox, oy, RW, RH, 'DWALL'); rectT(m, ox + 1, oy + 1, RW - 2, RH - 2, 'DEDGE'); rectT(m, ox + 2, oy + 2, RW - 4, RH - 4, 'DFLOOR');
    // 模板
    let tpl = 'empty';
    const special = r.kind !== 'normal' || Object.values(r.links).some(l => l.type === 'eye');
    if (!special) tpl = rpick(R, ['empty', 'pillars', 'columns', 'pools', 'blocks', 'moat', 'pillars', 'pools']);
    if (r.kind === 'boss') tpl = 'columns';
    r.tpl = tpl;
    for (const f of ROOM_TPL[tpl]) rectT(m, ox + f[0], oy + f[1], f[2], f[3], f[4] === 'HZ' ? hz : f[4]);
    if (D.theme === 'ice' || D.theme === 'shadow') { if (tpl === 'empty' && R() < 0.5 && r.kind === 'normal') for (const f of ROOM_TPL.torches) rectT(m, ox + f[0], oy + f[1], 1, 1, 'TORCH'); }
  }
  // 门
  let doorId = 0;
  for (const r of allRooms) {
    for (const dir in r.links) {
      const l = r.links[dir];
      if (dir === 'e' || dir === 's') {
        const tiles = [];
        if (dir === 'e') { for (let j = 7; j <= 9; j++) { tiles.push([r.ox + RW - 1, r.oy + j]); tiles.push([r.ox + RW, r.oy + j]); } }
        else { for (let i = 14; i <= 15; i++) { tiles.push([r.ox + i, r.oy + RH - 1]); tiles.push([r.ox + i, r.oy + RH]); } }
        const d = { id: doorId++, type: l.type, tiles, a: r.key, b: l.to.key };
        m.doors.push(d);
        const tname = l.type === 'open' ? 'DOPEN' : GATE_TILE[l.type];
        for (const [x, y] of tiles) setT(m, x, y, tname);
        // 若为眼睛机关门，在门前的房间墙上放置机关眼
        if (l.type === 'eye') {
          const before = r.onPath && l.to.onPath ? (r.pi < l.to.pi ? r : l.to) : r;
          setT(m, before.ox + 4, before.oy, 'DEYESW'); d.eyeRoom = before.key;
        }
        if (l.type === 'water') {
          for (const [x, y] of tiles) { setT(m, x, y, 'DWATER'); }
          // 门两侧加一点水
          if (dir === 'e') { for (let j = 6; j <= 10; j++) { setT(m, r.ox + RW - 2, r.oy + j, 'DWATER'); setT(m, r.ox + RW + 1, r.oy + j, 'DWATER'); } }
          else { for (let i = 13; i <= 16; i++) { setT(m, r.ox + i, r.oy + RH - 2, 'DWATER'); setT(m, r.ox + i, r.oy + RH + 1, 'DWATER'); } }
        }
      }
    }
  }
  for (const d of m.doors) for (const [x, y] of d.tiles) { const rk = Math.floor(x / RW) + ',' + Math.floor(y / RH); m.rooms[rk].doorTiles.push([x, y, d.id]); }
  // 入口
  setT(m, start.ox + 14, start.oy + RH - 1, 'EXIT'); setT(m, start.ox + 15, start.oy + RH - 1, 'EXIT');
  m.start = { x: start.ox + 14.5, y: start.oy + RH - 3 };
  // 6. 内容
  const ek = D.enemies;
  for (const r of allRooms) {
    const ox = r.ox, oy = r.oy;
    const free = (x, y) => { const n = TILES[tAt(m, x, y)].name; return n === 'DFLOOR' || n === 'DEDGE'; };
    if (r.kind === 'boss') {
      m.spawns.push({ type: 'boss', kind: D.boss, x: ox + 15, y: oy + 5, room: r.key });
      r.enemies = true;
      continue;
    }
    if (r.kind !== 'start') {
      const cnt = 2 + Math.floor(R() * (2 + D.tier * 0.6));
      r.enemies = R() < 0.85 || !!r.chest;
      if (r.enemies) for (let i = 0; i < cnt; i++) {
        let x, y, t = 0; do { x = ox + 3 + Math.floor(R() * 24); y = oy + 3 + Math.floor(R() * 11); t++; } while ((!free(x, y) || (Math.abs(x - ox - 14.5) < 3 && Math.abs(y - oy - 8) < 3)) && t < 50);
        m.spawns.push({ type: 'enemy', kind: rpick(R, ek), x, y, room: r.key });
      }
    }
    if (r.chest) {
      const hidden = r.enemies && R() < 0.6;
      m.spawns.push({ type: 'chest', x: ox + 15, y: oy + 6, item: r.chest.item, n: r.chest.n, big: r.chest.big, hidden, room: r.key, cid: 'c' + (cid++) });
    } else if (r.kind === 'normal' && !r.onPath && r.tpl === 'empty' && R() < 0.7) {
      // 推箱子谜题
      const bx = ox + 6, by = oy + 4;
      setT(m, bx + 4, by, 'PLATE');
      m.spawns.push({ type: 'block', x: bx, y: by, room: r.key, plate: [bx + 4, by] });
      m.spawns.push({ type: 'chest', x: ox + 15, y: oy + 6, item: 'loot', hidden: 'plate', room: r.key, cid: 'c' + (cid++) });
    } else if (r.kind === 'normal' && R() < 0.35) {
      m.spawns.push({ type: 'chest', x: ox + 15, y: oy + 6, item: 'loot', hidden: r.enemies, room: r.key, cid: 'c' + (cid++) });
    }
    // 点亮火盆谜题
    if (r.tpl === 'empty' && TILES[tAt(m, ox + 3, oy + 2)].name === 'TORCH' && !r.chest) {
      m.spawns.push({ type: 'chest', x: ox + 15, y: oy + 10, item: 'loot', hidden: 'torch', room: r.key, cid: 'c' + (cid++) });
    }
    // 罐子
    if (r.kind !== 'boss') {
      const pc = Math.floor(R() * 4);
      for (let i = 0; i < pc; i++) { const corners = [[2, 1], [27, 1], [2, 15], [27, 15], [1, 2], [28, 2], [1, 14], [28, 14]]; const c = rpick(R, corners); if (free(ox + c[0], oy + c[1])) setT(m, ox + c[0], oy + c[1], 'POT'); }
    }
  }
  m.gridW = GW; m.gridH = GH;
  return m;
}

// ============ 矿洞（程序生成，每天变化） ============
const MINE_ENEMIES = [[1, ['slime', 'bat']], [15, ['slime', 'bat', 'skel']], [30, ['slime2', 'bat', 'skel', 'octo']], [50, ['firebat', 'skel', 'wisp', 'slime3']], [75, ['knight', 'wisp2', 'wolf', 'firebat']], [100, ['knight2', 'wisp3', 'bat3', 'skel3']]];
function mineEnc(f) {
  const lv = Math.min(80, 5 + Math.floor(f * 0.55));
  const lo = Math.max(2, lv - 2), hi = lv + 2;
  if (f < 20) return [['bat', lo, hi, 30], ['pebble', lo, hi, 30], ['wisp', lo, hi, 10], ['shroom', lo, hi, 15], ['zapper', lo, hi, 8], ['drake', lo, hi, 1]];
  if (f < 50) return [['bat', lo, hi, 15], ['pebble', lo, hi, 15], ['boulderon', lo, hi, 8], ['vampbat', lo, hi, 10], ['salamand', lo, hi, 15], ['ironhorn', lo, hi, 10], ['nightmare', lo, hi, 4], ['drake', lo, hi, 2], ['shroom', lo, hi, 10]];
  if (f < 80) return [['boulderon', lo, hi, 15], ['magmaliz', lo, hi, 15], ['vampbat', lo, hi, 15], ['nightmare', lo, hi, 10], ['thundra', lo, hi, 10], ['kingcrab', lo, hi, 6], ['skydrake', lo, hi, 3], ['toadking', lo, hi, 8]];
  return [['nightmare', lo, hi, 15], ['magmaliz', lo, hi, 10], ['icebear', lo, hi, 10], ['seraph', lo, hi, 5], ['skydrake', lo, hi, 6], ['fortoise', lo, hi, 10], ['kingjelly', lo, hi, 10], ['starmoth', lo, hi, 10], ['gstar', 70, 70, f >= 100 ? 1 : 0]];
}
function genMine(floor, daySeed) {
  const W = 40, H = 28;
  let m, attempt = 0;
  while (true) {
    const R = mulberry32(floor * 7919 + daySeed * 104729 + attempt * 13);
    attempt++;
    const theme = floor < 20 ? 'cave' : floor < 50 ? 'cave2' : floor < 80 ? 'cave3' : 'cave4';
    m = newMap('mine', W, H, 'CWALL'); m.theme = theme; m.outdoor = false; m.music = 'dungeon'; m.name = '矿洞 第' + floor + '层'; m.mine = floor; m.base = 'cfloor'; m.tier = 1 + Math.floor(floor / 25);
    let g = new Uint8Array(W * H);
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) g[y * W + x] = (x < 1 || y < 1 || x >= W - 1 || y >= H - 1 || R() < 0.43) ? 1 : 0;
    for (let it = 0; it < 5; it++) {
      const ng = new Uint8Array(W * H);
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
        if (x < 1 || y < 1 || x >= W - 1 || y >= H - 1) { ng[y * W + x] = 1; continue; }
        let c = 0; for (let j = -1; j <= 1; j++) for (let i = -1; i <= 1; i++) c += g[(y + j) * W + x + i];
        ng[y * W + x] = c >= 5 ? 1 : 0;
      }
      g = ng;
    }
    // 最大连通区域
    const lab = new Int32Array(W * H).fill(-1); let best = -1, bestN = 0, cur = 0;
    for (let i = 0; i < W * H; i++) {
      if (g[i] || lab[i] >= 0) continue;
      const st = [i]; lab[i] = cur; let nn = 0;
      while (st.length) { const k = st.pop(); nn++; const x = k % W, y = (k / W) | 0; for (const [dx, dy] of DIRS) { const q = (y + dy) * W + x + dx; if (!g[q] && lab[q] < 0) { lab[q] = cur; st.push(q); } } }
      if (nn > bestN) { bestN = nn; best = cur; } cur++;
    }
    if (bestN < 350 && attempt < 30) continue;
    const cells = [];
    for (let i = 0; i < W * H; i++) { if (lab[i] === best) { m.t[i] = TILE.CFLOOR; cells.push(i); } }
    const si = rpick(R, cells); const sx = si % W, sy = (si / W) | 0;
    setT(m, sx, sy, 'LADDERU'); m.start = { x: sx + 0.5, y: sy + 1 };
    const treasure = floor % 10 === 0;
    const rockP = treasure ? 0.05 : 0.17;
    const rocks = [];
    for (const i of cells) {
      const x = i % W, y = (i / W) | 0;
      if (Math.abs(x - sx) <= 2 && Math.abs(y - sy) <= 2) continue;
      if (R() < rockP) {
        const r = R(); let t = 'CROCK';
        if (r < 0.04) t = 'GEMROCK';
        else if (floor >= 70 && r < 0.10) t = 'MYTHRIL';
        else if (floor >= 35 && r < 0.18) t = 'GOLD';
        else if (floor >= 10 && r < 0.30) t = 'IRON';
        else if (r < 0.42) t = 'COPPER';
        m.t[i] = TILE[t]; rocks.push(i);
      }
    }
    // 暗色草丛
    for (let b = 0; b < 3; b++) {
      const c = rpick(R, cells); const cx = c % W, cy = (c / W) | 0;
      for (let j = -2; j <= 2; j++) for (let i = -3; i <= 3; i++) { const k = (cy + j) * W + cx + i; if (m.t[k] === TILE.CFLOOR && R() < 0.75 && Math.abs(cx + i - sx) + Math.abs(cy + j - sy) > 3) m.t[k] = TILE.DARKG; }
    }
    // 暗藏的梯子
    const far = rocks.filter(i => Math.abs(i % W - sx) + Math.abs(((i / W) | 0) - sy) > 10);
    m.ladderIdx = far.length ? rpick(R, far) : (rocks.length ? rpick(R, rocks) : -1);
    if (m.ladderIdx < 0) { const c = rpick(R, cells.filter(i => i !== si)); m.t[c] = TILE.LADDERD; }
    // 敌人
    let kinds = MINE_ENEMIES[0][1]; for (const e of MINE_ENEMIES) if (floor >= e[0]) kinds = e[1];
    const ne = treasure ? 0 : 3 + Math.floor(R() * 4) + Math.floor(floor / 25);
    for (let i = 0; i < ne; i++) {
      let c, t = 0; do { c = rpick(R, cells); t++; } while ((m.t[c] !== TILE.CFLOOR || Math.abs(c % W - sx) + Math.abs(((c / W) | 0) - sy) < 8) && t < 50);
      m.spawns.push({ type: 'enemy', kind: rpick(R, kinds), x: c % W, y: (c / W) | 0 });
    }
    if (treasure) {
      let c, t = 0; do { c = rpick(R, cells); t++; } while ((m.t[c] !== TILE.CFLOOR || Math.abs(c % W - sx) + Math.abs(((c / W) | 0) - sy) < 6) && t < 80);
      m.spawns.push({ type: 'chest', x: c % W, y: (c / W) | 0, item: 'mineloot', cid: 'mine' + floor, n: floor });
    }
    m.enc = mineEnc(floor);
    m.enemyTier = floor;
    break;
  }
  computeUnder(m);
  return m;
}

// ============ 地图读取 ============
const mapCache = {};
function getMap(id) {
  if (id === 'mine') return null;
  if (mapCache[id]) return mapCache[id];
  let m;
  if (DUNGEONS[id]) m = genDungeon(id);
  else if (MAPDEF[id]) m = MAPDEF[id]();
  else throw new Error('未知地图 ' + id);
  computeUnder(m);
  mapCache[id] = m;
  return m;
}
// 预先生成所有野外地图，使室内的返回点登记完成
function initMaps() { for (const k in MAPDEF) getMap(k); }
