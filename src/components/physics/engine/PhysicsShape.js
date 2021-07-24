import { Vector3, Vector4 } from "three";
import { Box, Sphere } from "./BoundingShapes";

const _tempVector = new Vector3(0,0,0);

class PhysicsShape {

    constructor() {
        if(this.constructor === PhysicsShape){
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
    }

    /**
     * Applies the transformation matrix matrixWorld to all the faces of this shape and then
     * casts a ray from the center of supplied face torward all the faces of this shape.
     * Returns if the ray intersects the face and the intersection point is closer than maxDistance
     * @param {Face} face - The face to check the intersection with, has to be in world coordinates
     * @param {Number} maxDistance - The maxDistance for which the intersection is valid
     * @param {Matrix4} matrixWorld - The transformation matrix to apply to this shape
     * @param {Boolean} firstHitOnly - If true, return the intersection array right after the first hit has been detected
     * @returns  {Object[]} A list of intersection objects. The intersection object has the intersection point where the face
     *                      intersects this shape's face, the distance between the intersection point on this shape and the supplied face's midpoint and the 2 faces
     */
    raycastFromFace(face, maxDistance, matrixWorld, firstHitOnly = false){
        let intersections = [];
        let fWorld = new Face(); // Used to apply this body's matrixWorld to all his faces
        for (let f of this.faces) {
            fWorld.set(f,matrixWorld);
            let int = fWorld.raycastFromFace(face, maxDistance);
            if(int){
                int.raycastedShape = this;
                intersections.push(int);
                if(firstHitOnly) break;
            }
        }
        return intersections;
    }

    static sphereToSphereDistance(sphere1, sphere2){
        return sphere1.center.distanceTo(sphere2.center) - sphere1.radius - sphere2.radius;
    }

    static boxToBoxDistance(box1,box2){
        let xDistance = Math.min(
            (box1.min.x - box2.min.x),
            (box1.min.x - box2.max.x),
            (box1.max.x - box2.min.x),
            (box1.max.x - box2.max.x),
        );
        let yDistance = Math.min(
            (box1.min.y - box2.min.y),
            (box1.min.y - box2.max.y),
            (box1.max.y - box2.min.y),
            (box1.max.y - box2.max.y),
        );
        let zDistance = Math.min(
            (box1.min.z - box2.min.z),
            (box1.min.z - box2.max.z),
            (box1.max.z - box2.min.z),
            (box1.max.z - box2.max.z),
        );
        return Math.sqrt((xDistance*xDistance)+(yDistance*yDistance)+(zDistance*zDistance));
    }

    static boxToSphereDistance(box,sphere){
        let boxEdge = _tempVector.copy(sphere.center).clamp( box.min, box.max );
        return sphere.center.distanceTo(boxEdge) - sphere.radius;
    }
    

}

class Face {
    /**
     * 
     * @param {Array|Vector3} v1 - Array containing x,y,z of the vertex or Vector3 of the vertex
     * @param {Array|Vector3} v2 - Array containing x,y,z of the vertex or Vector3 of the vertex
     * @param {Array|Vector3} v3 - Array containing x,y,z of the vertex or Vector3 of the vertex
     */
    constructor(v1 = [0,0,0],v2 = [0,0,0],v3 = [0,0,0]){

        this.v1 = Array.isArray(v1) ? new Vector3().fromArray(v1) : v1;
        this.v2 = Array.isArray(v2) ? new Vector3().fromArray(v2) : v2;
        this.v3 = Array.isArray(v3) ? new Vector3().fromArray(v3) : v3;

        this.midpoint = new Vector3(
            (v1[0]+v2[0]+v3[0])/3,
            (v1[1]+v2[1]+v3[1])/3,
            (v1[2]+v2[2]+v3[2])/3
        );
        
        // plane = [(X_1 − X_3) × (X_2 − X_3), −X_3T(X_1 × X_2)]
        this.plane = new Vector4();

        let topVec1 = new Vector3(0,0,0).subVectors(this.v1,this.v3);
        let topVec2 = new Vector3(0,0,0).subVectors(this.v2,this.v3);
        this.normal = new Vector3(0,0,0).crossVectors(topVec1,topVec2).normalize();
        this.plane.copy(this.normal);

        let planeW = this.v3.dot(new Vector3(0,0,0).crossVectors(this.v1,this.v2));
        this.plane.setW(planeW);


    }

    /**
     * Computes the distance between a point and the plane this face resides on.
     * The distance is positive if the point is in front of the face, is negative if the point is on the back of the face
     * @param {Vector3} point - A point in space 
     * @returns {Number} The distance
     */
    distancePointFromPlane(point){
        let v = new Vector3(0,0,0).subVectors(point,this.midpoint);
        return v.dot(this.normal);
    }

