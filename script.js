/**
* Planet Miner v2.0 - Galactic Edition
* Enhanced with State Machine, Prestige System, and Optimized Rendering
*/

// ==========================================
// CONFIGURATION
// ==========================================
const CONFIG = {
    SAVE_KEY: 'planetMiner_v2_save',
    SETTINGS_KEY: 'planetMiner_v2_settings',
    DAILY_KEY: 'planetMiner_v2_daily',
    SAVE_INTERVAL: 30000,
    OFFLINE_CAP: 8 * 60 * 60 * 1000,
    COMBO_DECAY: 2000,
    ASTEROID_CHANCE: 0.0005,
    FPS: 60,
    TIME_STEP: 1000 / 60,
    VERSION: '2.0.0'
};

// ==========================================
// GAME DATA
// ==========================================
const PLANETS = [
    { id: 'earth', name: 'Terra Prime', resource: 'Stone', icon: '🪨', baseValue: 1, color: '#4a90d9', atmosphere: '#87ceeb', unlockCost: 0, tier: 1 },
    { id: 'mars', name: 'Ares Station', resource: 'Iron', icon: '⚙️', baseValue: 5, color: '#c1440e', atmosphere: '#ff6b35', unlockCost: 1000, tier: 2 },
    { id: 'ice', name: 'Cryos VII', resource: 'Crystals', icon: '💎', baseValue: 25, color: '#e0f7fa', atmosphere: '#00e5ff', unlockCost: 10000, tier: 3 },
    { id: 'toxic', name: 'Venomia', resource: 'Uranium', icon: '☢️', baseValue: 100, color: '#76ff03', atmosphere: '#64dd17', unlockCost: 50000, tier: 4 },
    { id: 'lava', name: 'Infernus', resource: 'Rare Metals', icon: '🔥', baseValue: 500, color: '#ff3d00', atmosphere: '#ff9100', unlockCost: 250000, tier: 5 },
    { id: 'gas', name: 'Nebulon', resource: 'Exotic Gas', icon: '🌪️', baseValue: 2500, color: '#e1bee7', atmosphere: '#9c27b0', unlockCost: 1000000, tier: 6 },
    { id: 'diamond', name: 'Crystallis', resource: 'Star Diamonds', icon: '⭐', baseValue: 15000, color: '#ffffff', atmosphere: '#ffd700', unlockCost: 10000000, tier: 7 }
];

const UPGRADES = {
    mining: [
        { id: 'drill', name: 'Mining Drill', icon: '🔩', baseCost: 10, multiplier: 1.5, effect: 1, desc: '+1/click' },
        { id: 'laser', name: 'Laser Drill', icon: '🔦', baseCost: 100, multiplier: 1.6, effect: 5, desc: '+5/click' },
        { id: 'plasma', name: 'Plasma Cutter', icon: '⚡', baseCost: 1000, multiplier: 1.7, effect: 25, desc: '+25/click' },
        { id: 'quantum', name: 'Quantum Drill', icon: '🔮', baseCost: 10000, multiplier: 1.8, effect: 100, desc: '+100/click' }
    ],
    automation: [
        { id: 'drone', name: 'Mining Drone', icon: '🤖', baseCost: 50, multiplier: 1.5, effect: 1, desc: '+1/sec' },
        { id: 'robot', name: 'Auto-Miner', icon: '⚙️', baseCost: 500, multiplier: 1.6, effect: 5, desc: '+5/sec' },
        { id: 'station', name: 'Orbital Station', icon: '🛰️', baseCost: 5000, multiplier: 1.7, effect: 25, desc: '+25/sec' },
        { id: 'dyson', name: 'Dyson Sphere', icon: '☀️', baseCost: 50000, multiplier: 1.8, effect: 100, desc: '+100/sec' }
    ],
    bonus: [
        { id: 'multiplier', name: 'Rich Veins', icon: '💰', baseCost: 200, multiplier: 2, effect: 0.1, desc: '+10% click' },
        { id: 'crit', name: 'Critical Strike', icon: '🎯', baseCost: 1000, multiplier: 2.5, effect: 0.05, desc: '+5% crit' },
        { id: 'speed', name: 'Overclock', icon: '⏩', baseCost: 5000, multiplier: 3, effect: 0.1, desc: '+10% speed' }
    ]
};

const ACHIEVEMENTS = [
    { id: 'first_click', name: 'First Steps', desc: 'First click', icon: '👆', check: s => s.totalClicks >= 1 },
    { id: 'hundred_clicks', name: 'Click Master', desc: '100 clicks', icon: '🖱️', check: s => s.totalClicks >= 100 },
    { id: 'thousand_clicks', name: 'Click God', desc: '1,000 clicks', icon: '💪', check: s => s.totalClicks >= 1000 },
    { id: 'first_upgrade', name: 'Investor', desc: 'First upgrade', icon: '💼', check: s => s.totalUpgrades >= 1 },
    { id: 'ten_upgrades', name: 'Industrialist', desc: '10 upgrades', icon: '🏭', check: s => s.totalUpgrades >= 10 },
    { id: 'first_planet', name: 'Explorer', desc: 'Unlock planet', icon: '🚀', check: s => s.unlockedPlanets.length >= 2 },
    { id: 'all_planets', name: 'Galactic Emperor', desc: 'All planets', icon: '🌌', check: s => s.unlockedPlanets.length >= 7 },
    { id: 'first_million', name: 'Millionaire', desc: '1M minerals', icon: '💵', check: s => s.totalMined >= 1000000 },
    { id: 'first_billion', name: 'Billionaire', desc: '1B minerals', icon: '💎', check: s => s.totalMined >= 1000000000 },
    { id: 'combo_10', name: 'Combo Starter', desc: '10x combo', icon: '🔥', check: s => s.maxCombo >= 10 },
    { id: 'combo_50', name: 'Combo Master', desc: '50x combo', icon: '⚡', check: s => s.maxCombo >= 50 },
    { id: 'combo_100', name: 'Combo God', desc: '100x combo', icon: '👑', check: s => s.maxCombo >= 100 },
    { id: 'asteroid_hunter', name: 'Asteroid Hunter', desc: '10 asteroids', icon: '☄️', check: s => s.asteroidsClicked >= 10 },
    { id: 'idle_beginner', name: 'Lazy Miner', desc: '1K idle', icon: '😴', check: s => s.idleEarned >= 1000 },
    { id: 'idle_master', name: 'Sleeping Giant', desc: '1M idle', icon: '🛌', check: s => s.idleEarned >= 1000000 },
    { id: 'speed_demon', name: 'Speed Demon', desc: '1K/sec', icon: '🏎️', check: s => s.maxPerSec >= 1000 },
    { id: 'collector', name: 'Collector', desc: '100 upgrades', icon: '📦', check: s => s.totalUpgrades >= 100 },
    { id: 'first_prestige', name: 'New Beginning', desc: 'First prestige', icon: '✨', check: s => s.prestigeCount >= 1 },
    { id: 'dedication', name: 'Dedication', desc: '1 hour played', icon: '⏰', check: s => s.playTime >= 3600000 },
    { id: 'veteran', name: 'Veteran', desc: '24 hours played', icon: '🏆', check: s => s.playTime >= 86400000 }
];

