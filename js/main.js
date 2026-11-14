'use strict';
// ============ 游戏主体 ============
const G = {
  ui: [], ents: [], toasts: [], t: 0, shake: 0, scriptLock: 0, fade: { a: 0, to: 0, sp: 1 }, cam: { x: 0, y: 0 },
  map: null, player: null, state: 'title', flash: 0, banner: null, shut: [], shutT: 0, curRoomKey: null, roomEntry: null, itemFlash: 0,
  locked() { return this.ui.length > 0 || this.scriptLock > 0 || !!(this.fade && this.fade.busy) || !!this.dead; },
};
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
let SCALE = 1;
function resize() {
  const dpr = window.devicePixelRatio || 1;
  const s = Math.min(window.innerWidth / VW, window.innerHeight / VH);
  canvas.style.width = Math.floor(VW * s) + 'px'; canvas.style.height = Math.floor(VH * s) + 'px';
  SCALE = Math.max(1, Math.round(s * dpr));
  canvas.width = VW * SCALE; canvas.height = VH * SCALE;
  ctx.imageSmoothingEnabled = false;
}
window.addEventListener('resize', resize);
function toggleFullscreen() { try { if (!document.fullscreenElement) document.documentElement.requestFullscreen(); else document.exitFullscreen(); } catch (e) { } }

// ============ 开始 ============
function startGame(state, isNew) {
  S = state;
  const fresh = newState(); for (const k in fresh) if (S[k] === undefined) S[k] = fresh[k];
  G.state = 'play';
  initMaps();
  G.player = new Player(0, 0);
  let id = S.map; if (!MAPDEF[id]) id = 'village';
  if (isNew) loadMap('home', 6 * TS, 4 * TS - 4, 0);
  else loadMap(id, S.px, S.py, S.dir);
  runScript(async () => {
    await fadeIn(0.8);
    if (isNew) {
      await say(NPCS.granny.name, ['早上好！今天可是村子一年一度的古树节呀。', '不过……守护古树最近好像没什么精神。', '长老在广场等你，快去看看吧！出门往右就是广场。'], NPCS.granny.look);
      toast('方向键移动，J 调查 / 对话');
    }
  });
}

