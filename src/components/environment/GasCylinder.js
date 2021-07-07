import { THREE } from '../setup/ThreeSetup';
import { DefaultGeneralLoadingManager } from '../Tools/GeneralLoadingManager';
import gas_top from '../../asset/textures/gas_top.png';
import gas_side from '../../asset/textures/gas_side.png';
import { ExtendedBody } from '../physics/ExtendedBody';
import { CANNON, world } from '../physics/CannonSetup';
import { ObjectPool } from '../Tools/ObjectPool';

const loader = DefaultGeneralLoadingManager.getHandler("texture");
const _gascylinderTextures = [
    loader.load(gas_side),
    loader.load(gas_top),
    loader.load(gas_top),
];
const _gascylinderRadius = 0.5;
const _gascylinderHeight = 2;
const _gascylinderMass = 2;
const _gascylinderRotation = Math.PI/2;

const _gascylinderShape = new CANNON.Cylinder(_gascylinderRadius,_gascylinderRadius,_gascylinderHeight,32)
const _gascylinderGeometry = new THREE.CylinderGeometry(_gascylinderRadius,_gascylinderRadius,_gascylinderHeight,32);
const  _gascylinderMaterials = [
    new THREE.MeshPhongMaterial({
        map: _gascylinderTextures[0],
        side: THREE.DoubleSide,
    }),
    new THREE.MeshPhongMaterial({
        map: _gascylinderTextures[1],
        side: THREE.DoubleSide,
    }),
    new THREE.MeshPhongMaterial({
        map: _gascylinderTextures[2],
        side: THREE.DoubleSide,
    })
];

_gascylinderGeometry.rotateX( - _gascylinderRotation);

class GasCylinder extends THREE.Mesh{
    constructor(){
        super(_gascylinderGeometry, _gascylinderMaterials);
        
        this.body = new ExtendedBody({
            mass: _gascylinderMass,
            shape: _gascylinderShape
        });
        let rot = new CANNON.Vec3();
        this.body.quaternion.toEuler(rot);
        this.body.quaternion.setFromEuler(rot.x + _gascylinderRotation,rot.y,rot.z);

        this.receiveShadow = true;

        this.health = 100; // TODO: when 0, explode onCollision
    }

    update(delta){
        this.body.update(this);
    }

}

const gasCylinderPool = new ObjectPool(GasCylinder,5);

export default gasCylinderPool;