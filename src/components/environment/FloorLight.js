import { THREE } from '../setup/ThreeSetup';
import { DefaultGeneralLoadingManager } from '../Tools/GeneralLoadingManager';

import light from '../../asset/models/floorLight/LUCE.glb';

const loader = DefaultGeneralLoadingManager.getHandler("gltf");
let _floorLightModel;
const _floorLightHeight = 4;
let _floorLightSize;
loader.load(light, (gltf)=>{
    _floorLightModel = gltf.scene;
    // Scale
    let boundingBox = new THREE.Box3().setFromObject(_floorLightModel).getSize();
    let scaleFactor = _floorLightHeight / boundingBox.y;
    _floorLightModel.scale.set(scaleFactor, scaleFactor, scaleFactor);
    _floorLightSize = new THREE.Box3().setFromObject(_floorLightModel).getSize();
});

class FloorLight {
    constructor(x,y,z, intensity = 0.3, color = 0xFFFFFF){
        this.group = _floorLightModel.clone(true); 

        this.light = new THREE.PointLight(color, intensity);
        this.light.position.set(x,_floorLightSize.y+y,z+1);

        // Size
        this.size = new THREE.Box3().setFromObject(this.group).getSize();
        this.setPosition(x,y,z);
    }

    setPosition(x,y,z){
        // Apply position
        this.group.position.set(x,y,z);
    }

    setRotation(alpha){
        this.group.rotation.y = alpha;
    }

    addToScene(scene){
        scene.add(this.group);
        scene.add(this.light);
        const helper = new THREE.PointLightHelper( this.light );
        scene.add( helper );
    }

    removeFromScene(scene){
        scene.remove(this.obj);
        scene.remove(this.light);
    }

}

export default FloorLight;