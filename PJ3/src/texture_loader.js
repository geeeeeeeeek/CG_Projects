/**
 * Created by Zhongyi on 12/18/15.
 */
"use strict";

class TextureLoader {

  constructor(entity, config) {
    this.entity = entity;
    this.gl = config.gl;
    this.activeTextureIndex = config.activeTextureIndex;
    this.drawMode = config.drawMode;
    this.drawCount = config.drawCount;
  }

  init() {
    this.initShaders();

    this.initTextures();

    this.initBuffers();

    this.initPerspective();
  }

  initPerspective() {
    this.gl.enable(this.gl.DEPTH_TEST);
    // Get the storage location of u_MvpMatrix
    this.u_MvpMatrix = this.gl.getUniformLocation(this.gl.program, 'u_MvpMatrix');
    if (!this.u_MvpMatrix) {
      console.log('Failed to get the storage location of u_MvpMatrix');
    }
  }

  initShaders() {
    // Vertex shader program
    let VSHADER_SOURCE = `
            attribute vec4 a_Position;
            uniform mat4 u_MvpMatrix;
            attribute vec2 a_TexCoord;
            varying vec2 v_TexCoord;
            void main() {
              gl_Position = u_MvpMatrix * a_Position;
              v_TexCoord = a_TexCoord;
            }`;

    // Fragment shader program
    let FSHADER_SOURCE = `
            #ifdef GL_ES
            precision mediump float;
            #endif
            uniform sampler2D u_Sampler;
            varying vec2 v_TexCoord;
            void main() {
              gl_FragColor = texture2D(u_Sampler, v_TexCoord);
            }`;

    // Initialize shaders
    this.program = createProgram(this.gl, VSHADER_SOURCE, FSHADER_SOURCE);
    if (!this.program) {
      console.log('Failed to create program');
      return;
    }

    this.gl.useProgram(this.program);
    this.gl.program = this.program;
  }


  initBuffers() {
    // Write the vertex coordinates to the buffer object
    this.vertexBuffer = this.gl.createBuffer();


    // Write the vertex texture coordinates to the buffer object
    this.vertexTexCoordBuffer = this.gl.createBuffer();


    // Write the indices to the buffer object
    this.vertexIndexBuffer = this.gl.createBuffer();


    // Assign the buffer object to a_Position and enable the assignment
    this.a_Position = this.gl.getAttribLocation(this.gl.program, 'a_Position');
    if (this.a_Position < 0) {
      console.log('Failed to get the storage location of a_Position');
      return -1;
    }


    // Assign the buffer object to a_TexCoord variable and enable the assignment of the buffer object
    this.a_TexCoord = this.gl.getAttribLocation(this.gl.program, 'a_TexCoord');
    if (this.a_TexCoord < 0) {
      console.log('Failed to get the storage location of a_TexCoord');
      return -1;
    }

  }

  initTextures() {
    // Create a texture object
    this.texture = this.gl.createTexture();

    // Get the storage location of u_Sampler
    this.u_Sampler = this.gl.getUniformLocation(this.gl.program, 'u_Sampler');
    if (!this.u_Sampler) {
      console.log('Failed to get the storage location of u_Sampler');
      return;
    }

    // Load texture image
    this.textureImage = new Image();
    this.textureImage.src = `${this.entity.texImagePath}`;
    this.textureImage.onload = ()=> {
      this.handleTextureLoad();
    };
  }

  handleTextureLoad() {
    this.gl.useProgram(this.program);
    this.gl.activeTexture(this.gl[`TEXTURE${this.activeTextureIndex}`]);
    // Flip the image's y axis
    this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, 1);

    // Bind the texture object to the target
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);

    // Set the texture parameters
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
    // Set the texture image
    this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGB, this.gl.RGB, this.gl.UNSIGNED_BYTE, this.textureImage);

    // Set the texture unit 0 to the sampler
    this.gl.uniform1i(this.u_Sampler, this.activeTextureIndex);
  }

  render() {
    this.gl.useProgram(this.program);

    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(this.entity.vertex), this.gl.STATIC_DRAW);

    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexTexCoordBuffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(this.entity.texCoord), this.gl.STATIC_DRAW);

    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.vertexIndexBuffer);
    this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint8Array(this.entity.index), this.gl.STATIC_DRAW);


    this.gl.vertexAttribPointer(this.a_Position, 3, this.gl.FLOAT, false, 0, 0);
    this.gl.enableVertexAttribArray(this.a_Position);

    this.gl.vertexAttribPointer(this.a_TexCoord, 2, this.gl.FLOAT, false, 0, 0);
    this.gl.enableVertexAttribArray(this.a_TexCoord);

    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
    this.gl.vertexAttribPointer(this.a_Position, 3, this.gl.FLOAT, false, 0, 0);

    this.gl.activeTexture(this.gl[`TEXTURE${this.activeTextureIndex}`]);

    // Set the eye point and the viewing volume
    this.mvpMatrix = Camera.getMatrix();
    this.mvpMatrix.translate(this.entity.translate[0], this.entity.translate[1], this.entity.translate[2]);
    this.mvpMatrix.scale(this.entity.scale[0], this.entity.scale[1], this.entity.scale[2]);

    // Pass the model view projection matrix to u_MvpMatrix
    this.gl.uniformMatrix4fv(this.u_MvpMatrix, false, this.mvpMatrix.elements);

    // Draw the texture
    this.gl.drawArrays(this.gl[this.drawMode], 0, this.drawCount);
  }
}

