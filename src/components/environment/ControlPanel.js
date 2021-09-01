  import { THREE } from '../setup/ThreeSetup';
import { DefaultGeneralLoadingManager } from '../Tools/GeneralLoadingManager';
import { hud } from '../player/HUD';

import controlPanel from '../../asset/models/controlPanel/controlPanel.glb';

const loader = DefaultGeneralLoadingManager.getHandler("gltf");
let _controlPanelModel;

loader.load(controlPanel, (gltf)=>{
    gltf.scene.traverse(function(node){
        if(node.isMesh){ 
            //node.castShadow = true;
            node.receiveShadow = true;
            node.material.emissive = new THREE.Color( 0xffffff );
            node.material.emissiveIntensity = 0.1;
        }
    });
    _controlPanelModel = gltf.scene;

});


class ControlPanel {
    constructor(x,y,z,height = 5,rotationRadians=0){
        this.group = _controlPanelModel.clone(true);

        // Scale
        let boundingBox = new THREE.Box3().setFromObject(this.group).getSize(new THREE.Vector3());
        let scaleFactor = height / boundingBox.y;
        this.group.scale.set(scaleFactor, scaleFactor, scaleFactor);
        let _controlPanelSize = new THREE.Box3().setFromObject(_controlPanelModel).getSize(new THREE.Vector3());

        let _controlPanelCollisionGeometry = new THREE.BoxGeometry( _controlPanelSize.x,
                                                                    _controlPanelSize.y,
                                                                    _controlPanelSize.z);
        _controlPanelCollisionGeometry.translate(0,_controlPanelSize.y/2,0);

        this.group.geometry = _controlPanelCollisionGeometry;

        // Size
        this.size = _controlPanelSize;

        this.setPosition(x,y,z);
        this.setRotation(rotationRadians);


        // Interaction
        this._canBeInteracted = false;
        document.addEventListener("keydown", ((event) => {
            if(this._canBeInteracted && event.key.toLowerCase() === "e") { // press e
                // TODO: interaction
            }
        }).bind(this));

        this.group.onCollision = function(collisionResult,obj,delta){
            if(obj.constructor.name != "Player") return
            hud.caption.text = `Press E to shutdown the simulation`;
            hud.caption.owner = this;
            hud.caption.show = true;
            this._canBeInteracted = true;

            // Move back the player if he penetrated into the wall
            let backVec = collisionResult.normal.clone().multiplyScalar(collisionResult.penetration);
            obj.position.add(backVec);

            // Don't allow the player to move inside the wall
            let dot = collisionResult.normal.dot(obj.movementEngine.displacement);
            if(dot < 0){
                backVec = collisionResult.normal.multiplyScalar(dot);
                obj.movementEngine.displacement.sub(backVec);
            }
        }.bind(this);
        
    }

    addToScene(scene){
        scene.add(this.group);
    }

    update(delta){
        // Reset the caption if this object is the owner
        this._canBeInteracted = false;
        if(hud.caption.owner == this)
            hud.caption.show = false;
        
    }

    setPosition(x,y,z){
        // Apply position
        this.group.position.set(x,y,z);
    }

    setRotation(alpha){
        this.group.rotation.y = alpha;
    }
}

export default ControlPanel;