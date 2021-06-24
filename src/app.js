//import {Engine, Scene, SceneLoader, ArcRotateCamera, HemisphericLight} from '@babylonjs/core';
//const BABYLON = {Engine, Scene, SceneLoader, ArcRotateCamera, HemisphericLight};

// const BABYLON = () =>{
//     import { Engine } from "@babylonjs/core/Engines/engine";
//     import { Scene } from "@babylonjs/core/scene";
//     import { SceneLoader } from "babylonjs/Loading/sceneLoader";
//     import { Vector3 } from "@babylonjs/core/Maths/math";
//     import { ArcRotateCamera } from "babylonjs/Cameras/arcRotateCamera";
//     import { FreeCamera } from "@babylonjs/core/Cameras/freeCamera";
//     import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight";
//     import { Mesh } from "@babylonjs/core/Meshes/mesh";
//     import { GridMaterial } from "@babylonjs/materials/grid";
//     // Required side effects to populate the Create methods on the mesh class. Without this, the bundle would be smaller but the createXXX methods from mesh would not be accessible.
//     import "@babylonjs/core/Meshes/meshBuilder";

//     return {Engine, Scene, SceneLoader, Vector3, ArcRotateCamera, FreeCamera, HemisphericLight, Mesh, GridMaterial}
// }

import * as BABYLON from "babylonjs";


const canvas = document.getElementById("renderCanvas"); // Get the canvas element
const engine = new BABYLON.Engine(canvas, true); // Generate the BABYLON 3D engine

// Add your code here matching the playground format
const createScene = function () {

    const scene = new BABYLON.Scene(engine);

    BABYLON.SceneLoader.ImportMeshAsync("", "https://assets.babylonjs.com/meshes/", "box.babylon",);

    const camera = new BABYLON.ArcRotateCamera("camera", -Math.PI / 2, Math.PI / 2.5, 15, new BABYLON.Vector3(0, 0, 0));
    camera.attachControl(canvas, true);
    const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(1, 1, 0));

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