import { Vector3 } from "three";

const _tmpVec1 = new Vector3(0,0,0);
const _tmpVec2 = new Vector3(0,0,0);

class Raycaster {

    constructor(){
        
    }


    /**
     * Calculates whether there is an intersection between a line and the plane this face resides on.
     * @param {Vector3} lineOrigin - The origin of the line 
     * @param {Vector3} lineDirection - The direction of the line 
     * @param {Vector3} planeNormal - The normal of the plane
     * @param {Vector3} planePoint - A point on the plane
     * @returns {Object} Returns null if there is no intersection, an object with the intersection point and distance otherwise.
     *                   The distance is with sign, positive if the line origin is in front of the face, negative if is on the back of the face
     *                   If the intersection point is the line origin and the distance is zero, the line is fully contained in the plane
     */
    static intersectionLineWithPlane(lineOrigin, lineDirection, planeNormal, planePoint) {
        let denominator = _tmpVec1.copy(lineDirection).normalize().dot(planeNormal); // ld • n
        let numerator = _tmpVec2.subVectors(planePoint, lineOrigin).dot(planeNormal); // (p - lo) • n
        // If both the denominator == 0 and the numerator == 0 => the entire line is contained in the plane
        if (denominator == 0 && numerator == 0) {
            return {
                point: lineOrigin.clone(),
                distance: 0
            }
        }
        // If the denominator == 0 but the numerator != 0 => there is no intersection
        if (denominator == 0) {
            return {
                point: null,
                distance: Infinity
            }
        }
        // If the denominator != 0 but the numerator != 0 => there is a single point of intersection
        let d = numerator / denominator;
        return {
            point: lineDirection.clone().normalize().multiplyScalar(d).add(lineOrigin), // intersection = lo + ld*d
            distance: d
        }
    }

    /**
     * Computes the distance between a point and the plane this face resides on.
     * The distance is positive if the point is in front of the face, is negative if the point is on the back of the face
     * @param {Vector3} point - A point in space 
     * @param {Vector3} planeNormal - The normal of the plane
     * @param {Vector3} planePoint - A point on the plane
     * @returns {Number} The distance
     */
    static distancePointFromPlane(point, planeNormal, planePoint) {
        let v = _tmpVec1.subVectors(point, planePoint);
        return v.dot(planeNormal);
    }


    /**
     * Check if the point is inside a triangular or quadrangular face using the Same-Side Technique (https://blackpawn.com/texts/pointinpoly/)
     * @param {Vector3} point - The point to check
     * @param {Face} face - The face to check for
     * @param {Boolean} coplanar - A flag reassuring that the point is coplanar to the face. If false, the coplanarity is checked
     * @returns {Boolean} If the point is inside the face or not
     */
    static pointInsideFace(point, face, coplanar = false) {
        // Check if the point is coplanar. If not, return false
        if (!coplanar && Math.abs(_tmpVec1.copy(point).sub(face.midpoint).dot(face.normal)) < 1e10) {
            return false;
        }

        // First side
        let side = _tmpVec1.subVectors(face.v2, face.v1).fixZeroPrecision();
        let vec = _tmpVec2.subVectors(point, face.v1).fixZeroPrecision();
        let inside = side.cross(vec).dot(face.normal);
        if (inside < 0) return false;

        // Second side
        side.subVectors(face.v3, face.v2).fixZeroPrecision();
        vec.subVectors(point, face.v2).fixZeroPrecision();
        inside = side.cross(vec).dot(face.normal);
        if (inside < 0) return false;

        
        if(!face.v4){
            // Third side
            side.subVectors(face.v1, face.v3).fixZeroPrecision();
            vec.subVectors(point, face.v3).fixZeroPrecision();
            inside = side.cross(vec).dot(face.normal);
            if (inside < 0) return false;
        }
        else{
            // Third side
            side.subVectors(face.v4, face.v3).fixZeroPrecision();
            vec.subVectors(point, face.v3).fixZeroPrecision();
            inside = side.cross(vec).dot(face.normal);
            if (inside < 0) return false;

            
            // Fourth side
            side.subVectors(face.v1, face.v4).fixZeroPrecision();
            vec.subVectors(point, face.v4).fixZeroPrecision();
            inside = side.cross(vec).dot(face.normal);
            if (inside < 0) return false;
        }

        return true;

    }

    /**
     * Casts a ray from the origin torward the supplied face.
     * Returns if the ray intersects the face and the intersection point is closer than length
     * @param {Vector3} lineOrigin - The origin of the line 
     * @param {Vector3} lineDirection - The direction of the line 
     * @param {Face} face - The face to check the intersection with
     * @param {Number} length - The length for which the intersection is valid
     * @returns {Object} The intersection object with the intersection point, the distance and the raycasted face
     */
    static raycastToFace(lineOrigin, lineDirection, face, length) {
        // If the origin is further than length from the other face's plane, for sure we don't care about the intersection
        if (Math.abs(Raycaster.distancePointFromPlane(lineOrigin, face.normal, face.midpoint)) > length) return { point: null, distance: Infinity, raycastedFace: null, raycastOrigin: null, raycastDirection: null };
        //Compute the intersection point and its distance. If is further than length, return false
        let { point: intersectionPoint, distance } = Raycaster.intersectionLineWithPlane(lineOrigin, lineDirection, face.normal, face.midpoint);
        if (distance < 0 || distance > length) return { point: null, distance, raycastedFace: null, raycastOrigin: null, raycastDirection: null  };
        // If the intersection point is inside the face, return the intersection point and the distance
        if (Raycaster.pointInsideFace(intersectionPoint, face, true)) return { point: intersectionPoint, distance, raycastedFace: face, raycastOrigin: lineOrigin.clone(), raycastDirection: lineDirection.clone() };

        return { point: null, distance, raycastedFace: null, raycastOrigin: null, raycastDirection: null };
    }

    /**
     * Casts a ray from the origin torward the supplied face.
     * Returns if the ray intersects the face and the intersection point is closer than length
     * @param {Vector3} lineOrigin - The origin of the line 
     * @param {Vector3} lineDirection - The direction of the line 
     * @param {Face[]} faces - The list of faces to check the intersection with
     * @param {Number} length - The length for which the intersection is valid
     * @param {Boolean} firstHitOnly - Whether to return immediatly after the first hit
     * @param {Number} sortByDistance - Sorts the intersections by distance, ascending if +1, descending if -1, not sorted if 0
     * @returns {Object[]} The intersection object list with the intersection points, the distance and the raycasted faces
     */
    static raycastToFaces(lineOrigin, lineDirection, faces, length, firstHitOnly = false, sortByDistance = 0) {
        let intersections = [];
        for (let face of faces) {
            let int = Raycaster.raycastToFace(lineOrigin, lineDirection, face, length);
            if(int.point){
                intersections.push(int);
                if(firstHitOnly) break;
            }
        }
        if(sortByDistance){
            intersections.sort((a, b) => { 
                let dif = a.distance - b.distance;
                return dif*sortByDistance;
            });
        }
        return intersections;
    }


}

export { Raycaster }