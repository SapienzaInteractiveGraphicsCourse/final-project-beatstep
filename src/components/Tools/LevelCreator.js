import { THREE, scene, clock, renderer, camera } from '../setup/ThreeSetup';
// Physics
import { world } from '../physics/PhysicsWorld';
// Player
import Player from '../player/Player';
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
import ParticleSystem from '../environment/ParticleSystem';

// Particle Test
import smoke from '../../asset/textures/smoke.png';
import { DefaultGeneralLoadingManager } from './GeneralLoadingManager';
import ControlPanel from '../environment/ControlPanel';
import RobotDebug from '../debug/RobotDebug';
const loader = DefaultGeneralLoadingManager.getHandler("texture");
const smokeImg = loader.load(smoke);


class LevelCreator {
    constructor(){
        this.objectsToUpdate = [];
        this.player = null;
    }

    clearLevel(){
        scene.remove.apply(scene, scene.children);
        world.clearWorld();
        this.objectsToUpdate = [];
        this.player.controls.detach();
        this.player = null;
    }

    addFogExp2(color = 0xFFFFFF, density = 0.02){
        scene.fog = new THREE.FogExp2(color, density);
    }

    addPlayer(x,y,z, height){
        let player = new Player(camera, [x, y, z], height, renderer.domElement);
        //player.controls.shouldLock = false;
        scene.add(player);
        world.addDynamicObject(player);

        this.objectsToUpdate.push(player);
        this.player = player;
        window.getPlayerPos = ()=> this.player.position;
        window.player = this.player;
    }

    addRobot(x,y,z, rotationRadians = 0){
        let robot = new Robot(this.player);
        robot.setPosition(x,y,z);
        robot.setRotation(rotationRadians);
        scene.add(robot.group);
        world.addDynamicObject(robot.group);

        this.objectsToUpdate.push(robot);
    }

    addRobotDebug(x,y,z, rotationRadians = 0){
        let robot = new RobotDebug();
        robot.setPosition(x,y,z);
        robot.setRotation(rotationRadians);
        scene.add(robot.group);

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
        world.addStaticObject(door.group,null,false);
        world.addStaticObject(door.group.getObjectByName("door_l"),door.group.getObjectByName("door_l").collisionGeometry);
        world.addStaticObject(door.group.getObjectByName("door_r"),door.group.getObjectByName("door_r").collisionGeometry);

        this.objectsToUpdate.push(door);
    }

    addControlPanel(x,y,z, height, rotationRadians){
        let cp = new ControlPanel(x,y,z, height, rotationRadians);
        scene.add(cp.group);
        world.addStaticObject(cp.group,cp.group.geometry);
        this.objectsToUpdate.push(cp);
    }

    addTopLight(x,y,z, rotationRadians){
        let topLight = new TopLight(x,y,z, rotationRadians);
        topLight.addToScene(scene);
    }

    addFloorLight(x,y,z, rotationRadians){
        let floorLight = new FloorLight(x,y,z, rotationRadians);
        floorLight.addToScene(scene);
        world.addStaticObject(floorLight.group);

        this.objectsToUpdate.push(floorLight);
    }

