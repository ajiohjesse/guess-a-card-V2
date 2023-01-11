const soundBtn = document.getElementById('sound-btn')
const soundOn = document.querySelector('.sound-on')
const soundOff = document.querySelector('.sound-off')

soundBtn.addEventListener('click', () => {
  soundOff.classList.toggle('hidden')
  soundOn.classList.toggle('hidden')
})
