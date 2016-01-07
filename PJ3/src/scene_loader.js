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
    this.loaders = [];
    this.keyboardListener = new KeyboardListener();
  }

  init() {

    this.rotation = [0, 0];

    let floorLoader = new TextureLoader(floorRes, {
      'gl': this.gl,
      'activeTextureIndex': 0,
      'drawMode': 'TRIANGLE_STRIP',
      'drawCount': 4
    });
    this.loaders.push(floorLoader);
    floorLoader.init();

    let boxLoader = new TextureLoader(boxRes, {
      'gl': this.gl,
      'activeTextureIndex': 1,
      'drawMode': 'TRIANGLE_FAN',
      'drawCount': 24
    });
    this.loaders.push(boxLoader);
    boxLoader.init();

    for (let o of ObjectList) {
      let loader = new ObjectLoader(o, {'gl': this.gl});
      this.loaders.push(loader);
      loader.init();
    }

    let render = () => {
      this.initWebGL();

      if (this.keyboardListener.ON) {
        this.initCamera();
      }

      for (let loader of this.loaders) {
        loader.render();
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

  initCamera() {

    let x = CameraPara.at[0] - CameraPara.eye[0];
    let y = CameraPara.at[1] - CameraPara.eye[1];
    let z = CameraPara.at[2] - CameraPara.eye[2];

    let xzDistance = Math.sqrt(Math.pow(x, 2) + Math.pow(z, 2));
    let yzDistance = Math.sqrt(Math.pow(y, 2) + Math.pow(z, 2));

    let now = Date.now();

    let RAD_ROT_VELOCITY = ROT_VELOCITY / 180 * Math.PI;

    let eyeUp = this.keyboardListener.last['I'];

    if (eyeUp) {
      let sign = (this.rotation[0] > Math.PI / 2 && this.rotation[0] < Math.PI * 3 / 2) ? -1 : 1;
      let angle = (now - eyeUp) / 1000 * RAD_ROT_VELOCITY;

      let sinAngle = Math.sin(angle), cosAngle = Math.cos(angle);

      console.log(0, CameraPara.at);
      CameraPara.at[0] = (cosAngle - sign * y / xzDistance * sinAngle) * x + CameraPara.eye[0];
      CameraPara.at[2] = (cosAngle - sign * y * sinAngle / xzDistance) * z + CameraPara.eye[2];
      CameraPara.at[1] = (xzDistance * sign * sinAngle + y * cosAngle) + CameraPara.eye[1];

      CameraPara.up[1] = Math.cos(this.rotation[0]);
      CameraPara.up[2] = Math.sin(this.rotation[0]);
      console.log(1, CameraPara.at);
      this.keyboardListener.last['I'] = now;

      this.rotation[0] = ((this.rotation[0] + angle)) % (Math.PI * 2);
      console.log(this.rotation[0] * 180 / Math.PI);
    }

    let eyeDown = this.keyboardListener.last['K'];

    if (eyeDown) {
      let sign = (this.rotation[0] > Math.PI / 2 && this.rotation[0] < Math.PI * 3 / 2) ? -1 : 1;
      let angle = -(now - eyeDown) / 1000 * RAD_ROT_VELOCITY;

      let sinAngle = Math.sin(angle), cosAngle = Math.cos(angle);

      console.log(0, CameraPara.at);
      CameraPara.at[0] = (cosAngle - sign * y / xzDistance * sinAngle) * x + CameraPara.eye[0];
      CameraPara.at[2] = (cosAngle - sign * y * sinAngle / xzDistance) * z + CameraPara.eye[2];
      CameraPara.at[1] = (xzDistance * sign * sinAngle + y * cosAngle) + CameraPara.eye[1];

      CameraPara.up[1] = Math.cos(this.rotation[0]);
      CameraPara.up[2] = Math.sin(this.rotation[0]);
      console.log(1, CameraPara.at);
      this.keyboardListener.last['K'] = now;

      this.rotation[0] = ((this.rotation[0] + angle) + Math.PI * 2) % (Math.PI * 2);
      console.log(angle, this.rotation[0] * 180 / Math.PI);
    }
    let eyeLeft = this.keyboardListener.last['J'];

    if (eyeLeft) {
      let sign = (this.rotation[1] > Math.PI / 2 && this.rotation[1] < Math.PI * 3 / 2) ? -1 : 1;
      let angle = -(now - eyeLeft) / 1000 * RAD_ROT_VELOCITY;

      let sinAngle = Math.sin(angle), cosAngle = Math.cos(angle);

      console.log(0, CameraPara.at);
      CameraPara.at[1] = (cosAngle - sign * x / yzDistance * sinAngle) * y + CameraPara.eye[1];
      CameraPara.at[2] = (cosAngle - sign * x * sinAngle / yzDistance) * z + CameraPara.eye[2];
      CameraPara.at[0] = (yzDistance * sign * sinAngle + x * cosAngle) + CameraPara.eye[0];

      //CameraPara.up[0] = Math.cos(this.rotation[0]);
      //CameraPara.up[1] = Math.sin(this.rotation[1]);
      console.log(1, CameraPara.at);
      this.keyboardListener.last['J'] = now;

      this.rotation[1] = ((this.rotation[1] + angle) + Math.PI * 2) % (Math.PI * 2);
      console.log(angle, this.rotation[1] * 180 / Math.PI);
    }

    let eyeRight = this.keyboardListener.last['L'];


    if (eyeRight) {
      let sign = (this.rotation[1] > Math.PI / 2 && this.rotation[1] < Math.PI * 3 / 2) ? -1 : 1;
      let angle = (now - eyeRight) / 1000 * RAD_ROT_VELOCITY;

      let sinAngle = Math.sin(angle), cosAngle = Math.cos(angle);

      console.log(0, CameraPara.at);
      CameraPara.at[1] = (cosAngle - sign * x / yzDistance * sinAngle) * y + CameraPara.eye[1];
      CameraPara.at[2] = (cosAngle - sign * x * sinAngle / yzDistance) * z + CameraPara.eye[2];
      CameraPara.at[0] = (yzDistance * sign * sinAngle + x * cosAngle) + CameraPara.eye[0];

      //CameraPara.up[1] = Math.cos(this.rotation[1]);
      //CameraPara.up[2] = Math.sin(this.rotation[1]);
      console.log(1, CameraPara.at);
      this.keyboardListener.last['L'] = now;

      this.rotation[1] = ((this.rotation[1] + angle)) % (Math.PI * 2);
      console.log(this.rotation[1] * 180 / Math.PI);
    }


  }
}