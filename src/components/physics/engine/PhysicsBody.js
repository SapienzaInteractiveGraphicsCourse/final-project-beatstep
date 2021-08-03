import { Matrix4, Vector3, Quaternion, BoxGeometry } from "three";
import { PhysicsShape, Face } from "./PhysicsShape";
import { PhysicsShapeThree } from "./PhysicsShapeThree";
import { PhysicsMaterial } from "./PhysicsMaterial";

const _tempVector = new Vector3(0,0,0);

class PhysicsBody {

    constructor(mass = 1, shape, material, onCollisionWith){
        this._minVectorValue = -1e10, this._maxVectorValue = 1e10;
        this._world = null;

        this.mass = mass;
        this.shape = shape || new PhysicsShapeThree(new BoxGeometry(1,1,1)); // TODO: Change with custom box shape
        this.material = material || new PhysicsMaterial(0.8,0);

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

        this.appliedForce = new Vector3(0,0,0);

        this.gravityInfluence = 1;
        
        this.collisionInfos = [];
        this.collisionDistance = 0.1;
        this.firstHitOnly = true;
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

    updateMesh(mesh, pos = true, rot = false){
        if(pos) mesh.position.copy(this.position);
        if(rot) mesh.quaternion.copy(this.quaternion);
    }

    getFaces(){
        return this.shape.getFaces(this.matrixWorld);
    }

    getVertices(){
        return this.shape.getVertices(this.matrixWorld);
    }

    getNormals(){
        return this.shape.getNormals(this.matrixWorld);
    }

    getCenter(){
        return this.shape.getCenter(this.matrixWorld);
    }

    reset(){
        this.appliedForce.set(0,0,0);
        this.linearVelocity.set(0,0,0);
        this.angularVelocity.set(0,0,0);
        this.lastDisplacement.set(0,0,0);
    }

}

class CollisionInfo {

    /**
     * An object with the necessary info to resolve a collision 
     * @param {Vector3} normal - The normal of the collision surface 
     * @param {Number} distance - The distance from the collision point
     * @param {Number} collisionTime - The time from the start of this frame, when this collision starts
     * @param {Number} mass - The mass of the other object
     * @param {Number} friction - The friction the other object impresses
     */
    constructor(normal,distance,collisionTime,mass,friction){
        this.normal = normal;
        this.distance = distance;
        this.collisionTime = collisionTime;
        this.mass = mass;
        this.friction = friction;
    }

}

export { PhysicsBody, CollisionInfo }