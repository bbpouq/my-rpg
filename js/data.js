'use strict';
// ============ 属性 ============
const TYPES = ['normal', 'grass', 'fire', 'water', 'elec', 'rock', 'wind', 'ice', 'bug', 'dark', 'light'];
const TYPE_NAME = { normal: '普通', grass: '草', fire: '火', water: '水', elec: '雷', rock: '岩', wind: '风', ice: '冰', bug: '虫', dark: '暗', light: '光' };
const TYPE_COLOR = { normal: '#a8a878', grass: '#58b848', fire: '#f07030', water: '#4890f0', elec: '#e8c020', rock: '#b09048', wind: '#88a8e8', ice: '#78d8d8', bug: '#98b820', dark: '#705898', light: '#f0a0c8' };
const TYPE_CHART = {
  normal: { s: [], w: ['rock'] },
  grass: { s: ['water', 'rock'], w: ['fire', 'grass', 'wind', 'bug'] },
  fire: { s: ['grass', 'ice', 'bug'], w: ['fire', 'water', 'rock'] },
  water: { s: ['fire', 'rock'], w: ['water', 'grass'] },
  elec: { s: ['water', 'wind'], w: ['elec', 'grass', 'rock'] },
  rock: { s: ['fire', 'wind', 'ice', 'bug'], w: ['rock'] },
  wind: { s: ['grass', 'bug'], w: ['elec', 'rock'] },
  ice: { s: ['grass', 'wind'], w: ['fire', 'water', 'ice'] },
  bug: { s: ['grass', 'dark'], w: ['fire', 'wind', 'light'] },
  dark: { s: ['light'], w: ['dark'] },
  light: { s: ['dark'], w: ['fire', 'light'] },
};
function typeMult(atk, defTypes) {
  let m = 1; const c = TYPE_CHART[atk];
  for (const d of defTypes) { if (c.s.includes(d)) m *= 2; else if (c.w.includes(d)) m *= 0.5; }
  return m;
}

// ============ 招式 ============
// eff: burn/para/poison/sleep 概率(0-1)，drain，heal，self:{atk,def,spd}，foe:{atk,def,spd}
const MOVES = {
  tackle: { name: '撞击', type: 'normal', pow: 40, acc: 100 },
  scratch: { name: '抓', type: 'normal', pow: 40, acc: 100 },
  quick: { name: '电光一闪', type: 'normal', pow: 40, acc: 100, pri: 1 },
  slam: { name: '猛撞', type: 'normal', pow: 75, acc: 90 },
  hyper: { name: '破坏死光', type: 'normal', pow: 120, acc: 85 },
  growl: { name: '叫声', type: 'normal', pow: 0, acc: 100, foe: { atk: -1 } },
  harden: { name: '变硬', type: 'normal', pow: 0, acc: 100, self: { def: 1 } },
  focus: { name: '剑舞', type: 'normal', pow: 0, acc: 100, self: { atk: 2 } },
  agility: { name: '高速移动', type: 'wind', pow: 0, acc: 100, self: { spd: 2 } },
  recover: { name: '自我再生', type: 'normal', pow: 0, acc: 100, heal: 0.5 },
  vine: { name: '藤鞭', type: 'grass', pow: 45, acc: 100 },
  leech: { name: '吸取', type: 'grass', pow: 50, acc: 100, drain: 0.5 },
  leaf: { name: '飞叶快刀', type: 'grass', pow: 60, acc: 95 },
  petal: { name: '花瓣舞', type: 'grass', pow: 90, acc: 100 },
  solar: { name: '日光束', type: 'grass', pow: 115, acc: 90 },
  sleeppowder: { name: '催眠粉', type: 'grass', pow: 0, acc: 75, sleep: 1 },
  poisonpowder: { name: '毒粉', type: 'grass', pow: 0, acc: 85, poison: 1 },
  ember: { name: '火花', type: 'fire', pow: 40, acc: 100, burn: 0.1 },
  firefang: { name: '火焰牙', type: 'fire', pow: 65, acc: 95, burn: 0.1 },
  flame: { name: '喷射火焰', type: 'fire', pow: 90, acc: 100, burn: 0.1 },
  fireblast: { name: '大字爆炎', type: 'fire', pow: 115, acc: 85, burn: 0.3 },
  watergun: { name: '水枪', type: 'water', pow: 40, acc: 100 },
  bubble: { name: '泡沫光线', type: 'water', pow: 65, acc: 100, foeChance: 0.2, foe: { spd: -1 } },
  aquatail: { name: '水流尾', type: 'water', pow: 90, acc: 95 },
  hydro: { name: '水炮', type: 'water', pow: 115, acc: 80 },
  shock: { name: '电击', type: 'elec', pow: 40, acc: 100, para: 0.1 },
  spark: { name: '电光', type: 'elec', pow: 65, acc: 100, para: 0.2 },
  thunderbolt: { name: '十万伏特', type: 'elec', pow: 90, acc: 100, para: 0.1 },
  thunder: { name: '打雷', type: 'elec', pow: 115, acc: 70, para: 0.3 },
  thunderwave: { name: '电磁波', type: 'elec', pow: 0, acc: 90, para: 1 },
  rockthrow: { name: '落石', type: 'rock', pow: 50, acc: 90 },
  rockslide: { name: '岩崩', type: 'rock', pow: 75, acc: 90 },
  stoneedge: { name: '尖石攻击', type: 'rock', pow: 100, acc: 85 },
  gust: { name: '起风', type: 'wind', pow: 40, acc: 100 },
  wing: { name: '翅膀攻击', type: 'wind', pow: 60, acc: 100 },
  airslash: { name: '空气斩', type: 'wind', pow: 75, acc: 95 },
  hurricane: { name: '暴风', type: 'wind', pow: 115, acc: 70 },
  powdersnow: { name: '细雪', type: 'ice', pow: 40, acc: 100 },
  icefang: { name: '冰冻牙', type: 'ice', pow: 65, acc: 95 },
  icebeam: { name: '冰冻光束', type: 'ice', pow: 90, acc: 100 },
  blizzard: { name: '暴风雪', type: 'ice', pow: 115, acc: 70 },
  bugbite: { name: '虫咬', type: 'bug', pow: 60, acc: 100 },
  stringshot: { name: '吐丝', type: 'bug', pow: 0, acc: 95, foe: { spd: -2 } },
  xscissor: { name: '十字剪', type: 'bug', pow: 80, acc: 100 },
  bite: { name: '咬住', type: 'dark', pow: 60, acc: 100 },
  hypnosis: { name: '催眠术', type: 'dark', pow: 0, acc: 65, sleep: 1 },
  shadowball: { name: '暗影球', type: 'dark', pow: 80, acc: 100, foeChance: 0.2, foe: { def: -1 } },
  darkpulse: { name: '恶之波动', type: 'dark', pow: 95, acc: 100 },
  flash: { name: '闪光', type: 'light', pow: 0, acc: 100, foe: { atk: -1, def: -1 } },
  lightpulse: { name: '光之波动', type: 'light', pow: 60, acc: 100 },
  moonlight: { name: '月光', type: 'light', pow: 0, acc: 100, heal: 0.5 },
  dazzle: { name: '魔法闪耀', type: 'light', pow: 80, acc: 100 },
  starblast: { name: '星光炮', type: 'light', pow: 115, acc: 90 },
  poisonfang: { name: '剧毒牙', type: 'dark', pow: 55, acc: 100, poison: 0.3 },
};
for (const k in MOVES) MOVES[k].id = k;

