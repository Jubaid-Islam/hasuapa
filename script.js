// Select elements
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const startButton = document.getElementById("startButton");
const scoreDisplay = document.getElementById("score");
const coinScoreDisplay = document.getElementById("coinScore");
const highScoreDisplay = document.getElementById("highScore");
const soundToggle = document.getElementById("soundToggle");
const bgMusic = document.getElementById("bgMusic");
const coinSound = document.getElementById("coinSound");
const boomSound = document.getElementById("boomSound");

canvas.width = 800;
canvas.height = 300;

let gameRunning = false;
let gameOver = false;
let score = 0;
let coinScore = 0;
let highScore = localStorage.getItem("highScore") || 0;
let speedMultiplier = 1;
let soundOn = true;
highScoreDisplay.innerText = `High Score: ${90}`;

// Load images
const dinoImg = new Image();
dinoImg.src = "hasina.png";

const enemyImg = new Image();
enemyImg.src = "enemy.png";

const birdImg = new Image();
birdImg.src = "bird.png";

const coinImg = new Image();
coinImg.src = "coin.png";

const boomImg = new Image();
boomImg.src = "boom.png";

// Dino Object
const dino = {
    x: 100,
    y: 220,
    width: 50,
    height: 50,
    velocityY: 0,
    jumping: false,
    jumpCount: 0 // Track double jumps
};

// Obstacles
let obstacles = [
    { x: canvas.width, y: 220, width: 35, height: 40, img: enemyImg },
    { x: canvas.width + 1600, y: 150, width: 40, height: 30, img: birdImg }
];

// Coins
let coins = [];

// Handle Jump with Double Jump (Keyboard)
document.addEventListener("keydown", (event) => {
    if (event.code === "Space" && dino.jumpCount < 2) {
        dino.jumping = true;
        dino.velocityY = -8; // Smoother jumping
        dino.jumpCount++;
    }
});

// Handle Jump with Single Tap and Double Tap (Touch)
let lastTapTime = 0;
let tapTimeout;

canvas.addEventListener("touchstart", (event) => {
    const currentTime = new Date().getTime();
    const tapDelay = currentTime - lastTapTime;

    if (tapDelay < 300 && tapDelay > 0) { // Double tap detected
        clearTimeout(tapTimeout); // Cancel the single tap timeout
        if (dino.jumpCount < 2) { // Allow double jump
            dino.jumping = true;
            dino.velocityY = -8;
            dino.jumpCount++;
        }
    } else { // Single tap detected
        tapTimeout = setTimeout(() => {
            if (dino.jumpCount < 1) { // Allow single jump
                dino.jumping = true;
                dino.velocityY = -8;
                dino.jumpCount++;
            }
        }, 100); // Wait 300ms to confirm it's not a double tap
    }

    lastTapTime = currentTime;
});

// Start Button Click
startButton.addEventListener("click", () => {
    gameRunning = true;
    startButton.style.display = "none";
    bgMusic.play();
    spawnCoin();
    updateGame();
});

// Function to spawn coins
function spawnCoin() {
    if (!gameRunning) return;

    coins.push({
        x: canvas.width + Math.random() * 400,
        y: Math.random() > 0.4 ? 170 : 90,
        width: 30,
        height: 30
    });

    setTimeout(spawnCoin, 3000);
}

// Toggle Sound
soundToggle.addEventListener("click", () => {
    soundOn = !soundOn;
    if (soundOn) {
        bgMusic.play();
        soundToggle.innerText = "🔊";
    } else {
        bgMusic.pause();
        soundToggle.innerText = "🔇";
    }
});

function checkCollision(obj1, obj2) {
    return (
        obj1.x < obj2.x + obj2.width &&
        obj1.x + obj1.width > obj2.x &&
        obj1.y < obj2.y + obj2.height &&
        obj1.y + obj1.height > obj2.y
    );
}

// Update Game
function updateGame() {
    if (!gameRunning || gameOver) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(dinoImg, dino.x, dino.y, dino.width, dino.height);

    // Jump mechanics
    if (dino.jumping) {
        dino.y += dino.velocityY;
        dino.velocityY += 0.3; // Smooth gravity
    }

    // Reset jump when landing
    if (dino.y > 220) {
        dino.y = 220;
        dino.jumping = false;
        dino.jumpCount = 0; // Reset double jump
    }

    for (let obs of obstacles) {
        obs.x -= 4 * speedMultiplier;
        ctx.drawImage(obs.img, obs.x, obs.y, obs.width, obs.height);

        if (obs.x + obs.width < 0) {
            obs.x = canvas.width + Math.random() * 500;
            score++;
            scoreDisplay.innerText = `Score: ${score}`;

            if (score > highScore) {
                highScore = score;
                localStorage.setItem("highScore", highScore);
                highScoreDisplay.innerText = `High Score: ${highScore}`;
            }

            if (score % 10 === 0) {
                speedMultiplier += 0.1;
            }
        }

        if (checkCollision(dino, obs)) {
            gameOver = true;
            explodeDino();
            return;
        }
    }

    for (let i = coins.length - 1; i >= 0; i--) {
        let coin = coins[i];
        coin.x -= 3;
        ctx.drawImage(coinImg, coin.x, coin.y, coin.width, coin.height);

        if (checkCollision(dino, coin)) {
            coinSound.play();
            coins.splice(i, 1);
            coinScore++;
            coinScoreDisplay.innerText = `Coins: ${coinScore}`;
        }
    }

    requestAnimationFrame(updateGame);
}

function explodeDino() {
    ctx.drawImage(boomImg, dino.x, dino.y, 50, 50);
    boomSound.play();
    setTimeout(() => {
        location.reload();
    }, 500);
}
