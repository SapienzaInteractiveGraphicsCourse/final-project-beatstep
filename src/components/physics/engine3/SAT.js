import { Vector3 } from "three";

class SAT {

    static projection(vertices,normal){
        let max = -Infinity;
        let min = Infinity;
        for(let v of vertices){
            let proj = v.dot(normal);
            max = Math.max(max,proj);
            min = Math.min(min,proj);
        }
        return {start:min, end:max};
    }

    static overlap(intervalA,intervalB){
        if(intervalB.end < intervalA.start || intervalB.start > intervalA.end) return false;
        return {start: Math.max(intervalA.min,intervalB.min), end: Math.min(intervalA.max,intervalB.max)};
    }

    static checkCollision(body1,body2){

        let allNormals = bod1.getNormals();
        allNormals.push(...body2.getNormals());
        let vertices1 = body1.getVertices();
        let vertices2 = body2.getVertices();

        let mtv = new Vector3(0,0,0);
        let mtvLength = Infinity;
        for(let normal of allNormals){
            intervalA = SAT.projection(vertices1, normal);
            intervalB = SAT.projection(vertices2, normal);

            let overlap = SAT.overlap(intervalA,intervalB);
            if(!overlap) return null;
            else if(overlap < mtvLength){
                mtvLength = overlap;
                mtv.copy(normal);
            }
        }
        return {normal: mtv, penetration: mtvLength};
    }

}

export { SAT }