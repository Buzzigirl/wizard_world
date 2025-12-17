// ==========================================
// Class 2: Roguelike Grammar Quest V4 (Final Polish)
// Features: Korean Localization, World Map, Educational Context, Glassmorphism UI
// ==========================================

const CONFIG = {
    // API Key should be injected securely
    API_KEY: "",
    API_URL: "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"
};

// ==========================================
// Data: Game Content (Localized)
// ==========================================

const CLASSES = {
    WARRIOR: { id: 'WARRIOR', name: '전사 (Warrior)', hp: 150, mana: 30, atk: 20, desc: '강인한 체력으로 문제를 버텨냅니다. (Easy)' },
    ROGUE: { id: 'ROGUE', name: '도적 (Rogue)', hp: 100, mana: 50, atk: 15, desc: '균형 잡힌 능력치로 유연하게 대처합니다. (Normal)' },
    MAGE: { id: 'MAGE', name: '마법사 (Mage)', hp: 70, mana: 100, atk: 10, desc: '풍부한 마나로 많은 해결책을 제시합니다. (Hard)' }
};

const FAIRIES = {
    FIRE: {
        id: 'FIRE', name: '이그니스', type: '불', color: 'text-red-500',
        personality: '열정적', icon: '🔥',
        idle: ["빨리 해결하자!", "자신감을 가져!", "넌 할 수 있어!"]
    },
    WATER: {
        id: 'WATER', name: '아쿠아', type: '물', color: 'text-blue-500',
        personality: '차분함', icon: '💧',
        idle: ["천천히 생각해보세요.", "조급할 필요 없어요.", "물처럼 유연하게..."]
    },
    WIND: {
        id: 'WIND', name: '실피드', type: '바람', color: 'text-green-500',
        personality: '장난꾸러기', icon: '🍃',
        idle: ["심심해~ 뭐라도 해봐!", "휘리릭~ 정답이 보이나?", "놀러 가고 싶다!"]
    },
    GROUND: {
        id: 'GROUND', name: '테라', type: '땅', color: 'text-yellow-600',
        personality: '진지함', icon: '🪨',
        idle: ["집중해라.", "기반을 다져야 한다.", "묵직하게 한 방."]
    }
};

