import { THREE, scene, clock, renderer, camera } from './components/setup/ThreeSetup';
import './style.css';

// Physics
// import { PhysicsBody, PhysicsMaterial, PhysicsShapeThree, world } from './components/physics/PhysicsEngine';
import { world } from './components/physics/PhysicsWorld';

import MainMenu from './components/menus/MainMenu';
let mainMenu = new MainMenu(startGame);
import PauseMenu from './components/menus/PauseMenu';
let pauseMenu = new PauseMenu(resumeGame);
let inPause = false;

// Tools
import { DefaultGeneralLoadingManager } from './components/Tools/GeneralLoadingManager';
import LevelCreator from './components/Tools/LevelCreator';
let levels = new LevelCreator();

function startGame(){

    mainMenu.removeFromPage();
    document.body.appendChild(renderer.domElement);

    // Setup pause
    levels.player.controls.addEventListener("unlock", function (e) {
        pauseGame()
    }.bind(this));

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

function endGame(){

}

function animate () {
    requestAnimationFrame(animate);
    
    let delta = clock.getDelta();
    // delta = 0.02;

    if(!inPause){
        renderer.render(scene, camera);
        levels.step(delta);
    }
};;

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