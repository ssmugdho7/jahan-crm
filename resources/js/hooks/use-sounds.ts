const AudioContext = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;

function createTone(
    audioCtx: AudioContext,
    frequency: number,
    duration: number,
    type: OscillatorType = 'sine',
    gainValue = 0.3,
): void {
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, audioCtx.currentTime);

    gainNode.gain.setValueAtTime(gainValue, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);

    oscillator.start(audioCtx.currentTime);
    oscillator.stop(audioCtx.currentTime + duration);
}

export function playLoginSound(): void {
    try {
        const ctx = new AudioContext();

        createTone(ctx, 523.25, 0.15, 'sine', 0.3);
        createTone(ctx, 659.25, 0.15, 'sine', 0.3);

        setTimeout(() => {
            createTone(ctx, 783.99, 0.25, 'sine', 0.3);
        }, 120);
    } catch {
        // Audio not supported
    }
}

export function playLogoutSound(): void {
    try {
        const ctx = new AudioContext();

        createTone(ctx, 783.99, 0.15, 'sine', 0.3);
        createTone(ctx, 659.25, 0.15, 'sine', 0.3);

        setTimeout(() => {
            createTone(ctx, 523.25, 0.25, 'sine', 0.3);
        }, 120);
    } catch {
        // Audio not supported
    }
}
