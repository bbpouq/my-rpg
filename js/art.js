'use strict';
// =====================================================================
//  美术升级：更精细的角色、地块过渡、大树遮挡、屋檐与悬崖立体感
// =====================================================================
const PAL = {
  grass: '#7ccc58', grassD: '#56a83e', grassDD: '#3e8a30', grassL: '#a6e472', grassLL: '#c8f498',
  path: '#ecd29a', pathD: '#d6b47a', pathDD: '#b8925c', pathL: '#f8e6bc',
  sand: '#f4e2a8', sandD: '#dcc488',
  water: '#4aa0ec', waterD: '#2e7ccc', waterL: '#8ccaf8', foam: '#e8f8ff',
  cliff: '#c8945c', cliffD: '#a06c3c', cliffDD: '#6e4420', cliffL: '#e8b880',
  outline: '#1c1420',
};
function px1(g, x, y, c) { g.fillStyle = c; g.fillRect(x, y, 1, 1); }

// ---------- 地面 ----------
BASES.grass = (g, R) => {
  fill(g, PAL.grass);
  for (let i = 0; i < 3; i++) { const x = 1 + Math.floor(R() * 13), y = 1 + Math.floor(R() * 13); rect(g, x, y, 2, 1, '#86d462'); }
  const tufts = 1 + Math.floor(R() * 3);
  for (let i = 0; i < tufts; i++) {
    const x = 2 + Math.floor(R() * 11), y = 3 + Math.floor(R() * 10);
    px1(g, x, y, PAL.grassD); px1(g, x + 2, y, PAL.grassD); px1(g, x + 1, y + 1, PAL.grassD); px1(g, x + 1, y - 1, PAL.grassL);
  }
};
BASES.path = (g, R) => {
  fill(g, PAL.path);
  for (let i = 0; i < 4; i++) px1(g, Math.floor(R() * 16), Math.floor(R() * 16), PAL.pathD);
  if (R() < 0.6) { const x = 2 + Math.floor(R() * 11), y = 2 + Math.floor(R() * 11); rect(g, x, y, 2, 1, PAL.pathDD); rect(g, x, y - 1, 2, 1, PAL.pathL); }
};
BASES.sand = (g, R) => { fill(g, PAL.sand); for (let i = 0; i < 5; i++) px1(g, Math.floor(R() * 16), Math.floor(R() * 16), PAL.sandD); px1(g, Math.floor(R() * 16), Math.floor(R() * 16), '#fff6d8'); };
BASES.stone = (g, R) => {
  fill(g, '#d8d2c0');
  rect(g, 0, 7, 16, 1, '#b4ac98'); rect(g, 0, 15, 16, 1, '#b4ac98');
  const o = (R() < 0.5) ? 4 : 10; rect(g, o, 0, 1, 7, '#b4ac98'); rect(g, (o + 6) % 16, 8, 1, 7, '#b4ac98');
  rect(g, 0, 0, 16, 1, '#ece6d6'); rect(g, 0, 8, 16, 1, '#ece6d6');
};
BASES.rocky = (g, R) => { fill(g, '#d4aa78'); for (let i = 0; i < 6; i++) px1(g, Math.floor(R() * 16), Math.floor(R() * 16), '#bc9262'); if (R() < 0.5) { const x = 2 + Math.floor(R() * 11), y = 2 + Math.floor(R() * 11); rect(g, x, y, 2, 1, '#9a7448'); rect(g, x, y - 1, 2, 1, '#ecc898'); } };
BASES.floor = (g, R) => { fill(g, '#d0965a'); for (let y = 0; y < 16; y += 4) { rect(g, 0, y + 3, 16, 1, '#a8703a'); rect(g, 0, y, 16, 1, '#e0aa6e'); } const o = Math.floor(R() * 8); for (let y = 0; y < 16; y += 4) rect(g, (o + y * 3) % 16, y, 1, 4, '#a8703a'); };
BASES.dfloor = (g, R, th) => {
  fill(g, th.floor);
  for (const [ox, oy] of [[0, 0], [8, 8]]) rect(g, ox, oy, 8, 8, shade(th.floor, 0.06));
  for (let y = 0; y < 16; y += 8) { rect(g, 0, y, 16, 1, shade(th.floor, 0.18)); rect(g, 0, y + 7, 16, 1, shade(th.floor, -0.18)); }
  for (let x = 0; x < 16; x += 8) { rect(g, x, 0, 1, 16, shade(th.floor, 0.12)); rect(g, x + 7, 0, 1, 16, shade(th.floor, -0.14)); }
  if (R() < 0.3) px1(g, 2 + Math.floor(R() * 12), 2 + Math.floor(R() * 12), shade(th.floor, -0.25));
};