// ==========================================
// UTILITY FUNCTIONS
// ==========================================
const Utils = {
    formatNumber(num) {
        if (num < 1000) return Math.floor(num).toString();
        const suffixes = ['', 'K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc', 'No', 'Dc'];
        const suffixNum = Math.floor(Math.log10(num) / 3);
        return (num / Math.pow(1000, suffixNum)).toFixed(2) + suffixes[suffixNum];
    },

    formatTime(ms) {
        const s = Math.floor(ms / 1000);
        const m = Math.floor(s / 60);
        const h = Math.floor(m / 60);
        const d = Math.floor(h / 24);
        if (d > 0) return `${d}d ${h % 24}h`;
        if (h > 0) return `${h}h ${m % 60}m`;
        if (m > 0) return `${m}m ${s % 60}s`;
        return `${s}s`;
    },

    random(min, max) {
        return Math.random() * (max - min) + min;
    },

    pointInCircle(px, py, cx, cy, r) {
        const dx = px - cx;
        const dy = py - cy;
        return dx * dx + dy * dy <= r * r;
    },

    calculateCost(base, mult, level) {
        return Math.floor(base * Math.pow(mult, level));
    },

    // Fast rounding for canvas coordinates [^12^]
    round(n) {
        return (n + 0.5) << 0;
    }
};

// ==========================================
// STATE MACHINE
// ==========================================
class StateMachine {
    constructor() {
        this.state = 'MENU';
        this.states = {
            MENU: { enter: () => this.showScreen('main-menu'), exit: () => {} },
            TUTORIAL: { enter: () => this.showScreen('tutorial-screen'), exit: () => {} },
            GAME: { enter: () => this.showScreen('game-screen'), exit: () => {} },
            PAUSE: { enter: () => this.showScreen('pause-menu'), exit: () => {} },
            SETTINGS: { enter: () => this.showScreen('settings-screen'), exit: () => {} },
            STATS: { enter: () => { this.showScreen('stats-screen'); this.updateStats(); }, exit: () => {} },
            PRESTIGE: { enter: () => { this.showScreen('prestige-screen'); this.updatePrestigeScreen(); }, exit: () => {} }
        };
    }

    transition(newState) {
        if (this.states[this.state]) {
            this.states[this.state].exit();
        }
        this.state = newState;
        if (this.states[this.state]) {
            this.states[this.state].enter();
        }
    }

    showScreen(id) {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        document.getElementById(id)?.classList.add('active');
    }

    updateStats() {
        // Delegated to game instance
        if (window.game) window.game.updateStatsDisplay();
    }

    updatePrestigeScreen() {
        if (window.game) window.game.updatePrestigeDisplay();
    }
}

// ==========================================
// PARTICLE SYSTEM (Optimized)
// ==========================================
class ParticleSystem {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.particles = [];
        this.stars = [];
        this.asteroids = [];
        this.dirtyRegions = [];
       
        this.initStars();
    }

    initStars() {
        for (let i = 0; i < 150; i++) {
            this.stars.push({
                x: Utils.round(Math.random() * this.canvas.width),
                y: Utils.round(Math.random() * this.canvas.height),
                size: Utils.round(Math.random() * 2 + 0.5),
                alpha: Math.random() * 0.8 + 0.2,
                twinkleSpeed: Math.random() * 0.02 + 0.01,
                phase: Math.random() * Math.PI * 2
            });
        }
    }

    createMiningParticles(x, y, color, count = 5) {
        if (!window.game?.settings?.particles) return;
       
        x = Utils.round(x);
        y = Utils.round(y);
       
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 / count) * i + Math.random() * 0.5;
            const speed = Utils.random(2, 5);
            this.particles.push({
                x, y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 1,
                decay: Utils.random(0.01, 0.03),
                size: Utils.round(Utils.random(2, 6)),
                color
            });
        }
    }

    createExplosion(x, y, color, count = 15) {
        if (!window.game?.settings?.particles) return;
       
        x = Utils.round(x);
        y = Utils.round(y);
       
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Utils.random(3, 8);
            this.particles.push({
                x, y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 1,
                decay: Utils.random(0.02, 0.04),
                size: Utils.round(Utils.random(3, 8)),
                color
            });
        }
    }

    createAsteroid() {
        const side = Math.floor(Math.random() * 4);
        let x, y, vx, vy;
       
        switch(side) {
            case 0: x = Utils.random(0, this.canvas.width); y = -50; vx = Utils.random(-2, 2); vy = Utils.random(2, 5); break;
            case 1: x = this.canvas.width + 50; y = Utils.random(0, this.canvas.height); vx = Utils.random(-5, -2); vy = Utils.random(-2, 2); break;
            case 2: x = Utils.random(0, this.canvas.width); y = this.canvas.height + 50; vx = Utils.random(-2, 2); vy = Utils.random(-5, -2); break;
            case 3: x = -50; y = Utils.random(0, this.canvas.height); vx = Utils.random(2, 5); vy = Utils.random(-2, 2); break;
        }

        this.asteroids.push({
            x: Utils.round(x),
            y: Utils.round(y),
            vx, vy,
            size: Utils.round(Utils.random(20, 40)),
            rotation: 0,
            rotSpeed: Utils.random(-0.1, 0.1),
            health: 3,
            maxHealth: 3
        });

        this.showAsteroidEvent();
    }

    showAsteroidEvent() {
        const el = document.getElementById('asteroid-event');
        el.classList.remove('hidden');
        setTimeout(() => el.classList.add('hidden'), 5000);
    }

    update() {
        // Update particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.life -= p.decay;
            p.vx *= 0.98;
            p.vy *= 0.98;

            if (p.life <= 0) {
                this.particles.splice(i, 1);
            }
        }

        // Update stars
        this.stars.forEach(s => {
            s.phase += s.twinkleSpeed;
            s.currentAlpha = s.alpha * (0.7 + 0.3 * Math.sin(s.phase));
        });

        // Update asteroids
        for (let i = this.asteroids.length - 1; i >= 0; i--) {
            const a = this.asteroids[i];
            a.x += a.vx;
            a.y += a.vy;
            a.rotation += a.rotSpeed;

            if (a.x < -100 || a.x > this.canvas.width + 100 ||
                a.y < -100 || a.y > this.canvas.height + 100) {
                this.asteroids.splice(i, 1);
            }
        }
    }

    // Batch rendering for performance [^15^]
    draw(ctx) {
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Batch draw stars
        ctx.fillStyle = '#ffffff';
        this.stars.forEach(s => {
            ctx.globalAlpha = s.currentAlpha;
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
            ctx.fill();
        });

        // Batch draw particles by color
        const particlesByColor = {};
        this.particles.forEach(p => {
            if (!particlesByColor[p.color]) particlesByColor[p.color] = [];
            particlesByColor[p.color].push(p);
        });

        Object.entries(particlesByColor).forEach(([color, parts]) => {
            ctx.fillStyle = color;
            parts.forEach(p => {
                ctx.globalAlpha = p.life;
                const size = Utils.round(p.size * p.life);
                ctx.beginPath();
                ctx.arc(Utils.round(p.x), Utils.round(p.y), size, 0, Math.PI * 2);
                ctx.fill();
            });
        });

        ctx.globalAlpha = 1;

        // Draw asteroids
        this.asteroids.forEach(a => {
            ctx.save();
            ctx.translate(Utils.round(a.x), Utils.round(a.y));
            ctx.rotate(a.rotation);
           
            ctx.fillStyle = '#8b7355';
            ctx.strokeStyle = '#654321';
            ctx.lineWidth = 2;
           
            ctx.beginPath();
            const points = 8;
            for (let i = 0; i < points; i++) {
                const angle = (i / points) * Math.PI * 2;
                const r = a.size * (0.8 + Math.random() * 0.4);
                const px = Math.cos(angle) * r;
                const py = Math.sin(angle) * r;
                if (i === 0) ctx.moveTo(px, py);
                else ctx.lineTo(px, py);
            }
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            ctx.restore();

            // Health bar
            const hp = a.health / a.maxHealth;
            ctx.fillStyle = `hsl(${hp * 120}, 100%, 50%)`;
            ctx.fillRect(Utils.round(a.x - 20), Utils.round(a.y - a.size - 10), Utils.round(40 * hp), 4);
        });
    }

    checkClick(x, y) {
        for (let i = this.asteroids.length - 1; i >= 0; i--) {
            const a = this.asteroids[i];
            if (Utils.pointInCircle(x, y, a.x, a.y, a.size)) {
                a.health--;
                this.createMiningParticles(x, y, '#ffaa00', 3);
               
                if (a.health <= 0) {
                    this.createExplosion(a.x, a.y, '#ff6b35', 20);
                    this.asteroids.splice(i, 1);
                    return { hit: true, destroyed: true };
                }
                return { hit: true, destroyed: false };
            }
        }
        return { hit: false };
    }
}

