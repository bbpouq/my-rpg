'use strict';
// ============ 剧情与 NPC ============
const LETTER_TEXT = [
  '亲爱的孩子：\n当你读到这封信时，爷爷大概已经去了很远的地方旅行了。',
  '这座农场是我一生的骄傲，现在它属于你了。好好照顾这片土地，它会回报你的。',
  '还有一件事……星露岛的四颗元素水晶被暗影封印了。岛上的灵兽们越来越不安。',
  '箱子里那把木剑，是我年轻时冒险用的。去晨星村找村长王伯吧，他会告诉你该怎么做。',
  '—— 永远爱你的爷爷',
];
const SHOP_HOURS = { store: [8, 20], smith: [8, 18] };
function friend(id) { return S.friends[id] = S.friends[id] || { pts: 0, talked: false, gifted: false, ev: {} }; }
function hearts(id) { return Math.floor(friend(id).pts / 100); }
function starterCounter() { return { sprig: 'ember', ember: 'bubbo', bubbo: 'sprig' }[S.flags.starter] || 'ember'; }
function evoLine(id, lv) { let sp = id; while (SPECIES[sp].evo && lv >= SPECIES[sp].evo[0]) sp = SPECIES[sp].evo[1]; return sp; }
function makeTeam(list) { return list.map(([sp, lv]) => { const m = makeMon(evoLine(sp, lv), lv); return m; }); }
function giveMon(mon, silent) {
  S.dex.seen[mon.sp] = 1; S.dex.caught[mon.sp] = 1;
  if (S.party.length < 6) { S.party.push(mon); return 'party'; }
  S.box.push(mon); return 'box';
}

