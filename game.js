// ==========================================
// Class 2: Roguelike Grammar Quest V2
// Features: 4C/ID Stages, RPG Classes, Fairy Companion
// ==========================================

const CONFIG = {
    // API 키는 Railway 환경 변수 등에서 주입 권장
    API_KEY: "",
    API_URL: "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"
};

// ==========================================
// Data: Game Content & Systems
// ==========================================

// 1. Character Classes
const CLASSES = {
    WARRIOR: { id: 'WARRIOR', name: '전사', hp: 150, mana: 30, desc: '체력이 높고 튼튼합니다. (Easy)' },
    ROGUE: { id: 'ROGUE', name: '도적', hp: 100, mana: 50, desc: '균형 잡힌 능력치를 가집니다. (Normal)' },
    MAGE: { id: 'MAGE', name: '마법사', hp: 70, mana: 100, desc: '체력은 낮지만 마나가 많습니다. (Hard)' }
};

// 2. Fairy Companions
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

// 3. Scenarios & Monsters
const THEMES = [
    {
        id: 'FOREST', name: 'The Cursed Forest', bg: 'https://images.unsplash.com/photo-1448375240586-dfd8f3793371?q=80&w=2670&auto=format&fit=crop',
        monsters: [
            { id: 'm1', name: "Wild Boar", type: "ANGRY", weakness: ["calm", "gentle"], hp: 80, icon: "🐗", targetSentence: "I make you calm" },
            { id: 'm2', name: "Poison Vine", type: "POISON", weakness: ["clean", "pure"], hp: 90, icon: "🌿", targetSentence: "I make it clean" },
            { id: 'm3', name: "Shadow Wolf", type: "DARK", weakness: ["bright", "light"], hp: 100, icon: "🐺", targetSentence: "I make light" }
        ]
    },
    {
        id: 'CASTLE', name: 'Demon King\'s Castle', bg: 'https://images.unsplash.com/photo-1599596549216-b186b864a75e?q=80&w=2574&auto=format&fit=crop',
        monsters: [
            { id: 'm4', name: "Skeleton Guard", type: "UNDEAD", weakness: ["holy", "alive"], hp: 120, icon: "💀", targetSentence: "I use holy magic" },
            { id: 'm5', name: "Fire Dragon", type: "FIRE", weakness: ["cold", "ice"], hp: 150, icon: "🐉", targetSentence: "I cast cold ice" },
            { id: 'm6', name: "Demon King", type: "CHAOS", weakness: ["order", "peace"], hp: 200, icon: "😈", targetSentence: "I bring peace now" }
        ]
    }
];

// ==========================================
// Logic: Game State & Rules
// ==========================================
class GameState {
    constructor() {
        this.reset();
    }

    reset() {
        this.mode = 'SELECT_CLASS'; // SELECT_CLASS, SELECT_FAIRY, GAME, GAME_OVER, VICTORY
        this.playerClass = null;
        this.fairy = null;
        this.stage = 1;
        this.maxStage = 6;
        this.hp = 100;
        this.maxHp = 100;
        this.mana = 50;
        this.maxMana = 50;
        this.currentThemeIdx = 0;
        this.currentMonster = null;
        this.messages = [];
        this.isLoading = false;
    }

    initPlayer(classId) {
        this.playerClass = CLASSES[classId];
        this.hp = this.playerClass.hp;
        this.maxHp = this.playerClass.hp;
        this.mana = this.playerClass.mana;
        this.maxMana = this.playerClass.mana;
    }

    setFairy(fairyId) {
        this.fairy = FAIRIES[fairyId];
    }

    // 4C/ID Difficulty Logic
    getStageDifficulty(stage) {
        if (stage <= 1) return 'WORKED';     // Stage 1: Full Example provided
        if (stage <= 3) return 'COMPLETION'; // Stage 2-3: Key blanks
        if (stage <= 5) return 'FADING';     // Stage 4-5: First letters only
        return 'FREE';                       // Stage 6+: No hints
    }

    getHintText(target, stage) {
        const difficulty = this.getStageDifficulty(stage);

        if (difficulty === 'WORKED') return `따라 쓰세요: "${target}"`;

        if (difficulty === 'COMPLETION') {
            const words = target.split(' ');
            // Hide the key adjective/verb (usually the 3rd or last word)
            const masked = words.map((w, i) => (i === 2 || i === words.length - 1) ? "_____" : w).join(' ');
            return `빈칸 채우기: "${masked}"`;
        }

        if (difficulty === 'FADING') {
            return `힌트: ${target.split(' ').map(w => w[0] + '_'.repeat(w.length - 1)).join(' ')}`;
        }

        return "스스로 영작하세요! (No Hint)";
    }
}

