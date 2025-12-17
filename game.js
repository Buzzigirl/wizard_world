// ==========================================
// Class 2: Roguelike Grammar Quest V3 (Final)
// Features: 5 Themes, Event System, Shop, Perks, Bosses
// ==========================================

const CONFIG = {
    // API Key should be injected securely
    API_KEY: "",
    API_URL: "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"
};

// ==========================================
// Data: Game Content
// ==========================================

const CLASSES = {
    WARRIOR: { id: 'WARRIOR', name: '전사', hp: 150, mana: 30, atk: 20, desc: '체력이 높고 공격력이 강합니다. (Easy)' },
    ROGUE: { id: 'ROGUE', name: '도적', hp: 100, mana: 50, atk: 15, desc: '균형 잡힌 능력치를 가집니다. (Normal)' },
    MAGE: { id: 'MAGE', name: '마법사', hp: 70, mana: 100, atk: 10, desc: '체력은 낮지만 마나와 주문력이 높습니다. (Hard)' }
};

const FAIRIES = {
    FIRE: {
        id: 'FIRE', name: '이그니스', type: '불', color: 'text-red-500',
        personality: '열정적이고 다혈질. "빨리 해! 시간 없어!"', icon: '🔥'
    },
    WATER: {
        id: 'WATER', name: '아쿠아', type: '물', color: 'text-blue-500',
        personality: '차분하고 친절함. "천천히 생각해보세요~"', icon: '💧'
    },
    WIND: {
        id: 'WIND', name: '실피드', type: '바람', color: 'text-green-500',
        personality: '장난끼 많고 자유분방. "히히, 이건 어때?"', icon: '🍃'
    },
    GROUND: {
        id: 'GROUND', name: '테라', type: '땅', color: 'text-yellow-600',
        personality: '무뚝뚝하고 직설적. "집중해라. 답은..."', icon: '🪨'
    }
};

const THEMES = [
    {
        id: 'FOREST', name: 'The Cursed Forest', bg: 'https://images.unsplash.com/photo-1448375240586-dfd8f3793371?q=80&w=2670&auto=format&fit=crop',
        monsters: [
            { name: "Wild Boar", hp: 80, icon: "🐗", target: "I make you calm" },
            { name: "Poison Vine", hp: 90, icon: "🌿", target: "I make it clean" },
            { name: "Shadow Wolf", hp: 100, icon: "🐺", target: "I make light" }
        ],
        boss: { name: "Elder Ent", hp: 200, icon: "🌳", target: "I respect nature", desc: "숲의 수호자" }
    },
    {
        id: 'DESERT', name: 'Scorching Desert', bg: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?q=80&w=2574&auto=format&fit=crop',
        monsters: [
            { name: "Sand Scorpion", hp: 110, icon: "🦂", target: "I freeze sand" },
            { name: "Dust Devil", hp: 120, icon: "🌪️", target: "I stop wind" },
            { name: "Mummy", hp: 130, icon: "🧟", target: "I give rest" }
        ],
        boss: { name: "Sand Worm", hp: 300, icon: "🪱", target: "I summon rain", desc: "사막의 포식자" }
    },
    {
        id: 'SEA', name: 'Abyssal Sea', bg: 'https://images.unsplash.com/photo-1498036882173-b41c28a8ba34?q=80&w=2664&auto=format&fit=crop',
        monsters: [
            { name: "Siren", hp: 140, icon: "🧜‍♀️", target: "I block sound" },
            { name: "Kraken Tentacle", hp: 150, icon: "🐙", target: "I cut tentacle" },
            { name: "Deep Angler", hp: 160, icon: "🐟", target: "I flash light" }
        ],
        boss: { name: "Poseidon's Shadow", hp: 400, icon: "🔱", target: "I calm ocean", desc: "바다의 지배자" }
    },
    {
        id: 'UNDEAD', name: 'Necropolis', bg: 'https://images.unsplash.com/photo-1509557965875-b88c97052f0e?q=80&w=2670&auto=format&fit=crop',
        monsters: [
            { name: "Skeleton Knight", hp: 180, icon: "💀", target: "I break bone" },
            { name: "Wraith", hp: 190, icon: "👻", target: "I banish spirit" },
            { name: "Vampire Bat", hp: 200, icon: "🦇", target: "I show sun" }
        ],
        boss: { name: "Lich King", hp: 500, icon: "👑", target: "I destroy phylactery", desc: "죽지 않는 왕" }
    },
    {
        id: 'CASTLE', name: 'Demon Castle', bg: 'https://images.unsplash.com/photo-1599596549216-b186b864a75e?q=80&w=2574&auto=format&fit=crop',
        monsters: [
            { name: "Demon Soldier", hp: 220, icon: "👺", target: "I banish evil" },
            { name: "Dark Wizard", hp: 240, icon: "🧙‍♂️", target: "I reflect spell" },
            { name: "Hell Hound", hp: 260, icon: "🐕‍🦺", target: "I tame beast" }
        ],
        boss: { name: "The Demon Lord", hp: 800, icon: "😈", target: "I save the world", desc: "최종 보스" }
    }
];

