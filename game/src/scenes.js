// The three original scenes. Each scene paints itself twice: once plain
// (panel A) and once with its differences applied (panel B). A difference is
// a small, fair change at a known spot — the engine clicks against the
// positions in `differences`. All decoration uses a seeded RNG, so both
// panels match exactly except for the differences.
window.TW = window.TW || {};

TW.paintLanternMarket = function paintLanternMarket(ctx, W, H, applied) {
  const H_ = TW.drawHelpers;
  const rng = TW.makeRng('lantern-market');
  // Night sky.
  const sky = ctx.createLinearGradient(0, 0, 0, 380);
  sky.addColorStop(0, '#160f38');
  sky.addColorStop(0.6, '#33225e');
  sky.addColorStop(1, '#6b4226');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, 380);
  // Stars.
  for (let i = 0; i < 46; i++) {
    const x = rng.range(8, W - 8);
    const y = rng.range(8, 300);
    const r = rng.range(0.8, 2.2);
    ctx.fillStyle = rng.next() > 0.85 ? '#ffe9a8' : '#ffffff';
    ctx.globalAlpha = rng.range(0.5, 1);
    H_.circle(ctx, x, y, r);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  // Moon with craters (difference: fewer craters).
  ctx.fillStyle = '#f7ecc8';
  H_.circle(ctx, 512, 66, 34);
  ctx.fill();
  ctx.fillStyle = '#d9c795';
  const craters = applied.has('moon-craters')
    ? [[520, 58, 6]]
    : [[520, 58, 6], [500, 74, 8], [526, 80, 5]];
  for (const c of craters) {
    H_.circle(ctx, c[0], c[1], c[2]);
    ctx.fill();
  }
  // Rooftop silhouettes.
  ctx.fillStyle = '#241a3e';
  ctx.beginPath();
  ctx.moveTo(0, 360);
  ctx.lineTo(0, 318);
  ctx.lineTo(70, 318);
  ctx.lineTo(110, 292);
  ctx.lineTo(150, 318);
  ctx.lineTo(230, 318);
  ctx.lineTo(270, 296);
  ctx.lineTo(310, 318);
  ctx.lineTo(420, 318);
  ctx.lineTo(470, 290);
  ctx.lineTo(520, 318);
  ctx.lineTo(600, 318);
  ctx.lineTo(600, 360);
  ctx.closePath();
  ctx.fill();
  // Lit window on the left house (difference: dark when applied).
  ctx.fillStyle = applied.has('window-lit') ? '#1c1440' : '#ffcf5e';
  ctx.fillRect(72, 318, 32, 26);
  ctx.strokeStyle = '#120b28';
  ctx.lineWidth = 3;
  ctx.strokeRect(72, 318, 32, 26);
  ctx.beginPath();
  ctx.moveTo(88, 318);
  ctx.lineTo(88, 344);
  ctx.moveTo(72, 331);
  ctx.lineTo(104, 331);
  ctx.stroke();
  // Cobble street.
  ctx.fillStyle = '#4a3421';
  ctx.fillRect(0, 360, W, 180);
  ctx.fillStyle = '#5d4229';
  for (let i = 0; i < 60; i++) {
    const x = rng.range(0, W);
    const y = rng.range(372, 532);
    ctx.fillRect(x, y, rng.range(14, 30), rng.range(6, 10));
  }
  // Lantern strings across the sky.
  function lanternString(y0, y1, skipX) {
    ctx.strokeStyle = '#120b28';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, y0);
    ctx.quadraticCurveTo(W / 2, y0 + 26, W, y1);
    ctx.stroke();
    for (let i = 0; i < 7; i++) {
      const t = (i + 0.5) / 7;
      const x = t * W;
      const y = y0 + (y1 - y0) * t + Math.sin(t * Math.PI) * 22;
      if (skipX !== null && Math.abs(x - skipX) < 30) continue;
      const col = ['#e5484d', '#f5a623', '#2f9e6e', '#e5484d'][i % 4];
      H_.lantern(ctx, x, y + 16, 13, col, true);
    }
  }
  lanternString(96, 78, applied.has('lantern-string') ? 300 : null);
  lanternString(150, 132, null);
  // The big red lantern (difference: unlit when applied).
  H_.lantern(ctx, 120, 148, 20, applied.has('lantern-red') ? '#5a4a52' : '#e5484d', !applied.has('lantern-red'));
  // Market stalls.
  function stall(x0, w, awningA, awningB, sign) {
    ctx.fillStyle = '#3a2417';
    ctx.fillRect(x0, 400, w, 70);
    ctx.fillStyle = '#6b4226';
    ctx.fillRect(x0 - 6, 392, w + 12, 12);
    // Awning: alternating stripes.
    for (let i = 0; i < 6; i++) {
      ctx.fillStyle = i % 2 === 0 ? awningA : awningB;
      const ax = x0 + (i * w) / 6;
      ctx.beginPath();
      ctx.moveTo(ax, 212);
      ctx.lineTo(ax + w / 6, 212);
      ctx.lineTo(ax + w / 6 + 6, 238);
      ctx.lineTo(ax + 6, 238);
      ctx.closePath();
      ctx.fill();
    }
    ctx.fillStyle = '#2b1a10';
    ctx.fillRect(x0, 238, w, 6);
    // Sign board.
    ctx.fillStyle = '#f3ead3';
    H_.roundRect(ctx, x0 + w / 2 - 34, 258, 68, 26, 6);
    ctx.fill();
    ctx.fillStyle = '#7a2d12';
    ctx.font = 'bold 15px Trebuchet MS, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(sign, x0 + w / 2, 272);
  }
  stall(40, 150, '#2f9e6e', '#f3ead3', 'TEA');
  // Middle stall awning stripes change colour (difference).
  stall(
    225,
    150,
    applied.has('awning-stripes') ? '#e8821e' : '#2f9e6e',
    '#f3ead3',
    'CAKES',
  );
  stall(410, 150, '#7a5fd0', '#f3ead3', 'FISH');
  // Fish sign hanging by the right stall (difference: faces the other way).
  ctx.strokeStyle = '#120b28';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(430, 296);
  ctx.lineTo(430, 312);
  ctx.stroke();
  H_.fish(ctx, 430, 330, 22, applied.has('fish-sign') ? -1 : 1, '#f5a623', '#ffe08a');
  // Fruit basket on the middle counter (difference: oranges, not apples).
  ctx.fillStyle = '#8a5a2b';
  H_.roundRect(ctx, 306, 424, 48, 22, 6);
  ctx.fill();
  ctx.fillStyle = applied.has('basket-fruit') ? '#f08c1e' : '#d93b3b';
  for (const fx of [316, 330, 344]) {
    H_.circle(ctx, fx, 420, 9);
    ctx.fill();
  }
  ctx.fillStyle = '#3f7a2a';
  ctx.fillRect(328, 408, 4, 8);
  // Cat on the right rooftop (difference: tail down, not up).
  ctx.fillStyle = '#120b28';
  H_.ellipse(ctx, 470, 306, 16, 10);
  ctx.fill();
  H_.circle(ctx, 482, 292, 8);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(476, 286);
  ctx.lineTo(479, 278);
  ctx.lineTo(483, 286);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(488, 286);
  ctx.lineTo(491, 278);
  ctx.lineTo(494, 286);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#120b28';
  ctx.lineWidth = 4;
  ctx.beginPath();
  if (applied.has('cat-tail')) {
    ctx.moveTo(456, 306);
    ctx.quadraticCurveTo(448, 318, 452, 326);
  } else {
    ctx.moveTo(456, 306);
    ctx.quadraticCurveTo(444, 296, 446, 284);
  }
  ctx.stroke();
};

