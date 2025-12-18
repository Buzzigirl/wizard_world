import { CLASSES, THEMES, CONFIG } from './data.js';
import { AudioManager } from './audio.js';

export class GameState {
    constructor() {
        this.clearedThemes = JSON.parse(localStorage.getItem('clearedThemes') || '[]');
        this.baseAtk = 0; this.bonusHp = 0; this.bonusMana = 0;
        this.ui = null; // To be injected
        this.aiCache = new Map(); // Cache AI responses
        this.audio = new AudioManager(); // Audio system
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
        if (isBoss) {
            // Use boss.img from theme data
            return {
                ...theme.boss,
                maxHp: theme.boss.hp,
                img: theme.boss.img, // Use boss's own image
                isBoss: true
            };
        }

        const mobTemplate = theme.monsters[stage - 1]; // Map 1,2 to index 0,1
        const mob = mobTemplate || theme.monsters[0];

        const baseHp = Math.floor((80 + (stage * 20) + (this.themeIdx * 30)) * 0.5); // Reduced to 50%
        const phases = [
            { hp: Math.floor(baseHp * 0.6), msg: `${mob.name}이(가) 위협합니다.`, target: mob.target },
            { hp: Math.floor(baseHp * 0.3), msg: `${mob.name}이(가) 주춤합니다.`, target: mob.target },
            { hp: 0, msg: `${mob.name}을(를) 제압했습니다!`, target: "Finish it" }
        ];

        const mobDialogues = mob.dialogues || [];

        return {
            name: mob.name,
            hp: baseHp, maxHp: baseHp,
            img: mob.img, // Use individual mob's image
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

    // --- AI Evaluation (Phase 3) ---
    async aiEvaluate(userAnswer, dialogue) {
        if (!CONFIG.AI_ENABLED) return null;

        const cacheKey = `${userAnswer.toLowerCase()}:${dialogue.perfect[0]}`;
        if (this.aiCache.has(cacheKey)) {
            return this.aiCache.get(cacheKey);
        }

        try {
            const scaffolderPersonality = this.fairy.personality || "친절한 선생님";
            const scaffolderStyle = this.fairy.speechStyle || "부드럽고 차분한 말투";

            const prompt = `You are a friendly English teacher helping an elementary school student.
You are speaking as "${this.fairy.name}" with personality: ${scaffolderPersonality}
Speech style: ${scaffolderStyle}

Expected answer: "${dialogue.perfect[0]}"
Student's answer: "${userAnswer}"
Context: ${dialogue.guide.replace(/<br>/g, ' ')}
Grammar pattern: ${dialogue.syntax}

Task 1: Is the student's answer semantically correct and grammatically acceptable? 
- Consider synonyms (e.g., "hit" vs "punch", "play" vs "have fun")
- Accept different phrasings that mean the same thing
- Accept natural variations in expression

Task 2: If the answer is incorrect, provide helpful feedback in Korean (2-4 sentences) that:
- Uses ${this.fairy.name}'s speech style: ${scaffolderStyle}
- Explains what part is wrong in simple terms WITHOUT giving the answer
- Gives a hint about the grammar pattern to think about
- Encourages the student to try again
- NEVER reveals the complete correct answer
- Example: "음... 순서를 다시 생각해봐! 영어는 '누가' 먼저 오고 '무엇을' 나중에 와. 다시 한번 도전!"

Respond in JSON format:
{
  "isCorrect": true/false,
  "feedback": "Korean feedback text in ${this.fairy.name}'s style or null if correct"
}`;

            const result = await this.callOpenAI(prompt);
            this.aiCache.set(cacheKey, result);
            return result;
        } catch (error) {
            console.error('AI Evaluation Error:', error);
            return null;
        }
    }

    async callOpenAI(prompt) {
        const response = await fetch('/api/evaluate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || `Server error: ${response.status}`);
        }

        const data = await response.json();
        const content = data.choices[0].message.content.trim();

        try {
            return JSON.parse(content);
        } catch (e) {
            console.error('Failed to parse AI response:', content);
            return null;
        }
    }

    // --- Continuous AI Scaffolding ---
    async provideAIScaffolding(dialogue) {
        if (!CONFIG.AI_ENABLED) return null;

        try {
            const scaffolderPersonality = this.fairy.personality || "친절한 선생님";
            const scaffolderStyle = this.fairy.speechStyle || "부드럽고 차분한 말투";

            const prompt = `You are a friendly English teacher helping an elementary school student.

IMPORTANT: You are speaking as "${this.fairy.name}" with this personality: ${scaffolderPersonality}
Speech style: ${scaffolderStyle}

Current situation: ${dialogue.guide.replace(/<br>/g, ' ')}
Grammar structure needed: ${dialogue.syntax}
Hint available: ${dialogue.hint}

CRITICAL RULES:
1. DO NOT give the answer directly
2. DO NOT show the complete sentence
3. DO NOT reveal the exact words to use
4. ONLY provide guidance on HOW to think or approach the problem
5. Use the speech style of ${this.fairy.name}: ${scaffolderStyle}

Provide ONE helpful scaffolding message in Korean (3-4 sentences) that:
- Matches ${this.fairy.name}'s personality and speech style
- Guides thinking process WITHOUT giving the answer
- Uses encouraging, age-appropriate language
- Helps understand the grammar pattern conceptually

Choose the most appropriate scaffolding type:

1. **Metacognitive** (사고 과정): Help them think about HOW to approach
   - Guide: "What should you think about first?"
   - Example tone: "먼저 '누가' 하는 건지 생각해봐! 그 다음에 '무엇을' 하는지 생각하면 돼!"

2. **Strategic** (전략): Guide on sentence structure approach
   - Guide: "What order should the words go in?"
   - Example tone: "영어는 순서가 중요해! 주어가 먼저 오고, 그 다음에 동사가 와!"

3. **Conceptual** (개념): Explain the grammar concept
   - Guide: "What does this grammar pattern mean?"
   - Example tone: "이 문장은 '지금' 하는 일을 말하는 거야. 현재형이라고 해!"

4. **Motivational** (격려): Encourage and build confidence
   - Guide: "You can do it!"
   - Example tone: "잘하고 있어! 조금만 더 생각해보면 답을 찾을 수 있을 거야!"

Respond in JSON format:
{
  "type": "Metacognitive|Strategic|Conceptual|Motivational",
  "message": "Korean scaffolding message in ${this.fairy.name}'s speech style"
}`;

            const result = await this.callOpenAI(prompt);
            return result;
        } catch (error) {
            console.error('AI Scaffolding Error:', error);
            return {
                type: "Motivational",
                message: "화이팅! 천천히 생각해보세요. 💪"
            };
        }
    }

    // Helper to display AI scaffolding in fairy panel
    async showAIScaffolding(dialogue) {
        if (!CONFIG.AI_ENABLED) return;

        const scaffolding = await this.provideAIScaffolding(dialogue);
        if (scaffolding && scaffolding.message) {
            const fairyScaffold = document.getElementById('fairy-scaffold');
            if (fairyScaffold) {
                fairyScaffold.textContent = `[${scaffolding.type}] ${scaffolding.message}`;
                fairyScaffold.style.color = this.getScaffoldColor(scaffolding.type);
            }
        }
    }

    getScaffoldColor(type) {
        const colors = {
            'Metacognitive': '#60a5fa',  // Blue
            'Strategic': '#34d399',      // Green
            'Conceptual': '#fbbf24',     // Yellow
            'Motivational': '#f87171'    // Red
        };
        return colors[type] || '#ffd700';
    }

    async castSpell(input) {
        if (!input) return;
        this.ui.addChat('user', input);

        const dialogue = this.getCurrentDialogue();
        if (!dialogue) { console.error("No dialogue"); return; }

        let result = this.analyzeInput(input, dialogue);

        // --- IMMEDIATE AI EVALUATION FOR ALL ANSWERS ---
        this.ui.addChat('system', '🤔 AI가 답변을 검토 중...');

        const aiResult = await this.aiEvaluate(input, dialogue);

        if (aiResult && aiResult.isCorrect) {
            // AI says it's correct! Override rule-based result
            result = { type: 'Perfect', msg: null };
            this.ui.addChat('system', '✨ AI가 정답으로 인정했습니다!');
        } else if (aiResult && aiResult.feedback) {
            // AI provides feedback for incorrect answers
            result.msg = aiResult.feedback;
        }

        if (result.type === 'Perfect') {
            // PERFECT HIT
            this.consecutiveErrors = 0;
            const dmg = this.atk * 2;
            this.currentMonster.hp = Math.max(0, this.currentMonster.hp - dmg);

            this.ui.addChat('perfect', `✨ Perfect! ${this.playerClass.action}!! (${dmg} DMG)`);
            this.audio.playSoundEffect('perfect'); // Perfect hit sound
            this.ui.screenFlash(true); // Perfect flash effect
            this.ui.animateMonsterHit();

            // Check if monster is defeated FIRST
            if (this.currentMonster.hp <= 0) {
                this.ui.animateMonsterDeath();
                this.ui.addChat('system', "적을 물리쳤습니다!");
                setTimeout(() => this.stageClear(), 1500);
                return; // Exit early to prevent dialogue advancement
            }

            // Advance Dialogue Logic (only if monster still alive)
            if (!this.currentMonster.isBoss && this.currentMonster.currentDialogueIndex < this.currentMonster.dialogues.length - 1) {
                // Regular monster: advance to next dialogue
                this.currentMonster.currentDialogueIndex++;
                const nextD = this.getCurrentDialogue();
                setTimeout(() => {
                    this.ui.addChat('guide', `[가이드] ${nextD.guide}`);
                    this.showAIScaffolding(nextD);
                }, 800);
            } else if (this.currentMonster.isBoss) {
                // Boss: show scaffolding for current phase
                const currentD = this.getCurrentDialogue();
                if (currentD) {
                    setTimeout(() => {
                        this.ui.addChat('guide', `[가이드] ${currentD.guide}`);
                        this.showAIScaffolding(currentD);
                    }, 800);
                }
            }

            this.ui.updateRoundUI();

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
                this.audio.playSoundEffect('hit'); // Normal hit sound
                this.ui.screenFlash(false); // Normal flash effect
                this.ui.addChat('scaffold', result.msg, result.type); // type passed for styling
                this.ui.animateMonsterHit();
                this.ui.updateRoundUI();

                // Show AI scaffolding for guidance
                const currentD = this.getCurrentDialogue();
                if (currentD) {
                    this.showAIScaffolding(currentD);
                }
            } else {
                // Miss (Conceptual, Motivational)
                this.consecutiveErrors++;
                const dmg = Math.floor(10 * (1 + this.consecutiveErrors * 0.5));
                this.hp -= dmg;
                this.ui.addChat('monster', `실패! 반격을 당합니다. (-${dmg} HP)`);
                this.ui.addChat('scaffold', result.msg, result.type);
                this.ui.updateRoundUI();

                // Show AI scaffolding for guidance
                const currentD = this.getCurrentDialogue();
                if (currentD) {
                    this.showAIScaffolding(currentD);
                }

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
        this.ui.updateHUD();

        // Get current dialogue's perfect answer
        const dialogue = this.getCurrentDialogue();
        if (dialogue && dialogue.perfect && dialogue.perfect[0]) {
            const answer = dialogue.perfect[0];
            const words = answer.split(' ');
            // Show first letter of each word, rest as dashes
            const hint = words.map(word => {
                if (word.length === 0) return '';
                return word[0] + '-'.repeat(word.length - 1);
            }).join(' ');
            this.ui.addChat('system', `💡 힌트: ${hint}`);
        } else {
            this.ui.addChat('system', `💡 힌트: ${dialogue.hint}`);
        }
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