// ============ 地图 ============
function loadMap(id, px, py, dir) {
  const m = getMap(id);
  G.map = m; applyMods(m);
  G.ents = []; G.shut = []; G.shutT = 0; G.curRoomKey = null; Particles.list = [];
  const p = G.player;
  p.x = px; p.y = py; if (dir != null) p.dir = dir;
  p.kb = null; p.atkT = 0; p.spinT = 0; p.charging = false; p.z = 0; p.vz = 0; p.hurtT = 0; p.safe = { x: px, y: py }; p.updHB();
  spawnMapEntities(m);
  updateCamera(true);
  Music.play(m.music);
  if (!m.isDungeon && !m.mini) { G.safeMap = id; G.safePos = { x: px, y: py }; G.safeTiny = S.tiny; S.visited[id] = 1; if (S.flags.gotLeaf) saveGame(true); }
  G.banner = { text: m.name + (m.isDungeon && dngState(m.dng).boss ? '（已完成）' : ''), t: 2 };
  G.warpCD = 0.35;
}
function spawnMapEntities(m) {
  for (const s of m.spawns) {
    if (s.type === 'enemy') G.ents.push(new Enemy(s.kind, s.x * TS, s.y * TS, s.room));
    else if (s.type === 'chest') G.ents.push(new Chest(s));
    else if (s.type === 'block') G.ents.push(new PushBlock(s));
    else if (s.type === 'boss') { if (!dngState(m.dng).boss) G.ents.push(new Boss(s.kind, s.x * TS, s.y * TS, s.room)); }
    else if (s.type === 'pickup') G.ents.push(new Pickup(s.x * TS, s.y * TS, s.item, 1, true));
  }
  for (const [kind, n] of m.enemies || []) for (let i = 0; i < n; i++) for (let tries = 0; tries < 40; tries++) {
    const x = randi(2, m.w - 3), y = randi(2, m.h - 3), t = TILES[tAt(m, x, y)];
    if (t.solid || t.water || t.pit || t.tall || t.door || t.shrink || m.warps[y * m.w + x]) continue;
    if (Math.hypot(x * TS - G.player.x, y * TS - G.player.y) < 110) continue;
    G.ents.push(new Enemy(kind, x * TS, y * TS)); break;
  }
  for (const n of npcsForMap(m.id)) G.ents.push(n);
  for (const c of OW_CHESTS[m.id] || []) G.ents.push(new Chest(c));
}
function edgeExit(side) {
  const m = G.map, ex = m.exits[side], p = G.player, tm = getMap(ex.to);
  let nx = p.x, ny = p.y;
  if (side === 'e') { nx = -p.hb.x + 1; ny = p.y + ex.off * TS; }
  if (side === 'w') { nx = tm.w * TS - p.hb.x - p.hb.w - 1; ny = p.y + ex.off * TS; }
  if (side === 'n') { ny = tm.h * TS - p.hb.y - p.hb.h - 1; nx = p.x + ex.off * TS; }
  if (side === 's') { ny = -p.hb.y + 1; nx = p.x + ex.off * TS; }
  runScript(async () => { await fadeOut(0.2); loadMap(ex.to, nx, ny, p.dir); await fadeIn(0.2); });
}
function useWarp(w) {
  if (G.warpCD > 0) return;
  const p = G.player, [tx, ty] = p.tilePos(), t = tileProps(tx, ty);
  const back = () => { p.y += 6; G.warpCD = 0.6; };
  if (t && t.tinyPass) {
    runScript(async () => { Sfx.play('door'); await fadeOut(0.3); const m = getMap(w.to); loadMap(w.to, m.start.x * TS - 8, m.start.y * TS - 12, 1); await fadeIn(0.3); });
    return;
  }
  if (S.tiny) { back(); toast('变小的样子进不去……先在发光的树桩上变回来吧。'); return; }
  if (DUNGEONS[w.to]) {
    if (!S.flags.gotSword) { back(); toast('里面很危险，先去拿一把剑吧。'); return; }
    runScript(async () => {
      await fadeOut(0.4);
      const m = getMap(w.to); loadMap(w.to, m.start.x * TS - 8, m.start.y * TS - 12, 1);
      await fadeIn(0.4);
      if (!dngState(w.to).entered) { dngState(w.to).entered = true; await say('小叶', [`这里就是${DUNGEONS[w.to].name}……光之果实就在最深处。`, '找到钥匙打开锁住的门，宝箱里会有新道具！'], LEAF_LOOK); }
    });
    return;
  }
  runScript(async () => {
    Sfx.play('door'); await fadeOut(0.25);
    const m = getMap(w.to); loadMap(w.to, m.mat.x * TS, (m.mat.y - 1) * TS - 4, 1);
    await fadeIn(0.25);
  });
}
function exitInterior() {
  if (G.warpCD > 0) return;
  const m = G.map, back = m.isDungeon ? DUNGEONS[m.dng].from : INTERIOR_BACK[m.id];
  if (!back) return;
  runScript(async () => { Sfx.play('door'); await fadeOut(0.25); loadMap(back.map, back.x * TS, back.y * TS - 4, 0); await fadeIn(0.25); });
}

