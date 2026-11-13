'use strict';
// ============ 灵兽对战（回合制） ============
function stageMul(s) { return s >= 0 ? (2 + s) / 2 : 2 / (2 - s); }
function bgFor(m) {
  if (!m) return 'grass';
  if (m.mine) return 'cave';
  if (m.isDungeon) return 'dungeon';
  return { beach: 'beach', snow: 'snow', mountain: 'mountain', forest: 'forest' }[m.id] || 'grass';
}
const BG_COLORS = {
  grass: ['#8ad0f8', '#c8f0ff', '#78c858', '#5aa840'], forest: ['#4a8a6a', '#8ac8a0', '#4a8a3a', '#2e6a2a'], beach: ['#6ac8f8', '#d0f4ff', '#f0e0a0', '#d8c080'],
  mountain: ['#f0a070', '#f8d8b0', '#b8906a', '#8a6a4a'], snow: ['#a8c8e8', '#f0f8ff', '#f0f6fc', '#c8d8e8'], cave: ['#2a2018', '#4a3a2a', '#6a5a48', '#4a3c30'], dungeon: ['#1a1428', '#3a2a4a', '#5a4a6a', '#3a2c4a'],
};
function startBattle(opts) {
  return new Promise(res => {
    const b = new BattleUI(opts, async r => {
      if (r === 'lose' && !opts.noWhiteout) await whiteOut();
      else if (r === 'lose') healParty();
      res(r);
    });
    UI.push(b); b.run().catch(e => { console.error(e); UI.pop(b); res('run'); });
  });
}
async function whiteOut() {
  await fadeOut(0.6);
  const lost = Math.min(800, Math.floor(S.gold * 0.15)); S.gold -= lost;
  healParty();
  if (S.flags.metElder && !G.map.isDungeon) loadMap('clinic', 6 * TS, 6 * TS, 1);
  else if (G.map.isDungeon) { const m = G.map; loadMap(m.id, m.start.x * TS - 8, m.start.y * TS - 12, 1); }
  else loadMap('home', 9 * TS, 3.4 * TS, 0);
  await fadeIn(0.6);
  await say(null, [`你的灵兽全部倒下了……眼前一片漆黑！${lost ? '\n（慌乱中丢失了 ' + lost + 'G）' : ''}`, '灵兽们已经恢复了精神。']);
}
class BattleUI {
  constructor(o, res) {
    this.o = o; this.res = res; this.wild = !!o.wild;
    this.foeTeam = o.wild ? [o.wild] : o.trainer.team; this.fi = 0;
    this.mi = S.party.findIndex(m => m.hp > 0);
    this.stg = { mine: { atk: 0, def: 0, spd: 0 }, foe: { atk: 0, def: 0, spd: 0 } };
    this.part = new Set([S.party[this.mi].uid]);
    this.text = ''; this.tc = 0; this.mode = 'msg'; this.msel = 0; this.vsel = 0;
    this.an = { mine: { dx: -200, dy: 0, flash: 0, alpha: 1, sc: 1 }, foe: { dx: 200, dy: 0, flash: 0, alpha: 1, sc: 1 } };
    this.tw = []; this.ball = null; this.bg = o.bg || bgFor(G.map); this.fx = [];
    this.dhp = { mine: this.me.hp, foe: this.foe.hp };
    this.evolve = [];
    S.dex.seen[this.foe.sp] = 1;
    S.stats.battles++;
  }
  get me() { return S.party[this.mi]; }
  get foe() { return this.foeTeam[this.fi]; }
  play(dur, fn) { return new Promise(res => this.tw.push({ t: 0, dur, fn, res })); }
  say(text, auto) { this.text = text; this.tc = 0; this.mode = 'msg'; this.auto = auto; return new Promise(res => { this.msgRes = res; this.msgT = 0; }); }
  choose() { this.mode = 'main'; return new Promise(res => { this.chooseRes = res; }); }
  update(dt) {
    for (let i = this.tw.length - 1; i >= 0; i--) { const t = this.tw[i]; t.t += dt; t.fn(Math.min(1, t.t / t.dur)); if (t.t >= t.dur) { this.tw.splice(i, 1); t.res(); } }
    for (const s of ['mine', 'foe']) { const m = s === 'mine' ? this.me : this.foe; if (m) this.dhp[s] = lerp(this.dhp[s], m.hp, Math.min(1, dt * 6)); if (m && Math.abs(this.dhp[s] - m.hp) < 0.3) this.dhp[s] = m.hp; }
    for (let i = this.fx.length - 1; i >= 0; i--) { const f = this.fx[i]; f.t -= dt; f.x += f.vx * dt; f.y += f.vy * dt; if (f.t <= 0) this.fx.splice(i, 1); }
    if (this.mode === 'msg' && this.msgRes) {
      if (this.tc < this.text.length) { this.tc += dt * 60; if (Input.hit('a') || Input.hit('b')) this.tc = this.text.length; }
      else {
        this.msgT += dt;
        if (Input.hit('a') || Input.hit('b') || this.msgT > (this.auto != null ? this.auto : 1.3)) { const r = this.msgRes; this.msgRes = null; r(); }
      }
    } else if (this.mode === 'main') {
      if (Input.nav('left') || Input.nav('right')) { this.msel ^= 1; Sfx.play('select'); }
      if (Input.nav('up') || Input.nav('down')) { this.msel ^= 2; Sfx.play('select'); }
      if (Input.hit('a')) { Sfx.play('confirm'); this.pickMain(); }
    } else if (this.mode === 'moves') {
      const n = this.me.moves.length;
      if (Input.nav('left') || Input.nav('right')) { this.vsel = this.vsel ^ 1; if (this.vsel >= n) this.vsel = n - 1; Sfx.play('select'); }
      if (Input.nav('up') || Input.nav('down')) { const v = this.vsel ^ 2; if (v < n) this.vsel = v; Sfx.play('select'); }
      if (Input.hit('a')) { Sfx.play('confirm'); this.mode = 'busy'; this.chooseRes({ type: 'fight', move: this.me.moves[this.vsel] }); }
      if (Input.hit('b')) { Sfx.play('cancel'); this.mode = 'main'; }
    }
  }
  async pickMain() {
    const c = this.msel;
    if (c === 0) { this.mode = 'moves'; this.vsel = Math.min(this.vsel, this.me.moves.length - 1); return; }
    this.mode = 'busy';
    if (c === 1) {
      const id = await pickItem(it => it.type === 'potion' || (it.type === 'ball' && this.wild), this.wild ? '使用哪个道具？' : '使用哪个道具？（不能对训练家的灵兽扔球）');
      if (!id) { this.mode = 'main'; return; }
      if (ITEMS[id].type === 'ball') { this.chooseRes({ type: 'ball', id }); return; }
      const i = await pickMon('给哪只灵兽使用？');
      if (i < 0) { this.mode = 'main'; return; }
      const mon = S.party[i];
      if (!useItemOnMon(id, mon, true)) { this.mode = 'main'; return; }
      this.chooseRes({ type: 'item', id, mon });
    } else if (c === 2) {
      const i = await this.pickSwitch(false);
      if (i < 0) { this.mode = 'main'; return; }
      this.chooseRes({ type: 'switch', i });
    } else if (c === 3) this.chooseRes({ type: 'run' });
  }
  async pickSwitch(forced) {
    while (true) {
      const i = await pickMon(forced ? '派出哪只灵兽？' : '换上哪只灵兽？');
      if (i < 0) { if (forced) continue; return -1; }
      if (S.party[i].hp <= 0) { toast('它已经无法战斗了！'); continue; }
      if (i === this.mi && !forced) { toast('它已经在场上了！'); continue; }
      return i;
    }
  }
  async run() {
    Music.play(this.o.trainer && this.o.trainer.boss ? 'boss' : 'battle');
    Sfx.play('encounter');
    await this.play(0.6, k => { this.an.foe.dx = 200 * (1 - k); this.an.mine.dx = -200 * (1 - k); });
    if (this.wild) await this.say(`野生的 ${monName(this.foe)} 出现了！`);
    else { await this.say(`${this.o.trainer.name} 向你发起了挑战！`); await this.say(`${this.o.trainer.name} 派出了 ${monName(this.foe)}！`); }
    await this.say(`去吧，${monName(this.me)}！`, 0.7);
    while (true) {
      const act = await this.choose();
      const r = await this.turn(act);
      if (r) return this.finish(r);
    }
  }
  async finish(r) {
    if (r === 'win') {
      Music.play('victory');
      if (!this.wild) {
        await this.say(`你战胜了 ${this.o.trainer.name}！`);
        if (this.o.trainer.loseLine) await this.say(`${this.o.trainer.name}：「${this.o.trainer.loseLine}」`);
        if (this.o.trainer.reward) { S.gold += this.o.trainer.reward; Sfx.play('coin'); await this.say(`获得了 ${this.o.trainer.reward}G 奖金！`); }
      }
      S.stats.wins++;
    }
    // 进化
    for (const mon of this.evolve) {
      const sp = SPECIES[mon.sp]; if (!sp.evo || mon.lv < sp.evo[0] || mon.hp <= 0 && false) continue;
      const to = sp.evo[1], old = monName(mon), oldSp = mon.sp;
      this.evoMon = mon; this.mode = 'evo';
      await this.say(`咦？${old} 的样子……`);
      Sfx.play('secret');
      await this.play(2.2, k => { this.evoK = k; mon.sp = Math.floor(k * k * 14) % 2 ? to : oldSp; });
      mon.sp = to; const keepNick = mon.nick; calcStats(mon); mon.hp = mon.maxhp; mon.nick = keepNick;
      S.dex.seen[to] = 1; S.dex.caught[to] = 1;
      Sfx.play('levelup');
      await this.say(`恭喜！${old} 进化成了 ${SPECIES[to].name}！`);
      for (const [lv, mv] of learnset(to)) if (lv === mon.lv) await this.learn(mon, mv);
      this.evoMon = null;
    }
    await this.play(0.4, k => { this.fadeK = k; });
    UI.pop(this);
    Music.play(G.map.music);
    this.res(r);
  }
  speedOf(side) { const m = side === 'mine' ? this.me : this.foe; return m.spd * stageMul(this.stg[side].spd) * (m.status === 'par' ? 0.5 : 1); }
  aiMove() {
    const f = this.foe, me = this.me;
    if (this.wild) { const atk = f.moves.filter(m => MOVES[m].pow > 0); return chance(0.75) && atk.length ? pick(atk) : pick(f.moves); }
    let best = f.moves[0], bs = -1;
    for (const id of f.moves) {
      const M = MOVES[id]; let s;
      if (M.pow) s = M.pow * (M.acc / 100) * typeMult(M.type, SPECIES[me.sp].types) * (SPECIES[f.sp].types.includes(M.type) ? 1.5 : 1);
      else s = (M.sleep || M.para || M.poison) && !me.status ? 45 : M.heal && f.hp < f.maxhp * 0.4 ? 80 : 20;
      s *= rand(0.8, 1.2);
      if (s > bs) { bs = s; best = id; }
    }
    return best;
  }
  async turn(act) {
    if (act.type === 'run') {
      if (!this.wild) { await this.say('不能从训练家的对战中逃跑！'); return null; }
      const p = clamp(0.55 + (this.me.spd - this.foe.spd) / (this.foe.spd * 2 + 1), 0.35, 1);
      if (chance(p)) { Sfx.play('cancel'); await this.say('成功逃跑了！', 0.8); return 'run'; }
      await this.say('没能逃掉！');
    } else if (act.type === 'ball') {
      removeItem(act.id, 1);
      if (await this.throwBall(act.id)) return 'caught';
    } else if (act.type === 'item') {
      await this.say(`${S.name} 使用了 ${ITEMS[act.id].name}！`);
    } else if (act.type === 'switch') {
      await this.say(`回来吧，${monName(this.me)}！`, 0.6);
      await this.play(0.3, k => { this.an.mine.dx = -200 * k; });
      this.mi = act.i; this.stg.mine = { atk: 0, def: 0, spd: 0 }; this.part.add(this.me.uid); this.dhp.mine = this.me.hp;
      await this.play(0.3, k => { this.an.mine.dx = -200 * (1 - k); });
      await this.say(`去吧，${monName(this.me)}！`, 0.6);
    }
    const acts = [];
    if (act.type === 'fight') acts.push({ side: 'mine', move: act.move });
    acts.push({ side: 'foe', move: this.aiMove() });
    if (acts.length === 2) {
      const pa = MOVES[acts[0].move].pri || 0, pb = MOVES[acts[1].move].pri || 0;
      if (pb > pa || (pa === pb && (this.speedOf('foe') > this.speedOf('mine') || (this.speedOf('foe') === this.speedOf('mine') && chance(0.5))))) acts.reverse();
    }
    for (const a of acts) {
      const atk = a.side === 'mine' ? this.me : this.foe, def = a.side === 'mine' ? this.foe : this.me;
      if (atk.hp <= 0 || def.hp <= 0) continue;
      await this.doMove(a.side, a.move);
      const r = await this.checkFaint();
      if (r === 'end-win') return 'win';
      if (r === 'end-lose') return 'lose';
      if (r === 'switched') break;
    }
    // 回合结束的状态伤害
    for (const side of ['mine', 'foe']) {
      const m = side === 'mine' ? this.me : this.foe;
      if (!m || m.hp <= 0) continue;
      if (m.status === 'psn' || m.status === 'brn') {
        const d = Math.max(1, Math.floor(m.maxhp / (m.status === 'psn' ? 8 : 12)));
        m.hp = Math.max(0, m.hp - d);
        await this.flash(side);
        await this.say(`${monName(m)} 受到了${m.status === 'psn' ? '毒' : '灼伤'}的伤害！`, 0.9);
        const r = await this.checkFaint();
        if (r === 'end-win') return 'win';
        if (r === 'end-lose') return 'lose';
      }
    }
    return null;
  }
  async flash(side) { Sfx.play('hit'); await this.play(0.35, k => { this.an[side].flash = Math.floor(k * 8) % 2; }); this.an[side].flash = 0; }
  async doMove(side, id) {
    const M = MOVES[id];
    const other = side === 'mine' ? 'foe' : 'mine';
    const atk = side === 'mine' ? this.me : this.foe, def = side === 'mine' ? this.foe : this.me;
    const pre = side === 'foe' ? (this.wild ? '野生的' : '对手的') : '';
    if (atk.status === 'slp') {
      atk.slp = (atk.slp || 2) - 1;
      if (atk.slp <= 0) { atk.status = null; await this.say(`${pre}${monName(atk)} 醒过来了！`, 0.8); }
      else { await this.say(`${pre}${monName(atk)} 正在呼呼大睡……`, 0.9); return; }
    }
    if (atk.status === 'par' && chance(0.25)) { await this.say(`${pre}${monName(atk)} 身体麻痹，无法动弹！`, 0.9); return; }
    await this.say(`${pre}${monName(atk)} 使用了 ${M.name}！`, 0.6);
    if (!chance(M.acc / 100)) { await this.say('但是没有命中！', 0.8); return; }
    const as = this.stg[side], ds = this.stg[other];
    if (M.pow > 0) {
      Sfx.play('swing');
      await this.play(0.22, k => { this.an[side].dx = Math.sin(k * Math.PI) * (side === 'mine' ? 20 : -20); this.an[side].dy = -Math.sin(k * Math.PI) * 6; });
      this.spawnFx(other, TYPE_COLOR[M.type]);
      const mult = typeMult(M.type, SPECIES[def.sp].types);
      const stab = SPECIES[atk.sp].types.includes(M.type) ? 1.5 : 1;
      const A = atk.atk * stageMul(as.atk) * (atk.status === 'brn' ? 0.6 : 1), D = def.def * stageMul(ds.def);
      const crit = chance(1 / 16) ? 1.5 : 1;
      let dmg = Math.floor(((2 * atk.lv / 5 + 2) * M.pow * A / D / 50 + 2) * stab * mult * crit * rand(0.85, 1));
      dmg = Math.max(1, dmg);
      def.hp = Math.max(0, def.hp - dmg);
      await this.flash(other);
      await wait(0.25);
      if (crit > 1) await this.say('会心一击！', 0.7);
      if (mult > 1) await this.say('效果拔群！', 0.7);
      else if (mult < 1) await this.say('效果不太好……', 0.7);
      if (M.drain && atk.hp > 0) { const h = Math.max(1, Math.floor(dmg * M.drain)); atk.hp = Math.min(atk.maxhp, atk.hp + h); await this.say(`${monName(atk)} 吸取了体力！`, 0.7); }
      if (def.hp > 0 && !def.status) {
        const dt = SPECIES[def.sp].types;
        if (M.burn && chance(M.burn) && !dt.includes('fire')) { def.status = 'brn'; await this.say(`${monName(def)} 被灼伤了！`, 0.8); }
        else if (M.para && chance(M.para) && !dt.includes('elec')) { def.status = 'par'; await this.say(`${monName(def)} 麻痹了！`, 0.8); }
        else if (M.poison && chance(M.poison)) { def.status = 'psn'; await this.say(`${monName(def)} 中毒了！`, 0.8); }
      }
      if (M.foe && def.hp > 0 && chance(M.foeChance || 1)) await this.applyStages(other, def, M.foe);
    } else {
      Sfx.play('confirm');
      if (M.sleep || M.para || M.poison) {
        if (def.status) await this.say('但是没有效果……', 0.8);
        else if (M.sleep) { def.status = 'slp'; def.slp = randi(2, 4); this.spawnFx(other, TYPE_COLOR[M.type]); await this.say(`${monName(def)} 睡着了！`, 0.8); }
        else if (M.para) { if (SPECIES[def.sp].types.includes('elec')) await this.say('但是没有效果……'); else { def.status = 'par'; this.spawnFx(other, '#e8c020'); await this.say(`${monName(def)} 麻痹了！`, 0.8); } }
        else { def.status = 'psn'; this.spawnFx(other, '#a040c0'); await this.say(`${monName(def)} 中毒了！`, 0.8); }
      }
      if (M.heal) {
        if (atk.hp >= atk.maxhp) await this.say('但是体力已经是满的了！', 0.8);
        else { atk.hp = Math.min(atk.maxhp, atk.hp + Math.floor(atk.maxhp * M.heal)); Sfx.play('heal'); await this.say(`${monName(atk)} 恢复了体力！`, 0.8); }
      }
      if (M.self) await this.applyStages(side, atk, M.self);
      if (M.foe) await this.applyStages(other, def, M.foe);
    }
  }
  async applyStages(side, mon, ch) {
    const nm = { atk: '攻击', def: '防御', spd: '速度' };
    for (const k in ch) {
      const st = this.stg[side]; const before = st[k];
      st[k] = clamp(st[k] + ch[k], -6, 6);
      if (st[k] === before) await this.say(`${monName(mon)} 的${nm[k]}无法再改变了！`, 0.7);
      else await this.say(`${monName(mon)} 的${nm[k]}${ch[k] > 0 ? (ch[k] > 1 ? '大幅提高了！' : '提高了！') : (ch[k] < -1 ? '大幅降低了！' : '降低了！')}`, 0.7);
    }
  }
  spawnFx(side, col) {
    const [cx, cy] = side === 'foe' ? [330, 78] : [120, 160];
    for (let i = 0; i < 18; i++) { const a = rand(0, 6.28), s = rand(30, 90); this.fx.push({ x: cx, y: cy, vx: Math.cos(a) * s, vy: Math.sin(a) * s, t: rand(0.3, 0.6), col }); }
  }
  async checkFaint() {
    if (this.foe.hp <= 0) {
      Sfx.play('kill');
      await this.play(0.45, k => { this.an.foe.dy = k * 30; this.an.foe.alpha = 1 - k; });
      await this.say(`${this.wild ? '野生的' : '对手的'}${monName(this.foe)} 倒下了！`, 0.9);
      await this.giveXp(this.foe);
      if (!this.wild && this.fi < this.foeTeam.length - 1) {
        this.fi++; this.stg.foe = { atk: 0, def: 0, spd: 0 }; this.dhp.foe = this.foe.hp; this.an.foe = { dx: 200, dy: 0, flash: 0, alpha: 1, sc: 1 };
        S.dex.seen[this.foe.sp] = 1;
        await this.say(`${this.o.trainer.name} 派出了 ${monName(this.foe)}！`, 0.6);
        await this.play(0.35, k => { this.an.foe.dx = 200 * (1 - k); });
        return 'switched';
      }
      return 'end-win';
    }
    if (this.me.hp <= 0) {
      Sfx.play('fail');
      await this.play(0.45, k => { this.an.mine.dy = k * 30; this.an.mine.alpha = 1 - k; });
      this.me.status = null;
      await this.say(`${monName(this.me)} 倒下了！`, 0.9);
      if (!S.party.some(m => m.hp > 0)) return 'end-lose';
      const i = await this.pickSwitch(true);
      this.mi = i; this.stg.mine = { atk: 0, def: 0, spd: 0 }; this.part.add(this.me.uid); this.dhp.mine = this.me.hp; this.an.mine = { dx: -200, dy: 0, flash: 0, alpha: 1, sc: 1 };
      await this.say(`去吧，${monName(this.me)}！`, 0.6);
      await this.play(0.35, k => { this.an.mine.dx = -200 * (1 - k); });
      return 'switched';
    }
    return null;
  }
  async giveXp(foe) {
    const base = Math.floor(SPECIES[foe.sp].xp * foe.lv / 6 * (this.wild ? 1 : 1.5));
    for (const m of S.party) {
      if (m.hp <= 0 || m.lv >= 100) continue;
      const got = this.part.has(m.uid) ? base : Math.floor(base / 2);
      m.xp += got;
      if (m === this.me) await this.say(`${monName(m)} 获得了 ${got} 点经验值！`, 0.7);
      while (m.lv < 100 && m.xp >= xpFor(m.lv + 1)) {
        m.lv++; calcStats(m);
        Sfx.play('levelup');
        await this.say(`${monName(m)} 升到了 Lv${m.lv}！`, 0.9);
        for (const [lv, mv] of learnset(m.sp)) if (lv === m.lv) await this.learn(m, mv);
        const sp = SPECIES[m.sp];
        if (sp.evo && m.lv >= sp.evo[0] && !this.evolve.includes(m)) this.evolve.push(m);
      }
    }
  }
  async learn(m, mv) {
    if (m.moves.includes(mv)) return;
    if (m.moves.length < 4) { m.moves.push(mv); Sfx.play('confirm'); await this.say(`${monName(m)} 学会了 ${MOVES[mv].name}！`, 1); return; }
    await this.say(`${monName(m)} 想要学习 ${MOVES[mv].name}，但是已经学会了4个招式。`, 1.5);
    const opts = m.moves.map(x => `忘记 ${MOVES[x].name}`).concat([`放弃学习 ${MOVES[mv].name}`]);
    const c = await ask('要忘记哪个招式？', opts);
    if (c >= 0 && c < 4) { const old = m.moves[c]; m.moves[c] = mv; await this.say(`1、2……噗！${monName(m)} 忘记了 ${MOVES[old].name}，学会了 ${MOVES[mv].name}！`, 1.4); }
    else await this.say(`${monName(m)} 没有学习 ${MOVES[mv].name}。`, 1);
  }
  async throwBall(id) {
    const it = ITEMS[id], f = this.foe, sp = SPECIES[f.sp];
    await this.say(`${S.name} 扔出了 ${it.name}！`, 0.5);
    this.ball = { x: 100, y: 180, col: it.color, shake: 0 };
    Sfx.play('bow');
    await this.play(0.5, k => { this.ball.x = lerp(100, 330, k); this.ball.y = lerp(180, 90, k) - Math.sin(k * Math.PI) * 60; });
    Sfx.play('catch');
    await this.play(0.3, k => { this.an.foe.sc = 1 - k; this.an.foe.alpha = 1 - k; });
    let a = (3 * f.maxhp - 2 * f.hp) * sp.catch * it.rate / (3 * f.maxhp);
    if (f.status === 'slp') a *= 2; else if (f.status) a *= 1.5;
    const p = clamp(a / 255, 0, 1);
    const ok = it.rate >= 255 || chance(p);
    const shakes = ok ? 3 : (p > 0.5 ? 2 : p > 0.2 ? randi(1, 2) : randi(0, 1));
    for (let i = 0; i < shakes; i++) { await wait(0.35); Sfx.play('shake'); await this.play(0.35, k => { this.ball.shake = Math.sin(k * Math.PI * 2) * 4; }); }
    await wait(0.3);
    if (ok) {
      Sfx.play('item'); this.ball.done = true;
      await this.say(`太好了！成功收服了 ${sp.name}！`, 1.4);
      S.dex.caught[f.sp] = 1; S.dex.seen[f.sp] = 1; S.stats.caught++;
      f.status = null;
      if (S.party.length < 6) { S.party.push(f); }
      else { S.box.push(f); await this.say(`队伍已满，${sp.name} 被传送到了寄存箱。`, 1.2); }
      return true;
    }
    this.ball = null; Sfx.play('cancel');
    await this.play(0.25, k => { this.an.foe.sc = k; this.an.foe.alpha = k; });
    await this.say(pick(['哎呀！它挣脱出来了！', '可惜！差一点就收服了！', '不行！它从球里跑出来了！']), 1);
    return false;
  }
  draw(ctx) {
    const C = BG_COLORS[this.bg] || BG_COLORS.grass;
    const g = ctx.createLinearGradient(0, 0, 0, 200); g.addColorStop(0, C[0]); g.addColorStop(1, C[1]);
    ctx.fillStyle = g; ctx.fillRect(0, 0, VW, VH);
    ctx.fillStyle = C[2]; ctx.fillRect(0, 130, VW, 140);
    for (let i = 0; i < 30; i++) { ctx.fillStyle = C[3]; ctx.fillRect(hash2(i, 9) * VW, 130 + hash2(i, 8) * 70, 6, 1); }
    // 平台
    ctx.fillStyle = C[3]; ctx.beginPath(); ctx.ellipse(330, 112, 62, 13, 0, 0, 7); ctx.fill();
    ctx.beginPath(); ctx.ellipse(120, 196, 72, 14, 0, 0, 7); ctx.fill();
    // 对手
    const fa = this.an.foe, f = this.foe;
    if (f) {
      const s = 4 * fa.sc, sz = 16 * s;
      ctx.globalAlpha = fa.alpha;
      const spr = getMonSprite(SPECIES[f.sp].look, false);
      const fx = 330 - sz / 2 + fa.dx, fy = 110 - sz + fa.dy + (16 * 4 - sz) * 0 + Math.sin(G.t * 2) * 1;
      if (fa.flash) ctx.drawImage(silhouette(spr, '#fff'), fx, fy, sz, sz); else ctx.drawImage(spr, fx, fy, sz, sz);
      ctx.globalAlpha = 1;
    }
    // 我方
    const ma = this.an.mine, m = this.me;
    if (m) {
      const mon = this.evoMon && this.mode === 'evo' ? this.evoMon : m;
      const sz = 16 * 5;
      ctx.globalAlpha = ma.alpha;
      const spr = getMonSprite(SPECIES[mon.sp].look, true);
      const mx = 120 - sz / 2 + ma.dx, my = 196 - sz + 6 + ma.dy;
      if (ma.flash) ctx.drawImage(silhouette(spr, '#fff'), mx, my, sz, sz); else ctx.drawImage(spr, mx, my, sz, sz);
      ctx.globalAlpha = 1;
      if (this.evoMon && this.evoK != null && this.evoK < 1) { ctx.fillStyle = `rgba(255,255,255,${Math.sin(this.evoK * Math.PI) * 0.7})`; ctx.fillRect(0, 0, VW, VH); }
    }
    // 球
    if (this.ball) {
      const b = this.ball; ctx.save(); ctx.translate(b.x + (b.shake || 0), b.y); ctx.rotate((b.shake || 0) * 0.1);
      ctx.fillStyle = '#1a1a1a'; ctx.beginPath(); ctx.arc(0, 0, 6, 0, 7); ctx.fill();
      ctx.fillStyle = b.col; ctx.beginPath(); ctx.arc(0, 0, 5, Math.PI, 0); ctx.fill();
      ctx.fillStyle = '#f4f4f4'; ctx.beginPath(); ctx.arc(0, 0, 5, 0, Math.PI); ctx.fill();
      ctx.fillStyle = '#1a1a1a'; ctx.fillRect(-5, -0.5, 10, 1); ctx.fillStyle = b.done ? '#ffe060' : '#fff'; ctx.beginPath(); ctx.arc(0, 0, 1.6, 0, 7); ctx.fill();
      ctx.restore();
    }
    for (const p of this.fx) { ctx.fillStyle = p.col; ctx.globalAlpha = clamp(p.t * 3, 0, 1); ctx.fillRect(p.x, p.y, 3, 3); }
    ctx.globalAlpha = 1;
    // 信息框
    if (f) this.drawInfo(ctx, 16, 14, f, 'foe', false);
    if (m) this.drawInfo(ctx, 286, 136, this.evoMon || m, 'mine', true);
    // 消息框
    drawBox(ctx, 6, VH - 66, VW - 12, 60);
    if (this.mode === 'msg' || this.mode === 'busy' || this.mode === 'evo') {
      const lines = wrapText(ctx, this.text, VW - 40, 12); let n = Math.floor(this.tc);
      lines.forEach((l, i) => { if (n > 0) drawText(ctx, l.slice(0, n), 20, VH - 54 + i * 16, '#3a2a1a', 12); n -= l.length; });
    }
    if (this.mode === 'main') {
      drawText(ctx, `${monName(m)} 要做什么？`, 20, VH - 50, '#3a2a1a', 12);
      const opts = ['战斗', '背包', '灵兽', '逃跑'];
      const bx = VW - 186, by = VH - 62;
      drawBox(ctx, bx, by, 180, 52, 'dark');
      opts.forEach((o, i) => {
        const x = bx + 14 + (i % 2) * 84, y = by + 9 + Math.floor(i / 2) * 20;
        if (i === this.msel) drawText(ctx, '▶', x - 9, y + 2, '#ffe060', 9);
        drawText(ctx, o, x + 4, y, i === 3 && !this.wild ? '#8a8aa0' : '#fff', 12, 'left', false, i === this.msel);
      });
    }
    if (this.mode === 'moves') {
      m.moves.forEach((id, i) => {
        const M = MOVES[id]; const x = 16 + (i % 2) * 150, y = VH - 58 + Math.floor(i / 2) * 24;
        ctx.fillStyle = i === this.vsel ? 'rgba(255,220,140,0.6)' : 'rgba(0,0,0,0.04)'; ctx.fillRect(x, y, 144, 21);
        ctx.fillStyle = TYPE_COLOR[M.type]; ctx.fillRect(x, y, 4, 21);
        drawText(ctx, M.name, x + 10, y + 4, '#3a2a1a', 11, 'left', false, i === this.vsel);
      });
      const M = MOVES[m.moves[this.vsel]];
      if (M) {
        const x = VW - 150;
        ctx.fillStyle = TYPE_COLOR[M.type]; ctx.fillRect(x, VH - 56, 40, 13); drawText(ctx, TYPE_NAME[M.type] + '属性', x + 20, VH - 55, '#fff', 8, 'center', '#000');
        drawText(ctx, M.pow ? `威力 ${M.pow}` : '变化招式', x, VH - 38, '#3a2a1a', 10);
        drawText(ctx, `命中 ${M.acc}`, x + 70, VH - 38, '#3a2a1a', 10);
        if (M.pow) { const mult = typeMult(M.type, SPECIES[this.foe.sp].types); drawText(ctx, mult > 1 ? '效果拔群！' : mult < 1 ? '效果不太好' : '效果一般', x, VH - 22, mult > 1 ? '#c04020' : mult < 1 ? '#6a6a8a' : '#6a5a4a', 9); }
      }
    }
    if (this.fadeK) { ctx.fillStyle = `rgba(0,0,0,${this.fadeK})`; ctx.fillRect(0, 0, VW, VH); }
  }
  drawInfo(ctx, x, y, mon, side, mine) {
    const w = 178, h = mine ? 52 : 40;
    drawBox(ctx, x, y, w, h);
    drawText(ctx, monName(mon), x + 10, y + 7, '#3a2a1a', 11, 'left', false, true);
    drawText(ctx, 'Lv' + mon.lv, x + w - 10, y + 8, '#3a2a1a', 10, 'right');
    if (!mine && S.dex.caught[mon.sp]) { ctx.fillStyle = '#e84040'; ctx.beginPath(); ctx.arc(x + w - 46, y + 13, 3, 0, 7); ctx.fill(); }
    const st = mon.status; if (st) { ctx.fillStyle = { psn: '#a040c0', brn: '#f07030', par: '#e8c020', slp: '#8a8aa0' }[st]; ctx.fillRect(x + 10, y + 24, 22, 10); drawText(ctx, STATUS_NAME[st], x + 21, y + 25, '#fff', 7, 'center'); }
    const hpk = this.dhp[side] / mon.maxhp;
    drawText(ctx, 'HP', x + 38, y + 24, '#c08020', 8, 'left', false, true);
    drawBar(ctx, x + 54, y + 26, 110, 5, hpk, hpk > 0.5 ? '#50d050' : hpk > 0.2 ? '#e8c020' : '#e04040', '#4a3a3a');
    if (mine) {
      drawText(ctx, Math.round(this.dhp[side]) + ' / ' + mon.maxhp, x + w - 12, y + 33, '#3a2a1a', 9, 'right');
      const px = xpFor(mon.lv), nx = xpFor(mon.lv + 1);
      drawBar(ctx, x + 10, y + 45, w - 20, 2, (mon.xp - px) / (nx - px), '#4a9ae8', '#3a3040');
    }
  }
}
