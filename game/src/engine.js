// The game itself: state machine, clicks, timer, score, combo, hints,
// markers and overlays. One instance drives both panels.
window.TW = window.TW || {};

TW.SpotDifferenceGame = function SpotDifferenceGame() {
  this.canvasA = document.getElementById('panelA');
  this.canvasB = document.getElementById('panelB');
  this.ctxA = this.canvasA.getContext('2d');
  this.ctxB = this.canvasB.getContext('2d');
  this.sound = new TW.SoundBank();
  this.state = 'title'; // title | playing | levelDone | gameOver | victory
  this.levelIndex = 0;
  this.found = new Set();
  this.score = 0;
  this.combo = 0;
  this.timeLeft = 0;
  this.hintsLeft = 3;
  this.hintCooldownUntil = 0;
  this.hintTarget = null;
  this.hintUntil = 0;
  this.misses = [];
  this.floaters = [];
  this.completedLevels = new Set();
  this.best = 0;
  this.timeLeft = TW.SCENES[0].timeLimit;
  this.frozen = false;
  this.lastTickSecond = -1;
  this.lastFrame = 0;
  try {
    this.best = parseInt(window.localStorage.getItem('twinworlds.best') || '0', 10) || 0;
  } catch (e) {
    this.best = 0;
  }
  this.bindControls();
  this.showTitle();
  this.updateHud();
};

TW.SpotDifferenceGame.prototype.scene = function scene() {
  return TW.SCENES[this.levelIndex];
};

TW.SpotDifferenceGame.prototype.bindControls = function bindControls() {
  const self = this;
  function panelClick(panel, ctx, ev) {
    const rect = panel.getBoundingClientRect();
    const x = ((ev.clientX - rect.left) / rect.width) * panel.width;
    const y = ((ev.clientY - rect.top) / rect.height) * panel.height;
    self.handleClick(x, y, panel);
  }
  this.canvasA.addEventListener('click', function (ev) {
    panelClick(self.canvasA, self.ctxA, ev);
  });
  this.canvasB.addEventListener('click', function (ev) {
    panelClick(self.canvasB, self.ctxB, ev);
  });
  document.getElementById('hintBtn').addEventListener('click', function () {
    self.useHint();
  });
  document.getElementById('restartBtn').addEventListener('click', function () {
    self.startLevel(self.levelIndex);
  });
  document.getElementById('levelsBtn').addEventListener('click', function () {
    self.showTitle();
  });
  document.getElementById('muteBtn').addEventListener('click', function () {
    self.toggleMute();
  });
  document.addEventListener('keydown', function (ev) {
    if (ev.key === 'h' || ev.key === 'H') self.useHint();
    else if (ev.key === 'm' || ev.key === 'M') self.toggleMute();
    else if (ev.key === 'r' || ev.key === 'R') self.startLevel(self.levelIndex);
    else if (ev.key === 'Enter') {
      if (self.state === 'title') self.startLevel(0);
      else if (self.state === 'levelDone') self.nextLevel();
      else if (self.state === 'gameOver') self.startLevel(self.levelIndex);
      else if (self.state === 'victory') self.startLevel(0);
    } else if (ev.key >= '1' && ev.key <= '3') {
      self.startLevel(parseInt(ev.key, 10) - 1);
    }
  });
};

TW.SpotDifferenceGame.prototype.toggleMute = function toggleMute() {
  this.sound.muted = !this.sound.muted;
  document.getElementById('muteBtn').textContent = this.sound.muted
    ? 'SOUND OFF'
    : 'SOUND ON';
};

TW.SpotDifferenceGame.prototype.startLevel = function startLevel(index) {
  this.levelIndex = index;
  const s = this.scene();
  this.found = new Set();
  this.combo = 0;
  this.timeLeft = s.timeLimit;
  this.hintsLeft = 3;
  this.hintCooldownUntil = 0;
  this.hintTarget = null;
  this.misses = [];
  this.floaters = [];
  this.lastTickSecond = -1;
  this.state = 'playing';
  this.sound.ensureContext();
  this.hideOverlay();
  this.updateHud();
  this.render(0);
};

