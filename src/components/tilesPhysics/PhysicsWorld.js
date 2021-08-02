import { THREE, scene } from "../setup/ThreeSetup";
import Wall from "../environment/Wall";
import Floor from "../environment/Floor";
import FloorLight from "../environment/FloorLight";
import TopLight from "../environment/TopLight";
import GasCylinder from "../environment/GasCylinder";
import Door from "../environment/Door";

class PhysicsWorld {
    /**
     * Creates a world of tiles!
     * @param {Number} tileSize the size of each tile (xz dimension) 
     * @param {Number} heightLevels the height of each level (y-direction)
     * @param {Number} gravity the "gravity" of the situation :P
     * 
     * Rules of the tiles objects:
     *  - must be classes (so with .constructor.name)
     *  - if it's not an Object3D, it must have obj.addToScene(scene) method
     *  - if it's animated, must have a obj.step(delta) to update the mixer(s)
     */
    constructor(tileSize = 5, heightLevels = 5, gravity = 9.8){
        this.gravity = gravity;
        this.tiles = {}; // 3D tiles dictionary
        this.animatedTiles = {}; // animated tiles dictionary
        this.movingObjects = []; // Objects subject to environment collision
        this.tileSize = tileSize;
        this.heightLevels = heightLevels;

        this._fixZeroPrecision = (value)=>{
            // if(Math.abs(value) < this._precision) return 0;
            return parseFloat(value.toFixed(2));
        };

        this._getTilePos = (value, tileDim)=>{
            let res =  (value / tileDim);
            if(res < 0) res-=1;
            return parseInt(res);
        }
        this._getTilePosXZ = (value)=> this._getTilePos(value,tileSize);
        this._getTilePosY = (value)=>{
            value = this._fixZeroPrecision(value);
            return this._getTilePos(value,heightLevels);
        }

    }

    /**
     * Add a moving object to the list to check!
     * @param {THREE.Object3D} obj an object instance (can be player, robot etc.)
     * @param {Numnber} radius the object radius collision distance
     */
    addMovingObject(obj,radius = 0.5){
        this.movingObjects.push({obj,radius});
    }
    
    /**
     * Add created object to the world!
     * @param {THREE.Object3D} obj a THREE.Object3D instance
     * @param {Number} tile_x the x tile value in this world to set this object
     * @param {Number} tile_y the y tile value in this world to set this object
     * @param {Number} tile_z the z tile value in this world to set this object
     */
    addToWorld(obj, tile_x,tile_y,tile_z){
        [tile_x,tile_y,tile_z] = [parseInt(tile_x),parseInt(tile_y),parseInt(tile_z)];

        if(obj instanceof THREE.Object3D) scene.add(obj);
        else if(obj.addToScene) obj.addToScene(scene);
        else throw Error("Object is wrong instance type in tile x:"+tile_x+",y:"+tile_y +",z:"+tile_z+". It's not an Object3D or has an addToScene method!");

        if(!this.tiles[tile_y]) this.tiles[tile_y] = {};
        if(!this.tiles[tile_y][tile_x]) this.tiles[tile_y][tile_x] = {};
        if(!this.tiles[tile_y][tile_x][tile_z]){ 
            this.tiles[tile_y][tile_x][tile_z] = [];
        }
        this.tiles[tile_y][tile_x][tile_z].push(obj);

        if(obj.step){ // if it's animated
            if(!this.animatedTiles[tile_y]) this.animatedTiles[tile_y] = {};
            if(!this.animatedTiles[tile_y][tile_x]) this.animatedTiles[tile_y][tile_x] = {};
            if(!this.animatedTiles[tile_y][tile_x][tile_z]){ 
                this.animatedTiles[tile_y][tile_x][tile_z] = [];
            }
            this.animatedTiles[tile_y][tile_x][tile_z].push(this.tiles[tile_y][tile_x][tile_z].length - 1);
        }
        
    }

