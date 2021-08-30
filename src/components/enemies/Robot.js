import { THREE, scene, camera } from '../setup/ThreeSetup';
import { DefaultGeneralLoadingManager } from '../Tools/GeneralLoadingManager';

import robot1 from '../../asset/models/robot1/robot_1.glb';
import { MovementEngine } from '../physics/MovementEngine';
import ParticleSystem from '../environment/ParticleSystem';
// import { setCollideable } from '../physics/CollisionDetector';

const loader = DefaultGeneralLoadingManager.getHandler("gltf");
let _robot1Model;
const _robotHeight = 3;
let _robotSize;
let _robotCollisionGeometry;
loader.load(robot1, (gltf)=>{
    gltf.scene.traverse(function(node){
        if(node.isMesh) node.castShadow = true;
    });
    _robot1Model = gltf.scene;
    // Scale
    let boundingBox = new THREE.Box3().setFromObject(_robot1Model).getSize();
    let scaleFactor = _robotHeight / boundingBox.y;
    _robot1Model.scale.set(scaleFactor, scaleFactor, scaleFactor);
    _robotSize = boundingBox.clone();
    _robotCollisionGeometry = new THREE.CylinderGeometry(   _robotSize.x,
                                                            _robotSize.x,
                                                            _robotSize.y,10, 1, false);
    _robotCollisionGeometry.translate(0,_robotSize.y/2,0);

});


class Robot {
    constructor(playerToFollow){
        this.playerToFollow = playerToFollow || null;
        // Groups part (ordered by hierarchy)
        this.group = _robot1Model.clone(true);
            this.wheels_base = this.group.getObjectByName("base_ruote");
                this.chest = this.group.getObjectByName("petto");
                    this.arm_dx_1 = this.group.getObjectByName("braccio_dx");
                        this.arm_dx_2 = this.group.getObjectByName("avambraccio_dx");
                            this.hand_dx = this.group.getObjectByName("mano_dx");
                    this.arm_sx_1 = this.group.getObjectByName("braccio_sx");
                        this.arm_sx_2 = this.group.getObjectByName("avanbraccio_sx");
                            this.hand_sx = this.group.getObjectByName("mano_sx");
                    this.head = this.group.getObjectByName("testa");
                this.wheels = this.group.getObjectByName("ruote");

        this.group.geometry = _robotCollisionGeometry;
        this.group.name = "Robot";

        this.group.feetPosition = this.group.position;

        this.group.movementEngine = new MovementEngine(-25);
        
        // Useful for animation
        this.wheels_base_path = "base_ruote";
        this.chest_path = "petto";
        this.wheels_path = "ruote";
        this.arm_dx_1_path = "braccio_dx";
        this.arm_dx_2_path = "avambraccio_dx";
        this.hand_dx_path = "mano_dx";
        this.arm_sx_1_path = "braccio_sx";
        this.arm_sx_2_path = "avanbraccio_sx";
        this.hand_sx_path = "mano_sx";
        this.head_path = "testa";

        // Size
        this.size = new THREE.Box3().setFromObject(this.group).getSize();

        // Properties to interact
        this.isFollowing = false; // if needs to follow player or not
        this.isInShooting = false;
        this.angryDurationMax = 10;
        this.angryDuration = 0;
        this.isHit = false;
        this.health = 100; // TODO: when 0, explode onCollision
        this.velocity = 8; // Step
        this.rotationVelocity = this.velocity;
        this.minVicinityWithPlayer = 2;
        this.maxVicinityWithPlayer = this.minVicinityWithPlayer + 2;
        this.eyeRadiusDistanceMin = this.maxVicinityWithPlayer + 6;
        this.eyeRadiusDistanceMax = this.eyeRadiusDistanceMin + 4;

        this._explosionParticles = null;

        // We need one mixer for each animated object in the scene
        this.mixer = new THREE.AnimationMixer(this.group);
        // Set final position when animation ends
        this.mixer.addEventListener('finished', (e) => {
            // checking if finalCoords exists
            if(e.action.finalCoords){
                e.action.stop();

                console.log(e.action)
                if(e.action.finalCoords.positions){
                    for(let objPosition of e.action.finalCoords.positions){
                        objPosition.obj.position.set(...objPosition.value.toArray());
                    }
                }
                if(e.action.finalCoords.rotations){
                    for(let objRotation of e.action.finalCoords.rotations){
                        objRotation.obj.setRotationFromQuaternion(objRotation.value.normalize());
                    }
                }
            }

        });
        // Animations
        this.animation_alert = this.createAnimationAlert();
        this.animation_shootPose = this.createAnimationShootPose();
        this.animation_shootPoseRev = this.createAnimationShootPoseReverse();

        // Adding collision detection
        this.group.isDynamic = true;
        this.group.onCollision = function(collisionResult,obj,delta){
        
            if(obj.isDynamic){
                // Move back the robot if he penetrated into the wall
                let backVec = collisionResult.normal.clone().multiplyScalar(collisionResult.penetration);
                obj.position.sub(backVec);

                // Don't allow the robot to move inside the other robot!
                // let dot = collisionResult.normal.dot(obj.movementEngine.displacement);
                // if(dot < 0){
                //     backVec = collisionResult.normal.multiplyScalar(dot);
                //     obj.movementEngine.displacement.sub(backVec);
                // }
            }

        }.bind(this);

        this.group.hit = this.hit.bind(this);

    }

