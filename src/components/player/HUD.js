import { THREE, camera } from "../setup/ThreeSetup";

class HUD {

    constructor(camera){
        this.camera = camera;
        this.objects = [];

        (function(scope){
            //creating rifle scope
            let lineMaterial = new THREE.LineBasicMaterial({ color: 0xffffff });
            let size = 0.001;
            let lineShape = new THREE.Shape()
                .moveTo(0, -size)
                .lineTo(0, size)
                .moveTo(-size, 0)
                .lineTo(size, 0);
            let lineGeom = new THREE.BufferGeometry().setFromPoints(lineShape.getPoints());
            scope.crosshairs = new THREE.LineSegments(lineGeom, lineMaterial);
            scope.crosshairs.position.set(0, 0, -0.11);
            scope.camera.add(scope.crosshairs);

            Object.defineProperty(scope.crosshairs,"show",{
                get: (function(){return this.visible}).bind(scope.crosshairs),
                set: (function(v){this.visible = Boolean(v)}).bind(scope.crosshairs)
            })

            scope.crosshairs.visible = false;
            scope.objects.push(scope.crosshairs);

        })(this);



        (function(scope){
            let body = document.body;

            let topOverlay = document.createElement("div")
            topOverlay.classList.add("top_overlay");
            body.appendChild(topOverlay);

            scope.topOverlay = topOverlay;

            scope.caption = document.createElement("div");
            scope.caption.innerText = "";
            scope.caption.classList.add("caption");
            document.body.appendChild(scope.caption);

            Object.defineProperties(scope.caption,{
                show: {
                    get: (function(){return this.style.display == "none" ? false : true}).bind(scope.caption),
                    set: (function(v){v == true ? (this.style.display = null) : (this.style.display = "none")}).bind(scope.caption)
                },
                text: {
                    get: (function(){return this.innerText}).bind(scope.caption),
                    set: (function(v){this.innerText = v}).bind(scope.caption)
                }
            })
            scope.caption.owner = null;

            scope.caption.show = false;
            scope.objects.push(scope.caption);

        })(this);

        this.createBar = (function(name, color, text = ""){
            if(this[name]) return; 
            let bar = document.createElement("div");
            bar.classList.add("stat_bar");
            bar.classList.add(color);            

            bar.label = document.createElement("div");
            bar.label.classList.add("bar_text");
            bar.label.innerText = text;
            bar.appendChild(bar.label);

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

            bar.show = false;
            this.topOverlay.appendChild(bar);
            this[name] = bar;
            this.objects.push(bar);
        }).bind(this)

        
    }

    show(){
        for(let o of this.objects){
            o.show = true;
        }
    }

    hide(){
        for(let o of this.objects){
            o.show = false;
        }
    }


}

const hud = new HUD(camera);
export {HUD as default, hud };