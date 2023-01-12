import { randomizeArray, range, sampleOne } from './utils.js'
import {
  correctCardMessages,
  firstCardMessages,
  gameLostMessages,
  wrongCardMessages,
} from './lib.js'

//*****************************************
// INTERFACE
//*****************************************

// sound toggle button
const soundBtn = document.getElementById('sound-btn')

//dashboard
const screen = document.getElementById('game-message')
const completedEl = document.getElementById('completed')
const sneaksEl = document.getElementById('sneaks')
const attemptsEl = document.getElementById('attempts')

//buttons
const resetBtn = document.getElementById('game-reset')
const sneakBtn = document.getElementById('game-sneak')
const showBtn = document.getElementById('game-show')

//cards
const cardsEl = document.getElementById('game-cards')

//*****************************************
// SOUND EFFECTS
//*****************************************
const correctCardSND = new Audio('../assets/audio/correct-card.mp3')
const wrongCardSND = new Audio('../assets/audio/wrong-card.mp3')
const firstCardSND = new Audio('../assets/audio/first-card.mp3')
const gameLostSND = new Audio('../assets/audio/game-lost.mp3')
const gamePlayingSND = new Audio('../assets/audio/game-playing.mp3')
const sneakSND = new Audio('../assets/audio/peak.mp3')
const showCardSND = new Audio('../assets/audio/show-cards.mp3')
const winSND = new Audio('../assets/audio/win.mp3')

gamePlayingSND.volume = 1
correctCardSND.volume = 0.25
wrongCardSND.volume = 0.1
firstCardSND.volume = 0.25
gameLostSND.volume = 0.2
sneakSND.volume = 0.25
showCardSND.volume = 0.2
winSND.volume = 0.2

//*****************************************
// EVENT LISTENERS
//*****************************************
document.addEventListener('DOMContentLoaded', resetGame)
resetBtn.addEventListener('click', resetGame)
sneakBtn.addEventListener('click', sneak)
showBtn.addEventListener('click', endGame)
soundBtn.addEventListener('click', toggleSound)

//*****************************************
// VARIABLES
//*****************************************
const DEFAULT_SNEAKS = 2
const DEFAULT_ATTEMPTS = 15

let gameLost = false
let isPlaying = false
let clickFirstCard = false

let openedCards = []
let sneaks = DEFAULT_SNEAKS
let attempts = DEFAULT_ATTEMPTS

let firstCard = null
let firstCardIndex = null

let secondCard = null
let secondCardIndex = null

// Id for setTimout function on game screen
let screenTimeout = null

let sneakTime = 2000
let cardsAreOpen = false

//get sound preference from local storage
let shouldPlaySound = getShouldPlaySound()

//*****************************************
// FUNCTIONS
//*****************************************

function renderGame(e) {
  if (gameLost) return

  const target = e.target
  const targetId = target.dataset.id
  const targetIndex = target.dataset.index

  // prevent game-cards wrapper from triggering game
  if (target.id === 'game-cards') return

  isPlaying = true
  playGameMusic()

  if (!targetId) {
    return brieflyRenderScreen('Card is already open.')
  }

  //first selection
  if (!clickFirstCard) {
    clickFirstCard = true
    firstCard = targetId
    firstCardIndex = targetIndex

    playSound(firstCardSND)
    showCard(target)
    renderScreen(sampleOne(firstCardMessages))

    return
  }

  //second selection
  secondCard = targetId
  secondCardIndex = targetIndex

  /**
   * check if;
   * second card is EXACTLY the same as first
   * meaning the user clicked same card
   * twice instead of clicking the pair
   */

  if (secondCardIndex === firstCardIndex) {
    return brieflyRenderScreen('Card is already open.')
  }

  // second selection doesn't match first
  if (firstCard !== secondCard) {
    brieflyShowCard(target)
    renderScreen(sampleOne(wrongCardMessages))

    playSound(wrongCardSND)
    reduceAttempts()
    renderDashBoard()

    return
  }

  // second selection matches first
  showCard(target)
  renderScreen(sampleOne(correctCardMessages))
  playSound(correctCardSND)

  openedCards.push(firstCard)
  clickFirstCard = false

  renderDashBoard()

  //game won if all cards are opened
  if (openedCards.length === 8) gameWon()
}

function resetGame() {
  gameLost = false
  isPlaying = false
  cardsAreOpen = false

  renderCards()
  resetScreen()
  resetDashboard()
  addCardEvent()
  enableSneakBtn()
  hideAllCards()
  stopGameMusic()
}

function playGameMusic() {
  if (shouldPlaySound) {
    gamePlayingSND.loop = true
    gamePlayingSND.play()
  }
}

function stopGameMusic() {
  gamePlayingSND.pause()
  gamePlayingSND.currentTime = 0
}

