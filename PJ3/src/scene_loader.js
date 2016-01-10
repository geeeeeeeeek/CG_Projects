/**
 * Created by Zhongyi on 12/18/15.
 */
"use strict";

window.onload = () => {
  let canvas = document.getElementById('webgl');
  canvas.width = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
  canvas.height = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
  window.ratio = canvas.width / canvas.height;
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
    this.loaders = [];
    this.keyboardController = new KeyboardController();
  }

  init() {

    this.initKeyController();

    this.initLoaders();

    let render = (timestamp) => {
      this.initWebGL();

      this.initCamera(timestamp);

      for (let loader of this.loaders) {
        loader.render(timestamp);
      }

      window.requestAnimationFrame(render);
    };

    render();
  }

  initWebGL() {
    // Set clear color and enable hidden surface removal
    this.gl.clearColor(0.0, 0.0, 0.0, 1.0);

    // Clear color and depth buffer
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
  }

  initKeyController() {
    Camera.init();
    let cameraMap = new Map();
    cameraMap.set('W', 'posUp');
    cameraMap.set('A', 'posLeft');
    cameraMap.set('S', 'posDown');
    cameraMap.set('D', 'posRight');
    cameraMap.set('I', 'rotUp');
    cameraMap.set('J', 'rotLeft');
    cameraMap.set('K', 'rotDown');
    cameraMap.set('L', 'rotRight');
    cameraMap.set('F', 'flashLight');

    cameraMap.forEach((val, key)=> {
          this.keyboardController.bind(key, {
            on: (()=> {
              Camera.state[val] = 1;
            }),
            off: (()=> {
              Camera.state[val] = 0;
            })
          });
        }
    )
  }

  initCamera(timestamp) {
    let elapsed = timestamp - this.keyboardController.last;
    this.keyboardController.last = timestamp;

    let posX = (Camera.state.posUp - Camera.state.posDown) * MOVE_VELOCITY * elapsed / 1000,
        posY = (Camera.state.posRight - Camera.state.posLeft) * MOVE_VELOCITY * elapsed / 1000;

    let rotX = (Camera.state.rotUp - Camera.state.rotDown) * ROT_VELOCITY * elapsed / 1000 / 180 * Math.PI,
        rotY = (Camera.state.rotRight - Camera.state.rotLeft) * ROT_VELOCITY * elapsed / 1000 / 180 * Math.PI;

    if (posX || posY) Camera.move(posX, posY);
    if (rotX || rotY) Camera.rotate(rotX, rotY);
  }

  initLoaders() {
    // Load floor
    let floorLoader = new TextureLoader(floorRes, {
      'gl': this.gl,
      'activeTextureIndex': 0,
      'enableLight': true
    }).init();
    this.loaders.push(floorLoader);

    //// Load box
    let boxLoader = new TextureLoader(boxRes, {
      'gl': this.gl,
      'activeTextureIndex': 1,
      'enableLight': true
    }).init();
    this.loaders.push(boxLoader);

    // Load box
    let skyBoxLoader = new TextureLoader(skyBoxRes, {
      'gl': this.gl,
      'activeTextureIndex': 2,
      'enableLight': false
    }).init();
    this.loaders.push(skyBoxLoader);

    // Load objects
    for (let o of ObjectList) {
      let loader = new ObjectLoader(o, {'gl': this.gl}).init();
      // Add animation to bird
      if (o.objFilePath.indexOf('bird') > 0) {
        loader.nextFrame = (timestamp)=> {
          let rot = (timestamp / 1000 * 145) % 360,
              trans = (timestamp / 1000 * Math.PI) % (2 * Math.PI);

          loader.entity.transform[1].content[0] = rot;
          loader.entity.transform[2].content[1] = Math.sin(trans) * 2;
        }
      }
      this.loaders.push(loader);
    }
  }
}