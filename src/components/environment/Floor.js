import { THREE } from '../setup/ThreeSetup';
import { DefaultGeneralLoadingManager } from '../Tools/GeneralLoadingManager';
import floor1 from '../../asset/textures/floor1.jpg';

const loader = DefaultGeneralLoadingManager.getHandler("texture");
const _floorTexture = loader.load(floor1);
// Apply repetition
_floorTexture.wrapS = THREE.RepeatWrapping;
_floorTexture.wrapT = THREE.RepeatWrapping;
_floorTexture.magFilter = THREE.NearestFilter;

class Floor extends THREE.Mesh{
    constructor(x,y,z,width,height){
        let geometry = new THREE.PlaneGeometry(width,height);
        geometry.rotateX(-Math.PI/2); // Rotating the plane geometry
        let texture = _floorTexture.clone();
        texture.needsUpdate = true;
        texture.repeat.set(width/2,width/2);

        const _floorMaterial = new THREE.MeshPhongMaterial({
            map: texture,
            side: THREE.DoubleSide,
        });

        super(geometry, _floorMaterial);

        this.receiveShadow = true;
        this.castShadow = false;
        
        this.friction = 0.8;

        // Apply position
        this.setPosition(x,y,z);

        // Apply Rotation
        // this.rotation.x = Math.PI/2;
    }

    setPosition(x,y,z){
        // Apply position
        this.position.set(x,y,z);
    } 

    onCollision(collisionResult,obj,delta){
        if(obj.feetPosition.y <= this.position.y){
            obj.feetPosition.y = this.position.y;
            // Faking the normal reaction
            if(obj.movementEngine.velocity.y < 0) {
                obj.movementEngine.velocity.y = 0;
                obj.movementEngine.displacement.y = 0;
            }

            // Faking friction
            let xFriction = obj.movementEngine.velocity.x * this.friction;
            let zFriction = obj.movementEngine.velocity.z * this.friction;
            obj.movementEngine.velocity.x -= xFriction;
            obj.movementEngine.velocity.z -= zFriction;

            // Since we are on the ground, the object can jump
            obj.canJump = true;
        }
    }

}


export default Floor;