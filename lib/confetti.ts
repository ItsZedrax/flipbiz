"use client";

import confetti from "canvas-confetti";

/**
 * Big celebratory burst — used for the very first sale.
 */
export function celebrateFirstSale() {
  const colors = ["#6366f1", "#a855f7", "#ec4899", "#22d3ee", "#facc15"];
  const duration = 2500;
  const end = Date.now() + duration;

  // Side cannons.
  (function frame() {
    confetti({
      particleCount: 4,
      angle: 60,
      spread: 65,
      origin: { x: 0, y: 0.7 },
      colors,
    });
    confetti({
      particleCount: 4,
      angle: 120,
      spread: 65,
      origin: { x: 1, y: 0.7 },
      colors,
    });
    if (Date.now() < end) requestAnimationFrame(frame);
  })();

  // Center burst.
  confetti({
    particleCount: 80,
    spread: 90,
    origin: { y: 0.55 },
    colors,
    scalar: 1.1,
  });
}
