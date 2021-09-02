import { THREE, scene, clock, renderer, camera } from './components/setup/ThreeSetup';
import './style.css';

// Physics
// import { PhysicsBody, PhysicsMaterial, PhysicsShapeThree, world } from './components/physics/PhysicsEngine';
import { world } from './components/physics/PhysicsWorld';

import MainMenu from './components/menus/MainMenu';
let mainMenu = new MainMenu(startGame);

// Tools
import { DefaultGeneralLoadingManager } from './components/Tools/GeneralLoadingManager';
import LevelCreator from './components/Tools/LevelCreator';
let levels = new LevelCreator();

function startGame(){
    levels.createLevel1();

    mainMenu.removeFromPage();
    document.body.appendChild(renderer.domElement);
    
    renderer.domElement.requestPointerLock();
    levels.player.hud.show();
    animate();
}

function animate () {
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
    
    let delta = clock.getDelta();
    // delta = 0.02;
    levels.step(delta);
};;

DefaultGeneralLoadingManager.addOnLoad(() => {
    console.log("Game loaded, starting rendering loop");
    document.body.removeChild(document.querySelector(".splash"));
    mainMenu.addToPage();
    // init();
    // document.body.removeChild(document.querySelector(".splash"));
    // document.body.appendChild(renderer.domElement);
    // levels.player.hud.show();
    // animate();
});