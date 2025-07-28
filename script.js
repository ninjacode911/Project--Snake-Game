// Game constants
const GRID_SIZE = 20; // Size of each grid cell in pixels
const GRID_WIDTH = 20; // Number of cells horizontally
const GRID_HEIGHT = 20; // Number of cells vertically
const GAME_SPEED = 150; // Initial game speed in milliseconds

// Game variables
let canvas;
let ctx;
let snake = [];
let food = {};
let direction = 'right';
let nextDirection = 'right';
let gameInterval;
let score = 0;
let gameRunning = false;

// DOM elements
const startBtn = document.getElementById('start-btn');
const resetBtn = document.getElementById('reset-btn');
const scoreElement = document.getElementById('score');

// Initialize the game
function init() {
    canvas = document.getElementById('game-board');
    ctx = canvas.getContext('2d');
    
    // Event listeners
    startBtn.addEventListener('click', startGame);
    resetBtn.addEventListener('click', resetGame);
    document.addEventListener('keydown', handleKeyPress);
    
    // Initial setup
    resetGame();
    drawGame();
}

// Start the game
function startGame() {
    if (!gameRunning) {
        gameRunning = true;
        startBtn.textContent = 'Pause';
        gameInterval = setInterval(gameLoop, GAME_SPEED);
    } else {
        gameRunning = false;
        startBtn.textContent = 'Resume';
        clearInterval(gameInterval);
    }
}

// Reset the game
function resetGame() {
    // Clear any existing game interval
    if (gameInterval) {
        clearInterval(gameInterval);
    }
    
    // Reset game state
    snake = [
        {x: 10, y: 10},
        {x: 9, y: 10},
        {x: 8, y: 10}
    ];
    direction = 'right';
    nextDirection = 'right';
    score = 0;
    scoreElement.textContent = score;
    gameRunning = false;
    startBtn.textContent = 'Start Game';
    
    // Generate initial food
    generateFood();
    
    // Draw the initial state
    drawGame();
}

// Main game loop
function gameLoop() {
    moveSnake();
    if (checkCollision()) {
        gameOver();
        return;
    }
    checkFood();
    drawGame();
}

// Move the snake
function moveSnake() {
    // Update direction
    direction = nextDirection;
    
    // Calculate new head position
    const head = {...snake[0]};
    switch (direction) {
        case 'up':
            head.y -= 1;
            break;
        case 'down':
            head.y += 1;
            break;
        case 'left':
            head.x -= 1;
            break;
        case 'right':
            head.x += 1;
            break;
    }
    
    // Add new head to the beginning of snake array
    snake.unshift(head);
    
    // Remove tail unless food was eaten (handled in checkFood)
    if (!checkFood(true)) {
        snake.pop();
    }
}

// Check for collisions
function checkCollision() {
    const head = snake[0];
    
    // Check wall collision
    if (head.x < 0 || head.x >= GRID_WIDTH || head.y < 0 || head.y >= GRID_HEIGHT) {
        return true;
    }
    
    // Check self collision (start from index 1 to avoid checking head against itself)
    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            return true;
        }
    }
    
    return false;
}

// Check if snake ate food
function checkFood(checkOnly = false) {
    const head = snake[0];
    
    if (head.x === food.x && head.y === food.y) {
        if (!checkOnly) {
            // Increase score
            score += 10;
            scoreElement.textContent = score;
            
            // Generate new food
            generateFood();
        }
        return true;
    }
    return false;
}

// Generate food at random position
function generateFood() {
    // Create a list of all possible positions
    const positions = [];
    for (let x = 0; x < GRID_WIDTH; x++) {
        for (let y = 0; y < GRID_HEIGHT; y++) {
            // Check if this position is occupied by the snake
            let isOccupied = false;
            for (const segment of snake) {
                if (segment.x === x && segment.y === y) {
                    isOccupied = true;
                    break;
                }
            }
            
            if (!isOccupied) {
                positions.push({x, y});
            }
        }
    }
    
    // Select a random position from available positions
    if (positions.length > 0) {
        const randomIndex = Math.floor(Math.random() * positions.length);
        food = positions[randomIndex];
    }
}

// Handle keyboard input
function handleKeyPress(event) {
    // Prevent default action for arrow keys to avoid page scrolling
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
        event.preventDefault();
    }
    
    // Update direction based on key press
    // Prevent 180-degree turns (can't go in the opposite direction)
    switch (event.key) {
        case 'ArrowUp':
            if (direction !== 'down') nextDirection = 'up';
            break;
        case 'ArrowDown':
            if (direction !== 'up') nextDirection = 'down';
            break;
        case 'ArrowLeft':
            if (direction !== 'right') nextDirection = 'left';
            break;
        case 'ArrowRight':
            if (direction !== 'left') nextDirection = 'right';
            break;
    }
}

// Draw the game
function drawGame() {
    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw snake
    snake.forEach((segment, index) => {
        // Head is a different color
        if (index === 0) {
            ctx.fillStyle = '#4CAF50'; // Green head
        } else {
            ctx.fillStyle = '#8BC34A'; // Lighter green body
        }
        
        ctx.fillRect(
            segment.x * GRID_SIZE,
            segment.y * GRID_SIZE,
            GRID_SIZE,
            GRID_SIZE
        );
        
        // Add a border to make segments more distinct
        ctx.strokeStyle = '#388E3C';
        ctx.strokeRect(
            segment.x * GRID_SIZE,
            segment.y * GRID_SIZE,
            GRID_SIZE,
            GRID_SIZE
        );
    });
    
    // Draw food
    ctx.fillStyle = '#F44336'; // Red food
    ctx.beginPath();
    ctx.arc(
        food.x * GRID_SIZE + GRID_SIZE / 2,
        food.y * GRID_SIZE + GRID_SIZE / 2,
        GRID_SIZE / 2,
        0,
        Math.PI * 2
    );
    ctx.fill();
}

// Game over
function gameOver() {
    clearInterval(gameInterval);
    gameRunning = false;
    startBtn.textContent = 'Start Game';
    
    // Display game over message
    ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.font = '30px Arial';
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.fillText('Game Over!', canvas.width / 2, canvas.height / 2 - 15);
    
    ctx.font = '20px Arial';
    ctx.fillText(`Score: ${score}`, canvas.width / 2, canvas.height / 2 + 20);
}

// Initialize the game when the page loads
window.addEventListener('load', init);