const NPCS = {
  elder: { name: '王伯', look: { hair: '#e8e8e8', shirt: '#6a4aa0', pants: '#4a3a2a', beard: '#f4f4f4' },
    sched: [[0, 'elderhouse', 5, 5, 0, 1], [10, 'village', 18, 15, 0, 2], [17, 'elderhouse', 5, 5, 0, 1]],
    gifts: { love: ['pumpkin', 'cauli', 'salmon', 'tuna', 'melon'], like: ['potato', 'parsnip', 'bread', 'mushroom', 'corn'], hate: ['gel', 'bone', 'stone', 'wingm'] },
    hearts: { 4: async d => { await say(d.name, ['孩子，你让我想起了你爷爷年轻的时候。', '这是他当年留在我这里的东西，现在交给你吧。'], d.look); S.maxhp += 2; S.hp = S.maxhp; await bigMessage('获得了 心之容器！', '生命上限 +1', 'heart'); },
      8: async d => { await say(d.name, ['这颗大师球是村里代代相传的宝物。', '我相信你会在真正需要的时候使用它。'], d.look); addItem('masterball', 1); await bigMessage('获得了 大师球！', '必定能收服任何灵兽', 'ball'); } },
    talk: async (npc) => {
      const d = npc.def;
      if (!S.flags.metElder) {
        await say(d.name, [`哦！你就是老星的孙辈吧？我是晨星村的村长，叫我王伯就好。`, `你爷爷的事……我都听说了。他把农场托付给你，一定是相信你。`, `最近岛上不太平。古老的元素水晶被一股暗影力量封印了，野外的魔物越来越多。`, `一个人去野外太危险了。去村子北边的灵兽研究所找林博士吧，他会给你一只灵兽伙伴。`, `这点钱你先拿着，买些种子和道具。`], d.look);
        S.flags.metElder = true; S.gold += 500; Sfx.play('coin'); toast('获得了 500G');
        return;
      }
      if (!S.flags.gotStarter) { await say(d.name, ['灵兽研究所就在村子北边，屋顶是绿色的那栋。林博士在等你呢。'], d.look); return; }
      if (!S.flags.d1 && !S.flags.toldD1) {
        S.flags.toldD1 = true;
        await say(d.name, ['很好，你和灵兽相处得不错嘛。', '听好了：星露岛有四颗元素水晶——森、潮、炎、冰。它们守护着岛上的平衡。', '如今暗影之塔在北方的雪原上升起，水晶都被封印在了各地的神殿里。', '第一座是【森林神殿】，就在你家农场北边的迷雾森林深处。', '神殿里有很多机关和魔物。拿好你爷爷的剑，用J键挥剑，K键使用道具。', '对了，农场的活儿也别落下。种地能赚钱，钱能买到更好的道具！'], d.look);
        return;
      }
      const hints = {
        d1: '森林神殿就在迷雾森林的最深处。小心里面的机关！',
        d2: '据说珊瑚海滩的潮汐洞窟被一只"封印之眼"守护着。你拿到的弓箭应该能派上用场。',
        d3: '你学会游泳了？那就能渡过村子北边的河了！河对岸的赤焰山上有一座熔岩矿坑。',
        d4: '赤焰山北边的巨石挡住了去霜雪高原的路。用炸弹试试吧！冰晶神殿就在高原上。',
        d5: '暗影之塔的入口被寒冰封住了……火焰杖能融化它。最后的决战就靠你了！',
      };
      for (const k of ['d1', 'd2', 'd3', 'd4', 'd5']) if (!S.flags[k]) { await say(d.name, [hints[k]], d.look); return; }
      await say(d.name, [pick(['多亏了你，星露岛又恢复了和平。你爷爷一定会为你骄傲的。', '听说矿洞的最深处，有一种叫"星灵"的传说灵兽……', '今年的收成怎么样？要是种出了大南瓜，记得给我看看！'])], d.look);
    } },
  lin: { name: '林博士', look: { hair: '#9a9aa0', shirt: '#f4f4f4', pants: '#4a4a6a' },
    sched: [[0, 'lab', 7, 6, 0, 2]],
    gifts: { love: ['starshard', 'diamond', 'emerald', 'ruby'], like: ['quartz', 'amethyst', 'topaz', 'crystalfruit'], hate: ['gel', 'wood'] },
    hearts: { 4: async d => { await say(d.name, ['你对灵兽研究的帮助太大了！这些是我改良过的灵球。'], d.look); addItem('ultraball', 5); toastItem('ultraball', 5); },
      8: async d => { await say(d.name, ['我研究出了一种神奇的果实……能让人精力充沛！'], d.look); S.maxEnergy += 30; S.energy = S.maxEnergy; await bigMessage('体力上限 +30！', null, 'star'); } },
    talk: async (npc) => {
      const d = npc.def;
      if (!S.flags.gotStarter) { await starterScene(npc); return; }
      const c = Object.keys(S.dex.caught).length;
      const rw = [[5, 'greatball', 5], [12, 'superpotion', 5], [20, 'ultraball', 5], [30, 'revive', 5], [40, 'maxpotion', 5], [50, 'masterball', 1]];
      S.flags.dexRw = S.flags.dexRw || 0;
      let line = `让我看看你的图鉴……已经收服了 ${c} 种灵兽！`;
      const lines = [line];
      while (S.flags.dexRw < rw.length && c >= rw[S.flags.dexRw][0]) {
        const [n, it, k] = rw[S.flags.dexRw];
        lines.push(`达成 ${n} 种的奖励：请收下 ${ITEMS[it].name} ×${k}！`); addItem(it, k); S.flags.dexRw++;
      }
      if (S.flags.dexRw < rw.length) lines.push(`收服 ${rw[S.flags.dexRw][0]} 种的时候再来找我，我有奖励给你。`);
      lines.push(pick(['不同属性之间有克制关系，比如水克火、火克草、草克水。', '灵兽的体力越低，就越容易收服。让它睡着或麻痹也有帮助！', '队伍里没出场的灵兽也能获得一半的经验值。', '有些灵兽只在夜里或特定的地方出现哦。', '矿洞深处有很多稀有的灵兽，越往下等级越高。']));
      await say(d.name, lines, d.look);
    } },
  lily: { name: '莉莉', look: { hair: '#e8a040', shirt: '#e86a8a', pants: '#5a4a8a' },
    sched: [[0, 'store', 5, 3, 0, 0]],
    gifts: { love: ['strawberry', 'dandelion', 'fireflower', 'coral', 'melon'], like: ['blueberry', 'wildberry', 'shell', 'cranberry', 'snowberry'], hate: ['bone', 'gel', 'stone'] },
    hearts: { 3: async d => { await say(d.name, ['这是从远方商人那里进的稀有种子，送给你！据说能卖很高的价钱。'], d.look); addItem('starfruit_s', 5); toastItem('starfruit_s', 5); },
      6: async d => { await say(d.name, ['你总来照顾我的生意，这个送你，种地会轻松很多哦！'], d.look); addItem('qsprinkler', 4); toastItem('qsprinkler', 4); } },
    talk: async (npc) => {
      const d = npc.def;
      const c = await ask(pick(['欢迎光临莉莉杂货店！', '今天想买点什么？', '新鲜的种子刚到货哦！']), ['买东西', '聊天', '离开'], d.name, d.look);
      if (c === 0) await openShop('莉莉杂货店', storeStock());
      else if (c === 1) await chat(npc, ['每个季节能种的作物都不一样，换季的时候别忘了买新种子！', '把作物放进农场的出货箱，第二天就能拿到钱，很方便吧？', '草莓是我的最爱！', '洒水器可以自动浇水，用铜矿和铁矿就能做。', '下雨天不用浇水，作物会自己喝饱的～']);
    } },
  bear: { name: '大熊', look: { hair: '#3a2a1a', shirt: '#8a4a2a', pants: '#3a3a3a', beard: '#3a2a1a' },
    sched: [[0, 'smith', 4, 3, 0, 0]],
    gifts: { love: ['gold', 'mythril', 'ruby', 'diamond'], like: ['iron', 'copper', 'bread', 'topaz'], hate: ['dandelion', 'herb', 'shell'] },
    hearts: { 3: async d => { await say(d.name, ['哈哈，你小子不错！这些矿石送你，拿去升级装备吧！'], d.look); addItem('iron', 10); toastItem('iron', 10); },
      7: async d => { await say(d.name, ['这可是我珍藏的秘银，只有真正的勇者才配用它！'], d.look); addItem('mythril', 5); addItem('gold', 5); toastItem('mythril', 5); } },
    talk: async (npc) => {
      const d = npc.def;
      const c = await ask('铁匠铺！要升级装备还是买矿石？', ['升级装备', '购买矿石', '聊天', '离开'], d.name, d.look);
      if (c === 0) await openSmith();
      else if (c === 1) { const st = ['copper', 'iron', 'wood', 'stone']; if (S.flags.d3) st.push('gold'); await openShop('大熊铁匠铺', st); }
      else if (c === 2) await chat(npc, ['矿洞里的矿石越往深处越好。铜→铁→金→秘银！', '镐子等级不够的话，有些矿石是敲不动的。', '剑越好，打怪越轻松。别舍不得钱！', '我年轻时也和你爷爷一起冒过险，那家伙剑术可厉害了。']);
    } },
  mei: { name: '美玲', look: { hair: '#e070a0', shirt: '#ffffff', pants: '#e070a0' },
    sched: [[0, 'clinic', 6, 3, 0, 0]],
    gifts: { love: ['crystalfruit', 'strawberry', 'blueberry', 'snowberry'], like: ['wildberry', 'herb', 'potion', 'cranberry'], hate: ['bone', 'wingm', 'stone'] },
    hearts: { 4: async d => { await say(d.name, ['谢谢你一直这么关心大家。这些药你带着，冒险的时候用得上。'], d.look); addItem('maxpotion', 3); addItem('revive', 3); toastItem('revive', 3); },
      8: async d => { await say(d.name, ['这是……我用灵兽之力做的护身符。希望它能保护你。'], d.look); S.maxhp += 2; S.hp = S.maxhp; await bigMessage('获得了 心之容器！', '生命上限 +1', 'heart'); } },
    talk: async (npc) => {
      const d = npc.def;
      const c = await ask('欢迎来到灵兽中心！要让灵兽们休息一下吗？', ['恢复灵兽', '聊天', '离开'], d.name, d.look);
      if (c === 0) {
        await say(d.name, ['好的，请把灵兽交给我。'], d.look);
        Sfx.play('heal'); await wait(1.2); healParty();
        await say(d.name, ['让你久等了！你的灵兽都恢复了精神。欢迎再来！'], d.look);
      } else if (c === 1) await chat(npc, ['旁边的电脑可以寄存灵兽，队伍最多带6只。', '灵兽中毒的话，回合结束时会掉血。用万能药可以治好。', '灵兽全部倒下的话会被送回这里，还会丢掉一些钱，要小心哦。']);
    } },
  xue: { name: '小雪', look: { hair: '#3a3a5a', shirt: '#a0c8f0', pants: '#f0f0f8' },
    sched: [[0, 'xuehouse', 5, 4, 0, 1], [9, 'village', 25, 20, 0, 3], [13, 'meadow', 22, 9, 0, 2], [16, 'village', 26, 15, 0, 2], [20, 'xuehouse', 5, 4, 0, 1]],
    gifts: { love: ['dandelion', 'strawberry', 'coral', 'crystalfruit', 'starfruit'], like: ['shell', 'fireflower', 'blueberry', 'bread'], hate: ['bone', 'gel', 'wingm'] },
    hearts: { 4: async d => { await say(d.name, ['那个……这是我在海边捡到的，一直觉得很特别。', '送给你！要好好收着哦。'], d.look); S.maxhp += 2; S.hp = S.maxhp; await bigMessage('获得了 心之容器！', '生命上限 +1', 'heart'); },
      8: async d => { await say(d.name, ['我学会做仙露了！喝了以后会浑身是劲哦！', '……以后，也要常来找我玩呀。'], d.look); addItem('elixir', 3); S.maxEnergy += 40; S.energy = S.maxEnergy; await bigMessage('体力上限 +40！', '还获得了 仙露×3', 'potion'); } },
    talk: async (npc) => chat(npc, ['你好呀！今天天气真好～', '我最喜欢在草原上看灵兽们玩耍了。', '你知道吗？晚上的森林里会有萤火虫灵兽出现，可漂亮了！', '海边能捡到很漂亮的贝壳和珊瑚哦。', '我有点怕暗影之塔……你一定要小心。']) },
  jie: { name: '阿杰', look: { hair: '#c8502a', shirt: '#3a3a5a', pants: '#2a2a32' },
    where: () => {
      if (!S.flags.gotStarter) return ['lab', 9, 6, 2, 0];
      return ['village', 30, 13, 2, 2];
    },
    gifts: { love: ['bread', 'tuna', 'ruby'], like: ['potato', 'corn', 'bass'], hate: ['dandelion', 'shell'] },
    talk: async (npc) => {
      const d = npc.def;
      const stages = [['d1', 'rv2', [['chirp', 12], [starterCounter(), 14]], 800], ['d3', 'rv3', [['swifty', 27], ['zapper', 28], ['pebble', 27], [starterCounter(), 30]], 2500], ['d4', 'rv4', [['skyhawk', 38], ['thundra', 39], ['boulderon', 39], ['vampbat', 38], [starterCounter(), 42]], 5000]];
      for (const [need, flag, team, rw] of stages) {
        if (S.flags[need] && !S.flags[flag]) {
          await say(d.name, ['嘿！听说你又打败了一个神殿的头目？', '别得意！我也一直在变强！来比一场吧！'], d.look);
          const r = await startBattle({ trainer: { name: '劲敌 阿杰', team: makeTeam(team), reward: rw, loseLine: '可恶……下次一定赢你！' } });
          if (r === 'win') { S.flags[flag] = true; await say(d.name, ['……你真的很强。我会继续修炼的！'], d.look); }
          return;
        }
      }
      if (S.flags.d5) {
        if (S.flags.rvDay !== S.year * 1000 + S.season * 100 + S.day) {
          const c = await ask('喂！要不要来一场巅峰对决？', ['来吧！', '下次吧'], d.name, d.look);
          if (c === 0) { const r = await startBattle({ trainer: { name: '劲敌 阿杰', team: makeTeam([['skyhawk', 58], ['thundra', 58], ['boulderon', 58], ['nightmare', 58], ['heavendr', 60], [starterCounter(), 62]]), reward: 8000, loseLine: '哈哈，痛快！明天再来！', boss: true } }); if (r === 'win') S.flags.rvDay = S.year * 1000 + S.season * 100 + S.day; }
          return;
        }
      }
      await chat(npc, ['我要成为星露岛最强的灵兽训练家！', '竞技场的冠军可厉害了，我还没赢过他。', '你的灵兽状态不错嘛。', '别以为你赢了一次就能一直赢！']);
    } },
  hai: { name: '阿海', look: { hair: '#2a2a2a', shirt: '#3a7ab0', pants: '#5a4a3a', hat: '#e8d090' },
    sched: [[0, 'fisherhut', 5, 5, 0, 0], [7, 'beach', 28, 13, 3, 0], [19, 'fisherhut', 5, 5, 0, 1]],
    gifts: { love: ['tuna', 'octopus', 'puffer', 'legend', 'goldfish'], like: ['sardine', 'bass', 'trout', 'salmon', 'bread'], hate: ['dandelion', 'gel'] },
    hearts: { 3: async d => { await say(d.name, ['你钓鱼越来越有样子了！我帮你把鱼竿改良一下。'], d.look); S.toolLv.rod = 2; toast('鱼竿升级了！钓鱼更容易了。'); },
      6: async d => { await say(d.name, ['这根是我珍藏的大师鱼竿，送给你！', '据说在下雪的湖里或者大海里，偶尔能钓到传说之鱼……'], d.look); S.toolLv.rod = 4; toast('鱼竿升级为大师鱼竿！'); } },
    talk: async (npc) => {
      const d = npc.def;
      if (!S.flags.gotRod) {
        await say(d.name, ['哟，生面孔啊。你是老星的孙辈？', '你爷爷以前经常和我一起钓鱼呢。这根旧鱼竿送给你吧！'], d.look);
        if (addItem('rod', 1)) { S.flags.gotRod = true; await bigMessage('获得了 鱼竿！', '选中鱼竿后，面对水面按K抛竿。', 'rod'); await say(d.name, ['鱼上钩的时候会出现"!"，赶快按J！', '然后按住J让绿色的条往上，松开就往下，用它罩住鱼就能钓上来！', '池塘、河流、大海、雪湖里的鱼都不一样，多去试试吧。'], d.look); }
        else toast('背包满了！');
        return;
      }
      await chat(npc, ['大海里能钓到金枪鱼和章鱼，值不少钱哦。', '下雨天河里会有鲶鱼出没。', '赤焰山上有个湖，里面有金鳞鱼。', '钓鱼的诀窍就是耐心……还有手速！', '听说暗影之塔出现以后，海里的鱼都变少了……']);
    } },
  hu: { name: '小虎', look: { hair: '#2a2a2a', shirt: '#e8a030', pants: '#3a5a8a' },
    sched: [[0, 'village', 22, 9, 0, 4]], wander: 4,
    talk: async (npc) => chat(npc, ['我长大了也要像你一样去冒险！', '你知道吗？对着灵兽扔灵球，它越虚弱越容易收服！', '晚上村子里好安静……', '在菜单里可以看到当前的目标哦！按I打开菜单。', '把剑升级以后，打怪会快很多！铁匠铺在村子西南边。', '据说草原南边的草丛里，偶尔会有三种稀有的初始灵兽出没！']) },
  granny: { name: '孙婆婆', look: { hair: '#d0d0d0', shirt: '#8a5a8a', pants: '#5a4a3a' },
    sched: [[0, 'village', 9, 13, 0, 1]],
    gifts: { love: ['potato', 'yam', 'pumpkin', 'snowyam', 'mushroom'], like: ['parsnip', 'herb', 'eggplant', 'winterroot'], hate: ['bone', 'gel'] },
    hearts: { 5: async d => { await say(d.name, ['这是我们家祖传的养生秘方，告诉你吧……', '每天早睡早起，多吃蔬菜！哈哈哈。'], d.look); S.maxEnergy += 30; S.energy = S.maxEnergy; await bigMessage('体力上限 +30！', null, 'star'); } },
    talk: async (npc) => {
      const d = npc.def;
      const day = S.year * 1000 + S.season * 100 + S.day;
      if (S.flags.grannyDay !== day && hearts('granny') >= 1) {
        S.flags.grannyDay = day;
        const seeds = Object.values(CROPS).filter(c => c.seasons.includes(S.season) && c.id !== 'starfruit');
        if (seeds.length) { const s = pick(seeds); await say(d.name, ['孩子，又来看我啦。这些种子拿去种吧！'], d.look); addItem(s.id + '_s', 3); toastItem(s.id + '_s', 3); return; }
      }
      await chat(npc, ['作物要每天浇水才会长大哦。', '好的土地需要用心照顾，就像你爷爷那样。', '冬天也有能种的作物，冬根和雪晶莓都不怕冷。', '我年轻的时候，村子里可热闹了……', '晚上别在外面待太晚，凌晨两点会累倒的！']);
    } },
  arena: { name: '竞技场主持人', look: { hair: '#f0d040', shirt: '#c83a3a', pants: '#2a2a32' },
    sched: [[0, 'arena', 8, 2, 0, 0]],
    talk: async (npc) => arenaTalk(npc) },
};
for (const k in NPCS) NPCS[k].id = k;

