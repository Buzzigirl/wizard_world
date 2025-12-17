import { GameState } from './game.js';
import { UIManager } from './ui.js';

window.onload = () => {
    const game = new GameState();
    const ui = new UIManager(game);
    game.setUI(ui);

    // Debug access
    window.game = game;
    window.ui = ui;
    console.log("Roguelike Grammar Quest V11 Loaded (Modularized)");
};