function playSound(sound) {
  if (shouldPlaySound) {
    sound.currentTime = 0
    sound.play()
  }
}

function toggleSound() {
  shouldPlaySound = !shouldPlaySound
  localStorage.setItem('game-sound', shouldPlaySound)
  stopGameMusic()

  if (isPlaying) {
    playGameMusic()
  }
}

function getShouldPlaySound() {
  const userPreference = localStorage.getItem('game-sound')

  if (userPreference === null) {
    return true
  }

  return JSON.parse(userPreference)
}

function renderCards() {
  //array of numbers from 1-8
  const iconList = range(1, 9)

  /** randomize icon list on each render,
   *  duplicate each array item to get icon pairs.
   */
  const HTMLString = randomizeArray(iconList, 2)
    .map((iconNumber, index) => {
      return `<div class="game-card" data-id="${iconNumber}" data-index="${index}">
<div class="game-card-image">
<img src="./assets/icons/${iconNumber}.svg" alt="${iconNumber}" />
</div>
</div>`
    })
    .join(' ')

  cardsEl.innerHTML = HTMLString
}

function resetDashboard() {
  openedCards = []
  sneaks = DEFAULT_SNEAKS
  attempts = DEFAULT_ATTEMPTS
  clickFirstCard = false

  renderDashBoard()
}

function renderDashBoard() {
  completedEl.textContent = openedCards.length
  sneaksEl.textContent = sneaks
  attemptsEl.textContent = attempts
}

function showCard(target) {
  target.classList.add('open')
}

function showAllCards() {
  cardsEl.classList.add('open')
}

function hideCard(target) {
  target.classList.remove('open')
}

function hideAllCards() {
  cardsEl.classList.remove('open')
}

function brieflyShowCard(target) {
  showCard(target)

  setTimeout(() => {
    hideCard(target)
  }, 800)
}

function brieflyShowAllCards() {
  showAllCards()

  setTimeout(() => {
    hideAllCards()
  }, sneakTime)
}

function resetScreen() {
  screen.textContent = `Select a card and guess the 
  position of it's matching pair. Click on any card to 
  start the game!`
}

function renderScreen(message) {
  // if timeout is already running, cancel it.
  if (screenTimeout) clearTimeout(screenTimeout)

  screen.textContent = message
}

function brieflyRenderScreen(message) {
  screen.textContent = message

  // if timeout is already running, cancel it.
  if (screenTimeout) clearTimeout(screenTimeout)

  screenTimeout = setTimeout(() => {
    screen.textContent = ''
  }, 1200)
}

function reduceAttempts() {
  attempts--
  if (attempts <= 0) {
    attempts = 0

    gameFailed()
  }
}

function addCardEvent() {
  cardsEl.addEventListener('click', renderGame)
}

function removeCardEvent() {
  cardsEl.removeEventListener('click', renderGame)
}

function breiflyRemoveCardEvent() {
 removeCardEvent()

  setTimeout(() => {
    addCardEvent()
  }, sneakTime)
}



function disableSneakBtn() {
  sneakBtn.setAttribute('disabled', 'true')
}

function enableSneakBtn() {
  sneakBtn.removeAttribute('disabled')
}

function brieflyDisableSneakBtn() {
  disableSneakBtn()

  setTimeout(() => {
    enableSneakBtn()
  }, sneakTime)
}

function brieflydisableShowBtn() {
  showBtn.setAttribute('disabled', 'true')

  setTimeout(() => {
    showBtn.removeAttribute('disabled')
  }, sneakTime)
}

function sneak() {
  sneaks--

  if (sneaks >= 0) {
    renderDashBoard()
    brieflyShowAllCards()
    brieflyDisableSneakBtn()
    brieflydisableShowBtn()
    breiflyRemoveCardEvent()
    playSound(sneakSND)
    return
  }

  sneaks = 0
  renderDashBoard()
  brieflyRenderScreen('You have no sneaks left.')
}

function endGame() {
  showAllCards()
  removeCardEvent()
  disableSneakBtn()
  renderScreen('Thanks for Playing. Reset the game to play again.')
  stopGameMusic()

  if (!cardsAreOpen) playSound(showCardSND)
  cardsAreOpen = true
  isPlaying = false
}

function gameFailed() {
  gameLost = true
  isPlaying = false
  cardsAreOpen = true

  renderScreen(sampleOne(gameLostMessages))
  showAllCards()
  removeCardEvent()
  disableSneakBtn()
  stopGameMusic()
  playSound(gameLostSND)
}

function gameWon() {
  cardsAreOpen = true

  stopGameMusic()
  playSound(winSND)
  renderScreen('Congrats! Game won. You did a nice job.')
  disableSneakBtn()
  removeCardEvent()
}
