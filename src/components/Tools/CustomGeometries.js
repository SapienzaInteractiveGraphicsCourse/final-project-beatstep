

//    6--------7
//   /|       /|
//  / |      / |
// 2--|-----3  |
// |  |     |  |
// |  4-----|--5
// | /      | /
// |/       |/ 

import { BufferGeometry, Vector3 } from "three";

// 0--------1
const _cube = [
    new Vector3(-1, -1,  1),  // 0
    new Vector3( 1, -1,  1),  // 1
    new Vector3(-1,  1,  1),  // 2
    new Vector3( 1,  1,  1),  // 3
    new Vector3(-1, -1, -1),  // 4
    new Vector3( 1, -1, -1),  // 5
    new Vector3(-1,  1, -1),  // 6
    new Vector3( 1,  1, -1),  // 7
];

class HalfCubeGeometry extends BufferGeometry {
    constructor(scaleX = 1,scaleY = 1,scaleZ = 1){
        super();
        
        this._pointsChosen = [
            // top-front
            _cube[0],_cube[1],_cube[6],
            _cube[6],_cube[1],_cube[7],
            // bottom
            // _cube[0],_cube[4],_cube[1],
            // _cube[4],_cube[5],_cube[1],
            // back
            _cube[4],_cube[6],_cube[5],
            _cube[5],_cube[6],_cube[7],
            // left
            _cube[1],_cube[5],_cube[7],
            // right
            _cube[6],_cube[4],_cube[0],  
        ];

        this.setFromPoints(this._pointsChosen);
        this.computeVertexNormals();
        this.scale(scaleX,scaleY,scaleZ);

    }
}

class HalfCubeGeometryHollowed extends BufferGeometry {
    constructor(scaleX = 1,scaleY = 1,scaleZ = 1){
        super();
        
        this._pointsChosen = [
            // top-front
            _cube[0],_cube[1],_cube[6],
            _cube[6],_cube[1],_cube[7],
        ];

        this.setFromPoints(this._pointsChosen);
        this.computeVertexNormals();
        this.scale(scaleX,scaleY,scaleZ);

    }
}

//    6--------7
//   /|       /|
//  / |      / |
// 2--|-----3  |
// |  |     |  |
// |  4-----|--5
// | /      | /
// |/       |/ 
// 0--------1
const _cube_zero = [
    new Vector3(-0.5,  0,  0),  // 0
    new Vector3( 0.5,  0,  0),  // 1
    new Vector3(-0.5,  1,  0),  // 2
    new Vector3( 0.5,  1,  0),  // 3
    new Vector3(-0.5,  0, -1),  // 4
    new Vector3( 0.5,  0, -1),  // 5
    new Vector3(-0.5,  1, -1),  // 6
    new Vector3( 0.5,  1, -1),  // 7
];

class InclinedSurfaceGeometry extends BufferGeometry {
    constructor(width = 1,height = 1,depth = 1){
        super();
        
        this._pointsChosen = [
            _cube_zero[0],_cube_zero[1],_cube_zero[6],
            _cube_zero[6],_cube_zero[1],_cube_zero[7],
        ];

        this.setFromPoints(this._pointsChosen);
        this.computeVertexNormals();
        this.scale(width,height,depth);

    }
}

export { HalfCubeGeometry, InclinedSurfaceGeometry, HalfCubeGeometryHollowed };