import { Object3D } from "three";
import { Euler,EventDispatcher,Vector3 } from 'three';
import { THREE, scene } from "../setup/ThreeSetup";

var TWEEN = require('@tweenjs/tween.js');

import { world } from "../physics/PhysicsWorld";
import { MovementEngine } from "../physics/MovementEngine";
import { hud } from "./HUD";
import ParticleSystem from "../environment/ParticleSystem";

import { DefaultGeneralLoadingManager } from "../Tools/GeneralLoadingManager";
import RifleModel from '../../asset/models/rifle/rifle.obj';
import RifleTexture from '../../asset/models/rifle/textures/Weapon_BaseColor.png';
import RifleNormalMap from '../../asset/models/rifle/textures/Weapon_Normal.png';
import RifleMetalMap from '../../asset/models/rifle/textures/Weapon_Metallic.png';
import RifleRoughnessMap from '../../asset/models/rifle/textures/Weapon_Roughness.png';

const rifleModel = {};
(function(){
    var texture;
    var normalMap;
    var metalnessMap;
    var roughnessMap;
    var material = new THREE.MeshStandardMaterial();
    
    const textureLoader = DefaultGeneralLoadingManager.getHandler("texture");
    texture = textureLoader.load(RifleTexture);
    normalMap = textureLoader.load(RifleNormalMap);
    metalnessMap = textureLoader.load(RifleMetalMap);
    roughnessMap = textureLoader.load(RifleRoughnessMap);
    
    const objLoader = DefaultGeneralLoadingManager.getHandler("obj");
    objLoader.load(RifleModel,
        (obj) => {
            rifleModel.mesh = obj.children[0];

            rifleModel.mesh.material = material;
            rifleModel.mesh.material.map = texture;
            rifleModel.mesh.material.normalMap = normalMap;
            rifleModel.mesh.material.metalnessMap = metalnessMap;
            rifleModel.mesh.material.roughnessMap = roughnessMap;
            rifleModel.mesh.castShadow = true;
        },
    );
})()

import smoke from '../../asset/textures/fire2.png';
const loader = DefaultGeneralLoadingManager.getHandler("texture");
const smokeImg = loader.load(smoke);

const _PI_2 = Math.PI / 2;
const _euler = new Euler(0, 0, 0, 'YXZ');
const _xAxis = new Vector3();
const _zAxis = new Vector3();

class Player extends Object3D{

    constructor(camera, position = [0,0,0], height = 1, canvas = null, {angularSensitivity} = {angularSensitivity: null}){
        super();
        this.position.set(position[0],position[1]+(height/2),position[2]);
        this.feetPosition = new Proxy(this.position,{
            get: function(obj,key){
                if(key == "y"){
                    return obj.y - (height/2);
                }
                else return obj[key];
            },
            set: function(obj,key,val){
                if(key == "y"){
                    obj.y = val + (height/2);
                }
                else obj[key] = val;
                return true;
            }
        });
        this.height = height;
        this.camera = camera;
        this.canvas = canvas || document.querySelector("canvas");
        this.camera.position.set(0,height/2,-0.2);
        this.camera.quaternion.copy(this.quaternion);
        this.add(camera);

        let _health = 100;
        let _shield = 0;
        let _ammo = 1000;
        
        this.topHealth = 100;
        this.topShield = 50;
        this.topAmmo = 1000;
        
        Object.defineProperties(this,{
            health: {
                get: function() {return _health},
                set: function(d) {_health = Math.min(d,this.topHealth); this.hud.healthBar.setPercentage(_health/this.topHealth*100)}
            },
            shield: {
                get: function() {return _shield},
                set: function(d) {_shield = Math.min(d,this.topShield); this.hud.shieldBar.setPercentage(_shield/this.topShield*100)}
            },
            ammo: {
                get: function() {return _ammo},
                set: function(d) {_ammo = Math.min(d,this.topAmmo); this.hud.ammoBar.setPercentage(_ammo/this.topAmmo*100)}
            }
        });


        this.speed = 15;
        this.jumpSpeed = 15;
        this.canJump = false;

        this.movementEngine = new MovementEngine(-25);
        this.geometry = new THREE.CylinderGeometry(1,1,height,16);
        

        // Setup of the input and movement controls
        this.setUpControls(angularSensitivity);


        // Setup of the HUD
        this.hud = hud;

        hud.createBar("healthBar","green","Health");
        hud.healthBar.setPercentage(_health/this.topHealth*100);

        hud.createBar("shieldBar","blue", "Shield");
        hud.shieldBar.setPercentage(_shield/this.topShield*100);
        
        hud.createBar("ammoBar","red", "Ammo");
        hud.ammoBar.setPercentage(_ammo/this.topAmmo*100);

        this.controls.addEventListener("lock", function (e) {
            hud.crosshairs.visible = true;
        }.bind(this));
        this.controls.addEventListener("unlock", function (e) {
            hud.crosshairs.visible = false;
        }.bind(this));


        // Setup of the rifle
        this.rifle = rifleModel.mesh;
        this.setUpRifle();
        this.rifleExplosion = new ParticleSystem(camera, camera, 0.03, smokeImg);
        this.rifleExplosion.setParticleSize(0.1)
        this.rifleExplosion.setGeneralRadius(0.1,0.1,0.1);
        this.rifleExplosion.setGeneralVelocity(0.01,0.01,0.01);
        this.rifleExplosion.setGeneralPosition(1.1,0.95,-0.65);


        // Setup death animation
        this.internalTimer = 0;
        let animDuration = 1000*0.3;
        this.animationGroup = new TWEEN.Group(); 
        this.deathAnim = new TWEEN.Tween(this.camera.position,this.animationGroup)
        .to({y: 0}, animDuration).easing(TWEEN.Easing.Quadratic.In)
        .onComplete(()=>{
            this.deathAnim.alreadyPlayed = true;
            new TWEEN.Tween(this.camera.rotation,this.animationGroup)
            .to({x: Math.PI/4, z: Math.PI/2}, animDuration).easing(TWEEN.Easing.Bounce.InOut)
            .onComplete(()=>{
                setTimeout(this.death.bind(this),1000);
            })
            .start(this.internalTimer);
        })
        this.deathAnim.alreadyPlayed = false;
        
        
    }

