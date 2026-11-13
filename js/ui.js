'use strict';
// ============ UI 栈 ============
const UI = {
  push(o) { G.ui.push(o); Input.clear(); return o; },
  pop(o) { const i = G.ui.indexOf(o); if (i >= 0) G.ui.splice(i, 1); Input.clear(); },
  top() { return G.ui[G.ui.length - 1]; },
};
function say(speaker, lines, look) { return new Promise(res => UI.push(new DialogUI(speaker, lines, look, res))); }
function ask(q, options, speaker, look) { return new Promise(res => UI.push(new ChoiceUI(q, options, speaker, look, res))); }
function bigMessage(title, sub, icon) { return new Promise(res => UI.push(new BigMsgUI(title, sub, icon, res))); }
function toast(text) { G.toasts.push({ text, t: 3 }); if (G.toasts.length > 4) G.toasts.shift(); }
function toastItem(id, n) { G.toasts.push({ text: `获得 ${ITEMS[id].name} ×${n}`, t: 2.5, icon: id }); if (G.toasts.length > 4) G.toasts.shift(); }
function runScript(fn) { G.scriptLock++; return Promise.resolve().then(fn).catch(e => { console.error(e); }).finally(() => { G.scriptLock--; }); }
function fadeOut(t) { return new Promise(res => { G.fade = { a: G.fade.a, to: 1, sp: 1 / (t || 0.4), res, busy: true }; }); }
function fadeIn(t) { return new Promise(res => { G.fade = { a: G.fade.a, to: 0, sp: 1 / (t || 0.4), res, busy: true }; }); }

// ============ 对话框 ============
class DialogUI {
  constructor(speaker, lines, look, res) { this.speaker = speaker; this.lines = (Array.isArray(lines) ? lines : [lines]).filter(l => l != null); this.look = look; this.res = res; this.i = 0; this.c = 0; this.wrapped = null; this.st = 0; }
  update(dt) {
    const full = this.lines[this.i] || '';
    if (this.c < full.length) {
      const before = Math.floor(this.c); this.c += dt * 55;
      if (Math.floor(this.c) !== before && Math.floor(this.c) % 3 === 0) Sfx.play('text');
      if (Input.hit('a') || Input.hit('b')) this.c = full.length;
    } else if (Input.hit('a') || Input.hit('b')) {
      this.i++; this.c = 0; this.wrapped = null; Sfx.play('select');
      if (this.i >= this.lines.length) { UI.pop(this); this.res && this.res(); }
    }
  }
  draw(ctx) {
    const x = 8, h = 70, y = VH - h - 6, w = VW - 16;
    drawBox(ctx, x, y, w, h);
    let tx = x + 12;
    if (this.look) {
      ctx.fillStyle = '#e8d4a8'; ctx.fillRect(x + 8, y + 9, 52, 52); ctx.strokeStyle = '#b08a50'; ctx.strokeRect(x + 8.5, y + 9.5, 51, 51);
      if (this.look.tpl) drawMonLook(ctx, this.look, x + 10, y + 11, 3);
      else { const f = getCharFrames(this.look).down[0]; ctx.drawImage(f, 0, 0, 16, 16, x + 10, y + 7, 48, 48); }
      tx = x + 68;
    }
    if (this.speaker) {
      const sw = textW(ctx, this.speaker, 10, true) + 14;
      drawBox(ctx, x + 6, y - 14, sw, 18, 'dark');
      drawText(ctx, this.speaker, x + 13, y - 10, '#ffe8a0', 10, 'left', false, true);
    }
    if (!this.wrapped) this.wrapped = wrapText(ctx, this.lines[this.i] || '', w - (tx - x) - 14, 11);
    let n = Math.floor(this.c);
    let yy = y + 12;
    for (const line of this.wrapped) {
      if (n <= 0) break;
      const s = line.slice(0, n); n -= line.length;
      drawText(ctx, s, tx, yy, '#3a2a1a', 11); yy += 15;
    }
    if (this.c >= (this.lines[this.i] || '').length && Math.floor(G.t * 3) % 2) { ctx.fillStyle = '#a0602a'; ctx.beginPath(); ctx.moveTo(x + w - 18, y + h - 14); ctx.lineTo(x + w - 10, y + h - 14); ctx.lineTo(x + w - 14, y + h - 9); ctx.fill(); }
  }
}
class ChoiceUI {
  constructor(q, options, speaker, look, res) { this.q = q; this.opts = options; this.speaker = speaker; this.look = look; this.res = res; this.i = 0; this.dlg = q ? new DialogUI(speaker, [q], look, null) : null; if (this.dlg) this.dlg.c = 9999; }
  update() {
    if (Input.nav('up')) { this.i = (this.i + this.opts.length - 1) % this.opts.length; Sfx.play('select'); }
    if (Input.nav('down')) { this.i = (this.i + 1) % this.opts.length; Sfx.play('select'); }
    if (Input.hit('a')) { Sfx.play('confirm'); UI.pop(this); this.res(this.i); }
    else if (Input.hit('b') || Input.hit('menu')) { Sfx.play('cancel'); UI.pop(this); this.res(-1); }
  }
  draw(ctx) {
    if (this.dlg) this.dlg.draw(ctx);
    let w = 0; for (const o of this.opts) w = Math.max(w, textW(ctx, o, 11)); w += 34;
    const h = this.opts.length * 17 + 12, x = VW - w - 12, y = (this.dlg ? VH - 82 : VH / 2 + h / 2) - h;
    drawBox(ctx, x, y, w, h);
    this.opts.forEach((o, i) => {
      if (i === this.i) { ctx.fillStyle = 'rgba(200,140,60,0.25)'; ctx.fillRect(x + 6, y + 6 + i * 17, w - 12, 16); drawText(ctx, '▶', x + 9, y + 9 + i * 17, '#c0602a', 9); }
      drawText(ctx, o, x + 22, y + 8 + i * 17, '#3a2a1a', 11);
    });
  }
}
class BigMsgUI {
  constructor(title, sub, icon, res) { this.title = title; this.sub = sub; this.icon = icon; this.res = res; this.t = 0; Sfx.play('item'); }
  update(dt) { this.t += dt; if (this.t > 0.5 && (Input.hit('a') || Input.hit('b'))) { UI.pop(this); this.res && this.res(); } }
  draw(ctx) {
    ctx.fillStyle = 'rgba(0,0,0,0.4)'; ctx.fillRect(0, 0, VW, VH);
    const w = 280, h = this.sub ? 92 : 74, x = (VW - w) / 2, y = 70;
    drawBox(ctx, x, y, w, h);
    if (this.icon) { const ic = getIcon(ITEMS[this.icon] || { id: '_' + this.icon, icon: this.icon, color: '#ffd040' }); const s = 1 + Math.min(1, this.t * 4); ctx.drawImage(ic, x + w / 2 - 8 * s * 1.5, y + 8, 24 * s / 1.5 * 1.5, 24 * s / 1.5 * 1.5); }
    drawText(ctx, this.title, x + w / 2, y + (this.icon ? 44 : 22), '#7a3a10', 13, 'center', false, true);
    if (this.sub) drawText(ctx, this.sub, x + w / 2, y + (this.icon ? 64 : 44), '#5a4a3a', 10, 'center');
  }
}

// ============ 通用列表菜单 ============
function navList(st, n, cols) {
  cols = cols || 1;
  if (n <= 0) return;
  if (Input.nav('down')) { st.i = Math.min(n - 1, st.i + cols); Sfx.play('select'); }
  if (Input.nav('up')) { st.i = Math.max(0, st.i - cols); Sfx.play('select'); }
  if (cols > 1) {
    if (Input.nav('right')) { st.i = Math.min(n - 1, st.i + 1); Sfx.play('select'); }
    if (Input.nav('left')) { st.i = Math.max(0, st.i - 1); Sfx.play('select'); }
  }
  st.i = clamp(st.i, 0, n - 1);
}
function drawSlot(ctx, x, y, slot, sel, size) {
  size = size || 20;
  ctx.fillStyle = sel ? '#ffe8a0' : '#e8d4a8'; ctx.fillRect(x, y, size, size);
  ctx.strokeStyle = sel ? '#d0602a' : '#b08a50'; ctx.lineWidth = sel ? 2 : 1; ctx.strokeRect(x + 0.5, y + 0.5, size - 1, size - 1); ctx.lineWidth = 1;
  if (slot) {
    const ic = getIcon(ITEMS[slot.id]);
    const s = size - 4; ctx.drawImage(ic, x + 2, y + 2, s, s);
    if (slot.n > 1 || ITEMS[slot.id].type === 'ammo') drawText(ctx, String(slot.n), x + size - 2, y + size - 9, '#fff', 7, 'right', '#000', true);
  }
}
function drawHeart(ctx, x, y, fill) {
  const pts = ['.kk.kk.', 'kaakaak', 'kaaaaak', '.kaaak.', '..kak..', '...k...'];
  for (let j = 0; j < pts.length; j++) for (let i = 0; i < 7; i++) {
    const c = pts[j][i]; if (c === '.') continue;
    let col = '#2a1018';
    if (c === 'a') col = (fill >= 1 || (fill > 0 && i < 4)) ? (j === 1 && i === 1 ? '#ffb0c0' : '#f03050') : '#5a3038';
    ctx.fillStyle = col; ctx.fillRect(x + i, y + j, 1, 1);
  }
}

