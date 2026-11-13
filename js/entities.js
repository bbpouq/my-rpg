'use strict';
// ============ 敌人种类 ============
const ENEMY_KINDS = {
  slime: { name: '史莱姆', look: { tpl: 'blob', a: '#7ad05a' }, hp: 2, dmg: 1, spd: 30, ai: 'hop', drops: [['gel', 0.45], ['heart', 0.25], ['coin', 0.4]] },
  slime2: { name: '蓝史莱姆', look: { tpl: 'blob', a: '#4a8af0' }, hp: 4, dmg: 2, spd: 36, ai: 'hop', drops: [['gel', 0.5], ['heart', 0.3], ['coin', 0.5]] },
  slime3: { name: '紫史莱姆', look: { tpl: 'blob', a: '#b050d0' }, hp: 7, dmg: 3, spd: 40, ai: 'hop', drops: [['gel', 0.6], ['heart', 0.3], ['coin', 0.6]] },
  bat: { name: '蝙蝠', look: { tpl: 'bat', a: '#6a4a8a' }, hp: 1, dmg: 1, spd: 55, ai: 'bat', fly: true, drops: [['wingm', 0.35], ['heart', 0.2], ['coin', 0.3]] },
  firebat: { name: '火焰蝙蝠', look: { tpl: 'bat', a: '#e0502a', r: '#ffd040' }, hp: 3, dmg: 2, spd: 65, ai: 'bat', fly: true, drops: [['wingm', 0.4], ['heart', 0.25], ['coin', 0.4]] },
  bat3: { name: '暗影蝙蝠', look: { tpl: 'bat', a: '#3a1a4a', r: '#f03a3a' }, hp: 6, dmg: 4, spd: 70, ai: 'bat', fly: true, drops: [['wingm', 0.4], ['heart', 0.35], ['coin', 0.5]] },
  skel: { name: '骷髅兵', look: { tpl: 'knight', a: '#e8e4d8', b: '#a8a498' }, hp: 3, dmg: 1, spd: 36, ai: 'chase', drops: [['bone', 0.45], ['heart', 0.25], ['coin', 0.4]] },
  skel3: { name: '亡灵骑士', look: { tpl: 'knight', a: '#a89ab8', r: '#f03a3a' }, hp: 9, dmg: 4, spd: 44, ai: 'chase', drops: [['bone', 0.5], ['heart', 0.4], ['coin', 0.6]] },
  crab: { name: '沙滩蟹', look: { tpl: 'crab', a: '#e85a3a', d: '#c0402a' }, hp: 3, dmg: 1, spd: 55, ai: 'crab', drops: [['shell', 0.3], ['heart', 0.25], ['coin', 0.4]] },
  octo: { name: '喷石怪', look: { tpl: 'blob', a: '#d06a8a' }, hp: 2, dmg: 1, spd: 25, ai: 'shooter', shot: 'rock', drops: [['heart', 0.3], ['coin', 0.5]] },
  octo2: { name: '喷火怪', look: { tpl: 'blob', a: '#e0602a', r: '#ffd040' }, hp: 4, dmg: 2, spd: 28, ai: 'shooter', shot: 'fire', drops: [['heart', 0.3], ['coin', 0.5]] },
  wisp: { name: '鬼火', look: { tpl: 'ghost', a: '#ff8a3a' }, hp: 3, dmg: 2, spd: 22, ai: 'wisp', fly: true, shot: 'fire', drops: [['heart', 0.3], ['coin', 0.5]] },
  wisp2: { name: '冰魂', look: { tpl: 'ghost', a: '#8ad8ff' }, hp: 5, dmg: 3, spd: 24, ai: 'wisp', fly: true, shot: 'ice', drops: [['heart', 0.35], ['coin', 0.5]] },
  wisp3: { name: '暗魂', look: { tpl: 'ghost', a: '#8a4ad0' }, hp: 8, dmg: 4, spd: 28, ai: 'wisp', fly: true, shot: 'shadow', drops: [['heart', 0.4], ['coin', 0.6]] },
  wolf: { name: '雪狼', look: { tpl: 'wolf', a: '#a8c0d8', c: '#ffffff', d: '#4a6a8a' }, hp: 5, dmg: 2, spd: 45, ai: 'charge', drops: [['bone', 0.3], ['heart', 0.3], ['coin', 0.5]] },
  knight: { name: '铁甲兵', look: { tpl: 'knight', a: '#8a8aa0', b: '#5a5a70' }, hp: 8, dmg: 3, spd: 32, ai: 'chase', drops: [['iron', 0.2], ['heart', 0.35], ['coin', 0.6]] },
  knight2: { name: '暗影骑士', look: { tpl: 'knight', a: '#4a3a6a', b: '#2a1a4a', r: '#f040f0' }, hp: 12, dmg: 4, spd: 40, ai: 'chase', drops: [['heart', 0.45], ['coin', 0.7]] },
};
const BOSS_KINDS = {
  treant: { name: '腐化树王', look: { tpl: 'golem', a: '#5a8a3a', c: '#a8d080', d: '#3a2a1a' }, hp: 12, dmg: 2, weak: 'arrow', pats: ['walk', 'seeds', 'slam', 'walk', 'summon'], minion: 'slime', shot: 'rock' },
  crabking: { name: '深渊蟹王', look: { tpl: 'crab', a: '#4a6ad0', d: '#2a3a8a' }, hp: 16, dmg: 2, weak: null, pats: ['charge', 'bubbles', 'charge', 'walk', 'seeds'], minion: 'crab', shot: 'bubble' },
  lavagolem: { name: '熔岩魔像', look: { tpl: 'golem', a: '#a03a2a', c: '#ff9a40', d: '#2a1010' }, hp: 18, dmg: 3, weak: 'bomb', pats: ['walk', 'seeds', 'slam', 'ring', 'walk'], minion: 'firebat', shot: 'fire' },
  icedragon: { name: '冰霜巨龙', look: { tpl: 'dragon', a: '#8ac8f0', c: '#ffffff', d: '#3a78b0' }, hp: 22, dmg: 3, weak: 'fireball', pats: ['teleport', 'seeds', 'charge', 'ring', 'summon'], minion: 'wisp2', shot: 'ice' },
  shadowlord: { name: '暗影魔王', look: { tpl: 'spirit', a: '#3a2a5a', c: '#6a4a9a', d: '#1a0a2a', crown: true }, hp: 36, dmg: 4, weak: null, pats: ['teleport', 'ring', 'seeds', 'summon', 'charge', 'teleport', 'ring'], minion: 'knight2', shot: 'shadow' },
};
const SHOT_COLOR = { rock: '#8a7a6a', fire: '#ff7020', ice: '#9ae8ff', shadow: '#a050f0', bubble: '#8ad0ff', arrow: '#d0b080', fireball: '#ff5010' };

