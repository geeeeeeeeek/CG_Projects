"use strict";

window.onload = () => {
  let canvas = document.getElementById('webgl');
  new Worker(document, canvas).init(config);
};

class Worker {
  constructor(document, canvas) {
    this.document = document;
    this.canvas = canvas;
  }

  init(config) {
    // load configs
    this.vertex_pos = config.vertex_pos;
    this.vertex_color = config.vertex_color;
    this.polygons = config.polygons;
    this.VERTEX_TOLERANCE = config.VERTEX_TOLERANCE;
    this.canvasSize = config.canvasSize;
    //console.log(this.canvasSize);

    this.canvas.width = config.canvasSize.maxX;
    this.canvas.height = config.canvasSize.maxY;

    // load interaction flags
    this.movingVertex = undefined;

    this.showEdit = true;
    this.showBorder = true;
    this.showAnimation = false;

    this.g_current = 0;
    this.g_last = 0;
    this.g_duration = 0;

    // load webgl context
    this.gl = getWebGLContext(this.canvas);
    this.gl.clearColor(0, 0, 0, 1);

    this.triangleShader = new TriangleShader(this.gl);
    this.lineShader = new LineShader(this.gl);

    this._initInteractions();
    this._initConfigs();

    this.drawFrame(0);

  }

  _initConfigs() {
    // Normalise coordination
    for (let index in this.vertex_pos) {
      this.vertex_pos[index] = this._convertToWebGL(this.vertex_pos[index]);
    }

    // Normalise color
    for (let vertex of this.vertex_color) {
      for (let index in vertex) {
        vertex[index] /= 256;
      }
    }
  }

  _initInteractions() {
    this.canvas.addEventListener('mousedown', (event) => {
      let pos = [event.offsetX, event.offsetY];

      let originalPos = this._convertToOriginalPosition(pos);

      for (let i in this.vertex_pos) {
        let distance = Worker._getDistance(originalPos, this._convertToCanvas(this.vertex_pos[i]));
        if (distance <= this.VERTEX_TOLERANCE) {
          this.movingVertex = i;
          return;
        }
      }
    });

    this.canvas.addEventListener('mouseup', (event) => {
      if (this.showEdit) this.movingVertex = undefined;
    });

    this.canvas.addEventListener('mouseleave', (event) => {
      if (this.showEdit) this.movingVertex = undefined;
    });

    this.canvas.addEventListener('mousemove', (event) => {
      if (this.movingVertex == undefined || this.showEdit == false) return;

      let pos = [event.offsetX, event.offsetY];
      this.vertex_pos[this.movingVertex] = this._convertToWebGL(this._convertToOriginalPosition(pos));
      this.drawFrame(this.g_current);
    });

    this.document.addEventListener('keydown', (event) => {
      switch (event.keyCode) {
        case 66:
          // B to switch border
          this._switchBorder();
          return;
        case 69:
          // E to reset
          this._switchEdit();
          return;
        case 84:
          // T to transform
          this._switchAnimation();
          return;
      }
    });

  }

  _switchAnimation() {
    this.showAnimation = !this.showAnimation;
    this.showEdit = !this.showAnimation;
    if (this.showAnimation) {
      this.g_last = Date.now();
    } else {
      this.g_duration += Date.now() - this.g_last;
    }

    let tick = () => {
      if (this.showAnimation) {
        this.g_current = this.g_duration + Date.now() - this.g_last;
        this.drawFrame(this.g_current);
        requestAnimationFrame(tick, this.canvas);
      }
    };
    tick();
  }

  _switchEdit() {
    this.showEdit = true;
    this.showAnimation = false;
    this.g_last = this.g_duration = this.g_current = 0;
    this.drawFrame(this.g_current);
  }

  _switchBorder() {
    this.showBorder = !this.showBorder;
    this.drawFrame(this.g_current);
  }

  _convertToOriginalPosition(pos) {
    pos = this._convertToWebGL(pos);
    //console.log(pos);
    let angle = (this.g_current / 1000 * 45) * Math.PI / 180;
    let scale = 1 / (Math.abs(4 - ((this.g_current / 1000) % 8)) * 0.2 + 0.2);
    let cosAngle = Math.cos(angle), sinAngle = Math.sin(angle);
    let newPos = [(pos[0] * cosAngle + pos[1] * sinAngle) * scale, (pos[0] * (-sinAngle) + pos[1] * cosAngle) * scale];
    //console.log(this._convertToCanvas(newPos));
    return this._convertToCanvas(newPos);
  }

  _convertToCanvas(pos) {
    return [(pos[0] + 1) * this.canvasSize.maxX / 2, -(pos[1] - 1) * this.canvasSize.maxY / 2];
  }

  _convertToWebGL(pos) {
    return [pos[0] * 2 / this.canvasSize.maxX - 1, -pos[1] * 2 / this.canvasSize.maxY + 1];
  }

  static _getDistance(p1, p2) {
    return Math.sqrt(Math.pow((p1[0] - p2[0]), 2) + Math.pow((p1[1] - p2[1]), 2));
  }

  drawFrame(duration) {
    let angle = duration / 1000 * 45;
    let scale = Math.abs(4 - ((duration / 1000) % 8)) * 0.2 + 0.2;

    let vertices = [];
    this.triangleShader.prepare();
    for (let polygon of this.polygons) {
      vertices = vertices.concat(this._getTriangleShaderInput(polygon, scale));
    }
    this.triangleShader.render(vertices, angle);

    if (!this.showBorder) return;

    vertices = [];
    this.lineShader.prepare();
    for (let polygon of this.polygons) {
      vertices = vertices.concat(this._getLineShaderInput(polygon, scale));
    }
    this.lineShader.render(vertices, angle);
  }

  _getTriangleShaderInput(polygon, scale) {
    // Order to concat the vertices
    let order = [0, 1, 2, 2, 3, 0];
    let result = [];
    for (let index of order) {
      result = result.concat(this.vertex_pos[polygon[index]].map((x) => x * scale))
        .concat(this.vertex_color[polygon[index]]);
    }
    return result;
  }

  _getLineShaderInput(polygon, scale) {
    // Order to concat the vertices
    let order = [0, 1, 1, 2, 2, 0, 0, 3, 3, 2];
    let result = [];
    for (let index of order) {
      result = result.concat(this.vertex_pos[polygon[index]].map((x) => x * scale));
    }
    return result;
  }

}
