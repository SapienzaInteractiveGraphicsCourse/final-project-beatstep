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
const _moveForwardEvent = { type: 'moveforward', distance: 0 };
const _moveRightEvent = { type: 'moveright', distance: 0 };
const _moveUpEvent = { type: 'moveup', distance: 0 };

const _PI_2 = Math.PI / 2;

class CameraControls extends EventDispatcher {

    constructor(camera, canvas, angularSensitivity) {

        super();
        this.camera = camera;
        this.canvas = canvas;
        this.isLocked = false;
        this.shouldLock = false;

        // Set to constrain the pitch of the camera
        // Range is 0 to Math.PI radians
        this.minPolarAngle = 0; // radians
        this.maxPolarAngle = Math.PI; // radians

        this.angularSensitivity = angularSensitivity || 0.002;

        const scope = this;

        function onMouseDown(event) {
            if (scope.shouldLock && event.button == 0)
                scope.lock();
        }

        function onMouseMove(event) {
            if (scope.isLocked === false) return;
            const movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
            const movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;

            _euler.setFromQuaternion(camera.quaternion);
            _euler.y -= movementX * scope.angularSensitivity;
            _euler.x -= movementY * scope.angularSensitivity;
            _euler.x = Math.max(_PI_2 - scope.maxPolarAngle, Math.min(_PI_2 - scope.minPolarAngle, _euler.x));

            object.quaternion.setFromEuler(_euler);

            scope.dispatchEvent(_changeEvent);

        }

        function onPointerlockChange() {
            if (document.pointerLockElement === scope.canvas) {
                scope.dispatchEvent(_lockEvent);
                scope.isLocked = true;
            } else {
                scope.dispatchEvent(_unlockEvent);
                scope.isLocked = false;
            }
        }

        function onPointerlockError(e) {
            console.error('THREE.PointerLockControls: Unable to use Pointer Lock API');
            console.error(e);
        }

        this.connect = function () {
            window.addEventListener('mousedown', onMouseDown );
            window.addEventListener('keydown', onKeyDown, false );
            window.addEventListener('keyup', onKeyUp, false );
            window.addEventListener('mousemove', onMouseMove);
            window.addEventListener('pointerlockchange', onPointerlockChange);
            window.addEventListener('pointerlockerror', onPointerlockError);
        };

        this.disconnect = function () {
            window.removeEventListener('mousedown', onMouseDown );
            window.removeEventListener('keydown', onKeyDown, false );
            window.removeEventListener('keyup', onKeyUp, false );
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('pointerlockchange', onPointerlockChange);
            window.removeEventListener('pointerlockerror', onPointerlockError);
        };

    }




}