// ============ HUD ============
function drawHUD(ctx) {
  // 生命
  const hearts = S.maxhp / 2;
  for (let i = 0; i < hearts; i++) { const v = clamp(S.hp / 2 - i, 0, 1); drawHeart(ctx, 6 + (i % 10) * 8, 6 + Math.floor(i / 10) * 7, v >= 1 ? 1 : v > 0 ? 0.5 : 0); }
  let hy = 14 + Math.floor((hearts - 1) / 10) * 7;
  // 首发灵兽
  const lead = S.party[0];
  if (lead) {
    drawBox(ctx, 4, hy, 76, 18, 'dark');
    drawMonLook(ctx, SPECIES[lead.sp].look, 5, hy + 1, 1);
    drawText(ctx, 'Lv' + lead.lv, 22, hy + 2, '#fff', 7);
    drawBar(ctx, 22, hy + 11, 54, 3, lead.hp / lead.maxhp, lead.hp / lead.maxhp > 0.5 ? '#50d050' : lead.hp / lead.maxhp > 0.2 ? '#e8c020' : '#e04040');
    hy += 20;
  }
  // 地下城信息
  if (G.map.isDungeon) {
    const d = dngState(G.map.dng);
    drawBox(ctx, 4, hy, 76, 16, 'dark');
    ctx.drawImage(getIcon(ITEMS.key), 6, hy + 1, 14, 14); drawText(ctx, '×' + d.keys, 20, hy + 4, '#fff', 8);
    if (d.bossKey) ctx.drawImage(getIcon(ITEMS.bosskey), 40, hy + 1, 14, 14);
    hy += 18;
    drawMinimap(ctx);
  }
  // 时钟
  const bx = VW - 92, by = 4;
  drawBox(ctx, bx, by, 88, 44, 'dark');
  drawText(ctx, `${SEASONS[S.season]}季 ${S.day}日 (${weekDay()})`, bx + 44, by + 4, '#ffe8a0', 9, 'center', false, true);
  drawText(ctx, clockStr() + '  ' + (S.weather === 'rain' ? '雨' : S.time > 19 * 60 ? '夜' : '晴'), bx + 44, by + 16, '#fff', 10, 'center', false, true);
  drawText(ctx, S.gold.toLocaleString() + ' G', bx + 82, by + 30, '#ffd84a', 9, 'right', false, true);
  ctx.drawImage(getIcon({ id: '_coin', icon: 'coin', color: '#ffd030' }), bx + 4, by + 28, 12, 12);
  // 体力
  const ex = VW - 14, ey = VH - 92, eh = 70;
  drawBox(ctx, ex - 3, ey - 12, 13, eh + 15, 'dark');
  drawText(ctx, 'E', ex + 3.5, ey - 10, '#ffe8a0', 7, 'center', false, true);
  const f = S.energy / S.maxEnergy;
  ctx.fillStyle = '#2a2030'; ctx.fillRect(ex, ey, 7, eh);
  ctx.fillStyle = f > 0.5 ? '#50d050' : f > 0.2 ? '#e8c020' : '#e04040';
  ctx.fillRect(ex, ey + eh * (1 - f), 7, eh * f);
  // 快捷栏
  const n = 10, sz = 20, gap = 2, tw = n * (sz + gap) - gap, hx = (VW - tw) / 2;
  const pScreenY = G.player ? G.player.y - G.cam.y : 0;
  if (G.hotTop == null) G.hotTop = false;
  if (pScreenY > VH - 80) G.hotTop = true; else if (pScreenY < VH - 110) G.hotTop = false;
  const hy2 = G.hotTop ? 6 : VH - sz - 5;
  drawBox(ctx, hx - 4, hy2 - 4, tw + 8, sz + 8, 'dark');
  for (let i = 0; i < n; i++) {
    const x = hx + i * (sz + gap);
    drawSlot(ctx, x, hy2, S.inv[i], i === S.sel, sz);
    drawText(ctx, String((i + 1) % 10), x + 2, hy2 + 1, 'rgba(60,40,20,0.6)', 6);
    const s = S.inv[i];
    if (s && s.id === 'can') drawBar(ctx, x + 2, hy2 + sz - 4, sz - 4, 2, S.water / canMax(), '#4aa0f0');
  }
  const si = selItem();
  if (si && G.selShow !== S.sel + si.id) { G.selShow = S.sel + si.id; G.selT = 1.5; }
  if (G.selT > 0 && si && !G.hotTop) { const lvl = { hoe: S.toolLv.hoe, can: S.toolLv.can, pick: S.toolLv.pick, axe: S.toolLv.axe }[si.id]; const nm = (lvl ? TOOL_LV_NAME[lvl] : '') + si.name; drawText(ctx, nm, VW / 2, hy2 - 16, '#fff', 9, 'center', '#000', true); }
  // 提示
  for (let i = 0; i < G.toasts.length; i++) {
    const t = G.toasts[i];
    const y = VH - 60 - (G.toasts.length - i) * 17;
    ctx.globalAlpha = clamp(t.t, 0, 1);
    const w = textW(ctx, t.text, 9) + (t.icon ? 26 : 12);
    drawBox(ctx, 6, y, w, 15, 'dark');
    if (t.icon) ctx.drawImage(getIcon(ITEMS[t.icon]), 9, y + 1, 13, 13);
    drawText(ctx, t.text, t.icon ? 24 : 12, y + 3, '#fff', 9);
    ctx.globalAlpha = 1;
  }
  // 地名横幅
  if (G.banner && G.banner.t > 0) {
    ctx.globalAlpha = clamp(G.banner.t, 0, 1);
    const w = textW(ctx, G.banner.text, 13, true) + 40;
    drawBox(ctx, (VW - w) / 2, 52, w, 24, 'dark');
    drawText(ctx, G.banner.text, VW / 2, 57, '#ffe8a0', 13, 'center', false, true);
    ctx.globalAlpha = 1;
  }
}
function drawMinimap(ctx) {
  const m = G.map; const d = dngState(m.dng);
  const cs = 6, x0 = VW - 92, y0 = 52;
  drawBox(ctx, x0, y0, m.gridW * cs + 8, m.gridH * cs + 8, 'dark');
  for (const k in m.rooms) {
    const r = m.rooms[k];
    if (!d.visited[k]) continue;
    const x = x0 + 4 + r.gx * cs, y = y0 + 4 + r.gy * cs;
    ctx.fillStyle = k === G.curRoomKey ? '#ffe060' : r.kind === 'boss' ? '#c04040' : '#8a9ab8';
    ctx.fillRect(x, y, cs - 1, cs - 1);
  }
}

