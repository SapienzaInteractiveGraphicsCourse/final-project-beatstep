import { UniversalCamera } from "@babylonjs/core/Cameras/universalCamera"
import { Tools } from "@babylonjs/core/Misc/tools";
import { Vector3 } from "@babylonjs/core/Maths/math";

class FPSCamera extends UniversalCamera{

    constructor(name, position, scene){
        super(name, position, scene);

        this.inputs.clear();
        this.inputs.add(new FPSCameraInput());

        this.minZ = 0.0001;
        this.speed = 0.2;
        this.angularSensibility = 6000;
        this.angularSpeed = 0.05;
        this.angle = Math.PI/2;
        this.direction = new Vector3(Math.cos(this.angle), 0, Math.sin(this.angle));
    }

}

class FPSCameraInput{
    constructor(){
        this._keys = [];
        this.keysUp = [83];
        this.keysDown = [87];
        this.keysLeft = [65];
        this.keysRight = [68];
    }

    // Add attachment controls
    attachControl(noPreventDefault){
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
    checkInputs(){
        if (this._onKeyDown) {
            var camera = this.camera;
            for (var index = 0; index < this._keys.length; index++) {
                var keyCode = this._keys[index];
                var speed = camera.speed;
                if (this.keysLeft.indexOf(keyCode) !== -1) {
                    camera.rotation.y -= camera.angularSpeed;
                    camera.direction.copyFromFloats(0, 0, 0);                
                }
                else if (this.keysUp.indexOf(keyCode) !== -1) {
                    camera.direction.copyFromFloats(0, 0, speed);               
                }
                else if (this.keysRight.indexOf(keyCode) !== -1) {
                    camera.rotation.y += camera.angularSpeed;
                    camera.direction.copyFromFloats(0, 0, 0);
                }
                else if (this.keysDown.indexOf(keyCode) !== -1) {
                    camera.direction.copyFromFloats(0, 0, -speed);
                }
                if (camera.getScene().useRightHandedSystem) {
                    camera.direction.z *= -1;
                }
                camera.getViewMatrix().invertToRef(camera._cameraTransformMatrix);
                Vector3.TransformNormalToRef(camera.direction, camera._cameraTransformMatrix, camera._transformedDirection);
                camera.cameraDirection.addInPlace(camera._transformedDirection);
            }
        }
    }

    detachControl(){
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
    getClassName(){
        return "FPSCameraInput";
    }
    getSimpleName(){
        return "fpsinput";
    }
}

export default FPSCamera;