    /**
     * Add a wall to the world!
     * @param {Number} tile_x the x tile value in this world to set this object
     * @param {Number} tile_y the y tile value in this world to set this object
     * @param {Number} tile_z the z tile value in this world to set this object
     * @param {Number} direction the direction of the wall to be set: 0=bottom,1=right,2=top,3=left (contact Marco for more information)
     * @returns the object created
     */
    addWall(tile_x,tile_y,tile_z, direction=0){ // 0=bottom,1=right,2=top,3=left
        [tile_x,tile_y,tile_z] = [parseInt(tile_x),parseInt(tile_y),parseInt(tile_z)];
        let directions = [
            [this.tileSize/2 , this.tileSize],
            [this.tileSize , this.tileSize/2],
            [this.tileSize/2 , 0],
            [0 , this.tileSize/2],
        ];
        let dx = directions[direction][0];
        let dz = directions[direction][1];

        let wall = new Wall(tile_x*this.tileSize + dx,
                            tile_y*this.heightLevels,
                            tile_z*this.tileSize + dz, 
                            this.tileSize,this.heightLevels,direction*0.5);

        this.addToWorld(wall, tile_x,tile_y,tile_z);

        return wall;
        
    }

    /**
     * Add a door to the world!
     * @param {Number} tile_x the x tile value in this world to set this object
     * @param {Number} tile_y the y tile value in this world to set this object
     * @param {Number} tile_z the z tile value in this world to set this object
     * @param {Number} direction the direction of the door to be set: 0=bottom,1=right,2=top,3=left (contact Marco for more information)
     * @returns the object created
     */
     addDoor(tile_x,tile_y,tile_z, direction=0){ // 0=bottom,1=right,2=top,3=left
        [tile_x,tile_y,tile_z] = [parseInt(tile_x),parseInt(tile_y),parseInt(tile_z)];
        let directions = [
            [this.tileSize/2 , this.tileSize],
            [this.tileSize , this.tileSize/2],
            [this.tileSize/2 , 0],
            [0 , this.tileSize/2],
        ];
        let dx = directions[direction][0];
        let dz = directions[direction][1];

        let door = new Door(tile_x*this.tileSize + dx,
                            tile_y*this.heightLevels,
                            tile_z*this.tileSize + dz, 
                            this.tileSize,this.heightLevels,direction*0.5);

        this.addToWorld(door, tile_x,tile_y,tile_z);

        return door;
        
    }

    /**
     * Add a floor (or ceiling) to the world!
     * @param {Number} tile_x the x tile value in this world to set this object
     * @param {Number} tile_y the y tile value in this world to set this object
     * @param {Number} tile_z the z tile value in this world to set this object
     * @returns the object created
     * 
     * tip: if tile_y+1 -> it can be used as ceiling!!
     */
    addFloor(tile_x,tile_y,tile_z){
        [tile_x,tile_y,tile_z] = [parseInt(tile_x),parseInt(tile_y),parseInt(tile_z)];

        let floor = new Floor(  tile_x*this.tileSize + this.tileSize/2,
                                tile_y*this.heightLevels,
                                tile_z*this.tileSize + this.tileSize/2,
                                this.tileSize,this.tileSize);

        this.addToWorld(floor, tile_x,tile_y,tile_z);

        return floor;
        
    }

    /**
     * Add a light in the floor to the world!
     * @param {Number} tile_x the x tile value in this world to set this object
     * @param {Number} tile_y the y tile value in this world to set this object
     * @param {Number} tile_z the z tile value in this world to set this object
     * @param {Number} rotationRadians the rotation of the light in radians
     * @returns the object created
     */
     addFloorLight(tile_x,tile_y,tile_z, rotationRadians = 0){
        [tile_x,tile_y,tile_z] = [parseInt(tile_x),parseInt(tile_y),parseInt(tile_z)];

        let floorLight = new FloorLight(tile_x*this.tileSize + this.tileSize/2,
                                        tile_y*this.heightLevels,
                                        tile_z*this.tileSize + this.tileSize/2,
                                        rotationRadians);

        this.addToWorld(floorLight, tile_x,tile_y,tile_z);

        return floorLight;
        
    }

