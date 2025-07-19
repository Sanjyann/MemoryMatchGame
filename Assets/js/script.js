// DOM Elements
const gameBoard = document.getElementById('game-board');
const movesCountSpan = document.getElementById('moves-count');
const timerSpan = document.getElementById('timer');
const bestTimeSpan = document.getElementById('best-time');
const hintsLeftSpan = document.getElementById('hints-left');
const restartBtn = document.getElementById('restart-btn');
const hintBtn = document.getElementById('hint-btn');
const playAgainBtn = document.getElementById('play-again-btn');
const themeToggleBtn = document.getElementById('theme-toggle-btn');
const themeSelector = document.getElementById('theme-selector');
const winModal = new bootstrap.Modal(document.getElementById('winModal'));

// Game State
let firstCard = null, secondCard = null;
let lockBoard = false, timerStarted = false;
let moves = 0, seconds = 0, matchedPairs = 0, hintsLeft = 3;
let timerInterval;
let currentDifficulty, currentTheme;
let cards = [];
let currentFocusIndex = 0;

// Sounds
const flipSound = new Tone.Synth({ oscillator: { type: 'sine' }, envelope: { attack: 0.005, decay: 0.1, sustain: 0.3, release: 1 } }).toDestination();
const matchSound = new Tone.Synth({ oscillator: { type: 'triangle' }, envelope: { attack: 0.005, decay: 0.2, sustain: 0.1, release: 0.5 } }).toDestination();
const winSound = new Tone.PluckSynth().toDestination();
const hintSound = new Tone.Synth({ oscillator: { type: 'sawtooth' }, envelope: { attack: 0.01, decay: 0.1, sustain: 0.1, release: 0.2 } }).toDestination();

// Data
const themes = {
    animals: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯'],
    food: ['🍎', '🍌', '🍇', '🍓', '🍉', '🍕', '🍔', '🍟', '🍩', '🍪'],
    sports: ['⚽️', '🏀', '🏈', '⚾️', '🎾', '🏐', '🏉', '🎱', '🏓', '🏸'],
    travel: ['✈️', '🚂', '🚀', '🚁', '⛵️', '🚗', '�', '🗿', '🗽', '🗼'],
    flags: ['🇺🇸', '🇬🇧', '🇨🇦', '🇯🇵', '🇩🇪', '🇫🇷', '🇮🇹', '🇧🇷', '🇦🇺', '🇮🇳']
};
const difficultySettings = {
    easy: { pairs: 6, gridClass: 'easy-grid', cols: 4 },
    medium: { pairs: 8, gridClass: 'medium-grid', cols: 4 },
    hard: { pairs: 10, gridClass: 'hard-grid', cols: 5 }
};

// --- GAME LOGIC ---
function startGame() {
    currentDifficulty = document.querySelector('input[name="difficulty"]:checked').value;
    currentTheme = themeSelector.value;

    moves = 0;
    seconds = 0;
    matchedPairs = 0;
    hintsLeft = 3;
    firstCard = null;
    secondCard = null;
    lockBoard = false;
    timerStarted = false;

    movesCountSpan.textContent = moves;
    timerSpan.textContent = '0s';
    hintsLeftSpan.textContent = hintsLeft;
    hintBtn.disabled = false;

    clearInterval(timerInterval);
    timerInterval = null;

    gameBoard.className = 'game-board';
    gameBoard.classList.add(difficultySettings[currentDifficulty].gridClass);
    updateBestTimeDisplay();

    const numPairs = difficultySettings[currentDifficulty].pairs;
    const emojiSet = themes[currentTheme].slice(0, numPairs);
    const gameCardsData = [...emojiSet, ...emojiSet].sort(() => 0.5 - Math.random());

    gameBoard.innerHTML = '';
    cards = [];
    gameCardsData.forEach((emoji, index) => {
        const cardElement = createCard(emoji, index);
        gameBoard.appendChild(cardElement);
        cards.push(cardElement);
    });
    currentFocusIndex = 0;
}

function createCard(emoji, index) {
    const card = document.createElement('div');
    card.classList.add('card');
    card.dataset.emoji = emoji;
    card.dataset.index = index;
    card.setAttribute('tabindex', '0');
    card.setAttribute('role', 'button');
    card.setAttribute('aria-label', 'Card');
    card.innerHTML = `
                <div class="card-face card-front">?</div>
                <div class="card-face card-back">${emoji}</div>`;
    card.addEventListener('click', handleCardClick);
    card.addEventListener('keydown', handleCardKeydown);
    return card;
}

function handleCardClick() {
    if (lockBoard || this === firstCard || this.classList.contains('matched')) return;
    if (!timerStarted) startTimer();

    playSound(flipSound, 'C5', '8n');
    this.classList.add('flipped');
    this.setAttribute('aria-label', `Card with ${this.dataset.emoji}`);

    if (!firstCard) {
        firstCard = this;
        return;
    }
    secondCard = this;
    lockBoard = true;
    incrementMoves();
    checkForMatch();
}

function handleCardKeydown(e) {
    if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleCardClick.call(this);
    }
}

function checkForMatch() {
    const isMatch = firstCard.dataset.emoji === secondCard.dataset.emoji;
    isMatch ? disableCards() : unflipCards();
}

function disableCards() {
    firstCard.classList.add('matched');
    secondCard.classList.add('matched');
    firstCard.setAttribute('aria-disabled', 'true');
    secondCard.setAttribute('aria-disabled', 'true');
    matchedPairs++;
    playSound(matchSound, 'E5', '8n');
    resetBoard();
    if (matchedPairs === difficultySettings[currentDifficulty].pairs) endGame();
}

