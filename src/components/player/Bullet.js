import { THREE } from '../setup/ThreeSetup';
// import { detectCollision, setCollideable } from '../physics/CollisionDetector';
// import { world, PhysicsBody, PhysicsMaterial, PhysicsShapeThree } from '../physics/PhysicsEngine';

// Bullet properties
let _bulletRadius = 0.05;
let _bulletMass = 0.002;
const _bulletGeometry = new THREE.SphereGeometry(_bulletRadius, 16, 16);
const _bulletMaterial = new THREE.MeshLambertMaterial({ color: 0xa8a8a8 });


class Bullet extends THREE.Mesh{
    constructor(){
        super(_bulletGeometry,_bulletMaterial);
        
        this.castShadow = false;
        this.receiveShadow = false;

        this.lifeTime = 0;
        this.totalLifeTime = 10; // in seconds

        //this.physicsProperties = new PhysicsProperties(0.5);

        // this.body = new PhysicsBody(_bulletMass, new PhysicsShapeThree(_bulletGeometry), new PhysicsMaterial(0.01,1,0));
        // this.body.gravityInfluence = 0.1;
        // this.body.collisionDistance = 0.3;
        //this.body.position.copy(this.position);
        //this.body.mesh = this;

        // setCollideable(this,_bulletGeometry);
        // this.onPersonalCollision = function(intersections){
        //     this.lifeTime = this.totalLifeTime;
        // };
    }

    update(delta){
        //let displacement = DefaultPhysicsEngine.update(this.physicsProperties, delta);
        //this.position.add(displacement);

        // detectCollision(this);
        // this.body.updateMesh(this);
        this.lifeTime += delta;
        if(this.lifeTime >= this.totalLifeTime){
            this.lifeTime = 0;
            // this.body.reset();
            
            if(this.__poolId) this.freeInPool();
            this.removeFromParent();
            // world.removeBody(this.body);
        }
    }


}

export { Bullet };