'use strict';
// ============ 游戏主体 ============
const G = {
  ui: [], ents: [], toasts: [], t: 0, shake: 0, scriptLock: 0, fade: { a: 1, to: 1, sp: 1 }, hits: {}, cam: { x: 0, y: 0 },
  map: null, player: null, state: 'title', flash: 0, banner: null, shut: [], shutT: 0, curRoomKey: null, roomEntry: null,
  locked() { return this.ui.length > 0 || this.scriptLock > 0 || !!(this.fade && this.fade.busy) || !!this.dead; },
};
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
let SCALE = 1;
function resize() {
  const dpr = window.devicePixelRatio || 1;
  const ww = window.innerWidth, wh = window.innerHeight;
  const s = Math.min(ww / VW, wh / VH);
  canvas.style.width = Math.floor(VW * s) + 'px'; canvas.style.height = Math.floor(VH * s) + 'px';
  SCALE = Math.max(1, Math.round(s * dpr));
  canvas.width = VW * SCALE; canvas.height = VH * SCALE;
  ctx.imageSmoothingEnabled = false;
}
window.addEventListener('resize', resize);
function toggleFullscreen() {
  try { if (!document.fullscreenElement) document.documentElement.requestFullscreen(); else document.exitFullscreen(); } catch (e) { }
}

// ============ 开始游戏 ============
function startGame(state, isNew) {
  S = state;
  // 兼容旧存档
  const fresh = newState(S.name);
  for (const k in fresh) if (S[k] === undefined) S[k] = fresh[k];
  for (const k in fresh.stats) if (S.stats[k] === undefined) S.stats[k] = 0;
  for (const k in fresh.toolLv) if (S.toolLv[k] === undefined) S.toolLv[k] = 0;
  for (const m of S.party.concat(S.box)) calcStats(m);
  G.state = 'play';
  initMaps();
  G.player = new Player(0, 0);
  if (S.look) G.player.look = S.look;
  if (!S.request) S.request = makeRequest();
  let mapId = S.map || 'home';
  if (DUNGEONS[mapId] || mapId === 'mine' || !MAPDEF[mapId]) mapId = 'home';
  if (isNew) loadMap('home', 4 * TS, 5 * TS, 0);
  else loadMap(mapId, S.px, S.py, S.dir);
  runScript(async () => {
    await fadeIn(0.8);
    if (isNew) {
      await say(null, ['……', '这里就是爷爷留下的小屋。', `爷爷在信里说过，屋里的宝箱里有留给${S.name}的东西……`, '（方向键/WASD移动，面对宝箱按 J 或空格键调查）']);
    } else {
      await say(null, [`欢迎回来，${S.name}！`, `${dateStr()}  ${clockStr()}`]);
    }
  });
}