    /**
     * Calculates whether there is an intersection between a line and the plane this face resides on.
     * @param {Vector3} lineOrigin - The origin of the line 
     * @param {Vector3} lineDirection - The direction of the line 
     * @returns {Object} Returns null if there is no intersection, an object with the intersection point and distance otherwise.
     *                   The distance is with sign, positive if the line origin is in front of the face, negative if is on the back of the face
     *                   If the intersection point is the line origin and the distance is zero, the line is fully contained in the plane
     */
    intersectionLineWithPlane(lineOrigin, lineDirection){
        let denominator = lineDirection.clone().dot(this.normal); // ld • n
        let numerator = new Vector3(0,0,0).subVectors(this.midpoint,lineOrigin).dot(this.normal); // (mp - lo) • n
        // If both the denominator == 0 and the numerator == 0 => the entire line is contained in the plane
        if(denominator == 0 && numerator == 0){
            return {
                point: lineOrigin.clone(),
                distance: 0
            }
        }
        // If the denominator == 0 but the numerator != 0 => there is no intersection
        if(denominator == 0){
            return {
                point: null,
                distance: Infinity
            }
        }
        // If the denominator != 0 but the numerator != 0 => there is a single point of intersection
        let d = numerator/denominator;
        return {
            point: lineDirection.clone().multiplyScalar(d).add(lineOrigin), // intersection = lo + ld*d
            distance: d
        }
    }

    /**
     * Check if the point is inside the face using the Same-Side Technique (https://blackpawn.com/texts/pointinpoly/)
     * @param {Vector3} point - The point to check
     * @param {Boolean} coplanar - A flag reassuring that the point is coplanar to the face. If false, the coplanarity is checked
     * @returns {Boolean} If the point is inside the face or not
     */
    pointInsideFace(point,coplanar = false) {
        // Check if the point is coplanar. If not, return false
        if(!coplanar && point.clone().sub(this.midpoint).dot(this.normal) == 0){
            return false;
        }

        // First side
        let side = new Vector3(0,0,0).subVectors(this.v2,this.v1);
        let vec = new Vector3(0,0,0).subVectors(point,this.v1);
        let inside = side.cross(vec).dot(this.normal);
        if(inside < 0) return false;

        // Second side
        side.subVectors(this.v3,this.v2);
        vec.subVectors(point,this.v2);
        inside = side.cross(vec).dot(this.normal);
        if(inside < 0) return false;

        // Third side
        side.subVectors(this.v1,this.v3);
        vec.subVectors(point,this.v3);
        inside = side.cross(vec).dot(this.normal);
        if(inside < 0) return false;

        return true;

    }

    /**
     * Casts a ray from the center of this face torward the supplied face.
     * Returns if the ray intersects the face and the intersection point is closer than maxDistance
     * @param {Face} face - The face to check the intersection with
     * @param {Number} maxDistance - The maxDistance for which the intersection is valid
     * @returns {Object} The intersection object with the intersection point, the distance and the 2 faces
     */
    raycastToFace(face, maxDistance){
        // If this face's midpoint is further than maxDistance from the other face's plane, for sure we don't care about the intersection
        if(Math.abs(face.distancePointFromPlane(this.midpoint)) > maxDistance) return null;
        //Compute the intersection point and its distance. If is further than maxDistance, return false
        let {point: intersectionPoint, distance} = face.intersectionLineWithPlane(this.midpoint,this.normal);
        if(Math.abs(distance) > maxDistance) return null;
        // If the intersection point is inside the face, return the intersection point and the distance
        if(face.pointInsideFace(intersectionPoint,true)) return {point: intersectionPoint, distance, raycastingFace: this, raycastedFace: face};

        return null;
    }

    

    /**
     * Casts a ray from the center of supplied face torward this face.
     * Returns if the ray intersects the face and the intersection point is closer than maxDistance
     * @param {Face} face - The face to check the intersection with
     * @param {Number} maxDistance - The maxDistance for which the intersection is valid
     * @returns {Object} The intersection object has the intersection point where the face intersects this shape's face,
     *                   ùàthe distance between the intersection point on this shape and the supplied face's midpoint and the 2 faces
     */
     raycastFromFace(face, maxDistance){
        // If this face's midpoint is further than maxDistance from the other face's plane, for sure we don't care about the intersection
        if(Math.abs(this.distancePointFromPlane(face.midpoint)) > maxDistance) return null;
        //Compute the intersection point and its distance. If is further than maxDistance, return false
        let {point: intersectionPoint, distance} = this.intersectionLineWithPlane(face.midpoint,face.normal);
        if(Math.abs(distance) > maxDistance) return null;
        // If the intersection point is inside the face, return true
        if(this.pointInsideFace(intersectionPoint,true)) return {point: intersectionPoint, distance, raycastingFace: face, raycastedFace: this};

        return null;
    }

    /**
     * Sets this face to be equal to the supplied face. If a matrixWorld is provided, is applied to this face
     * @param {Face} face - The face to copy
     * @param {Matrix4} matrixWorld - A transformation matrix
     */
    set(face,matrixWorld){
        this.v1.copy(face.v1);
        this.v2.copy(face.v2);
        this.v3.copy(face.v3);

        this.midpoint.copy(face.midpoint);
        this.normal.copy(face.normal);
        
        this.plane.copy(face.plane);

        if(matrixWorld){
            this.v1.applyMatrix4(matrixWorld);
            this.v2.applyMatrix4(matrixWorld);
            this.v3.applyMatrix4(matrixWorld);
            
            this.midpoint.applyMatrix4(matrixWorld);
            this.normal.transformDirection(matrixWorld);
            
            this.plane.applyMatrix4(matrixWorld);
        }
        return this;
    }

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