// ==========================================
// Logic: AI Service
// ==========================================
class AIService {
    static async evaluate(userText, target, monster) {
        if (!CONFIG.API_KEY) return this.localEvaluate(userText, target);

        // API Call implementation would go here...
        // For efficiency in this demo, we'll primarily use local logic but structure it for AI
        return this.localEvaluate(userText, monster.targetSentence);
    }

    static localEvaluate(userText, target) {
        const userClean = userText.toLowerCase().replace(/[.,!?]/g, '').trim();
        const targetClean = target.toLowerCase().replace(/[.,!?]/g, '').trim();

        // Exact match
        if (userClean === targetClean) {
            return { isCorrect: true, dmg: 50, msg: "Chrispy! 완벽합니다!" };
        }

        // Key word check (simple implementation)
        const targetWords = targetClean.split(' ');
        const userWords = userClean.split(' ');
        const matchCount = targetWords.filter(w => userWords.includes(w)).length;

        if (matchCount >= targetWords.length - 1) {
            return { isCorrect: true, dmg: 30, msg: "좋아요! 하지만 조금 더 정확하게..." };
        }

        return { isCorrect: false, dmg: 0, msg: "다시 시도해보세요." };
    }
}

// ==========================================
// UI Controller
// ==========================================
class UIController {
    constructor() {
        this.game = new GameState();
        this.els = {
            app: document.getElementById('app'),
            screens: {
                selectClass: document.getElementById('screen-select-class'),
                selectFairy: document.getElementById('screen-select-fairy'),
                game: document.getElementById('screen-game'),
                gameover: document.getElementById('screen-gameover')
            },
            hud: {
                hpFill: document.getElementById('hp-fill'),
                hpText: document.getElementById('hp-text'),
                mpFill: document.getElementById('mp-fill'),
                mpText: document.getElementById('mp-text'),
                stage: document.getElementById('stage-display'),
                theme: document.getElementById('theme-display'),
                map: document.getElementById('minimap-container')
            },
            game: {
                monsterIcon: document.getElementById('monster-icon'),
                monsterName: document.getElementById('monster-name'),
                monsterHp: document.getElementById('monster-hp-fill'),
                chat: document.getElementById('chat-box'),
                input: document.getElementById('user-input'),
                sendBtn: document.getElementById('send-btn'),
                guide: document.getElementById('guide-text'),
                fairy: document.getElementById('fairy-companion')
            }
        };

        this.initEvents();
        this.showScreen('selectClass');
    }

