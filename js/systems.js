'use strict';
// ============ 存档状态 ============
let S = null;
const INV_SIZE = 30;
const SAVE_KEY = 'starisle_rpg_save_v1';
function newState(name) {
  const inv = new Array(INV_SIZE).fill(null);
  inv[0] = { id: 'hoe', n: 1 }; inv[1] = { id: 'can', n: 1 }; inv[2] = { id: 'pick', n: 1 }; inv[3] = { id: 'axe', n: 1 };
  inv[4] = { id: 'parsnip_s', n: 12 }; inv[5] = { id: 'potato_s', n: 3 }; inv[6] = { id: 'bread', n: 3 };
  return {
    v: 1, name: name || '小星', day: 1, season: 0, year: 1, time: 360, weather: 'sun', tomorrow: 'sun',
    gold: 300, hp: 6, maxhp: 6, energy: 120, maxEnergy: 120,
    inv, sel: 0, water: 30, toolLv: { hoe: 0, can: 0, pick: 0, axe: 0, rod: 0 }, swordLv: 0,
    party: [], box: [], dex: { seen: {}, caught: {} },
    flags: {}, trainers: {}, chests: {}, mods: {},
    farm: { soil: {}, crops: {}, objs: {} },
    friends: {}, ship: [], forage: {}, forageDay: -1, dng: {}, mineMax: 0,
    stats: { kills: 0, caught: 0, fish: 0, harvest: 0, earned: 0, battles: 0, wins: 0 },
    arena: 0, request: null, map: 'home', px: 5 * TS, py: 5 * TS, dir: 0, playTime: 0, look: null,
  };
}
function saveGame(silent) {
  try {
    S.map = G.map && G.map.id !== 'mine' && !G.map.isDungeon ? G.map.id : (G.safeMap || 'home');
    if (G.map && G.map.id === S.map) { S.px = G.player.x; S.py = G.player.y; S.dir = G.player.dir; }
    else { const sp = G.safePos || { x: 5 * TS, y: 5 * TS }; S.px = sp.x; S.py = sp.y; }
    localStorage.setItem(SAVE_KEY, JSON.stringify(S));
    if (!silent) toast('游戏已保存');
    return true;
  } catch (e) { toast('保存失败：' + e.message); return false; }
}
function loadSave() { try { const s = localStorage.getItem(SAVE_KEY); return s ? JSON.parse(s) : null; } catch (e) { return null; } }
function hasSave() { try { return !!localStorage.getItem(SAVE_KEY); } catch (e) { return false; } }
function exportSave() { saveGame(true); try { return btoa(unescape(encodeURIComponent(localStorage.getItem(SAVE_KEY)))); } catch (e) { return ''; } }
function importSave(code) { try { const json = decodeURIComponent(escape(atob(code.trim()))); JSON.parse(json); localStorage.setItem(SAVE_KEY, json); return true; } catch (e) { return false; } }

// ============ 背包 ============
function isStack(id) { const t = ITEMS[id].type; return t !== 'tool'; }
function addItem(id, n) {
  n = n || 1;
  if (!ITEMS[id]) { console.warn('unknown item', id); return false; }
  if (isStack(id)) {
    const s = S.inv.find(x => x && x.id === id);
    if (s) { s.n += n; return true; }
  } else if (S.inv.some(x => x && x.id === id)) return true;
  const i = S.inv.findIndex(x => !x);
  if (i < 0) return false;
  S.inv[i] = { id, n };
  return true;
}
function countItem(id) { let c = 0; for (const s of S.inv) if (s && s.id === id) c += s.n; return c; }
function removeItem(id, n) {
  n = n || 1; if (countItem(id) < n) return false;
  for (let i = 0; i < S.inv.length && n > 0; i++) {
    const s = S.inv[i]; if (!s || s.id !== id) continue;
    const k = Math.min(n, s.n); s.n -= k; n -= k; if (s.n <= 0) S.inv[i] = null;
  }
  return true;
}
function selItem() { const s = S.inv[S.sel]; return s ? ITEMS[s.id] : null; }
function hasHealthyMon() { return S.party.some(m => m.hp > 0); }
function healParty() { for (const m of S.party) { m.hp = m.maxhp; m.status = null; } }

