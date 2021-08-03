//loop through all the normals
for (let normal of allNormals) {

	//projection might be a for loop over one model’s vertices simply getting max and min value of dot(vertex, normal)
	intervalA = projection(objectA, normal);
	intervalB = projection(objectB, normal);

	//from this point on take first object as moving and the second one as static
	//calculate the velocity of moving object
	finalVelocity = velocityA - velocityB;

	//in order to prevent tunneling we need to expand the intervals by the model velocities - optimization
	//if the velocity is > 0 then we expand it to the right and vice versa
	if (finalVelocity > 0.0)
		velocityIntervalA.end += intervalA.end + finalVelocity;
	else
		velocityIntervalA.start += intervalB.start + finalVelocity;

	//if the velocity expanded intervals overlap, test the times
	if (velocityIntervalA.start <= intervalB.end && intervalB.start <= velocityIntervalA.end) {
		//we need the time intervals of overlap and find out if they overlap with each other :D
		//we have multiple time intervals, let's take the latest entry time and the earliest leave time, if maxEntry collision

		//it's calculated for one frame and since the velocity says how much the object moves in one frame, max time is 1 min is 0
		entry = 0.0;
		leave = 1.0;
		amount = 0.0;

		if (intervalA.end <= intervalB.start) {
			//interval A is going away from interval B, no possible collision
			if (finalVelocity <= 0.0)
				return res;
			//calculate the time of entering and leaving the other interval, t=s/v
			entry = absVal((intervalB.start - intervalA.end) / finalVelocity);
			leave = absVal((intervalB.end - intervalA.start) / finalVelocity);
		}
		//interval B is on the left
		else if (intervalB.end <= intervalA.start) {
			if (finalVelocity >= 0.0)
				return res;
			entry = absVal((intervalA.start - intervalB.end) / finalVelocity);
			leave = absVal((intervalA.end - intervalB.start) / finalVelocity);
		}
		//intervals already overlap
		else {
			//deciding how do the overlap
			if (intervalA.start <= intervalB.start) {
				leave = absVal((intervalB.end - intervalA.start) / finalVelocity);
				amount = intervalA.end - intervalB.start;
			}
			else {
				leave = absVal((intervalA.end - intervalB.start) / finalVelocity);
				amount = intervalB.end - intervalA.start;
			}
		}

		//here we can leave if the collision happens in the future frames (time is higher than max time of the frame = 1)
		if (entry > 1.0)
			return;


		//save max and min of overlap borders
		if (maxEntry < entry) {
			maxEntry = entry;
			minAmout = amount;
			collisionNormal = normal;
		}
		//this is the case of overlap, we can use the amount to push the objects out of each other
		else if (amount < minAmount) {
			minAmount = amount;
			overlapNormal = normal;
		}
		if (minLeave >= leave)
			minLeave = leave;

	}
	//if they don't overlap then we have found the separating axis (current normal) and we can say there is no collision
	else
		return;
}

//if there is a time interval that lies inside all the found ones, collision happened
if (minLeave >= maxEntry)
	foundInterval = true;