async function chat(npc, lines) {
  const d = npc.def;
  const f = d.gifts ? friend(d.id) : null;
  let first = false;
  if (f && !f.talked) { f.talked = true; f.pts += 10; first = true; }
  await say(d.name, [pick(lines)], d.look);
  if (S.request && !S.request.done && S.request.who === d.id) await say(d.name, [`对了，我在告示板上发了委托：需要 ${ITEMS[S.request.id].name}×${S.request.n}。拜托你啦！`], d.look);
}

// ============ 初始灵兽 ============
async function starterScene(npc) {
  const d = npc.def;
  await say(d.name, ['欢迎来到灵兽研究所！我是林博士。', '村长已经跟我说了你的事。外面的魔物越来越多，你需要一个可靠的伙伴。', '这里有三只灵兽，请从中选择一只吧！'], d.look);
  const sts = ['sprig', 'ember', 'bubbo'];
  const desc = { sprig: '草属性的【芽芽球】，性格温和，很能吃苦耐劳。', ember: '火属性的【火绒狐】，活泼好动，攻击力很强。', bubbo: '水属性的【水泡鱼】，防御力出众，很可靠。' };
  while (true) {
    for (const s of sts) await say(d.name, [desc[s]], SPECIES[s].look);
    const c = await ask('选择哪一只？', ['芽芽球（草）', '火绒狐（火）', '水泡鱼（水）', '再听一遍介绍'], d.name, d.look);
    if (c < 0 || c === 3) continue;
    const s = sts[c];
    const ok = await ask(`确定选择 ${SPECIES[s].name} 吗？`, ['就是它了！', '再想想'], null, SPECIES[s].look);
    if (ok !== 0) continue;
    const mon = makeMon(s, 5);
    giveMon(mon); S.flags.gotStarter = true; S.flags.starter = s;
    Sfx.play('item');
    await bigMessage(`${SPECIES[s].name} 成为了你的伙伴！`, '它会跟在你身后一起冒险。');
    break;
  }
  addItem('ball', 5); addItem('potion', 3);
  await say(d.name, ['再送你5个灵球和3瓶回复药。', '在草丛里会遇到野生灵兽，把它们打虚弱后扔出灵球就能收服！', '按I打开菜单，可以查看灵兽和图鉴。'], d.look);
  // 劲敌登场
  const jie = G.ents.find(e => e.def && e.def.id === 'jie');
  const jd = NPCS.jie;
  await say(jd.name, ['等一下！我也要选！', `那我就要这只${SPECIES[starterCounter()].name}！属性正好克制你的！`, '来，我们来比一场吧！'], jd.look);
  const rm = makeMon(starterCounter(), 5); rm.moves = ['tackle', 'growl']; rm.iv = [0, 0, 0, 0]; calcStats(rm); rm.hp = rm.maxhp;
  const r = await startBattle({ trainer: { name: '劲敌 阿杰', team: [rm], reward: 200, loseLine: '什么？！我居然输了！' }, noWhiteout: true });
  if (r === 'win') await say(jd.name, ['哼，这次算你运气好！下次我一定会赢的！'], jd.look);
  else await say(jd.name, ['哈哈，我赢了！你还得多练练啊！'], jd.look);
  healParty();
  await say(d.name, ['真是精彩的对战！我帮你的灵兽恢复了体力。', '去和村长聊聊吧，他有重要的事要告诉你。'], d.look);
  refreshNPCs();
}

