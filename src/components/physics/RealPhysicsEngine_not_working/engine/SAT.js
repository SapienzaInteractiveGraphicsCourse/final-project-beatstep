import { Vector3 } from "three";

const _tempVector = new Vector3(0, 0, 0);

class SAT {

    static projection(vertices, normal) {
        let max = -Infinity;
        let min = Infinity;
        for (let v of vertices) {
            let proj = v.dot(normal);
            max = Math.max(max, proj);
            min = Math.min(min, proj);
        }
        return { start: min, end: max };
    }

    static overlap(intervalA, intervalB) {
        if (intervalB.end < intervalA.start || intervalB.start > intervalA.end) return { start: 0, end: 0, length: -1 };
        let ret = { start: Math.max(intervalA.start, intervalB.start), end: Math.min(intervalA.end, intervalB.end), length: 0 };
        ret.length = ret.end - ret.start;
        return ret;
    }

    static checkCollision(body1, body2, deltaTime) {

        let allNormals = body1.getNormals();
        allNormals.push(...body2.getNormals());
        let vertices1 = body1.getVertices();
        let vertices2 = body2.getVertices();

        let mtv = new Vector3(0, 0, 0);
        let minPenetration = Infinity;
        let maxEntryTime = 0;
        let minLeaveTime = Infinity;
        let relativeVelocity = new Vector3(0, 0, 0).subVectors(body1.linearVelocity, body2.linearVelocity);
        for (let normal of allNormals) {
            
            let speed = normal.dot(relativeVelocity);

            let intervalA = SAT.projection(vertices1, normal);
            let intervalB = SAT.projection(vertices2, normal);

             // IntervalA initially on the left of intervalB
             if(intervalA.end < intervalB.start){
                if(speed <= 0) return null; // The intervals are moving apart
                let t = (intervalB.start - intervalA.end)/speed; // Begin-intersection time
                if(t > maxEntryTime){
                    maxEntryTime = t;
                    mtv.copy(normal);
                    minPenetration = 0;
                }
                if(maxEntryTime > deltaTime) return null; // The bodies won't intersect during this frame
                t = (intervalB.end - intervalA.start)/speed; // End-intersection time
                minLeaveTime = Math.min(t,minLeaveTime);
                if(maxEntryTime > minLeaveTime) return null; // There is no concurrent intersection on all axis
            }
            // IntervalA initially on the right of intervalB
            else if(intervalB.end < intervalA.start){
                if(speed >= 0) return null; // The intervals are moving apart
                let t = (intervalB.end - intervalA.start)/speed; // Begin-intersection time
                if(t > maxEntryTime){
                    maxEntryTime = t;
                    mtv.copy(normal);
                    minPenetration = 0;
                }
                if(maxEntryTime > deltaTime) return null; // The bodies won't intersect during this frame
                t = (intervalB.start - intervalA.end)/speed; // End-intersection time
                minLeaveTime = Math.min(t,minLeaveTime);
                if(maxEntryTime > minLeaveTime) return null; // There is no concurrent intersection on all axis
            }
            // The 2 intervals are already overlapping
            else{
                if(speed > 0){
                    let t = (intervalB.end - intervalA.start)/speed;
                    minLeaveTime = Math.min(t,minLeaveTime);
                    if(maxEntryTime > minLeaveTime) return null; // There is no concurrent intersection on all axis

                }
                else if(speed < 0){
                    let t = (intervalB.start - intervalA.end)/speed;
                    minLeaveTime = Math.min(t,minLeaveTime);
                    if(maxEntryTime > minLeaveTime) return null; // There is no concurrent intersection on all axis
                }
                let overlap = SAT.overlap(intervalA,intervalB);
                // If the minPenetration is greater than 0, there are no future intersections, all axis are intersecting right now, so we pick the one with the least penetration
                if(overlap.length < minPenetration){
                    minPenetration = overlap.length;
                    mtv.copy(normal);
                }

            }


        }

        let center1 = body1.getCenter();
        let center2 = body2.getCenter();
        center1.sub(center2);
        if(center1.dot(mtv) < 0){
            mtv.multiplyScalar(-1);
        }
        return { normal: mtv, penetration: minPenetration, collisionTime: maxEntryTime };
    }

