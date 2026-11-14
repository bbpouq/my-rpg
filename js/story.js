'use strict';
// =====================================================================
//  剧情：豆丁村的小豆，去大人的房子里夺回星星糖
// =====================================================================
const FIREFLY = { tpl: 'bug', a: '#f8e060', d: '#806020' };
const NPCS = {
  granny: { name: '奶奶', map: 'home', x: 3, y: 5, wander: 1, look: { hair: '#e0e0e0', shirt: '#9a6aa0', pants: '#5a4a3a' },
    talk: async d => {
      if (!S.flags.gotLeaf) return say(d.name, ['小豆，村长在灯笼草那儿等你呢。', '出门往右走，就是村子中间的广场。'], d.look);
      if (S.hp < S.maxhp) { S.hp = S.maxhp; Sfx.play('heal'); return say(d.name, ['哎哟，又被虫子咬了？来，奶奶给你抹点花粉膏。', '（生命全部恢复了！）'], d.look); }
      return say(d.name, [pick(['累了就回家，奶奶随时帮你治伤。', '大人们的房子很大很大，千万别被他们发现哦。', '罐子里有几颗纽扣，拿去用吧。'])], d.look);
    } },
  elder: { name: '村长', map: 'village', x: 21, y: 10, wander: 1, look: { hair: '#f0f0f0', shirt: '#5a8a4a', pants: '#4a3a2a', beard: '#f4f4f4' },
    talk: async d => {
      if (!S.flags.gotLeaf) return introScene(d);
      if (!S.flags.gotSword) return say(d.name, ['先去缝针道场找针婆婆吧，就在广场的东南边。'], d.look);
      return say(d.name, [hintFor()], d.look);
    } },
  master: { name: '针婆婆', map: 'dojo', x: 6, y: 3, wander: 0, look: { hair: '#c8c8d0', shirt: '#c83a5a', pants: '#2a2a32' },
    talk: async d => {
      if (!S.flags.gotLeaf) return say(d.name, ['今晚是灯笼节，你不去广场看看吗？'], d.look);
      if (!S.flags.gotSword) {
        await say(d.name, ['村长都跟我说了。你要去大人的房子里找星星糖？', '好孩子，有胆量！这根缝衣针是我年轻时从大人的针线盒里拖回来的。', '现在它是你的剑了。'], d.look);
        S.flags.gotSword = true;
        await bigMessage('得到了 缝衣针！', '按 J 刺出去。', 'sword');
        await say(d.name, ['再教你一招：按住 J 不放，等针尖发光了再松开——', '这就是【回旋斩】！被虫子围住的时候特别管用。', '还有，Shift 键可以翻滚，躲开攻击。', '先去北边的后院花园吧。大花盆里好像有老鼠的手下。'], d.look);
        return;
      }
      return say(d.name, [pick(['按住 J 蓄力，松开放出回旋斩。', '草丛和罐子里常常能找到纽扣和心。', '虫子被瓶盖砸中会晕一会儿，趁机刺它！', '有些头目穿着硬壳盔甲，得先想办法打破才行。'])], d.look);
    } },
  shopkeeper: { name: '瓢瓢老板', map: 'shop', x: 4, y: 2, wander: 0, look: { hair: '#2a2a2a', shirt: '#e84040', pants: '#2a2a2a' },
    talk: async d => { await say(d.name, ['欢迎光临瓶盖杂货铺！今天想要点什么？'], d.look); await openShop(); } },
  wife: { name: '村长夫人', map: 'elderhouse', x: 4, y: 5, wander: 1, look: { hair: '#d8d8d8', shirt: '#e0a0b0', pants: '#5a4a6a' },
    talk: async d => say(d.name, ['老头子说的我都听见了。', hintFor()], d.look) },
  hu: { name: '小芽', map: 'village', x: 23, y: 12, wander: 3, look: { hair: '#4a8a3a', shirt: '#e8a030', pants: '#3a5a8a' },
    talk: async d => say(d.name, [pick(['灯笼草根下有个特别小的洞！喝了露珠就能钻进去！', '听说一共有 8 片心之碎片，集齐 4 片就能多一颗心。', '我在大人的门廊上见过一只橘猫，有我们一千个那么大！'])], d.look) },
  mei: { name: '小铃', map: 'village', x: 16, y: 21, wander: 3, look: { hair: '#e070a0', shirt: '#f0f0f0', pants: '#a0c8f0' },
    talk: async d => say(d.name, [pick(['杂货铺有卖蜂蜜滴，倒下的时候会自动帮你回血哦！', '到处都有发光的露珠，喝一口就会变得和蚂蚁一样小。', '针婆婆可厉害了，她一针能挑起一颗豌豆！'])], d.look) },
  fisher: { name: '水黾大叔', map: 'lake', x: 5, y: 9, wander: 1, look: { hair: '#3a3a3a', shirt: '#3a7ab0', pants: '#5a4a3a', hat: '#e8d090' },
    talk: async d => {
      if (!S.flags.lakeBridge) return say(d.name, ['看到地漏边上那颗蓝色按钮了吗？', '一按它，大人用剩的冰棍棒就会搭成桥。', S.items.boomerang ? '你那个会飞回来的瓶盖……站在这边对准按钮扔过去试试？' : '可惜太远了，针是够不着的……'], d.look);
      return say(d.name, ['桥搭好了！地漏里黑乎乎的，可要小心啊。'], d.look);
    } },
  traveler: { name: '蜗牛邮差', map: 'field', x: 24, y: 9, wander: 0, look: { hair: '#8a5a2a', shirt: '#6a7a4a', pants: '#4a4a3a', hat: '#8a6a3a' },
    talk: async d => say(d.name, [pick(['南边那条木板缝有两格宽，得有弹簧才跳得过去。', '嘘——那只大橘猫在睡觉，别吵醒它。', '每个地方都藏着蚂蚁大小的小世界，里面有宝贝！'])], d.look) },
  miner: { name: '蚂蚁工头', map: 'mountain', x: 21, y: 13, wander: 1, look: { hair: '#4a3a2a', shirt: '#c04030', pants: '#3a3a3a', hat: '#e0c040' },
    talk: async d => say(d.name, [S.items.bombs ? '你有爆米花炸弹？那块卡住柜门的大饼干，一炸就开！' : '碗柜的门缝被一块大饼干卡住了，我们搬了三天都搬不动……'], d.look) },
  scholar: { name: '书虫先生', map: 'ruins', x: 22, y: 12, wander: 1, look: { hair: '#6a6a7a', shirt: '#3a3a6a', pants: '#2a2a3a' },
    talk: async d => say(d.name, [pick(['罐头城堡里到处都画着眼睛机关，得用弹弓打中才能开门。', '西边那堆书上也画着一只眼睛……后面好像藏着东西。', '老鼠大王穿着罐头盔甲，只有弹弓打得穿。'])], d.look) },
};
for (const k in NPCS) NPCS[k].id = k;
function npcsForMap(id) { const out = []; for (const k in NPCS) { const d = NPCS[k]; if (d.map === id) out.push(new NPC(d, d.x * TS, d.y * TS - 4)); } return out; }