// ============ 碰撞 ============
function tileProps(tx, ty) { const id = tAt(G.map, tx, ty); return id < 0 ? null : TILES[id]; }
function tileSolidFor(tx, ty, who) {
  const m = G.map;
  if (tx < 0 || ty < 0 || tx >= m.w || ty >= m.h) {
    if (who === 'player') { const side = tx < 0 ? 'w' : tx >= m.w ? 'e' : ty < 0 ? 'n' : 's'; return !m.exits[side]; }
    return true;
  }
  const t = TILES[m.t[ty * m.w + tx]];
  if (t.water) return !((who === 'player' && S.flags.fins) || who === 'fly' || who === 'proj');
  if (t.pit) return who !== 'player' && who !== 'fly' && who !== 'proj';
  if (t.lava) return who !== 'player' && who !== 'fly' && who !== 'proj';
  if (t.solid) return true;
  if (m.isFarm && who !== 'proj' && S.farm.objs[tx + ',' + ty]) return true;
  return false;
}
function boxBlocked(x, y, w, h, who, self) {
  const x0 = Math.floor(x / TS), x1 = Math.floor((x + w - 0.01) / TS), y0 = Math.floor(y / TS), y1 = Math.floor((y + h - 0.01) / TS);
  for (let ty = y0; ty <= y1; ty++) for (let tx = x0; tx <= x1; tx++) if (tileSolidFor(tx, ty, who)) return true;
  if (who === 'player' || who === 'npc') {
    for (const e of G.ents) {
      if (!e.solid || e === self || e.dead) continue;
      const b = e.box(); if (x < b.x + b.w && x + w > b.x && y < b.y + b.h && y + h > b.y) return e;
    }
  }
  return false;
}
function moveBody(e, dx, dy, who) {
  const hb = e.hb;
  let moved = false;
  if (dx) {
    const nx = e.x + dx;
    if (!boxBlocked(nx + hb.x, e.y + hb.y, hb.w, hb.h, who, e)) { e.x = nx; moved = true; }
    else if (who === 'player' && !dy) {
      for (let k = 1; k <= 6; k++) {
        let done = false;
        for (const s of [-1, 1]) if (!boxBlocked(nx + hb.x, e.y + hb.y + s * k, hb.w, hb.h, who, e)) { e.y += s * Math.min(1, Math.abs(dx)); done = true; break; }
        if (done) break;
      }
    }
  }
  if (dy) {
    const ny = e.y + dy;
    if (!boxBlocked(e.x + hb.x, ny + hb.y, hb.w, hb.h, who, e)) { e.y = ny; moved = true; }
    else if (who === 'player' && !dx) {
      for (let k = 1; k <= 6; k++) {
        let done = false;
        for (const s of [-1, 1]) if (!boxBlocked(e.x + hb.x + s * k, ny + hb.y, hb.w, hb.h, who, e)) { e.x += s * Math.min(1, Math.abs(dy)); done = true; break; }
        if (done) break;
      }
    }
  }
  return moved;
}

// ============ 实体基类 ============
class Ent {
  constructor(x, y) { this.x = x; this.y = y; this.hb = { x: 3, y: 8, w: 10, h: 8 }; this.dead = false; this.solid = false; }
  box() { return { x: this.x + this.hb.x, y: this.y + this.hb.y, w: this.hb.w, h: this.hb.h }; }
  cx() { return this.x + this.hb.x + this.hb.w / 2; }
  cy() { return this.y + this.hb.y + this.hb.h / 2; }
  update() { }
  draw() { }
  sortY() { return this.y + 16; }
}

