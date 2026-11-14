'use strict';
// ============ NPC ============
const NPCS = {
  granny: { name: '奶奶', map: 'home', x: 3, y: 5, wander: 1, look: { hair: '#d8d8d8', shirt: '#8a5a8a', pants: '#5a4a3a' },
    talk: async d => {
      if (!S.flags.gotLeaf) return say(d.name, ['长老在村子广场的守护古树下等你呢，快去吧！', '出门以后往右走就是广场。'], d.look);
      if (S.hp < S.maxhp) { S.hp = S.maxhp; Sfx.play('heal'); return say(d.name, ['哎呀，又受伤了？过来，奶奶给你包扎一下。', '（生命全部恢复了！）'], d.look); }
      return say(d.name, [pick(['累了就回家歇歇，奶奶随时帮你治伤。', '床边的罐子里好像有零钱，拿去用吧，呵呵。', '你爷爷年轻的时候，也是个了不起的冒险家呢。'])], d.look);
    } },
  elder: { name: '长老', map: 'village', x: 21, y: 10, wander: 1, look: { hair: '#f0f0f0', shirt: '#4a6ab0', pants: '#4a3a2a', beard: '#f4f4f4' },
    talk: async d => {
      if (!S.flags.gotLeaf) return introScene(d);
      if (!S.flags.gotSword) return say(d.name, ['先去道场找剑师吧，就在广场的东南边。'], d.look);
      return say(d.name, [hintFor()], d.look);
    } },
  master: { name: '剑师', map: 'dojo', x: 6, y: 3, wander: 0, look: { hair: '#2a2a32', shirt: '#c83a3a', pants: '#2a2a32', beard: '#2a2a32' },
    talk: async d => {
      if (!S.flags.gotLeaf) return say(d.name, ['今天是古树节，你不去广场看看吗？'], d.look);
      if (!S.flags.gotSword) {
        await say(d.name, ['长老都跟我说了。', '你要去对付暗影巫师？哈哈，好胆量！', '这把剑交给你了。'], d.look);
        S.flags.gotSword = true;
        await bigMessage('得到了 勇气之剑！', '按 J 挥剑。', 'sword');
        await say(d.name, ['再教你一招：按住 J 不放，等剑发光以后松开——', '这就是【回旋斩】！可以一口气砍倒周围所有的敌人。', '去北边的迷雾森林吧，第一座神殿就在那里。'], d.look);
        return;
      }
      return say(d.name, [pick(['按住 J 蓄力，松开放出回旋斩。被包围时特别好用！', '草丛和罐子里常常藏着宝石和心。', '敌人被回旋镖打中会晕一会儿，趁机砍它！', '有些头目身上有坚硬的护甲，得先用道具打破才行。'])], d.look);
    } },
  shopkeeper: { name: '店主', map: 'shop', x: 4, y: 2, wander: 0, look: { hair: '#e8a040', shirt: '#4a9a6a', pants: '#5a4a3a' },
    talk: async d => { await say(d.name, ['欢迎光临！想买点什么？'], d.look); await openShop(); } },
  wife: { name: '长老的妻子', map: 'elderhouse', x: 4, y: 5, wander: 1, look: { hair: '#c8c8c8', shirt: '#e0a0b0', pants: '#5a4a6a' },
    talk: async d => say(d.name, ['老头子说的话我都听见了。', hintFor()], d.look) },
  hu: { name: '小虎', map: 'village', x: 23, y: 12, wander: 3, look: { hair: '#2a2a2a', shirt: '#e8a030', pants: '#3a5a8a' },
    talk: async d => say(d.name, [pick(['你知道吗？古树根下有个超级小的洞！要是能变成虫子那么小就好了……', '我听说世界上一共有 8 片心之碎片！集齐 4 片就能多一颗心。', '草丛里能砍出宝石！我天天在砍，嘿嘿。'])], d.look) },
  mei: { name: '小美', map: 'village', x: 16, y: 21, wander: 3, look: { hair: '#e070a0', shirt: '#f0f0f0', pants: '#a0c8f0' },
    talk: async d => say(d.name, [pick(['商店里卖红药水，倒下的时候会自动帮你恢复哦！', '我在村子周围看到过好几个会发光的树桩……', '道场的剑师可厉害了，他一剑能砍倒十根竹子！'])], d.look) },
  fisher: { name: '渔夫', map: 'lake', x: 5, y: 9, wander: 1, look: { hair: '#3a3a3a', shirt: '#3a7ab0', pants: '#5a4a3a', hat: '#e8d090' },
    talk: async d => {
      if (!S.flags.lakeBridge) return say(d.name, ['看到湖心岛边上那个蓝色的水晶了吗？', '以前只要打中它，桥就会从湖里升起来。', S.items.boomerang ? '你手里那个会飞回来的东西……站在岸边对准水晶扔过去试试？' : '可惜太远了，剑是够不着的……'], d.look);
      return say(d.name, ['桥升起来了！你真厉害。岛上的神殿要小心啊。'], d.look);
    } },
  traveler: { name: '旅人', map: 'field', x: 24, y: 9, wander: 1, look: { hair: '#8a5a2a', shirt: '#6a7a4a', pants: '#4a4a3a', hat: '#8a6a3a' },
    talk: async d => say(d.name, [pick(['南边的大裂谷有两格宽，普通人可跳不过去。', '我在草原西北的树洞旁边，看到过一个发光的树桩。', '每个地方都有藏起来的小人世界，里面有宝贝！'])], d.look) },
  miner: { name: '矿工', map: 'mountain', x: 21, y: 13, wander: 1, look: { hair: '#4a3a2a', shirt: '#c08030', pants: '#3a3a3a', hat: '#e0c040' },
    talk: async d => say(d.name, [S.items.bombs ? '你有炸弹？那块有裂缝的巨石，一炸就开！' : '山洞口被有裂缝的巨石堵住了。要是有炸弹就好了……'], d.look) },
  scholar: { name: '学者', map: 'ruins', x: 22, y: 12, wander: 1, look: { hair: '#6a6a7a', shirt: '#3a3a6a', pants: '#2a2a3a' },
    talk: async d => say(d.name, [pick(['暗影之塔里到处都是机关之眼，据说要用弓箭射开。', '遗迹西边的石墙上也有一只眼睛……后面好像藏着什么。', '暗影巫师用黑暗的护盾保护自己，只有箭能射穿它。'])], d.look) },
};
for (const k in NPCS) NPCS[k].id = k;
function npcsForMap(id) { const out = []; for (const k in NPCS) { const d = NPCS[k]; if (d.map === id) out.push(new NPC(d, d.x * TS, d.y * TS - 4)); } return out; }

