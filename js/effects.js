export function initBackground() {
    const container = document.getElementById("symbols-container");
    if (!container) return;
    const symbols = ["+", "−", "×", "÷", "=", "∑", "π", "∞", "√", "∆", "∫", "≈", "≠", "λ", "μ", "θ"];
    for (let i = 0; i < 60; i++) {
        const s = document.createElement("div");
        s.className = "bg-symbol";
        s.textContent = symbols[Math.floor(Math.random() * symbols.length)];
        s.style.left = Math.random() * 100 + "vw";
        s.style.top = Math.random() * 100 + "vh";
        s.style.fontSize = Math.random() * 20 + 15 + "px";
        s.style.opacity = Math.random() * 0.5 + 0.1;
        s.style.animationDuration = Math.random() * 20 + 10 + "s";
        s.style.animationDelay = Math.random() * -30 + "s";
        container.appendChild(s);
    }
}

export function launchFireworks(parent) {
    const container = document.createElement("div");
    container.className = "fireworks-container";
    container.id = "active-fireworks";
    parent.appendChild(container);

    function scheduleFirework() {
        if (!document.getElementById("active-fireworks")) return;
        const x = Math.random() * 80 + 10;
        const targetY = Math.random() * 50 + 10;
        const duration = Math.random() * 0.5 + 0.8;
        createRocket(container, x, targetY, duration);
        setTimeout(scheduleFirework, Math.random() * 400 + 400);
    }
    scheduleFirework();
}

function createRocket(container, x, targetY, duration) {
    const rocket = document.createElement("div");
    rocket.className = "rocket";
    rocket.style.left = x + "%";
    rocket.style.setProperty("--target-y", targetY + "%");
    rocket.style.setProperty("--duration", duration + "s");
    container.appendChild(rocket);
    setTimeout(() => { explodeFirework(container, x, targetY); rocket.remove(); }, duration * 1000);
}

function explodeFirework(container, x, targetY) {
    const palettes = [
        ["#FFD700", "#FFA500", "#FF4500"],
        ["#00F5FF", "#00E5EE", "#7FFFD4"],
        ["#FF00FF", "#DA70D6", "#BA55D3"],
        ["#ADFF2F", "#32CD32", "#00FF7F"]
    ];
    const palette = palettes[Math.floor(Math.random() * palettes.length)];

    for (let i = 0; i < 60; i++) {
        const p = document.createElement("div");
        p.className = "firework-particle";
        const color = palette[Math.floor(Math.random() * palette.length)];
        p.style.backgroundColor = color;
        p.style.left = x + "%";
        p.style.top = targetY + "%";
        p.style.boxShadow = `0 0 10px ${color}, 0 0 20px ${color}`;

        const angle = (Math.PI * 2 * i) / 60 + (Math.random() - 0.5) * 0.5;
        const velocity = Math.random() * 250 + 100;
        p.style.setProperty("--tx", Math.cos(angle) * velocity + "px");
        p.style.setProperty("--ty", Math.sin(angle) * velocity + "px");

        const dur = Math.random() * 0.6 + 1.2;
        p.style.animation = `fireworkExplode ${dur}s cubic-bezier(0,0,0.4,1) forwards`;
        container.appendChild(p);

        if (Math.random() > 0.7)
            createSparkle(container,
                x + (Math.cos((Math.PI * 2 * i) / 60) * velocity / window.innerWidth * 100),
                targetY + (Math.sin((Math.PI * 2 * i) / 60) * velocity / window.innerHeight * 100));

        setTimeout(() => p.remove(), dur * 1000);
    }
}

function createSparkle(container, x, y) {
    const s = document.createElement("div");
    s.className = "sparkle";
    s.style.left = x + "%";
    s.style.top = y + "%";
    s.style.setProperty("--duration", (Math.random() * 0.5 + 0.5) + "s");
    container.appendChild(s);
    setTimeout(() => s.remove(), 1000);
}
