import * as THREE from 'three';
import { LoadingManager, MeshStandardMaterial, TextureLoader } from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { DefaultGeneralLoadingManager } from './Tools/GeneralLoadingManager';

import RifleModel from '../asset/models/rifle/rifle.obj';
import RifleTexture from '../asset/models/rifle/textures/Weapon_BaseColor.png';
import RifleNormalMap from '../asset/models/rifle/textures/Weapon_Normal.png';
import RifleMetalMap from '../asset/models/rifle/textures/Weapon_Metallic.png';
import RifleRoughnessMap from '../asset/models/rifle/textures/Weapon_Roughness.png';


function addRifle(callback) {

    var object;
    var texture;
    var normalMap;
    var metalnessMap;
    var roughnessMap;

    var material = new MeshStandardMaterial();   

    const loadingManager = DefaultGeneralLoadingManager;
    loadingManager.addOnLoad(() => {
        object.traverse(function (child) {
            if (child.isMesh){
                child.material = material;
                child.material.map = texture;
                child.material.normalMap = normalMap;
                child.material.metalnessMap = metalnessMap;
                child.material.roughnessMap = roughnessMap;
                child.castShadow = true;
            } 
        });
        callback(object);
    })

    const textureLoader = loadingManager.getHandler("texture");
    texture = textureLoader.load(RifleTexture);
    normalMap = textureLoader.load(RifleNormalMap);
    metalnessMap = textureLoader.load(RifleMetalMap);
    roughnessMap = textureLoader.load(RifleRoughnessMap);

    const objLoader = loadingManager.getHandler("obj");
    objLoader.load(RifleModel,
        (obj) => {
            object = obj;
        },
    );


}



export { addRifle }