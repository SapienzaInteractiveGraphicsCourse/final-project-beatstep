import { Vector3 } from "three";

class PhysicsEngine {

    constructor(){
        
        this._gravity = 10;
        this._friction = 0; // Not properly working
        this._inertia = 0.5;

        this._minAcc = 0.001;
        this._minVel = 0.001;
        
        this._accDamp = new Vector3(this._friction,this._gravity,this._friction);
        this._velDamp = new Vector3(this._inertia,1,this._inertia);

        this._tempVec = new Vector3();

        Object.defineProperties(this,{
            gravity: {
                get: function(){return this._gravity},
                set: function(g){this._gravity = g; this._accDamp.y = g}
            },
            friction: {
                get: function(){return this._friction},
                set: function(f){this._friction = f; this._accDamp.x = f; this._accDamp.z = f}
            },
            inertia: {
                get: function(){return this._inertia},
                set: function(i){this._inertia = Math.min(Math.abs(i),1); this._velDamp.x = i; this._velDamp.z = i}
            },
        })

    }

    update(object, delta){
        let acc = object.acceleration;
        let velocity = object.velocity;
        let con = object.constraints;

        //Dampening velocity and acceleration
        this._tempVec.copy(this._accDamp).multiplyScalar(object.mass).multiplyScalar(delta);
        acc.sub(this._tempVec);

        acc.x = Math.abs(acc.x) > this._minAcc ? acc.x : 0;
        acc.y = Math.abs(acc.y) > this._minAcc ? acc.y : 0;
        acc.z = Math.abs(acc.z) > this._minAcc ? acc.z : 0;

        // Check for constraints
        if(acc.x < 0 && (con & PhysicsProperties.LEFT_CONSTRAINT)) acc.x = 0;
        if(acc.x > 0 && (con & PhysicsProperties.RIGHT_CONSTRAINT)) acc.x = 0;
        
        if(acc.y < 0 && (con & PhysicsProperties.BOTTOM_CONSTRAINT)) acc.y = 0;
        if(acc.y > 0 && (con & PhysicsProperties.TOP_CONSTRAINT)) acc.y = 0;
        
        if(acc.z < 0 && (con & PhysicsProperties.FORWARD_CONSTRAINT)) acc.z = 0;
        if(acc.z > 0 && (con & PhysicsProperties.BACK_CONSTRAINT)) acc.z = 0;
        
        velocity.multiply(this._velDamp);

        velocity.x = Math.abs(velocity.x) > this._minVel ? velocity.x : 0;
        velocity.y = Math.abs(velocity.y) > this._minVel ? velocity.y : 0;
        velocity.z = Math.abs(velocity.z) > this._minVel ? velocity.z : 0;

        velocity.x += acc.x * delta;
        velocity.y += acc.y * delta;
        velocity.z += acc.z * delta;

        

        // Check for constraints
        if(velocity.x < 0 && (con & PhysicsProperties.LEFT_CONSTRAINT)) velocity.x = 0;
        if(velocity.x > 0 && (con & PhysicsProperties.RIGHT_CONSTRAINT)) velocity.x = 0;
        
        if(velocity.y < 0 && (con & PhysicsProperties.BOTTOM_CONSTRAINT)) velocity.y = 0;
        if(velocity.y > 0 && (con & PhysicsProperties.TOP_CONSTRAINT)) velocity.y = 0;
        
        if(velocity.z < 0 && (con & PhysicsProperties.FORWARD_CONSTRAINT)) velocity.z = 0;
        if(velocity.z > 0 && (con & PhysicsProperties.BACK_CONSTRAINT)) velocity.z = 0;

        return velocity.clone().multiplyScalar(delta);
    }

}



class PhysicsProperties {

    static BOTTOM_CONSTRAINT  = 0b000001;
    static TOP_CONSTRAINT     = 0b000010;
    static FORWARD_CONSTRAINT = 0b000100;
    static BACK_CONSTRAINT    = 0b001000;
    static RIGHT_CONSTRAINT   = 0b010000;
    static LEFT_CONSTRAINT    = 0b100000;


    constructor(mass = 10, initialVelocity = [0,0,0], initialAcceleration = [0,0,0]){
        this.mass = mass;
        this.velocity = new Vector3(...initialVelocity);
        this.acceleration = new Vector3(...initialAcceleration);
        this.constraints = 0;

        this.setVelocity = this.velocity.set;
        this.setAcceleration = this.acceleration.set;

        this.addVelocity = this.velocity.add;
        this.addAcceleration = this.acceleration.add;        

        this.multiplyVelocity = this.velocity.multiply;
        this.multiplyAcceleration = this.acceleration.multiply;
    }
}

const DefaultPhysicsEngine = new PhysicsEngine();

export {DefaultPhysicsEngine, PhysicsEngine, PhysicsProperties};