function redef(name, draw, extra) { const t = TILES[TILE[name]]; t.draw = draw; if (extra) Object.assign(t, extra); }
redef('GRASS', (g, R) => BASES.grass(g, R));
redef('FLOWER', (g, R) => {
  BASES.grass(g, R);
  const cols = [['#ffffff', '#f8e060'], ['#ff8ab8', '#fff0a0'], ['#ffe060', '#e08020'], ['#a8d8ff', '#ffffff']];
  for (let i = 0; i < 2; i++) {
    const x = 3 + Math.floor(R() * 9), y = 3 + Math.floor(R() * 9), c = cols[Math.floor(R() * cols.length)];
    px1(g, x, y + 2, PAL.grassDD);
    rect(g, x - 1, y, 3, 1, c[0]); rect(g, x, y - 1, 1, 3, c[0]); px1(g, x, y, c[1]);
  }
});
redef('TALL', (g, R) => {
  BASES.grass(g, mulberry32(9));
  for (const [cx, cy] of [[4, 6], [11, 5], [4, 13], [11, 12]]) {
    const ox = cx + Math.floor(R() * 2) - 1;
    rect(g, ox - 3, cy + 1, 7, 2, PAL.grassDD);
    for (const [dx, h] of [[-3, 4], [-1, 6], [1, 5], [3, 4]]) { rect(g, ox + dx, cy + 2 - h, 1, h, PAL.grassDD); rect(g, ox + dx, cy + 2 - h, 1, 1, PAL.grassL); }
    for (const [dx, h] of [[-2, 4], [0, 5], [2, 4]]) { rect(g, ox + dx, cy + 2 - h, 1, h, '#4a9a36'); }
  }
});
redef('PATH', (g, R) => BASES.path(g, R));
redef('SAND', (g, R) => BASES.sand(g, R));
redef('STONE', (g, R) => BASES.stone(g, R));
redef('ROCKY', (g, R) => BASES.rocky(g, R));
redef('FLOOR', (g, R) => BASES.floor(g, R));
redef('DFLOOR', (g, R, th) => BASES.dfloor(g, R, th));
redef('DEDGE', (g, R, th) => { BASES.dfloor(g, R, th); rect(g, 0, 0, 16, 16, 'rgba(0,0,0,0.10)'); });
redef('WATER', (g, R, th, f) => {
  fill(g, PAL.water);
  for (let i = 0; i < 3; i++) { const y = 2 + i * 5, x = (Math.floor(R() * 10) + f * 2) % 14; rect(g, x, y, 4, 1, PAL.waterL); rect(g, x + 1, y + 1, 2, 1, PAL.waterD); }
  if (f === 1) px1(g, 3 + Math.floor(R() * 10), 3 + Math.floor(R() * 10), '#ffffff');
});
redef('CLIFF', (g, R) => {
  fill(g, PAL.cliff);
  for (let x = 0; x < 16; x += 4) { const o = Math.floor(R() * 3); rect(g, x + o, 0, 1, 16, PAL.cliffD); rect(g, x + o + 1, 0, 1, 16, PAL.cliffL); }
  for (let i = 0; i < 2; i++) { const y = 3 + Math.floor(R() * 10); rect(g, Math.floor(R() * 10), y, 5, 1, PAL.cliffD); }
});
redef('BUSH', (g, R) => {
  ell(g, 8, 14, 6, 2, 'rgba(0,0,0,0.25)');
  circ(g, 8, 9, 7, PAL.outline); circ(g, 8, 9, 6, '#3a9a38'); circ(g, 7, 8, 5, '#4cb040'); circ(g, 6, 6, 3, '#6cc850');
  for (let i = 0; i < 6; i++) { const x = 4 + Math.floor(R() * 9), y = 5 + Math.floor(R() * 8); px1(g, x, y, R() < 0.5 ? '#2a7a2a' : '#8ade66'); }
  rect(g, 5, 4, 2, 1, '#a8ee80');
});
redef('ROCK', (g) => { ell(g, 8, 14, 6, 2, 'rgba(0,0,0,0.25)'); ell(g, 8, 10, 7, 5, PAL.outline); ell(g, 8, 10, 6, 4, '#a0a0aa'); ell(g, 7, 9, 5, 3, '#b8b8c2'); ell(g, 6, 8, 2, 1, '#e0e0ea'); rect(g, 9, 12, 4, 1, '#7a7a86'); });
redef('BOULDER', (g) => { ell(g, 8, 15, 7, 1, 'rgba(0,0,0,0.25)'); ell(g, 8, 8, 8, 7, PAL.outline); ell(g, 8, 8, 7, 6, '#8a8a96'); ell(g, 7, 7, 5, 4, '#a4a4b0'); ell(g, 5, 4, 2, 1, '#d0d0dc'); rect(g, 9, 12, 5, 1, '#6a6a76'); rect(g, 11, 7, 1, 3, '#6a6a76'); });
redef('CRACK', (g) => { ell(g, 8, 15, 7, 1, 'rgba(0,0,0,0.25)'); ell(g, 8, 8, 8, 7, PAL.outline); ell(g, 8, 8, 7, 6, '#9a8a78'); ell(g, 7, 7, 5, 4, '#b4a490'); rect(g, 7, 2, 1, 4, '#2a1a10'); rect(g, 8, 5, 1, 4, '#2a1a10'); rect(g, 5, 9, 3, 1, '#2a1a10'); rect(g, 9, 9, 1, 4, '#2a1a10'); rect(g, 3, 6, 4, 1, '#2a1a10'); });
redef('SIGNT', (g) => { ell(g, 8, 15, 5, 1, 'rgba(0,0,0,0.25)'); rect(g, 7, 9, 2, 6, '#5a3418'); rect(g, 1, 2, 14, 9, PAL.outline); rect(g, 2, 3, 12, 7, '#c88c50'); rect(g, 2, 3, 12, 1, '#e8b070'); rect(g, 4, 5, 8, 1, '#7a4a24'); rect(g, 4, 7, 6, 1, '#7a4a24'); });
redef('STUMPP', (g, R, th, f) => {
  ell(g, 8, 13, 7, 2, 'rgba(0,0,0,0.25)'); ell(g, 8, 10, 7, 5, PAL.outline); rect(g, 2, 9, 12, 4, '#7a4a22'); ell(g, 8, 8, 6, 3, '#b07840'); ell(g, 8, 8, 4, 2, '#d8a060'); ell(g, 8, 8, 2, 1, '#b07840');
  const c = ['#7af07a', '#b0ffb0', '#e0ffe0'][f]; rect(g, 7, 3 - f, 2, 2, c); rect(g, 3, 6, 1, 1, c); rect(g, 12, 6, 1, 1, c); rect(g, 6, 12, 1, 1, c); rect(g, 10, 12, 1, 1, c);
});
// 树：地面层只画阴影，树冠在排序层绘制
redef('TREE', (g) => { ell(g, 8, 14, 8, 2, 'rgba(0,0,0,0.22)'); }, { over: 'tree' });
redef('PINE', (g) => { ell(g, 8, 14, 7, 2, 'rgba(0,0,0,0.22)'); }, { over: 'pine' });

