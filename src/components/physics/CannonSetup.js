import * as CANNON from 'cannon';

const world = new CANNON.World();
world.gravity.set(0,-9.8,0);
world.broadphase = new CANNON.NaiveBroadphase();
world.solver.iterations = 10;

export { CANNON, world };