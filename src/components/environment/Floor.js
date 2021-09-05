import { DefaultGeneralLoadingManager } from '../Tools/GeneralLoadingManager';
import floor1 from '../../asset/textures/floor1.jpg';
import { DoubleSide, Mesh, MeshPhongMaterial, NearestFilter, PlaneGeometry, RepeatWrapping } from 'three';

const loader = DefaultGeneralLoadingManager.getHandler("texture");
const _floorTexture = loader.load(floor1);
// Apply repetition
_floorTexture.wrapS = RepeatWrapping;
_floorTexture.wrapT = RepeatWrapping;
_floorTexture.magFilter = NearestFilter;

class Floor extends Mesh{
    constructor(x,y,z,width,height){
        let geometry = new PlaneGeometry(width,height);
        geometry.rotateX(-Math.PI/2); // Rotating the plane geometry
        let texture = _floorTexture.clone();
        texture.needsUpdate = true;
        texture.repeat.set(width/2,width/2);

        const _floorMaterial = new MeshPhongMaterial({
            map: texture,
            side: DoubleSide,
        });

        super(geometry, _floorMaterial);
        this.name = "Floor";

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
        // Floor
        if(collisionResult.normal.y > 0){
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
        // Ceiling
        else{
            if(obj.feetPosition.y+obj.height >= this.position.y){
                obj.feetPosition.y = this.position.y-obj.height;
                // Faking the normal reaction
                if(obj.movementEngine.velocity.y > 0) {
                    obj.movementEngine.velocity.y = 0;
                    obj.movementEngine.displacement.y = 0;
                }
    
                // Faking friction
                let xFriction = obj.movementEngine.velocity.x * this.friction;
                let zFriction = obj.movementEngine.velocity.z * this.friction;
                obj.movementEngine.velocity.x -= xFriction;
                obj.movementEngine.velocity.z -= zFriction;
            }
        }
        
    }

}


export default Floor;