// ---------- 建筑 ----------
for (const [nm, col] of [['ROOF_R', '#d8503c'], ['ROOF_B', '#4a78d0'], ['ROOF_G', '#48a060'], ['ROOF_Y', '#e0a438'], ['ROOF_P', '#9050b8'], ['ROOF_K', '#6a6a7a']]) {
  redef(nm, (g) => {
    fill(g, col);
    for (let y = 0; y < 16; y += 4) { rect(g, 0, y + 3, 16, 1, shade(col, -0.35)); rect(g, 0, y, 16, 1, shade(col, 0.18)); const o = (y / 4 % 2) * 4; for (let x = o; x < 16; x += 8) rect(g, x, y, 1, 3, shade(col, -0.2)); }
  }, { roofCol: col });
}
redef('WALL', (g) => { fill(g, '#f4e8cc'); rect(g, 0, 0, 1, 16, '#8a5a30'); rect(g, 15, 0, 1, 16, '#8a5a30'); rect(g, 0, 7, 16, 1, '#d8c8a4'); rect(g, 0, 12, 16, 4, '#a89c88'); rect(g, 0, 12, 16, 1, '#c8bca8'); rect(g, 3, 14, 4, 1, '#8a8070'); rect(g, 10, 13, 3, 1, '#8a8070'); });
redef('WINDOW', (g) => { TILES[TILE.WALL].draw(g); rect(g, 3, 2, 10, 9, '#6a4220'); rect(g, 4, 3, 8, 7, '#78b8e8'); rect(g, 4, 3, 8, 2, '#a8d8f8'); rect(g, 7, 3, 1, 7, '#6a4220'); rect(g, 4, 6, 8, 1, '#6a4220'); rect(g, 2, 11, 12, 2, '#8a5a30'); px1(g, 4, 10, '#f070a0'); px1(g, 6, 10, '#f8e060'); px1(g, 9, 10, '#f070a0'); px1(g, 11, 10, '#f8e060'); });
redef('DOOR', (g) => { TILES[TILE.WALL].draw(g); rect(g, 3, 2, 10, 14, PAL.outline); rect(g, 4, 3, 8, 13, '#9a6230'); rect(g, 5, 2, 6, 1, PAL.outline); rect(g, 4, 3, 8, 1, '#b87a40'); rect(g, 7, 3, 1, 13, '#7a4a22'); rect(g, 10, 9, 1, 2, '#f8d040'); });