const THEMES = [
    {
        id: 'FOREST', name: '신비한 숲 (Forest)', bg: 'https://images.unsplash.com/photo-1448375240586-dfd8f3793371?q=80&w=2670&auto=format&fit=crop',
        monsters: [
            { name: "성난 멧돼지", hp: 80, icon: "🐗", target: "I make you calm", situation: "멧돼지가 흥분하여 날뛰고 있습니다! 진정시켜야 합니다." },
            { name: "독성 덩굴", hp: 90, icon: "🌿", target: "I make it clean", situation: "덩굴이 길을 막고 독을 뿜습니다. 정화해야 합니다." },
            { name: "그림자 늑대", hp: 100, icon: "🐺", target: "I make light", situation: "어둠 속에서 늑대가 노려봅니다. 빛이 필요합니다." }
        ],
        boss: { name: "숲의 수호자 엔트", hp: 200, icon: "🌳", target: "I respect nature", situation: "거대한 엔트가 숲을 지키려 합니다. 자연을 존중함을 보여주세요.", desc: "숲의 주인" }
    },
    {
        id: 'DESERT', name: '작열하는 사막 (Desert)', bg: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?q=80&w=2574&auto=format&fit=crop',
        monsters: [
            { name: "모래 전갈", hp: 110, icon: "🦂", target: "I freeze sand", situation: "전갈이 뜨거운 모래 속에 숨어있습니다. 모래를 얼려야 합니다." },
            { name: "모래 폭풍", hp: 120, icon: "🌪️", target: "I stop wind", situation: "거대한 모래 폭풍이 다가옵니다! 바람을 멈춰야 합니다." },
            { name: "미라", hp: 130, icon: "🧟", target: "I give rest", situation: "잠들지 못한 미라가 배회합니다. 안식을 주어야 합니다." }
        ],
        boss: { name: "사막의 포식자 웜", hp: 300, icon: "🪱", target: "I summon rain", situation: "거대 지렁이가 모든 물을 마셨습니다. 비를 내려야 합니다.", desc: "사막의 왕" }
    },
    {
        id: 'SEA', name: '심해의 심연 (Sea)', bg: 'https://images.unsplash.com/photo-1498036882173-b41c28a8ba34?q=80&w=2664&auto=format&fit=crop',
        monsters: [
            { name: "세이렌", hp: 140, icon: "🧜‍♀️", target: "I block sound", situation: "세이렌의 노래가 정신을 혼미하게 합니다. 소리를 차단하세요!" },
            { name: "크라켄 다리", hp: 150, icon: "🐙", target: "I cut tentacle", situation: "거대 문어 다리가 배를 감쌉니다. 끊어내야 합니다." },
            { name: "심해 아귀", hp: 160, icon: "🐟", target: "I flash light", situation: "칠흑 같은 어둠 속 아귀가 있습니다. 강한 빛을 비추세요." }
        ],
        boss: { name: "포세이돈의 그림자", hp: 400, icon: "🔱", target: "I calm ocean", situation: "바다의 분노가 형상화되었습니다. 바다를 진정시키세요.", desc: "심해의 주인" }
    },
    {
        id: 'UNDEAD', name: '죽은 자의 도시 (Undead)', bg: 'https://images.unsplash.com/photo-1509557965875-b88c97052f0e?q=80&w=2670&auto=format&fit=crop',
        monsters: [
            { name: "해골 기사", hp: 180, icon: "💀", target: "I break bone", situation: "해골 기사가 길을 막습니다. 뼈를 부숴야 합니다." },
            { name: "원혼", hp: 190, icon: "👻", target: "I banish spirit", situation: "원혼들이 괴롭힙니다. 성불시켜야 합니다." },
            { name: "뱀파이어", hp: 200, icon: "🦇", target: "I show sun", situation: "뱀파이어가 흡혈을 시도합니다. 태양을 보여주세요!" }
        ],
        boss: { name: "리치 왕", hp: 500, icon: "👑", target: "I destroy phylactery", situation: "영생을 사는 리치입니다. 영혼석을 파괴해야 끝납니다.", desc: "언데드의 군주" }
    },
    {
        id: 'CASTLE', name: '마왕성 (Demon Castle)', bg: 'https://images.unsplash.com/photo-1599596549216-b186b864a75e?q=80&w=2574&auto=format&fit=crop',
        monsters: [
            { name: "마족 병사", hp: 220, icon: "👺", target: "I banish evil", situation: "마왕군의 정예 병사입니다. 악을 추방하세요." },
            { name: "암흑 마법사", hp: 240, icon: "🧙‍♂️", target: "I reflect spell", situation: "저주 마법이 날아옵니다! 반사해야 합니다." },
            { name: "지옥견", hp: 260, icon: "🐕‍🦺", target: "I tame beast", situation: "사나운 지옥견입니다. 길들여야 합니다." }
        ],
        boss: { name: "대마왕", hp: 800, icon: "😈", target: "I save the world", situation: "모든 재앙의 원흉입니다. 세상을 구해주세요!", desc: "최종 보스" }
    }
];

const PERKS = [
    { id: 'ATK_UP', name: '⚔️ 힘의 축복', desc: '공격력 +5 증가', apply: (s) => s.baseAtk += 5 },
    { id: 'HP_UP', name: '❤️ 생명의 축복', desc: '최대 체력 +30 증가', apply: (s) => s.bonusHp += 30 },
    { id: 'MANA_UP', name: '🔋 지혜의 축복', desc: '최대 마나 +30 증가', apply: (s) => s.bonusMana += 30 },
];

const SHOP_ITEMS = [
    { id: 'POTION', name: '체력 포션', cost: 20, icon: '❤️', eff: (s) => s.hp = Math.min(s.maxHp, s.hp + 50) },
    { id: 'MANA', name: '마나 엘릭서', cost: 15, icon: '🔋', eff: (s) => s.mana = Math.min(s.maxMana, s.mana + 50) },
    { id: 'SHARP', name: '숫돌', cost: 30, icon: '⚔️', eff: (s) => s.atk += 5 }
];

// ==========================================
// Game State
// ==========================================
class GameState {
    constructor() {
        this.clearedThemes = JSON.parse(localStorage.getItem('clearedThemes') || '[]');
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
        this.stage = 1;

        this.hp = 100;
        this.maxHp = 100;
        this.mana = 50;
        this.maxMana = 50;
        this.atk = 10;

        this.currentMonster = null;
    }