// ============ 玩家 ============
class Player extends Ent {
  constructor(x, y) {
    super(x, y); this.dir = 0; this.frame = 0; this.animT = 0; this.moving = false;
    this.atkT = 0; this.atkHit = new Set(); this.hurtT = 0; this.kb = null; this.swim = false;
    this.toolT = 0; this.toolItem = null; this.stepAcc = 0; this.lavaT = 0; this.trail = []; this.pushT = 0; this.pushEnt = null;
    this.look = { hair: '#6b3b1f', shirt: '#3c8c4a', pants: '#3a4a7a', skin: '#f5cba7' };
  }
  update(dt) {
    const locked = G.locked();
    if (this.hurtT > 0) this.hurtT -= dt;
    if (this.atkT > 0) { this.atkT -= dt; this.swordHits(); }
    if (this.toolT > 0) this.toolT -= dt;
    // 击退
    if (this.kb) { moveBody(this, this.kb.x * dt, 0, 'player'); moveBody(this, 0, this.kb.y * dt, 'player'); this.kb.t -= dt; if (this.kb.t <= 0) this.kb = null; }
    let dx = 0, dy = 0;
    if (!locked && this.atkT <= 0 && this.toolT <= 0) {
      if (Input.held.left) dx -= 1; if (Input.held.right) dx += 1;
      if (Input.held.up) dy -= 1; if (Input.held.down) dy += 1;
    }
    if (!locked && this.atkT <= 0 && this.toolT <= 0) { if (Input.hit('left')) this.dir = 2; else if (Input.hit('right')) this.dir = 3; else if (Input.hit('up')) this.dir = 1; else if (Input.hit('down')) this.dir = 0; }
    this.moving = !!(dx || dy);
    if (this.moving) {
      // 方向：优先保持当前方向
      const cur = DIRS[this.dir];
      if (!((cur[0] && cur[0] === dx) || (cur[1] && cur[1] === dy))) {
        if (dx && dy) this.dir = Math.abs(dx) ? (dx < 0 ? 2 : 3) : this.dir;
        else if (dx) this.dir = dx < 0 ? 2 : 3; else this.dir = dy < 0 ? 1 : 0;
      }
      let sp = 82;
      if (this.swim) sp = 55;
      if (S.energy <= 0) sp = 60;
      const tp = this.tileUnder();
      if (tp && tp.tall) sp *= 0.85;
      const len = Math.hypot(dx, dy);
      const ox = this.x, oy = this.y;
      moveBody(this, dx / len * sp * dt, 0, 'player');
      moveBody(this, 0, dy / len * sp * dt, 'player');
      const dist = Math.hypot(this.x - ox, this.y - oy);
      this.animT += dt * (dist > 0.1 ? 1 : 0.3);
      if (this.animT > 0.16) { this.animT = 0; this.frame ^= 1; if (dist > 0.1 && this.frame === 0 && !this.swim) Sfx.play('step'); }
      if (dist > 0.05) {
        this.trail.push([this.x, this.y, this.dir]); if (this.trail.length > 40) this.trail.shift();
        this.onStep(dist);
      } else this.tryPush(dx, dy, dt);
    } else { this.frame = 0; this.pushT = 0; }
    const tp = this.tileUnder();
    this.swim = !!(tp && tp.water);
    // 熔岩/坑
    if (tp && tp.lava) { this.lavaT -= dt; if (this.lavaT <= 0) { this.lavaT = 0.6; hurtPlayer(2, this.cx(), this.cy() - 10, true); } }
    if (tp && tp.pit && !G.locked()) fallInPit();
    if (!locked) this.checkWarps();
    if (!locked) this.actions();
  }
  tileUnder() { return tileProps(Math.floor(this.cx() / TS), Math.floor(this.cy() / TS)); }
  tilePos() { return [Math.floor(this.cx() / TS), Math.floor(this.cy() / TS)]; }
  facingTile(off) { const d = DIRS[this.dir]; return [Math.floor((this.cx() + d[0] * (off || 14)) / TS), Math.floor((this.cy() + d[1] * (off || 14)) / TS)]; }
  onStep(dist) {
    const tp = this.tileUnder();
    if (tp && tp.tall && G.map.enc && hasHealthyMon() && S.flags.gotStarter) {
      this.stepAcc += dist;
      if (this.stepAcc > 16) { this.stepAcc = 0; if (chance(0.09)) wildEncounter(); }
      if (Math.random() < 0.05) Particles.add(this.cx(), this.cy(), 1, '#86d456', 15, 0.3);
    }
  }
  tryPush(dx, dy, dt) {
    if (dx && dy) return;
    const d = DIRS[this.dir];
    const px = this.cx() + d[0] * 10, py = this.cy() + d[1] * 8;
    const blk = G.ents.find(e => e instanceof PushBlock && !e.moving && px >= e.x && px < e.x + 16 && py >= e.y && py < e.y + 16);
    if (!blk) {
      this.pushT = 0;
      const [tx, ty] = this.facingTile(10); const t = tileProps(tx, ty);
      if (t && t.lock && G.map.isDungeon && !(this.lockT > G.t)) { this.lockT = G.t + 1.2; tryUnlock(tx, ty, t); }
      return;
    }
    this.pushT += dt;
    if (this.pushT > 0.35) { this.pushT = 0; blk.push(d[0], d[1]); }
  }
  checkWarps() {
    const m = G.map, [tx, ty] = this.tilePos();
    // 出界 -> 地图边缘出口
    const cx = this.cx(), cy = this.cy();
    let side = null;
    if (cx < 0) side = 'w'; else if (cx >= m.w * TS) side = 'e'; else if (cy < 0) side = 'n'; else if (cy >= m.h * TS) side = 's';
    if (side && m.exits[side]) { edgeExit(side); return; }
    const idx = ty * m.w + tx;
    const w = m.warps[idx];
    if (w) { useWarp(w); return; }
    const t = tileProps(tx, ty);
    if (!t) return;
    if (t.exit) { exitInterior(); return; }
    if (t.ladderDown) { mineDescend(); return; }
    if (t.ladderUp) { if (!this._ladderGrace) mineExit(); return; }
    this._ladderGrace = false;
  }
  actions() {
    // 快捷栏切换
    if (Input.hit('next')) { S.sel = (S.sel + 1) % 10; Sfx.play('select'); }
    if (Input.hit('prev')) { S.sel = (S.sel + 9) % 10; Sfx.play('select'); }
    for (let i = 0; i < 10; i++) if (Input.hit('s' + i)) { S.sel = i; Sfx.play('select'); }
    if (Input.hit('a')) {
      Input.consume('a');
      if (this.swim) return;
      if (tryInteract(this)) return;
      this.swingSword();
    } else if (Input.hit('b')) {
      Input.consume('b');
      if (this.swim) { toast('游泳时不能使用道具'); return; }
      useSelectedItem(this);
    }
  }
  swingSword() {
    if (!S.flags.gotSword) return;
    if (this.atkT > 0) return;
    this.atkT = 0.26; this.atkHit = new Set(); Sfx.play('swing');
  }
  swordBox() {
    const d = this.dir, x = this.x, y = this.y;
    if (d === 0) return { x: x - 2, y: y + 12, w: 20, h: 16 };
    if (d === 1) return { x: x - 2, y: y - 10, w: 20, h: 16 };
    if (d === 2) return { x: x - 14, y: y + 2, w: 16, h: 16 };
    return { x: x + 14, y: y + 2, w: 16, h: 16 };
  }
  swordHits() {
    if (this.atkT < 0.05) return;
    const sb = this.swordBox();
    const dmg = 1 + (S.swordLv || 0);
    for (const e of G.ents) {
      if (e.dead || !e.hittable || this.atkHit.has(e)) continue;
      if (rectsOverlap(sb, e.box())) { this.atkHit.add(e); e.hit(dmg, this.cx(), this.cy(), 'sword'); }
    }
    // 砍草丛/罐子
    const x0 = Math.floor(sb.x / TS), x1 = Math.floor((sb.x + sb.w) / TS), y0 = Math.floor(sb.y / TS), y1 = Math.floor((sb.y + sb.h) / TS);
    for (let ty = y0; ty <= y1; ty++) for (let tx = x0; tx <= x1; tx++) {
      const t = tileProps(tx, ty); if (!t || !t.cut) continue;
      const key = tx + ',' + ty; if (this.atkHit.has(key)) continue; this.atkHit.add(key);
      cutTile(tx, ty, t);
    }
  }
  draw(ctx, cx, cy) {
    const x = Math.round(this.x - cx), y = Math.round(this.y - cy);
    if (this.hurtT > 0 && Math.floor(this.hurtT * 20) % 2 === 0) return;
    if (this.swim) {
      const f = getCharFrames(this.look)[DIR_NAMES[this.dir]][0];
      ctx.drawImage(f, 0, 0, 16, 9, x, y + 5, 16, 9);
      ctx.fillStyle = 'rgba(255,255,255,0.7)'; const r = (G.t * 4) % 2;
      ctx.fillRect(x + 1 - r, y + 13, 14 + r * 2, 1);
      return;
    }
    // 影子
    ctx.fillStyle = 'rgba(0,0,0,0.2)'; ctx.fillRect(x + 3, y + 14, 10, 2);
    const bob = this.moving && this.frame ? -1 : 0;
    // 剑（上方向时剑画在身后）
    if (this.atkT > 0 && this.dir === 1) this.drawSword(ctx, x, y);
    drawChar(ctx, this.look, this.dir, this.frame, x, y + bob);
    if (this.atkT > 0 && this.dir !== 1) this.drawSword(ctx, x, y);
    if (this.toolT > 0 && this.toolItem) {
      const ic = getIcon(ITEMS[this.toolItem]);
      if (ic) { const d = DIRS[this.dir]; const k = 1 - this.toolT / 0.3; ctx.save(); ctx.translate(x + 8 + d[0] * 9, y + 8 + d[1] * 7); ctx.rotate((d[0] || 1) * (k * 1.2 - 0.6)); ctx.drawImage(ic, -6, -10, 12, 12); ctx.restore(); }
    }
  }
  drawSword(ctx, x, y) {
    const t = 1 - this.atkT / 0.26;
    const base = [Math.PI / 2, -Math.PI / 2, Math.PI, 0][this.dir];
    const ang = base + (-1.1 + t * 2.2) * (this.dir === 2 ? -1 : 1);
    ctx.save(); ctx.translate(x + 8, y + 10); ctx.rotate(ang);
    const col = ['#c8a070', '#e0905a', '#e8e8f0', '#ffd84a', '#6af0f0', '#fff0a0'][S.swordLv || 0];
    ctx.fillStyle = '#5a3a1a'; ctx.fillRect(2, -1, 4, 3);
    ctx.fillStyle = '#d8b040'; ctx.fillRect(5, -3, 2, 7);
    ctx.fillStyle = col; ctx.fillRect(7, -1, 11, 3); ctx.fillStyle = '#fff'; ctx.fillRect(7, -1, 11, 1);
    ctx.restore();
    // 刀光
    ctx.strokeStyle = 'rgba(255,255,255,' + (0.6 * (1 - t)) + ')'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(x + 8, y + 10, 16, base - 1.1, base - 1.1 + t * 2.2); ctx.stroke();
  }
}

// ============ 跟随灵兽 ============
function drawFollower(ctx, cx, cy) {
  const p = G.player; const mon = S.party.find(m => m.hp > 0);
  if (!mon || p.trail.length < 14 || G.map.isDungeon && G.map.dng === 'd5' && false) return null;
  const tr = p.trail[p.trail.length - 14];
  const look = SPECIES[mon.sp].look;
  const flip = tr[2] === 3;
  const bob = Math.sin(G.t * 8) > 0 ? 0 : -1;
  const tp = tileProps(Math.floor((tr[0] + 8) / TS), Math.floor((tr[1] + 12) / TS));
  if (tp && tp.water && !SPECIES[mon.sp].types.includes('water') && !SPECIES[mon.sp].types.includes('wind')) return;
  ctx.fillStyle = 'rgba(0,0,0,0.2)'; ctx.fillRect(Math.round(tr[0] - cx) + 4, Math.round(tr[1] - cy) + 14, 8, 2);
  drawMonLook(ctx, look, tr[0] - cx, tr[1] - cy + bob, 1, flip);
}