    /**
     * Add a gas cylinder to the world!
     * @param {Number} tile_x the x tile value in this world to set this object
     * @param {Number} tile_y the y tile value in this world to set this object
     * @param {Number} tile_z the z tile value in this world to set this object
     * @param {Number} rotationRadians the rotation of the cylinder in radians
     * @returns the object created
     */
     addGasCylinder(tile_x,tile_y,tile_z, rotationRadians = 0){
        [tile_x,tile_y,tile_z] = [parseInt(tile_x),parseInt(tile_y),parseInt(tile_z)];

        let gasCylinder = new GasCylinder(  tile_x*this.tileSize + this.tileSize/2,
                                            tile_y*this.heightLevels,
                                            tile_z*this.tileSize + this.tileSize/2,
                                            rotationRadians);

        this.addToWorld(gasCylinder, tile_x,tile_y,tile_z);

        return gasCylinder;
        
    }

    /**
     * Add a light in the ceiling to the world!
     * @param {Number} tile_x the x tile value in this world to set this object
     * @param {Number} tile_y the y tile value in this world to set this object (relative to the floor!!)
     * @param {Number} tile_z the z tile value in this world to set this object
     * @param {Number} direction the rotation of the light: 0 = 0 or 1 = Math.PI/2
     * @returns the object created
     */
     addTopLight(tile_x,tile_y,tile_z, direction = 0){
        [tile_x,tile_y,tile_z] = [parseInt(tile_x),parseInt(tile_y),parseInt(tile_z)];

        let topLight = new TopLight(tile_x*this.tileSize + this.tileSize/2,
                                    (tile_y+1)*this.heightLevels,
                                    tile_z*this.tileSize + this.tileSize/2,
                                    direction*0.5*Math.PI);

        this.addToWorld(topLight, tile_x,tile_y,tile_z);

        return topLight;
        
    }

    /**
     * Get the tile position in the world of a tile object!
     * @param {THREE.Object3D} obj a THREE.Object3D instance
     * @returns a dictionary containing the x,y,z tile coordinate and the index number
     */
    getObjectTilePosition(obj){
        let position = obj.position || obj.group.position;
        
        let t = {
            x: this._getTilePosXZ(position.x),
            z: this._getTilePosXZ(position.z),
            y: this._getTilePosY(position.y),
        };
        console.log(position,t)

        if(this.tiles[t.y] && this.tiles[t.y][t.x] && this.tiles[t.y][t.x][t.z]){
            for(let n in this.tiles[t.y][t.x][t.z]){
                if(this.tiles[t.y][t.x][t.z][n] === obj){
                    t.n = n;
                    return t;
                }
            }
        }
        
        // not found? probably is a door or a wall, check nearby
        let rotations = obj.rotation || obj.group.rotation;
        let rotation = rotations.y;

        let direction = rotation*(2/Math.PI);
        let adjust = [
            [0,-1],
            [-1,0],
            [0,1],
            [0,-1],
        ];
        
        let res = adjust[direction];
        if(this.tiles[t.y] && this.tiles[t.y][t.x+res[0]] && this.tiles[t.y][t.x+res[0]][t.z+res[1]])
        for(let n in this.tiles[t.y][t.x+res[0]][t.z+res[1]]){
            if(this.tiles[t.y][t.x+res[0]][t.z+res[1]][n] === obj){
                t.n = n;
                return t;
            }
        }

        // // not found? probably is a door or a wall, check nearby
        // if(this.tiles[t.y] && this.tiles[t.y][t.x-1] && this.tiles[t.y][t.x-1][t.z])
        // for(let n in this.tiles[t.y][t.x-1][t.z]){
        //     if(this.tiles[t.y][t.x-1][t.z][n] === obj){
        //         t.n = n;
        //         return t;
        //     }
        // }
        // if(this.tiles[t.y] && this.tiles[t.y][t.x+1] && this.tiles[t.y][t.x+1][t.z])
        // for(let n in this.tiles[t.y][t.x+1][t.z]){
        //     if(this.tiles[t.y][t.x+1][t.z][n] === obj){
        //         t.n = n;
        //         return t;
        //     }
        // }
        // if(this.tiles[t.y] && this.tiles[t.y][t.x] && this.tiles[t.y][t.x][t.z-1])
        // for(let n in this.tiles[t.y][t.x][t.z-1]){
        //     if(this.tiles[t.y][t.x][t.z-1][n] === obj){
        //         t.n = n;
        //         return t;
        //     }
        // }
        // if(this.tiles[t.y] && this.tiles[t.y][t.x] && this.tiles[t.y][t.x][t.z+1])
        // for(let n in this.tiles[t.y][t.x][t.z+1]){
        //     if(this.tiles[t.y][t.x][t.z+1][n] === obj){
        //         t.n = n;
        //         return t;
        //     }
        // }

        throw Error("The tile object passed is not found:");
    }

