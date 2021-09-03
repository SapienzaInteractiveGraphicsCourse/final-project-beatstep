import { THREE, scene, clock, renderer, camera } from './components/setup/ThreeSetup';
import './style.css';

import MainMenu from './components/menus/MainMenu';
let mainMenu = new MainMenu(startGame);
import PauseMenu from './components/menus/PauseMenu';
let pauseMenu = new PauseMenu(resumeGame);
import DeathMenu from './components/menus/DeathMenu';
let deathMenu = new DeathMenu(restartGame);
import WinMenu from './components/menus/WinMenu';
let winMenu = new WinMenu(restartGame);

// Tools
import { DefaultGeneralLoadingManager } from './components/Tools/GeneralLoadingManager';
import LevelCreator from './components/Tools/LevelCreator';
let levels = new LevelCreator();

let exitAnimate = false;
let inPause = false;

DefaultGeneralLoadingManager.addOnLoad(() => {
    
    levels.createLevel1();
    
    console.log("Game loaded, starting rendering loop");
    document.body.removeChild(document.querySelector(".splash"));
    mainMenu.addToPage();

    // init();
    // document.body.removeChild(document.querySelector(".splash"));
    // document.body.appendChild(renderer.domElement);
    // levels.player.hud.show();
    // animate();
});

function startGame(){

    mainMenu.removeFromPage();
    document.body.appendChild(renderer.domElement);

    // Setup pause
    levels.player.controls.addEventListener("unlock", pauseGame);

    // Setup death
    levels.player.controls.addEventListener("death", deathGame);

    // Setup win
    levels.player.controls.addEventListener("win", winGame);

    renderer.domElement.requestPointerLock();
    levels.player.hud.show();
    animate();
}

function pauseGame(){
    if(inPause) return;
    pauseMenu.addToPage();
    inPause = true;
    levels.player.controls.shouldLock = false;
    levels.player.hud.hide();
}

function resumeGame(){
    pauseMenu.removeFromPage();
    inPause = false;
    levels.player.controls.shouldLock = true;
    renderer.domElement.requestPointerLock();
    levels.player.hud.show();
}

function deathGame(){
    levels.player.controls.removeEventListener("unlock", pauseGame);
    levels.player.controls.removeEventListener("death", deathGame);
    levels.player.controls.removeEventListener("win", winGame);
    levels.player.controls.shouldLock = false;
    levels.player.hud.hide();
    document.exitPointerLock();
    deathMenu.addToPage();
    setTimeout(()=>{
        exitAnimate = true;
    },4000);
}

function winGame(){
    levels.player.controls.removeEventListener("unlock", pauseGame);
    levels.player.controls.removeEventListener("death", deathGame);
    levels.player.controls.removeEventListener("win", winGame);
    levels.player.controls.shouldLock = false;
    levels.player.hud.hide();
    document.exitPointerLock();
    winMenu.addToPage()
}

function restartGame(currentMenu){
    currentMenu.removeFromPage();
    mainMenu.addToPage();
    levels.clearLevel();
    levels.createLevel1();
}

function animate () {
    if(exitAnimate == true){
        exitAnimate = false;
        return;
    }

    requestAnimationFrame(animate);
    let delta = clock.getDelta();
    // delta = 0.02;

    if(!inPause){
        renderer.render(scene, camera);
        levels.step(delta);
    }
};