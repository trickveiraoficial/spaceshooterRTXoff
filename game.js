const player = document.getElementById('player');
const gameContainer = document.querySelector('.game-container');
const scoreElement = document.getElementById('scoreValue');
const finalScoreElement = document.getElementById('finalScore');
const gameOverScreen = document.querySelector('.game-over');

let score = 0;
let gameIsOver = false;
let playerX = 375;
const playerSpeed = 6;
const keys = {};

let bossActive = false;
let bossHealth = 100;
let bossPhase = 1;

let bossLevel = 0;
let lastBossScore = 0;

// Nomes para os bosses baseados no nível
const bossNames = [
    "Alien Commander",
    "Space Destroyer",
    "Void Reaper",
    "Star Eater",
    "Galaxy Crusher",
    "Cosmic Annihilator",
    "Universal Doom",
    "Dimensional Horror",
    "Celestial Nightmare",
    "Infinity's End"
];

// Criar estrelas
function createStars() {
    const numberOfStars = 50;
    for (let i = 0; i < numberOfStars; i++) {
        createStar();
    }
}

function createStar() {
    const star = document.createElement('div');
    star.className = 'star';
    star.style.left = Math.random() * gameContainer.offsetWidth + 'px';
    star.style.top = -2 + 'px';
    star.style.animationDuration = (Math.random() * 2 + 2) + 's';
    gameContainer.appendChild(star);

    star.addEventListener('animationend', () => {
        star.remove();
        createStar();
    });
}

// Controles do jogador
document.addEventListener('keydown', (e) => {
    keys[e.key] = true;
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        e.preventDefault();
    }
});

document.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

// Tiro ao pressionar espaço
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && !gameIsOver) {
        e.preventDefault();
        shoot();
    }
});

function movePlayer() {
    if (keys['ArrowLeft'] && playerX > 0) {
        playerX -= playerSpeed;
        player.style.transform = 'rotate(-15deg)';
    } else if (keys['ArrowRight'] && playerX < gameContainer.offsetWidth - 40) {
        playerX += playerSpeed;
        player.style.transform = 'rotate(15deg)';
    } else {
        player.style.transform = 'rotate(0deg)';
    }
    player.style.left = playerX + 'px';
}

function shoot() {
    const laser = document.createElement('div');
    laser.className = 'laser';
    laser.style.left = (playerX + 18.5) + 'px';
    laser.style.bottom = '70px';
    gameContainer.appendChild(laser);

    // Tocar som de tiro
    if (typeof playLaserSound === 'function') {
        playLaserSound();
    }

    const laserInterval = setInterval(() => {
        const laserBottom = parseInt(laser.style.bottom);
        
        // Verificar colisões com aliens
        const aliens = document.querySelectorAll('.alien');
        aliens.forEach(alien => {
            if (checkCollision(laser, alien)) {
                clearInterval(laserInterval);
                laser.remove();
                
                const alienRect = alien.getBoundingClientRect();
                const containerRect = gameContainer.getBoundingClientRect();
                const explosionX = alienRect.left - containerRect.left;
                const explosionY = alienRect.top - containerRect.top;
                
                createExplosion(explosionX, explosionY);
                alien.remove();
                
                // Tocar som de explosão
                if (typeof playExplosionSound === 'function') {
                    playExplosionSound();
                }
                
                score += 10;
                scoreElement.textContent = score;
                
                checkBossSpawn();
            }
        });
        
        // Verificar colisão com o boss
        const boss = document.querySelector('.boss');
        if (boss && checkCollision(laser, boss)) {
            clearInterval(laserInterval);
            laser.remove();
            
            const bossRect = boss.getBoundingClientRect();
            const containerRect = gameContainer.getBoundingClientRect();
            const explosionX = bossRect.left - containerRect.left + (Math.random() * boss.offsetWidth);
            const explosionY = bossRect.top - containerRect.top + (Math.random() * boss.offsetHeight);
            
            createExplosion(explosionX, explosionY);
            
            if (typeof playExplosionSound === 'function') {
                playExplosionSound();
            }
            
            updateBossHealth(5);
        }

        if (laserBottom < gameContainer.offsetHeight) {
            laser.style.bottom = (laserBottom + 7) + 'px';
        } else {
            clearInterval(laserInterval);
            laser.remove();
        }
    }, 10);
}

