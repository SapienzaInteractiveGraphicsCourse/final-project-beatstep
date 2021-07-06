import { THREE } from '../setup/ThreeSetup';
import { DefaultGeneralLoadingManager } from '../Tools/GeneralLoadingManager';

class Pickup {
    constructor(texturePath,x,y,z, onTouch = ()=>{}){
        const dimension = 0.8;

        const loader = DefaultGeneralLoadingManager.getHandler("texture");
        this.texture = loader.load(texturePath);

        this.geometry = new THREE.BoxGeometry(dimension,dimension,dimension);
        this.material = new THREE.MeshPhongMaterial({
            map: this.texture,
            side: THREE.DoubleSide,
        });
        this.mesh = new THREE.Mesh(this.geometry, this.material);

        this.mesh.receiveShadow = false;
        this.mesh.castShadow = true;

        // Apply position
        this.mesh.position.set(x,y+dimension/2,z);

        // Apply event touching
        this.onTouch = onTouch;

        this.mesh.rotation.y = 0;
    }

    get obj(){
        return this.mesh;
    }

    update(delta){
        this.mesh.rotation.y += (Math.PI/2)*delta;
    }

}

export default Pickup;