// ============ NPC ============
class NPC extends Ent {
  constructor(def, x, y) {
    super(x, y); this.def = def; this.dir = def.dir || 0; this.frame = 0; this.solid = true; this.hx = x; this.hy = y;
    this.moveT = rand(1, 3); this.mv = null; this.npc = true; this.hb = { x: 2, y: 6, w: 12, h: 10 }; this.emote = null;
  }
  update(dt) {
    if (this.emoteT > 0) this.emoteT -= dt;
    if (G.locked() && !this.scripted) return;
    if (this.def.trainer && !S.trainers[this.def.id] && !G.locked()) this.checkSight();
    if (!this.def.wander || this.talking) return;
    if (this.mv) {
      const d = DIRS[this.mv.d];
      const ok = moveBody(this, d[0] * 30 * dt, d[1] * 30 * dt, 'npc');
      this.mv.t -= dt; this.animT = (this.animT || 0) + dt; if (this.animT > 0.2) { this.animT = 0; this.frame ^= 1; }
      if (this.mv.t <= 0 || !ok) { this.mv = null; this.frame = 0; }
      return;
    }
    this.moveT -= dt;
    if (this.moveT <= 0) {
      this.moveT = rand(1.5, 4);
      const d = randi(0, 3); this.dir = d;
      const dd = DIRS[d]; const tx = this.x + dd[0] * 16, ty = this.y + dd[1] * 16;
      if (Math.abs(tx - this.hx) <= this.def.wander * 16 && Math.abs(ty - this.hy) <= this.def.wander * 16) this.mv = { d, t: 0.53 };
    }
  }
  checkSight() {
    const p = G.player, d = DIRS[this.dir];
    const dx = p.cx() - this.cx(), dy = p.cy() - this.cy();
    const along = dx * d[0] + dy * d[1], perp = Math.abs(dx * d[1]) + Math.abs(dy * d[0]);
    if (along > 0 && along < 16 * 5 && perp < 10) {
      // 视线中无阻挡
      for (let k = 16; k < along; k += 8) { if (tileSolidFor(Math.floor((this.cx() + d[0] * k) / TS), Math.floor((this.cy() + d[1] * k) / TS), 'npc')) return; }
      this.emoteT = 1; this.emote = '!';
      trainerSpotted(this);
    }
  }
  draw(ctx, cx, cy) {
    const x = Math.round(this.x - cx), y = Math.round(this.y - cy);
    ctx.fillStyle = 'rgba(0,0,0,0.2)'; ctx.fillRect(x + 3, y + 14, 10, 2);
    drawChar(ctx, this.def.look, this.dir, this.frame, x, y);
    if (this.emoteT > 0) { drawBox(ctx, x + 3, y - 14, 11, 12, 'dark'); drawText(ctx, this.emote, x + 8.5, y - 13, '#ffe060', 9, 'center', false, true); }
    else if (this.def.trainer && !S.trainers[this.def.id] && Math.sin(G.t * 3) > 0.95) { }
  }
}

// ============ 敌人 ============
class Enemy extends Ent {
  constructor(kind, x, y, room) {
    super(x, y);
    const k = ENEMY_KINDS[kind]; this.kind = kind; this.k = k; this.room = room;
    const tier = G.map.mine ? G.map.mine : 0;
    this.maxhp = Math.ceil(k.hp * (1 + tier / 60)); this.hp = this.maxhp; this.dmg = k.dmg + Math.floor(tier / 40);
    this.hittable = true; this.flash = 0; this.kb = null; this.t = rand(0, 1); this.vx = 0; this.vy = 0; this.state = 'idle';
    this.hb = { x: 2, y: 4, w: 12, h: 11 }; this.dir = 0; this.spawnT = 0.4;
  }
  who() { return this.k.fly ? 'fly' : 'enemy'; }
  update(dt) {
    if (this.spawnT > 0) { this.spawnT -= dt; return; }
    if (this.flash > 0) this.flash -= dt;
    if (this.kb) { moveBody(this, this.kb.x * dt, 0, this.who()); moveBody(this, 0, this.kb.y * dt, this.who()); this.kb.t -= dt; if (this.kb.t <= 0) this.kb = null; return; }
    if (this.stun > 0) { this.stun -= dt; return; }
    const p = G.player; const dx = p.cx() - this.cx(), dy = p.cy() - this.cy(), dist = Math.hypot(dx, dy) || 1;
    this.t -= dt;
    const sp = this.k.spd;
    switch (this.k.ai) {
      case 'hop':
        if (this.t <= 0) {
          if (this.state === 'hop') { this.state = 'idle'; this.t = rand(0.6, 1.4); this.vx = this.vy = 0; }
          else { this.state = 'hop'; this.t = 0.45; let a = dist < 110 && chance(0.7) ? Math.atan2(dy, dx) : rand(0, 6.28); this.vx = Math.cos(a) * sp * 2; this.vy = Math.sin(a) * sp * 2; }
        }
        break;
      case 'bat': {
        if (this.t <= 0) { this.t = rand(0.3, 0.8); let a = dist < 140 ? Math.atan2(dy, dx) + rand(-1, 1) : rand(0, 6.28); this.vx = Math.cos(a) * sp; this.vy = Math.sin(a) * sp; }
        break;
      }
      case 'chase':
        if (dist < 140) { this.vx = dx / dist * sp; this.vy = dy / dist * sp; }
        else if (this.t <= 0) { this.t = rand(1, 2); const a = rand(0, 6.28); this.vx = Math.cos(a) * sp * 0.5; this.vy = Math.sin(a) * sp * 0.5; }
        break;
      case 'crab':
        if (this.t <= 0) { this.t = rand(0.5, 1.2); if (chance(0.3)) { this.vx = this.vy = 0; } else { this.vx = Math.sign(dx || 1) * sp * (dist < 120 ? 1 : chance(0.5) ? 1 : -1); this.vy = dist < 120 ? Math.sign(dy) * sp * 0.3 : 0; } }
        break;
      case 'shooter':
        if (this.t <= 0) {
          this.t = rand(1.2, 2.2);
          if (dist < 150 && chance(0.6)) { this.vx = this.vy = 0; const a = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 0 : Math.PI) : (dy > 0 ? Math.PI / 2 : -Math.PI / 2); shoot(this.cx(), this.cy(), Math.cos(a) * 90, Math.sin(a) * 90, this.k.shot, 'enemy', this.dmg); }
          else { const a = randi(0, 3); this.vx = DIRS[a][0] * sp; this.vy = DIRS[a][1] * sp; }
        }
        break;
      case 'wisp':
        this.vx = dx / dist * sp; this.vy = dy / dist * sp;
        if (this.t <= 0) { this.t = rand(2.2, 3.2); if (dist < 170) { const a = Math.atan2(dy, dx); for (const o of [-0.3, 0, 0.3]) shoot(this.cx(), this.cy(), Math.cos(a + o) * 75, Math.sin(a + o) * 75, this.k.shot, 'enemy', this.dmg); } }
        break;
      case 'charge':
        if (this.state === 'tele') { this.vx = this.vy = 0; if (this.t <= 0) { this.state = 'dash'; this.t = 0.55; const a = Math.atan2(dy, dx); this.vx = Math.cos(a) * 170; this.vy = Math.sin(a) * 170; } }
        else if (this.state === 'dash') { if (this.t <= 0) { this.state = 'idle'; this.t = rand(0.8, 1.5); this.vx = this.vy = 0; } }
        else if (this.t <= 0) {
          if (dist < 110) { this.state = 'tele'; this.t = 0.45; }
          else { this.t = rand(0.8, 1.6); const a = rand(0, 6.28); this.vx = Math.cos(a) * sp * 0.6; this.vy = Math.sin(a) * sp * 0.6; }
        }
        break;
    }
    if (this.vx || this.vy) {
      const ox = this.x, oy = this.y;
      moveBody(this, this.vx * dt, 0, this.who()); moveBody(this, 0, this.vy * dt, this.who());
      if (this.x === ox && this.vx) this.vx = -this.vx * 0.5;
      if (this.y === oy && this.vy) this.vy = -this.vy * 0.5;
      if (Math.abs(this.vx) > Math.abs(this.vy)) this.dir = this.vx < 0 ? 2 : 3;
    }
    // 接触伤害
    if (rectsOverlap(this.box(), G.player.box())) hurtPlayer(this.dmg, this.cx(), this.cy());
  }
  hit(dmg, sx, sy, src) {
    if (this.spawnT > 0) return;
    this.hp -= dmg; this.flash = 0.2;
    const a = Math.atan2(this.cy() - sy, this.cx() - sx);
    this.kb = { x: Math.cos(a) * 180, y: Math.sin(a) * 180, t: 0.14 };
    Sfx.play('hit'); Particles.add(this.cx(), this.cy(), 5, '#fff', 50, 0.3);
    if (this.hp <= 0) this.die();
  }
  die() {
    this.dead = true; Sfx.play('kill');
    Particles.add(this.cx(), this.cy(), 14, SPECIES_LOOK_COLOR(this.k.look), 70, 0.5);
    S.stats.kills = (S.stats.kills || 0) + 1;
    for (const [it, p] of this.k.drops) if (chance(p)) { spawnPickup(this.cx() - 8 + rand(-4, 4), this.cy() - 8 + rand(-4, 4), it, it === 'coin' ? randi(5, 15) * (1 + Math.floor((G.map.tier || 1) / 2)) : 1); break; }
    onEnemyKilled(this);
  }
  draw(ctx, cx, cy) {
    if (this.spawnT > 0) { ctx.fillStyle = 'rgba(255,255,255,0.5)'; const r = this.spawnT * 20; ctx.beginPath(); ctx.arc(this.cx() - cx, this.cy() - cy, r, 0, 7); ctx.fill(); return; }
    const x = Math.round(this.x - cx), y = Math.round(this.y - cy);
    const hop = this.k.ai === 'hop' && this.state === 'hop' ? -Math.sin((0.45 - this.t) / 0.45 * Math.PI) * 4 : 0;
    const fl = this.k.fly ? Math.sin(G.t * 6 + this.x) * 2 - 3 : 0;
    ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.fillRect(x + 3, y + 14, 10, 2);
    let look = this.k.look;
    if (this.state === 'tele' && Math.floor(G.t * 20) % 2) look = Object.assign({}, look, { a: '#ffffff' });
    const flip = this.dir === 3;
    if (this.flash > 0) { ctx.drawImage(silhouette(getMonSprite(look, flip), '#ffffff'), x, y + hop + fl); }
    else drawMonLook(ctx, look, x, y + hop + fl, 1, flip);
  }
}
function SPECIES_LOOK_COLOR(look) { return look.a || '#fff'; }

