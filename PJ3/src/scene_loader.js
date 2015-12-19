/**
 * Created by Zhongyi on 12/18/15.
 */
"use strict";

window.onload = () => {
    let canvas = document.getElementById('webgl');
    let gl = getWebGLContext(canvas);
    if (!gl) {
        console.log('Failed to get the rendering context for WebGL');
        return;
    }

    // load a new scene
    new SceneLoader(gl).init();
};

class SceneLoader {
    constructor(gl) {
        this.gl = gl;
    }

    init() {
        this.initWebGL();

        let floorLoader = new FloorLoader(this.gl);
        floorLoader.init();

        setTimeout(()=> {
            let boxLoader = new BoxLoader(this.gl);
            boxLoader.init();
        }, 0);
    }

    initWebGL() {
        // Set clear color and enable hidden surface removal
        this.gl.clearColor(0.0, 0.0, 0.0, 1.0);

        // Clear color and depth buffer
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
    }
}