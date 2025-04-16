// --- Configuration ---
const BIRTHDAY_DATE = new Date('2025-04-16T21:18:00');
const CORRECT_PIN = '2003';
const PHOTO_FILENAMES = [
    'image(1).jpg',
    'image(2).jpg',
    'image(3).jpg',
    'image(4).jpg',
    'image(5).jpg',
    'image(6).jpg',
    'image(7).jpg',
    'image(8).jpg'
];
const IMAGE_PATH = '';
const CARD_BACK_IMAGE = 'card back.jpg';

// --- DOM Elements ---
const daysEl = document.getElementById('days');
const hoursEl = document.getElementById('hours');
const minutesEl = document.getElementById('minutes');
const secondsEl = document.getElementById('seconds');
const countdownTimerEl = document.getElementById('countdown-timer');
const birthdayMessageEl = document.getElementById('birthday-message');
const fireworksContainer = document.getElementById('fireworks-container');
const pinInput = document.getElementById('pin-input');
const unlockButton = document.getElementById('unlock-button');
const vaultLock = document.getElementById('vault-lock');
const vaultContent = document.getElementById('vault-content');
const vaultError = document.getElementById('vault-error');
const memoryGameGrid = document.querySelector('.memory-game-grid');
const scoreEl = document.getElementById('score');
const resetGameButton = document.getElementById('reset-game-button');

// --- Countdown Timer ---
let countdownInterval;

function updateCountdown() {
    const now = new Date();
    const diff = BIRTHDAY_DATE - now;

    if (diff <= 0) {
        clearInterval(countdownInterval);
        countdownTimerEl.style.display = 'none';
        birthdayMessageEl.style.display = 'block';
        triggerFireworks();
        return;
    }

    const d = Math.floor(diff / (1000 * 60 * 60 * 24));
    const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const s = Math.floor((diff % (1000 * 60)) / 1000);

    daysEl.textContent = String(d).padStart(2, '0');
    hoursEl.textContent = String(h).padStart(2, '0');
    minutesEl.textContent = String(m).padStart(2, '0');
    secondsEl.textContent = String(s).padStart(2, '0');
}

function triggerFireworks() {
    fireworksContainer.classList.add('active');
    for (let i = 0; i < 30; i++) {
        setTimeout(() => createFireworkParticle(), Math.random() * 2000);
    }
    setTimeout(() => fireworksContainer.classList.remove('active'), 10000);
}

function createFireworkParticle() {
    const particle = document.createElement('div');
    particle.className = 'firework';

    const startX = 40 + Math.random() * 20;
    const startY = 10 + Math.random() * 20;

    particle.style.left = `${startX}%`;
    particle.style.top = `${startY}%`;

    const angle = Math.random() * Math.PI * 2;
    const distance = 50 + Math.random() * 150;
    const endX = Math.cos(angle) * distance;
    const endY = Math.sin(angle) * distance - 30;

    particle.style.setProperty('--x', `${endX}px`);
    particle.style.setProperty('--y', `${endY}px`);

    const colors = ['gold', 'red', 'lime', 'blue', 'orange', 'magenta', 'cyan'];
    const color = colors[Math.floor(Math.random() * colors.length)];
    particle.style.backgroundColor = color;
    particle.style.boxShadow = `0 0 5px ${color}, 0 0 10px ${color}`;

    fireworksContainer.appendChild(particle);

    particle.addEventListener('animationend', () => {
        particle.remove();
    });
}

// --- Password Vault ---
if (unlockButton) {
    unlockButton.addEventListener('click', () => {
        if (pinInput.value === CORRECT_PIN) {
            vaultLock.style.display = 'none';
            vaultContent.style.display = 'block';
            vaultError.style.display = 'none';
        } else {
            vaultError.style.display = 'block';
            pinInput.value = '';
            pinInput.style.animation = 'shake 0.5s ease';
            setTimeout(() => pinInput.style.animation = '', 500);
        }
    });
}

// --- Memory Match Game ---
let cards = [];
let hasFlippedCard = false;
let lockBoard = false;
let firstCard, secondCard;
let score = 0;
let matchesFound = 0;

function createMemoryBoard() {
    memoryGameGrid.innerHTML = '';
    matchesFound = 0;
    score = 0;
    updateScore();
    hasFlippedCard = false;
    lockBoard = false;
    firstCard = null;
    secondCard = null;
    cards = [];

    const cardData = [];
    PHOTO_FILENAMES.forEach((filename, index) => {
        const matchId = `photo${index + 1}`;
        cardData.push({ id: matchId, imgSrc: `${IMAGE_PATH}${filename}`, alt: `Photo ${index + 1}` });
        cardData.push({ id: matchId, imgSrc: `${IMAGE_PATH}${filename}`, alt: `Photo ${index + 1}` });
    });

    shuffleArray(cardData);

    cardData.forEach(data => {
        const cardElement = document.createElement('div');
        cardElement.classList.add('memory-card');
        cardElement.dataset.matchId = data.id;

        cardElement.innerHTML = `
            <img class="front-face" src="${data.imgSrc}" alt="${data.alt}">
            <img class="back-face" src="${IMAGE_PATH}${CARD_BACK_IMAGE}" alt="Card Back">
        `;

        cardElement.addEventListener('click', flipCard);
        memoryGameGrid.appendChild(cardElement);
        cards.push(cardElement);
    });
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function flipCard() {
    if (lockBoard) return;
    if (this === firstCard) return;

    this.classList.add('flip');
    updateScore(true);

    if (!hasFlippedCard) {
        hasFlippedCard = true;
        firstCard = this;
        return;
    }

    secondCard = this;
    checkForMatch();
}

function checkForMatch() {
    let isMatch = firstCard.dataset.matchId === secondCard.dataset.matchId;

    if (isMatch) {
        disableCards();
    } else {
        unflipCards();
    }
}

function disableCards() {
    firstCard.removeEventListener('click', flipCard);
    secondCard.removeEventListener('click', flipCard);
    firstCard.classList.add('matched');
    secondCard.classList.add('matched');

    matchesFound++;
    if (matchesFound === PHOTO_FILENAMES.length / 2) {
        setTimeout(() => {
            alert(`Congratulations! You found all ${PHOTO_FILENAMES.length / 2} matches in ${score} flips!`);
        }, 500);
    }

    resetBoard();
}

function unflipCards() {
    lockBoard = true;
    setTimeout(() => {
        firstCard.classList.remove('flip');
        secondCard.classList.remove('flip');
        resetBoard();
    }, 1200);
}

function resetBoard() {
    [hasFlippedCard, lockBoard] = [false, false];
    [firstCard, secondCard] = [null, null];
}

function updateScore(increment = false) {
    if (increment) score++;
    scoreEl.textContent = score;
}

// --- Initialization ---
function init() {
    updateCountdown();
    countdownInterval = setInterval(updateCountdown, 1000);
    createMemoryBoard();
    if (resetGameButton) {
        resetGameButton.addEventListener('click', createMemoryBoard);
    }
}

// Run initialization when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', init);