// ==========================================
// PLANET RENDERER (Optimized)
// ==========================================
class PlanetRenderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.rotation = 0;
        this.pulsePhase = 0;
        this.cache = new Map(); // Cache gradients
    }

    update(dt) {
        this.rotation += 0.001 * dt;
        this.pulsePhase += 0.002 * dt;
    }

    draw(planet, cx, cy, radius) {
        const ctx = this.ctx;
        const r = Utils.round(radius);
        const x = Utils.round(cx);
        const y = Utils.round(cy);

        // Atmosphere glow
        const cacheKey = `atm_${planet.atmosphere}`;
        if (!this.cache.has(cacheKey)) {
            const g = ctx.createRadialGradient(0, 0, r, 0, 0, r * 1.5);
            g.addColorStop(0, planet.atmosphere + '40');
            g.addColorStop(0.5, planet.atmosphere + '20');
            g.addColorStop(1, 'transparent');
            this.cache.set(cacheKey, g);
        }
       
        ctx.fillStyle = this.cache.get(cacheKey);
        ctx.beginPath();
        ctx.arc(x, y, r * 1.5, 0, Math.PI * 2);
        ctx.fill();

        // Planet body
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(this.rotation);

        const bodyKey = `body_${planet.color}`;
        if (!this.cache.has(bodyKey)) {
            const g = ctx.createRadialGradient(-r * 0.3, -r * 0.3, 0, 0, 0, r);
            g.addColorStop(0, this.lighten(planet.color, 40));
            g.addColorStop(0.5, planet.color);
            g.addColorStop(1, this.darken(planet.color, 40));
            this.cache.set(bodyKey, g);
        }

        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.fillStyle = this.cache.get(bodyKey);
        ctx.fill();

        // Surface details
        ctx.globalCompositeOperation = 'multiply';
        ctx.fillStyle = 'rgba(0,0,0,0.2)';
        const seed = planet.id.charCodeAt(0);
        for (let i = 0; i < 5; i++) {
            const ang = (i / 5) * Math.PI * 2 + seed;
            const d = r * 0.5;
            ctx.beginPath();
            ctx.arc(Math.cos(ang) * d, Math.sin(ang) * d, r * (0.15 + (i % 3) * 0.05), 0, Math.PI * 2);
            ctx.fill();
        }
       
        ctx.globalCompositeOperation = 'source-over';
        ctx.restore();

        // Pulse ring
        const pulse = 1 + Math.sin(this.pulsePhase) * 0.05;
        ctx.beginPath();
        ctx.arc(x, y, r * 1.3 * pulse, 0, Math.PI * 2);
        ctx.strokeStyle = planet.atmosphere + '30';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Gas giant ring
        if (planet.id === 'gas') {
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(Math.PI / 6);
            ctx.beginPath();
            ctx.ellipse(0, 0, r * 2, r * 0.4, 0, 0, Math.PI * 2);
            ctx.strokeStyle = planet.atmosphere + '60';
            ctx.lineWidth = 8;
            ctx.stroke();
            ctx.restore();
        }
    }

    lighten(c, p) {
        const n = parseInt(c.slice(1), 16);
        const a = Math.round(2.55 * p);
        return '#' + [Math.min(255, (n >> 16) + a), Math.min(255, ((n >> 8) & 0xFF) + a), Math.min(255, (n & 0xFF) + a)]
            .map(v => v.toString(16).padStart(2, '0')).join('');
    }

    darken(c, p) {
        const n = parseInt(c.slice(1), 16);
        const a = Math.round(2.55 * p);
        return '#' + [Math.max(0, (n >> 16) - a), Math.max(0, ((n >> 8) & 0xFF) - a), Math.max(0, (n & 0xFF) - a)]
            .map(v => v.toString(16).padStart(2, '0')).join('');
    }

    clearCache() {
        this.cache.clear();
    }
}

// ==========================================
// GAME STATE
// ==========================================
class GameState {
    constructor() {
        this.reset();
        this.load();
    }

