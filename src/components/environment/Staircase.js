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

        this.height = height;

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
        let x0 = this.position.x;
        let y0 = this.position.y;
        let y1 = this.position.y + this.height;
        
        let xf = player_z;
        if((this.direction % 2) == 0) xf = player_x;

        let yf = ((xf-x0)/(x1-x0))*(y1-y0) + y0;
        return yf;
    }

}


export default Staircase;