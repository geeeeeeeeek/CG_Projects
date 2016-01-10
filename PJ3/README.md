# 三维场景漫游

[TOC]

> 13302010039 童仲毅

![image](https://cloud.githubusercontent.com/assets/7262715/12220069/6fa717e4-b799-11e5-9b78-c4beed0b4bd6.png)

## 运行环境

浏览器版本限制：

1. 支持HTML5 Canvas以及WebGL的浏览器。查看[浏览器兼容性](http://caniuse.com/canvas)。
2. 支持JavaScript (ECMAScript 6)的浏览器。查看[浏览器兼容性](https://kangax.github.io/compat-table/es6/)。



## 代码结构

- `SceneLoader类` 场景加载
- `TextureLoader类` 加载使用Texture的物体
- `ObjectLoader类` 从OBJ文件加载物体
- `Camera类` 控制相机旋转移动、计算CameraMatrix
- `KeyboardController类` 封装键盘事件



## 实现概述

### 1.物体的添加与渲染

`SceneLoader`中维护一个队列，将entity和config传入相应loader并添加到队列中。

``` javascript
let skyBoxLoader = new TextureLoader(skyBoxRes, {
      'gl': this.gl,
      'activeTextureIndex': 2,
      'enableLight': false
    }).init();
this.loaders.push(skyBoxLoader);
```

TextureLoader和ObjectLoader实现了相同的接口，因此在每帧调用时只需调用loader.render即可。

``` javascript
for (let loader of this.loaders) {
    loader.render(timestamp);
}
```

### 2.相机控制

`Camera`中暴露`move`, `rotate`，每帧调用时传入timestamp和偏移量。

### 3.Bird动画实现

这里实现了一个每秒水平旋转145°，竖直高度正弦变化的动画，表现为围绕gumby做类似圆周运动。

如果需要物体逐帧变化，实现`loader.nextFrame`即可，render时会调用这个函数。

### 4.键盘监听

`KeyboardController`封装了JavaScript原生的事件监听，通过bind函数绑定要监听的键与on/off时的回调函数。



## 额外工作

- 为Texture物体实现了40%的点光源效果。
- 实现了SkyBox。
- 自适应窗体大小、比例（画布增大会影响动画帧率）。
- 对逻辑较为良好的封装与抽象（Shader的抽象来不及写了…好多地方写的比较匆忙…）