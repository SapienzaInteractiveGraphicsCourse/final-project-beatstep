import { scene, camera } from '../setup/ThreeSetup';
import { DefaultGeneralLoadingManager } from '../Tools/GeneralLoadingManager';
import { Box3, Vector3, Color } from 'three';

import robot1 from '../../asset/models/robot1/robot_1.glb';

var TWEEN = require('@tweenjs/tween.js');

const loader = DefaultGeneralLoadingManager.getHandler("gltf");
let _robot1Model;
const _robotHeight = 3;
loader.load(robot1, (gltf) => {
    _robot1Model = gltf.scene;
    // Scale
    let boundingBox = new Box3().setFromObject(_robot1Model).getSize(new Vector3());
    let scaleFactor = _robotHeight / boundingBox.y;
    _robot1Model.scale.set(scaleFactor, scaleFactor, scaleFactor);

});


class TestRobot {
    constructor() {
        this.group = _robot1Model.clone(true);

        let eulerToJSON = (e) => ({x:e.x,y:e.y,z:e.z});

        this.group.traverse(function (child) {
            if (child.isMesh) {
                child.material = child.material.clone(true);
                child.material.emissive = new Color(0xff0000);
                child.material.emissiveIntensity = 0;

                child.castShadow = true;
            }

            child.defaultPosition = eulerToJSON(child.position.clone());
            child.defaultRotation = eulerToJSON(child.rotation.clone());
        });
        this.group.defaultRotation = eulerToJSON(this.group.rotation.clone());

        // Groups part (ordered by hierarchy)
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

        // Size
        this.size = new Box3().setFromObject(this.group).getSize(new Vector3());

        // Animations
        this._tweenAnimations = new TWEEN.Group();

        this.animation_alert = this.createAnimationAlert();
        this.animation_shootPose = this.createAnimationShootPose();
        this.animation_shooting = this.createAnimationShooting();
        this.animation_shootPoseRev = this.createAnimationShootPoseReverse();
        this.animation_death = this.createAnimationDeath();

        this.animations = [
            this.animation_alert,
            this.animation_shootPose,
            this.animation_shooting,
            this.animation_shootPoseRev,
            this.animation_death,
        ];

        document.addEventListener("keydown", ((event) => {
            let i = parseInt(event.key) - 1;
            if (this.animations[i]) this.startAnimation(this.animations[i]);
        }).bind(this));

    }

    setPosition(x, y, z) {
        // Apply position
        this.group.position.set(x, y, z);
    }

    setRotation(alpha) {
        this.group.rotation.y = alpha;
        this.group.defaultRotation.y = alpha;
    }

    update(delta) {
        // Update every animation
        this._tweenAnimations.update();
    }

    createAnimationShootPose() {
        let velocity = 1000*0.3;

        let chest = this.createGeneralAnimation({
            arm_dx_1: {x:0,y:Math.PI/8,z:Math.PI/3},
            arm_dx_2: {x:Math.PI/8,y:0,z:0},
            hand_dx: {x:-Math.PI/4,y:0,z:0},

            arm_sx_1: {x:-Math.PI/4,y:-Math.PI*0.13,z:Math.PI/6},
            arm_sx_2: {x:-Math.PI/4,y:0,z:0},
        }, velocity)
        .onComplete(()=>{
            // this.animation_shooting.start();
        });
        
        return chest;
    }

    createAnimationShootPoseReverse(){
        let velocity = 1000*0.3;
        
        let chest = this.createGeneralAnimation({}, velocity);

        return chest;
    }

    createAnimationShooting() {
        let velocity = 1000*0.2;

        let chest = this.createGeneralAnimation({
            chest: {x:0,y:0,z:Math.PI/6},
            head: {x:0,y:0,z:-Math.PI/6},
            arm_dx_1: {x:0,y:Math.PI/8,z:Math.PI/3},
            arm_dx_2: {x:Math.PI/8,y:0,z:0},
            hand_dx: {x:-Math.PI/4,y:0,z:0},

            arm_sx_1: {x:-Math.PI/4,y:-Math.PI*0.13,z:Math.PI/6},
            arm_sx_2: {x:-Math.PI/4,y:0,z:0},
        }, velocity);

        let chest2 = this.createAnimationShootPose();

        chest.chain(chest2);
        
        return chest;
    }

    createAnimationAlert() {
        let totalVelocity = 1000*0.6;
        let velocity = totalVelocity/2;

        let chest = this.createGeneralAnimation({
            chest: {x:0,y:0,z:Math.PI/4},
            head: {x:0,y:Math.PI*2,z:0},
            arm_dx_1: {x:0,y:0,z:Math.PI*3/4},
            arm_dx_2: {x:0,y:0,z:Math.PI*3/4},
            arm_sx_1: {x:0,y:0,z:Math.PI*3/4},
            arm_sx_2: {x:0,y:0,z:Math.PI*3/4},
        }, velocity);

        let chest2 = this.createGeneralAnimation({
            head: {x:0,y:Math.PI*4,z:0},
        }, velocity)
        .onUpdate(()=>{
            
        })
        .onComplete(()=>{
            let head = new TWEEN.Tween(this.head.rotation, this._tweenAnimations)
            .to({x:0,y:0,z:0}, 0).start();
        });

        chest.chain(chest2);

        return chest;
    }

