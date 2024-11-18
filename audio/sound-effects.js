// Contexto de áudio para efeitos sonoros
const sfxContext = new (window.AudioContext || window.webkitAudioContext)();

// Função para criar som de tiro
function createLaserSound() {
    const oscillator = sfxContext.createOscillator();
    const gainNode = sfxContext.createGain();
    
    // Configurar som de laser
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(880, sfxContext.currentTime); // Nota A5
    oscillator.frequency.exponentialRampToValueAtTime(110, sfxContext.currentTime + 0.1); // Slide para A2
    
    // Configurar volume
    gainNode.gain.setValueAtTime(0.02, sfxContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, sfxContext.currentTime + 0.1);
    
    // Conectar nós
    oscillator.connect(gainNode);
    gainNode.connect(sfxContext.destination);
    
    // Tocar som
    oscillator.start();
    oscillator.stop(sfxContext.currentTime + 0.1);
}

// Função para criar som de explosão
function createExplosionSound() {
    const noise = sfxContext.createOscillator();
    const gainNode = sfxContext.createGain();
    const filter = sfxContext.createBiquadFilter();
    
    // Configurar ruído branco para explosão
    noise.type = 'square';
    noise.frequency.setValueAtTime(100, sfxContext.currentTime);
    noise.frequency.exponentialRampToValueAtTime(20, sfxContext.currentTime + 0.15);
    
    // Configurar filtro
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1000, sfxContext.currentTime);
    filter.frequency.exponentialRampToValueAtTime(100, sfxContext.currentTime + 0.15);
    
    // Configurar volume
    gainNode.gain.setValueAtTime(0.02, sfxContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, sfxContext.currentTime + 0.15);
    
    // Conectar nós
    noise.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(sfxContext.destination);
    
    // Tocar som
    noise.start();
    noise.stop(sfxContext.currentTime + 0.15);
}

// Função para criar som de game over
function createGameOverSound() {
    const oscillator = sfxContext.createOscillator();
    const gainNode = sfxContext.createGain();
    
    // Configurar som triste de game over
    oscillator.type = 'triangle';
    oscillator.frequency.setValueAtTime(440, sfxContext.currentTime); // A4
    oscillator.frequency.exponentialRampToValueAtTime(220, sfxContext.currentTime + 0.5); // A3
    
    // Configurar volume
    gainNode.gain.setValueAtTime(0.03, sfxContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, sfxContext.currentTime + 0.5);
    
    // Conectar nós
    oscillator.connect(gainNode);
    gainNode.connect(sfxContext.destination);
    
    // Tocar som
    oscillator.start();
    oscillator.stop(sfxContext.currentTime + 0.5);
}

// Função para criar som de tiro alienígena
function createAlienLaserSound() {
    const oscillator = sfxContext.createOscillator();
    const gainNode = sfxContext.createGain();
    
    // Configurar som de laser alien (mais grave que o do jogador)
    oscillator.type = 'sawtooth';
    oscillator.frequency.setValueAtTime(440, sfxContext.currentTime); // A4
    oscillator.frequency.exponentialRampToValueAtTime(55, sfxContext.currentTime + 0.1); // A1
    
    // Configurar volume
    gainNode.gain.setValueAtTime(0.015, sfxContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, sfxContext.currentTime + 0.1);
    
    // Conectar nós
    oscillator.connect(gainNode);
    gainNode.connect(sfxContext.destination);
    
    // Tocar som
    oscillator.start();
    oscillator.stop(sfxContext.currentTime + 0.1);
}

// Exportar funções
window.playLaserSound = function() {
    if (sfxContext.state === 'suspended') {
        sfxContext.resume();
    }
    createLaserSound();
};

window.playExplosionSound = function() {
    if (sfxContext.state === 'suspended') {
        sfxContext.resume();
    }
    createExplosionSound();
};

window.playGameOverSound = function() {
    if (sfxContext.state === 'suspended') {
        sfxContext.resume();
    }
    createGameOverSound();
};

window.playAlienLaserSound = function() {
    if (sfxContext.state === 'suspended') {
        sfxContext.resume();
    }
    createAlienLaserSound();
};
