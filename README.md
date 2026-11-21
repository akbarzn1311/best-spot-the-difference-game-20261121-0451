[![make.fun · best-spot-the-difference-game-20261121-0451](https://make.fun/badge/best-spot-the-difference-game-20261121-0451.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)
[![rank](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/akbarzn1311/best-spot-the-difference-game-20261121-0451/rank.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)
[![reward](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/akbarzn1311/best-spot-the-difference-game-20261121-0451/reward.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)

# Twin Worlds — Spot the Difference

A complete spot-the-difference game that runs offline in a desktop browser.
Two near-identical pictures hang side by side; click every difference before
the clock runs out. Three original scenes are drawn procedurally in code —
no borrowed art, no network requests:

1. **Lantern Market** — a night bazaar under paper lanterns (8 differences, 150s)
2. **Coral Reef** — down where the bubbles rise (9 differences, 135s)
3. **Clockwork Garden** — gears, petals and one punctual tower (10 differences, 120s)

## How to play

- Click a difference in either panel. A green circle and check mark it.
- A wrong click costs 15 points and 3 seconds, and breaks your combo.
- **H** (or the HINT button) reveals one difference: −50 points, 3 hints per
  level, 12s cooldown. **M** toggles sound, **R** restarts the level,
  **1–3** jump to a level, **Enter** starts / continues.
- Finding every difference clears the level with a time bonus. Clear all
  three worlds to win. Best score is kept in localStorage.

## Quickstart

```sh
node serve.ts        # serves game/ at http://localhost:8080
```

Open http://localhost:8080 in desktop Chrome and play. The game is plain
static files under `game/` — no build step, no dependencies.

To hand the entry in (what the grader runs):

```sh
MAKEFUN_OUTPUT_DIR=out node main.ts   # writes out/game, out/screenshots, out/dossier.json
```

## Layout

- `main.ts` — entry program: copies `game/` and `screenshots/` to `/output`
  and writes `dossier.json` with the kit's `buildDossier`.
- `vendor/makefun-game.ts` — the kit's dossier library, copied byte-identical.
- `game/index.html` — page shell, HUD and the two panels.
- `game/styles.css` — all styling.
- `game/src/rng.js` — seeded random numbers (every scene draws identically).
- `game/src/draw.js` — shared canvas helpers (lanterns, fish, gears, flowers).
- `game/src/scenes.js` — the three original scenes and their differences.
- `game/src/audio.js` — synthesized WebAudio sound effects, no audio files.
- `game/src/engine.js` — game state, clicks, timer, score, combo, hints.
- `game/src/main.js` — bootstrap and the `?shot=` screenshot modes.
- `screenshots/` — 3–4 real renders of the game, first by name is the cover.

## Screenshot modes

For reproducible screenshots the game accepts `?shot=`:

- `?shot=title` — title screen
- `?shot=play` — level 1 mid-play, 3 of 8 found
- `?shot=play2` — level 2 mid-play, 4 of 9 found
- `?shot=end` — level clear card

## License

MIT — see `LICENSE`.
