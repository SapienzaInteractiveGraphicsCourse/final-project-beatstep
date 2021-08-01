import { THREE } from '../setup/ThreeSetup';
import { DefaultGeneralLoadingManager } from '../Tools/GeneralLoadingManager';
import gas_top from '../../asset/textures/gas_top.png';
import gas_top_b from '../../asset/textures/gas_top_b.png';
import gas_side from '../../asset/textures/gas_side.png';
import gas_side_b from '../../asset/textures/gas_side_b.png';
import { ObjectPool } from '../Tools/ObjectPool';
import { setCollideable } from '../physics/CollisionDetector';

const loader = DefaultGeneralLoadingManager.getHandler("texture");
const _gascylinderTextures = [
    loader.load(gas_side),
    loader.load(gas_top),
    loader.load(gas_top),
];
const _gasCylinderBumpMaps = [
    loader.load(gas_side_b),
    loader.load(gas_top_b),
    loader.load(gas_top_b),
];
const _gascylinderRadius = 0.5;
const _gascylinderHeight = 2;
const _gascylinderMass = 2;
const _gascylinderRotation = Math.PI/2;

const _gascylinderGeometry = new THREE.CylinderGeometry(_gascylinderRadius,
                                                        _gascylinderRadius,
                                                        _gascylinderHeight,32);
                                                                   
_gascylinderGeometry.translate(0,_gascylinderHeight/2,0);

const  _gascylinderMaterials = [
    new THREE.MeshPhongMaterial({
        map: _gascylinderTextures[0],
        side: THREE.DoubleSide,
        bumpMap: _gasCylinderBumpMaps[0],
        bumpScale  :  0.25,
    }),
    new THREE.MeshPhongMaterial({
        map: _gascylinderTextures[1],
        side: THREE.DoubleSide,
        bumpMap: _gasCylinderBumpMaps[1],
        bumpScale  :  0.85,
    }),
    new THREE.MeshPhongMaterial({
        map: _gascylinderTextures[2],
        side: THREE.DoubleSide,
        bumpMap: _gasCylinderBumpMaps[2],
        bumpScale  :  0.85,
    })
];

class GasCylinder extends THREE.Mesh{
    constructor(x = 0,y = 0,z = 0, rotation = 0){
        super(_gascylinderGeometry, _gascylinderMaterials);

        this.receiveShadow = true;

        this.size = new THREE.Vector3(  _gascylinderRadius,
                                        _gascylinderHeight,
                                        _gascylinderRadius);

        this.health = 100; // TODO: when 0, explode onCollision

        this.setPosition(x,y,z);
        this.setRotation(rotation);
    }

    update(delta){
        // TODO
    }

    setPosition(x,y,z){
        // Apply position
        this.position.set(x,y,z);
    }

    setRotation(alpha){
        // TODO
        this.rotation.y = alpha;
    }

}

// const gasCylinderPool = new ObjectPool(GasCylinder,5);

export default GasCylinder;