function createAlien() {
    if (gameIsOver) return;

    const alien = document.createElement('div');
    alien.className = 'alien';
    const alienX = Math.random() * (gameContainer.offsetWidth - 35);
    alien.style.left = alienX + 'px';
    alien.style.top = '0px';
    gameContainer.appendChild(alien);

    let alienSpeed = 2 + Math.random() * 2;

    // Configurar intervalo de tiro do alien
    const shootInterval = setInterval(() => {
        if (!gameIsOver && alien.parentElement === gameContainer) {
            alienShoot(alien);
        }
    }, 2000 + Math.random() * 2000); // Tiro a cada 2-4 segundos

    const alienInterval = setInterval(() => {
        const alienTop = parseInt(alien.style.top);
        
        if (alienTop < gameContainer.offsetHeight - 35) {
            alien.style.top = (alienTop + alienSpeed) + 'px';
            alien.style.left = alienX + Math.sin(alienTop / 30) * 30 + 'px';
            
            // Verificar colisão com jogador
            if (checkCollision(alien, player)) {
                gameOver();
            }
        } else {
            clearInterval(alienInterval);
            clearInterval(shootInterval);
            if (alien.parentElement === gameContainer) {
                alien.remove();
            }
        }
    }, 20);
}

function alienShoot(alien) {
    const alienRect = alien.getBoundingClientRect();
    const containerRect = gameContainer.getBoundingClientRect();
    
    const laser = document.createElement('div');
    laser.className = 'alien-laser';
    laser.style.left = (alienRect.left - containerRect.left + alien.offsetWidth / 2) + 'px';
    laser.style.top = (alienRect.top - containerRect.top + alien.offsetHeight) + 'px';
    gameContainer.appendChild(laser);

    // Tocar som de tiro alien
    if (typeof playAlienLaserSound === 'function') {
        playAlienLaserSound();
    }

    const laserInterval = setInterval(() => {
        const laserTop = parseInt(laser.style.top);
        
        // Verificar colisão com jogador
        if (checkCollision(laser, player)) {
            clearInterval(laserInterval);
            laser.remove();
            gameOver();
            return;
        }

        if (laserTop < gameContainer.offsetHeight) {
            laser.style.top = (laserTop + 5) + 'px';
        } else {
            clearInterval(laserInterval);
            laser.remove();
        }
    }, 20);
}

function checkCollision(element1, element2) {
    const rect1 = element1.getBoundingClientRect();
    const rect2 = element2.getBoundingClientRect();

    return !(rect1.right < rect2.left || 
             rect1.left > rect2.right || 
             rect1.bottom < rect2.top || 
             rect1.top > rect2.bottom);
}

function gameOver() {
    if (gameIsOver) return;
    gameIsOver = true;

    // Remover o boss e seus elementos
    const boss = document.querySelector('.boss');
    const bossHealth = document.querySelector('.boss-health');
    const bossLasers = document.querySelectorAll('.boss-laser');
    
    if (boss) boss.remove();
    if (bossHealth) bossHealth.remove();
    bossLasers.forEach(laser => laser.remove());
    bossActive = false;

    // Remover outros elementos do jogo
    const aliens = document.querySelectorAll('.alien');
    const lasers = document.querySelectorAll('.laser');
    const alienLasers = document.querySelectorAll('.alien-laser');
    
    aliens.forEach(alien => alien.remove());
    lasers.forEach(laser => laser.remove());
    alienLasers.forEach(laser => laser.remove());

    // Tocar som de game over
    if (typeof playGameOverSound === 'function') {
        playGameOverSound();
    }

    // Mostrar tela de game over
    const gameOverScreen = document.createElement('div');
    gameOverScreen.className = 'game-over';
    gameOverScreen.innerHTML = `
        <h1>Game Over</h1>
        <p>Score: ${score}</p>
        <button onclick="restartGame()">Play Again</button>
    `;
    gameContainer.appendChild(gameOverScreen);
}

function restartGame() {
    // Remover a tela de game over
    const gameOverScreen = document.querySelector('.game-over');
    if (gameOverScreen) {
        gameOverScreen.remove();
    }

    // Limpar todos os elementos
    const aliens = document.querySelectorAll('.alien');
    const lasers = document.querySelectorAll('.laser');
    const alienLasers = document.querySelectorAll('.alien-laser');
    const stars = document.querySelectorAll('.star');
    const boss = document.querySelector('.boss');
    const bossHealthBar = document.querySelector('.boss-health');

    aliens.forEach(alien => alien.remove());
    lasers.forEach(laser => laser.remove());
    alienLasers.forEach(laser => laser.remove());
    stars.forEach(star => star.remove());
    if (boss) boss.remove();
    if (bossHealthBar) bossHealthBar.remove();

    // Resetar variáveis
    score = 0;
    bossActive = false;
    bossHealth = 100;
    bossPhase = 1;
    bossLevel = 0;
    lastBossScore = 0;
    scoreElement.textContent = '0';

    // Reposicionar jogador
    playerX = gameContainer.offsetWidth / 2;
    player.style.left = playerX + 'px';
    player.style.display = 'block';

    // Resetar estado do jogo
    gameIsOver = false;

    // Limpar intervalo anterior se existir
    if (alienSpawnInterval) {
        clearInterval(alienSpawnInterval);
    }

    // Iniciar jogo automaticamente
    startGame();
}

