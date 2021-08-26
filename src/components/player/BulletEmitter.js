import { ObjectPool } from "../Tools/ObjectPool";
import { Bullet } from "./Bullet";
import { THREE, scene } from "../setup/ThreeSetup";
// import { world } from '../physics/PhysicsEngine';


class BulletEmitter extends THREE.Object3D {

    constructor(position,poolSize){
        super();
        this.pool = new ObjectPool(Bullet,poolSize);
        this.position.copy(position);
    }


    shoot(velocity){
        let b = this.pool.getFreeObject();
        // b.body.position.copy(this.getWorldPosition());
        // b.body.linearVelocity.copy(velocity);
        //b.body.applyForce(velocity)
        scene.add(b);
        // world.addBody(b.body);
        // console.log(`FROM THE POOL -- ${this.pool.freeObject.length} / ${Object.keys(this.pool.usingObject).length}`);
        // console.log(`Body -- ${b.body.position} - ${b.body.velocity}`);
    }

    update(delta){
        this.pool.update(delta);
    }

}

export { BulletEmitter };