    reset() {
        this.minerals = 0;
        this.totalMined = 0;
        this.totalSpent = 0;
        this.totalClicks = 0;
        this.currentPlanet = 0;
        this.unlockedPlanets = ['earth'];
        this.upgrades = {};
        this.achievements = [];
        this.lastSave = Date.now();
        this.startTime = Date.now();
        this.playTime = 0;
        this.combo = 0;
        this.maxCombo = 0;
        this.lastClick = 0;
        this.asteroidsClicked = 0;
        this.idleEarned = 0;
        this.maxPerSec = 0;
        this.totalUpgrades = 0;
        this.prestigeCount = 0;
        this.essence = 0;
       
        Object.keys(UPGRADES).forEach(cat => {
            UPGRADES[cat].forEach(u => this.upgrades[u.id] = 0);
        });
    }

    get prestigeMultiplier() {
        return 1 + (this.essence * 0.05);
    }

    getClickValue() {
        const planet = PLANETS[this.currentPlanet];
        let val = planet.baseValue;
       
        UPGRADES.mining.forEach(u => {
            val += u.effect * (this.upgrades[u.id] || 0);
        });

        const mult = this.upgrades['multiplier'] || 0;
        val *= (1 + mult * 0.1);
        val *= (1 + this.combo * 0.1);
        val *= this.prestigeMultiplier;
       
        return Math.max(1, Math.floor(val));
    }

    getPerSecond() {
        let val = 0;
        UPGRADES.automation.forEach(u => {
            val += u.effect * (this.upgrades[u.id] || 0);
        });
       
        const speed = this.upgrades['speed'] || 0;
        val *= (1 + speed * 0.1);
        val *= PLANETS[this.currentPlanet].baseValue;
        val *= this.prestigeMultiplier;
       
        return val;
    }

    getCritChance() {
        return Math.min(0.5, (this.upgrades['crit'] || 0) * 0.05);
    }

    click() {
        this.totalClicks++;
        const now = Date.now();
       
        if (now - this.lastClick < CONFIG.COMBO_DECAY) {
            this.combo++;
        } else {
            this.combo = 1;
        }
        this.lastClick = now;
        this.maxCombo = Math.max(this.maxCombo, this.combo);

        let val = this.getClickValue();
        const crit = Math.random() < this.getCritChance();
        if (crit) val *= 2;

        this.minerals += val;
        this.totalMined += val;
       
        return { value: val, crit, combo: this.combo };
    }

    buyUpgrade(cat, id) {
        const upg = UPGRADES[cat].find(u => u.id === id);
        if (!upg) return false;
       
        const lvl = this.upgrades[id] || 0;
        const cost = Utils.calculateCost(upg.baseCost, upg.multiplier, lvl);
       
        if (this.minerals >= cost) {
            this.minerals -= cost;
            this.totalSpent += cost;
            this.upgrades[id] = lvl + 1;
            this.totalUpgrades++;
            return true;
        }
        return false;
    }

    unlockPlanet(id) {
        const p = PLANETS.find(x => x.id === id);
        if (!p || this.unlockedPlanets.includes(id)) return false;
       
        if (this.minerals >= p.unlockCost) {
            this.minerals -= p.unlockCost;
            this.totalSpent += p.unlockCost;
            this.unlockedPlanets.push(id);
            return true;
        }
        return false;
    }

    calculatePrestigeGain() {
        return Math.floor(Math.sqrt(this.totalMined / 1e9));
    }

    prestige() {
        const gain = this.calculatePrestigeGain();
        if (gain <= 0) return false;
       
        this.essence += gain;
        this.prestigeCount++;
       
        // Reset progress
        this.minerals = 0;
        this.currentPlanet = 0;
        this.unlockedPlanets = ['earth'];
        this.upgrades = {};
        Object.keys(UPGRADES).forEach(cat => {
            UPGRADES[cat].forEach(u => this.upgrades[u.id] = 0);
        });
       
        this.totalUpgrades = 0;
        this.combo = 0;
        this.lastClick = 0;
       
        return true;
    }

    checkAchievements() {
        const newAch = [];
        ACHIEVEMENTS.forEach(a => {
            if (!this.achievements.includes(a.id) && a.check(this)) {
                this.achievements.push(a.id);
                newAch.push(a);
            }
        });
        return newAch;
    }

    save() {
        const data = {
            minerals: this.minerals,
            totalMined: this.totalMined,
            totalSpent: this.totalSpent,
            totalClicks: this.totalClicks,
            currentPlanet: this.currentPlanet,
            unlockedPlanets: this.unlockedPlanets,
            upgrades: this.upgrades,
            achievements: this.achievements,
            lastSave: Date.now(),
            startTime: this.startTime,
            playTime: this.playTime + (Date.now() - this.startTime),
            maxCombo: this.maxCombo,
            asteroidsClicked: this.asteroidsClicked,
            idleEarned: this.idleEarned,
            maxPerSec: this.maxPerSec,
            totalUpgrades: this.totalUpgrades,
            prestigeCount: this.prestigeCount,
            essence: this.essence,
            version: CONFIG.VERSION
        };
        localStorage.setItem(CONFIG.SAVE_KEY, JSON.stringify(data));
    }

    load() {
        const saved = localStorage.getItem(CONFIG.SAVE_KEY);
        if (!saved) return;
       
        try {
            const d = JSON.parse(saved);
            if (d.version !== CONFIG.VERSION) {
                console.log('Save version mismatch, attempting migration...');
            }
           
            this.minerals = d.minerals || 0;
            this.totalMined = d.totalMined || 0;
            this.totalSpent = d.totalSpent || 0;
            this.totalClicks = d.totalClicks || 0;
            this.currentPlanet = d.currentPlanet || 0;
            this.unlockedPlanets = d.unlockedPlanets || ['earth'];
            this.upgrades = d.upgrades || {};
            this.achievements = d.achievements || [];
            this.playTime = d.playTime || 0;
            this.maxCombo = d.maxCombo || 0;
            this.asteroidsClicked = d.asteroidsClicked || 0;
            this.idleEarned = d.idleEarned || 0;
            this.maxPerSec = d.maxPerSec || 0;
            this.totalUpgrades = d.totalUpgrades || 0;
            this.prestigeCount = d.prestigeCount || 0;
            this.essence = d.essence || 0;
            this.startTime = Date.now();
           
            // Offline earnings
            const offline = Math.min(Date.now() - (d.lastSave || Date.now()), CONFIG.OFFLINE_CAP);
            if (offline > 60000) {
                const earned = this.getPerSecond() * (offline / 1000) * 0.5;
                if (earned > 0) {
                    this.showOfflineModal(earned, offline);
                    this.minerals += earned;
                    this.totalMined += earned;
                    this.idleEarned += earned;
                }
            }
        } catch (e) {
            console.error('Load failed:', e);
        }
    }

