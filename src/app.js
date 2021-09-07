import { scene, clock, renderer, camera } from './components/setup/ThreeSetup';
import './style.css';

import MainMenu from './components/menus/MainMenu';
let mainMenu = new MainMenu(startGame);
import PauseMenu from './components/menus/PauseMenu';
let pauseMenu = new PauseMenu(resumeGame,restartGame);
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
    document.body.removeChild(document.querySelector(".splash"));
    mainMenu.addToPage();

    levels.createLevel1();
    console.log("Level created");
    renderer.render(scene, camera);
    console.log("Level rendered");
});

function startGame(n){

    //levels.clearLevel();
    if(n==1){
        levels.clearLevel();
        levels.createDojo();
    }
    //else
        //levels.createLevel1();

    mainMenu.removeFromPage();
    document.body.appendChild(renderer.domElement);

    // Setup pause
    levels.player.controls.addEventListener("unlock", pauseGame);

    // Setup death
    levels.player.controls.addEventListener("death", deathGame);

    // Setup win
    levels.player.controls.addEventListener("win", winGame);
    
    inPause = false;
    renderer.domElement.requestPointerLock();
    levels.player.controls.shouldLock = true;
    levels.player.hud.show();
    levels.player.hud.caption.show = false;
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
    console.log("Level created");
    renderer.render(scene, camera);
    console.log("Level rendered");
}

function animate () {
    if(exitAnimate == true){
        exitAnimate = false;
        return;
    }

    requestAnimationFrame(animate);
    let delta = clock.getDelta();
    // delta = 0.02;
    if(delta > 0.1) delta = 0.1;

    if(!inPause){
        renderer.render(scene, camera);
        levels.step(delta);
    }
};