// ============ 剧情 ============
async function introScene(d) {
  await say(d.name, ['你来啦！……你看，守护古树的叶子全都枯黄了。', '昨天夜里，暗影巫师偷走了古树的四颗【光之果实】，把它们藏进了四座神殿。', '没有光之果实，古树撑不了多久了……'], d.look);
  Sfx.play('secret'); G.flash = 0.6; await wait(0.1); G.flash = 0;
  Particles.add(G.player.cx(), G.player.cy() - 20, 30, '#a0ffa0', 60, 1);
  await say('？？？', ['……喂！喂！这里，这里！'], LEAF_LOOK);
  await say('小叶', ['呼……终于找到一个能看见我的人了！我是古树的精灵，叫我小叶就好。', '暗影巫师太强了，大人们都打不过他。但是……也许一个小小的勇者可以！', '我把古树的魔力借给你：站在【发光的树桩】上按 J，你就能变得和我一样小！', '变小以后，可以钻进谁都注意不到的小洞，去别人去不了的地方。', '我会一直待在你的帽子上。我们一起把光之果实找回来吧！'], LEAF_LOOK);
  S.flags.gotLeaf = true;
  await bigMessage('得到了 小叶的祝福！', '站在发光的树桩上按 J，可以变小 / 变大。', 'fruit');
  await say(d.name, ['孩子，这件事就拜托你了。', '先去道场找剑师，他会给你一把剑。道场就在广场的东南边。'], d.look);
}
function hintFor() {
  if (!S.flags.d1) return '第一颗光之果实在北边迷雾森林的神殿里。神殿被荆棘围着……听说荆棘下面有个小洞。';
  if (!S.flags.d2) return '第二座神殿在镜湖的湖心岛上。镜湖在青草原的东边。';
  if (!S.flags.d3) return '第三座神殿在岩石山道的山洞里，从青草原往北走就到了。';
  if (!S.flags.d4) return '最后的暗影之塔在古代遗迹，要跳过青草原南边的大裂谷才能去。';
  return '古树又活过来了！真是谢谢你。';
}
function goalText() {
  if (!S.flags.gotLeaf) return '出门往右，去村子广场的守护古树下找长老。';
  if (!S.flags.gotSword) return '去村子东南边的剑术道场，找剑师拿剑。';
  if (!S.flags.d1) return '去村子北边的迷雾森林，进入森林神殿。（荆棘下有小洞：先在发光树桩上变小！）';
  if (!S.flags.d2) return '去青草原东边的镜湖，用回旋镖打中湖心岛上的水晶开关，进入湖底神殿。';
  if (!S.flags.d3) return '去青草原北边的岩石山道，用炸弹炸开洞口的巨石，进入山之洞窟。';
  if (!S.flags.d4) return '用跳跃羽毛跳过青草原南边的大裂谷，前往古代遗迹的暗影之塔，打倒暗影巫师！';
  const left = 8 - (S.flags.piecesFound || 0);
  return left > 0 ? `古树复活了！世界上还藏着 ${left} 片心之碎片，去找找看吧。` : '你找齐了所有的心之碎片！真正的勇者！';
}

