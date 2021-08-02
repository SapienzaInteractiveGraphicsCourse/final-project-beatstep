import { THREE } from '../setup/ThreeSetup';
import { DefaultGeneralLoadingManager } from '../Tools/GeneralLoadingManager';
import wall1 from '../../asset/textures/wall1.png';
import { setCollideable } from '../physics/CollisionDetector';
import { BufferGeometryUtils } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

const loader = DefaultGeneralLoadingManager.getHandler("texture");
const _staircaseTexture = loader.load(wall1);
// Apply repetition
_staircaseTexture.wrapS = THREE.RepeatWrapping;
_staircaseTexture.wrapT = THREE.RepeatWrapping;
_staircaseTexture.magFilter = THREE.NearestFilter;

class Staircase extends THREE.Mesh {
    constructor(x,y,z,width,height,depth,steps=10,direction=0){

        let discreteHeight = height/steps;
        let discreteDepth = depth/steps;

        let geometries = [];

        let texture = _staircaseTexture.clone();
        texture.needsUpdate = true;
        texture.repeat.set(depth/2,height/2);

        let material = new THREE.MeshPhongMaterial({
            map: texture
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

        this.width = width;
        this.height = height;
        this.depth = depth;

        // Apply position
        this.setPosition(x,y,z);

        // Apply Rotation
        this.rotation.y = (Math.PI / 2) * direction;
        this.direction = direction;
        

        // Adding collision detection
        let collisionGeometry = new THREE.BoxGeometry(width,height,depth);
        // collisionGeometry = new THREE.CylinderGeometry(0.5,0.5,2,32);
        setCollideable(this,collisionGeometry,
            (intersections)=>{ // On personal collsion
                console.log("personal collsion");
            },
            (object, distance, intersection)=>{ // On collision with
                console.log(this.constructor.name+" on collision with "+ object.constructor.name);
                if(object.constructor && object.constructor.name == "Player"){
                    let h = this.calcHeight(object.position.x,object.position.z);
                    object.position.y = 2 + h; // Uncomment here to see effects
                }
            }
        );

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