// ============ 时间 ============
function clockStr() { const h = Math.floor(S.time / 60) % 24, mm = Math.floor(S.time % 60 / 10) * 10; return String(h).padStart(2, '0') + ':' + String(mm).padStart(2, '0'); }
function dateStr() { return `第${S.year}年 ${SEASONS[S.season]}季 第${S.day}天`; }
function weekDay() { return ['一', '二', '三', '四', '五', '六', '日'][(S.day - 1) % 7]; }
function updateTime(dt) {
  if (!G.map || G.locked()) return;
  const prevH = Math.floor(S.time / 60);
  S.time += dt / 0.7;
  S.playTime += dt;
  const h = Math.floor(S.time / 60);
  if (h !== prevH) onHourChange(h);
  if (S.time >= 26 * 60) passOut();
}
function onHourChange(h) {
  if (h === 24) toast('已经午夜了……该回家睡觉了。');
  if (h === 25) toast('好困……快撑不住了……');
  refreshNPCs();
}
function nightAlpha() {
  if (!G.map.outdoor) return 0;
  const t = S.time;
  let a = 0;
  if (t > 17.5 * 60) a = Math.min(0.55, (t - 17.5 * 60) / 180 * 0.55);
  if (S.weather === 'rain') a = Math.max(a, 0.18);
  return a;
}
function passOut() {
  runScript(async () => {
    await fadeOut(0.8);
    const lost = Math.min(1000, Math.floor(S.gold * 0.1));
    S.gold -= lost;
    await endDay(true);
    await say(null, [`你累倒在了外面……被好心的村民送回了家。${lost ? '\n（钱包里少了 ' + lost + 'G）' : ''}`]);
  });
}
async function sleepInBed() {
  const c = await ask('要睡觉结束今天吗？（会自动存档）', ['睡觉', '还不困']);
  if (c !== 0) return;
  await fadeOut(0.8);
  await endDay(false);
}
async function endDay(passedOut) {
  // 出货结算
  let earned = 0; const sold = [];
  for (const s of S.ship) { const v = ITEMS[s.id].sell * s.n; earned += v; sold.push(s); }
  S.ship = [];
  S.gold += earned; S.stats.earned += earned;
  // 作物成长
  const rainToday = S.weather === 'rain';
  for (const k in S.farm.crops) {
    const c = S.farm.crops[k]; const soil = S.farm.soil[k];
    if ((soil && soil.wet) || rainToday) c.age++;
  }
  for (const k in S.farm.soil) S.farm.soil[k].wet = false;
  // 日期推进
  S.day++;
  let newSeason = false;
  if (S.day > 28) { S.day = 1; S.season++; newSeason = true; if (S.season > 3) { S.season = 0; S.year++; } }
  if (newSeason) {
    let dead = 0;
    for (const k in S.farm.crops) { const cr = CROPS[S.farm.crops[k].id]; if (!cr.seasons.includes(S.season)) { delete S.farm.crops[k]; dead++; } }
    S._seasonMsg = `${SEASONS[S.season]}季到来了！${dead ? '\n' + dead + '株不适应新季节的作物枯萎了。' : ''}`;
  }
  S.weather = S.tomorrow;
  const rp = [0.22, 0.15, 0.22, 0.12][S.season];
  S.tomorrow = chance(rp) ? 'rain' : 'sun';
  if (S.weather === 'rain') for (const k in S.farm.soil) S.farm.soil[k].wet = true;
  // 洒水器
  for (const k in S.farm.objs) {
    const it = ITEMS[S.farm.objs[k]]; if (!it || !it.range) continue;
    const [x, y] = k.split(',').map(Number);
    const r = it.range;
    for (let j = -r; j <= r; j++) for (let i = -r; i <= r; i++) {
      if (r === 1 && Math.abs(i) + Math.abs(j) !== 1) continue;
      if (!i && !j) continue;
      const kk = (x + i) + ',' + (y + j); if (S.farm.soil[kk]) S.farm.soil[kk].wet = true;
    }
  }
  S.time = 360;
  S.energy = passedOut ? Math.floor(S.maxEnergy * 0.6) : S.maxEnergy;
  S.hp = S.maxhp; healParty();
  for (const k in S.friends) { S.friends[k].talked = false; S.friends[k].gifted = false; }
  // 每日委托
  if (!S.request || S.request.done || S.request.day < S.day - 3 || newSeason) S.request = makeRequest();
  // 重置野外地图（草丛、石头会重新长出来）
  for (const k in mapCache) delete mapCache[k];
  G.mineCache = null;
  // 回到家中
  G.safeMap = 'home'; G.safePos = { x: 9 * TS, y: 3 * TS };
  S.map = 'home';
  loadMap('home', 9 * TS, 3.4 * TS, 0);
  saveGame(true);
  await fadeIn(0.8);
  const lines = [`【${dateStr()}（星期${weekDay()}）】  天气：${S.weather === 'rain' ? '下雨' : '晴朗'}`];
  if (earned) lines.push(`昨天出货的物品卖出了 ${earned}G！`);
  if (S._seasonMsg) { lines.push(S._seasonMsg); S._seasonMsg = null; }
  await say(null, lines);
  Music.play(G.map.music);
}

