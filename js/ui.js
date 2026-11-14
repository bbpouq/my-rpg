'use strict';
// ============ UI 栈 ============
const UI = {
  push(o) { G.ui.push(o); Input.clear(); return o; },
  pop(o) { const i = G.ui.indexOf(o); if (i >= 0) G.ui.splice(i, 1); Input.clear(); },
  top() { return G.ui[G.ui.length - 1]; },
};
const LEAF_LOOK = { tpl: 'sprout', a: '#9ae070', d: '#3a9a2a' };
function say(speaker, lines, look) { return new Promise(res => UI.push(new DialogUI(speaker, lines, look, res))); }
function ask(q, options, speaker, look) { return new Promise(res => UI.push(new ChoiceUI(q, options, speaker, look, res))); }
function bigMessage(title, sub, icon) { return new Promise(res => UI.push(new BigMsgUI(title, sub, icon, res))); }
function toast(text) { if (!text) return; G.toasts.push({ text, t: 3 }); if (G.toasts.length > 3) G.toasts.shift(); }
function runScript(fn) { G.scriptLock++; return Promise.resolve().then(fn).catch(e => console.error(e)).finally(() => { G.scriptLock--; }); }
function fadeOut(t) { return new Promise(res => { G.fade = { a: G.fade.a, to: 1, sp: 1 / (t || 0.4), res, busy: true }; }); }
function fadeIn(t) { return new Promise(res => { G.fade = { a: G.fade.a, to: 0, sp: 1 / (t || 0.4), res, busy: true }; }); }

class DialogUI {
  constructor(speaker, lines, look, res) { this.speaker = speaker; this.lines = (Array.isArray(lines) ? lines : [lines]).filter(l => l != null); this.look = look; this.res = res; this.i = 0; this.c = 0; this.wrapped = null; }
  update(dt) {
    const full = this.lines[this.i] || '';
    if (this.c < full.length) {
      const b = Math.floor(this.c); this.c += dt * 45;
      if (Math.floor(this.c) !== b && Math.floor(this.c) % 3 === 0) Sfx.play('text');
      if (Input.hit('a') || Input.hit('b')) this.c = full.length;
    } else if (Input.hit('a') || Input.hit('b')) {
      this.i++; this.c = 0; this.wrapped = null; Sfx.play('select');
      if (this.i >= this.lines.length) { UI.pop(this); this.res && this.res(); }
    }
  }
  draw(ctx) {
    const x = 4, h = 58, y = VH - h - 4, w = VW - 8;
    drawBox(ctx, x, y, w, h);
    let tx = x + 10;
    if (this.look) {
      ctx.fillStyle = '#e8d4a8'; ctx.fillRect(x + 7, y + 8, 42, 42); ctx.strokeStyle = '#b08a50'; ctx.strokeRect(x + 7.5, y + 8.5, 41, 41);
      if (this.look.tpl) drawMonLook(ctx, this.look, x + 12, y + 13, 2);
      else ctx.drawImage(getCharFrames(this.look).down[0], 0, 0, 16, 16, x + 4, y + 4, 48, 48);
      tx = x + 56;
    }
    if (this.speaker) { const sw = textW(ctx, this.speaker, 10, true) + 14; drawBox(ctx, x + 4, y - 13, sw, 17, 'dark'); drawText(ctx, this.speaker, x + 11, y - 10, '#ffe8a0', 10, 'left', false, true); }
    if (!this.wrapped) this.wrapped = wrapText(ctx, this.lines[this.i] || '', w - (tx - x) - 12, 12);
    let n = Math.floor(this.c), yy = y + 9;
    for (const line of this.wrapped) { if (n <= 0) break; drawText(ctx, line.slice(0, n), tx, yy, '#3a2a1a', 12); n -= line.length; yy += 15; }
    if (this.c >= (this.lines[this.i] || '').length && Math.floor(G.t * 3) % 2) { ctx.fillStyle = '#a0602a'; ctx.beginPath(); ctx.moveTo(x + w - 16, y + h - 13); ctx.lineTo(x + w - 8, y + h - 13); ctx.lineTo(x + w - 12, y + h - 8); ctx.fill(); }
  }
}
class ChoiceUI {
  constructor(q, options, speaker, look, res) { this.opts = options; this.res = res; this.i = 0; this.dlg = q ? new DialogUI(speaker, [q], look, null) : null; if (this.dlg) this.dlg.c = 9999; }
  update() {
    if (Input.nav('up')) { this.i = (this.i + this.opts.length - 1) % this.opts.length; Sfx.play('select'); }
    if (Input.nav('down')) { this.i = (this.i + 1) % this.opts.length; Sfx.play('select'); }
    if (Input.hit('a')) { Sfx.play('confirm'); UI.pop(this); this.res(this.i); }
    else if (Input.hit('b') || Input.hit('menu')) { Sfx.play('cancel'); UI.pop(this); this.res(-1); }
  }
  draw(ctx) {
    if (this.dlg) this.dlg.draw(ctx);
    let w = 0; for (const o of this.opts) w = Math.max(w, textW(ctx, o, 12)); w += 30;
    const h = this.opts.length * 18 + 10, x = VW - w - 8, y = (this.dlg ? VH - 66 : VH / 2 + h / 2) - h;
    drawBox(ctx, x, y, w, h);
    this.opts.forEach((o, i) => {
      if (i === this.i) { ctx.fillStyle = 'rgba(200,140,60,0.25)'; ctx.fillRect(x + 5, y + 5 + i * 18, w - 10, 17); drawText(ctx, '▶', x + 8, y + 9 + i * 18, '#c0602a', 9); }
      drawText(ctx, o, x + 20, y + 7 + i * 18, '#3a2a1a', 12);
    });
  }
}
class BigMsgUI {
  constructor(title, sub, icon, res) { this.title = title; this.sub = sub; this.icon = icon; this.res = res; this.t = 0; Sfx.play('item'); }
  update(dt) { this.t += dt; if (this.t > 0.5 && (Input.hit('a') || Input.hit('b'))) { UI.pop(this); this.res && this.res(); } }
  draw(ctx) {
    ctx.fillStyle = 'rgba(0,0,0,0.45)'; ctx.fillRect(0, 0, VW, VH);
    const w = 240, h = this.sub ? 100 : 76, x = (VW - w) / 2, y = 30;
    drawBox(ctx, x, y, w, h);
    if (this.icon) { const s = Math.min(1, this.t * 4); ctx.drawImage(getIcon(ITEMS[this.icon]), x + w / 2 - 14 * s, y + 8 + 14 * (1 - s), 28 * s, 28 * s); }
    drawText(ctx, this.title, x + w / 2, y + 42, '#7a3a10', 14, 'center', false, true);
    if (this.sub) wrapText(ctx, this.sub, w - 24, 10).forEach((l, i) => drawText(ctx, l, x + w / 2, y + 62 + i * 13, '#5a4a3a', 10, 'center'));
  }
}
function navList(st, n) {
  if (n <= 0) return;
  if (Input.nav('down')) { st.i = (st.i + 1) % n; Sfx.play('select'); }
  if (Input.nav('up')) { st.i = (st.i + n - 1) % n; Sfx.play('select'); }
}

