/**
 * Created by Zhongyi on 12/20/15.
 */
"use strict";

class KeyboardListener {
    constructor() {
        this.ON = false;
        this.last = {};

        document.addEventListener('keydown', (event)=> {
            let key = String.fromCharCode(event.which);
            if (this.last[key]) return;

            this.last[key] = event.timeStamp;
            this.ON = true;
        });
        document.addEventListener('keyup', (event)=> {
            let key = String.fromCharCode(event.which);
            this.last[key] = undefined;
            this.ON = false;
        })

    }

    bind(key, callback) {
        this.map.set(key, callback);
        return this;
    }
}