const PERKS = [
    { id: 'ATK_UP', name: '⚔️ Strength', desc: 'Attack Power +5', apply: (s) => s.baseAtk += 5 },
    { id: 'HP_UP', name: '❤️ Vitality', desc: 'Max HP +30', apply: (s) => s.bonusHp += 30 },
    { id: 'MANA_UP', name: '🔋 Wisdom', desc: 'Max Mana +30', apply: (s) => s.bonusMana += 30 },
];

const SHOP_ITEMS = [
    { id: 'POTION', name: 'Health Potion', cost: 20, icon: '❤️', eff: (s) => s.hp = Math.min(s.maxHp, s.hp + 50) },
    { id: 'MANA', name: 'Mana Elixir', cost: 15, icon: '🔋', eff: (s) => s.mana = Math.min(s.maxMana, s.mana + 50) },
    { id: 'SHARP', name: 'Whetstone', cost: 30, icon: '⚔️', eff: (s) => s.atk += 5 }
];

// ==========================================
// Game State
// ==========================================
class GameState {
    constructor() {
        // Persistent Data
        this.clearedThemes = JSON.parse(localStorage.getItem('clearedThemes') || '[]');
        this.perks = []; // Applied perks

        // Base Stats (from Perks)
        this.baseAtk = 0;
        this.bonusHp = 0;
        this.bonusMana = 0;

        this.reset();
    }

    saveProgress() {
        localStorage.setItem('clearedThemes', JSON.stringify(this.clearedThemes));
    }

    reset() {
        this.mode = 'SELECT_CLASS';
        this.playerClass = null;
        this.fairy = null;
        this.themeIdx = 0;
        this.stage = 1; // 1-5: Normal, 6: Boss

        // Current Stats
        this.hp = 100;
        this.maxHp = 100;
        this.mana = 50;
        this.maxMana = 50;
        this.atk = 10;

        this.currentMonster = null;
    }

    initPlayer(classId) {
        this.playerClass = CLASSES[classId];
        // Apply Base + Class + Perks
        this.maxHp = this.playerClass.hp + this.bonusHp;
        this.hp = this.maxHp;
        this.maxMana = this.playerClass.mana + this.bonusMana;
        this.mana = this.maxMana;
        this.atk = this.playerClass.atk + this.baseAtk;

        // Skip cleared themes ?? No, play all to save world.
        // But maybe boost stats if cleared? For now, standard run.
    }

    setFairy(fairyId) {
        this.fairy = FAIRIES[fairyId];
    }

    getTheme() { return THEMES[this.themeIdx]; }

    // 4C/ID Stage Logic
    getHint(target) {
        // Difficulty increase by Theme AND Stage
        const totalDifficulty = (this.themeIdx * 2) + Math.ceil(this.stage / 2);

        if (totalDifficulty <= 2) return `따라 쓰세요: "${target}"`;
        if (totalDifficulty <= 4) {
            // Blank Key Word
            const words = target.split(' ');
            const masked = words.map((w, i) => i === words.length - 1 ? "_____" : w).join(' ');
            return `빈칸 완성: "${masked}"`;
        }
        if (totalDifficulty <= 7) {
            // Initials
            return `힌트: ${target.split(' ').map(w => w[0] + '_'.repeat(w.length - 1)).join(' ')}`;
        }
        return "스스로 작문하세요 (No Hint)";
    }
}

