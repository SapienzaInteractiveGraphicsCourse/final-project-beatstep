import { THREE } from '../setup/ThreeSetup';
import { DefaultGeneralLoadingManager } from '../Tools/GeneralLoadingManager';
import gas_top from '../../asset/textures/gas_top.png';
import gas_top_b from '../../asset/textures/gas_top_b.png';
import gas_side from '../../asset/textures/gas_side.png';
import gas_side_b from '../../asset/textures/gas_side_b.png';
import { ObjectPool } from '../Tools/ObjectPool';
import ParticleSystem from './ParticleSystem';
import { scene, camera } from '../setup/ThreeSetup';


// import { setCollideable } from '../physics/CollisionDetector';

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
    constructor(x,y,z, rotation = Math.PI){
        super(_gascylinderGeometry, _gascylinderMaterials);
        // this.body = new PhysicsBody(5,new PhysicsShapeThree(_gascylinderGeometry),new PhysicsMaterial(1,0.5));

        this.receiveShadow = true;
        this.castShadow = true;

        this.explosionPower = 20;
        this.health = 100; // TODO: when 0, explode onCollision

        this._explosionParticles = null;

        this.setPosition(x,y,z);
        this.setRotation(rotation);
    }

    update(delta){
        // TODO
        // this.body.updateMesh(this,true,false);
        if(this._explosionParticles !== null){
            this._explosionParticles.update(delta);
        }
    }

    setPosition(x,y,z){
        // Apply position
        this.position.set(x,y+_gascylinderHeight/2,z);
        // this.body.position.copy(this.position);
    }

    setRotation(alpha){
        // TODO
        this.rotation.y = alpha;
        
    }

    explode(){
        if(this._explosionParticles !== null) return;
        // Disappear
        this.removeFromPhysicsWorld();
        this.removeFromParent();
        // Adding Particles
        this._explosionParticles = new ParticleSystem(scene,camera, 0.6, null, ()=>{
            this._explosionParticles = null;
        });
        this._explosionParticles.setGeneralPosition(this.position.x,this.position.y,this.position.z);
        this._explosionParticles.start();
    }

    onCollision(collisionResult,obj,delta){

        //collisionResult.normal.multiplyScalar(-1);
        collisionResult.normal.y = 1;
        collisionResult.normal.multiplyScalar(this.explosionPower);
        obj.movementEngine.velocity.copy(collisionResult.normal);

        this.explode();

        if(obj.dealDamage) obj.dealDamage(30);

    }

    hit(){
        this.explode();
    }

}

// const gasCylinderPool = new ObjectPool(GasCylinder,5);

export default GasCylinder;