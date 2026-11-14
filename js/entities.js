'use strict';
// ============ 敌人 ============
const ENEMY_KINDS = {
  slime: { name: '史莱姆', look: { tpl: 'blob', a: '#7ad05a' }, hp: 2, dmg: 1, spd: 30, ai: 'hop' },
  slime2: { name: '蓝史莱姆', look: { tpl: 'blob', a: '#4a8af0' }, hp: 3, dmg: 1, spd: 36, ai: 'hop' },
  bat: { name: '蝙蝠', look: { tpl: 'bat', a: '#6a4a8a' }, hp: 1, dmg: 1, spd: 55, ai: 'bat', fly: true },
  firebat: { name: '火焰蝙蝠', look: { tpl: 'bat', a: '#e0502a', r: '#ffd040' }, hp: 2, dmg: 2, spd: 62, ai: 'bat', fly: true },
  bat3: { name: '暗影蝙蝠', look: { tpl: 'bat', a: '#3a1a4a', r: '#f03a3a' }, hp: 3, dmg: 2, spd: 66, ai: 'bat', fly: true },
  skel: { name: '骷髅兵', look: { tpl: 'knight', a: '#e8e4d8', b: '#a8a498' }, hp: 3, dmg: 1, spd: 34, ai: 'chase' },
  skel3: { name: '亡灵骑士', look: { tpl: 'knight', a: '#a89ab8', r: '#f03a3a' }, hp: 5, dmg: 2, spd: 40, ai: 'chase' },
  crab: { name: '螃蟹', look: { tpl: 'crab', a: '#e85a3a', d: '#c0402a' }, hp: 3, dmg: 1, spd: 52, ai: 'crab' },
  octo: { name: '喷石章鱼', look: { tpl: 'blob', a: '#d06a8a' }, hp: 2, dmg: 1, spd: 25, ai: 'shooter', shot: 'rock' },
  octo2: { name: '喷火章鱼', look: { tpl: 'blob', a: '#e0602a', r: '#ffd040' }, hp: 3, dmg: 2, spd: 28, ai: 'shooter', shot: 'fire' },
  wisp: { name: '鬼火', look: { tpl: 'ghost', a: '#ff8a3a' }, hp: 3, dmg: 1, spd: 22, ai: 'wisp', fly: true, shot: 'fire' },
  wisp2: { name: '暗魂', look: { tpl: 'ghost', a: '#8a4ad0' }, hp: 4, dmg: 2, spd: 26, ai: 'wisp', fly: true, shot: 'shadow' },
  knight: { name: '铁甲兵', look: { tpl: 'knight', a: '#8a8aa0', b: '#5a5a70' }, hp: 5, dmg: 2, spd: 30, ai: 'chase' },
  ant: { name: '大蚂蚁', look: { tpl: 'bug', a: '#c03a2a', d: '#5a1a10' }, hp: 2, dmg: 1, spd: 40, ai: 'chase' },
  ladybug: { name: '瓢虫', look: { tpl: 'bug', a: '#e84040', d: '#1a1a1a' }, hp: 2, dmg: 1, spd: 30, ai: 'hop' },
  spider: { name: '蜘蛛', look: { tpl: 'crab', a: '#4a3a5a', d: '#2a1a3a' }, hp: 3, dmg: 1, spd: 48, ai: 'crab' },
};
const BOSS_KINDS = {
  beetle: { name: '铁甲甲虫王', look: { tpl: 'bug', a: '#3a6a3a', d: '#1a3a1a', horn: '#d0d0d0' }, hp: 8, dmg: 1, weak: 'boomerang', pats: ['walk', 'charge', 'walk', 'summon'], minion: 'slime', shot: 'rock' },
  crabking: { name: '岩壳巨蟹', look: { tpl: 'crab', a: '#4a6ad0', d: '#2a3a8a' }, hp: 10, dmg: 2, weak: 'bomb', pats: ['charge', 'bubbles', 'walk', 'seeds'], minion: 'crab', shot: 'bubble' },
  lavagolem: { name: '熔岩魔像', look: { tpl: 'golem', a: '#a03a2a', c: '#ff9a40', d: '#2a1010' }, hp: 12, dmg: 2, weak: null, pats: ['walk', 'slam', 'seeds', 'slam', 'summon'], minion: 'firebat', shot: 'fire' },
  wizard: { name: '暗影巫师', look: { tpl: 'spirit', a: '#3a2a5a', c: '#6a4a9a', d: '#1a0a2a', crown: true }, hp: 16, dmg: 2, weak: 'arrow', pats: ['teleport', 'ring', 'seeds', 'summon', 'teleport', 'slam'], minion: 'wisp2', shot: 'shadow' },
};
const SHOT_COLOR = { rock: '#8a7a6a', fire: '#ff7020', shadow: '#a050f0', bubble: '#8ad0ff', wave: '#ffcf60' };

