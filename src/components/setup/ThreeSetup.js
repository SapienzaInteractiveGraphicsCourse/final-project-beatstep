// import * as THREE from 'three';
import { Clock, PCFSoftShadowMap, PerspectiveCamera, Scene, WebGLRenderer } from 'three';

const scene = new Scene();
const clock = new Clock();
const camera = new PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new WebGLRenderer({antialias: true});
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = PCFSoftShadowMap;
renderer.setSize(window.innerWidth, window.innerHeight);
// renderer.outputEncoding = THREE.sRGBEncoding;

window.addEventListener("resize", () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});

export { /*THREE,*/ scene, clock, renderer, camera };
