// ==========================================
// Class 2: Roguelike Grammar Quest V8 (Premium Glass & Fixes)
// Features: iPhone Style Glass UI, Individual Fairies, Descriptions
// ==========================================

const CONFIG = { API_KEY: "" };

const CLASSES = {
    WARRIOR: {
        id: 'WARRIOR', name: '전사 (Warrior)',
        hp: 150, mana: 30, atk: 25,
        desc: '강인한 체력', difficulty: 'Easy (초급)', action: '공격 (Attack)'
    },
    ROGUE: {
        id: 'ROGUE', name: '도적 (Rogue)',
        hp: 100, mana: 50, atk: 20,
        desc: '균형 잡힌 능력', difficulty: 'Normal (중급)', action: '단검 던지기 (Throw)'
    },
    MAGE: {
        id: 'MAGE', name: '마법사 (Mage)',
        hp: 70, mana: 100, atk: 15,
        desc: '강력한 마법', difficulty: 'Hard (상급)', action: '캐스팅 (Cast)'
    }
};

// Updated Fairies with Indiv Images and Descriptions
const FAIRIES = {
    FIRE: {
        id: 'FIRE', name: '이그니스', type: '불', img: 'assets/fairy_fire.png', icon: '🔥',
        desc: '뜨거운 열정으로 당신을 응원합니다. (공격적 성향)',
        scaffold: ["포기하지 마!", "강하게 밀어붙여!", "넌 할 수 있어!"]
    },
    WATER: {
        id: 'WATER', name: '아쿠아', type: '물', img: 'assets/fairy_water.png', icon: '💧',
        desc: '차분한 지혜로 상황을 분석합니다. (방어적 성향)',
        scaffold: ["차분하게 생각해봐.", "물처럼 유연하게.", "심호흡을 해봐."]
    },
    WIND: {
        id: 'WIND', name: '실피드', type: '바람', img: 'assets/fairy_wind.png', icon: '🍃',
        desc: '자유로운 발상으로 힌트를 줍니다. (속도 중시)',
        scaffold: ["바람을 타고 가자!", "답이 스쳐 지나가?", "자유롭게 상상해!"]
    },
    GROUND: {
        id: 'GROUND', name: '테라', type: '땅', img: 'assets/fairy_ground.png', icon: '🪨',
        desc: '묵묵히 곁을 지켜주는 든든한 파트너. (안정 중시)',
        scaffold: ["기반을 다져야 해.", "단단한 마음가짐.", "묵직한 한 방."]
    }
};

const THEMES = [
    {
        id: 'FOREST', name: '신비한 숲',
        desc: '초급 모험가를 위한 숲입니다. 멧돼지와 엔트가 출현합니다.',
        bg: 'https://images.unsplash.com/photo-1448375240586-dfd8f3793371?q=80&w=2670',
        music: 'https://cdn.pixabay.com/audio/2022/05/27/audio_1808fbf07a.mp3',
        mobImg: 'assets/boar.png', bossImg: 'assets/treant.png',
        monsters: [
            { name: "어린 멧돼지", target: "I calm down" },
            { name: "성난 멧돼지", target: "I heal you" },
            { name: "광란의 멧돼지", target: "Go back home" },
            { name: "숲의 파괴자", target: "Nature is friend" },
            { name: "오염된 정령", target: "Be pure again" }
        ],
        boss: {
            name: "숲의 주인 엔트", hp: 300,
            phases: [
                { hp: 200, msg: "엔트가 당신을 경계합니다.", target: "I respect nature" },
                { hp: 100, msg: "엔트가 숲의 지혜를 묻습니다.", target: "I listen to tree" },
                { hp: 0, msg: "엔트가 평온을 되찾습니다.", target: "Protect the forest" }
            ]
        }
    },
    {
        id: 'DESERT', name: '작열하는 사막',
        desc: '중급 모험가를 위한 사막입니다. 전갈과 샌드웜을 조심하세요.',
        bg: 'https://images.unsplash.com/photo-1545648839-772922756f4d?q=80&w=2574',
        music: 'https://cdn.pixabay.com/audio/2021/11/01/audio_00fa556557.mp3',
        mobImg: 'assets/scorpion.png', bossImg: 'assets/sandworm.png',
        monsters: [
            { name: "모래 전갈", target: "I freeze sand" },
            { name: "맹독 전갈", target: "Remove poison" },
            { name: "강철 전갈", target: "Break armor" },
            { name: "사막 도적", target: "Stop stealing" },
            { name: "미라 병사", target: "Rest in peace" }
        ],
        boss: {
            name: "거대 샌드웜", hp: 400,
            phases: [
                { hp: 300, msg: "샌드웜이 모래폭풍을 일으킵니다!", target: "Stop the storm" },
                { hp: 150, msg: "샌드웜이 삼키려 합니다!", target: "I block mouth" },
                { hp: 0, msg: "샌드웜이 사막 깊이 숨습니다.", target: "Rain fall down" }
            ]
        }
    },
    {
        id: 'CASTLE', name: '마왕성',
        desc: '최상급 난이도. 마왕과의 최종 결전이 기다립니다.',
        bg: 'https://images.unsplash.com/photo-1599596549216-b186b864a75e?q=80',
        music: 'https://cdn.pixabay.com/audio/2022/03/15/audio_201de9832c.mp3',
        mobImg: 'assets/demon_soldier.png', bossImg: 'assets/demon_king.png',
        monsters: [
            { name: "마계 병사", target: "Drop weapon" },
            { name: "마계 정예병", target: "Kneel down" },
            { name: "암흑 기사", target: "Light shine" },
            { name: "서큐버스", target: "Go away" },
            { name: "지옥견", target: "Sit down dog" }
        ],
        boss: {
            name: "대마왕", hp: 1000,
            phases: [
                { hp: 700, msg: "마왕이 세상을 조롱합니다.", target: "We have hope" },
                { hp: 300, msg: "마왕이 파괴 마법을 영창합니다!", target: "Reflect magic" },
                { hp: 0, msg: "마왕이 소멸합니다. 세상에 평화가...", target: "Peace for world" }
            ]
        }
    }
];