const TYPE_LEARN = {
  normal: [[1, 'tackle'], [1, 'growl'], [7, 'quick'], [16, 'slam'], [26, 'focus'], [38, 'hyper']],
  grass: [[1, 'tackle'], [1, 'growl'], [5, 'vine'], [9, 'leech'], [13, 'sleeppowder'], [18, 'leaf'], [27, 'petal'], [37, 'recover'], [42, 'solar']],
  fire: [[1, 'scratch'], [1, 'growl'], [5, 'ember'], [11, 'quick'], [17, 'firefang'], [27, 'flame'], [35, 'focus'], [43, 'fireblast']],
  water: [[1, 'tackle'], [1, 'harden'], [5, 'watergun'], [12, 'bubble'], [19, 'bite'], [26, 'aquatail'], [34, 'recover'], [42, 'hydro']],
  elec: [[1, 'tackle'], [1, 'growl'], [5, 'shock'], [10, 'thunderwave'], [15, 'quick'], [21, 'spark'], [30, 'thunderbolt'], [42, 'thunder']],
  rock: [[1, 'tackle'], [1, 'harden'], [6, 'rockthrow'], [15, 'rockslide'], [24, 'focus'], [34, 'stoneedge']],
  wind: [[1, 'tackle'], [1, 'growl'], [5, 'gust'], [11, 'quick'], [17, 'wing'], [25, 'agility'], [31, 'airslash'], [43, 'hurricane']],
  ice: [[1, 'tackle'], [1, 'growl'], [6, 'powdersnow'], [15, 'icefang'], [24, 'harden'], [29, 'icebeam'], [42, 'blizzard']],
  bug: [[1, 'tackle'], [1, 'stringshot'], [6, 'bugbite'], [14, 'harden'], [20, 'poisonpowder'], [24, 'xscissor'], [34, 'focus']],
  dark: [[1, 'scratch'], [1, 'growl'], [6, 'bite'], [13, 'hypnosis'], [20, 'poisonfang'], [25, 'shadowball'], [37, 'darkpulse']],
  light: [[1, 'tackle'], [1, 'flash'], [7, 'lightpulse'], [16, 'moonlight'], [26, 'dazzle'], [40, 'starblast']],
};

