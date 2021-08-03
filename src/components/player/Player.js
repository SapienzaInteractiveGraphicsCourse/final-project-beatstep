import { THREE } from '../setup/ThreeSetup';

import { PointerLockControlsPlus } from '../Tools/PointerLockControlsPlus';
import { world, PhysicsBody, PhysicsMaterial, PhysicsShapeThree } from '../physics/PhysicsEngine';
import HUD from "./HUD";

import { addRifle } from "../TempRifle";
import { BulletEmitter } from './BulletEmitter';
import { setCollideable } from '../physics/CollisionDetector';

const _vector1 = new THREE.Vector3(0,0,0);
const _vector2 = new THREE.Vector3(0,0,0);

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
        
        // this.physicsProperties = new PhysicsProperties(20);
        this.controls = new PointerLockControlsPlus(this, domElement);
        this.controls.shouldLock = true;
        this.movement = {
            movementSpeed: 8,
            jumpSpeed: 8,
        };

        this.body = new PhysicsBody(80, new PhysicsShapeThree(new THREE.BoxGeometry(1,4,1)), new PhysicsMaterial(0.9,0));
        this.body.position.copy(this.position);
        //this.body.position.y-1;
        this.body.shape.preferBoundingBox = true;
        world.addBody(this.body);

        // Updating movement in the space (not view)
        this.movementUpdate = function ( delta ) {
            let xDir = Number(this.controls.shouldMoveRight) - Number(this.controls.shouldMoveLeft);
            let zDir = Number(this.controls.shouldMoveForward) - Number(this.controls.shouldMoveBackward);

            let xVector = _vector1.setFromMatrixColumn(this.matrixWorld, 0);
            let zVector = _vector2.crossVectors(this.up, _vector1);
            xVector.multiplyScalar(xDir).normalize();
            zVector.multiplyScalar(zDir).normalize();
            let direction = xVector.add(zVector).normalize().multiplyScalar(this.movement.movementSpeed).setY(this.body.linearVelocity.y);

            if(direction.x || direction.y)
                this.body.linearVelocity.copy(direction);


            // if(xDir || zDir){
            //     // this.physicsProperties.velocity.setX(xDir * this.movement.movementSpeed);
            //     // this.physicsProperties.velocity.setZ(zDir * this.movement.movementSpeed * 1.5);
            //     this.body.linearVelocity.setX(xDir * this.movement.movementSpeed);
            //     this.body.linearVelocity.copy(direction).multiplyScalar(zDir * this.movement.movementSpeed * 1.5);
            // }
            //this.isOnGround();
            if(this.controls.shouldJump && this.isOnGround()){
                // this.physicsProperties.velocity.setY(this.movement.jumpSpeed);
                this.body.linearVelocity.setY(this.movement.jumpSpeed);
                // this.body.applyForce({x:0,y:this.movement.jumpForce,z:0});
                console.log("JUMP");
                this.controls.shouldJump = false;
            }
            //this.controls.shouldJump = false;

            // this.physicsProperties.constraints = this.isOnGround() ? 
            //                                      this.physicsProperties.constraints | PhysicsProperties.BOTTOM_CONSTRAINT :
            //                                      this.physicsProperties.constraints & !PhysicsProperties.BOTTOM_CONSTRAINT;
            // let displacement = DefaultPhysicsEngine.update(this.physicsProperties, delta);

            // if (displacement.x != 0) this.controls.moveRight(displacement.x);
            // if (displacement.y != 0) this.controls.moveUp(displacement.y);
            // if (displacement.z != 0) this.controls.moveForward(displacement.z);

            // this.body.constraints = this.isOnGround() ? 
            //                         this.body.constraints | PhysicsBody.LinearConstraints.BOTTOM :
            //                         this.body.constraints & !PhysicsBody.LinearConstraints.BOTTOM;
            // let displacement = this.body.lastDisplacement;

            // if (displacement.x != 0) this.controls.moveRight(displacement.x);
            // if (displacement.y != 0) this.controls.moveUp(displacement.y);
            // if (displacement.z != 0) this.controls.moveForward(displacement.z);
        }.bind(this);

        this.isOnGround = function(){
            //STUB method. Replace with collision detection with ground
            if (this.position.y <= position[1]){ 
                //this.position.y = position[1];
                return true;
            }
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
            let vel = new THREE.Vector3(0,0,0);
            document.addEventListener("mousedown",((event)=>{
                if(event.button == 2){ // shoot
                    this.startShootAnimation();
                    this.getWorldDirection(vel).multiplyScalar(-60);
                    this.bulletEmitter.shoot(vel);
                }
            }).bind(this));

            camera.add(obj);
            
            obj.children[0].geometry.computeBoundingBox();
            let box = obj.children[0].geometry.boundingBox;
            obj.add(this.bulletEmitter);
            this.bulletEmitter.position.set(0,box.max.y,box.min.z);
        });


        // Adding collision detection
        setCollideable(this,new THREE.BoxGeometry(1,2,1),
            (intersections)=>{ // On personal collsion

            },
            (object, distance, intersection)=>{ // On collision with
                console.log(this.constructor.name+" on collision with "+ object.constructor.name);
            }
        );

        
        
    }

    startShootAnimation() {
        if(this.shootAnimation){
            this.shootAnimation.reset();
            this.shootAnimation.play();
        }
    }

    update(delta){
        this.movementUpdate(delta);
        this.body.updateMesh(this,true,false);
        //this.position.set(this.body.position.x,this.body.position.y+1,this.body.position.z);
        if(this.mixer){
            this.mixer.update(delta);
        }
        this.bulletEmitter.update(delta);
    }

}

export default Player;