class GameState {
    constructor() {
        this.clearedThemes = JSON.parse(localStorage.getItem('clearedThemes') || '[]');
        this.baseAtk = 0; this.bonusHp = 0; this.bonusMana = 0;
        this.reset();
    }

    saveProgress() { localStorage.setItem('clearedThemes', JSON.stringify(this.clearedThemes)); }

    reset() {
        this.mode = 'INTRO';
        this.playerClass = null;
        this.fairy = null;
        this.themeIdx = 0;
        this.stage = 1;
        this.hp = 100; this.maxHp = 100;
        this.mana = 50; this.maxMana = 50;
        this.atk = 10;
        this.currentMonster = null;
        this.consecutiveErrors = 0;
    }

    initPlayer(cid) {
        const c = CLASSES[cid];
        this.playerClass = c;
        this.maxHp = c.hp + this.bonusHp; this.hp = this.maxHp;
        this.maxMana = c.mana + this.bonusMana; this.mana = this.maxMana;
        this.atk = c.atk + this.baseAtk;
    }

    getTheme() { return THEMES[this.themeIdx]; }

    generateMonster(stage) {
        const theme = this.getTheme();
        const isBoss = stage === 6;
        if (isBoss) return { ...theme.boss, maxHp: theme.boss.hp, img: theme.bossImg, isBoss: true };

        const mobTemplate = theme.monsters[stage - 1];
        const baseHp = 80 + (stage * 20) + (this.themeIdx * 30);
        const phases = [
            { hp: Math.floor(baseHp * 0.6), msg: `${mobTemplate.name}이(가) 위협합니다.`, target: mobTemplate.target },
            { hp: Math.floor(baseHp * 0.3), msg: `${mobTemplate.name}이(가) 주춤합니다.`, target: mobTemplate.target },
            { hp: 0, msg: `${mobTemplate.name}을(를) 제압했습니다!`, target: "Finish it" }
        ];

        return {
            name: mobTemplate.name,
            hp: baseHp, maxHp: baseHp,
            img: theme.mobImg,
            phases: phases,
            isBoss: false
        };
    }

    getMonsterPhase() {
        const phases = this.currentMonster.phases;
        for (let p of phases) {
            if (this.currentMonster.hp > p.hp) return p;
        }
        return phases[phases.length - 1];
    }
}

class UIController {
    constructor() {
        this.game = new GameState();
        this.els = this.cacheDOM();
        this.bgm = new Audio(); this.bgm.loop = true;
        this.initEvents();
        this.showScreen('intro');
    }