    showOfflineModal(amount, time) {
        const modal = document.getElementById('offline-modal');
        document.getElementById('offline-resources').textContent = `${Utils.formatNumber(amount)} Minerals`;
        document.getElementById('offline-time').textContent = `Away for ${Utils.formatTime(time)}`;
        modal.classList.remove('hidden');
       
        document.getElementById('offline-confirm').onclick = () => {
            modal.classList.add('hidden');
        };
    }

    export() {
        return btoa(JSON.stringify({
            state: {
                minerals: this.minerals,
                totalMined: this.totalMined,
                totalSpent: this.totalSpent,
                totalClicks: this.totalClicks,
                currentPlanet: this.currentPlanet,
                unlockedPlanets: this.unlockedPlanets,
                upgrades: this.upgrades,
                achievements: this.achievements,
                playTime: this.playTime + (Date.now() - this.startTime),
                maxCombo: this.maxCombo,
                asteroidsClicked: this.asteroidsClicked,
                idleEarned: this.idleEarned,
                maxPerSec: this.maxPerSec,
                totalUpgrades: this.totalUpgrades,
                prestigeCount: this.prestigeCount,
                essence: this.essence
            },
            daily: localStorage.getItem(CONFIG.DAILY_KEY),
            version: CONFIG.VERSION
        }));
    }

    import(data) {
        try {
            const parsed = JSON.parse(atob(data));
            if (parsed.version !== CONFIG.VERSION) {
                throw new Error('Version mismatch');
            }
           
            const s = parsed.state;
            this.minerals = s.minerals;
            this.totalMined = s.totalMined;
            this.totalSpent = s.totalSpent;
            this.totalClicks = s.totalClicks;
            this.currentPlanet = s.currentPlanet;
            this.unlockedPlanets = s.unlockedPlanets;
            this.upgrades = s.upgrades;
            this.achievements = s.achievements;
            this.playTime = s.playTime;
            this.maxCombo = s.maxCombo;
            this.asteroidsClicked = s.asteroidsClicked;
            this.idleEarned = s.idleEarned;
            this.maxPerSec = s.maxPerSec;
            this.totalUpgrades = s.totalUpgrades;
            this.prestigeCount = s.prestigeCount;
            this.essence = s.essence;
            this.startTime = Date.now();
           
            if (parsed.daily) {
                localStorage.setItem(CONFIG.DAILY_KEY, parsed.daily);
            }
           
            return true;
        } catch (e) {
            console.error('Import failed:', e);
            return false;
        }
    }
}

// ==========================================
// DAILY BONUS SYSTEM
// ==========================================
class DailyBonus {
    constructor() {
        this.load();
    }

    load() {
        const saved = localStorage.getItem(CONFIG.DAILY_KEY);
        if (saved) {
            const d = JSON.parse(saved);
            this.lastClaim = d.lastClaim || 0;
            this.streak = d.streak || 0;
        } else {
            this.lastClaim = 0;
            this.streak = 0;
        }
    }

    save() {
        localStorage.setItem(CONFIG.DAILY_KEY, JSON.stringify({
            lastClaim: this.lastClaim,
            streak: this.streak
        }));
    }

    canClaim() {
        const now = new Date();
        const last = new Date(this.lastClaim);
        const diff = now - last;
       
        // Can claim if more than 20 hours passed (allows some flexibility)
        return diff > 20 * 60 * 60 * 1000;
    }

    getReward() {
        const rewards = [100, 250, 500, 1000, 2500, 5000, { essence: 1 }];
        const day = Math.min(this.streak % 7, 6);
        return rewards[day];
    }

    claim() {
        if (!this.canClaim()) return null;
       
        const reward = this.getReward();
        const now = Date.now();
       
        // Check if streak continues (within 48 hours)
        if (now - this.lastClaim < 48 * 60 * 60 * 1000) {
            this.streak++;
        } else {
            this.streak = 1;
        }
       
        this.lastClaim = now;
        this.save();
       
        return reward;
    }

    getTimeUntilNext() {
        const next = this.lastClaim + 24 * 60 * 60 * 1000;
        return Math.max(0, next - Date.now());
    }
}

// ==========================================
// UI MANAGER
// ==========================================
class UIManager {
    constructor(game) {
        this.game = game;
        this.currentTab = 'mining';
        this.init();
    }

    init() {
        this.setupListeners();
        this.renderPlanets();
        this.renderUpgrades();
        this.renderAchievements();
    }

