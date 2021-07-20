import { Matrix4, Vector3,Vector4 } from "three";
import { THREE } from "../setup/ThreeSetup";

const _tempVector = new Vector3(0,0,0);

class PhysicsWorld {

    constructor(){
        this.gravity = new Vector3(0,0,0);
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
        this.shape = shape || new PhysicsShapeThree(THREE.BoxGeometry); // TODO: Change with custom box shape
        this.material = material || new PhysicsMaterial();

        this.position = new Vector3(0,0,0);
        this.quaternion = new THREE.Quaternion(0,0,0,1);
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
        this.linea

        this.constraints = 0;

        this.appliedForce = new Vector3(0,0,0);

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

        if(this.mesh) this.updateMesh(this.mesh);
    }

    updateMesh(mesh, pos = true, rot = false){
        if(pos) mesh.position.copy(this.position);
        if(rot) mesh.quaternion.copy(this.quaternion);
    }

    detectCollision(body){

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

    constructor() {
        if(this.prototype.constructor === PhysicsShape){
            throw new Error("Cannot instantiate PhysicsBody. Use an inheriting class");
        }
        this.faces = [];
    }

    raycastFromFace(face, maxDistance){
        let intersections = [];
        for (let f of this.faces) {
            let int = f.raycastFromFace(face, maxDistance);
            if(int){
                int.shape = this;
                intersections.push(int);
            }
        }
        return intersections;
    }

}

class PhysicsShapeThree extends PhysicsShape {

    constructor(geometry) {
        super();
        // Eventually if Rigid Bodies Dynamic will be needed
        let faces = [];
        let vertices = geometry.getAttribute("position");
        let indices = geometry.index ? geometry.index.array : [...Array(vertices.count).keys()];

        let va = vertices.array;
        for (let i = 0; i < indices.length; i += 3) {
            // Extracting the 3 vertices to create a face
            let i1 = indices[i], i2 = indices[i + 1], i3 = indices[i + 2];
            let v1 = [va[i1 * 3], va[i1 * 3 + 1], va[i1 * 3 + 2]];
            let v2 = [va[i2 * 3], va[i2 * 3 + 1], va[i2 * 3 + 2]];
            let v3 = [va[i3 * 3], va[i3 * 3 + 1], va[i3 * 3 + 2]];
            // Creating the face
            faces.push(new Face(v1, v2, v3));
        }

        this.faces = faces;
    }

}

class Face {
    /**
     * 
     * @param {Array|Vector3} v1 - Array containing x,y,z of the vertex or Vector3 of the vertex
     * @param {Array|Vector3} v2 - Array containing x,y,z of the vertex or Vector3 of the vertex
     * @param {Array|Vector3} v3 - Array containing x,y,z of the vertex or Vector3 of the vertex
     */
    constructor(v1,v2,v3){        

        this.v1 = Array.isArray(v1) ? new Vector3().fromArray(v1) : v1;
        this.v2 = Array.isArray(v2) ? new Vector3().fromArray(v2) : v2;
        this.v3 = Array.isArray(v3) ? new Vector3().fromArray(v3) : v3;

        this.midpoint = new Vector3(
            (v1[0]+v2[0]+v3[0])/3,
            (v1[1]+v2[1]+v3[1])/3,
            (v1[2]+v2[2]+v3[2])/3
        );
        
        // plane = [(X_1 − X_3) × (X_2 − X_3), −X_3T(X_1 × X_2)]
        this.plane = new Vector4();

        let topVec1 = new Vector3(0,0,0).subVectors(v1,v3);
        let topVec2 = new Vector3(0,0,0).subVectors(v2,v3);
        let normal = new Vector3(0,0,0).crossVectors(topVec1,topVec2).normalize();
        this.plane.copy(normal);

        let planeW = this.v3.dot(new Vector3(0,0,0).crossVectors(this.v1,this.v2));
        this.plane.setW(planeW);


    }

    /**
     * Computes the distance between a point and the plane this face resides on.
     * The distance is positive if the point is in front of the face, is negative if the point is on the back of the face
     * @param {Vector3} point - A point in space 
     * @returns {Number} The distance
     */
    distancePointFromPlane(point){
        let v = new Vector3(0,0,0).subVectors(point,this.midpoint);
        return v.dot(this.normal);
    }

