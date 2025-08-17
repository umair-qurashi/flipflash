const baseEmojis = ['🍕', '🚀', '🎮', '🐶', '🎧', '🍔', '🐱', '⚽️', '🧠', '🍩', '🌈', '🦊'];
let cardsArray = [...baseEmojis, ...baseEmojis];
let gameGrid = [];
let flipped = [];
let moves = 0;
let matchedPairs = 0;
let timerInterval;
let seconds = 0;
let confettiInterval;
let isDark = true;
let isMuted = false;

const grid = document.getElementById('game-grid');
const movesText = document.getElementById('moves');
const timerText = document.getElementById('timer');
const winMessage = document.getElementById('win-message');
const finalStats = document.getElementById('final-stats');
const toggleBtn = document.getElementById('toggle-theme');
const bestMovesText = document.getElementById('best-moves');
const bestTimeText = document.getElementById('best-time');
const resetBestBtn = document.getElementById('reset-best');
const muteToggle = document.getElementById('mute-toggle');

// Sounds
const flipSound = new Audio('sounds/flip.wav');
const matchSound = new Audio('sounds/match.wav');
const winSound = new Audio('sounds/win.wav');

// Theme toggle
toggleBtn.addEventListener('click', () => {
  isDark = !isDark;
  document.body.classList.toggle('light', !isDark);
  toggleBtn.innerText = isDark ? '🌙 Dark Mode' : '☀️ Light Mode';
});

// Mute toggle
muteToggle.addEventListener('click', () => {
  isMuted = !isMuted;
  muteToggle.innerText = isMuted ? '🔇 Unmute' : '🔊 Mute';
});

// Reset best scores
resetBestBtn.addEventListener('click', () => {
  localStorage.removeItem('bestMoves');
  localStorage.removeItem('bestTime');
  bestMovesText.textContent = '🏅 Best Moves: --';
  bestTimeText.textContent = '⏱️ Best Time: --';
});

// Restart buttons
document.getElementById('restart').addEventListener('click', startGame);
document.getElementById('play-again').addEventListener('click', startGame);

// How to play popup
document.getElementById('close-how').addEventListener('click', () => {
  document.getElementById('how-to-play-popup').classList.add('hidden');
  startGame();
});

// Load best scores
function loadBestScores() {
  const bestMoves = localStorage.getItem('bestMoves');
  const bestTime = localStorage.getItem('bestTime');
  if (bestMoves) bestMovesText.textContent = `🏅 Best Moves: ${bestMoves}`;
  if (bestTime) bestTimeText.textContent = `⏱️ Best Time: ${bestTime}`;
}

// Start game
function startGame() {
  document.getElementById('overlay').classList.add('hidden');
  document.getElementById('confetti-canvas').classList.add('hidden');
  winMessage.classList.add('hidden');
  clearInterval(confettiInterval);
  clearInterval(timerInterval);

  gameGrid = shuffle([...cardsArray]);
  grid.innerHTML = '';
  flipped = [];
  moves = 0;
  matchedPairs = 0;
  seconds = 0;

  movesText.textContent = 'Moves: 0';
  timerText.textContent = 'Time: 00:00';

  timerInterval = setInterval(updateTimer, 1000);

  gameGrid.forEach((emoji, index) => {
    const card = document.createElement('div');
    card.classList.add('card');
    card.dataset.emoji = emoji;
    card.dataset.index = index;

    card.innerHTML = `
      <div class="card-inner">
        <div class="card-front"></div>
        <div class="card-back">${emoji}</div>
      </div>
    `;

    card.addEventListener('click', flipCard);
    grid.appendChild(card);
  });
}

function flipCard() {
  if (flipped.length === 2 || this.classList.contains('flipped') || this.classList.contains('matched')) return;

  if (!isMuted) {
    flipSound.currentTime = 0;
    flipSound.play();
  }

  this.classList.add('flipped');
  flipped.push(this);

  if (flipped.length === 2) {
    moves++;
    movesText.textContent = `Moves: ${moves}`;
    const [first, second] = flipped;

    if (first.dataset.emoji === second.dataset.emoji) {
      if (!isMuted) {
        matchSound.currentTime = 0;
        matchSound.play();
      }

      first.classList.add('matched');
      second.classList.add('matched');
      flipped = [];
      matchedPairs++;

      if (matchedPairs === baseEmojis.length) {
        gameWon();
      }
    } else {
      setTimeout(() => {
        first.classList.remove('flipped');
        second.classList.remove('flipped');
        flipped = [];
      }, 800);
    }
  }
}

function updateTimer() {
  seconds++;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  timerText.textContent = `Time: ${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function gameWon() {
  clearInterval(timerInterval);
  document.getElementById('overlay').classList.remove('hidden');
  winMessage.classList.remove('hidden');
  finalStats.innerHTML = `🎉 Moves: ${moves}<br>⏱️ ${timerText.textContent}`;

  if (!isMuted) {
    winSound.currentTime = 0;
    winSound.play();
  }

  updateBestScores();
  launchConfetti();
}

function updateBestScores() {
  const bestMoves = parseInt(localStorage.getItem('bestMoves')) || Infinity;
  const bestTime = parseInt(localStorage.getItem('bestTime')) || Infinity;

  if (moves < bestMoves) {
    localStorage.setItem('bestMoves', moves);
    bestMovesText.textContent = `🏅 Best Moves: ${moves}`;
  }

  if (seconds < bestTime) {
    localStorage.setItem('bestTime', seconds);
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    bestTimeText.textContent = `⏱️ Best Time: ${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function launchConfetti() {
  const confetti = document.getElementById('confetti-canvas');
  confetti.classList.remove('hidden');
  const ctx = confetti.getContext('2d');
  confetti.width = window.innerWidth;
  confetti.height = window.innerHeight;

  const pieces = [];
  const colors = ['#ff595e', '#ffca3a', '#8ac926', '#1982c4', '#6a4c93'];

  for (let i = 0; i < 150; i++) {
    pieces.push({
      x: Math.random() * confetti.width,
      y: Math.random() * confetti.height - confetti.height,
      radius: Math.random() * 6 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      speedY: Math.random() * 3 + 2,
      speedX: Math.random() * 2 - 1,
    });
  }

  function draw() {
    ctx.clearRect(0, 0, confetti.width, confetti.height);
    pieces.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.fill();
      p.y += p.speedY;
      p.x += p.speedX;
      if (p.y > confetti.height) p.y = 0;
    });
  }

  confettiInterval = setInterval(draw, 30);
}

// Show how-to-play popup on first load
window.addEventListener('load', () => {
  document.getElementById('how-to-play-popup').classList.remove('hidden');
  loadBestScores();
});
