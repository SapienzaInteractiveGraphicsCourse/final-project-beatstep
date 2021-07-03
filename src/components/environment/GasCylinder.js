import * as THREE from 'three';
import { DefaultGeneralLoadingManager } from '../Tools/GeneralLoadingManager';

class GasCylinder {
    constructor(texturePathTop,texturePathBottom,texturePathSide,x,y,z,rotationRadians=0, onCollision = ()=>{}){
        this.health = 100; // TODO: when 0, explode onCollision

        const radius = 0.5;
        const height = 2;

        const loader = DefaultGeneralLoadingManager.getHandler("texture");
        this.textures = [
            loader.load(texturePathSide),
            loader.load(texturePathTop),
            loader.load(texturePathBottom),
        ];

        this.geometry = new THREE.CylinderGeometry(radius,radius,height,32);
        this.materials = [
            new THREE.MeshPhongMaterial({
                map: this.textures[0],
                side: THREE.DoubleSide,
            }),
            new THREE.MeshPhongMaterial({
                map: this.textures[1],
                side: THREE.DoubleSide,
            }),
            new THREE.MeshPhongMaterial({
                map: this.textures[2],
                side: THREE.DoubleSide,
            })
        ];
        this.mesh = new THREE.Mesh(this.geometry, this.materials);

        this.mesh.receiveShadow = true;

        // Apply position
        this.mesh.position.set(x,y+height/2,z);

        // Apply Rotation
        this.mesh.rotation.y = Math.PI * rotationRadians;

        // Apply event touching
        this.onTouch = onCollision;
    }

    get obj(){
        return this.mesh;
    }

}

export default GasCylinder;