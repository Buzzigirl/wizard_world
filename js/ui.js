import { LOBBY_BG, THEMES, FAIRIES } from './data.js';

export class UIManager {
    constructor(game) {
        this.game = game;
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
                guideBox: document.getElementById('guide-box'), // Guide Box
                mHp: document.getElementById('monster-hp-bar'),
                mHpText: document.getElementById('monster-hp-text'),
                mSituation: document.getElementById('monster-situation'),
                chat: document.getElementById('chat-list'),
                input: document.getElementById('inp-spell'),
                btn: document.getElementById('btn-cast'),
                guide: document.getElementById('guide-msg'),
                fairyArea: document.getElementById('fairy-area'),
                fairyName: document.getElementById('fairy-name'),
                fairyScaffold: document.getElementById('fairy-scaffold')
            }
        };
    }

    initEvents() {
        document.getElementById('btn-intro-start').addEventListener('click', () => this.showScreen('class'));

        document.querySelectorAll('.btn-class').forEach(b => b.addEventListener('click', () => {
            this.game.initPlayer(b.dataset.id); this.showScreen('fairy');
        }));
        // Initial screen setup
        this.renderFairySelection();

        // Event delegation for fairy selection
        this.els.screens.fairy.addEventListener('click', (e) => {
            const btn = e.target.closest('.btn-fairy');
            if (btn) {
                this.game.fairy = FAIRIES[btn.dataset.id];
                this.showWorldMap();
            }
        });

        this.els.game.btn.addEventListener('click', () => {
            this.game.castSpell(this.els.game.input.value.trim());
            this.els.game.input.value = ''; // Input cleared in logic? game.js clears logic but doesn't touch DOM input.value directly except by reference?
            // Actually game.js attempts: this.els.game.input.value = ''. But game.js doesn't have `els`.
            // I need to update game.js logic? 
            // game.js: this.ui.addChat('user', input)...
            // In game.js I wrote: this.ui.addChat('user', input).
            // Does game.js clear input?
            // game.js source: const input = this.els.game.input.value.trim() -> ERROR. game.js doesn't have `this.els`.
            // I MADE A MISTAKE IN game.js. Step 864. 
            // Line 395: const input = this.els.game.input.value.trim();
            // `this.els` is undefined in GameState.
            // I need to fix game.js access to UI elements or pass input.
            // I passed input in `castSpell(input)`. 
            // So game.js shouldn't read `this.els`.
        });

        this.els.game.input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.game.castSpell(this.els.game.input.value.trim());
                this.els.game.input.value = '';
            }
        });
        document.querySelector('.hint-btn').addEventListener('click', () => this.game.useHint());
    }

    showScreen(id) {
        Object.values(this.els.screens).forEach(el => el.classList.add('hidden'));
        this.els.screens[id].classList.remove('hidden');

        if (id === 'game') {
            const theme = this.game.getTheme();
            if (theme) this.setBackground(theme.bg);
        } else {
            this.setBackground(LOBBY_BG);
        }
    }

    setBackground(url) {
        this.currentBgUrl = url; // Track latest request
        const img = new Image();
        img.src = url;
        img.onload = () => {
            // Only apply if this is still the requested URL
            if (this.currentBgUrl === url) {
                document.body.style.backgroundImage = `url('${url}')`;
            }
        };
    }

    showWorldMap() {
        this.showScreen('world');
        const container = this.els.world.points;
        container.innerHTML = '';
        THEMES.forEach((t, i) => {
            const btn = document.createElement('button');
            const locked = false;
            const cleared = this.game.clearedThemes.includes(t.id);
            btn.className = `map-point ${locked ? 'locked' : ''} ${cleared ? 'cleared' : ''}`;

            btn.innerHTML = `<span class="icon">${cleared ? '🚩' : (locked ? '🔒' : '⚔️')}</span>
                             <div class="map-text">
                                <span class="label">${t.name}</span>
                                <span class="desc">${t.desc}</span>
                             </div>`;

            if (!locked) {
                btn.onclick = () => {
                    // Remove listeners to prevent race condition
                    btn.onmouseleave = null;
                    this.game.themeIdx = i;
                    this.startGame();
                };
                btn.onmouseenter = () => this.setBackground(t.bg);
                btn.onmouseleave = () => this.setBackground(LOBBY_BG);
            }
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
        this.game.currentMonster = mob; // Sync Game State

        const theme = this.game.getTheme();
        this.setBackground(theme.bg);

        this.els.hud.displayTheme.textContent = theme.name;
        this.els.hud.displayStage.textContent = mob.isBoss ? "BOSS" : `Stage ${this.game.stage}`;

        this.els.game.mImg.src = mob.img;
        this.els.game.mImg.classList.remove('hidden', 'slashed');
        this.els.game.mName.textContent = mob.name;

        this.els.game.fairyArea.innerHTML = `<img src="${this.game.fairy.img}" class="fairy-img-anim">`;
        this.els.game.fairyName.textContent = this.game.fairy.name;

        this.updateScaffolding();
        this.updateRoundUI();
        this.renderMap();
        this.addChat('system', `[전투 시작] ${this.game.playerClass.action} 준비!`);

        // Initial Guide Message
        // Initial Guide Message
        const dialogue = this.game.getCurrentDialogue();
        if (dialogue) {
            // Use setTimeout to ensure it appears after "Battle Start" message
            setTimeout(() => this.addChat('guide', `[가이드] ${dialogue.guide}`), 500);
        }
    }

    updateScaffolding() {
        const msgs = this.game.fairy.scaffold;
        this.els.game.fairyScaffold.textContent = `"${msgs[Math.floor(Math.random() * msgs.length)]}"`;
    }

    updateRoundUI() {
        const phase = this.game.getMonsterPhase();
        this.els.game.mSituation.textContent = phase.msg;
        this.updateHUD();

        // Show guide message for current phase if boss, or general desc if mob
        if (this.game.currentMonster.isBoss && phase.desc) {
            this.addChat('guide', `[가이드] ${phase.desc}`);
        }
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

        // Retrieve current theme to get monster names
        const theme = this.game.getTheme();
        const monsters = theme.monsters; // Array of 5 mobs
        // Boss is separate in theme.boss

        for (let i = 3; i >= 1; i--) {
            const node = document.createElement('div');
            let icon = '⚔️';
            let name = '';

            if (i === 3) {
                icon = '💀'; // Boss Skull
                name = theme.boss.name;
            } else {
                // Map Stage 1, 2 to Monsters. 
                // Logic: Stage 1 -> Mob 0? No, usually Stage 1, 2, 3...
                // GameState generateMonster(stage): returns monsters[stage-1] or [stage%length]
                // Let's assume standard mapping: Stage 1 -> monsters[0], Stage 2 -> monsters[1]
                const mobIdx = (i - 1) % monsters.length;
                name = monsters[mobIdx].name;
                icon = i < this.game.stage ? '🚩' : '⚔️';
            }

            // Override icon for current/cleared
            if (i < this.game.stage) icon = '🚩';
            if (i === this.game.stage) icon = i === 3 ? '💀' : '⚔️';

            node.className = `map-node ${i === this.game.stage ? 'current' : ''} ${i < this.game.stage ? 'cleared' : ''}`;

            // Simplified: No monster name
            node.innerHTML = `
                <div class="node-icon">${icon}</div>
                <span class="stage-num">${i === 3 ? 'BOSS' : i + 'F'}</span>
            `;

            container.appendChild(node);
        }
    }

    addChat(type, msg, scaffoldType = null) {
        // Special routing for Guide messages
        if (type === 'guide') {
            if (this.els.game.guideBox) {
                this.els.game.guideBox.innerHTML = msg.replace(/\n/g, '<br>');
                this.els.game.guideBox.classList.remove('hidden');
                // Visual Pulse
                this.els.game.guideBox.style.transform = "scale(1.05)";
                setTimeout(() => this.els.game.guideBox.style.transform = "scale(1)", 200);
            }
            return;
        }

        const div = document.createElement('div');
        div.className = `msg ${type}`;

        // Scaffold Feedback Styling
        if (type === 'scaffold' && scaffoldType) {
            div.classList.add(scaffoldType.toLowerCase()); // e.g. 'scaffold strategic'

            // Add Icon based on Scaffold Type
            let icon = '';
            let label = '';
            switch (scaffoldType) {
                case 'Perfect': icon = '✨'; label = 'Perfect!'; break;
                case 'Metacognitive': icon = '💡'; label = 'Check!'; break;
                case 'Strategic': icon = '🎯'; label = 'Order?'; break;
                case 'Conceptual': icon = '🧠'; label = 'Missing?'; break;
                case 'Motivational': icon = '💪'; label = 'Hint'; break;
            }
            // Prepend Label
            if (label) {
                const badge = document.createElement('span');
                badge.className = 'scaffold-badge';
                badge.textContent = `${icon} ${label}`;
                div.appendChild(badge);
                div.appendChild(document.createTextNode(' ')); // Spacer
            }
        }

        div.appendChild(document.createTextNode(msg)); // Append text safely

        this.els.game.chat.appendChild(div);

        // Auto scroll
        this.els.game.chat.scrollTop = this.els.game.chat.scrollHeight;

        // Limit history
        while (this.els.game.chat.children.length > 7) {
            this.els.game.chat.removeChild(this.els.game.chat.firstChild);
        }
    }

    // Animations requested by GameState
    animateMonsterHit() {
        this.els.game.mImg.classList.add('hit');
        setTimeout(() => this.els.game.mImg.classList.remove('hit'), 300);
    }

    animateMonsterDeath() {
        this.els.game.mImg.classList.add('slashed');
    }

    showGameOver() {
        document.getElementById('perk-list').innerHTML = '<button class="perk-btn" onclick="location.reload()">다시 시작</button>';
    }

    renderFairySelection() {
        const container = this.els.screens.fairy.querySelector('.cards');
        const speechBubble = document.getElementById('fairy-speech-bubble');
        container.innerHTML = '';

        Object.values(FAIRIES).forEach(f => {
            const btn = document.createElement('button');
            btn.className = 'btn-card btn-fairy';
            btn.dataset.id = f.id;

            // Image based card
            btn.innerHTML = `
                <div class="fairy-img-container">
                    <img src="${f.img}" alt="${f.name}" class="fairy-select-img">
                </div>
                <h2>${f.name}</h2>
                <div class="fairy-type-icon">${f.icon}</div>
            `;

            // Hover Events for Speech Bubble
            btn.onmouseenter = () => {
                speechBubble.textContent = `"${f.personality}"`;
                speechBubble.classList.add('active');
            };
            btn.onmouseleave = () => {
                speechBubble.textContent = "마우스를 올려보세요!";
                speechBubble.classList.remove('active');
            };

            container.appendChild(btn);
        });
    }
}