// ============ HUD ============
const HEART_PX = ['.kk.kk.', 'kaakaak', 'kaaaaak', '.kaaak.', '..kak..', '...k...'];
function drawHeart(ctx, x, y, fill, s) {
  s = s || 1.4;
  for (let j = 0; j < 6; j++) for (let i = 0; i < 7; i++) {
    const c = HEART_PX[j][i]; if (c === '.') continue;
    let col = '#2a1018';
    if (c === 'a') col = (fill >= 1 || (fill > 0 && i < 4)) ? (j === 1 && i === 1 ? '#ffb0c0' : '#f03050') : '#5a3038';
    ctx.fillStyle = col; ctx.fillRect(x + i * s, y + j * s, Math.ceil(s), Math.ceil(s));
  }
}
function itemCount(id) { return id === 'bombs' ? S.bombs : id === 'bow' ? S.arrows : null; }
function drawItemBox(ctx, x, y, label, id, flash) {
  drawBox(ctx, x, y, 26, 26, 'dark');
  if (flash) { ctx.strokeStyle = '#ffe060'; ctx.strokeRect(x + 0.5, y + 0.5, 25, 25); }
  if (id) ctx.drawImage(getIcon(ITEMS[id]), x + 4, y + 4, 18, 18);
  drawText(ctx, label, x + 2, y - 1, '#ffe8a0', 8, 'left', '#000', true);
  const n = id ? itemCount(id) : null;
  if (n != null) drawText(ctx, String(n), x + 24, y + 16, '#fff', 8, 'right', '#000', true);
}
function drawHUD(ctx) {
  const hearts = S.maxhp / 2;
  for (let i = 0; i < hearts; i++) { const v = clamp(S.hp / 2 - i, 0, 1); drawHeart(ctx, 5 + (i % 10) * 11, 5 + Math.floor(i / 10) * 10, v >= 1 ? 1 : v > 0 ? 0.5 : 0); }
  let hy = 15 + Math.floor((hearts - 1) / 10) * 10;
  for (let i = 0; i < S.potions; i++) ctx.drawImage(getIcon(ITEMS.potion), 5 + i * 11, hy, 11, 11);
  if (S.potions) hy += 12;
  if (G.map.isDungeon) {
    const d = dngState(G.map.dng);
    ctx.drawImage(getIcon(ITEMS.key), 4, hy, 13, 13); drawText(ctx, '×' + d.keys, 17, hy + 2, '#fff', 9, 'left', '#000', true);
    if (d.bossKey) ctx.drawImage(getIcon(ITEMS.bosskey), 34, hy, 13, 13);
  }
  ctx.drawImage(getIcon(ITEMS.rupee), 3, VH - 18, 15, 15);
  drawText(ctx, String(S.rupees).padStart(3, '0'), 18, VH - 15, S.rupees >= S.wallet ? '#ffe060' : '#fff', 11, 'left', '#000', true);
  if (S.flags.gotSword) drawItemBox(ctx, VW - 62, 6, 'J', 'sword');
  if (S.equip) drawItemBox(ctx, VW - 32, 6, 'K', S.equip, G.itemFlash > 0);
  if (G.itemFlash > 0 && S.equip) drawText(ctx, ITEMS[S.equip].name, VW - 19, 35, '#fff', 9, 'center', '#000', true);
  else if (S.tiny) drawText(ctx, '小人模式', VW - 6, 36, '#a0ffa0', 9, 'right', '#000', true);
  G.toasts.forEach((t, i) => {
    const y = VH - 40 - (G.toasts.length - 1 - i) * 17;
    ctx.globalAlpha = clamp(t.t, 0, 1);
    const w = textW(ctx, t.text, 10) + 14;
    drawBox(ctx, (VW - w) / 2, y, w, 15, 'dark'); drawText(ctx, t.text, VW / 2, y + 2, '#fff', 10, 'center');
    ctx.globalAlpha = 1;
  });
  if (G.banner && G.banner.t > 0) {
    ctx.globalAlpha = clamp(G.banner.t, 0, 1);
    const w = textW(ctx, G.banner.text, 13, true) + 30;
    drawBox(ctx, (VW - w) / 2, 26, w, 22, 'dark'); drawText(ctx, G.banner.text, VW / 2, 30, '#ffe8a0', 13, 'center', false, true);
    ctx.globalAlpha = 1;
  }
}