// ============ 地图载入 ============
function loadMap(id, px, py, dir) {
  let m = id === 'mine' ? G.mineMap : getMap(id);
  G.map = m;
  applyMods(m);
  G.ents = []; G.shut = []; G.shutT = 0; G.curRoomKey = null;
  Particles.list = [];
  const p = G.player;
  p.x = px; p.y = py; if (dir != null) p.dir = dir;
  p.kb = null; p.atkT = 0; p.toolT = 0; p.hurtT = 0;
  p.trail = []; for (let i = 0; i < 40; i++) p.trail.push([p.x, p.y, p.dir]);
  spawnMapEntities(m);
  updateCamera(true);
  playMapMusic();
  if (!m.isDungeon && id !== 'mine') { G.safeMap = id; G.safePos = { x: px, y: py }; if (S.flags.gotSword) saveGame(true); }
  S.map = id;
  G.banner = { text: m.name, t: 2.2 };
  G.warpCD = 0.3;
}
function playMapMusic() {
  const m = G.map;
  let mus = m.music;
  if (m.outdoor && (S.time >= 20 * 60) && ['farm', 'village', 'field'].includes(mus)) mus = 'night';
  Music.play(mus);
}
function freeNear(m, x, y) {
  for (let r = 0; r < 6; r++) for (let j = -r; j <= r; j++) for (let i = -r; i <= r; i++) {
    const t = tAt(m, x + i, y + j); if (t < 0) continue; const T = TILES[t];
    if (!T.solid && !T.water && !T.pit && !T.lava && !m.warps[(y + j) * m.w + x + i] && !T.door) return [x + i, y + j];
  }
  return [x, y];
}
function spawnMapEntities(m) {
  // 预设生成物（地下城/矿洞）
  for (const s of m.spawns) {
    if (s.type === 'enemy') G.ents.push(new Enemy(s.kind, s.x * TS, s.y * TS, s.room));
    else if (s.type === 'chest') G.ents.push(new Chest(s));
    else if (s.type === 'block') { const b = new PushBlock(s); G.ents.push(b); }
    else if (s.type === 'boss') { if (!dngState(m.dng).boss) G.ents.push(new Boss(s.kind, s.x * TS, s.y * TS, s.room)); }
  }
  // 野外怪物
  if (m.enemies && m.enemies.length) {
    for (const [kind, n] of m.enemies) for (let i = 0; i < n; i++) {
      for (let tries = 0; tries < 40; tries++) {
        const x = randi(2, m.w - 3), y = randi(2, m.h - 3);
        const t = TILES[tAt(m, x, y)];
        if (t.solid || t.water || t.tall || t.door || m.warps[y * m.w + x]) continue;
        if (Math.hypot(x * TS - G.player.x, y * TS - G.player.y) < 120) continue;
        G.ents.push(new Enemy(kind, x * TS, y * TS)); break;
      }
    }
  }
  // NPC
  for (const n of npcsForMap(m.id)) G.ents.push(n);
  // 采集物
  ensureForage(m);
  for (const f of (S.forage[m.id] || [])) if (!f.taken) G.ents.push(new Forage(f));
  // 农场出货箱
  if (m.isFarm) G.ents.push(new ShipBin(11, 6));
  // 爷爷的宝箱
  if (m.isHome) G.ents.push(new Chest({ cid: 'grandpa', x: 3, y: 5, item: 'grandpa' }));
  // 野外宝箱
  for (const c of (OW_CHESTS[m.id] || [])) { const [x, y] = freeNear(m, c.x, c.y); G.ents.push(new Chest(Object.assign({}, c, { x, y }))); }
}