    /**
     * Animate the world and collision detection
     * @param {Number} delta The delta time
     */
    step(delta = 0){
        this.animateTiles(delta);
        this.animateObjects(delta);
        this.checkCollision();
    }

    /**
     * Animate the world!
     * @param {Number} delta The delta time
     */
    animateTiles(delta = 0){
        for(let i in this.animatedTiles)
        for(let j in this.animatedTiles[i])
        for(let k in this.animatedTiles[i][j])
        for(let n of this.animatedTiles[i][j][k]){
            this.tiles[i][j][k][n].step(delta);
        }
    }

    /** TODO: edit player, from update() to step()
     * Animate the the moving objects!
     * @param {Number} delta The delta time
     */
     animateObjects(delta = 0){
        for(let o of this.movingObjects){
            if(o.step) o.step(delta);
        }
    }

    /**
     * Checks collision between the moving objects (not in the tiles world) and the tiles in the world
     */
    checkCollision(){

        for(let objProperties of this.movingObjects){
            let obj = objProperties.obj;
            let radius = objProperties.radius;

            let objPos = {
                x: this._getTilePosXZ(obj.position.x),
                z: this._getTilePosXZ(obj.position.z),
                y: this._getTilePosY(obj.position.y),
            };

            if(this.tiles[objPos.y]){
                for(let i=-1; i<2; i++){
                    for(let j=-1; j<2; j++){
                        // if(i==0 && j==0) continue;
                        if(!this.tiles[objPos.y][objPos.x + i] || !this.tiles[objPos.y][objPos.x + i][objPos.z + j]) continue;
                        let objs = this.tiles[objPos.y][objPos.x + i][objPos.z + j];
                        for(let o of objs){

                            let tilePos = {
                                x: objPos.x + i,
                                z: objPos.z + j,
                                y: objPos.y,
                            };

                            this._parseObject(o, obj, objPos, tilePos, radius);
                        }

                    }
                }
            }


        }


    }

    _parseObject(tileClass, objClass, objPos, tilePos, radius){
        if(!tileClass.constructor || !tileClass.constructor.name) throw Error("tile object must be a class with constructor!");
        let type = tileClass.constructor.name;
        switch(type){
            default:
                return;

            case "Wall":
                this._computeWallCollision(tileClass, objClass, objPos, tilePos, radius);
                return;

            case "Door":
                if(!tileClass.isOpen)
                    this._computeWallCollision(tileClass.group, objClass, objPos, tilePos, radius);
                return;

            case "FloorLight":
                this._computeFloorLightCollision(tileClass, objClass, objPos, tilePos, radius);
                return;

            case "GasCylinder":
                this._computeGasCylinderCollision(tileClass, objClass, objPos, tilePos, radius);
                return;
        }
    }

