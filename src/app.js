import { THREE, scene, clock, renderer, camera } from './components/setup/ThreeSetup';

// Physics
import { PhysicsBody, PhysicsMaterial, PhysicsShapeThree, world } from './components/physics/PhysicsEngine';

// Tools
import { DefaultGeneralLoadingManager } from './components/Tools/GeneralLoadingManager';

// Player
import Player from './components/player/Player';

// Enemies
import Robot from './components/enemies/Robot';

// Walls
import Wall from './components/environment/Wall';
import wall1 from './asset/textures/wall1.png';

// Pickups
import { pickupHealthPool, pickupAmmoPool, pickupShieldPool } from './components/environment/Pickup';

// Gas Cylinder
import gasCylinderPool from './components/environment/GasCylinder';

// Particle System
import ParticleSystem from './components/environment/ParticleSystem';

// Environment
import Floor from './components/environment/Floor';
import TopLight from './components/environment/TopLight';
import FloorLight from './components/environment/FloorLight';

import './style.css';

import { genFloor } from './components/TempFloor';
import Staircase from './components/environment/Staircase';
import Door from './components/environment/Door';
import { HalfCubeGeometry } from './components/Tools/CustomGeometries';

// const scene = new THREE.Scene();
// const clock = new Clock();

// const renderer = new THREE.WebGLRenderer({antialias: true});
// renderer.shadowMap.enabled = true;
// renderer.shadowMap.type = THREE.PCFSoftShadowMap;
// renderer.setSize(window.innerWidth, window.innerHeight);
function init(){
    // Player and camera setup
    let player = new Player(camera, renderer.domElement, [0, 2, 5], [0, 2, 0]);
    scene.add(player);

    // Floor(s)
    // scene.add(genFloor(40));
    let floor1 = new Floor(0,0,0, 80,80);
    let ceiling1 = new Floor(28,10,0, 8,8);
    scene.add(floor1);
    scene.add(ceiling1);

    // Door
    let door = new Door();
    door.setPosition(10,0,0);
    scene.add(door.group);

    // Custom geometry test
    const cust_mat = new THREE.MeshNormalMaterial();
    let cust_geometry = new HalfCubeGeometry(1,2,4);
    const cust_mesh = new THREE.Mesh(cust_geometry, cust_mat);
    cust_mesh.position.set(0,2,0)
    scene.add(cust_mesh);

    // top light
    let topLight = new TopLight(28,10,0);
    topLight.addToScene(scene);

    // floor light
    let floorLight = new FloorLight(30,0,0, -Math.PI/2);
    floorLight.addToScene(scene);

    // Lighting
    const color = 0xFFFFFF;
    const ambientLight = new THREE.AmbientLight(color, 0.2);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(color, 0.5);
    pointLight.position.set(0,30,0);
    pointLight.castShadow = true;
    pointLight.shadow.mapSize.set(4192,4192);
    pointLight.shadow.radius = 2;
    scene.add(pointLight);

    // //TODO: DEBUG, just to see the point light
    // const helper = new THREE.CameraHelper( pointLight.shadow.camera );
    // scene.add( helper );

    // Adding Particle test
    let particles = new ParticleSystem(scene,camera);
    particles.setPosition(30,5,20);
    particles.setLife(0.2);

    // Creating cube properties
    let cube_geometry = new THREE.BoxGeometry(1,1,1);
    let cube_material = new THREE.MeshToonMaterial({ color: 0x00ff00 });
    // Creating cube
    let cube = new THREE.Mesh(cube_geometry, cube_material);
    cube.castShadow = true;
    cube.position.set(0,20,0);
    // Creatind physics cube
    let cubeBody = new PhysicsBody(0,new PhysicsShapeThree(cube_geometry),new PhysicsMaterial(),() => {

    });
    cubeBody.mesh = cube;
    cubeBody.position.set(0,20,0);
    // Adding cube to the scene and world
    world.addBody(cubeBody);
    scene.add(cube);
    window.cube = cube;
    window.cubeBody = cubeBody;


    // Adding walls to scene
    let wall_1 = new Wall(0,0,-20, 40,20);
    let wall_2 = new Wall(-20,0,0, 40,20,0.5);
    scene.add(wall_1.obj);
    scene.add(wall_2.obj);

    // // Adding pickups to scene
    // let healthPickup = new Pickup(pickup_health,-6,0.5,-6,()=>{});
    // let shieldPickup = new Pickup(pickup_shield,-4.5,0.5,-6,()=>{});
    // let ammoPickup = new Pickup(pickup_ammo,-3,0.5,-6,()=>{});
    // scene.add(healthPickup.obj);
    // scene.add(shieldPickup.obj);
    // scene.add(ammoPickup.obj);
    let pickupHealth1 = pickupHealthPool.getFreeObject();
    pickupHealth1.setPosition(-6,0,-6);
    scene.add(pickupHealth1);

    let pickupShield1 = pickupShieldPool.getFreeObject();
    pickupShield1.setPosition(-4.5,0,-6);
    scene.add(pickupShield1);

    let pickupAmmo1 = pickupAmmoPool.getFreeObject();
    pickupAmmo1.setPosition(-3,0,-6);
    scene.add(pickupAmmo1);

    // // Adding gas cylinder to scene
    // let gasCylinder = new GasCylinder(gas_top,gas_top,gas_side,6,0,6,0.5,()=>{});
    // scene.add(gasCylinder.obj);
    let cylinderi = gasCylinderPool.getFreeObject();
    cylinderi.setPosition(2,0,-6);
    cylinderi.setRotation(Math.PI);
    scene.add(cylinderi);

    // Adding staircase to scene:
    let stair = new Staircase(  10,0,-6,
                                4,2,8,
                                10,2);
    let stair2 = new Staircase( 10,2,-6-8,
                                4,2,8,
                                10,2);
    scene.add(stair);
    scene.add(stair2);

    // Adding enemies
    let robots = [];
    let nr = 1;
    for(let i = 0; i<nr; i++){
        let robot = new Robot();
        robot.setPosition(-12,0,0+i*3);
        // robot.setRotation(0);
        scene.add(robot.group);
        robots.push(robot);
    }
    

    window.player = player;
    window.exp = new THREE.Vector3(0,0,0);
    window.sh = () => {
        exp.copy(player.getWorldDirection()).multiplyScalar(-1000);
        exp.setY(Math.abs(exp.y));
        //player.body.linearVelocity.copy(exp);
        player.body.applyForce(exp.multiplyScalar(100));
    }

    window.addEventListener("keyup",(e) =>{
        if(e.key == "e") sh();
    })

    animate = function () {
        renderer.render(scene, camera);
        requestAnimationFrame(animate);
        let delta = clock.getDelta();
        delta = 0.02;
    
        player.update(delta);
        
        // Pickup
        pickupHealthPool.update(delta);
        pickupAmmoPool.update(delta);
        pickupShieldPool.update(delta);
    
        // Cylinder
        gasCylinderPool.update(delta);
    
        // Particles
        particles.step(delta);
    
        world.step(delta);
    
        // Detect collisions
        stair.detectCollision(1,true);
        stair2.detectCollision(1,true);
        cylinderi.detectCollision(1,false);
        player.detectCollision(1.5,true);
        pickupHealth1.detectCollision(1,false);
        pickupShield1.detectCollision(1,false);
        pickupAmmo1.detectCollision(1,false);

        // Enemies
        for(let robot of robots){
            robot.step(delta,player);
        }
        // Doors
        door.step(delta);
    };

}

let animate;

DefaultGeneralLoadingManager.addOnLoad(() => {
    console.log("Game loaded, starting rendering loop");
    init();
    document.body.removeChild(document.querySelector(".splash"));
    document.body.appendChild(renderer.domElement);
    player.hud.show();
    animate();
});



