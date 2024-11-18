// Música de fundo suave
const audioContext = new (window.AudioContext || window.webkitAudioContext)();
const oscillator = audioContext.createOscillator();
const gainNode = audioContext.createGain();

// Adicionar um pouco de reverb para suavizar o som
const convolver = audioContext.createConvolver();
const filter = audioContext.createBiquadFilter();

// Configurar o filtro para suavizar o som
filter.type = 'lowpass';
filter.frequency.value = 1000;

// Configurar o oscilador
oscillator.type = 'sine'; // Onda senoidal para um som mais suave
oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
gainNode.gain.setValueAtTime(0.02, audioContext.currentTime);

// Conectar os nós com o filtro
oscillator.connect(filter);
filter.connect(gainNode);
gainNode.connect(audioContext.destination);

let isPlaying = false;
let currentNote = 0;

// Notas da melodia (escala pentatônica maior em Dó)
const melody = [
    261.63, // C4
    293.66, // D4
    329.63, // E4
    392.00, // G4
    440.00, // A4
    523.25, // C5
    440.00, // A4
    392.00, // G4
    329.63, // E4
    293.66, // D4
];

// Função para tocar/pausar música
function startBackgroundMusic() {
    if (!isPlaying) {
        if (audioContext.state === 'suspended') {
            audioContext.resume();
        }
        
        try {
            oscillator.start();
            isPlaying = true;
            
            // Criar uma melodia suave e cíclica
            setInterval(() => {
                const now = audioContext.currentTime;
                
                // Transição suave entre notas
                oscillator.frequency.setTargetAtTime(
                    melody[currentNote],
                    now,
                    0.1 // Tempo de transição suave
                );
                
                // Avançar para próxima nota
                currentNote = (currentNote + 1) % melody.length;
                
            }, 400); // Tempo mais longo entre as notas (400ms)
            
        } catch (error) {
            console.log('Erro ao tocar música:', error);
        }
    }
}

// Exportar função
window.startBackgroundMusic = startBackgroundMusic;