// ============ 灵兽图鉴 ============
const SPECIES = {};
let DEX_ORDER = [];
function defMon(id, name, types, st, look, extra) {
  SPECIES[id] = Object.assign({ id, name, types, base: { hp: st[0], atk: st[1], def: st[2], spd: st[3] }, look, catch: 120, xp: 60, desc: '' }, extra || {});
  DEX_ORDER.push(id);
}
defMon('sprig', '芽芽球', ['grass'], [45, 49, 49, 45], { tpl: 'sprout', a: '#7ccf5a', d: '#2e8a2a' }, { evo: [16, 'leafy'], catch: 45, xp: 64, desc: '头顶的嫩芽晒太阳时会微微摆动。性格温和，是农夫的好帮手。' });
defMon('leafy', '叶灵兽', ['grass'], [60, 62, 63, 60], { tpl: 'bear', a: '#5ab04a', c: '#d0f4a8', d: '#2a7a2a' }, { evo: [34, 'sylvan'], catch: 45, xp: 141, desc: '背上长满树叶，能用叶片切开坚硬的木头。' });
defMon('sylvan', '森之王', ['grass', 'rock'], [82, 84, 96, 72], { tpl: 'golem', a: '#3a8a3a', c: '#a8e080', crown: true }, { catch: 45, xp: 236, desc: '传说中守护森林的古老灵兽，身体如大树一般坚固。' });
defMon('ember', '火绒狐', ['fire'], [39, 52, 43, 65], { tpl: 'pup', a: '#f08a3a', c: '#ffe4b8', d: '#c04a1a' }, { evo: [16, 'flarefox'], catch: 45, xp: 62, desc: '尾巴尖燃着小火苗，冬天抱着它非常暖和。' });
defMon('flarefox', '焰尾狐', ['fire'], [58, 66, 58, 80], { tpl: 'wolf', a: '#e8602a', c: '#ffd090', d: '#ffd040' }, { evo: [34, 'blazefox'], catch: 45, xp: 142, desc: '奔跑时会留下一道火焰的轨迹。' });
defMon('blazefox', '炎天狐', ['fire', 'light'], [78, 96, 72, 102], { tpl: 'wolf', a: '#d83a1a', c: '#ffe080', d: '#ffe060', horn: '#ffd040' }, { catch: 45, xp: 240, desc: '据说它的火焰能照亮整片夜空。' });
defMon('bubbo', '水泡鱼', ['water'], [44, 48, 65, 43], { tpl: 'fish', a: '#4a9ae8', c: '#c8e8ff', d: '#2a6ac0' }, { evo: [16, 'finny'], catch: 45, xp: 63, desc: '会吐出闪亮的泡泡，在阳光下像彩虹。' });
defMon('finny', '浪鳍鱼', ['water'], [59, 63, 80, 58], { tpl: 'fish', a: '#2a7ad8', c: '#a8d8ff', d: '#e8f4ff' }, { evo: [34, 'tidaldra'], catch: 45, xp: 142, desc: '能跃出水面数米高，鳍像刀一样锋利。' });
defMon('tidaldra', '潮汐龙', ['water', 'wind'], [80, 84, 100, 78], { tpl: 'dragon', a: '#2a6ac8', c: '#a8e0ff', d: '#60c0f0' }, { catch: 45, xp: 239, desc: '能操纵潮汐的海之龙。生气时会掀起巨浪。' });
defMon('mousy', '毛球鼠', ['normal'], [30, 56, 35, 72], { tpl: 'mouse', a: '#c8a080', d: '#f0a0b0' }, { evo: [18, 'chubby'], catch: 255, xp: 51, desc: '到处都能见到的小家伙，喜欢偷吃农田里的种子。' });
defMon('chubby', '胖胖鼠', ['normal'], [60, 81, 60, 97], { tpl: 'mouse', a: '#a87850', d: '#f0b0c0', c: '#e8d0b0' }, { catch: 127, xp: 145, desc: '吃得太多变胖了，但跑起来依然飞快。' });
defMon('chirp', '啾啾鸟', ['normal', 'wind'], [40, 45, 40, 56], { tpl: 'bird', a: '#a07850', c: '#f0e0c0', d: '#f0a030' }, { evo: [18, 'swifty'], catch: 255, xp: 50, desc: '每天早上都会在窗外歌唱，是天然的闹钟。' });
defMon('swifty', '疾风雀', ['normal', 'wind'], [63, 60, 55, 71], { tpl: 'bird', a: '#806040', c: '#f0e8d0', d: '#e08020' }, { evo: [32, 'skyhawk'], catch: 120, xp: 122, desc: '能乘着风飞行很远的距离。' });
defMon('skyhawk', '苍穹鹰', ['wind'], [83, 82, 75, 101], { tpl: 'bird', a: '#5a6a8a', c: '#f0f0ff', d: '#f0c020', crown: true }, { catch: 45, xp: 216, desc: '翱翔于云端的猛禽之王。' });
defMon('beetle', '小甲虫', ['bug'], [45, 45, 55, 30], { tpl: 'bug', a: '#6aa83a', d: '#2a5a1a' }, { evo: [20, 'ironhorn'], catch: 200, xp: 54, desc: '躲在树叶下面睡觉，背壳上有可爱的斑点。' });
defMon('ironhorn', '铁角虫', ['bug', 'rock'], [70, 98, 98, 50], { tpl: 'bug', a: '#5a6a7a', d: '#2a3a4a', horn: '#c0c0d0' }, { catch: 90, xp: 158, desc: '坚硬的角能撞碎岩石。' });
defMon('jelly', '果冻史莱姆', ['water'], [50, 40, 50, 40], { tpl: 'blob', a: '#6ac8f0' }, { evo: [25, 'kingjelly'], catch: 200, xp: 60, desc: '软软弹弹的，摸起来凉丝丝的。' });
defMon('kingjelly', '王冠史莱姆', ['water'], [95, 72, 82, 50], { tpl: 'blob', a: '#4a8af0', crown: true }, { catch: 60, xp: 168, desc: '史莱姆们的国王，头上的王冠是怎么来的没人知道。' });
defMon('zapper', '电电鼠', ['elec'], [35, 55, 40, 90], { tpl: 'mouse', a: '#f0d040', d: '#f05a3a' }, { evo: [24, 'thundra'], catch: 190, xp: 82, desc: '脸颊会储存电力，打雷的日子特别兴奋。' });
defMon('thundra', '雷鸣兽', ['elec'], [62, 92, 55, 112], { tpl: 'pup', a: '#e8c020', d: '#3a3a5a', c: '#fff0a0' }, { catch: 75, xp: 172, desc: '奔跑速度如同闪电，吼声像雷鸣。' });
defMon('pebble', '小石头', ['rock'], [40, 80, 100, 20], { tpl: 'golem', a: '#9a9488' }, { evo: [28, 'boulderon'], catch: 255, xp: 60, desc: '经常被误认为普通的石头而被踢开。' });
defMon('boulderon', '岩石巨人', ['rock'], [82, 112, 132, 45], { tpl: 'golem', a: '#7a7064', c: '#b8b0a0', d: '#4a4038' }, { catch: 60, xp: 177, desc: '身体重达一吨，走路会让地面震动。' });
defMon('shroom', '蘑菇宝', ['grass', 'dark'], [60, 55, 50, 30], { tpl: 'mushroom', d: '#d84a4a', c: '#f0e0c8', a: '#c0a080' }, { evo: [22, 'toadking'], catch: 190, xp: 68, desc: '喜欢阴暗潮湿的地方，头顶的伞盖会散发孢子。' });
defMon('toadking', '毒菇王', ['grass', 'dark'], [85, 88, 78, 45], { tpl: 'mushroom', d: '#8a3ab0', c: '#e0d0f0', a: '#b090c0', crown: true }, { catch: 75, xp: 165, desc: '统治森林深处蘑菇王国的君主。' });
defMon('wisp', '小幽灵', ['dark'], [30, 38, 30, 80], { tpl: 'ghost', a: '#8a7ab8' }, { evo: [30, 'nightmare'], catch: 190, xp: 62, desc: '夜里会在墓地附近飘来飘去，其实很怕寂寞。' });
defMon('nightmare', '夜魇', ['dark'], [62, 70, 62, 112], { tpl: 'ghost', a: '#4a3a6a', r: '#f04a8a' }, { catch: 45, xp: 190, desc: '据说会钻进人的梦里，带来噩梦。' });
defMon('glowbug', '萤火虫', ['bug', 'light'], [40, 32, 40, 70], { tpl: 'bug', a: '#f0e060', d: '#806020' }, { evo: [22, 'starmoth'], catch: 190, xp: 60, desc: '夏夜的森林里，它们的光芒像星星一样。' });
defMon('starmoth', '星光蛾', ['bug', 'light'], [70, 55, 65, 98], { tpl: 'spirit', a: '#f0d880', c: '#fff8e0', d: '#c0a0f0' }, { catch: 75, xp: 166, desc: '翅膀上的鳞粉在月光下闪闪发光。' });
defMon('starfish', '海星星', ['water'], [30, 45, 55, 85], { tpl: 'star', a: '#f0a050' }, { evo: [26, 'coralstar'], catch: 225, xp: 68, desc: '被冲上沙滩时会自己滚回海里。' });
defMon('coralstar', '珊瑚星', ['water', 'light'], [62, 78, 85, 115], { tpl: 'star', a: '#c060c0' }, { catch: 60, xp: 182, desc: '核心像宝石一样发光，能与星星对话。' });
defMon('crabby', '钳钳蟹', ['water'], [30, 105, 90, 50], { tpl: 'crab', a: '#e85a3a', d: '#c0402a' }, { evo: [28, 'kingcrab'], catch: 225, xp: 65, desc: '大钳子力气惊人，能夹碎贝壳。' });
defMon('kingcrab', '巨钳蟹', ['water', 'rock'], [58, 130, 115, 75], { tpl: 'crab', a: '#b02a2a', d: '#801a1a' }, { catch: 60, xp: 166, desc: '一只钳子比身体还大，用来威吓敌人。' });
defMon('salamand', '小火蜥', ['fire'], [45, 60, 40, 70], { tpl: 'lizard', a: '#e86a3a', c: '#ffd0a0', d: '#ffd040' }, { evo: [30, 'magmaliz'], catch: 190, xp: 65, desc: '尾巴上的火焰熄灭时就会生病。' });
defMon('magmaliz', '熔岩蜥', ['fire', 'rock'], [78, 98, 82, 85], { tpl: 'lizard', a: '#a03a2a', c: '#ff9a40', d: '#ff6020' }, { catch: 60, xp: 175, desc: '住在火山口附近，皮肤像熔岩一样炽热。' });
defMon('snowball', '雪团子', ['ice'], [50, 45, 55, 40], { tpl: 'blob', a: '#e0eefa', c: '#ffffff', b: '#a8c8e8' }, { evo: [30, 'icebear'], catch: 190, xp: 60, desc: '和雪人长得一模一样，常被孩子们带回家。' });
defMon('icebear', '冰晶熊', ['ice'], [92, 102, 88, 60], { tpl: 'bear', a: '#c8e4f8', c: '#ffffff', d: '#6aa8d8' }, { catch: 60, xp: 180, desc: '在暴风雪中也能安然入睡。' });
defMon('frostwolf', '霜狼', ['ice', 'dark'], [72, 92, 66, 96], { tpl: 'wolf', a: '#a8c0d8', c: '#ffffff', d: '#4a6a8a' }, { catch: 75, xp: 170, desc: '成群结队在雪原狩猎，嚎叫声能冻结空气。' });
defMon('bat', '夜蝠', ['dark', 'wind'], [40, 45, 35, 55], { tpl: 'bat', a: '#6a4a8a' }, { evo: [22, 'vampbat'], catch: 255, xp: 49, desc: '白天倒挂在洞穴里睡觉。' });
defMon('vampbat', '吸血蝠', ['dark', 'wind'], [75, 80, 70, 92], { tpl: 'bat', a: '#4a2a5a', r: '#f03a3a' }, { catch: 90, xp: 159, desc: '牙齿锋利，会悄悄吸取对手的体力。' });
defMon('turtle', '岩龟', ['water', 'rock'], [50, 50, 90, 30], { tpl: 'turtle', a: '#7ac860', d: '#6a8a4a', b: '#3a6a2a' }, { evo: [30, 'fortoise'], catch: 190, xp: 66, desc: '行动缓慢，但壳硬得连锤子都敲不碎。' });
defMon('fortoise', '堡垒龟', ['water', 'rock'], [88, 82, 125, 40], { tpl: 'turtle', a: '#5aa848', d: '#7a6a5a', b: '#3a5a2a' }, { catch: 75, xp: 173, desc: '背着一座小山一样的壳，是天然的堡垒。' });
defMon('drake', '幼龙', ['wind'], [41, 64, 45, 50], { tpl: 'dragon', a: '#6ab0a0', c: '#d0f0e0', d: '#3a8070' }, { evo: [30, 'skydrake'], catch: 45, xp: 60, desc: '极其稀有的龙的幼崽，只在高山上出没。' });
defMon('skydrake', '飞龙', ['wind'], [61, 84, 65, 70], { tpl: 'dragon', a: '#4a90a0', c: '#c0e8f0', d: '#2a6070' }, { evo: [50, 'heavendr'], catch: 45, xp: 147, desc: '能够自由翱翔于天际。' });
defMon('heavendr', '天龙', ['wind', 'light'], [91, 134, 95, 80], { tpl: 'dragon', a: '#e0c060', c: '#fff4c0', d: '#ffffff', crown: true }, { catch: 45, xp: 270, desc: '传说中守护天空的神龙，据说能绕世界一周只需一天。' });
defMon('sprite', '光之精灵', ['light'], [50, 42, 50, 80], { tpl: 'spirit', a: '#ffe8f0', c: '#ffffff', d: '#ffa0c0' }, { evo: [30, 'seraph'], catch: 75, xp: 70, desc: '只在清澈的月光下才会现身的精灵。' });
defMon('seraph', '光辉天使', ['light'], [85, 82, 85, 110], { tpl: 'spirit', a: '#fff0c0', c: '#ffffff', d: '#ffd040', crown: true }, { catch: 45, xp: 190, desc: '全身散发着温暖的光芒，能治愈人心。' });
defMon('gforest', '森灵·苍叶', ['grass', 'light'], [100, 100, 100, 100], { tpl: 'pup', a: '#4ac060', c: '#d0ffd0', d: '#ffd040', crown: true }, { catch: 3, xp: 290, legend: true, desc: '森林水晶的守护灵。被暗影封印了千年。' });
defMon('gsea', '海灵·澜心', ['water', 'light'], [100, 100, 100, 100], { tpl: 'fish', a: '#3a8ae0', c: '#e0f8ff', d: '#ffd040' }, { catch: 3, xp: 290, legend: true, desc: '潮汐水晶的守护灵。能听见所有河流的声音。' });
defMon('gfire', '炎灵·赤羽', ['fire', 'light'], [100, 100, 100, 100], { tpl: 'bird', a: '#f05a2a', c: '#ffe0a0', d: '#ffd040', crown: true }, { catch: 3, xp: 290, legend: true, desc: '火焰水晶的守护灵。羽毛永不熄灭。' });
defMon('gice', '冰灵·霜华', ['ice', 'light'], [100, 100, 100, 100], { tpl: 'wolf', a: '#a0e0ff', c: '#ffffff', d: '#4a8ad0' }, { catch: 3, xp: 290, legend: true, desc: '冰晶水晶的守护灵。呼吸能让湖面冻结。' });
defMon('gstar', '星灵·辰曦', ['light', 'dark'], [120, 120, 110, 110], { tpl: 'spirit', a: '#c0a0ff', c: '#fff8ff', d: '#6a4ad0', crown: true }, { catch: 25, xp: 340, legend: true, desc: '诞生于星辰与暗影之间的灵兽。只有真正的勇者才能遇见它。' });

