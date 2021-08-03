import { Vector3 } from "three";
import { CollisionInfo, PhysicsBody } from "./PhysicsBody";
import { Raycaster } from "./Raycaster";
import { SAT } from "./SAT.js";

function fixZeroPrecision(){
    if(Math.abs(this.x) < 0.0001) this.x = 0;
    if(Math.abs(this.y) < 0.0001) this.y = 0;
    if(Math.abs(this.z) < 0.0001) this.z = 0;
    return this;
}
Vector3.prototype.fixZeroPrecision = fixZeroPrecision;

const _tempVector = new Vector3(0, 0, 0);

class PhysicsWorld {

    constructor() {
        this.gravity = new Vector3(0, 0, 0);
        this.bodies = [];
        this.collisionDistance = 0.1;
        this.currentCollisionLoopTag = 0;
    }

    addBody(body) {
        if (body instanceof PhysicsBody) {
            this.bodies.push(body);
            body._world = this;
        }
    }

    removeBody(body) {
        let index = this.bodies.indexOf(body);
        if (index != -1) {
            this.bodies.splice(index, 1);
            body._world = null;
        }
    }

    step(deltaTime) {
        // Clamping deltaTime to 1, a bigger deltaTime wouldn't be real time and would create weird responses
        if (deltaTime > 1) deltaTime = 1;

        for (let i = 0; i < this.bodies.length; i++) {
            let body = this.bodies[i];

            if(body.mass == 0) continue;

            // Applying forces
            body.appliedForce.add(_tempVector.copy(this.gravity).multiplyScalar(body.mass * body.gravityInfluence));
            let currentAcceleration = _tempVector.copy(body.appliedForce).divideScalar(body.mass); // a = F/m
            body.linearVelocity.add(currentAcceleration.multiplyScalar(deltaTime)); // v(t+dt) = v(t) + a*dt
            body.linearVelocity.fixZeroPrecision();
            body.appliedForce.set(0,0,0); // Reset to zero, this way accelleration can't accumulate out of nowhere (without forces applied in the next steps)

            // Computing the current displacement before collision detection, as if there were no collisions possible
            let allegedDisplacement = new Vector3(0,0,0).copy(body.linearVelocity).multiplyScalar(deltaTime);

            //Collision detection
            for (let j = i + 1; j < this.bodies.length; j++) {
                let body2 = this.bodies[j];

                // Ignore the body if the bounding boxes aren't close enough
                // if (Math.abs(this.roughDistance(body, body2)) > collisionLength) continue;

                // let body2Faces = body2.getFaces();
                // let intersections = [];
                // for (let vertex of bodyVertices) {
                //     let int = Raycaster.raycastToFaces(vertex, allegedDisplacement, body2Faces, collisionLength, false);
                //     intersections.push(...int);
                // }
                // if (intersections.length == 0) continue;  // No collision with this body

                // // Get the closest intersection point with this body2
                // let minIntersection = intersections[0];
                // for(let int of intersections){
                //     if(Math.abs(int.distance) < Math.abs(minIntersection.distance)) minIntersection = int;
                // }

                // body.collisionInfos.push(new CollisionInfo(
                //     minIntersection.raycastedFace.normal.clone(),
                //     minIntersection.distance,
                //     body2.mass,
                //     body2.material.frictionFactor
                // ));

                // if(body2.mass != 0){
                //     body2.collisionInfos.push(new CollisionInfo(
                //         minIntersection.raycastedFace.normal.clone().multiplyScalar(-1), // Newton's first law, reaction from body's push
                //         minIntersection.distance,
                //         body.mass,
                //         body.material.frictionFactor
                //     ));
                // }

                let collision = SAT.checkCollision_1(body,body2,deltaTime);
                if(!collision) continue;

                body.collisionInfos.push(new CollisionInfo(
                    collision.normal,
                    collision.penetration,
                    collision.collisionTime,
                    body2.mass,
                    body2.material.frictionFactor
                ));

                if(body2.mass != 0){
                    body2.collisionInfos.push(new CollisionInfo(
                        collision.normal.clone().multiplyScalar(-1), // Newton's first law, reaction from body's push
                        collision.penetration,
                        collision.collisionTime,
                        body.mass,
                        body.material.frictionFactor
                    ));
                }
            }

            if(body.collisionInfos.length > 0){
                // Collision resolution
                body.collisionInfos.sort( (a, b) => Math.abs(a.distance) - Math.abs(b.distance) ); // Sort collisions by distance
                // Moving the body to the closest collision point, then computing collision resolution
                //let noCollisionDisplacement = _tempVector.copy(allegedDisplacement).setLength(body.collisionInfos[0].distance);
                let noCollisionDeltaTime = body.collisionInfos[0].collisionTime;
                let noCollisionDisplacement = _tempVector.copy(body.linearVelocity).multiplyScalar(noCollisionDeltaTime);
                //body.position.add(noCollisionDisplacement);

                // Computing collision resolution for all collisions, starting from the closest one onward
                for (let colInfo of body.collisionInfos) {
                    
                    // The perpendicular component to the bouncing surface is afected by the restitution factor
                    let vPerpendicular = _tempVector.copy(colInfo.normal).multiplyScalar(body.linearVelocity.dot(colInfo.normal));
                    // If the perpendicular component isn't going against the normal, the bodya is not pushing against the other body
                    if(colInfo.normal.dot(vPerpendicular) < 0){
                        // The parallel component will be dampened by the friction
                        let vParallel = body.linearVelocity.sub(vPerpendicular);

                        vPerpendicular.multiplyScalar(body.material.restitutionFactor);
                        vParallel.multiplyScalar(colInfo.friction);

                        // The sum of the normal component and the parallel component is the new velocity. We subtract cause the parallel is considered going in the surface (against the normal)
                        body.linearVelocity.subVectors(vParallel, vPerpendicular);                                   
                        body.linearVelocity.fixZeroPrecision();
                    }
                    
                }

                // Computing final position post-collision
                body.lastDisplacement.copy(noCollisionDisplacement);
                let afterCollisionDisplacement = _tempVector.copy(body.linearVelocity).multiplyScalar(deltaTime-noCollisionDeltaTime);
                body.lastDisplacement.add(afterCollisionDisplacement);
                body.lastDisplacement.fixZeroPrecision();
                body.position.add(body.lastDisplacement);

                
                // Once the collisions have been used, reset them for the next step
                body.collisionInfos = [];
            }
            else{
                body.lastDisplacement.copy(allegedDisplacement);
                body.lastDisplacement.fixZeroPrecision();
                body.position.add(body.lastDisplacement);
            }

            if(body.mass == 80 && body.linearVelocity.y > 0){
                console.log(body.linearVelocity)
            }


        }

    }

