import * as THREE from 'three';
import { CANNON, world } from './physics/CannonSetup';

function genFloor(planeSize) {
    const loader = new THREE.TextureLoader();
    const texture = loader.load('https://threejsfundamentals.org/threejs/resources/images/checker.png');
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.magFilter = THREE.NearestFilter;
    const repeats = planeSize / 2;
    texture.repeat.set(repeats, repeats);

    const planeGeo = new THREE.PlaneGeometry(planeSize, planeSize);
    const planeMat = new THREE.MeshPhongMaterial({
        map: texture,
        side: THREE.DoubleSide,
    });
    const mesh = new THREE.Mesh(planeGeo, planeMat);
    mesh.rotation.x = Math.PI * -.5;
    mesh.receiveShadow = true;

    let shape = new CANNON.Plane();
    let body = new CANNON.Body({
        mass: 0
    });
    body.addShape(shape);
    body.quaternion.copy(mesh.quaternion);
    world.addBody(body);

    return mesh;
}

export { genFloor }