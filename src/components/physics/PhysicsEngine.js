import { THREE } from "../setup/ThreeSetup";

const _tempVector = new THREE.Vector3(0,0,0);

class PhysicsEngine {

    constructor(){
        this.gravity = new THREE.Vector3(0,0,0);
        this.bodies = [];
    }

    addBody(body){
        if(body instanceof PhysicsBody){
            this.bodies.push(body);
            body._world = this;
        } 
    }

    removeBody(body){
        let index = this.bodies.indexOf(body);
        if(index != -1){
            this.bodies.splice(index,1);
            body._world = null;
        }
    }

    step(deltaTime){
        for (let body of this.bodies) {
            body.step(deltaTime,this.gravity);
        }
    }

}




class PhysicsBody {

    static LinearConstraints = {
        BOTTOM  : 0b000001,
        TOP     : 0b000010,
        FORWARD : 0b000100,
        BACK    : 0b001000,
        RIGHT   : 0b010000,
        LEFT    : 0b100000,
    }

    constructor(mass, shape, material){
        this._minVectorValue = -1e10, this._maxVectorValue = 1e10;
        this._world = null;

        this.mass = mass || 1;
        this.shape = shape = new PhysicsShape();
        this.material = material || new PhysicsMaterial();

        this.position = new THREE.Vector3(0,0,0);
        this.quaternion = new THREE.Quaternion(0,0,0,1);
        this.euler = new THREE.Euler().setFromQuaternion(this.quaternion);
        this.lastDisplacement = new THREE.Vector3(0,0,0);

        this.linearVelocity = new THREE.Vector3(0,0,0);
        this.angularVelocity = new THREE.Vector3(0,0,0);

        this.linearAcceleration = new THREE.Vector3(0,0,0);
        this.angularAcceleration = new THREE.Vector3(0,0,0);
        this.linea

        this.constraints = 0;

        this.appliedForce = new THREE.Vector3(0,0,0);

        this.gravityInfluence = 1;

        this.mesh = null;
    }

    applyForce(force){
        if(this.mass > 0){
            if(typeof force == "number" && arguments.length == 3) { force = {x:arguments[0], y:arguments[1], z:arguments[2]} }
            this.appliedForce.add(force);
        }
    }

    step(deltaTime, gravity, commonForces){
        if(this.mass <= 0) return; // mass = 0 => static body

        let currentForce = this.linearAcceleration.clone().multiplyScalar(this.mass);                                   // Calculating current force of body before any changes
        currentForce.add(this.appliedForce);                                                                            // Applying all forces added during this step interval
        this.appliedForce.set(0,0,0);                                                          
        if(commonForces) currentForce.add(_tempVector.copy(commonForces));                                              // Applying external/world forces (like explosion forces)
        if(gravity) currentForce.add(_tempVector.copy(gravity).multiplyScalar(this.mass*this.gravityInfluence));        // Applying gravity

        let frictionForce = _tempVector.copy(currentForce).setY(0).multiplyScalar(-1*this.material.frictionFactor);
        currentForce.add(frictionForce);                                                                                // Applying friction

        let currentAcceleration = currentForce.divideScalar(this.mass);                                                 // a = F/m
        this.linearAcceleration.add(currentAcceleration).divideScalar(2);
        this.linearAcceleration.clampScalar(this._minVectorValue,this._maxVectorValue);                                 // Clamping values to not have memory problems
        // Limit by constraints
        this._limitByConstraints(this.linearAcceleration);
        

        let v0t = _tempVector.copy(this.linearVelocity).multiplyScalar(deltaTime);                                      // v0*dt
        let at2_2 = currentAcceleration.multiplyScalar(deltaTime*deltaTime*0.5);                                        // ½(a*dt²)
        let displacement = v0t.add(at2_2);

        // Limit by constraints
        this._limitByConstraints(displacement);

        this.lastDisplacement.copy(displacement);
        this.position.add(displacement);                                                                                // s = v0*dt + ½(a*dt²)

        this.linearVelocity.multiplyScalar(this.material.inertiaFactor);                                                // Dumping the velocity through an inertial factor
        this.linearVelocity.add(_tempVector.copy(this.linearAcceleration).multiplyScalar(deltaTime));                   // v(t+dt) = v(t) + a(t+dt)*dt
        this.linearVelocity.clampScalar(this._minVectorValue,this._maxVectorValue);                                     // Clamping values to not have memory problems
        // Limit by constraints
        this._limitByConstraints(this.linearVelocity);

        if(this.mesh) this.updateMesh(this.mesh);
    }

    updateMesh(mesh){
        mesh.position.copy(this.position);
        // mesh.quaternion.copy(this.quaternion);
    }

    _limitByConstraints(vector){
        if(vector.x < 0 && (this.constraints & PhysicsBody.LinearConstraints.LEFT   ))  vector.x = 0;
        if(vector.x > 0 && (this.constraints & PhysicsBody.LinearConstraints.RIGHT  ))  vector.x = 0;
    
        if(vector.y < 0 && (this.constraints & PhysicsBody.LinearConstraints.BOTTOM ))  vector.y = 0;
        if(vector.y > 0 && (this.constraints & PhysicsBody.LinearConstraints.TOP    ))  vector.y = 0;
        
        if(vector.z < 0 && (this.constraints & PhysicsBody.LinearConstraints.FORWARD))  vector.z = 0;
        if(vector.z > 0 && (this.constraints & PhysicsBody.LinearConstraints.BACK   ))  vector.z = 0;
    }

    reset(){
        this.linearVelocity.set(0,0,0);
        this.linearAcceleration.set(0,0,0);
        this.angularVelocity.set(0,0,0);
        this.angularAcceleration.set(0,0,0);
    }

}

class PhysicsShape {

    constructor(){
        // Eventually if Rigid Bodies Dynamic will be needed

    }

}

class PhysicsMaterial {

    /**
     * 
     * @param {Number} friction - A number between 0 and 1 defining the friction of the material. The higher this number, the higher the opposing friction force
     * @param {Number} inertia - A number between 0 and 1 defining the inertia of the object. The higher this number, the less the body slows down
     * @param {Number} restitution - A number between 0 and 1 defining the restitution
     */
    constructor(friction = 0.5, inertia = 0.5, restitution = 0.5){
        this.frictionFactor = Math.min(Math.abs(Number(friction)),1);
        this.inertiaFactor = Math.min(Math.abs(Number(inertia)),1);
        this.restitutionFactor = Math.min(Math.abs(Number(restitution)),1);;
    }

}

const world = new PhysicsEngine();
world.gravity.y = -10;
export { world, PhysicsEngine, PhysicsBody, PhysicsMaterial, PhysicsShape };