// ============ 训练家 ============
const TRAINERS = [
  { id: 't_m1', map: 'meadow', x: 14, y: 7, dir: 3, name: '捕虫少年 小明', look: { hair: '#2a2a2a', shirt: '#6aa83a', pants: '#8a6a3a', hat: '#e8d070' }, team: [['beetle', 4], ['beetle', 5]], reward: 120, intro: '我的虫虫们可厉害了！', lose: '虫虫们……对不起……' },
  { id: 't_m2', map: 'meadow', x: 8, y: 15, dir: 0, name: '少女 花花', look: { hair: '#e8a0c0', shirt: '#f0e070', pants: '#e8e8f0' }, team: [['jelly', 5], ['chirp', 6]], reward: 150, intro: '你也是来看风景的吗？那先和我比一场吧！', lose: '呜……好强……' },
  { id: 't_m3', map: 'meadow', x: 30, y: 24, dir: 2, name: '短裤小子 阿强', look: { hair: '#5a3a1a', shirt: '#e05050', pants: '#3a6ad0' }, team: [['mousy', 6], ['zapper', 7]], reward: 180, intro: '短裤是最棒的！来对战吧！', lose: '我的短裤……不对，我的灵兽！' },
  { id: 't_f1', map: 'forest', x: 12, y: 13, dir: 3, name: '蘑菇猎人 阿木', look: { hair: '#6a4a2a', shirt: '#8a5a3a', pants: '#4a5a3a', hat: '#d84a4a' }, team: [['shroom', 9], ['shroom', 10]], reward: 300, intro: '这片林子里的蘑菇都是我的！', lose: '看来蘑菇也有不灵的时候……' },
  { id: 't_f2', map: 'forest', x: 33, y: 18, dir: 2, name: '森林少女 萤', look: { hair: '#2a4a2a', shirt: '#e8e060', pants: '#4a8a4a' }, team: [['glowbug', 9], ['wisp', 10], ['beetle', 10]], reward: 330, intro: '森林的精灵会保佑我！', lose: '你的灵兽和你很亲近呢。' },
  { id: 't_b1', map: 'beach', x: 18, y: 12, dir: 2, name: '泳者 小蓝', look: { hair: '#3a6ad0', shirt: '#4ac0e0', pants: '#3a6ad0' }, team: [['starfish', 13], ['jelly', 14]], reward: 500, intro: '游完泳正好热身！', lose: '我还是回去游泳吧……' },
  { id: 't_b2', map: 'beach', x: 26, y: 14, dir: 0, name: '渔夫 老李', look: { hair: '#5a5a5a', shirt: '#6a8a5a', pants: '#4a3a2a', hat: '#c0a060' }, team: [['crabby', 14], ['turtle', 15], ['bubbo', 14]], reward: 550, intro: '钓鱼钓累了，来活动活动筋骨！', lose: '年轻人真厉害啊。' },
  { id: 't_b3', map: 'beach', x: 12, y: 20, dir: 1, name: '冲浪少年 阿浪', look: { hair: '#f0d040', shirt: '#f08030', pants: '#3a8ad0' }, team: [['zapper', 15], ['starfish', 15], ['chirp', 16]], reward: 600, intro: '浪来了！我们也来一场吧！', lose: '被你拍在沙滩上了……' },
  { id: 't_mt1', map: 'mountain', x: 21, y: 18, dir: 0, name: '登山家 老张', look: { hair: '#4a3a2a', shirt: '#c05030', pants: '#5a5a4a', hat: '#e0c040' }, team: [['pebble', 19], ['pebble', 20], ['ironhorn', 21]], reward: 900, intro: '在山上，只有强者才能前进！', lose: '这座山……欢迎你。' },
  { id: 't_mt2', map: 'mountain', x: 29, y: 9, dir: 2, name: '火焰少年 炎', look: { hair: '#e04020', shirt: '#f0a030', pants: '#3a2a2a' }, team: [['salamand', 21], ['ember', 22]], reward: 1000, intro: '我的心在燃烧！', lose: '火……熄灭了……' },
  { id: 't_mt3', map: 'mountain', x: 22, y: 6, dir: 0, name: '驯龙者 龙也', look: { hair: '#4a8a8a', shirt: '#2a4a6a', pants: '#2a2a32' }, team: [['drake', 23], ['swifty', 22]], reward: 1300, intro: '龙是最强的灵兽！你见识过吗？', lose: '你……竟然打败了龙！' },
  { id: 't_s1', map: 'snow', x: 20, y: 18, dir: 0, name: '滑雪者 小冬', look: { hair: '#f0f0f0', shirt: '#e04060', pants: '#2a3a6a', hat: '#4060e0' }, team: [['snowball', 27], ['frostwolf', 28]], reward: 1600, intro: '雪原是我的主场！', lose: '冻僵了……' },
  { id: 't_s2', map: 'snow', x: 14, y: 9, dir: 3, name: '冰之巫女 雪华', look: { hair: '#a0e0ff', shirt: '#ffffff', pants: '#a0c0e0' }, team: [['sprite', 29], ['icebear', 30], ['turtle', 29]], reward: 2000, intro: '暗影之塔的气息越来越强了……让我看看你的实力。', lose: '你就是传说中的勇者吗……' },
];
const TRAINER_BY_ID = {}; TRAINERS.forEach(t => TRAINER_BY_ID[t.id] = t);
function trainerDef(t) {
  return {
    id: t.id, name: t.name, look: t.look, trainer: true, dir: t.dir,
    talk: async (npc) => {
      if (!S.trainers[t.id]) { await trainerBattle(npc, t); return; }
      await say(t.name, [t.lose], t.look);
    }
  };
}
async function trainerBattle(npc, t) {
  await say(t.name, [t.intro], t.look);
  const r = await startBattle({ trainer: { name: t.name, team: makeTeam(t.team), reward: t.reward, loseLine: t.lose } });
  if (r === 'win') S.trainers[t.id] = true;
}
function trainerSpotted(npc) {
  if (!hasHealthyMon()) return;
  const t = TRAINER_BY_ID[npc.def.id]; if (!t) return;
  runScript(async () => {
    Sfx.play('bite'); npc.emoteT = 0.8;
    await wait(0.7);
    const p = G.player, d = DIRS[npc.dir];
    // 走向玩家
    for (let i = 0; i < 200; i++) {
      const dist = Math.abs(p.cx() - npc.cx()) + Math.abs(p.cy() - npc.cy());
      if (dist < 20) break;
      const ok = moveBody(npc, d[0] * 1.5, d[1] * 1.5, 'npc');
      npc.frame = Math.floor(i / 6) % 2;
      if (!ok) break;
      await wait(1 / 60);
    }
    npc.frame = 0;
    p.dir = [1, 0, 3, 2][npc.dir];
    await trainerBattle(npc, t);
  });
}