async function introScene(d) {
  await say(d.name, ['小豆，你来啦。……你看，灯笼草一点光都没有了。', '昨天夜里，老鼠大王带着手下闯进村子，把照亮全村的四颗【星星糖】全抢走了！', '它们跑进了大人的房子，把星星糖藏在了房子的各个角落……'], d.look);
  Sfx.play('secret'); G.flash = 0.6; await wait(0.1); G.flash = 0;
  Particles.add(G.player.cx(), G.player.cy() - 20, 30, '#fff080', 60, 1);
  await say('？？？', ['喂——！这里这里！往上看！'], FIREFLY);
  await say('萤萤', ['我是萤火虫萤萤！以前每天晚上帮星星糖照路的。', '没有星星糖，我的屁股都快不亮了……我要和你一起去！', '告诉你一个秘密：到处都有【发光的露珠】。站在露珠上按 J 喝一口，你就会变得和蚂蚁一样小！', '变小以后能钻进墙缝、钥匙孔、刺丛底下——大人们永远注意不到的地方。'], FIREFLY);
  S.flags.gotLeaf = true;
  await bigMessage('萤萤成为了你的伙伴！', '站在发光的露珠上按 J，就能变小 / 变回来。', 'fruit');
  await say(d.name, ['好孩子，这件事就拜托你了。', '先去缝针道场找针婆婆，她会给你一件趁手的武器。道场就在广场东南边。'], d.look);
}
function hintFor() {
  if (!S.flags.d1) return '第一颗星星糖被藏在北边后院花园的大花盆里。花盆被玫瑰刺丛围着……听说刺丛底下有个小洞。';
  if (!S.flags.d2) return '第二颗在大人的浴室里，就在地漏深处。从木头门廊往东走就到了。';
  if (!S.flags.d3) return '第三颗在厨房的碗柜里，从门廊往北走。柜门被一块大饼干卡住了。';
  if (!S.flags.d4) return '最后一颗在地下室的罐头城堡，老鼠大王就在那里！要跳过门廊南边的木板缝才能去。';
  return '灯笼草又亮起来了！真是谢谢你，小豆。';
}
function goalText() {
  if (!S.flags.gotLeaf) return '出门往右，去村子中间的灯笼草下找村长。';
  if (!S.flags.gotSword) return '去村子东南边的缝针道场，找针婆婆。';
  if (!S.flags.d1) return '去北边的后院花园，进入大花盆。（刺丛底下有小洞：先在露珠上变小！）';
  if (!S.flags.d2) return '去门廊东边的浴室，用瓶盖砸中地漏边的蓝色按钮，进入地漏深处。';
  if (!S.flags.d3) return '去门廊北边的厨房，用爆米花炸弹炸开卡住柜门的饼干，进入碗柜迷宫。';
  if (!S.flags.d4) return '用弹簧鞋跳过门廊南边的木板缝，去地下室的罐头城堡，打倒老鼠大王！';
  const left = 8 - (S.flags.piecesFound || 0);
  return left > 0 ? `灯笼草亮起来了！还有 ${left} 片心之碎片藏在各个角落，去找找看吧。` : '你找齐了所有心之碎片！真正的豆丁勇者！';
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
  else if (t.lock === 'boss') { if (d.bossKey) openDoorAt(tx, ty); else toast('一扇大门。需要大钥匙。'); }
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
  boomerang: '按 K 扔出去，它会转一圈飞回来。\n能砸晕虫子、按到远处的按钮！',
  bombs: '按 K 放下，过一会儿"嘭"地炸开。\n能炸开饼干墙和有裂缝的东西！（Q / E 切换道具）',
  feather: '按 K 弹起来！可以跳过两格宽的缝。',
  bow: '按 K 发射豆子。打中画着的眼睛机关就能开门！',
};
function openChestReward(spec) {
  runScript(async () => {
    Sfx.play('secret'); await wait(0.25);
    const it = spec.item;
    if (it === 'key') { dngState(G.map.dng).keys++; return bigMessage('得到了 小钥匙！', '可以打开一扇锁住的门。', 'key'); }
    if (it === 'bosskey') { dngState(G.map.dng).bossKey = true; return bigMessage('得到了 大钥匙！', '可以打开头目房间的大门。', 'bosskey'); }
    if (ITEM_GET[it]) {
      giveItem(it); S.equip = it;
      if (it === 'bombs') S.bombs = 10; if (it === 'bow') S.arrows = 30;
      await bigMessage('得到了 ' + ITEMS[it].name + '！', ITEM_GET[it], it);
      return say('萤萤', [it === 'boomerang' ? '太好了！刚才那扇蓝色栅栏门……房间里应该有个按钮，用瓶盖砸它试试！' : '新道具已经装在 K 键上了。按 Q / E 可以切换哦。'], FIREFLY);
    }
    if (it === 'heartp') return gainPiece();
    if (it === 'wallet') { S.wallet = S.wallet < 300 ? 300 : 999; return bigMessage('得到了 大火柴盒！', `现在最多可以装 ${S.wallet} 颗纽扣。`, 'wallet'); }
    if (it === 'rupee20') { addRupees(20); return bigMessage('得到了 红纽扣！', '值 20 颗绿纽扣。', 'rupee20'); }
    const r = Math.random();
    if (r < 0.3 && S.items.bombs) { S.bombs = Math.min(S.maxBombs, S.bombs + 5); return bigMessage('得到了 爆米花 ×5！', null, 'bombs'); }
    if (r < 0.55 && S.items.bow) { S.arrows = Math.min(S.maxArrows, S.arrows + 10); return bigMessage('得到了 豆子 ×10！', null, 'arrow'); }
    addRupees(20); return bigMessage('得到了 红纽扣！', '值 20 颗绿纽扣。', 'rupee20');
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
    await bigMessage(`找回了 星星糖！（${S.fruits} / 4）`, '亮晶晶的，还有一点甜甜的味道。', 'fruit');
    if (id === 'd4') return endingScene();
    const next = { d1: '还剩三颗！下一颗在浴室的地漏里。地漏边上有颗蓝色按钮……用瓶盖砸它！', d2: '还剩两颗！有了爆米花炸弹，就能炸开卡在厨房碗柜门缝里的饼干了。', d3: '只剩最后一颗了！穿上弹簧鞋跳过门廊南边的木板缝，老鼠大王就在地下室！' }[id];
    await say('萤萤', ['好厉害！我的屁股又亮了一点！', next], FIREFLY);
    await fadeOut(0.6);
    S.tiny = false;
    loadMap(D.from.map, D.from.x * TS, D.from.y * TS - 4, 0);
    await fadeIn(0.6);
  });
}
async function endingScene() {
  const w = BOSS_KINDS.wizard;
  await say(w.name, ['「吱吱！不可能……被一颗豆子那么大的小不点打败了……」', '「我、我只是想让我的地下室也亮堂一点嘛……」'], w.look);
  await say('萤萤', ['原来是这样……那以后，我们分一点灯光给你们好不好？', '小豆，我们回家吧！'], FIREFLY);
  await fadeOut(1);
  S.flags.ending = true; S.tiny = false;
  loadMap('village', 18 * TS, 9 * TS - 4, 1);
  await new Promise(res => UI.push(new CreditsUI(res)));
  await fadeIn(1);
  await say(NPCS.elder.name, ['灯笼草……又亮起来了！谢谢你，小豆！'], NPCS.elder.look);
  await say('萤萤', ['冒险告一段落啦。不过房子里还藏着没找到的心之碎片哦！', '我会一直陪着你的。'], FIREFLY);
  saveGame(true);
}