// ============ 暂停菜单 ============
const MENU_TABS = ['背包', '灵兽', '图鉴', '任务', '制作', '系统'];
class MenuUI {
  constructor(tab) { this.tab = tab || 0; this.st = {}; MENU_TABS.forEach((_, i) => this.st[i] = { i: 0 }); this.mode = null; this.moveFrom = -1; Sfx.play('confirm'); }
  update(dt) {
    if (this.sub) return;
    if (Input.hit('prev')) { this.tab = (this.tab + 5) % 6; Sfx.play('select'); this.mode = null; }
    if (Input.hit('next')) { this.tab = (this.tab + 1) % 6; Sfx.play('select'); this.mode = null; }
    if (Input.hit('menu') || (Input.hit('b') && this.moveFrom < 0)) { UI.pop(this); Sfx.play('cancel'); return; }
    const st = this.st[this.tab];
    if (this.tab === 0) this.updInv(st);
    else if (this.tab === 1) this.updParty(st);
    else if (this.tab === 2) navList(st, DEX_ORDER.length, 10);
    else if (this.tab === 3) { }
    else if (this.tab === 4) this.updCraft(st);
    else if (this.tab === 5) this.updSys(st);
  }
  updInv(st) {
    navList(st, INV_SIZE, 10);
    if (Input.hit('b') && this.moveFrom >= 0) { this.moveFrom = -1; Sfx.play('cancel'); return; }
    if (!Input.hit('a')) return;
    if (this.moveFrom >= 0) { const a = S.inv[this.moveFrom]; S.inv[this.moveFrom] = S.inv[st.i]; S.inv[st.i] = a; this.moveFrom = -1; Sfx.play('confirm'); return; }
    const slot = S.inv[st.i]; if (!slot) return;
    const it = ITEMS[slot.id];
    const opts = ['移动']; const acts = ['move'];
    if (it.type === 'potion') { opts.unshift('给灵兽使用'); acts.unshift('mon'); }
    if ((it.energy || it.edible) && it.type !== 'potion') { opts.unshift('吃掉'); acts.unshift('eat'); }
    if (it.id === 'letter') { opts.unshift('阅读'); acts.unshift('read'); }
    if (it.type !== 'tool' && it.type !== 'key') { opts.push('丢弃'); acts.push('drop'); }
    opts.push('取消'); acts.push('x');
    this.sub = true;
    ask(null, opts).then(async c => {
      const a = acts[c];
      if (a === 'move') this.moveFrom = st.i;
      else if (a === 'eat') { removeItem(it.id, 1); const en = it.energy || it.edible, hp = it.hp != null ? it.hp : (it.edible >= 40 ? 2 : it.edible >= 25 ? 1 : 0); S.energy = Math.min(S.maxEnergy, S.energy + en); S.hp = Math.min(S.maxhp, S.hp + hp); Sfx.play('heal'); toast(`体力 +${en}`); }
      else if (a === 'mon') { const i = await pickMon('给哪只灵兽使用？'); if (i >= 0) useItemOnMon(it.id, S.party[i]); }
      else if (a === 'read') await say(null, LETTER_TEXT);
      else if (a === 'drop') { const c2 = await ask(`确定丢弃 ${it.name}×${slot.n} 吗？`, ['丢弃', '取消']); if (c2 === 0) S.inv[st.i] = null; }
      this.sub = false; Input.clear();
    });
  }
  updParty(st) {
    navList(st, S.party.length);
    if (!Input.hit('a') || !S.party.length) return;
    const mon = S.party[st.i];
    this.sub = true;
    ask(monName(mon), ['设为首发', '使用道具', '起昵称', '取消']).then(async c => {
      if (c === 0) { S.party.splice(st.i, 1); S.party.unshift(mon); st.i = 0; Sfx.play('confirm'); }
      else if (c === 1) { const id = await pickItem(it => it.type === 'potion', '使用哪个道具？'); if (id) useItemOnMon(id, mon); }
      else if (c === 2) { const nn = window.prompt('给' + SPECIES[mon.sp].name + '起个名字：', monName(mon)); if (nn && nn.trim()) mon.nick = nn.trim().slice(0, 8); Input.held = {}; }
      this.sub = false; Input.clear();
    });
  }
  updCraft(st) {
    const list = RECIPES.filter(r => !r.req || S.flags[r.req]);
    navList(st, list.length);
    if (!Input.hit('a') || !list.length) return;
    const r = list[st.i];
    for (const k in r.need) if (countItem(k) < r.need[k]) { toast('材料不足'); Sfx.play('cancel'); return; }
    for (const k in r.need) removeItem(k, r.need[k]);
    if (!addItem(r.id, r.n)) { for (const k in r.need) addItem(k, r.need[k]); toast('背包满了'); return; }
    Sfx.play('harvest'); toastItem(r.id, r.n);
  }
  updSys(st) {
    const opts = this.sysOpts();
    navList(st, opts.length);
    if (!Input.hit('a')) return;
    const o = opts[st.i][1];
    this.sub = true;
    (async () => {
      if (o === 'save') { if (G.map.isDungeon || G.map.mine) await say(null, ['在地下城/矿洞里时，存档会记录为你最后所在的地面位置。']); saveGame(); }
      else if (o === 'export') { const code = exportSave(); try { await navigator.clipboard.writeText(code); toast('存档码已复制到剪贴板'); } catch (e) { window.prompt('复制下面的存档码保存好：', code); } Input.held = {}; }
      else if (o === 'import') { const code = window.prompt('粘贴存档码：'); Input.held = {}; if (code) { if (importSave(code)) { await say(null, ['导入成功！将重新载入游戏。']); location.reload(); } else await say(null, ['存档码无效。']); } }
      else if (o === 'mute') { const m = Sfx.toggle(); toast(m ? '声音：关' : '声音：开'); }
      else if (o === 'help') await say('操作说明', HELP_TEXT);
      else if (o === 'title') { const c = await ask('返回标题画面？未保存的进度会丢失。', ['返回', '取消']); if (c === 0) location.reload(); }
      else if (o === 'full') toggleFullscreen();
      this.sub = false; Input.clear();
    })();
  }
  sysOpts() { return [['保存游戏', 'save'], ['导出存档码（备份）', 'export'], ['导入存档码', 'import'], ['声音开/关 (M)', 'mute'], ['全屏 (F)', 'full'], ['操作说明', 'help'], ['返回标题', 'title']]; }
  draw(ctx) {
    ctx.fillStyle = 'rgba(0,0,0,0.45)'; ctx.fillRect(0, 0, VW, VH);
    const X = 12, Y = 22, W = VW - 24, H = VH - 30;
    drawBox(ctx, X, Y, W, H);
    MENU_TABS.forEach((t, i) => {
      const tw = 56, tx = X + 8 + i * (tw + 3), ty = 4;
      drawBox(ctx, tx, ty, tw, 22, i === this.tab ? undefined : 'dark');
      drawText(ctx, t, tx + tw / 2, ty + 6, i === this.tab ? '#7a3a10' : '#c8b8e0', 10, 'center', false, true);
    });
    drawText(ctx, 'Q/E 切换', VW - 16, 10, '#fff', 8, 'right', '#000');
    const st = this.st[this.tab];
    ctx.save(); ctx.translate(X, Y);
    [this.drawInv, this.drawParty, this.drawDex, this.drawQuest, this.drawCraft, this.drawSys][this.tab].call(this, ctx, st, W, H);
    ctx.restore();
  }
  drawInv(ctx, st, W, H) {
    const sz = 26, gap = 3, x0 = 14, y0 = 14;
    drawText(ctx, '快捷栏 (1-0)', x0, y0 - 2, '#8a6a4a', 8);
    for (let i = 0; i < INV_SIZE; i++) {
      const cx = i % 10, cy = Math.floor(i / 10);
      const x = x0 + cx * (sz + gap), y = y0 + 9 + cy * (sz + gap) + (cy > 0 ? 6 : 0);
      drawSlot(ctx, x, y, S.inv[i], i === st.i, sz);
      if (i === this.moveFrom) { ctx.strokeStyle = '#3a8ae0'; ctx.lineWidth = 2; ctx.strokeRect(x + 1, y + 1, sz - 2, sz - 2); ctx.lineWidth = 1; }
    }
    const slot = S.inv[st.i];
    const by = y0 + 9 + 3 * (sz + gap) + 14;
    ctx.fillStyle = '#efdcb0'; ctx.fillRect(10, by, W - 20, H - by - 10);
    if (slot) {
      const it = ITEMS[slot.id];
      ctx.drawImage(getIcon(it), 16, by + 6, 32, 32);
      drawText(ctx, it.name + (slot.n > 1 ? ' ×' + slot.n : ''), 56, by + 6, '#5a2a10', 12, 'left', false, true);
      wrapText(ctx, it.desc || '', W - 90, 9).forEach((l, i) => drawText(ctx, l, 56, by + 23 + i * 12, '#4a3a2a', 9));
      if (it.sell) drawText(ctx, '售价 ' + it.sell + 'G', W - 18, by + 8, '#8a6a20', 9, 'right');
    }
    // 右侧信息
    const ix = x0 + 10 * (sz + gap) + 8;
    drawText(ctx, '装备', ix, y0, '#8a6a4a', 9, 'left', false, true);
    const lines = [
      '剑：' + SWORD_NAME[S.swordLv],
      '锄头：' + TOOL_LV_NAME[S.toolLv.hoe], '水壶：' + TOOL_LV_NAME[S.toolLv.can],
      '镐子：' + TOOL_LV_NAME[S.toolLv.pick], '斧头：' + TOOL_LV_NAME[S.toolLv.axe],
      '游泳：' + (S.flags.fins ? '✔' : '✘'),
    ];
    lines.forEach((l, i) => drawText(ctx, l, ix, y0 + 14 + i * 12, '#4a3a2a', 9));
    drawText(ctx, this.moveFrom >= 0 ? '选择要交换的位置' : 'J:操作  K:返回', W - 14, H - 18, '#8a6a4a', 8, 'right');
  }
  drawParty(ctx, st, W, H) {
    if (!S.party.length) { drawText(ctx, '还没有灵兽。去晨星村的灵兽研究所看看吧！', W / 2, H / 2 - 10, '#6a4a2a', 11, 'center'); return; }
    S.party.forEach((m, i) => {
      const y = 10 + i * 34, sel = i === st.i;
      ctx.fillStyle = sel ? '#ffe8a0' : '#efdcb0'; ctx.fillRect(10, y, 190, 31);
      if (sel) { ctx.strokeStyle = '#d0602a'; ctx.strokeRect(10.5, y + 0.5, 189, 30); }
      drawMonLook(ctx, SPECIES[m.sp].look, 14, y + 3, 1.5);
      drawText(ctx, monName(m), 42, y + 3, '#3a2a1a', 10, 'left', false, true);
      drawText(ctx, 'Lv' + m.lv, 196, y + 3, '#3a2a1a', 9, 'right');
      drawBar(ctx, 42, y + 18, 110, 5, m.hp / m.maxhp, m.hp / m.maxhp > 0.5 ? '#50c050' : m.hp / m.maxhp > 0.2 ? '#e0b020' : '#e04040');
      drawText(ctx, m.hp + '/' + m.maxhp, 196, y + 16, '#3a2a1a', 8, 'right');
      if (m.status) drawText(ctx, STATUS_NAME[m.status], 42, y + 23, '#c04040', 7);
      if (m.hp <= 0) drawText(ctx, '昏厥', 160, y + 3, '#c04040', 8);
    });
    const m = S.party[st.i]; if (!m) return;
    const sp = SPECIES[m.sp]; const x = 212;
    ctx.fillStyle = '#efdcb0'; ctx.fillRect(x, 10, W - x - 10, H - 20);
    drawMonLook(ctx, sp.look, x + 6, 14, 3);
    drawText(ctx, monName(m), x + 60, 16, '#3a2a1a', 12, 'left', false, true);
    drawText(ctx, sp.name + '  No.' + String(DEX_ORDER.indexOf(m.sp) + 1).padStart(3, '0'), x + 60, 32, '#6a5a4a', 8);
    sp.types.forEach((t, i) => { ctx.fillStyle = TYPE_COLOR[t]; ctx.fillRect(x + 60 + i * 30, 44, 27, 11); drawText(ctx, TYPE_NAME[t], x + 73.5 + i * 30, 45, '#fff', 8, 'center', '#000'); });
    const stx = [['体力', m.maxhp], ['攻击', m.atk], ['防御', m.def], ['速度', m.spd]];
    stx.forEach((s, i) => drawText(ctx, s[0] + ' ' + s[1], x + 8 + (i % 2) * 80, 66 + Math.floor(i / 2) * 12, '#3a2a1a', 9));
    const nx = xpFor(m.lv + 1), px = xpFor(m.lv);
    drawText(ctx, '经验', x + 8, 92, '#3a2a1a', 8); drawBar(ctx, x + 32, 95, 120, 3, (m.xp - px) / (nx - px), '#4a9ae8');
    m.moves.forEach((mv, i) => {
      const M = MOVES[mv]; const yy = 106 + i * 18;
      ctx.fillStyle = TYPE_COLOR[M.type]; ctx.fillRect(x + 8, yy, 4, 14);
      drawText(ctx, M.name, x + 16, yy + 2, '#3a2a1a', 10);
      drawText(ctx, (M.pow ? '威力' + M.pow : '变化') + ' 命中' + M.acc, x + 160, yy + 3, '#6a5a4a', 8, 'right');
    });
    if (sp.evo) drawText(ctx, `Lv${sp.evo[0]} 进化`, x + 8, H - 34, '#8a6a4a', 8);
  }
  drawDex(ctx, st, W, H) {
    const seen = Object.keys(S.dex.seen).length, caught = Object.keys(S.dex.caught).length;
    drawText(ctx, `见过 ${seen}   收服 ${caught} / ${DEX_ORDER.length}`, 14, 6, '#5a3a1a', 10, 'left', false, true);
    const sz = 22, gap = 2;
    DEX_ORDER.forEach((id, i) => {
      const x = 14 + (i % 10) * (sz + gap), y = 22 + Math.floor(i / 10) * (sz + gap);
      ctx.fillStyle = i === st.i ? '#ffe8a0' : '#e8d4a8'; ctx.fillRect(x, y, sz, sz);
      if (i === st.i) { ctx.strokeStyle = '#d0602a'; ctx.strokeRect(x + 0.5, y + 0.5, sz - 1, sz - 1); }
      if (S.dex.caught[id]) drawMonLook(ctx, SPECIES[id].look, x + 3, y + 3, 1);
      else if (S.dex.seen[id]) ctx.drawImage(silhouette(getMonSprite(SPECIES[id].look), '#5a4a3a'), x + 3, y + 3);
      else drawText(ctx, '?', x + sz / 2, y + 6, '#b09a70', 9, 'center');
    });
    const id = DEX_ORDER[st.i], sp = SPECIES[id]; const x = 262;
    ctx.fillStyle = '#efdcb0'; ctx.fillRect(x, 20, W - x - 10, H - 30);
    drawText(ctx, 'No.' + String(st.i + 1).padStart(3, '0'), x + 6, 24, '#8a6a4a', 9);
    if (S.dex.seen[id]) {
      if (S.dex.caught[id]) drawMonLook(ctx, sp.look, x + 55, 36, 4); else ctx.drawImage(silhouette(getMonSprite(sp.look), '#5a4a3a'), x + 55, 36, 64, 64);
      drawText(ctx, sp.name, x + (W - x - 10) / 2, 104, '#3a2a1a', 12, 'center', false, true);
      sp.types.forEach((t, i) => { ctx.fillStyle = TYPE_COLOR[t]; ctx.fillRect(x + 50 + i * 32, 120, 29, 11); drawText(ctx, TYPE_NAME[t], x + 64.5 + i * 32, 121, '#fff', 8, 'center', '#000'); });
      if (S.dex.caught[id]) wrapText(ctx, sp.desc, W - x - 22, 9).forEach((l, i) => drawText(ctx, l, x + 6, 138 + i * 12, '#4a3a2a', 9));
      else drawText(ctx, '（收服后可查看详情）', x + 6, 140, '#8a7a6a', 9);
    } else drawText(ctx, '？？？', x + (W - x - 10) / 2, 90, '#8a7a6a', 12, 'center');
  }
  drawQuest(ctx, st, W, H) {
    drawText(ctx, '◆ 当前目标', 14, 8, '#7a3a10', 11, 'left', false, true);
    wrapText(ctx, goalText(), W - 40, 10).forEach((l, i) => drawText(ctx, l, 24, 26 + i * 13, '#3a2a1a', 10));
    drawText(ctx, '◆ 每日委托（村告示板）', 14, 58, '#7a3a10', 11, 'left', false, true);
    const r = S.request;
    if (r && !r.done) drawText(ctx, `${NPCS[r.who].name}：需要 ${ITEMS[r.id].name} ×${r.n}（拥有 ${countItem(r.id)}）  报酬 ${r.reward}G`, 24, 75, '#3a2a1a', 10);
    else drawText(ctx, r && r.done ? '今天的委托已完成！' : '去村告示板看看吧。', 24, 75, '#3a2a1a', 10);
    drawText(ctx, '◆ 元素水晶', 14, 94, '#7a3a10', 11, 'left', false, true);
    ['d1', 'd2', 'd3', 'd4'].forEach((d, i) => {
      const got = S.flags[d]; const col = ['#50d050', '#4a9ae8', '#f07030', '#a0e8ff'][i];
      ctx.drawImage(getIcon({ id: '_cr' + i + (got ? 1 : 0), icon: 'crystal', color: got ? col : '#6a6a6a' }), 24 + i * 60, 110, 20, 20);
      drawText(ctx, DUNGEONS[d].crystal.slice(0, 1) + (got ? '✔' : ''), 46 + i * 60, 116, '#3a2a1a', 9);
    });
    drawText(ctx, '◆ 记录', 14, 138, '#7a3a10', 11, 'left', false, true);
    const t = Math.floor(S.playTime / 60);
    const rec = [`游戏时间 ${Math.floor(t / 60)}小时${t % 60}分`, `收获作物 ${S.stats.harvest}`, `钓到鱼 ${S.stats.fish}`, `击败怪物 ${S.stats.kills}`, `灵兽对战胜利 ${S.stats.wins}`, `矿洞最深 ${S.mineMax}层`, `竞技场 ${S.arena}/8`, `累计收入 ${S.stats.earned}G`];
    rec.forEach((l, i) => drawText(ctx, l, 24 + (i % 2) * 130, 155 + Math.floor(i / 2) * 13, '#3a2a1a', 9));
    drawText(ctx, '◆ 好感度', 290, 138, '#7a3a10', 11, 'left', false, true);
    const ids = Object.keys(NPCS).filter(k => NPCS[k].gifts);
    ids.forEach((k, i) => {
      const f = S.friends[k]; const h = f ? Math.floor(f.pts / 100) : 0;
      const yy = 154 + i * 10;
      drawText(ctx, NPCS[k].name, 290, yy, '#3a2a1a', 8);
      for (let j = 0; j < 10; j++) drawText(ctx, j < h ? '♥' : '♡', 340 + j * 8, yy, j < h ? '#e04060' : '#b0a090', 8);
    });
  }
  drawCraft(ctx, st, W, H) {
    const list = RECIPES.filter(r => !r.req || S.flags[r.req]);
    drawText(ctx, '用材料制作道具（J 制作）', 14, 6, '#7a3a10', 10, 'left', false, true);
    list.forEach((r, i) => {
      const y = 22 + i * 19, sel = i === st.i;
      let ok = true; for (const k in r.need) if (countItem(k) < r.need[k]) ok = false;
      ctx.fillStyle = sel ? '#ffe8a0' : '#efdcb0'; ctx.fillRect(10, y, W - 20, 17);
      ctx.drawImage(getIcon(ITEMS[r.id]), 13, y + 1, 15, 15);
      drawText(ctx, ITEMS[r.id].name + (r.n > 1 ? ' ×' + r.n : ''), 32, y + 3, ok ? '#3a2a1a' : '#9a8a7a', 10);
      let nx = 160;
      for (const k in r.need) { const have = countItem(k); const txt = `${ITEMS[k].name} ${have}/${r.need[k]}`; drawText(ctx, txt, nx, y + 4, have >= r.need[k] ? '#3a7a2a' : '#c04040', 9); nx += textW(ctx, txt, 9) + 12; }
    });
  }
  drawSys(ctx, st, W, H) {
    const opts = this.sysOpts();
    opts.forEach((o, i) => {
      const y = 14 + i * 22, sel = i === st.i;
      ctx.fillStyle = sel ? '#ffe8a0' : '#efdcb0'; ctx.fillRect(W / 2 - 100, y, 200, 19);
      if (sel) drawText(ctx, '▶', W / 2 - 94, y + 4, '#c0602a', 9);
      drawText(ctx, o[0], W / 2, y + 4, '#3a2a1a', 10, 'center');
    });
    drawText(ctx, '存档保存在本浏览器中。睡觉时会自动存档。', W / 2, H - 30, '#8a6a4a', 9, 'center');
  }
}
const STATUS_NAME = { psn: '中毒', brn: '灼伤', par: '麻痹', slp: '睡眠' };
const HELP_TEXT = [
  '移动：方向键 / WASD\n攻击·调查·确定：J / 空格 / Z / 回车\n使用手中道具·取消：K / X',
  '切换道具：Q / E 或数字键 1-0\n打开菜单：I / Tab / Esc\n静音：M    全屏：F',
  '【农场】用锄头开垦→种下种子→每天浇水→成熟后面对作物按J收获。把东西放进出货箱，第二天早上就会卖出！',
  '【冒险】在草丛里会遇到野生灵兽。用灵球收服它们！地下城里用剑和道具解开谜题，打倒头目。',
  '【小贴士】晚上记得回家睡觉（会自动存档）。到了凌晨2点会累倒哦。',
];
function pickMon(title) {
  return new Promise(res => {
    UI.push(new PickMonUI(title, res));
  });
}
class PickMonUI {
  constructor(title, res) { this.title = title; this.res = res; this.st = { i: 0 }; }
  update() { navList(this.st, S.party.length); if (Input.hit('a')) { UI.pop(this); this.res(this.st.i); } else if (Input.hit('b') || Input.hit('menu')) { UI.pop(this); this.res(-1); } }
  draw(ctx) {
    const W = 230, H = S.party.length * 28 + 30, X = (VW - W) / 2, Y = (VH - H) / 2;
    drawBox(ctx, X, Y, W, H); drawText(ctx, this.title, X + W / 2, Y + 8, '#7a3a10', 10, 'center', false, true);
    S.party.forEach((m, i) => {
      const y = Y + 24 + i * 28; ctx.fillStyle = i === this.st.i ? '#ffe8a0' : '#efdcb0'; ctx.fillRect(X + 8, y, W - 16, 26);
      drawMonLook(ctx, SPECIES[m.sp].look, X + 12, y + 5, 1);
      drawText(ctx, monName(m) + ' Lv' + m.lv, X + 32, y + 3, '#3a2a1a', 10);
      drawBar(ctx, X + 32, y + 17, 100, 4, m.hp / m.maxhp, '#50c050'); drawText(ctx, m.hp + '/' + m.maxhp + (m.status ? ' ' + STATUS_NAME[m.status] : ''), X + 140, y + 14, '#3a2a1a', 8);
    });
  }
}
function pickItem(filter, title) { return new Promise(res => UI.push(new PickItemUI(filter, title, res))); }
class PickItemUI {
  constructor(filter, title, res) { this.list = S.inv.filter(s => s && filter(ITEMS[s.id])); this.title = title; this.res = res; this.st = { i: 0 }; }
  update() { navList(this.st, this.list.length); if (Input.hit('a') && this.list.length) { UI.pop(this); this.res(this.list[this.st.i].id); } else if (Input.hit('b') || Input.hit('menu') || (Input.hit('a') && !this.list.length)) { UI.pop(this); this.res(null); } }
  draw(ctx) {
    const W = 220, H = Math.max(1, this.list.length) * 18 + 32, X = (VW - W) / 2, Y = (VH - H) / 2;
    drawBox(ctx, X, Y, W, H); drawText(ctx, this.title, X + W / 2, Y + 8, '#7a3a10', 10, 'center', false, true);
    if (!this.list.length) drawText(ctx, '（没有可用的道具）', X + W / 2, Y + 26, '#8a7a6a', 9, 'center');
    this.list.forEach((s, i) => { const y = Y + 24 + i * 18; ctx.fillStyle = i === this.st.i ? '#ffe8a0' : '#efdcb0'; ctx.fillRect(X + 8, y, W - 16, 16); ctx.drawImage(getIcon(ITEMS[s.id]), X + 10, y, 16, 16); drawText(ctx, ITEMS[s.id].name + ' ×' + s.n, X + 30, y + 3, '#3a2a1a', 10); });
  }
}
function useItemOnMon(id, mon, inBattle) {
  const it = ITEMS[id];
  if (it.revive) { if (mon.hp > 0) { toast('它还没有昏厥。'); return false; } mon.hp = Math.floor(mon.maxhp * it.revive); }
  else if (it.cure) { if (!mon.status) { toast('没有效果。'); return false; } mon.status = null; }
  else if (it.heal) { if (mon.hp <= 0) { toast('昏厥的灵兽需要复活草。'); return false; } if (mon.hp >= mon.maxhp) { toast('体力已经是满的。'); return false; } mon.hp = Math.min(mon.maxhp, mon.hp + it.heal); }
  removeItem(id, 1); Sfx.play('heal'); if (!inBattle) toast(monName(mon) + '恢复了！');
  return true;
}

