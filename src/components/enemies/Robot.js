import { scene, camera } from '../setup/ThreeSetup';
import { DefaultGeneralLoadingManager } from '../Tools/GeneralLoadingManager';

import robot1 from '../../asset/models/robot1/robot_1.glb';
import { MovementEngine } from '../physics/MovementEngine';
import { world } from "../physics/PhysicsWorld";
import ParticleSystem from "../environment/ParticleSystem";
import smoke from '../../asset/textures/smoke.png';
import { Box3, Color, CylinderGeometry, Vector3 } from 'three';

var TWEEN = require('@tweenjs/tween.js');

const loaderTexture = DefaultGeneralLoadingManager.getHandler("texture");
const smokeImg = loaderTexture.load(smoke);

const loader = DefaultGeneralLoadingManager.getHandler("gltf");
let _robot1Model;
const _robotHeight = 3;
let _robotSize;
let _robotCollisionGeometry;
loader.load(robot1, (gltf)=>{
    _robot1Model = gltf.scene;
    // Scale
    let boundingBox = new Box3().setFromObject(_robot1Model).getSize(new Vector3());
    let scaleFactor = _robotHeight / boundingBox.y;
    _robot1Model.scale.set(scaleFactor, scaleFactor, scaleFactor);
    _robotSize = boundingBox.clone();
    _robotCollisionGeometry = new CylinderGeometry(   _robotSize.x,
                                                            _robotSize.x,
                                                            _robotSize.y,10, 1, false);
    _robotCollisionGeometry.translate(0,_robotSize.y/2,0);

});


class Robot {
    constructor(playerToFollow){
        this.playerToFollow = playerToFollow || null;
        /** Groups part (ordered by hierarchy) */
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

        let eulerToJSON = (e) => ({x:e.x,y:e.y,z:e.z});
        this.group.traverse(function(child){
            if(child.isMesh){
                child.material = child.material.clone(true);
                child.material.emissive = new Color( 0xff0000 );
                child.material.emissiveIntensity = 0;

                child.castShadow = true;
            }
            // for Tween.js animations createGeneralAnimation()
            child.defaultPosition = eulerToJSON(child.position.clone());
            child.defaultRotation = eulerToJSON(child.rotation.clone());
        });
        this.group.defaultPosition = eulerToJSON(this.group.position.clone());
        this.group.defaultRotation = eulerToJSON(this.group.rotation.clone());

        /** Size */
        this.size = new Box3().setFromObject(this.group).getSize(new Vector3());

        /** Animations */
        this._tweenAnimations = new TWEEN.Group();
        this.animation_alert = this.createAnimationAlert();
        this.animation_shootPose = this.createAnimationShootPose();
        this.animation_shooting = this.createAnimationShooting();
        this.animation_shootPoseRev = this.createAnimationShootPoseReverse();
        this.animation_death = this.createAnimationDeath();

        /** Internal timer for Tween's animations */
        this.internalTimer = 0;

        /** Shoot Particle System */
        this._shootExplosion = new ParticleSystem(this.hand_dx,camera,0.03,smokeImg,(()=>{}).bind(this));
        this._shootExplosion.setGeneralPosition(1,0.3,1);
        this._shootExplosion.setGeneralRadius(0.3,0.3,0.3);
        this._shootExplosion.setParticleSize(0.4);
        this._shootExplosion.setGeneralVelocity(0.1,0.1,0.1);
        // ps.setGeneralLife(generalLife);
        // ps.setNumberOfParticles(100);

        /** Explosion Particle System */
        this._explosionParticles = new ParticleSystem(scene,camera, 0.6, null, ()=>{
            // this._explosionParticles = null;
        });

        /** Movement idle informations */
        this._idleMovement = {
            duration: 1000*4,
            isIdleAnimated: false, // if there is and idle animation right now
            radialDistance: 3,
        };


        /** Properties to interact */
        this.isFollowing = false;
        this.isInShooting = false;
        this.isShootingProjectiles = false;
        this.isDead = false;
        this.shootingCooldown = 0;
        this.shootingCooldownMax = 1; // x = x second(s), how much time from one shoot and another
        this._shootingProbability = 0.7; // the higher, the more precise, values between [0,1]

        this.angryDuration = 0; 
        this.angryDurationMax = 10; // how much time the robot will follow the player independently of radius distance
        
        this.health = 100; // when 0, death animation and explode
        this.velocity = 8; // in update, how fast the robot goes
        this.rotationVelocity = this.velocity; // rotation velocity of the robot
        // how much distance is tollerated to shoot to player
        this.shootingDistanceMax = 11;
        // how much range the robot will follow the player
        this.eyeRadiusDistanceMin = this.shootingDistanceMax + 8;
        this.eyeRadiusDistanceMax = this.eyeRadiusDistanceMin + 6;

        /** Adding collision detection */
        this.group.geometry = _robotCollisionGeometry;
        this.group.name = "Robot";
        this.group.feetPosition = this.group.position;
        this.group.movementEngine = new MovementEngine(-25);
        this.group.isDynamic = true;
        this._collided = false;
        this.group.onCollision = function(collisionResult,obj,delta){
            if(obj.isDynamic){
                // Move back the robot if he touched something
                let backVec = collisionResult.normal.clone().multiplyScalar(collisionResult.penetration);
                obj.position.sub(backVec);
            }
            
            if(obj.name != "Floor"){
                this._collided = true;
            }

        }.bind(this);

        /** Events for collision detection */
        this.group.hit = this.hit.bind(this);
        this.group.dealDamage = this.dealDamage.bind(this);
        // dealDamage() properties intenisty color
        this._emissiveIntensityDamage = 0;
        this._emissiveIntensityDamageMax = 0.4;
        this._emissiveIntensityDrop = 0.4;

    }