    setupListeners() {
        // Menu buttons
        document.getElementById('btn-newgame')?.addEventListener('click', () => {
            this.game.stateMachine.transition('TUTORIAL');
        });
       
        document.getElementById('btn-continue')?.addEventListener('click', () => {
            this.game.stateMachine.transition('GAME');
        });
       
        document.getElementById('btn-settings')?.addEventListener('click', () => {
            this.game.stateMachine.transition('SETTINGS');
        });
       
        document.getElementById('btn-stats')?.addEventListener('click', () => {
            this.game.stateMachine.transition('STATS');
        });
       
        document.getElementById('btn-help')?.addEventListener('click', () => {
            this.game.stateMachine.transition('TUTORIAL');
        });
       
        document.getElementById('btn-prestige')?.addEventListener('click', () => {
            this.game.stateMachine.transition('PRESTIGE');
        });

        // Pause menu
        document.getElementById('btn-pause')?.addEventListener('click', () => {
            this.game.stateMachine.transition('PAUSE');
        });
       
        document.getElementById('btn-resume')?.addEventListener('click', () => {
            this.game.stateMachine.transition('GAME');
        });
       
        document.getElementById('btn-mainmenu')?.addEventListener('click', () => {
            this.game.state.save();
            this.game.stateMachine.transition('MENU');
        });
       
        document.getElementById('btn-save')?.addEventListener('click', () => {
            this.game.state.save();
            this.showToast('Game Saved!', 'success');
        });

        // Settings
        document.getElementById('btn-close-settings')?.addEventListener('click', () => {
            this.game.stateMachine.transition('MENU');
        });
       
        document.getElementById('volume-slider')?.addEventListener('input', (e) => {
            this.game.settings.volume = e.target.value / 100;
            document.getElementById('volume-value').textContent = e.target.value + '%';
        });
       
        ['particles', 'floating', 'shake', 'autosave'].forEach(id => {
            document.getElementById(`${id}-toggle`)?.addEventListener('change', (e) => {
                this.game.settings[id] = e.target.checked;
            });
        });
       
        document.getElementById('btn-reset')?.addEventListener('click', () => {
            if (confirm('Are you sure? This will delete ALL progress forever!')) {
                localStorage.removeItem(CONFIG.SAVE_KEY);
                localStorage.removeItem(CONFIG.DAILY_KEY);
                this.game.state.reset();
                this.showToast('Progress Reset', 'info');
                this.game.stateMachine.transition('MENU');
            }
        });
       
        document.getElementById('btn-export')?.addEventListener('click', () => {
            const data = this.game.state.export();
            navigator.clipboard.writeText(data).then(() => {
                this.showToast('Save code copied to clipboard!', 'success');
            });
        });
       
        document.getElementById('btn-import')?.addEventListener('click', () => {
            const data = prompt('Paste your save code:');
            if (data && this.game.state.import(data)) {
                this.showToast('Save imported successfully!', 'success');
                this.renderPlanets();
                this.renderUpgrades();
            } else {
                this.showToast('Invalid save code!', 'error');
            }
        });

        // Stats
        document.getElementById('btn-close-stats')?.addEventListener('click', () => {
            this.game.stateMachine.transition('MENU');
        });

        // Prestige
        document.getElementById('btn-confirm-prestige')?.addEventListener('click', () => {
            if (this.game.state.prestige()) {
                this.showToast('Prestige successful! +' + this.game.state.essence + ' Essence', 'success');
                this.game.planetRenderer.clearCache();
                this.game.stateMachine.transition('GAME');
            }
        });
       
        document.getElementById('btn-cancel-prestige')?.addEventListener('click', () => {
            this.game.stateMachine.transition('MENU');
        });

        // Daily bonus
        document.getElementById('daily-bonus-btn')?.addEventListener('click', () => {
            this.showDailyBonus();
        });
       
        document.getElementById('btn-claim-bonus')?.addEventListener('click', () => {
            const reward = this.game.daily.claim();
            if (reward) {
                if (typeof reward === 'number') {
                    this.game.state.minerals += reward;
                    this.game.state.totalMined += reward;
                    this.showToast(`Claimed ${reward} minerals!`, 'success');
                } else {
                    this.game.state.essence += reward.essence;
                    this.showToast(`Claimed ${reward.essence} Star Essence!`, 'success');
                }
                document.getElementById('daily-bonus-modal').classList.add('hidden');
            }
        });

        // Upgrade tabs
        document.querySelectorAll('#upgrade-tabs .tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('#upgrade-tabs .tab-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentTab = e.target.dataset.tab;
                this.renderUpgrades();
            });
        });

        // Planet navigation
        document.getElementById('prev-planet')?.addEventListener('click', () => {
            if (this.game.state.currentPlanet > 0) {
                this.game.state.currentPlanet--;
                this.game.planetRenderer.rotation = 0;
                this.renderPlanets();
            }
        });
       
        document.getElementById('next-planet')?.addEventListener('click', () => {
            if (this.game.state.currentPlanet < PLANETS.length - 1) {
                const next = PLANETS[this.game.state.currentPlanet + 1];
                if (this.game.state.unlockedPlanets.includes(next.id)) {
                    this.game.state.currentPlanet++;
                    this.game.planetRenderer.rotation = 0;
                    this.renderPlanets();
                }
            }
        });

        // Tutorial
        let tutStep = 1;
        const updateTut = () => {
            document.querySelectorAll('.tutorial-step').forEach(s => s.classList.remove('active'));
            document.querySelector(`.tutorial-step[data-step="${tutStep}"]`)?.classList.add('active');
            document.querySelectorAll('.dot').forEach((d, i) => d.classList.toggle('active', i + 1 === tutStep));
            document.getElementById('tut-prev').disabled = tutStep === 1;
            document.getElementById('tut-next').textContent = tutStep === 4 ? 'Start Game' : 'Next';
        };
       
        document.getElementById('tut-prev')?.addEventListener('click', () => {
            if (tutStep > 1) { tutStep--; updateTut(); }
        });
       
        document.getElementById('tut-next')?.addEventListener('click', () => {
            if (tutStep < 4) { tutStep++; updateTut(); }
            else { this.game.stateMachine.transition('GAME'); }
        });
       
        document.getElementById('tut-skip')?.addEventListener('click', () => {
            this.game.stateMachine.transition('GAME');
        });
    }

    renderPlanets() {
        const container = document.getElementById('planet-selector');
        if (!container) return;
       
        container.innerHTML = '';
       
        PLANETS.forEach((p, i) => {
            const btn = document.createElement('button');
            btn.className = 'planet-btn';
            btn.dataset.name = p.name;
           
            const unlocked = this.game.state.unlockedPlanets.includes(p.id);
            const active = i === this.game.state.currentPlanet;
           
            if (!unlocked) btn.classList.add('locked');
            if (active) btn.classList.add('active');
           
            btn.style.background = `radial-gradient(circle at 30% 30%, ${p.color}, #000)`;
           
            btn.addEventListener('click', () => {
                if (unlocked) {
                    this.game.state.currentPlanet = i;
                    this.renderPlanets();
                } else if (this.game.state.unlockPlanet(p.id)) {
                    this.showToast(`Unlocked ${p.name}!`, 'success');
                    this.renderPlanets();
                }
            });
           
            container.appendChild(btn);
        });
       
        document.getElementById('prev-planet').disabled = this.game.state.currentPlanet === 0;
        const next = PLANETS[this.game.state.currentPlanet + 1];
        document.getElementById('next-planet').disabled =
            this.game.state.currentPlanet >= PLANETS.length - 1 ||
            !this.game.state.unlockedPlanets.includes(next?.id);
    }

    renderUpgrades() {
        const container = document.getElementById('upgrade-list');
        if (!container) return;
       
        container.innerHTML = '';
        const upgrades = UPGRADES[this.currentTab] || [];
       
        upgrades.forEach(u => {
            const lvl = this.game.state.upgrades[u.id] || 0;
            const cost = Utils.calculateCost(u.baseCost, u.multiplier, lvl);
            const canAfford = this.game.state.minerals >= cost;
           
            const div = document.createElement('div');
            div.className = `upgrade-item ${canAfford ? '' : 'locked'}`;
            div.innerHTML = `
                <div class="upgrade-level">Lvl ${lvl}</div>
                <div class="upgrade-header">
                    <div class="upgrade-icon">${u.icon}</div>
                    <div class="upgrade-info">
                        <h4>${u.name}</h4>
                        <p>${u.desc}</p>
                    </div>
                </div>
                <div class="upgrade-cost ${canAfford ? 'affordable' : ''}">
                    💎 ${Utils.formatNumber(cost)}
                </div>
            `;
           
            div.addEventListener('click', () => {
                if (this.game.state.buyUpgrade(this.currentTab, u.id)) {
                    this.renderUpgrades();
                    this.game.audio.playUpgrade();
                }
            });
           
            container.appendChild(div);
        });
    }

    renderAchievements() {
        const container = document.getElementById('achievements-list');
        if (!container) return;
       
        container.innerHTML = '';
       
        ACHIEVEMENTS.slice(0, 5).forEach(a => {
            const unlocked = this.game.state.achievements.includes(a.id);
            const div = document.createElement('div');
            div.className = `achievement ${unlocked ? 'unlocked' : ''}`;
            div.innerHTML = `
                <span class="achievement-icon">${unlocked ? a.icon : '🔒'}</span>
                <span>${a.name}</span>
            `;
            container.appendChild(div);
        });
    }

    updateUI() {
        const s = this.game.state;
        const p = PLANETS[s.currentPlanet];
       
        document.getElementById('resource-count').textContent = Utils.formatNumber(Math.floor(s.minerals));
        document.getElementById('resource-name').textContent = p.resource;
        document.getElementById('resource-icon').textContent = p.icon;
       
        const perSec = s.getPerSecond();
        document.getElementById('resource-per-sec').textContent = `(+${Utils.formatNumber(perSec)}/s)`;
        s.maxPerSec = Math.max(s.maxPerSec, perSec);
       
        document.getElementById('current-planet-name').textContent = p.name;
        document.getElementById('planet-tier').textContent = `Tier ${p.tier}`;
       
        document.getElementById('combo-count').textContent = `x${s.combo}`;
        const comboProgress = Math.max(0, 1 - (Date.now() - s.lastClick) / CONFIG.COMBO_DECAY);
        document.getElementById('combo-bar').style.width = `${comboProgress * 100}%`;
       
        document.getElementById('essence-count').textContent = s.essence;
        document.querySelector('.essence-multiplier').textContent = `+${(s.prestigeMultiplier - 1) * 100}% all resources`;
       
        this.renderUpgrades();
    }

    showFloatingText(x, y, text, type = 'normal') {
        if (!this.game.settings.floating) return;
       
        const container = document.getElementById('floating-text-container');
        const el = document.createElement('div');
        el.className = `floating-text ${type}`;
        el.textContent = text;
        el.style.left = `${x}px`;
        el.style.top = `${y}px`;
        el.style.transform = `translateX(${Utils.random(-20, 20)}px)`;
       
        container.appendChild(el);
        setTimeout(() => el.remove(), 1500);
    }

    showToast(message, type = 'info') {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        container.appendChild(toast);
       
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    showDailyBonus() {
        const modal = document.getElementById('daily-bonus-modal');
        const canClaim = this.game.daily.canClaim();
       
        document.querySelectorAll('.day').forEach((d, i) => {
            d.classList.remove('current', 'claimed');
            if (i < this.game.daily.streak % 7) d.classList.add('claimed');
            if (i === this.game.daily.streak % 7) d.classList.add('current');
        });
       
        const btn = document.getElementById('btn-claim-bonus');
        btn.disabled = !canClaim;
        btn.textContent = canClaim ? 'Claim Reward' : `Next in ${Utils.formatTime(this.game.daily.getTimeUntilNext())}`;
       
        modal.classList.remove('hidden');
    }
}