// ============ 暂停菜单 ============
class PauseUI {
  constructor() { this.i = Math.max(0, EQUIP_ORDER.indexOf(S.equip)); Sfx.play('confirm'); }
  opts() { return [['保存', 'save'], ['声音', 'mute'], ['操作说明', 'help'], ['返回标题', 'title']]; }
  update() {
    const n = 4 + this.opts().length;
    if (Input.hit('menu') || Input.hit('b')) { UI.pop(this); Sfx.play('cancel'); return; }
    if (Input.nav('right')) { this.i = (this.i + 1) % n; Sfx.play('select'); }
    if (Input.nav('left')) { this.i = (this.i + n - 1) % n; Sfx.play('select'); }
    if (Input.nav('down') && this.i < 4) { this.i = 4; Sfx.play('select'); }
    if (Input.nav('up') && this.i >= 4) { this.i = 0; Sfx.play('select'); }
    if (!Input.hit('a')) return;
    if (this.i < 4) { const id = EQUIP_ORDER[this.i]; if (S.items[id]) { S.equip = id; Sfx.play('confirm'); G.itemFlash = 0.8; } return; }
    const o = this.opts()[this.i - 4][1];
    if (o === 'save') { saveGame(); if (G.map.isDungeon || G.map.mini) toast('读档时会回到入口附近'); }
    else if (o === 'mute') toast(Sfx.toggle() ? '声音：关' : '声音：开');
    else if (o === 'help') runScript(() => say('操作说明', HELP_TEXT));
    else if (o === 'title') runScript(async () => { const c = await ask('返回标题画面？（会自动存档）', ['返回', '取消']); if (c === 0) { saveGame(true); location.reload(); } });
  }
  draw(ctx) {
    ctx.fillStyle = 'rgba(0,0,0,0.55)'; ctx.fillRect(0, 0, VW, VH);
    drawBox(ctx, 6, 6, VW - 12, VH - 12);
    drawText(ctx, '道具（J 装备到 K 键）', 18, 13, '#7a3a10', 10, 'left', false, true);
    EQUIP_ORDER.forEach((id, i) => {
      const x = 18 + i * 34, y = 28, sel = this.i === i, own = S.items[id];
      ctx.fillStyle = sel ? '#ffe8a0' : '#efdcb0'; ctx.fillRect(x, y, 30, 30);
      ctx.strokeStyle = sel ? '#d0602a' : S.equip === id ? '#3a8ae0' : '#b08a50'; ctx.lineWidth = sel || S.equip === id ? 2 : 1; ctx.strokeRect(x + 0.5, y + 0.5, 29, 29); ctx.lineWidth = 1;
      if (own) { ctx.drawImage(getIcon(ITEMS[id]), x + 3, y + 3, 24, 24); const n = itemCount(id); if (n != null) drawText(ctx, String(n), x + 28, y + 20, '#fff', 8, 'right', '#000', true); }
      else drawText(ctx, '?', x + 15, y + 9, '#c0a880', 12, 'center');
    });
    const cur = this.i < 4 && S.items[EQUIP_ORDER[this.i]] ? ITEMS[EQUIP_ORDER[this.i]] : null;
    if (cur) { drawText(ctx, cur.name, 18, 64, '#5a2a10', 11, 'left', false, true); wrapText(ctx, cur.desc, 136, 9).slice(0, 3).forEach((l, i) => drawText(ctx, l, 18, 78 + i * 11, '#4a3a2a', 9)); }
    else if (this.i < 4) drawText(ctx, '还没有得到这个道具。', 18, 66, '#8a7a6a', 9);
    const hx = 170, hy = 22;
    drawText(ctx, '心之碎片', hx, hy - 9, '#7a3a10', 10, 'left', false, true);
    for (let j = 0; j < 6; j++) for (let k = 0; k < 7; k++) { const c = HEART_PX[j][k]; if (c === '.') continue; const q = (k < 4 ? 0 : 1) + (j < 3 ? 0 : 2); ctx.fillStyle = c === 'k' ? '#2a1018' : q < S.pieces ? '#f03050' : '#c8b090'; ctx.fillRect(hx + k * 4, hy + 4 + j * 4, 4, 4); }
    drawText(ctx, S.pieces + ' / 4', hx + 34, hy + 10, '#3a2a1a', 10);
    drawText(ctx, '光之果实 ' + S.fruits + ' / 4', hx, hy + 34, '#3a2a1a', 10);
    drawText(ctx, '钱包上限 ' + S.wallet, hx, hy + 48, '#3a2a1a', 10);
    const mx = 252, my = 16;
    for (const k in WORLD_LAYOUT) {
      const [gx, gy] = WORLD_LAYOUT[k], x = mx + (gx - 1) * 18, y = my + gy * 14;
      const here = G.map.id === k || (G.safeMap === k && (G.map.isDungeon || G.map.mini || !G.map.outdoor));
      ctx.fillStyle = here ? '#ffe060' : S.visited[k] ? '#8ac070' : '#c8b090'; ctx.fillRect(x, y, 16, 12);
      if (here && Math.floor(G.t * 3) % 2) { ctx.fillStyle = '#d0602a'; ctx.fillRect(x + 6, y + 4, 4, 4); }
    }
    drawText(ctx, '地图', mx + 27, my + 46, '#8a6a4a', 8, 'center');
    drawText(ctx, '◆ 当前目标', 18, 110, '#7a3a10', 10, 'left', false, true);
    wrapText(ctx, goalText(), VW - 44, 10).slice(0, 2).forEach((l, i) => drawText(ctx, l, 24, 124 + i * 12, '#3a2a1a', 10));
    this.opts().forEach((o, k) => {
      const x = 16 + k * 73, y = 152, sel = this.i === 4 + k;
      ctx.fillStyle = sel ? '#ffe8a0' : '#efdcb0'; ctx.fillRect(x, y, 68, 16);
      if (sel) { ctx.strokeStyle = '#d0602a'; ctx.strokeRect(x + 0.5, y + 0.5, 67, 15); }
      drawText(ctx, o[0], x + 34, y + 3, '#3a2a1a', 10, 'center');
    });
  }
}
const HELP_TEXT = [
  '方向键 / WASD：移动\nJ 或 空格：挥剑 · 对话 · 确定\n按住 J 再松开：回旋斩！',
  'K：使用道具（回旋镖、炸弹、羽毛、弓）\nQ / E：切换道具\nI 或 Esc：菜单    M：静音    F：全屏',
  '站在发光的树桩上按 J，就能变小或变大。\n变小以后能钻进很小的洞，发现藏起来的世界！',
];