    hit(){
        this.health -= 20;
        this.angryDuration =  this.angryDurationMax;
        if(this.health <= 0) this.explode();
    }

    explode(){
        if(this._explosionParticles !== null) return;
        // Adding Particles
        this._explosionParticles = new ParticleSystem(scene,camera, 0.6, null, ()=>{
            this._explosionParticles = null;
        });
        this._explosionParticles.setGeneralPosition(this.group.position.x,this.group.position.y,this.group.position.z);
        this._explosionParticles.restart();
        // Disappear
        this.group.removeFromPhysicsWorld();
        this.group.removeFromParent();
    }

    setPosition(x,y,z){
        // Apply position
        this.group.position.set(x,y,z);
    }

    addPosition(dx,dy,dz){
        let p = this.group.position;
        this.group.position.set(p.x+dx,p.y+dy,p.z+dz);
    }

    setRotation(alpha){
        this.group.rotation.y = alpha;
    }

    addRotation(dalpha){
        this.group.rotation.y += dalpha;
    }

    toRotation(alpha){
        // TODO
    }

    computeDistance(px,pz){
        return {
            x: px - this.group.position.x,
            z: pz - this.group.position.z,
        }
    }

    isOnSameLevel(py){
        return Math.abs(this.group.position.y - py) < (this.size.y*2);
    }

    update(delta){
        // Update every animation
        this.mixer.update(delta);
        if(this._explosionParticles !== null){
            this._explosionParticles.update(delta);
        }
        let player = this.playerToFollow;

        if(player == null) return;

        let px = player.position.x;
        let py = player.position.y;
        let pz = player.position.z;
        
        let movement = this.computeDistance(px,pz);
        let dist = Math.sqrt( movement.x**2 + movement.z**2 );
        if( this.isOnSameLevel(py) && ( (dist < this.eyeRadiusDistanceMin && !this.isFollowing) || 
                                        (dist < this.eyeRadiusDistanceMax && this.isFollowing) || this.angryDuration > 0 ) ){
            if(!this.isFollowing){
                this.isFollowing = true;
                this.startAnimation(this.animation_alert);
            }
            if(this.angryDuration > 0) this.angryDuration -= delta;
            let v = { x: movement.x/dist, z: movement.z/dist };
            if(dist > this.maxVicinityWithPlayer){
                
                if(this.isInShooting) this.startAnimation(this.animation_shootPoseRev);
                this.isInShooting = false;
                this.group.movementEngine.velocity.setX(v.x*this.velocity);
                this.group.movementEngine.velocity.setZ(v.z*this.velocity);
            }
            else if(!this.isInShooting){
                this.isInShooting = true;
                this.startAnimation(this.animation_shootPose);
            }
            let r = Math.atan2(v.z,v.x);
            this.setRotation(-r);
        } else {
            this.isFollowing = false;
            if(this.isInShooting){
                this.isInShooting = false;
                this.startAnimation(this.animation_shootPoseRev);
            }
        }

        if(this.isHit){
            this.isHit = false;
            // TODO: hit here
        }

        this.group.position.add(this.group.movementEngine.displacement);

    }

