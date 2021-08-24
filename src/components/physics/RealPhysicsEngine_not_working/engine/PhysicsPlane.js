import { PhysicsShape, Face } from "./PhysicsShape";

class PhysicsShapePlane extends PhysicsShape {

    constructor(geometry) {
        super();
        // Eventually if Rigid Bodies Dynamic will be needed
        let faces = [];
        let vertices = geometry.getAttribute("position");
        let indices = geometry.index ? geometry.index.array : [...Array(vertices.count).keys()];

        let va = vertices.array;
        for (let i = 0; i < indices.length; i += 3) {
            // Extracting the 3 vertices to create a face
            let i1 = indices[i], i2 = indices[i + 1], i3 = indices[i + 2];
            let v1 = [va[i1 * 3], va[i1 * 3 + 1], va[i1 * 3 + 2]];
            let v2 = [va[i2 * 3], va[i2 * 3 + 1], va[i2 * 3 + 2]];
            let v3 = [va[i3 * 3], va[i3 * 3 + 1], va[i3 * 3 + 2]];
            // Creating the face
            faces.push(new Face(v1, v2, v3));
        }

        this.faces = faces;

        // Setting the bounding box
        geometry.computeBoundingBox();
        this.boundingBox.min.copy(geometry.boundingBox.min);
        this.boundingBox.max.copy(geometry.boundingBox.max);

        // Setting the bounding sphere
        geometry.computeBoundingSphere();
        this.boundingSphere.center.copy(geometry.boundingSphere.center);
        this.boundingSphere.radius = geometry.boundingSphere.radius;
    }

}

export { PhysicsShapePlane }