import { THREE } from '../setup/ThreeSetup';
import { DefaultGeneralLoadingManager } from '../Tools/GeneralLoadingManager';
import texture from '../../asset/textures/floor1.jpg';
// import { setCollideable } from '../physics/CollisionDetector';
import { BufferGeometryUtils } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { HalfCubeGeometry, InclinedSurfaceGeometry } from '../Tools/CustomGeometries';

const loader = DefaultGeneralLoadingManager.getHandler("texture");
const _staircaseTexture = loader.load(texture);
// Apply repetition
_staircaseTexture.wrapS = THREE.RepeatWrapping;
_staircaseTexture.wrapT = THREE.RepeatWrapping;
_staircaseTexture.magFilter = THREE.NearestFilter;
_staircaseTexture.repeat.set(3,3);

class Staircase extends THREE.Mesh {
    constructor(x,y,z,width,height,depth,steps=10,direction=0){

        let discreteHeight = height/steps;
        let discreteDepth = depth/steps;

        let geometries = [];

        let material = new THREE.MeshPhongMaterial({
            map: _staircaseTexture
        });

        for(let i=1;i<=steps;i++){
            let h = discreteHeight*i;
            let geometry = new THREE.BoxGeometry( width, h, discreteDepth );

            geometry.translate( 0,
                                0 -height/2 + h/2,
                                0 + discreteDepth*(i) - (depth/2 + discreteDepth/2) );

            geometries.push(geometry);

        }
        let singleGeometry = BufferGeometryUtils.mergeBufferGeometries(geometries);
        super(singleGeometry,material);

        this.castShadow = true;

        this.collisionGeometry = new HalfCubeGeometry(width/2,height/2,depth/2);
        this.collisionGeometry.rotateY(Math.PI);

        this.width = width;
        this.height = height;
        this.depth = depth;

        // Apply position
        this.setPosition(x,y,z);

        // Apply Rotation
        this.setDirection(direction);

        this.friction = 0.8;
        
        this.onCollision = ((collisionResult,obj,delta)=>{
            // Move back the player if he penetrated into the wall
            let backVec = collisionResult.normal.clone().multiplyScalar(collisionResult.penetration);
            obj.position.add(backVec);
    
            // Don't allow the player to move inside the wall
            let dotDisplacement = collisionResult.normal.dot(obj.movementEngine.displacement);
            let dotVelocity = collisionResult.normal.dot(obj.movementEngine.velocity);
            if(dotVelocity < 0){
                let backVecDisp = collisionResult.normal.clone().multiplyScalar(dotDisplacement);
                obj.movementEngine.displacement.sub(backVecDisp);
                
                let backVecVel = collisionResult.normal.clone().multiplyScalar(dotVelocity);
                obj.movementEngine.velocity.sub(backVecVel);
    
                if(obj.movementEngine.velocity.length() < 1){
                    // Static friction
                    obj.movementEngine.velocity.set(0,0,0);
                    obj.movementEngine.displacement.set(0,0,0);
                }
                else{
                    let friction = obj.movementEngine.velocity.clone().multiplyScalar(this.friction);
                    obj.movementEngine.velocity.sub(friction);
                }
                
            }

            // Since we are on the ground, the object can jump
            obj.canJump = true;
    
        }).bind(this);

    }

    setPosition(x,y,z){
        this.position.set(x,y+this.height/2,z);
    }

    setDirection(direction){
        this.rotation.y = (Math.PI / 2) * direction;
        this.direction = direction;
    }

    calcHeight(player_x,player_z){
        let y0 = this.position.y - this.height/2;
        let y1 = y0 + this.height;

        let xfs = [
            Math.abs((player_z - this.position.z) + this.depth/2),
            Math.abs((player_x - this.position.x) + this.depth/2),
            Math.abs((player_z - this.position.z) - this.depth/2),
            Math.abs((player_x - this.position.x) - this.depth/2),
        ];
        let xf = xfs[this.direction%4];
        
        let yi = (xf/this.depth)*(y1-y0);
        if(yi > this.height) yi = this.height;

        let yf = yi + y0;

        return yf;
    }

}


export default Staircase;