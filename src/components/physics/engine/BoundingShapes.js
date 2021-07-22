import { Vector3 } from "three";


class Box {
    constructor(min,max){
        
            this.min = min || new Vector3(0,0,0);
            this.max = max || new Vector3(0,0,0);
            this.type = "box";
    }

    applyMatrix4(m){
        // This is an axis aligned box, so rotation is ignored
		const e = m.elements;
        
        this.min.x += e[ 12 ];
		this.min.y += e[ 13 ];
		this.min.z += e[ 14 ];

        this.max.x += e[ 12 ];
		this.max.y += e[ 13 ];
		this.max.z += e[ 14 ];
    }

    clone(){
        return new Box(this.min.clone(),this.max.clone())
    }
}

class Sphere {

    constructor(center,radius){
        
            this.center = center || new Vector3(0,0,0);
            this.radius = radius || 0
            this.type = "sphere";
    }

    applyMatrix4(m) {
        // This is an axis aligned box, so rotation is ignored
        const e = m.elements;

        this.center.x += e[12];
        this.center.y += e[13];
        this.center.z += e[14];
    }

    clone(){
        return new Sphere(this.center.clone(),this.radius);
    }
}

export { Box, Sphere };