    reset(pos,rot){
        this.group.traverse(function(child){
            if(child.isMesh){
                child.material.emissiveIntensity = 0;
            }
        });
        this.group.rotation.set(this.group.defaultRotation.x,
                                this.group.defaultRotation.y,
                                this.group.defaultRotation.z);

        // Reset robot animation
        let resetPositions = this.createGeneralAnimation({}, 0).onComplete(()=>{
            /** Internal timer for Tween's animations */
            this.internalTimer = 0;
        });
        this.startAnimation(resetPositions);

        /** Shoot Particle System */
        this._shootExplosion.reset();

        /** Explosion Particle System */
        this._explosionParticles.reset();

        /** Movement idle informations */
        this._idleMovement = {
            duration: 1000*4,
            isIdleAnimated: false, // if there is and idle animation right now
            radialDistance: 3,
        };

        /** Properties to interact */
        this.isFollowing = false;
        this.isInShooting = false;
        this.isShootingProjectiles = false;
        this.isDead = false;
        this.shootingCooldown = 0;

        this.angryDuration = 0; 
        
        this.health = 100; // when 0, death animation and explode

        /** Adding collision detection */
        this.group.movementEngine.reset();
        this._collided = false;

        /** Events for collision detection */
        this._emissiveIntensityDamage = 0;

        
        if(pos) this.group.position.set(...pos);
        if(rot) this.group.rotation.set(...rot);
    }

    setPosition(x,y,z){
        // Apply position
        this.group.position.set(x,y,z);
    }

    setRotation(alpha){
        this.group.rotation.y = alpha;
    }

    shoot(delta,toPosition){
        if(!this.isShootingProjectiles){ 
            this.shootingCooldown = 0;
            return;
        }
        if(this.shootingCooldown > 0){
            this.shootingCooldown -= delta;
            return;
        }
        this.shootingCooldown = this.shootingCooldownMax;
        this._shootExplosion.restart();
        this.startAnimation(this.animation_shooting);

        let probabilityOfHit = Math.random();
        if(probabilityOfHit > this._shootingProbability){
            return;
        }

        let fromPosition = this.group.position.clone(true);
        fromPosition.y += _robotHeight*0.6;
        let direction = toPosition.clone(true).sub(fromPosition).normalize();
        let distance = 100;
        let hits = world.raycastPrecise(fromPosition,direction,distance);
        if(hits.length > 0){
            // Sorting hits by distance, closer first
            hits.sort((a, b) => { 
                let dif = a.distance - b.distance;
                return dif;
            });
            let hit = hits[0];
            if(hit.objectIntersected.name == "Robot" && hits.length > 1) hit = hits[1];
            if(hit.objectIntersected.name == "Robot") return;
            if(hit.objectIntersected.hit) hit.objectIntersected.hit(direction, hit.distance);
        }
    }

    hit(){
        this.dealDamage(20);
        this.angryDuration =  this.angryDurationMax; // Robot is angry, will follow you
    }

    explode(){
        // Starting Death sequence
        if(!this.isDead){
            this.isDead = true;
            this.isShootingProjectiles = false;
            this.startAnimation(this.animation_death);
        }
        
    }