// ============ 摄像机 / 地下城房间 ============
function updateCamera(snap, dt) {
  const m = G.map, p = G.player;
  let tx = p.cx() - VW / 2, ty = p.cy() - VH / 2;
  let bx = 0, by = 0, bw = m.w * TS, bh = m.h * TS;
  if (m.isDungeon) {
    const key = Math.floor(p.cx() / (RW * TS)) + ',' + Math.floor(p.cy() / (RH * TS));
    if (key !== G.curRoomKey && m.rooms[key]) onEnterRoom(m.rooms[key]);
    const r = m.rooms[G.curRoomKey];
    if (r) { bx = r.ox * TS; by = r.oy * TS; bw = RW * TS; bh = RH * TS; }
  }
  tx = bw <= VW ? bx + (bw - VW) / 2 : clamp(tx, bx, bx + bw - VW);
  ty = bh <= VH ? by + (bh - VH) / 2 : clamp(ty, by, by + bh - VH);
  if (snap || !m.isDungeon) { G.cam.x = tx; G.cam.y = ty; }
  else { const k = Math.min(1, (dt || 0.016) * 10); G.cam.x = lerp(G.cam.x, tx, k); G.cam.y = lerp(G.cam.y, ty, k); if (Math.abs(G.cam.x - tx) < 0.5) G.cam.x = tx; if (Math.abs(G.cam.y - ty) < 0.5) G.cam.y = ty; }
}
function onEnterRoom(r) {
  const p = G.player, d = DIRS[p.dir];
  G.curRoomKey = r.key; G.roomEntry = { x: p.x + d[0] * 22, y: p.y + d[1] * 22 };
  dngState(G.map.dng).visited[r.key] = 1;
  G.shutT = 0.45;
  for (const e of G.ents) if (e instanceof PushBlock && e.spec.room === r.key && !e.onPlate) { e.x = e.home[0]; e.y = e.home[1]; }
  if (r.kind === 'boss' && !dngState(G.map.dng).boss) { Music.play('boss'); runScript(async () => { await wait(0.5); const b = G.ents.find(e => e instanceof Boss); if (b) { Sfx.play('boss'); G.banner = { text: b.k.name, t: 2.5 }; } }); }
}
function roomHasEnemies(key) { return G.ents.some(e => !e.dead && (e instanceof Enemy || e instanceof Boss) && e.room === key); }
function roomCleared(key) { return !roomHasEnemies(key); }
function closeShutters(r) {
  const pb = G.player.box();
  for (const [x, y] of r.doorTiles) if (rectsOverlap(pb, { x: x * TS, y: y * TS, w: TS, h: TS })) return false;
  G.shut = [];
  for (const [x, y] of r.doorTiles) if (TILES[tAt(G.map, x, y)].name === 'DOPEN') { setT(G.map, x, y, 'DSHUT'); G.shut.push([x, y]); }
  if (G.shut.length) Sfx.play('door');
  return true;
}
function openShutters() { for (const [x, y] of G.shut) setT(G.map, x, y, 'DOPEN'); if (G.shut.length) Sfx.play('unlock'); G.shut = []; }
function onEnemyKilled() { }
function openDoorAt(tx, ty) { const m = G.map; if (!m.doors) return; for (const d of m.doors) if (d.tiles.some(([x, y]) => x === tx && y === ty)) { openDoor(d); return; } }
function openDoor(d) {
  for (const [x, y] of d.tiles) setT(G.map, x, y, 'DOPEN');
  dngState(G.map.dng).open[d.id] = 1; Sfx.play('unlock');
  Particles.add(d.tiles[0][0] * TS + 16, d.tiles[0][1] * TS + 8, 16, '#ffe080', 60, 0.5);
}

// ============ 更新 ============
function update(dt) {
  Timers.update(dt);
  if (G.fade.busy) {
    const f = G.fade, dir = Math.sign(f.to - f.a); f.a += dir * f.sp * dt;
    if ((dir >= 0 && f.a >= f.to) || (dir < 0 && f.a <= f.to)) { f.a = f.to; f.busy = false; const r = f.res; f.res = null; r && r(); }
  }
  for (let i = G.toasts.length - 1; i >= 0; i--) { G.toasts[i].t -= dt; if (G.toasts[i].t <= 0) G.toasts.splice(i, 1); }
  if (G.banner) G.banner.t -= dt;
  if (G.itemFlash > 0) G.itemFlash -= dt;
  if (Input.hit('mute')) toast(Sfx.toggle() ? '声音：关' : '声音：开');
  if (Input.hit('full')) toggleFullscreen();
  const top = UI.top();
  if (G.state === 'play' && G.map) {
    if (!top) {
      if (Input.hit('menu') && !G.locked()) UI.push(new PauseUI());
      else {
        if (G.warpCD > 0) G.warpCD -= dt;
        S.playTime += dt;
        G.player.update(dt);
        const m = G.map;
        for (const e of G.ents) {
          if (e.dead) continue;
          if (m.isDungeon && e.room && e.room !== G.curRoomKey) continue;
          if (G.locked() && !(e instanceof Pickup) && !(e instanceof Explosion)) continue;
          e.update(dt);
        }
        G.ents = G.ents.filter(e => !e.dead);
        Particles.update(dt);
        if (G.shake > 0) G.shake -= dt;
        if (m.isDungeon && G.shutT > 0) { G.shutT -= dt; if (G.shutT <= 0 && roomHasEnemies(G.curRoomKey) && !closeShutters(m.rooms[G.curRoomKey])) G.shutT = 0.1; }
        if (m.isDungeon && G.shut.length && roomCleared(G.curRoomKey)) openShutters();
      }
    }
    updateCamera(false, dt);
  }
  if (top) top.update(dt);
}

