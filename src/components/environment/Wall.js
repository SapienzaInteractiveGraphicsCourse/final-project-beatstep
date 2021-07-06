import { THREE } from '../setup/ThreeSetup';
import { DefaultGeneralLoadingManager } from '../Tools/GeneralLoadingManager';

class Wall {
    constructor(texturePath,x,y,z,width,height,rotationRadians=0){
        const loader = DefaultGeneralLoadingManager.getHandler("texture");
        this.texture = loader.load(texturePath);
        // Apply repetition
        this.texture.wrapS = THREE.RepeatWrapping;
        this.texture.wrapT = THREE.RepeatWrapping;
        this.texture.magFilter = THREE.NearestFilter;

        this.texture.repeat.set(3,3);

        this.geometry = new THREE.PlaneGeometry(width,height);
        this.material = new THREE.MeshPhongMaterial({
            map: this.texture,
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