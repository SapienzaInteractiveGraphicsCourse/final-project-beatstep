import { THREE, scene, clock, renderer, camera } from '../setup/ThreeSetup';
// Physics
import { world } from '../physics/PhysicsWorld';
// Player
import Player from '../player/Player2';
// Enemies
import Robot from '../enemies/Robot';

// Scene elements
import Floor from '../environment/Floor';
import Door from '../environment/Door';
import TopLight from '../environment/TopLight';
import FloorLight from '../environment/FloorLight';
import Wall from '../environment/Wall';
import { PickupAmmo, PickupHealth, PickupShield } from '../environment/Pickup';
import GasCylinder from '../environment/GasCylinder';
import Staircase from '../environment/Staircase';


class LevelCreator {
    constructor(){
        this.objectsToUpdate = [];
        this.player = null;
    }

    clearLevel(){
        scene.remove.apply(scene, scene.children);
        world.staticObjects = [];
        world.dynamicObjects = [];
        this.objectsToUpdate = [];
        this.player = null;
    }

    addPlayer(x,y,z, height){
        let player = new Player(camera, [x, y, z], height, renderer.domElement);
        player.controls.shouldLock = true;
        scene.add(player);
        world.addDynamicObject(player);

        this.objectsToUpdate.push(player);
        this.player = player;
    }

    addRobot(x,y,z, rotationRadians = 0){
        let robot = new Robot(this.player);
        robot.setPosition(x,y,z);
        robot.setRotation(rotationRadians);
        scene.add(robot.group);
        world.addDynamicObject(robot.group);

        this.objectsToUpdate.push(robot);
    }

    addFloor(x,y,z, width,height){
        let floor = new Floor(x,y,z, width,height);
        scene.add(floor);
        world.addStaticObject(floor);
    }

    addDoor(x,y,z, height, rotationRadians){
        let door = new Door(x,y,z, height, rotationRadians);
        scene.add(door.group);
        world.addStaticObject(door.group);

        this.objectsToUpdate.push(door);
    }

    addTopLight(x,y,z){
        let topLight = new TopLight(x,y,z);
        topLight.addToScene(scene);
    }

    addFloorLight(x,y,z, rotationRadians){
        let floorLight = new FloorLight(x,y,z, rotationRadians);
        floorLight.addToScene(scene);
        world.addStaticObject(floorLight.group);

        this.objectsToUpdate.push(floorLight);
    }

    addWall(x,y,z, width,height, rotationRadians){
        let wall = new Wall(x,y,z, width,height, rotationRadians);
        scene.add(wall.obj);
        world.addStaticObject(wall.obj);
    }

    addPickupHealth(x,y,z){
        let pickup = new PickupHealth(x,y,z);
        scene.add(pickup);
        world.addStaticObject(pickup);

        this.objectsToUpdate.push(pickup);
    }

    addPickupShield(x,y,z){
        let pickup = new PickupShield(x,y,z);
        scene.add(pickup);
        world.addStaticObject(pickup);

        this.objectsToUpdate.push(pickup);
    }

    addPickupAmmo(x,y,z){
        let pickup = new PickupAmmo(x,y,z);
        scene.add(pickup);
        world.addStaticObject(pickup);

        this.objectsToUpdate.push(pickup);
    }

    addGasCylinder(x,y,z, rotationRadians){
        let cylinder = new GasCylinder(x,y,z, rotationRadians);
        scene.add(cylinder);
        world.addStaticObject(cylinder);

        this.objectsToUpdate.push(pickup);
    }

    addAmbientLight(color = 0xFFFFFF, intensity = 0.2){
        const ambientLight = new THREE.AmbientLight(color, intensity);
        scene.add(ambientLight);
    }

    addStaircase(x,y,z, width,height,depth, steps,direction){
        let stair = new Staircase(  10,0,-6,
                                    4,4,8,
                                    10,2);
        scene.add(stair);
        world.addStaticObject(stair,stair.collisionGeometry);
    }

    /** The sun of the game */
    addPointLight(x,y,z, color = 0xFFFFFF, intensity = 0.3){
        const pointLight = new THREE.PointLight(color, intensity);
        pointLight.position.set(x,y,z);
        pointLight.castShadow = true;
        pointLight.shadow.mapSize.set(4192,4192);
        pointLight.shadow.radius = 2;
        scene.add(pointLight);
    }

    /** Update game */
    step(delta){
        for(let o of this.objectsToUpdate){
            if(o.update) o.update(delta);
        }
        world.step(delta);
    }

    /** Level 1 */
    createLevel1(){
        let wallHeight = 16;
        let doorHeight = 5;

        this.addAmbientLight();
        this.addPointLight(0,40,0, 0xFFFFFF, 0.1);

        this.addPlayer(0,0,20, 2);

        this.addFloor(0,0,0, 200,200);
        this.addFloor(0,wallHeight,0, 200,200); // ceiling = floor on higher level

        this.addWall(-10,0,0, 60,wallHeight, Math.PI/2);
        this.addWall(10,0,0, 60,wallHeight, Math.PI/2);
        this.addWall(0,0,30, 20,wallHeight, 0);

        let _wallAndDoorDim_1 = 20;
        let _wallAndDoorPos_1 = [0,0,-30];
        let _wallDim_1 = (_wallAndDoorDim_1 - doorHeight)/2;
        this.addDoor(_wallAndDoorPos_1[0],
                     _wallAndDoorPos_1[1],
                     _wallAndDoorPos_1[2], doorHeight, 0);
        this.addWall(_wallAndDoorPos_1[0] - (_wallAndDoorDim_1 + doorHeight)/4,
                     _wallAndDoorPos_1[1],
                     _wallAndDoorPos_1[2], _wallDim_1,wallHeight, 0);
        this.addWall(_wallAndDoorPos_1[0] + (_wallAndDoorDim_1 + doorHeight)/4,
                     _wallAndDoorPos_1[1],
                     _wallAndDoorPos_1[2], _wallDim_1,wallHeight, 0);
        this.addWall(_wallAndDoorPos_1[0],
                     _wallAndDoorPos_1[1] + doorHeight,
                     _wallAndDoorPos_1[2], doorHeight,wallHeight, 0);

        this.addFloorLight(7,0,-6,-Math.PI/4);
        this.addFloorLight(-7,0,-6,Math.PI/4);
        this.addTopLight(0,wallHeight,20);
        this.addTopLight(0,wallHeight,0);
        this.addTopLight(0,wallHeight,-20);

        this.addRobot(0,0,-20, 0);

    }


}

export default LevelCreator;