// ============ 碰撞 ============
function tileProps(tx, ty) { const id = tAt(G.map, tx, ty); return id < 0 ? null : TILES[id]; }
function tileSolidFor(tx, ty, who) {
  const m = G.map;
  if (tx < 0 || ty < 0 || tx >= m.w || ty >= m.h) {
    if (who === 'player') { const side = tx < 0 ? 'w' : tx >= m.w ? 'e' : ty < 0 ? 'n' : 's'; return !m.exits[side]; }
    return true;
  }
  const t = TILES[m.t[ty * m.w + tx]];
  if (t.tinyPass) return !(who === 'player' && S.tiny);
  if (t.water) return who !== 'fly' && who !== 'proj';
  if (t.pit || t.lava) return who !== 'player' && who !== 'fly' && who !== 'proj';
  return !!t.solid;
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
  const hb = e.hb; let moved = false;
  if (dx) {
    const nx = e.x + dx;
    if (!boxBlocked(nx + hb.x, e.y + hb.y, hb.w, hb.h, who, e)) { e.x = nx; moved = true; }
    else if (who === 'player' && !dy) for (let k = 1; k <= 6; k++) { let done = false; for (const s of [-1, 1]) if (!boxBlocked(nx + hb.x, e.y + hb.y + s * k, hb.w, hb.h, who, e)) { e.y += s * Math.min(1, Math.abs(dx)); done = true; break; } if (done) break; }
  }
  if (dy) {
    const ny = e.y + dy;
    if (!boxBlocked(e.x + hb.x, ny + hb.y, hb.w, hb.h, who, e)) { e.y = ny; moved = true; }
    else if (who === 'player' && !dx) for (let k = 1; k <= 6; k++) { let done = false; for (const s of [-1, 1]) if (!boxBlocked(e.x + hb.x + s * k, ny + hb.y, hb.w, hb.h, who, e)) { e.x += s * Math.min(1, Math.abs(dy)); done = true; break; } if (done) break; }
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
const HERO_LOOK = { hair: '#7a4a24', shirt: '#3a9a5a', pants: '#e8d8b0', skin: '#f5cba7', shoes: '#5a3a1a' };
const TINY_ROWS = ['...kk...', '..khhk..', '.khhhhk.', '.kseesk.', '..kssk..', '.kcccck.', '..kcck..', '..kppk..', '..k..k..'];
let tinyCanvas = null;
function tinySprite() { if (!tinyCanvas) tinyCanvas = buildSprite(TINY_ROWS, charPal(HERO_LOOK)); return tinyCanvas; }
class Player extends Ent {
  constructor(x, y) {
    super(x, y); this.dir = 0; this.frame = 0; this.animT = 0; this.moving = false;
    this.atkT = 0; this.atkHit = new Set(); this.hurtT = 0; this.kb = null;
    this.charge = 0; this.charging = false; this.spinT = 0; this.z = 0; this.vz = 0; this.safe = null; this.safeT = 0;
    this.pushT = 0; this.look = HERO_LOOK; this.itemCD = 0;
  }
  get small() { return S.tiny && !G.map.mini; }
  updHB() { this.hb = this.small ? { x: 5, y: 11, w: 6, h: 4 } : { x: 3, y: 8, w: 10, h: 8 }; }
  update(dt) {
    this.updHB();
    const locked = G.locked();
    if (this.hurtT > 0) this.hurtT -= dt;
    if (this.itemCD > 0) this.itemCD -= dt;
    if (this.atkT > 0) { this.atkT -= dt; this.swordHits(this.swordBox()); }
    if (this.spinT > 0) { this.spinT -= dt; this.swordHits(this.spinBox(), 2); }
    // 跳跃
    if (this.z > 0 || this.vz > 0) { this.vz -= 620 * dt; this.z = Math.max(0, this.z + this.vz * dt); if (this.z === 0) { this.vz = 0; Sfx.play('step'); } }
    if (this.kb) { moveBody(this, this.kb.x * dt, 0, 'player'); moveBody(this, 0, this.kb.y * dt, 'player'); this.kb.t -= dt; if (this.kb.t <= 0) this.kb = null; }
    // 蓄力回旋斩
    if (!locked && this.atkT <= 0 && this.spinT <= 0) {
      if (Input.held.a && (this.charging || this.chargeReady)) { this.charging = true; this.charge += dt; if (this.charge >= 0.55 && !this.chargeFull) { this.chargeFull = true; Sfx.play('select'); } }
      else if (this.charging) {
        if (this.chargeFull) { this.spinT = 0.35; this.atkHit = new Set(); Sfx.play('swing'); Sfx.play('fire'); }
        this.charging = false; this.charge = 0; this.chargeFull = false;
      }
      this.chargeReady = false;
    }
    let dx = 0, dy = 0;
    if (!locked && this.atkT <= 0 && this.spinT <= 0) {
      if (Input.held.left) dx -= 1; if (Input.held.right) dx += 1;
      if (Input.held.up) dy -= 1; if (Input.held.down) dy += 1;
      if (!this.charging) { if (Input.hit('left')) this.dir = 2; else if (Input.hit('right')) this.dir = 3; else if (Input.hit('up')) this.dir = 1; else if (Input.hit('down')) this.dir = 0; }
    }
    this.moving = !!(dx || dy);
    if (this.moving) {
      const cur = DIRS[this.dir];
      if (!this.charging && !((cur[0] && cur[0] === dx) || (cur[1] && cur[1] === dy))) { if (dx) this.dir = dx < 0 ? 2 : 3; else this.dir = dy < 0 ? 1 : 0; }
      let sp = this.small ? 58 : 80;
      if (this.charging) sp = 42;
      if (this.z > 0) sp = 98;
      const tp = this.tileUnder(); if (tp && tp.tall && this.z === 0) sp *= 0.85;
      const len = Math.hypot(dx, dy), ox = this.x, oy = this.y;
      moveBody(this, dx / len * sp * dt, 0, 'player'); moveBody(this, 0, dy / len * sp * dt, 'player');
      const dist = Math.hypot(this.x - ox, this.y - oy);
      this.animT += dt * (dist > 0.1 ? 1 : 0.3);
      if (this.animT > 0.15) { this.animT = 0; this.frame ^= 1; if (dist > 0.1 && this.frame === 0 && this.z === 0) Sfx.play('step'); }
      if (dist < 0.05) this.tryPush(dx, dy, dt);
    } else { this.frame = 0; this.pushT = 0; }
    // 落坑 / 熔岩
    const tp = this.tileUnder();
    if (this.z === 0 && tp && !locked) {
      if (tp.pit || tp.water) { this.fall(); return; }
      if (tp.lava) { hurtPlayer(1, this.cx(), this.cy(), true); this.fall(); return; }
      this.safeT -= dt;
      if (this.safeT <= 0) {
        this.safeT = 0.2;
        let ok = true;
        for (let oy = -10; oy <= 10 && ok; oy += 10) for (let ox = -10; ox <= 10; ox += 10) { const t = tileProps(Math.floor((this.cx() + ox) / TS), Math.floor((this.cy() + oy) / TS)); if (t && (t.pit || t.lava || (t.water && !t.solid))) { ok = false; break; } }
        if (ok) this.safe = { x: this.x, y: this.y };
      }
    }
    if (!locked) this.checkWarps();
    if (!locked) this.actions();
  }
  fall() {
    const back = this.safe || G.roomEntry || { x: this.x, y: this.y - 16 };
    runScript(async () => {
      Sfx.play('fail');
      for (let i = 0; i < 8; i++) { this.fallScale = 1 - i / 8; await wait(0.03); }
      this.fallScale = null; this.x = back.x; this.y = back.y; this.hurtT = 1;
      S.hp -= 1; if (S.hp <= 0) { S.hp = 0; playerDie(); }
    });
  }
  tileUnder() { return tileProps(Math.floor(this.cx() / TS), Math.floor(this.cy() / TS)); }
  tilePos() { return [Math.floor(this.cx() / TS), Math.floor(this.cy() / TS)]; }
  facingTile(off) { const d = DIRS[this.dir]; return [Math.floor((this.cx() + d[0] * (off || 14)) / TS), Math.floor((this.cy() + d[1] * (off || 14)) / TS)]; }
  tryPush(dx, dy, dt) {
    if (dx && dy) return;
    const d = DIRS[this.dir], px = this.cx() + d[0] * 10, py = this.cy() + d[1] * 8;
    const blk = G.ents.find(e => e instanceof PushBlock && !e.moving && px >= e.x && px < e.x + 16 && py >= e.y && py < e.y + 16);
    if (!blk) {
      this.pushT = 0;
      const [tx, ty] = this.facingTile(10); const t = tileProps(tx, ty);
      if (t && t.lock && !(this.lockT > G.t)) { this.lockT = G.t + 1.2; tryUnlock(tx, ty, t); }
      if (t && t.tinyPass && !S.tiny && !(this.tinyHintT > G.t)) { this.tinyHintT = G.t + 4; toast('这个洞太小了……变小才能钻过去'); }
      return;
    }
    if (this.small) return;
    this.pushT += dt;
    if (this.pushT > 0.35) { this.pushT = 0; blk.push(d[0], d[1]); }
  }
  checkWarps() {
    const m = G.map, [tx, ty] = this.tilePos(), cx = this.cx(), cy = this.cy();
    let side = null;
    if (cx < 0) side = 'w'; else if (cx >= m.w * TS) side = 'e'; else if (cy < 0) side = 'n'; else if (cy >= m.h * TS) side = 's';
    if (side && m.exits[side]) { edgeExit(side); return; }
    const w = m.warps[ty * m.w + tx];
    if (w) { useWarp(w); return; }
    const t = tileProps(tx, ty);
    if (t && t.exit) exitInterior();
  }
  actions() {
    if (Input.hit('next')) cycleItem(1);
    if (Input.hit('prev')) cycleItem(-1);
    if (Input.hit('a')) {
      Input.consume('a');
      const t = this.tileUnder();
      if (t && t.shrink && this.z === 0) { toggleTiny(); return; }
      if (tryInteract(this)) return;
      this.swing();
    } else if (Input.hit('b')) { Input.consume('b'); useItem(this); }
  }
  swing() {
    if (!S.flags.gotSword) return;
    if (this.atkT > 0 || this.spinT > 0) return;
    this.atkT = 0.24; this.atkHit = new Set(); this.chargeReady = true; Sfx.play('swing');
  }
  swordBox() {
    const d = this.dir, x = this.x, y = this.y;
    if (this.small) { const c = [this.cx() + DIRS[d][0] * 7, this.cy() + DIRS[d][1] * 7]; return { x: c[0] - 5, y: c[1] - 5, w: 10, h: 10 }; }
    if (d === 0) return { x: x - 2, y: y + 12, w: 20, h: 15 };
    if (d === 1) return { x: x - 2, y: y - 8, w: 20, h: 15 };
    if (d === 2) return { x: x - 13, y: y + 3, w: 16, h: 15 };
    return { x: x + 13, y: y + 3, w: 16, h: 15 };
  }
  spinBox() { const r = this.small ? 10 : 22; return { x: this.cx() - r, y: this.cy() - r, w: r * 2, h: r * 2 }; }
  swordHits(sb, mul) {
    const dmg = (mul || 1);
    for (const e of G.ents) {
      if (e.dead || !e.hittable || this.atkHit.has(e)) continue;
      if (rectsOverlap(sb, e.box())) { this.atkHit.add(e); e.hit(dmg, this.cx(), this.cy(), 'sword'); }
    }
    const x0 = Math.floor(sb.x / TS), x1 = Math.floor((sb.x + sb.w) / TS), y0 = Math.floor(sb.y / TS), y1 = Math.floor((sb.y + sb.h) / TS);
    for (let ty = y0; ty <= y1; ty++) for (let tx = x0; tx <= x1; tx++) {
      const t = tileProps(tx, ty); if (!t) continue;
      const key = tx + ',' + ty; if (this.atkHit.has(key)) continue; this.atkHit.add(key);
      if (t.cut && !(this.small && !t.tall)) cutTile(tx, ty, t);
      else if (t.crystal) hitCrystal(tx, ty);
    }
  }
  draw(ctx, cx, cy) {
    let x = Math.round(this.x - cx), y = Math.round(this.y - cy);
    if (this.hurtT > 0 && Math.floor(this.hurtT * 20) % 2 === 0) return;
    if (this.small) {
      ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.fillRect(x + 5, y + 14, 6, 2);
      const bob = this.moving && this.frame ? -1 : 0;
      ctx.drawImage(tinySprite(), x + 4, y + 6 + bob - this.z);
      if (Math.sin(G.t * 5) > 0.7) { ctx.fillStyle = '#c0ffc0'; ctx.fillRect(x + 8, y + 3 - this.z, 1, 1); }
      if (this.atkT > 0 || this.spinT > 0) { ctx.strokeStyle = 'rgba(255,255,255,0.7)'; ctx.beginPath(); ctx.arc(this.cx() - cx, this.cy() - cy, 8, 0, Math.PI * 2 * (this.spinT > 0 ? 1 - this.spinT / 0.35 : 1 - this.atkT / 0.24)); ctx.stroke(); }
      return;
    }
    ctx.fillStyle = 'rgba(0,0,0,0.22)'; ctx.fillRect(x + 3 + Math.min(2, this.z / 6), y + 14, 10 - Math.min(4, this.z / 4), 2);
    y -= Math.round(this.z);
    const bob = this.moving && this.frame ? -1 : 0;
    if (this.spinT > 0) {
      const k = 1 - this.spinT / 0.35; const dirs = [0, 3, 1, 2]; const d = dirs[Math.floor(k * 4) % 4];
      drawChar(ctx, this.look, d, 0, x, y);
      const a = k * Math.PI * 2 + Math.PI / 2;
      this.drawBlade(ctx, x + 8, y + 10, a);
      ctx.strokeStyle = `rgba(255,255,200,${0.8 * (1 - k)})`; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(x + 8, y + 10, 18, a - 2.5, a); ctx.stroke(); ctx.lineWidth = 1;
      return;
    }
    const showSword = this.atkT > 0 || this.charging;
    if (showSword && this.dir === 1) this.drawSword(ctx, x, y);
    drawChar(ctx, this.look, this.dir, this.frame, x, y + bob);
    if (showSword && this.dir !== 1) this.drawSword(ctx, x, y);
    if (this.toolT > G.t && this.toolItem) { const ic = getIcon(ITEMS[this.toolItem]); const d = DIRS[this.dir]; ctx.drawImage(ic, x + 4 + d[0] * 10, y + 2 + d[1] * 8, 10, 10); }
  }
  drawBlade(ctx, x, y, ang) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(ang);
    ctx.fillStyle = '#5a3a1a'; ctx.fillRect(2, -1, 4, 3); ctx.fillStyle = '#d8b040'; ctx.fillRect(5, -3, 2, 7);
    ctx.fillStyle = this.chargeFull && Math.floor(G.t * 16) % 2 ? '#fff6a0' : '#e8e8f4'; ctx.fillRect(7, -1, 11, 3); ctx.fillStyle = '#fff'; ctx.fillRect(7, -1, 11, 1);
    ctx.restore();
  }
  drawSword(ctx, x, y) {
    const base = [Math.PI / 2, -Math.PI / 2, Math.PI, 0][this.dir];
    if (this.charging) { this.drawBlade(ctx, x + 8, y + 10, base); if (this.chargeFull) Particles.add(this.cx() + DIRS[this.dir][0] * 18, this.cy() - 2 + DIRS[this.dir][1] * 16, 1, '#fff6a0', 20, 0.3); return; }
    const t = 1 - this.atkT / 0.24;
    const ang = base + (-1.1 + t * 2.2) * (this.dir === 2 ? -1 : 1);
    this.drawBlade(ctx, x + 8, y + 10, ang);
    ctx.strokeStyle = 'rgba(255,255,255,' + (0.6 * (1 - t)) + ')'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(x + 8, y + 10, 16, base - 1.1, base - 1.1 + t * 2.2); ctx.stroke(); ctx.lineWidth = 1;
  }
}

// ============ NPC ============
class NPC extends Ent {
  constructor(def, x, y) { super(x, y); this.def = def; this.dir = def.dir || 0; this.frame = 0; this.solid = true; this.hx = x; this.hy = y; this.moveT = rand(1, 3); this.mv = null; this.npc = true; this.hb = { x: 2, y: 6, w: 12, h: 10 }; }
  update(dt) {
    if (G.locked() || !this.def.wander || this.talking) return;
    if (this.mv) {
      const d = DIRS[this.mv.d]; const ok = moveBody(this, d[0] * 28 * dt, d[1] * 28 * dt, 'npc');
      this.mv.t -= dt; this.animT = (this.animT || 0) + dt; if (this.animT > 0.2) { this.animT = 0; this.frame ^= 1; }
      if (this.mv.t <= 0 || !ok) { this.mv = null; this.frame = 0; }
      return;
    }
    this.moveT -= dt;
    if (this.moveT <= 0) {
      this.moveT = rand(1.5, 4); const d = randi(0, 3); this.dir = d; const dd = DIRS[d];
      if (Math.abs(this.x + dd[0] * 16 - this.hx) <= this.def.wander * 16 && Math.abs(this.y + dd[1] * 16 - this.hy) <= this.def.wander * 16) this.mv = { d, t: 0.57 };
    }
  }
  draw(ctx, cx, cy) {
    const x = Math.round(this.x - cx), y = Math.round(this.y - cy);
    ctx.fillStyle = 'rgba(0,0,0,0.2)'; ctx.fillRect(x + 3, y + 14, 10, 2);
    drawChar(ctx, this.def.look, this.dir, this.frame, x, y);
  }
}

// ============ 敌人 ============
class Enemy extends Ent {
  constructor(kind, x, y, room) {
    super(x, y);
    const k = ENEMY_KINDS[kind]; this.kind = kind; this.k = k; this.room = room;
    this.maxhp = k.hp; this.hp = k.hp; this.dmg = k.dmg; this.hittable = true; this.flash = 0; this.kb = null; this.t = rand(0, 1); this.vx = 0; this.vy = 0; this.state = 'idle'; this.stun = 0;
    this.hb = { x: 2, y: 4, w: 12, h: 11 }; this.dir = 0; this.spawnT = 0.4;
  }
  who() { return this.k.fly ? 'fly' : 'enemy'; }
  update(dt) {
    if (this.spawnT > 0) { this.spawnT -= dt; return; }
    if (this.flash > 0) this.flash -= dt;
    if (this.kb) { moveBody(this, this.kb.x * dt, 0, this.who()); moveBody(this, 0, this.kb.y * dt, this.who()); this.kb.t -= dt; if (this.kb.t <= 0) this.kb = null; return; }
    if (this.stun > 0) { this.stun -= dt; return; }
    const p = G.player, dx = p.cx() - this.cx(), dy = p.cy() - this.cy(), dist = Math.hypot(dx, dy) || 1;
    this.t -= dt; const sp = this.k.spd;
    switch (this.k.ai) {
      case 'hop':
        if (this.t <= 0) {
          if (this.state === 'hop') { this.state = 'idle'; this.t = rand(0.6, 1.4); this.vx = this.vy = 0; }
          else { this.state = 'hop'; this.t = 0.45; const a = dist < 100 && chance(0.7) ? Math.atan2(dy, dx) : rand(0, 6.28); this.vx = Math.cos(a) * sp * 2; this.vy = Math.sin(a) * sp * 2; }
        } break;
      case 'bat':
        if (this.t <= 0) { this.t = rand(0.3, 0.8); const a = dist < 130 ? Math.atan2(dy, dx) + rand(-1, 1) : rand(0, 6.28); this.vx = Math.cos(a) * sp; this.vy = Math.sin(a) * sp; } break;
      case 'chase':
        if (dist < 120) { this.vx = dx / dist * sp; this.vy = dy / dist * sp; }
        else if (this.t <= 0) { this.t = rand(1, 2); const a = rand(0, 6.28); this.vx = Math.cos(a) * sp * 0.5; this.vy = Math.sin(a) * sp * 0.5; } break;
      case 'crab':
        if (this.t <= 0) { this.t = rand(0.5, 1.2); if (chance(0.3)) this.vx = this.vy = 0; else { this.vx = Math.sign(dx || 1) * sp * (dist < 110 ? 1 : chance(0.5) ? 1 : -1); this.vy = dist < 110 ? Math.sign(dy) * sp * 0.3 : 0; } } break;
      case 'shooter':
        if (this.t <= 0) {
          this.t = rand(1.3, 2.3);
          if (dist < 140 && chance(0.6)) { this.vx = this.vy = 0; const a = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 0 : Math.PI) : (dy > 0 ? Math.PI / 2 : -Math.PI / 2); shoot(this.cx(), this.cy(), Math.cos(a) * 85, Math.sin(a) * 85, this.k.shot, this.dmg); }
          else { const a = randi(0, 3); this.vx = DIRS[a][0] * sp; this.vy = DIRS[a][1] * sp; }
        } break;
      case 'wisp':
        this.vx = dx / dist * sp; this.vy = dy / dist * sp;
        if (this.t <= 0) { this.t = rand(2.4, 3.4); if (dist < 150) { const a = Math.atan2(dy, dx); for (const o of [-0.3, 0, 0.3]) shoot(this.cx(), this.cy(), Math.cos(a + o) * 70, Math.sin(a + o) * 70, this.k.shot, this.dmg); } } break;
    }
    if (this.vx || this.vy) {
      const ox = this.x, oy = this.y;
      moveBody(this, this.vx * dt, 0, this.who()); moveBody(this, 0, this.vy * dt, this.who());
      if (this.x === ox && this.vx) this.vx = -this.vx * 0.5;
      if (this.y === oy && this.vy) this.vy = -this.vy * 0.5;
      if (Math.abs(this.vx) > 1) this.dir = this.vx < 0 ? 2 : 3;
    }
    if (G.player.z < 4 && rectsOverlap(this.box(), G.player.box())) hurtPlayer(this.dmg, this.cx(), this.cy());
  }
  hit(dmg, sx, sy, src) {
    if (this.spawnT > 0) return;
    if (src === 'boomerang') { this.stun = 2.5; Sfx.play('hit'); if (this.maxhp > 1) return; }
    this.hp -= dmg; this.flash = 0.2;
    const a = Math.atan2(this.cy() - sy, this.cx() - sx);
    this.kb = { x: Math.cos(a) * 170, y: Math.sin(a) * 170, t: 0.14 };
    Sfx.play('hit'); Particles.add(this.cx(), this.cy(), 5, '#fff', 50, 0.3);
    if (this.hp <= 0) this.die();
  }
  die() {
    this.dead = true; Sfx.play('kill');
    Particles.add(this.cx(), this.cy(), 14, this.k.look.a || '#fff', 70, 0.5);
    dropLoot(this.cx() - 8, this.cy() - 8, 0.6);
    onEnemyKilled(this);
  }
  draw(ctx, cx, cy) {
    if (this.spawnT > 0) { ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.beginPath(); ctx.arc(this.cx() - cx, this.cy() - cy, this.spawnT * 20, 0, 7); ctx.fill(); return; }
    const x = Math.round(this.x - cx), y = Math.round(this.y - cy);
    const hop = this.k.ai === 'hop' && this.state === 'hop' ? -Math.sin((0.45 - this.t) / 0.45 * Math.PI) * 4 : 0;
    const fl = this.k.fly ? Math.sin(G.t * 6 + this.x) * 2 - 3 : 0;
    ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.fillRect(x + 3, y + 14, 10, 2);
    const spr = getMonSprite(this.k.look, this.dir === 3);
    ctx.drawImage(this.flash > 0 ? silhouette(spr, '#ffffff') : this.stun > 0 ? silhouette(spr, '#8ac0ff') : spr, x, y + hop + fl);
    if (this.stun > 0) drawStars(ctx, x + 8, y - 2);
  }
}
function drawStars(ctx, x, y) { for (let i = 0; i < 3; i++) { const a = G.t * 5 + i * 2.1, sx = x + Math.cos(a) * 7, sy = y + Math.sin(a) * 2; ctx.fillStyle = '#ffe060'; ctx.fillRect(sx - 0.5, sy - 2, 1, 4); ctx.fillRect(sx - 2, sy - 0.5, 4, 1); } }

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
    if (this.stun > 0) { this.stun -= dt; if (this.stun <= 0 && this.k.weak) this.armored = true; this.z = 0; return; }
    const p = G.player, dx = p.cx() - this.cx(), dy = p.cy() - this.cy(), dist = Math.hypot(dx, dy) || 1;
    const rage = this.hp < this.maxhp / 2 ? 1.3 : 1;
    this.t -= dt * rage;
    const st = this.state;
    if (st === 'intro' || st === 'idle') { this.vx = this.vy = 0; if (this.t <= 0) this.nextPat(); }
    else if (st === 'walk') { this.vx = dx / dist * 30 * rage; this.vy = dy / dist * 30 * rage; if (this.t <= 0) this.toIdle(); }
    else if (st === 'seeds') { this.vx = this.vy = 0; this.sT = (this.sT || 0) - dt * rage; if (this.sT <= 0) { this.sT = 0.5; const a = Math.atan2(dy, dx); shoot(this.cx(), this.cy(), Math.cos(a) * 100, Math.sin(a) * 100, this.k.shot, this.dmg); } if (this.t <= 0) this.toIdle(); }
    else if (st === 'slam') {
      if (this.t > 0.5) { this.z = Math.min(24, this.z + dt * 60); this.vx = dx / dist * 60; this.vy = dy / dist * 60; }
      else { this.vx = this.vy = 0; this.z = Math.max(0, this.z - dt * 120); }
      if (this.t <= 0) { this.z = 0; G.shake = 0.3; Sfx.play('bomb'); for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; shoot(this.cx(), this.cy() + 8, Math.cos(a) * 75, Math.sin(a) * 75, 'wave', this.dmg); } this.toIdle(); }
    }
    else if (st === 'tele') { this.vx = this.vy = 0; if (this.t <= 0) { this.state = 'charge'; this.t = 1.1; const a = Math.atan2(dy, dx); this.vx = Math.cos(a) * 180; this.vy = Math.sin(a) * 180; } }
    else if (st === 'charge') { if (this.t <= 0) this.toIdle(); }
    else if (st === 'bubbles' || st === 'ring') { this.vx = this.vy = 0; if (this.t <= 0) { const n = st === 'ring' ? 14 : 10, off = rand(0, 1); for (let i = 0; i < n; i++) { const a = (i + off) / n * Math.PI * 2; shoot(this.cx(), this.cy(), Math.cos(a) * 65, Math.sin(a) * 65, this.k.shot, this.dmg); } Sfx.play('fire'); this.toIdle(); } }
    else if (st === 'teleport') {
      this.vx = this.vy = 0;
      if (this.t <= 0.4 && !this.tp) { this.tp = true; const r = G.map.rooms[this.room]; this.x = r.ox * TS + rand(3, 15) * TS - 8; this.y = r.oy * TS + rand(2, 5) * TS; Sfx.play('warp'); }
      if (this.t <= 0) { this.tp = false; this.toIdle(); }
    }
    else if (st === 'summon') { this.vx = this.vy = 0; if (this.t <= 0) { if (G.ents.filter(e => e instanceof Enemy && !e.dead).length < 3) for (let i = 0; i < 2; i++) { const e = new Enemy(this.k.minion, this.cx() + rand(-40, 40) - 8, this.cy() + rand(10, 30) - 8, this.room); if (!boxBlocked(e.x + 2, e.y + 4, 12, 11, 'enemy')) G.ents.push(e); } this.toIdle(); } }
    if (this.vx || this.vy) {
      const ox = this.x, oy = this.y;
      moveBody(this, this.vx * dt, 0, 'enemy'); moveBody(this, 0, this.vy * dt, 'enemy');
      if (this.state === 'charge' && this.x === ox && this.y === oy) { G.shake = 0.25; Sfx.play('rock'); this.toIdle(); this.stun = this.kind === 'beetle' || this.kind === 'crabking' ? 0 : 1.2; }
    }
    if (this.z < 6 && p.z < 4 && rectsOverlap(this.box(), p.box())) hurtPlayer(this.dmg, this.cx(), this.cy());
  }
  toIdle() { this.state = 'idle'; this.t = 0.8; this.vx = this.vy = 0; }
  nextPat() {
    const pat = this.k.pats[this.pi++ % this.k.pats.length];
    this.state = pat === 'charge' ? 'tele' : pat;
    this.t = { walk: 1.8, seeds: 1.6, slam: 1.1, charge: 0.6, bubbles: 0.8, ring: 0.8, teleport: 0.9, summon: 0.8 }[pat] || 1;
  }
  hit(dmg, sx, sy, src) {
    if (this.state === 'intro') return;
    if (this.armored) {
      if (src === this.k.weak) { this.armored = false; this.stun = 3.5; this.state = 'idle'; this.t = 0.5; Sfx.play('secret'); Particles.text(this.cx(), this.y, '弱点！', '#ffe060'); return; }
      Sfx.play('cancel'); Particles.text(this.cx(), this.y, '叮！', '#ccc');
      if (src === 'sword' && !this.hinted) { this.hinted = true; toast({ boomerang: '剑砍不动！先用回旋镖打晕它！', bomb: '外壳太硬了！用炸弹炸开它！', arrow: '它用暗影护住了自己……用弓箭射它！' }[this.k.weak]); }
      return;
    }
    if (src === 'boomerang') { this.stun = Math.max(this.stun, 1); return; }
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
    ctx.drawImage(this.flash > 0 ? silhouette(spr, '#ffffff') : spr, x, yy, 32, 32);
    ctx.globalAlpha = 1;
    if (this.armored && !this.stun) { ctx.strokeStyle = 'rgba(200,220,255,' + (0.4 + Math.sin(G.t * 6) * 0.2) + ')'; ctx.strokeRect(x + 2.5, yy + 2.5, 27, 27); }
    if (this.stun > 0) drawStars(ctx, x + 16, yy - 3);
  }
}