// ============ 头目 ============
class Boss extends Ent {
  constructor(kind, x, y, room) {
    super(x - 16, y - 16);
    this.kind = kind; this.k = BOSS_KINDS[kind]; this.room = room; this.boss = true;
    this.maxhp = this.k.hp; this.hp = this.maxhp; this.dmg = this.k.dmg;
    this.hb = { x: 4, y: 6, w: 24, h: 24 }; this.hittable = true; this.flash = 0; this.pi = 0; this.state = 'intro'; this.t = 1.5; this.stun = 0; this.vx = 0; this.vy = 0; this.z = 0;
    this.armored = !!this.k.weak;
  }
  update(dt) {
    if (this.flash > 0) this.flash -= dt;
    if (this.stun > 0) { this.stun -= dt; if (this.stun <= 0 && this.k.weak) this.armored = true; this.z = 0; if (rectsOverlap(this.box(), G.player.box())) hurtPlayer(1, this.cx(), this.cy()); return; }
    const p = G.player; const dx = p.cx() - this.cx(), dy = p.cy() - this.cy(), dist = Math.hypot(dx, dy) || 1;
    const rage = this.hp < this.maxhp / 2 ? 1.35 : 1;
    this.t -= dt * rage;
    const st = this.state;
    if (st === 'intro' || st === 'idle') { this.vx = this.vy = 0; if (this.t <= 0) this.nextPat(); }
    else if (st === 'walk') { this.vx = dx / dist * 32 * rage; this.vy = dy / dist * 32 * rage; if (this.t <= 0) this.toIdle(); }
    else if (st === 'seeds') { this.vx = this.vy = 0; this.sT = (this.sT || 0) - dt * rage; if (this.sT <= 0) { this.sT = 0.45; const a = Math.atan2(dy, dx); shoot(this.cx(), this.cy(), Math.cos(a) * 110, Math.sin(a) * 110, this.k.shot, 'enemy', this.dmg); } if (this.t <= 0) this.toIdle(); }
    else if (st === 'slam') {
      if (this.t > 0.5) { this.z = Math.min(24, this.z + dt * 60); this.vx = dx / dist * 70; this.vy = dy / dist * 70; }
      else { this.vx = this.vy = 0; this.z = Math.max(0, this.z - dt * 120); }
      if (this.t <= 0) { this.z = 0; G.shake = 0.3; Sfx.play('bomb'); for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2; shoot(this.cx(), this.cy() + 8, Math.cos(a) * 80, Math.sin(a) * 80, this.k.shot, 'enemy', this.dmg); } this.toIdle(); }
    }
    else if (st === 'tele') { this.vx = this.vy = 0; if (this.t <= 0) { this.state = 'charge'; this.t = 1.2; const a = Math.atan2(dy, dx); this.vx = Math.cos(a) * 200; this.vy = Math.sin(a) * 200; } }
    else if (st === 'charge') { if (this.t <= 0) this.toIdle(); }
    else if (st === 'bubbles' || st === 'ring') { this.vx = this.vy = 0; if (this.t <= 0) { const n = st === 'ring' ? 16 : 12; const off = rand(0, 1); for (let i = 0; i < n; i++) { const a = (i + off) / n * Math.PI * 2; shoot(this.cx(), this.cy(), Math.cos(a) * 70, Math.sin(a) * 70, this.k.shot, 'enemy', this.dmg); } Sfx.play('fire'); this.toIdle(); } }
    else if (st === 'teleport') {
      this.vx = this.vy = 0;
      if (this.t <= 0.4 && !this.tp) { this.tp = true; const r = G.map.rooms[this.room]; this.x = r.ox * TS + rand(4, 22) * TS; this.y = r.oy * TS + rand(3, 9) * TS; Sfx.play('warp'); }
      if (this.t <= 0) { this.tp = false; this.toIdle(); }
    }
    else if (st === 'summon') { this.vx = this.vy = 0; if (this.t <= 0) { const cnt = G.ents.filter(e => e instanceof Enemy && !e.dead).length; if (cnt < 4) for (let i = 0; i < 2; i++) { const e = new Enemy(this.k.minion, this.cx() + rand(-40, 40) - 8, this.cy() + rand(10, 40) - 8, this.room); if (!boxBlocked(e.x + 2, e.y + 4, 12, 11, 'enemy')) G.ents.push(e); } this.toIdle(); } }
    if (this.vx || this.vy) {
      const ox = this.x, oy = this.y;
      moveBody(this, this.vx * dt, 0, 'enemy'); moveBody(this, 0, this.vy * dt, 'enemy');
      if (this.state === 'charge' && (this.x === ox && this.y === oy)) { G.shake = 0.25; Sfx.play('rock'); this.toIdle(); if (this.kind === 'crabking') { this.stun = 1.5; } }
    }
    if (this.z < 6 && rectsOverlap(this.box(), p.box())) hurtPlayer(this.dmg, this.cx(), this.cy());
  }
  toIdle() { this.state = 'idle'; this.t = 0.7; this.vx = this.vy = 0; }
  nextPat() {
    const pat = this.k.pats[this.pi++ % this.k.pats.length];
    this.state = pat === 'charge' ? 'tele' : pat;
    this.t = { walk: 1.8, seeds: 1.8, slam: 1.1, charge: 0.6, bubbles: 0.8, ring: 0.8, teleport: 0.9, summon: 0.8 }[pat] || 1;
  }
  hit(dmg, sx, sy, src) {
    if (this.state === 'intro') return;
    if (this.armored) {
      if (src === this.k.weak) { this.armored = false; this.stun = 3.5; this.state = 'idle'; this.t = 0.5; Sfx.play('secret'); Particles.text(this.cx(), this.y, '弱点！', '#ffe060'); Particles.add(this.cx(), this.cy(), 20, '#ffe060', 80, 0.6); return; }
      Sfx.play('cancel'); Particles.text(this.cx(), this.y, '叮！', '#ccc'); Particles.add(this.cx(), this.cy(), 4, '#fff', 40, 0.2);
      if (src === 'sword' && !this.hinted) { this.hinted = true; toast(this.k.weak === 'arrow' ? '剑砍不动……试试用弓箭射它！' : this.k.weak === 'bomb' ? '外壳太硬了！用炸弹炸开它的护甲！' : '冰甲太硬了！试试用火焰融化它！'); }
      return;
    }
    if (src !== 'sword' && src !== 'bomb' && src !== 'fireball' && src !== 'arrow') return;
    this.hp -= dmg; this.flash = 0.25; Sfx.play('hit'); Particles.add(this.cx(), this.cy(), 8, '#fff', 60, 0.4);
    if (this.hp <= 0) { this.dead = true; bossDefeated(this); }
  }
  draw(ctx, cx, cy) {
    const x = Math.round(this.x - cx), y = Math.round(this.y - cy);
    ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.beginPath(); ctx.ellipse(x + 16, y + 30, 13 - this.z / 4, 4, 0, 0, 7); ctx.fill();
    let look = this.k.look;
    if (this.state === 'tele' && Math.floor(G.t * 20) % 2) look = Object.assign({}, look, { a: '#ffffff' });
    const spr = getMonSprite(look, G.player.cx() > this.cx());
    const yy = y - this.z + (this.state === 'intro' ? Math.sin(G.t * 10) * 2 : 0);
    if (this.state === 'teleport' && this.t < 0.6 && this.t > 0.2) ctx.globalAlpha = 0.3;
    if (this.flash > 0) ctx.drawImage(silhouette(spr, '#ffffff'), x, yy, 32, 32);
    else ctx.drawImage(spr, x, yy, 32, 32);
    ctx.globalAlpha = 1;
    if (this.armored && !this.stun) { ctx.strokeStyle = 'rgba(200,220,255,' + (0.4 + Math.sin(G.t * 6) * 0.2) + ')'; ctx.lineWidth = 1; ctx.strokeRect(x + 2, yy + 2, 28, 28); }
    if (this.stun > 0) { for (let i = 0; i < 3; i++) { const a = G.t * 5 + i * 2.1; ctx.fillStyle = '#ffe060'; const sx = x + 16 + Math.cos(a) * 10, sy = yy - 2 + Math.sin(a) * 3; ctx.fillRect(sx - 1, sy - 2, 2, 5); ctx.fillRect(sx - 2.5, sy - 0.5, 5, 2); } }
  }
}