TW.SpotDifferenceGame.prototype.handleClick = function handleClick(x, y, panel) {
  if (this.state !== 'playing') return;
  this.sound.ensureContext();
  const s = this.scene();
  for (const d of s.differences) {
    if (this.found.has(d.id)) continue;
    const dx = x - d.x;
    const dy = y - d.y;
    if (dx * dx + dy * dy <= d.r * d.r) {
      this.markFound(d, x, y, panel);
      return;
    }
  }
  // A miss: red X, a small time penalty and the combo breaks.
  this.combo = 0;
  this.score = Math.max(0, this.score - 15);
  this.timeLeft = Math.max(0, this.timeLeft - 3);
  this.misses.push({ x: x, y: y, born: performance.now(), panel: panel });
  this.sound.miss();
  const wrap = panel === this.canvasA
    ? document.getElementById('panelWrapA')
    : document.getElementById('panelWrapB');
  wrap.classList.remove('shake');
  void wrap.offsetWidth;
  wrap.classList.add('shake');
  this.updateHud();
};

TW.SpotDifferenceGame.prototype.markFound = function markFound(d, x, y, panel) {
  this.found.add(d.id);
  this.combo += 1;
  const points = 100 + 10 * (this.combo - 1);
  this.score += points;
  this.floaters.push({
    x: x,
    y: y - 14,
    text: '+' + points,
    color: '#7ed957',
    born: performance.now(),
    panel: panel,
  });
  this.sound.find();
  if (this.found.size === this.scene().differences.length) {
    this.completeLevel();
  }
  this.updateHud();
};

TW.SpotDifferenceGame.prototype.completeLevel = function completeLevel() {
  const bonus = Math.ceil(this.timeLeft) * 5;
  this.score += bonus;
  this.completedLevels.add(this.levelIndex);
  this.sound.fanfare();
  const s = this.scene();
  const isLast = this.levelIndex === TW.SCENES.length - 1;
  if (this.score > this.best) {
    this.best = this.score;
    try {
      window.localStorage.setItem('twinworlds.best', String(this.best));
    } catch (e) {
      /* storage unavailable; best score just lives for this session */
    }
  }
  this.state = isLast ? 'victory' : 'levelDone';
  const card = document.getElementById('overlayCard');
  if (isLast) {
    card.innerHTML =
      '<h1>YOU FOUND THEM ALL!</h1>' +
      '<p class="big">All three worlds cleared &middot; ' + this.score + ' points</p>' +
      '<p>Time bonus ' + bonus + ' &middot; Best score ' + this.best + '</p>' +
      '<p>Every lantern, fish and gear matched. The twins are in perfect sync.</p>' +
      '<div class="row">' +
      '<button class="btn" id="ovAgain">PLAY AGAIN</button>' +
      '<button class="btn secondary" id="ovLevels">LEVELS</button>' +
      '</div>' +
      '<p class="keys">H hint &middot; M sound &middot; R restart &middot; 1-3 jump to a level</p>';
    document.getElementById('ovAgain').addEventListener('click', () => {
      this.score = 0;
      this.startLevel(0);
    });
  } else {
    card.innerHTML =
      '<h1>LEVEL CLEAR!</h1>' +
      '<h2>' + s.name + ' &middot; ' + s.differences.length + ' / ' + s.differences.length + ' found</h2>' +
      '<p class="big">Time bonus +' + bonus + ' &middot; Score ' + this.score + '</p>' +
      '<p>Sharp eyes! The next world hides its differences even better.</p>' +
      '<div class="row">' +
      '<button class="btn" id="ovNext">NEXT LEVEL</button>' +
      '<button class="btn secondary" id="ovReplay">REPLAY</button>' +
      '<button class="btn secondary" id="ovLevels">LEVELS</button>' +
      '</div>' +
      '<p class="keys">H hint &middot; M sound &middot; R restart &middot; 1-3 jump to a level</p>';
    document.getElementById('ovNext').addEventListener('click', () => this.nextLevel());
    document.getElementById('ovReplay').addEventListener('click', () => this.startLevel(this.levelIndex));
  }
  document.getElementById('ovLevels').addEventListener('click', () => this.showTitle());
  this.showOverlay();
  this.updateHud();
};

TW.SpotDifferenceGame.prototype.nextLevel = function nextLevel() {
  this.startLevel(Math.min(this.levelIndex + 1, TW.SCENES.length - 1));
};

