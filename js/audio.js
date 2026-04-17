const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

export const sfx = {
    // Pleasant, soft chime sound (Correct answer)
    playCorrect: () => {
        if (audioCtx.state === 'suspended') audioCtx.resume();
        
        const playChime = (freq, timeOffset) => {
            const t = audioCtx.currentTime + timeOffset;
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            
            osc.type = 'sine';
            osc.frequency.value = freq;
            
            // Smooth attack and release to prevent audio clicking
            gain.gain.setValueAtTime(0, t);
            gain.gain.linearRampToValueAtTime(0.15, t + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
            
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            
            osc.start(t);
            osc.stop(t + 0.5);
        };

        // Play two notes (Major third: C5 and E5)
        playChime(523.25, 0);       // First tone
        playChime(659.25, 0.08);    // Second tone, slightly delayed
    },

    // Soft descending "thud" (Wrong answer)
    playWrong: () => {
        if (audioCtx.state === 'suspended') audioCtx.resume();
        
        const t = audioCtx.currentTime;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        
        osc.type = 'triangle'; // Triangle is softer than Sawtooth
        
        // Pitch sliding down
        osc.frequency.setValueAtTime(250, t);
        osc.frequency.exponentialRampToValueAtTime(100, t + 0.3);
        
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.15, t + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
        
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        
        osc.start(t);
        osc.stop(t + 0.3);
    },

    // Tick sound for the timer (Tick)
    playTick: () => {
        if (audioCtx.state === 'suspended') audioCtx.resume();
        
        const t = audioCtx.currentTime;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        
        osc.type = 'sine';
        
        // Sharp, short sound (Click effect)
        osc.frequency.setValueAtTime(800, t);
        osc.frequency.exponentialRampToValueAtTime(100, t + 0.05);
        
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.05, t + 0.005);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
        
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        
        osc.start(t);
        osc.stop(t + 0.05);
    }
};
