import * as CANNON from 'cannon';

const world = new CANNON.World();
world.gravity.set(0,-9.8,0);
world.quatNormalizeSkip = 0;
world.quatNormalizeFast = false;
world.defaultContactMaterial.contactEquationStiffness = 1e9;
world.defaultContactMaterial.contactEquationRelaxation = 4;
world.broadphase = new CANNON.NaiveBroadphase();
world.solver.iterations = 10;
world.solver.tolerance = 0.1;

// Create a slippery material (friction coefficient = 0.0)
let physicsMaterial = new CANNON.Material("slipperyMaterial");
let physicsContactMaterial = new CANNON.ContactMaterial(physicsMaterial,
                                                        physicsMaterial,
                                                        0.0, // friction coefficient
                                                        0.3  // restitution
                                                        );
// We must add the contact materials to the world
world.addContactMaterial(physicsContactMaterial);

export { CANNON, world };