
import HUD from "./HUD";

import { addRifle } from "../TempRifle";

class Player {

    constructor(camera) {
        this.camera = camera;
        this.hud = new HUD(camera);

        addRifle((obj)=>{
            //obj.scale(0.5,0.5,0.5);
            obj.position.set(0.3,-0.25,-1);
            obj.rotation.y = Math.PI/13;
            obj.rotation.x = 0.05;
        
            
            // obj.position.set(0,-0.5,-1);
            // obj.rotation.y = 0;
            // obj.rotation.x = 0.35;
        
            camera.add(obj);
        });
    }

    get position() {
        return camera.position;
    }

}

export default Player;