    createAnimationDeath(){

        let velocity1 = 1000*0.9;

        let rot1 = {x:0,y:Math.PI*4,z:0};
        let rot2 = {x:0,y:0,z:0.95*Math.PI/2};

        let chest = this.createGeneralAnimation({
            wheels_base: {x:Math.PI/8,y:0,z:0},
            chest: {x:-Math.PI/8,y:0,z:0},
            group: {x:`+${rot1.x}`,y:`+${rot1.y}`,z:`+${rot1.z}`},

            arm_dx_1: {x:0,y:-Math.PI/4,z:Math.PI*3/4},
            arm_dx_2: {x:0,y:0,z:Math.PI/4},
            arm_sx_1: {x:0,y:Math.PI/4,z:Math.PI*3/4},
            arm_sx_2: {x:0,y:0,z:Math.PI/4},
        }, velocity1, TWEEN.Easing.Quadratic.InOut);

        let chest2 = this.createGeneralAnimation({
            wheels_base: {x:Math.PI/8,y:0,z:0},
            chest: {x:-Math.PI/8,y:0,z:0},
            group: {x:`+${rot2.x}`,y:`+${rot2.y}`,z:`-${rot2.z}`},
            head: {x:0,y:Math.PI/4,z:0},

            arm_dx_1: {x:0,y:-Math.PI/4,z:Math.PI*0.55},
            arm_dx_2: {x:0,y:0,z:Math.PI/4},
            arm_sx_1: {x:0,y:Math.PI/4,z:Math.PI*0.55},
            arm_sx_2: {x:0,y:0,z:Math.PI/4},
        }, velocity1, TWEEN.Easing.Bounce.InOut)
        // .onComplete(()=>{
        //     this.createGeneralAnimation({
        //         group:{
        //             x:this.group.defaultRotation.x,
        //             y:this.group.defaultRotation.y,
        //             z:this.group.defaultRotation.z
        //         }
        //     },0).start();
        // });

        chest.chain(chest2);

        return chest;
    }

    startAnimation(anim) {
        if (!anim) return;
        this._tweenAnimations.removeAll();

        new TWEEN.Tween(this.group.rotation, this._tweenAnimations)
        .to({
            x:this.group.defaultRotation.x,
            y:this.group.defaultRotation.y,
            z:this.group.defaultRotation.z
        }, 0)
        .onComplete(()=>{
            anim.start();
        }).start();
        
    }

    createGeneralAnimation(rotationParams, generalVelocityMilliseconds = 1000, generalEasing = TWEEN.Easing.Quadratic.In){
        let velocity = generalVelocityMilliseconds;
        
        let chest = new TWEEN.Tween(this.chest.rotation, this._tweenAnimations)
        .to(rotationParams.chest || this.chest.defaultRotation, velocity).easing(generalEasing)
        .onStart(()=>{

            if(rotationParams.group){
                let group = new TWEEN.Tween(this.group.rotation, this._tweenAnimations)
                .to(rotationParams.group, velocity).easing(generalEasing).start();
            }

            let head = new TWEEN.Tween(this.head.rotation, this._tweenAnimations)
            .to(rotationParams.head || this.head.defaultRotation, velocity).start();

            let arm_dx_1 = new TWEEN.Tween(this.arm_dx_1.rotation, this._tweenAnimations)
            .to(rotationParams.arm_dx_1 || this.arm_dx_1.defaultRotation, velocity).easing(generalEasing).start();

            let arm_dx_2 = new TWEEN.Tween(this.arm_dx_2.rotation, this._tweenAnimations)
            .to(rotationParams.arm_dx_2 || this.arm_dx_2.defaultRotation, velocity).easing(generalEasing).start();

            let hand_dx = new TWEEN.Tween(this.hand_dx.rotation, this._tweenAnimations)
            .to(rotationParams.hand_dx || this.hand_dx.defaultRotation, velocity).easing(generalEasing).start();

            let arm_sx_1 = new TWEEN.Tween(this.arm_sx_1.rotation, this._tweenAnimations)
            .to(rotationParams.arm_sx_1 || this.arm_sx_1.defaultRotation, velocity).easing(generalEasing).start();

            let arm_sx_2 = new TWEEN.Tween(this.arm_sx_2.rotation, this._tweenAnimations)
            .to(rotationParams.arm_sx_2 || this.arm_sx_2.defaultRotation, velocity).easing(generalEasing).start();

            let hand_sx = new TWEEN.Tween(this.hand_sx.rotation, this._tweenAnimations)
            .to(rotationParams.hand_sx || this.hand_sx.defaultRotation, velocity).easing(generalEasing).start();

            let wheels_base = new TWEEN.Tween(this.wheels_base.rotation, this._tweenAnimations)
            .to(rotationParams.wheels_base || this.wheels_base.defaultRotation, velocity).easing(generalEasing).start();

        });

        return chest;
    }


}

export default TestRobot;