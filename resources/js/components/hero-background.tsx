import { useEffect, useRef, useCallback } from 'react';

type Fish = {
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    color: string;
    finColor: string;
    opacity: number;
    depth: number; // 0=far, 1=mid, 2=near
    tailPhase: number;
    speed: number;
    targetX: number;
    targetY: number;
    turnTimer: number;
    school: number;
};

type Bubble = {
    x: number;
    y: number;
    size: number;
    speed: number;
    wobble: number;
    opacity: number;
};

type Particle = {
    x: number;
    y: number;
    size: number;
    speed: number;
    drift: number;
    opacity: number;
};

type LightRay = {
    x: number;
    width: number;
    opacity: number;
    speed: number;
    angle: number;
};

const FISH_COLORS = [
    { body: '#00D8FF', fin: '#38BDF8' },
    { body: '#38BDF8', fin: '#7DD3FC' },
    { body: '#22D3EE', fin: '#67E8F9' },
    { body: '#7DD3FC', fin: '#BAE6FD' },
    { body: '#C0C0C0', fin: '#E0E0E0' }, // silver
    { body: '#FFD700', fin: '#FFF8DC' }, // gold
    { body: '#E0F2FE', fin: '#F0F9FF' }, // white
    { body: '#0EA5E9', fin: '#38BDF8' },
];

function createFish(w: number, h: number, depth: number, school: number): Fish {
    const fromRight = Math.random() > 0.5;
    const colors = FISH_COLORS[Math.floor(Math.random() * FISH_COLORS.length)];
    const baseSpeed = depth === 0 ? 0.15 : depth === 1 ? 0.4 : 0.6;
    const sizeMult = depth === 0 ? 0.5 : depth === 1 ? 1 : 1.8;
    return {
        x: fromRight ? w + 30 : -30,
        y: h * 0.15 + Math.random() * h * 0.7,
        vx: fromRight ? -baseSpeed : baseSpeed,
        vy: (Math.random() - 0.5) * 0.1,
        size: (3 + Math.random() * 4) * sizeMult,
        color: colors.body,
        finColor: colors.fin,
        opacity: depth === 0 ? 0.15 + Math.random() * 0.1 : depth === 1 ? 0.3 + Math.random() * 0.2 : 0.5 + Math.random() * 0.3,
        depth,
        tailPhase: Math.random() * Math.PI * 2,
        speed: baseSpeed + Math.random() * baseSpeed * 0.5,
        targetX: fromRight ? -50 : w + 50,
        targetY: h * 0.15 + Math.random() * h * 0.7,
        turnTimer: Math.random() * 200,
        school,
    };
}

function createBubble(w: number, h: number): Bubble {
    return {
        x: Math.random() * w,
        y: h + Math.random() * 20,
        size: 1 + Math.random() * 3,
        speed: 0.2 + Math.random() * 0.4,
        wobble: Math.random() * Math.PI * 2,
        opacity: 0.1 + Math.random() * 0.2,
    };
}

function createParticle(w: number, h: number): Particle {
    return {
        x: Math.random() * w,
        y: Math.random() * h,
        size: 0.5 + Math.random() * 1.5,
        speed: 0.05 + Math.random() * 0.1,
        drift: (Math.random() - 0.5) * 0.3,
        opacity: 0.05 + Math.random() * 0.15,
    };
}

function createLightRay(w: number, h: number): LightRay {
    return {
        x: Math.random() * w,
        width: 30 + Math.random() * 80,
        opacity: 0.02 + Math.random() * 0.04,
        speed: 0.1 + Math.random() * 0.2,
        angle: -0.15 + Math.random() * 0.3,
    };
}

