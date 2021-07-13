import { THREE } from "../setup/ThreeSetup";

class PhysicsEngine {

    constructor(){

    }


}


class PhysicsBody {

    static Constraint = {
        BOTTOM  : 0b000001,
        TOP     : 0b000010,
        FORWARD : 0b000100,
        BACK    : 0b001000,
        RIGHT   : 0b010000,
        LEFT    : 0b100000,
    }

    constructor(shape, material){

        this.shape = shape = new PhysicsShape();
        this.material = material || new PhysicsMaterial();

        this.position = new THREE.Vector3(0,0,0);
        this.quaternion = new THREE.Quaternion(0,0,0,1);
        this.euler = new THREE.Euler().setFromQuaternion(this.quaternion);

        this.linearVelocity = new THREE.Vector3(0,0,0);
        this.angularVelocity = new THREE.Vector3(0,0,0);

        this.linearAcceleration = new THREE.Vector3(0,0,0);
        this.angularAcceleration = new THREE.Vector3(0,0,0);

        this.contraint = 0;
    }


}

class PhysicsShape {

    constructor(){
        // Eventually if Rigid Bodies Dynamic will be needed

    }

}

class PhysicsMaterial {

    constructor(friction = 0, restitution = 0){
        this.friction = friction;
        this.restitution = restitution;
    }

}