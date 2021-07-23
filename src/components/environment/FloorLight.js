import { THREE } from '../setup/ThreeSetup';
import { DefaultGeneralLoadingManager } from '../Tools/GeneralLoadingManager';

import light from '../../asset/models/floorLight/LUCE.glb';

import light_emissive from '../../asset/models/floorLight/LUCE_emissive.png';

const loader = DefaultGeneralLoadingManager.getHandler("texture");
const _floorLightTextureEmissive = loader.load(light_emissive);
_floorLightTextureEmissive.flipY=false

const loaderGLTF = DefaultGeneralLoadingManager.getHandler("gltf");
let _floorLightModel;
const _floorLightHeight = 4;
let _floorLightSize;
loaderGLTF.load(light, (gltf)=>{
    _floorLightModel = gltf.scene;
    
    // Scale
    let boundingBox = new THREE.Box3().setFromObject(_floorLightModel).getSize();
    let scaleFactor = _floorLightHeight / boundingBox.y;
    _floorLightModel.scale.set(scaleFactor, scaleFactor, scaleFactor);
    _floorLightSize = new THREE.Box3().setFromObject(_floorLightModel).getSize();

    _floorLightModel.traverse(function (child) {
        if (child.isMesh){
            child.material.emissive = new THREE.Color( 0xffffff );
            child.material.emissiveMap = _floorLightTextureEmissive;
            child.material.emissiveIntensity = 1.5;
            child.castShadow = true;
        } 
    });
});

class FloorLight {
    constructor(x,y,z, rotation = 0, distance = 10, intensity = 0.6, color = 0xFFFFFF){
        this.group = _floorLightModel.clone(true);

        this.light = new THREE.SpotLight(color, intensity, distance);
        this.lightPosition = {
            x: x,
            y: y + _floorLightSize.y - _floorLightSize.y/20,
            z: z,
            r: -_floorLightSize.z/20
        }
        this.light.position.set(this.lightPosition.x,
                                this.lightPosition.y,
                                this.lightPosition.z + this.lightPosition.r);
                                
        // Size
        this.size = new THREE.Box3().setFromObject(this.group).getSize();
        this.setPosition(x,y,z);
        this.setRotation(rotation);
    }

    setPosition(x,y,z){
        // Apply position
        this.group.position.set(x,y,z);
    }

    setRotation(alpha){
        this.group.rotation.y = alpha;
        this.light.position.set(this.lightPosition.x + this.lightPosition.r*Math.sin(alpha),
                                this.lightPosition.y,
                                this.lightPosition.z + this.lightPosition.r*Math.cos(alpha));
        this.light.target.position.set( this.lightPosition.x + Math.sin(alpha), 
                                        this.lightPosition.y, 
                                        this.lightPosition.z + Math.cos(alpha));
        this.light.target.updateMatrixWorld();
    }

    addToScene(scene){
        scene.add(this.group);
        scene.add(this.light);
        scene.add(this.light.target);
        // const helper = new THREE.SpotLightHelper( this.light );
        // scene.add( helper );
    }

    removeFromScene(scene){
        scene.remove(this.obj);
        scene.remove(this.light);
        scene.remove(this.light.target);
    }

}

export default FloorLight;