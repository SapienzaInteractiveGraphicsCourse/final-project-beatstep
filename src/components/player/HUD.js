import * as THREE from 'three';

class HUD {

    constructor(camera){
        this.camera = camera;

        //creating rifle scope
        let lineMaterial = new THREE.LineBasicMaterial({ color: 0xffffff });
        let size = 0.001;
        let lineShape = new THREE.Shape()
            .moveTo(0, -size)
            .lineTo(0, size)
            .moveTo(-size, 0)
            .lineTo(size, 0);
        let lineGeom = new THREE.BufferGeometry().setFromPoints(lineShape.getPoints());
        this.line = new THREE.LineSegments(lineGeom, lineMaterial);
        this.line.position.set(0, 0, -0.11);

        this.line.visible = false;
        this.camera.controls.addEventListener("lock", function (e) {
            this.line.visible = true;
        }.bind(this));
        this.camera.controls.addEventListener("unlock", function (e) {
            this.line.visible = false;
        }.bind(this));
        
        this.camera.add(this.line);

    }


}

export default HUD;