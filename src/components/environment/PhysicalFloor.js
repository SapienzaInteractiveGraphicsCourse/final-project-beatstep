import { THREE } from '../setup/ThreeSetup';
import { DefaultGeneralLoadingManager } from '../Tools/GeneralLoadingManager';
import floor1 from '../../asset/textures/floor1.jpg';

import { PhysicsBody, PhysicsMaterial, PhysicsShapeThree } from '../physics/PhysicsEngine';

const loader = DefaultGeneralLoadingManager.getHandler("texture");
const _floorTexture = loader.load(floor1);
// Apply repetition
_floorTexture.wrapS = THREE.RepeatWrapping;
_floorTexture.wrapT = THREE.RepeatWrapping;
_floorTexture.magFilter = THREE.NearestFilter;

class PhysicalFloor extends PhysicsBody{
    constructor(x,y,z,width,height, preferBoundingBox = true){
        let geometry = new THREE.PlaneGeometry(width,height);
        let texture = _floorTexture.clone();
        texture.needsUpdate = true;
        texture.repeat.set(width/2,width/2);

        const _floorMaterial = new THREE.MeshPhongMaterial({
            map: texture,
            side: THREE.DoubleSide,
        });

        super(0,new PhysicsShapeThree(geometry),new PhysicsMaterial(0.8,0.2,0.5),()=>{

        });

        this.mesh = new THREE.Mesh(geometry, _floorMaterial);

        this.mesh.receiveShadow = true;
        this.mesh.castShadow = false;

        // Apply position
        this.setPosition(x,y,z);

        // Apply Rotation
        this.mesh.rotation.x = Math.PI/2;
        this.quaternion.copy(this.mesh.quaternion);

        this.shape.preferBoundingBox = preferBoundingBox;
    }

    setPosition(x,y,z){
        // Apply position
        this.mesh.position.set(x,y,z);
        this.position.copy(this.mesh.position);
    }

}


export default PhysicalFloor;