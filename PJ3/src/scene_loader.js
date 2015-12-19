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

    // Load a new scene
    new SceneLoader(gl).init();
};

class SceneLoader {
    constructor(gl) {
        this.gl = gl;
        this.keyboardListener = new KeyboardListener();
    }

    init() {
        let floorLoader = new FloorLoader(this.gl);
        floorLoader.init();

        let boxLoader = new BoxLoader(this.gl);
        boxLoader.init();

        let render = () => {
            this.initWebGL();
            floorLoader.render();
            boxLoader.render();
            window.requestAnimationFrame(render);
        };
        render();

        this.initInteractions();
    }

    initWebGL() {
        // Set clear color and enable hidden surface removal
        this.gl.clearColor(0.0, 0.0, 0.0, 1.0);

        // Clear color and depth buffer
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
    }

    initInteractions() {
        (this.keyboardListener.bind('W', ()=> {
            alert('W pressed!');
        }).bind('A', ()=> {
            alert('A pressed!');
        }).bind('S', ()=> {
            alert('S pressed!');
        }).bind('D', ()=> {
            alert('D pressed!');
        }).bind('I', ()=> {
            alert('I pressed!');
        }).bind('J', ()=> {
            alert('J pressed!');
        }).bind('K', ()=> {
            alert('K pressed!');
        }).bind('L', ()=> {
            alert('L pressed!');
        }));
    }
}