    roughDistance(body1, body2) {
        let bounding1 = body1.shape.preferBoundingBox ?
            body1.shape.boundingBox.clone().applyMatrix4(body1.matrixWorld) :
            body1.shape.boundingSphere.clone().applyMatrix4(body1.matrixWorld);
        let bounding2 = body2.shape.preferBoundingBox ?
            body2.shape.boundingBox.clone().applyMatrix4(body2.matrixWorld) :
            body2.shape.boundingSphere.clone().applyMatrix4(body2.matrixWorld);
        let distance = 0;
        if ((bounding1.type == "box" && bounding2.type == "box")) {
            distance = this.boxToBoxDistance(bounding1, bounding2);
        }
        else if ((bounding1.type == "sphere" && bounding2.type == "sphere")) {
            distance = this.sphereToSphereDistance(bounding1, bounding2);
        }
        else if ((bounding1.type == "box" && bounding2.type == "sphere")) {
            distance = this.boxToSphereDistance(bounding1, bounding2);
        }
        else if ((bounding1.type == "sphere" && bounding2.type == "box")) {
            distance = this.boxToSphereDistance(bounding2, bounding1);
        }
        return distance;
    }

    sphereToSphereDistance(sphere1, sphere2) {
        return Math.max(0,sphere1.center.distanceTo(sphere2.center) - sphere1.radius - sphere2.radius);
    }

    boxToBoxDistance(box1, box2) {
        let scalarU = _tempVector.subVectors(box1.min, box2.max).clampScalar(0, Infinity).lengthSq();
        let scalarV = _tempVector.subVectors(box2.min, box1.max).clampScalar(0, Infinity).lengthSq();
        return Math.sqrt(scalarU + scalarV);
    }

    boxToSphereDistance(box, sphere) {
        let boxEdge = _tempVector.copy(sphere.center).clamp(box.min, box.max);
        return Math.max(0,sphere.center.distanceTo(boxEdge) - sphere.radius);
    }

}

export { PhysicsWorld }