// ============ 商店 ============
function openShop() { return new Promise(res => UI.push(new ShopUI(res))); }
class ShopUI {
  constructor(res) { this.res = res; this.i = 0; }
  list() {
    const l = [{ id: 'potion', name: '红药水', price: 60, ok: () => S.potions < 2, why: '最多只能带 2 瓶', give: () => S.potions++ }];
    if (S.items.bombs) l.push({ id: 'bombs', name: '炸弹 ×5', price: 20, ok: () => S.bombs < S.maxBombs, why: '炸弹已经满了', give: () => S.bombs = Math.min(S.maxBombs, S.bombs + 5) });
    if (S.items.bow) l.push({ id: 'arrow', name: '箭 ×10', price: 20, ok: () => S.arrows < S.maxArrows, why: '箭已经满了', give: () => S.arrows = Math.min(S.maxArrows, S.arrows + 10) });
    if (!S.flags.shopPiece) l.push({ id: 'heartp', name: '心之碎片', price: 150, ok: () => true, give: () => { S.flags.shopPiece = true; gainPiece(); } });
    l.push({ id: null, name: '离开' });
    return l;
  }
  update() {
    const l = this.list(); navList(this, l.length);
    if (Input.hit('b') || Input.hit('menu')) { UI.pop(this); this.res(); return; }
    if (!Input.hit('a')) return;
    const it = l[this.i];
    if (!it.id) { UI.pop(this); this.res(); return; }
    if (!it.ok()) { toast(it.why); Sfx.play('cancel'); return; }
    if (S.rupees < it.price) { toast(it.price > S.wallet ? '钱包太小了，装不下这么多宝石……' : '宝石不够！'); Sfx.play('cancel'); return; }
    S.rupees -= it.price; it.give(); Sfx.play('coin'); toast('买下了 ' + it.name);
    this.i = Math.min(this.i, this.list().length - 1);
  }
  draw(ctx) {
    ctx.fillStyle = 'rgba(0,0,0,0.4)'; ctx.fillRect(0, 0, VW, VH);
    const l = this.list(), W = 200, H = l.length * 22 + 34, X = (VW - W) / 2, Y = 14;
    drawBox(ctx, X, Y, W, H);
    drawText(ctx, '商店', X + 12, Y + 8, '#7a3a10', 12, 'left', false, true);
    ctx.drawImage(getIcon(ITEMS.rupee), X + W - 52, Y + 7, 12, 12); drawText(ctx, String(S.rupees), X + W - 12, Y + 8, '#3a2a1a', 11, 'right');
    l.forEach((it, i) => {
      const y = Y + 28 + i * 22, sel = i === this.i;
      ctx.fillStyle = sel ? '#ffe8a0' : '#efdcb0'; ctx.fillRect(X + 8, y, W - 16, 20);
      if (it.id) ctx.drawImage(getIcon(ITEMS[it.id]), X + 11, y + 2, 16, 16);
      drawText(ctx, it.name, X + 32, y + 4, '#3a2a1a', 11);
      if (it.price) { ctx.drawImage(getIcon(ITEMS.rupee), X + W - 44, y + 4, 11, 11); drawText(ctx, String(it.price), X + W - 14, y + 4, '#8a6a20', 11, 'right'); }
    });
  }
}

