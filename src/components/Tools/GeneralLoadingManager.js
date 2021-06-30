import { LoadingManager } from 'three';

class GeneralLoadingManager extends LoadingManager {

    constructor(onLoad, onProgress, onError) {
        super();
        this.onLoadList = [];
        this.onStartList = [];
        this.onProgressList = [];
        this.onErrorList = [];

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

export default GeneralLoadingManager;