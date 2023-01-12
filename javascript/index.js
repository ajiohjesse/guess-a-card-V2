const soundBtn = document.getElementById('sound-btn')
const soundOn = document.querySelector('.sound-on')
const soundOff = document.querySelector('.sound-off')

document.addEventListener('DOMContentLoaded', () => {
  if (getShouldPlaySound()) {
    soundOff.classList.add('hidden')
    soundOn.classList.remove('hidden')
  } else {
    soundOff.classList.remove('hidden')
    soundOn.classList.add('hidden')
  }
})

soundBtn.addEventListener('click', () => {
  soundOff.classList.toggle('hidden')
  soundOn.classList.toggle('hidden')
})

function getShouldPlaySound() {
  const userPreference = localStorage.getItem('game-sound')

  if (userPreference === null) {
    return true
  }

  return JSON.parse(userPreference)
}