    cacheDOM() {
        return {
            screens: {
                intro: document.getElementById('screen-intro'),
                class: document.getElementById('screen-class'),
                fairy: document.getElementById('screen-fairy'),
                world: document.getElementById('screen-worldmap'),
                game: document.getElementById('screen-game'),
                gameover: document.getElementById('screen-gameover')
            },
            world: { points: document.getElementById('world-points') },
            hud: {
                hp: document.getElementById('val-hp'), mbHp: document.getElementById('bar-hp'),
                mp: document.getElementById('val-mp'), mbMp: document.getElementById('bar-mp'),
                displayTheme: document.getElementById('display-theme'),
                displayStage: document.getElementById('display-stage'),
                badges: document.getElementById('theme-badges'),
                map: document.getElementById('map-container')
            },
            game: {
                mImg: document.getElementById('monster-img'),
                mName: document.getElementById('monster-name'),
                mHp: document.getElementById('monster-hp-bar'),
                mHpText: document.getElementById('monster-hp-text'),
                mSituation: document.getElementById('monster-situation'),
                chat: document.getElementById('chat-list'),
                input: document.getElementById('inp-spell'),
                btn: document.getElementById('btn-cast'),
                guide: document.getElementById('guide-msg'),
                fairyArea: document.getElementById('fairy-area'),
                fairyName: document.getElementById('fairy-name'),
                fairyScaffold: document.getElementById('fairy-scaffold'),
                // Hero removed
            }
        };
    }

    initEvents() {
        document.getElementById('btn-intro-start').addEventListener('click', () => this.showScreen('class'));

        document.querySelectorAll('.btn-class').forEach(b => b.addEventListener('click', () => {
            this.game.initPlayer(b.dataset.id); this.showScreen('fairy');
        }));
        document.querySelectorAll('.btn-fairy').forEach(b => b.addEventListener('click', () => {
            this.game.fairy = FAIRIES[b.dataset.id]; this.showWorldMap();
        }));

        this.els.game.btn.addEventListener('click', () => this.castSpell());
        this.els.game.input.addEventListener('keypress', (e) => { if (e.key === 'Enter') this.castSpell(); });
        document.querySelector('.hint-btn').addEventListener('click', () => this.useHint());
    }

    showScreen(id) {
        Object.values(this.els.screens).forEach(el => el.classList.add('hidden'));
        this.els.screens[id].classList.remove('hidden');

        // Background Logic
        // Magical Tower Interior for Lobby
        const LOBBY_BG = 'https://images.unsplash.com/photo-1519074069444-1ba4fff66d16?q=80&w=2574';

        if (id === 'game') {
            const theme = this.game.getTheme();
            if (theme) this.setBackground(theme.bg);
        } else {
            this.setBackground(LOBBY_BG);
        }
    }