// ==========================================
// AI Service (Simplified for Demo)
// ==========================================
class AIService {
    static async evaluate(userText, target) {
        // In deployed version, use fetch to API_URL
        const userClean = userText.toLowerCase().replace(/[.,!?]/g, '').trim();
        const targetClean = target.toLowerCase().replace(/[.,!?]/g, '').trim();

        // Calculate similarity score
        const targetWords = targetClean.split(' ');
        const userWords = userClean.split(' ');
        let match = 0;
        targetWords.forEach(w => { if (userWords.includes(w)) match++; });

        const score = match / targetWords.length;

        if (score === 1) return { correct: true, quality: 'PERFECT', msg: "Perfect Grammar!" };
        if (score >= 0.7) return { correct: true, quality: 'GOOD', msg: "Good! Almost perfect." };
        return { correct: false, quality: 'BAD', msg: "The spell fizzled..." };
    }
}

// ==========================================
// UI Controller
// ==========================================
class UIController {
    constructor() {
        this.game = new GameState();
        this.els = this.cacheDOM();
        this.initEvents();
        this.showScreen('class');
        this.updateThemeBadges();
    }

    cacheDOM() {
        return {
            screens: {
                class: document.getElementById('screen-class'),
                fairy: document.getElementById('screen-fairy'),
                game: document.getElementById('screen-game'),
                gameover: document.getElementById('screen-gameover'),
                event: document.getElementById('screen-event') // Modal for Shop/Rest
            },
            hud: {
                hp: document.getElementById('val-hp'),
                hpBar: document.getElementById('bar-hp'),
                mp: document.getElementById('val-mp'),
                mpBar: document.getElementById('bar-mp'),
                atk: document.getElementById('val-atk'),
                stage: document.getElementById('display-stage'),
                theme: document.getElementById('display-theme'),
                badges: document.getElementById('theme-badges'),
                map: document.getElementById('map-container')
            },
            game: {
                mIcon: document.getElementById('monster-icon'),
                mName: document.getElementById('monster-name'),
                mHp: document.getElementById('monster-hp-bar'),
                chat: document.getElementById('chat-list'),
                input: document.getElementById('inp-spell'),
                btn: document.getElementById('btn-cast'),
                guide: document.getElementById('guide-msg'),
                fairy: document.getElementById('fairy-char'),
                fairyBub: document.getElementById('fairy-bubble')
            },
            event: {
                title: document.getElementById('event-title'),
                desc: document.getElementById('event-desc'),
                options: document.getElementById('event-options')
            },
            perk: {
                list: document.getElementById('perk-list')
            }
        };
    }