// ============ 弹道 ============
class Proj extends Ent {
  constructor(x, y, vx, vy, kind, dmg, owner) { super(x, y); this.vx = vx; this.vy = vy; this.kind = kind; this.dmg = dmg || 1; this.owner = owner || 'enemy'; this.life = 3; this.hb = { x: -3, y: -3, w: 6, h: 6 }; }
  update(dt) {
    this.life -= dt; if (this.life <= 0) { this.dead = true; return; }
    this.x += this.vx * dt; this.y += this.vy * dt;
    const tx = Math.floor(this.x / TS), ty = Math.floor(this.y / TS), t = tileProps(tx, ty);
    if (this.owner === 'player') {
      if (t && t.eye) { triggerEye(tx, ty); this.dead = true; return; }
      if (t && t.crystal) { hitCrystal(tx, ty); this.dead = true; return; }
      for (const e of G.ents) if (!e.dead && e.hittable && rectsOverlap(this.box(), e.box())) { e.hit(this.dmg, this.x - this.vx * 0.05, this.y - this.vy * 0.05, this.kind); this.dead = true; return; }
    } else if (rectsOverlap(this.box(), G.player.box()) && !(this.kind === 'wave' && G.player.z > 3)) { hurtPlayer(this.dmg, this.x - this.vx * 0.1, this.y - this.vy * 0.1); this.dead = true; return; }
    if (tileSolidFor(tx, ty, 'proj')) { this.dead = true; Particles.add(this.x, this.y, 4, SHOT_COLOR[this.kind] || '#ddd', 30, 0.25); }
  }
  draw(ctx, cx, cy) {
    const x = this.x - cx, y = this.y - cy;
    if (this.kind === 'arrow') { ctx.save(); ctx.translate(x, y); ctx.rotate(Math.atan2(this.vy, this.vx)); ctx.fillStyle = '#8a5a2a'; ctx.fillRect(-7, -0.5, 10, 1.5); ctx.fillStyle = '#d0d0d8'; ctx.fillRect(3, -1.5, 3, 3.5); ctx.fillStyle = '#e04848'; ctx.fillRect(-8, -1.5, 2, 3.5); ctx.restore(); return; }
    const c = SHOT_COLOR[this.kind] || '#fff';
    if (this.kind === 'wave') { ctx.fillStyle = c; ctx.fillRect(x - 4, y - 1, 8, 3); ctx.fillStyle = '#fff'; ctx.fillRect(x - 2, y - 1, 4, 1); return; }
    ctx.fillStyle = shade(c, -0.4); ctx.beginPath(); ctx.arc(x, y, 4, 0, 7); ctx.fill();
    ctx.fillStyle = c; ctx.beginPath(); ctx.arc(x, y, 3, 0, 7); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.fillRect(x - 1.5, y - 1.5, 1.5, 1.5);
  }
}
function shoot(x, y, vx, vy, kind, dmg, owner) { const p = new Proj(x, y, vx, vy, kind, dmg, owner); G.ents.push(p); return p; }