    setBackground(url) {
        // Preload image to prevent flickering
        const img = new Image();
        img.src = url;
        img.onload = () => {
            document.body.style.backgroundImage = `url('${url}')`;
        };
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

            // Added Description to Title logic if needed, but here simple layout
            btn.innerHTML = `<span class="icon">${cleared ? '🚩' : (locked ? '🔒' : '⚔️')}</span>
                             <div class="map-text">
                                <span class="label">${t.name}</span>
                                <span class="desc">${t.desc}</span>
                             </div>`;

            if (!locked) btn.onclick = () => { this.game.themeIdx = i; this.startGame(); };
            container.appendChild(btn);
        });
    }

    startGame() {
        this.showScreen('game');
        this.playMusic(this.game.getTheme().music);

        this.els.game.btn.textContent = this.game.playerClass.action;
        this.els.game.input.placeholder = `${this.game.playerClass.action}을(를) 위해 문장을 입력하세요...`;

        this.loadStage();
    }

    playMusic(url) {
        if (this.bgm.src !== url) { this.bgm.src = url; this.bgm.volume = 0.3; this.bgm.play().catch(() => { }); }
    }

    loadStage() {
        const mob = this.game.generateMonster(this.game.stage);
        this.game.currentMonster = mob;

        const theme = this.game.getTheme();
        // Force update background for the theme to guarantee visibility
        this.setBackground(theme.bg);

        this.els.hud.displayTheme.textContent = theme.name;
        this.els.hud.displayStage.textContent = mob.isBoss ? "BOSS" : `Stage ${this.game.stage}`;

        this.els.game.mImg.src = mob.img;
        this.els.game.mImg.classList.remove('hidden', 'slashed');
        this.els.game.mName.textContent = mob.name;

        // Update Fairy Image + Text in V8
        this.els.game.fairyArea.innerHTML = `<img src="${this.game.fairy.img}" class="fairy-img-anim">`;
        this.els.game.fairyName.textContent = this.game.fairy.name;

        this.updateScaffolding();
        this.updateRoundUI();
        this.renderMap();
        this.addChat('system', `[전투 시작] ${this.game.playerClass.action} 준비!`);
    }

    updateScaffolding() {
        const msgs = this.game.fairy.scaffold;
        this.els.game.fairyScaffold.textContent = `"${msgs[Math.floor(Math.random() * msgs.length)]}"`;
    }

    updateRoundUI() {
        const phase = this.game.getMonsterPhase();
        this.els.game.mSituation.textContent = phase.msg;
        this.updateHUD();
    }

    updateHUD() {
        this.els.hud.hp.textContent = this.game.hp;
        this.els.hud.mbHp.style.height = `${(this.game.hp / this.game.maxHp) * 100}%`;
        this.els.hud.mp.textContent = this.game.mana;
        this.els.hud.mbMp.style.height = `${(this.game.mana / this.game.maxMana) * 100}%`;

        const m = this.game.currentMonster;
        this.els.game.mHp.style.width = `${(m.hp / m.maxHp) * 100}%`;
        this.els.game.mHpText.textContent = `${m.hp} / ${m.maxHp}`;

        if (this.game.hp / this.game.maxHp < 0.3) document.body.classList.add('low-hp');
        else document.body.classList.remove('low-hp');
    }

    renderMap() {
        const container = this.els.hud.map;
        container.innerHTML = '';
        for (let i = 6; i >= 1; i--) {
            const node = document.createElement('div');
            let label = `${i}F`;
            if (i === 6) label = 'BOSS';

            node.className = `map-node ${i === this.game.stage ? 'current' : ''} ${i < this.game.stage ? 'cleared' : ''}`;
            node.innerHTML = `<span>${i === this.game.stage ? '⚔️' : (i < this.game.stage ? '🚩' : '🔒')}</span>`;

            node.dataset.goal = i === 6 ? "최종 보스 처치" : "문법 퀴즈 해결";
            if (i === this.game.stage) node.dataset.goal = "현재 목표: 몬스터 제압";

            const txt = document.createElement('span');
            txt.className = "map-label";
            txt.textContent = label;
            node.appendChild(txt);

            container.appendChild(node);
        }
    }

    castSpell() {
        const input = this.els.game.input.value.trim();
        if (!input) return;
        this.els.game.input.value = '';
        this.addChat('user', input);

        const phase = this.game.getMonsterPhase();
        const isMatch = input.toLowerCase().replace(/[^a-z]/g, '') === phase.target.toLowerCase().replace(/[^a-z]/g, '');

        if (isMatch) {
            this.game.consecutiveErrors = 0;
            const dmg = this.game.atk * 2;
            this.game.currentMonster.hp = Math.max(0, this.game.currentMonster.hp - dmg);
            this.addChat('system', `✨ ${this.game.playerClass.action} 성공! (${dmg} 데미지)`);
            this.els.game.mImg.classList.add('hit');
            setTimeout(() => this.els.game.mImg.classList.remove('hit'), 300);

            if (this.game.currentMonster.hp <= 0) {
                this.els.game.mImg.classList.add('slashed');
                this.addChat('system', "적을 물리쳤습니다!");
                setTimeout(() => this.stageClear(), 1500);
            } else {
                this.updateRoundUI();
                this.updateScaffolding();
            }
        } else {
            this.game.consecutiveErrors++;
            const dmg = Math.floor(10 * (1 + this.game.consecutiveErrors * 0.5));
            this.game.hp -= dmg;
            this.addChat('monster', `실패했습니다! 반격을 당합니다. (-${dmg} HP)`);
            this.updateRoundUI();
            if (this.game.hp <= 0) this.gameOver();
        }
    }

    useHint() {
        if (this.game.mana < 10) {
            this.addChat('system', "마나가 부족합니다.");
            return;
        }
        this.game.mana -= 10;
        this.updateHUD();
        const hint = this.game.getMonsterPhase().target;
        this.addChat('system', `💡 힌트: ${hint}`);
    }

    addChat(sender, text) {
        const div = document.createElement('div');
        div.className = `msg ${sender}`;
        div.textContent = text;
        if (this.els.game.chat.children.length > 5) this.els.game.chat.firstChild.remove();
        this.els.game.chat.appendChild(div);
    }

    stageClear() {
        if (this.game.stage === 6) {
            if (!this.game.clearedThemes.includes(this.game.getTheme().id)) {
                this.game.clearedThemes.push(this.game.getTheme().id);
                this.game.saveProgress();
            }
            this.showWorldMap();
        } else {
            this.game.stage++;
            this.loadStage();
        }
    }

    gameOver() {
        this.showScreen('gameover');
        document.getElementById('perk-list').innerHTML = '<button class="perk-btn" onclick="location.reload()">다시 시작</button>';
    }
}

window.onload = () => new UIController();