// ============ 标题 ============
class TitleUI {
  constructor() { this.i = 0; this.t = 0; this.opts = hasSave() ? [['继续游戏', 'cont'], ['新的游戏', 'new'], ['操作说明', 'help']] : [['新的游戏', 'new'], ['操作说明', 'help']]; }
  update(dt) {
    this.t += dt; if (this.busy) return;
    if (Input.nav('up')) { this.i = (this.i + this.opts.length - 1) % this.opts.length; Sfx.play('select'); }
    if (Input.nav('down')) { this.i = (this.i + 1) % this.opts.length; Sfx.play('select'); }
    if (!Input.hit('a')) return;
    Sfx.play('confirm'); const o = this.opts[this.i][1]; this.busy = true;
    (async () => {
      if (o === 'cont') { const s = loadSave(); if (s) { UI.pop(this); startGame(s); return; } }
      else if (o === 'new') {
        if (hasSave()) { const c = await ask('开始新游戏会覆盖现在的存档，确定吗？', ['确定', '取消']); if (c !== 0) { this.busy = false; return; } }
        UI.pop(this); startGame(newState(), true); return;
      } else if (o === 'help') await say('操作说明', HELP_TEXT);
      this.busy = false;
    })();
  }
  draw(ctx) {
    const g = ctx.createLinearGradient(0, 0, 0, VH); g.addColorStop(0, '#5aa8e8'); g.addColorStop(0.7, '#bfe6ff'); g.addColorStop(1, '#e8f6ff');
    ctx.fillStyle = g; ctx.fillRect(0, 0, VW, VH);
    for (let i = 0; i < 6; i++) { const x = (i * 70 + this.t * 6) % (VW + 60) - 40; ctx.fillStyle = 'rgba(255,255,255,0.8)'; ctx.beginPath(); ctx.ellipse(x, 30 + (i % 3) * 14, 22, 6, 0, 0, 7); ctx.fill(); }
    for (let x = -8; x < VW + 16; x += 16) ctx.drawImage(getTileSprite(TILE.MGRASS, ((x / 16 + 8) | 0) % 4, 0, 'forest', 'mground'), x, 120, 16, 32);
    for (let x = 0; x < VW; x += 16) { ctx.drawImage(getTileSprite(TILE.MGROUND, (x / 16) % 4, 0, 'forest', null), x, 148); ctx.drawImage(getTileSprite(TILE.MGROUND, (x / 16 + 1) % 4, 0, 'forest', null), x, 164); }
    ctx.drawImage(getTileSprite(TILE.MMUSH, 0, 0, 'forest', 'mground'), 24, 100, 48, 48);
    ctx.drawImage(getTileSprite(TILE.MACORN, 0, 0, 'forest', 'mground'), 252, 116, 32, 32);
    const bob = Math.sin(this.t * 3) * 1.5;
    ctx.save(); ctx.translate(VW / 2 - 12, 124); ctx.scale(1.5, 1.5); drawChar(ctx, HERO_LOOK, 0, Math.floor(this.t * 3) % 2, 0, 0); ctx.restore();
    drawMonLook(ctx, LEAF_LOOK, VW / 2 + 10, 116 + bob, 0.75);
    drawText(ctx, '星屿物语', VW / 2 + 2, 14, 'rgba(30,40,80,0.5)', 30, 'center', false, true);
    drawText(ctx, '星屿物语', VW / 2, 12, '#fff8d0', 30, 'center', false, true);
    drawText(ctx, '～ 小小勇者与守护古树 ～', VW / 2, 48, '#2a4a6a', 10, 'center');
    const bw = 110, bh = this.opts.length * 17 + 10, bx = VW / 2 - bw / 2, by = 62;
    drawBox(ctx, bx, by, bw, bh);
    this.opts.forEach((o, i) => {
      if (i === this.i) { ctx.fillStyle = 'rgba(200,140,60,0.25)'; ctx.fillRect(bx + 5, by + 5 + i * 17, bw - 10, 16); drawText(ctx, '▶', bx + 10, by + 8 + i * 17, '#c0602a', 9); }
      drawText(ctx, o[0], VW / 2, by + 7 + i * 17, '#3a2a1a', 11, 'center');
    });
  }
}
class CreditsUI {
  constructor(res) { this.res = res; this.t = 0; }
  update(dt) { this.t += dt; if (this.t > 4 && (Input.hit('a') || Input.hit('b'))) { UI.pop(this); this.res(); } }
  draw(ctx) {
    ctx.fillStyle = '#0a0818'; ctx.fillRect(0, 0, VW, VH);
    for (let i = 0; i < 60; i++) { ctx.fillStyle = 'rgba(255,255,255,' + Math.abs(Math.sin(this.t + i)) + ')'; ctx.fillRect(hash2(i, 5) * VW, hash2(i, 6) * VH, 1, 1); }
    const lines = ['～ 星屿物语 ～', '', '四颗光之果实回到了守护古树。', '古树重新长出了绿叶，', '星露村又迎来了和平。', '', '谢谢你，小小的勇者！', '', '（按 J 继续 —— 还有没找到的心之碎片哦）'];
    const off = Math.max(0, 140 - this.t * 30);
    lines.forEach((l, i) => drawText(ctx, l, VW / 2, 20 + i * 16 + off, i === 0 ? '#ffe8a0' : '#fff', i === 0 ? 15 : 11, 'center', false, i === 0));
  }
}