    initPlayer(classId) {
        this.playerClass = CLASSES[classId];
        this.maxHp = this.playerClass.hp + this.bonusHp;
        this.hp = this.maxHp;
        this.maxMana = this.playerClass.mana + this.bonusMana;
        this.mana = this.maxMana;
        this.atk = this.playerClass.atk + this.baseAtk;
    }

    setFairy(fairyId) {
        this.fairy = FAIRIES[fairyId];
    }

    getTheme() { return THEMES[this.themeIdx]; }

    // 4C/ID Stage Logic
    getHint(target) {
        const totalDifficulty = (this.themeIdx * 2) + Math.ceil(this.stage / 2);

        if (totalDifficulty <= 2) return `따라 쓰세요: "${target}"`;
        if (totalDifficulty <= 4) {
            const words = target.split(' ');
            const masked = words.map((w, i) => i === words.length - 1 ? "_____" : w).join(' ');
            return `빈칸 완성: "${masked}"`;
        }
        if (totalDifficulty <= 7) {
            return `힌트: ${target.split(' ').map(w => w[0] + '_'.repeat(w.length - 1)).join(' ')}`;
        }
        return "스스로 작문하세요 (No Hint)";
    }
}

// ==========================================
// AI Service (Simplified)
// ==========================================
class AIService {
    static async evaluate(userText, target) {
        // 실제 배포 시 Fetch API 사용 권장
        const userClean = userText.toLowerCase().replace(/[.,!?]/g, '').trim();
        const targetClean = target.toLowerCase().replace(/[.,!?]/g, '').trim();

        const targetWords = targetClean.split(' ');
        const userWords = userClean.split(' ');
        let match = 0;
        targetWords.forEach(w => { if (userWords.includes(w)) match++; });

        const score = match / targetWords.length;

        if (score === 1) return { correct: true, quality: 'PERFECT', msg: "완벽한 해결책입니다!" };
        if (score >= 0.7) return { correct: true, quality: 'GOOD', msg: "좋아요! 문제가 해결되었습니다." };
        return { correct: false, quality: 'BAD', msg: "주문이 빗나갔습니다. 다시 시도하세요." };
    }
}

// ==========================================
// UI Controller
// ==========================================
class UIController {
    constructor() {
        this.game = new GameState();
        this.els = this.cacheDOM();
        this.idleTimer = null;
        this.initEvents();
        this.showScreen('class');
    }

