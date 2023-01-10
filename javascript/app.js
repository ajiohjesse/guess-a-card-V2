import { randomizeArray, range, sampleOne } from '../javascript/utils.js'
import {
  correctCardMessages,
  firstCardMessages,
  gameLostMessages,
  wrongCardMessages,
} from './lib.js'

//*****************************************
// INTERFACE
//*****************************************

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
// EVENT LISTENERS
//*****************************************
document.addEventListener('DOMContentLoaded', resetGame)
resetBtn.addEventListener('click', resetGame)
sneakBtn.addEventListener('click', sneak)
showBtn.addEventListener('click', endGame)

//*****************************************
// VARIABLES
//*****************************************

let gameLost = false
let clickFirstCard = false
let openedCards = []
let sneaks = 3
let attempts = 10
let firstCard = null
let secondCard = null
let screenTimeout = null
let sneakTime = 2000

//*****************************************
// FUNCTIONS
//*****************************************

function renderGame(e) {
  if (gameLost) return

  const target = e.target
  const targetId = target.dataset.id

  if (target.id === 'game-cards') return
  if (!targetId) return brieflyRenderScreen('Card is already open.')

  //first selection
  if (!clickFirstCard) {
    clickFirstCard = true
    firstCard = targetId

    showCard(target)
    renderScreen(sampleOne(firstCardMessages))
    return
  }

  //second selection
  secondCard = targetId

  // second selection doesn't match first
  if (firstCard !== secondCard) {
    brieflyShowCard(target)
    renderScreen(sampleOne(wrongCardMessages))

    reduceAttempts()
    renderDashBoard()

    return
  }

  // second selection matches first
  showCard(target)
  renderScreen(sampleOne(correctCardMessages))
  openedCards.push(firstCard)
  clickFirstCard = false

  renderDashBoard()
}

function resetGame() {
  gameLost = false
  renderCards()
  resetScreen()
  resetDashboard()
  addCardEvent()
  enableSneakBtn()
  hideAllCards()
}

function renderCards() {
  //array of numbers from 1-8
  const iconList = range(1, 9)

  /** randomize icon list on each render,
   *  duplicate each array item to get icon pairs.
   */
  const HTMLString = randomizeArray(iconList, 2)
    .map((iconNumber) => {
      return `<div class="game-card" data-id="${iconNumber}">
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
  sneaks = 3
  attempts = 10
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
  screen.textContent = `How quickly can you memorize 
  the position of the cards? Click on any card to 
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

function brieflyDisableSneakBtn() {
  sneakBtn.setAttribute('disabled', 'true')

  setTimeout(() => {
    sneakBtn.removeAttribute('disabled')
  }, sneakTime)
}

function disableSneakBtn() {
  sneakBtn.setAttribute('disabled', 'true')
}

function enableSneakBtn() {
  sneakBtn.removeAttribute('disabled')
}

function sneak() {
  sneaks--

  if (sneaks >= 0) {
    renderDashBoard()
    brieflyShowAllCards()
    brieflyDisableSneakBtn()
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
}

function gameFailed() {
  gameLost = true
  renderScreen(sampleOne(gameLostMessages))
  showAllCards()
  removeCardEvent()
  disableSneakBtn()
}
