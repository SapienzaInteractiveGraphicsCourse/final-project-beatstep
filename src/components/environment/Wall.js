import { DefaultGeneralLoadingManager } from '../Tools/GeneralLoadingManager';
import defaultWall from '../../asset/textures/defaultWall.png';
import metalPanel from '../../asset/textures/metalPanel.png';
import wood from '../../asset/textures/wood.jpg';
import { DoubleSide, Mesh, MeshPhongMaterial, NearestFilter, PlaneGeometry, RepeatWrapping } from 'three';

const loader = DefaultGeneralLoadingManager.getHandler("texture");
const _walls = [ // [texture, ratio]
    [loader.load(defaultWall),10],
    [loader.load(metalPanel),4],
    [loader.load(wood),4],
];

for(let [_wallTexture,ratio] of _walls){
    // Apply repetition
    _wallTexture.wrapS = RepeatWrapping;
    _wallTexture.wrapT = RepeatWrapping;
    _wallTexture.magFilter = NearestFilter;
}

class Wall extends Mesh{
    constructor(x,y,z,width,height,rotationRadians=0,type=0){
        let geometry = new PlaneGeometry(width,height);
        let texture = _walls[type][0].clone(true);
        texture.needsUpdate = true;
        let ratio = _walls[type][1];
        texture.repeat.set( width/ratio , height/ratio );
        let material = new MeshPhongMaterial({
            map: texture,
            side: DoubleSide,
        });
        super(geometry, material);

        this.receiveShadow = true;
        this.castShadow = false;

        // Apply position
        this.position.set(x,y+height/2,z);

        // Apply Rotation
        this.rotation.y = rotationRadians;

        // onCollision with dynamic object callback
        this.onCollision = function(collisionResult,obj,delta){

            // Move back the player if he penetrated into the wall
            let backVec = collisionResult.normal.clone().multiplyScalar(collisionResult.penetration);
            obj.position.add(backVec);

            // Don't allow the player to move inside the wall
            let dot = collisionResult.normal.dot(obj.movementEngine.displacement);
            if(dot < 0){
                backVec = collisionResult.normal.multiplyScalar(dot);
                obj.movementEngine.displacement.sub(backVec);
            }

        }
    }

    get obj(){
        return this;
    }

    
}


export default Wall;