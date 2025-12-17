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
        mobImg: 'assets/boar.png', bossImg: 'assets/treant.png',
        monsters: [
            { name: "어린 멧돼지", target: "I calm down", desc: "멧돼지가 흥분해 날뛰고 있어요! '나는 진정한다(I calm down)'라고 말해보세요!" },
            { name: "성난 멧돼지", target: "I heal you", desc: "멧돼지가 다쳤나 봐요. '내가 널 치료해줄게(I heal you)'라고 말로 치유해주세요." },
            { name: "광란의 멧돼지", target: "Go back home", desc: "너무 위험해 보입니다. '집으로 돌아가(Go back home)'라고 외쳐서 쫓아보내세요!" },
            { name: "숲의 파괴자", target: "Nature is friend", desc: "자연을 파괴하려 합니다! '자연은 친구야(Nature is friend)'라고 알려주세요." },
            { name: "오염된 정령", target: "Be pure again", desc: "정령이 오염되었습니다. '다시 순수해져라(Be pure again)'라고 정화해주세요." }
        ],
        boss: {
            name: "숲의 주인 엔트", hp: 300,
            phases: [
                { hp: 200, msg: "엔트가 당신을 경계합니다.", target: "I respect nature", desc: "엔트가 인간을 불신합니다. '난 자연을 존중해(I respect nature)'라고 진심을 전하세요!" },
                { hp: 100, msg: "엔트가 숲의 지혜를 묻습니다.", target: "I listen to tree", desc: "엔트와 소통해야 합니다. '나는 나무의 소리를 들어(I listen to tree)'라고 대답하세요." },
                { hp: 0, msg: "엔트가 평온을 되찾습니다.", target: "Protect the forest", desc: "마지막으로 맹세하세요. '숲을 지켜라(Protect the forest)'라고 외치세요!" }
            ]
        }
    },
    {
        id: 'DESERT', name: '작열하는 사막',
        desc: '중급 모험가를 위한 사막입니다. 전갈과 샌드웜을 조심하세요.',
        bg: 'assets/bg_desert.png',
        music: 'https://cdn.pixabay.com/audio/2021/11/01/audio_00fa556557.mp3',
        mobImg: 'assets/scorpion.png', bossImg: 'assets/sandworm.png',
        monsters: [
            { name: "모래 전갈", target: "I freeze sand", desc: "전갈이 모래 속에 숨었습니다. '나는 모래를 얼린다(I freeze sand)'라고 마법을 거세요!" },
            { name: "맹독 전갈", target: "Remove poison", desc: "독침이 위험합니다! '독을 제거해(Remove poison)'라고 외쳐 해독하세요." },
            { name: "강철 전갈", target: "Break armor", desc: "껍질이 너무 단단해요. '갑옷을 부숴(Break armor)'라고 명령하세요!" },
            { name: "사막 도적", target: "Stop stealing", desc: "도적이 물건을 훔치려 합니다. '훔치지 마(Stop stealing)'라고 경고하세요." },
            { name: "미라 병사", target: "Rest in peace", desc: "미라가 깨어났습니다. '편히 잠드소서(Rest in peace)'라고 안식을 주세요." }
        ],
        boss: {
            name: "거대 샌드웜", hp: 400,
            phases: [
                { hp: 300, msg: "샌드웜이 모래폭풍을 일으킵니다!", target: "Stop the storm", desc: "폭풍이 몰아칩니다! '폭풍을 멈춰(Stop the storm)'라고 외쳐 막으세요!" },
                { hp: 150, msg: "샌드웜이 삼키려 합니다!", target: "I block mouth", desc: "입을 벌리고 달려듭니다! '나는 입을 막는다(I block mouth)'라고 방어하세요!" },
                { hp: 0, msg: "샌드웜이 사막 깊이 숨습니다.", target: "Rain fall down", desc: "마무리는 비를 뿌리는 것입니다. '비야 내려라(Rain fall down)'라고 외치세요!" }
            ]
        }
    },
    {
        id: 'CASTLE', name: '마왕성',
        desc: '최상급 난이도. 마왕과의 최종 결전이 기다립니다.',
        bg: 'assets/bg_castle.png',
        music: 'https://cdn.pixabay.com/audio/2022/03/15/audio_201de9832c.mp3',
        mobImg: 'assets/demon_soldier.png', bossImg: 'assets/demon_king.png',
        monsters: [
            { name: "마계 병사", target: "Drop weapon", desc: "병사가 무기를 들고 덤빕니다. '무기를 버려(Drop weapon)'라고 명령하세요!" },
            { name: "마계 정예병", target: "Kneel down", desc: "강력한 정예병입니다. 위엄 있게 '무릎 꿇어(Kneel down)'라고 외치세요." },
            { name: "암흑 기사", target: "Light shine", desc: "어둠에 싸여 공격이 통하지 않습니다. '빛아 비춰라(Light shine)'라고 외치세요!" },
            { name: "서큐버스", target: "Go away", desc: "현혹되지 마세요. 단호하게 '저리 가(Go away)'라고 거절하세요." },
            { name: "지옥견", target: "Sit down dog", desc: "사나운 개가 짖습니다. '앉아, 개야(Sit down dog)'라고 명령해서 진정시키세요." }
        ],
        boss: {
            name: "대마왕", hp: 1000,
            phases: [
                { hp: 700, msg: "마왕이 세상을 조롱합니다.", target: "We have hope", desc: "마왕이 희망이 없다고 비웃습니다. '우리에겐 희망이 있다(We have hope)'라고 반박하세요!" },
                { hp: 300, msg: "마왕이 파괴 마법을 영창합니다!", target: "Reflect magic", desc: "강력한 마법을 반사해야 합니다. '마법 반사(Reflect magic)'를 외치세요!" },
                { hp: 0, msg: "마왕이 소멸합니다. 세상에 평화가...", target: "Peace for world", desc: "마지막 일격입니다! '세상을 위해 평화를(Peace for world)'이라고 외치며 끝내세요!" }
            ]
        }
    }
];