// ============ 竞技场 ============
const ARENA = [
  { name: '新人训练家 阿明', team: [['mousy', 8], ['chirp', 9]], reward: 300 },
  { name: '虫使 小林', team: [['beetle', 13], ['glowbug', 14], ['beetle', 14]], reward: 600 },
  { name: '水手 大海', team: [['jelly', 18], ['starfish', 19], ['crabby', 20]], reward: 1000 },
  { name: '电气工程师 雷', team: [['zapper', 23], ['zapper', 24], ['thundra', 25]], reward: 1500 },
  { name: '岩石壮汉 石头', team: [['pebble', 28], ['boulderon', 30], ['ironhorn', 30]], reward: 2200 },
  { name: '火焰舞者 焰', team: [['salamand', 33], ['flarefox', 34], ['magmaliz', 36]], reward: 3000 },
  { name: '冰雪女王 凝霜', team: [['snowball', 38], ['frostwolf', 40], ['fortoise', 40], ['icebear', 42]], reward: 4000 },
  { name: '冠军 星河', team: [['skyhawk', 46], ['kingjelly', 46], ['seraph', 47], ['skydrake', 48], ['boulderon', 47], ['blazefox', 50]], reward: 8000, boss: true },
];
async function arenaTalk(npc) {
  const d = npc.def;
  if (!hasHealthyMon()) { await say(d.name, ['你的灵兽都没有力气了，先去灵兽中心恢复一下吧！'], d.look); return; }
  if (S.arena >= ARENA.length) {
    const c = await ask('冠军大人！要挑战大师赛吗？（对手非常强）', ['挑战！', '下次吧'], d.name, d.look);
    if (c !== 0) return;
    const lv = Math.min(90, 60 + (S.flags.masterWins || 0) * 3);
    const pool = ['heavendr', 'seraph', 'nightmare', 'magmaliz', 'fortoise', 'kingcrab', 'icebear', 'thundra', 'toadking', 'tidaldra', 'blazefox', 'sylvan', 'vampbat', 'starmoth', 'coralstar'];
    const team = shuffle(pool.slice()).slice(0, 6).map(s => makeMon(s, lv));
    const r = await startBattle({ trainer: { name: '大师 ' + pick(['青龙', '白虎', '朱雀', '玄武', '麒麟']), team, reward: 6000 + lv * 100, loseLine: '不愧是冠军！', boss: true } });
    if (r === 'win') S.flags.masterWins = (S.flags.masterWins || 0) + 1;
    return;
  }
  const a = ARENA[S.arena];
  const c = await ask(`欢迎来到灵兽竞技场！你目前的段位是 ${S.arena}/8。\n下一位对手：${a.name}（灵兽等级约 ${a.team[a.team.length - 1][1]}）`, ['开始挑战', '离开'], d.name, d.look);
  if (c !== 0) return;
  healParty();
  const r = await startBattle({ trainer: { name: a.name, team: makeTeam(a.team), reward: a.reward, loseLine: '你很强！', boss: a.boss } });
  if (r === 'win') {
    S.arena++; healParty();
    if (S.arena >= ARENA.length) { await say(d.name, ['不可思议！你打败了冠军星河！', '从今天起，你就是星露岛的灵兽冠军了！', '这是冠军的奖品！'], d.look); addItem('masterball', 1); addItem('maxpotion', 5); await bigMessage('成为了灵兽冠军！', '获得 大师球 和 全满药×5', 'star'); }
    else await say(d.name, [`恭喜晋级！你的段位现在是 ${S.arena}/8。`, '灵兽们已经帮你恢复好了。随时欢迎挑战下一位！'], d.look);
  }
}

