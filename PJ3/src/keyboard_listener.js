/**
 * Created by Zhongyi on 12/20/15.
 */
"use strict";

class KeyboardListener {
    constructor() {
        this.map = new Map();

        document.addEventListener('keydown', (event)=> {
            let key = String.fromCharCode(event.keyCode);;
            let callback = this.map.get(key);
            if (callback && typeof (callback) == 'function') {
                callback();
            }
        })

    }

    bind(key, callback) {
        this.map.set(key, callback);
        return this;
    }
}