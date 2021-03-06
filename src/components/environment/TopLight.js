import { DefaultGeneralLoadingManager } from '../Tools/GeneralLoadingManager';

import topLightModel from '../../asset/models/topLight/HangingLight.obj'

import topLightTexture from '../../asset/models/topLight/Textures/OldFlorecentLight_AO.png';
import topLightTextureNormal from '../../asset/models/topLight/Textures/OldFlorecentLight_NoAO_NRM.jpg';
import topLightTextureMetallic from '../../asset/models/topLight/Textures/OldFlorecentLight_Metallic.jpg';
import topLightTextureEmissive from '../../asset/models/topLight/Textures/OldFlorecentLight_Emmisive.jpg';
import { Box3, Color, MeshPhongMaterial, PointLight, Vector3 } from 'three';

const loader = DefaultGeneralLoadingManager.getHandler("texture");
const _topLightTexture = loader.load(topLightTexture);
const _topLightTextureNormal = loader.load(topLightTextureNormal);
const _topLightTextureMetallic = loader.load(topLightTextureMetallic);
const _topLightTextureEmissive = loader.load(topLightTextureEmissive);

let _topLightObj;

const objLoaderLight = DefaultGeneralLoadingManager.getHandler("obj");
objLoaderLight.load(topLightModel,
    (obj) => {
        _topLightObj = obj;
        // Scale
        let boundingBox = new Box3().setFromObject(_topLightObj).getSize(new Vector3());
        let scaleFactor = 3 / boundingBox.x;
        _topLightObj.scale.set(scaleFactor, scaleFactor, scaleFactor);

        _topLightObj.traverse(function (child) {
            if (child.isMesh){
                child.material = new MeshPhongMaterial();
                child.material.map = _topLightTexture;
                child.material.normalMap = _topLightTextureNormal;
                child.material.metalnessMap = _topLightTextureMetallic;
                child.material.emissive = new Color( 0xffffff );
                child.material.emissiveMap = _topLightTextureEmissive;
                child.castShadow = true;
            } 
        });
    },
);

class TopLight {
    constructor(x,y,z, rotationRadians = 0, distance = 24, intensity = 1, color = 0xFFFFFF){
        this.obj = _topLightObj.clone(true);
        this.light = new PointLight(color, intensity, distance);
        this.light.position.set(x,y-2,z);

        // Apply position
        this.setPosition(x,y,z);
        this.setRotation(rotationRadians);
    }

    setPosition(x,y,z){
        // Apply position
        this.obj.position.set(x,y,z);
    }

    setRotation(alpha){
        this.obj.rotation.y = alpha;
    }

    addToScene(scene){
        scene.add(this.obj);
        scene.add(this.light);
        // const helper = new THREE.PointLightHelper( this.light );
        // scene.add( helper );
    }

    removeFromScene(scene){
        scene.remove(this.obj);
        scene.remove(this.light);
    }

}


export default TopLight;