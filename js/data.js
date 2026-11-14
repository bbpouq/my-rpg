'use strict';
// ============ 新增图标 ============
Object.assign(ICON_TPL, {
  boomerang: ['................', '..kkkkk.........', '.kaaaaak........', '.kacccaak.......', '.kakkkcaak......', '..k...kcaak.....', '.......kcaak....', '........kcak....', '.........kak....', '.........kak....', '........kaak....', '........kkk.....'],
  feather: ['...........kk...', '..........kcak..', '.........kcaak..', '........kcaak...', '.......kcaak....', '......kcaak.....', '.....kcaak......', '....kcaak.......', '...kcaak........', '...kaak.........', '..kdk...........', '.kdk............', '.kk.............'],
  rupee: ['................', '......kkkk......', '.....kcwaak.....', '....kccaaaak....', '....kcaaaabk....', '....kcaaaabk....', '....kcaaaabk....', '....kcaaaabk....', '....kcaaaabk....', '.....kcaabk.....', '......kkkk......'],
  wallet: ['................', '................', '.....kkkkkk.....', '....kaaaaaak....', '...kaaddddaak...', '..kaaaaaaaaaak..', '..kaaaaaaaaaak..', '..kaaaaccaaaak..', '..kaaaaccaaaak..', '..kbaaaaaaaabk..', '...kbbbbbbbbk...', '....kkkkkkkk....'],
});

// ============ 物品 ============
const ITEMS = {};
function defItem(id, name, icon, color, desc, extra) { ITEMS[id] = Object.assign({ id, name, icon, color, desc: desc || '' }, extra || {}); }
defItem('sword', '勇气之剑', 'sword', '#e8e8f0', '按 J 挥剑。按住 J 蓄力，松开放出回旋斩！');
defItem('boomerang', '回旋镖', 'boomerang', '#e0a040', '扔出去会飞回来。能打晕敌人、击中远处的水晶开关、勾回道具。');
defItem('bombs', '炸弹', 'bomb', '#3a3a5a', '放下后会爆炸。能炸开有裂缝的墙壁和岩石。', { color2: '#ffb020' });
defItem('feather', '跳跃羽毛', 'feather', '#f0f0f8', '按 K 跳起来，可以越过两格宽的深坑。', { color2: '#e04848' });
defItem('bow', '勇者之弓', 'bow', '#9a6232', '射箭。可以射中远处的机关之眼。');
defItem('arrow', '箭', 'arrow', '#9a6232', '');
defItem('potion', '红药水', 'potion', '#e84a6a', '生命归零时自动使用，回满所有的心。', { color2: '#a07040' });
defItem('key', '小钥匙', 'key', '#e8c040', '能打开一扇锁住的门。');
defItem('bosskey', '头目钥匙', 'bosskey', '#e04040', '能打开头目房间的大门。');
defItem('heart', '心', 'heart', '#ff4060', '');
defItem('heartc', '心之容器', 'heart', '#ff4060', '生命上限 +1');
defItem('heartp', '心之碎片', 'heart', '#ff80a0', '集齐 4 片，生命上限 +1');
defItem('rupee', '绿宝石', 'rupee', '#3ad060', '');
defItem('rupee5', '蓝宝石', 'rupee', '#3a8ae8', '');
defItem('rupee20', '红宝石', 'rupee', '#e84a4a', '');
defItem('fruit', '光之果实', 'fruit', '#ffd84a', '守护古树的生命之源。', { color2: '#4caa3a' });
defItem('wallet', '大钱包', 'wallet', '#a87440', '能装更多的宝石。', { color2: '#e8c040' });
const EQUIP_ORDER = ['boomerang', 'bombs', 'feather', 'bow'];
const RUPEE_VAL = { rupee: 1, rupee5: 5, rupee20: 20 };