TW.paintCoralReef = function paintCoralReef(ctx, W, H, applied) {
  const H_ = TW.drawHelpers;
  const rng = TW.makeRng('coral-reef');
  // Water.
  const water = ctx.createLinearGradient(0, 0, 0, H);
  water.addColorStop(0, '#0b3d66');
  water.addColorStop(0.55, '#0e6b7a');
  water.addColorStop(1, '#084a5e');
  ctx.fillStyle = water;
  ctx.fillRect(0, 0, W, H);
  // Light rays from the surface.
  ctx.fillStyle = 'rgba(255, 255, 220, 0.08)';
  for (let i = 0; i < 5; i++) {
    const x = 60 + i * 120;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x + 46, 0);
    ctx.lineTo(x + 130, 420);
    ctx.lineTo(x + 60, 420);
    ctx.closePath();
    ctx.fill();
  }
  // Sandy floor.
  ctx.fillStyle = '#d9b380';
  ctx.beginPath();
  ctx.moveTo(0, 470);
  ctx.quadraticCurveTo(150, 448, 300, 466);
  ctx.quadraticCurveTo(450, 484, 600, 462);
  ctx.lineTo(600, 540);
  ctx.lineTo(0, 540);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#b98f5e';
  for (let i = 0; i < 40; i++) {
    ctx.fillRect(rng.range(0, W), rng.range(472, 534), rng.range(3, 8), 2);
  }
  // Rocks.
  ctx.fillStyle = '#5a5a6e';
  H_.ellipse(ctx, 120, 478, 70, 26);
  ctx.fill();
  H_.ellipse(ctx, 500, 484, 84, 30);
  ctx.fill();
  // Seaweed strand (difference: short when applied).
  ctx.strokeStyle = '#2f9e5f';
  ctx.lineWidth = 7;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(60, 480);
  if (applied.has('seaweed')) {
    ctx.quadraticCurveTo(48, 420, 62, 380);
  } else {
    ctx.quadraticCurveTo(44, 360, 66, 250);
  }
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(84, 480);
  ctx.quadraticCurveTo(96, 400, 78, 330);
  ctx.stroke();
  // Corals.
  function coral(x, y, color, branches) {
    ctx.strokeStyle = color;
    ctx.lineWidth = 9;
    ctx.lineCap = 'round';
    for (let i = 0; i < branches; i++) {
      const a = -Math.PI / 2 + (i - (branches - 1) / 2) * 0.5;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.quadraticCurveTo(
        x + Math.cos(a) * 26,
        y + Math.sin(a) * 26,
        x + Math.cos(a) * 52,
        y + Math.sin(a) * 52,
      );
      ctx.stroke();
    }
  }
  coral(96, 470, '#ff7fa5', 5);
  coral(486, 472, applied.has('coral-color') ? '#b07fe8' : '#ff8c42', 5);
  coral(300, 478, '#ff5e7a', 4);
  // Yellow fish (difference: faces left when applied).
  H_.fish(ctx, 150, 150, 26, applied.has('fish-turn') ? -1 : 1, '#ffd23f', '#fff3b0');
  H_.fish(ctx, 420, 110, 18, -1, '#4ecdc4', '#c8fff9');
  H_.fish(ctx, 250, 320, 15, 1, '#ff6b9d', '#ffd3e2');
  // Bubble trail (difference: one bubble missing).
  const bubbles = applied.has('bubbles')
    ? [[318, 210, 7], [326, 238, 5]]
    : [[316, 176, 8], [318, 210, 7], [326, 238, 5]];
  for (const b of bubbles) H_.bubble(ctx, b[0], b[1], b[2]);
  H_.bubble(ctx, 520, 320, 6);
  H_.bubble(ctx, 528, 350, 4);
  // Octopus (difference: one eye winks when applied).
  ctx.fillStyle = '#9b59d0';
  H_.ellipse(ctx, 520, 220, 30, 26);
  ctx.fill();
  ctx.strokeStyle = '#9b59d0';
  ctx.lineWidth = 8;
  ctx.lineCap = 'round';
  for (let i = 0; i < 5; i++) {
    const x = 498 + i * 11;
    ctx.beginPath();
    ctx.moveTo(x, 240);
    ctx.quadraticCurveTo(x + 4, 268, x - 6, 282);
    ctx.stroke();
  }
  ctx.fillStyle = '#ffffff';
  H_.circle(ctx, 510, 212, 7);
  ctx.fill();
  H_.circle(ctx, 532, 212, 7);
  ctx.fill();
  ctx.fillStyle = '#241a3e';
  H_.circle(ctx, 510, 213, 3.5);
  ctx.fill();
  if (applied.has('octopus-eye')) {
    ctx.strokeStyle = '#241a3e';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(526, 212);
    ctx.lineTo(538, 212);
    ctx.stroke();
  } else {
    H_.circle(ctx, 532, 213, 3.5);
    ctx.fill();
  }
  // Starfish on the left rock (difference: missing when applied).
  if (!applied.has('starfish')) {
    ctx.fillStyle = '#ff9f43';
    H_.star(ctx, 92, 452, 16, 7, 5);
    ctx.fill();
    ctx.fillStyle = '#e8821e';
    H_.circle(ctx, 92, 452, 3);
    ctx.fill();
  }
  // Shell (difference: pink, not cream).
  ctx.fillStyle = applied.has('shell-color') ? '#ff9ecf' : '#f3ead3';
  ctx.beginPath();
  ctx.arc(230, 424, 22, Math.PI, 0);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = 'rgba(120, 70, 20, 0.5)';
  ctx.lineWidth = 2;
  for (let i = -1; i <= 1; i++) {
    ctx.beginPath();
    ctx.moveTo(230, 424);
    ctx.lineTo(230 + i * 16, 406);
    ctx.stroke();
  }
  // Treasure chest (difference: open, spilling gold, when applied).
  ctx.fillStyle = '#6b4226';
  ctx.fillRect(424, 462, 56, 30);
  ctx.fillStyle = '#8a5a2b';
  ctx.fillRect(424, 462, 56, 8);
  ctx.fillStyle = '#c9a227';
  ctx.fillRect(448, 470, 8, 14);
  if (applied.has('chest-open')) {
    ctx.fillStyle = '#8a5a2b';
    ctx.beginPath();
    ctx.moveTo(424, 462);
    ctx.lineTo(424, 436);
    ctx.lineTo(480, 436);
    ctx.lineTo(480, 462);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#ffd23f';
    for (const gx of [436, 448, 460, 470]) {
      H_.circle(ctx, gx, 458, 5);
      ctx.fill();
    }
    const glow = ctx.createRadialGradient(452, 452, 2, 452, 452, 34);
    glow.addColorStop(0, 'rgba(255, 210, 63, 0.55)');
    glow.addColorStop(1, 'rgba(255, 210, 63, 0)');
    ctx.fillStyle = glow;
    ctx.fillRect(414, 414, 76, 76);
  }
  // Crab (difference: one claw raised when applied).
  ctx.fillStyle = '#e5484d';
  H_.ellipse(ctx, 380, 486, 22, 12);
  ctx.fill();
  ctx.strokeStyle = '#e5484d';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(362, 492);
  ctx.lineTo(348, 500);
  ctx.moveTo(398, 492);
  ctx.lineTo(412, 500);
  ctx.stroke();
  // Claws.
  ctx.fillStyle = '#e5484d';
  if (applied.has('crab-claw')) {
    H_.circle(ctx, 356, 470, 8);
    ctx.fill();
    H_.circle(ctx, 406, 482, 8);
    ctx.fill();
  } else {
    H_.circle(ctx, 356, 484, 8);
    ctx.fill();
    H_.circle(ctx, 406, 484, 8);
    ctx.fill();
  }
  ctx.fillStyle = '#ffffff';
  H_.circle(ctx, 374, 478, 3);
  ctx.fill();
  H_.circle(ctx, 386, 478, 3);
  ctx.fill();
  ctx.fillStyle = '#241a3e';
  H_.circle(ctx, 374, 479, 1.5);
  ctx.fill();
  H_.circle(ctx, 386, 479, 1.5);
  ctx.fill();
};