function learnset(spId) {
  const sp = SPECIES[spId];
  if (sp._learn) return sp._learn;
  const list = [];
  const prim = TYPE_LEARN[sp.types[0]];
  for (const e of prim) list.push(e.slice());
  if (sp.types[1]) {
    for (const e of TYPE_LEARN[sp.types[1]]) { if (e[0] > 1 && MOVES[e[1]].pow > 0) list.push([e[0] + 4, e[1]]); }
  }
  if (sp.legend) list.push([1, 'recover']);
  list.sort((a, b) => a[0] - b[0]);
  const seen = {}; const out = [];
  for (const e of list) { if (!seen[e[1]]) { seen[e[1]] = 1; out.push(e); } }
  sp._learn = out;
  return out;
}
function movesAt(spId, lv) {
  const ls = learnset(spId).filter(e => e[0] <= lv).map(e => e[1]);
  // 优先保留攻击招式
  const atk = ls.filter(m => MOVES[m].pow > 0), st = ls.filter(m => MOVES[m].pow === 0);
  const picked = atk.slice(-3).concat(st.slice(-1));
  while (picked.length < 4 && ls.length > picked.length) { const m = ls.find(x => !picked.includes(x)); if (!m) break; picked.push(m); }
  return picked.slice(0, 4);
}
function xpFor(lv) { return lv <= 1 ? 0 : Math.floor(Math.pow(lv, 3) * 0.8); }
let MON_UID = Date.now() % 100000;
function makeMon(spId, lv) {
  const m = { sp: spId, lv, xp: xpFor(lv), moves: movesAt(spId, lv), status: null, iv: [randi(0, 15), randi(0, 15), randi(0, 15), randi(0, 15)], uid: ++MON_UID };
  calcStats(m); m.hp = m.maxhp;
  return m;
}
function calcStats(m) {
  const b = SPECIES[m.sp].base, L = m.lv, iv = m.iv || [8, 8, 8, 8];
  const oldMax = m.maxhp;
  m.maxhp = Math.floor((b.hp * 2 + iv[0]) * L / 100) + L + 10;
  m.atk = Math.floor((b.atk * 2 + iv[1]) * L / 100) + 5;
  m.def = Math.floor((b.def * 2 + iv[2]) * L / 100) + 5;
  m.spd = Math.floor((b.spd * 2 + iv[3]) * L / 100) + 5;
  if (oldMax != null && m.hp != null && m.hp > 0) m.hp = Math.min(m.maxhp, m.hp + (m.maxhp - oldMax));
  return m;
}
function monName(m) { return m.nick || SPECIES[m.sp].name; }

