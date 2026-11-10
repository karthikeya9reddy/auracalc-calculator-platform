import Lenis from './vendor/lenis.mjs';

// Keep wheel scrolling fluid while preserving native touch, keyboard, and reduced-motion behavior.
// Dialogs keep their own native scroll so long forms and history remain easy to use.
const scroll = new Lenis({
  autoRaf: true,
  duration: 1.2,
  anchors: true,
  smoothWheel: true,
  respectReducedMotion: true,
  prevent: element => Boolean(element?.closest?.('[data-lenis-prevent]')),
});

