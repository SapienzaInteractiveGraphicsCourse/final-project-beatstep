import { THREE } from '../setup/ThreeSetup';
import { DefaultGeneralLoadingManager } from '../Tools/GeneralLoadingManager';
import wall1 from '../../asset/textures/wall1.png';

const loader = DefaultGeneralLoadingManager.getHandler("texture");
const _wallTexture = loader.load(wall1);
// Apply repetition
_wallTexture.wrapS = THREE.RepeatWrapping;
_wallTexture.wrapT = THREE.RepeatWrapping;
_wallTexture.magFilter = THREE.NearestFilter;

class Wall extends THREE.Mesh{
    constructor(x,y,z,width,height,rotationRadians=0){
        let geometry = new THREE.PlaneGeometry(width,height);
        let texture = _wallTexture.clone();
        texture.needsUpdate = true;
        texture.repeat.set(width/2,height/2);

        let material = new THREE.MeshPhongMaterial({
            map: texture,
            side: THREE.DoubleSide,
        });
        super(geometry, material);

        this.receiveShadow = true;
        this.castShadow = false;

        // Apply position
        this.position.set(x,y+height/2,z);

        // Apply Rotation
        this.rotation.y = Math.PI * rotationRadians;
    }
}


export default Wall;