// ============ 地图切换 ============
function edgeExit(side) {
  const m = G.map, ex = m.exits[side], p = G.player;
  if (!ex) return;
  const tm = getMap(ex.to);
  let nx = p.x, ny = p.y;
  if (side === 'e') { nx = -p.hb.x + 1; ny = p.y + ex.off * TS; }
  if (side === 'w') { nx = tm.w * TS - p.hb.x - p.hb.w - 1; ny = p.y + ex.off * TS; }
  if (side === 'n') { ny = tm.h * TS - p.hb.y - p.hb.h - 1; nx = p.x + ex.off * TS; }
  if (side === 's') { ny = -p.hb.y + 1; nx = p.x + ex.off * TS; }
  runScript(async () => { await fadeOut(0.2); loadMap(ex.to, nx, ny, p.dir); await fadeIn(0.2); });
}
function placeAt(tx, ty) { return [tx * TS, ty * TS - 4]; }
function useWarp(w) {
  if (G.warpCD > 0) return;
  const p = G.player;
  const pushBack = () => { p.y += 6; G.warpCD = 0.5; };
  if (w.to === 'mine') { runScript(enterMine); pushBack(); return; }
  if (DUNGEONS[w.to]) {
    if (!S.flags.gotSword) { pushBack(); runScript(async () => say(null, ['里面传来了魔物的声音……手无寸铁地进去太危险了。\n（先打开家里爷爷的宝箱）'])); return; }
    if (!hasHealthyMon() && !S.flags.gotStarter) { pushBack(); runScript(async () => say(null, ['一个人进去太危险了……先去晨星村找村长吧。'])); return; }
    const D = DUNGEONS[w.to];
    runScript(async () => {
      await fadeOut(0.4);
      const m = getMap(w.to);
      loadMap(w.to, m.start.x * TS - 8, m.start.y * TS - 12, 1);
      if (dngState(w.to).boss) G.banner = { text: m.name + '（已攻略）', t: 2.5 };
      await fadeIn(0.4);
      if (!dngState(w.to).entered) { dngState(w.to).entered = true; await say(null, [`这里就是${D.name}……`, '空气中弥漫着暗影的气息。小心前进吧！']); }
    });
    return;
  }
  const hrs = SHOP_HOURS[w.to];
  if (hrs) {
    const h = Math.floor(S.time / 60) % 24;
    if (h < hrs[0] || h >= hrs[1]) { pushBack(); toast(`已经关门了（营业时间 ${hrs[0]}:00 - ${hrs[1]}:00）`); return; }
  }
  if (w.to === 'xuehouse' && Math.floor(S.time / 60) >= 22) { pushBack(); toast('门锁着。小雪大概已经睡了。'); return; }
  const m = getMap(w.to);
  runScript(async () => {
    Sfx.play('door');
    await fadeOut(0.25);
    if (w.x != null) loadMap(w.to, w.x * TS, w.y * TS, w.dir);
    else { const [x, y] = placeAt(m.mat.x, m.mat.y - 1); loadMap(w.to, x, y, 1); }
    await fadeIn(0.25);
  });
}
function exitInterior() {
  if (G.warpCD > 0) return;
  const m = G.map;
  let back;
  if (m.isDungeon) back = DUNGEONS[m.dng].from;
  else back = INTERIOR_BACK[m.id];
  if (!back) return;
  runScript(async () => {
    Sfx.play('door');
    await fadeOut(0.25);
    const [x, y] = placeAt(back.x, back.y);
    loadMap(back.map, x, y, 0);
    await fadeIn(0.25);
  });
}
async function enterMine() {
  const opts = [1]; for (let f = 5; f <= S.mineMax; f += 5) opts.push(f);
  let floor = 1;
  if (opts.length > 1) {
    const c = await ask('矿洞升降梯：要去第几层？', opts.slice(-6).map(f => '第 ' + f + ' 层').concat(['离开']));
    if (c < 0 || c >= Math.min(6, opts.length)) return;
    floor = opts.slice(-6)[c];
  } else {
    const c = await ask('黑漆漆的矿洞。里面有矿石，也有魔物。要进去吗？', ['进入', '离开']);
    if (c !== 0) return;
  }
  await fadeOut(0.4);
  gotoMineFloor(floor);
  await fadeIn(0.4);
}
function gotoMineFloor(f) {
  const daySeed = S.year * 1000 + S.season * 100 + S.day;
  G.mineMap = genMine(f, daySeed);
  const m = G.mineMap;
  const lx = Math.floor(m.start.x), ly = Math.floor(m.start.y) - 1;
  let pos = null;
  for (const [dx, dy] of [[0, 1], [1, 0], [-1, 0], [0, -1], [1, 1], [-1, 1], [1, -1], [-1, -1]]) { const t = TILES[tAt(m, lx + dx, ly + dy)]; if (t && !t.solid && !t.ladderUp && !t.water) { pos = [lx + dx, ly + dy]; break; } }
  if (!pos) { pos = [lx, ly + 1]; setT(m, lx, ly + 1, 'CFLOOR'); }
  const [x, y] = placeAt(pos[0], pos[1]);
  loadMap('mine', x, y, 0);
  if (f % 5 === 0 && f > S.mineMax) { S.mineMax = f; toast(`升降梯已解锁第 ${f} 层`); }
}
function mineDescend() {
  if (G.warpCD > 0) return;
  const f = G.map.mine + 1;
  runScript(async () => { Sfx.play('door'); await fadeOut(0.3); gotoMineFloor(f); await fadeIn(0.3); if (f % 10 === 0) toast('这一层似乎有宝藏……'); });
}
function mineExit() {
  if (G.warpCD > 0) return;
  runScript(async () => {
    const c = await ask('要离开矿洞回到地面吗？', ['离开', '留下']);
    if (c !== 0) { G.player.y += 8; return; }
    await fadeOut(0.4);
    const [x, y] = placeAt(5, 13);
    loadMap('forest', x, y, 0);
    await fadeIn(0.4);
  });
}