// ==========================================
// AUDIO MANAGER
// ==========================================
class AudioManager {
    constructor() {
        this.ctx = null;
        this.enabled = true;
        this.volume = 0.5;
    }

    init() {
        try {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.log('Audio not supported');
        }
    }

    playTone(freq, duration, type = 'sine', vol = 0.1) {
        if (!this.ctx || !this.enabled) return;
       
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
       
        osc.frequency.value = freq;
        osc.type = type;
       
        const v = vol * this.volume;
        gain.gain.setValueAtTime(v, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);
       
        osc.connect(gain);
        gain.connect(this.ctx.destination);
       
        osc.start();
        osc.stop(this.ctx.currentTime + duration);
    }

    playClick() {
        this.playTone(800, 0.1, 'square', 0.1);
    }

    playUpgrade() {
        this.playTone(600, 0.2, 'sine', 0.15);
        setTimeout(() => this.playTone(800, 0.2, 'sine', 0.15), 100);
        setTimeout(() => this.playTone(1000, 0.3, 'sine', 0.15), 200);
    }

    playExplosion() {
        if (!this.ctx || !this.enabled) return;
       
        const bufferSize = this.ctx.sampleRate * 0.3;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
       
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
       
        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;
       
        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.2 * this.volume, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.3);
       
        noise.connect(gain);
        gain.connect(this.ctx.destination);
        noise.start();
    }
}

// ==========================================
// MAIN GAME CLASS
// ==========================================
class PlanetMiner {
    constructor() {
        this.bgCanvas = document.getElementById('bg-canvas');
        this.gameCanvas = document.getElementById('game-canvas');
        this.bgCtx = this.bgCanvas.getContext('2d');
        this.ctx = this.gameCanvas.getContext('2d');
       
        this.resize();
        window.addEventListener('resize', () => this.resize());
       
        this.stateMachine = new StateMachine();
        this.state = new GameState();
        this.particles = new ParticleSystem(this.bgCanvas);
        this.planetRenderer = new PlanetRenderer(this.gameCanvas);
        this.ui = new UIManager(this);
        this.audio = new AudioManager();
        this.daily = new DailyBonus();
       
        this.settings = {
            volume: 0.5,
            particles: true,
            floating: true,
            shake: true,
            autosave: true
        };
       
        this.loadSettings();
       
        this.lastTime = 0;
        this.accumulated = 0;
        this.asteroidTimer = 0;
        this.saveTimer = 0;
       
        this.setupInput();
        this.checkContinueButton();
       
        // Start loop
        requestAnimationFrame(t => this.loop(t));
    }

    resize() {
        const w = window.innerWidth;
        const h = window.innerHeight;
       
        this.bgCanvas.width = w;
        this.bgCanvas.height = h;
        this.gameCanvas.width = w;
        this.gameCanvas.height = h;
       
        // Re-init stars on resize
        this.particles.initStars();
        this.planetRenderer.clearCache();
    }

    loadSettings() {
        const saved = localStorage.getItem(CONFIG.SETTINGS_KEY);
        if (saved) {
            this.settings = { ...this.settings, ...JSON.parse(saved) };
        }
       
        // Apply to UI
        document.getElementById('volume-slider').value = this.settings.volume * 100;
        document.getElementById('volume-value').textContent = Math.round(this.settings.volume * 100) + '%';
        ['particles', 'floating', 'shake', 'autosave'].forEach(id => {
            const el = document.getElementById(`${id}-toggle`);
            if (el) el.checked = this.settings[id];
        });
    }

    saveSettings() {
        localStorage.setItem(CONFIG.SETTINGS_KEY, JSON.stringify(this.settings));
    }

    checkContinueButton() {
        const hasSave = localStorage.getItem(CONFIG.SAVE_KEY);
        document.getElementById('btn-continue')?.classList.toggle('hidden', !hasSave);
    }

