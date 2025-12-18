// Game Configuration & Data
export const CONFIG = { API_KEY: "" };
export const LOBBY_BG = 'assets/bg_lobby.png';

export const CLASSES = {
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

export const FAIRIES = {
    FIRE: {
        id: 'FIRE', name: '이그니스', type: '불', img: 'assets/fairy_fire.png', icon: '🔥',
        desc: '뜨거운 열정으로 당신을 응원합니다.',
        greeting: "안녕! 나랑 같이 불태워보자!",
        personality: "난 공격적인 플레이가 좋아! (공격형)",
        scaffold: ["포기하지 마!", "강하게 밀어붙여!", "넌 할 수 있어!"]
    },
    WATER: {
        id: 'WATER', name: '아쿠아', type: '물', img: 'assets/fairy_water.png', icon: '💧',
        desc: '차분한 지혜로 상황을 분석합니다.',
        greeting: "흐르는 물처럼 유연하게... 함께 할래요?",
        personality: "안전하고 신중한게 최고지. (방어형)",
        scaffold: ["차분하게 생각해봐.", "물처럼 유연하게.", "심호흡을 해봐."]
    },
    WIND: {
        id: 'WIND', name: '실피드', type: '바람', img: 'assets/fairy_wind.png', icon: '🍃',
        desc: '자유로운 발상으로 힌트를 줍니다.',
        greeting: "야호! 바람을 타고 어디든 가보자구!",
        personality: "속도가 생명이야! 답도 빠르게! (속도형)",
        scaffold: ["바람을 타고 가자!", "답이 스쳐 지나가?", "자유롭게 상상해!"]
    },
    GROUND: {
        id: 'GROUND', name: '테라', type: '땅', img: 'assets/fairy_ground.png', icon: '🪨',
        desc: '묵묵히 곁을 지켜주는 든든한 파트너.',
        greeting: "단단한 바위처럼, 내가 뒤를 지켜주지.",
        personality: "기반이 튼튼해야 무너지지 않아. (안정형)",
        scaffold: ["기반을 다져야 해.", "단단한 마음가짐.", "묵직한 한 방."]
    }
};

export const THEMES = [
    {
        id: 'FOREST', name: '신비한 숲',
        desc: '초급 모험가를 위한 숲입니다. 멧돼지와 엔트가 출현합니다.',
        bg: 'assets/bg_forest.png',
        music: 'https://cdn.pixabay.com/audio/2022/05/27/audio_1808fbf07a.mp3',
        mobImg: 'assets/1.png', bossImg: 'assets/3.png',
        monsters: [
            {
                name: "꼬마 버섯",
                img: 'assets/1.png', // Explicit img
                dialogues: [
                    {
                        guide: "아기 멧돼지가 놀고 싶어해요.<br>'play' (놀다)를 써서<br>같이 놀자고 말해보세요.",
                        keywords: ["play"],
                        syntax: "Let's (Aux) + play (V)",
                        perfect: ["Let's play", "Let us play", "Lets play", "Let's play together", "Play with me"],
                        feedback: "Let's(하자) + play(놀다).",
                        hint: "정답 형식: L____ play"
                    },
                    {
                        guide: "배가 고픈가 봐요.<br>'eat' (먹다)과 'apple' (사과)을<br>주세요.",
                        keywords: ["eat", "apple"],
                        syntax: "Eat (V) + this apple (O)",
                        perfect: ["Eat this apple", "Eat apple", "Eat the apple", "Eat an apple", "Have this apple", "Have an apple"],
                        feedback: "Eat(먹어라) + apple(사과를).",
                        hint: "정답 형식: E__ this a____"
                    }
                ]
            },
            {
                name: "아기 나무", // New Monster
                img: 'assets/2.png',
                dialogues: [
                    {
                        guide: "버섯이 춤추고 있어요!<br>'dance' (춤추다)라고 말해서<br>응원해주세요.",
                        keywords: ["dance"],
                        syntax: "You (S) + dance (V) + well (Adv)",
                        perfect: ["You dance well", "Dance mushroom", "You dance", "Dance well", "You're dancing", "Keep dancing"],
                        feedback: "You(너는) + dance(춤춘다).",
                        hint: "정답 형식: You d____ well"
                    },
                    {
                        guide: "버섯이 쑥쑥 자라네요.<br>'grow' (자라다)를<br>써보세요.",
                        keywords: ["grow"],
                        syntax: "Grow (V) + tall (Adj)",
                        perfect: ["Grow tall", "Grow fast", "Grow big", "Grow up", "Keep growing", "Grow taller"],
                        feedback: "Grow(자라라) + tall(키가 크게).",
                        hint: "정답 형식: G___ tall"
                    }
                ]
            }
        ],
        boss: {
            name: "숲 올빼미", hp: 300,
            img: 'assets/3.png',
            phases: [
                {
                    hp: 200, msg: "엔트가 인자하게 웃습니다.",
                    dialogues: [
                        {
                            guide: "엔트에게 숲이 아름답다고 말해주세요.<br>'forest' (숲)와 'beautiful' (아름다운)을<br>사용하세요.",
                            keywords: ["forest", "beautiful"],
                            syntax: "The forest (S) + is (V) + beautiful (C)",
                            perfect: ["The forest is beautiful", "Forest is beautiful", "This forest is beautiful", "The forest looks beautiful", "It's beautiful"],
                            feedback: "The forest(숲은) + is(이다) + beautiful(아름다운).",
                            hint: "정답 형식: The f_____ is b________"
                        }
                    ]
                },
                {
                    hp: 100, msg: "엔트가 가지를 흔듭니다.",
                    dialogues: [
                        {
                            guide: "엔트와 친구가 되고 싶나요?<br>'be' (되다)와 'friends' (친구)를<br>쓰세요.",
                            keywords: ["friends"],
                            syntax: "Let's (Aux) + be (V) + friends (C)",
                            perfect: ["Let's be friends", "We are friends", "Lets be friends", "Be my friend", "We're friends", "Become friends"],
                            feedback: "Let's be(되자) + friends(친구가).",
                            hint: "정답 형식: Let's be f______"
                        }
                    ]
                },
                {
                    hp: 0, msg: "엔트가 꽃을 피웁니다.",
                    dialogues: [
                        {
                            guide: "이제 작별 인사를 해요.<br>'goodbye' (안녕)를<br>말해보세요!",
                            keywords: ["goodbye", "bye"],
                            syntax: "Goodbye (Interj) + friend (N)",
                            perfect: ["Goodbye friend", "Bye bye", "Goodbye", "Bye friend", "See you", "Farewell"],
                            feedback: "Goodbye(안녕) + friend(친구야).",
                            hint: "정답 형식: G______ friend"
                        }
                    ]
                }
            ]
        }
    },
    {
        id: 'DESERT', name: '작열하는 사막',
        desc: '중급 모험가를 위한 사막입니다. 전갈과 샌드웜을 조심하세요.',
        bg: 'assets/bg_desert.png',
        music: 'https://cdn.pixabay.com/audio/2021/11/01/audio_00fa556557.mp3',
        mobImg: 'assets/7.png', bossImg: 'assets/9.png',
        monsters: [
            {
                name: "사막 돌맹이",
                img: 'assets/7.png',
                dialogues: [{
                    guide: "전갈이 모래 속에 숨었습니다.<br>'freeze' (얼리다) 단어를 써서<br>모래를 얼려보세요!",
                    keywords: ["freeze", "sand"],
                    syntax: "I (S) + freeze (V) + sand (O)",
                    perfect: ["I freeze sand", "Freeze sand", "I freeze the sand", "Freeze the sand", "I'll freeze sand", "Let me freeze sand"],
                    feedback: "I(나는) + freeze(얼린다) + sand(모래를).",
                    hint: "정답 형식: I f_____ sand"
                }]
            },
            {
                name: "꼬마 도마뱀", // Renamed for Cute Cactus feel (d2.png)
                img: 'assets/8.png', // New Asset
                dialogues: [{
                    guide: "독침이 위험합니다!<br>'remove' (제거하다)와 'poison' (독)을<br>사용해 해독하세요.",
                    keywords: ["remove", "poison"],
                    syntax: "Remove (V) + poison (O)",
                    perfect: ["Remove poison", "Remove the poison", "I remove poison", "Get rid of poison", "Take out poison", "Clear poison"],
                    feedback: "Remove(제거해) + poison(독을).",
                    hint: "정답 형식: R_____ poison"
                }]
            },

        ],
        boss: {
            name: "사막 여우", hp: 400,
            img: 'assets/9.png',
            phases: [
                {
                    hp: 300, msg: "샌드웜이 모래폭풍을 일으킵니다!",
                    dialogues: [{
                        guide: "폭풍이 몰아칩니다!<br>'stop' (멈추다)과 'storm' (폭풍)으로<br>막으세요!",
                        keywords: ["stop", "storm"],
                        syntax: "Stop (V) + the storm (O)",
                        perfect: ["Stop the storm", "Stop storm", "I stop the storm", "Stop this storm", "I'll stop storm", "Halt the storm"],
                        feedback: "Stop(멈춰라) + the storm(그 폭풍을).",
                        hint: "정답 형식: S___ the storm"
                    }]
                },
                {
                    hp: 150, msg: "샌드웜이 삼키려 합니다!",
                    dialogues: [{
                        guide: "입을 벌리고 달려듭니다!<br>'block' (막다)과 'mouth' (입)으로<br>방어하세요!",
                        keywords: ["block", "mouth"],
                        syntax: "I (S) + block (V) + mouth (O)",
                        perfect: ["I block mouth", "Block the mouth", "I block the mouth", "Block its mouth", "I'll block mouth", "Stop the mouth"],
                        feedback: "I(나는) + block(막는다) + mouth(입을).",
                        hint: "정답 형식: I b____ mouth"
                    }]
                },
                {
                    hp: 0, msg: "샌드웜이 힘을 잃습니다.",
                    dialogues: [{
                        guide: "마지막 일격입니다!<br>'finish' (끝내다)를<br>외쳐요!",
                        keywords: ["finish"],
                        syntax: "I (S) + finish (V) + it (O)",
                        perfect: ["I finish it", "Finish it", "I'll finish it", "Finish this", "End it", "Complete it"],
                        feedback: "Finish(끝내라) + it(그것을).",
                        hint: "정답 형식: F_____ it"
                    }]
                }
            ]
        }
    },
    {
        id: 'CASTLE', name: '마왕성',
        desc: '최종 관문입니다. 마왕을 물리치세요!',
        bg: 'assets/bg_castle.png',
        music: 'https://cdn.pixabay.com/audio/2022/03/09/audio_822f354972.mp3',
        mobImg: 'assets/4.png', bossImg: 'assets/6.png',
        monsters: [
            {
                name: "꼬마 박쥐", // Renamed for Cute Imp (m1.png)
                img: 'assets/4.png',
                dialogues: [{
                    guide: "문을 지키고 있습니다.<br>'open' (열다)과 'gate' (문)를<br>사용하세요.",
                    keywords: ["open", "gate"],
                    syntax: "Open (V) + the gate (O)",
                    perfect: ["Open the gate", "Open gate", "I open the gate", "Open this gate", "I'll open gate", "Unlock the gate"],
                    feedback: "Open(열어라) + the gate(문을).",
                    hint: "정답 형식: O___ the gate"
                }]
            },
            {
                name: "장난 유령", // Renamed for Cute Armor (m2.png)
                img: 'assets/5.png',
                dialogues: [{
                    guide: "갑옷이 혼자 움직입니다!<br>'fight' (싸우다)를<br>외쳐보세요.",
                    keywords: ["fight"],
                    syntax: "I (S) + will (Aux) + fight (V)",
                    perfect: ["I will fight", "I fight you", "I'll fight", "I will fight you", "Let's fight", "I'm fighting"],
                    feedback: "I will(나는 할 것이다) + fight(싸우다).",
                    hint: "정답 형식: I w___ fight"
                }]
            },

        ],
        boss: {
            name: "뚱띵 악마", hp: 500,
            img: 'assets/6.png',
            phases: [
                {
                    hp: 350, msg: "마왕이 어둠의 힘을 모읍니다.",
                    dialogues: [{
                        guide: "어둠을 걷어내야 해요!<br>'light' (빛)여<br>비추어라!",
                        keywords: ["light"],
                        syntax: "Let (V) + light (S) + shine (V)",
                        perfect: ["Let light shine", "Light shine", "Let the light shine", "Light shines", "Shine light", "Bring light"],
                        feedback: "Let light(빛이 하게 해라) + shine(비추도록).",
                        hint: "정답 형식: L__ light shine"
                    }]
                },
                {
                    hp: 150, msg: "마왕이 최후의 발악을 합니다.",
                    dialogues: [{
                        guide: "결계가 무너집니다.<br>'strike' (공격하다)로<br>끝내세요!",
                        keywords: ["strike"],
                        syntax: "Strike (V) + now (Adv)",
                        perfect: ["Strike now", "I strike now", "I'll strike now", "Strike it now", "Hit now", "Attack now"],
                        feedback: "Strike(공격해) + now(지금).",
                        hint: "정답 형식: S_____ now"
                    }]
                },
                {
                    hp: 0, msg: "마왕이 쓰러집니다.",
                    dialogues: [{
                        guide: "세상을 구했습니다!<br>'victory' (승리)를<br>외치세요!",
                        keywords: ["victory"],
                        syntax: "This (S) + is (V) + victory (C)",
                        perfect: ["This is victory", "Victory", "We won", "This is our victory", "Victory is ours", "We achieved victory"],
                        feedback: "This is(이것은 ~이다) + victory(승리).",
                        hint: "정답 형식: This is v______"
                    }]
                }
            ]
        }
    }
];

