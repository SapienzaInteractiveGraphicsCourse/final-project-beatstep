import { THREE } from './setup/ThreeSetup';
import { DefaultGeneralLoadingManager } from './Tools/GeneralLoadingManager';

import RifleModel from '../asset/models/rifle/rifle.obj';
import RifleTexture from '../asset/models/rifle/textures/Weapon_BaseColor.png';
import RifleNormalMap from '../asset/models/rifle/textures/Weapon_Normal.png';
import RifleMetalMap from '../asset/models/rifle/textures/Weapon_Metallic.png';
import RifleRoughnessMap from '../asset/models/rifle/textures/Weapon_Roughness.png';

var object;
var texture;
var normalMap;
var metalnessMap;
var roughnessMap;

var material = new THREE.MeshStandardMaterial();

const textureLoader = DefaultGeneralLoadingManager.getHandler("texture");
texture = textureLoader.load(RifleTexture);
normalMap = textureLoader.load(RifleNormalMap);
metalnessMap = textureLoader.load(RifleMetalMap);
roughnessMap = textureLoader.load(RifleRoughnessMap);

const objLoader = DefaultGeneralLoadingManager.getHandler("obj");
objLoader.load(RifleModel,
    (obj) => {
        object = obj;
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
    },
);


function addRifle(callback) {

    callback(object);

}



export { addRifle }