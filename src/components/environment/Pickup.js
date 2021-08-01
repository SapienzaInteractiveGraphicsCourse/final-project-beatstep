import { THREE } from '../setup/ThreeSetup';
import { DefaultGeneralLoadingManager } from '../Tools/GeneralLoadingManager';

import pickup_health from '../../asset/textures/pickup_health.png';
import pickup_shield from '../../asset/textures/pickup_shield.png';
import pickup_ammo from '../../asset/textures/pickup_ammo.png';

import { ObjectPool } from '../Tools/ObjectPool';
import { setCollideable } from '../physics/CollisionDetector';

const loader = DefaultGeneralLoadingManager.getHandler("texture");
const _pickupTextureHealth = loader.load(pickup_health);
const _pickupTextureShield = loader.load(pickup_shield);
const _pickupTextureAmmo = loader.load(pickup_ammo);

const _pickupDimension = 0.8;
const _pickupBumpScale = 0.25;

const _pickupGeometry = new THREE.BoxGeometry(_pickupDimension,_pickupDimension,_pickupDimension);
const _pickupMaterialHealth = new THREE.MeshPhongMaterial({
    map: _pickupTextureHealth,
    side: THREE.DoubleSide,
    bumpMap: _pickupTextureHealth,
    bumpScale  :  _pickupBumpScale,
});
const _pickupMaterialShield = new THREE.MeshPhongMaterial({
    map: _pickupTextureShield,
    side: THREE.DoubleSide,
    bumpMap: _pickupTextureShield,
    bumpScale  :  _pickupBumpScale,
});
const _pickupMaterialAmmo = new THREE.MeshPhongMaterial({
    map: _pickupTextureAmmo,
    side: THREE.DoubleSide,
    bumpMap: _pickupTextureAmmo,
    bumpScale  :  _pickupBumpScale,
});

class Pickup extends THREE.Mesh {
    constructor(type = "health", onTouch = ()=>{}){
        
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

        this._dimension = _pickupDimension;

        this.receiveShadow = false;
        this.castShadow = true;

        // Apply event touching
        this.onTouch = onTouch;
        // setCollideable(this,_pickupGeometry,
        //     ()=>{},
        //     (object, distance, intersection)=> {
        //         if(object.constructor && object.constructor.name == "Player"){
        //             this.onTouch(object, distance, intersection,this);
        //         }
        //     }
        // );

        this.rotation.y = 0;
    }

    step(delta){
        this.rotation.y += (Math.PI/2)*delta;
    }

    setPosition(x,y,z){
        // Apply position
        this.position.set(x,y+dimension,z);
    }

}

// const pickupHealthPool = new ObjectPool(Pickup,5,["health",(player, distance, intersection, pickup)=>{
//     console.log("Health pickup!");
//     pickup.removeFromParent();
// }]);
// const pickupAmmoPool = new ObjectPool(Pickup,5,["ammo",(player, distance, intersection, pickup)=>{
//     console.log("Ammo pickup!");
//     pickup.removeFromParent();
// }]);
// const pickupShieldPool = new ObjectPool(Pickup,5,["shield",(player, distance, intersection, pickup)=>{
//     console.log("Shield pickup!");
//     pickup.removeFromParent();
// }]);

// export { pickupHealthPool, pickupAmmoPool, pickupShieldPool };

export default Pickup;