// ============ 每日委托 ============
function makeRequest() {
  const pool = [];
  for (const id in CROPS) if (CROPS[id].seasons.includes(S.season) && id !== 'starfruit') pool.push([id, randi(2, 5)]);
  const fishPool = ['carp', 'bass', 'sardine', 'trout'];
  if (S.flags.d1) fishPool.push('tuna', 'octopus');
  for (const f of fishPool) pool.push([f, randi(1, 2)]);
  const mats = ['copper', 'stone', 'wood', 'gel'];
  if (S.flags.d1) mats.push('iron', 'quartz', 'wingm', 'bone');
  if (S.flags.d3) mats.push('gold', 'topaz', 'amethyst');
  for (const m of mats) pool.push([m, m === 'stone' || m === 'wood' ? randi(15, 30) : randi(2, 6)]);
  const [id, n] = pick(pool);
  const who = pick(['lily', 'bear', 'elder', 'xue', 'hai', 'mei', 'lin']);
  const reward = Math.max(150, Math.round(ITEMS[id].sell * n * 2.5));
  return { id, n, who, reward, day: S.day, done: false };
}

// ============ 采集物刷新 ============
function ensureForage(m) {
  const key = S.year + '-' + S.season + '-' + S.day;
  if (S.forageDay !== key) { S.forage = {}; S.forageDay = key; }
  if (!m.forage || S.forage[m.id]) return;
  const list = []; const R = Math.random;
  const pool = m.forage.filter(f => !f[2] || f[2].includes(S.season));
  if (!pool.length) { S.forage[m.id] = list; return; }
  const n = randi(3, 6);
  for (let i = 0; i < n; i++) {
    let tries = 0, x, y;
    do { x = randi(2, m.w - 3); y = randi(2, m.h - 3); tries++; } while (tries < 60 && (!['GRASS', 'SAND', 'SNOW', 'ROCKY', 'FLOWER'].includes(TILES[tAt(m, x, y)].name) || S.farm.soil[x + ',' + y]));
    if (tries >= 60) continue;
    let tot = pool.reduce((a, f) => a + f[1], 0), r = R() * tot, it = pool[0][0];
    for (const f of pool) { r -= f[1]; if (r <= 0) { it = f[0]; break; } }
    list.push({ x, y, item: it, taken: false });
  }
  S.forage[m.id] = list;
}

// ============ 农场 ============
function farmKey(x, y) { return x + ',' + y; }
function applyFarm(m) {
  for (const k in S.farm.soil) { const [x, y] = k.split(',').map(Number); setT(m, x, y, 'SOIL'); }
}
function drawFarmLayer(ctx, cx, cy, x0, y0, x1, y1) {
  for (const k in S.farm.soil) {
    const [x, y] = k.split(',').map(Number);
    if (x < x0 || x > x1 || y < y0 || y > y1) continue;
    const px = x * TS - cx, py = y * TS - cy;
    if (S.farm.soil[k].wet) { ctx.fillStyle = 'rgba(40,20,5,0.38)'; ctx.fillRect(px, py, TS, TS); }
    const c = S.farm.crops[k];
    if (c) {
      const cr = CROPS[c.id]; const f = c.age / cr.days;
      const stage = c.age <= 0 ? 0 : f < 0.4 ? 1 : f < 1 ? 2 : 3;
      ctx.drawImage(getCropSprite(stage, cr.color), px, py - (stage >= 2 ? 3 : 0));
      if (stage === 3 && Math.sin(G.t * 4 + x + y) > 0.6) { ctx.fillStyle = '#fff'; ctx.fillRect(px + 12, py + 1, 1, 1); }
    }
  }
  for (const k in S.farm.objs) {
    const [x, y] = k.split(',').map(Number);
    if (x < x0 || x > x1 || y < y0 || y > y1) continue;
    ctx.drawImage(getIcon(ITEMS[S.farm.objs[k]]), x * TS - cx, y * TS - cy - 2);
  }
}
function toolCost(base, lv) { return Math.max(1, base - Math.floor(lv * 0.5)); }
function spendEnergy(n) {
  if (S.energy <= 0) { toast('太累了……吃点东西或回家睡觉吧。'); return false; }
  S.energy = Math.max(0, S.energy - n);
  if (S.energy === 0) toast('精疲力尽了……');
  return true;
}
function toolArea(lv, dir, tx, ty) {
  // 0级:1格  1级:前方3格  2级:前方5格  3级:3x3  4级:5x3
  const out = [[tx, ty]];
  const d = DIRS[dir];
  const len = [1, 3, 5, 3, 5][lv] || 1;
  const wid = lv >= 3 ? 1 : 0;
  out.length = 0;
  for (let i = 0; i < len; i++) for (let w = -wid; w <= wid; w++) {
    out.push([tx + d[0] * i + (d[1] ? w : 0), ty + d[1] * i + (d[0] ? w : 0)]);
  }
  return out;
}