// ============ 摄像机与地下城房间 ============
function updateCamera(snap, dt) {
  const m = G.map, p = G.player;
  let tx, ty;
  if (m.isDungeon) {
    const rx = Math.floor(p.cx() / (RW * TS)), ry = Math.floor(p.cy() / (RH * TS));
    const key = rx + ',' + ry;
    if (key !== G.curRoomKey && m.rooms[key]) onEnterRoom(m.rooms[key]);
    const r = m.rooms[G.curRoomKey];
    if (r) { tx = r.ox * TS + (RW * TS - VW) / 2; ty = r.oy * TS + (RH * TS - VH) / 2; }
    else { tx = p.cx() - VW / 2; ty = p.cy() - VH / 2; }
  } else {
    tx = p.cx() - VW / 2; ty = p.cy() - VH / 2;
    const mw = m.w * TS, mh = m.h * TS;
    tx = mw <= VW ? (mw - VW) / 2 : clamp(tx, 0, mw - VW);
    ty = mh <= VH ? (mh - VH) / 2 : clamp(ty, 0, mh - VH);
  }
  if (snap || !m.isDungeon) { G.cam.x = tx; G.cam.y = ty; }
  else { const k = Math.min(1, (dt || 0.016) * 9); G.cam.x = lerp(G.cam.x, tx, k); G.cam.y = lerp(G.cam.y, ty, k); if (Math.abs(G.cam.x - tx) < 0.5) G.cam.x = tx; if (Math.abs(G.cam.y - ty) < 0.5) G.cam.y = ty; }
}
function onEnterRoom(r) {
  const p = G.player;
  G.curRoomKey = r.key;
  const d = DIRS[p.dir];
  G.roomEntry = { x: p.x + d[0] * 24, y: p.y + d[1] * 24 };
  dngState(G.map.dng).visited[r.key] = 1;
  G.shutT = 0.45;
  // 重置推箱
  for (const e of G.ents) if (e instanceof PushBlock && e.spec.room === r.key && !e.onPlate) { e.x = e.home[0]; e.y = e.home[1]; }
  // 头目房
  if (r.kind === 'boss' && !dngState(G.map.dng).boss) { Music.play('boss'); runScript(async () => { await wait(0.6); const b = G.ents.find(e => e instanceof Boss); if (b) { Sfx.play('boss'); G.banner = { text: b.k.name, t: 2.5 }; } }); }
}
function roomHasEnemies(key) { return G.ents.some(e => !e.dead && (e instanceof Enemy || e instanceof Boss) && e.room === key); }
function roomCleared(key) { return !roomHasEnemies(key); }
function closeShutters(r) {
  const p = G.player.box();
  for (const [x, y] of r.doorTiles) { if (rectsOverlap(p, { x: x * TS, y: y * TS, w: TS, h: TS })) return false; }
  G.shut = [];
  for (const [x, y] of r.doorTiles) if (TILES[tAt(G.map, x, y)].name === 'DOPEN') { setT(G.map, x, y, 'DSHUT'); G.shut.push([x, y]); }
  if (G.shut.length) Sfx.play('door');
  return true;
}
function openShutters() { for (const [x, y] of G.shut) setT(G.map, x, y, 'DOPEN'); if (G.shut.length) Sfx.play('unlock'); G.shut = []; }
function onEnemyKilled(e) {
  const m = G.map;
  if (m.isDungeon && e.room && roomCleared(e.room) && G.shut.length) { setTimeout(() => openShutters(), 400); }
  if (m.mine && !m.ladderFound && !G.ents.some(x => !x.dead && x instanceof Enemy)) {
    const tx = Math.floor(e.cx() / TS), ty = Math.floor(e.cy() / TS);
    if (TILES[tAt(m, tx, ty)].name === 'CFLOOR') { setT(m, tx, ty, 'LADDERD'); m.ladderFound = true; Sfx.play('secret'); toast('出现了通往下一层的梯子！'); }
  }
}
function openDoorAt(tx, ty) {
  const m = G.map; if (!m.doors) return;
  for (const d of m.doors) if (d.tiles.some(([x, y]) => x === tx && y === ty)) { openDoor(d); return; }
}
function openDoor(d) {
  for (const [x, y] of d.tiles) setT(G.map, x, y, 'DOPEN');
  dngState(G.map.dng).open[d.id] = 1;
  Sfx.play('unlock');
  Particles.add(d.tiles[0][0] * TS + 16, d.tiles[0][1] * TS + 8, 16, '#ffe080', 60, 0.5);
}