function gameLoop() {
    if (!gameIsOver) {
        movePlayer();
        checkBossSpawn(); // Verifica se deve spawnar novo boss
        requestAnimationFrame(gameLoop);
    }
}

let alienSpawnInterval;

function startGame() {
    document.getElementById('startButton').style.display = 'none';
    document.getElementById('player').style.display = 'block';
    
    createStars();
    gameLoop();
    alienSpawnInterval = setInterval(createAlien, 1500);
    
    // Iniciar música de fundo com interação do usuário
    if (typeof startBackgroundMusic === 'function') {
        startBackgroundMusic();
    }
}

// Não iniciar o jogo automaticamente
document.getElementById('startButton').style.display = 'block';
document.getElementById('player').style.display = 'none';

document.getElementById('startButton').addEventListener('click', startGame);

function createExplosion(x, y) {
    const explosion = document.createElement('div');
    explosion.className = 'explosion';
    explosion.style.left = x + 'px';
    explosion.style.top = y + 'px';
    gameContainer.appendChild(explosion);

    setTimeout(() => {
        explosion.remove();
    }, 200);
}

function checkBossSpawn() {
    // Primeiro boss aos 100 pontos
    if (score >= 100 && !bossActive && lastBossScore === 0) {
        bossLevel = 1;
        lastBossScore = score;
        createBoss();
        return;
    }
    
    // Bosses subsequentes a cada 300 pontos
    if (score >= lastBossScore + 300 && !bossActive && lastBossScore > 0) {
        bossLevel++;
        lastBossScore = score;
        createBoss();
    }
}

function createBoss() {
    if (bossActive) return;
    bossActive = true;
    
    // Aumenta vida e velocidade com base no nível
    const maxHealth = 100 + (bossLevel * 30);
    const bossSpeed = 2 + (bossLevel * 0.5);
    bossPhase = 1;

    // Criar elemento do boss
    const boss = document.createElement('div');
    boss.className = 'boss';
    boss.style.left = (gameContainer.offsetWidth / 2 - 60) + 'px';
    
    // Adicionar canhões
    const leftCannon = document.createElement('div');
    leftCannon.className = 'boss-cannon left';
    const rightCannon = document.createElement('div');
    rightCannon.className = 'boss-cannon right';
    
    boss.appendChild(leftCannon);
    boss.appendChild(rightCannon);
    
    // Criar barra de vida com informações
    const healthBar = document.createElement('div');
    healthBar.className = 'boss-health';
    
    const bossInfo = document.createElement('div');
    bossInfo.className = 'boss-info';
    
    const bossName = document.createElement('span');
    bossName.className = 'boss-name';
    bossName.textContent = bossNames[Math.min(bossLevel - 1, bossNames.length - 1)];
    
    const bossLevelDisplay = document.createElement('span');
    bossLevelDisplay.className = 'boss-level';
    bossLevelDisplay.textContent = `Level ${bossLevel}`;
    
    bossInfo.appendChild(bossName);
    bossInfo.appendChild(bossLevelDisplay);
    
    const healthBarContainer = document.createElement('div');
    healthBarContainer.className = 'boss-health-bar';
    
    const healthFill = document.createElement('div');
    healthFill.className = 'boss-health-fill';
    healthFill.style.width = '100%';
    
    healthBarContainer.appendChild(healthFill);
    healthBar.appendChild(bossInfo);
    healthBar.appendChild(healthBarContainer);
    
    gameContainer.appendChild(boss);
    gameContainer.appendChild(healthBar);

    // Movimento do boss
    let direction = 1;
    
    const bossMovement = setInterval(() => {
        if (gameIsOver || !bossActive) {
            clearInterval(bossMovement);
            return;
        }

        const currentLeft = parseInt(boss.style.left);
        
        if (currentLeft > gameContainer.offsetWidth - 140) {
            direction = -1;
        } else if (currentLeft < 20) {
            direction = 1;
        }
        
        boss.style.left = (currentLeft + direction * bossSpeed) + 'px';
    }, 20);

    // Padrões de ataque do boss
    const attackInterval = Math.max(2000 - (bossLevel * 200), 800); // Diminui intervalo com nível
    const bossAttack = setInterval(() => {
        if (gameIsOver || !bossActive) {
            clearInterval(bossAttack);
            return;
        }

        const bossRect = boss.getBoundingClientRect();
        const containerRect = gameContainer.getBoundingClientRect();

        // Padrões de ataque baseados na fase e nível
        if (bossPhase === 1) {
            // Fase 1: Tiros duplos + tiros extras baseado no nível
            bossShoot(boss, 'left');
            bossShoot(boss, 'right');
            if (bossLevel >= 3) {
                bossShoot(boss, 'center');
            }
        }
        else if (bossPhase === 2) {
            // Fase 2: Tiros triplos + tiros em ângulo baseado no nível
            bossShoot(boss, 'left');
            bossShoot(boss, 'center');
            bossShoot(boss, 'right');
            if (bossLevel >= 2) {
                bossShoot(boss, 'spread', Math.PI/4);
                bossShoot(boss, 'spread', -Math.PI/4);
            }
        }
        else if (bossPhase === 3) {
            // Fase 3: Tiros em todas as direções + tiros extras baseado no nível
            const numShots = 8 + Math.min(bossLevel * 2, 8); // Máximo 16 tiros
            for (let i = 0; i < numShots; i++) {
                const angle = (i * (360/numShots)) * (Math.PI / 180);
                bossShoot(boss, 'spread', angle);
            }
        }
    }, attackInterval);
}

