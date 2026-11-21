// Seeded random numbers — every scene draws the same way on every load,
// so a screenshot can be reproduced exactly from its level and seed.
window.TW = window.TW || {};

TW.mulberry32 = function mulberry32(seed) {
  let a = seed >>> 0;
  return function nextRandom() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

TW.makeRng = function makeRng(seedString) {
  let h = 2166136261;
  for (let i = 0; i < seedString.length; i++) {
    h ^= seedString.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  const next = TW.mulberry32(h);
  return {
    next: next,
    range: function range(lo, hi) {
      return lo + next() * (hi - lo);
    },
    int: function int(lo, hi) {
      return Math.floor(lo + next() * (hi - lo + 1));
    },
    pick: function pick(list) {
      return list[Math.floor(next() * list.length)];
    },
  };
};
