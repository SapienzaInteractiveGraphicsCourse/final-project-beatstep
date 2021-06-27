import * as THREE from 'three';
import { FirstPersonControls } from 'three/examples/jsm/controls/FirstPersonControls';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls';


class FPSCamera extends THREE.PerspectiveCamera {

    constructor(domElement,width,height,position = [0,0,0],lookAt = [0,0,0]){
        super(45, width / height, 1, 1000);
        this.position.x = position[0];
        this.position.y = position[1];
        this.position.z = position[2];
        this.lookAt(new THREE.Vector3(...lookAt));

        this.controls = new FirstPersonControls(this,domElement);
        this.controls.lookSpeed = 0.4;
        this.controls.movementSpeed = 20;
        this.controls.noFly = true;
        this.controls.lookVertical = true;
        this.controls.constrainVertical = true;
        this.controls.verticalMin = 1.0;
        this.controls.verticalMax = 2.0;
        this.controls.lon = -150;
        this.controls.lat = 120;

        this.pointerLock = new PointerLockControls(this,domElement);
        this.pointerLock.lock();

    }
    
}

export default FPSCamera;