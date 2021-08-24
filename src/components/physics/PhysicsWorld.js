import { Vector3, Vector4 } from "three";
function fixZeroPrecision(){
    if(Math.abs(this.x) < 0.0001) this.x = 0;
    if(Math.abs(this.y) < 0.0001) this.y = 0;
    if(Math.abs(this.z) < 0.0001) this.z = 0;
    return this;
}
Vector3.prototype.fixZeroPrecision = fixZeroPrecision;

import { THREE, scene } from "../setup/ThreeSetup";
import { movementEngine } from "./MovementEngine";


const _tempVector = new Vector3(0, 0, 0);

class PhysicsWorld {

    constructor(){
        this.staticObjects = [];
        this.dynamicObjects = [];
    }


    addObject(mesh,geometry = null,dynamic = false){
        let geom = geometry || mesh.geometry;
        if(!geom) throw "A geometry or an object with a .geometry property is needed";
        let shape = new PhysicsShape(geom);
        if(mesh.movementEngine == undefined && dynamic) mesh.movementEngine = new movementEngine(); 
        let phObject = new PhysicsObject(mesh,shape);

        if(dynamic) this.dynamicObjects.push(phObject);
        else this.staticObjects.push(phObject);

        if(mesh instanceof THREE.Object3D) scene.add(mesh);
        else if(mesh.addToScene) mesh.addToScene(scene);
    }

    addDynamicObject(mesh,geometry = null){
        this.addObject(mesh,geometry,true);
    }

    addStaticObject(mesh,geometry = null){
        this.addObject(mesh,geometry,false);
    }

    /**
     * Step the world by checking all possible collisions and executing eventual callbacks
     * @param {Number} delta - The delta time
     */
     step(delta = 0){
        
        for (let i = 0; i < this.dynamicObjects.length; i++) {
            let obj = this.dynamicObjects[i];
            // Updating physics movement
            obj.mesh.movementEngine.update(delta);

            let boundingBox = obj.getBoundingBox();

            // Collision with static objects
            for (let staticObj of this.staticObjects) {
                // If the bounding boxes are intersecting, we check for a precise collision, otherwise quick skip
                if(boundingBox.intersectsBox(staticObj.getBoundingBox())){
                    let collisionResult = SAT.checkCollision(obj,staticObj);
                    if(collisionResult){
                        obj.onCollision(collisionResult,staticObj.mesh,delta);
                        staticObj.onCollision(collisionResult,obj.mesh,delta);
                    }
                }
            }

            // Collision with remaining dynamic objects
            for (let c = i+1; c < this.dynamicObjects.length; c++) {
                let dynObj = this.dynamicObjects[c]; 
                // If the bounding boxes are intersecting, we check for a precise collision, otherwise quick skip
                if(boundingBox.intersectsBox(dynObj.getBoundingBox())){
                    let collisionResult = SAT.checkCollision(obj,dynObj);
                    if(collisionResult){
                        obj.onCollision(collisionResult,dynObj.mesh,delta);
                        dynObj.onCollision(collisionResult,obj.mesh,delta);
                    }
                }
            }

        }


    }

}

class PhysicsObject{

    constructor(mesh,shape){
        this.mesh = mesh;
        this.shape = shape;
        if(this.mesh.onCollision) this.onCollision = this.mesh.onCollision.bind(this.mesh);
    }

    getFaces(){
        return this.shape.getFaces(this.mesh.matrixWorld);
    }

    getVertices(){
        return this.shape.getVertices(this.mesh.matrixWorld);
    }

    getNormals(){
        return this.shape.getNormals(this.mesh.matrixWorld);
    }

    getCenter(){
        return this.shape.getCenter(this.mesh.matrixWorld);
    }

    getBoundingBox(){
        return this.shape.boundingBox.applyMatrix4(this.mesh.matrixWorld);
    }

}

class PhysicsShape {

    constructor(geometry) {
        // The center of the shape
        this.center = new Vector3(0,0,0);

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

        // Setting the bounding box
        geometry.computeBoundingBox();
        this.boundingBox = geometry.boundingBox;
    }

    getFaces(matrixWorld) {
        let newFaces = [];
        for (let f of this.faces) {
            newFaces.push(f.clone(matrixWorld));
        }
        return newFaces;
    }

    getVertices(matrixWorld) {
        let newVertices = [];
        if(matrixWorld){
            for (let f of this.faces) {
                newVertices.push(
                    f.v1.clone().applyMatrix4(matrixWorld).fixZeroPrecision(),
                    f.v2.clone().applyMatrix4(matrixWorld).fixZeroPrecision(),
                    f.v3.clone().applyMatrix4(matrixWorld).fixZeroPrecision()
                );
            }
        }
        else{
            for (let f of this.faces) {
                newVertices.push(
                    f.v1.clone().fixZeroPrecision(),
                    f.v2.clone().fixZeroPrecision(),
                    f.v3.clone().fixZeroPrecision()
                );
            }
        }
        return newVertices;
    }

    getNormals(matrixWorld) {
        let newNormals = [];
        if(matrixWorld){
            for (let f of this.faces) {
                newNormals.push(
                    f.normal.clone().transformDirection(matrixWorld).fixZeroPrecision()
                );
            }
        }
        else{
            for (let f of this.faces) {
                newNormals.push(
                    f.normal.clone().fixZeroPrecision()
                );
            }
        }
        return newNormals;
    }

