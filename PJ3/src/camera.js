/**
 * Created by Zhongyi on 1/8/16.
 */
"use strict";

class Camera {
  static getMatrix() {
    let cameraMatrix = new Matrix4();
    cameraMatrix.perspective(CameraPara.fov, 1, CameraPara.near, CameraPara.far);
    cameraMatrix.lookAt(CameraPara.eye[0], CameraPara.eye[1], CameraPara.eye[2],
        CameraPara.at[0], CameraPara.at[1], CameraPara.at[2],
        CameraPara.up[0], CameraPara.up[1], CameraPara.up[2]);
    return cameraMatrix;
  }
}