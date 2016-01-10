/**
 * Created by Zhongyi on 1/8/16.
 */
"use strict";

class Camera {
  static init() {
    Camera.state = {
      posUp: 0, posDown: 0, posLeft: 0, posRight: 0,
      rotUp: 0, rotDown: 0, rotLeft: 0, rotRight: 0,
      flashLight: 0
    };
    Camera.at = new Vector3(CameraPara.at);
    Camera.eye = new Vector3(CameraPara.eye);
    Camera.up = new Vector3(CameraPara.up);
    Camera.fov = CameraPara.fov;
    Camera.near = CameraPara.near;
    Camera.far = CameraPara.far;
  }

  static getMatrix() {
    return new Matrix4()
        .perspective(Camera.fov, window.ratio, Camera.near, Camera.far)
        .lookAt(Camera.eye.elements[0], Camera.eye.elements[1], Camera.eye.elements[2],
            Camera.at.elements[0], Camera.at.elements[1], Camera.at.elements[2],
            Camera.up.elements[0], Camera.up.elements[1], Camera.up.elements[2]);
  }

  static move(x, y) {
    let v = VectorMinus(Camera.eye, Camera.at).normalize();
    let w = VectorCross(v, Camera.up);
    v = VectorMultNum(v, x);
    w = VectorMultNum(w, y);
    v = VectorAdd(v, w);
    Camera.at = VectorMinus(Camera.at, v);
    Camera.eye = VectorMinus(Camera.eye, v);
  }

  static rotate(x, y) {
    let v = VectorMinus(Camera.at, Camera.eye);

    let w = VectorCross(v, Camera.up);
    Camera.at = VectorAdd(VectorMinus(Camera.at, VectorMultNum(Camera.up, -x)), VectorMultNum(w, y));
    v = VectorMinus(Camera.at, Camera.eye);
    Camera.at = VectorAdd(Camera.eye, v.normalize());

    Camera.up = VectorCross(w, v).normalize();
  }
}