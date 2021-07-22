import { Vector3 } from "three";
import { PhysicsBody } from "./PhysicsBody";
import { CollisionMap } from "./CollisonMap";

class PhysicsWorld {

    constructor(worldSize = 150){s
        this.gravity = new Vector3(0,0,0);
        this.collisionMap = new CollisionMap(worldSize/(5*2),5); // CellSize = 5 is fixed
        // this.bodies = this.collisionMap.list;
        this.bodies = [];
        this.collisionDistance = 0.1;
        this.currentCollisionLoopTag = 0;
    }

    addBody(body){
        if(body instanceof PhysicsBody){
            // this.collisionMap.addObject(body);
            this.bodies.push(body);
            body._world = this;
        } 
    }

    removeBody(body){
        let index = this.bodies.indexOf(body);
        if(index != -1){
            // this.collisionMap.removeObject(body);
            this.bodies.splice(index,1);
            body._world = null;
        }
    }

    step(deltaTime){
        for (let i=0; i<this.bodies.length; i++) {
            let body = this.bodies[i];
            body.step(deltaTime,this.gravity);
            for (let j=i+1; j<this.bodies.length; j++){
                let body2 = this.bodies[j];
                let {actualCollision, intersections, minIntersection} = body.syncDetectCollision(body2,this.collisionDistance,false);
                if(actualCollision){
                    //Handle physics collision here
                    console.log("-----------COLLISION-----------")
                    console.log(body)
                    console.log(`MINIMAL DISTANCE = ${minIntersection.distance}`)
                    console.log(body2)
                    console.log("---------END COLLISION---------")
                }
                body.detectCollision(body2,body.collisionDistance,body.firstHitOnly);
            }
        }
    }

}

export { PhysicsWorld }