// ---------- 地下城 ----------
redef('DWALL', (g, R, th) => {
  fill(g, th.wall);
  for (let y = 0; y < 16; y += 5) { rect(g, 0, y, 16, 1, shade(th.wall, 0.2)); rect(g, 0, y + 4, 16, 1, th.wall2); const o = (y / 5 % 2) * 4; for (let x = o; x < 16; x += 8) rect(g, x, y, 1, 5, th.wall2); }
});

// ---------- 自动过渡叠加层 ----------
const overlayCache = {};
function groundKind(m, x, y) {
  const id = tAt(m, x, y); if (id < 0) return 'out';
  const t = TILES[id], n = t.name;
  if (n === 'GRASS' || n === 'FLOWER' || n === 'TALL') return 'grass';
  if (n === 'PATH') return 'path'; if (n === 'SAND') return 'sand'; if (n === 'STONE') return 'stone';
  if (t.water) return 'water';
  if (n === 'CLIFF') return 'cliff';
  if (t.roofCol) return 'roof';
  if (t.base) { const u = m.under[y * m.w + x]; return u === 'grass' ? 'grass' : u || 'obj'; }
  return 'other';
}
function makeOverlay(key, fn) { let c = overlayCache[key]; if (!c) { c = makeCanvas(16, 16); fn(c.getContext('2d')); overlayCache[key] = c; } return c; }
function rotDraw(g, side, fn) { g.save(); g.translate(8, 8); g.rotate([0, Math.PI / 2, Math.PI, -Math.PI / 2][side]); g.translate(-8, -8); fn(g); g.restore(); }
// side: 0 上 1 右 2 下 3 左
function grassFringe(g, side, v, under) {
  rotDraw(g, side, g2 => {
    for (let x = 0; x < 16; x++) {
      const h = 2 + Math.floor(hash2(x + v * 31, side, 7) * 2.5);
      g2.fillStyle = PAL.grass; g2.fillRect(x, 0, 1, h);
      g2.fillStyle = PAL.grassDD; g2.fillRect(x, h, 1, 1);
      g2.fillStyle = 'rgba(90,60,20,0.18)'; g2.fillRect(x, h + 1, 1, 1);
    }
  });
}
function shoreLine(g, side) {
  rotDraw(g, side, g2 => {
    g2.fillStyle = 'rgba(30,60,90,0.35)'; g2.fillRect(0, 0, 16, 1);
    g2.fillStyle = PAL.foam; g2.fillRect(0, 1, 16, 2);
    g2.fillStyle = 'rgba(255,255,255,0.45)'; for (let x = 0; x < 16; x += 3) g2.fillRect(x, 3, 2, 1);
  });
}
const ART = {
  overlay(ctx, m, x, y, px, py) {
    const k = groundKind(m, x, y);
    if (k === 'path' || k === 'sand' || k === 'stone') {
      let mask = 0;
      for (let s = 0; s < 4; s++) { const [dx, dy] = [[0, -1], [1, 0], [0, 1], [-1, 0]][s]; if (groundKind(m, x + dx, y + dy) === 'grass') mask |= 1 << s; }
      if (mask) { const v = (x * 7 + y * 3) & 3; ctx.drawImage(makeOverlay('gf' + mask + v, g => { for (let s = 0; s < 4; s++) if (mask & (1 << s)) grassFringe(g, s, v); }), px, py); }
    } else if (k === 'water') {
      let mask = 0;
      for (let s = 0; s < 4; s++) { const [dx, dy] = [[0, -1], [1, 0], [0, 1], [-1, 0]][s]; const nk = groundKind(m, x + dx, y + dy); if (nk !== 'water' && nk !== 'out' && nk !== 'other' && !TILES[tAt(m, x + dx, y + dy)].name.includes('BRIDGE')) mask |= 1 << s; }
      if (mask) ctx.drawImage(makeOverlay('sh' + mask, g => { for (let s = 0; s < 4; s++) if (mask & (1 << s)) shoreLine(g, s); }), px, py);
    } else if (k === 'cliff') {
      const up = groundKind(m, x, y - 1), down = groundKind(m, x, y + 1), l = groundKind(m, x - 1, y), r = groundKind(m, x + 1, y);
      if (up !== 'cliff' && up !== 'out') {
        const top = up === 'grass' ? PAL.grass : up === 'path' ? PAL.path : '#d4aa78';
        ctx.fillStyle = top; ctx.fillRect(px, py, 16, 4);
        ctx.fillStyle = PAL.cliffDD; ctx.fillRect(px, py + 4, 16, 1);
        ctx.fillStyle = PAL.cliffL; ctx.fillRect(px, py + 5, 16, 1);
      }
      if (down !== 'cliff' && down !== 'out') { ctx.fillStyle = PAL.cliffDD; ctx.fillRect(px, py + 14, 16, 2); }
      ctx.fillStyle = PAL.cliffDD;
      if (l !== 'cliff' && l !== 'out') ctx.fillRect(px, py, 1, 16);
      if (r !== 'cliff' && r !== 'out') ctx.fillRect(px + 15, py, 1, 16);
    } else if (k === 'roof') {
      const col = TILES[tAt(m, x, y)].roofCol;
      const up = groundKind(m, x, y - 1), down = groundKind(m, x, y + 1), l = groundKind(m, x - 1, y), r = groundKind(m, x + 1, y);
      if (up !== 'roof') { ctx.fillStyle = PAL.outline; ctx.fillRect(px, py, 16, 1); ctx.fillStyle = shade(col, 0.4); ctx.fillRect(px, py + 1, 16, 2); }
      if (down !== 'roof') { ctx.fillStyle = shade(col, -0.45); ctx.fillRect(px, py + 13, 16, 3); ctx.fillStyle = PAL.outline; ctx.fillRect(px, py + 15, 16, 1); }
      ctx.fillStyle = PAL.outline;
      if (l !== 'roof') ctx.fillRect(px, py, 1, 16);
      if (r !== 'roof') ctx.fillRect(px + 15, py, 1, 16);
    }
    // 投影：悬崖、屋檐、墙下的阴影
    if (k !== 'cliff' && k !== 'roof' && y > 0) {
      const ab = groundKind(m, x, y - 1);
      if (ab === 'cliff') { ctx.fillStyle = 'rgba(40,20,0,0.22)'; ctx.fillRect(px, py, 16, 4); }
      else if (ab === 'roof') { ctx.fillStyle = 'rgba(40,20,0,0.25)'; ctx.fillRect(px, py, 16, 3); }
    }
    if (m.isDungeon) {
      const t = TILES[tAt(m, x, y)];
      if (t.name === 'DWALL') {
        const below = TILES[tAt(m, x, y + 1)] || t;
        if (!below.solid || below.name === 'DLOCK' || below.name === 'DBOSS') { const th = THEMES[m.theme]; ctx.fillStyle = shade(th.wall, -0.35); ctx.fillRect(px, py + 10, 16, 6); ctx.fillStyle = shade(th.wall, -0.2); ctx.fillRect(px, py + 10, 16, 1); }
        const th = THEMES[m.theme], lt = TILES[tAt(m, x - 1, y)], rt = TILES[tAt(m, x + 1, y)];
        if (rt && !rt.solid) { ctx.fillStyle = shade(th.wall, -0.3); ctx.fillRect(px + 12, py, 4, 16); }
        if (lt && !lt.solid) { ctx.fillStyle = shade(th.wall, -0.3); ctx.fillRect(px, py, 4, 16); }
        const ab = TILES[tAt(m, x, y - 1)];
        if (ab && !ab.solid) { ctx.fillStyle = shade(th.wall, 0.25); ctx.fillRect(px, py, 16, 2); }
      } else if (!t.solid && y > 0 && TILES[tAt(m, x, y - 1)].name === 'DWALL') { ctx.fillStyle = 'rgba(0,0,0,0.22)'; ctx.fillRect(px, py, 16, 4); }
    }
  },
  // 树冠等高物体
  treeCache: {},
  canopy(kind, v, trunk) {
    const key = kind + v + (trunk ? 't' : '');
    if (this.treeCache[key]) return this.treeCache[key];
    const c = makeCanvas(32, 32), g = c.getContext('2d'), R = mulberry32(v * 97 + 3);
    if (kind === 'tree') {
      if (trunk) { rect(g, 12, 22, 8, 9, PAL.outline); rect(g, 13, 22, 6, 9, '#8a5a30'); rect(g, 13, 22, 2, 9, '#a8743e'); rect(g, 17, 22, 2, 9, '#6a4220'); rect(g, 11, 30, 10, 1, PAL.outline); }
      const blobs = [[16, 12, 11], [9, 15, 7], [23, 15, 7], [16, 7, 8], [12, 18, 6], [20, 18, 6]];
      for (const [x, y, r] of blobs) circ(g, x + Math.floor(R() * 2), y, r + 1, '#163e1c');
      for (const [x, y, r] of blobs) circ(g, x + Math.floor(R() * 2), y, r, '#2e8034');
      // 光照
      const img = g.getImageData(0, 0, 32, 32), d = img.data;
      for (let y = 0; y < 32; y++) for (let x = 0; x < 32; x++) {
        const i = (y * 32 + x) * 4; if (d[i + 3] === 0) continue;
        if (d[i] === 0x16) continue;
        const lx = (x - 11) / 14, ly = (y - 7) / 14, dist = lx * lx + ly * ly;
        let col = dist < 0.35 ? '#5cb848' : dist < 0.9 ? '#3e9a3c' : '#2e8034';
        if (y > 20 && dist > 0.6) col = '#246a2c';
        if (((x * 3 + y * 5) % 7 === 0) && dist < 0.9) col = dist < 0.35 ? '#86d462' : '#5cb848';
        const [r2, g2, b2] = hexToRgb(col); d[i] = r2; d[i + 1] = g2; d[i + 2] = b2;
      }
      g.putImageData(img, 0, 0);
      for (let i = 0; i < 5; i++) { const x = 8 + Math.floor(R() * 12), y = 4 + Math.floor(R() * 8); rect(g, x, y, 2, 1, '#a8ee80'); }
    } else {
      rect(g, 14, 24, 4, 7, PAL.outline); rect(g, 15, 24, 2, 7, '#7a4a22');
      for (let i = 0; i < 4; i++) {
        const y0 = 2 + i * 6, w = 4 + i * 3;
        for (let r = 0; r < 8; r++) { const ww = Math.min(w, Math.floor(r * 1.4) + 1); rect(g, 16 - ww - 1, y0 + r, ww * 2 + 2, 1, '#123a20'); }
        for (let r = 0; r < 8; r++) { const ww = Math.min(w, Math.floor(r * 1.4) + 1); rect(g, 16 - ww, y0 + r, ww * 2, 1, r < 3 ? '#3e9a4a' : '#2a7a3a'); rect(g, 16 - ww, y0 + r, Math.max(1, ww - 2), 1, r < 3 ? '#5ab860' : '#3a8a46'); }
      }
    }
    this.treeCache[key] = c;
    return c;
  },
  tallList(m, x0, y0, x1, y1, cx, cy) {
    const out = [];
    for (let y = Math.max(0, y0); y <= Math.min(m.h - 1, y1 + 2); y++) for (let x = Math.max(0, x0 - 1); x <= Math.min(m.w - 1, x1 + 1); x++) {
      const t = TILES[m.t[y * m.w + x]]; if (!t.over) continue;
      const below = tAt(m, x, y + 1), trunk = below < 0 || !TILES[below].over;
      const spr = this.canopy(t.over, (x * 5 + y * 3) % 3, trunk);
      out.push({ sortY: () => (y + 1) * TS - 1, draw: () => ctx.drawImage(spr, x * TS - cx - 8, y * TS - cy - 16) });
    }
    return out;
  },
};