// ============ 渲染 ============
function render() {
  ctx.setTransform(SCALE, 0, 0, SCALE, 0, 0); ctx.imageSmoothingEnabled = false;
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, VW, VH);
  if (G.state === 'play' && G.map && !G.ui.some(u => u instanceof CreditsUI)) { renderWorld(); drawHUD(ctx); }
  for (const u of G.ui) u.draw(ctx);
  if (G.flash > 0) { ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, VW, VH); }
  if (G.fade.a > 0) { ctx.fillStyle = `rgba(0,0,0,${clamp(G.fade.a, 0, 1)})`; ctx.fillRect(0, 0, VW, VH); }
}
function renderWorld() {
  const m = G.map;
  let cx = Math.round(G.cam.x), cy = Math.round(G.cam.y);
  if (G.shake > 0) { cx += randi(-2, 2); cy += randi(-2, 2); }
  const x0 = Math.floor(cx / TS), y0 = Math.floor(cy / TS), x1 = x0 + Math.ceil(VW / TS) + 1, y1 = y0 + Math.ceil(VH / TS) + 1;
  const f3 = Math.floor(G.t * 3) % 3;
  for (let y = Math.max(0, y0); y <= Math.min(m.h - 1, y1); y++) for (let x = Math.max(0, x0); x <= Math.min(m.w - 1, x1); x++) {
    const i = y * m.w + x, id = m.t[i], t = TILES[id];
    if (id === 0) continue;
    ctx.drawImage(getTileSprite(id, (hash2(x, y) * 4) | 0, t.anim ? (f3 + ((x + y) % 3)) % 3 : 0, m.theme, m.under[i]), x * TS - cx, y * TS - cy);
    if (t.water) {
      const px = x * TS - cx, py = y * TS - cy;
      const nb = (dx, dy) => { const n = tAt(m, x + dx, y + dy); return n > 0 && !TILES[n].water && !TILES[n].name.includes('BRIDGE'); };
      ctx.fillStyle = 'rgba(255,255,255,0.35)';
      if (nb(0, -1)) ctx.fillRect(px, py, 16, 2); if (nb(-1, 0)) ctx.fillRect(px, py, 1, 16); if (nb(1, 0)) ctx.fillRect(px + 15, py, 1, 16);
    }
  }
  const p = G.player, list = [];
  for (const e of G.ents) { if (e.dead) continue; if (m.isDungeon && e.room && e.room !== G.curRoomKey) continue; list.push(e); }
  list.push(p);
  list.sort((a, b) => a.sortY() - b.sortY());
  for (const e of list) {
    if (e === p && p.fallScale != null) { ctx.save(); ctx.translate(p.x - cx + 8, p.y - cy + 12); ctx.scale(p.fallScale, p.fallScale); ctx.translate(-8, -12); if (p.small) ctx.drawImage(tinySprite(), 4, 6); else drawChar(ctx, p.look, p.dir, 0, 0, 0); ctx.restore(); continue; }
    e.draw(ctx, cx, cy);
    if (e === p && !p.small && p.z === 0) { const tp = p.tileUnder(); if (tp && tp.tall) { const [tx, ty] = p.tilePos(); ctx.drawImage(getTileSprite(tAt(m, tx, ty), (hash2(tx, ty) * 4) | 0, 0, m.theme, null), 0, 10, 16, 6, Math.round(p.x - cx), Math.round(p.y - cy) + 11, 16, 6); } }
  }
  Particles.draw(ctx, cx, cy);
  if (m.labels) for (const l of m.labels) { const lx = l.x * TS - cx, ly = l.y * TS - cy; if (lx > -60 && lx < VW + 60 && ly > -20 && ly < VH) drawText(ctx, l.text, lx, ly, '#fff8e0', 9, 'center', 'rgba(0,0,0,0.75)', true); }
  // 交互提示气泡
  if (!G.locked() && G.state === 'play') {
    const tp = p.tileUnder();
    let hint = null;
    if (tp && tp.shrink && p.z === 0 && S.flags.gotLeaf) hint = S.tiny ? 'J 变大' : 'J 变小';
    else if (findInteract(p)) hint = 'J';
    if (hint) { const w = textW(ctx, hint, 9, true) + 8, hx = Math.round(p.cx() - cx - w / 2), hy = Math.round(p.y - cy) + (p.small ? 0 : -8) - 8 + Math.sin(G.t * 5); drawBox(ctx, hx, hy, w, 12, 'dark'); drawText(ctx, hint, hx + w / 2, hy + 1.5, '#ffe060', 9, 'center', false, true); }
  }
  if (m.mini) { const g = ctx.createRadialGradient(VW / 2, VH / 2, VH * 0.4, VW / 2, VH / 2, VH); g.addColorStop(0, 'rgba(40,80,20,0)'); g.addColorStop(1, 'rgba(20,40,10,0.45)'); ctx.fillStyle = g; ctx.fillRect(0, 0, VW, VH); }
}

