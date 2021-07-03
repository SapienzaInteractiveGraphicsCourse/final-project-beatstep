import { LoadingManager , TextureLoader } from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';

class GeneralLoadingManager extends LoadingManager {

    constructor(onLoad, onProgress, onError) {
        super();
        this.onLoadList = [];
        this.onStartList = [];
        this.onProgressList = [];
        this.onErrorList = [];

        this.addHandler(/(png|svg|jpg|jpeg|gif|texture)$/i, new TextureLoader(this));
        this.addHandler(/obj$/i, new OBJLoader(this));
        this.addHandler(/gltf$/i, new GLTFLoader(this));
        this.addHandler(/fbx$/i, new FBXLoader(this));

        if (onLoad) this.onLoadList.push(onLoad);
        if (onProgress) this.onProgressList.push(onProgress);
        if (onError) this.onErrorList.push(onError);

        this.onLoad = function() {
            for (const f of this.onLoadList) {
                f();
            }
        };

        this.onProgress = function(url, itemsLoaded, itemsTotal) {
            for (const f of this.onProgressList) {
                f(url, itemsLoaded, itemsTotal);
            }
        };

        this.onError = function(url) {
            for (const f of this.onErrorList) {
                f(url);
            }
        };

        this.onStart = function(url, itemsLoaded, itemsTotal) {
            for (const f of this.onStartList) {
                f(url, itemsLoaded, itemsTotal);
            }
        };
    }

    addOnLoad(onLoad) {
        if (onLoad) this.onLoadList.push(onLoad);
    }

    addOnProgress(onProgress) {
        if (onProgress) this.onProgressList.push(onProgress);
    }

    addOnStart(onStart) {
        if (onStart) this.onStartList.push(onStart);
    }

    addOnError(onError) {
        if (onError) this.onErrorList.push(onError);
    }

}

const DefaultGeneralLoadingManager = new GeneralLoadingManager();

export { DefaultGeneralLoadingManager, GeneralLoadingManager };