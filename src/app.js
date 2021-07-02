import * as THREE from 'three';
import { Clock } from 'three';
import FPSCamera from './components/player/FPSCamera';
import Player from './components/player/Player';

import './style.css';

import { genFloor } from './components/TempFloor';
import { addRifle } from './components/TempRifle';

// Walls
import Wall from './components/Wall';
import wall1 from './asset/textures/wall1.png';

// Pickups
import Pickup from './components/Pickup';
import pickup_health from './asset/textures/pickup_health.png';

const scene = new THREE.Scene();
//const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const clock = new Clock()

const renderer = new THREE.WebGLRenderer();
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setSize(window.innerWidth, window.innerHeight);
window.addEventListener("resize", () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
})
document.body.appendChild(renderer.domElement);

const camera = new FPSCamera(renderer.domElement, window.innerWidth, window.innerHeight, [0, 2, 5], [0, 0, 0]);
scene.add(camera);
let player = new Player(camera);
window.player = player;

const color = 0xFFFFFF;

const ambientLight = new THREE.AmbientLight(color, 0.2);
scene.add(ambientLight);

const pointLight = new THREE.PointLight(color);
pointLight.position.set(0,30,0);
pointLight.castShadow = true;
scene.add(pointLight);

const geometry = new THREE.BoxGeometry();
const material = new THREE.MeshToonMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(geometry, material);
cube.position.y = 4;
cube.castShadow = true;
scene.add(cube);

scene.add(genFloor(40));

// Adding walls to scene
let wall_1 = new Wall(wall1,0,0,-20, 40,20);
let wall_2 = new Wall(wall1,-20,0,0, 40,20,0.5);
scene.add(wall_1.obj);
scene.add(wall_2.obj);

// Adding pickups to scene
let healthPickup = new Pickup(pickup_health,-6,0.5,-6,()=>{});
scene.add(healthPickup.obj);

const animate = function () {
    requestAnimationFrame(animate);
    let delta = clock.getDelta();

    //cube.rotation.x += 0.01;
    //cube.rotation.y += 0.01;

    camera.movementUpdate(delta)
    renderer.render(scene, camera);
    player.update(delta);
    healthPickup.update(delta);
};

animate();