function unflipCards() {
    setTimeout(() => {
        firstCard.classList.remove('flipped');
        secondCard.classList.remove('flipped');
        firstCard.setAttribute('aria-label', 'Card');
        secondCard.setAttribute('aria-label', 'Card');
        resetBoard();
    }, 1000);
}

function resetBoard() {
    [firstCard, secondCard, lockBoard] = [null, null, false];
}

function incrementMoves() {
    moves++;
    movesCountSpan.textContent = moves;
}

function startTimer() {
    timerStarted = true;
    timerInterval = setInterval(() => {
        seconds++;
        timerSpan.textContent = `${seconds}s`;
    }, 1000);
}

function handleHint() {
    if (hintsLeft <= 0 || lockBoard) return;

    hintsLeft--;
    hintsLeftSpan.textContent = hintsLeft;
    playSound(hintSound, 'A4', '4n');

    const unmatchedCards = cards.filter(card => !card.classList.contains('matched'));
    const pairs = {};
    unmatchedCards.forEach(card => {
        if (pairs[card.dataset.emoji]) {
            pairs[card.dataset.emoji].push(card);
        } else {
            pairs[card.dataset.emoji] = [card];
        }
    });

    const firstPair = Object.values(pairs).find(p => p.length === 2);
    if (firstPair) {
        lockBoard = true;
        firstPair.forEach(card => card.classList.add('hint'));
        setTimeout(() => {
            firstPair.forEach(card => card.classList.remove('hint'));
            lockBoard = false;
        }, 1500);
    }
    if (hintsLeft === 0) hintBtn.disabled = true;
}

function endGame() {
    clearInterval(timerInterval);
    playSound(winSound, 'C4', '8n');
    playSound(winSound, 'E4', '8n', 0.2);
    playSound(winSound, 'G4', '8n', 0.4);
    triggerConfetti();

    const previousBest = localStorage.getItem(`bestTime_${currentDifficulty}`);
    let newBestTime = false;
    if (!previousBest || seconds < parseInt(previousBest)) {
        localStorage.setItem(`bestTime_${currentDifficulty}`, seconds);
        newBestTime = true;
    }

    const finalBestTime = localStorage.getItem(`bestTime_${currentDifficulty}`);
    document.getElementById('final-moves').textContent = moves;
    document.getElementById('final-time').textContent = `${seconds}s`;
    const bestTimeEl = document.getElementById('final-best-time');
    bestTimeEl.textContent = `${finalBestTime}s`;
    if (newBestTime) {
        bestTimeEl.innerHTML += ' <span class="badge bg-success">New Best!</span>';
    }

    setTimeout(() => winModal.show(), 500);
}

// --- UI & HELPERS ---
function updateBestTimeDisplay() {
    const bestTime = localStorage.getItem(`bestTime_${currentDifficulty}`) || 'N/A';
    bestTimeSpan.textContent = bestTime !== 'N/A' ? `${bestTime}s` : 'N/A';
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-bs-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-bs-theme', newTheme);
    themeToggleBtn.innerHTML = newTheme === 'dark' ? '<i class="bi bi-moon-stars-fill"></i>' : '<i class="bi bi-sun-fill"></i>';
    localStorage.setItem('memoryGameTheme', newTheme);
}

function playSound(synth, note, duration, delay = 0) {
    if (Tone.context.state !== 'running') Tone.context.resume();
    synth.triggerAttackRelease(note, duration, Tone.now() + delay);
}

function triggerConfetti() {
    for (let i = 0; i < 100; i++) {
        const confetti = document.createElement('div');
        confetti.classList.add('confetti');
        confetti.style.left = Math.random() * 100 + 'vw';
        confetti.style.animationDuration = Math.random() * 2 + 3 + 's';
        confetti.style.backgroundColor = `hsl(${Math.random() * 360}, 100%, 50%)`;
        document.body.appendChild(confetti);
        setTimeout(() => confetti.remove(), 5000);
    }
}

function handleGridNavigation(e) {
    const { cols } = difficultySettings[currentDifficulty];
    let newIndex = currentFocusIndex;

    if (e.key === 'ArrowRight') newIndex++;
    else if (e.key === 'ArrowLeft') newIndex--;
    else if (e.key === 'ArrowDown') newIndex += cols;
    else if (e.key === 'ArrowUp') newIndex -= cols;
    else return;

    e.preventDefault();

    if (newIndex >= 0 && newIndex < cards.length) {
        currentFocusIndex = newIndex;
        cards[currentFocusIndex].focus();
    }
}

// --- EVENT LISTENERS ---
restartBtn.addEventListener('click', startGame);
playAgainBtn.addEventListener('click', () => {
    winModal.hide();
    startGame();
});
hintBtn.addEventListener('click', handleHint);
themeToggleBtn.addEventListener('click', toggleTheme);
document.querySelectorAll('input[name="difficulty"]').forEach(radio => radio.addEventListener('change', startGame));
themeSelector.addEventListener('change', startGame);
gameBoard.addEventListener('keydown', handleGridNavigation);

// --- INITIALIZATION ---
const savedTheme = localStorage.getItem('memoryGameTheme');
if (savedTheme) {
    document.documentElement.setAttribute('data-bs-theme', savedTheme);
    themeToggleBtn.innerHTML = savedTheme === 'dark' ? '<i class="bi bi-moon-stars-fill"></i>' : '<i class="bi bi-sun-fill"></i>';
}
startGame();