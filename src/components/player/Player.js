import { THREE } from '../setup/ThreeSetup';

import { PointerLockControlsPlus } from '../Tools/PointerLockControlsPlus';
import { DefaultPhysicsEngine, PhysicsProperties } from '../physics/PhysicsEngine';
import HUD from "./HUD";

import { addRifle } from "../TempRifle";
import { BulletEmitter } from './BulletEmitter';

class Player extends THREE.Object3D {

    constructor(camera,domElement,position = [0,0,0],lookAt = [0,0,0]) {
        super();
        this.isCamera = true; // To make .lookAt work as in the camera class, otherwise it give a reversed z axis
        //this.up = new THREE.Vector3(0,1,0);
        this.position.x = position[0];
        this.position.y = position[1];
        this.position.z = position[2];
        this.lookAt(new THREE.Vector3(...lookAt));

        this.camera = camera;
        this.camera.position.set(0,0,-1)
        this.camera.quaternion.copy(this.quaternion);
        this.add(camera);

        
        let _health = 100;
        let _shield = 0;
        let _ammo = 1000;
        
        this.topHealth = 100;
        this.topShield = 0;
        this.topAmmo = 1000;
        
        Object.defineProperties(this,{
            health: {
                get: function() {return _health},
                set: function(d) {_health = d; this.hud.healthBar.setPercentage(_health/(this.topHealth*100))}
            },
            shield: {
                get: function() {return _shield},
                set: function(d) {_shield = d; this.hud.shieldBar.setPercentage(_shield/(this.topShield*100))}
            },
            ammo: {
                get: function() {return _ammo},
                set: function(d) {_ammo = d; this.hud.ammoBar.setPercentage(_ammo/(this.topAmmo*100))}
            }
        });

        // Creating controls
        
        this.physicsProperties = new PhysicsProperties(20);
        this.controls = new PointerLockControlsPlus(this, domElement);
        this.controls.shouldLock = true;
        this.movement = {
            movementSpeed: 10,
            jumpSpeed: 15,
        };

        // Updating movement in the space (not view)
        this.movementUpdate = function () {

			return function update( delta ) {
                let xDir = Number(this.controls.shouldMoveRight) - Number(this.controls.shouldMoveLeft);
                let zDir = Number(this.controls.shouldMoveForward) - Number(this.controls.shouldMoveBackward);

                if(xDir || zDir){
                    this.physicsProperties.velocity.setX(xDir * this.movement.movementSpeed);
                    this.physicsProperties.velocity.setZ(zDir * this.movement.movementSpeed * 1.5);
                }

                if(this.controls.shouldJump && this.isOnGround()){
                    this.physicsProperties.velocity.setY(this.movement.jumpSpeed);
                }
                //this.controls.shouldJump = false;

                this.physicsProperties.constraints = this.isOnGround() ? 
                                                     this.physicsProperties.constraints | PhysicsProperties.BOTTOM_CONSTRAINT :
                                                     this.physicsProperties.constraints & !PhysicsProperties.BOTTOM_CONSTRAINT;
                let displacement = DefaultPhysicsEngine.update(this.physicsProperties, delta);

                if (displacement.x != 0) this.controls.moveRight(displacement.x);
				if (displacement.y != 0) this.controls.moveUp(displacement.y);
				if (displacement.z != 0) this.controls.moveForward(displacement.z);
			};

		}();

        this.isOnGround = function(){
            //STUB method. Replace with collision detection with ground
            if (Math.floor(this.position.y) <= position[1]) return true;
            return false;
        }

        
        this.hud = new HUD(this,camera);
        
        this.bulletEmitter = new BulletEmitter(this.position,100);
        //this.add(this.bulletEmitter);
        

        addRifle((obj) => {
            //obj.scale(0.5,0.5,0.5);
            let initAngle = new THREE.Quaternion().setFromEuler(new THREE.Euler(0.05, Math.PI/14, 0, "XYZ"));
            let shootAngle = new THREE.Quaternion().setFromEuler(new THREE.Euler(0.05+(Math.PI/12), Math.PI/14, 0, "XYZ"));

            obj.position.set(0.3, -0.25, -1);
            obj.quaternion.set(initAngle.x, initAngle.y, initAngle.z, initAngle.w);

            // Load animations
            const shootRotation = new THREE.QuaternionKeyframeTrack(
                '.quaternion',
                [0, 0.1, 0.3],
                [initAngle.x, initAngle.y, initAngle.z, initAngle.w,
                shootAngle.x, shootAngle.y, shootAngle.z, shootAngle.w,
                initAngle.x, initAngle.y, initAngle.z, initAngle.w],
            );
            const shootClip = new THREE.AnimationClip('shoot-1', -1, [
                shootRotation
            ]);

            // We need one mixer for each animated object in the scene
            this.mixer = new THREE.AnimationMixer(obj);
            this.shootAnimation = this.mixer.clipAction(shootClip);
            // this.shootAnimation.clampWhenFinished = true;
            this.shootAnimation.loop = THREE.LoopOnce;
            this.shootAnimation.enabled = false;
            this.repetitions = 1;

            // TODO: DEBUG (toremove)
            document.addEventListener("mousedown",((event)=>{
                if(event.button == 2){ // shoot
                    this.startShootAnimation();
                    this.bulletEmitter.shoot(this.getWorldDirection().multiplyScalar(-80));
                }
            }).bind(this));

            camera.add(obj);
            
            obj.children[0].geometry.computeBoundingBox();
            let box = obj.children[0].geometry.boundingBox;
            obj.add(this.bulletEmitter);
            this.bulletEmitter.position.set(0,box.max.y,box.min.z);
        });

        
        
    }

    startShootAnimation() {
        if(this.shootAnimation){
            this.shootAnimation.reset();
            this.shootAnimation.play();
        }
    }

    update(delta){
        this.movementUpdate(delta);
        if(this.mixer){
            this.mixer.update(delta);
        }
        this.bulletEmitter.update(delta);
    }

}

export default Player;