// ============ 物品 ============
const ITEMS = {};
function defItem(id, name, type, icon, color, sell, extra) { ITEMS[id] = Object.assign({ id, name, type, icon, color, sell: sell || 0, price: 0, desc: '' }, extra || {}); }
// 工具
defItem('hoe', '锄头', 'tool', 'hoe', '#a0a0b0', 0, { desc: '面向农田使用(K)可以开垦土地。' });
defItem('can', '水壶', 'tool', 'can', '#5a9ad8', 0, { desc: '浇灌作物。对着水面使用可以装满水。' });
defItem('pick', '镐子', 'tool', 'pick', '#a0a0b0', 0, { desc: '敲碎石头和矿石。' });
defItem('axe', '斧头', 'tool', 'axe', '#a0a0b0', 0, { desc: '砍伐树桩，获得木材。' });
defItem('rod', '鱼竿', 'tool', 'rod', '#c08850', 0, { desc: '对着水面使用开始钓鱼。' });
defItem('bow', '勇者之弓', 'tool', 'bow', '#9a6232', 0, { desc: '射出箭矢。可以射中远处的机关之眼。消耗箭。' });
defItem('firerod', '火焰杖', 'tool', 'firerod', '#ff5a20', 0, { desc: '发射火球，可以融化冰块、点燃火盆。' });
defItem('arrow', '箭', 'ammo', 'arrow', '#9a6232', 1, { price: 5, desc: '弓的弹药。' });
defItem('bomb', '炸弹', 'tool', 'bomb', '#3a3a5a', 10, { price: 40, desc: '放置后会爆炸，可以炸开有裂缝的岩石和墙壁。' });
// 灵兽道具
defItem('potion', '回复药', 'potion', 'potion', '#e84a6a', 40, { price: 150, heal: 30, desc: '恢复灵兽30点体力。' });
defItem('superpotion', '好伤药', 'potion', 'potion', '#f08a2a', 120, { price: 400, heal: 90, desc: '恢复灵兽90点体力。' });
defItem('maxpotion', '全满药', 'potion', 'potion', '#8a4ae8', 300, { price: 1000, heal: 9999, desc: '完全恢复灵兽的体力。' });
defItem('antidote', '万能药', 'potion', 'potion', '#4ac0a0', 60, { price: 200, cure: true, desc: '治愈灵兽所有的异常状态。' });
defItem('revive', '复活草', 'potion', 'leafy', '#f0d040', 250, { price: 800, revive: 0.5, color2: '#3a9a3a', desc: '让昏厥的灵兽恢复一半体力。' });
defItem('ball', '灵球', 'ball', 'ball', '#e84040', 50, { price: 200, rate: 1, desc: '投向野生灵兽来收服它。' });
defItem('greatball', '超级灵球', 'ball', 'ball', '#3a6ae8', 150, { price: 600, rate: 1.5, desc: '比灵球更容易收服灵兽。' });
defItem('ultraball', '高级灵球', 'ball', 'ball', '#2a2a3a', 300, { price: 1200, rate: 2.2, desc: '性能非常优秀的灵球。' });
defItem('masterball', '大师球', 'ball', 'ball', '#a040d0', 0, { rate: 255, desc: '必定能收服任何灵兽的传说之球。' });
// 食物
defItem('bread', '面包', 'food', 'food', '#d8a050', 30, { price: 80, energy: 40, hp: 2, color2: '#f0d090', desc: '恢复40体力和1颗心。' });
defItem('salad', '田园沙拉', 'food', 'food', '#7ad05a', 80, { price: 220, energy: 80, hp: 4, color2: '#e84a4a', desc: '恢复80体力和2颗心。' });
defItem('energydrink', '能量饮料', 'food', 'potion', '#f0e040', 80, { price: 350, energy: 150, hp: 0, desc: '恢复150体力。' });
defItem('elixir', '仙露', 'food', 'potion', '#ff70d0', 200, { price: 900, energy: 999, hp: 99, desc: '完全恢复体力与生命。' });
// 材料
defItem('wood', '木材', 'mat', 'wood', '#a87440', 2, { price: 10, desc: '用途广泛的建材。' });
defItem('stone', '石头', 'mat', 'ore', '#9a9a9a', 2, { price: 10, desc: '普通的石头。' });
defItem('copper', '铜矿', 'mat', 'ore', '#e08a4a', 15, { price: 75, desc: '可以用来升级工具。' });
defItem('iron', '铁矿', 'mat', 'ore', '#d8d8e8', 30, { price: 150, desc: '坚固的金属矿石。' });
defItem('gold', '金矿', 'mat', 'ore', '#ffd84a', 60, { price: 300, desc: '闪闪发光的贵金属。' });
defItem('mythril', '秘银矿', 'mat', 'ore', '#6af0f0', 150, { desc: '传说中的金属，只在矿洞深处出现。' });
defItem('gel', '史莱姆凝胶', 'mat', 'gel', '#7ad05a', 8, { desc: '黏糊糊的。可以用来制作药品。' });
defItem('wingm', '蝙蝠翅膀', 'mat', 'wing', '#6a4a8a', 15, { desc: '薄薄的翅膀。' });
defItem('bone', '骨头', 'mat', 'bone', '#f0f0e0', 20, { desc: '不知道是什么生物的骨头。' });
defItem('quartz', '石英', 'gem', 'gem', '#f0f0ff', 40, { desc: '透明的结晶。' });
defItem('amethyst', '紫水晶', 'gem', 'gem', '#b060e0', 100, { desc: '美丽的紫色宝石。' });
defItem('topaz', '黄玉', 'gem', 'gem', '#f0b030', 80, { desc: '温暖的黄色宝石。' });
defItem('emerald', '翡翠', 'gem', 'gem', '#30d070', 250, { desc: '鲜绿色的珍贵宝石。' });
defItem('ruby', '红宝石', 'gem', 'gem', '#f03040', 250, { desc: '火红色的珍贵宝石。' });
defItem('diamond', '钻石', 'gem', 'gem', '#c0f8ff', 750, { desc: '最坚硬也最闪耀的宝石。' });
defItem('starshard', '星之碎片', 'gem', 'star', '#ffe060', 500, { desc: '从天上落下的星星碎片，蕴含着神秘的力量。' });
// 采集品
defItem('dandelion', '蒲公英', 'forage', 'flower', '#f8e040', 25, { edible: 20, desc: '春天的野花。' });
defItem('wildberry', '野莓', 'forage', 'berry', '#e8506a', 15, { edible: 25, desc: '酸酸甜甜的野果。' });
defItem('mushroom', '野蘑菇', 'forage', 'mush', '#c86a4a', 40, { edible: 30, desc: '森林里采到的蘑菇。' });
defItem('shell', '贝壳', 'forage', 'shell', '#f0c0a0', 30, { desc: '海滩上捡到的漂亮贝壳。' });
defItem('coral', '珊瑚', 'forage', 'shell', '#f06080', 80, { desc: '色彩鲜艳的珊瑚。' });
defItem('herb', '草药', 'forage', 'leafy', '#5ab04a', 20, { edible: 15, desc: '可以入药的野草。' });
defItem('snowyam', '雪山药', 'forage', 'long', '#e0d8f0', 100, { edible: 50, desc: '在雪地里挖到的山药。' });
defItem('fireflower', '火焰花', 'forage', 'flower', '#ff6020', 120, { desc: '只在火山附近盛开的花。' });
defItem('crystalfruit', '水晶果', 'forage', 'fruit', '#a0e8ff', 150, { edible: 60, desc: '冰雪中生长的透明果实。' });
// 制造品
defItem('sprinkler', '洒水器', 'craft', 'sprinkler', '#a0a0b0', 50, { range: 1, desc: '放在农田里，每天早上自动浇灌上下左右4格。' });
defItem('qsprinkler', '高级洒水器', 'craft', 'sprinkler', '#ffd84a', 150, { range: 2, desc: '每天早上自动浇灌周围8格。' });
defItem('isprinkler', '铱金洒水器', 'craft', 'sprinkler', '#b060e0', 400, { range: 3, desc: '每天早上自动浇灌周围24格。' });
// 关键道具
defItem('letter', '爷爷的信', 'key', 'letter', '#ffffff', 0, { desc: '爷爷留下的信。' });
defItem('key', '小钥匙', 'key', 'key', '#e8c040', 0, { desc: '地下城里的钥匙，可以打开一扇锁住的门。' });
defItem('bosskey', '头目钥匙', 'key', 'bosskey', '#e04040', 0, { desc: '可以打开地下城头目房间的大门。' });