// ---------- 角色（16x22，带描边与四帧行走） ----------
const HERO_PAL = { k: '#1c1420', h: '#b8682c', H: '#7a3e18', l: '#e8a058', s: '#fcd0a0', S: '#e0a070', c: '#f0907a', e: '#20203a', w: '#ffffff', r: '#e04040', R: '#a02828', T: '#2a5aa8', t: '#3c80d8', u: '#70b0f8', b: '#5a3418', Y: '#f8d040', p: '#f4ecd8', P: '#c8b8a0', o: '#8a4e24', O: '#5a3014' };
const CH = (() => {
  const headD = sym(['......kk', '....kkhh', '...khhll', '..khhlhh', '..khhhhh', '.khhhhhh', '.khHhhHh', '.kHhshhh', '.kHsssss', '..kssess', '..kcsess', '...kSsss']);
  const headU = sym(['......kk', '....kkhh', '...khhhh', '..khhhlh', '..khhlhh', '.khhhhhh', '.khhhhhh', '.kHhhhhh', '.kHHhhhh', '..kHhhhh', '..kHHhhh', '...kkHHh']);
  const headS = ['......kkkk......', '....kkhhhhkk....', '...khhhllhhhk...', '..khhhhhllhhhk..', '..khhhhhhhhhhk..', '.khhhhhhhhhhhhk.', '.khHhhhhhHhhhhk.', '.kHhhhhhhhhsshk.', '.kHhhhhhhsssssk.', '..kHhhhhsssesk..', '..kHHhhscssesk..', '...kkHhkSsssk...'];
  const torD = sym(['....krrr', '...krRrr', '..kTtutt', '.kskTttt', '.kskbbbY']);
  const torU = sym(['....krrr', '...krrRr', '..kTtttt', '.kskTttt', '.kskbbbb']);
  const torS = ['.....kkrrrrk....', '...krRrRrrrk....', '.....kTtttuk....', '.....kTttsk.....', '.....kbbbYk.....'];
  const legD = sym(['...kTttt', '....kppk', '....kppk', '...koook', '...kkkkk']);
  const legDA = ['...kTttttttTk...', '....kppkkppk....', '....kppkkook....', '...koookkkkk....', '...kkkkk........'];
  const legDB = legDA.map(r => r.split('').reverse().join(''));
  const legS = ['.....kTtttk.....', '......kppk......', '......kppk......', '......koook.....', '......kkkkk.....'];
  const legSA = ['.....kTtttk.....', '.....kpkkpk.....', '....kpk..kpk....', '...kook...kook..', '...kkk....kkkk..'];
  const legSB = ['.....kTtttk.....', '......kppk......', '......kpkk......', '.....kook.......', '.....kkkk.......'];
  return { headD, headU, headS, torD, torU, torS, legD, legDA, legDB, legS, legSA, legSB };
})();
const charCache2 = {};
function lookPal(look) {
  if (!look || look.hero) return HERO_PAL;
  const p = Object.assign({}, HERO_PAL);
  p.h = look.hair; p.H = shade(look.hair, -0.35); p.l = shade(look.hair, 0.3);
  p.t = look.shirt; p.T = shade(look.shirt, -0.3); p.u = shade(look.shirt, 0.3);
  p.r = look.scarf || shade(look.shirt, 0.15); p.R = shade(p.r, -0.3);
  p.p = look.pants; p.P = shade(look.pants, -0.2); p.o = look.shoes || '#6a4428';
  if (look.skin) { p.s = look.skin; p.S = shade(look.skin, -0.15); }
  return p;
}
function buildFrame(head, tor, leg, pal, look, dir) {
  const c = buildSprite(head.concat(tor, leg), pal), g = c.getContext('2d');
  if (look && look.beard && dir !== 1) { g.fillStyle = look.beard; if (dir === 0) { g.fillRect(4, 10, 8, 2); g.fillRect(5, 12, 6, 2); g.fillRect(6, 14, 4, 1); } else { g.fillRect(8, 10, 5, 2); g.fillRect(8, 12, 4, 2); } }
  if (look && look.hat) { g.fillStyle = PAL.outline; g.fillRect(2, 2, 12, 1); g.fillStyle = look.hat; g.fillRect(4, 0, 8, 3); g.fillRect(1, 3, 14, 2); g.fillStyle = shade(look.hat, -0.3); g.fillRect(1, 4, 14, 1); }
  return c;
}
getCharFrames = function (look) {
  const key = JSON.stringify(look || 'hero');
  if (charCache2[key]) return charCache2[key];
  const pal = lookPal(look);
  const C = CH;
  const down = [buildFrame(C.headD, C.torD, C.legD, pal, look, 0), buildFrame(C.headD, C.torD, C.legDA, pal, look, 0), buildFrame(C.headD, C.torD, C.legDB, pal, look, 0)];
  const up = [buildFrame(C.headU, C.torU, C.legD, pal, look, 1), buildFrame(C.headU, C.torU, C.legDA, pal, look, 1), buildFrame(C.headU, C.torU, C.legDB, pal, look, 1)];
  const right = [buildFrame(C.headS, C.torS, C.legS, pal, look, 3), buildFrame(C.headS, C.torS, C.legSA, pal, look, 3), buildFrame(C.headS, C.torS, C.legSB, pal, look, 3)];
  const f = { down, up, right, left: right.map(flipCanvas) };
  charCache2[key] = f;
  return f;
};
// frame: 0..3 → 站立 / 迈左脚 / 站立 / 迈右脚
drawChar = function (ctx, look, dir, frame, x, y) {
  const f = getCharFrames(look)[DIR_NAMES[dir]];
  const idx = [0, 1, 0, 2][frame & 3];
  const bob = (frame & 1) ? -1 : 0;
  ctx.drawImage(f[idx], Math.round(x), Math.round(y) - 6 + bob);
};
function drawShadow(ctx, cx, cy, w, alpha) { ctx.fillStyle = `rgba(0,0,0,${alpha || 0.25})`; ctx.beginPath(); ctx.ellipse(cx, cy, w, w * 0.35, 0, 0, Math.PI * 2); ctx.fill(); }

