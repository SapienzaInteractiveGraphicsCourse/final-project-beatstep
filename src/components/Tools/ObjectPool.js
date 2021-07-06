
class ObjectPool {

    constructor(objectClass, poolSize = 1, objectArguments = []) {
        this.freeObject = [];
        this.usingObject = {};
        this.objectClass = objectClass;
        this.objectArguments = objectArguments;
        this.poolId = 0;

        if (poolSize < 1) throw "poolSize can't be less that 1";

        for (let i = 0; i < poolSize; i++) {
            let o = new objectClass(...objectArguments);
            o.__poolId = `p${this.poolId++}`;
            o.__poolUsing = false;
            this.freeObject.push(o)
            o.freeInPool = function () {
                if (o.__poolUsing)
                    this.freeUsingObject(o.__poolId);
            }.bind(this);
        }

    }

    getFreeObject() {
        let fo;
        if (this.freeObject.length > 0) {
            fo = this.freeObject.pop();
            this.usingObject[fo.__poolId] = fo;
            fo.__poolUsing = true;
        }
        else {
            fo = new this.objectClass(...objectArguments);
            fo.__poolId = this.poolId;
            this.poolId++;
            fo.__poolUsing = true;
            this.usingObject[fo.__poolId] = fo;
        }
        return fo;
    }

    freeUsingObject(o) {
        if (typeof o != "string") {
            try {
                o = o.__poolId;
            } catch (error) {
                throw `${o} is not a valid id or an object of this pool`;
            }
        }
        if (Object.keys(this.usingObject).includes(o)) {
            let fo = this.usingObject[o];
            delete this.usingObject[o];
            fo.__poolUsing = false;
            this.freeObject.push(fo);
        }
        else {
            throw `${o} is not a valid id or an object of this pool`;
        }
    }

    update(){
        for (const [id, o] of Object.entries(this.usingObject)) {
            if(o.update){
                o.update.apply(o,arguments);
            }
        }
    }


}

export { ObjectPool };