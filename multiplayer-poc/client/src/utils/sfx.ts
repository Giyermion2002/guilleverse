const sounds = {
  click: new Audio('https://www.soundjay.com/buttons/sounds/button-16.mp3'),
  join: new Audio('https://www.soundjay.com/buttons/sounds/button-09.mp3'),
  lightning: new Audio('https://www.soundjay.com/nature/sounds/thunder-01.mp3'),
  dice: new Audio('https://www.soundjay.com/misc/sounds/dice-roll-1.mp3')
};

export const playSFX = (sound: keyof typeof sounds) => {
  try {
    const audio = sounds[sound];
    if (audio) {
      audio.currentTime = 0;
      audio.play().catch(e => console.warn(`SFX ${sound} blocked:`, e));
    }
  } catch (err) {
    console.error('SFX Error:', err);
  }
};
