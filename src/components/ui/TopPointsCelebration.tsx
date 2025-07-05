
import React, { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { loadSlim } from "tsparticles-slim";
import Particles from "react-tsparticles";
import { Howl } from "howler";

// Sound for celebration
const celebrateSound = new Howl({
  src: ["/sounds/celebrate.mp3"],
  volume: 0.8,
});

interface TopPointsCelebrationProps {
  onComplete: () => void;
}

const TopPointsCelebration: React.FC<TopPointsCelebrationProps> = ({ onComplete }) => {
  const [showParticles, setShowParticles] = useState(false);
  const toastShown = useRef(false);

  useEffect(() => {
    if (!toastShown.current) {
      toastShown.current = true;

      // Play celebration sound
      celebrateSound.play();

      // Show toast message
      toast.success("🎉 Congratulations on your achievements!", {
        position: "top-right",
        autoClose: 4000,
      });

      // Show particles animation
      setShowParticles(true);

      // Hide particles after 5 seconds and call onComplete
      const timer = setTimeout(() => {
        setShowParticles(false);
        onComplete();
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [onComplete]);

  if (!showParticles) return null;

  return (
    <Particles
      id="tsparticles-celebration"
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

export default TopPointsCelebration;
