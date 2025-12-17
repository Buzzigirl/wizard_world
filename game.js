// ==========================================
// Class 2: Roguelike Grammar Quest
// ==========================================

const CONFIG = {
    API_KEY: "", // Gemini API 키 (환경변수로 관리 권장)
    API_URL: "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"
};

// ==========================================
// Game Data
// ==========================================
const MONSTERS = [
    {
        id: 'm1', name: "Fire Spirit", type: "FIRE", weakness: ["cold", "cool", "icy", "wet"],
        hp: 150, icon: "🔥", desc: "불타는 정령입니다. 차가운(Cold) 공격이 필요합니다.", category: 'MONSTER'
    },
    {
        id: 'm2', name: "Water Slime", type: "WATER", weakness: ["hot", "warm", "dry", "electric"],
        hp: 120, icon: "💧", desc: "축축한 슬라임입니다. 뜨거운(Hot) 공격에 약합니다.", category: 'MONSTER'
    },
    {
        id: 'm3', name: "Iron Golem", type: "METAL", weakness: ["strong", "heavy", "hard", "hot"],
        hp: 200, icon: "⚙️", desc: "단단한 강철 골렘입니다. 강한(Strong) 충격이나 녹이는 열이 필요합니다.", category: 'MONSTER'
    },
    {
        id: 'm4', name: "Wind Bat", type: "WIND", weakness: ["heavy", "fast", "quick"],
        hp: 100, icon: "💨", desc: "재빠른 박쥐입니다. 무거운(Heavy) 바람으로 누르거나 더 빨라야(Fast) 합니다.", category: 'MONSTER'
    },
    {
        id: 'm5', name: "Dark Shadow", type: "DARK", weakness: ["bright", "shiny", "light"],
        hp: 130, icon: "🌑", desc: "어둠의 그림자입니다. 밝은(Bright) 빛이 약점입니다.", category: 'MONSTER'
    }
];

const REAL_LIFE_SCENARIOS = [
    {
        id: 'r1', name: "Too Hot Coffee", type: "TOO HOT", weakness: ["cold", "cool", "iced"],
        hp: 80, icon: "☕", desc: "커피가 너무 뜨거워서 마실 수 없습니다! 식혀주세요.", category: 'REAL_LIFE'
    },
    {
        id: 'r2', name: "Heavy Luggage", type: "HEAVY", weakness: ["light", "strong"],
        hp: 100, icon: "💼", desc: "짐이 너무 무거워서 들 수 없습니다. 가볍게 만들거나(Light) 힘을 쓰세요(Strong).", category: 'REAL_LIFE'
    },
    {
        id: 'r3', name: "Dark Room", type: "DARKNESS", weakness: ["bright", "light"],
        hp: 60, icon: "🌞", desc: "방이 너무 어둡습니다. 불을 켜거나 밝게 만들어주세요.", category: 'REAL_LIFE'
    }
];

const ARTIFACTS = [
    { id: 'Potion', name: 'Health Potion', icon: '❤️', desc: '즉시 HP 50 회복 (1회용)', type: 'CONSUMABLE' },
    { id: 'ManaCrystal', name: 'Mana Crystal', icon: '🔋', desc: '최대 마나 +20 (지속)', type: 'PASSIVE' },
    { id: 'GrimoirePage', name: 'Secret Page', icon: '📖', desc: '몬스터 약점 자동 분석 (지속)', type: 'PASSIVE' }
];

const VOCAB_QUIZZES = [
    { q: "차가운", a: "cold" }, { q: "뜨거운", a: "hot" },
    { q: "빠른", a: "fast" }, { q: "무거운", a: "heavy" },
    { q: "밝은", a: "bright" }, { q: "강한", a: "strong" },
    { q: "날카로운", a: "sharp" }, { q: "젖은", a: "wet" }
];

// ==========================================
// Game State
// ==========================================
class GameState {
    constructor() {
        this.phase = 'INTRO'; // INTRO, COMBAT, REWARD, GAME_OVER
        this.playerHp = 100;
        this.maxHp = 100;
        this.mana = 50;
        this.maxMana = 50;
        this.inventory = [];
        this.messages = [];
        this.currentMonster = null;
        this.stageCount = 1;
        this.monsterHp = 100;
        this.isLoading = false;
        this.quizIndex = 0;
    }

