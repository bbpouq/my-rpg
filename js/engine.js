'use strict';
// ============ 基础常量与工具 ============
const TS = 16, VW = 320, VH = 180;
const FONT = '"PingFang SC","Hiragino Sans GB","Microsoft YaHei","Noto Sans CJK SC","Noto Sans SC","Source Han Sans SC","WenQuanYi Micro Hei",sans-serif';

function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
function lerp(a, b, t) { return a + (b - a) * t; }
function rand(a, b) { return a + Math.random() * (b - a); }
function randi(a, b) { return Math.floor(a + Math.random() * (b - a + 1)); }
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function chance(p) { return Math.random() < p; }
function hash2(x, y, s) {
  let h = (Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263) + Math.imul((s || 0) | 0, 1442695041)) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}
function mulberry32(a) {
  return function () {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
function rpick(R, arr) { return arr[Math.floor(R() * arr.length)]; }
function rint(R, a, b) { return Math.floor(a + R() * (b - a + 1)); }
function shuffle(arr, R) { R = R || Math.random; for (let i = arr.length - 1; i > 0; i--) { const j = Math.floor(R() * (i + 1)); [arr[i], arr[j]] = [arr[j], arr[i]]; } return arr; }
function rectsOverlap(a, b) { return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y; }
const DIRS = [[0, 1], [0, -1], [-1, 0], [1, 0]]; // 下 上 左 右
const DIR_NAMES = ['down', 'up', 'left', 'right'];
function deepCopy(o) { return JSON.parse(JSON.stringify(o)); }

// ============ 计时器（随游戏循环推进） ============
const Timers = {
  list: [],
  update(dt) {
    for (let i = this.list.length - 1; i >= 0; i--) {
      const t = this.list[i];
      t.t -= dt;
      if (t.t <= 0) { this.list.splice(i, 1); t.fn(); }
    }
  }
};
function wait(sec) { return new Promise(res => Timers.list.push({ t: sec, fn: res })); }

// ============ 输入 ============
const Input = {
  held: {}, pressed: {}, rep: {}, rt: {}, any: false,
  keymap: {
    ArrowUp: 'up', KeyW: 'up', ArrowDown: 'down', KeyS: 'down', ArrowLeft: 'left', KeyA: 'left', ArrowRight: 'right', KeyD: 'right',
    KeyJ: 'a', Space: 'a', KeyZ: 'a', Enter: 'a', NumpadEnter: 'a',
    KeyK: 'b', KeyX: 'b', Backspace: 'b',
    KeyI: 'menu', Tab: 'menu', Escape: 'menu',
    KeyQ: 'prev', KeyE: 'next', KeyM: 'mute', KeyF: 'full',
    Digit1: 's0', Digit2: 's1', Digit3: 's2', Digit4: 's3', Digit5: 's4', Digit6: 's5', Digit7: 's6', Digit8: 's7', Digit9: 's8', Digit0: 's9',
  },
  init() {
    window.addEventListener('keydown', e => {
      const act = this.keymap[e.code];
      Sfx.init();
      if (act) {
        e.preventDefault();
        if (!this.held[act]) { this.pressed[act] = true; this.rep[act] = true; this.rt[act] = 0.32; }
        this.held[act] = true;
        this.any = true;
      }
    });
    window.addEventListener('keyup', e => {
      const act = this.keymap[e.code];
      if (act) { this.held[act] = false; e.preventDefault(); }
    });
    window.addEventListener('blur', () => { this.held = {}; });
  },
  press(act) { if (!this.held[act]) { this.pressed[act] = true; this.rep[act] = true; this.rt[act] = 0.32; } this.held[act] = true; this.any = true; Sfx.init(); },
  release(act) { this.held[act] = false; },
  update(dt) {
    for (const k in this.held) {
      if (this.held[k]) {
        this.rt[k] -= dt;
        if (this.rt[k] <= 0) { this.rep[k] = true; this.rt[k] = 0.075; }
      }
    }
  },
  endFrame() { this.pressed = {}; this.rep = {}; this.any = false; },
  // 菜单导航：首次按下立即触发，长按自动重复
  nav(act) { return !!this.rep[act]; },
  hit(act) { return !!this.pressed[act]; },
  consume(act) { this.pressed[act] = false; this.rep[act] = false; },
  clear() { this.pressed = {}; this.rep = {}; },
};

// ============ 音效（WebAudio 合成，无需任何文件） ============
const Sfx = {
  ctx: null, master: null, muted: false, sfxGain: null, musGain: null,
  init() {
    if (this.ctx) { if (this.ctx.state === 'suspended') this.ctx.resume(); return; }
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      this.ctx = new AC();
      this.master = this.ctx.createGain(); this.master.gain.value = this.muted ? 0 : 0.5; this.master.connect(this.ctx.destination);
      this.sfxGain = this.ctx.createGain(); this.sfxGain.gain.value = 0.45; this.sfxGain.connect(this.master);
      this.musGain = this.ctx.createGain(); this.musGain.gain.value = 0.22; this.musGain.connect(this.master);
      Music.start();
    } catch (e) { this.ctx = null; }
  },
  toggle() { this.muted = !this.muted; if (this.master) this.master.gain.value = this.muted ? 0 : 0.5; return this.muted; },
  tone(freq, dur, type, vol, slide, delay) {
    if (!this.ctx || this.muted) return;
    const t0 = this.ctx.currentTime + (delay || 0);
    const o = this.ctx.createOscillator(), g = this.ctx.createGain();
    o.type = type || 'square'; o.frequency.setValueAtTime(freq, t0);
    if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(20, freq + slide), t0 + dur);
    g.gain.setValueAtTime(vol || 0.2, t0); g.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
    o.connect(g); g.connect(this.sfxGain); o.start(t0); o.stop(t0 + dur + 0.02);
  },
  noise(dur, vol, freq, delay) {
    if (!this.ctx || this.muted) return;
    const t0 = this.ctx.currentTime + (delay || 0);
    const n = Math.floor(this.ctx.sampleRate * dur);
    const buf = this.ctx.createBuffer(1, n, this.ctx.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
    const s = this.ctx.createBufferSource(); s.buffer = buf;
    const f = this.ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = freq || 2000;
    const g = this.ctx.createGain(); g.gain.setValueAtTime(vol || 0.3, t0); g.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
    s.connect(f); f.connect(g); g.connect(this.sfxGain); s.start(t0);
  },
  play(name) {
    switch (name) {
      case 'swing': this.noise(0.12, 0.25, 3000); this.tone(600, 0.08, 'sine', 0.08, -300); break;
      case 'hit': this.tone(220, 0.1, 'square', 0.2, -120); this.noise(0.08, 0.2, 1500); break;
      case 'hurt': this.tone(300, 0.25, 'sawtooth', 0.2, -220); break;
      case 'kill': this.tone(500, 0.08, 'square', 0.15, 300); this.noise(0.25, 0.2, 1200, 0.05); break;
      case 'coin': this.tone(988, 0.07, 'square', 0.12); this.tone(1319, 0.2, 'square', 0.12, 0, 0.07); break;
      case 'pickup': this.tone(660, 0.06, 'square', 0.1); this.tone(880, 0.1, 'square', 0.1, 0, 0.06); break;
      case 'select': this.tone(880, 0.04, 'square', 0.08); break;
      case 'confirm': this.tone(660, 0.05, 'square', 0.1); this.tone(990, 0.08, 'square', 0.1, 0, 0.05); break;
      case 'cancel': this.tone(440, 0.06, 'square', 0.1); this.tone(330, 0.08, 'square', 0.1, 0, 0.05); break;
      case 'text': this.tone(520 + Math.random() * 80, 0.025, 'square', 0.04); break;
      case 'till': this.noise(0.12, 0.3, 600); break;
      case 'water': this.noise(0.25, 0.15, 4000); this.tone(1200, 0.15, 'sine', 0.05, -600); break;
      case 'plant': this.tone(400, 0.06, 'triangle', 0.15, 200); break;
      case 'harvest': this.tone(523, 0.06, 'square', 0.1); this.tone(784, 0.12, 'square', 0.1, 0, 0.06); break;
      case 'rock': this.noise(0.15, 0.35, 900); this.tone(150, 0.1, 'square', 0.15, -60); break;
      case 'chop': this.noise(0.1, 0.3, 1500); this.tone(200, 0.08, 'triangle', 0.2, -50); break;
      case 'cut': this.noise(0.12, 0.25, 2500); break;
      case 'door': this.tone(200, 0.12, 'triangle', 0.15, 80); this.noise(0.1, 0.1, 800, 0.05); break;
      case 'bow': this.tone(900, 0.1, 'triangle', 0.12, -600); break;
      case 'bomb': this.noise(0.5, 0.5, 500); this.tone(80, 0.4, 'sawtooth', 0.3, -40); break;
      case 'fire': this.noise(0.3, 0.25, 1800); this.tone(300, 0.2, 'sawtooth', 0.08, 300); break;
      case 'secret': [523, 659, 784, 1047].forEach((f, i) => this.tone(f, 0.15, 'square', 0.1, 0, i * 0.1)); break;
      case 'item': [523, 659, 784, 1047, 784, 1047].forEach((f, i) => this.tone(f, 0.14, 'square', 0.1, 0, i * 0.09)); break;
      case 'levelup': [523, 659, 784, 1047].forEach((f, i) => this.tone(f, 0.12, 'triangle', 0.18, 0, i * 0.08)); break;
      case 'heal': [523, 659, 784, 659, 784, 1047].forEach((f, i) => this.tone(f, 0.12, 'sine', 0.15, 0, i * 0.1)); break;
      case 'encounter': for (let i = 0; i < 6; i++) this.tone(300 + i * 80, 0.06, 'square', 0.12, 0, i * 0.05); break;
      case 'catch': this.tone(1000, 0.05, 'square', 0.1); this.tone(1500, 0.05, 'square', 0.1, 0, 0.06); break;
      case 'shake': this.tone(300, 0.08, 'triangle', 0.15); break;
      case 'splash': this.noise(0.3, 0.25, 2500); break;
      case 'bite': this.tone(1200, 0.08, 'square', 0.15); this.tone(1200, 0.08, 'square', 0.15, 0, 0.12); break;
      case 'fail': this.tone(300, 0.2, 'square', 0.12, -100); this.tone(200, 0.3, 'square', 0.12, -80, 0.2); break;
      case 'step': this.noise(0.03, 0.05, 500); break;
      case 'boss': this.tone(110, 0.6, 'sawtooth', 0.2, -30); this.noise(0.6, 0.2, 300); break;
      case 'warp': for (let i = 0; i < 8; i++) this.tone(400 + i * 120, 0.05, 'sine', 0.1, 0, i * 0.03); break;
      case 'unlock': this.tone(700, 0.05, 'square', 0.12); this.tone(500, 0.1, 'square', 0.12, 0, 0.06); this.noise(0.1, 0.1, 1000, 0.1); break;
    }
  }
};

// ============ 背景音乐（简易芯片音乐序列器） ============
const NOTE = (() => {
  const m = {}; const names = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  for (let o = 1; o < 8; o++) for (let i = 0; i < 12; i++) m[names[i] + o] = 440 * Math.pow(2, (o * 12 + i - 57) / 12);
  return m;
})();
const SONGS = {
  title: { bpm: 96, lead: 'E5 . G5 . A5 . . G5 E5 . D5 . C5 . . . D5 . E5 . G5 . A5 . C6 . B5 . G5 . . . A5 . . G5 E5 . D5 . E5 . . D5 C5 . A4 . C5 . D5 . E5 . G5 . E5 . . . . . . .', bass: 'C3 . G3 . C3 . G3 . A2 . E3 . A2 . E3 . F2 . C3 . F2 . C3 . G2 . D3 . G2 . D3 . C3 . G3 . C3 . G3 . A2 . E3 . A2 . E3 . F2 . C3 . G2 . D3 . C3 . G2 . C3 . . .', wave: 'triangle' },
  farm: { bpm: 108, lead: 'G4 . C5 . E5 . D5 C5 D5 . E5 . C5 . . . A4 . C5 . F5 . E5 D5 E5 . . . . . . . G4 . C5 . E5 . G5 . A5 . G5 . E5 . C5 . D5 . . . E5 D5 C5 . D5 . C5 . . . . . . .', bass: 'C3 . . . G2 . . . C3 . . . G2 . . . F2 . . . C3 . . . G2 . . . G2 . . . C3 . . . E3 . . . F2 . . . C3 . . . G2 . . . G2 . . . C3 . G2 . C3 . . .', wave: 'square' },
  village: { bpm: 100, lead: 'E5 . D5 . C5 . D5 . E5 . E5 . E5 . . . D5 . D5 . D5 . . . E5 . G5 . G5 . . . E5 . D5 . C5 . D5 . E5 . E5 . E5 . C5 . D5 . D5 . E5 . D5 . C5 . . . . . . .', bass: 'C3 . G3 . C3 . G3 . C3 . G3 . C3 . G3 . G2 . D3 . G2 . D3 . C3 . G3 . C3 . G3 . C3 . G3 . C3 . G3 . C3 . G3 . A2 . E3 . G2 . D3 . G2 . D3 . C3 . G2 . C3 . . .', wave: 'square' },
  field: { bpm: 132, lead: 'C5 . E5 G5 . E5 C5 . D5 . F5 A5 . F5 D5 . E5 . G5 C6 . G5 E5 . D5 . . . G4 . . . C5 . E5 G5 . E5 C5 . D5 . F5 A5 . C6 B5 . A5 . G5 . E5 . C5 . D5 . G5 . C5 . . . . . . .', bass: 'C3 C3 G3 G3 C3 C3 G3 G3 D3 D3 A3 A3 D3 D3 A3 A3 C3 C3 G3 G3 C3 C3 G3 G3 G2 G2 D3 D3 G2 G2 D3 D3 C3 C3 G3 G3 C3 C3 G3 G3 F2 F2 C3 C3 F2 F2 C3 C3 G2 G2 D3 D3 G2 G2 D3 D3 C3 C3 G3 G3 C3 . . .', wave: 'square' },
  forest: { bpm: 90, lead: 'A4 . . C5 E5 . . D5 C5 . . B4 A4 . . . G4 . . B4 D5 . . C5 B4 . . A4 G4 . . . A4 . . C5 E5 . . A5 G5 . . E5 D5 . . . C5 . . B4 A4 . . G4 A4 . . . . . . .', bass: 'A2 . . . E3 . . . A2 . . . E3 . . . G2 . . . D3 . . . G2 . . . D3 . . . F2 . . . C3 . . . F2 . . . C3 . . . E2 . . . B2 . . . A2 . . . E3 . . .', wave: 'triangle' },
  dungeon: { bpm: 112, lead: 'D5 . . D5 F5 . E5 . D5 . . . A4 . . . C5 . . C5 E5 . D5 . C5 . . . A4 . . . D5 . . D5 F5 . A5 . G5 . F5 . E5 . D5 . C#5 . . . E5 . . . D5 . . . . . . .', bass: 'D2 . D3 . D2 . D3 . D2 . D3 . D2 . D3 . C2 . C3 . C2 . C3 . C2 . C3 . C2 . C3 . A#1 . A#2 . A#1 . A#2 . A1 . A2 . A1 . A2 . D2 . D3 . D2 . D3 . D2 . D3 . D2 . D3 .', wave: 'sawtooth' },
  battle: { bpm: 150, lead: 'E5 E5 . E5 . C5 E5 . G5 . . . G4 . . . C5 . . G4 . . E4 . . A4 . B4 . A#4 A4 . G4 E5 G5 A5 . F5 G5 . E5 . C5 D5 B4 . . . C5 . . G4 . . E4 . . A4 . B4 . A#4 A4 . .', bass: 'C3 C3 G3 G3 C3 C3 G3 G3 C3 C3 G3 G3 C3 C3 G3 G3 A2 A2 E3 E3 A2 A2 E3 E3 F2 F2 C3 C3 F2 F2 C3 C3 C3 C3 G3 G3 C3 C3 G3 G3 F2 F2 C3 C3 G2 G2 D3 D3 A2 A2 E3 E3 A2 A2 E3 E3 F2 F2 G2 G2 G2 G2', wave: 'square' },
  boss: { bpm: 160, lead: 'D5 D5 F5 D5 G5 D5 F5 D5 C5 C5 E5 C5 F5 C5 E5 C5 A#4 A#4 D5 A#4 F5 A#4 D5 A#4 A4 A4 C#5 A4 E5 A4 C#5 A4 D5 . A5 . G5 . F5 . E5 . F5 . G5 . A5 . A#5 . A5 . G5 . F5 . E5 . C#5 . A4 . . .', bass: 'D2 D2 D3 D2 D2 D3 D2 D3 C2 C2 C3 C2 C2 C3 C2 C3 A#1 A#1 A#2 A#1 A#1 A#2 A#1 A#2 A1 A1 A2 A1 A1 A2 A1 A2 D2 D2 D3 D2 D2 D3 D2 D3 C2 C2 C3 C2 C2 C3 C2 C3 A#1 A#1 A#2 A#1 A1 A1 A2 A1 A1 A2 A1 A2 A1 A2 A1 A2', wave: 'sawtooth' },
  night: { bpm: 72, lead: 'E5 . . . D5 . C5 . G4 . . . . . . . A4 . . . C5 . E5 . D5 . . . . . . . C5 . . . B4 . A4 . E4 . . . . . . . F4 . A4 . C5 . B4 . G4 . . . . . . .', bass: 'C3 . . . . . . . E2 . . . . . . . F2 . . . . . . . G2 . . . . . . . A2 . . . . . . . E2 . . . . . . . F2 . . . . . . . G2 . . . . . . .', wave: 'sine' },
  snow: { bpm: 84, lead: 'B4 . E5 . F#5 . G5 . F#5 . E5 . B4 . . . A4 . D5 . E5 . F#5 . E5 . D5 . A4 . . . G4 . B4 . E5 . G5 . F#5 . D#5 . B4 . . . C5 . B4 . A4 . F#4 . E4 . . . . . . .', bass: 'E2 . B2 . E3 . B2 . E2 . B2 . E3 . B2 . D2 . A2 . D3 . A2 . D2 . A2 . D3 . A2 . C2 . G2 . C3 . G2 . B1 . F#2 . B2 . F#2 . A1 . E2 . A2 . E2 . B1 . F#2 . B2 . . .', wave: 'triangle' },
  victory: { bpm: 140, lead: 'C5 C5 C5 C5 . . G#4 . A#4 . C5 . . A#4 C5 . . . . . . . . .', bass: 'C3 . . . . . G#2 . A#2 . C3 . . . C3 . . . . . . . . .', wave: 'square', once: true },
};
const Music = {
  cur: null, step: 0, nextTime: 0, timer: null, song: null, want: null,
  start() { if (this.timer) return; this.timer = setInterval(() => this.tick(), 50); },
  play(name) {
    if (this.want === name) return;
    this.want = name;
    this.song = SONGS[name] || null;
    if (this.song && !this.song._lead) {
      this.song._lead = this.song.lead.split(/\s+/);
      this.song._bass = this.song.bass.split(/\s+/);
    }
    this.step = 0;
    if (Sfx.ctx) this.nextTime = Sfx.ctx.currentTime + 0.1;
  },
  tick() {
    const ctx = Sfx.ctx; if (!ctx || !this.song || Sfx.muted) { if (ctx) this.nextTime = ctx.currentTime + 0.1; return; }
    const s = this.song, dur = 60 / s.bpm / 2;
    if (this.nextTime < ctx.currentTime - 0.5) this.nextTime = ctx.currentTime + 0.05;
    while (this.nextTime < ctx.currentTime + 0.2) {
      const len = s._lead.length;
      if (s.once && this.step >= len) { this.song = null; return; }
      const i = this.step % len;
      this.note(s._lead[i], s._lead, i, this.nextTime, dur, s.wave, 0.16);
      this.note(s._bass[i % s._bass.length], s._bass, i % s._bass.length, this.nextTime, dur, 'triangle', 0.22);
      this.nextTime += dur; this.step++;
    }
  },
  note(tok, arr, i, t, dur, wave, vol) {
    if (!tok || tok === '.' || tok === '-') return;
    const f = NOTE[tok]; if (!f) return;
    let n = 1; while (arr[(i + n) % arr.length] === '.' && n < 8) n++;
    const ctx = Sfx.ctx, o = ctx.createOscillator(), g = ctx.createGain();
    o.type = wave; o.frequency.value = f;
    const d = dur * n * 0.92;
    g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(vol, t + 0.01);
    g.gain.setValueAtTime(vol * 0.7, t + Math.min(d, 0.1)); g.gain.exponentialRampToValueAtTime(0.001, t + d);
    o.connect(g); g.connect(Sfx.musGain); o.start(t); o.stop(t + d + 0.05);
  }
};