// ============ 作物 ============
const CROPS = {};
function defCrop(id, name, seasons, days, regrow, seedPrice, sell, color, icon, yieldN) {
  CROPS[id] = { id, name, seasons, days, regrow, seedPrice, sell, color, icon, yieldN: yieldN || 1 };
  defItem(id, name, 'crop', icon, color, sell, { edible: Math.round(sell * 0.4) + 10, desc: name + '。' + '可以出售或食用。' });
  defItem(id + '_s', name + '种子', 'seed', 'seed', color, Math.floor(seedPrice / 2), { price: seedPrice, crop: id, color2: color, desc: `种植${seasonNames(seasons)}季作物。${days}天成熟${regrow ? '，之后每' + regrow + '天可再收获' : ''}。` });
}
const SEASONS = ['春', '夏', '秋', '冬'];
function seasonNames(arr) { return arr.map(s => SEASONS[s]).join('/'); }
defCrop('parsnip', '防风草', [0], 4, 0, 20, 35, '#f0e0a0', 'long');
defCrop('potato', '土豆', [0], 6, 0, 50, 80, '#c8a060', 'fruit');
defCrop('cauli', '花椰菜', [0], 12, 0, 80, 175, '#f4f0d8', 'leafy');
defCrop('strawberry', '草莓', [0], 8, 4, 100, 120, '#e83a4a', 'berry');
defCrop('tomato', '番茄', [1], 11, 4, 50, 60, '#e84a3a', 'fruit');
defCrop('blueberry', '蓝莓', [1], 13, 4, 80, 50, '#4a6ae8', 'berry', 3);
defCrop('melon', '甜瓜', [1], 12, 0, 80, 250, '#9ad86a', 'fruit');
defCrop('corn', '玉米', [1, 2], 14, 4, 150, 50, '#f0d040', 'long');
defCrop('starfruit', '星之果', [1], 13, 0, 400, 750, '#ffe040', 'star');
defCrop('pumpkin', '南瓜', [2], 13, 0, 100, 320, '#f08a2a', 'fruit');
defCrop('eggplant', '茄子', [2], 5, 5, 20, 60, '#7a3ab0', 'long');
defCrop('cranberry', '蔓越莓', [2], 7, 5, 240, 75, '#c02a4a', 'berry', 2);
defCrop('yam', '山芋', [2], 10, 0, 60, 160, '#c87a5a', 'long');
defCrop('winterroot', '冬根', [3], 7, 0, 60, 120, '#a07ac0', 'long');
defCrop('snowberry', '雪晶莓', [3], 10, 4, 120, 90, '#a0e0ff', 'berry');

