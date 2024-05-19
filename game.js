let canvas, ctx;
let player;
let obstacles = [];
let powerUps = [];
let lives = 5;
let score = 0;
let gameRunning = false;
let character = 'boy';
let umbrellaActive = false;
let umbrellaTimer = 0;
let enterPressCount = 0;
let lastTime = 0;
let background; // Add a variable for the background image

const characters = {
    boy: 'assets/boy.png',
    girl: 'assets/girl.png',
    trans: 'assets/trans.png',
    nonbinary: 'assets/nonbinary.png'
};

const obstacleImages = {
    trafficJam: 'assets/traffic.png',
    media: 'assets/media.png',
    urgentBossCalling: 'assets/boss.gif',
    monsoon: 'assets/monsoon.png',
    mumbaiMonsoon: 'assets/mumbai_monsoon.gif'
};

const powerUpImages = {
    mediaUpdates: 'assets/media.png',
    umbrella: 'assets/umbrella.png'
};

window.onload = function() {
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');
    background = new Image();
    background.src = 'assets/background.png'; // Load the background image
    showStartScreen();
};

function showStartScreen() {
    document.getElementById('startScreen').style.display = 'block';
}

function startGame(selectedCharacter) {
    character = selectedCharacter;
    document.getElementById('startScreen').style.display = 'none';
    canvas.style.display = 'block';
    player = new Player();
    obstacles = [];
    powerUps = [];
    lives = 5;
    score = 0;
    umbrellaActive = false;
    gameRunning = true;
    gameLoop();
}

function restartGame() {
    document.getElementById('gameOverScreen').style.display = 'none';
    startGame(character);
}

class Player {
    constructor() {
        this.width = 50;
        this.height = 50;
        this.x = 50;
        this.y = canvas.height - this.height - 10;
        this.speed = 5;
        this.jumpPower = 15;
        this.dy = 0;
        this.gravity = 0.5;
        this.onGround = true;
        this.image = new Image();
        this.image.src = characters[character];
        this.umbrellaImage = new Image();
        this.umbrellaImage.src = powerUpImages.umbrella;
    }

    draw() {
        ctx.drawImage(this.image, this.x, this.y, this.width, this.height);

        if (umbrellaActive) {
            ctx.drawImage(this.umbrellaImage, this.x, this.y - 20, this.width, 20);
        }
    }

    update(deltaTime) {
        if (!this.onGround) {
            this.dy += this.gravity;
            this.y += this.dy;
            if (this.y + this.height >= canvas.height - 10) {
                this.y = canvas.height - this.height - 10;
                this.onGround = true;
                this.dy = 0;
            }
        }
        this.draw();
    }

    jump() {
        if (this.onGround) {
            this.dy = -this.jumpPower;
            this.onGround = false;
        }
    }

    activateUmbrella() {
        if (!umbrellaActive) {
            umbrellaActive = true;
            umbrellaTimer = 3000; // Umbrella active for 3 seconds
        }
    }
}

class Obstacle {
    constructor(type) {
        this.width = 50;
        this.height = 50;
        this.x = canvas.width;
        this.y = canvas.height - this.height - 10;
        this.speed = 3;
        this.type = type;
        this.image = new Image();
        this.image.src = obstacleImages[this.type];
        this.name = this.type === 'mumbaiMonsoon' ? 'Mumbai Monsoon' : this.type.charAt(0).toUpperCase() + this.type.slice(1);
    }

    draw() {
        ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
        ctx.fillStyle = 'black';
        ctx.font = '12px Arial';
        ctx.fillText(this.name, this.x, this.y - 5);
    }

    update() {
        this.x -= this.speed;
        this.draw();
    }
}

function gameLoop(timestamp) {
    if (!gameRunning) return;

    const deltaTime = timestamp - lastTime;
    lastTime = timestamp;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Draw the background
    ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
    player.update(deltaTime);
    handleObstacles(deltaTime);
    checkCollisions();
    updateScore();
    if (umbrellaActive) {
        umbrellaTimer -= deltaTime;
        if (umbrellaTimer <= 0) {
            umbrellaActive = false;
        }
    }
    requestAnimationFrame(gameLoop);
}

function handleObstacles(deltaTime) {
    if (Math.random() < 0.005) {
        const type = Math.random() < 0.2 ? 'mumbaiMonsoon' : ['trafficJam', 'media', 'urgentBossCalling', 'monsoon'][Math.floor(Math.random() * 4)];
        obstacles.push(new Obstacle(type));
    }
    obstacles.forEach((obstacle, index) => {
        obstacle.update(deltaTime);
        if (obstacle.x + obstacle.width < 0) {
            obstacles.splice(index, 1);
            score += 10; // Increase score for each obstacle passed
        }
    });
}

function checkCollisions() {
    obstacles.forEach((obstacle, index) => {
        if (
            player.x < obstacle.x + obstacle.width &&
            player.x + player.width > obstacle.x &&
            player.y < obstacle.y + obstacle.height &&
            player.y + player.height > obstacle.y
        ) {
            if (obstacle.type === 'mumbaiMonsoon' && umbrellaActive) {
                // Avoid collision if umbrella is active
                return;
            }
            obstacles.splice(index, 1);
            lives--;
            if (lives === 0) {
                gameRunning = false;
                showGameOverScreen();
            }
        }
    });
}

function updateScore() {
    ctx.fillStyle = 'black';
    ctx.font = '20px Arial';
    ctx.fillText('Score: ' + score, 10, 30);
    ctx.fillText('Lives: ' + lives, 10, 50);
}

function showGameOverScreen() {
    document.getElementById('gameOverScreen').style.display = 'block';
    canvas.style.display = 'none';
}

window.addEventListener('keydown', function(e) {
    if (e.code === 'Space') {
        player.jump();
    }
    if (e.code === 'Enter') {
        enterPressCount++;
        setTimeout(() => {
            enterPressCount = 0; // Reset count after 1 second
        }, 1000);
        if (enterPressCount === 2) {
            player.activateUmbrella();
            enterPressCount = 0; // Reset count after activation
        }
    }
});