    reset() {
        this.phase = 'INTRO';
        this.playerHp = 100;
        this.maxHp = 100;
        this.mana = 50;
        this.maxMana = 50;
        this.inventory = [];
        this.messages = [];
        this.currentMonster = null;
        this.stageCount = 1;
        this.monsterHp = 100;
    }
}

// ==========================================
// AI Service
// ==========================================
class AIService {
    static async getWizFeedback(userText, currentMonster) {
        if (!CONFIG.API_KEY) {
            return this.localEvaluation(userText, currentMonster);
        }

        try {
            const isRealLife = currentMonster.category === 'REAL_LIFE';
            const systemPrompt = `
당신은 AI 튜터 '위즈'입니다. 로그라이크 게임의 심판입니다.

[현재 상황: ${isRealLife ? "실생활 문제 해결" : "몬스터 전투"}]
- 대상: ${currentMonster.name} (속성/상태: ${currentMonster.type})
- 유효 해결 단어(반의어 등): ${currentMonster.weakness.join(', ')}
- 목표 구문: S + V + Adjective + O (예: I make it cool, I cast cold ice)

[판정 기준]
1. 문법(어순)이 대략적으로 맞아야 함.
2. **형용사(Adjective)**가 대상의 상태를 해결하거나 반대되는 개념(반의어)이면 "Critical Hit".
3. 형용사가 없거나 관련 없으면 "Normal Hit" (데미지 낮음).
4. 문맥상 완전히 틀리면 "Miss".

[Output JSON]
{
  "isCorrect": boolean,
  "damage": number (0=Miss, 20=Normal, 60=Critical),
  "message": "위즈의 피드백 (한국어, 이모지 포함, ${isRealLife ? "실생활 조언 톤으로" : "전투 톤으로"})",
  "scaffoldingType": "Conceptual" | "Strategic" | "Motivational" | "Success"
}
            `;

            const response = await fetch(
                `${CONFIG.API_URL}?key=${CONFIG.API_KEY}`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: `Check this input against target '${currentMonster.name}': ${userText}` }] }],
                        systemInstruction: { parts: [{ text: systemPrompt }] },
                        generationConfig: { responseMimeType: "application/json" }
                    }),
                }
            );

            if (!response.ok) throw new Error("API Error");
            const data = await response.json();
            return JSON.parse(data.candidates[0].content.parts[0].text);

        } catch (error) {
            console.error("AI Service Error:", error);
            return this.localEvaluation(userText, currentMonster);
        }
    }

    static localEvaluation(userText, currentMonster) {
        const userLower = userText.toLowerCase().trim();

        // Check if any weakness keyword is in the input
        const hasWeakness = currentMonster.weakness.some(w => userLower.includes(w));

        if (hasWeakness) {
            return {
                isCorrect: true,
                damage: 60,
                message: "🔥 Critical Hit! 완벽한 해결책입니다!",
                scaffoldingType: "Success"
            };
        } else if (userLower.length > 5) {
            return {
                isCorrect: true,
                damage: 20,
                message: "👍 괜찮아요! 하지만 더 효과적인 형용사를 사용해보세요.",
                scaffoldingType: "Strategic"
            };
        } else {
            return {
                isCorrect: false,
                damage: 0,
                message: "❌ 주문 실패! 반대되는 형용사를 사용해보세요.",
                scaffoldingType: "Conceptual"
            };
        }
    }
}

// ==========================================
// UI Controller
// ==========================================
class UIController {
    constructor(gameState) {
        this.state = gameState;
        this.initElements();
        this.bindEvents();
    }

    initElements() {
        // Screens
        this.introScreen = document.getElementById('intro-screen');
        this.gameScreen = document.getElementById('game-screen');
        this.gameoverScreen = document.getElementById('gameover-screen');

        // Game elements
        this.stageDisplay = document.getElementById('stage-count');
        this.hpDisplay = document.getElementById('hp-display');
        this.manaDisplay = document.getElementById('mana-display');
        this.inventory = document.getElementById('inventory');
        this.chatArea = document.getElementById('chat-area');
        this.userInput = document.getElementById('user-input');
        this.sendBtn = document.getElementById('send-btn');
        this.sendIcon = document.getElementById('send-icon');

        // Entity display
        this.stage = document.getElementById('stage');
        this.entityIcon = document.getElementById('entity-icon');
        this.entityHpFill = document.getElementById('entity-hp-fill');
        this.entityName = document.getElementById('entity-name');
        this.weaknessHint = document.getElementById('weakness-hint');
        this.taskGuide = document.getElementById('task-guide');

        // Reward
        this.rewardScreen = document.getElementById('reward-screen');
        this.artifactChoices = document.getElementById('artifact-choices');

        // Modals
        this.grimoireModal = document.getElementById('grimoire-modal');
        this.manaModal = document.getElementById('mana-modal');
        this.quizWord = document.getElementById('quiz-word');
        this.quizOptions = document.getElementById('quiz-options');
        this.quizFeedback = document.getElementById('quiz-feedback');
    }