    setupInput() {
        const handleClick = (e) => {
            if (this.stateMachine.state !== 'GAME') return;
           
            const rect = this.gameCanvas.getBoundingClientRect();
            const x = (e.clientX || e.touches?.[0]?.clientX) - rect.left;
            const y = (e.clientY || e.touches?.[0]?.clientY) - rect.top;
           
            // Check asteroids first
            const asteroid = this.particles.checkClick(x, y);
            if (asteroid.hit) {
                if (asteroid.destroyed) {
                    const reward = 100 * (this.state.currentPlanet + 1);
                    this.state.minerals += reward;
                    this.state.totalMined += reward;
                    this.state.asteroidsClicked++;
                    this.ui.showFloatingText(x, y, `+${Utils.formatNumber(reward)}`, 'critical');
                    this.audio.playExplosion();
                }
                return;
            }
           
            // Check planet
            const cx = this.gameCanvas.width / 2;
            const cy = this.gameCanvas.height / 2;
            const r = Math.min(this.gameCanvas.width, this.gameCanvas.height) * 0.15;
           
            if (Utils.pointInCircle(x, y, cx, cy, r)) {
                const result = this.state.click();
                const planet = PLANETS[this.state.currentPlanet];
               
                this.particles.createMiningParticles(x, y, planet.color, 8);
               
                const text = result.crit ? `CRIT! +${Utils.formatNumber(result.value)}` : `+${Utils.formatNumber(result.value)}`;
                const type = result.crit ? 'critical' : (result.combo > 1 ? 'combo' : 'normal');
                this.ui.showFloatingText(x, y - 20, text, type);
               
                this.audio.playClick();
               
                if (result.crit && this.settings.shake) {
                    this.gameCanvas.style.transform = `translate(${Utils.random(-5, 5)}px, ${Utils.random(-5, 5)}px)`;
                    setTimeout(() => this.gameCanvas.style.transform = '', 100);
                }
            }
        };

        this.gameCanvas.addEventListener('mousedown', handleClick);
        this.gameCanvas.addEventListener('touchstart', e => { e.preventDefault(); handleClick(e); });
        this.gameCanvas.addEventListener('contextmenu', e => e.preventDefault());
    }

    updateStatsDisplay() {
        const s = this.state;
        document.getElementById('stat-total-mined').textContent = Utils.formatNumber(s.totalMined);
        document.getElementById('stat-total-spent').textContent = Utils.formatNumber(s.totalSpent);
        document.getElementById('stat-max-combo').textContent = s.maxCombo;
        document.getElementById('stat-total-clicks').textContent = Utils.formatNumber(s.totalClicks);
        document.getElementById('stat-playtime').textContent = Utils.formatTime(s.playTime + (Date.now() - s.startTime));
        document.getElementById('stat-asteroids').textContent = s.asteroidsClicked;
        document.getElementById('stat-planets').textContent = `${s.unlockedPlanets.length}/${PLANETS.length}`;
        document.getElementById('stat-upgrades').textContent = s.totalUpgrades;
        document.getElementById('stat-achievements').textContent = `${s.achievements.length}/${ACHIEVEMENTS.length}`;
        document.getElementById('stat-prestige').textContent = s.prestigeCount;
    }

    updatePrestigeDisplay() {
        const s = this.state;
        document.getElementById('prestige-current-essence').textContent = s.essence;
        document.getElementById('prestige-gain').textContent = '+' + s.calculatePrestigeGain();
        document.getElementById('prestige-multiplier').textContent = 'x' + s.prestigeMultiplier.toFixed(2);
    }

    update(dt) {
        if (this.stateMachine.state !== 'GAME') return;
       
        // Combo decay
        if (this.state.combo > 0 && Date.now() - this.state.lastClick > CONFIG.COMBO_DECAY) {
            this.state.combo = 0;
        }
       
        // Idle income
        const perSec = this.state.getPerSecond();
        if (perSec > 0) {
            const earned = perSec * (dt / 1000);
            this.state.minerals += earned;
            this.state.totalMined += earned;
            this.state.idleEarned += earned;
        }
       
        // Asteroids
        this.asteroidTimer += dt;
        if (this.asteroidTimer > 1000 && Math.random() < CONFIG.ASTEROID_CHANCE * this.asteroidTimer) {
            this.particles.createAsteroid();
            this.asteroidTimer = 0;
        }
       
        // Achievements
        const newAch = this.state.checkAchievements();
        newAch.forEach(a => {
            this.ui.showToast(`Achievement: ${a.name}`, 'success');
            this.ui.renderAchievements();
        });
       
        // Auto-save
        if (this.settings.autosave) {
            this.saveTimer += dt;
            if (this.saveTimer > CONFIG.SAVE_INTERVAL) {
                this.state.save();
                this.saveSettings();
                this.saveTimer = 0;
            }
        }
       
        // Update UI
        this.ui.updateUI();
    }

    draw() {
        this.ctx.clearRect(0, 0, this.gameCanvas.width, this.gameCanvas.height);
       
        if (this.stateMachine.state !== 'GAME') return;
       
        const planet = PLANETS[this.state.currentPlanet];
        const cx = this.gameCanvas.width / 2;
        const cy = this.gameCanvas.height / 2;
        const r = Math.min(this.gameCanvas.width, this.gameCanvas.height) * 0.15;
       
        this.planetRenderer.draw(planet, cx, cy, r);
    }

    loop(timestamp) {
        // Calculate delta time with cap to prevent spiral of death [^16^]
        if (this.lastTime === 0) this.lastTime = timestamp;
        let dt = timestamp - this.lastTime;
        this.lastTime = timestamp;
       
        // Cap at 1 second to prevent huge jumps
        dt = Math.min(dt, 1000);
       
        this.accumulated += dt;
       
        // Fixed time step updates
        while (this.accumulated >= CONFIG.TIME_STEP) {
            this.particles.update();
            this.planetRenderer.update(CONFIG.TIME_STEP);
            this.update(CONFIG.TIME_STEP);
            this.accumulated -= CONFIG.TIME_STEP;
        }
       
        // Render
        this.particles.draw(this.bgCtx);
        this.draw();
       
        requestAnimationFrame(t => this.loop(t));
    }
}

// ==========================================
// INITIALIZATION
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    window.game = new PlanetMiner();
   
    // Resume audio context on first interaction
    document.addEventListener('click', () => {
        if (window.game.audio.ctx?.state === 'suspended') {
            window.game.audio.ctx.resume();
        }
    }, { once: true });
});

// Visibility handling
document.addEventListener('visibilitychange', () => {
    if (!document.hidden && window.game) {
        window.game.state.lastClick = Date.now();
    }
});

// Before unload
window.addEventListener('beforeunload', () => {
    if (window.game?.state) {
        window.game.state.save();
        window.game.saveSettings();
    }
});