class Boomerang extends Ent {
  constructor(p) { super(p.cx() - 4, p.cy() - 8); const d = DIRS[p.dir]; this.vx = d[0] * 230; this.vy = d[1] * 230; this.t = 0.55; this.back = false; this.hb = { x: 0, y: 0, w: 8, h: 8 }; this.hitSet = new Set(); this.carry = []; this.spin = 0; }
  update(dt) {
    const p = G.player; this.spin += dt * 20;
    if (!this.back) { this.t -= dt; this.x += this.vx * dt; this.y += this.vy * dt; if (this.t <= 0) this.back = true; }
    else { const dx = p.cx() - 4 - this.x, dy = p.cy() - 8 - this.y, d = Math.hypot(dx, dy); if (d < 8) { this.dead = true; for (const c of this.carry) c.collect(); return; } this.x += dx / d * 260 * dt; this.y += dy / d * 260 * dt; }
    if (Math.floor(G.t * 12) % 2) Sfx.play('step');
    const tx = Math.floor((this.x + 4) / TS), ty = Math.floor((this.y + 4) / TS), t = tileProps(tx, ty);
    if (t && t.crystal && !this.hitSet.has('c' + tx + ty)) { this.hitSet.add('c' + tx + ty); hitCrystal(tx, ty); this.back = true; }
    if (!this.back && tileSolidFor(tx, ty, 'proj')) { this.back = true; Sfx.play('cut'); }
    for (const e of G.ents) {
      if (e.dead || this.hitSet.has(e)) continue;
      if (e.hittable && rectsOverlap(this.box(), e.box())) { this.hitSet.add(e); e.hit(1, this.x, this.y, 'boomerang'); this.back = true; }
      if (e instanceof Pickup && rectsOverlap(this.box(), e.box())) { this.hitSet.add(e); this.carry.push(e); }
    }
    for (const c of this.carry) { c.x = this.x - 4; c.y = this.y - 4; c.z = 0; }
  }
  draw(ctx, cx, cy) { ctx.save(); ctx.translate(Math.round(this.x - cx + 4), Math.round(this.y - cy + 4)); ctx.rotate(this.spin); ctx.drawImage(getIcon(ITEMS.boomerang), -6, -6, 12, 12); ctx.restore(); }
  sortY() { return 99998; }
}

