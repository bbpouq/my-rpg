'use strict';
// ============ 存档状态 ============
let S = null;
const SAVE_KEY = 'starisle_zelda_save_v1';
function newState() {
  return {
    v: 2, hp: 6, maxhp: 6, pieces: 0, rupees: 0, wallet: 99,
    bombs: 0, maxBombs: 20, arrows: 0, maxArrows: 30, potions: 0,
    items: {}, equip: null, tiny: false, fruits: 0,
    flags: {}, chests: {}, mods: {}, dng: {}, visited: {},
    map: 'home', px: 4 * TS, py: 5 * TS, dir: 0, playTime: 0,
  };
}
function saveGame(silent) {
  try {
    const onSafe = G.map && !G.map.isDungeon && !G.map.mini;
    S.map = onSafe ? G.map.id : (G.safeMap || 'village');
    if (onSafe) { S.px = G.player.x; S.py = G.player.y; S.dir = G.player.dir; }
    else { const sp = G.safePos || { x: 18 * TS, y: 9 * TS }; S.px = sp.x; S.py = sp.y; }
    const st = Object.assign({}, S, { tiny: onSafe ? S.tiny : G.safeTiny || false });
    localStorage.setItem(SAVE_KEY, JSON.stringify(st));
    if (!silent) toast('游戏已保存');
    return true;
  } catch (e) { if (!silent) toast('保存失败'); return false; }
}
function loadSave() { try { const s = localStorage.getItem(SAVE_KEY); return s ? JSON.parse(s) : null; } catch (e) { return null; } }
function hasSave() { try { return !!localStorage.getItem(SAVE_KEY); } catch (e) { return false; } }

function addRupees(n) { S.rupees = Math.min(S.wallet, S.rupees + n); }
function persistTile(tx, ty) { const m = G.map; if (m.isDungeon || m.mini) return; (S.mods[m.id] = S.mods[m.id] || {})[ty * m.w + tx] = m.t[ty * m.w + tx]; }
function applyMods(m) {
  const mods = S.mods[m.id]; if (mods) for (const i in mods) m.t[i] = mods[i];
  if (m.isDungeon) { const d = dngState(m.dng); for (const door of m.doors) if (d.open[door.id]) for (const [x, y] of door.tiles) setT(m, x, y, 'DOPEN'); }
}
function dngState(id) { return S.dng[id] = S.dng[id] || { keys: 0, bossKey: false, boss: false, open: {}, visited: {} }; }
function chestKey(cid) { return G.map.id + ':' + cid; }
function isChestOpened(cid) { return !!S.chests[chestKey(cid)]; }
function markChestOpened(cid) { S.chests[chestKey(cid)] = 1; }

// ============ 道具 ============
function ownedItems() { return EQUIP_ORDER.filter(k => S.items[k]); }
function cycleItem(d) {
  const own = ownedItems(); if (!own.length) return;
  let i = own.indexOf(S.equip); i = (i + d + own.length) % own.length; S.equip = own[i]; Sfx.play('select');
  G.itemFlash = 0.6;
}
function giveItem(id) { S.items[id] = true; if (!S.equip) S.equip = id; }
function useItem(p) {
  if (!S.equip) { if (S.flags.gotSword) toast('还没有道具。K 键用来使用道具。'); return; }
  if (S.tiny) { toast('变成蚂蚁那么小的时候拿不动道具……'); return; }
  if (p.itemCD > 0) return;
  const it = S.equip, d = DIRS[p.dir];
  p.toolT = G.t + 0.25; p.toolItem = it;
  if (it === 'boomerang') { if (G.ents.some(e => e instanceof Boomerang)) return; G.ents.push(new Boomerang(p)); Sfx.play('swing'); p.itemCD = 0.2; }
  else if (it === 'bombs') {
    if (S.bombs <= 0) { toast('没有爆米花了！可以在杂货铺买。'); Sfx.play('cancel'); return; }
    if (G.ents.filter(e => e instanceof Bomb).length >= 2) return;
    S.bombs--; G.ents.push(new Bomb(p.x + d[0] * 12, p.y + d[1] * 10 + 2)); Sfx.play('plant'); p.itemCD = 0.3;
  }
  else if (it === 'feather') { if (p.z > 0) return; p.vz = 175; p.z = 0.1; Sfx.play('bow'); p.itemCD = 0.1; }
  else if (it === 'bow') {
    if (S.arrows <= 0) { toast('没有豆子了！可以在杂货铺买。'); Sfx.play('cancel'); return; }
    S.arrows--; Sfx.play('bow'); shoot(p.cx() + d[0] * 6, p.cy() - 4 + d[1] * 6, d[0] * 240, d[1] * 240, 'arrow', 2, 'player'); p.itemCD = 0.35;
  }
}
// 变小 / 变大
function toggleTiny() {
  if (!S.flags.gotLeaf) { toast('一颗发着微光的露珠……好像有什么魔力。'); return; }
  const p = G.player;
  runScript(async () => {
    const [tx, ty] = p.tilePos();
    p.x = tx * TS; p.y = ty * TS - (S.tiny ? 4 : 4);
    Sfx.play('warp');
    for (let i = 0; i < 6; i++) { Particles.add(p.cx(), p.cy() - 4, 4, pick(['#a0ffa0', '#ffffff', '#ffe080']), 50, 0.6); await wait(0.07); }
    S.tiny = !S.tiny;
    p.updHB();
    G.flash = 0.6; await wait(0.08); G.flash = 0;
    Particles.add(p.cx(), p.cy() - 4, 20, '#c0ffc0', 70, 0.6);
    if (!S.flags.toldTiny && S.tiny) { S.flags.toldTiny = true; await say('萤萤', ['哇，你变得和蚂蚁一样小啦！现在能钻进墙缝和小洞了。', '想变回来的话，再站到露珠上按 J 就好！'], LEAF_LOOK); }
  });
}

// ============ 受伤与死亡 ============
function hurtPlayer(dmg, sx, sy, noKb) {
  const p = G.player;
  if (p.hurtT > 0 || G.locked() || G.dead) return;
  S.hp -= dmg; p.hurtT = 1.0; Sfx.play('hurt'); G.shake = 0.15;
  if (!noKb) { const a = Math.atan2(p.cy() - sy, p.cx() - sx); p.kb = { x: Math.cos(a) * 160, y: Math.sin(a) * 160, t: 0.15 }; }
  p.charging = false; p.charge = 0; p.chargeFull = false;
  if (S.hp <= 0) { S.hp = 0; playerDie(); }
}
function playerDie() {
  if (S.potions > 0) {
    S.potions--; S.hp = S.maxhp; Sfx.play('heal');
    Particles.add(G.player.cx(), G.player.cy(), 30, '#ff80a0', 70, 0.8); toast('蜂蜜滴救了你一命！');
    return;
  }
  G.dead = true;
  runScript(async () => {
    Sfx.play('fail');
    await wait(0.6);
    await fadeOut(0.8);
    G.dead = false;
    const c = await ask('你倒下了……', ['继续冒险', '存档并返回标题']);
    S.hp = Math.max(6, Math.floor(S.maxhp / 2));
    if (c === 1) { saveGame(true); location.reload(); return; }
    if (G.map.isDungeon) { const m = G.map; loadMap(m.id, m.start.x * TS - 8, m.start.y * TS - 12, 1); }
    else { S.tiny = G.safeTiny || false; loadMap(G.safeMap || 'village', G.safePos ? G.safePos.x : 18 * TS, G.safePos ? G.safePos.y : 9 * TS, 0); }
    await fadeIn(0.6);
  });
}