// ============ 鱼 ============
const FISH = {};
function defFish(id, name, zones, sell, diff, color, extra) {
  FISH[id] = Object.assign({ id, name, zones, diff, sell }, extra || {});
  defItem(id, name, 'fish', 'fish', color, sell, { edible: Math.round(sell * 0.3) + 10, desc: `难度 ${diff}。` });
}
defFish('carp', '鲫鱼', ['pond', 'river'], 30, 15, '#a0a070');
defFish('bass', '鲈鱼', ['river', 'lake', 'pond'], 60, 35, '#6a8a5a');
defFish('catfish', '鲶鱼', ['river', 'pond'], 150, 65, '#7a6a5a', { rain: true });
defFish('trout', '虹鳟', ['river'], 70, 40, '#e08a9a');
defFish('salmon', '三文鱼', ['river'], 85, 45, '#f08060', { seasons: [2] });
defFish('sardine', '沙丁鱼', ['sea'], 40, 20, '#9ab0c8');
defFish('tuna', '金枪鱼', ['sea'], 120, 60, '#3a5a8a');
defFish('puffer', '河豚', ['sea'], 200, 70, '#e8d070', { seasons: [1] });
defFish('octopus', '章鱼', ['sea'], 160, 80, '#d06a8a');
defFish('goldfish', '金鳞鱼', ['lake'], 220, 60, '#ffb020');
defFish('icefish', '冰鱼', ['snow'], 140, 55, '#b0e8ff');
defFish('lavaeel', '熔岩鳗', ['lava'], 400, 85, '#ff5020');
defFish('legend', '传说之鱼', ['sea', 'snow'], 1500, 95, '#ff40a0', { rare: 0.03 });

