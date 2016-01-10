/**
 * Created by Zhongyi on 12/18/15.
 */
"use strict";

class TextureLoader {

  constructor(entity, config) {
    this.entity = entity;
    this.gl = config.gl;
    this.enableLight = config.enableLight;
    this.activeTextureIndex = config.activeTextureIndex;
  }

  init() {
    this.initShaders();

    this.initTextures();

    this.initBuffers();

    this.initPerspective();

    return this;
  }

  initShaders() {
    // Vertex shader program
    let VSHADER_SOURCE = `
            attribute vec4 a_Position;
            attribute vec4 a_Normal;
            uniform mat4 u_MvpMatrix;
            uniform mat4 u_ModelMatrix;
            uniform mat4 u_NormalMatrix;
            attribute vec2 a_TexCoord;
            varying vec2 v_TexCoord;
            varying vec4 v_Color;
            uniform vec3 u_PointLightColor;
            uniform vec3 u_PointLightPosition;

            void main() {
              gl_Position = u_MvpMatrix * a_Position;
              v_TexCoord = a_TexCoord;

              vec4 normal1 = u_NormalMatrix * a_Normal;
              vec3 normal = normalize(normal1.xyz);

              vec4 vertexPosition = u_ModelMatrix * a_Position;
              vec3 pointLightDirection = normalize(u_PointLightPosition - vec3(vertexPosition));
              float pointLightnDotL = max(dot(pointLightDirection, normal), 0.0);
              vec3 pointLightDiffuse = u_PointLightColor * pointLightnDotL * 0.4;

              v_Color = vec4(pointLightDiffuse, 1.0);
            }`;

    // Fragment shader program
    let FSHADER_SOURCE = `
            #ifdef GL_ES
            precision mediump float;
            #endif
            uniform sampler2D u_Sampler;
            varying vec2 v_TexCoord;
            varying vec4 v_Color;
            void main() {
              gl_FragColor = texture2D(u_Sampler, v_TexCoord) + v_Color;
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

  initPerspective() {
    this.gl.enable(this.gl.DEPTH_TEST);
    // Get the storage location of u_MvpMatrix
    this.u_MvpMatrix = this.gl.getUniformLocation(this.gl.program, 'u_MvpMatrix');
    if (!this.u_MvpMatrix) {
      console.log('Failed to get the storage location of u_MvpMatrix');
    }


    this.g_normalMatrix = new Matrix4();
    // Assign the buffer object to a_Position and enable the assignment
    this.a_Position = this.gl.getAttribLocation(this.gl.program, 'a_Position');
    // Assign the buffer object to a_TexCoord variable and enable the assignment of the buffer object
    this.a_TexCoord = this.gl.getAttribLocation(this.gl.program, 'a_TexCoord');

    this.a_Normal = this.gl.getAttribLocation(this.program, 'a_Normal');
    this.u_MvpMatrix = this.gl.getUniformLocation(this.program, 'u_MvpMatrix');
    this.u_NormalMatrix = this.gl.getUniformLocation(this.program, 'u_NormalMatrix');
    this.u_ModelMatrix = this.gl.getUniformLocation(this.program, 'u_ModelMatrix');
    this.g_modelMatrix = new Matrix4();
    this.g_modelMatrix.translate(this.entity.translate[0], this.entity.translate[1], this.entity.translate[2]);
    this.g_modelMatrix.scale(this.entity.scale[0], this.entity.scale[1], this.entity.scale[2]);

  }

  initBuffers() {
    // Write the vertex coordinates to the buffer object
    this.vertexBuffer = this.gl.createBuffer();

    // Write the vertex texture coordinates to the buffer object
    this.vertexTexCoordBuffer = this.gl.createBuffer();

    // Write the indices to the buffer object
    this.vertexIndexBuffer = this.gl.createBuffer();
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

    this.gl.vertexAttribPointer(this.a_Position, 3, this.gl.FLOAT, false, 0, 0);
    this.gl.enableVertexAttribArray(this.a_Position);


    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexTexCoordBuffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(this.entity.texCoord), this.gl.STATIC_DRAW);

    this.gl.vertexAttribPointer(this.a_TexCoord, 2, this.gl.FLOAT, false, 0, 0);
    this.gl.enableVertexAttribArray(this.a_TexCoord);

    this.gl.activeTexture(this.gl[`TEXTURE${this.activeTextureIndex}`]);


    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.vertexIndexBuffer);
    this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.entity.index), this.gl.STATIC_DRAW);


    // Set the eye point and the viewing volume
    this.mvpMatrix = Camera.getMatrix();
    this.mvpMatrix.concat(this.g_modelMatrix);

    // Pass the model view projection matrix to u_MvpMatrix
    this.gl.uniformMatrix4fv(this.u_MvpMatrix, false, this.mvpMatrix.elements);

    this.g_normalMatrix.setInverseOf(this.g_modelMatrix);
    this.g_normalMatrix.transpose();
    this.gl.uniformMatrix4fv(this.u_NormalMatrix, false, this.g_normalMatrix.elements);
    this.gl.uniformMatrix4fv(this.u_ModelMatrix, false, this.g_modelMatrix.elements);

    if (this.enableLight){
      this.u_PointLightColor = this.gl.getUniformLocation(this.program, 'u_PointLightColor');
      this.u_PointLightPosition = this.gl.getUniformLocation(this.program, 'u_PointLightPosition');
    }

    if (Camera.state.flashLight) {
      this.gl.uniform3fv(this.u_PointLightColor, new Vector3(scenePointLightColor).elements);
      this.gl.uniform3fv(this.u_PointLightPosition, new Vector3(CameraPara.eye).elements);
    } else {
      this.gl.uniform3fv(this.u_PointLightColor, new Vector3([0,0,0]).elements);
      this.gl.uniform3fv(this.u_PointLightPosition, new Vector3([0,0,0]).elements);
    }

    // Draw the texture
    this.gl.drawElements(this.gl.TRIANGLE_STRIP, this.entity.index.length, this.gl.UNSIGNED_SHORT, 0);
  }
}

