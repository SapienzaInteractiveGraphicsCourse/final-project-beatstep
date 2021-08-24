import { world } from '../PhysicsEngine';
import { scene, THREE } from '../../setup/ThreeSetup';

class DebugDrawerThree {

    constructor(){
        this.visualRays = [];
        this.distance = 1;
    }

    drawRays(){
        
        for(let r of this.visualRays){
            scene.remove(r);
        }
        this.visualRays = [];

        for(let body of world.bodies){
            for (let face of body.shape.faces) {
                let fWorld = face.clone(body.matrixWorld);
                let l = this.visualRays.push(new THREE.ArrowHelper(fWorld.normal, fWorld.midpoint, this.distance, 0x0000ff));
                scene.add( this.visualRays[l-1] );
            }
        }

    }

}

export { DebugDrawerThree }