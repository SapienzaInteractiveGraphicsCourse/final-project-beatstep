
class CollisionMap {

    /**
     * A data structure to keep position-aware objects. An object can then be retrieved given a position and a range
     * @param {Number} halfSize - Half of the number of cells for each dimension present in this map 
     * @param {Number} cellSize - Size in world units of one cell
     */
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

    addObject(object) {
        // If the object is already in the map, update its position
        if (this.list.includes(object)) {
            // Remove object from previous position in the map
            if(!object.__collisionMapIndices){
                this.outOfBounds.splice(this.outOfBounds.indexOf(object),1);
            }
            else{
                let xIn = object.__collisionMapIndices[0];
                let yIn = object.__collisionMapIndices[1];
                let zIn = object.__collisionMapIndices[2];
                this.spaceMap[xIn][yIn][zIn].splice(this.spaceMap[xIn][yIn][zIn].indexOf(object),1);
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
        if (xIn >= this.size || xIn < 0 || yIn >= this.size || yIn < 0 || zIn >= this.size || zIn < 0) {
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
                this.spaceMap[xIn][yIn][zIn].splice(this.spaceMap[xIn][yIn][zIn].indexOf(object),1);
            }
            delete object.__collisionMapIndices;
            this.list.splice(this.list.indexOf(object),1);
        }
    }

    changeCenter(x,y,z){
        this.center = [x,y,z];
        this.addObjects(this.list);
    }

}

export { CollisionMap };