// ============ 宝箱奖励 ============
function rollLoot(tier) {
  const r = Math.random();
  if (r < 0.3) return ['coin', randi(30, 90) * tier];
  if (r < 0.45 && S.flags.bow) return ['arrow', 10];
  if (r < 0.55 && S.flags.bombs) return ['bomb', 5];
  if (r < 0.72) return [pick(tier >= 3 ? ['superpotion', 'greatball', 'ultraball', 'revive'] : ['potion', 'superpotion', 'ball', 'greatball']), randi(1, 3)];
  if (r < 0.87) return [pick(tier >= 3 ? ['ruby', 'emerald', 'topaz', 'amethyst'] : ['quartz', 'amethyst', 'topaz']), 1];
  return [pick(tier >= 3 ? ['iron', 'gold'] : ['copper', 'iron']), randi(2, 5)];
}
function openChestReward(spec) {
  runScript(async () => {
    Sfx.play('secret');
    await wait(0.3);
    const d = G.map.isDungeon ? dngState(G.map.dng) : null;
    const it = spec.item;
    if (it === 'grandpa') {
      S.flags.gotSword = true; addItem('letter', 1);
      await bigMessage('获得了 爷爷的木剑！', '按 J / 空格 挥剑攻击', 'sword');
      await say(null, ['箱子里还有一封信……']);
      await say('爷爷的信', LETTER_TEXT);
      await say(null, ['（信已放入背包。按 I 打开菜单可以重新阅读）', '先出门看看吧。往东走就是晨星村。']);
      return;
    }
    if (it === 'key') { d.keys++; await bigMessage('获得了 小钥匙！', '可以打开一扇上锁的门。', 'key'); return; }
    if (it === 'bosskey') { d.bossKey = true; await bigMessage('获得了 头目钥匙！', '可以打开头目房间的大门。', 'bosskey'); return; }
    if (it === 'bow') { S.flags.bow = true; giveForce('bow', 1); giveForce('arrow', 30); await bigMessage('获得了 勇者之弓！', '选中后按 K 射箭。射中机关之眼可以开门！', 'bow'); return; }
    if (it === 'fins') { S.flags.fins = true; await bigMessage('获得了 人鱼之鳞！', '现在可以在水里游泳了！', 'fins'); return; }
    if (it === 'bombs') { S.flags.bombs = true; giveForce('bomb', 15); await bigMessage('获得了 炸弹袋！', '选中后按 K 放置。能炸开有裂缝的墙和岩石！', 'bomb'); return; }
    if (it === 'firerod') { S.flags.firerod = true; giveForce('firerod', 1); await bigMessage('获得了 火焰杖！', '发射火球：融化寒冰、点燃火盆。', 'firerod'); return; }
    if (it === 'heartc') { S.maxhp += 2; S.hp = S.maxhp; await bigMessage('获得了 心之容器！', '生命上限 +1', 'heart'); return; }
    if (it === 'loot' || it === 'mineloot') {
      const tier = it === 'mineloot' ? 1 + Math.floor(spec.n / 20) : (G.map.tier || 1);
      const rolls = it === 'mineloot' ? 3 : 1;
      for (let i = 0; i < rolls; i++) {
        let [id, n] = rollLoot(tier);
        if (it === 'mineloot' && i === 0) { id = spec.n >= 60 ? 'mythril' : spec.n >= 30 ? 'gold' : 'iron'; n = randi(3, 6); }
        if (it === 'mineloot' && i === 1 && chance(0.4)) { id = 'starshard'; n = 1; }
        if (id === 'coin') { S.gold += n; Sfx.play('coin'); await bigMessage(`获得了 ${n}G！`, null, 'coin'); }
        else { giveForce(id, n); await bigMessage(`获得了 ${ITEMS[id].name} ×${n}！`, null, id); }
      }
      return;
    }
    giveForce(it, spec.n || 1);
    await bigMessage(`获得了 ${ITEMS[it].name}${(spec.n || 1) > 1 ? ' ×' + spec.n : ''}！`, null, it);
  });
}
function giveForce(id, n) {
  if (addItem(id, n)) return;
  // 背包满时：把非工具物品挤到出货箱
  const i = S.inv.findIndex(s => s && ITEMS[s.id].type !== 'tool' && ITEMS[s.id].type !== 'key');
  if (i >= 0) { const s = S.inv[i]; S.inv[i] = null; const ex = S.ship.find(x => x.id === s.id); if (ex) ex.n += s.n; else S.ship.push({ id: s.id, n: s.n }); toast(`背包已满，${ITEMS[s.id].name} 被送进了出货箱`); }
  addItem(id, n);
}