TW.paintClockworkGarden = function paintClockworkGarden(ctx, W, H, applied) {
  const H_ = TW.drawHelpers;
  const rng = TW.makeRng('clockwork-garden');
  // Morning sky.
  const sky = ctx.createLinearGradient(0, 0, 0, 340);
  sky.addColorStop(0, '#a8d8f0');
  sky.addColorStop(1, '#e8f7d9');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, 340);
  // Sun with rays.
  ctx.fillStyle = '#ffd23f';
  H_.circle(ctx, 80, 70, 30);
  ctx.fill();
  ctx.strokeStyle = '#ffd23f';
  ctx.lineWidth = 4;
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(80 + Math.cos(a) * 38, 70 + Math.sin(a) * 38);
    ctx.lineTo(80 + Math.cos(a) * 50, 70 + Math.sin(a) * 50);
    ctx.stroke();
  }
  // Clouds.
  ctx.fillStyle = 'rgba(255,255,255,0.9)';
  for (const c of [[420, 60], [180, 120], [520, 110]]) {
    H_.ellipse(ctx, c[0], c[1], 34, 14);
    ctx.fill();
    H_.ellipse(ctx, c[0] + 22, c[1] + 4, 24, 11);
    ctx.fill();
  }
  // Hedge wall.
  ctx.fillStyle = '#3f7a2a';
  ctx.fillRect(0, 330, W, 52);
  ctx.fillStyle = '#57a047';
  for (let i = 0; i < 26; i++) {
    H_.circle(ctx, rng.range(0, W), rng.range(330, 382), rng.range(6, 12));
    ctx.fill();
  }
  // Lawn.
  ctx.fillStyle = '#6db84f';
  ctx.fillRect(0, 382, W, 158);
  ctx.fillStyle = '#5aa843';
  for (let i = 0; i < 30; i++) {
    ctx.fillRect(rng.range(0, W), rng.range(390, 534), 3, rng.range(5, 10));
  }
  // Clock tower.
  ctx.fillStyle = '#c9a227';
  ctx.fillRect(250, 40, 100, 220);
  ctx.fillStyle = '#a87f14';
  ctx.fillRect(250, 40, 100, 12);
  ctx.fillRect(244, 252, 112, 10);
  ctx.fillStyle = '#f7ecc8';
  H_.circle(ctx, 300, 110, 46);
  ctx.fill();
  ctx.strokeStyle = '#7a5a10';
  ctx.lineWidth = 4;
  H_.circle(ctx, 300, 110, 46);
  ctx.stroke();
  ctx.fillStyle = '#241a3e';
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    H_.circle(ctx, 300 + Math.cos(a) * 38, 110 + Math.sin(a) * 38, i % 3 === 0 ? 3.5 : 2);
    ctx.fill();
  }
  // Hands: 3:00 normally, 4:00 when applied (difference).
  ctx.strokeStyle = '#241a3e';
  ctx.lineCap = 'round';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(300, 110);
  ctx.lineTo(300, 76);
  ctx.stroke();
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(300, 110);
  if (applied.has('clock-hands')) {
    ctx.lineTo(322, 130);
  } else {
    ctx.lineTo(332, 110);
  }
  ctx.stroke();
  H_.circle(ctx, 300, 110, 5);
  ctx.fill();
  // Tower windows.
  ctx.fillStyle = '#7a5a10';
  ctx.fillRect(268, 180, 18, 26);
  ctx.fillRect(314, 180, 18, 26);
  // Big gear on the wall (difference: 9 teeth, not 8).
  H_.gear(ctx, 120, 180, 34, applied.has('gear-teeth') ? 9 : 8, '#b08d3e');
  H_.gear(ctx, 168, 232, 20, 6, '#8a6d2f');
  // Fountain.
  ctx.fillStyle = '#9db8c9';
  H_.ellipse(ctx, 300, 330, 78, 20);
  ctx.fill();
  ctx.fillStyle = '#7fb3d5';
  H_.ellipse(ctx, 300, 326, 66, 14);
  ctx.fill();
  ctx.fillStyle = '#c9d6de';
  ctx.fillRect(296, 286, 8, 44);
  ctx.fillStyle = '#7fb3d5';
  // Water jets and drops (difference: two drops, not three).
  ctx.strokeStyle = '#a8d8f0';
  ctx.lineWidth = 4;
  for (const jx of [272, 328]) {
    ctx.beginPath();
    ctx.moveTo(300, 286);
    ctx.quadraticCurveTo(jx, 262, jx - 6, 300);
    ctx.stroke();
  }
  const drops = applied.has('fountain-drops')
    ? [[282, 250], [318, 250]]
    : [[282, 250], [300, 238], [318, 250]];
  for (const d of drops) {
    ctx.fillStyle = '#bfe3ff';
    H_.circle(ctx, d[0], d[1], 5);
    ctx.fill();
  }
  // Flower beds.
  function tulip(x, y, petal) {
    ctx.strokeStyle = '#3f7a2a';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x, y + 22);
    ctx.stroke();
    ctx.fillStyle = petal;
    ctx.beginPath();
    ctx.moveTo(x - 9, y);
    ctx.quadraticCurveTo(x - 9, y - 16, x, y - 8);
    ctx.quadraticCurveTo(x + 9, y - 16, x + 9, y);
    ctx.quadraticCurveTo(x, y + 6, x - 9, y);
    ctx.fill();
  }
  tulip(120, 440, '#e5484d');
  tulip(160, 452, '#f5a623');
  tulip(200, 438, '#e5484d');
  tulip(420, 448, '#f5a623');
  tulip(480, 420, applied.has('tulip-color') ? '#9b59d0' : '#e5484d');
  tulip(520, 452, '#e5484d');
  H_.flower(ctx, 240, 470, 12, '#ff7fa5', '#ffd23f');
  H_.flower(ctx, 380, 478, 12, '#ffffff', '#f5a623');
  // Bird on a branch (difference: missing when applied).
  ctx.strokeStyle = '#5a3a1a';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(480, 168);
  ctx.lineTo(560, 148);
  ctx.stroke();
  if (!applied.has('bird')) {
    ctx.fillStyle = '#4a90d9';
    H_.ellipse(ctx, 520, 138, 14, 10);
    ctx.fill();
    H_.circle(ctx, 530, 130, 6);
    ctx.fill();
    ctx.fillStyle = '#f5a623';
    ctx.beginPath();
    ctx.moveTo(536, 130);
    ctx.lineTo(542, 132);
    ctx.lineTo(536, 134);
    ctx.closePath();
    ctx.fill();
  }
  // Bee (difference: missing when applied).
  if (!applied.has('bee')) {
    ctx.fillStyle = '#ffd23f';
    H_.ellipse(ctx, 200, 260, 10, 7);
    ctx.fill();
    ctx.strokeStyle = '#241a3e';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(196, 254);
    ctx.lineTo(196, 266);
    ctx.moveTo(202, 254);
    ctx.lineTo(202, 266);
    ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    H_.ellipse(ctx, 196, 250, 6, 4);
    ctx.fill();
  }
  // Gate lamp (difference: lit when applied).
  ctx.fillStyle = '#3a3a4a';
  ctx.fillRect(56, 350, 8, 60);
  if (applied.has('gate-lamp')) {
    const g = ctx.createRadialGradient(60, 338, 2, 60, 338, 40);
    g.addColorStop(0, 'rgba(255, 210, 110, 0.6)');
    g.addColorStop(1, 'rgba(255, 210, 110, 0)');
    ctx.fillStyle = g;
    ctx.fillRect(20, 298, 80, 80);
    ctx.fillStyle = '#ffd23f';
  } else {
    ctx.fillStyle = '#8a8a9a';
  }
  H_.circle(ctx, 60, 338, 11);
  ctx.fill();
  ctx.fillStyle = '#3a3a4a';
  ctx.fillRect(52, 326, 16, 4);
  // Butterfly (difference: three wing spots, not two).
  ctx.save();
  ctx.translate(430, 240);
  ctx.fillStyle = '#ff7fa5';
  H_.ellipse(ctx, -10, -4, 12, 8);
  ctx.fill();
  H_.ellipse(ctx, 10, -4, 12, 8);
  ctx.fill();
  H_.ellipse(ctx, -9, 8, 9, 6);
  ctx.fill();
  H_.ellipse(ctx, 9, 8, 9, 6);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  const spots = applied.has('butterfly-spots')
    ? [[-12, -5], [-6, -2], [12, -5]]
    : [[-12, -5], [12, -5]];
  for (const s of spots) {
    H_.circle(ctx, s[0], s[1], 2.5);
    ctx.fill();
  }
  ctx.fillStyle = '#241a3e';
  H_.ellipse(ctx, 0, 0, 3, 9);
  ctx.fill();
  ctx.restore();
  // Stepping stones (difference: five stones, not four).
  ctx.fillStyle = '#b8b0a0';
  const stones = applied.has('path-stones')
    ? [[262, 500], [288, 512], [314, 500], [340, 512], [366, 500]]
    : [[262, 500], [292, 512], [322, 500], [352, 512]];
  for (const s of stones) {
    H_.ellipse(ctx, s[0], s[1], 16, 8);
    ctx.fill();
  }
  // Rose bush with thorns (difference: no thorns when applied).
  ctx.strokeStyle = '#3f7a2a';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(540, 480);
  ctx.quadraticCurveTo(536, 440, 542, 410);
  ctx.stroke();
  if (!applied.has('rose-thorns')) {
    ctx.strokeStyle = '#2b5a1a';
    ctx.lineWidth = 2;
    for (const ty of [470, 450, 432]) {
      ctx.beginPath();
      ctx.moveTo(538, ty);
      ctx.lineTo(530, ty + 4);
      ctx.stroke();
    }
  }
  H_.flower(ctx, 542, 402, 13, '#e5484d', '#ffd23f');
  H_.flower(ctx, 566, 428, 10, '#e5484d', '#ffd23f');
  ctx.fillStyle = '#3f7a2a';
  H_.ellipse(ctx, 528, 452, 10, 5);
  ctx.fill();
  H_.ellipse(ctx, 556, 452, 10, 5);
  ctx.fill();
};

