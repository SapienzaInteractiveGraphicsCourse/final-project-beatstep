import * as THREE from 'three';
import { CANNON, world } from './components/physics/CannonSetup';
import { Clock } from 'three';

// Tools
import { DefaultGeneralLoadingManager } from './components/Tools/GeneralLoadingManager';

// Player
import FPSCamera from './components/player/FPSCamera';
import Player from './components/player/Player';

// Walls
import Wall from './components/environment/Wall';
import wall1 from './asset/textures/wall1.png';

// Pickups
import Pickup from './components/environment/Pickup';
import pickup_health from './asset/textures/pickup_health.png';
import pickup_shield from './asset/textures/pickup_shield.png';
import pickup_ammo from './asset/textures/pickup_ammo.png';

// Gas Cylinder
import GasCylinder from './components/environment/GasCylinder';
import gas_top from './asset/textures/gas_top.png';
import gas_side from './asset/textures/gas_side.png';

import './style.css';

import { genFloor } from './components/TempFloor';

const scene = new THREE.Scene();
const clock = new Clock();

const renderer = new THREE.WebGLRenderer({antialias: true});
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setSize(window.innerWidth, window.innerHeight);

// Player and camera setup
const camera = new FPSCamera(window.innerWidth, window.innerHeight);
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

const geometry = new THREE.BoxGeometry();
const material = new THREE.MeshToonMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(geometry, material);
cube.position.y = 20;
cube.castShadow = true;
scene.add(cube);
let shape = new CANNON.Box(new CANNON.Vec3(0.5,0.5,0.5));
let body = new CANNON.Body({
    mass: 1
});
body.addShape(shape);
body.position.copy(cube.position);
world.addBody(body);
document.addEventListener("mousedown",(event)=>{
    if(event.button == 2){ // shoot
        let imp = new CANNON.Vec3();
        imp.copy(player.getWorldDirection()).mult(-10,imp);
        body.applyImpulse(imp,new CANNON.Vec3(0,0,0))
    }
});
window.body = body;
window.Vec3 = CANNON.Vec3;

// Adding walls to scene
let wall_1 = new Wall(wall1,0,0,-20, 40,20);
let wall_2 = new Wall(wall1,-20,0,0, 40,20,0.5);
scene.add(wall_1.obj);
scene.add(wall_2.obj);

// Adding pickups to scene
let healthPickup = new Pickup(pickup_health,-6,0.5,-6,()=>{});
let shieldPickup = new Pickup(pickup_shield,-4.5,0.5,-6,()=>{});
let ammoPickup = new Pickup(pickup_ammo,-3,0.5,-6,()=>{});
scene.add(healthPickup.obj);
scene.add(shieldPickup.obj);
scene.add(ammoPickup.obj);

// Adding gas cylinder to scene
let gasCylinder = new GasCylinder(gas_top,gas_top,gas_side,6,0,6,0.5,()=>{});
scene.add(gasCylinder.obj);

const animate = function () {
    requestAnimationFrame(animate);
    let delta = clock.getDelta();

    player.update(delta);
    healthPickup.update(delta);
    shieldPickup.update(delta);
    ammoPickup.update(delta);

    world.step(delta);
    cube.position.copy(body.position);
    cube.quaternion.copy(body.quaternion);
    
    renderer.render(scene, camera);
};


window.addEventListener("resize", () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});

DefaultGeneralLoadingManager.addOnLoad(() => {
    document.body.removeChild(document.querySelector(".splash"));
    document.body.appendChild(renderer.domElement);
    player.hud.show();
});

animate();

