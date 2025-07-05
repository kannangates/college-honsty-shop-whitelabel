
import React, { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { loadSlim } from "tsparticles-slim";
import Particles from "react-tsparticles";
import { Howl } from "howler";

// Sound for rank 1 celebration
const celebrateSound = new Howl({
  src: ["/sounds/celebrate.mp3"],
  volume: 0.8,
});

// Sound for rank 2 and 3 celebration
const woohooSound = new Howl({
  src: ["/sounds/woo-hoo.mp3"],
  volume: 0.7,
});

interface RankCelebrationProps {
  rank: number;
}

const RankCelebration: React.FC<RankCelebrationProps> = ({ rank }) => {
  const [showParticles, setShowParticles] = useState(false);
  const toastShown = useRef(false);

  useEffect(() => {
    if ((rank === 1 || rank === 2 || rank === 3) && !toastShown.current) {
      toastShown.current = true;

      // Play sound based on rank
      if (rank === 1) {
        celebrateSound.play();
      } else {
        woohooSound.play();
      }

      // Show toast message
      toast.success(
        rank === 1
          ? "🎉 You're now Rank #1! Well done!"
          : `👏 Great job! You're Rank #${rank}!`,
        {
          position: "top-right",
          autoClose: 4000,
        }
      );

      // Show particles animation
      setShowParticles(true);

      // Hide particles after 5 seconds
      const timer = setTimeout(() => {
        setShowParticles(false);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [rank]);

  if (!showParticles) return null;

  return (
    <Particles
      id="tsparticles"
      init={loadSlim}
      options={{
        fullScreen: { enable: true, zIndex: 1000 },
        particles: {
          number: { value: 80 },
          size: { value: 4 },
          move: { enable: true, speed: 5 },
          color: { value: ["#FFD700", "#FF4500", "#4B0082"] },
          shape: { type: "circle" },
          opacity: { value: 0.8 },
        },
      }}
    />
  );
};

export default RankCelebration;
