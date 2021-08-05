
class PhysicsMaterial {

    /**
     * Define a material with specific physical properties
     * @param {Number} friction - A number between 0 and 1 defining the friction of the material. The higher this number, the faster an object brushing against this material slows down
     * @param {Number} restitution - A number between 0 and 1 defining the restitution, how much the body bounces back after a collision
     */
    constructor(friction = 0.5, restitution = 0){
        this.frictionFactor = Math.abs(Number(friction)); // Math.min(Math.abs(Number(friction)),1);
        this.restitutionFactor = Math.min(Math.abs(Number(restitution)),1);;
    }

}

export { PhysicsMaterial };