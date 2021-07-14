import { THREE } from '../setup/ThreeSetup';
import { detectCollision, setCollideable } from '../physics/CollisionDetector';
import { DefaultPhysicsEngine, PhysicsProperties } from '../physics/PhysicsEngine_old';

// Bullet properties
let _bulletRadius = 0.05;
let _bulletMass = 0.5;
const _bulletGeometry = new THREE.SphereGeometry(_bulletRadius, 16, 16);
const _bulletMaterial = new THREE.MeshLambertMaterial({ color: 0xa8a8a8 });


class Bullet extends THREE.Mesh{
    constructor(){
        super(_bulletGeometry,_bulletMaterial);
        
        this.castShadow = false;
        this.receiveShadow = false;

        this.lifeTime = 0;
        this.totalLifeTime = 10; // in seconds

        this.physicsProperties = new PhysicsProperties(0.5);

        setCollideable(this,_bulletGeometry);
        this.onPersonalCollision = function(intersections){
            this.lifeTime = this.totalLifeTime;
        };
    }

    update(delta){
        let displacement = DefaultPhysicsEngine.update(this.physicsProperties, delta);
        this.position.add(displacement);
        // detectCollision(this);
        this.lifeTime += delta;
        if(this.lifeTime >= this.totalLifeTime){
            if(this.__poolId) this.freeInPool();
            this.removeFromParent();
            this.lifeTime = 0;
            this.physicsProperties.reset();
        }
    }


}

export { Bullet };