// ============ 商店 ============
function openShop(name, stock, buyMul) { return new Promise(res => UI.push(new ShopUI(name, stock, buyMul, res))); }
class ShopUI {
  constructor(name, stock, buyMul, res) { this.name = name; this.stock = stock; this.res = res; this.tab = 0; this.st = [{ i: 0 }, { i: 0 }]; this.sub = false; this.buyMul = buyMul || 1; }
  sellList() { return S.inv.map((s, i) => ({ s, i })).filter(o => o.s && ITEMS[o.s.id].sell > 0 && ITEMS[o.s.id].type !== 'tool'); }
  update() {
    if (this.sub) return;
    if (Input.nav('left') || Input.nav('right') || Input.hit('prev') || Input.hit('next')) { this.tab ^= 1; Sfx.play('select'); }
    if (Input.hit('b') || Input.hit('menu')) { UI.pop(this); this.res(); return; }
    const st = this.st[this.tab];
    if (this.tab === 0) {
      navList(st, this.stock.length);
      if (Input.hit('a')) {
        const id = this.stock[st.i]; const it = ITEMS[id]; const price = Math.round(it.price * this.buyMul);
        const max = Math.min(99, Math.floor(S.gold / price));
        if (max <= 0) { toast('钱不够！'); Sfx.play('cancel'); return; }
        this.sub = true;
        pickNumber(`买几个 ${it.name}？（${price}G/个）`, isStack(id) ? max : 1, price).then(n => {
          this.sub = false;
          if (n > 0) { if (addItem(id, n)) { S.gold -= price * n; Sfx.play('coin'); toastItem(id, n); } else toast('背包满了！'); }
        });
      }
    } else {
      const list = this.sellList();
      navList(st, list.length);
      if (Input.hit('a') && list.length) {
        const o = list[st.i]; const it = ITEMS[o.s.id];
        this.sub = true;
        pickNumber(`卖几个 ${it.name}？（${it.sell}G/个）`, o.s.n, it.sell).then(n => {
          this.sub = false;
          if (n > 0) { removeItem(it.id, n); S.gold += it.sell * n; S.stats.earned += it.sell * n; Sfx.play('coin'); }
        });
      }
    }
  }
  draw(ctx) {
    ctx.fillStyle = 'rgba(0,0,0,0.4)'; ctx.fillRect(0, 0, VW, VH);
    const X = 40, Y = 18, W = VW - 80, H = VH - 36;
    drawBox(ctx, X, Y, W, H);
    drawText(ctx, this.name, X + 14, Y + 9, '#7a3a10', 12, 'left', false, true);
    ['购买', '出售'].forEach((t, i) => { const tx = X + W - 130 + i * 60; drawBox(ctx, tx, Y + 6, 54, 18, i === this.tab ? undefined : 'dark'); drawText(ctx, t, tx + 27, Y + 10, i === this.tab ? '#7a3a10' : '#c8b8e0', 10, 'center', false, true); });
    drawText(ctx, '持有：' + S.gold.toLocaleString() + 'G', X + W - 14, Y + H - 18, '#8a6a20', 10, 'right', false, true);
    const st = this.st[this.tab];
    const rows = 9; const top = Math.max(0, Math.min(st.i - 4, (this.tab ? this.sellList().length : this.stock.length) - rows));
    const list = this.tab === 0 ? this.stock.map(id => ({ id })) : this.sellList().map(o => ({ id: o.s.id, n: o.s.n }));
    if (!list.length) drawText(ctx, '没有可以出售的东西。', X + W / 2, Y + 80, '#8a7a6a', 10, 'center');
    list.slice(top, top + rows).forEach((o, k) => {
      const i = top + k, y = Y + 32 + k * 20, it = ITEMS[o.id];
      ctx.fillStyle = i === st.i ? '#ffe8a0' : '#efdcb0'; ctx.fillRect(X + 10, y, W - 150, 18);
      ctx.drawImage(getIcon(it), X + 13, y + 1, 16, 16);
      drawText(ctx, it.name + (o.n ? ' ×' + o.n : ''), X + 34, y + 4, '#3a2a1a', 10);
      const price = this.tab === 0 ? Math.round(it.price * this.buyMul) : it.sell;
      drawText(ctx, price + 'G', X + W - 146, y + 4, '#8a6a20', 10, 'right');
    });
    const cur = list[st.i];
    if (cur) { const it = ITEMS[cur.id]; wrapText(ctx, it.desc || '', 118, 9).forEach((l, i) => drawText(ctx, l, X + W - 128, Y + 36 + i * 12, '#4a3a2a', 9)); }
    drawText(ctx, '←→ 切换  J 确定  K 离开', X + 14, Y + H - 18, '#8a6a4a', 8);
  }
}
function pickNumber(title, max, unit) { return new Promise(res => UI.push(new NumberUI(title, max, unit, res))); }
class NumberUI {
  constructor(title, max, unit, res) { this.title = title; this.max = Math.max(1, max); this.n = 1; this.unit = unit; this.res = res; }
  update() {
    if (Input.nav('up') || Input.nav('right')) { this.n = this.n >= this.max ? 1 : this.n + 1; Sfx.play('select'); }
    if (Input.nav('down') || Input.nav('left')) { this.n = this.n <= 1 ? this.max : this.n - 1; Sfx.play('select'); }
    if (Input.hit('a')) { UI.pop(this); Sfx.play('confirm'); this.res(this.n); }
    else if (Input.hit('b') || Input.hit('menu')) { UI.pop(this); this.res(0); }
  }
  draw(ctx) {
    const W = 220, H = 64, X = (VW - W) / 2, Y = VH / 2 - 30;
    drawBox(ctx, X, Y, W, H);
    drawText(ctx, this.title, X + W / 2, Y + 9, '#5a3a1a', 10, 'center');
    drawText(ctx, '◀  ' + this.n + '  ▶', X + W / 2, Y + 26, '#3a2a1a', 13, 'center', false, true);
    if (this.unit) drawText(ctx, '合计 ' + this.n * this.unit + 'G', X + W / 2, Y + 45, '#8a6a20', 9, 'center');
  }
}

