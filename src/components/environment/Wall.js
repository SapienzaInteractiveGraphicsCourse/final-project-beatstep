import { THREE } from '../setup/ThreeSetup';
import { DefaultGeneralLoadingManager } from '../Tools/GeneralLoadingManager';
import wall1 from '../../asset/textures/wall1.png';

const loader = DefaultGeneralLoadingManager.getHandler("texture");
const _wallTexture = loader.load(wall1);
// Apply repetition
_wallTexture.wrapS = THREE.RepeatWrapping;
_wallTexture.wrapT = THREE.RepeatWrapping;
_wallTexture.magFilter = THREE.NearestFilter;
_wallTexture.repeat.set(3,3);

class Wall {
    constructor(x,y,z,width,height,rotationRadians=0){
        this.geometry = new THREE.PlaneGeometry(width,height);
        this.material = new THREE.MeshPhongMaterial({
            map: _wallTexture,
            side: THREE.DoubleSide,
        });
        this.mesh = new THREE.Mesh(this.geometry, this.material);

        this.mesh.receiveShadow = true;
        this.mesh.castShadow = false;

        // Apply position
        this.mesh.position.set(x,y+height/2,z);

        // Apply Rotation
        this.mesh.rotation.y = Math.PI * rotationRadians;
    }

    get obj(){
        return this.mesh;
    }
}


export default Wall;