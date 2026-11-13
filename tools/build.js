// 把 index.html 和所有 js 打包成一个独立的 HTML 文件（方便拷贝到其他设备）
// 用法：node tools/build.js
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
let html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
html = html.replace(/<script src="([^"]+)"><\/script>/g, (_, src) => {
  const code = fs.readFileSync(path.join(root, src), 'utf8');
  return '<script>\n/* ' + src + ' */\n' + code.replace(/<\/script>/g, '<\\/script>') + '\n</script>';
});
fs.mkdirSync(path.join(root, 'dist'), { recursive: true });
const out = path.join(root, 'dist', 'star-isle-tales.html');
fs.writeFileSync(out, html);
console.log('已生成', out, (fs.statSync(out).size / 1024).toFixed(0) + ' KB');