class Bomb extends Ent {
  constructor(x, y) { super(x, y); this.t = 1.8; this.hb = { x: 4, y: 6, w: 8, h: 8 }; }
  update(dt) { this.t -= dt; if (this.t <= 0) this.explode(); }
  explode() {
    this.dead = true; Sfx.play('bomb'); G.shake = 0.35;
    const cx = this.x + 8, cy = this.y + 10, R = 30;
    Particles.add(cx, cy, 30, '#ffb020', 110, 0.5); Particles.add(cx, cy, 20, '#5a5a5a', 70, 0.8);
    G.ents.push(new Explosion(cx, cy));
    for (const e of G.ents) if (!e.dead && e.hittable && Math.hypot(e.cx() - cx, e.cy() - cy) < R + 12) e.hit(3, cx, cy, 'bomb');
    if (Math.hypot(G.player.cx() - cx, G.player.cy() - cy) < R) hurtPlayer(2, cx, cy);
    for (let ty = Math.floor((cy - R) / TS); ty <= Math.floor((cy + R) / TS); ty++) for (let tx = Math.floor((cx - R) / TS); tx <= Math.floor((cx + R) / TS); tx++) {
      const t = tileProps(tx, ty); if (!t || Math.hypot(tx * TS + 8 - cx, ty * TS + 8 - cy) > R + 8) continue;
      if (t.bomb) bombTile(tx, ty, t); else if (t.cut) cutTile(tx, ty, t);
    }
  }
  draw(ctx, cx, cy) { const x = Math.round(this.x - cx), y = Math.round(this.y - cy), ic = getIcon(ITEMS.bombs); ctx.drawImage(this.t < 0.6 && Math.floor(this.t * 20) % 2 ? silhouette(ic, '#ff4040') : ic, x, y); }
}
class Explosion extends Ent {
  constructor(x, y) { super(x, y); this.t = 0.3; }
  update(dt) { this.t -= dt; if (this.t <= 0) this.dead = true; }
  draw(ctx, cx, cy) { const k = 1 - this.t / 0.3; ctx.fillStyle = `rgba(255,${200 - k * 150},60,${1 - k})`; ctx.beginPath(); ctx.arc(this.x - cx, this.y - cy, 10 + k * 26, 0, 7); ctx.fill(); }
  sortY() { return 99999; }
}