    initEvents() {
        // Class Select
        document.querySelectorAll('.btn-class').forEach(b => {
            b.addEventListener('click', () => {
                this.game.initPlayer(b.dataset.id);
                this.showScreen('fairy');
            });
        });

        // Fairy Select
        document.querySelectorAll('.btn-fairy').forEach(b => {
            b.addEventListener('click', () => {
                this.game.setFairy(b.dataset.id);
                this.startGame();
            });
        });

        // Casting
        this.els.game.btn.addEventListener('click', () => this.castSpell());
        this.els.game.input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.castSpell();
        });

        // Fairy Hint
        this.els.game.fairy.addEventListener('click', () => this.useHint());
    }

    showScreen(id) {
        Object.values(this.els.screens).forEach(el => el.classList.add('hidden'));
        this.els.screens[id].classList.remove('hidden');
    }

    updateThemeBadges() {
        this.els.hud.badges.innerHTML = '';
        THEMES.forEach((t, i) => {
            const cleared = this.game.clearedThemes.includes(t.id);
            const active = i === this.game.themeIdx;
            const badge = document.createElement('div');
            badge.className = `badge ${cleared ? 'cleared' : ''} ${active ? 'active' : ''}`;
            badge.textContent = i + 1; // 1..5
            this.els.hud.badges.appendChild(badge);
        });
    }

    startGame() {
        this.showScreen('game');
        this.loadStage();
    }

    loadStage() {
        const theme = this.game.getTheme();
        const isBoss = this.game.stage === 6;

        // 1. Setup Monster
        let mobData;
        if (isBoss) {
            mobData = theme.boss;
        } else {
            const mobIdx = (this.game.stage - 1) % theme.monsters.length;
            mobData = theme.monsters[mobIdx];
        }

        this.game.currentMonster = { ...mobData, maxHp: mobData.hp };

        // 2. UI Update
        document.body.style.backgroundImage = `url('${theme.bg}')`;
        this.els.hud.theme.textContent = theme.name;
        this.els.hud.stage.textContent = isBoss ? "BOSS STAGE" : `Stage ${this.game.stage}`;

        this.els.game.mIcon.textContent = mobData.icon;
        this.els.game.mName.textContent = mobData.name;
        this.updateMonsterHp();
        this.updateHUD();
        this.renderMap();

        // 3. Guide
        this.els.game.guide.textContent = this.game.getHint(mobData.target);

        this.addChat('system', `${mobData.name} encountered!`);
    }

    updateHUD() {
        this.els.hud.hp.textContent = `${this.game.hp}/${this.game.maxHp}`;
        this.els.hud.hpBar.style.height = `${(this.game.hp / this.game.maxHp) * 100}%`;

        this.els.hud.mp.textContent = `${this.game.mana}/${this.game.maxMana}`;
        this.els.hud.mpBar.style.height = `${(this.game.mana / this.game.maxMana) * 100}%`;

        this.els.hud.atk.textContent = this.game.atk;

        this.els.game.fairy.textContent = this.game.fairy?.icon || '🧚';
    }

    updateMonsterHp() {
        const pct = (this.game.currentMonster.hp / this.game.currentMonster.maxHp) * 100;
        this.els.game.mHp.style.width = `${pct}%`;
    }

    renderMap() {
        const container = this.els.hud.map;
        container.innerHTML = '';
        // 6 stages, stacked bottom-up
        for (let i = 6; i >= 1; i--) {
            const node = document.createElement('div');
            let type = '⚔️';
            if (i === 6) type = '👑'; // Boss
            else if (i % 2 === 0) type = '❓'; // Event potential (simplified visual)

            node.className = `map-node ${i === this.game.stage ? 'current' : ''} ${i < this.game.stage ? 'cleared' : ''}`;
            node.innerHTML = type;
            container.appendChild(node);
        }
    }

    async castSpell() {
        const input = this.els.game.input.value.trim();
        if (!input) return;

        this.els.game.input.value = '';
        this.addChat('user', input);

        const res = await AIService.evaluate(input, this.game.currentMonster.target);

        if (res.correct) {
            const dmg = this.game.atk * (res.quality === 'PERFECT' ? 1.5 : 1.0);
            this.game.currentMonster.hp -= dmg;
            this.addChat('system', `Hit! ${Math.floor(dmg)} Damage.`);
            this.updateMonsterHp();

            if (this.game.currentMonster.hp <= 0) {
                this.stageClear();
            } else {
                this.monsterAttack();
            }
        } else {
            this.monsterAttack();
            this.fairySpeak("틀렸어! 집중해!");
        }
    }

    monsterAttack() {
        const dmg = 10 + (this.game.themeIdx * 5); // Difficulty scales
        this.game.hp -= dmg;
        this.updateHUD();
        this.addChat('monster', `${this.game.currentMonster.name} attacks! -${dmg} HP`);

        if (this.game.hp <= 0) this.gameOver();
    }

    stageClear() {
        this.addChat('system', "Monster Defeated!");

        if (this.game.stage === 6) {
            // Theme Clear
            if (!this.game.clearedThemes.includes(this.game.getTheme().id)) {
                this.game.clearedThemes.push(this.game.getTheme().id);
                this.game.saveProgress();
                this.updateThemeBadges();
            }

            this.game.themeIdx++;
            if (this.game.themeIdx >= THEMES.length) {
                alert("WORLD SAVED! 축하합니다.");
                location.reload();
            } else {
                this.game.stage = 1; // Reset stage for new theme
                alert("Next Theme Unlocked!");
                this.triggerEvent(); // Events between themes too? Maybe just Rest.
            }
        } else {
            // Normal Stage Clear -> Event
            this.game.stage++;
            this.triggerEvent();
        }
    }

    triggerEvent() {
        // Random Event: 40% Shop, 30% Rest, 30% Nothing (Combat Next)
        const rand = Math.random();
        if (rand < 0.3) {
            // Just next combat
            this.startGame();
        } else if (rand < 0.6) {
            this.showEvent('REST');
        } else {
            this.showEvent('SHOP');
        }
    }

    showEvent(type) {
        this.showScreen('event');
        const title = this.els.event.title;
        const desc = this.els.event.desc;
        const opts = this.els.event.options;
        opts.innerHTML = '';

        if (type === 'REST') {
            title.textContent = "⛺ Campsite";
            desc.textContent = "잠시 쉬어갑니다. 무엇을 할까요?";
            this.createBtn(opts, "체력 회복 (+30 HP)", () => {
                this.game.hp = Math.min(this.game.maxHp, this.game.hp + 30);
                this.startGame();
            });
            this.createBtn(opts, "명상 (+30 Mana)", () => {
                this.game.mana = Math.min(this.game.maxMana, this.game.mana + 30);
                this.startGame();
            });
        } else if (type === 'SHOP') {
            title.textContent = "💰 Wandering Merchant";
            desc.textContent = `가진 마나: ${this.game.mana}`;

            SHOP_ITEMS.forEach(item => {
                this.createBtn(opts, `${item.icon} ${item.name} (-${item.cost} MP)`, () => {
                    if (this.game.mana >= item.cost) {
                        this.game.mana -= item.cost;
                        item.eff(this.game);
                        alert("구매 완료!");
                        this.startGame();
                    } else {
                        alert("마나가 부족합니다.");
                    }
                });
            });
            this.createBtn(opts, "떠나기", () => this.startGame());
        }
    }

    createBtn(parent, text, onClick) {
        const btn = document.createElement('button');
        btn.textContent = text;
        btn.className = 'event-btn';
        btn.onclick = onClick;
        parent.appendChild(btn);
    }

    useHint() {
        if (this.game.mana < 10) {
            this.addChat('system', "Not enough Mana!");
            return;
        }
        this.game.mana -= 10;
        this.updateHUD();

        // Personality Text
        const personality = this.game.fairy.personality.split('.')[0];
        const hint = this.game.currentMonster.target;
        this.fairySpeak(`${personality}.. 답은 [ ${hint} ]!`);
    }

    fairySpeak(text) {
        const bub = this.els.game.fairyBub;
        bub.textContent = text;
        bub.classList.remove('hidden');
        bub.classList.add('pop-in');
        setTimeout(() => bub.classList.add('hidden'), 3000);
    }

    addChat(sender, text) {
        const div = document.createElement('div');
        div.className = `msg ${sender}`;
        div.textContent = text;
        this.els.game.chat.appendChild(div);
        this.els.game.chat.scrollTop = this.els.game.chat.scrollHeight;
    }

    gameOver() {
        this.showScreen('gameover');
        const list = this.els.perk.list;
        list.innerHTML = '';

        PERKS.forEach(perk => {
            const btn = document.createElement('button');
            btn.className = 'perk-btn';
            btn.innerHTML = `<b>${perk.name}</b><br>${perk.desc}`;
            btn.onclick = () => {
                perk.apply(this.game); // Apply directly to base stats logic
                this.game.reset(); // Reset level/stage
                // Keep base stats boosts? V3 says yes "special item to select".
                // We'll simplisticly add to base stats for next run
                this.showScreen('class'); // Restart from class select
            };
            list.appendChild(btn);
        });
    }
}

window.onload = () => new UIController();