// ============ 使用道具 ============
function useSelectedItem(p) {
  const slot = S.inv[S.sel];
  if (!slot) return;
  const it = ITEMS[slot.id];
  const [tx, ty] = p.facingTile();
  const m = G.map;
  const t = tileProps(tx, ty);
  const anim = () => { p.toolT = 0.3; p.toolItem = it.id; };
  switch (it.type) {
    case 'tool': {
      if (it.id === 'hoe') {
        if (!m.isFarm) { toast('只能在农场开垦土地。'); return; }
        if (!spendEnergy(toolCost(2, S.toolLv.hoe))) return;
        anim(); Sfx.play('till');
        let any = false;
        for (const [x, y] of toolArea(S.toolLv.hoe, p.dir, tx, ty)) {
          const tt = tileProps(x, y); if (!tt) continue;
          if ((tt.till || tt.name === 'GRASS' || tt.name === 'FLOWER') && !S.farm.objs[farmKey(x, y)]) {
            S.farm.soil[farmKey(x, y)] = { wet: S.weather === 'rain' }; setT(m, x, y, 'SOIL'); any = true;
            Particles.add(x * TS + 8, y * TS + 10, 4, '#7a512e', 30, 0.3);
          }
        }
        if (!any) Particles.add(tx * TS + 8, ty * TS + 8, 2, '#aaa', 20, 0.2);
      } else if (it.id === 'can') {
        if (t && t.water) { S.water = canMax(); anim(); Sfx.play('water'); toast('水壶装满了'); return; }
        if (S.water <= 0) { toast('水壶空了。对着水面使用来装水。'); return; }
        if (!spendEnergy(toolCost(2, S.toolLv.can))) return;
        anim(); Sfx.play('water'); S.water--;
        for (const [x, y] of toolArea(S.toolLv.can, p.dir, tx, ty)) {
          const k = farmKey(x, y);
          if (m.isFarm && S.farm.soil[k]) S.farm.soil[k].wet = true;
          Particles.add(x * TS + 8, y * TS + 8, 4, '#80c0ff', 25, 0.35);
        }
      } else if (it.id === 'pick') {
        if (!spendEnergy(toolCost(3, S.toolLv.pick))) return;
        anim(); Sfx.play('rock');
        const k = farmKey(tx, ty);
        if (m.isFarm && S.farm.objs[k]) { const o = S.farm.objs[k]; delete S.farm.objs[k]; addItem(o, 1); toast('收回了' + ITEMS[o].name); return; }
        if (t && t.pick) { hitRock(tx, ty, t); return; }
        if (m.isFarm && S.farm.soil[k] && !S.farm.crops[k]) { delete S.farm.soil[k]; setT(m, tx, ty, 'FIELD'); return; }
      } else if (it.id === 'axe') {
        if (!spendEnergy(toolCost(3, S.toolLv.axe))) return;
        anim(); Sfx.play('chop');
        if (t && t.axe) {
          const key = m.id + tx + ',' + ty; G.hits[key] = (G.hits[key] || 0) + 1 + S.toolLv.axe;
          Particles.add(tx * TS + 8, ty * TS + 8, 6, '#a87440', 40, 0.3);
          if (G.hits[key] >= 3) { delete G.hits[key]; setT(m, tx, ty, BASE_TILE[m.under[ty * m.w + tx] || 'grass']); if (m.isFarm) persistTile(tx, ty); spawnPickup(tx * TS, ty * TS, 'wood', randi(3, 6)); Sfx.play('rock'); }
        } else if (t && (t.cut)) cutTile(tx, ty, t);
        else if (m.isFarm && S.farm.crops[farmKey(tx, ty)]) { delete S.farm.crops[farmKey(tx, ty)]; toast('清除了作物。'); }
      } else if (it.id === 'rod') {
        let ft = t; if (!(ft && (ft.water || ft.lava))) ft = tileProps(...p.facingTile(28));
        if (!(ft && (ft.water || ft.lava))) { toast('对着水面才能钓鱼。'); return; }
        if (!spendEnergy(4)) return;
        startFishing(ft.lava ? 'lava' : null);
      } else if (it.id === 'bow') {
        if (countItem('arrow') <= 0) { toast('没有箭了！'); Sfx.play('cancel'); return; }
        if (p.bowT > G.t) return; p.bowT = G.t + 0.35;
        removeItem('arrow', 1); Sfx.play('bow');
        const d = DIRS[p.dir]; shoot(p.cx() + d[0] * 6, p.cy() - 4 + d[1] * 6, d[0] * 240, d[1] * 240, 'arrow', 'player', 2);
        anim();
      } else if (it.id === 'bomb') {
        if (G.ents.filter(e => e instanceof Bomb).length >= 2) return;
        removeItem('bomb', 1); const d = DIRS[p.dir];
        G.ents.push(new Bomb(p.x + d[0] * 12, p.y + d[1] * 10 + 2)); Sfx.play('plant');
      } else if (it.id === 'firerod') {
        if (p.bowT > G.t) return; p.bowT = G.t + 0.45;
        if (!spendEnergy(2)) return;
        Sfx.play('fire'); const d = DIRS[p.dir];
        shoot(p.cx() + d[0] * 6, p.cy() - 4 + d[1] * 6, d[0] * 180, d[1] * 180, 'fireball', 'player', 3);
        anim();
      }
      return;
    }
    case 'seed': {
      const k = farmKey(tx, ty);
      if (!m.isFarm || !S.farm.soil[k]) { toast('要种在开垦好的土地上。'); return; }
      if (S.farm.crops[k] || S.farm.objs[k]) return;
      const cr = CROPS[it.crop];
      if (!cr.seasons.includes(S.season)) { toast(`${cr.name}只能在${seasonNames(cr.seasons)}季种植。`); return; }
      S.farm.crops[k] = { id: cr.id, age: 0 }; removeItem(it.id, 1); Sfx.play('plant');
      Particles.add(tx * TS + 8, ty * TS + 10, 4, '#5a3a1a', 20, 0.3);
      return;
    }
    case 'craft': {
      const k = farmKey(tx, ty);
      if (!m.isFarm || !S.farm.soil[k] || S.farm.crops[k] || S.farm.objs[k]) { toast('要放在空的耕地上。'); return; }
      S.farm.objs[k] = it.id; removeItem(it.id, 1); Sfx.play('plant'); toast('放置了' + it.name);
      return;
    }
    case 'food': case 'crop': case 'fish': case 'forage': {
      const en = it.energy || it.edible;
      if (!en) { toast('这个不能吃。'); return; }
      eatItem(it);
      return;
    }
    case 'potion': case 'ball': toast('在菜单(I)里对灵兽使用，或在战斗中使用。'); return;
    default: toast('这里不能使用' + it.name + '。');
  }
}
function eatItem(it) {
  runScript(async () => {
    const c = await ask(`要吃掉${it.name}吗？`, ['吃', '不吃']);
    if (c !== 0) return;
    removeItem(it.id, 1);
    const en = it.energy || it.edible || 0, hp = it.hp != null ? it.hp : (it.edible >= 40 ? 2 : it.edible >= 25 ? 1 : 0);
    S.energy = Math.min(S.maxEnergy, S.energy + en); S.hp = Math.min(S.maxhp, S.hp + hp);
    Sfx.play('heal'); toast(`体力 +${en}${hp ? '  生命 +' + (hp / 2) + '♥' : ''}`);
  });
}
function canMax() { return [30, 45, 65, 90, 130][S.toolLv.can]; }
function hitRock(tx, ty, t) {
  const power = S.toolLv.pick + 1;
  if (t.pick > power) { toast('镐子等级不够，需要先升级镐子。'); Sfx.play('cancel'); return; }
  const key = G.map.id + tx + ',' + ty;
  G.hits[key] = (G.hits[key] || 0) + 1 + (power - t.pick);
  Particles.add(tx * TS + 8, ty * TS + 8, 4, '#bbb', 40, 0.3);
  if (G.hits[key] >= (t.hp || 1)) { delete G.hits[key]; breakRock(tx, ty, t); if (G.map.isFarm) persistTile(tx, ty); }
}
function harvestAt(tx, ty) {
  const k = farmKey(tx, ty), c = S.farm.crops[k];
  if (!c) return false;
  const cr = CROPS[c.id];
  if (c.age < cr.days) { toast(`${cr.name}还需要 ${cr.days - c.age} 天成熟。${S.farm.soil[k] && S.farm.soil[k].wet ? '' : '（今天还没浇水）'}`); return true; }
  const n = cr.yieldN + (chance(0.1) ? 1 : 0);
  if (!addItem(cr.id, n)) { toast('背包满了！'); return true; }
  Sfx.play('harvest'); toastItem(cr.id, n); S.stats.harvest += n;
  Particles.add(tx * TS + 8, ty * TS + 8, 8, cr.color, 40, 0.5);
  if (cr.regrow) c.age = cr.days - cr.regrow; else delete S.farm.crops[k];
  return true;
}