// ============ 打败头目 ============
function bossDefeated(b) {
  runScript(async () => {
    const id = G.map.dng, D = DUNGEONS[id], d = dngState(id);
    Music.play(null); Music.want = null;
    for (let i = 0; i < 7; i++) { Particles.add(b.cx() + rand(-16, 16), b.cy() + rand(-16, 16), 18, pick(['#ffe060', '#ff8040', '#ffffff']), 90, 0.7); Sfx.play('bomb'); G.shake = 0.3; await wait(0.22); }
    for (const e of G.ents) if (e instanceof Enemy || e instanceof Proj) e.dead = true;
    d.boss = true; S.flags[id] = true;
    openShutters();
    await wait(0.6);
    if (id === 'd5') { await endingScene(); return; }
    S.maxhp += 2; S.hp = S.maxhp;
    await bigMessage('获得了 心之容器！', '生命上限 +1', 'heart');
    Sfx.play('item');
    await bigMessage(`夺回了 ${D.crystal}！`, '水晶散发出温暖的光芒……', 'crystal');
    const sp = SPECIES[D.guardian];
    await say(null, [`水晶中浮现出一个身影——是传说中的守护灵【${sp.name}】！`]);
    await say(sp.name, ['「勇敢的人啊，谢谢你打破了暗影的封印。」', '「请让我与你同行，一起守护这座岛屿吧！」'], sp.look);
    const g = makeMon(D.guardian, D.glv);
    const where = giveMon(g);
    await bigMessage(`${sp.name} 加入了${where === 'party' ? '队伍' : '寄存箱'}！`, `Lv${D.glv}`);
    const next = { d1: '下一站：珊瑚海滩的潮汐洞窟。用弓箭射中封印之眼吧！', d2: '有了人鱼之鳞就能游泳了！游过晨星村北边的河，前往赤焰山。', d3: '用炸弹炸开赤焰山北边的巨石，就能去霜雪高原了！', d4: '最后的目标：霜雪高原北边的暗影之塔！' }[id];
    await say(null, ['一道温暖的光芒包围了你……', next]);
    await fadeOut(0.6);
    const [x, y] = placeAt(D.from.x, D.from.y);
    loadMap(D.from.map, x, y, 0);
    healParty();
    await fadeIn(0.6);
  });
}
async function endingScene() {
  const sl = BOSS_KINDS.shadowlord;
  await say(sl.name, ['「不可能……区区一个农夫……」', '「四颗水晶的力量……竟然选择了你……」', '「暗影……是不会消失的……」'], sl.look);
  G.flash = 1; Sfx.play('warp'); await wait(0.5); G.flash = 0;
  await say(null, ['暗影魔王化作无数光点，消散在空中。', '四颗水晶的光芒冲天而起，照亮了整座星露岛。']);
  await fadeOut(1);
  S.flags.ending = true;
  await new Promise(res => UI.push(new CreditsUI(res)));
  const [x, y] = placeAt(19, 9);
  loadMap('snow', x, y, 0);
  healParty(); S.hp = S.maxhp;
  if (S.swordLv < 5) S.swordLv = 5;
  await fadeIn(1);
  await bigMessage('获得了 星辉圣剑！', '水晶之力让你的剑脱胎换骨', 'sword');
  await say(null, ['暗影之塔恢复了平静。', '冒险告一段落——但星露岛上的生活还在继续！', '（你可以继续经营农场、收集灵兽、挑战竞技场和矿洞深处。别忘了回家睡觉存档哦！）']);
  saveGame(true);
}