// ============ 拾取物 ============
class Pickup extends Ent {
  constructor(x, y, item, n, persist) { super(x, y); this.item = item; this.n = n || 1; this.t = 0; this.life = persist ? 1e9 : 12; this.hb = { x: 3, y: 3, w: 10, h: 10 }; this.vy = persist ? 0 : -60; this.z = 0; }
  update(dt) {
    this.t += dt; this.life -= dt; if (this.life <= 0) { this.dead = true; return; }
    if (this.z < 0 || this.vy < 0) { this.vy += 300 * dt; this.z += this.vy * dt; if (this.z > 0) { this.z = 0; this.vy = 0; } }
    if (this.t > 0.25 && rectsOverlap(this.box(), G.player.box())) this.collect();
  }
  collect() {
    if (this.dead) return; this.dead = true;
    const it = this.item;
    if (it === 'heart') { S.hp = Math.min(S.maxhp, S.hp + 2); Sfx.play('pickup'); }
    else if (RUPEE_VAL[it]) { addRupees(RUPEE_VAL[it]); Sfx.play('coin'); }
    else if (it === 'arrow') { S.arrows = Math.min(S.maxArrows, S.arrows + this.n); Sfx.play('pickup'); }
    else if (it === 'bombs') { S.bombs = Math.min(S.maxBombs, S.bombs + this.n); Sfx.play('pickup'); }
  }
  draw(ctx, cx, cy) {
    if (this.life < 3 && Math.floor(this.life * 8) % 2) return;
    const x = Math.round(this.x - cx), y = Math.round(this.y - cy + this.z + Math.sin(this.t * 4) * 1.2);
    ctx.fillStyle = 'rgba(0,0,0,0.2)'; ctx.fillRect(Math.round(this.x - cx) + 4, Math.round(this.y - cy) + 13, 8, 2);
    ctx.drawImage(getIcon(ITEMS[this.item]), x + 2, y + 1, 12, 12);
  }
}
function spawnPickup(x, y, item, n) { const p = new Pickup(x, y, item, n); G.ents.push(p); return p; }
function dropLoot(x, y, p) {
  if (!chance(p)) return;
  const r = Math.random();
  if (r < 0.35 && S.hp < S.maxhp) spawnPickup(x, y, 'heart');
  else if (r < 0.45 && S.flags.bow) spawnPickup(x, y, 'arrow', 5);
  else if (r < 0.52 && S.flags.bombs) spawnPickup(x, y, 'bombs', 3);
  else spawnPickup(x, y, chance(0.15) ? 'rupee5' : 'rupee');
}

