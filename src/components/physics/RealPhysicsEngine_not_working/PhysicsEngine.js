import { PhysicsWorld } from "./engine/PhysicsWorld";
import { PhysicsBody } from "./engine/PhysicsBody";
import { PhysicsShape, Face } from "./engine/PhysicsShape";
import { PhysicsShapeThree } from "./engine/PhysicsShapeThree";
import { Box, Sphere } from "./engine/BoundingShapes";
import { PhysicsMaterial } from "./engine/PhysicsMaterial";

const world = new PhysicsWorld();
world.gravity.y = -9.81;

export { world, PhysicsWorld, PhysicsBody, PhysicsShape, PhysicsShapeThree, PhysicsMaterial, Box, Sphere };