    _computeGasCylinderCollision(tileClass, objClass, objPos, tilePos, radius){
        let cylRadius = this._fixZeroPrecision(tileClass.size.x);
        let totalDistance = cylRadius + radius;

        let distance = objClass.position.distanceTo(tileClass.position);

        if(distance < totalDistance){
            let dx = objClass.position.x - tileClass.position.x;
            let dz = objClass.position.z - tileClass.position.z;
            
            let a = Math.atan2(dz,dx);
            
            let add_x = Math.cos(a);
            let add_z = Math.sin(a);

            objClass.position.x = tileClass.position.x + totalDistance*add_x;
            objClass.position.z = tileClass.position.z + totalDistance*add_z;
            
        }
    }

    _computeFloorLightCollision(tileClass, objClass, objPos, tilePos, radius){
        let lightRadius = this._fixZeroPrecision(tileClass.size.x / 2);
        let totalDistance = lightRadius + radius;

        let distance = objClass.position.distanceTo(tileClass.group.position);
        if(distance < totalDistance){
            let dx = objClass.position.x - tileClass.group.position.x;
            let dz = objClass.position.z - tileClass.group.position.z;
            
            let a = Math.atan2(dz,dx);
            
            let add_x = Math.cos(a);
            let add_z = Math.sin(a);

            objClass.position.x = tileClass.group.position.x + totalDistance*add_x;
            objClass.position.z = tileClass.group.position.z + totalDistance*add_z;
            
        }
    }

    _computeWallCollision(tileClass, objClass, objPos, tilePos, radius){
        let relativePos = {
            x: tilePos.x - objPos.x,
            z: tilePos.z - objPos.z,
            y: tilePos.y - objPos.y,
        };
        let direction = (tileClass.rotation.y/Math.PI)*2;
        
        if(relativePos.x == 0 && relativePos.z == 0){

            if(direction == 0){ // bottom, we are top
                let dist = Math.abs( (tilePos.z+1)*this.tileSize - objClass.position.z );
                if(dist < radius){
                    objClass.position.z = ((tilePos.z+1)*this.tileSize) - radius;
                }
            }
            else if(direction == 2){ // top, we are bottom
                let dist = Math.abs( (tilePos.z)*this.tileSize - objClass.position.z );
                if(dist < radius){
                    objClass.position.z = ((tilePos.z)*this.tileSize) + radius;
                }
            }
            else if(direction == 1){ // right, we are left
                let dist = Math.abs( (tilePos.x + 1)*this.tileSize - objClass.position.x );
                if(dist < radius){
                    objClass.position.x = ((tilePos.x + 1)*this.tileSize) - radius;
                }
            }
            else if(direction == 3){ // left, we are right
                let dist = Math.abs( (tilePos.x)*this.tileSize - objClass.position.x );
                if(dist < radius){
                    objClass.position.x = ((tilePos.x)*this.tileSize) + radius;
                }
            }

        }
        else if(direction == 3 && relativePos.x == 1 && relativePos.z == 0){
            let dist = Math.abs( (tilePos.x)*this.tileSize - objClass.position.x );
            if(dist < radius){
                objClass.position.x = ((tilePos.x)*this.tileSize) - radius;
            }
        }
        else if(direction == 1 && relativePos.x == -1 && relativePos.z == 0){
            let dist = Math.abs( (tilePos.x+1)*this.tileSize - objClass.position.x );
            if(dist < radius){
                objClass.position.x = ((tilePos.x+1)*this.tileSize) + radius;
            }
        }
        else if(direction == 0 && relativePos.x == 0 && relativePos.z == -1){
            let dist = Math.abs( (tilePos.z+1)*this.tileSize - objClass.position.z );
            if(dist < radius){
                objClass.position.z = ((tilePos.z+1)*this.tileSize) + radius;
            }
        }
        else if(direction == 2 && relativePos.x == 0 && relativePos.z == 1){
            let dist = Math.abs( (tilePos.z)*this.tileSize - objClass.position.z );
            if(dist < radius){
                objClass.position.z = ((tilePos.z)*this.tileSize) - radius;
            }
        }
        

    }


}

export default PhysicsWorld;