// ============ 宝箱 ============
class Chest extends Ent {
  constructor(spec) {
    super(spec.x * TS, spec.y * TS); this.spec = spec; this.solid = true; this.hb = { x: 1, y: 3, w: 14, h: 13 };
    this.open = isChestOpened(spec.cid); this.hidden = !this.open && !!spec.hidden; this.interact = true; this.appearT = 0;
  }
  update(dt) {
    if (this.appearT > 0) this.appearT -= dt;
    this.solid = !this.hidden;
    if (!this.hidden) return;
    const h = this.spec.hidden;
    if (h === 'plate') { if (G.ents.some(e => e instanceof PushBlock && e.onPlate && e.spec.room === this.spec.room)) this.reveal(); }
    else if (roomCleared(this.spec.room)) this.reveal();
  }
  reveal() { this.hidden = false; this.appearT = 0.6; Sfx.play('secret'); Particles.add(this.x + 8, this.y + 8, 20, '#ffe060', 60, 0.6); }
  onInteract() {
    if (this.hidden) return false;
    if (this.open) { toast('宝箱是空的。'); return true; }
    this.open = true; markChestOpened(this.spec.cid); openChestReward(this.spec);
    return true;
  }
  draw(ctx, cx, cy) {
    if (this.hidden) return;
    const x = Math.round(this.x - cx), y = Math.round(this.y - cy), big = this.spec.big;
    ctx.globalAlpha = this.appearT > 0 ? 1 - this.appearT / 0.6 : 1;
    const body = big ? '#3a6ad8' : '#a0602a', trim = big ? '#ffd040' : '#e8c040';
    ctx.fillStyle = '#2a1a10'; ctx.fillRect(x + 1, y + 4, 14, 12);
    ctx.fillStyle = body; ctx.fillRect(x + 2, y + (this.open ? 7 : 5), 12, this.open ? 8 : 10);
    if (!this.open) { ctx.fillStyle = shade(body, 0.2); ctx.fillRect(x + 2, y + 5, 12, 4); ctx.fillStyle = trim; ctx.fillRect(x + 2, y + 9, 12, 1); ctx.fillRect(x + 7, y + 8, 2, 3); }
    else { ctx.fillStyle = '#1a0a04'; ctx.fillRect(x + 3, y + 5, 10, 3); ctx.fillStyle = trim; ctx.fillRect(x + 2, y + 2, 12, 2); }
    ctx.globalAlpha = 1;
  }
}
class PushBlock extends Ent {
  constructor(spec) { super(spec.x * TS, spec.y * TS); this.spec = spec; this.solid = true; this.hb = { x: 0, y: 0, w: 16, h: 16 }; this.moving = null; this.onPlate = false; this.home = [this.x, this.y]; }
  push(dx, dy) {
    if (this.onPlate) return;
    const tx = Math.floor(this.x / TS) + dx, ty = Math.floor(this.y / TS) + dy, t = tileProps(tx, ty);
    if (!t || t.solid || t.water || t.pit || t.lava) return;
    if (G.ents.some(e => e !== this && e.solid && !e.dead && rectsOverlap(e.box(), { x: tx * TS, y: ty * TS, w: 16, h: 16 }))) return;
    this.moving = { tx: tx * TS, ty: ty * TS, t: 0.25 }; Sfx.play('rock');
  }
  update(dt) {
    if (!this.moving) return;
    const m = this.moving; m.t -= dt;
    this.x = lerp(this.x, m.tx, Math.min(1, dt * 14)); this.y = lerp(this.y, m.ty, Math.min(1, dt * 14));
    if (m.t <= 0) { this.x = m.tx; this.y = m.ty; this.moving = null; const t = tileProps(Math.floor(this.x / TS), Math.floor(this.y / TS)); if (t && t.plate) { this.onPlate = true; Sfx.play('unlock'); } }
  }
  draw(ctx, cx, cy) {
    const x = Math.round(this.x - cx), y = Math.round(this.y - cy), th = THEMES[G.map.theme] || THEMES.forest;
    ctx.fillStyle = shade(th.wall, -0.3); ctx.fillRect(x, y, 16, 16);
    ctx.fillStyle = shade(th.wall, 0.15); ctx.fillRect(x + 1, y + 1, 14, 13);
    ctx.fillStyle = shade(th.wall, 0.35); ctx.fillRect(x + 2, y + 2, 12, 2);
    ctx.fillStyle = shade(th.wall, -0.1); ctx.fillRect(x + 5, y + 6, 6, 5);
  }
}

