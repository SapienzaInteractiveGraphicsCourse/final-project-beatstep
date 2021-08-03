import { Vector3, Vector4 } from "three";
import { Box, Sphere } from "./BoundingShapes";

const _tempVector = new Vector3(0, 0, 0);

class PhysicsShape {

    constructor() {
        if (this.constructor === PhysicsShape) {
            throw new Error("Cannot instantiate PhysicsBody. Use an inheriting class");
        }
        // List of all the faces composing this shape
        this.faces = [];

        // If set to false, bounding box is used for collision
        // If set to true, bounding sphere is used for collision
        this.preferBoundingBox = false;
        // The axis aligned bounding box
        this.boundingBox = new Box();
        // The bounding sphere
        this.boundingSphere = new Sphere();
        // The center of the shape
        this.center = new Vector3(0,0,0);
    }

    getFaces(matrixWorld) {
        let newFaces = [];
        for (let f of this.faces) {
            newFaces.push(f.clone(matrixWorld));
        }
        return newFaces;
    }

    getVertices(matrixWorld) {
        let newVertices = [];
        if(matrixWorld){
            for (let f of this.faces) {
                newVertices.push(
                    f.v1.clone().applyMatrix4(matrixWorld).fixZeroPrecision(),
                    f.v2.clone().applyMatrix4(matrixWorld).fixZeroPrecision(),
                    f.v3.clone().applyMatrix4(matrixWorld).fixZeroPrecision()
                );
            }
        }
        else{
            for (let f of this.faces) {
                newVertices.push(
                    f.v1.clone().fixZeroPrecision(),
                    f.v2.clone().fixZeroPrecision(),
                    f.v3.clone().fixZeroPrecision()
                );
            }
        }
        return newVertices;
    }

    getNormals(matrixWorld) {
        let newNormals = [];
        if(matrixWorld){
            for (let f of this.faces) {
                newNormals.push(
                    f.normal.clone().transformDirection(matrixWorld).fixZeroPrecision()
                );
            }
        }
        else{
            for (let f of this.faces) {
                newNormals.push(
                    f.normal.clone().fixZeroPrecision()
                );
            }
        }
        return newNormals;
    }

    getCenter(matrixWorld){
        let newCenter = this.center.clone();
        if(matrixWorld) newCenter.applyMatrix4(matrixWorld);
        return newCenter;
    }

}

class Face {
    /**
     * 
     * @param {Array|Vector3} v1 - Array containing x,y,z of the vertex or Vector3 of the vertex
     * @param {Array|Vector3} v2 - Array containing x,y,z of the vertex or Vector3 of the vertex
     * @param {Array|Vector3} v3 - Array containing x,y,z of the vertex or Vector3 of the vertex
     */
    constructor(v1 = [0, 0, 0], v2 = [0, 0, 0], v3 = [0, 0, 0]) {

        this.v1 = Array.isArray(v1) ? new Vector3().fromArray(v1) : v1;
        this.v2 = Array.isArray(v2) ? new Vector3().fromArray(v2) : v2;
        this.v3 = Array.isArray(v3) ? new Vector3().fromArray(v3) : v3;

        this.midpoint = new Vector3(
            (this.v1.x + this.v2.x + this.v3.x) / 3,
            (this.v1.y + this.v2.y + this.v3.y) / 3,
            (this.v1.z + this.v2.z + this.v3.z) / 3
        ).fixZeroPrecision();

        // plane = [(X_1 − X_3) × (X_2 − X_3), −X_3T(X_1 × X_2)]
        this.plane = new Vector4();

        let topVec1 = new Vector3(0, 0, 0).subVectors(this.v1, this.v3);
        let topVec2 = new Vector3(0, 0, 0).subVectors(this.v2, this.v3);
        this.normal = new Vector3(0, 0, 0).crossVectors(topVec1, topVec2).normalize().fixZeroPrecision();
        this.plane.copy(this.normal);

        let planeW = this.v3.dot(new Vector3(0, 0, 0).crossVectors(this.v1, this.v2));
        this.plane.setW(planeW);
    }

    /**
     * Sets this face to be equal to the supplied face. If a matrixWorld is provided, is applied to this face
     * @param {Face} face - The face to copy
     * @param {Matrix4} matrixWorld - A transformation matrix
     */
    set(face, matrixWorld) {
        this.v1.copy(face.v1);
        this.v2.copy(face.v2);
        this.v3.copy(face.v3);

        this.midpoint.copy(face.midpoint);
        this.normal.copy(face.normal);

        this.plane.copy(face.plane);

        if (matrixWorld) {
            this.v1.applyMatrix4(matrixWorld);
            this.v2.applyMatrix4(matrixWorld);
            this.v3.applyMatrix4(matrixWorld);

            this.midpoint.applyMatrix4(matrixWorld);
            this.normal.transformDirection(matrixWorld);

            this.plane.applyMatrix4(matrixWorld);
        }
        return this;
    }

    /**
     * Clones this face. If a matrixWorld is provided, is applied to this face
     * @param {Matrix4} matrixWorld - A transformation matrix
     */
    clone(matrixWorld) {
        if (!matrixWorld) {
            return new Face(
                this.v1.clone(),
                this.v2.clone(),
                this.v3.clone()
            );
        }
        if (matrixWorld) {
            return new Face(
                this.v1.clone().applyMatrix4(matrixWorld),
                this.v2.clone().applyMatrix4(matrixWorld),
                this.v3.clone().applyMatrix4(matrixWorld)
            );
        }
    }


}

export { PhysicsShape, Face }