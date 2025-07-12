import { Howl } from "howler"

// Lazy load audio files only when needed
let celebrateSound: Howl | null = null;
let wooHooSound: Howl | null = null;

const loadCelebrateSound = () => {
  if (!celebrateSound) {
    celebrateSound = new Howl({
      src: ["/sounds/celebrate.mp3"],
      volume: 0.7,
      preload: false, // Don't preload to avoid blocking
    });
  }
  return celebrateSound;
};

const loadWooHooSound = () => {
  if (!wooHooSound) {
    wooHooSound = new Howl({
      src: ["/sounds/woo-hoo.mp3"],
      volume: 0.7,
      preload: false, // Don't preload to avoid blocking
    });
  }
  return wooHooSound;
};

export const playCelebrateSound = () => {
  const sound = loadCelebrateSound();
  sound.play();
};

export const playWooHooSound = () => {
  const sound = loadWooHooSound();
  sound.play();
};

// Preload sounds only when user interacts (optional)
export const preloadSounds = () => {
  // Only preload if user has interacted with the page
  if (document.visibilityState === 'visible') {
    loadCelebrateSound();
    loadWooHooSound();
  }
};
