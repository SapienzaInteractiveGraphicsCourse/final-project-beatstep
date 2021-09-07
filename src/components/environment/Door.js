  
import { DefaultGeneralLoadingManager } from '../Tools/GeneralLoadingManager';
import { hud } from '../player/HUD';

import door from '../../asset/models/door/doorSquared.glb';
import { AnimationClip, AnimationMixer, Box3, BoxGeometry, LoopOnce, Vector3, VectorKeyframeTrack } from 'three';
import TWEEN from '@tweenjs/tween.js';

const loader = DefaultGeneralLoadingManager.getHandler("gltf");
let _doorModel;
// const _doorHeight = 5;
// let _doorSize;
// let _doorCollisionGeometry;
loader.load(door, (gltf)=>{
    gltf.scene.traverse(function(node){
        if(node.isMesh) node.castShadow = true;
    });
    _doorModel = gltf.scene;
    
    // _doorCollisionGeometry.translate(0,...,0);

});


class Door {
    constructor(x,y,z,height = 5,rotationRadians=0){
        this.group = _doorModel.clone(true);

        // Scale
        let boundingBox = new Box3().setFromObject(this.group).getSize(new Vector3());
        let scaleFactor = height / boundingBox.y;
        this.group.scale.set(scaleFactor, scaleFactor, scaleFactor);
        let _doorSize = new Box3().setFromObject(_doorModel).getSize(new Vector3());

        let _doorCollisionGeometry = new BoxGeometry( _doorSize.x,
                                                            _doorSize.y,
                                                            _doorSize.z+24);
        _doorCollisionGeometry.translate(0,_doorSize.y/2,0);

        this.group.geometry = _doorCollisionGeometry;

        this.door_r = this.group.getObjectByName("door_r");
        this.door_l = this.group.getObjectByName("door_l");
        
        let eulerToJSON = (e) => ({x:e.x,y:e.y,z:e.z});
        this.door_r.defaultPosition = eulerToJSON(this.door_r.position.clone());
        this.door_l.defaultPosition = eulerToJSON(this.door_l.position.clone());

        // Adding geometry of doors
        let _door_l_CollisionGeometry = new BoxGeometry( _doorSize.x/4,
            _doorSize.y/4,
            _doorSize.z);
        _door_l_CollisionGeometry.translate(0,0,0);

        this.door_r.collisionGeometry = _door_l_CollisionGeometry;
        this.door_l.collisionGeometry = _door_l_CollisionGeometry;

        // Size
        this.size = _doorSize;

        this.setPosition(x,y,z);
        this.setRotation(rotationRadians);

        this.isOpen = false;

        /** Animations */
        this._tweenAnimations = new TWEEN.Group();
        this.animation_openDoors = this.createOpenAnimation();
        this.animation_closeDoors = this.createCloseAnimation();
        /** Internal timer for Tween's animations */
        this.internalTimer = 0;

        // Interaction
        this._canBeInteracted = false;
        document.addEventListener("keydown", ((event) => {
            if(this._canBeInteracted && event.key.toLowerCase() === "e") { // press e
                if(!this.isOpen){ 
                    this.isOpen = true;
                    this.startAnimation(this.animation_openDoors);
                }
                else{
                    this.isOpen = false;
                    this.startAnimation(this.animation_closeDoors);
                }
            }
        }).bind(this));

        this.group.onCollision = function(collisionResult,obj,delta){
            if(obj.name != "Player") return
            hud.caption.text = `Press E to ${this.isOpen ? "close" : "open"} the door`;
            hud.caption.owner = this;
            hud.caption.show = true;
            this._canBeInteracted = true;
        }.bind(this);
        
        this.door_l.onCollision = this.door_r.onCollision = function(collisionResult,obj,delta){
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

    reset(){
        this.isOpen = false;
        this._canBeInteracted = false;
        // Reset door animation
        let resetPositions = this.createGeneralTranslationDoor({}, 0).onComplete(()=>{
            /** Internal timer for Tween's animations */
            this.internalTimer = 0;
        });
        this.startAnimation(resetPositions);
    }

    addToScene(scene){
        scene.add(this.group);
    }

    openDoor(){
        this.startAnimation(this.animation_openDoors);
        this.isOpen = true;
    }

    closeDoor(){
        this.startAnimation(this.animation_closeDoors);
        this.isOpen = false;
    }

    update(delta){
        // Update animations
        this.internalTimer += delta*1000;
        this._tweenAnimations.update(this.internalTimer);
        // Reset the caption if this object is the owner
        this._canBeInteracted = false;
        if(hud.caption.owner == this)
            hud.caption.show = false;
        
    }

    startAnimation(anim) {
        if (!anim) return;
        this._tweenAnimations.removeAll();
        anim.start(this.internalTimer);
    }

    createOpenAnimation(){
        return this.createGeneralTranslationDoor({
            door_r: {
                x:this.door_r.defaultPosition.x-0.8,
                y:this.door_r.defaultPosition.y,
                z:this.door_r.defaultPosition.z,
            },
            door_l: {
                x:this.door_l.defaultPosition.x+0.8,
                y:this.door_l.defaultPosition.y,
                z:this.door_l.defaultPosition.z,
            },
        },500);

    }

    createCloseAnimation(){
        return this.createGeneralTranslationDoor({},500);

    }

    createGeneralTranslationDoor(translationParams, generalVelocityMilliseconds = 1000, generalEasing = TWEEN.Easing.Linear.None){
        let velocity = generalVelocityMilliseconds;
        
        let door_r = new TWEEN.Tween(this.door_r.position, this._tweenAnimations)
        .to(translationParams.door_r || this.door_r.defaultPosition, velocity).easing(generalEasing)
        .onStart(()=>{

            let door_l = new TWEEN.Tween(this.door_l.position, this._tweenAnimations)
            .to(translationParams.door_l || this.door_l.defaultPosition, velocity).start(this.internalTimer);

        });

        return door_r;
    }

    setPosition(x,y,z){
        // Apply position
        this.group.position.set(x,y,z);
    }

    setRotation(alpha){
        this.group.rotation.y = alpha;
    }
}

export default Door;