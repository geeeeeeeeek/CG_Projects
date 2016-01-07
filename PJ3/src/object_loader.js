/**
 * Created by Zhongyi on 12/24/15.
 */

"use strict";
class ObjectLoader {
  constructor(entity, config) {
    this.gl = config.gl;
    this.entity = entity;
  }

  init() {

    this.initShaders();

    this.initPerspective();

    this.g_objDoc = null;      // The information of OBJ file
    this.g_drawingInfo = null; // The information for drawing 3D model


    // Prepare empty buffer objects for vertex coordinates, colors, and normals
    this.initBuffers();
    if (!this.buffers) {
      console.log('Failed to set the vertex information');
      return;
    }

    // Start reading the OBJ file
    this.readOBJFile(`${this.entity.objFilePath}`, this.buffers, 1, true);

  }

  initShaders() {
    // Vertex shader program
    let VSHADER_SOURCE = `
        attribute vec4 a_Position;
        attribute vec4 a_Color;
        uniform mat4 u_MvpMatrix;
        varying vec4 v_Color;
        void main() {
          gl_Position = u_MvpMatrix * a_Position;
          v_Color = vec4(a_Color.rgb, a_Color.a);
        }`;

    // Fragment shader program
    let FSHADER_SOURCE = `
        #ifdef GL_ES
        precision mediump float;
        #endif
        varying vec4 v_Color;
        void main() {
          gl_FragColor = vec4(${this.entity.color[0]},${this.entity.color[1]},${this.entity.color[2]},1.0);
        }`;

    // Initialize shaders
    this.program = createProgram(this.gl, VSHADER_SOURCE, FSHADER_SOURCE);
    if (!this.program) {
      console.log('Failed to create program');
      return;
    }

    this.gl.enable(this.gl.DEPTH_TEST);

    // Get the storage locations of attribute and uniform variables
    this.a_Position = this.gl.getAttribLocation(this.program, 'a_Position');
    this.a_Color = this.gl.getAttribLocation(this.program, 'a_Color');
    this.u_MvpMatrix = this.gl.getUniformLocation(this.program, 'u_MvpMatrix');

    this.gl.useProgram(this.program);
    this.gl.program = this.program;
  }

  initPerspective() {
    this.g_modelMatrix = new Matrix4();
    for (let t of this.entity.transform) {
      this.g_modelMatrix[t.type].apply(this.g_modelMatrix, t.content);
    }
  }

  initBuffers() {
    // Create a buffer object, assign it to attribute variables, and enable the assignment
    this.buffers = {
      vertexBuffer: this.gl.createBuffer(),
      normalBuffer: this.gl.createBuffer(),
      colorBuffer: this.gl.createBuffer(),
      indexBuffer: this.gl.createBuffer()
    };
  }

  readOBJFile(fileName, model, scale, reverse) {
    let request = new XMLHttpRequest();

    request.onreadystatechange = () => {
      if (request.readyState === 4 && request.status == 200) {
        this._onReadOBJFile(request.responseText, fileName, model, scale, reverse);
      }
    };
    request.open('GET', fileName, true);
    request.send();
  }


  _onReadOBJFile(fileString, fileName, o, scale, reverse) {
    let objDoc = new OBJDoc(fileName);  // Create a OBJDoc object
    let result = objDoc.parse(fileString, scale, reverse); // Parse the file
    if (!result) {
      this.g_objDoc = null;
      this.g_drawingInfo = null;
      console.log("OBJ file parsing error.");
      return;
    }
    this.g_objDoc = objDoc;
  }

  render() {
    this.gl.useProgram(this.program);
    this.gl.program = this.program;

    if (this.g_objDoc != null && this.g_objDoc.isMTLComplete()) {
      this.onReadComplete();
    }
    if (!this.g_drawingInfo) return;

    let g_mvpMatrix = Camera.getMatrix();
    g_mvpMatrix.concat(this.g_modelMatrix);

    this.gl.uniformMatrix4fv(this.u_MvpMatrix, false, g_mvpMatrix.elements);
    // Draw
    this.gl.drawElements(this.gl.TRIANGLES, this.g_drawingInfo.indices.length, this.gl.UNSIGNED_SHORT, 0);
  }

  onReadComplete() {
    // Acquire the vertex coordinates and colors from OBJ file
    this.g_drawingInfo = this.g_objDoc.getDrawingInfo();

    // Write date into the buffer object
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffers.vertexBuffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, this.g_drawingInfo.vertices, this.gl.STATIC_DRAW);

    this.gl.vertexAttribPointer(this.a_Position, 3, this.gl.FLOAT, false, 0, 0);
    this.gl.enableVertexAttribArray(this.a_Position);

    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffers.colorBuffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, this.g_drawingInfo.colors, this.gl.STATIC_DRAW);

    this.gl.vertexAttribPointer(this.a_Color, 4, this.gl.FLOAT, false, 0, 0);
    this.gl.enableVertexAttribArray(this.a_Color);

    // Write the indices to the buffer object
    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.buffers.indexBuffer);
    this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, this.g_drawingInfo.indices, this.gl.STATIC_DRAW);

  }
}