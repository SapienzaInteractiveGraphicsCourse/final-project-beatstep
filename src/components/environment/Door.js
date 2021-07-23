import { THREE } from '../setup/ThreeSetup';
import { DefaultGeneralLoadingManager } from '../Tools/GeneralLoadingManager';

import door from '../../asset/models/door/door.glb';

const loader = DefaultGeneralLoadingManager.getHandler("gltf");
let _doorModel;
const _doorHeight = 3;
let _doorSize;
let _doorCollisionGeometry;
loader.load(door, (gltf)=>{
    _doorModel = gltf.scene;
    // Scale
    let boundingBox = new THREE.Box3().setFromObject(_doorModel).getSize();
    let scaleFactor = _doorHeight / boundingBox.y;
    _doorModel.scale.set(scaleFactor, scaleFactor, scaleFactor);
    _doorSize = new THREE.Box3().setFromObject(_doorModel).getSize();
    _doorCollisionGeometry = new THREE.BoxGeometry(_doorSize.x,
                                                    _doorSize.y,
                                                    _doorSize.z);
    // _doorCollisionGeometry.translate(0,...,0);

});


class Door {
    constructor(){
        this.group = _doorModel.clone(true);

        this.door_r = this.group.getObjectByName("door_r");
        this.door_l = this.group.getObjectByName("door_l");

        console.log(this.group)

        // Size
        this.size = new THREE.Box3().setFromObject(this.group).getSize();

        // We need one mixer for each animated object in the scene
        this.mixer = new THREE.AnimationMixer(this.group);

        this.animation_openDoors = this.createOpenAnimation();

        // TODO: debug animation, to remove
        document.addEventListener("mousedown",((event)=>{
            if(event.button == 1){ // wheel
                this.startAnimation(this.animation_openDoors);
            }
        }).bind(this));
        
    }

    step(delta){
        // Update every animation
        this.mixer.update(delta);
    }

    startAnimation(anim) {
        if(anim){
            anim.reset();
            anim.play();
        }
    }

    createOpenAnimation(){
        let door_r_p1 = this.door_r.position;
        let door_l_p1 = this.door_l.position;
        let door_r_p2 = this.incrementEuler(door_r_p1, -this.size.x/3,0,0);
        let door_l_p2 = this.incrementEuler(door_l_p1, this.size.x/3,0,0);

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
        animation.clampWhenFinished = true;

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