// ============ 野外宝箱 ============
const OW_CHESTS = {
  forest: [{ cid: 'f1', x: 35, y: 15, item: 'heartc' }, { cid: 'f2', x: 4, y: 28, item: 'greatball', n: 3 }],
  meadow: [{ cid: 'm1', x: 40, y: 13, item: 'superpotion', n: 3 }, { cid: 'm2', x: 4, y: 27, item: 'copper', n: 8 }],
  beach: [{ cid: 'b1', x: 25, y: 19, item: 'heartc' }, { cid: 'b2', x: 3, y: 4, item: 'ultraball', n: 2 }],
  mountain: [{ cid: 'mt1', x: 5, y: 4, item: 'heartc' }, { cid: 'mt2', x: 40, y: 26, item: 'gold', n: 5 }],
  snow: [{ cid: 's1', x: 36, y: 26, item: 'heartc' }, { cid: 's2', x: 4, y: 26, item: 'diamond', n: 1 }],
  farm: [],
};

// ============ NPC 位置 ============
function npcLoc(def) {
  if (def.where) return def.where();
  if (!def.sched) return null;
  const h = Math.floor(S.time / 60) % 24;
  let cur = def.sched[0];
  for (const e of def.sched) if (h >= e[0]) cur = e;
  return [cur[1], cur[2], cur[3], cur[4], cur[5]];
}
function npcsForMap(mapId) {
  const out = [];
  for (const k in NPCS) {
    const def = NPCS[k]; const loc = npcLoc(def);
    if (!loc || loc[0] !== mapId) continue;
    def.dir = loc[3]; def.wander = loc[4] != null ? loc[4] : def.wander;
    out.push(new NPC(def, loc[1] * TS, loc[2] * TS - 4));
  }
  for (const t of TRAINERS) if (t.map === mapId) out.push(new NPC(trainerDef(t), t.x * TS, t.y * TS - 4));
  return out;
}
function refreshNPCs() {
  if (!G.map) return;
  const want = npcsForMap(G.map.id).filter(n => NPCS[n.def.id]);
  const wantIds = want.map(n => n.def.id);
  for (const e of G.ents) if (e.npc && NPCS[e.def.id] && !wantIds.includes(e.def.id)) e.dead = true;
  for (const n of want) if (!G.ents.some(e => e.npc && !e.dead && e.def.id === n.def.id)) G.ents.push(n);
}

