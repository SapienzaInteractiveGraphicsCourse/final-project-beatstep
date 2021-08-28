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
    }

    clearLevel(){
        scene.remove.apply(scene, scene.children);
        world.staticObjects = [];
        world.dynamicObjects = [];
        this.objectsToUpdate = [];
    }

    addPlayer(x,y,z, height){
        let player = new Player(camera, [x, y, z], height, renderer.domElement);
        player.controls.shouldLock = true;
        scene.add(player);
        world.addDynamicObject(player);

        this.objectsToUpdate.push(player);
    }

    addRobot(x,y,z, rotationRadians = 0){
        let robot = new Robot();
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
    addPointLight(x,y,z, color = 0xFFFFFF, intensity = 0.5){
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


}