// ============ 地块交互 ============
function cutTile(tx, ty, t) {
  const m = G.map;
  setT(m, tx, ty, BASE_TILE[m.under[ty * m.w + tx] || (t.tall ? GROUND_BASE[t.name] : 'grass')] || 'GRASS');
  Sfx.play('cut');
  Particles.add(tx * TS + 8, ty * TS + 8, 10, t.pot ? '#b8683a' : '#4aa040', 50, 0.4);
  dropLoot(tx * TS, ty * TS, t.pot ? 0.85 : 0.3);
}
function bombTile(tx, ty, t) {
  const m = G.map;
  if (t.name === 'DCRACK') openDoorAt(tx, ty);
  else { setT(m, tx, ty, BASE_TILE[m.under[ty * m.w + tx] || m.base] || 'ROCKY'); persistTile(tx, ty); }
  Sfx.play('secret');
}
function triggerEye(tx, ty) {
  const m = G.map; Sfx.play('secret');
  if (m.isDungeon) {
    setT(m, tx, ty, 'DEYEOFF');
    const rk = Math.floor(tx / RW) + ',' + Math.floor(ty / RH);
    for (const d of m.doors) if (d.type === 'eye' && d.room === rk) openDoor(d);
  } else {
    setT(m, tx, ty, 'EYEOFF'); persistTile(tx, ty);
    if (m.id === 'ruins') { setT(m, 5, 8, 'STONE'); persistTile(5, 8); toast('石门打开了！'); }
  }
}
function hitCrystal(tx, ty) {
  const m = G.map;
  if (TILES[tAt(m, tx, ty)].name !== 'CRYSW') return;
  setT(m, tx, ty, 'CRYSWON'); Sfx.play('secret'); Particles.add(tx * TS + 8, ty * TS + 6, 16, '#ffa030', 50, 0.5);
  if (m.isDungeon) {
    const rk = Math.floor(tx / RW) + ',' + Math.floor(ty / RH);
    for (const d of m.doors) if (d.type === 'switch' && d.room === rk) openDoor(d);
  } else if (m.id === 'lake') {
    persistTile(tx, ty);
    runScript(async () => {
      for (let x = 15; x >= 10; x--) { setT(m, x, 12, 'BRIDGE'); persistTile(x, 12); Sfx.play('door'); Particles.add(x * TS + 8, 12 * TS + 8, 6, '#c08850', 30, 0.3); await wait(0.12); }
      toast('一座桥从湖里升了起来！');
    });
  }
}
