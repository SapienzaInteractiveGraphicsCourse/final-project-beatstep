import { THREE, scene } from "../setup/ThreeSetup";

const raycaster = new THREE.Raycaster();
const origin = new THREE.Vector3();
const direction = new THREE.Vector3();

/**
 * Sets up an object to be collideable by choosing a geometry as collision mask
 * @param {THREE.Object3D} object - The object to setup to be collideable
 * @param {THREE.Geometry} geometry - The collision mask to use
 * @param {Function} onPersonalCollision - Function called when this object collides with other objects. Arguments: The list of intersection objects
 * @param {Function} onCollisionWith  - Function called when an object collides with this object. Arguments: The other object, the collision distance, the intersection object
 * @returns {THREE.Object3D} - The now collideable object to chain calls
 */
function setCollideable(object, geometry, onPersonalCollision = null, onCollisionWith = null){

    if(!object) throw new Error("The object parameter is required");
    if(!geometry) throw new Error("The geometry parameter is required");

    object.collisionHolder = {};

    object.detectCollision = detectCollision.bind(object); 
    object.collisionHolder.onPersonalCollision = onPersonalCollision || function(intersections){};
    object.collisionHolder.onCollisionWith = onCollisionWith || function(object, distance, intersection){};

    let faces = [];
    let vertices = geometry.getAttribute("position");
    let indices = geometry.index ? geometry.index.array : [...Array(vertices.count).keys()];
    
    let va = vertices.array;
    for (let i = 0; i < indices.length; i+=3) {
        // Extracting the 3 vertices to create a face
        let i1 = indices[i], i2 = indices[i+1], i3 = indices[i+2];
        let v1 = [va[i1*3],va[i1*3+1],va[i1*3+2]];
        let v2 = [va[i2*3],va[i2*3+1],va[i2*3+2]];
        let v3 = [va[i3*3],va[i3*3+1],va[i3*3+2]];
        // Creating the face
        faces.push(new Face(v1,v2,v3));
    }

    object.collisionHolder.faces = faces;
    // Raycast debug
    object.collisionHolder.visualRaycasts = [];
    return object    
}

/**
 * Detects if the specified object is colliding, or is closer than the specified distance with the specified list of collideable objects
 * @param {Number} [distance] - The maximum distance to check for a collision. Default = 0.1 
 * @param {Boolean} debug - If it's needed a visual representation of the raycasts, default: false
 * @param {THREE.Object3D[]} [collidableList] - The list of object to check against for collisions. Default = all the objects in the scene
 * @returns {Intersection[]} - The list of intersection objects
 */
function detectCollision(distance = 0.1, debug = false, collidableList = null) {
    //if(!object.collisionHolder) throw new Error("Can't detect collision with non collideable objects");

    if (!collidableList) collidableList = scene.children;
    let faces = this.collisionHolder.faces;
    
    // Array used to keep track of all the object for which a collision has been detected already, so to not call onCollisionWith a second time
    let objectsCollidedHandled = [];
    // Array to keep all the intersection objects returned by ray.intersectObjects
    let intersectionObjects = [];
    let actualCollision = false; // Flag used to decide whether a notifyable colision has appened

    // Raycast debug
    for(let r of this.collisionHolder.visualRaycasts){
        scene.remove(r);
    }
    this.collisionHolder.visualRaycasts = [];

    for (let face of faces) {
        origin.copy(face.midpoint).applyMatrix4(this.matrixWorld); // Transforming the face center to world coords
        direction.copy(face.normal).transformDirection(this.matrixWorld); // Transforming the face normal to world coords
        raycaster.near = -distance;
        raycaster.far = distance;

        raycaster.set(origin, direction);

        // Raycast debug
        if(debug){
            let l = this.collisionHolder.visualRaycasts.push(new THREE.ArrowHelper(raycaster.ray.direction, raycaster.ray.origin, distance, 0xff0000))
            scene.add( this.collisionHolder.visualRaycasts[l-1] );
        }
        
        let collisionResults = raycaster.intersectObjects(collidableList, true); // Check for intersections
        if (collisionResults.length == 0) continue;

        for (let colObj of collisionResults) {
            if (colObj.object != this && colObj.object.collisionHolder && !objectsCollidedHandled.includes(colObj.object)) {
                actualCollision = true;
                colObj.personalFace = face;
                colObj.object.collisionHolder.onCollisionWith(this, colObj.distance, colObj);
                objectsCollidedHandled.push(colObj.object);
                intersectionObjects.push(colObj);
            }
        }
    }

    if(actualCollision) this.collisionHolder.onPersonalCollision(intersectionObjects);
    return intersectionObjects;

}

class Face {
    /**
     * 
     * @param {Array} v1 - Array containing x,y,z of the vertex 
     * @param {Array} v2 - Array containing x,y,z of the vertex 
     * @param {Array} v3 - Array containing x,y,z of the vertex 
     */
    constructor(v1,v2,v3){
        this.vertices = [v1,v2,v3];
        this.midpoint = new THREE.Vector3(
            (v1[0]+v2[0]+v3[0])/3,
            (v1[1]+v2[1]+v3[1])/3,
            (v1[2]+v2[2]+v3[2])/3
        );

        let vec1 = new THREE.Vector3().fromArray(v1);
        let vec2 = new THREE.Vector3().fromArray(v2);
        let vec3 = new THREE.Vector3().fromArray(v3);

        vec2.sub(vec1);
        vec3.sub(vec1);
        this.normal = vec2.cross(vec3).normalize();
    }
}

