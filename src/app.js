import * as THREE from 'three';
import { Clock } from 'three';
import FPSCamera from './components/player/FPSCamera';
import Player from './components/player/Player';

import './style.css';

import { genFloor } from './components/TempFloor';

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





const scene = new THREE.Scene();
//const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const clock = new Clock()

const renderer = new THREE.WebGLRenderer({antialias: true});
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setSize(window.innerWidth, window.innerHeight);
window.addEventListener("resize", () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
})
document.body.appendChild(renderer.domElement);

// Player and camera setup
const camera = new FPSCamera(renderer.domElement, window.innerWidth, window.innerHeight, [0, 2, 5], [0, 0, 0]);
scene.add(camera);
let player = new Player(camera);
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
cube.position.y = 4;
cube.castShadow = true;
scene.add(cube);

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

    camera.movementUpdate(delta);
    player.update(delta);
    healthPickup.update(delta);
    shieldPickup.update(delta);
    ammoPickup.update(delta);

    
    renderer.render(scene, camera);
};

animate();

