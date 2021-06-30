import * as THREE from 'three';
import { PointerLockControlsPlus } from '../Tools/PointerLockControlsPlus';
import { DefaultPhysicsEngine, PhysicsProperties } from '../physics/PhysicsEngine';


class FPSCamera extends THREE.PerspectiveCamera {

    constructor(domElement,width,height,position = [0,0,0],lookAt = [0,0,0]){
        // Create Perspective Camera and set position and look at
        super(45, width / height, 0.1, 1000);
        this.position.x = position[0];
        this.position.y = position[1];
        this.position.z = position[2];
        this.lookAt(new THREE.Vector3(...lookAt));

        // Creating controls
        
        this.physicsProperties = new PhysicsProperties(20);
        this.controls = new PointerLockControlsPlus(this, domElement);
        this.controls.shouldLock = true;
         this.movement = {
        //     moveForward: false,
        //     moveBackward: false,
        //     moveLeft: false,
        //     moveRight: false,
        //     jump: false,

            movementSpeed: 10,
            jumpSpeed: 15,

            // velocity: new THREE.Vector3(0,0,0),
            // acceleration: new THREE.Vector3(0,0,0),
            // inertia: 0.7,
            // gravity: 10,

        };

        // Updating movement in the space (not view)
        this.movementUpdate = function () {

			return function update( delta ) {
                //delta = 0.01;

                
                //const actualMoveSpeed = this.movement.movementSpeed * delta;

				// if (this.movement.moveForward ) this.controls.moveForward( actualMoveSpeed );
				// if (this.movement.moveBackward ) this.controls.moveForward( -actualMoveSpeed );

				// if (this.movement.moveLeft ) this.controls.moveRight( -actualMoveSpeed );
				// if (this.movement.moveRight ) this.controls.moveRight( actualMoveSpeed );



                // Dampening velocity
                // let inertia  = Math.min(Math.max(this.movement.inertia,0),1);
                // let gravity = this.movement.gravity
                // this.movement.velocity.multiply(new THREE.Vector3(inertia,1/gravity,inertia));
                // this.movement.velocity.x = Math.abs(this.movement.velocity.x) > 0.001 ? this.movement.velocity.x : 0;
                // this.movement.velocity.y = Math.abs(this.movement.velocity.y) > 0.001 ? this.movement.velocity.y : 0;
                // this.movement.velocity.z = Math.abs(this.movement.velocity.z) > 0.001 ? this.movement.velocity.z : 0;


                // let xDir = Number(this.movement.moveRight) - Number(this.movement.moveLeft);
                // let zDir = Number(this.movement.moveForward) - Number(this.movement.moveBackward);

                // if(xDir || zDir){
                //     this.movement.velocity.x = xDir * this.movement.movementSpeed * delta;
                //     this.movement.velocity.z = zDir * this.movement.movementSpeed * delta * 1.5;
                // }

                // if(this.movement.jump && this.isOnGround()){
                //     this.movement.velocity.y = this.movement.jumpSpeed * delta;
                // }
                // this.movement.jump = false;

                
				// if (this.movement.velocity.x != 0) this.controls.moveRight(this.movement.velocity.x);
				// if (this.movement.velocity.z != 0) this.controls.moveForward(this.movement.velocity.z);
				// if (this.movement.velocity.y != 0) this.controls.moveUp(this.movement.velocity.y);

                // if(this.movement.velocity.z != 0) console.log(this.movement.velocity);

                let xDir = Number(this.controls.shouldMoveRight) - Number(this.controls.shouldMoveLeft);
                let zDir = Number(this.controls.shouldMoveForward) - Number(this.controls.shouldMoveBackward);

                if(xDir || zDir){
                    this.physicsProperties.velocity.setX(xDir * this.movement.movementSpeed);
                    this.physicsProperties.velocity.setZ(zDir * this.movement.movementSpeed * 1.5);
                }

                if(this.controls.shouldJump && this.isOnGround()){
                    this.physicsProperties.velocity.setY(this.movement.jumpSpeed);
                }
                this.controls.shouldJump = false;

                this.physicsProperties.constraints = this.isOnGround() ? 
                                                     this.physicsProperties.constraints | PhysicsProperties.BOTTOM_CONSTRAINT :
                                                     this.physicsProperties.constraints & !PhysicsProperties.BOTTOM_CONSTRAINT;
                let displacement = DefaultPhysicsEngine.update(this.physicsProperties, delta);

                if (displacement.x != 0) this.controls.moveRight(displacement.x);
				if (displacement.y != 0) this.controls.moveUp(displacement.y);
				if (displacement.z != 0) this.controls.moveForward(displacement.z);

                //if(this.physicsProperties.velocity.z != 0) console.log(this.physicsProperties.velocity);
                //if(this.physicsProperties.acceleration.y != 0) console.log(this.physicsProperties.acceleration);

			};

		}();

        this.isOnGround = function(){
            //STUB method. Replace with collision detection with ground
            if (Math.floor(this.position.y) <= position[1]) return true;
            return false;
        }

        // Adding movement and view function listeners

        // let onMouseDown = ( function (event){
        //     if(event.button == 0)
        //         this.lock();
        // } ).bind(this.controls);
        // this.controls.domElement.addEventListener( 'mousedown', onMouseDown );

        // let onKeyDown = ( function ( event ) {

		// 	event.preventDefault();

		// 	switch ( event.code ) {

		// 		case 'ArrowUp':
		// 		case 'KeyW': this.movement.moveForward = true; break;

		// 		case 'ArrowLeft':
		// 		case 'KeyA': this.movement.moveLeft = true; break;

		// 		case 'ArrowDown':
		// 		case 'KeyS': this.movement.moveBackward = true; break;

		// 		case 'ArrowRight':
		// 		case 'KeyD': this.movement.moveRight = true; break;

        //         case 'Space': this.movement.jump = true; break;

		// 	}

		// } ).bind(this);
        // window.addEventListener( 'keydown', onKeyDown, false );

		// let onKeyUp = ( function ( event ) {

		// 	switch ( event.code ) {

		// 		case 'ArrowUp':
		// 		case 'KeyW': this.movement.moveForward = false; break;

		// 		case 'ArrowLeft':
		// 		case 'KeyA': this.movement.moveLeft = false; break;

		// 		case 'ArrowDown':
		// 		case 'KeyS': this.movement.moveBackward = false; break;

		// 		case 'ArrowRight':
		// 		case 'KeyD': this.movement.moveRight = false; break;

		// 	}

		// } ).bind(this);
		// window.addEventListener( 'keyup', onKeyUp, false );
    }

    
    
    
}

export default FPSCamera;
