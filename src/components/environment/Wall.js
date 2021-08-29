import { THREE } from '../setup/ThreeSetup';
import { DefaultGeneralLoadingManager } from '../Tools/GeneralLoadingManager';
import wall1 from '../../asset/textures/wall1.png';

const loader = DefaultGeneralLoadingManager.getHandler("texture");
const _wallTexture = loader.load(wall1);
// Apply repetition
_wallTexture.wrapS = THREE.RepeatWrapping;
_wallTexture.wrapT = THREE.RepeatWrapping;
_wallTexture.magFilter = THREE.NearestFilter;

class Wall extends THREE.Mesh{
    constructor(x,y,z,width,height,rotationRadians=0){
        let geometry = new THREE.PlaneGeometry(width,height);
        let texture = _wallTexture.clone(true);
        texture.needsUpdate = true;
        texture.repeat.set( width/10 , height/10 );
        let material = new THREE.MeshPhongMaterial({
            map: texture,
            side: THREE.DoubleSide,
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