    initEvents() {
        // Class Selection
        document.querySelectorAll('.class-card').forEach(card => {
            card.addEventListener('click', () => {
                const cls = card.dataset.class;
                this.game.initPlayer(cls);
                this.showScreen('selectFairy');
            });
        });

        // Fairy Selection
        document.querySelectorAll('.fairy-card').forEach(card => {
            card.addEventListener('click', () => {
                const fairy = card.dataset.fairy;
                this.game.setFairy(fairy);
                this.startGame();
            });
        });

        // Game Input
        this.els.game.sendBtn.addEventListener('click', () => this.handleInput());
        this.els.game.input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleInput();
        });

        // Retry
        document.getElementById('retry-btn').addEventListener('click', () => {
            location.reload();
        });

        // Fairy Hint Click
        this.els.game.fairy.addEventListener('click', () => this.handleFairyHint());
    }

    showScreen(screenName) {
        Object.values(this.els.screens).forEach(el => el.classList.add('hidden'));
        this.els.screens[screenName].classList.remove('hidden');
    }

    startGame() {
        this.game.mode = 'GAME';
        this.showScreen('game');
        this.updateHUD();
        this.loadStage();

        // Initial Chat
        this.addMessage('system', "던전에 입장했습니다...");
        this.addMessage('fairy', `${this.game.fairy.name}: "준비됐어? 가자!"`);
    }

    loadStage() {
        // Theme Management
        if (this.game.stage > 3) this.game.currentThemeIdx = 1;
        const theme = THEMES[this.game.currentThemeIdx];

        // Monster Management (Cycle through monsters)
        const mIdx = (this.game.stage - 1) % theme.monsters.length;
        this.game.currentMonster = { ...theme.monsters[mIdx], maxHp: theme.monsters[mIdx].hp };

        // UI Updates
        this.els.game.monsterIcon.textContent = this.game.currentMonster.icon;
        this.els.game.monsterName.textContent = `Lv.${this.game.stage} ${this.game.currentMonster.name}`;
        this.els.hud.theme.textContent = theme.name;
        this.els.app.style.backgroundImage = `url('${theme.bg}')`;

        // 4C/ID Guide update
        const hintText = this.game.getHintText(this.game.currentMonster.targetSentence, this.game.stage);
        this.els.game.guide.textContent = hintText;
        this.els.game.guide.className = `guide-box difficulty-${this.game.getStageDifficulty(this.game.stage).toLowerCase()}`;

        this.updateMinimap();
        this.updateMonsterHp();
    }

    async handleInput() {
        const text = this.els.game.input.value.trim();
        if (!text) return;

        this.addMessage('user', text);
        this.els.game.input.value = '';

        const result = await AIService.evaluate(text, this.game.currentMonster.targetSentence, this.game.currentMonster);

        if (result.isCorrect) {
            this.game.currentMonster.hp -= result.dmg;
            this.updateMonsterHp();
            this.addMessage('system', `⚔️ ${result.dmg} 데미지!`);

            if (this.game.currentMonster.hp <= 0) {
                this.stageClear();
            } else {
                this.monsterAttack();
            }
        } else {
            this.monsterAttack();
            this.addMessage('fairy', `${this.game.fairy.name}: "틀렸어! 집중해!"`);
        }
    }

    monsterAttack() {
        const dmg = 10 + (this.game.stage * 2);
        this.game.hp = Math.max(0, this.game.hp - dmg);
        this.updateHUD();
        this.addMessage('monster', `${this.game.currentMonster.name}의 공격! (HP -${dmg})`);

        if (this.game.hp <= 0) {
            this.showScreen('gameover');
        }
    }

    stageClear() {
        this.addMessage('system', "VICTORY! 몬스터를 처치했습니다.");
        this.game.stage++;
        this.game.hp = Math.min(this.game.maxHp, this.game.hp + 20); // Heal
        this.updateHUD();

        setTimeout(() => {
            if (this.game.stage > 6) {
                alert("축하합니다! 모든 스테이지를 클리어했습니다!");
                location.reload();
            } else {
                this.loadStage();
            }
        }, 1500);
    }

    handleFairyHint() {
        if (this.game.mana < 10) {
            this.addMessage('system', "마나가 부족합니다!");
            return;
        }

        this.game.mana -= 10;
        this.updateHUD();

        // Personality-based hints
        const target = this.game.currentMonster.targetSentence;
        let hintMsg = "";

        switch (this.game.fairy.id) {
            case 'FIRE': hintMsg = `"답은 이거야! [ ${target} ] 빨리 입력해!"`; break;
            case 'WATER': hintMsg = `"천천히... 정답은 [ ${target} ] 같아요."`; break;
            case 'WIND': hintMsg = `"힝~ 정답 가르쳐줄게! [ ${target} ]`; break;
            case 'GROUND': hintMsg = `"...[ ${target} ]. 더 묻지 마라."`; break;
        }

        this.addMessage('fairy', `${this.game.fairy.name}: ${hintMsg}`);
    }

    updateHUD() {
        this.els.hud.hpText.textContent = `${this.game.hp}/${this.game.maxHp}`;
        this.els.hud.hpFill.style.height = `${(this.game.hp / this.game.maxHp) * 100}%`;

        this.els.hud.mpText.textContent = `${this.game.mana}/${this.game.maxMana}`;
        this.els.hud.mpFill.style.height = `${(this.game.mana / this.game.maxMana) * 100}%`;

        this.els.hud.stage.textContent = `Stage ${this.game.stage}`;

        this.els.game.fairy.textContent = this.game.fairy ? this.game.fairy.icon : '';
        this.els.game.fairy.className = `fairy-companion ${this.game.fairy ? 'animate-float' : ''}`;
    }

    updateMonsterHp() {
        const pct = Math.max(0, (this.game.currentMonster.hp / this.game.currentMonster.maxHp) * 100);
        this.els.game.monsterHp.style.width = `${pct}%`;
    }

    updateMinimap() {
        this.els.hud.map.innerHTML = '';
        for (let i = 1; i <= 6; i++) {
            const node = document.createElement('div');
            node.className = `map-node ${i === this.game.stage ? 'current' : ''} ${i < this.game.stage ? 'cleared' : ''}`;
            node.textContent = i;
            this.els.hud.map.appendChild(node);
        }
    }

    addMessage(sender, text) {
        const div = document.createElement('div');
        div.className = `msg ${sender}`;
        div.textContent = text;
        this.els.game.chat.appendChild(div);
        this.els.game.chat.scrollTop = this.els.game.chat.scrollHeight;
    }
}

// Init
window.onload = () => new UIController();