// ============ 更新 ============
function update(dt) {
  Timers.update(dt);
  if (G.fade.busy) {
    const f = G.fade; const dir = Math.sign(f.to - f.a);
    f.a += dir * f.sp * dt;
    if ((dir >= 0 && f.a >= f.to) || (dir < 0 && f.a <= f.to)) { f.a = f.to; f.busy = false; const r = f.res; f.res = null; r && r(); }
  }
  for (let i = G.toasts.length - 1; i >= 0; i--) { G.toasts[i].t -= dt; if (G.toasts[i].t <= 0) G.toasts.splice(i, 1); }
  if (G.banner) G.banner.t -= dt;
  if (G.selT > 0) G.selT -= dt;
  if (Input.hit('mute')) { const m = Sfx.toggle(); toast(m ? '声音：关' : '声音：开'); }
  if (Input.hit('full')) toggleFullscreen();
  const top = UI.top();
  if (G.state === 'play' && G.map) {
    if (!top) {
      if (Input.hit('menu') && !G.locked()) { UI.push(new MenuUI()); }
      else {
        if (G.warpCD > 0) G.warpCD -= dt;
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
        updateTime(dt);
        if (G.shake > 0) G.shake -= dt;
        // 关门
        if (m.isDungeon && G.shutT > 0) { G.shutT -= dt; if (G.shutT <= 0 && roomHasEnemies(G.curRoomKey)) { if (!closeShutters(m.rooms[G.curRoomKey])) G.shutT = 0.1; } }
        if (m.isDungeon && G.shut.length && roomCleared(G.curRoomKey)) openShutters();
      }
    }
    updateCamera(false, dt);
  }
  if (top) top.update(dt);
}

// ============ 渲染 ============
function render() {
  ctx.setTransform(SCALE, 0, 0, SCALE, 0, 0);
  ctx.imageSmoothingEnabled = false;
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, VW, VH);
  if (G.state === 'play' && G.map) {
    const fullScreenUI = G.ui.some(u => u instanceof BattleUI || u instanceof CreditsUI);
    if (!fullScreenUI) { renderWorld(); drawHUD(ctx); }
  }
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
  const W = TILE.WATER, DW = TILE.DWATER;
  for (let y = y0; y <= y1; y++) {
    if (y < 0 || y >= m.h) continue;
    for (let x = x0; x <= x1; x++) {
      if (x < 0 || x >= m.w) continue;
      const i = y * m.w + x, id = m.t[i], t = TILES[id];
      if (id === 0) continue;
      const v = (hash2(x, y) * 4) | 0;
      ctx.drawImage(getTileSprite(id, v, t.anim ? (f3 + ((x + y) % 3)) % 3 : 0, m.theme, m.under[i]), x * TS - cx, y * TS - cy);
      if (t.water) {
        const px = x * TS - cx, py = y * TS - cy;
        ctx.fillStyle = 'rgba(255,255,255,0.35)';
        const nb = (dx, dy) => { const n = tAt(m, x + dx, y + dy); return n >= 0 && n !== W && n !== DW && n !== 0 && !TILES[n].name.includes('BRIDGE'); };
        if (nb(0, -1)) ctx.fillRect(px, py, 16, 2);
        if (nb(-1, 0)) ctx.fillRect(px, py, 1, 16);
        if (nb(1, 0)) ctx.fillRect(px + 15, py, 1, 16);
        if (nb(0, 1)) { ctx.fillStyle = 'rgba(0,0,40,0.18)'; ctx.fillRect(px, py + 14, 16, 2); }
      }
    }
  }
  if (m.isFarm) drawFarmLayer(ctx, cx, cy, x0, y0, x1, y1);
  // 实体排序绘制
  const list = [];
  for (const e of G.ents) { if (e.dead) continue; if (m.isDungeon && e.room && e.room !== G.curRoomKey && !(e instanceof Chest)) continue; list.push(e); }
  list.push(G.player);
  const p = G.player;
  if (S.party.length && p.trail.length >= 14) { const tr = p.trail[p.trail.length - 14]; list.push({ sortY: () => tr[1] + 15, draw: () => drawFollower(ctx, cx, cy) }); }
  list.sort((a, b) => a.sortY() - b.sortY());
  for (const e of list) {
    if (e === p && p.fallScale != null) { ctx.save(); ctx.translate(p.x - cx + 8, p.y - cy + 12); ctx.scale(p.fallScale, p.fallScale); ctx.translate(-8, -12); drawChar(ctx, p.look, p.dir, 0, 0, 0); ctx.restore(); continue; }
    e.draw(ctx, cx, cy);
    if (e === p && !p.swim) { const tp = p.tileUnder(); if (tp && tp.tall) { const tx = Math.floor(p.cx() / TS), ty = Math.floor(p.cy() / TS); const spr = getTileSprite(tAt(m, tx, ty), (hash2(tx, ty) * 4) | 0, 0, m.theme, null); ctx.drawImage(spr, 0, 10, 16, 6, Math.round(p.x - cx), Math.round(p.y - cy) + 11, 16, 6); } }
  }
  Particles.draw(ctx, cx, cy);
  // 建筑名
  if (m.labels) for (const l of m.labels) { const lx = l.x * TS - cx, ly = l.y * TS - cy; if (lx > -60 && lx < VW + 60 && ly > -20 && ly < VH) drawText(ctx, l.text, lx, ly, '#fff8e0', 8, 'center', 'rgba(0,0,0,0.7)', true); }
  // 工具目标框
  const si = selItem();
  if (si && ['hoe', 'can', 'pick', 'axe'].includes(si.id) || si && (si.type === 'seed' || si.type === 'craft')) {
    if (m.isFarm || si.id === 'pick' || si.id === 'axe') {
      const [tx, ty] = p.facingTile();
      ctx.strokeStyle = 'rgba(255,255,255,0.5)'; ctx.lineWidth = 1; ctx.strokeRect(tx * TS - cx + 0.5, ty * TS - cy + 0.5, 15, 15);
    }
  }
  // 夜晚
  const na = nightAlpha();
  if (na > 0) { ctx.fillStyle = `rgba(16,12,60,${na})`; ctx.fillRect(0, 0, VW, VH); }
  if (!m.outdoor && (m.mine || m.isDungeon)) { const g = ctx.createRadialGradient(VW / 2, VH / 2, VH * 0.35, VW / 2, VH / 2, VH * 0.9); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,0.45)'); ctx.fillStyle = g; ctx.fillRect(0, 0, VW, VH); }
  // 天气
  if (m.outdoor && S.weather === 'rain') {
    ctx.strokeStyle = 'rgba(180,200,255,0.5)'; ctx.lineWidth = 1; ctx.beginPath();
    for (let i = 0; i < 70; i++) { const x = (hash2(i, 3) * VW * 1.2 + G.t * 60 + i * 7) % (VW + 40) - 20, y = (hash2(i, 4) * VH + G.t * 300 + i * 13) % VH; ctx.moveTo(x, y); ctx.lineTo(x - 3, y + 8); }
    ctx.stroke();
  }
  if (m.id === 'snow') { ctx.fillStyle = 'rgba(255,255,255,0.8)'; for (let i = 0; i < 50; i++) { const x = (hash2(i, 7) * VW + Math.sin(G.t + i) * 10 + G.t * 8) % VW, y = (hash2(i, 8) * VH + G.t * 25 * (1 + hash2(i, 9))) % VH; ctx.fillRect(x, y, 1.5, 1.5); } }
}

