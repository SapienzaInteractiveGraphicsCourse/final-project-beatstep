import { Matrix4, Vector3, Quaternion, BoxGeometry } from "three";
import { PhysicsShape, Face } from "./PhysicsShape";
import { PhysicsShapeThree } from "./PhysicsShapeThree";
import { PhysicsMaterial } from "./PhysicsMaterial";

const _tempVector = new Vector3(0,0,0);

class PhysicsBody {

    static LinearConstraints = {
        BOTTOM  : 0b000001,
        TOP     : 0b000010,
        FORWARD : 0b000100,
        BACK    : 0b001000,
        RIGHT   : 0b010000,
        LEFT    : 0b100000,
    }

    constructor(mass = 1, shape, material, onCollisionWith){
        this._minVectorValue = -1e10, this._maxVectorValue = 1e10;
        this._world = null;

        this.mass = mass;
        this.shape = shape || new PhysicsShapeThree(new BoxGeometry(1,1,1)); // TODO: Change with custom box shape
        this.material = material || new PhysicsMaterial();

        this.position = new Vector3(0,0,0);
        this.quaternion = new Quaternion(0,0,0,1);
        this.lastDisplacement = new Vector3(0,0,0);
        this._matrixWorld = new Matrix4();
        Object.defineProperty(this,"matrixWorld",{
            get() {
                this._matrixWorld.makeRotationFromQuaternion(this.quaternion);
                this._matrixWorld.setPosition(this.position);
                return this._matrixWorld;
            }
        });

        this.linearVelocity = new Vector3(0,0,0);
        this.angularVelocity = new Vector3(0,0,0);

        this.linearAcceleration = new Vector3(0,0,0);
        this.angularAcceleration = new Vector3(0,0,0);

        this.constraints = 0;

        this.appliedForce = new Vector3(0,0,0);

        this.gravityInfluence = 1;
        
        this.collisionDistance = 0.1;
        this.firstHitOnly = true;
        this.collisionLoopTag = null; // Used to check if collision detection has been already performed during this physics step
        //this.onPersonalCollision = onPersonalCollision || function(otherBody, payload, minIntersection, intersections){};
        this.onCollisionWith = onCollisionWith || function(body, distance, payload, minIntersection, intersections){};
        this.collisionPayload = {}; // A payload to pass along when colliding with another body

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

        let frictionForce = _tempVector.copy(currentForce).setY(0).multiplyScalar(-1*this.material.frictionFactor*deltaTime);
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

        if(this.mesh) this.updateMesh(this.mesh, true, true);
    }

    updateMesh(mesh, pos = true, rot = false){
        if(pos) mesh.position.copy(this.position);
        if(rot) mesh.quaternion.copy(this.quaternion);
    }
    

    roughDistance(body){
        let bounding1 = this.shape.preferBoundingBox ? 
                        this.shape.boundingBox.clone().applyMatrix4(this.matrixWorld) : 
                        this.shape.boundingSphere.clone().applyMatrix4(this.matrixWorld);
        let bounding2 = body.shape.preferBoundingBox ? 
                        body.shape.boundingBox.clone().applyMatrix4(body.matrixWorld) : 
                        body.shape.boundingSphere.clone().applyMatrix4(body.matrixWorld);
        let distance = 0;
        if( (bounding1.type == "box" && bounding2.type == "box") ){
            distance = PhysicsShape.boxToBoxDistance(bounding1,bounding2);
        }
        else if( (bounding1.type == "sphere" && bounding2.type == "sphere") ){
            distance = PhysicsShape.sphereToSphereDistance(bounding1,bounding2);
        }
        else if( (bounding1.type == "box" && bounding2.type == "sphere") ){
            distance = PhysicsShape.boxToSphereDistance(bounding1,bounding2);
        }
        else if( (bounding1.type == "sphere" && bounding2.type == "box") ){
            distance = PhysicsShape.boxToSphereDistance(bounding2,bounding1);
        }
        return distance;
    }

    syncDetectCollision(body, distance, firstHitOnly = false){
        // If the bounding shapes of the 2 bodies are further apart, no precise collision gets computed
        if(this.roughDistance(body) > distance){
            return [false, null, null];
        }

        let actualCollision = false;
        let intersections;
        let minIntersection ;
        let face = new Face();
        for (let f of this.shape.faces) {
            face.set(f,this.matrixWorld);
            
            intersections = body.shape.raycastFromFace(face, distance, body.matrixWorld, firstHitOnly); // Check for intersections
            if (intersections.length == 0) continue;

            for (let intersection of intersections) {
                actualCollision = true;
                // Storing the closest intersection
                if( !minIntersection || Math.abs(intersection.distance) < Math.abs(minIntersection.distance)) minIntersection = intersection;
            }
            
        }
        return {actualCollision, intersections, minIntersection};
    }

    detectCollision(body, distance, firstHitOnly = false){
        let {actualCollision, intersections, minIntersection} = this.syncDetectCollision(body,distance,firstHitOnly);
        if (actualCollision) {
            this.onCollisionWith(body, minIntersection.distance, body.collisionPayload, minIntersection, intersections);
            body.onCollisionWith(this, minIntersection.distance, this.collisionPayload, minIntersection, intersections);
            // this.onPersonalCollision(body, body.collisionPayload, minIntersection, intersections);
        }
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

export { PhysicsBody }