// The level list: name, par time, differences with panel coordinates.
TW.SCENES = [
  {
    id: 'market',
    name: 'Lantern Market',
    subtitle: 'A night bazaar under paper lanterns',
    timeLimit: 150,
    paint: TW.paintLanternMarket,
    differences: [
      { id: 'moon-craters', x: 512, y: 66, r: 34 },
      { id: 'lantern-string', x: 300, y: 125, r: 26 },
      { id: 'awning-stripes', x: 300, y: 222, r: 30 },
      { id: 'fish-sign', x: 430, y: 330, r: 26 },
      { id: 'lantern-red', x: 120, y: 148, r: 28 },
      { id: 'window-lit', x: 88, y: 331, r: 26 },
      { id: 'cat-tail', x: 470, y: 300, r: 28 },
      { id: 'basket-fruit', x: 330, y: 420, r: 28 },
    ],
  },
  {
    id: 'reef',
    name: 'Coral Reef',
    subtitle: 'Down where the bubbles rise',
    timeLimit: 135,
    paint: TW.paintCoralReef,
    differences: [
      { id: 'fish-turn', x: 150, y: 150, r: 28 },
      { id: 'coral-color', x: 486, y: 440, r: 30 },
      { id: 'bubbles', x: 320, y: 205, r: 26 },
      { id: 'starfish', x: 92, y: 452, r: 24 },
      { id: 'chest-open', x: 452, y: 462, r: 30 },
      { id: 'octopus-eye', x: 521, y: 213, r: 26 },
      { id: 'shell-color', x: 230, y: 414, r: 26 },
      { id: 'seaweed', x: 58, y: 315, r: 30 },
      { id: 'crab-claw', x: 380, y: 480, r: 26 },
    ],
  },
  {
    id: 'garden',
    name: 'Clockwork Garden',
    subtitle: 'Gears, petals and one punctual tower',
    timeLimit: 120,
    paint: TW.paintClockworkGarden,
    differences: [
      { id: 'clock-hands', x: 300, y: 110, r: 40 },
      { id: 'gear-teeth', x: 120, y: 180, r: 34 },
      { id: 'fountain-drops', x: 300, y: 268, r: 30 },
      { id: 'tulip-color', x: 480, y: 420, r: 26 },
      { id: 'bird', x: 520, y: 140, r: 26 },
      { id: 'bee', x: 200, y: 260, r: 24 },
      { id: 'gate-lamp', x: 60, y: 338, r: 26 },
      { id: 'butterfly-spots', x: 430, y: 240, r: 26 },
      { id: 'path-stones', x: 340, y: 506, r: 28 },
      { id: 'rose-thorns', x: 540, y: 440, r: 26 },
    ],
  },
];
