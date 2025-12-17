// ==========================================
// Grammar Quest Game - Main JavaScript
// Designed for Railway deployment
// ==========================================

// ==========================================
// Configuration - API 설정 (Railway 환경변수로 관리 가능)
// ==========================================
const CONFIG = {
    // API 키는 나중에 환경변수로 관리할 예정
    // Railway에서는 process.env 또는 서버사이드에서 주입
    API_KEY: "", // 여기에 Gemini API 키 입력
    API_URL: "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"
};

// ==========================================
// Game Data - 시나리오 데이터베이스
// ==========================================
const SCENARIO_DATA = {
    title: "Class 1: The Hungry Gatekeeper",
    intro: "마법 학교로 가는 문을 거대한 곰이 막고 있습니다! 배가 고파서 난동을 부리는 것 같아요.",

    // Part A: Combat Mode (Syntax Focus - S+V+O)
    combatTasks: [
        {
            id: 'c1',
            type: 'worked',
            situation: "곰이 공격하려 합니다! 방어 주문을 따라하세요.",
            target: "I make a shield.",
            guide: "따라 쓰세요: I make a shield."
        },
        {
            id: 'c2',
            type: 'completion',
            situation: "곰이 돌을 던집니다! 받아내야 해요.",
            target: "I catch the stone.",
            answerKeyword: "catch",
            guide: "빈칸 채우기: I _____ the stone. (잡다)"
        },
        {
            id: 'c3',
            type: 'creation',
            situation: "곰이 달려옵니다! 곰을 멈춰세우세요!",
            target: "I stop the bear.",
            guide: "곰을 멈추는(그만) 문장을 스스로 만드세요!"
        }
    ],

    // Part B: Social Mode (Expression Focus - Wants & Needs)
    socialTasks: [
        {
            id: 's1',
            type: 'scaffolded',
            situation: "곰이 진정되었습니다. 상태를 물어보세요.",
            target: "Are you hungry?",
            hint: "Hint: Are you ...?",
            guide: "배가 고픈지 물어보세요."
        },
        {
            id: 's2',
            type: 'scaffolded',
            situation: "곰이 사과 그림을 가리킵니다. 원하는지 물어보세요.",
            target: "Do you want an apple?",
            hint: "Hint: Do you want ...?",
            guide: "사과를 원하는지 물어보세요."
        },
        {
            id: 's3',
            type: 'real_world',
            situation: "[상점] 곰에게 줄 사과를 사야 합니다.",
            target: "I want an apple, please.",
            guide: "상점 주인에게 사과를 달라고 말하세요. (want 사용)"
        },
        {
            id: 's4',
            type: 'real_world',
            situation: "곰에게 사과를 건네주세요.",
            target: "Eat this apple.",
            guide: "곰에게 사과를 먹으라고 하거나 주세요."
        }
    ]
};

// Mana Station Quiz Data
const QUIZ_DATA = [
    { q: "때리다", a: "hit" },
    { q: "원하다", a: "want" },
    { q: "사과", a: "apple" },
    { q: "방패", a: "shield" },
    { q: "잡다", a: "catch" },
    { q: "멈추다", a: "stop" }
];

// ==========================================
// Game State - 게임 상태 관리
// ==========================================
class GameState {
    constructor() {
        this.gameMode = 'INTRO'; // INTRO, COMBAT, SOCIAL, END
        this.taskIndex = 0;
        this.mana = 50;
        this.monsterHp = 100;
        this.monsterState = 'ANGRY'; // ANGRY, SAD, HAPPY
        this.background = 'FOREST'; // FOREST, SHOP
        this.inventory = [];
        this.messages = [];
        this.isLoading = false;
        this.quizIndex = 0;
    }

    get currentTasks() {
        return this.gameMode === 'COMBAT'
            ? SCENARIO_DATA.combatTasks
            : SCENARIO_DATA.socialTasks;
    }

    get currentTask() {
        return this.currentTasks[this.taskIndex] || {};
    }

    reset() {
        this.gameMode = 'INTRO';
        this.taskIndex = 0;
        this.mana = 50;
        this.monsterHp = 100;
        this.monsterState = 'ANGRY';
        this.background = 'FOREST';
        this.inventory = [];
        this.messages = [];
        this.quizIndex = 0;
    }
}

