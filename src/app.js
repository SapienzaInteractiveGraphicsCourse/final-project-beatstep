//import {Engine, Scene, SceneLoader, ArcRotateCamera, HemisphericLight} from '@babylonjs/core';
//const BABYLON = {Engine, Scene, SceneLoader, ArcRotateCamera, HemisphericLight};

import { Engine } from "@babylonjs/core/Engines/engine";
import { Scene } from "@babylonjs/core/scene";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { UniversalCamera } from "@babylonjs/core/Cameras/universalCamera";
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { GridMaterial } from "@babylonjs/materials/grid";
// Required side effects to populate the Create methods on the mesh class. Without this, the bundle would be smaller but the createXXX methods from mesh would not be accessible.
import "@babylonjs/core/Meshes/meshBuilder";
import "@babylonjs/core/Materials/standardMaterial";

import FPSCamera from "./components/Camera";


const canvas = document.getElementById("renderCanvas"); // Get the canvas element
const engine = new Engine(canvas, true); // Generate the BABYLON 3D engine

// Add your code here matching the playground format
const createScene = function () {

    const scene = new Scene(engine);

    //SceneLoader.ImportMeshAsync("", "https://assets.babylonjs.com/meshes/", "box.babylon",);
    let box = Mesh.CreateBox("box",1,scene);
    const camera = new FPSCamera("camera", new Vector3(0, 0, -3), scene);
    // camera.minZ = 0.0001;
    // camera.speed = 0.2;
    // camera.angularSensibility = 6000;
    // camera.keysDown.push(83); // s
    // camera.keysUp.push(87); // w
    // camera.keysLeft.push(65); // a
    // camera.keysRight.push(68); // d
    // camera.direction = new Vector3(Math.cos(camera.angle), 0, Math.sin(camera.angle));

    camera.attachControl(canvas, true);
    const light = new HemisphericLight("light", new Vector3(1, 1, 0), scene);

    console.log(camera.inputs);

    return scene;
};

const scene = createScene(); //Call the createScene function

// Register a render loop to repeatedly render the scene
engine.runRenderLoop(function () {
    scene.render();
});

// Watch for browser/canvas resize events
window.addEventListener("resize", function () {
    engine.resize();
});