// Synthesized sound effects — no audio files. All sounds are built from
// WebAudio oscillators, so the game loads nothing over the network.
window.TW = window.TW || {};

TW.SoundBank = function SoundBank() {
  this.ctx = null;
  this.muted = false;
  this.master = null;
};

TW.SoundBank.prototype.ensureContext = function ensureContext() {
  if (!this.ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return false;
    this.ctx = new AC();
    this.master = this.ctx.createGain();
    this.master.gain.value = 0.35;
    this.master.connect(this.ctx.destination);
  }
  if (this.ctx.state === 'suspended') this.ctx.resume();
  return true;
};

TW.SoundBank.prototype.tone = function tone(freq, dur, type, vol, when, slideTo) {
  if (this.muted || !this.ctx) return;
  const t0 = this.ctx.currentTime + (when || 0);
  const osc = this.ctx.createOscillator();
  const gain = this.ctx.createGain();
  osc.type = type || 'sine';
  osc.frequency.setValueAtTime(freq, t0);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
  gain.gain.setValueAtTime(0.0001, t0);
  gain.gain.exponentialRampToValueAtTime(vol || 0.5, t0 + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(gain);
  gain.connect(this.master);
  osc.start(t0);
  osc.stop(t0 + dur + 0.05);
};

TW.SoundBank.prototype.click = function click() {
  this.tone(620, 0.07, 'square', 0.18);
};

TW.SoundBank.prototype.find = function find() {
  // A happy two-note chime, rising with the combo.
  this.tone(659, 0.12, 'sine', 0.5);
  this.tone(880, 0.18, 'sine', 0.5, 0.09);
};

TW.SoundBank.prototype.miss = function miss() {
  this.tone(150, 0.22, 'sawtooth', 0.3, 0, 90);
};

TW.SoundBank.prototype.hint = function hint() {
  this.tone(1046, 0.1, 'sine', 0.35);
  this.tone(1318, 0.1, 'sine', 0.35, 0.08);
  this.tone(1568, 0.16, 'sine', 0.35, 0.16);
};

TW.SoundBank.prototype.tick = function tick() {
  this.tone(980, 0.05, 'square', 0.12);
};

TW.SoundBank.prototype.fanfare = function fanfare() {
  const notes = [523, 659, 784, 1046];
  for (let i = 0; i < notes.length; i++) {
    this.tone(notes[i], 0.22, 'triangle', 0.5, i * 0.11);
  }
  this.tone(1318, 0.4, 'triangle', 0.4, 0.46);
};

TW.SoundBank.prototype.gameOver = function gameOver() {
  const notes = [392, 330, 262];
  for (let i = 0; i < notes.length; i++) {
    this.tone(notes[i], 0.3, 'triangle', 0.4, i * 0.16);
  }
};
