import { THREE } from '../setup/ThreeSetup';
import { DefaultGeneralLoadingManager } from '../Tools/GeneralLoadingManager';

import robot1 from '../../asset/models/robot1/robot_1.glb';
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
    _robotSize = new THREE.Box3().setFromObject(_robot1Model).getSize();
    _robotCollisionGeometry = new THREE.CylinderGeometry(   _robotSize.x*4,
                                                            _robotSize.x*4,
                                                            _robotSize.y*5,10, 1, true);
    _robotCollisionGeometry.translate(0,_robotSize.y*2,0);

});


class Robot {
    constructor(){
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
        this.velocity = 0.1; // Step
        this.rotationVelocity = this.velocity;
        this.minVicinityWithPlayer = 2;
        this.maxVicinityWithPlayer = this.minVicinityWithPlayer + 2;
        this.eyeRadiusDistanceMin = this.maxVicinityWithPlayer + 6;
        this.eyeRadiusDistanceMax = this.eyeRadiusDistanceMin + 4;

        // We need one mixer for each animated object in the scene
        this.mixer = new THREE.AnimationMixer(this.group);
        // Animations
        this.animation_alert = this.createAnimationAlert();
        this.animation_shootPose = this.createAnimationShootPose();

        // Adding collision detection
        // setCollideable(this.wheels,_robotCollisionGeometry,
        //     (intersections)=>{ // On personal collsion
        //         console.log("personal collsion");
        //     },
        //     (object, distance, intersection)=>{ // On collision with
        //         console.log(this.constructor.name+" on collision with "+ object.constructor.name);
        //         if(object.constructor.name == "Player"){
        //             // Make physical
        //         }
        //     }
        // );
        // this.detectCollision = (...args) => this.wheels.detectCollision(...args);
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
        return Math.abs(this.group.position.y + this.size.y - py) < (this.size.y*3/4);
    }

    update(delta, player){
        // Update every animation
        this.mixer.update(delta);
        // Update collision
        // this.detectCollision(2,true);

        let px = player.position.x;
        let py = player.position.y;
        let pz = player.position.z;
        
        let movement = this.computeDistance(px,pz);
        let dist = Math.sqrt( movement.x**2 + movement.z**2 );
        if( this.isOnSameLevel(py) && ( (dist < this.eyeRadiusDistanceMin && !this.isFollowing) || 
                                        (dist < this.eyeRadiusDistanceMax && this.isFollowing) ) ){
            if(!this.isFollowing){
                this.isFollowing = true;
                this.startAnimation(this.animation_alert);
            }
            
            let v = { x: movement.x/dist, z: movement.z/dist };
            if( dist > this.maxVicinityWithPlayer){
                this.addPosition(v.x*this.velocity,0,v.z*this.velocity);
            }
            let r = Math.atan2(v.z,v.x);
            this.setRotation(-r);
        } else this.isFollowing = false;
    }

    createAnimationShootPose(){
        // this.arm_dx_1
        let arm_dx_1_a1 = this.arm_dx_1.quaternion;
        let arm_dx_1_a2 = this.incrementQuaternionFromEuler(arm_dx_1_a1, 0,Math.PI/8,Math.PI/3);

        const arm_dx_1_rotation = new THREE.QuaternionKeyframeTrack(
            this.arm_dx_1_path+'.quaternion',
            [0, 0.3],
            [...arm_dx_1_a1.toArray(),
             ...arm_dx_1_a2.toArray()],
        );

        // this.arm_dx_2
        let arm_dx_2_a1 = this.arm_dx_2.quaternion;
        let arm_dx_2_a2 = this.incrementQuaternionFromEuler(arm_dx_2_a1, +Math.PI/8,0,0);

        const arm_dx_2_rotation = new THREE.QuaternionKeyframeTrack(
            this.arm_dx_2_path+'.quaternion',
            [0, 0.3],
            [...arm_dx_2_a1.toArray(),
             ...arm_dx_2_a2.toArray()],
        );

        // this.hand_dx
        let hand_dx_a1 = this.hand_dx.quaternion;
        let hand_dx_a2 = this.incrementQuaternionFromEuler(hand_dx_a1, -Math.PI/4,0,0);

        const hand_dx_rotation = new THREE.QuaternionKeyframeTrack(
            this.hand_dx_path+'.quaternion',
            [0, 0.3],
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
        animation_shootPose.clampWhenFinished = true;

        return animation_shootPose;
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