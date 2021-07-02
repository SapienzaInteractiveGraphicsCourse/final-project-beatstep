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




        (function(scope){
            let body = document.body;

            let overlay = document.createElement("div")
            overlay.classList.add("overlay");
            body.appendChild(overlay);

            scope.overlay = overlay;

        })(this);

        this.createBar = (function(name, color){
            let bar = document.createElement("div");
            bar.classList.add("stat_bar");
            bar.classList.add(color);
            this.overlay.appendChild(bar);

            bar.indicator = document.createElement("div");
            bar.indicator.classList.add("bar");
            bar.appendChild(bar.indicator);


            bar.subIndicator = document.createElement("div");
            bar.subIndicator.classList.add("bar");
            bar.subIndicator.classList.add("sub_bar");
            bar.appendChild(bar.subIndicator);

            bar.setPercentage = function(p){
                bar.indicator.style.width = `${Number(p)}%`;
                bar.subIndicator.style.width = `${Number(p)}%`;
            }

            Object.defineProperty(bar,"show",{
                get: (function(){return this.style.display == "none" ? false : true}).bind(bar),
                set: (function(v){v == true ? (this.style.display = null) : (this.style.display = "none")}).bind(bar)
            })

            this[name] = bar;
        }).bind(this)

        this.createBar("healthBar","green");
        this.healthBar.setPercentage(100);
        this.createBar("shieldBar","blue");
        this.shieldBar.setPercentage(100);
        this.createBar("ammoBar","red");
        this.ammoBar.setPercentage(100);


    }


}

export default HUD;