    createAnimationShootPose(){
        let velocity = 0.6;
        // this.arm_dx_1
        let arm_dx_1_a1 = this.arm_dx_1.quaternion;
        let arm_dx_1_a2 = this.incrementQuaternionFromEuler(arm_dx_1_a1, 0,Math.PI/8,Math.PI/3);

        const arm_dx_1_rotation = new THREE.QuaternionKeyframeTrack(
            this.arm_dx_1_path+'.quaternion',
            [0, velocity],
            [...arm_dx_1_a1.toArray(),
             ...arm_dx_1_a2.toArray()],
        );

        // this.arm_dx_2
        let arm_dx_2_a1 = this.arm_dx_2.quaternion;
        let arm_dx_2_a2 = this.incrementQuaternionFromEuler(arm_dx_2_a1, +Math.PI/8,0,0);

        const arm_dx_2_rotation = new THREE.QuaternionKeyframeTrack(
            this.arm_dx_2_path+'.quaternion',
            [0, velocity],
            [...arm_dx_2_a1.toArray(),
             ...arm_dx_2_a2.toArray()],
        );

        // this.hand_dx
        let hand_dx_a1 = this.hand_dx.quaternion;
        let hand_dx_a2 = this.incrementQuaternionFromEuler(hand_dx_a1, -Math.PI/4,0,0);

        const hand_dx_rotation = new THREE.QuaternionKeyframeTrack(
            this.hand_dx_path+'.quaternion',
            [0, velocity],
            [...hand_dx_a1.toArray(),
             ...hand_dx_a2.toArray()],
        );

        // Putting everything toghether
        const shootPose_clip = new THREE.AnimationClip('shootPose_clip', -1, [
            arm_dx_1_rotation, arm_dx_2_rotation,
            hand_dx_rotation
        ]);

        let animation_shootPose = this.mixer.clipAction(shootPose_clip);
        animation_shootPose.loop = THREE.LoopOnce;
        animation_shootPose.enabled = false;
        animation_shootPose.clampWhenFinished = false;
        animation_shootPose.finalCoords = {
            positions: [],
            rotations: [
                {obj:this.arm_dx_1,value:arm_dx_1_a2},
                {obj:this.arm_dx_2,value:arm_dx_2_a2},
                {obj:this.hand_dx,value:hand_dx_a2},
            ],
        };

        return animation_shootPose;
    }

    createAnimationShootPoseReverse(){
        let velocity = 0.6;
        // this.arm_dx_1
        let arm_dx_1_a2 = this.arm_dx_1.quaternion;
        let arm_dx_1_a1 = this.incrementQuaternionFromEuler(arm_dx_1_a2, 0,Math.PI/8,Math.PI/3);

        const arm_dx_1_rotation = new THREE.QuaternionKeyframeTrack(
            this.arm_dx_1_path+'.quaternion',
            [0, velocity],
            [...arm_dx_1_a1.toArray(),
             ...arm_dx_1_a2.toArray()],
        );

        // this.arm_dx_2
        let arm_dx_2_a2 = this.arm_dx_2.quaternion;
        let arm_dx_2_a1 = this.incrementQuaternionFromEuler(arm_dx_2_a2, +Math.PI/8,0,0);

        const arm_dx_2_rotation = new THREE.QuaternionKeyframeTrack(
            this.arm_dx_2_path+'.quaternion',
            [0, velocity],
            [...arm_dx_2_a1.toArray(),
             ...arm_dx_2_a2.toArray()],
        );

        // this.hand_dx
        let hand_dx_a2 = this.hand_dx.quaternion;
        let hand_dx_a1 = this.incrementQuaternionFromEuler(hand_dx_a2, -Math.PI/4,0,0);

        const hand_dx_rotation = new THREE.QuaternionKeyframeTrack(
            this.hand_dx_path+'.quaternion',
            [0, velocity],
            [...hand_dx_a1.toArray(),
             ...hand_dx_a2.toArray()],
        );

        // Putting everything toghether
        const shootPoseRev_clip = new THREE.AnimationClip('shootPose_clip_rev', -1, [
            arm_dx_1_rotation, arm_dx_2_rotation,
            hand_dx_rotation
        ]);

        let animation_shootPoseRev = this.mixer.clipAction(shootPoseRev_clip);
        animation_shootPoseRev.loop = THREE.LoopOnce;
        animation_shootPoseRev.enabled = false;
        animation_shootPoseRev.clampWhenFinished = false;
        animation_shootPoseRev.finalCoords = {
            positions: [],
            rotations: [
                {obj:this.arm_dx_1,value:arm_dx_1_a2},
                {obj:this.arm_dx_2,value:arm_dx_2_a2},
                {obj:this.hand_dx,value:hand_dx_a2},
            ],
        };

        return animation_shootPoseRev;
    }

