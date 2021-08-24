import { Object3D } from "three";
import {
    Euler,
    EventDispatcher,
    Vector3
} from 'three';
import { MovementEngine } from "../physics/MovementEngine";

import { world, PhysicsBody, PhysicsMaterial, PhysicsShapeThree } from '../physics/PhysicsEngine';

const _euler = new Euler(0, 0, 0, 'YXZ');
const _xAxis = new Vector3();
const _zAxis = new Vector3();

const _changeEvent = { type: 'change' };
const _lockEvent = { type: 'lock' };
const _unlockEvent = { type: 'unlock' };

import HUD from "./HUD";


class Player extends Object3D{

    constructor(camera, position = [0,0,0], height = 2, {angularSensitivity} = {angularSensitivity: null}){
        super();
        this.position.set(position[0],position[1]+height/2,position[2]);
        this.height = height;
        this.camera = camera;
        this.camera.position.set(position[0],position[1]+height,position[2]-1);
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

        this.speed = 8;
        this.jumpSpeed = 10;
        this.canJump = false;

        // this.body = new PhysicsBody(80, new PhysicsShapeThree(new THREE.BoxGeometry(1,height,1)), new PhysicsMaterial(0.9,0));
        // this.body.position.copy(this.position);
        // this.body.shape.preferBoundingBox = true;
        // world.addBody(this.body);
        this.movementEngine = new MovementEngine();


        this.setUpControls(angularSensitivity);
        
    }

    setUpControls(angularSensitivity){

        this.controls = new EventDispatcher();
        this.controls.changeEvent = { type: 'change' };
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

        function onMouseDown(event) {
            if (scope.controls.shouldLock && event.button == 0)
                scope.canvas.requestPointerLock();
        }

        function onMouseMove(event) {
            if (scope.controls.isLocked === false) return;
            const movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
            const movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;

            _euler.setFromQuaternion(camera.quaternion);
            _euler.y -= movementX * scope.controls.angularSensitivity;
            _euler.x -= movementY * scope.controls.angularSensitivity;
            _euler.x = Math.max(_PI_2 - scope.controls.maxPolarAngle, Math.min(_PI_2 - scope.controls.minPolarAngle, _euler.x));

            object.quaternion.setFromEuler(_euler);

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

        window.addEventListener('mousedown', onMouseDown );
        window.addEventListener('keydown', onKeyDown, false );
        window.addEventListener('keyup', onKeyUp, false );
        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('pointerlockchange', onPointerlockChange);
        window.addEventListener('pointerlockerror', onPointerlockError);

    }

    update(deltaTime){
        let xDir = Number(this.controls.shouldMoveRight) - Number(this.controls.shouldMoveLeft);
        let zDir = Number(this.controls.shouldMoveForward) - Number(this.controls.shouldMoveBackward);

        if(xDir || zDir){
            
            this.matrixWorld.extractBasis(_Xvector,_Yvector,_Zvector);
            _xAxis.setFromMatrixColumn( this.matrixWorld, 0).normalize().multiplyScalar(xDir * this.movement.movementSpeed);
		    _yAxis.setFromMatrixColumn( this.matrixWorld, 2).normalize().multiplyScalar(zDir * this.movement.movementSpeed);

            this.movementEngine.velocity.add(_xAxis).add(_zAxis);
        }

        if(this.controls.shouldJump && this.canJump){
            this.movementEngine.velocity.setY(this.movement.jumpSpeed);
            console.log("JUMP");
        }

        this.position.add(this.movementEngine.displacement);

    }

}

export { Player }