    cacheDOM() {
        return {
            screens: {
                class: document.getElementById('screen-class'),
                fairy: document.getElementById('screen-fairy'),
                world: document.getElementById('screen-worldmap'), // NEW: World Map
                game: document.getElementById('screen-game'),
                gameover: document.getElementById('screen-gameover'),
                event: document.getElementById('screen-event')
            },
            world: {
                points: document.getElementById('world-points')
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
                mHpText: document.getElementById('monster-hp-text'),
                mSituation: document.getElementById('monster-situation'), // NEW: Educational Context
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
                this.showWorldMap();
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

    showWorldMap() {
        this.showScreen('world');
        const container = this.els.world.points;
        container.innerHTML = '';

        THEMES.forEach((t, i) => {
            const btn = document.createElement('button');
            const locked = i > 0 && !this.game.clearedThemes.includes(THEMES[i - 1].id);
            const cleared = this.game.clearedThemes.includes(t.id);

            btn.className = `map-point ${locked ? 'locked' : ''} ${cleared ? 'cleared' : ''}`;
            btn.innerHTML = `<span class="icon">${cleared ? '🚩' : (locked ? '🔒' : '⚔️')}</span><span class="label">${t.name}</span>`;

            if (!locked) {
                btn.onclick = () => {
                    this.game.themeIdx = i;
                    this.startGame();
                };
            }
            container.appendChild(btn);
        });
    }

    startGame() {
        this.showScreen('game');
        this.updateThemeBadges();
        this.loadStage();
        this.startFairyIdle();
    }

    startFairyIdle() {
        if (this.idleTimer) clearInterval(this.idleTimer);
        this.idleTimer = setInterval(() => {
            if (this.game.idle && this.game.fairy) {
                const msgs = this.game.fairy.idle;
                const msg = msgs[Math.floor(Math.random() * msgs.length)];
                this.fairySpeak(msg);
            }
        }, 15000); // 15 seconds
    }

    updateThemeBadges() {
        this.els.hud.badges.innerHTML = '';
        THEMES.forEach((t, i) => {
            const cleared = this.game.clearedThemes.includes(t.id);
            const active = i === this.game.themeIdx;
            const badge = document.createElement('div');
            badge.className = `badge ${cleared ? 'cleared' : ''} ${active ? 'active' : ''}`;
            this.els.hud.badges.appendChild(badge);
        });
    }

    loadStage() {
        const theme = this.game.getTheme();
        const isBoss = this.game.stage === 6;

        let mobData;
        if (isBoss) {
            mobData = theme.boss;
        } else {
            const mobIdx = (this.game.stage - 1) % theme.monsters.length;
            mobData = theme.monsters[mobIdx];
        }

        this.game.currentMonster = { ...mobData, maxHp: mobData.hp };

        document.body.style.backgroundImage = `url('${theme.bg}')`;
        this.els.hud.theme.textContent = theme.name;
        this.els.hud.stage.textContent = isBoss ? "BOSS STAGE" : `Stage ${this.game.stage}`;

        this.els.game.mIcon.textContent = mobData.icon;
        this.els.game.mName.textContent = mobData.name;
        this.els.game.mSituation.textContent = mobData.situation; // Educational Context

        this.updateMonsterHp();
        this.updateHUD();
        this.renderMap();

        this.els.game.guide.textContent = this.game.getHint(mobData.target);
        this.addChat('system', `[상황 발생] ${mobData.situation}`);
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
        this.els.game.mHpText.textContent = `${this.game.currentMonster.hp} / ${this.game.currentMonster.maxHp}`;
    }

    renderMap() {
        const container = this.els.hud.map;
        container.innerHTML = '';
        for (let i = 6; i >= 1; i--) {
            const node = document.createElement('div');
            let type = '⚔️';
            if (i === 6) type = '👑';
            else if (i % 2 === 0) type = '❓';

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
            this.addChat('system', `✨ 해결책 적중! 문제 해결 진행률 +${Math.floor(dmg)}`);
            this.updateMonsterHp();

            if (this.game.currentMonster.hp <= 0) {
                this.stageClear();
            } else {
                this.monsterAttack();
            }
        } else {
            this.monsterAttack();
            this.fairySpeak("그건 답이 아니야! 집중해!");
        }
    }

    monsterAttack() {
        const dmg = 10 + (this.game.themeIdx * 5);
        this.game.hp -= dmg;
        this.updateHUD();
        this.addChat('monster', `문제가 악화되었습니다! (스트레스 +${dmg})`);

        if (this.game.hp <= 0) this.gameOver();
    }

    stageClear() {
        this.addChat('system', "문제가 완벽하게 해결되었습니다!");

        if (this.game.stage === 6) {
            if (!this.game.clearedThemes.includes(this.game.getTheme().id)) {
                this.game.clearedThemes.push(this.game.getTheme().id);
                this.game.saveProgress();
                this.updateThemeBadges();
            }

            this.showWorldMap();
            alert("테마 클리어! 다음 지역이 잠금 해제되었습니다.");
        } else {
            this.game.stage++;
            this.triggerEvent();
        }
    }

    triggerEvent() {
        const rand = Math.random();
        if (rand < 0.3) {
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
            title.textContent = "⛺ 안전한 쉼터";
            desc.textContent = "잠시 쉬어갑니다. 무엇을 할까요?";
            this.createBtn(opts, "휴식하기 (+30 HP)", () => {
                this.game.hp = Math.min(this.game.maxHp, this.game.hp + 30);
                this.startGame();
            });
            this.createBtn(opts, "명상하기 (+30 MP)", () => {
                this.game.mana = Math.min(this.game.maxMana, this.game.mana + 30);
                this.startGame();
            });
        } else if (type === 'SHOP') {
            title.textContent = "💰 방랑 상인";
            desc.textContent = `보유 마나: ${this.game.mana}`;

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
            this.addChat('system', "마나가 부족합니다!");
            return;
        }
        this.game.mana -= 10;
        this.updateHUD();

        const personality = this.game.fairy.personality;
        const hint = this.game.currentMonster.target;
        this.fairySpeak(`(${personality}) 정답 힌트: [ ${hint} ]`);
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
                perk.apply(this.game);
                this.game.reset();
                this.showScreen('class');
            };
            list.appendChild(btn);
        });
    }
}

window.onload = () => new UIController();