// ============ 制造配方 ============
const RECIPES = [
  { id: 'sprinkler', n: 1, need: { copper: 2, iron: 1 } },
  { id: 'qsprinkler', n: 1, need: { iron: 2, gold: 1 }, req: 'd2' },
  { id: 'isprinkler', n: 1, need: { gold: 2, mythril: 1 }, req: 'd4' },
  { id: 'arrow', n: 10, need: { wood: 3, stone: 2 }, req: 'bow' },
  { id: 'bomb', n: 3, need: { stone: 5, copper: 1 }, req: 'bombs' },
  { id: 'potion', n: 1, need: { gel: 1, herb: 1 } },
  { id: 'superpotion', n: 1, need: { gel: 2, wildberry: 2, herb: 1 }, req: 'd1' },
  { id: 'ball', n: 2, need: { stone: 3, copper: 1 } },
  { id: 'greatball', n: 2, need: { iron: 1, quartz: 1 }, req: 'd1' },
  { id: 'ultraball', n: 2, need: { gold: 1, topaz: 1 }, req: 'd3' },
  { id: 'salad', n: 1, need: { herb: 1, dandelion: 1, wildberry: 1 } },
  { id: 'elixir', n: 1, need: { starshard: 1, crystalfruit: 1 } },
];

// ============ 铁匠升级 ============
const TOOL_LV_NAME = ['普通', '铜', '铁', '金', '秘银'];
const UPGRADE_COST = [null, { ore: 'copper', n: 5, money: 500 }, { ore: 'iron', n: 5, money: 1500 }, { ore: 'gold', n: 5, money: 4000 }, { ore: 'mythril', n: 5, money: 10000 }];
const SWORD_NAME = ['木剑', '铜剑', '铁剑', '金剑', '秘银剑', '星辉圣剑'];
