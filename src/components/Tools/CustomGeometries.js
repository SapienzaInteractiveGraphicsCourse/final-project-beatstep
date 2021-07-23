import { THREE } from '../setup/ThreeSetup';
import { DefaultGeneralLoadingManager } from './GeneralLoadingManager';

//    6--------7
//   /        /|
//  /        / |
// 2--------3  |
// |        |  |
// |  4-----|--5
// |        | /
// |        |/
// 0--------1
const _cube = [
    new THREE.Vector3(-1, -1,  1),  // 0
    new THREE.Vector3( 1, -1,  1),  // 1
    new THREE.Vector3(-1,  1,  1),  // 2
    new THREE.Vector3( 1,  1,  1),  // 3
    new THREE.Vector3(-1, -1, -1),  // 4
    new THREE.Vector3( 1, -1, -1),  // 5
    new THREE.Vector3(-1,  1, -1),  // 6
    new THREE.Vector3( 1,  1, -1),  // 7
];

class HalfCubeGeometry extends THREE.BufferGeometry {
    constructor(scaleX = 1,scaleY = 1,scaleZ = 1){
        super();
        
        this._pointsChosen = [
            // bottom
            _cube[0],_cube[4],_cube[1],
            _cube[4],_cube[5],_cube[1],
            // back
            _cube[4],_cube[6],_cube[5],
            _cube[5],_cube[6],_cube[7],
            // left
            _cube[1],_cube[5],_cube[7],
            // right_
            _cube[6],_cube[4],_cube[0],
            // top-f_ront
            _cube[0],_cube[1],_cube[6],
            _cube[6],_cube[1],_cube[7],
        ];

        this.setFromPoints(this._pointsChosen);
        this.computeVertexNormals();
        this.scale(scaleX,scaleY,scaleZ);

    }
}

export { HalfCubeGeometry };