    setUpControls(angularSensitivity){

        this.controls = new EventDispatcher();
        this.controls.changeEvent = { type: 'change' };
        this.controls.deathEvent = { type: 'death' };
        this.controls.winEvent = { type: 'win' };
        this.controls.lockEvent = { type: 'lock' };
        this.controls.unlockEvent = { type: 'unlock' };
        this.controls.shouldMoveForward = false;
        this.controls.shouldMoveBackward = false;
        this.controls.shouldMoveLeft = false;
        this.controls.shouldMoveRight = false;
        this.controls.shouldJump = false;
        this.controls.isLocked = false;
        this.controls.shouldLock = false;
        // Set to constrain the pitch of the camera
        // Range is 0 to Math.PI radians
        this.controls.minPolarAngle = 0; // radians
        this.controls.maxPolarAngle = Math.PI; // radians
        this.controls.angularSensitivity = angularSensitivity || 0.002;

        let scope = this;

        
        // document.addEventListener("mousedown",((event)=>{
        //     if(event.button == 2){ // shoot
        //         this.shoot()
        //     }
        // }).bind(this));

        function onMouseDown(event) {
            if (event.button == 0 && !scope.controls.isLocked && scope.controls.shouldLock){
                scope.canvas.requestPointerLock(); // pointer lock requested on the HTML element
            }
            else if((event.button == 0 || event.button == 2) && scope.controls.isLocked){
                scope.shoot();
            }
        }

        function onMouseMove(event) {
            if (scope.controls.isLocked === false) return;
            const movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
            const movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;

            _euler.setFromQuaternion(scope.camera.quaternion);
            _euler.y -= movementX * scope.controls.angularSensitivity;
            _euler.x -= movementY * scope.controls.angularSensitivity;
            _euler.x = Math.max(_PI_2 - scope.controls.maxPolarAngle, Math.min(_PI_2 - scope.controls.minPolarAngle, _euler.x));

            scope.camera.quaternion.setFromEuler(_euler);

            scope.controls.dispatchEvent(scope.controls.changeEvent);

        }

        function onPointerlockChange() {
            if (document.pointerLockElement === scope.canvas) {
                scope.controls.dispatchEvent(scope.controls.lockEvent);
                scope.controls.isLocked = true;
            } else {
                scope.controls.dispatchEvent(scope.controls.unlockEvent);
                scope.controls.isLocked = false;
            }
        }

        function onPointerlockError(e) {
            console.error('THREE.PointerLockControls: Unable to use Pointer Lock API');
            console.error(e);
        }

        function onKeyDown ( event ) {
			event.preventDefault();

			switch ( event.code ) {

				case 'ArrowUp':
				case 'KeyW': scope.controls.shouldMoveForward = true; break;

				case 'ArrowLeft':
				case 'KeyA': scope.controls.shouldMoveLeft = true; break;

				case 'ArrowDown':
				case 'KeyS': scope.controls.shouldMoveBackward = true; break;

				case 'ArrowRight':
				case 'KeyD': scope.controls.shouldMoveRight = true; break;

                case 'Space': scope.controls.shouldJump = true; break;

			}
		}

		function onKeyUp(event) {
			event.preventDefault();

			switch ( event.code ) {

				case 'ArrowUp':
				case 'KeyW': scope.controls.shouldMoveForward = false; break;

				case 'ArrowLeft':
				case 'KeyA': scope.controls.shouldMoveLeft = false; break;

				case 'ArrowDown':
				case 'KeyS': scope.controls.shouldMoveBackward = false; break;

				case 'ArrowRight':
				case 'KeyD': scope.controls.shouldMoveRight = false; break;

                case 'Space': scope.controls.shouldJump = false; break;

			}
		}

        this.controls.attach = function(){
            window.addEventListener('keydown', onKeyDown, false );
            window.addEventListener('keyup', onKeyUp, false );
            this.canvas.ownerDocument.addEventListener('mousedown', onMouseDown );
            this.canvas.ownerDocument.addEventListener('mousemove', onMouseMove);
            this.canvas.ownerDocument.addEventListener('pointerlockchange', onPointerlockChange);
            this.canvas.ownerDocument.addEventListener('pointerlockerror', onPointerlockError);
        }.bind(this)

        this.controls.detach = function(){
            window.removeEventListener('keydown', onKeyDown, false );
            window.removeEventListener('keyup', onKeyUp, false );
            this.canvas.ownerDocument.removeEventListener('mousedown', onMouseDown );
            this.canvas.ownerDocument.removeEventListener('mousemove', onMouseMove);
            this.canvas.ownerDocument.removeEventListener('pointerlockchange', onPointerlockChange);
            this.canvas.ownerDocument.removeEventListener('pointerlockerror', onPointerlockError);
        }.bind(this);

        this.controls.attach();

    }

