"use strict";

class LineShader{
  constructor(gl){
    this.gl = gl;

    // Vertex shader program
    let VSHADER_SOURCE =`
      attribute vec4 a_Position;
      uniform mat4 u_ModelMatrix;
      void main() {
        gl_Position = u_ModelMatrix * a_Position;
      }`;

    // Fragment shader program
    let FSHADER_SOURCE =`
      void main() {
        gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
      }`;

    // Create program
    this.program = createProgram(this.gl, VSHADER_SOURCE, FSHADER_SOURCE);
    if (!this.program) {
      console.log('Failed to create program');
      return false;
    }

    // Create a buffer object
    this.vertexBuffer = this.gl.createBuffer();
    if (!this.vertexBuffer) {
      console.log('Failed to create the buffer object');
      return -1;
    }
  }


  prepare() {
    this.gl.useProgram(this.program);
    this.gl.program = this.program;

    // Bind the buffer object to target
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);

    let a_Position = this.gl.getAttribLocation(this.gl.program, 'a_Position');
    if (a_Position < 0) {
      console.log('Failed to get the storage location of a_Position');
      return -1;
    }
    // Assign the buffer object to a_Position letiable
    this.gl.vertexAttribPointer(a_Position, 2, this.gl.FLOAT, false, 0, 0);
    // Enable the assignment to a_Position letiable
    this.gl.enableVertexAttribArray(a_Position);
  }

  render(vertices, angle) {
    // Write the positions of vertices to a vertex shader
    vertices = new Float32Array(vertices);

    this.gl.bufferData(this.gl.ARRAY_BUFFER, vertices, this.gl.DYNAMIC_DRAW);

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
    this.gl.drawArrays(this.gl.LINES, 0, vertices.length / 2);
  }

}