    dealDamage(n){
        this._emissiveIntensityDamage = this._emissiveIntensityDamageMax;
        this.group.traverse((function(child){
            if(child.isMesh){
                child.material.emissiveIntensity = this._emissiveIntensityDamage;
            }
        }).bind(this));
        this.health -= n;
        if(this.health <= 0) this.explode();
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

    update_debug(delta){
        // Update animations
        this.internalTimer += delta*1000;
        this._tweenAnimations.update(this.internalTimer);

        if(!this._idleMovement.isIdleAnimated){
            this._idleMovement.isIdleAnimated = true;
            let angleRadius = ( Math.random()*0.5 + 0.5 ) * (Math.PI/2);
            if(this._collided) angleRadius += Math.PI*3/4;
            let anim = this._createIdleAnimation(angleRadius);
            this.startAnimation(anim);
        }

        this.group.position.add(this.group.movementEngine.displacement);
        this._collided = false;
    }

    update(delta){
        // Update animations
        this.internalTimer += delta*1000;
        this._tweenAnimations.update(this.internalTimer);

        // Update robot explosion particle system
        if(this._explosionParticles != null) this._explosionParticles.update(delta);

        // Emissive intensity update
        if(this._emissiveIntensityDamage > 0){
            this._emissiveIntensityDamage -= delta*this._emissiveIntensityDrop;
            if(this._emissiveIntensityDamage < 0) this._emissiveIntensityDamage = 0;
            this.group.traverse((function(child){
                if(child.isMesh){
                    child.material.emissiveIntensity = this._emissiveIntensityDamage;
                }
            }).bind(this));
        }

        // Update shooting explosion particle system
        this._shootExplosion.update(delta);

        if(this.group.parent == null || this.isDead) return;
        
        let player = this.playerToFollow;
        if(player == null) return;

        let px = player.position.x;
        let py = player.position.y;
        let pz = player.position.z;
        
        let movement = this.computeDistance(px,pz);
        let dist = Math.sqrt( movement.x**2 + movement.z**2 );
        if( (this.isOnSameLevel(py) && ( (dist < this.eyeRadiusDistanceMin && !this.isFollowing) || 
                                        (dist < this.eyeRadiusDistanceMax && this.isFollowing) )
        ) || this.angryDuration > 0 ){

            if(this.angryDuration > 0) this.angryDuration -= delta;

            // has seen now the player?
            if(!this.isFollowing){
                this.isFollowing = true;
                this.isShootingProjectiles = false;
                this.startAnimation(this.animation_alert);
            }

            let v = { x: movement.x/dist, z: movement.z/dist };
            // is far from player to shoot?
            if(dist > this.shootingDistanceMax){
                
                if(this.isInShooting) this.startAnimation(this.animation_shootPoseRev);
                this.isInShooting = false;
                this.group.movementEngine.velocity.setX(v.x*this.velocity);
                this.group.movementEngine.velocity.setZ(v.z*this.velocity);
            }
            else {
                if(!this.isInShooting){
                    this.isInShooting = true;
                    this.startAnimation(this.animation_shootPose);
                }
                this.shoot(delta,player.position);
            }
            let r = Math.atan2(v.z,v.x);
            this.setRotation(-r);

            this._idleMovement.isIdleAnimated = false;

        } else {
            this.isFollowing = false;
            if(this.isInShooting){
                this.isInShooting = false;
                this.startAnimation(this.animation_shootPoseRev);
            }
            else if(!this._idleMovement.isIdleAnimated){
                this._idleMovement.isIdleAnimated = true;
                let angleRadius = ( Math.random()*0.5 + 0.5 ) * (Math.PI/2);
                if(this._collided) angleRadius += Math.PI*3/4;
                let anim = this._createIdleAnimation(angleRadius);
                this.startAnimation(anim);
            }
        }

        this.group.position.add(this.group.movementEngine.displacement);
        this._collided = false;
    }

    /** Animations */
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
            this.isShootingProjectiles = true;
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
        .onComplete(()=>{
            let head = new TWEEN.Tween(this.head.rotation, this._tweenAnimations)
            .to({x:0,y:0,z:0}, 0).start(this.internalTimer);
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
        }, velocity1, TWEEN.Easing.Bounce.InOut);

        chest.chain(chest2);
        // chest.onStart(()=>{
        //     this.isDead = true;
        //     this.isShootingProjectiles = false;
        // })
        chest2.onComplete(()=>{
            // Disappear robot
            this.group.hideFromPhysicsWorld();
            this.group.removeFromParent();
            // Start explosion particles
            this._explosionParticles.setGeneralPosition(this.group.position.x,this.group.position.y,this.group.position.z);
            this._explosionParticles.restart();
        });

        return chest;
    }