// ==========================================
// AI Service - Gemini API 통신
// ==========================================
class AIService {
    static async getWizFeedback(userText, mode, currentTask) {
        // API 키가 없으면 로컬 평가 사용
        if (!CONFIG.API_KEY) {
            return this.localEvaluation(userText, currentTask);
        }

        try {
            const systemPrompt = `
                당신은 AI 튜터 '위즈'입니다. 교육학적 스캐폴딩 이론에 기반하여 학생을 지도합니다.
                
                [현재 상황]
                - Mode: ${mode}
                - Task: ${currentTask.situation}
                - Target: ${currentTask.target}

                [스캐폴딩 사이클 진단 및 선택]
                학습자의 입력(Performance)을 분석하여 다음 4가지 중 하나의 비계(Scaffolding)를 선택(Selection)하여 지원(Support)하세요.

                1. **Conceptual (개념적)**: 지식의 부재(예: 어순 S+V+O 모름)가 원인일 때.
                   - 반응 예: "주어(S) 뒤에는 반드시 동사(V)가 와야 해."
                2. **Strategic (전략적)**: 방법의 부재(예: 단어는 아는데 순서가 틀림)가 원인일 때.
                   - 반응 예: "단어의 순서를 바꿔볼까? 누가(Who) 행동(Do) 무엇(What) 순서야."
                3. **Metacognitive (메타인지적)**: 반복적인 실수나 미세한 오류일 때 성찰 유도.
                   - 반응 예: "아까 맞았던 문장이랑 지금 문장이랑 뭐가 다를까?"
                4. **Motivational (동기적)**: 거의 맞았거나, 좌절할 것 같을 때.
                   - 반응 예: "거의 다 왔어! 동사 하나만 고치면 완벽해!"

                [Output JSON Format]
                {
                    "isCorrect": boolean,
                    "scaffoldingType": "Conceptual" | "Strategic" | "Metacognitive" | "Motivational" | "Success",
                    "message": "위즈의 대사 (이모지 포함)",
                    "action": "NONE" | "ATTACK" | "DEFEND" | "BUY_ITEM"
                }
            `;

            const response = await fetch(
                `${CONFIG.API_URL}?key=${CONFIG.API_KEY}`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: `User Input: "${userText}"` }] }],
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
            return this.localEvaluation(userText, currentTask);
        }
    }

    // 로컬 평가 (API 없이 동작)
    static localEvaluation(userText, currentTask) {
        const userLower = userText.toLowerCase().trim();
        const targetLower = currentTask.target?.toLowerCase().trim() || "";

        // 정확히 일치하거나 매우 유사한 경우
        if (userLower === targetLower ||
            userLower.replace(/[.,!?]/g, '') === targetLower.replace(/[.,!?]/g, '')) {
            return {
                isCorrect: true,
                scaffoldingType: "Success",
                message: "✨ 완벽해! 마법이 성공적으로 발동했어!",
                action: currentTask.id?.startsWith('s3') ? "BUY_ITEM" : "ATTACK"
            };
        }

        // 부분적으로 맞는 경우
        const targetWords = targetLower.split(' ');
        const userWords = userLower.split(' ');
        const matchCount = targetWords.filter(w => userWords.includes(w)).length;
        const matchRatio = matchCount / targetWords.length;

        if (matchRatio >= 0.7) {
            return {
                isCorrect: false,
                scaffoldingType: "Motivational",
                message: "🔥 거의 다 왔어! 조금만 더 다듬어보자!",
                action: "NONE"
            };
        } else if (matchRatio >= 0.4) {
            return {
                isCorrect: false,
                scaffoldingType: "Strategic",
                message: "🎯 단어는 좋아! 순서를 확인해봐. 누가(S) → 행동(V) → 무엇(O)",
                action: "NONE"
            };
        } else {
            return {
                isCorrect: false,
                scaffoldingType: "Conceptual",
                message: "📚 기본 공식을 확인해볼까? 주어(I) + 동사 + 목적어 순서야!",
                action: "NONE"
            };
        }
    }
}

// ==========================================
// UI Controller - DOM 조작 및 렌더링
// ==========================================
class UIController {
    constructor(gameState) {
        this.state = gameState;
        this.initElements();
        this.bindEvents();
    }

    initElements() {
        // Main elements
        this.gameModeDisplay = document.getElementById('game-mode');
        this.manaDisplay = document.getElementById('mana-display');
        this.chatArea = document.getElementById('chat-area');
        this.userInput = document.getElementById('user-input');
        this.sendBtn = document.getElementById('send-btn');
        this.sendIcon = document.getElementById('send-icon');

        // Stage elements
        this.stage = document.getElementById('stage');
        this.characterIcon = document.getElementById('character-icon');
        this.character = document.getElementById('character');
        this.hpFill = document.getElementById('hp-fill');
        this.hpBarContainer = document.getElementById('hp-bar-container');

        // Task guide elements
        this.taskGuide = document.getElementById('task-guide');
        this.taskType = document.getElementById('task-type');
        this.taskStep = document.getElementById('task-step');
        this.taskInstruction = document.getElementById('task-instruction');

        // Modal elements
        this.grimoireModal = document.getElementById('grimoire-modal');
        this.manaModal = document.getElementById('mana-modal');
        this.quizWord = document.getElementById('quiz-word');
        this.quizOptions = document.getElementById('quiz-options');
    }