    addWall(x,y,z, width,height, rotationRadians, type=0){
        let wall = new Wall(x,y,z, width,height, rotationRadians, type);
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
        world.addStaticObject(cylinder.surroundObject,null,false);
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

    addParticleEffect(x,y,z, duration,radius,particleSize,generalLife,generalVelocity,numberOfParticles,particleImage){
        const ps = new ParticleSystem(scene,camera,duration,particleImage,(()=>{
            // this.objectsToUpdate = this.objectsToUpdate.filter(item => item !== ps);
        }).bind(this));
        ps.setGeneralPosition(x,y,z);
        ps.setGeneralRadius(...radius);
        ps.setParticleSize(particleSize);
        ps.setGeneralLife(generalLife);
        ps.setGeneralVelocity(...generalVelocity);
        ps.setNumberOfParticles(numberOfParticles);
        ps.restart();
        this.objectsToUpdate.push(ps);

        // setTimeout(()=>ps.restart(),(duration+2)*1000)
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

        this.addPlayer(0,0,25, 3);
        // this.addPlayer(31,0,46, 3);

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

        this.addTopLight(0,wallHeight,20);

        this.addGasCylinder(-5,0,12, -Math.PI*0.8);

        /* Room 2 */

        let _upFloorPos_1 = [-10,0,-72]
        this.addWall(-10,0,-60, 60,wallHeight, Math.PI/2);

        this.addStaircase(_upFloorPos_1[0]+6,_upFloorPos_1[1],_upFloorPos_1[2], 12,6,12, 10, 2);
        this.addFloor(_upFloorPos_1[0]+6,_upFloorPos_1[1]+6,_upFloorPos_1[2]-6-6, 12,12);
        this.addStaircase(_upFloorPos_1[0]+6+12,_upFloorPos_1[1],_upFloorPos_1[2]-6-6, 12,6,12, 10, 3);

        this.addPickupAmmo(_upFloorPos_1[0]+6+2,_upFloorPos_1[1]+6,_upFloorPos_1[2]-6-6+2);
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

        this.addFloorLight(40,0,-86, 0);
            
        this.addStaircase(60-6,0,-25, 12,6,12, 10, 2);
        this.addFloor(60-6,6,-25-12, 12,12);
        this.addWall(60-6-6,0,-25-12, 12,6, Math.PI/2);
        this.addWall(60-6,0,-25-12-6, 12,6, 0);

        this.addPickupHealth(60-4,6,-25-10);

        this.addRobot(60-6,6,-25-12, 0);

        this.addRobot(0,0,-55, -Math.PI/2);

        this.addRobot(50,0,-70, 0);
            
        // in front of the door
        this.addRobot(35,0,10, -Math.PI/2);
        this.addRobot(50,0,10, -Math.PI*3/4);

        this.addGasCylinder(16,0,-38, Math.PI*0.8);
        this.addGasCylinder(32,0,-65, Math.PI*0.3);
        this.addGasCylinder(32,0,-10, Math.PI*0.3);

        /* Room 3 */
        this.addWall(25,0,50, 40,wallHeight, Math.PI/2);
        this.addWall(62.5,0,70, 75,wallHeight, 0);
        this.addWall(80,0,30, 40,wallHeight, 0);
        this.addWall(100,0,50, 40,wallHeight-5, Math.PI/2);

        this.addControlPanel(90,0,50, 4, 0);
        this.addTopLight(90,wallHeight,50, -Math.PI/2);
        this.addTopLight(40,wallHeight,50, -Math.PI/2);

        this.addGasCylinder(50,0,60, -Math.PI*0.6);
        this.addGasCylinder(60,0,40, -Math.PI*0.6);

        this.addFloorLight(29,0,65, Math.PI*3/4);

        this.addRobot(82,0,50, 0);
        this.addRobot(40,0,56, 0);
        this.addRobot(55,0,50, 0);
    }

    createDojo(){
        let wallHeight = 12;
        let doorHeight = 5;

        this.addAmbientLight();
        this.addPointLight(0,40,0, 0xFFFFFF, 0.1);

        this.addRobotDebug(0,0,0, -Math.PI/2);
        this.addPlayer(0,0,10, 3);

        let dojoRadius = 16;
        let dojoParts = 8;
        let incrementAngle = 2*Math.PI/dojoParts;
        let wallSize = 16.58 * dojoRadius/20;
        for(let angle = 0; angle < 2*Math.PI; angle+=incrementAngle){
            let x = Math.sin(angle)*dojoRadius;
            let z = Math.cos(angle)*dojoRadius;
            this.addWall(x,0,z, wallSize,wallHeight, angle, 2);

            if(angle == incrementAngle || angle == incrementAngle*(dojoParts-1)){
                this.addFloorLight(x-2*Math.sign(x),0,z-2*Math.sign(z), angle + Math.PI);
            }
        }

        this.addPickupAmmo(4,0,-10);
        this.addPickupHealth(0,0,-10);
        this.addPickupShield(-4,0,-10);

        this.addFloor(0,0,0, 80,80);
    }

    createTestLevel(){
        let wallHeight = 16;
        let doorHeight = 5;

        this.addAmbientLight();
        this.addPointLight(0,40,0, 0xFFFFFF, 0.1);

        this.addPlayer(0,0,30, 3);

        this.addFloor(0,0,0, 200,200);
        this.addWall(-10,0,0, 60,wallHeight, Math.PI/2);

        this.addRobotDebug(0,0,-20, -Math.PI/2);

        this.addRobot(0,0,24, -Math.PI/2);

        this.addGasCylinder(5,0,5, Math.PI*0.8);

        // this.addParticleEffect(0,2,0, 4, [8,8,8], 8, 0.5, [0,10,0], smokeImg);
    }

}

export default LevelCreator;