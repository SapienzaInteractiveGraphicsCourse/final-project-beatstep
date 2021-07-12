import { THREE, scene, clock, renderer, camera } from './components/setup/ThreeSetup';

// Tools
import { DefaultGeneralLoadingManager } from './components/Tools/GeneralLoadingManager';

// Player
import FPSCamera from './components/player/FPSCamera';
import Player from './components/player/Player';

// Walls
import Wall from './components/environment/Wall';
import wall1 from './asset/textures/wall1.png';

// Pickups
import { pickupHealthPool, pickupAmmoPool, pickupShieldPool } from './components/environment/Pickup';

// Gas Cylinder
import gasCylinderPool from './components/environment/GasCylinder';

// Particle System
import ParticleSystem from './components/environment/ParticleSystem';
let particles = new ParticleSystem(scene,camera);
particles.setPosition(5,5,5);
particles.setLife(0.2);

import './style.css';

import { genFloor } from './components/TempFloor';
import Staircase from './components/environment/Staircase';

// const scene = new THREE.Scene();
// const clock = new Clock();

// const renderer = new THREE.WebGLRenderer({antialias: true});
// renderer.shadowMap.enabled = true;
// renderer.shadowMap.type = THREE.PCFSoftShadowMap;
// renderer.setSize(window.innerWidth, window.innerHeight);

// Player and camera setup
let player = new Player(camera, renderer.domElement, [0, 2, 5], [0, 2, 0]);
scene.add(player);
window.player = player;


scene.add(genFloor(40));

// Lighting
const color = 0xFFFFFF;
const ambientLight = new THREE.AmbientLight(color, 0.2);
scene.add(ambientLight);

const pointLight = new THREE.PointLight(color);
pointLight.position.set(0,30,0);
pointLight.castShadow = true;
pointLight.shadow.mapSize.set(4192,4192);
pointLight.shadow.radius = 2;
scene.add(pointLight);

//TODO: DEBUG, just to see the point light
const helper = new THREE.CameraHelper( pointLight.shadow.camera );
scene.add( helper );

// Creating cube properties
let cube_geometry = new THREE.BoxGeometry(1,1,1);
let cube_material = new THREE.MeshToonMaterial({ color: 0x00ff00 });
// Creating cube
let cube = new THREE.Mesh(cube_geometry, cube_material);
cube.castShadow = true;
cube.position.set(0,20,0);
// Adding cube to the scene
scene.add(cube);


// Create a sphere
// var mass = 5, radius = 1.3;
// let sphereShape = new CANNON.Sphere(radius);
// let sphereBody = new CANNON.Body({ mass: mass });
// sphereBody.addShape(sphereShape);
// sphereBody.position.set(0,5,0);
// sphereBody.linearDamping = 0.9;
// world.add(sphereBody);

// Creating bullets (balls)
// let bullets = {
//     bodies: [],
//     meshes: []
// };
// // Bullet properties
// let bullet = {};
// bullet.shape = new CANNON.Sphere(0.2);
// bullet.geometry = new THREE.SphereGeometry(bullet.shape.radius, 32, 32);
// bullet.material = new THREE.MeshToonMaterial({ color: 0x00ff00 });
// bullet.velocity = 15;

// TODO: toremove, to make shoot
document.addEventListener("mousedown",(event)=>{
    if(event.button == 2){ // shoot
        // let imp = new CANNON.Vec3();
        // imp.copy(player.getWorldDirection()).mult(-10,imp);
        // cube_body.applyImpulse(imp,new CANNON.Vec3(0,0,0))
        // var x = player.position.x;
        // var y = player.position.y;
        // var z = player.position.z;
        // var bulletBody = new CANNON.Body({ mass: 1 });
        // bulletBody.addShape(bullet.shape);
        // var bulletMesh = new THREE.Mesh( bullet.geometry, bullet.material );
        // bulletMesh.castShadow = true;
        // bulletMesh.receiveShadow = true;
        // world.add(bulletBody);
        // scene.add(bulletMesh);
        
        // bullets.bodies.push(bulletBody);
        // bullets.meshes.push(bulletMesh);

        // // TODO: Shooting direction 
        // var shootDirection = new THREE.Vector3(0,0,1);
        
        // bulletBody.velocity.set(    shootDirection.x * bullet.velocity,
        //                             shootDirection.y * bullet.velocity,
        //                             shootDirection.z * bullet.velocity);

        // // Move the ball outside the player sphere  (put here player radius * 1.02)
        // x += shootDirection.x * (sphereShape.radius*1.02 + bullet.shape.radius);
        // y += shootDirection.y * (sphereShape.radius*1.02 + bullet.shape.radius);
        // z += shootDirection.z * (sphereShape.radius*1.02 + bullet.shape.radius);
        // bulletBody.position.set(x,y,z);
        // bulletMesh.position.set(x,y,z);
    }
});

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
for(let i = 0; i < 5; i++){
    let cylinderi = gasCylinderPool.getFreeObject();
    cylinderi.setPosition(6+2*i,0,-6);
    cylinderi.setRotation(Math.PI);
    scene.add(cylinderi);
}

// Adding staircase to scene:
let stair = new Staircase(  2,0,-12,
                            4,2,8,
                            10,2);
scene.add(stair);


const animate = function () {
    requestAnimationFrame(animate);
    let delta = clock.getDelta();

    player.update(delta);
    
    // Pickup
    pickupHealthPool.update(delta);
    pickupAmmoPool.update(delta);
    pickupShieldPool.update(delta);

    // Cylinder
    gasCylinderPool.update(delta);

    // Particles
    particles.step(delta);

    renderer.render(scene, camera);
};

DefaultGeneralLoadingManager.addOnLoad(() => {
    document.body.removeChild(document.querySelector(".splash"));
    document.body.appendChild(renderer.domElement);
    player.hud.show();
    animate();
});



