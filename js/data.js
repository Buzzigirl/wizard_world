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

export const THEMES = [
    {
        id: 'FOREST', name: '신비한 숲',
        desc: '초급 모험가를 위한 숲입니다. 멧돼지와 엔트가 출현합니다.',
        bg: 'assets/bg_forest.png',
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
        bg: 'assets/bg_desert.png',
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
        bg: 'assets/bg_castle.png',
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