// ---------- 怪物：自动边缘光照 ----------
const _origMonSprite = getMonSprite;
const litCache = new Map();
getMonSprite = function (look, flip) {
  const src = _origMonSprite(look, flip);
  let c = litCache.get(src); if (c) return c;
  c = makeCanvas(src.width, src.height); const g = c.getContext('2d'); g.drawImage(src, 0, 0);
  const img = g.getImageData(0, 0, c.width, c.height), d = img.data, W = c.width;
  const isOut = i => d[i + 3] === 0 || (d[i] < 50 && d[i + 1] < 50 && d[i + 2] < 60);
  const copy = new Uint8ClampedArray(d);
  for (let y = 1; y < c.height - 1; y++) for (let x = 1; x < W - 1; x++) {
    const i = (y * W + x) * 4; if (isOut(i)) continue;
    const up = ((y - 1) * W + x) * 4, dn = ((y + 1) * W + x) * 4, lf = (y * W + x - 1) * 4;
    let k = 0;
    if (copy[up + 3] === 0 || (copy[up] < 50 && copy[up + 1] < 50)) k += 0.22;
    if (copy[lf + 3] === 0 || (copy[lf] < 50 && copy[lf + 1] < 50)) k += 0.1;
    if (copy[dn + 3] === 0 || (copy[dn] < 50 && copy[dn + 1] < 50)) k -= 0.22;
    if (k > 0) { d[i] += (255 - d[i]) * k; d[i + 1] += (255 - d[i + 1]) * k; d[i + 2] += (255 - d[i + 2]) * k; }
    else if (k < 0) { d[i] *= 1 + k; d[i + 1] *= 1 + k; d[i + 2] *= 1 + k; }
  }
  g.putImageData(img, 0, 0);
  litCache.set(src, c);
  return c;
};

