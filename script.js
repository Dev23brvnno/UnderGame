const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const currentScoreElement = document.getElementById('currentScore');
const bestScoreElement = document.getElementById('bestScore');
const leaderboardTable = document.getElementById('leaderboardTable').getElementsByTagName('tbody')[0];

let canvasWidth = 800;
let canvasHeight = 600;

function resizeCanvas() {
    const containerWidth = canvas.parentElement.clientWidth;
    canvas.width = containerWidth;
    canvas.height = containerWidth * (canvasHeight / canvasWidth);
    canvasWidth = canvas.width;
    canvasHeight = canvas.height;
}

resizeCanvas();
window.addEventListener('resize', resizeCanvas);

const player = {
    x: canvasWidth / 2,
    y: canvasHeight / 2,
    size: 20,
    color: 'white'
};

let enemies = [];
let score = 0;
let highScore = localStorage.getItem('highScore') || 0;
let gameLoop;
let spawnInterval = 1000;
let lastSpawnTime = 0;
let difficulty = 1;

bestScoreElement.textContent = highScore;

function drawPlayer() {
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x - player.size / 2, player.y - player.size / 2, player.size, player.size);
}

function drawEnemies() {
    enemies.forEach(enemy => {
        ctx.fillStyle = enemy.color;
        ctx.fillRect(enemy.x - enemy.size / 2, enemy.y - enemy.size / 2, enemy.size, enemy.size);
    });
}

function moveEnemies() {
    enemies = enemies.filter(enemy => {
        enemy.x += enemy.speedX;
        enemy.y += enemy.speedY;

        return !(enemy.x < -enemy.size || enemy.x > canvasWidth + enemy.size || 
                 enemy.y < -enemy.size || enemy.y > canvasHeight + enemy.size);
    });
}

function spawnEnemy() {
    const size = 20;
    const speed = 1 + difficulty * 0.5;
    let x, y, speedX, speedY;

    const side = Math.floor(Math.random() * 4);

    switch(side) {
        case 0: // Arriba
            x = Math.random() * canvasWidth;
            y = -size;
            speedX = Math.random() * speed * 2 - speed;
            speedY = Math.random() * speed;
            break;
        case 1: // Derecha
            x = canvasWidth + size;
            y = Math.random() * canvasHeight;
            speedX = -Math.random() * speed;
            speedY = Math.random() * speed * 2 - speed;
            break;
        case 2: // Abajo
            x = Math.random() * canvasWidth;
            y = canvasHeight + size;
            speedX = Math.random() * speed * 2 - speed;
            speedY = -Math.random() * speed;
            break;
        case 3: // Izquierda
            x = -size;
            y = Math.random() * canvasHeight;
            speedX = Math.random() * speed;
            speedY = Math.random() * speed * 2 - speed;
            break;
    }

    enemies.push({x, y, size, color: 'red', speedX, speedY});
}

function checkCollision() {
    return enemies.some(enemy => {
        const dx = player.x - enemy.x;
        const dy = player.y - enemy.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < (player.size + enemy.size) / 2;
    });
}

function updateScore() {
    score++;
    currentScoreElement.textContent = score;
    if (score > highScore) {
        highScore = score;
        bestScoreElement.textContent = highScore;
        localStorage.setItem('highScore', highScore);
    }
}

function gameOver() {
    updateLeaderboard(score);
    alert(`¡Juego terminado! Tu puntuación: ${score}`);
    resetGame();
}

function resetGame() {
    player.x = canvasWidth / 2;
    player.y = canvasHeight / 2;
    enemies = [];
    score = 0;
    currentScoreElement.textContent = score;
    difficulty = 1;
    spawnInterval = 1000;
    startGame();
}

function drawBorder() {
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, canvasWidth, canvasHeight);
}

function update(currentTime) {
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    
    drawBorder();
    drawPlayer();
    drawEnemies();
    moveEnemies();
    
    if (currentTime - lastSpawnTime > spawnInterval) {
        spawnEnemy();
        lastSpawnTime = currentTime;
    }
    
    if (checkCollision()) {
        gameOver();
        return;
    }
    
    updateScore();
    
    difficulty += 0.001;
    spawnInterval = Math.max(200, 1000 - difficulty * 100);
    
    requestAnimationFrame(update);
}

function startGame() {
    canvas.addEventListener('mousemove', handlePlayerMove);
    canvas.addEventListener('touchmove', handlePlayerMove);
    requestAnimationFrame(update);
}

function handlePlayerMove(e) {
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const root = document.documentElement;
    const touch = e.type === 'touchmove' ? e.touches[0] : e;
    const mouseX = touch.clientX - rect.left - root.scrollLeft;
    const mouseY = touch.clientY - rect.top - root.scrollTop;
    player.x = (mouseX / rect.width) * canvasWidth;
    player.y = (mouseY / rect.height) * canvasHeight;
}

function updateLeaderboard(score) {
    let leaderboard = JSON.parse(localStorage.getItem('leaderboard')) || [];
    leaderboard.push(score);
    leaderboard.sort((a, b) => b - a);
    leaderboard = leaderboard.slice(0, 100);
    localStorage.setItem('leaderboard', JSON.stringify(leaderboard));
    displayLeaderboard();
}

function displayLeaderboard() {
    const leaderboard = JSON.parse(localStorage.getItem('leaderboard')) || [];
    leaderboardTable.innerHTML = '';
    leaderboard.forEach((score, index) => {
        const row = leaderboardTable.insertRow();
        row.insertCell(0).textContent = index + 1;
        row.insertCell(1).textContent = score;
    });
}

startGame();
displayLeaderboard();