// ============ 弹道 ============
class Proj extends Ent {
  constructor(x, y, vx, vy, kind, owner, dmg) { super(x, y); this.vx = vx; this.vy = vy; this.kind = kind; this.owner = owner; this.dmg = dmg || 1; this.life = 3; this.hb = { x: -3, y: -3, w: 6, h: 6 }; }
  update(dt) {
    this.life -= dt; if (this.life <= 0) { this.dead = true; return; }
    this.x += this.vx * dt; this.y += this.vy * dt;
    const tx = Math.floor(this.x / TS), ty = Math.floor(this.y / TS);
    const t = tileProps(tx, ty);
    if (this.owner === 'player') {
      if (t && this.kind === 'arrow' && t.eye) { triggerEye(tx, ty); this.dead = true; return; }
      if (t && this.kind === 'fireball' && t.melt) { meltTile(tx, ty); this.dead = true; return; }
      if (t && this.kind === 'fireball' && t.torch && !t.lit) { lightTorch(tx, ty); this.dead = true; return; }
      for (const e of G.ents) {
        if (e.dead || !e.hittable) continue;
        if (rectsOverlap(this.box(), e.box())) { e.hit(this.dmg, this.x - this.vx * 0.05, this.y - this.vy * 0.05, this.kind); this.dead = true; Particles.add(this.x, this.y, 5, SHOT_COLOR[this.kind], 40, 0.3); return; }
      }
    } else {
      if (rectsOverlap(this.box(), G.player.box())) { hurtPlayer(this.dmg, this.x - this.vx * 0.1, this.y - this.vy * 0.1); this.dead = true; return; }
    }
    if (tileSolidFor(tx, ty, 'proj')) { this.dead = true; Particles.add(this.x, this.y, 4, SHOT_COLOR[this.kind], 30, 0.25); if (this.kind === 'arrow') Sfx.play('cut'); }
  }
  draw(ctx, cx, cy) {
    const x = this.x - cx, y = this.y - cy;
    if (this.kind === 'arrow') {
      ctx.save(); ctx.translate(x, y); ctx.rotate(Math.atan2(this.vy, this.vx));
      ctx.fillStyle = '#8a5a2a'; ctx.fillRect(-7, -0.5, 10, 1.5); ctx.fillStyle = '#d0d0d8'; ctx.fillRect(3, -1.5, 3, 3.5); ctx.fillStyle = '#e04848'; ctx.fillRect(-8, -1.5, 2, 3.5);
      ctx.restore(); return;
    }
    const c = SHOT_COLOR[this.kind] || '#fff';
    ctx.fillStyle = shade(c, -0.4); ctx.beginPath(); ctx.arc(x, y, 4, 0, 7); ctx.fill();
    ctx.fillStyle = c; ctx.beginPath(); ctx.arc(x, y, 3, 0, 7); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.fillRect(x - 1.5, y - 1.5, 1.5, 1.5);
    if (Math.random() < 0.3) Particles.add(this.x, this.y, 1, c, 10, 0.3);
  }
}
function shoot(x, y, vx, vy, kind, owner, dmg) { const p = new Proj(x, y, vx, vy, kind, owner, dmg); G.ents.push(p); return p; }