    static checkCollision_1(body1, body2, deltaTime) {

        let allNormals = body1.getNormals();
        allNormals.push(...body2.getNormals());
        let vertices1 = body1.getVertices();
        let vertices2 = body2.getVertices();

        let mtv = new Vector3(0, 0, 0);
        let mtvLength = Infinity;
        for (let normal of allNormals) {
            let intervalA = SAT.projection(vertices1, normal);
            let intervalB = SAT.projection(vertices2, normal);

            let overlap = SAT.overlap(intervalA, intervalB);
            if (overlap.length == -1) {
                return null;
            }
            else if (overlap.length < mtvLength) {
                mtvLength = overlap.length;
                mtv.copy(normal);
            }
        }
        // The normal could be reveresed respect to body1, reverse it again
        let center1 = body1.getCenter();
        let center2 = body2.getCenter();
        center1.sub(center2);
        if(center1.dot(mtv) < 0){
            mtv.multiplyScalar(-1);
        }

        return { normal: mtv, penetration: mtvLength, collisionTime: 0  };
    }

    static checkCollision_2(body1, body2, deltaTime) {

        let allNormals = body1.getNormals();
        allNormals.push(...body2.getNormals());
        let vertices1 = body1.getVertices();
        let vertices2 = body2.getVertices();

        let mtv = new Vector3(0, 0, 0);
        let minPenetration = Infinity;
        let maxEntryTime = -Infinity;
        let minLeaveTime = Infinity;
        let relativeVelocity = new Vector3(0, 0, 0).subVectors(body1.linearVelocity, body2.linearVelocity)
        for (let normal of allNormals) {
            let intervalA = SAT.projection(vertices1, normal);
            let intervalB = SAT.projection(vertices2, normal);

            let finalVelocity = normal.dot(relativeVelocity);
            let velocityIntervalA = { start: intervalA.start, end: intervalA.end };

            // considering body2 still, body1 is moving to the right, expanding intervalA on the right
            if (finalVelocity > 0) {
                velocityIntervalA.end = intervalA.end + (finalVelocity * deltaTime);
            }
            // otherwise, body1 is moving to the left respect to body2 being still
            else {
                velocityIntervalA.start = intervalA.start + (finalVelocity * deltaTime);
            }

            let overlap = SAT.overlap(velocityIntervalA, intervalB);
            // there is no collision for the entire duration of this frame
            if (overlap.length == -1) {
                return false;
            }

            let entryTime, leaveTime, penetration;
            // the future collision is on the right of intervalA
            if (overlap.start > intervalA.end) {
                // intervalA is going towards intervalB, calculate the time of entering and leaving the other interval, t=s/v
                entryTime = Math.abs((overlap.start - intervalA.end) / finalVelocity);
                leaveTime = Math.abs((overlap.end - intervalA.start) / finalVelocity);
                penetration = 0;
            }
            // the future collision is on the left of intervalA
            else if (overlap.end < intervalA.start) {
                // intervalA is going towards intervalB, calculate the time of entering and leaving the other interval, t=s/v
                entryTime = Math.abs((intervalA.start - overlap.end) / finalVelocity);
                leaveTime = Math.abs((intervalA.end - overlap.start) / finalVelocity);
                penetration = 0;
            }
            // they are already intersecting
            else {
                entryTime = 0;
                // intervalA is on the left of intervalB
                if (intervalA.start <= overlap.start) {
                    leaveTime = Math.abs((overlap.end - intervalA.start) / finalVelocity);
                    penetration = intervalA.end - overlap.start;
                }
                // intervalA is on the right of intervalB
                else {
                    leaveTime = Math.abs((intervalA.end - overlap.start) / finalVelocity);
                    penetration = overlap.end - intervalA.start;
                }

            }

            // maxEntryTime = Math.max(maxEntryTime, entryTime);
            if (entryTime > maxEntryTime) {
                maxEntryTime = entryTime;
                mtv.copy(normal);
            }
            // minPenetration = Math.min(minPenetration,penetration);
            if (penetration < minPenetration) {
                minPenetration = penetration;
                mtv.copy(normal);
            }
            minLeaveTime = Math.min(minLeaveTime, leaveTime);

            // there is no simultaneous collision on all the axis
            if (maxEntryTime > minLeaveTime) return false;


            // let overlap = SAT.overlap(intervalA, intervalB);
            // if (overlap.length != -1 && overlap.length < mtvLength) {
            //     mtvLength = overlap.length;
            //     mtv.copy(normal);
            // }
            // // CCD
            // else {

            // }

        }
        let center1 = body1.getCenter();
        let center2 = body2.getCenter();
        center1.sub(center2);
        if(center1.dot(mtv) < 0){
            mtv.multiplyScalar(-1);
        }
        return { normal: mtv, penetration: minPenetration, collisionTime: maxEntryTime };
    }

}

export { SAT }