// ============ 主循环 ============
let lastT = performance.now();
function frame(now) {
  const dt = Math.min(0.05, (now - lastT) / 1000); lastT = now;
  G.t += dt;
  Input.update(dt);
  try { update(dt); render(); } catch (e) { console.error(e); }
  Input.endFrame();
  requestAnimationFrame(frame);
}

// ============ 触屏按键 ============
function setupTouch() {
  const el = document.getElementById('touch');
  const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  if (!isTouch) return;
  el.style.display = 'block';
  const pad = document.getElementById('dpad');
  let padTouch = null;
  const setDir = (t) => {
    for (const k of ['up', 'down', 'left', 'right']) Input.release(k);
    if (!t) return;
    const r = pad.getBoundingClientRect(); const dx = t.clientX - (r.left + r.width / 2), dy = t.clientY - (r.top + r.height / 2);
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
  resize();
  Input.init();
  setupTouch();
  G.fade = { a: 0, to: 0, sp: 1 };
  UI.push(new TitleUI());
  Music.play('title');
  canvas.addEventListener('mousedown', () => Sfx.init());
  const bgSave = () => { if (G.state === 'play' && S && S.flags.gotSword && !G.dead) saveGame(true); };
  window.addEventListener('pagehide', bgSave);
  document.addEventListener('visibilitychange', () => { if (document.hidden) bgSave(); });
  setInterval(() => { if (G.state === 'play' && !G.locked() && G.map && !G.map.isDungeon && !G.map.mine) bgSave(); }, 60000);
  requestAnimationFrame(frame);
  window.__G = G;
}
boot();
