import * as THREE from 'three';
import { Vector3 } from 'three';
import { FirstPersonControls } from 'three/examples/jsm/controls/FirstPersonControls';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls';


class FPSCamera extends THREE.PerspectiveCamera {

    constructor(domElement,width,height,position = [0,0,0],lookAt = [0,0,0]){
        // Create Perspective Camera and set position and look at
        super(45, width / height, 1, 1000);
        this.position.x = position[0];
        this.position.y = position[1];
        this.position.z = position[2];
        this.lookAt(new THREE.Vector3(...lookAt));

        // Creating controls
        this.view = new PointerLockControls(this, domElement);
        this.movement = {
            moveForward: false,
            moveBackward: false,
            moveLeft: false,
            moveRight: false,

            movementSpeed: 2.0,

        };

        // Updating movement in the space (not view)
        this.movementUpdate = function () {

			return function update( delta ) {
				const actualMoveSpeed = delta * this.movement.movementSpeed;

				if ( this.movement.moveForward ) this.view.moveForward( actualMoveSpeed );
				if ( this.movement.moveBackward ) this.view.moveForward( -actualMoveSpeed );

				if ( this.movement.moveLeft ) this.view.moveRight( -actualMoveSpeed );
				if ( this.movement.moveRight ) this.view.moveRight( actualMoveSpeed );

			};

		}();

        // Adding movement and view function listeners

        let onMouseDown = ( function (event){
            this.lock();
            // implement here attack
        } ).bind(this.view);
        this.view.domElement.addEventListener( 'mousedown', onMouseDown );

        let onKeyDown = ( function ( event ) {

			event.preventDefault();

			switch ( event.code ) {

				case 'ArrowUp':
				case 'KeyW': this.movement.moveForward = true; break;

				case 'ArrowLeft':
				case 'KeyA': this.movement.moveLeft = true; break;

				case 'ArrowDown':
				case 'KeyS': this.movement.moveBackward = true; break;

				case 'ArrowRight':
				case 'KeyD': this.movement.moveRight = true; break;

			}

		} ).bind(this);
        window.addEventListener( 'keydown', onKeyDown, false );

		let onKeyUp = ( function ( event ) {

			switch ( event.code ) {

				case 'ArrowUp':
				case 'KeyW': this.movement.moveForward = false; break;

				case 'ArrowLeft':
				case 'KeyA': this.movement.moveLeft = false; break;

				case 'ArrowDown':
				case 'KeyS': this.movement.moveBackward = false; break;

				case 'ArrowRight':
				case 'KeyD': this.movement.moveRight = false; break;

			}

		} ).bind(this);
		window.addEventListener( 'keyup', onKeyUp, false );

    }
    
    
}

export default FPSCamera;