    bindEvents() {
        // Start game
        document.getElementById('start-game-btn').addEventListener('click', () => this.startGame());

        // Send message
        this.sendBtn.addEventListener('click', () => this.handleSend());
        this.userInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleSend();
        });

        // Modals
        document.getElementById('grimoire-btn').addEventListener('click', () => {
            this.grimoireModal.classList.remove('hidden');
        });
        document.getElementById('grimoire-close').addEventListener('click', () => {
            this.grimoireModal.classList.add('hidden');
        });
        document.getElementById('mana-btn').addEventListener('click', () => {
            this.showManaQuiz();
        });
        document.getElementById('mana-close').addEventListener('click', () => {
            this.manaModal.classList.add('hidden');
        });

        // Retry
        document.getElementById('retry-btn').addEventListener('click', () => {
            location.reload();
        });

        // Close modals on background click
        this.grimoireModal.addEventListener('click', (e) => {
            if (e.target === this.grimoireModal) this.grimoireModal.classList.add('hidden');
        });
        this.manaModal.addEventListener('click', (e) => {
            if (e.target === this.manaModal) this.manaModal.classList.add('hidden');
        });
    }

    startGame() {
        this.state.phase = 'COMBAT';
        this.introScreen.classList.add('hidden');
        this.gameScreen.classList.remove('hidden');

        this.addMessage('wiz', "좋아, 숲으로 들어가자! 상황에 맞는 '반의어 형용사'를 사용해서 문제를 해결해야 해.");
        this.startStage();
    }

    startStage() {
        let targetEntity;
        let introMsg;

        // Every 3rd stage is a real-life scenario
        if (this.state.stageCount % 3 === 0) {
            targetEntity = REAL_LIFE_SCENARIOS[Math.floor(Math.random() * REAL_LIFE_SCENARIOS.length)];
            introMsg = `🏙️ 실생활 미션 발생! ${targetEntity.name} 상황을 해결하세요!`;
        } else {
            targetEntity = MONSTERS[Math.floor(Math.random() * MONSTERS.length)];
            introMsg = `⚠️ 야생의 ${targetEntity.name}(이)가 나타났다!`;
        }

        this.state.currentMonster = { ...targetEntity, maxHp: targetEntity.hp };
        this.state.monsterHp = targetEntity.hp;
        this.state.phase = 'COMBAT';

        this.addMessage('system', introMsg);
        this.updateEntityDisplay();
        this.updateTaskGuide();
        this.updateBackground();
    }

    async handleSend() {
        const text = this.userInput.value.trim();
        if (!text || this.state.isLoading || this.state.phase !== 'COMBAT') return;

        if (this.state.mana < 5) {
            this.addMessage('system', "⚠️ 마나가 부족합니다! '마나 훈련소'에서 충전하세요.");
            return;
        }

        this.addMessage('user', text);
        this.userInput.value = '';
        this.setLoading(true);
        this.state.mana = Math.max(0, this.state.mana - 5);
        this.updateMana();

        const result = await AIService.getWizFeedback(text, this.state.currentMonster);
        this.setLoading(false);

        this.addMessage('wiz', result.message, result.scaffoldingType);

        if (result.isCorrect) {
            const dmg = result.damage || 20;
            const newHp = Math.max(0, this.state.monsterHp - dmg);
            this.state.monsterHp = newHp;
            this.updateEntityDisplay();

            if (dmg >= 60) {
                this.addMessage('system', "🔥 Critical Hit! 완벽한 해결책입니다!");
            }

            if (newHp <= 0) {
                this.handleStageCleared();
            } else {
                this.handleCounterAttack();
            }
        } else {
            this.handleFailedAttack();
        }
    }

    handleStageCleared() {
        this.state.stageCount++;
        this.state.phase = 'REWARD';

        const clearMsg = this.state.currentMonster.category === 'REAL_LIFE'
            ? `✅ 문제 해결 완료! ${this.state.currentMonster.name} 상황을 극복했습니다.`
            : `🏆 ${this.state.currentMonster.name} 처치! 보상을 선택하세요.`;

        this.addMessage('system', clearMsg);
        this.showRewardScreen();
    }

    handleCounterAttack() {
        const damageAmount = Math.floor(Math.random() * 10) + 5;
        this.state.playerHp = Math.max(0, this.state.playerHp - damageAmount);
        this.updateHp();

        const attackMsg = this.state.currentMonster.category === 'REAL_LIFE'
            ? `💦 상황이 악화되었습니다. 스트레스를 받습니다. (HP -${damageAmount})`
            : `💥 몬스터가 반격합니다! (HP -${damageAmount})`;

        this.addMessage('system', attackMsg);

        if (this.state.playerHp <= 0) {
            this.showGameOver();
        }
    }

    handleFailedAttack() {
        const damageAmount = 15;
        this.state.playerHp = Math.max(0, this.state.playerHp - damageAmount);
        this.updateHp();

        const failMsg = this.state.currentMonster.category === 'REAL_LIFE'
            ? `❌ 해결 실패! 상황이 더 꼬였습니다. (HP -${damageAmount})`
            : `❌ 주문 실패! 몬스터에게 강하게 맞았습니다. (HP -${damageAmount})`;

        this.addMessage('system', failMsg);

        if (this.state.playerHp <= 0) {
            this.showGameOver();
        }
    }

    showRewardScreen() {
        this.rewardScreen.classList.remove('hidden');
        this.artifactChoices.innerHTML = '';

        ARTIFACTS.forEach(art => {
            const btn = document.createElement('button');
            btn.className = 'artifact-card';
            btn.innerHTML = `
                <div class="artifact-icon">${art.icon}</div>
                <div class="artifact-name">${art.name}</div>
                <div class="artifact-desc">${art.desc}</div>
            `;
            btn.addEventListener('click', () => this.selectArtifact(art));
            this.artifactChoices.appendChild(btn);
        });
    }

    selectArtifact(artifact) {
        if (artifact.type === 'CONSUMABLE') {
            if (artifact.id === 'Potion') {
                this.state.playerHp = Math.min(this.state.maxHp, this.state.playerHp + 50);
                this.updateHp();
            }
        } else {
            this.state.inventory.push(artifact);
            this.updateInventory();

            if (artifact.id === 'ManaCrystal') {
                this.state.maxMana += 20;
                this.state.mana += 20;
                this.updateMana();
            }
        }

        this.addMessage('system', `🎁 ${artifact.name} 획득! 다음 스테이지로 이동합니다...`);
        this.rewardScreen.classList.add('hidden');

        setTimeout(() => {
            this.startStage();
        }, 1000);
    }

    showGameOver() {
        this.gameScreen.classList.add('hidden');
        this.gameoverScreen.classList.remove('hidden');
    }

    addMessage(sender, text, scaffoldingType = null) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}`;

        if (sender === 'wiz' && scaffoldingType) {
            const header = document.createElement('div');
            header.className = 'wiz-header';
            header.innerHTML = `
                <span class="wiz-name">🪄 Wiz</span>
                <span class="scaffolding-badge">${scaffoldingType} Support</span>
            `;
            messageDiv.appendChild(header);
        }

        const textNode = document.createElement('div');
        textNode.textContent = text;
        messageDiv.appendChild(textNode);

        this.chatArea.appendChild(messageDiv);
        this.chatArea.scrollTop = this.chatArea.scrollHeight;

        this.state.messages.push({ sender, text, scaffoldingType });
    }

    setLoading(isLoading) {
        this.state.isLoading = isLoading;
        this.sendBtn.disabled = isLoading;
        this.userInput.disabled = isLoading;

        this.sendIcon.textContent = isLoading ? '⟳' : '➤';
        if (isLoading) {
            this.sendIcon.classList.add('loading');
        } else {
            this.sendIcon.classList.remove('loading');
        }
    }

    updateEntityDisplay() {
        if (!this.state.currentMonster) return;

        this.entityIcon.textContent = this.state.currentMonster.icon;
        this.entityIcon.style.fontSize = '80px';

        const hpPercent = (this.state.monsterHp / this.state.currentMonster.maxHp) * 100;
        this.entityHpFill.style.width = `${hpPercent}%`;

        const prefix = this.state.currentMonster.category === 'REAL_LIFE' ? '🏙️ Mission: ' : `Lv.${this.state.stageCount} `;
        this.entityName.textContent = prefix + this.state.currentMonster.name;

        // Show weakness hint if artifact exists
        const hasGrimoire = this.state.inventory.some(i => i.id === 'GrimoirePage');
        if (hasGrimoire) {
            this.weaknessHint.textContent = `👁️ Key Word: ${this.state.currentMonster.weakness[0]}`;
            this.weaknessHint.classList.remove('hidden');
        } else {
            this.weaknessHint.classList.add('hidden');
        }
    }

    updateTaskGuide() {
        if (!this.state.currentMonster) return;

        const isRealLife = this.state.currentMonster.category === 'REAL_LIFE';
        this.taskGuide.className = `task-guide ${isRealLife ? 'real-life' : 'monster'}`;
        this.taskGuide.innerHTML = `
            <div class="task-header">
                <span>${isRealLife ? 'Real Life Mission' : 'Survival Mode'}</span>
                <span>Target: ${this.state.currentMonster.type}</span>
            </div>
            <div class="task-desc">${this.state.currentMonster.desc}</div>
        `;
        this.taskGuide.classList.remove('hidden');
    }

    updateBackground() {
        if (this.state.currentMonster?.category === 'REAL_LIFE') {
            this.stage.classList.add('real-life-bg');
        } else {
            this.stage.classList.remove('real-life-bg');
        }
    }

    updateHp() {
        this.hpDisplay.textContent = `${this.state.playerHp}/${this.state.maxHp}`;
    }

    updateMana() {
        this.manaDisplay.textContent = `${this.state.mana}/${this.state.maxMana}`;
    }

    updateInventory() {
        this.inventory.innerHTML = '';
        this.state.inventory.forEach(item => {
            const div = document.createElement('div');
            div.className = 'inventory-item';
            div.title = item.name;
            div.textContent = item.icon;
            this.inventory.appendChild(div);
        });
    }

    // Mana Quiz
    showManaQuiz() {
        this.manaModal.classList.remove('hidden');
        this.renderQuiz();
    }

    renderQuiz() {
        const quiz = VOCAB_QUIZZES[this.state.quizIndex];
        this.quizWord.textContent = quiz.q;
        this.quizFeedback.textContent = '';

        const options = this.generateQuizOptions(quiz.a);
        this.quizOptions.innerHTML = '';

        options.forEach(opt => {
            const btn = document.createElement('button');
            btn.className = 'quiz-option';
            btn.textContent = opt;
            btn.addEventListener('click', () => this.checkQuizAnswer(opt, quiz.a));
            this.quizOptions.appendChild(btn);
        });
    }

    generateQuizOptions(correctAnswer) {
        const allAnswers = VOCAB_QUIZZES.map(q => q.a);
        const wrongAnswers = allAnswers.filter(a => a !== correctAnswer);
        const shuffled = wrongAnswers.sort(() => Math.random() - 0.5).slice(0, 3);
        return [...shuffled, correctAnswer].sort(() => Math.random() - 0.5);
    }

    checkQuizAnswer(selected, correct) {
        if (selected === correct) {
            this.state.mana = Math.min(this.state.maxMana, this.state.mana + 10);
            this.updateMana();
            this.quizFeedback.textContent = 'Correct! (+10 Mana)';
            this.quizFeedback.className = 'quiz-feedback correct';

            setTimeout(() => {
                this.state.quizIndex = (this.state.quizIndex + 1) % VOCAB_QUIZZES.length;
                this.renderQuiz();
            }, 1000);
        } else {
            this.quizFeedback.textContent = 'Wrong! Try again.';
            this.quizFeedback.className = 'quiz-feedback wrong';
        }
    }
}

// ==========================================
// Initialize
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    const gameState = new GameState();
    const ui = new UIController(gameState);

    console.log('🎮 Wiz Academy - Roguelike Quest loaded!');
    console.log('📝 API 키를 설정하려면 CONFIG.API_KEY에 Gemini API 키를 입력하세요.');
});
