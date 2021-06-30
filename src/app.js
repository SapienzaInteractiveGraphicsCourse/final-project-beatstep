import * as THREE from 'three';
import { Clock } from 'three';
import FPSCamera from './components/player/FPSCamera';
import Player from './components/player/Player';

import { genFloor } from './components/TempFloor';
import { addRifle } from './components/TempRifle';

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
window.camera = camera;

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

const animate = function () {
    requestAnimationFrame(animate);
    let delta = clock.getDelta();

    //cube.rotation.x += 0.01;
    //cube.rotation.y += 0.01;

    camera.movementUpdate(delta)
    renderer.render(scene, camera);
};

animate();