// ============ 调查/交互 ============
function tryInteract(p) {
  const d = DIRS[p.dir];
  const px = p.cx() + d[0] * 12, py = p.cy() + d[1] * 12;
  const near = (e, x, y) => { const b = e.box(); return x >= b.x - 4 && x <= b.x + b.w + 4 && y >= b.y - 5 && y <= b.y + b.h + 5; };
  for (const e of G.ents) {
    if (e.dead) continue;
    if (e.npc && near(e, px, py)) { talkTo(e); return true; }
    if (e.interact && near(e, px, py)) { if (e.onInteract()) return true; }
  }
  const tx = Math.floor(px / TS), ty = Math.floor(py / TS);
  const t = tileProps(tx, ty);
  if (!t) return false;
  if (t.name === 'COUNTER') {
    const qx = px + d[0] * 16, qy = py + d[1] * 16;
    for (const e of G.ents) if (e.npc && !e.dead && near(e, qx, qy)) { talkTo(e); return true; }
  }
  // 收获
  const [fx, fy] = p.facingTile();
  if (G.map.isFarm && S.farm.crops[farmKey(fx, fy)]) { harvestAt(fx, fy); return true; }
  const idx = ty * G.map.w + tx;
  if (G.map.signs[idx]) { const txt = G.map.signs[idx]; runScript(async () => { if (txt === '【村告示板】') await boardScript(); else await say(null, [txt]); }); return true; }
  if (t.name === 'BED' || t.name === 'BEDB') { runScript(sleepInBed); return true; }
  if (t.pc) { runScript(async () => { if (!S.party.length) { await say(null, ['电脑上显示着"灵兽寄存系统"。你还没有灵兽。']); return; } await say(null, ['打开了灵兽寄存系统。']); await openPC(); }); return true; }
  if (t.healer) { runScript(async () => { await say(null, ['这是灵兽治疗机。和柜台的美玲说话就能使用。']); }); return true; }
  if (t.name === 'TV') { runScript(async () => say(null, [pick([`【天气预报】明天的天气是……${S.tomorrow === 'rain' ? '雨天！不用浇水了！' : '晴天！'}`, `【天气预报】明天：${S.tomorrow === 'rain' ? '有雨' : '晴朗'}。`]), pick(['【农业频道】夏天的蓝莓一次能收好几颗，很赚钱哦！', '【灵兽频道】属性相克可以造成双倍伤害！', '【冒险频道】地下城里的宝箱有时要清空房间的怪物才会出现。', '【农业频道】高级洒水器可以浇灌周围8格！', '【冒险频道】推动石块压住地上的机关，会有好事发生。'])])); return true; }
  if (t.name === 'STOVE') { runScript(async () => say(null, ['厨房收拾得很干净。'])); return true; }
  if (t.name === 'BOOKS' || t.name === 'SHELF') { runScript(async () => say(null, [pick(['书架上摆满了关于灵兽的书。', '《星露岛的传说》：远古时代，四只守护灵将暗影封印在了北方……', '《农夫手册》：每种作物都有适合的季节。', '《冒险者笔记》：头目都有弱点，试试用不同的道具攻击它们！'])])); return true; }
  if (t.lock) { tryUnlock(tx, ty, t); return true; }
  if (t.name === 'FOUNT') { runScript(async () => say(null, ['清澈的泉水。据说向喷泉许愿会带来好运。'])); return true; }
  return false;
}
function talkTo(npc) {
  const p = G.player;
  if (npc.def.trainer && !S.trainers[npc.def.id] && !hasHealthyMon()) { runScript(async () => say(npc.def.name, ['你的灵兽都没力气了，先去恢复吧！'], npc.def.look)); return; }
  npc.dir = [1, 0, 3, 2][p.dir]; npc.mv = null; npc.frame = 0; npc.talking = true;
  runScript(async () => {
    try {
      await npc.def.talk(npc);
      if (npc.def.gifts) { await giftFlow(npc); await checkHearts(npc.def); }
      await checkRequestDelivery(npc.def);
    } finally { npc.talking = false; }
  });
}
async function giftFlow(npc) {
  const def = npc.def, f = friend(def.id);
  const slot = S.inv[S.sel]; if (!slot || f.gifted) return;
  const it = ITEMS[slot.id];
  if (['tool', 'key', 'ammo', 'craft'].includes(it.type)) return;
  const c = await ask(`要把手中的 ${it.name} 送给${def.name}吗？`, ['送给Ta', '不了']);
  if (c !== 0) return;
  removeItem(it.id, 1); f.gifted = true;
  let pts = 20, line = '谢谢你的礼物。';
  if (def.gifts.love.includes(it.id)) { pts = 80; line = '哇！这是我最喜欢的东西！太谢谢你了！'; }
  else if (def.gifts.like.includes(it.id)) { pts = 45; line = '谢谢！我很喜欢这个！'; }
  else if (def.gifts.hate.includes(it.id)) { pts = -30; line = '呃……这个……我不太需要……'; }
  f.pts = clamp(f.pts + pts, 0, 1000);
  if (pts > 0) Sfx.play('heal');
  await say(def.name, [line], def.look);
}
async function checkHearts(def) {
  if (!def.hearts) return;
  const f = friend(def.id), h = hearts(def.id);
  for (const k in def.hearts) if (h >= +k && !f.ev[k]) { f.ev[k] = true; await def.hearts[k](def); }
}
async function checkRequestDelivery(def) {
  const r = S.request;
  if (!r || r.done || r.who !== def.id) return;
  if (countItem(r.id) < r.n) return;
  const c = await ask(`要把 ${ITEMS[r.id].name}×${r.n} 交给${def.name}吗？（委托报酬 ${r.reward}G）`, ['交付', '不了']);
  if (c !== 0) return;
  removeItem(r.id, r.n); S.gold += r.reward; r.done = true; friend(def.id).pts += 60;
  Sfx.play('coin');
  await say(def.name, [`太好了，帮大忙了！这是报酬 ${r.reward}G，请收下！`], def.look);
}
async function boardScript() {
  const r = S.request;
  if (!r) { S.request = makeRequest(); }
  const q = S.request;
  if (q.done) { await say(null, ['【村告示板】今天的委托已经完成了。明天再来看看吧！']); return; }
  await say(null, [`【村告示板】委托人：${NPCS[q.who].name}\n「需要 ${ITEMS[q.id].name} ×${q.n}，报酬 ${q.reward}G。」\n（直接交给${NPCS[q.who].name}即可。你现在有 ${countItem(q.id)} 个）`]);
}
function tryUnlock(tx, ty, t) {
  const d = dngState(G.map.dng);
  if (t.lock === 'key') { if (d.keys > 0) { d.keys--; openDoorAt(tx, ty); } else toast('门锁住了。需要一把小钥匙。'); }
  else if (t.lock === 'boss') { if (d.bossKey) openDoorAt(tx, ty); else toast('一扇巨大的门。需要头目钥匙。'); }
}

