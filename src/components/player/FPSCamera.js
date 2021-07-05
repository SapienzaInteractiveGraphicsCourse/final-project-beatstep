import * as THREE from 'three';
import { PointerLockControlsPlus } from '../Tools/PointerLockControlsPlus';
import { DefaultPhysicsEngine, PhysicsProperties } from '../physics/PhysicsEngine';


class FPSCamera extends THREE.PerspectiveCamera {

    constructor(width,height){
        // Create Perspective Camera and set position and look at
        super(45, width / height, 0.1, 1000);
    }

    
    
    
}

export default FPSCamera;
