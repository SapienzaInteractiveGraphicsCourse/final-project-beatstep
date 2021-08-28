import { THREE } from '../setup/ThreeSetup';
import { DefaultGeneralLoadingManager } from '../Tools/GeneralLoadingManager';

import pickup_health from '../../asset/textures/pickup_health.png';
import pickup_shield from '../../asset/textures/pickup_shield.png';
import pickup_ammo from '../../asset/textures/pickup_ammo.png';

import { ObjectPool } from '../Tools/ObjectPool';
// import { setCollideable } from '../physics/CollisionDetector';

const loader = DefaultGeneralLoadingManager.getHandler("texture");
const _pickupTextureHealth = loader.load(pickup_health);
const _pickupTextureShield = loader.load(pickup_shield);
const _pickupTextureAmmo = loader.load(pickup_ammo);

const dimension = 0.8;

const _pickupGeometry = new THREE.BoxGeometry(dimension,dimension,dimension);
const _pickupMaterialHealth = new THREE.MeshPhongMaterial({
    map: _pickupTextureHealth,
    side: THREE.DoubleSide,
    bumpMap: _pickupTextureHealth,
    bumpScale  :  0.25,
});
const _pickupMaterialShield = new THREE.MeshPhongMaterial({
    map: _pickupTextureShield,
    side: THREE.DoubleSide,
    bumpMap: _pickupTextureShield,
    bumpScale  :  0.25,
});
const _pickupMaterialAmmo = new THREE.MeshPhongMaterial({
    map: _pickupTextureAmmo,
    side: THREE.DoubleSide,
    bumpMap: _pickupTextureAmmo,
    bumpScale  :  0.25,
});

class Pickup extends THREE.Mesh {
    constructor(x,y,z, type = "health", onTouch = (player, pickup)=>{}){
        
        switch(type){
            default:
            case "health":
                super(_pickupGeometry, _pickupMaterialHealth);
                break;
            case "ammo":
                super(_pickupGeometry, _pickupMaterialAmmo);
                break;
            case "shield":
                super(_pickupGeometry, _pickupMaterialShield);
                break;
        }        

        this._type = type;

        this.receiveShadow = false;
        this.castShadow = true;

        // Apply event touching
        this.onTouch = onTouch;

        this.setPosition(x,y,z);

        this.rotation.y = 0;
    }

    update(delta){
        this.rotation.y += (Math.PI/2)*delta;
    }

    setPosition(x,y,z){
        // Apply position
        this.position.set(x,y+dimension,z);
    }

    onCollision(collisionResult,obj,delta){

        if(obj.constructor.name != "Player") return;

        this.onTouch(obj,this);

    }

}

class PickupHealth extends Pickup {
    constructor(x,y,z){
        super(x,y,z,"health",(player, pickup)=>{
            let hInc = 10;
            if(player.health < player.topHealth){
                player.health += hInc;
                pickup.removeFromPhysicsWorld();
                pickup.removeFromParent();
            }
        });
    }
}

class PickupAmmo extends Pickup {
    constructor(x,y,z){
        super(x,y,z,"ammo",(player, pickup)=>{
            let aInc = 10;
            if(player.ammo < player.topAmmo){
                player.ammo += aInc;
                pickup.removeFromPhysicsWorld();
                pickup.removeFromParent();
            }
        });
    }
}

class PickupShield extends Pickup {
    constructor(x,y,z){
        super(x,y,z,"shield",(player, pickup)=>{
            let sInc = 10;
            if(player.shield < player.topShield){
                player.shield += sInc;
                pickup.removeFromPhysicsWorld();
                pickup.removeFromParent();
            }
        });
    }
}

export { PickupHealth, PickupAmmo, PickupShield };