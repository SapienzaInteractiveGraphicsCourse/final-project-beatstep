import { Matrix4, Vector3, Vector4 } from "three";
function fixZeroPrecision(){
    if(Math.abs(this.x) < 0.0001) this.x = 0;
    if(Math.abs(this.y) < 0.0001) this.y = 0;
    if(Math.abs(this.z) < 0.0001) this.z = 0;
    return this;
}
Vector3.prototype.fixZeroPrecision = fixZeroPrecision;

import { THREE, scene } from "../setup/ThreeSetup";
import { MovementEngine } from "./MovementEngine";
import { Raycaster } from "./Raycaster";


const _tempVector = new Vector3(0, 0, 0);
const _debugMaterial = new THREE.MeshBasicMaterial({color: new THREE.Color( 0x00ff00 ), wireframe: true});

class PhysicsWorld {

    constructor(){
        this.staticObjects = [];
        this.dynamicObjects = [];
        this.debugDraw = false;
        this.debugBoxes = [];
    }


    addObject(mesh,geometry = null,dynamic = false,raycastable = true){
        let geom = geometry || mesh.geometry;
        if(!geom) throw new Error("A geometry or an object with a .geometry property is needed");
        let shape = new PhysicsShape(geom);
        if(mesh.movementEngine == undefined) mesh.movementEngine = new MovementEngine(); 
        let phObject = new PhysicsObject(mesh,shape,raycastable);
        mesh.movementEngine.phObject = phObject;

        if(dynamic) this.dynamicObjects.push(phObject);
        else this.staticObjects.push(phObject);

        let scope = this;
        mesh.removeFromPhysicsWorld = function(){
            scope.removeObject(phObject);
        }

        // if(mesh instanceof THREE.Object3D) scene.add(mesh);
        // else if(mesh.addToScene) mesh.addToScene(scene);

        if(this.debugDraw){
            let dbSize = shape.boundingBox.getSize(new Vector3()).toArray();
            let dbGeom = new THREE.BoxBufferGeometry(...dbSize);
            dbGeom.translate(...shape.center.toArray());
            let dbBox = new THREE.Mesh(dbGeom,_debugMaterial);
            phObject.debugBox = dbBox;
            phObject.mesh.add(dbBox);
            this.debugBoxes.push(dbBox);
        }
    }

    addDynamicObject(mesh,geometry = null,raycastable = true){
        this.addObject(mesh,geometry,true,raycastable);
    }

    addStaticObject(mesh,geometry = null,raycastable = true){
        this.addObject(mesh,geometry,false,raycastable);
    }

    removeObject(object){
        if( !(object instanceof PhysicsObject) && object.movementEngine ){
            object = object.movementEngine.phObject;
        }

        let i = this.staticObjects.indexOf(object);
        if(i != -1){
            this.staticObjects.splice(i,1);
            return;
        }

        i = this.dynamicObjects.indexOf(object);
        if(i != -1){
            this.dynamicObjects.splice(i,1);
            return;
        }
        
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
                        staticObj.onCollision(collisionResult.clone(),obj.mesh,delta);
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
                        dynObj.onCollision(collisionResult.clone().reverse(),obj.mesh,delta);
                    }
                }
            }

        }


    }

    raycast(origin, direction, distance){
        let intersections = [];
        for (let obj of this.dynamicObjects) {
            // If the object is further than the ray's length, ignore this object
            if(obj.boundingBox.distanceToPoint(origin) > distance) continue;

            let ints = Raycaster.raycastToFaces(origin,direction,obj.getBoundingFaces(),distance,true,0);
            if(ints.length > 0){
                ints[0].objectIntersected = obj.mesh;
                intersections.push(ints[0]);
            }
            
        }

        for (let obj of this.staticObjects) {
            // If the object is further than the ray's length, ignore this object
            if(obj.boundingBox.distanceToPoint(origin) > distance) continue;

            let ints = Raycaster.raycastToFaces(origin,direction,obj.getBoundingFaces(),distance,true,0);
            if(ints.length > 0){
                ints[0].objectIntersected = obj.mesh;
                intersections.push(ints[0]);
            }
            
        }

        return intersections;
    }

    raycastPrecise(origin, direction, distance){
        let intersections = [];
        for (let obj of this.dynamicObjects) {
            // If the object is not raycastable, skip it
            if(!obj.raycastable) continue;
            // If the object is further than the ray's length, ignore this object
            if(obj.boundingBox.distanceToPoint(origin) > distance) continue;

            let ints = Raycaster.raycastToFaces(origin,direction,obj.getFaces(),distance,false,0);
            if(ints.length > 0){
                ints[0].objectIntersected = obj.mesh;
                intersections.push(ints[0]);
            }
            
        }

        for (let obj of this.staticObjects) {
            // If the object is not raycastable, skip it
            if(!obj.raycastable) continue;
            // If the object is further than the ray's length, ignore this object
            if(obj.boundingBox.distanceToPoint(origin) > distance) continue;

            let ints = Raycaster.raycastToFaces(origin,direction,obj.getFaces(),distance,false,0);
            if(ints.length > 0){
                ints[0].objectIntersected = obj.mesh;
                intersections.push(ints[0]);
            }
            
        }

        return intersections;
    }

}

