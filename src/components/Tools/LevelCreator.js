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

    addFogExp2(color = 0xFFFFFF, density = 0.02){
        scene.fog = new THREE.FogExp2(color, density);
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

        this.objectsToUpdate.push(cylinder);
    }

    addAmbientLight(color = 0xFFFFFF, intensity = 0.2){
        const ambientLight = new THREE.AmbientLight(color, intensity);
        scene.add(ambientLight);
    }

    addStaircase(x,y,z, width,height,depth, steps,direction){
        let stair = new Staircase(  x,y,z,
                                    width,height,depth,
                                    steps,direction);
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
        // this.addFogExp2();

        this.addPlayer(35,0,-34, 3);

        this.addFloor(0,0,0, 200,200);
        this.addFloor(0,wallHeight,0, 200,200); // ceiling = floor on higher level

        /* Room 1 */

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
                     _wallAndDoorPos_1[2], doorHeight,wallHeight-doorHeight, 0);

        this.addFloorLight(7,0,-6,-Math.PI/4);
        this.addFloorLight(-7,0,-6,Math.PI/4);
        this.addTopLight(0,wallHeight,20);
        this.addTopLight(0,wallHeight,0);
        this.addTopLight(0,wallHeight,-20);

        this.addRobot(0,0,-20, -Math.PI/4);

        this.addGasCylinder(5,0,12, Math.PI*0.8);
        this.addGasCylinder(-5,0,12, -Math.PI*0.8);

        /* Room 2 */

        let _upFloorPos_1 = [-10,0,-72]
        this.addWall(-10,0,-60, 60,wallHeight, Math.PI/2);

        this.addStaircase(_upFloorPos_1[0]+6,_upFloorPos_1[1],_upFloorPos_1[2], 12,6,12, 10, 2);
        this.addFloor(_upFloorPos_1[0]+6,_upFloorPos_1[1]+6,_upFloorPos_1[2]-6-6, 12,12);
        this.addStaircase(_upFloorPos_1[0]+6+12,_upFloorPos_1[1],_upFloorPos_1[2]-6-6, 12,6,12, 10, 3);

        this.addPickupHealth(_upFloorPos_1[0]+6+2,_upFloorPos_1[1]+6,_upFloorPos_1[2]-6-6+2);
        this.addPickupShield(_upFloorPos_1[0]+6-2,_upFloorPos_1[1]+6,_upFloorPos_1[2]-6-6-2);

        this.addWall(-10+35,0,-90, 70,wallHeight, 0);

        this.addWall(60,0,-30, 120,wallHeight, Math.PI/2);

        let _wallAndDoorDim_2 = 50;
        let _wallAndDoorPos_2 = [35,0,30];
        let _wallDim_2 = (_wallAndDoorDim_2 - doorHeight)/2;
        this.addDoor(_wallAndDoorPos_2[0],
                     _wallAndDoorPos_2[1],
                     _wallAndDoorPos_2[2], doorHeight, 0);
        this.addWall(_wallAndDoorPos_2[0] - (_wallAndDoorDim_2 + doorHeight)/4,
                     _wallAndDoorPos_2[1],
                     _wallAndDoorPos_2[2], _wallDim_2,wallHeight, 0);
        this.addWall(_wallAndDoorPos_2[0] + (_wallAndDoorDim_2 + doorHeight)/4,
                     _wallAndDoorPos_2[1],
                     _wallAndDoorPos_2[2], _wallDim_2,wallHeight, 0);
        this.addWall(_wallAndDoorPos_2[0],
                     _wallAndDoorPos_2[1] + doorHeight,
                     _wallAndDoorPos_2[2], doorHeight,wallHeight-doorHeight, 0);

        this.addTopLight(0,wallHeight,-40);
        this.addTopLight(0,wallHeight,-80);

        this.addTopLight(_wallAndDoorPos_2[0],wallHeight,-80);
        this.addTopLight(_wallAndDoorPos_2[0],wallHeight,-40);
        this.addTopLight(_wallAndDoorPos_2[0],wallHeight,0);

        this.addFloorLight(_wallAndDoorPos_2[0]+22,0,-30, -Math.PI/4);

        this.addRobot(14,0,-60, -Math.PI/4);
        this.addRobot(50,0,-55, -Math.PI*3/4);
            
        this.addRobot(20,0,10, -Math.PI/4);
        this.addRobot(35,0,10, -Math.PI/2);
        this.addRobot(50,0,10, -Math.PI*3/4);

        this.addGasCylinder(16,0,-38, -Math.PI*0.2);
    }

    createTestLevel(){
        let wallHeight = 16;
        let doorHeight = 5;

        this.addAmbientLight();
        this.addPointLight(0,40,0, 0xFFFFFF, 0.1);

        this.addPlayer(0,0,30, 3);

        this.addFloor(0,0,0, 200,200);
        this.addWall(-10,0,0, 60,wallHeight, Math.PI/2);

        this.addRobot(0,0,-20,0);
    }

}

export default LevelCreator;