// ============ 交互 ============
function findInteract(p) {
  const d = DIRS[p.dir], px = p.cx() + d[0] * 12, py = p.cy() + d[1] * 12;
  const near = (e, x, y) => { const b = e.box(); return x >= b.x - 4 && x <= b.x + b.w + 4 && y >= b.y - 5 && y <= b.y + b.h + 5; };
  for (const e of G.ents) { if (e.dead) continue; if ((e.npc || (e.interact && !e.hidden)) && near(e, px, py)) return { ent: e }; }
  const tx = Math.floor(px / TS), ty = Math.floor(py / TS), t = tileProps(tx, ty);
  if (!t) return null;
  if (t.name === 'COUNTER') { const qx = px + d[0] * 16, qy = py + d[1] * 16; for (const e of G.ents) if (e.npc && !e.dead && near(e, qx, qy)) return { ent: e }; }
  const idx = ty * G.map.w + tx;
  if (G.map.signs[idx]) return { sign: G.map.signs[idx] };
  if (t.name === 'BED' || t.name === 'BEDB') return { bed: true };
  if (t.lock) return { lock: [tx, ty, t] };
  return null;
}
function tryInteract(p) {
  const f = findInteract(p);
  if (!f) return false;
  if (f.ent && f.ent.npc) { talkTo(f.ent); return true; }
  if (f.ent) return f.ent.onInteract();
  if (f.sign) { runScript(() => say(null, [f.sign])); return true; }
  if (f.bed) { runScript(async () => { const c = await ask('要躺下休息一会儿吗？（恢复生命并存档）', ['休息', '不了']); if (c !== 0) return; await fadeOut(0.6); S.hp = S.maxhp; saveGame(true); await wait(0.4); await fadeIn(0.6); toast('生命全部恢复，已存档'); }); return true; }
  if (f.lock) { tryUnlock(...f.lock); return true; }
  return false;
}
function talkTo(npc) {
  npc.dir = [1, 0, 3, 2][G.player.dir]; npc.mv = null; npc.frame = 0; npc.talking = true;
  runScript(async () => { try { await npc.def.talk(npc.def); } finally { npc.talking = false; } });
}
function tryUnlock(tx, ty, t) {
  const d = dngState(G.map.dng);
  if (t.lock === 'key') { if (d.keys > 0) { d.keys--; openDoorAt(tx, ty); } else toast('门锁着。需要一把小钥匙。'); }
  else if (t.lock === 'boss') { if (d.bossKey) openDoorAt(tx, ty); else toast('一扇巨大的门。需要头目钥匙。'); }
}

