import { THREE, scene, clock, renderer, camera } from './components/setup/ThreeSetup';
import './style.css';

// Physics
// import { PhysicsBody, PhysicsMaterial, PhysicsShapeThree, world } from './components/physics/PhysicsEngine';
import { world } from './components/physics/PhysicsWorld';

// Tools
import { DefaultGeneralLoadingManager } from './components/Tools/GeneralLoadingManager';
import LevelCreator from './components/Tools/LevelCreator';
let levels = new LevelCreator();

function init(){
    levels.createTestLevel();
    

    animate = function () {
        renderer.render(scene, camera);
        requestAnimationFrame(animate);
        
        let delta = clock.getDelta();
        // delta = 0.02;
        levels.step(delta);
    };

}

let animate;

DefaultGeneralLoadingManager.addOnLoad(() => {
    console.log("Game loaded, starting rendering loop");
    init();
    document.body.removeChild(document.querySelector(".splash"));
    document.body.appendChild(renderer.domElement);
    levels.player.hud.show();
    animate();
});