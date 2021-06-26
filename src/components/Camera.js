import { UniversalCamera } from "@babylonjs/core/Cameras/universalCamera"
import { Tools } from "@babylonjs/core/Misc/tools";
import { Vector3 } from "@babylonjs/core/Maths/math";
import { PointerEventTypes } from "@babylonjs/core/Events/pointerEvents";

class FPSCamera extends UniversalCamera {

    constructor(name, position, scene) {
        super(name, position, scene);

        this.inputs.clear();
        this.inputs.add(new FPSKeyboardCameraInput());
        this.inputs.add(new FPSMouseCameraInput(true));

        this.minZ = 0.0001;
        this.speed = 0.12;
        this.inertia = 0.7;
        this.angularSensibility = 6500;
        this.angularSpeed = 0.05;
        this.angle = Math.PI / 2;
        this.direction = new Vector3(Math.cos(this.angle), 0, Math.sin(this.angle));
        this.canGetPointerLock = false;
    }

}

class FPSKeyboardCameraInput {
    constructor() {
        this._keys = [];
        this.keysUp = [83];
        this.keysDown = [87];
        this.keysLeft = [65];
        this.keysRight = [68];
    }

    // Add attachment controls
    attachControl(noPreventDefault) {
        var _this = this;
        var engine = this.camera.getEngine();
        var element = engine.getInputElement();
        if (!this._onKeyDown) {
            element.tabIndex = 1;
            this._onKeyDown = function (evt) {
                if (_this.keysUp.indexOf(evt.keyCode) !== -1 ||
                    _this.keysDown.indexOf(evt.keyCode) !== -1 ||
                    _this.keysLeft.indexOf(evt.keyCode) !== -1 ||
                    _this.keysRight.indexOf(evt.keyCode) !== -1) {
                    var index = _this._keys.indexOf(evt.keyCode);
                    if (index === -1) {
                        _this._keys.push(evt.keyCode);
                    }
                    if (!noPreventDefault) {
                        evt.preventDefault();
                    }
                }
            };
            this._onKeyUp = function (evt) {
                if (_this.keysUp.indexOf(evt.keyCode) !== -1 ||
                    _this.keysDown.indexOf(evt.keyCode) !== -1 ||
                    _this.keysLeft.indexOf(evt.keyCode) !== -1 ||
                    _this.keysRight.indexOf(evt.keyCode) !== -1) {
                    var index = _this._keys.indexOf(evt.keyCode);
                    if (index >= 0) {
                        _this._keys.splice(index, 1);
                    }
                    if (!noPreventDefault) {
                        evt.preventDefault();
                    }
                }
            };
            element.addEventListener("keydown", this._onKeyDown, false);
            element.addEventListener("keyup", this._onKeyUp, false);
        }
    }

    // Keys movement control by checking inputs
    checkInputs() {
        if (this._onKeyDown) {
            var camera = this.camera;
            for (var index = 0; index < this._keys.length; index++) {
                var keyCode = this._keys[index];
                var speed = camera.speed;
                if (this.keysLeft.indexOf(keyCode) !== -1) {
                    camera.direction.copyFromFloats(-speed, 0, 0);
                }
                else if (this.keysUp.indexOf(keyCode) !== -1) {
                    camera.direction.copyFromFloats(0, 0, -speed);
                }
                else if (this.keysRight.indexOf(keyCode) !== -1) {
                    camera.direction.copyFromFloats(speed, 0, 0);
                }
                else if (this.keysDown.indexOf(keyCode) !== -1) {
                    camera.direction.copyFromFloats(0, 0, speed);
                }
                if (camera.getScene().useRightHandedSystem) {
                    camera.direction.z *= -1;
                }
                let rotx = camera.rotation.x
                camera.rotation.x = 0;
                camera.getViewMatrix().invertToRef(camera._cameraTransformMatrix);
                Vector3.TransformNormalToRef(camera.direction, camera._cameraTransformMatrix, camera._transformedDirection);
                //camera.cameraDirection.addInPlace(camera._transformedDirection);
                camera.cameraDirection.copyFrom(camera._transformedDirection);
                camera.rotation.x = rotx;
            }
        }
    }

    detachControl() {
        var engine = this.camera.getEngine();
        var element = engine.getInputElement();
        if (this._onKeyDown) {
            element.removeEventListener("keydown", this._onKeyDown);
            element.removeEventListener("keyup", this._onKeyUp);
            Tools.UnregisterTopRootEvents([
                { name: "blur", handler: this._onLostFocus }
            ]);
            this._keys = [];
            this._onKeyDown = null;
            this._onKeyUp = null;
        }
    }

    _onLostFocus(e) {
        this._keys = [];
    }
    getClassName() {
        return "FPSKeyboardCameraInput";
    }
    getSimpleName() {
        return "FPSKeyboard";
    }
}

class FPSMouseCameraInput {

    constructor(touchEnabled) {
        if (touchEnabled === void 0) { touchEnabled = true; }
        this.touchEnabled = touchEnabled;
        this.buttons = [0, 1, 2];
        this.angularSensibility = 2000.0;
        this.restrictionX = 1000;
        this.restrictionY = 1000;
    }

    attachControl(noPreventDefault) {
        var _this = this;
        var camera = this.camera;
        var engine = camera.getEngine();
        var scene = camera.getScene();
        var element = engine.getInputElement();
        var angle = { x: 0, y: 0 };
        if (!this._pointerInput) {
            this._pointerInput = function (p, s) {
                if(camera.canGetPointerLock){
                    scene.getEngine().enterPointerlock();
                }
            }
        }
        this._onSearchMove = function (evt) {
            if (!engine.isPointerLock) {
                return;
            }
            var offsetX = evt.movementX || evt.mozMovementX || evt.webkitMovementX || evt.msMovementX || 0;
            var offsetY = evt.movementY || evt.mozMovementY || evt.webkitMovementY || evt.msMovementY || 0;
            if (_this.camera.getScene().useRightHandedSystem) {
                _this.camera.cameraRotation.y -= offsetX / _this.angularSensibility;
            }
            else {
                _this.camera.cameraRotation.y += offsetX / _this.angularSensibility;
            }
            _this.camera.cameraRotation.x += offsetY / _this.angularSensibility;
            _this.previousPosition = null;
            if (!noPreventDefault) {
                evt.preventDefault();
            }
        };
        this._observer = this.camera.getScene().onPointerObservable.add(this._pointerInput, PointerEventTypes.POINTERDOWN);
        element.addEventListener("mousemove", this._onSearchMove, false);
    }


    detachControl() {
        var engine = this.camera.getEngine();
        var element = engine.getInputElement();
        if (this._observer && element) {
            this.camera.getScene().onPointerObservable.remove(this._observer);
            element.removeEventListener("mousemove", this._onSearchMove);
            this._observer = null;
            this._onSearchMove = null;
            this.previousPosition = null;
        }
    }

    getClassName() {
        return "FPSMouseCameraInput";
    }

    getSimpleName() {
        return "FPSMouse";
    }
}

export default FPSCamera;