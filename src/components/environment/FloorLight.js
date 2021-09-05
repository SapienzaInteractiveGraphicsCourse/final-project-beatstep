import { DefaultGeneralLoadingManager } from '../Tools/GeneralLoadingManager';
import { hud } from '../player/HUD';

import light from '../../asset/models/floorLight/LUCE.glb';

import light_emissive from '../../asset/models/floorLight/LUCE_emissive.png';
import { Box3, Color, CylinderGeometry, SpotLight, Vector3 } from 'three';

const loader = DefaultGeneralLoadingManager.getHandler("texture");
const _floorLightTextureEmissive = loader.load(light_emissive);
_floorLightTextureEmissive.flipY=false;

const loaderGLTF = DefaultGeneralLoadingManager.getHandler("gltf");
let _floorLightModel;
const _floorLightHeight = 4;
const _floorLightEmissiveIntensity = 1.5;
let _floorLightSize;
let _cylinderGeometry;
loaderGLTF.load(light, (gltf)=>{
    _floorLightModel = gltf.scene;
    
    // Scale
    let boundingBox = new Box3().setFromObject(_floorLightModel).getSize(new Vector3());
    let scaleFactor = _floorLightHeight / boundingBox.y;
    _floorLightModel.scale.set(scaleFactor, scaleFactor, scaleFactor);
    _floorLightSize = new Box3().setFromObject(_floorLightModel).getSize(new Vector3());

    _cylinderGeometry = new CylinderGeometry(
        (boundingBox.x/2),
        (boundingBox.x/2),
        boundingBox.y,32);
    
    _cylinderGeometry.translate(0,boundingBox.y/2,0);
});

class FloorLight {
    constructor(x,y,z, rotation = 0, distance = 20, intensity = 0.8, color = 0xFFFFFF){
        this.group = _floorLightModel.clone(true);

        this.group.traverse(function (child) {
            if (child.isMesh){
                child.material = child.material.clone(true);
                child.material.emissive = new Color( 0xffffff );
                child.material.emissiveMap = _floorLightTextureEmissive;
                child.material.emissiveIntensity = _floorLightEmissiveIntensity;
                child.castShadow = true;
            } 
        });

        this.group.geometry = _cylinderGeometry;

        this._intensity = intensity;
        this.light = new SpotLight(color, intensity, distance);
        
        this.lightPosition = {
            x: x,
            y: y + _floorLightSize.y - _floorLightSize.y/20,
            z: z,
            r: -_floorLightSize.z/20
        }
        this.light.position.set(this.lightPosition.x,
                                this.lightPosition.y,
                                this.lightPosition.z + this.lightPosition.r);
                                
        // Size
        this.size = new Box3().setFromObject(this.group).getSize(new Vector3());
        this.setPosition(x,y,z);
        this.setRotation(rotation);
        
        // Interaction text
        // TODO: put in HUD
        // this._tipLight = document.createElement("p");
        // this._tipLight.innerText = "Press E to toggle the light";
        // this._tipLight.classList.add("tip");
        // this._tipLight.classList.add("hidden");
        // document.body.appendChild(this._tipLight);

        // Interaction + Collision
        this._canBeInteracted = false;
        document.addEventListener("keydown", ((event) => {
            if(this._canBeInteracted && event.key.toLowerCase() === "e") { // press e
                this.toggleLight();
            }
        }).bind(this));
        
        this.group.onCollision = ((collisionResult,obj,delta)=>{

            let backVec = collisionResult.normal.clone().multiplyScalar(collisionResult.penetration);
            // obj.position.add(backVec);

            // Don't allow the player to move inside the wall
            let dot = collisionResult.normal.dot(obj.movementEngine.displacement);
            if(dot < 0){
                backVec = collisionResult.normal.multiplyScalar(dot);
                obj.movementEngine.displacement.sub(backVec);
            }
            
            if(obj.name != "Player") return
            hud.caption.text = "Press E to toggle the light";
            hud.caption.owner = this;
            hud.caption.show = true;
            this._canBeInteracted = true;
            // this._tipLight.classList.remove("hidden");

        }).bind(this);

    }

    toggleLight(){
        if(this.group.children[0].material.emissiveIntensity == 0){
            // light is off, turn on
            this.light.intensity = this._intensity;
            this.group.children[0].material.emissiveIntensity = _floorLightEmissiveIntensity;
        }
        else {
            this.light.intensity = 0;
            this.group.children[0].material.emissiveIntensity = 0;
        }
    }

    update(delta){
        // Reset the caption if this object is the owner
        if(hud.caption.owner == this)
            hud.caption.show = false;
        // this._tipLight.classList.add("hidden");
        this._canBeInteracted = false;
    }

    setPosition(x,y,z){
        // Apply position
        this.group.position.set(x,y,z);
    }

    setRotation(alpha){
        this.group.rotation.y = alpha;
        this.light.position.set(this.lightPosition.x + this.lightPosition.r*Math.sin(alpha),
                                this.lightPosition.y,
                                this.lightPosition.z + this.lightPosition.r*Math.cos(alpha));
        this.light.target.position.set( this.lightPosition.x + Math.sin(alpha), 
                                        this.lightPosition.y, 
                                        this.lightPosition.z + Math.cos(alpha));
        this.light.target.updateMatrixWorld();
    }

    addToScene(scene){
        scene.add(this.group);
        scene.add(this.light);
        scene.add(this.light.target);
        // const helper = new THREE.SpotLightHelper( this.light );
        // scene.add( helper );
    }

    removeFromScene(scene){
        scene.remove(this.obj);
        scene.remove(this.light);
        scene.remove(this.light.target);
    }

}

export default FloorLight;