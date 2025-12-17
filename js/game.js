import { CLASSES, THEMES } from './data.js';

export class GameState {
    constructor() {
        this.clearedThemes = JSON.parse(localStorage.getItem('clearedThemes') || '[]');
        this.baseAtk = 0; this.bonusHp = 0; this.bonusMana = 0;
        this.ui = null; // To be injected
        this.reset();
    }

    setUI(ui) {
        this.ui = ui;
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
        const isBoss = stage === 3; // Reduced to 3 stages (3F = Boss)
        if (isBoss) return { ...theme.boss, maxHp: theme.boss.hp, img: theme.bossImg, isBoss: true };

        const mobTemplate = theme.monsters[stage - 1]; // Map 1,2 to index 0,1
        // Fallback if monster not found (though index 0-4 exist, stage 1-2 are safe)
        const mob = mobTemplate || theme.monsters[0];

        const baseHp = 80 + (stage * 20) + (this.themeIdx * 30);
        const phases = [
            { hp: Math.floor(baseHp * 0.6), msg: `${mob.name}이(가) 위협합니다.`, target: mob.target },
            { hp: Math.floor(baseHp * 0.3), msg: `${mob.name}이(가) 주춤합니다.`, target: mob.target },
            { hp: 0, msg: `${mob.name}을(를) 제압했습니다!`, target: "Finish it" }
        ];

        // Initialize Dialogue for Mob (Non-Boss)
        // If it's a mob, we treat the whole fight as a sequence of dialogues.
        // We attach the dialogues array to the monster object.
        const mobDialogues = mob.dialogues || []; // Fallback empty

        return {
            name: mob.name,
            hp: baseHp, maxHp: baseHp,
            img: theme.mobImg,
            phases: phases,
            isBoss: false,
            dialogues: mobDialogues,
            currentDialogueIndex: 0
        };
    }

    getMonsterPhase() {
        const phases = this.currentMonster.phases;
        for (let p of phases) {
            if (this.currentMonster.hp > p.hp) return p;
        }
        return phases[phases.length - 1];
    }

    getCurrentDialogue() {
        const m = this.currentMonster;
        if (m.isBoss) {
            // Boss: Dialogue is inside current Phase
            const phase = this.getMonsterPhase();
            // Boss phases currently have 1 dialogue in phases[...].dialogues array
            // We can simplify by just taking the first one for now, or track index per phase if needed.
            // For now, Boss data structure has dialogues array in phase.
            return phase.dialogues ? phase.dialogues[0] : null;
        } else {
            // Mob: Independent sequence
            return m.dialogues[m.currentDialogueIndex] || m.dialogues[m.dialogues.length - 1];
        }
    }

    // --- Controller Logic moved from UIController ---

    castSpell(input) {
        if (!input) return;
        this.ui.addChat('user', input);

        const dialogue = this.getCurrentDialogue();
        if (!dialogue) {
            // Fallback for old data or error
            console.error("No dialogue found");
            return;
        }

        const lowerInput = input.toLowerCase().trim();

        // 1. Check Perfect Match
        const isPerfect = dialogue.perfect.some(ans => lowerInput.replace(/[^a-z ]/g, '') === ans.toLowerCase().replace(/[^a-z ]/g, ''));

        // 2. Check Keyword Match (Partial)
        const isKeyword = dialogue.keywords.some(kw => lowerInput.includes(kw.toLowerCase()));

        if (isPerfect) {
            // PERFECT HIT
            this.consecutiveErrors = 0;
            const dmg = this.atk * 2; // Critical for perfect
            this.currentMonster.hp = Math.max(0, this.currentMonster.hp - dmg);

            this.ui.addChat('system', `✨ Perfect! ${this.playerClass.action}!! (${dmg} DMG)`);
            this.ui.animateMonsterHit();

            // Advance Dialogue Logic
            if (!this.currentMonster.isBoss) {
                if (this.currentMonster.currentDialogueIndex < this.currentMonster.dialogues.length - 1) {
                    this.currentMonster.currentDialogueIndex++;
                    // Show NEXT guide immediately
                    const nextD = this.getCurrentDialogue();
                    setTimeout(() => this.ui.addChat('guide', `[가이드] ${nextD.guide}`), 800);
                }
            }

            if (this.currentMonster.hp <= 0) {
                this.ui.animateMonsterDeath();
                this.ui.addChat('system', "적을 물리쳤습니다!");
                setTimeout(() => this.stageClear(), 1500);
            } else {
                this.ui.updateRoundUI();
            }

        } else if (isKeyword) {
            // PARTIAL HIT (Weak)
            const dmg = Math.floor(this.atk * 0.5); // Weak damage
            this.currentMonster.hp = Math.max(0, this.currentMonster.hp - dmg);

            this.ui.addChat('system', `⚠️ 부분 적중! (${dmg} DMG)`);
            this.ui.addChat('guide', `💡 ${dialogue.feedback}`); // Show feedback
            this.ui.animateMonsterHit();
            this.ui.updateRoundUI();

        } else {
            // MISS
            this.consecutiveErrors++;
            const dmg = Math.floor(10 * (1 + this.consecutiveErrors * 0.5));
            this.hp -= dmg;
            this.ui.addChat('monster', `실패! 반격을 당합니다. (-${dmg} HP)`);

            // Show Beginner Hint
            const hintMsg = dialogue.hint ? `💡 힌트: ${dialogue.hint}` : `💡 힌트 키워드: ${dialogue.keywords.join(', ')}`;
            this.ui.addChat('guide', hintMsg);

            this.ui.updateRoundUI();
            if (this.hp <= 0) this.gameOver();
        }
    }

    useHint() {
        if (this.mana < 10) {
            this.ui.addChat('system', "마나가 부족합니다.");
            return;
        }
        this.mana -= 10;
        this.ui.updateHUD(); // UI update needs manual call? Or updateRoundUI?
        const hint = this.getMonsterPhase().target;
        this.ui.addChat('system', `💡 힌트: ${hint}`);
    }

    stageClear() {
        // Clear Condition: Stage 3 Cleared
        if (this.stage === 3) {
            if (!this.clearedThemes.includes(this.getTheme().id)) {
                this.clearedThemes.push(this.getTheme().id);
                this.saveProgress();
            }
            this.ui.showWorldMap();
        } else {
            this.stage++;
            this.ui.loadStage();
        }
    }

    gameOver() {
        this.ui.showScreen('gameover');
        // Let UI handle the restart button injection
        this.ui.showGameOver();
    }
}