TW.SpotDifferenceGame.prototype.failLevel = function failLevel() {
  this.state = 'gameOver';
  this.sound.gameOver();
  const s = this.scene();
  const card = document.getElementById('overlayCard');
  card.innerHTML =
    '<h1>TIME&rsquo;S UP!</h1>' +
    '<h2>' + s.name + ' &middot; ' + this.found.size + ' / ' + s.differences.length + ' found</h2>' +
    '<p>' + (s.differences.length - this.found.size) + ' difference(s) still hiding. ' +
    'Try a hint next time &mdash; or look closer at the small things.</p>' +
    '<p class="big">Score ' + this.score + '</p>' +
    '<div class="row">' +
    '<button class="btn" id="ovRetry">TRY AGAIN</button>' +
    '<button class="btn secondary" id="ovLevels">LEVELS</button>' +
    '</div>' +
    '<p class="keys">H hint &middot; M sound &middot; R restart &middot; 1-3 jump to a level</p>';
  document.getElementById('ovRetry').addEventListener('click', () => this.startLevel(this.levelIndex));
  document.getElementById('ovLevels').addEventListener('click', () => this.showTitle());
  this.showOverlay();
  this.updateHud();
};

TW.SpotDifferenceGame.prototype.showTitle = function showTitle() {
  this.state = 'title';
  const card = document.getElementById('overlayCard');
  const buttons = TW.SCENES.map((s, i) =>
    '<button data-level="' + i + '">' + (i + 1) + '. ' + s.name +
    ' &middot; ' + s.differences.length + ' diffs &middot; ' + s.timeLimit + 's</button>',
  ).join('');
  card.innerHTML =
    '<h1>TWIN WORLDS</h1>' +
    '<h2>Spot the Difference</h2>' +
    '<p>Two pictures hang side by side. They look the same &mdash; they are not. ' +
    'Click every difference you can find before the clock runs out. ' +
    'A wrong click costs 15 points and 3 seconds; a good streak builds your combo.</p>' +
    '<div class="scene-pick">' + buttons + '</div>' +
    '<div class="row">' +
    '<button class="btn" id="ovStart">START HUNTING</button>' +
    '</div>' +
    '<p class="keys">Click a difference in either panel &middot; H hint &middot; M sound &middot; R restart &middot; 1-3 jump to a level</p>' +
    '<p class="keys">Best score: ' + this.best + '</p>';
  card.querySelectorAll('[data-level]').forEach((b) => {
    b.addEventListener('click', () => this.startLevel(parseInt(b.getAttribute('data-level'), 10)));
  });
  document.getElementById('ovStart').addEventListener('click', () => this.startLevel(0));
  this.showOverlay();
  this.updateHud();
};

TW.SpotDifferenceGame.prototype.showOverlay = function showOverlay() {
  document.getElementById('overlay').classList.remove('hidden');
};

TW.SpotDifferenceGame.prototype.hideOverlay = function hideOverlay() {
  document.getElementById('overlay').classList.add('hidden');
};

TW.SpotDifferenceGame.prototype.useHint = function useHint() {
  if (this.state !== 'playing') return;
  if (this.hintsLeft <= 0) return;
  const now = performance.now();
  if (now < this.hintCooldownUntil) return;
  const remaining = this.scene().differences.filter((d) => !this.found.has(d.id));
  if (remaining.length === 0) return;
  this.sound.ensureContext();
  this.hintTarget = remaining[Math.floor(Math.random() * remaining.length)];
  this.hintUntil = now + 2500;
  this.hintsLeft -= 1;
  this.hintCooldownUntil = now + 12000;
  this.score = Math.max(0, this.score - 50);
  this.sound.hint();
  this.updateHud();
};

TW.SpotDifferenceGame.prototype.updateHud = function updateHud() {
  const s = this.scene();
  document.getElementById('levelName').textContent = s.name;
  document.getElementById('counter').textContent =
    'FOUND ' + this.found.size + ' / ' + s.differences.length;
  document.getElementById('score').textContent = this.score;
  document.getElementById('combo').textContent = this.combo >= 2 ? 'x' + this.combo + ' COMBO' : '';
  document.getElementById('bestLine').textContent = 'BEST ' + this.best;
  const secs = Math.max(0, Math.ceil(this.timeLeft));
  document.getElementById('timerText').textContent =
    Math.floor(secs / 60) + ':' + String(secs % 60).padStart(2, '0');
  const bar = document.getElementById('timerBar');
  bar.style.width = Math.max(0, (this.timeLeft / s.timeLimit) * 100) + '%';
  document.querySelector('.timer-wrap').classList.toggle('low', this.timeLeft <= 15);
  const hintBtn = document.getElementById('hintBtn');
  hintBtn.textContent = 'HINT · ' + this.hintsLeft + ' LEFT';
  hintBtn.disabled = this.hintsLeft <= 0 || this.state !== 'playing';
  const dots = document.getElementById('levelDots');
  dots.innerHTML = '';
  TW.SCENES.forEach((sc, i) => {
    const dot = document.createElement('div');
    dot.className = 'dot' +
      (this.completedLevels.has(i) ? ' done' : '') +
      (i === this.levelIndex ? ' current' : '');
    dot.textContent = this.completedLevels.has(i) ? '✓' : String(i + 1);
    dot.title = sc.name;
    dot.addEventListener('click', () => this.startLevel(i));
    dots.appendChild(dot);
  });
};