    startAnimation(anim) {
        if (!anim) return;
        this._tweenAnimations.removeAll();
        anim.start(this.internalTimer);
    }

    createGeneralAnimation(rotationParams, generalVelocityMilliseconds = 1000, generalEasing = TWEEN.Easing.Quadratic.In){
        let velocity = generalVelocityMilliseconds;
        
        let chest = new TWEEN.Tween(this.chest.rotation, this._tweenAnimations)
        .to(rotationParams.chest || this.chest.defaultRotation, velocity).easing(generalEasing)
        .onStart(()=>{

            if(rotationParams.group){
                let group = new TWEEN.Tween(this.group.rotation, this._tweenAnimations)
                .to(rotationParams.group, velocity).easing(generalEasing).start(this.internalTimer);
            }

            let head = new TWEEN.Tween(this.head.rotation, this._tweenAnimations)
            .to(rotationParams.head || this.head.defaultRotation, velocity).start(this.internalTimer);

            let arm_dx_1 = new TWEEN.Tween(this.arm_dx_1.rotation, this._tweenAnimations)
            .to(rotationParams.arm_dx_1 || this.arm_dx_1.defaultRotation, velocity).easing(generalEasing).start(this.internalTimer);

            let arm_dx_2 = new TWEEN.Tween(this.arm_dx_2.rotation, this._tweenAnimations)
            .to(rotationParams.arm_dx_2 || this.arm_dx_2.defaultRotation, velocity).easing(generalEasing).start(this.internalTimer);

            let hand_dx = new TWEEN.Tween(this.hand_dx.rotation, this._tweenAnimations)
            .to(rotationParams.hand_dx || this.hand_dx.defaultRotation, velocity).easing(generalEasing).start(this.internalTimer);

            let arm_sx_1 = new TWEEN.Tween(this.arm_sx_1.rotation, this._tweenAnimations)
            .to(rotationParams.arm_sx_1 || this.arm_sx_1.defaultRotation, velocity).easing(generalEasing).start(this.internalTimer);

            let arm_sx_2 = new TWEEN.Tween(this.arm_sx_2.rotation, this._tweenAnimations)
            .to(rotationParams.arm_sx_2 || this.arm_sx_2.defaultRotation, velocity).easing(generalEasing).start(this.internalTimer);

            let hand_sx = new TWEEN.Tween(this.hand_sx.rotation, this._tweenAnimations)
            .to(rotationParams.hand_sx || this.hand_sx.defaultRotation, velocity).easing(generalEasing).start(this.internalTimer);

            let wheels_base = new TWEEN.Tween(this.wheels_base.rotation, this._tweenAnimations)
            .to(rotationParams.wheels_base || this.wheels_base.defaultRotation, velocity).easing(generalEasing).start(this.internalTimer);

        });

        return chest;
    }

    _createIdleAnimation(angleRadius){
        let generalEasing = TWEEN.Easing.Quadratic.InOut;

        let sign;
        if(Math.random() > 0.5){
            sign = "-";
        } else {
            sign = "+";
        }
        
        let chest = new TWEEN.Tween(this.group.rotation, this._tweenAnimations)
        .to({x:`+${0}`,y:`${sign}${angleRadius}`,z:`+${0}`}, this._idleMovement.duration*0.35).easing(generalEasing)
        .onStart(()=>{
            this._idleMovement.isIdleAnimated = true;

        })
        .onComplete(()=>{
            let _zAxis = new Vector3();
		    _zAxis.setFromMatrixColumn( this.group.matrixWorld, 2).normalize();
            _zAxis.cross(this.group.up); //.multiplyScalar(-this._idleMovement.radialDistance);
            // let finalPosition = new Vector3().addVectors(this.group.position,_zAxis);

            this.group.movementEngine.velocity.setX(-_zAxis.x*this.velocity*0.3);
            this.group.movementEngine.velocity.setZ(-_zAxis.z*this.velocity*0.3);

            let group = new TWEEN.Tween(this.group.movementEngine.velocity, this._tweenAnimations)
            .to({x: 0, y: `+${0}`, z: 0}, this._idleMovement.duration*(0.8 + Math.random()*0.2 ) )
            .onComplete(()=>{
                this._idleMovement.isIdleAnimated = false;
            }).start(this.internalTimer);
        });

        return chest;

    }

}

export default Robot;