README.md
# Wizard World - Grammar Quest 🪄

An interactive, gamification-based English grammar learning game set in a magical world.

## Features
- **Combat Mode**: Learn S+V+O sentence structure through battle scenarios
- **Social Mode**: Practice wants/needs expressions through NPC interactions
- **AI Scaffolding**: Intelligent feedback system using Google Gemini API
- **Progressive Learning**: Worked examples → Completion tasks → Free creation

## Tech Stack
- Vanilla JavaScript (ES6+ classes)
- HTML5 & CSS3
- Google Gemini API
- Express.js (for deployment)

## Local Development
1. Open `index.html` in a browser
2. (Optional) Add your Gemini API key in `game.js` → `CONFIG.API_KEY`

## Deployment
Deployed on Railway: [Your Railway URL]

## Game Flow
1. **Intro** → Meet the hungry bear blocking the magic school gate
2. **Combat** → Use magic spells (correct grammar) to calm the bear
3. **Social** → Talk to the bear and buy an apple
4. **Victory** → Feed the bear and enter the school!

## Code Architecture
- `GameState` - Manages game state and progression
- `AIService` - Handles Gemini API calls with local fallback
- `UIController` - DOM manipulation and event handling
