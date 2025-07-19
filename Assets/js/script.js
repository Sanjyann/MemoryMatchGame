// DOM Elements
const gameBoard = document.getElementById('game-board');
const movesCountSpan = document.getElementById('moves-count');
const timerSpan = document.getElementById('timer');
const bestTimeSpan = document.getElementById('best-time');
const restartBtn = document.getElementById('restart-btn');
const playAgainBtn = document.getElementById('play-again-btn');
const winModalElement = document.getElementById('winModal');
const winModal = new bootstrap.Modal(winModalElement);
const difficultySelector = document.getElementById('difficulty-selector');
const themeSelector = document.getElementById('theme-selector');

// Game state variables
let firstCard = null, secondCard = null;
let lockBoard = false, timerStarted = false;
let moves = 0, seconds = 0, matchedPairs = 0;
let timerInterval;
let currentDifficulty, currentTheme;

// --- SOUNDS (using Tone.js) ---
const flipSound = new Tone.Synth({ oscillator: { type: 'sine' }, envelope: { attack: 0.005, decay: 0.1, sustain: 0.3, release: 1 } }).toDestination();
const matchSound = new Tone.Synth({ oscillator: { type: 'triangle' }, envelope: { attack: 0.005, decay: 0.2, sustain: 0.1, release: 0.5 } }).toDestination();
const winSound = new Tone.PluckSynth().toDestination();

// --- EMOJI THEMES ---
const themes = {
    animals: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯'],
    food: ['🍎', '🍌', '🍇', '🍓', '🍉', '🍕', '🍔', '🍟', '🍩', '🍪']
};
const difficultySettings = {
    easy: { pairs: 6, gridClass: 'easy-grid' },
    medium: { pairs: 8, gridClass: 'medium-grid' },
    hard: { pairs: 10, gridClass: 'hard-grid' }
};

// --- GAME FUNCTIONS ---

function shuffle(array) {
    let currentIndex = array.length, randomIndex;
    while (currentIndex !== 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }
    return array;
}

function startGame() {
    // Get selected settings
    currentDifficulty = document.querySelector('input[name="difficulty"]:checked').value;
    currentTheme = document.querySelector('input[name="theme"]:checked').value;

    // Reset state
    moves = 0;
    seconds = 0;
    matchedPairs = 0;
    firstCard = null;
    secondCard = null;
    lockBoard = false;
    timerStarted = false;

    movesCountSpan.textContent = moves;
    timerSpan.textContent = '0s';

    clearInterval(timerInterval);
    timerInterval = null;

    // Update UI
    gameBoard.className = 'game-board'; // Reset classes
    gameBoard.classList.add(difficultySettings[currentDifficulty].gridClass);
    updateBestTimeDisplay();

    // Prepare cards
    const numPairs = difficultySettings[currentDifficulty].pairs;
    const emojiSet = themes[currentTheme].slice(0, numPairs);
    const gameCards = shuffle([...emojiSet, ...emojiSet]);

    gameBoard.innerHTML = '';
    gameCards.forEach(emoji => {
        const cardElement = createCard(emoji);
        gameBoard.appendChild(cardElement);
    });
}

function createCard(emoji) {
    const card = document.createElement('div');
    card.classList.add('card');
    card.dataset.emoji = emoji;
    card.innerHTML = `
                <div class="card-face card-front">?</div>
                <div class="card-face card-back">${emoji}</div>`;
    card.addEventListener('click', handleCardClick);
    return card;
}

function handleCardClick() {
    if (lockBoard || this === firstCard || this.classList.contains('matched')) return;

    // Start everything on first click
    if (!timerStarted) {
        startTimer();
        timerStarted = true;
    }

    // Play flip sound
    if (Tone.context.state !== 'running') {
        Tone.context.resume();
    }
    flipSound.triggerAttackRelease('C5', '8n');

    this.classList.add('flipped');

    if (!firstCard) {
        firstCard = this;
        return;
    }

    secondCard = this;
    lockBoard = true;
    incrementMoves();
    checkForMatch();
}

function checkForMatch() {
    const isMatch = firstCard.dataset.emoji === secondCard.dataset.emoji;
    isMatch ? disableCards() : unflipCards();
}

function disableCards() {
    firstCard.classList.add('matched');
    secondCard.classList.add('matched');
    matchedPairs++;

    matchSound.triggerAttackRelease('E5', '8n', Tone.now() + 0.1);

    resetBoard();

    if (matchedPairs === difficultySettings[currentDifficulty].pairs) {
        endGame();
    }
}

function unflipCards() {
    setTimeout(() => {
        firstCard.classList.remove('flipped');
        secondCard.classList.remove('flipped');
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
    timerInterval = setInterval(() => {
        seconds++;
        timerSpan.textContent = `${seconds}s`;
    }, 1000);
}

function updateBestTimeDisplay() {
    const bestTime = localStorage.getItem(`bestTime_${currentDifficulty}`) || 'N/A';
    bestTimeSpan.textContent = bestTime !== 'N/A' ? `${bestTime}s` : 'N/A';
}

function endGame() {
    clearInterval(timerInterval);
    winSound.triggerAttackRelease('C4', '8n', Tone.now());
    winSound.triggerAttackRelease('E4', '8n', Tone.now() + 0.2);
    winSound.triggerAttackRelease('G4', '8n', Tone.now() + 0.4);

    const previousBest = localStorage.getItem(`bestTime_${currentDifficulty}`);
    let newBestTime = false;
    if (!previousBest || seconds < parseInt(previousBest)) {
        localStorage.setItem(`bestTime_${currentDifficulty}`, seconds);
        newBestTime = true;
    }

    const finalBestTime = localStorage.getItem(`bestTime_${currentDifficulty}`);
    document.getElementById('final-moves').textContent = moves;
    document.getElementById('final-time').textContent = `${seconds}s`;
    document.getElementById('final-best-time').textContent = `${finalBestTime}s`;
    if (newBestTime) {
        document.getElementById('final-best-time').innerHTML += ' <span class="badge bg-success">New Best!</span>';
    }

    winModal.show();
}

// --- EVENT LISTENERS ---
restartBtn.addEventListener('click', startGame);
playAgainBtn.addEventListener('click', () => {
    winModal.hide();
    startGame();
});
difficultySelector.addEventListener('change', startGame);
themeSelector.addEventListener('change', startGame);

// --- INITIALIZE GAME ---
startGame();