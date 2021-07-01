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
    }

    
    
    
}

export default FPSCamera;
