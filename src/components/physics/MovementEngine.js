import { Vector3 } from "three";
Vector3.prototype.addY = function(val){this.y += val; return this;};

class MovementEngine {

    constructor(gravity = -10, initialVelocity = [0,0,0], initialAcceleration = [0,0,0]){
        this.gravity = gravity;

        this.initialVelocity = initialVelocity
        this.initialAcceleration = initialAcceleration

        this.velocity = new Vector3(...initialVelocity);
        this.acceleration = new Vector3(...initialAcceleration);

        this.displacement = new Vector3(0,0,0);

        // Setting up access/mod methods
        this.setVelocity = this.velocity.set;
        this.setAcceleration = this.acceleration.set;

        this.addVelocity = this.velocity.add;
        this.addAcceleration = this.acceleration.add;        

        this.multiplyVelocity = this.velocity.multiply;
        this.multiplyAcceleration = this.acceleration.multiply;

        this._tempVec = new Vector3();
    }

    update(deltaT){
        let deltaV = this._tempVec.copy(this.acceleration).addY(this.gravity).multiplyScalar(deltaT);
        this.acceleration.set(0,0,0);
        this.velocity.add(deltaV).fixZeroPrecision();
        this.displacement.copy(this.velocity).multiplyScalar(deltaT);
    }

    reset(){
        this.velocity.set(...initialVelocity);
        this.acceleration.set(...initialAcceleration);
        this.displacement.set(0,0,0);
    }
}

export { MovementEngine };