// ============ 炸弹 ============
class Bomb extends Ent {
  constructor(x, y) { super(x, y); this.t = 1.8; this.hb = { x: 4, y: 6, w: 8, h: 8 }; }
  update(dt) {
    this.t -= dt;
    if (this.t <= 0) this.explode();
  }
  explode() {
    this.dead = true; Sfx.play('bomb'); G.shake = 0.35;
    const cx = this.x + 8, cy = this.y + 10;
    Particles.add(cx, cy, 30, '#ffb020', 110, 0.5); Particles.add(cx, cy, 20, '#5a5a5a', 70, 0.8);
    G.ents.push(new Explosion(cx, cy));
    const R = 30;
    for (const e of G.ents) {
      if (e.dead || !e.hittable) continue;
      if (Math.hypot(e.cx() - cx, e.cy() - cy) < R + 10) e.hit(4, cx, cy, 'bomb');
    }
    if (Math.hypot(G.player.cx() - cx, G.player.cy() - cy) < R) hurtPlayer(2, cx, cy);
    const tx0 = Math.floor((cx - R) / TS), tx1 = Math.floor((cx + R) / TS), ty0 = Math.floor((cy - R) / TS), ty1 = Math.floor((cy + R) / TS);
    for (let ty = ty0; ty <= ty1; ty++) for (let tx = tx0; tx <= tx1; tx++) {
      const t = tileProps(tx, ty); if (!t) continue;
      if (Math.hypot(tx * TS + 8 - cx, ty * TS + 8 - cy) > R + 8) continue;
      if (t.bomb) bombTile(tx, ty, t);
      else if (t.pick && t.pick <= 2) breakRock(tx, ty, t, true);
      else if (t.cut) cutTile(tx, ty, t);
    }
  }
  draw(ctx, cx, cy) {
    const x = Math.round(this.x - cx), y = Math.round(this.y - cy);
    const ic = getIcon(ITEMS.bomb);
    if (this.t < 0.6 && Math.floor(this.t * 20) % 2) ctx.drawImage(silhouette(ic, '#ff4040'), x, y);
    else ctx.drawImage(ic, x, y);
  }
}
class Explosion extends Ent {
  constructor(x, y) { super(x, y); this.t = 0.3; }
  update(dt) { this.t -= dt; if (this.t <= 0) this.dead = true; }
  draw(ctx, cx, cy) { const k = 1 - this.t / 0.3; ctx.fillStyle = `rgba(255,${200 - k * 150},60,${1 - k})`; ctx.beginPath(); ctx.arc(this.x - cx, this.y - cy, 10 + k * 26, 0, 7); ctx.fill(); }
  sortY() { return 99999; }
}

// ============ 拾取物 ============
class Pickup extends Ent {
  constructor(x, y, item, n) { super(x, y); this.item = item; this.n = n || 1; this.t = 0; this.life = item === 'heart' || item === 'coin' ? 14 : 60; this.hb = { x: 3, y: 3, w: 10, h: 10 }; this.vy = -60; this.z = 0; }
  update(dt) {
    this.t += dt; this.life -= dt; if (this.life <= 0) { this.dead = true; return; }
    if (this.z < 0 || this.vy < 0) { this.vy += 300 * dt; this.z += this.vy * dt; if (this.z > 0) { this.z = 0; this.vy = 0; } }
    if (this.t > 0.3 && rectsOverlap(this.box(), G.player.box())) this.collect();
  }
  collect() {
    this.dead = true;
    if (this.item === 'heart') { S.hp = Math.min(S.maxhp, S.hp + 2); Sfx.play('pickup'); }
    else if (this.item === 'coin') { S.gold += this.n; Sfx.play('coin'); Particles.text(this.cx(), this.y, '+' + this.n + 'G', '#ffe060'); }
    else if (this.item === 'heartc') { S.maxhp = Math.min(30, S.maxhp + 2); S.hp = S.maxhp; Sfx.play('item'); bigMessage('获得了 心之容器！', '生命上限 +1'); }
    else { if (addItem(this.item, this.n)) { Sfx.play('pickup'); toastItem(this.item, this.n); } else { this.dead = false; this.t = -1; toast('背包满了！'); } }
  }
  draw(ctx, cx, cy) {
    if (this.life < 3 && Math.floor(this.life * 8) % 2) return;
    const x = Math.round(this.x - cx), y = Math.round(this.y - cy + this.z + Math.sin(this.t * 4) * 1.5);
    let ic;
    if (this.item === 'heart' || this.item === 'heartc') ic = getIcon({ id: '_heart', icon: 'heart', color: '#ff4060' });
    else if (this.item === 'coin') ic = getIcon({ id: '_coin', icon: 'coin', color: '#ffd030' });
    else ic = getIcon(ITEMS[this.item]);
    ctx.fillStyle = 'rgba(0,0,0,0.2)'; ctx.fillRect(Math.round(this.x - cx) + 4, Math.round(this.y - cy) + 13, 8, 2);
    if (this.item === 'heartc') ctx.drawImage(ic, x - 4, y - 8, 24, 24); else ctx.drawImage(ic, x + 2, y + 1, 12, 12);
  }
}
function spawnPickup(x, y, item, n) { const p = new Pickup(x, y, item, n); G.ents.push(p); return p; }

// ============ 宝箱 ============
class Chest extends Ent {
  constructor(spec) {
    super(spec.x * TS, spec.y * TS); this.spec = spec; this.solid = true; this.hb = { x: 1, y: 3, w: 14, h: 13 };
    this.open = isChestOpened(spec.cid); this.hidden = !this.open && !!spec.hidden; this.interact = true; this.appearT = 0;
  }
  update(dt) {
    if (this.appearT > 0) this.appearT -= dt;
    this.solid = !this.hidden;
    if (this.hidden) {
      const h = this.spec.hidden;
      if (h === 'plate') { if (G.ents.some(e => e instanceof PushBlock && e.onPlate)) this.reveal(); }
      else if (h === 'torch') { const r = G.map.rooms[this.spec.room]; let all = true, any = false; for (let y = r.oy; y < r.oy + RH; y++) for (let x = r.ox; x < r.ox + RW; x++) { const t = TILES[tAt(G.map, x, y)]; if (t.torch) { any = true; if (!t.lit) all = false; } } if (any && all) this.reveal(); }
      else if (h === true) { if (roomCleared(this.spec.room)) this.reveal(); }
    }
  }
  reveal() { this.hidden = false; this.appearT = 0.6; Sfx.play('secret'); Particles.add(this.x + 8, this.y + 8, 20, '#ffe060', 60, 0.6); }
  onInteract() {
    if (this.hidden) return false;
    if (this.open) { toast('宝箱是空的。'); return true; }
    this.open = true; markChestOpened(this.spec.cid);
    openChestReward(this.spec);
    return true;
  }
  draw(ctx, cx, cy) {
    if (this.hidden) return;
    const x = Math.round(this.x - cx), y = Math.round(this.y - cy);
    const big = this.spec.big;
    ctx.globalAlpha = this.appearT > 0 ? 1 - this.appearT / 0.6 : 1;
    const body = big ? '#3a6ad8' : '#a0602a', trim = big ? '#ffd040' : '#e8c040';
    ctx.fillStyle = '#2a1a10'; ctx.fillRect(x + 1, y + 4, 14, 12);
    ctx.fillStyle = body; ctx.fillRect(x + 2, y + (this.open ? 7 : 5), 12, this.open ? 8 : 10);
    if (!this.open) { ctx.fillStyle = shade(body, 0.2); ctx.fillRect(x + 2, y + 5, 12, 4); ctx.fillStyle = trim; ctx.fillRect(x + 2, y + 9, 12, 1); ctx.fillRect(x + 7, y + 8, 2, 3); }
    else { ctx.fillStyle = '#1a0a04'; ctx.fillRect(x + 3, y + 5, 10, 3); ctx.fillStyle = trim; ctx.fillRect(x + 2, y + 2, 12, 2); }
    ctx.globalAlpha = 1;
  }
}