    getCenter(matrixWorld){
        let newCenter = this.center.clone();
        if(matrixWorld) newCenter.applyMatrix4(matrixWorld);
        return newCenter;
    }

}

class Face {
    /**
     * 
     * @param {Array|Vector3} v1 - Array containing x,y,z of the vertex or Vector3 of the vertex
     * @param {Array|Vector3} v2 - Array containing x,y,z of the vertex or Vector3 of the vertex
     * @param {Array|Vector3} v3 - Array containing x,y,z of the vertex or Vector3 of the vertex
     */
    constructor(v1 = [0, 0, 0], v2 = [0, 0, 0], v3 = [0, 0, 0]) {

        this.v1 = Array.isArray(v1) ? new Vector3().fromArray(v1) : v1;
        this.v2 = Array.isArray(v2) ? new Vector3().fromArray(v2) : v2;
        this.v3 = Array.isArray(v3) ? new Vector3().fromArray(v3) : v3;

        this.midpoint = new Vector3(
            (this.v1.x + this.v2.x + this.v3.x) / 3,
            (this.v1.y + this.v2.y + this.v3.y) / 3,
            (this.v1.z + this.v2.z + this.v3.z) / 3
        ).fixZeroPrecision();

        // plane = [(X_1 − X_3) × (X_2 − X_3), −X_3T(X_1 × X_2)]
        this.plane = new Vector4();

        let topVec1 = new Vector3(0, 0, 0).subVectors(this.v1, this.v3);
        let topVec2 = new Vector3(0, 0, 0).subVectors(this.v2, this.v3);
        this.normal = new Vector3(0, 0, 0).crossVectors(topVec1, topVec2).normalize().fixZeroPrecision();
        this.plane.copy(this.normal);

        let planeW = this.v3.dot(new Vector3(0, 0, 0).crossVectors(this.v1, this.v2));
        this.plane.setW(planeW);
    }

    /**
     * Sets this face to be equal to the supplied face. If a matrixWorld is provided, is applied to this face
     * @param {Face} face - The face to copy
     * @param {Matrix4} matrixWorld - A transformation matrix
     */
    set(face, matrixWorld) {
        this.v1.copy(face.v1);
        this.v2.copy(face.v2);
        this.v3.copy(face.v3);

        this.midpoint.copy(face.midpoint);
        this.normal.copy(face.normal);

        this.plane.copy(face.plane);

        if (matrixWorld) {
            this.v1.applyMatrix4(matrixWorld);
            this.v2.applyMatrix4(matrixWorld);
            this.v3.applyMatrix4(matrixWorld);

            this.midpoint.applyMatrix4(matrixWorld);
            this.normal.transformDirection(matrixWorld);

            this.plane.applyMatrix4(matrixWorld);
        }
        return this;
    }

    /**
     * Clones this face. If a matrixWorld is provided, is applied to this face
     * @param {Matrix4} matrixWorld - A transformation matrix
     */
    clone(matrixWorld) {
        if (!matrixWorld) {
            return new Face(
                this.v1.clone(),
                this.v2.clone(),
                this.v3.clone()
            );
        }
        if (matrixWorld) {
            return new Face(
                this.v1.clone().applyMatrix4(matrixWorld),
                this.v2.clone().applyMatrix4(matrixWorld),
                this.v3.clone().applyMatrix4(matrixWorld)
            );
        }
    }


}

class SAT {

    static projection(vertices, normal) {
        let max = -Infinity;
        let min = Infinity;
        for (let v of vertices) {
            let proj = v.dot(normal);
            max = Math.max(max, proj);
            min = Math.min(min, proj);
        }
        return { start: min, end: max };
    }

    static overlap(intervalA, intervalB) {
        if (intervalB.end < intervalA.start || intervalB.start > intervalA.end) return { start: 0, end: 0, length: -1 };
        let ret = { start: Math.max(intervalA.start, intervalB.start), end: Math.min(intervalA.end, intervalB.end), length: 0 };
        ret.length = ret.end - ret.start;
        return ret;
    }

    static checkCollision(body1, body2) {

        let allNormals = body1.getNormals();
        allNormals.push(...body2.getNormals());
        let vertices1 = body1.getVertices();
        let vertices2 = body2.getVertices();

        let mtv = new Vector3(0, 0, 0);
        let mtvLength = Infinity;
        for (let normal of allNormals) {
            let intervalA = SAT.projection(vertices1, normal);
            let intervalB = SAT.projection(vertices2, normal);

            let overlap = SAT.overlap(intervalA, intervalB);
            if (overlap.length == -1) {
                return null;
            }
            else if (overlap.length < mtvLength) {
                mtvLength = overlap.length;
                mtv.copy(normal);
            }
        }
        // The normal could be reveresed respect to body1, reverse it again
        let center1 = body1.getCenter();
        let center2 = body2.getCenter();
        center1.sub(center2);
        if(center1.dot(mtv) < 0){
            mtv.multiplyScalar(-1); // This way the normal's direction is always from body2 to body1
        }

        return { normal: mtv, penetration: mtvLength };
    }

}

export { PhysicsWorld }