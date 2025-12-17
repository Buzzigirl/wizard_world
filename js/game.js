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

    // --- Scaffolding Logic ---
    analyzeInput(input, dialogue) {
        const lowerInput = input.toLowerCase().trim();
        const cleanInput = lowerInput.replace(/[^\w\s']/g, ''); // Remove punctuation
        const perfectAnswers = dialogue.perfect.map(ans => ans.toLowerCase().replace(/[^\w\s']/g, ''));

        // 1. Perfect Match
        if (perfectAnswers.includes(cleanInput)) return { type: 'Perfect', msg: null };

        // 2. Metacognitive (Near Miss - Typos, Articles)
        // Check Levenshtein distance or simple inclusion for "very close" answers
        for (let ans of perfectAnswers) {
            if (this.getLevenshteinDistance(cleanInput, ans) <= 2) {
                return { type: 'Metacognitive', msg: "거의 완벽해요! 철자나 관사(a/the)를 다시 확인해보세요." };
            }
        }

        // 3. Strategic (Order Error)
        // Check if all keywords are present but order is wrong OR structure matches partial
        // Simple check: All keywords exist?
        const missingKeywords = dialogue.keywords.filter(kw => !lowerInput.includes(kw.toLowerCase()));
        if (missingKeywords.length === 0) {
            return { type: 'Strategic', msg: `단어는 다 맞았는데 순서가 아쉬워요. [${dialogue.syntax}] 순서를 기억하세요!` };
        }

        // 4. Conceptual (Missing Knowledge)
        // Some keywords are missing
        if (missingKeywords.length > 0) {
            const missing = missingKeywords.join(', ');
            return { type: 'Conceptual', msg: `중요한 단어 '${missing}'이(가) 빠졌어요. 이 단어를 문장에 넣어보세요.` };
        }

        // 5. Motivational (Fallback)
        return { type: 'Motivational', msg: `괜찮아요! 힌트: ${dialogue.hint} 형식을 따라해보세요.` };
    }

    getLevenshteinDistance(a, b) {
        const matrix = [];
        for (let i = 0; i <= b.length; i++) matrix[i] = [i];
        for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
        for (let i = 1; i <= b.length; i++) {
            for (let j = 1; j <= a.length; j++) {
                if (b.charAt(i - 1) == a.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, Math.min(matrix[i][j - 1] + 1, matrix[i - 1][j] + 1));
                }
            }
        }
        return matrix[b.length][a.length];
    }

    castSpell(input) {
        if (!input) return;
        this.ui.addChat('user', input);

        const dialogue = this.getCurrentDialogue();
        if (!dialogue) { console.error("No dialogue"); return; }

        const result = this.analyzeInput(input, dialogue);

        if (result.type === 'Perfect') {
            // PERFECT HIT
            this.consecutiveErrors = 0;
            const dmg = this.atk * 2;
            this.currentMonster.hp = Math.max(0, this.currentMonster.hp - dmg);

            this.ui.addChat('perfect', `✨ Perfect! ${this.playerClass.action}!! (${dmg} DMG)`); // New type 'perfect'
            this.ui.animateMonsterHit();

            // Advance Dialogue Logic
            if (!this.currentMonster.isBoss && this.currentMonster.currentDialogueIndex < this.currentMonster.dialogues.length - 1) {
                this.currentMonster.currentDialogueIndex++;
                const nextD = this.getCurrentDialogue();
                setTimeout(() => this.ui.addChat('guide', `[가이드] ${nextD.guide}`), 800);
            }

            if (this.currentMonster.hp <= 0) {
                this.ui.animateMonsterDeath();
                this.ui.addChat('system', "적을 물리쳤습니다!");
                setTimeout(() => this.stageClear(), 1500);
            } else {
                this.ui.updateRoundUI();
            }

        } else {
            // SCAFFOLDING FEEDBACK (Weak Hit or Miss logic can be adapted)
            // For educational purpose, we punish HP only on "Motivational" (Complete failure)?
            // Or Keep existing Partial Hit logic? 
            // Let's map Scaffolding to Hit Types:
            // Metacognitive/Strategic -> Weak Hit (Partial)
            // Conceptual/Motivational -> Miss

            if (result.type === 'Metacognitive' || result.type === 'Strategic') {
                // Partial Hit
                const dmg = Math.floor(this.atk * 0.5);
                this.currentMonster.hp = Math.max(0, this.currentMonster.hp - dmg);
                this.ui.addChat('system', `⚠️ 부분 적중! (${dmg} DMG)`);
                this.ui.addChat('scaffold', result.msg, result.type); // type passed for styling
                this.ui.animateMonsterHit();
                this.ui.updateRoundUI();
            } else {
                // Miss (Conceptual, Motivational)
                this.consecutiveErrors++;
                const dmg = Math.floor(10 * (1 + this.consecutiveErrors * 0.5));
                this.hp -= dmg;
                this.ui.addChat('monster', `실패! 반격을 당합니다. (-${dmg} HP)`);
                this.ui.addChat('scaffold', result.msg, result.type);
                this.ui.updateRoundUI();
                if (this.hp <= 0) this.gameOver();
            }
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