// ============ 推箱 ============
class PushBlock extends Ent {
  constructor(spec) { super(spec.x * TS, spec.y * TS); this.spec = spec; this.solid = true; this.hb = { x: 0, y: 0, w: 16, h: 16 }; this.moving = null; this.onPlate = false; this.home = [this.x, this.y]; }
  push(dx, dy) {
    if (this.onPlate) return;
    const tx = Math.floor(this.x / TS) + dx, ty = Math.floor(this.y / TS) + dy;
    const t = tileProps(tx, ty); if (!t || t.solid || t.water || t.pit || t.lava) return;
    if (G.ents.some(e => e !== this && e.solid && !e.dead && rectsOverlap(e.box(), { x: tx * TS, y: ty * TS, w: 16, h: 16 }))) return;
    this.moving = { tx: tx * TS, ty: ty * TS, t: 0.25 }; Sfx.play('rock');
  }
  update(dt) {
    if (this.moving) {
      const m = this.moving; m.t -= dt;
      this.x = lerp(this.x, m.tx, Math.min(1, dt * 14)); this.y = lerp(this.y, m.ty, Math.min(1, dt * 14));
      if (m.t <= 0) { this.x = m.tx; this.y = m.ty; this.moving = null; const t = tileProps(Math.floor(this.x / TS), Math.floor(this.y / TS)); if (t && t.plate) { this.onPlate = true; Sfx.play('unlock'); } }
    }
  }
  draw(ctx, cx, cy) {
    const x = Math.round(this.x - cx), y = Math.round(this.y - cy);
    const th = THEMES[G.map.theme] || THEMES.forest;
    ctx.fillStyle = shade(th.wall, -0.3); ctx.fillRect(x, y, 16, 16);
    ctx.fillStyle = shade(th.wall, 0.15); ctx.fillRect(x + 1, y + 1, 14, 13);
    ctx.fillStyle = shade(th.wall, 0.35); ctx.fillRect(x + 2, y + 2, 12, 2);
    ctx.fillStyle = shade(th.wall, -0.1); ctx.fillRect(x + 5, y + 6, 6, 5);
  }
}

// ============ 采集物 ============
class Forage extends Ent {
  constructor(f) { super(f.x * TS, f.y * TS); this.f = f; this.hb = { x: 2, y: 2, w: 12, h: 12 }; this.t = Math.random() * 6; }
  update(dt) { this.t += dt; if (rectsOverlap(this.box(), G.player.box())) this.collect(); }
  collect() { if (!addItem(this.f.item, 1)) { return; } this.dead = true; this.f.taken = true; Sfx.play('pickup'); toastItem(this.f.item, 1); }
  draw(ctx, cx, cy) { const ic = getIcon(ITEMS[this.f.item]); const y = Math.round(this.y - cy + Math.sin(this.t * 2) * 1); ctx.fillStyle = 'rgba(0,0,0,0.15)'; ctx.fillRect(Math.round(this.x - cx) + 4, Math.round(this.y - cy) + 13, 8, 2); ctx.drawImage(ic, Math.round(this.x - cx) + 2, y + 1, 12, 12); }
  sortY() { return this.y; }
}

// ============ 出货箱 ============
class ShipBin extends Ent {
  constructor(x, y) { super(x * TS, y * TS); this.solid = true; this.interact = true; this.hb = { x: 0, y: 2, w: 16, h: 14 }; }
  onInteract() { openShipBin(); return true; }
  draw(ctx, cx, cy) {
    const x = Math.round(this.x - cx), y = Math.round(this.y - cy);
    ctx.fillStyle = '#3a2410'; ctx.fillRect(x, y + 3, 16, 13);
    ctx.fillStyle = '#9a6232'; ctx.fillRect(x + 1, y + 6, 14, 9);
    ctx.fillStyle = '#c08850'; ctx.fillRect(x + 1, y + 3, 14, 3);
    ctx.fillStyle = '#6a4220'; ctx.fillRect(x + 1, y + 10, 14, 1);
    if (S.ship.length) { ctx.fillStyle = '#ffd040'; ctx.fillRect(x + 6, y, 4, 3); }
  }
}

// ============ 地块交互动作 ============
function cutTile(tx, ty, t) {
  const m = G.map;
  const base = BASE_TILE[m.under[ty * m.w + tx] || 'grass'] || 'GRASS';
  setT(m, tx, ty, base);
  Sfx.play('cut');
  const col = t.pot ? '#b8683a' : '#4aa040';
  Particles.add(tx * TS + 8, ty * TS + 8, 10, col, 50, 0.4);
  const r = Math.random();
  if (t.pot) { if (r < 0.3) spawnPickup(tx * TS, ty * TS, 'heart'); else if (r < 0.6) spawnPickup(tx * TS, ty * TS, 'coin', randi(3, 12) * (m.tier || 1)); else if (r < 0.7 && S.flags.bow) spawnPickup(tx * TS, ty * TS, 'arrow', 5); else if (r < 0.78 && S.flags.bombs) spawnPickup(tx * TS, ty * TS, 'bomb', 2); }
  else { if (r < 0.12) spawnPickup(tx * TS, ty * TS, 'heart'); else if (r < 0.22) spawnPickup(tx * TS, ty * TS, 'coin', randi(1, 5)); else if (r < 0.3) spawnPickup(tx * TS, ty * TS, Math.random() < 0.5 ? 'herb' : 'wildberry', 1); }
}
function breakRock(tx, ty, t, byBomb) {
  const m = G.map; const idx = ty * m.w + tx;
  const base = BASE_TILE[m.under[idx] || 'grass'] || 'GRASS';
  setT(m, tx, ty, base);
  Sfx.play('rock'); Particles.add(tx * TS + 8, ty * TS + 8, 12, '#9a9a9a', 60, 0.5);
  if (m.isFarm) persistTile(tx, ty);
  const drop = (it, n) => spawnPickup(tx * TS + rand(-3, 3), ty * TS + rand(-3, 3), it, n);
  if (t.ore === 'gem') { drop(pick(m.mine >= 50 ? ['emerald', 'ruby', 'diamond', 'topaz', 'amethyst'] : ['quartz', 'amethyst', 'topaz', 'quartz']), 1); }
  else if (t.ore) { drop(t.ore, randi(1, 3)); }
  else { drop('stone', randi(1, 2)); if (chance(0.05)) drop('copper', 1); if (m.mine && chance(0.04)) drop('quartz', 1); }
  if (m.mine && chance(0.012)) drop('starshard', 1);
  // 矿洞梯子
  if (m.mine) {
    if (idx === m.ladderIdx || (!m.ladderFound && chance(0.02))) { setT(m, tx, ty, 'LADDERD'); m.ladderFound = true; Sfx.play('secret'); }
  }
}
function bombTile(tx, ty, t) {
  const m = G.map;
  const nm = TILES[m.t[ty * m.w + tx]].name;
  if (nm === 'DCRACK') { openDoorAt(tx, ty); }
  else { const base = BASE_TILE[m.under[ty * m.w + tx] || m.base] || 'ROCKY'; setT(m, tx, ty, base); persistTile(tx, ty); }
  Sfx.play('secret');
}
function meltTile(tx, ty) {
  const m = G.map; const nm = TILES[m.t[ty * m.w + tx]].name;
  Particles.add(tx * TS + 8, ty * TS + 8, 20, '#a8e4f8', 60, 0.6); Sfx.play('fire');
  if (nm === 'DICE') openDoorAt(tx, ty);
  else { setT(m, tx, ty, BASE_TILE[m.under[ty * m.w + tx] || 'snow'] || 'SNOW'); if (m.id === 'snow') setT(m, tx, ty, 'PATH'); persistTile(tx, ty); }
}
function lightTorch(tx, ty) { setT(G.map, tx, ty, 'TORCHL'); Sfx.play('fire'); }
function triggerEye(tx, ty) {
  const m = G.map; Sfx.play('secret');
  if (m.isDungeon) {
    setT(m, tx, ty, 'DEYEOFF');
    const rk = Math.floor(tx / RW) + ',' + Math.floor(ty / RH);
    for (const d of m.doors) if (d.type === 'eye' && d.eyeRoom === rk) openDoor(d);
  } else {
    setT(m, tx, ty, 'EYEOFF'); persistTile(tx, ty);
    if (m.id === 'beach') { setT(m, 23, 7, 'SAND'); persistTile(23, 7); S.flags.beachGate = true; toast('封印之门打开了！'); }
  }
}
