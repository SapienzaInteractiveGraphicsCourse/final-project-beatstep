import { THREE, scene, camera } from '../setup/ThreeSetup';
import { DefaultGeneralLoadingManager } from '../Tools/GeneralLoadingManager';

import robot1 from '../../asset/models/robot1/robot_1.glb';

const loader = DefaultGeneralLoadingManager.getHandler("gltf");
let _robot1Model;
const _robotHeight = 3;
loader.load(robot1, (gltf) => {
    _robot1Model = gltf.scene;
    // Scale
    let boundingBox = new THREE.Box3().setFromObject(_robot1Model).getSize(new THREE.Vector3());
    let scaleFactor = _robotHeight / boundingBox.y;
    _robot1Model.scale.set(scaleFactor, scaleFactor, scaleFactor);

});


class RobotDebug {
    constructor() {
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


        this.group.traverse(function (child) {
            if (child.isMesh) {
                child.material = child.material.clone(true);
                child.material.emissive = new THREE.Color(0xff0000);
                child.material.emissiveIntensity = 0;

                child.castShadow = true;
            }
        });

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
        this.size = new THREE.Box3().setFromObject(this.group).getSize(new THREE.Vector3());

        // We need one mixer for each animated object in the scene
        this.mixer = new THREE.AnimationMixer(this.group);
        // Set final position when animation ends
        this.mixer.addEventListener('finished', (e) => {
            e.action.stop();
            e.action.reset();
            // checking if finalCoords exists
            if(e.action.finalCoords){
                
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

        this.animations = [
            this.animation_alert,
            this.animation_shootPose,
            this.animation_shootPoseRev
        ];
        this.lastAnimation = null;

        document.addEventListener("keydown", ((event) => {
            let i = parseInt(event.key) - 1;
            if (this.animations[i]) this.startAnimation(this.animations[i]);
        }).bind(this));

    }

    setPosition(x, y, z) {
        // Apply position
        this.group.position.set(x, y, z);
    }

    addPosition(dx, dy, dz) {
        let p = this.group.position;
        this.group.position.set(p.x + dx, p.y + dy, p.z + dz);
    }

    setRotation(alpha) {
        this.group.rotation.y = alpha;
    }

    update(delta) {
        // Update every animation
        this.mixer.update(delta);
    }

    createAnimationShootPose() {
        let velocity = 0.3;
        // this.arm_dx_1
        let arm_dx_1_a1 = this.arm_dx_1.quaternion.clone();
        let arm_dx_1_a2 = this.incrementQuaternionFromEuler(arm_dx_1_a1, 0, Math.PI / 8, Math.PI / 3);

        const arm_dx_1_rotation = new THREE.QuaternionKeyframeTrack(
            this.arm_dx_1_path + '.quaternion',
            [0, velocity],
            [...arm_dx_1_a1.toArray(),
            ...arm_dx_1_a2.toArray()],
        );

        // this.arm_dx_2
        let arm_dx_2_a1 = this.arm_dx_2.quaternion.clone();
        let arm_dx_2_a2 = this.incrementQuaternionFromEuler(arm_dx_2_a1, +Math.PI / 8, 0, 0);

        const arm_dx_2_rotation = new THREE.QuaternionKeyframeTrack(
            this.arm_dx_2_path + '.quaternion',
            [0, velocity],
            [...arm_dx_2_a1.toArray(),
            ...arm_dx_2_a2.toArray()],
        );

        // this.hand_dx
        let hand_dx_a1 = this.hand_dx.quaternion.clone();
        let hand_dx_a2 = this.incrementQuaternionFromEuler(hand_dx_a1, -Math.PI / 4, 0, 0);

        const hand_dx_rotation = new THREE.QuaternionKeyframeTrack(
            this.hand_dx_path + '.quaternion',
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
        
        animation_shootPose.finalCoords = {
            positions: [],
            rotations: [
                { obj: this.arm_dx_1, value: arm_dx_1_a2.clone() },
                { obj: this.arm_dx_2, value: arm_dx_2_a2.clone() },
                { obj: this.hand_dx, value: hand_dx_a2.clone() },
            ],
        };

        return animation_shootPose;
    }

    createAnimationShootPoseReverse() {
        let velocity = 0.3;
        // this.arm_dx_1
        let arm_dx_1_a2 = this.arm_dx_1.quaternion.clone();
        let arm_dx_1_a1 = this.incrementQuaternionFromEuler(arm_dx_1_a2, 0, Math.PI / 8, Math.PI / 3);

        const arm_dx_1_rotation = new THREE.QuaternionKeyframeTrack(
            this.arm_dx_1_path + '.quaternion',
            [0, velocity],
            [...arm_dx_1_a1.toArray(),
            ...arm_dx_1_a2.toArray()],
        );

        // this.arm_dx_2
        let arm_dx_2_a2 = this.arm_dx_2.quaternion.clone();
        let arm_dx_2_a1 = this.incrementQuaternionFromEuler(arm_dx_2_a2, +Math.PI / 8, 0, 0);

        const arm_dx_2_rotation = new THREE.QuaternionKeyframeTrack(
            this.arm_dx_2_path + '.quaternion',
            [0, velocity],
            [...arm_dx_2_a1.toArray(),
            ...arm_dx_2_a2.toArray()],
        );

        // this.hand_dx
        let hand_dx_a2 = this.hand_dx.quaternion.clone();
        let hand_dx_a1 = this.incrementQuaternionFromEuler(hand_dx_a2, -Math.PI / 4, 0, 0);

        const hand_dx_rotation = new THREE.QuaternionKeyframeTrack(
            this.hand_dx_path + '.quaternion',
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

        animation_shootPoseRev.finalCoords = {
            positions: [],
            rotations: [
                { obj: this.arm_dx_1, value: arm_dx_1_a2.clone() },
                { obj: this.arm_dx_2, value: arm_dx_2_a2.clone() },
                { obj: this.hand_dx, value: hand_dx_a2.clone() },
            ],
        };

        return animation_shootPoseRev;
    }

    createAnimationAlert() {
        // this.chest
        let chest_a1 = this.chest.quaternion;
        let chest_a2 = this.incrementQuaternionFromEuler(chest_a1, 0, 0, Math.PI / 4);
        const chest_rotation = new THREE.QuaternionKeyframeTrack(
            this.chest_path + '.quaternion',
            [0, 0.3, 0.8],
            [...chest_a1.toArray(),
            ...chest_a2.toArray(),
            ...chest_a1.toArray()],
        );

        // this.head
        let head_a1 = this.head.quaternion;
        let head_a2 = this.incrementQuaternionFromEuler(head_a1, 0, Math.PI, 0);
        let head_a3 = this.incrementQuaternionFromEuler(head_a1, 0, Math.PI * 2, 0);
        const head_rotation = new THREE.QuaternionKeyframeTrack(
            this.head_path + '.quaternion',
            [0, 0.2, 0.5],
            [...head_a1.toArray(),
            ...head_a2.toArray(),
            ...head_a3.toArray()],
        );

        // this.arm_dx_1 & this.arm_sx_1
        let arm_dx_1_a1 = this.arm_dx_1.quaternion;
        let arm_dx_1_a2 = this.incrementQuaternionFromEuler(arm_dx_1_a1, 0, 0, Math.PI * 3 / 4);
        let arm_sx_1_a1 = arm_dx_1_a1;
        let arm_sx_1_a2 = arm_dx_1_a2;
        const arm_dx_1_rotation = new THREE.QuaternionKeyframeTrack(
            this.arm_dx_1_path + '.quaternion',
            [0, 0.3, 0.8],
            [...arm_dx_1_a1.toArray(),
            ...arm_dx_1_a2.toArray(),
            ...arm_dx_1_a1.toArray()],
        );
        const arm_sx_1_rotation = new THREE.QuaternionKeyframeTrack(
            this.arm_sx_1_path + '.quaternion',
            [0, 0.3, 0.8],
            [...arm_sx_1_a1.toArray(),
            ...arm_sx_1_a2.toArray(),
            ...arm_sx_1_a1.toArray()],
        );

        // this.arm_dx_2 & this.arm_sx_2
        let arm_dx_2_a1 = this.arm_dx_2.quaternion;
        let arm_dx_2_a2 = this.incrementQuaternionFromEuler(arm_dx_2_a1, -Math.PI / 2, 0, Math.PI / 2);
        let arm_sx_2_a1 = arm_dx_2_a1;
        let arm_sx_2_a2 = this.incrementQuaternionFromEuler(arm_dx_2_a1, +Math.PI / 2, 0, Math.PI / 2);;
        const arm_dx_2_rotation = new THREE.QuaternionKeyframeTrack(
            this.arm_dx_2_path + '.quaternion',
            [0, 0.3, 0.8],
            [...arm_dx_2_a1.toArray(),
            ...arm_dx_2_a2.toArray(),
            ...arm_dx_2_a1.toArray()],
        );
        const arm_sx_2_rotation = new THREE.QuaternionKeyframeTrack(
            this.arm_sx_2_path + '.quaternion',
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
        animation_alert.finalCoords = {
            positions: [],
            rotations: [
                { obj: this.chest, value: chest_a1.clone() },
                { obj: this.head, value: head_a1.clone() },
                { obj: this.arm_dx_1, value: arm_dx_1_a1.clone() },
                { obj: this.arm_dx_2, value: arm_dx_2_a1.clone() },
                { obj: this.arm_sx_1, value: arm_sx_1_a1.clone() },
                { obj: this.arm_sx_2, value: arm_sx_2_a1.clone() },

                { obj: this.hand_dx, value: this.hand_dx.quaternion.clone() },
            ],
        };

        return animation_alert;
    }

    startAnimation(anim) {
        if (!anim) return;

        // this.mixer.stopAllAction();
        anim.reset();
        anim.play();
        if (this.lastAnimation != null) {
            // this.lastAnimation.crossFadeTo(anim, fSpeed, true);

            // let lastCurrentAnim = this.lastAnimation;
            // setTimeout(function () {
            //     lastCurrentAnim.enabled = true;
            //     anim.crossFadeTo(lastCurrentAnim, tSpeed, true);
            // }, anim._clip.duration * 1000 - ((tSpeed + fSpeed) * 1000));
        }

        this.lastAnimation = anim;
    }

    createQuaternionFromEuler(x, y, z) {
        return new THREE.Quaternion().setFromEuler(new THREE.Euler(x, y, z, "XYZ"));
    }

    createEulerFromQuaternion(x, y, z, w) {
        return new THREE.Euler().setFromQuaternion(new THREE.Quaternion(x, y, z, w));
    }

    incrementQuaternionFromEuler(quaternion, dx, dy, dz) {
        let e = this.createEulerFromQuaternion(quaternion.x, quaternion.y, quaternion.z, quaternion.w);
        return this.createQuaternionFromEuler(e.x + dx, e.y + dy, e.z + dz);
    }

}

export default RobotDebug;