import { Howl } from "howler"

const celebrateSound = new Howl({
  src: ["/sounds/celebrate.mp3"],
  volume: 0.7,
})

export const playCelebrateSound = () => {
  celebrateSound.play()
}