    setUpRifle(){
        let rifle = this.rifle;
        let initAngle = new THREE.Quaternion().setFromEuler(new THREE.Euler(0.05, Math.PI/14, 0, "XYZ"));
        let shootAngle = new THREE.Quaternion().setFromEuler(new THREE.Euler(0.05+(Math.PI/12), Math.PI/14, 0, "XYZ"));

        rifle.position.set(0.3, -0.25, -1);
        rifle.quaternion.set(initAngle.x, initAngle.y, initAngle.z, initAngle.w);

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
        this.mixer = new THREE.AnimationMixer(rifle);
        this.shootAnimation = this.mixer.clipAction(shootClip);
        // this.shootAnimation.clampWhenFinished = true;
        this.shootAnimation.loop = THREE.LoopOnce;
        this.shootAnimation.enabled = false;
        this.repetitions = 1;
        
        rifle.geometry.computeBoundingBox();
        let box = rifle.geometry.boundingBox;
        rifle.tipPosition = new Vector3(0,box.max.y,box.min.z);
        this.camera.add(rifle);
    }

    shoot(){
        if(this.ammo <= 0) return;
        this.ammo -= 1;

        this.shootAnimation.reset();
        this.shootAnimation.play();
        // Explosion
        this.rifleExplosion.restart();

        let origin = new Vector3(0,0,0);
        this.camera.getWorldPosition(origin);
        let direction = _zAxis.setFromMatrixColumn( this.camera.matrixWorld, 2).multiplyScalar(-1).normalize().clone();
        let distance = 500;
        let hits = world.raycastPrecise(origin,direction,distance);

        if(hits.length > 0){
            // Sorting hits by distance, closer first
            hits.sort((a, b) => { 
                let dif = a.distance - b.distance;
                return dif;
            });

            let hit = hits[0];
            if(hit.objectIntersected.constructor.name == "Player"){
                if(hits.length > 1) hit = hits[1];
                else hit = null;
            }
            if(hit && hit.objectIntersected.hit) hit.objectIntersected.hit(direction, hit.distance);
        }
        
    }

    dealDamage(n){
        let s = this.shield - n;
        if(s < 0){
            let h = this.health + s;
            s = 0;
            if(h < 0) h = 0;
            this.health = h;
        }
        this.shield = s;

        if(this.health == 0) this.die();
    }

    hit(){
        this.dealDamage(10);
    }

    die(){
        this.controls.detach();
        if(!this.deathAnim.alreadyPlayed) this.deathAnim.start(this.internalTimer);
    }

    death(){
        this.controls.dispatchEvent(this.controls.deathEvent);
    }

    win(){        
        this.controls.detach();
        this.controls.dispatchEvent(this.controls.winEvent);
    }

    update(deltaTime){
        let xDir = - Number(this.controls.shouldMoveRight) + Number(this.controls.shouldMoveLeft);
        let zDir = - Number(this.controls.shouldMoveForward) + Number(this.controls.shouldMoveBackward);

        if(xDir || zDir){
            
            // this.matrixWorld.extractBasis(_Xvector,_Yvector,_Zvector);
            _xAxis.setFromMatrixColumn( this.camera.matrixWorld, 2).multiplyScalar(xDir).normalize();
		    _zAxis.setFromMatrixColumn( this.camera.matrixWorld, 0).multiplyScalar(zDir).normalize();
            _xAxis.cross(this.up);
            _zAxis.cross(this.up);
            let newVel = _xAxis.add(_zAxis).normalize().multiplyScalar(this.speed).setY(this.movementEngine.velocity.y);

            this.movementEngine.velocity.copy(newVel);
        }

        if(this.controls.shouldJump && this.canJump){
            this.movementEngine.velocity.setY(this.jumpSpeed);
            this.canJump = false;
        }

        this.position.add(this.movementEngine.displacement);

        
        if(this.mixer){
            this.mixer.update(deltaTime);
        }
        this.rifleExplosion.update(deltaTime);
        this.internalTimer += deltaTime*1000;
        this.animationGroup.update(this.internalTimer);
    }

}

export default Player;