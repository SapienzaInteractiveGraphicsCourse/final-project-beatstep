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
    constructor(x,y,z, rotation = 0, intensity = 0.8, color = 0xFFFFFF){
        this.group = _floorLightModel.clone(true);

        this.light = new THREE.PointLight(color, intensity);
        this.lightPosition = {
            x: x,
            y: y + _floorLightSize.y - _floorLightSize.y/10,
            z: z,
            r: _floorLightSize.z/5
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