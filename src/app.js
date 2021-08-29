import { THREE, scene, clock, renderer, camera } from './components/setup/ThreeSetup';
import './style.css';

// Physics
// import { PhysicsBody, PhysicsMaterial, PhysicsShapeThree, world } from './components/physics/PhysicsEngine';
import { world } from './components/physics/PhysicsWorld';

// Tools
import { DefaultGeneralLoadingManager } from './components/Tools/GeneralLoadingManager';
import LevelCreator from './components/Tools/LevelCreator';
let levels = new LevelCreator();

function init(){
    levels.createLevel1();
    // Player and camera setup
    // let player = new Player(camera, renderer.domElement, [0, 2, 10], [0, 2, 0]);
    // let player = new Player(camera, [0, 0, 10], 2, renderer.domElement);
    // player.controls.shouldLock = true;
    // scene.add(player);
    // world.addDynamicObject(player);

    // // Floor(s)
    // // scene.add(genFloor(40));
    // // let floor1 = new Floor(0,0,0, 80,80);
    // // scene.add(floor1);
    // let ceiling1 = new Floor(28,10,0, 8,8);
    // scene.add(ceiling1);

    // // Physical floor
    // let floor = new Floor(0,0,0, 80,80);
    // scene.add(floor);
    // world.addStaticObject(floor);

    // // Door
    // let door = new Door(10,0,0);
    // scene.add(door.group);
    // world.addStaticObject(door.group);

    // // top light
    // let topLight = new TopLight(28,10,0);
    // topLight.addToScene(scene);

    // // floor light
    // let floorLight = new FloorLight(30,0,0, -Math.PI/2);
    // floorLight.addToScene(scene);
    // world.addStaticObject(floorLight.group);
    

    // // Lighting
    // const color = 0xFFFFFF;
    // const ambientLight = new THREE.AmbientLight(color, 0.2);
    // scene.add(ambientLight);

    // const pointLight = new THREE.PointLight(color, 0.5);
    // pointLight.position.set(0,30,0);
    // pointLight.castShadow = true;
    // pointLight.shadow.mapSize.set(4192,4192);
    // pointLight.shadow.radius = 2;
    // scene.add(pointLight);

    // // Adding walls to scene
    // let wall_1 = new Wall(0,0,-20, 40,20);
    // let wall_2 = new Wall(-20,0,0, 40,20,Math.PI/2);
    // scene.add(wall_1.obj);
    // scene.add(wall_2.obj);
    // world.addStaticObject(wall_1.obj);
    // world.addStaticObject(wall_2.obj);

    // // // Adding pickups to scene
    // // let healthPickup = new Pickup(pickup_health,-6,0.5,-6,()=>{});
    // // let shieldPickup = new Pickup(pickup_shield,-4.5,0.5,-6,()=>{});
    // // let ammoPickup = new Pickup(pickup_ammo,-3,0.5,-6,()=>{});
    // // scene.add(healthPickup.obj);
    // // scene.add(shieldPickup.obj);
    // // scene.add(ammoPickup.obj);
    // let pickupHealth1 = new PickupHealth(-6,0,-6)
    // // pickupHealth1.setPosition(-6,0,-6);
    // scene.add(pickupHealth1);
    // world.addStaticObject(pickupHealth1);

    // // let pickupShield1 = pickupShieldPool.getFreeObject();
    // // pickupShield1.setPosition(-4.5,0,-6);
    // // scene.add(pickupShield1);
    // // world.addStaticObject(pickupShield1);

    // // let pickupAmmo1 = pickupAmmoPool.getFreeObject();
    // // pickupAmmo1.setPosition(-3,0,-6);
    // // scene.add(pickupAmmo1);
    // // world.addStaticObject(pickupAmmo1);

    // // // Adding gas cylinder to scene
    // // let gasCylinder = new GasCylinder(gas_top,gas_top,gas_side,6,0,6,0.5,()=>{});
    // // scene.add(gasCylinder.obj);
    // let cylinder = new GasCylinder(2,0,-6, Math.PI);
    // scene.add(cylinder);
    // world.addStaticObject(cylinder);

    // // Adding staircase to scene:
    // let stair = new Staircase(  10,0,-6,
    //                             4,4,8,
    //                             10,2);
    // let stair2 = new Staircase( 10,4,-6-8,
    //                             4,4,8,
    //                             10,2);
    // scene.add(stair);
    // world.addStaticObject(stair,stair.collisionGeometry);
    // scene.add(stair2);
    // world.addStaticObject(stair2,stair2.collisionGeometry);

    // // Adding enemies
    // let robots = [];
    // let nr = 1;
    // for(let i = 0; i<nr; i++){
    //     let robot = new Robot();
    //     robot.setPosition(-12,4,0+i*3);
    //     // robot.setRotation(0);
    //     scene.add(robot.group);
    //     world.addDynamicObject(robot.group);
    //     robots.push(robot);
    // }
    

    // window.player = player;
    // window.Vector3 = THREE.Vector3;

    animate = function () {
        renderer.render(scene, camera);
        requestAnimationFrame(animate);
        
        let delta = clock.getDelta();
        // delta = 0.02;
        levels.step(delta);

        // floorLight.update(delta);

        
    
        // player.update(delta);
        
        // // Pickup
        // pickupHealth1.update(delta);
        // // pickupAmmoPool.update(delta);
        // // pickupShieldPool.update(delta);
    
        // // Cylinder
        // cylinder.update(delta);
    
        // Detect collisions
        // stair.detectCollision(1,true);
        // stair2.detectCollision(1,true);
        // cylinder.detectCollision(1,false);
        // player.detectCollision(1.5,true);
        // pickupHealth1.detectCollision(1,false);
        // pickupShield1.detectCollision(1,false);
        // pickupAmmo1.detectCollision(1,false);

        // Enemies
        // for(let robot of robots){
        //     robot.update(delta,player);
        // }
        // // Doors
        // door.update(delta);

        // world.step(delta);
    };

}

let animate;

DefaultGeneralLoadingManager.addOnLoad(() => {
    console.log("Game loaded, starting rendering loop");
    init();
    document.body.removeChild(document.querySelector(".splash"));
    document.body.appendChild(renderer.domElement);
    levels.player.hud.show();
    animate();
});



