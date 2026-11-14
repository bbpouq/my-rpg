'use strict';
Object.assign(ICON_TPL, {
  needle: ['..............kk', '.............kwk', '............kwck', '...........kwck.', '..........kwck..', '.........kwck...', '........kwck....', '.......kwck.....', '......kwck......', '.....kwck.......', '....kwck........', '...kcck.........', '..kc.ck.........', '..kcck..........', '..kkk...........'],
  cap: ['................', '....k.kkkk.k....', '...kkaaaaaakk...', '..kaaccccaaaak..', '.kkacaaaaaaaakk.', '..kacaaaaaaaak..', '.kkaaaaaaaaaakk.', '..kaaaaaaaaabk..', '.kkaaaaaaaabbkk.', '..kbaaaaaabbk...', '...kkbbbbbbkk...', '....k.kkkk.k....'],
  popcorn: ['................', '.....kkk.kkk....', '....kwwwkwwwk...', '...kwwdwwwwdwk..', '..kwwwwwkwwwwk..', '..kwdwwwwwwdwk..', '...kwwwwdwwwk...', '..kwwwkwwwwwwk..', '..kwdwwwwkwwdk..', '...kwwwwwwwwk...', '....kkkwwkkk....', '.......kk.......'],
  spring: ['................', '...kkkkkkkkk....', '...kaaaaaaak....', '....kkkkkkk.....', '...kaaaaaaak....', '....kkkkkkk.....', '...kaaaaaaak....', '....kkkkkkk.....', '...kaaaaaaak....', '....kkkkkkk.....', '...kdddddddk....', '...kkkkkkkkk....'],
  sling: ['................', '..kk.......kk...', '.kaak.....kaak..', '.kaak.....kaak..', '..kaak...kaak...', '..kdddddddddk...', '...kaak.kaak....', '....kaakaak.....', '.....kaaak......', '......kak.......', '......kak.......', '......kak.......', '......kkk.......'],
  bean: ['................', '................', '................', '......kkkk......', '.....kaacak.....', '....kaacaaak....', '....kaaaaaak....', '....kaaaaabk....', '.....kabbbk.....', '......kkkk......'],
  honey: ['................', '.......kk.......', '......kaak......', '.....kacak......', '.....kaaak......', '....kacaaak.....', '...kaacaaaak....', '...kaaaaaaak....', '...kaaaaaabk....', '....kaaaabk.....', '.....kkkkk......'],
  button: ['................', '.....kkkkkk.....', '....kaaccaak....', '...kacaaaaaak...', '...kcakkakkak...', '...kaakkakkbk...', '...kaaaaaaabk...', '...kaakkakkbk...', '...kaakkakkbk...', '....kaaaaabk....', '.....kkkkkk.....'],
});

// ============ 新增图标 ============
Object.assign(ICON_TPL, {
  boomerang: ['................', '..kkkkk.........', '.kaaaaak........', '.kacccaak.......', '.kakkkcaak......', '..k...kcaak.....', '.......kcaak....', '........kcak....', '.........kak....', '.........kak....', '........kaak....', '........kkk.....'],
  feather: ['...........kk...', '..........kcak..', '.........kcaak..', '........kcaak...', '.......kcaak....', '......kcaak.....', '.....kcaak......', '....kcaak.......', '...kcaak........', '...kaak.........', '..kdk...........', '.kdk............', '.kk.............'],
  rupee: ['................', '......kkkk......', '.....kcwaak.....', '....kccaaaak....', '....kcaaaabk....', '....kcaaaabk....', '....kcaaaabk....', '....kcaaaabk....', '....kcaaaabk....', '.....kcaabk.....', '......kkkk......'],
  wallet: ['................', '................', '.....kkkkkk.....', '....kaaaaaak....', '...kaaddddaak...', '..kaaaaaaaaaak..', '..kaaaaaaaaaak..', '..kaaaaccaaaak..', '..kaaaaccaaaak..', '..kbaaaaaaaabk..', '...kbbbbbbbbk...', '....kkkkkkkk....'],
});

// ============ 物品（全是大人家里的小东西） ============
const ITEMS = {};
function defItem(id, name, icon, color, desc, extra) { ITEMS[id] = Object.assign({ id, name, icon, color, desc: desc || '' }, extra || {}); }
defItem('sword', '缝衣针', 'needle', '#c8d0e0', '奶奶的缝衣针，对豆丁来说就是一把长剑。按 J 刺，按住 J 再松开是回旋斩！');
defItem('boomerang', '瓶盖', 'cap', '#e04848', '汽水瓶盖。扔出去会转一圈飞回来，能打晕虫子、按到远处的按钮、勾回纽扣。');
defItem('bombs', '爆米花炸弹', 'popcorn', '#fff8e8', '放下后"嘭"地炸开！能炸开饼干墙和卡住的东西。', { color2: '#f0c040' });
defItem('feather', '弹簧鞋', 'spring', '#c8ccd8', '圆珠笔里拆下来的弹簧。按 K 弹起来，可以跳过两格宽的缝。', { color2: '#e04848' });
defItem('bow', '橡皮筋弹弓', 'sling', '#9a6232', '用橡皮筋做的弹弓，发射豆子。能打中远处画着的眼睛机关。', { color2: '#e04848' });
defItem('arrow', '豆子', 'bean', '#7ac850', '弹弓的子弹。');
defItem('potion', '蜂蜜滴', 'honey', '#f0b030', '生命归零时自动吃下，回满所有的心。');
defItem('key', '小钥匙', 'key', '#e8c040', '能打开一扇锁住的门。');
defItem('bosskey', '大钥匙', 'bosskey', '#e04040', '能打开头目房间的大门。');
defItem('heart', '心', 'heart', '#ff4060', '');
defItem('heartc', '心之容器', 'heart', '#ff4060', '生命上限 +1');
defItem('heartp', '心之碎片', 'heart', '#ff80a0', '集齐 4 片，生命上限 +1');
defItem('rupee', '绿纽扣', 'button', '#3ac060', '');
defItem('rupee5', '蓝纽扣', 'button', '#3a8ae8', '');
defItem('rupee20', '红纽扣', 'button', '#e84a4a', '');
defItem('fruit', '星星糖', 'star', '#ffd84a', '豆丁村的灯笼就靠它发光。');
defItem('wallet', '大火柴盒', 'wallet', '#a87440', '能装更多的纽扣。', { color2: '#e8c040' });
const EQUIP_ORDER = ['boomerang', 'bombs', 'feather', 'bow'];
const RUPEE_VAL = { rupee: 1, rupee5: 5, rupee20: 20 };