// ---------- 敌人绘制：挤压拉伸、阴影 ----------
Enemy.prototype.draw = function (ctx, cx, cy) {
  if (this.spawnT > 0) { ctx.fillStyle = `rgba(255,255,255,${this.spawnT * 2})`; ctx.beginPath(); ctx.arc(this.cx() - cx, this.cy() - cy, 10 - this.spawnT * 15, 0, 7); ctx.fill(); return; }
  const x = this.x - cx, y = this.y - cy;
  let sx = 1, sy = 1, lift = 0;
  if (this.k.ai === 'hop') {
    if (this.state === 'hop') { const k = (0.45 - this.t) / 0.45; lift = Math.sin(k * Math.PI) * 6; sx = 0.85; sy = 1.18; }
    else { const w = Math.sin(G.t * 9 + this.x) * 0.06; sx = 1.08 + w; sy = 0.92 - w; }
  } else if (this.k.fly) { lift = 5 + Math.sin(G.t * 6 + this.x) * 2; sx = 1 + Math.sin(G.t * 18) * 0.08; }
  else if (Math.abs(this.vx) + Math.abs(this.vy) > 1) { lift = Math.abs(Math.sin(G.t * 12 + this.x)) * 1.5; }
  drawShadow(ctx, x + 8, y + 15, 6 - lift * 0.3, 0.28);
  const spr = getMonSprite(this.k.look, this.dir === 3);
  const img = this.flash > 0 ? silhouette(spr, '#ffffff') : this.stun > 0 ? silhouette(spr, '#9ac8ff') : spr;
  ctx.save(); ctx.translate(Math.round(x + 8), Math.round(y + 16 - lift)); ctx.scale(sx, sy); ctx.drawImage(img, -8, -16); ctx.restore();
  if (this.stun > 0) drawStars(ctx, x + 8, y - 4 - lift);
};
const _enemyDie = Enemy.prototype.die;
Enemy.prototype.die = function () {
  _enemyDie.call(this);
  for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2; Particles.list.push({ x: this.cx(), y: this.cy(), vx: Math.cos(a) * 30, vy: Math.sin(a) * 30, life: 0.45, max: 0.45, color: '#ffffff', grav: 0, size: 3 }); }
  G.hitStop = Math.max(G.hitStop || 0, 0.07);
};
// 粒子支持更大的烟雾
Particles.draw = function (ctx, cx, cy) {
  for (const p of this.list) {
    ctx.globalAlpha = clamp(p.life / p.max * 1.5, 0, 1);
    if (p.text) drawText(ctx, p.text, p.x - cx, p.y - cy, p.color, 9, 'center', true, true);
    else if (p.size >= 3) { ctx.fillStyle = p.color; ctx.beginPath(); ctx.arc(p.x - cx, p.y - cy, 2 + (1 - p.life / p.max) * 4, 0, 7); ctx.fill(); }
    else { ctx.fillStyle = p.color; ctx.fillRect(Math.round(p.x - cx), Math.round(p.y - cy), p.size, p.size); }
  }
  ctx.globalAlpha = 1;
};
NPC.prototype.draw = function (ctx, cx, cy) {
  const x = Math.round(this.x - cx), y = Math.round(this.y - cy);
  drawShadow(ctx, x + 8, y + 15, 6);
  drawChar(ctx, this.def.look, this.dir, this.frame, x, y);
};
HERO_LOOK.hero = true;
tinyCanvas = buildSprite(TINY_ROWS, { k: HERO_PAL.k, h: HERO_PAL.h, s: HERO_PAL.s, e: HERO_PAL.e, c: HERO_PAL.t, p: HERO_PAL.p });
