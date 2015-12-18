'use strict';

/**************************
 *  Drawing functions.
 **************************/

//该函数在一个canvas上绘制一个点
//其中ctx是从canvas中获得的一个2d上下文context
//    x,y分别是该点的横纵坐标
//    color是表示颜色的整形数组，形如[r,g,b]
//    color在这里会本转化为表示颜色的字符串，其内容也可以是：
//        直接用颜色名称:   'red' 'green' 'blue'
//        十六进制颜色值:   '#EEEEFF'
//        rgb分量表示形式:  'rgb(0-255,0-255,0-255)'
//        rgba分量表示形式:  'rgba(0-255,1-255,1-255,透明度)'
//由于canvas本身没有绘制单个point的接口，所以我们通过绘制一条短路径替代
let drawPoint = (ctx,x,y, color) => {
//建立一条新的路径
ctx.beginPath();
    //设置画笔的颜色
    ctx.strokeStyle ='rgb('+color[0] + ',' +
                           +color[1] + ',' +
                           +color[2] + ')' ;
//设置路径起始位置
    ctx.moveTo(x,y);
//在路径中添加一个节点
    ctx.lineTo(x+1,y+1);
//用画笔颜色绘制路径
    ctx.stroke();
}

//绘制线段的函数绘制一条从(x1,y1)到(x2,y2)的线段，ctx和color两个参数意义与绘制点的函数相同，
let drawLine = (ctx,x1,y1,x2,y2,color) => {
    ctx.beginPath();
    ctx.strokeStyle ='rgba('+color[0] + ',' +
                           +color[1] + ',' +
                           +color[2] + ',' +
                           +255 + ')' ;
    //这里线宽取1会有色差，但是类似半透明的效果有利于debug，取2效果较好
    ctx.lineWidth =1;
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
}

let getVerticesFromIndexes = (indexes) => {
  var points = [];
  for (let i of indexes) {
    points.push(vertex_pos[i]);
  }
  return points;
}


let drawRec = (ctx, points, color) => {
  fillRec(ctx, points, color);
}

let drawCircle = (cxt, x, y, r) => {
    cxt.beginPath();
    cxt.strokeStyle = 'black';
    cxt.arc(x, y, r, 0, Math.PI * 2, true);
    cxt.fillStyle = 'red';
    cxt.fill();
    cxt.stroke();
}

/**************************
 *  Filling functions.
 **************************/
let calcLines = (points) => {
  let lines = [];
  for (let i = 0;i < VERTICES; i++ ) {
    /* j: the next adjacent vertex of i
     * k & b: y = kx + b
     */
    let j = (i + 1) % VERTICES;
    let k = (points[j][1] - points[i][1])
          / (points[j][0] - points[i][0]);
    let b = points[i][1] - k * points[i][0];

    let lineObj = {
      'k': k,
      'b': b,
    }
    if (!isFinite(k)) {
      /* If the line is vertical. */
      lineObj.b = points[i][0];
      lineObj.min = Math.min(points[j][1], points[i][1]);
      lineObj.max = Math.max(points[j][1], points[i][1]);
    }

    lines.push(lineObj);

    // console.log('y = ' + k + 'x + ' + b);
  }
  return lines;
}

let getTopBottom = (points) => {
  let top = 0, bottom = canvasSize['maxY'];
  for (let point of points){
    top = Math.max(point[1], top);
    bottom = Math.min(point[1], bottom);
  }
  // console.log(top, bottom);
  return [top, bottom];
}

let lastIntersectionCounts = undefined;

let getIntersections = (y, edges, points) => {
  let lines = edges.slice(0);
  let intersections = [];

  /* Handle intersections when verteices meet the scanning line.
   * skipPoints are vertices in the scanning line.
   */
  let skipPoints = [];
  for (let i = 0; i < points.length; i++) {
    if (points[i][1] == y) {
      skipPoints.push(points[i][0]);
      intersections.push(points[i][0]);
      lines[(i + VERTICES - 1) % VERTICES] = undefined;
      lines[i] = undefined;
    }
  }

  /* Iterate over all lines and find out all intersections. */
  for (let i = 0; i < lines.length; i++){
    if (lines[i] == undefined) continue;

    let line = lines[i];

    if (!isFinite(line.k)) {
      /* If the line is vertical. */
      if (y >= line.min && y <= line.max) {
        intersections.push(line.b);
      }
      continue;
    }

    if ((line.k == 0) && (line.b != y)) {
      /* horizontal line without intersections. */
      continue;
    }
    let x = (y - line.b) / line.k;
    if (x >= Math.min(points[i][0], points[(i + 1) % VERTICES][0])
    && Math.max(points[i][0], points[(i + 1) % VERTICES][0]) >= x) {
      intersections.push(x);
    }
  }

  if (skipPoints.length && lastIntersectionCounts != intersections.length) {
    for (let point of skipPoints){
      intersections.push(point);
    }
  }

  // console.log(intersections, y);
  lastIntersectionCounts = intersections.length;
  return intersections.sort((a, b) => {return a - b});
}

let fillRec = (ctx, points, color) => {
  let lines = calcLines(points);
  let boundary = getTopBottom(points);
  lastIntersectionCounts = undefined;
  for (let y = boundary[1]; y < boundary[0]; y++) {
    /* Draw horizontal line */
    let intersections = getIntersections(y, lines, points);
    for (let i = 0; i < intersections.length - 1; i += 2) {
      // console.log(intersections, y);
      drawLine(ctx, intersections[i], y, intersections[i + 1], y, color);
    }
  }
}


/**************************
 *  Interaction functions.
 **************************/
let c = document.getElementById('myCanvas');
let ctx = c.getContext('2d');
ctx.width = c.width = canvasSize['maxX'];
ctx.height = c.height = canvasSize['maxY'];

/*将canvas坐标整体偏移0.5，用于解决宽度为1个像素的线段的绘制问题*/
ctx.translate(0.5, 0.5);

function getDistance(p1, p2){
  return Math.sqrt(Math.pow((p1[0] - p2[0]), 2) + Math.pow((p1[1] - p2[1]), 2));
}

let movingVertex = undefined;

c.addEventListener('mousedown', (event) => {
  let pos = [event.offsetX, event.offsetY];
  for (let i = 0; i < vertex_pos.length; i++) {
    if (getDistance(pos, vertex_pos[i]) <= VERTEX_TOLERANCE) {
      movingVertex = i;
      return;
    }
  }
});

c.addEventListener('mouseup', (event) => {
  movingVertex = undefined;
});

c.addEventListener('mouseleave', (event) => {
  movingVertex = undefined;
});

c.addEventListener('mousemove', (event) => {
  if (movingVertex == undefined) return;
  vertex_pos[movingVertex] = [event.offsetX, event.offsetY, 0];
  init();
});

/**************************
 *  Top-level functions.
 **************************/

let init = () => {
  ctx.clearRect(0, 0, canvasSize['maxX'], canvasSize['maxY']);
  let rerender = render(polygon);
  render(rerender);
};

let render = (polygon) => {
  let rerender = [];
  // polygon = [polygon[3]];
  for (let poly of polygon) {
    let vertices = getVerticesFromIndexes(poly);
    // console.log(points);
    for (let index of poly) {
      if (index == movingVertex) {
        rerender.push(poly);
        break;
      }
    }

    drawRec(ctx, vertices, vertex_color[poly[0]]);
    for (let vertex of vertices) {
      drawCircle(ctx, vertex[0], vertex[1], VERTEX_TOLERANCE);
    }
  }
  return rerender;
}

init();
