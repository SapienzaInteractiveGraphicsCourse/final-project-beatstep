import { THREE } from '../setup/ThreeSetup';
import { CANNON, world } from '../physics/CannonSetup';
import { ExtendedBody } from '../physics/ExtendedBody';

// Bullet properties
let _bulletRadius = 0.05
let _bulletMass = 0.5;
const _bulletShape = new CANNON.Sphere(_bulletRadius);
const _bulletGeometry = new THREE.SphereGeometry(_bulletRadius, 16, 16);
const _bulletMaterial = new THREE.MeshLambertMaterial({ color: 0xa8a8a8 }); THREE.MeshLambertMaterial


class Bullet extends THREE.Mesh{
    constructor(){
        super(_bulletGeometry,_bulletMaterial);
        this.body = new ExtendedBody({
            mass: _bulletMass,
            shape: _bulletShape
        })
        
        this.castShadow = false;
        this.receiveShadow = false;

        this.lifeTime = 0;
        this.totalLifeTime = 10; // in seconds
    }

    update(delta){
        this.body.update(this);
        this.lifeTime += delta;
        if(this.lifeTime >= this.totalLifeTime){
            if(this.__poolId) this.freeInPool();
            this.removeFromParent();
            world.removeBody(this.body);
            this.lifeTime = 0;
        }
    }


}

export { Bullet };