// ============ 主循环 ============
let lastT = performance.now();
function frame(now) {
  const dt = Math.min(0.05, (now - lastT) / 1000); lastT = now; G.t += dt;
  Input.update(dt);
  try { update(dt); render(); } catch (e) { console.error(e); }
  Input.endFrame();
  requestAnimationFrame(frame);
}

// ============ 触屏 ============
function setupTouch() {
  const el = document.getElementById('touch');
  if (!('ontouchstart' in window || navigator.maxTouchPoints > 0)) return;
  el.style.display = 'block';
  const pad = document.getElementById('dpad'); let padTouch = null;
  const setDir = t => {
    for (const k of ['up', 'down', 'left', 'right']) Input.release(k);
    if (!t) return;
    const r = pad.getBoundingClientRect(), dx = t.clientX - (r.left + r.width / 2), dy = t.clientY - (r.top + r.height / 2);
    if (Math.hypot(dx, dy) < 10) return;
    const a = Math.atan2(dy, dx);
    if (Math.cos(a) > 0.38) Input.press('right'); if (Math.cos(a) < -0.38) Input.press('left');
    if (Math.sin(a) > 0.38) Input.press('down'); if (Math.sin(a) < -0.38) Input.press('up');
  };
  pad.addEventListener('touchstart', e => { e.preventDefault(); padTouch = e.changedTouches[0].identifier; setDir(e.changedTouches[0]); Sfx.init(); }, { passive: false });
  pad.addEventListener('touchmove', e => { e.preventDefault(); for (const t of e.changedTouches) if (t.identifier === padTouch) setDir(t); }, { passive: false });
  const end = e => { e.preventDefault(); for (const t of e.changedTouches) if (t.identifier === padTouch) { padTouch = null; setDir(null); } };
  pad.addEventListener('touchend', end, { passive: false }); pad.addEventListener('touchcancel', end, { passive: false });
  for (const b of document.querySelectorAll('[data-act]')) {
    const act = b.dataset.act;
    b.addEventListener('touchstart', e => { e.preventDefault(); Input.press(act); b.classList.add('on'); }, { passive: false });
    const up = e => { e.preventDefault(); Input.release(act); b.classList.remove('on'); };
    b.addEventListener('touchend', up, { passive: false }); b.addEventListener('touchcancel', up, { passive: false });
  }
}

// ============ 启动 ============
function boot() {
  resize(); Input.init(); setupTouch();
  UI.push(new TitleUI()); Music.play('title');
  canvas.addEventListener('mousedown', () => Sfx.init());
  const bg = () => { if (G.state === 'play' && S && S.flags.gotLeaf && !G.dead) saveGame(true); };
  window.addEventListener('pagehide', bg);
  document.addEventListener('visibilitychange', () => { if (document.hidden) bg(); });
  requestAnimationFrame(frame);
}
boot();
