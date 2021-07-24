// import { Vector3 } from "three";
// import { PhysicsBody } from "./PhysicsBody";
// import { CollisionMap } from "./CollisonMap";

// class PhysicsWorld {

//     constructor(worldSize = 150){
//         this.gravity = new Vector3(0,0,0);
//         this.collisionMap = new CollisionMap(worldSize/(5*2),5); // CellSize = 5 is fixed
//         // this.bodies = this.collisionMap.list;
//         this.bodies = [];
//         this.collisionDistance = 0.1;
//         this.currentCollisionLoopTag = 0;
//     }

//     addBody(body){
//         if(body instanceof PhysicsBody){
//             // this.collisionMap.addObject(body);
//             this.bodies.push(body);
//             body._world = this;
//         } 
//     }

//     removeBody(body){
//         let index = this.bodies.indexOf(body);
//         if(index != -1){
//             // this.collisionMap.removeObject(body);
//             this.bodies.splice(index,1);
//             body._world = null;
//         }
//     }

//     step(deltaTime){
//         for (let i=0; i<this.bodies.length; i++) {
//             let body = this.bodies[i];
//             body.step(deltaTime,this.gravity);
//             for (let j=i+1; j<this.bodies.length; j++){
//                 let body2 = this.bodies[j];
//                 let {actualCollision, intersections, minIntersection} = body.syncDetectCollision(body2,this.collisionDistance,false);
//                 if(actualCollision){
//                     //Handle physics collision here
//                     console.log("-----------COLLISION-----------")
//                     console.log(body)
//                     console.log(body2)
//                     console.log(`MINIMAL DISTANCE = ${minIntersection.distance}`)
//                     console.log(`TOTAL N of INTERSECTIONS = ${intersections.length}`)
//                     console.log("---------END COLLISION---------")
//                     console.log("")
//                 }
//                 body.detectCollision(body2,body.collisionDistance,body.firstHitOnly);
//             }
//         }
//     }

// }

// export { PhysicsWorld }

import { Vector3 } from "three";
import { PhysicsBody } from "./PhysicsBody";
import { CollisionMap } from "./CollisonMap";

class PhysicsWorld {

    constructor(worldSize = 150){
        this.gravity = new Vector3(0,0,0);
        this.collisionMap = new CollisionMap(worldSize/(5*2),5); // CellSize = 5 is fixed
        this.bodies = this.collisionMap.list;
        // this.bodies = [];
        this.collisionDistance = 0.1;
        this.currentCollisionLoopTag = 0;
    }

    addBody(body){
        if(body instanceof PhysicsBody){
            this.collisionMap.addObject(body);
            //this.bodies.push(body);
            body._world = this;
        } 
    }

    removeBody(body){
        let index = this.bodies.indexOf(body);
        if(index != -1){
            this.collisionMap.removeObject(body);
            //this.bodies.splice(index,1);
            body._world = null;
        }
    }

    step(deltaTime){
        for (let i=0; i<this.bodies.length; i++) {
            let body = this.bodies[i];
            let staticContactNormals = [];

            let nearbyBodies = this.collisionMap.getObjects(body.position,body.collisionDistance);
            for (let j=0; j < nearbyBodies.length; j++){
                let body1 = body;
                let body2 = nearbyBodies[j];

                // A body should not collide with itself
                if(body1 == body2) continue;
                // If body2 is before body1 in the bodies list, it means that we have already checked this collision in a previous loop
                if(this.bodies.indexOf(body2) < this.bodies.indexOf(body1)) continue;
                // Static bodies don't collide with each other
                if(body1.mass == 0 && body2.mass == 0) continue;

                // Since body1 raycasts onto body2, to have the highest accuracy, the body with more faces should raycast, so body1 has to be the one with more faces
                if(body2.shape.faces.length > body1.shape.faces.length)
                    [body1, body2] = [body2, body1]; // Javascript easy swap

                let {isColliding, intersections, minIntersection} = body1.syncDetectCollision(body2,this.collisionDistance,true);
                if(isColliding){
                    if(body1.mass == 0 || body2.mass == 0){
                        let normal;
                        if (body1.mass == 0){
                            normal = minIntersection.raycastingFace.normal.clone();
                            [body1, body2] = [body2, body1];
                        }
                        else if (body2.mass == 0){
                            normal = minIntersection.raycastedFace.normal.clone();
                        }
                        staticContactNormals.push(normal);
                    }
                    
                    //Handle physics collision here
                    // console.log("-----------COLLISION-----------")
                    // console.log(body1)
                    // console.log(body2)
                    // console.log(`MINIMAL DISTANCE = ${minIntersection.distance}`)
                    // console.log(`TOTAL N of INTERSECTIONS = ${intersections.length}`)
                    // console.log("---------END COLLISION---------")
                    // console.log("")
                }
                body1.detectCollision(body2,body1.collisionDistance,body1.firstHitOnly);
            }
            
            body.step(deltaTime,this.gravity,null,staticContactNormals);
            if(body.lastDisplacement.x != 0 && body.lastDisplacement.y != 0 && body.lastDisplacement.z != 0){
                this.collisionMap.addObject(body); // Updating its position in the collision map
            }
        }
    }

}

export { PhysicsWorld }