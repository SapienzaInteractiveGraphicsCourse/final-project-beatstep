import {
    Euler,
    EventDispatcher,
    Vector3
} from 'three';

const _euler = new Euler(0, 0, 0, 'YXZ');
const _vector = new Vector3();

const _changeEvent = { type: 'change' };
const _lockEvent = { type: 'lock' };
const _unlockEvent = { type: 'unlock' };

const _PI_2 = Math.PI / 2;

class PointerLockControlsPlus extends EventDispatcher {

    constructor(camera, domElement, angularSensitivity) {

        super();

        if (domElement === undefined) {

            //console.warn( 'THREE.PointerLockControls: The second parameter "domElement" is now mandatory.' );
            domElement = document.body;

        }

        this.domElement = domElement;
        this.isLocked = false;
        this.shouldLock = false;
        
        // Control movement
        this.shouldMoveForward = false;
        this.shouldMoveBackward = false;
        this.shouldMoveLeft = false;
        this.shouldMoveRight = false;
        this.shouldJump = false;

        // Set to constrain the pitch of the camera
        // Range is 0 to Math.PI radians
        this.minPolarAngle = 0; // radians
        this.maxPolarAngle = Math.PI; // radians

        this.angularSensitivity = angularSensitivity || 0.002;

        const scope = this;

        function onMouseDown(event) {
            if (scope.shouldLock && event.button == 0)
                scope.lock();

            if(event.button == 0){ // shoot

            }
        }

        function onKeyDown ( event ) {

			event.preventDefault();

			switch ( event.code ) {

				case 'ArrowUp':
				case 'KeyW': scope.shouldMoveForward = true; break;

				case 'ArrowLeft':
				case 'KeyA': scope.shouldMoveLeft = true; break;

				case 'ArrowDown':
				case 'KeyS': scope.shouldMoveBackward = true; break;

				case 'ArrowRight':
				case 'KeyD': scope.shouldMoveRight = true; break;

                case 'Space': scope.shouldJump = true; break;

			}

		}

		function onKeyUp(event) {

			switch ( event.code ) {

				case 'ArrowUp':
				case 'KeyW': scope.shouldMoveForward = false; break;

				case 'ArrowLeft':
				case 'KeyA': scope.shouldMoveLeft = false; break;

				case 'ArrowDown':
				case 'KeyS': scope.shouldMoveBackward = false; break;

				case 'ArrowRight':
				case 'KeyD': scope.shouldMoveRight = false; break;

                case 'Space': scope.shouldJump = false; break;

			}

		}

        function onMouseMove(event) {

            if (scope.isLocked === false) return;

            const movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
            const movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;

            _euler.setFromQuaternion(camera.quaternion);

            _euler.y -= movementX * scope.angularSensitivity;
            _euler.x -= movementY * scope.angularSensitivity;

            _euler.x = Math.max(_PI_2 - scope.maxPolarAngle, Math.min(_PI_2 - scope.minPolarAngle, _euler.x));

            camera.quaternion.setFromEuler(_euler);

            scope.dispatchEvent(_changeEvent);

        }

        function onPointerlockChange() {

            if (scope.domElement.ownerDocument.pointerLockElement === scope.domElement) {

                scope.dispatchEvent(_lockEvent);

                scope.isLocked = true;

            } else {

                scope.dispatchEvent(_unlockEvent);

                scope.isLocked = false;

            }

        }

        function onPointerlockError() {
            console.error('THREE.PointerLockControls: Unable to use Pointer Lock API');
        }

        this.connect = function () {
            
            scope.domElement.ownerDocument.addEventListener( 'mousedown', onMouseDown );
            window.addEventListener( 'keydown', onKeyDown, false );
            window.addEventListener( 'keyup', onKeyUp, false );
            scope.domElement.ownerDocument.addEventListener('mousemove', onMouseMove);
            scope.domElement.ownerDocument.addEventListener('pointerlockchange', onPointerlockChange);
            scope.domElement.ownerDocument.addEventListener('pointerlockerror', onPointerlockError);
        };

        this.disconnect = function () {

            scope.domElement.ownerDocument.removeEventListener( 'mousedown', onMouseDown );
            window.removeEventListener( 'keydown', onKeyDown, false );
            window.removeEventListener( 'keyup', onKeyUp, false );
            scope.domElement.ownerDocument.removeEventListener('mousemove', onMouseMove);
            scope.domElement.ownerDocument.removeEventListener('pointerlockchange', onPointerlockChange);
            scope.domElement.ownerDocument.removeEventListener('pointerlockerror', onPointerlockError);
        };

        this.dispose = function () {
            this.disconnect();
        };

        this.getObject = function () { // retaining this method for backward compatibility
            return camera;
        };

        this.getDirection = function () {
            const direction = new Vector3(0, 0, - 1);

            return function (v) {
                return v.copy(direction).applyQuaternion(camera.quaternion);
            };

        }();

        this.moveForward = function (distance) {

            // move forward parallel to the xz-plane
            // assumes camera.up is y-up

            _vector.setFromMatrixColumn(camera.matrix, 0);

            _vector.crossVectors(camera.up, _vector);

            camera.position.addScaledVector(_vector, distance);

        };

        this.moveRight = function (distance) {

            _vector.setFromMatrixColumn(camera.matrix, 0);

            camera.position.addScaledVector(_vector, distance);

        };

        this.moveUp = function (distance) {
            camera.position.addScaledVector(camera.up, distance);
        }

        this.lock = function () {

            this.domElement.requestPointerLock();

        };

        this.unlock = function () {

            scope.domElement.ownerDocument.exitPointerLock();

        };

        this.connect();

    }

}

export { PointerLockControlsPlus };