    bindEvents() {
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

        // Close modals on background click
        this.grimoireModal.addEventListener('click', (e) => {
            if (e.target === this.grimoireModal) this.grimoireModal.classList.add('hidden');
        });
        this.manaModal.addEventListener('click', (e) => {
            if (e.target === this.manaModal) this.manaModal.classList.add('hidden');
        });
    }

    async handleSend() {
        const text = this.userInput.value.trim();
        if (!text || this.state.isLoading || this.state.gameMode === 'END') return;

        // Add user message
        this.addMessage('user', text);
        this.userInput.value = '';
        this.setLoading(true);

        // Get AI feedback
        const result = await AIService.getWizFeedback(
            text,
            this.state.gameMode,
            this.state.currentTask
        );

        this.setLoading(false);
        this.addMessage('wiz', result.message, result.scaffoldingType);

        // Handle correct answer
        if (result.isCorrect) {
            this.handleCorrectAnswer(result);
        }
    }

    handleCorrectAnswer(result) {
        // Combat mode: damage monster
        if (this.state.gameMode === 'COMBAT') {
            this.state.monsterHp = Math.max(0, this.state.monsterHp - 34);
            this.updateHpBar();
        }

        // Handle buy item action
        if (result.action === 'BUY_ITEM') {
            this.state.inventory.push('Apple');
            this.addMessage('system', '🍎 사과를 획득했습니다!');
        }

        // Check if more tasks remain
        if (this.state.taskIndex < this.state.currentTasks.length - 1) {
            // Handle location changes in social mode
            if (this.state.gameMode === 'SOCIAL' && this.state.taskIndex === 1) {
                this.state.background = 'SHOP';
                this.updateBackground();
                this.addMessage('system', '🏠 상점으로 이동합니다.');
            }
            if (this.state.gameMode === 'SOCIAL' && this.state.taskIndex === 2) {
                this.state.background = 'FOREST';
                this.updateBackground();
                this.addMessage('system', '🌲 다시 곰에게 돌아갑니다.');
            }

            // Move to next task
            setTimeout(() => {
                this.state.taskIndex++;
                this.updateTaskGuide();
            }, 1000);
        } else {
            // End of current mode
            if (this.state.gameMode === 'COMBAT') {
                this.handleCombatEnd();
            } else if (this.state.gameMode === 'SOCIAL') {
                this.handleGameEnd();
            }
        }
    }

    handleCombatEnd() {
        this.addMessage('system', '✨ 곰이 공격을 멈췄습니다!');
        this.state.monsterHp = 0;
        this.state.monsterState = 'SAD';
        this.state.gameMode = 'SOCIAL';
        this.state.taskIndex = 0;

        this.updateHpBar();
        this.updateCharacter();
        this.updateModeDisplay();
        this.updateTaskGuide();
    }

    handleGameEnd() {
        this.state.monsterState = 'HAPPY';
        this.state.gameMode = 'END';
        this.addMessage('system', '🎉 미션 성공! 문이 열렸습니다!');

        this.updateCharacter();
        this.updateModeDisplay();
        this.taskGuide.classList.add('hidden');
        this.userInput.disabled = true;
        this.userInput.placeholder = '미션 완료! 🎊';
    }