function updateBossHealth(damage) {
    bossHealth -= damage;
    const maxHealth = 100 + (bossLevel * 30);
    const healthPercent = (bossHealth / maxHealth) * 100;
    
    const healthFill = document.querySelector('.boss-health-fill');
    if (healthFill) {
        healthFill.style.width = healthPercent + '%';
        
        // Mudar cor baseado na vida
        if (healthPercent <= 25) {
            healthFill.style.background = 'linear-gradient(90deg, #f00, #f00)';
        } else if (healthPercent <= 50) {
            healthFill.style.background = 'linear-gradient(90deg, #f00, #f50)';
        }
    }
    
    if (bossHealth <= 0) {
        const boss = document.querySelector('.boss');
        const healthBar = document.querySelector('.boss-health');
        if (boss) {
            // Criar múltiplas explosões
            for (let i = 0; i < 10; i++) {
                setTimeout(() => {
                    const randX = boss.offsetLeft + (Math.random() * boss.offsetWidth);
                    const randY = boss.offsetTop + (Math.random() * boss.offsetHeight);
                    createExplosion(randX, randY);
                }, i * 100);
            }
            boss.remove();
        }
        if (healthBar) healthBar.remove();
        
        bossActive = false;
        score += 100 * bossLevel;
        scoreElement.textContent = score;
    } else {
        // Mudança de fase baseada na vida
        const healthPercent = bossHealth / maxHealth;
        if (healthPercent <= 0.6 && bossPhase === 1) {
            bossPhase = 2;
            createExplosion(boss.offsetLeft + boss.offsetWidth/2, boss.offsetTop + boss.offsetHeight/2);
        } else if (healthPercent <= 0.3 && bossPhase === 2) {
            bossPhase = 3;
            createExplosion(boss.offsetLeft + boss.offsetWidth/2, boss.offsetTop + boss.offsetHeight/2);
        }
    }
}

function bossShoot(boss, position, angle = 0) {
    const bossRect = boss.getBoundingClientRect();
    const containerRect = gameContainer.getBoundingClientRect();
    
    const laser = document.createElement('div');
    laser.className = 'boss-laser';
    
    let startX, startY;
    
    if (position === 'left') {
        startX = bossRect.left - containerRect.left;
        startY = bossRect.top - containerRect.top + 60;
    } else if (position === 'right') {
        startX = bossRect.right - containerRect.left;
        startY = bossRect.top - containerRect.top + 60;
    } else if (position === 'center') {
        startX = bossRect.left - containerRect.left + 60;
        startY = bossRect.bottom - containerRect.top;
    } else if (position === 'spread') {
        startX = bossRect.left - containerRect.left + 60;
        startY = bossRect.top - containerRect.top + 60;
    }
    
    laser.style.left = startX + 'px';
    laser.style.top = startY + 'px';
    gameContainer.appendChild(laser);
    
    if (typeof playAlienLaserSound === 'function') {
        playAlienLaserSound();
    }

    const laserSpeed = 5 + (bossLevel * 0.3); // Aumenta velocidade dos tiros com nível
    const laserInterval = setInterval(() => {
        const laserRect = laser.getBoundingClientRect();
        
        let moveX = 0;
        let moveY = laserSpeed;
        
        if (position === 'spread') {
            moveX = Math.sin(angle) * laserSpeed;
            moveY = Math.cos(angle) * laserSpeed;
        }
        
        const currentLeft = parseInt(laser.style.left);
        const currentTop = parseInt(laser.style.top);
        
        if (checkCollision(laser, player)) {
            clearInterval(laserInterval);
            laser.remove();
            gameOver();
            return;
        }
        
        if (currentTop > gameContainer.offsetHeight || 
            currentTop < 0 || 
            currentLeft < 0 || 
            currentLeft > gameContainer.offsetWidth) {
            clearInterval(laserInterval);
            laser.remove();
            return;
        }
        
        laser.style.left = (currentLeft + moveX) + 'px';
        laser.style.top = (currentTop + moveY) + 'px';
    }, 20);
}
