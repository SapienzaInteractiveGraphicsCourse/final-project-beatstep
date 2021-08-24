
class PhysicsMaterial {

    /**
     * 
     * @param {Number} friction - A number between 0 and 1 defining the friction of the material. The higher this number, the higher the opposing friction force
     * @param {Number} inertia - A number between 0 and 1 defining the inertia of the object. The higher this number, the less the body slows down
     * @param {Number} restitution - A number between 0 and 1 defining the restitution
     */
    constructor(friction = 0.5, inertia = 0.5, restitution = 0.5){
        this.frictionFactor = Math.min(Math.abs(Number(friction)),1);
        this.inertiaFactor = Math.min(Math.abs(Number(inertia)),1);
        this.restitutionFactor = Math.min(Math.abs(Number(restitution)),1);;
    }

}

export { PhysicsMaterial };