// ============ 持久化 ============
function persistTile(tx, ty) {
  const m = G.map; if (m.isDungeon || m.mine) return;
  (S.mods[m.id] = S.mods[m.id] || {})[ty * m.w + tx] = m.t[ty * m.w + tx];
}
function applyMods(m) {
  const mods = S.mods[m.id]; if (mods) for (const i in mods) m.t[i] = mods[i];
  if (m.isFarm) applyFarm(m);
  if (m.isDungeon) {
    const d = dngState(m.dng);
    for (const door of m.doors) if (d.open[door.id]) for (const [x, y] of door.tiles) setT(m, x, y, 'DOPEN');
  }
}
function dngState(id) { return S.dng[id] = S.dng[id] || { keys: 0, boss: false, open: {}, visited: {} }; }
function chestKey(cid) { return (G.map.isDungeon ? G.map.dng : G.map.mine ? 'mine' + S.year + S.season + S.day : G.map.id) + ':' + cid; }
function isChestOpened(cid) { return !!S.chests[chestKey(cid)]; }
function markChestOpened(cid) { S.chests[chestKey(cid)] = 1; }

// ============ 战斗相关 ============
function hurtPlayer(dmg, sx, sy, noKb) {
  const p = G.player;
  if (p.hurtT > 0 || G.locked() || G.dead) return;
  S.hp -= dmg; p.hurtT = 1.0; Sfx.play('hurt'); G.shake = 0.15;
  if (!noKb) { const a = Math.atan2(p.cy() - sy, p.cx() - sx); p.kb = { x: Math.cos(a) * 170, y: Math.sin(a) * 170, t: 0.15 }; }
  if (S.hp <= 0) { S.hp = 0; playerDie(); }
}
function playerDie() {
  G.dead = true;
  runScript(async () => {
    Sfx.play('fail');
    await wait(0.6);
    await fadeOut(1);
    G.dead = false;
    S.hp = S.maxhp;
    if (G.map.isDungeon) {
      const m = G.map; loadMap(m.id, m.start.x * TS - 8, m.start.y * TS - 12, 1);
      await fadeIn(0.6);
      await say(null, ['你倒下了……\n但勇气让你重新站了起来！']);
    } else {
      const lost = Math.min(500, Math.floor(S.gold * 0.1)); S.gold -= lost;
      S.energy = Math.max(S.energy, 40);
      loadMap('home', 9 * TS, 3.4 * TS, 0);
      await fadeIn(0.6);
      await say(null, [`你晕倒了……醒来时已经回到了家中。${lost ? '\n（丢失了 ' + lost + 'G）' : ''}`]);
    }
  });
}
function fallInPit() {
  const p = G.player;
  runScript(async () => {
    Sfx.play('fail');
    for (let i = 0; i < 10; i++) { p.fallScale = 1 - i / 10; await wait(0.03); }
    p.fallScale = null;
    const r = G.curRoom;
    S.hp -= 2; if (S.hp <= 0) { S.hp = 0; playerDie(); return; }
    if (G.roomEntry) { p.x = G.roomEntry.x; p.y = G.roomEntry.y; }
    p.hurtT = 1;
  });
}
