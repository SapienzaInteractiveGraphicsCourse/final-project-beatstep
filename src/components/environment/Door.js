  
import { THREE } from '../setup/ThreeSetup';
import { DefaultGeneralLoadingManager } from '../Tools/GeneralLoadingManager';
import { hud } from '../player/HUD';

import door from '../../asset/models/door/doorSquared.glb';

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
        let boundingBox = new THREE.Box3().setFromObject(this.group).getSize();
        let scaleFactor = height / boundingBox.y;
        this.group.scale.set(scaleFactor, scaleFactor, scaleFactor);
        let _doorSize = new THREE.Box3().setFromObject(_doorModel).getSize();

        let _doorCollisionGeometry = new THREE.BoxGeometry( _doorSize.x,
                                                            _doorSize.y,
                                                            _doorSize.z+12);
        _doorCollisionGeometry.translate(0,_doorSize.y/2,0);

        this.group.geometry = _doorCollisionGeometry;

        this.door_r = this.group.getObjectByName("door_r");
        this.door_l = this.group.getObjectByName("door_l");

        // Adding geometry of doors
        let _door_l_CollisionGeometry = new THREE.BoxGeometry( _doorSize.x/4,
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

        // We need one mixer for each animated object in the scene
        this.mixer = new THREE.AnimationMixer(this.group);
        // Set final position when animation ends
        this.mixer.addEventListener('finished', (e) => {
            // checking if finalCoords exists
            if(e.action.finalCoords){
                e.action.stop();
                if(e.action.finalCoords.positions)
                    for(let objPosition of e.action.finalCoords.positions){
                        objPosition.obj.position.set(...objPosition.value.toArray());
                    }
                if(e.action.finalCoords.rotations)
                    for(let objRotation of e.action.finalCoords.rotations){
                        objRotation.obj.quaternion.set(...objRotation.value.toArray());
                    }
            }

        });

        this.animation_openDoors = this.createOpenAnimation();
        this.animation_closeDoors = this.createCloseAnimation();

        // this.group.onCollision = function(collisionResult,obj,delta){
        //     if(!this.isOpen){
        //         // Move back the player if he penetrated into the wall
        //         let backVec = collisionResult.normal.clone().multiplyScalar(collisionResult.penetration);
        //         obj.position.add(backVec);

        //         // Don't allow the player to move inside the wall
        //         let dot = collisionResult.normal.dot(obj.movementEngine.displacement);
        //         if(dot < 0){
        //             backVec = collisionResult.normal.multiplyScalar(dot);
        //             obj.movementEngine.displacement.sub(backVec);
        //         }
        //     }
        // }.bind(this);

        // Interaction
        this._canBeInteracted = false;
        document.addEventListener("keydown", ((event) => {
            if(this._canBeInteracted && event.key.toLowerCase() === "e") { // press e
                if(!this.isOpen) this.openDoor();
                else this.closeDoor();
            }
        }).bind(this));

        this.group.onCollision = function(collisionResult,obj,delta){
            hud.caption.text = `Press E to ${this.isOpen ? "close" : "open"} the door`;
            hud.caption.owner = this;
            hud.caption.show = true;
            if(obj.constructor.name === "Player") this._canBeInteracted = true;
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
        // this.door_l.onCollision = function(collisionResult,obj,delta){
        //     // Move back the player if he penetrated into the wall
        //     let backVec = collisionResult.normal.clone().multiplyScalar(collisionResult.penetration);
        //     obj.position.add(backVec);

        //     // Don't allow the player to move inside the wall
        //     let dot = collisionResult.normal.dot(obj.movementEngine.displacement);
        //     if(dot < 0){
        //         backVec = collisionResult.normal.multiplyScalar(dot);
        //         obj.movementEngine.displacement.sub(backVec);
        //     }
        // }.bind(this);


        // TODO: debug animation, to remove
        // document.addEventListener("mousedown",((event)=>{
        //     if(event.button == 1){ // wheel
        //         // this.openDoor();
        //         if(!this.isOpen) this.openDoor();
        //         else this.closeDoor();
        //     }
        // }).bind(this));
        
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
        // Update every animation
        this.mixer.update(delta);
        // Reset the caption if this object is the owner
        if(hud.caption.owner == this)
            hud.caption.show = false;
    }

    startAnimation(anim) {
        if(anim){
            anim.reset();
            anim.play();
        }
    }

    createOpenAnimation(){
        let door_r_p1 = this.door_r.position.clone();
        let door_l_p1 = this.door_l.position.clone();
        
        let door_r_p2 = this.incrementEuler(door_r_p1, -0.8, 0,0);
        let door_l_p2 = this.incrementEuler(door_l_p1, 0.8, 0,0);

        const door_r_translation = new THREE.VectorKeyframeTrack(
            'door_r.position',
            [0, 0.5],
            [...door_r_p1.toArray(),
             ...door_r_p2.toArray()],
        );
        const door_l_translation = new THREE.VectorKeyframeTrack(
            'door_l.position',
            [0, 0.5],
            [...door_l_p1.toArray(),
             ...door_l_p2.toArray()],
        );

        const clip = new THREE.AnimationClip('doorsOpen_clip', -1, [
            door_r_translation,door_l_translation
        ]);

        let animation = this.mixer.clipAction(clip);
        animation.loop = THREE.LoopOnce;
        animation.enabled = false;
        animation.clampWhenFinished = false;
        animation.finalCoords = {
            positions: [
                {obj:this.door_r,value:door_r_p2},
                {obj:this.door_l,value:door_l_p2}
            ],
            rotations: [],
        };

        return animation;

    }

    createCloseAnimation(){
        let door_r_p2 = this.door_r.position.clone();
        let door_l_p2 = this.door_l.position.clone();

        let door_r_p1 = this.incrementEuler(door_r_p2, -0.8, 0,0);
        let door_l_p1 = this.incrementEuler(door_l_p2, 0.8, 0,0);

        const door_r_translation = new THREE.VectorKeyframeTrack(
            'door_r.position',
            [0, 0.5],
            [...door_r_p1.toArray(),
             ...door_r_p2.toArray()],
        );
        const door_l_translation = new THREE.VectorKeyframeTrack(
            'door_l.position',
            [0, 0.5],
            [...door_l_p1.toArray(),
             ...door_l_p2.toArray()],
        );

        const clip = new THREE.AnimationClip('doorsClose_clip', -1, [
            door_r_translation,door_l_translation
        ]);

        let animation = this.mixer.clipAction(clip);
        animation.loop = THREE.LoopOnce;
        animation.enabled = false;
        animation.clampWhenFinished = false;
        animation.finalCoords = {
            positions: [
                {obj:this.door_r,value:door_r_p2},
                {obj:this.door_l,value:door_l_p2}
            ],
            rotations: [],
        };

        return animation;

    }

    incrementEuler(e, dx,dy,dz){
        return new THREE.Vector3(e.x+dx,e.y+dy,e.z+dz);
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