// ============ 出货箱 ============
function openShipBin() { return new Promise(res => UI.push(new ShipUI(res))); }
class ShipUI {
  constructor(res) { this.res = res; this.st = { i: 0 }; this.sub = false; }
  list() { return S.inv.map((s, i) => ({ s, i })).filter(o => o.s && ITEMS[o.s.id].sell > 0 && ITEMS[o.s.id].type !== 'tool'); }
  update() {
    if (this.sub) return;
    if (Input.hit('b') || Input.hit('menu')) { UI.pop(this); this.res(); return; }
    const l = this.list(); navList(this.st, l.length);
    if (Input.hit('a') && l.length) {
      const o = l[this.st.i]; const it = ITEMS[o.s.id];
      this.sub = true;
      pickNumber(`放入几个 ${it.name}？`, o.s.n, it.sell).then(n => {
        this.sub = false;
        if (n > 0) { removeItem(it.id, n); const ex = S.ship.find(x => x.id === it.id); if (ex) ex.n += n; else S.ship.push({ id: it.id, n }); Sfx.play('harvest'); }
      });
    }
  }
  draw(ctx) {
    ctx.fillStyle = 'rgba(0,0,0,0.4)'; ctx.fillRect(0, 0, VW, VH);
    const X = 50, Y = 20, W = VW - 100, H = VH - 40;
    drawBox(ctx, X, Y, W, H);
    drawText(ctx, '出货箱 —— 放进去的东西明天早上卖出', X + 14, Y + 9, '#7a3a10', 11, 'left', false, true);
    const l = this.list(); const rows = 8; const top = Math.max(0, Math.min(this.st.i - 3, l.length - rows));
    l.slice(top, top + rows).forEach((o, k) => {
      const i = top + k, y = Y + 30 + k * 20, it = ITEMS[o.s.id];
      ctx.fillStyle = i === this.st.i ? '#ffe8a0' : '#efdcb0'; ctx.fillRect(X + 10, y, W / 2 + 40, 18);
      ctx.drawImage(getIcon(it), X + 13, y + 1, 16, 16);
      drawText(ctx, it.name + ' ×' + o.s.n, X + 34, y + 4, '#3a2a1a', 10);
      drawText(ctx, it.sell + 'G', X + W / 2 + 46, y + 4, '#8a6a20', 9, 'right');
    });
    let tot = 0; S.ship.forEach(s => tot += ITEMS[s.id].sell * s.n);
    const rx = X + W / 2 + 60;
    drawText(ctx, '已放入：', rx, Y + 30, '#5a3a1a', 10, 'left', false, true);
    S.ship.slice(0, 9).forEach((s, i) => drawText(ctx, ITEMS[s.id].name + ' ×' + s.n, rx, Y + 46 + i * 13, '#3a2a1a', 9));
    drawText(ctx, '预计收入：' + tot + 'G', rx, Y + H - 30, '#8a6a20', 10, 'left', false, true);
    drawText(ctx, 'J 放入  K 关闭', X + 14, Y + H - 16, '#8a6a4a', 8);
  }
}