    addMessage(sender, text, scaffoldingType = null) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}`;

        if (sender === 'wiz' && scaffoldingType) {
            const header = document.createElement('div');
            header.className = 'wiz-header';
            header.innerHTML = `
                <span class="wiz-name">🪄 Wiz</span>
                ${this.getScaffoldingBadge(scaffoldingType)}
            `;
            messageDiv.appendChild(header);
        }

        const textNode = document.createElement('span');
        textNode.textContent = text;
        messageDiv.appendChild(textNode);

        this.chatArea.appendChild(messageDiv);
        this.chatArea.scrollTop = this.chatArea.scrollHeight;

        this.state.messages.push({ sender, text, scaffoldingType });
    }

    getScaffoldingBadge(type) {
        const badges = {
            'Conceptual': '<span class="scaffolding-badge badge-conceptual">🧠 Conceptual</span>',
            'Strategic': '<span class="scaffolding-badge badge-strategic">🎯 Strategic</span>',
            'Metacognitive': '<span class="scaffolding-badge badge-metacognitive">💡 Reflection</span>',
            'Motivational': '<span class="scaffolding-badge badge-motivational">😊 Cheer Up</span>',
            'Success': '<span class="scaffolding-badge badge-success">✨ Success</span>'
        };
        return badges[type] || '';
    }

    setLoading(isLoading) {
        this.state.isLoading = isLoading;
        this.sendBtn.disabled = isLoading;
        this.userInput.disabled = isLoading;

        if (isLoading) {
            this.sendBtn.classList.add('loading');
            this.sendIcon.textContent = '⟳';
        } else {
            this.sendBtn.classList.remove('loading');
            this.sendIcon.textContent = '➤';
        }
    }

    updateModeDisplay() {
        this.gameModeDisplay.textContent = this.state.gameMode;
    }

    updateTaskGuide() {
        const task = this.state.currentTask;
        const isCombat = this.state.gameMode === 'COMBAT';

        this.taskGuide.classList.remove('hidden', 'combat', 'social');
        this.taskGuide.classList.add(isCombat ? 'combat' : 'social');

        this.taskType.textContent = isCombat ? '⚔️ Combat Task' : '🗣️ Social Task';
        this.taskStep.textContent = `Step ${this.state.taskIndex + 1}`;
        this.taskInstruction.textContent = task.guide || '';
    }

    updateHpBar() {
        this.hpFill.style.width = `${this.state.monsterHp}%`;

        if (this.state.monsterHp <= 0) {
            this.hpBarContainer.style.display = 'none';
        }
    }

    updateCharacter() {
        const icon = this.characterIcon;
        const char = this.character;

        // Remove all state classes
        icon.classList.remove('calm', 'happy', 'shop');
        char.classList.remove('angry');

        if (this.state.background === 'SHOP') {
            icon.classList.add('shop');
            icon.textContent = '🛒';
        } else {
            icon.textContent = '🐻';

            switch (this.state.monsterState) {
                case 'ANGRY':
                    char.classList.add('angry');
                    break;
                case 'SAD':
                    icon.classList.add('calm');
                    break;
                case 'HAPPY':
                    icon.classList.add('happy');
                    break;
            }
        }
    }

    updateBackground() {
        if (this.state.background === 'SHOP') {
            this.stage.classList.add('shop-bg');
        } else {
            this.stage.classList.remove('shop-bg');
        }
        this.updateCharacter();
    }

    updateMana() {
        this.manaDisplay.textContent = this.state.mana;
    }

    // Mana Quiz
    showManaQuiz() {
        this.manaModal.classList.remove('hidden');
        this.renderQuiz();
    }

    renderQuiz() {
        const quiz = QUIZ_DATA[this.state.quizIndex];
        this.quizWord.textContent = quiz.q;

        // Generate options (correct answer + random wrong answers)
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
        const allAnswers = QUIZ_DATA.map(q => q.a);
        const wrongAnswers = allAnswers.filter(a => a !== correctAnswer);

        // Shuffle and pick 3 wrong answers
        const shuffled = wrongAnswers.sort(() => Math.random() - 0.5).slice(0, 3);

        // Add correct answer and shuffle all
        return [...shuffled, correctAnswer].sort(() => Math.random() - 0.5);
    }

    checkQuizAnswer(selected, correct) {
        if (selected === correct) {
            this.state.mana += 10;
            this.updateMana();

            if (this.state.quizIndex < QUIZ_DATA.length - 1) {
                this.state.quizIndex++;
                this.renderQuiz();
            } else {
                alert('🎉 마나 충전 완료!');
                this.state.quizIndex = 0;
                this.manaModal.classList.add('hidden');
            }
        } else {
            alert('❌ 다시 시도해보세요!');
        }
    }

    // Initialize game
    startGame() {
        this.state.gameMode = 'INTRO';
        this.updateModeDisplay();
        this.addMessage('wiz', `안녕! 위즈야. ${SCENARIO_DATA.intro}`);

        setTimeout(() => {
            this.state.gameMode = 'COMBAT';
            this.updateModeDisplay();
            this.updateTaskGuide();
            this.character.classList.add('angry');
        }, 2000);
    }
}

// ==========================================
// Initialize Game
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    const gameState = new GameState();
    const ui = new UIController(gameState);
    ui.startGame();

    console.log('🎮 Wiz Academy - Grammar Quest loaded!');
    console.log('📝 API 키를 설정하려면 CONFIG.API_KEY에 Gemini API 키를 입력하세요.');
});