    /**
     * Calculates whether there is an intersection between a line and the plane this face resides on.
     * @param {Vector3} lineOrigin - The origin of the line 
     * @param {Vector3} lineDirection - The direction of the line 
     * @returns {Object} Returns null if there is no intersection, an object with the intersection point and distance otherwise.
     *                   The distance is with sign, positive if the line origin is in front of the face, negative if is on the back of the face
     *                   If the intersection point is the line origin and the distance is zero, the line is fully contained in the plane
     */
    intersectionLineWithPlane(lineOrigin, lineDirection){
        let denominator = lineDirection.clone().dot(this.normal); // ld • n
        let numerator = new Vector3(0,0,0).subVectors(this.midpoint,lineOrigin).dot(this.normal); // (mp - lo) • n
        // If both the denominator == 0 and the numerator == 0 => the entire line is contained in the plane
        if(denominator == 0 && numerator == 0){
            return {
                point: lineOrigin.clone(),
                distance: 0
            }
        }
        // If the denominator == 0 but the numerator != 0 => there is no intersection
        if(denominator == 0){
            return null;
        }
        // If the denominator != 0 but the numerator != 0 => there is a single point of intersection
        let d = numerator/denominator;
        return {
            point: lineDirection.clone().multiplyScalar(d).add(lineOrigin), // intersection = lo + ld*d
            distance: d
        }
    }

    /**
     * Check if the point is inside the face using the Same-Side Technique (https://blackpawn.com/texts/pointinpoly/)
     * @param {Vector3} point - The point to check
     * @param {Boolean} coplanar - A flag reassuring that the point is coplanar to the face. If false, the coplanarity is checked
     * @returns {Boolean} If the point is inside the face or not
     */
    pointInsideFace(point,coplanar = false) {
        // Check if the point is coplanar. If not, return false
        if(!coplanar && point.clone().sub(this.midpoint).dot(this.normal) == 0){
            return false;
        }

        // First side
        let side = new Vector3(0,0,0).subVectors(this.v2,this.v1);
        let vec = new Vector3(0,0,0).subVectors(point,this.v1);
        let inside = side.cross(vec).dot(this.normal);
        if(inside < 0) return false;

        // Second side
        side.subVectors(this.v3,this.v2);
        vec.subVectors(point,this.v2);
        inside = side.cross(vec).dot(this.normal);
        if(inside < 0) return false;

        // Third side
        side.subVectors(this.v1,this.v3);
        vec.subVectors(point,this.v3);
        inside = side.cross(vec).dot(this.normal);
        if(inside < 0) return false;

        return true;

    }

    /**
     * Casts a ray from the center of this face torward the supplied face.
     * Returns if the ray intersects the face and the intersection point is closer than maxDistance
     * @param {Face} face - The face to check the intersection with
     * @param {Number} maxDistance - The maxDistance for which the intersection is valid
     * @returns {Object} If this face's ray intersects the supplied face at a distance less than maxDistance
     */
    raycastToFace(face, maxDistance){
        // If this face's midpoint is further than maxDistance from the other face's plane, for sure we don't care about the intersection
        if(Math.abs(face.distancePointFromPlane(this.midpoint)) > maxDistance) return null;
        //Compute the intersection point and its distance. If is further than maxDistance, return false
        let {point: intersectionPoint, distance} = face.intersectionLineWithPlane(this.midpoint,this.normal);
        if(Math.abs(distance) > maxDistance) return null;
        // If the intersection point is inside the face, return the intersection point and the distance
        if(face.pointInsideFace(intersectionPoint,true)) return {point: intersectionPoint, distance, raycastingFace: this, raycastedFace: face};

        return null;
    }

    

    /**
     * Casts a ray from the center of supplied face torward this face.
     * Returns if the ray intersects the face and the intersection point is closer than maxDistance
     * @param {Face} face - The face to check the intersection with
     * @param {Number} maxDistance - The maxDistance for which the intersection is valid
     * @returns {Object} If the supplied face's ray intersects this face at a distance less than maxDistance
     */
     raycastFromFace(face, maxDistance){
        // If this face's midpoint is further than maxDistance from the other face's plane, for sure we don't care about the intersection
        if(Math.abs(this.distancePointFromPlane(face.midpoint)) > maxDistance) return null;
        //Compute the intersection point and its distance. If is further than maxDistance, return false
        let {point: intersectionPoint, distance} = this.intersectionLineWithPlane(face.midpoint,face.normal);
        if(Math.abs(distance) > maxDistance) return null;
        // If the intersection point is inside the face, return true
        if(this.pointInsideFace(intersectionPoint,true)) return {point: intersectionPoint, distance, raycastingFace: face, raycastedFace: this};

        return null;
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



const world = new PhysicsWorld();
world.gravity.y = -10;
export { world, PhysicsWorld, PhysicsBody, PhysicsMaterial, PhysicsShape, PhysicsShapeThree };