"use strict";

class TriangleShader {
  constructor(gl) {
    this.gl = gl;

    // Vertex shader program
    let VSHADER_SOURCE = `
      attribute vec4 a_Position;
      uniform mat4 u_ModelMatrix;
      attribute vec4 a_Color;
      varying vec4 v_Color;
      void main() {
        gl_Position = u_ModelMatrix * a_Position;
        v_Color = a_Color;
      }`;

    // Fragment shader program
    let FSHADER_SOURCE = `
      precision mediump float;
      varying vec4 v_Color;
      void main() {
        gl_FragColor = v_Color;
      }`;

    // Create program
    this.program = createProgram(gl, VSHADER_SOURCE, FSHADER_SOURCE);
    if (!this.program) {
      console.log('Failed to create program');
      return false;
    }

    // Create a buffer object
    this.vertexColorBuffer = this.gl.createBuffer();
    if (!this.vertexColorBuffer) {
      console.log('Failed to create the buffer object');
      return false;
    }
  }

  prepare() {
    this.gl.useProgram(this.program);
    this.gl.program = this.program;

    // Clear <canvas>
    this.gl.clear(this.gl.COLOR_BUFFER_BIT);

    // Bind the buffer object to target
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexColorBuffer);

    let FSIZE = 4;
    //Get the storage location of a_Position, assign and enable buffer
    let a_Position = this.gl.getAttribLocation(this.gl.program, 'a_Position');
    if (a_Position < 0) {
      console.log('Failed to get the storage location of a_Position');
      return -1;
    }
    this.gl.vertexAttribPointer(a_Position, 2, this.gl.FLOAT, false, FSIZE * 5, 0);
    this.gl.enableVertexAttribArray(a_Position);  // Enable the assignment of the buffer object

    // Get the storage location of a_Position, assign buffer and enable
    let a_Color = this.gl.getAttribLocation(this.gl.program, 'a_Color');
    if (a_Color < 0) {
      console.log('Failed to get the storage location of a_Color');
      return -1;
    }
    this.gl.vertexAttribPointer(a_Color, 3, this.gl.FLOAT, false, FSIZE * 5, FSIZE * 2);
    this.gl.enableVertexAttribArray(a_Color);  // Enable the assignment of the buffer object
  }

  render(vertices, angle) {
    // Write the positions of vertices to a vertex shader
    let verticesColors = new Float32Array(vertices);

    this.gl.bufferData(this.gl.ARRAY_BUFFER, verticesColors, this.gl.DYNAMIC_DRAW);

    // Get storage location of u_ModelMatrix
    let u_ModelMatrix = this.gl.getUniformLocation(this.gl.program, 'u_ModelMatrix');
    if (!u_ModelMatrix) {
      console.log('Failed to get the storage location of u_ModelMatrix');
      return;
    }

    // Model matrix
    let modelMatrix = new Matrix4();
    modelMatrix.setRotate(angle, 0, 0, 1);
    this.gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);

    // Draw the rectangle
    this.gl.drawArrays(this.gl.TRIANGLES, 0, vertices.length / 5);
  }
}