    createAnimationAlert(){
        // this.chest
        let chest_a1 = this.chest.quaternion;
        let chest_a2 = this.incrementQuaternionFromEuler(chest_a1, 0,0,Math.PI/4);
        const chest_rotation = new THREE.QuaternionKeyframeTrack(
            this.chest_path+'.quaternion',
            [0, 0.3, 0.8],
            [...chest_a1.toArray(),
             ...chest_a2.toArray(),
             ...chest_a1.toArray()],
        );

        // this.head
        let head_a1 = this.head.quaternion;
        let head_a2 = this.incrementQuaternionFromEuler(head_a1, 0,Math.PI,0);
        let head_a3 = this.incrementQuaternionFromEuler(head_a1, 0,Math.PI*2,0);
        const head_rotation = new THREE.QuaternionKeyframeTrack(
            this.head_path+'.quaternion',
            [0, 0.1, 0.3],
            [...head_a1.toArray(),
             ...head_a2.toArray(),
             ...head_a3.toArray()],
        );

        // this.arm_dx_1 & this.arm_sx_1
        let arm_dx_1_a1 = this.arm_dx_1.quaternion;
        let arm_dx_1_a2 = this.incrementQuaternionFromEuler(arm_dx_1_a1, 0,0,Math.PI*3/4);
        let arm_sx_1_a1 = arm_dx_1_a1;
        let arm_sx_1_a2 = arm_dx_1_a2;
        const arm_dx_1_rotation = new THREE.QuaternionKeyframeTrack(
            this.arm_dx_1_path+'.quaternion',
            [0, 0.3, 0.8],
            [...arm_dx_1_a1.toArray(),
             ...arm_dx_1_a2.toArray(),
             ...arm_dx_1_a1.toArray()],
        );
        const arm_sx_1_rotation = new THREE.QuaternionKeyframeTrack(
            this.arm_sx_1_path+'.quaternion',
            [0, 0.3, 0.8],
            [...arm_sx_1_a1.toArray(),
             ...arm_sx_1_a2.toArray(),
             ...arm_sx_1_a1.toArray()],
        );

        // this.arm_dx_2 & this.arm_sx_2
        let arm_dx_2_a1 = this.arm_dx_2.quaternion;
        let arm_dx_2_a2 = this.incrementQuaternionFromEuler(arm_dx_2_a1, -Math.PI/2,0,Math.PI/2);
        let arm_sx_2_a1 = arm_dx_2_a1;
        let arm_sx_2_a2 = this.incrementQuaternionFromEuler(arm_dx_2_a1, +Math.PI/2,0,Math.PI/2);;
        const arm_dx_2_rotation = new THREE.QuaternionKeyframeTrack(
            this.arm_dx_2_path+'.quaternion',
            [0, 0.3, 0.8],
            [...arm_dx_2_a1.toArray(),
             ...arm_dx_2_a2.toArray(),
             ...arm_dx_2_a1.toArray()],
        );
        const arm_sx_2_rotation = new THREE.QuaternionKeyframeTrack(
            this.arm_sx_2_path+'.quaternion',
            [0, 0.3, 0.8],
            [...arm_sx_2_a1.toArray(),
             ...arm_sx_2_a2.toArray(),
             ...arm_sx_2_a1.toArray()],
        );

        // Putting everything toghether
        const alert_clip = new THREE.AnimationClip('alert_clip', -1, [
            head_rotation,
            chest_rotation,
            arm_dx_1_rotation, arm_sx_1_rotation,
            arm_dx_2_rotation, arm_sx_2_rotation,
        ]);

        let animation_alert = this.mixer.clipAction(alert_clip);
        animation_alert.loop = THREE.LoopOnce;
        animation_alert.enabled = false;
        animation_alert.clampWhenFinished = false;

        return animation_alert;
    }

    startAnimation(anim) {
        if(anim){
            anim.reset();
            anim.play();
        }
    }

    createQuaternionFromEuler(x,y,z){
        return new THREE.Quaternion().setFromEuler(new THREE.Euler(x,y,z, "XYZ"));
    }

    createEulerFromQuaternion(x,y,z,w){
        return new THREE.Euler().setFromQuaternion(new THREE.Quaternion(x,y,z,w));
    }

    incrementQuaternionFromEuler(quaternion, dx,dy,dz){
        let e = this.createEulerFromQuaternion(quaternion.x,quaternion.y,quaternion.z,quaternion.w);
        return this.createQuaternionFromEuler(e.x+dx,e.y+dy,e.z+dz);
    }

}

export default Robot;