// ============ 灵兽电脑（寄存） ============
function openPC() { return new Promise(res => UI.push(new PCUI(res))); }
class PCUI {
  constructor(res) { this.res = res; this.side = 0; this.st = [{ i: 0 }, { i: 0 }]; }
  update() {
    if (Input.hit('b') || Input.hit('menu')) { UI.pop(this); this.res(); return; }
    if (Input.nav('left') || Input.nav('right')) { this.side ^= 1; Sfx.play('select'); }
    const arr = this.side ? S.box : S.party; const st = this.st[this.side];
    navList(st, arr.length, this.side ? 6 : 1);
    if (Input.hit('a') && arr.length) {
      if (this.side === 0) { if (S.party.length <= 1) { toast('队伍里至少要有一只灵兽。'); Sfx.play('cancel'); return; } const m = S.party.splice(st.i, 1)[0]; m.hp = m.maxhp; m.status = null; S.box.push(m); }
      else { if (S.party.length >= 6) { toast('队伍已满（最多6只）。'); Sfx.play('cancel'); return; } const m = S.box.splice(st.i, 1)[0]; m.hp = m.maxhp; S.party.push(m); }
      Sfx.play('confirm');
    }
  }
  draw(ctx) {
    ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillRect(0, 0, VW, VH);
    drawBox(ctx, 10, 10, VW - 20, VH - 20);
    drawText(ctx, '灵兽寄存系统  （←→ 切换  J 存入/取出）', 22, 18, '#7a3a10', 10, 'left', false, true);
    drawText(ctx, '队伍 ' + S.party.length + '/6', 22, 36, this.side === 0 ? '#c0602a' : '#6a5a4a', 10, 'left', false, true);
    S.party.forEach((m, i) => { const y = 52 + i * 30; const sel = this.side === 0 && i === this.st[0].i; ctx.fillStyle = sel ? '#ffe8a0' : '#efdcb0'; ctx.fillRect(20, y, 150, 27); drawMonLook(ctx, SPECIES[m.sp].look, 24, y + 2, 1.4); drawText(ctx, monName(m), 50, y + 3, '#3a2a1a', 10); drawText(ctx, 'Lv' + m.lv, 50, y + 15, '#6a5a4a', 8); });
    drawText(ctx, '寄存箱 ' + S.box.length, 190, 36, this.side === 1 ? '#c0602a' : '#6a5a4a', 10, 'left', false, true);
    const top = Math.max(0, Math.floor(this.st[1].i / 6) - 4) * 6;
    S.box.slice(top, top + 36).forEach((m, k) => {
      const i = top + k, x = 190 + (k % 6) * 44, y = 52 + Math.floor(k / 6) * 32; const sel = this.side === 1 && i === this.st[1].i;
      ctx.fillStyle = sel ? '#ffe8a0' : '#efdcb0'; ctx.fillRect(x, y, 41, 29); drawMonLook(ctx, SPECIES[m.sp].look, x + 2, y + 1, 1.2); drawText(ctx, 'Lv' + m.lv, x + 39, y + 19, '#3a2a1a', 7, 'right');
    });
    const arr = this.side ? S.box : S.party; const m = arr[this.st[this.side].i];
    if (m) drawText(ctx, `${monName(m)}  ${SPECIES[m.sp].types.map(t => TYPE_NAME[t]).join('/')}  HP${m.maxhp} 攻${m.atk} 防${m.def} 速${m.spd}`, 22, VH - 30, '#3a2a1a', 9);
  }
}

// ============ 铁匠 ============
function openSmith() { return new Promise(res => UI.push(new SmithUI(res))); }
class SmithUI {
  constructor(res) { this.res = res; this.st = { i: 0 }; }
  opts() {
    const o = [];
    const sl = S.swordLv;
    if (sl < 4) o.push({ name: SWORD_NAME[sl + 1], cur: SWORD_NAME[sl], cost: UPGRADE_COST[sl + 1], apply: () => S.swordLv++, desc: '攻击力 +1' });
    for (const [k, nm] of [['hoe', '锄头'], ['can', '水壶'], ['pick', '镐子'], ['axe', '斧头']]) {
      const lv = S.toolLv[k];
      if (lv < 4) o.push({ name: TOOL_LV_NAME[lv + 1] + nm, cur: (TOOL_LV_NAME[lv]) + nm, cost: UPGRADE_COST[lv + 1], apply: () => { S.toolLv[k]++; if (k === 'can') S.water = canMax(); }, desc: k === 'pick' ? '能敲碎更硬的矿石' : k === 'can' ? '容量增加，范围扩大' : '作用范围扩大' });
    }
    return o;
  }
  update() {
    if (Input.hit('b') || Input.hit('menu')) { UI.pop(this); this.res(); return; }
    const o = this.opts(); navList(this.st, o.length);
    if (Input.hit('a') && o.length) {
      const u = o[this.st.i], c = u.cost;
      if (S.gold < c.money || countItem(c.ore) < c.n) { toast('材料或金钱不足！'); Sfx.play('cancel'); return; }
      S.gold -= c.money; removeItem(c.ore, c.n); u.apply(); Sfx.play('levelup'); toast('升级成功：' + u.name);
      G.shake = 0.1;
    }
  }
  draw(ctx) {
    ctx.fillStyle = 'rgba(0,0,0,0.4)'; ctx.fillRect(0, 0, VW, VH);
    const X = 40, Y = 20, W = VW - 80, H = VH - 40;
    drawBox(ctx, X, Y, W, H);
    drawText(ctx, '大熊铁匠铺 —— 升级装备', X + 14, Y + 9, '#7a3a10', 12, 'left', false, true);
    const o = this.opts();
    if (!o.length) drawText(ctx, '你的装备已经是最强的了！', X + W / 2, Y + 80, '#5a3a1a', 11, 'center');
    o.forEach((u, i) => {
      const y = Y + 32 + i * 30; const c = u.cost; const ok = S.gold >= c.money && countItem(c.ore) >= c.n;
      ctx.fillStyle = i === this.st.i ? '#ffe8a0' : '#efdcb0'; ctx.fillRect(X + 10, y, W - 20, 27);
      drawText(ctx, u.cur + ' → ' + u.name, X + 16, y + 3, '#3a2a1a', 10, 'left', false, true);
      drawText(ctx, u.desc, X + 16, y + 15, '#6a5a4a', 8);
      drawText(ctx, `${ITEMS[c.ore].name} ${countItem(c.ore)}/${c.n}   ${c.money}G`, X + W - 16, y + 9, ok ? '#3a7a2a' : '#c04040', 10, 'right');
    });
    drawText(ctx, '持有：' + S.gold.toLocaleString() + 'G   J 升级  K 离开', X + 14, Y + H - 18, '#8a6a4a', 9);
  }
}

