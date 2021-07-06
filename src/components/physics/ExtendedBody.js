import { CANNON, world } from "./CannonSetup";

class ExtendedBody extends CANNON.Body {
    constructor(options, addToWorld = false) {
        super(options);
        if (addToWorld) world.addBody(this);
    }

    update(mesh) {
        mesh.position.copy(this.position);
        mesh.quaternion.copy(this.quaternion);
    }

}

export { ExtendedBody };