class CollisionMap {

    constructor(halfSize = 30, cellSize = 10) {
        this.halfSize = halfSize;
        this.size = (halfSize * 2);
        this.cellSize = cellSize;
        this.center = [0, 0, 0];
        this.boundary = cellSize*halfSize;
        // spaceMap[x][y][z][index]
        this.spaceMap = new Array(this.size); // x dimension
        for (let x = 0; x < this.size; x++) {
            this.spaceMap[x] = new Array(this.size); // y dimension
            for (let y = 0; y < this.size; y++) {
                this.spaceMap[x][y] = new Array(this.size); // z dimension
                for (let z = 0; z < this.size; z++) {
                    this.spaceMap[x][y][z] = new Array(); // index dimension
                }
            }
        }
        this.list = [];
        this.outOfBounds = [];
    }

    add(object) {
        if (this.list.includes(object)) {
            // Remove object from previous position in the map
            if(!object.__collisionMapIndices){
                this.outOfBounds.splice(this.outOfBounds.indexOf(object),1);
            }
            else{
                let xIn = object.__collisionMapIndices[0];
                let yIn = object.__collisionMapIndices[1];
                let zIn = object.__collisionMapIndices[2];
                this.spaceMap[xIn][yIn][zIn].splice(this.this.spaceMap[xIn][yIn][zIn].indexOf(object),1);
            }
        }
        else{
            this.list.push(object);
        }
        // Add the object to its corresponding cell in the collision map
        let x = object.position.x, y = object.position.y, z = object.position.z;
        let xIn = Math.floor(((x - this.center[0]) / this.cellSize) + this.halfSize);
        let yIn = Math.floor(((y - this.center[1]) / this.cellSize) + this.halfSize);
        let zIn = Math.floor(((z - this.center[2]) / this.cellSize) + this.halfSize);
        if (xIn >= this.size || yIn >= this.size || zIn >= this.size) {
            this.outOfBounds.push(object);
            object.__collisionMapIndices = null;
        }
        else {
            this.spaceMap[xIn][yIn][zIn].push(object);
            object.__collisionMapIndices = [xIn, yIn, zIn];
        }
    }

    addObjects(objects = []){
        if(!Array.isArray(objects)) objects = [objects];
        objects.forEach((o) => this.add(o));
    }

    getObjects(position, distance = 0){
        if(distance < this.cellSize) distance = this.cellSize;
        let x = position.x, y = position.y, z = position.z;
        
        // Index of left-most cell to check for each axis
        let xInL = Math.floor((((x-distance) - this.center[0]) / this.cellSize) + this.halfSize);
        let yInL = Math.floor((((y-distance) - this.center[1]) / this.cellSize) + this.halfSize);
        let zInL = Math.floor((((z-distance) - this.center[2]) / this.cellSize) + this.halfSize);
        
        // Index of right-most cell to check for each axis
        let xInR = Math.floor((((x+distance) - this.center[0]) / this.cellSize) + this.halfSize);
        let yInR = Math.floor((((y+distance) - this.center[1]) / this.cellSize) + this.halfSize);
        let zInR = Math.floor((((z+distance) - this.center[2]) / this.cellSize) + this.halfSize);

        let closeObjects = [];
        // Take only the out of bounds objects, as the entier range requested is out of bounds
        if (xInL >= this.size || yInL >= this.size || zInL >= this.size || xInR < 0 || yInR < 0 || zInR < 0) {
            closeObjects.push(...this.outOfBounds);
        }
        else{
            let oobIncluded = false;
            if(xInL < 0 || yInL < 0 || zInL < 0){
                closeObjects.push(...this.outOfBounds); //Taking the outOfBound elements as the distance stretches outside the map
                oobIncluded = true;
                xInL = 0; yInL = 0; zInL = 0; // Clamping values to be inside the map
            }
            if(xInR >= this.size || yInR >= this.size || zInR >= this.size){
                if(!oobIncluded) closeObjects.push(...this.outOfBounds); //Taking the outOfBound elements as the distance stretches outside the map
                xInR = this.size-1; yInR = this.size-1; zInR = this.size-1; // Clamping values to be inside the map
            }

            for(x = xInL; x <= xInR; x++){
                for(y = yInL; y <= yInR; y++){
                    for(z = zInL; z <= zInR; z++){
                        closeObjects.push(...this.spaceMap[x][y][z]);
                    }
                }
            }

        }
        return closeObjects;
    }

    removeObject(object){
        if (this.list.includes(object)) {
            // Remove object from previous position in the map
            if(!object.__collisionMapIndices){
                this.outOfBounds.splice(this.outOfBounds.indexOf(object),1);
            }
            else{
                let xIn = object.__collisionMapIndices[0];
                let yIn = object.__collisionMapIndices[1];
                let zIn = object.__collisionMapIndices[2];
                this.spaceMap[xIn][yIn][zIn].splice(this.this.spaceMap[xIn][yIn][zIn].indexOf(object),1);
            }
            delete object.__collisionMapIndices;
        }
    }

}

export { setCollideable, detectCollision, CollisionMap };