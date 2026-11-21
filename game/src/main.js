// Bootstrap: build the game, start its render loop, and honour the
// screenshot modes (?shot=title|play|play2|end) that stage reproducible
// states for the entry's screenshots.
window.TW = window.TW || {};

(function bootstrapTwinWorlds() {
  const game = new TW.SpotDifferenceGame();
  window.TW.game = game;
  game.run();

  const params = new URLSearchParams(window.location.search);
  const shot = params.get('shot');
  const foundCount = parseInt(params.get('found') || '0', 10);

  // Mark the first N differences as found, as if the player just found them.
  function preFind(n) {
    const s = game.scene();
    for (let i = 0; i < Math.min(n, s.differences.length); i++) {
      game.found.add(s.differences[i].id);
    }
    game.combo = n;
    game.score = 0;
    for (let i = 0; i < n; i++) game.score += 100 + 10 * i;
    game.updateHud();
  }

  if (shot === 'play') {
    // Mid-play on level 1: three found, five still hiding, clock running.
    game.frozen = true;
    game.startLevel(0);
    preFind(foundCount || 3);
    game.timeLeft = 96;
    game.updateHud();
  } else if (shot === 'play2') {
    // Mid-play on level 2: four found, five still hiding.
    game.frozen = true;
    game.startLevel(1);
    preFind(foundCount || 4);
    game.timeLeft = 71;
    game.updateHud();
  } else if (shot === 'end') {
    // Level clear: every difference found, the clear card on top.
    game.frozen = true;
    game.startLevel(0);
    preFind(8);
    game.timeLeft = 84;
    game.completeLevel();
  } else if (shot === 'title') {
    // Title screen over the first scene.
    game.frozen = true;
  }

  // Signal the capture tool once a frame is on screen.
  requestAnimationFrame(function () {
    requestAnimationFrame(function () {
      window.__shotReady = true;
    });
  });
})();