function drawFish(ctx: CanvasRenderingContext2D, fish: Fish, t: number) {
    const tailWag = Math.sin(t * 0.008 + fish.tailPhase) * 0.3;
    const bodyWobble = Math.sin(t * 0.003 + fish.tailPhase) * 0.05;
    const dir = fish.vx >= 0 ? 1 : -1;
    const s = fish.size;

    ctx.save();
    ctx.translate(fish.x, fish.y + bodyWobble * 10);
    ctx.scale(dir, 1);
    ctx.globalAlpha = fish.opacity;

    // Body
    ctx.beginPath();
    ctx.ellipse(0, 0, s * 1.2, s * 0.5, 0, 0, Math.PI * 2);
    ctx.fillStyle = fish.color;
    ctx.fill();

    // Body highlight (glass reflection)
    ctx.beginPath();
    ctx.ellipse(-s * 0.2, -s * 0.15, s * 0.6, s * 0.2, -0.3, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,255,255,0.25)`;
    ctx.fill();

    // Tail
    ctx.beginPath();
    ctx.moveTo(-s * 1.0, 0);
    ctx.lineTo(-s * 1.8, -s * 0.5 + tailWag * s * 0.8);
    ctx.lineTo(-s * 1.8, s * 0.5 + tailWag * s * 0.8);
    ctx.closePath();
    ctx.fillStyle = fish.finColor;
    ctx.globalAlpha = fish.opacity * 0.7;
    ctx.fill();

    // Top fin
    ctx.beginPath();
    ctx.moveTo(s * 0.1, -s * 0.45);
    ctx.quadraticCurveTo(0, -s * 1.0 + tailWag * s * 0.2, -s * 0.5, -s * 0.4);
    ctx.fillStyle = fish.finColor;
    ctx.globalAlpha = fish.opacity * 0.5;
    ctx.fill();

    // Eye
    ctx.beginPath();
    ctx.arc(s * 0.6, -s * 0.08, s * 0.1, 0, Math.PI * 2);
    ctx.fillStyle = '#fff';
    ctx.globalAlpha = fish.opacity;
    ctx.fill();
    ctx.beginPath();
    ctx.arc(s * 0.62, -s * 0.08, s * 0.05, 0, Math.PI * 2);
    ctx.fillStyle = '#111';
    ctx.fill();

    // Glow
    ctx.beginPath();
    ctx.ellipse(0, 0, s * 2, s * 1.2, 0, 0, Math.PI * 2);
    const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, s * 2);
    glow.addColorStop(0, fish.color);
    glow.addColorStop(1, 'transparent');
    ctx.globalAlpha = fish.opacity * 0.08;
    ctx.fillStyle = glow;
    ctx.fill();

    ctx.restore();
}

export default function HeroBackground() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animRef = useRef<number>(0);
    const timeRef = useRef(0);
    const stateRef = useRef<{
        fish: Fish[];
        bubbles: Bubble[];
        particles: Particle[];
        rays: LightRay[];
        causticPhase: number;
        initialized: boolean;
    }>({ fish: [], bubbles: [], particles: [], rays: [], causticPhase: 0, initialized: false });

    const init = useCallback((w: number, h: number) => {
        const state = stateRef.current;
        if (state.initialized) return;

        // Create fish: 3 background, 12 midground, 3 foreground
        state.fish = [];
        for (let i = 0; i < 3; i++) state.fish.push(createFish(w, h, 0, i));
        for (let i = 0; i < 12; i++) state.fish.push(createFish(w, h, 1, Math.floor(i / 4)));
        for (let i = 0; i < 3; i++) state.fish.push(createFish(w, h, 2, i));

        state.bubbles = [];
        for (let i = 0; i < 20; i++) {
            const b = createBubble(w, h);
            b.y = Math.random() * h;
            state.bubbles.push(b);
        }

        state.particles = [];
        for (let i = 0; i < 50; i++) state.particles.push(createParticle(w, h));

        state.rays = [];
        for (let i = 0; i < 5; i++) state.rays.push(createLightRay(w, h));

        state.initialized = true;
    }, []);

    const draw = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const w = canvas.width;
        const h = canvas.height;
        if (w === 0 || h === 0) { animRef.current = requestAnimationFrame(draw); return; }

        const t = timeRef.current;
        const state = stateRef.current;
        init(w, h);

        ctx.clearRect(0, 0, w, h);

        // Deep ocean gradient
        const bg = ctx.createLinearGradient(0, 0, 0, h);
        bg.addColorStop(0, '#071A2D');
        bg.addColorStop(0.5, '#0B2447');
        bg.addColorStop(1, '#123A63');
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, w, h);

        // Light rays from top
        state.rays.forEach((ray) => {
            ray.x += ray.speed;
            if (ray.x > w + 100) ray.x = -100;

            ctx.save();
            ctx.translate(ray.x, 0);
            ctx.rotate(ray.angle);
            ctx.globalAlpha = ray.opacity + Math.sin(t * 0.001 + ray.x * 0.01) * 0.01;

            const rayGrad = ctx.createLinearGradient(0, 0, 0, h);
            rayGrad.addColorStop(0, 'rgba(0,216,255,0.15)');
            rayGrad.addColorStop(0.3, 'rgba(56,189,248,0.08)');
            rayGrad.addColorStop(1, 'transparent');
            ctx.fillStyle = rayGrad;

            ctx.beginPath();
            ctx.moveTo(-ray.width / 2, 0);
            ctx.lineTo(-ray.width * 0.8, h);
            ctx.lineTo(ray.width * 0.8, h);
            ctx.lineTo(ray.width / 2, 0);
            ctx.closePath();
            ctx.fill();
            ctx.restore();
        });

        // Caustic light patterns
        state.causticPhase = t * 0.0002;
        ctx.save();
        ctx.globalAlpha = 0.025;
        for (let i = 0; i < 6; i++) {
            const cx = w * (0.2 + i * 0.12) + Math.sin(state.causticPhase + i * 1.5) * 60;
            const cy = h * 0.3 + Math.cos(state.causticPhase * 0.7 + i) * 40;
            const cr = 40 + Math.sin(state.causticPhase + i * 2) * 20;

            ctx.beginPath();
            ctx.arc(cx, cy, cr, 0, Math.PI * 2);
            const cGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, cr);
            cGrad.addColorStop(0, 'rgba(0,216,255,0.4)');
            cGrad.addColorStop(1, 'transparent');
            ctx.fillStyle = cGrad;
            ctx.fill();
        }
        ctx.restore();

        // Water surface ripples at top
        ctx.save();
        ctx.globalAlpha = 0.06;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        for (let x = 0; x <= w; x += 3) {
            const y = 8 + Math.sin(x * 0.015 + t * 0.001) * 4 + Math.sin(x * 0.008 + t * 0.0015) * 2;
            ctx.lineTo(x, y);
        }
        ctx.lineTo(w, 0);
        ctx.closePath();
        const surfaceGrad = ctx.createLinearGradient(0, 0, 0, 15);
        surfaceGrad.addColorStop(0, 'rgba(0,216,255,0.3)');
        surfaceGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = surfaceGrad;
        ctx.fill();
        ctx.restore();

        // Draw fish sorted by depth (far first)
        const sortedFish = [...state.fish].sort((a, b) => a.depth - b.depth);
        sortedFish.forEach((fish) => {
            // Update position with school behavior
            fish.turnTimer--;
            if (fish.turnTimer <= 0) {
                fish.turnTimer = 100 + Math.random() * 200;
                fish.targetY = h * 0.15 + Math.random() * h * 0.7;
            }

            // Gentle steering toward target Y
            const dy = fish.targetY - fish.y;
            fish.vy += dy * 0.00005;
            fish.vy *= 0.99;

            fish.x += fish.vx * fish.speed;
            fish.y += fish.vy;

            // Wrap around screen
            const margin = 60;
            if (fish.vx < 0 && fish.x < -margin) {
                fish.x = w + margin;
                fish.y = h * 0.15 + Math.random() * h * 0.7;
            } else if (fish.vx > 0 && fish.x > w + margin) {
                fish.x = -margin;
                fish.y = h * 0.15 + Math.random() * h * 0.7;
            }

            drawFish(ctx, fish, t);
        });

        // Bubbles
        state.bubbles.forEach((bubble) => {
            bubble.y -= bubble.speed;
            bubble.wobble += 0.02;
            bubble.x += Math.sin(bubble.wobble) * 0.3;

            if (bubble.y < -10) {
                bubble.y = h + 10;
                bubble.x = Math.random() * w;
            }

            ctx.save();
            ctx.globalAlpha = bubble.opacity;
            ctx.beginPath();
            ctx.arc(bubble.x, bubble.y, bubble.size, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(0,216,255,0.5)';
            ctx.lineWidth = 0.5;
            ctx.stroke();

            // Bubble highlight
            ctx.beginPath();
            ctx.arc(bubble.x - bubble.size * 0.3, bubble.y - bubble.size * 0.3, bubble.size * 0.3, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255,255,255,0.4)';
            ctx.fill();
            ctx.restore();
        });

        // Suspended particles (plankton/dust)
        state.particles.forEach((p) => {
            p.y -= p.speed;
            p.x += p.drift + Math.sin(t * 0.001 + p.x * 0.01) * 0.05;
            if (p.y < -5) { p.y = h + 5; p.x = Math.random() * w; }
            if (p.x < -5) p.x = w + 5;
            if (p.x > w + 5) p.x = -5;

            ctx.save();
            ctx.globalAlpha = p.opacity;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(125,211,252,0.6)';
            ctx.fill();
            ctx.restore();
        });

        // Sea grass at bottom
        ctx.save();
        ctx.globalAlpha = 0.08;
        for (let i = 0; i < 12; i++) {
            const gx = (i / 12) * w + 30;
            const gh = 15 + Math.random() * 20;
            const sway = Math.sin(t * 0.001 + i * 0.8) * 8;

            ctx.beginPath();
            ctx.moveTo(gx, h);
            ctx.quadraticCurveTo(gx + sway, h - gh * 0.6, gx + sway * 1.5, h - gh);
            ctx.strokeStyle = '#22D3EE';
            ctx.lineWidth = 1.5;
            ctx.stroke();
        }
        ctx.restore();

        // Top surface glass reflection
        ctx.save();
        ctx.globalAlpha = 0.04;
        const glassReflect = ctx.createLinearGradient(0, 0, w * 0.5, h * 0.3);
        glassReflect.addColorStop(0, 'rgba(255,255,255,0.15)');
        glassReflect.addColorStop(0.5, 'rgba(255,255,255,0.05)');
        glassReflect.addColorStop(1, 'transparent');
        ctx.fillStyle = glassReflect;
        ctx.fillRect(0, 0, w, h * 0.4);
        ctx.restore();

        // Bottom vignette
        ctx.save();
        const vignette = ctx.createLinearGradient(0, h * 0.6, 0, h);
        vignette.addColorStop(0, 'transparent');
        vignette.addColorStop(1, 'rgba(7,26,45,0.6)');
        ctx.fillStyle = vignette;
        ctx.fillRect(0, 0, w, h);
        ctx.restore();

        timeRef.current += 16;
        animRef.current = requestAnimationFrame(draw);
    }, [init]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const resize = () => {
            const rect = canvas.parentElement?.getBoundingClientRect();
            if (rect) {
                canvas.width = rect.width;
                canvas.height = rect.height;
                stateRef.current.initialized = false;
            }
        };

        resize();
        window.addEventListener('resize', resize);
        animRef.current = requestAnimationFrame(draw);

        return () => {
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(animRef.current);
        };
    }, [draw]);

    return (
        <canvas
            ref={canvasRef}
            className="pointer-events-none absolute inset-0 -z-10 h-full w-full rounded-2xl"
            style={{ opacity: 0.9 }}
        />
    );
}