// ============ 门廊上的大橘猫 ============
class BigCat extends Ent {
  constructor(x, y) { super(x * TS, y * TS); this.solid = true; this.interact = true; this.hb = { x: 2, y: 10, w: 76, h: 30 }; }
  onInteract() { runScript(async () => { await say(null, ['呼……噜……呼……噜……', '（一只像山一样大的橘猫在晒太阳睡觉。胡子随着呼吸一抖一抖的。）']); await say('萤萤', ['嘘——千万别吵醒它！被它看见我们就完蛋了！'], FIREFLY); }); return true; }
  draw(ctx, cx, cy) {
    const x = Math.round(this.x - cx), y = Math.round(this.y - cy), br = Math.sin(G.t * 1.6) * 1.5, O = PAL.outline;
    ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.beginPath(); ctx.ellipse(x + 40, y + 42, 42, 8, 0, 0, 7); ctx.fill();
    ctx.fillStyle = O; ctx.beginPath(); ctx.ellipse(x + 44, y + 28 - br / 2, 36 + br, 16 + br, 0, 0, 7); ctx.fill();
    ctx.fillStyle = '#f0a040'; ctx.beginPath(); ctx.ellipse(x + 44, y + 28 - br / 2, 34 + br, 14 + br, 0, 0, 7); ctx.fill();
    ctx.fillStyle = '#c87020'; for (let i = 0; i < 5; i++) ctx.fillRect(x + 26 + i * 9, y + 15 - br / 2, 4, 10);
    ctx.fillStyle = '#ffe0b0'; ctx.beginPath(); ctx.ellipse(x + 44, y + 36, 24, 5, 0, 0, 7); ctx.fill();
    // 尾巴
    ctx.strokeStyle = O; ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(x + 76, y + 30); ctx.quadraticCurveTo(x + 90, y + 40 + Math.sin(G.t) * 3, x + 74, y + 44); ctx.stroke();
    ctx.strokeStyle = '#f0a040'; ctx.lineWidth = 5; ctx.stroke(); ctx.lineWidth = 1;
    // 头
    ctx.fillStyle = O; ctx.beginPath(); ctx.ellipse(x + 14, y + 28, 15, 13, 0, 0, 7); ctx.fill();
    ctx.beginPath(); ctx.moveTo(x + 2, y + 22); ctx.lineTo(x + 4, y + 8); ctx.lineTo(x + 13, y + 17); ctx.fill();
    ctx.beginPath(); ctx.moveTo(x + 16, y + 17); ctx.lineTo(x + 24, y + 8); ctx.lineTo(x + 27, y + 22); ctx.fill();
    ctx.fillStyle = '#f0a040'; ctx.beginPath(); ctx.ellipse(x + 14, y + 28, 13, 11, 0, 0, 7); ctx.fill();
    ctx.beginPath(); ctx.moveTo(x + 4, y + 22); ctx.lineTo(x + 5, y + 11); ctx.lineTo(x + 12, y + 18); ctx.fill();
    ctx.beginPath(); ctx.moveTo(x + 17, y + 18); ctx.lineTo(x + 23, y + 11); ctx.lineTo(x + 25, y + 22); ctx.fill();
    ctx.fillStyle = '#ffd0c0'; ctx.fillRect(x + 6, y + 15, 2, 4); ctx.fillRect(x + 21, y + 15, 2, 4);
    ctx.fillStyle = O; ctx.fillRect(x + 6, y + 26, 5, 1); ctx.fillRect(x + 17, y + 26, 5, 1);
    ctx.fillStyle = '#e07080'; ctx.fillRect(x + 13, y + 30, 2, 2);
    ctx.fillStyle = '#ffffff'; ctx.fillRect(x - 4, y + 31, 9, 1); ctx.fillRect(x + 24, y + 31, 9, 1);
    // 打呼噜的 Z
    const zt = (G.t * 0.7) % 1;
    ctx.globalAlpha = 1 - zt; drawText(ctx, 'Z', x + 24 + zt * 10, y + 4 - zt * 14, '#ffffff', 8 + zt * 4, 'center', '#000', true); ctx.globalAlpha = 1;
  }
  sortY() { return this.y + 40; }
}