class PhysicsObject{

    constructor(mesh,shape,raycastable){
        this.mesh = mesh;
        this.raycastable = raycastable;
        this.shape = shape;
        this.boundingBox = this.shape.boundingBox.clone();
        this.boundingShape = new BoundingPhysicsShape(this.shape.geometry);

        if(this.mesh.onCollision) this.onCollision = this.mesh.onCollision.bind(this.mesh);
        else this.onCollision = () => {};

        this.debugBox = null;
    }

    getFaces(){
        return this.shape.getFaces(this.mesh.matrixWorld);
    }

    getBoundingFaces(){
        return this.boundingShape.getFaces(this.mesh.matrixWorld);
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
        return this.boundingBox.copy(this.shape.boundingBox).applyMatrix4(this.mesh.matrixWorld);
    }

}

class PhysicsShape {

    constructor(geometry) {
        this.geometry = null;
        // The center of the shape
        this.center = new Vector3(0,0,0);
        // The faces of the shape
        this.faces = [];

        if(geometry){
            this.geometry = geometry;
            let faces = this.faces;

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

            // Setting the bounding box
            geometry.computeBoundingBox();
            this.boundingBox = geometry.boundingBox;

            
            this.center.x = (geometry.boundingBox.max.x + geometry.boundingBox.min.x) / 2;
            this.center.y = (geometry.boundingBox.max.y + geometry.boundingBox.min.y) / 2;
            this.center.z = (geometry.boundingBox.max.z + geometry.boundingBox.min.z) / 2;
        }
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

//    6--------7
//   /|       /|
//  / |      / |
// 2--|-----3  |
// |  |     |  |
// |  4-----|--5
// | /      | /
// |/       |/ 
// 0--------1
const _cube = [
    new THREE.Vector3(-1, -1,  1),  // 0
    new THREE.Vector3( 1, -1,  1),  // 1
    new THREE.Vector3(-1,  1,  1),  // 2
    new THREE.Vector3( 1,  1,  1),  // 3
    new THREE.Vector3(-1, -1, -1),  // 4
    new THREE.Vector3( 1, -1, -1),  // 5
    new THREE.Vector3(-1,  1, -1),  // 6
    new THREE.Vector3( 1,  1, -1),  // 7
];

const cubeFaces = [
    // front
    [_cube[0],_cube[1],_cube[3],_cube[2]],
    // back
    [_cube[4],_cube[6],_cube[7],_cube[5]],
    // right
    [_cube[1],_cube[5],_cube[7],_cube[3]],
    // left
    [_cube[4],_cube[0],_cube[2],_cube[6]],
    // bottom
    [_cube[0],_cube[4],_cube[5],_cube[1]],
    // top
    [_cube[2],_cube[3],_cube[7],_cube[6]],

];

// front (no depth)
const xyPlane = [
    _cube[0],_cube[1],_cube[3],_cube[2]
];

// right (no width)
const yzPlane = [
    _cube[1],_cube[5],_cube[7],_cube[3]
];

// top (no height)
const xzPlane = [
    _cube[2],_cube[3],_cube[7],_cube[6]
];


class BoundingPhysicsShape extends PhysicsShape {

    constructor(geometry){
        super();

        geometry.computeBoundingBox();
        let size = geometry.boundingBox.getSize(new Vector3()).fixZeroPrecision();

        this.width = size.x;
        this.height = size.y;
        this.depth = size.z;

        let w2 = this.width/2;
        let h2 = this.height/2;
        let d2 = this.depth/2;
            
        this.center.x = (geometry.boundingBox.max.x + geometry.boundingBox.min.x) / 2;
        this.center.y = (geometry.boundingBox.max.y + geometry.boundingBox.min.y) / 2;
        this.center.z = (geometry.boundingBox.max.z + geometry.boundingBox.min.z) / 2;

        let transformMatrix = new Matrix4();
        transformMatrix.makeScale(w2,h2,d2);
        transformMatrix.setPosition(this.center);

        // 2D shape, no depth
        if(d2 == 0){
            let face = new Face(
                xyPlane[0].clone().applyMatrix4(transformMatrix),
                xyPlane[1].clone().applyMatrix4(transformMatrix),
                xyPlane[2].clone().applyMatrix4(transformMatrix),
                xyPlane[3].clone().applyMatrix4(transformMatrix),
            );
            this.faces.push(face);
        }
        // 2D shape, no width
        else if(w2 == 0){
            let face = new Face(
                yzPlane[0].clone().applyMatrix4(transformMatrix),
                yzPlane[1].clone().applyMatrix4(transformMatrix),
                yzPlane[2].clone().applyMatrix4(transformMatrix),
                yzPlane[3].clone().applyMatrix4(transformMatrix),
            );
            this.faces.push(face);
        }
        // 2D shape, no height
        else if(h2 == 0){
            let face = new Face(
                xzPlane[0].clone().applyMatrix4(transformMatrix),
                xzPlane[1].clone().applyMatrix4(transformMatrix),
                xzPlane[2].clone().applyMatrix4(transformMatrix),
                xzPlane[3].clone().applyMatrix4(transformMatrix),
            );
            this.faces.push(face);
        }
        // 3D shape
        else{
            for(let f of cubeFaces){
                let face = new Face(
                    f[0].clone().applyMatrix4(transformMatrix),
                    f[1].clone().applyMatrix4(transformMatrix),
                    f[2].clone().applyMatrix4(transformMatrix),
                    f[3].clone().applyMatrix4(transformMatrix),
                );
                this.faces.push(face);
            }
        }

    }

}

class Face {
    /**
     * 
     * @param {Array|Vector3} v1 - Array containing x,y,z of the vertex or Vector3 of the vertex
     * @param {Array|Vector3} v2 - Array containing x,y,z of the vertex or Vector3 of the vertex
     * @param {Array|Vector3} v3 - Array containing x,y,z of the vertex or Vector3 of the vertex
     * @param {Array|Vector3} v4 - Array containing x,y,z of the vertex or Vector3 of the vertex
     */
    constructor(v1 = [0, 0, 0], v2 = [0, 0, 0], v3 = [0, 0, 0], v4 = null) {

        this.v1 = Array.isArray(v1) ? new Vector3().fromArray(v1) : v1;
        this.v2 = Array.isArray(v2) ? new Vector3().fromArray(v2) : v2;
        this.v3 = Array.isArray(v3) ? new Vector3().fromArray(v3) : v3;
        if(v4)
            this.v4 = Array.isArray(v4) ? new Vector3().fromArray(v4) : v4;
        else   
            this.v4 = null;

        if(!this.v4){
            this.midpoint = new Vector3(
                (this.v1.x + this.v2.x + this.v3.x) / 3,
                (this.v1.y + this.v2.y + this.v3.y) / 3,
                (this.v1.z + this.v2.z + this.v3.z) / 3
            ).fixZeroPrecision();
        }
        else{
            this.midpoint = new Vector3(
                (this.v1.x + this.v2.x + this.v3.x + this.v4.x) / 4,
                (this.v1.y + this.v2.y + this.v3.y + this.v4.y) / 4,
                (this.v1.z + this.v2.z + this.v3.z + this.v4.z) / 4
            ).fixZeroPrecision();
        }

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
     * Transforms each vertex, the normal and the plane using the given matrix
     * @param {Matrix4} matrix - The transformation matrix to apply 
     * @returns this object for chaining
     */
    applyMatrix4(matrix){
        this.v1.applyMatrix4(matrix);
        this.v2.applyMatrix4(matrix);
        this.v3.applyMatrix4(matrix);
        if(this.v4)
            this.v4.applyMatrix4(matrix);

        this.midpoint.applyMatrix4(matrix);
        this.normal.transformDirection(matrix);

        this.plane.applyMatrix4(matrix);
        return this;
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
        if(this.v4)
            this.v4.copy(face.v4);

        this.midpoint.copy(face.midpoint);
        this.normal.copy(face.normal);

        this.plane.copy(face.plane);

        if (matrixWorld) {
            this.applyMatrix4(matrixWorld);
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
                this.v3.clone(),
                this.v4 ? this.v4.clone() : null
            );
        }
        if (matrixWorld) {
            return new Face(
                this.v1.clone().applyMatrix4(matrixWorld),
                this.v2.clone().applyMatrix4(matrixWorld),
                this.v3.clone().applyMatrix4(matrixWorld),
                this.v4 ? this.v4.clone().applyMatrix4(matrixWorld) : null
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

        let result = new SatCollisionResult(mtv, mtvLength);
        return result;
    }

}

class SatCollisionResult {
    constructor(normal,penetration){
        this.normal = normal;
        this.penetration = penetration;
    }

    clone(){
        return new SatCollisionResult(this.normal.clone(), this.penetration);
    }

    reverse(){
        this.normal.multiplyScalar(-1);
        return this;
    }
}

const world = new PhysicsWorld();
// world.debugDraw = true;
export { PhysicsWorld, world }