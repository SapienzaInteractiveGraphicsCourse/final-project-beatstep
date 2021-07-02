import * as THREE from 'three';

import HUD from "./HUD";

import { addRifle } from "../TempRifle";

class Player {

    constructor(camera) {
        this.camera = camera;
        this.hud = new HUD(camera);
        
        let _health = 100;
        let _shield = 0;
        let _ammo = 1000;
        
        this.topHealth = 100;
        this.topShield = 0;
        this.topAmmo = 1000;
        
        Object.defineProperties(this,{
            position: {
                get: function() { return this.camera.position; }
            },
            health: {
                get: function() {return _health},
                set: function(d) {_health = d; this.hud.healthBar.setPercentage(_health/(this.topHealth*100))}
            },
            shield: {
                get: function() {return _shield},
                set: function(d) {_shield = d; this.hud.shieldBar.setPercentage(_shield/(this.topShield*100))}
            },
            ammo: {
                get: function() {return _ammo},
                set: function(d) {_ammo = d; this.hud.ammoBar.setPercentage(_ammo/(this.topAmmo*100))}
            }
        });


        

        addRifle((obj) => {
            //obj.scale(0.5,0.5,0.5);
            obj.position.set(0.3, -0.25, -1);
            obj.rotation.y = Math.PI / 13;
            obj.rotation.x = 0.05;


            // obj.position.set(0,-0.5,-1);
            // obj.rotation.y = 0;
            // obj.rotation.x = 0.35;

            // Load animations
            const shootRotation = new THREE.QuaternionKeyframeTrack(
                '.quaternion',
                [0, 0.1, 0.3],
                [obj.quaternion.x, obj.quaternion.y, obj.quaternion.z, obj.quaternion.w,
                obj.rotation.x+0.1 * Math.PI, obj.rotation.y, obj.rotation.z, obj.quaternion.w,
                obj.rotation.x, obj.rotation.y, obj.rotation.z, obj.quaternion.w],
            );
            const shootClip = new THREE.AnimationClip('shoot-1', -1, [
                shootRotation
            ]);


            this.mixer = new THREE.AnimationMixer(obj);
            this.shootAnimation = this.mixer.clipAction(shootClip);
            this.shootAnimation.clampWhenFinished = true;
            this.shootAnimation.loop = THREE.LoopOnce;
            this.shootAnimation.enable = false;
            this.repetitions = 1;
            this.shootAnimation.stop();

            // TODO: DEBUG (toremove)
            document.addEventListener("mousedown",((event)=>{
                if(event.button == 2){ // shoot
                    this.startShootAnimation();
                }
            }).bind(this));

            camera.add(obj);
        });

        
        
    }

    startShootAnimation() {
        if(this.shootAnimation){
            this.shootAnimation.reset();
            this.shootAnimation.play();
        }
    }

    update(delta){
        if(this.mixer){
            this.mixer.update(delta);
        }
    }

}

export default Player;