// ============ 宝箱与奖励 ============
const OW_CHESTS = {
  field: [{ cid: 'fcrack', x: 33, y: 2, item: 'heartp' }],
  forest: [{ cid: 'fledge', x: 30, y: 5, item: 'heartp' }],
  ruins: [{ cid: 'reye', x: 5, y: 6, item: 'heartp' }],
  home: [{ cid: 'start', x: 1, y: 3, item: 'rupee20' }],
};
async function gainPiece() {
  S.flags.piecesFound = (S.flags.piecesFound || 0) + 1;
  S.pieces++;
  await bigMessage('得到了 心之碎片！', S.pieces >= 4 ? '集齐了 4 片！' : `再集齐 ${4 - S.pieces} 片，生命上限就会 +1。`, 'heartp');
  if (S.pieces >= 4) { S.pieces = 0; S.maxhp += 2; S.hp = S.maxhp; await bigMessage('生命上限 +1！', '心之碎片合成了一颗完整的心。', 'heartc'); }
}
const ITEM_GET = {
  boomerang: '按 K 扔出去，它会飞回来。\n能打晕敌人、打中远处的水晶开关！',
  bombs: '按 K 放下炸弹。能炸开有裂缝的墙和岩石！\n（Q / E 切换道具）',
  feather: '按 K 跳起来！可以跳过两格宽的深坑。',
  bow: '按 K 射箭。射中机关之眼可以开门！',
};
function openChestReward(spec) {
  runScript(async () => {
    Sfx.play('secret'); await wait(0.25);
    const it = spec.item;
    if (it === 'key') { dngState(G.map.dng).keys++; return bigMessage('得到了 小钥匙！', '可以打开一扇锁住的门。', 'key'); }
    if (it === 'bosskey') { dngState(G.map.dng).bossKey = true; return bigMessage('得到了 头目钥匙！', '可以打开头目房间的大门。', 'bosskey'); }
    if (ITEM_GET[it]) {
      giveItem(it); S.equip = it;
      if (it === 'bombs') S.bombs = 10; if (it === 'bow') S.arrows = 30;
      await bigMessage('得到了 ' + ITEMS[it].name + '！', ITEM_GET[it], it);
      return say('小叶', [it === 'boomerang' ? '太好了！刚才那扇蓝色的栅栏门，房间里应该有个水晶开关……用回旋镖打它试试！' : '新道具已经装备在 K 键上了。按 Q / E 可以切换哦。'], LEAF_LOOK);
    }
    if (it === 'heartp') return gainPiece();
    if (it === 'wallet') { S.wallet = S.wallet < 300 ? 300 : 999; return bigMessage('得到了 大钱包！', `现在最多可以装 ${S.wallet} 颗宝石。`, 'wallet'); }
    if (it === 'rupee20') { addRupees(20); return bigMessage('得到了 红宝石！', '价值 20 颗绿宝石。', 'rupee20'); }
    // 普通宝箱
    const r = Math.random();
    if (r < 0.3 && S.items.bombs) { S.bombs = Math.min(S.maxBombs, S.bombs + 5); return bigMessage('得到了 炸弹 ×5！', null, 'bombs'); }
    if (r < 0.55 && S.items.bow) { S.arrows = Math.min(S.maxArrows, S.arrows + 10); return bigMessage('得到了 箭 ×10！', null, 'arrow'); }
    addRupees(20); return bigMessage('得到了 红宝石！', '价值 20 颗绿宝石。', 'rupee20');
  });
}

// ============ 头目 ============
function bossDefeated(b) {
  runScript(async () => {
    const id = G.map.dng, D = DUNGEONS[id], d = dngState(id);
    Music.play(null); Music.want = null;
    for (let i = 0; i < 6; i++) { Particles.add(b.cx() + rand(-16, 16), b.cy() + rand(-16, 16), 18, pick(['#ffe060', '#ff8040', '#ffffff']), 90, 0.7); Sfx.play('bomb'); G.shake = 0.3; await wait(0.22); }
    for (const e of G.ents) if (e instanceof Enemy || e instanceof Proj) e.dead = true;
    d.boss = true; S.flags[id] = true; S.fruits++;
    openShutters();
    await wait(0.5);
    S.maxhp += 2; S.hp = S.maxhp;
    await bigMessage('得到了 心之容器！', '生命上限 +1', 'heartc');
    await bigMessage(`找回了 光之果实！（${S.fruits} / 4）`, '果实里散发着温暖的光芒。', 'fruit');
    if (id === 'd4') return endingScene();
    const next = { d1: '还剩三颗！下一颗在青草原东边的镜湖。湖心岛上的水晶开关……用回旋镖试试！', d2: '还剩两颗！有了炸弹，就能炸开岩石山道的巨石了。山道在青草原的北边。', d3: '只剩最后一颗了！用跳跃羽毛跳过青草原南边的大裂谷，暗影巫师就在古代遗迹里！' }[id];
    await say('小叶', ['做得好！古树的力量又恢复了一点。', next], LEAF_LOOK);
    await fadeOut(0.6);
    S.tiny = false;
    loadMap(D.from.map, D.from.x * TS, D.from.y * TS - 4, 0);
    await fadeIn(0.6);
  });
}
async function endingScene() {
  const w = BOSS_KINDS.wizard;
  await say(w.name, ['「不可能……被一个小不点打败了……」', '「古树的光……好刺眼……」'], w.look);
  await say('小叶', ['我们做到了！四颗光之果实都找回来了！', '快回村子吧，古树在等着我们！'], LEAF_LOOK);
  await fadeOut(1);
  S.flags.ending = true; S.tiny = false;
  loadMap('village', 18 * TS, 9 * TS - 4, 1);
  await new Promise(res => UI.push(new CreditsUI(res)));
  await fadeIn(1);
  await say(NPCS.elder.name, ['古树……重新长出新叶了！谢谢你，小小的勇者！'], NPCS.elder.look);
  await say('小叶', ['冒险告一段落啦。不过世界上还有没找到的心之碎片哦！', '我会一直陪着你的。'], LEAF_LOOK);
  saveGame(true);
}
