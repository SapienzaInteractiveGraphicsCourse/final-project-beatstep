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
            if(body.isStatic())
                this.bodies.push(body);
            else
                this.bodies.unshift(body);
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

            if(body.isStatic()) continue;

            // PhysicsBody callback
            body.onBeforeStep();

            // Applying forces
            body.appliedForce.add(_tempVector.copy(this.gravity).multiplyScalar(body.mass * body.gravityInfluence));
            let currentAcceleration = _tempVector.copy(body.appliedForce).divideScalar(body.mass); // a = F/m
            body.linearVelocity.add(currentAcceleration.multiplyScalar(deltaTime)); // v(t+dt) = v(t) + a*dt
            body.linearVelocity.fixZeroPrecision();
            body.appliedForce.set(0,0,0); // Reset to zero, this way accelleration can't accumulate out of nowhere (without forces applied in the next steps)

            body.collisionInfos = [];
        }
            
        for (let i = 0; i < this.bodies.length; i++) {
            let body = this.bodies[i];

            if(body.isStatic()) continue;


            //Collision detection
            for (let j = i + 1; j < this.bodies.length; j++) {
                let body2 = this.bodies[j];

                let collision = SAT.checkCollision_1(body,body2,deltaTime);
                if(!collision) continue;

                body.collisionInfos.push(new CollisionInfo(
                    body2,
                    collision.normal,
                    collision.penetration,
                    collision.collisionTime
                ));

                if(!body2.isStatic()){
                    body2.collisionInfos.push(new CollisionInfo(
                        body,
                        collision.normal.clone().multiplyScalar(-1), // Newton's first law, reaction from body's push
                        collision.penetration,
                        collision.collisionTime
                    ));
                }
            }

            if(body.collisionInfos.length > 0){
                // Collision resolution
                body.collisionInfos.sort( (a, b) => Math.abs(a.collisionTime) - Math.abs(b.collisionTime) ); // Sort collisions by distance

                // Moving the body to the closest collision point, then computing collision resolution
                let noCollisionDeltaTime = body.collisionInfos[0].collisionTime;
                let noCollisionDisplacement;
                if(noCollisionDeltaTime != 0){
                    noCollisionDisplacement = _tempVector.copy(body.linearVelocity).multiplyScalar(noCollisionDeltaTime);
                }
                else{
                    noCollisionDisplacement = _tempVector.copy(body.collisionInfos[0].normal).multiplyScalar(-1*body.collisionInfos[0].penetration);
                }
                body.lastDisplacement.copy(noCollisionDisplacement);

                // Computing collision resolution for all collisions, starting from the first one onward
                for (let colInfo of body.collisionInfos) {
                    if(body.linearVelocity.dot(colInfo.normal) >= 0){
                        console.log("UPWARD VELOCITY");
                        // continue;
                    }
                    let body2 = colInfo.body;

                    // DEBUG
                    if(body2.name == "stairs"){
                        console.log(body.linearVelocity.dot(colInfo.normal));
                    }

                    
                    let e = body.material.restitutionFactor;
                    let m1 = body.mass;
                    let m2 = body2.isStatic() ? Infinity : body2.mass
                    let normal = colInfo.normal
                    
                    let relativeVelocity = new Vector3(0,0,0).subVectors(body.linearVelocity,body2.linearVelocity);
                    let tangent = new Vector3(0,0,0).subVectors(relativeVelocity,_tempVector.copy(normal).multiplyScalar(normal.dot(relativeVelocity))).normalize();

                    // Impulse resulting from the collision
                    let reactionImpulse = (-1*(1+e)*(relativeVelocity.dot(normal)))/((1/m1)+(1/m2));

                    // Impule resulting from the friction with the surface
                    let maxFrictionImpulse = reactionImpulse*body2.material.frictionFactor;
                    let frictionImpulse = 0
                    let tangentMomentum = m1*relativeVelocity.dot(tangent);
                    if(tangentMomentum <= maxFrictionImpulse){
                        frictionImpulse = -1*tangentMomentum;
                    }
                    else{
                        frictionImpulse = -1*maxFrictionImpulse;
                    }

                    let reactionVelocity = _tempVector.copy(normal).multiplyScalar(reactionImpulse/m1).fixZeroPrecision();
                    let frictionVelocity = tangent.multiplyScalar(frictionImpulse/m1).fixZeroPrecision();
                    

                    body.linearVelocity.add(reactionVelocity).add(frictionVelocity);
                }



                // Computing final position post-collision
                let afterCollisionDisplacement = _tempVector.copy(body.linearVelocity).multiplyScalar(deltaTime-noCollisionDeltaTime);
                body.lastDisplacement.add(afterCollisionDisplacement);
                body.lastDisplacement.fixZeroPrecision();
                body.position.add(body.lastDisplacement);

                
                // Once the collisions have been used, reset them for the next step
                // body.collisionInfos = [];
            }
            else{
                let displacement = _tempVector.copy(body.linearVelocity).multiplyScalar(deltaTime);
                body.lastDisplacement.copy(displacement);
                body.lastDisplacement.fixZeroPrecision();
                body.position.add(body.lastDisplacement);
            }

            // PhysicsBody callback
            body.onAfterStep();

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
