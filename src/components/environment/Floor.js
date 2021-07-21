import { THREE } from '../setup/ThreeSetup';
import { DefaultGeneralLoadingManager } from '../Tools/GeneralLoadingManager';
import floor1 from '../../asset/textures/floor1.jpg';

const loader = DefaultGeneralLoadingManager.getHandler("texture");
const _floorTexture = loader.load(floor1);
// Apply repetition
_floorTexture.wrapS = THREE.RepeatWrapping;
_floorTexture.wrapT = THREE.RepeatWrapping;
_floorTexture.magFilter = THREE.NearestFilter;

class Floor extends THREE.Mesh{
    constructor(x,y,z,width,height){
        let geometry = new THREE.PlaneGeometry(width,height);
        let texture = _floorTexture.clone();
        texture.needsUpdate = true;
        texture.repeat.set(width/2,width/2);

        const _floorMaterial = new THREE.MeshPhongMaterial({
            map: texture,
            side: THREE.DoubleSide,
        });

        super(geometry, _floorMaterial);

        this.receiveShadow = true;
        this.castShadow = false;

        // Apply position
        this.setPosition(x,y,z);

        // Apply Rotation
        this.rotation.x = Math.PI/2;
    }

    setPosition(x,y,z){
        // Apply position
        this.position.set(x,y,z);
    }

}


export default Floor;