// ============ 野生遭遇 ============
function wildEncounter() {
  const enc = G.map.enc.filter(e => e[3] > 0);
  let tot = 0; for (const e of enc) tot += e[3];
  let r = Math.random() * tot, e = enc[0];
  for (const x of enc) { r -= x[3]; if (r <= 0) { e = x; break; } }
  let sp = e[0];
  // 夜晚更容易遇到幽灵和蝙蝠
  if (G.map.outdoor && S.time > 20 * 60 && chance(0.25)) sp = pick(['wisp', 'bat', 'glowbug']);
  const lv = randi(e[1], e[2]);
  const mon = makeMon(evoLine(sp, lv) === sp ? sp : sp, lv);
  runScript(async () => {
    Sfx.play('encounter');
    for (let i = 0; i < 3; i++) { G.flash = 1; await wait(0.08); G.flash = 0; await wait(0.08); }
    await startBattle({ wild: mon });
  });
}

// ============ 目标 ============
function goalText() {
  if (!S.flags.gotSword) return '打开小屋里爷爷留下的宝箱。';
  if (!S.flags.metElder) return '出门往东走，去晨星村找村长王伯。';
  if (!S.flags.gotStarter) return '去晨星村的灵兽研究所（绿色屋顶）找林博士，领取灵兽伙伴。';
  if (!S.flags.d1) return '前往农场北边迷雾森林深处的【森林神殿】，夺回森之水晶。\n（别忘了照顾农场：开垦→播种→浇水→收获→出货）';
  if (!S.flags.d2) return '用弓箭射中珊瑚海滩（晨星村东边）悬崖上的封印之眼，进入【潮汐洞窟】。\n顺便去找渔夫阿海拿一根鱼竿吧。';
  if (!S.flags.d3) return '学会了游泳！游过晨星村北边的河，前往赤焰山的【熔岩矿坑】。';
  if (!S.flags.d4) return '用炸弹炸开赤焰山北边的裂缝巨石，前往霜雪高原的【冰晶神殿】。';
  if (!S.flags.d5) return '用火焰杖融化霜雪高原北边暗影之塔入口的寒冰，打败暗影魔王！';
  return '星露岛恢复了和平！继续经营农场、完成图鉴、挑战竞技场和矿洞深处（第100层以下据说有星灵出没）吧！';
}

// ============ 杂货店货架 ============
function storeStock() {
  const st = [];
  for (const id in CROPS) { const c = CROPS[id]; if (!c.seasons.includes(S.season)) continue; if (id === 'starfruit' && !S.flags.d2) continue; st.push(id + '_s'); }
  st.push('ball', 'potion', 'antidote', 'bread');
  if (S.flags.d1) st.push('greatball', 'superpotion', 'revive', 'salad');
  if (S.flags.d3) st.push('ultraball', 'maxpotion', 'energydrink');
  if (S.flags.bow) st.push('arrow');
  if (S.flags.bombs) st.push('bomb');
  return st;
}
