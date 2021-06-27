import * as THREE from 'three';
import { Clock } from 'three';
import FPSCamera from './components/FPSCamera';

const scene = new THREE.Scene();
//const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const clock = new Clock()

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
window.addEventListener("resize",()=>{
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
})
document.body.appendChild(renderer.domElement);

const camera = new FPSCamera(renderer.domElement,window.innerWidth, window.innerHeight,[0,0,5],[0,0,0]);



const geometry = new THREE.BoxGeometry();
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

const animate = function () {
    requestAnimationFrame(animate);
    let delta = clock.getDelta();

    //cube.rotation.x += 0.01;
    //cube.rotation.y += 0.01;

    camera.controls.update(delta)
    renderer.render(scene, camera);
};

animate();