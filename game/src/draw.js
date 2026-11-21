// Shared canvas drawing helpers for the scene painters.
window.TW = window.TW || {};

TW.drawHelpers = {
  roundRect: function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  },

  circle: function circle(ctx, x, y, r) {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
  },

  star: function star(ctx, x, y, outer, inner, points) {
    ctx.beginPath();
    for (let i = 0; i < points * 2; i++) {
      const r = i % 2 === 0 ? outer : inner;
      const a = (i * Math.PI) / points - Math.PI / 2;
      const px = x + Math.cos(a) * r;
      const py = y + Math.sin(a) * r;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
  },

  ellipse: function ellipse(ctx, x, y, rx, ry) {
    ctx.beginPath();
    ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  },

  // A paper lantern: round body, rib lines, top and bottom caps, glow when lit.
  lantern: function lantern(ctx, x, y, s, body, lit) {
    if (lit) {
      const g = ctx.createRadialGradient(x, y, s * 0.2, x, y, s * 1.9);
      g.addColorStop(0, 'rgba(255, 210, 110, 0.5)');
      g.addColorStop(1, 'rgba(255, 210, 110, 0)');
      ctx.fillStyle = g;
      ctx.fillRect(x - s * 2, y - s * 2, s * 4, s * 4);
    }
    ctx.fillStyle = body;
    TW.drawHelpers.ellipse(ctx, x, y, s, s * 1.12);
    ctx.fill();
    ctx.strokeStyle = 'rgba(90, 20, 20, 0.55)';
    ctx.lineWidth = 1.5;
    for (let i = -2; i <= 2; i++) {
      ctx.beginPath();
      ctx.ellipse(x, y, s * (1 - Math.abs(i) * 0.16), s * 1.12, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.fillStyle = '#c9a227';
    ctx.fillRect(x - s * 0.28, y - s * 1.22, s * 0.56, s * 0.22);
    ctx.fillRect(x - s * 0.28, y + s * 1.0, s * 0.56, s * 0.22);
  },

  // A simple fish, facing right (dir = 1) or left (dir = -1).
  fish: function fish(ctx, x, y, s, dir, body, belly) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(dir, 1);
    ctx.fillStyle = body;
    TW.drawHelpers.ellipse(ctx, 0, 0, s, s * 0.55);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-s * 0.85, 0);
    ctx.lineTo(-s * 1.45, -s * 0.6);
    ctx.lineTo(-s * 1.45, s * 0.6);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = belly;
    TW.drawHelpers.ellipse(ctx, s * 0.15, s * 0.18, s * 0.55, s * 0.28);
    ctx.fill();
    ctx.fillStyle = '#10202e';
    TW.drawHelpers.circle(ctx, s * 0.55, -s * 0.12, s * 0.11);
    ctx.fill();
    ctx.strokeStyle = 'rgba(16, 32, 46, 0.5)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, 0, s * 0.55, -0.9, 0.9);
    ctx.stroke();
    ctx.restore();
  },

  // A clockwork gear with a given tooth count.
  gear: function gear(ctx, x, y, r, teeth, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    for (let i = 0; i < teeth; i++) {
      const a0 = (i / teeth) * Math.PI * 2;
      const a1 = ((i + 0.45) / teeth) * Math.PI * 2;
      const a2 = ((i + 0.55) / teeth) * Math.PI * 2;
      const a3 = ((i + 1) / teeth) * Math.PI * 2;
      ctx.lineTo(x + Math.cos(a0) * r, y + Math.sin(a0) * r);
      ctx.lineTo(x + Math.cos(a1) * (r * 1.28), y + Math.sin(a1) * (r * 1.28));
      ctx.lineTo(x + Math.cos(a2) * (r * 1.28), y + Math.sin(a2) * (r * 1.28));
      ctx.lineTo(x + Math.cos(a3) * r, y + Math.sin(a3) * r);
    }
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#2b2118';
    TW.drawHelpers.circle(ctx, x, y, r * 0.34);
    ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.35)';
    ctx.lineWidth = 2;
    TW.drawHelpers.circle(ctx, x, y, r * 0.62);
    ctx.stroke();
  },

  // A five-petal flower.
  flower: function flower(ctx, x, y, s, petal, center) {
    ctx.fillStyle = petal;
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
      TW.drawHelpers.ellipse(
        ctx,
        x + Math.cos(a) * s * 0.55,
        y + Math.sin(a) * s * 0.55,
        s * 0.5,
        s * 0.5,
      );
      ctx.fill();
    }
    ctx.fillStyle = center;
    TW.drawHelpers.circle(ctx, x, y, s * 0.42);
    ctx.fill();
  },

  // A rising bubble.
  bubble: function bubble(ctx, x, y, r) {
    ctx.strokeStyle = 'rgba(255,255,255,0.75)';
    ctx.lineWidth = 1.5;
    TW.drawHelpers.circle(ctx, x, y, r);
    ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    TW.drawHelpers.circle(ctx, x - r * 0.35, y - r * 0.35, r * 0.22);
    ctx.fill();
  },
};