// Draw one panel: the scene, then markers for found differences,
// the pulsing hint ring, miss marks and floating score text.
TW.SpotDifferenceGame.prototype.drawPanel = function drawPanel(ctx, applied, now) {
  const s = this.scene();
  s.paint(ctx, 600, 540, applied);
  const pulse = 1 + 0.08 * Math.sin(now / 260);
  ctx.save();
  ctx.lineWidth = 4;
  for (const d of s.differences) {
    if (!this.found.has(d.id)) continue;
    ctx.strokeStyle = '#39d353';
    ctx.beginPath();
    ctx.arc(d.x, d.y, (d.r + 7) * pulse, 0, Math.PI * 2);
    ctx.stroke();
    // Check mark.
    ctx.strokeStyle = '#39d353';
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(d.x - d.r * 0.45, d.y);
    ctx.lineTo(d.x - d.r * 0.1, d.y + d.r * 0.38);
    ctx.lineTo(d.x + d.r * 0.5, d.y - d.r * 0.38);
    ctx.stroke();
    ctx.lineWidth = 4;
  }
  // Hint ring.
  if (this.hintTarget && now < this.hintUntil) {
    const d = this.hintTarget;
    ctx.strokeStyle = '#ffd23f';
    ctx.setLineDash([8, 6]);
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(d.x, d.y, (d.r + 10) * pulse, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
  }
  // Miss marks.
  const cutoff = now - 450;
  this.misses = this.misses.filter((m) => m.born > cutoff || this.frozen);
  for (const m of this.misses) {
    if (ctx !== (m.panel === this.canvasA ? this.ctxA : this.ctxB)) continue;
    ctx.strokeStyle = '#ff4d4d';
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    const r = 12;
    ctx.beginPath();
    ctx.moveTo(m.x - r, m.y - r);
    ctx.lineTo(m.x + r, m.y + r);
    ctx.moveTo(m.x + r, m.y - r);
    ctx.lineTo(m.x - r, m.y + r);
    ctx.stroke();
  }
  // Floating score text.
  for (const f of this.floaters) {
    if (ctx !== (f.panel === this.canvasA ? this.ctxA : this.ctxB)) continue;
    const age = now - f.born;
    if (age > 900) continue;
    ctx.globalAlpha = 1 - age / 900;
    ctx.fillStyle = f.color;
    ctx.font = '900 22px Trebuchet MS, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(f.text, f.x, f.y - age * 0.04);
  }
  ctx.restore();
  this.floaters = this.floaters.filter((f) => now - f.born <= 900 || this.frozen);
};

TW.SpotDifferenceGame.prototype.render = function render(now) {
  const s = this.scene();
  const all = new Set(s.differences.map((d) => d.id));
  this.drawPanel(this.ctxA, new Set(), now);
  this.drawPanel(this.ctxB, all, now);
};

TW.SpotDifferenceGame.prototype.frame = function frame(now) {
  if (this.state === 'playing' && !this.frozen) {
    const dt = this.lastFrame ? (now - this.lastFrame) / 1000 : 0;
    this.timeLeft -= dt;
    if (this.timeLeft <= 10) {
      const sec = Math.ceil(this.timeLeft);
      if (sec !== this.lastTickSecond && sec > 0) {
        this.lastTickSecond = sec;
        this.sound.tick();
      }
    }
    if (this.timeLeft <= 0) {
      this.timeLeft = 0;
      this.updateHud();
      this.render(now);
      this.failLevel();
      this.lastFrame = now;
      return;
    }
    this.updateHud();
  }
  this.render(now);
  this.lastFrame = now;
};

TW.SpotDifferenceGame.prototype.run = function run() {
  const self = this;
  function loop(now) {
    self.frame(now);
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
};