// ============ 钓鱼 ============
function startFishing(zoneOverride) {
  const zone = zoneOverride || G.map.fish || 'pond';
  UI.push(new FishingUI(zone));
}
function rollFish(zone) {
  const cands = Object.values(FISH).filter(f => f.zones.includes(zone) && (!f.seasons || f.seasons.includes(S.season)) && (!f.rain || S.weather === 'rain'));
  const rare = cands.filter(f => f.rare && Math.random() < f.rare);
  if (rare.length) return rare[0];
  const normal = cands.filter(f => !f.rare);
  if (!normal.length) return FISH.carp;
  return pick(normal);
}
class FishingUI {
  constructor(zone) { this.zone = zone; this.phase = 'cast'; this.t = 0.5; this.p = G.player; Sfx.play('swing'); }
  update(dt) {
    this.t -= dt;
    if (this.phase === 'cast') { if (this.t <= 0) { this.phase = 'wait'; this.t = rand(1.2, 4.5); Sfx.play('splash'); } }
    else if (this.phase === 'wait') {
      if (Input.hit('a') || Input.hit('b')) { this.end('收回了鱼线。'); return; }
      if (this.t <= 0) { this.phase = 'bite'; this.t = 0.9; Sfx.play('bite'); }
    } else if (this.phase === 'bite') {
      if (Input.hit('a')) { this.startReel(); return; }
      if (this.t <= 0) this.end('鱼跑掉了……');
    } else if (this.phase === 'reel') {
      const f = this.fish, d = f.diff / 100;
      // 鱼的移动
      this.ft -= dt;
      if (this.ft <= 0) { this.ft = rand(0.25, 1.1) * (1.2 - d); this.ftarget = clamp(this.fy + rand(-1, 1) * (0.25 + d * 0.6), 0.02, 0.98); }
      this.fy = lerp(this.fy, this.ftarget, dt * (1.5 + d * 4));
      // 玩家的条
      if (Input.held.a) this.bv += 2.6 * dt; else this.bv -= 2.2 * dt;
      this.bv = clamp(this.bv, -1.2, 1.2);
      this.by += this.bv * dt;
      if (this.by < 0) { this.by = 0; this.bv = Math.max(0, this.bv) * -0.3; }
      if (this.by > 1 - this.bh) { this.by = 1 - this.bh; this.bv = Math.min(0, this.bv) * -0.3; }
      const inZone = this.fy >= this.by && this.fy <= this.by + this.bh;
      this.prog += (inZone ? 0.28 : -0.2 - d * 0.05) * dt;
      if (this.prog >= 1) this.catch();
      else if (this.prog <= 0) this.end(this.fish.name + '逃跑了……');
    } else if (this.phase === 'done') { if (this.t <= 0 || Input.hit('a')) UI.pop(this); }
  }
  startReel() {
    this.phase = 'reel'; this.fish = rollFish(this.zone);
    this.fy = 0.5; this.ftarget = 0.5; this.ft = 0; this.by = 0.4; this.bv = 0; this.bh = 0.26 + S.toolLv.rod * 0.02; this.prog = 0.3;
    Sfx.play('confirm');
  }
  catch() {
    const f = this.fish;
    if (!addItem(f.id, 1)) { this.end('背包满了！鱼溜走了。'); return; }
    S.stats.fish++; Sfx.play('item'); this.phase = 'done'; this.t = 2.2; this.caught = f;
    if (f.id === 'legend') toast('传说之鱼！！');
  }
  end(msg) { toast(msg); UI.pop(this); }
  draw(ctx) {
    const p = this.p, cx = G.cam.x, cy = G.cam.y;
    const d = DIRS[p.dir];
    const bx = p.cx() - cx + d[0] * 30, by = p.cy() - cy + d[1] * 30;
    ctx.strokeStyle = 'rgba(255,255,255,0.8)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(p.cx() - cx + d[0] * 6, p.y - cy + 2); ctx.lineTo(bx, by + (this.phase === 'bite' ? Math.sin(G.t * 40) * 2 : 0)); ctx.stroke();
    ctx.fillStyle = '#ff4040'; ctx.fillRect(bx - 1.5, by - 1.5 + (this.phase === 'bite' ? 2 : Math.sin(G.t * 3)), 3, 3);
    if (this.phase === 'bite') { drawBox(ctx, p.x - cx + 2, p.y - cy - 20, 13, 14, 'dark'); drawText(ctx, '!', p.x - cx + 8.5, p.y - cy - 18, '#ffe060', 11, 'center', false, true); }
    if (this.phase === 'wait') drawText(ctx, '等待鱼上钩……', VW / 2, 60, '#fff', 10, 'center', '#000');
    if (this.phase === 'reel') {
      const X = p.x - cx + (p.x - cx > VW / 2 ? -60 : 40), Y = 40, H = 150;
      drawBox(ctx, X - 6, Y - 6, 44, H + 12, 'dark');
      ctx.fillStyle = '#2a4a7a'; ctx.fillRect(X, Y, 18, H);
      const by2 = Y + H * (1 - this.by - this.bh);
      ctx.fillStyle = 'rgba(100,230,100,0.85)'; ctx.fillRect(X + 1, by2, 16, H * this.bh);
      const fy = Y + H * (1 - this.fy);
      ctx.drawImage(getIcon(ITEMS[this.fish.id]), X + 1, fy - 8, 16, 16);
      ctx.fillStyle = '#1a1a2a'; ctx.fillRect(X + 24, Y, 8, H);
      ctx.fillStyle = this.prog > 0.6 ? '#50e050' : this.prog > 0.3 ? '#e8c020' : '#e04040'; ctx.fillRect(X + 24, Y + H * (1 - this.prog), 8, H * this.prog);
      drawText(ctx, '按住 J 让绿条上升，罩住鱼！', VW / 2, VH - 50, '#fff', 10, 'center', '#000', true);
    }
    if (this.phase === 'done' && this.caught) {
      drawBox(ctx, VW / 2 - 70, 50, 140, 50);
      ctx.drawImage(getIcon(ITEMS[this.caught.id]), VW / 2 - 60, 58, 32, 32);
      drawText(ctx, '钓到了 ' + this.caught.name + '！', VW / 2 + 16, 62, '#5a2a10', 11, 'center', false, true);
      drawText(ctx, this.caught.sell + 'G', VW / 2 + 16, 80, '#8a6a20', 9, 'center');
    }
  }
}

