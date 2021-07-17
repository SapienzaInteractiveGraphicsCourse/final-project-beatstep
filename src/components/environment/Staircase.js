import { THREE } from '../setup/ThreeSetup';
import { DefaultGeneralLoadingManager } from '../Tools/GeneralLoadingManager';
import wall1 from '../../asset/textures/wall1.png';
import { setCollideable } from '../physics/CollisionDetector';

const loader = DefaultGeneralLoadingManager.getHandler("texture");
const _staircaseTexture = loader.load(wall1);
// Apply repetition
_staircaseTexture.wrapS = THREE.RepeatWrapping;
_staircaseTexture.wrapT = THREE.RepeatWrapping;
_staircaseTexture.magFilter = THREE.NearestFilter;
_staircaseTexture.repeat.set(3,3);

class Staircase extends THREE.Group {
    constructor(x,y,z,width,height,depth,steps=10,direction=0){
        super();
        this.height = height;
        let discreteHeight = height/steps;
        let discreteDepth = depth/steps;
        for(let i=1;i<=steps;i++){
            let h = discreteHeight*i;
            let geometry = new THREE.BoxGeometry( width, h, discreteDepth );
            let material = new THREE.MeshPhongMaterial({
                map: _staircaseTexture
            });
            let mesh = new THREE.Mesh(geometry, material);
            mesh.receiveShadow = true;
            mesh.castShadow = false;

            mesh.position.set(  0,
                                0 -height/2 + h/2,
                                0 + discreteDepth*(i) - (depth/2 + discreteDepth/2) );
            this.add(mesh);
        }

        // Apply position
        this.setPosition(x,y,z);

        // Apply Rotation
        this.rotation.y = (Math.PI / 2) * direction;
        this.direction = direction;
        

        // Adding collision detection
        setCollideable(this,new THREE.BoxGeometry(width,height,depth),
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