// ============ 标题画面 ============
class TitleUI {
  constructor() { this.i = 0; this.opts = []; this.t = 0; this.refresh(); }
  refresh() { this.opts = hasSave() ? [['继续游戏', 'cont'], ['新的游戏', 'new'], ['导入存档码', 'import'], ['操作说明', 'help']] : [['新的游戏', 'new'], ['导入存档码', 'import'], ['操作说明', 'help']]; }
  update(dt) {
    this.t += dt;
    if (this.busy) return;
    if (Input.nav('up')) { this.i = (this.i + this.opts.length - 1) % this.opts.length; Sfx.play('select'); }
    if (Input.nav('down')) { this.i = (this.i + 1) % this.opts.length; Sfx.play('select'); }
    if (Input.hit('a')) {
      Sfx.play('confirm'); const o = this.opts[this.i][1];
      this.busy = true;
      (async () => {
        if (o === 'cont') { const s = loadSave(); if (s) { UI.pop(this); startGame(s); return; } }
        else if (o === 'new') {
          if (hasSave()) { const c = await ask('开始新游戏会覆盖现有存档，确定吗？', ['确定', '取消']); if (c !== 0) { this.busy = false; return; } }
          UI.pop(this); UI.push(new CreateUI());
          return;
        }
        else if (o === 'import') { const code = window.prompt('粘贴存档码：'); Input.held = {}; if (code) { if (importSave(code)) { this.refresh(); toast('导入成功！'); } else toast('存档码无效'); } }
        else if (o === 'help') await say('操作说明', HELP_TEXT);
        this.busy = false;
      })();
    }
  }
  draw(ctx) {
    // 背景
    const g = ctx.createLinearGradient(0, 0, 0, VH); g.addColorStop(0, '#3a4a9a'); g.addColorStop(0.6, '#e8a0a0'); g.addColorStop(1, '#f8d0a0');
    ctx.fillStyle = g; ctx.fillRect(0, 0, VW, VH);
    for (let i = 0; i < 40; i++) { const x = (hash2(i, 1) * VW + this.t * 3 * (i % 3 + 1)) % VW, y = hash2(i, 2) * 120; ctx.fillStyle = 'rgba(255,255,255,' + (0.3 + 0.5 * Math.abs(Math.sin(this.t + i))) + ')'; ctx.fillRect(x, y, 1, 1); }
    // 远山与草地
    ctx.fillStyle = '#5a6aaa'; ctx.beginPath(); ctx.moveTo(0, 190); for (let x = 0; x <= VW; x += 20) ctx.lineTo(x, 160 + Math.sin(x * 0.02) * 20 + Math.sin(x * 0.07) * 8); ctx.lineTo(VW, VH); ctx.lineTo(0, VH); ctx.fill();
    ctx.fillStyle = '#5aa040'; ctx.fillRect(0, 205, VW, VH);
    for (let x = 0; x < VW; x += 16) { const id = TILE.GRASS; ctx.drawImage(getTileSprite(id, x % 4, 0, 'forest', null), x, 205); ctx.drawImage(getTileSprite(TILE.FIELD, x % 3, 0, 'forest', null), x, 221); ctx.drawImage(getTileSprite(id, (x + 1) % 4, 0, 'forest', null), x, 237); ctx.drawImage(getTileSprite(id, (x + 2) % 4, 0, 'forest', null), x, 253); }
    for (let i = 0; i < 8; i++) ctx.drawImage(getTileSprite(TILE.TREE, i % 4, 0, 'forest', 'grass'), 20 + i * 60 + (i % 2) * 10, 190 + (i % 2) * 4);
    // 角色和灵兽
    const bob = Math.sin(this.t * 3) * 2;
    ctx.save(); ctx.translate(VW / 2 - 24, 212); ctx.scale(2, 2);
    drawChar(ctx, { hair: '#6b3b1f', shirt: '#3c8c4a', pants: '#3a4a7a' }, 0, Math.floor(this.t * 3) % 2, 0, 0);
    ctx.restore();
    drawMonLook(ctx, SPECIES.sprig.look, VW / 2 + 16, 226 + bob, 1.5);
    drawMonLook(ctx, SPECIES.ember.look, VW / 2 - 60, 226 - bob, 1.5, true);
    drawMonLook(ctx, SPECIES.bubbo.look, VW / 2 + 44, 230 + bob, 1.5, false);
    // 标题
    drawText(ctx, '星屿物语', VW / 2 + 2, 30, 'rgba(40,20,60,0.6)', 38, 'center', false, true);
    drawText(ctx, '星屿物语', VW / 2, 28, '#fff4c0', 38, 'center', false, true);
    drawText(ctx, '～ 农场 · 灵兽 · 水晶传说 ～', VW / 2, 76, '#fff', 11, 'center', 'rgba(0,0,0,0.5)');
    const bw = 140, bh = this.opts.length * 20 + 12, bx = VW / 2 - bw / 2, by = 100;
    drawBox(ctx, bx, by, bw, bh);
    this.opts.forEach((o, i) => {
      if (i === this.i) { ctx.fillStyle = 'rgba(200,140,60,0.25)'; ctx.fillRect(bx + 6, by + 6 + i * 20, bw - 12, 19); drawText(ctx, '▶', bx + 14, by + 10 + i * 20, '#c0602a', 9); }
      drawText(ctx, o[0], VW / 2, by + 9 + i * 20, '#3a2a1a', 11, 'center');
    });
    drawText(ctx, '完全离线运行 · 方向键移动 · J 确定 · K 返回', VW / 2, VH - 12, 'rgba(255,255,255,0.8)', 8, 'center', '#000');
  }
}
const HAIRS = ['#6b3b1f', '#2a2a32', '#e8c060', '#c8502a', '#8a5ac0', '#f0f0f0', '#3a6ad0', '#e070a0'];
const SHIRTS = ['#3c8c4a', '#d04848', '#3a6ad0', '#e8a030', '#8a4ab0', '#e8e8e8', '#3ab0b0', '#e070a0'];
const PANTS = ['#3a4a7a', '#5a3a2a', '#2a2a32', '#6a6a7a', '#3a6a3a', '#8a2a2a'];
const SKINS = ['#f5cba7', '#e8b088', '#c88a5a', '#8a5a3a', '#fde0c8'];
class CreateUI {
  constructor() { this.row = 0; this.v = [0, 0, 0, 0]; this.name = '小星'; }
  look() { return { hair: HAIRS[this.v[0]], shirt: SHIRTS[this.v[1]], pants: PANTS[this.v[2]], skin: SKINS[this.v[3]] }; }
  update() {
    const rows = 6;
    if (Input.nav('up')) { this.row = (this.row + rows - 1) % rows; Sfx.play('select'); }
    if (Input.nav('down')) { this.row = (this.row + 1) % rows; Sfx.play('select'); }
    const lens = [HAIRS.length, SHIRTS.length, PANTS.length, SKINS.length];
    if (this.row >= 1 && this.row <= 4) {
      const k = this.row - 1;
      if (Input.nav('left')) { this.v[k] = (this.v[k] + lens[k] - 1) % lens[k]; Sfx.play('select'); }
      if (Input.nav('right')) { this.v[k] = (this.v[k] + 1) % lens[k]; Sfx.play('select'); }
    }
    if (Input.hit('a')) {
      if (this.row === 0) { const n = window.prompt('你的名字：', this.name); Input.held = {}; if (n && n.trim()) this.name = n.trim().slice(0, 8); }
      else if (this.row === 5) { Sfx.play('confirm'); UI.pop(this); const s = newState(this.name); s.look = this.look(); startGame(s, true); }
      else this.row = 5;
    }
    if (Input.hit('b')) { UI.pop(this); UI.push(new TitleUI()); }
  }
  draw(ctx) {
    ctx.fillStyle = '#2a2440'; ctx.fillRect(0, 0, VW, VH);
    drawBox(ctx, 60, 20, VW - 120, VH - 40);
    drawText(ctx, '创建角色', VW / 2, 30, '#7a3a10', 14, 'center', false, true);
    ctx.save(); ctx.translate(100, 80); ctx.scale(4, 4); drawChar(ctx, this.look(), Math.floor(G.t) % 4 === 1 ? 3 : Math.floor(G.t) % 4 === 3 ? 2 : 0, Math.floor(G.t * 4) % 2, 0, 0); ctx.restore();
    const labels = ['名字：' + this.name, '发色', '衣服', '裤子', '肤色', '开始冒险！'];
    labels.forEach((l, i) => {
      const y = 62 + i * 26; const sel = i === this.row;
      ctx.fillStyle = sel ? '#ffe8a0' : '#efdcb0'; ctx.fillRect(200, y, 200, 22);
      if (sel) drawText(ctx, '▶', 206, y + 6, '#c0602a', 9);
      drawText(ctx, l, 220, y + 5, '#3a2a1a', 11, 'left', false, i === 5);
      if (i >= 1 && i <= 4) {
        const arr = [HAIRS, SHIRTS, PANTS, SKINS][i - 1];
        drawText(ctx, '◀', 300, y + 5, '#8a6a4a', 10); ctx.fillStyle = arr[this.v[i - 1]]; ctx.fillRect(318, y + 4, 40, 14); ctx.strokeStyle = '#5a3a1a'; ctx.strokeRect(318.5, y + 4.5, 39, 13); drawText(ctx, '▶', 366, y + 5, '#8a6a4a', 10);
      }
    });
    drawText(ctx, '↑↓ 选择  ←→ 调整  J 确定', VW / 2, VH - 34, '#8a6a4a', 9, 'center');
  }
}
class CreditsUI {
  constructor(res) { this.res = res; this.t = 0; }
  update(dt) { this.t += dt; if (this.t > 4 && (Input.hit('a') || Input.hit('b'))) { UI.pop(this); this.res(); } }
  draw(ctx) {
    ctx.fillStyle = '#0a0818'; ctx.fillRect(0, 0, VW, VH);
    for (let i = 0; i < 80; i++) { ctx.fillStyle = 'rgba(255,255,255,' + Math.abs(Math.sin(this.t + i)) + ')'; ctx.fillRect(hash2(i, 5) * VW, hash2(i, 6) * VH, 1, 1); }
    const lines = ['～ 星屿物语 ～', '', '暗影散去，四颗水晶重新闪耀。', '星露岛又迎来了和平的日子。', '', '爷爷的农场在你手中焕发生机，', '灵兽们与你结下了深厚的羁绊。', '', '但冒险还没有结束——', '矿洞最深处，据说有星灵在等待……', '', '感谢游玩！', '（按 J 继续游戏）'];
    const off = Math.max(0, 200 - this.t * 30);
    lines.forEach((l, i) => drawText(ctx, l, VW / 2, 30 + i * 17 + off, i === 0 ? '#ffe8a0' : '#fff', i === 0 ? 16 : 11, 'center', false, i === 0));
  }
}
