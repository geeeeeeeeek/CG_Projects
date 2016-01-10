/**
 * Created by Zhongyi on 12/20/15.
 */
"use strict";

class KeyboardController {
  constructor() {
    this.last = 0;
    this.keyMap = new Map();

    document.addEventListener('keydown', (event)=> {
      let key = String.fromCharCode(event.which);
      if (!this.keyMap.get(key)) return;
      this.keyMap.get(key).on();
    });
    document.addEventListener('keyup', (event)=> {
      let key = String.fromCharCode(event.which);
      if (!this.keyMap.get(key)) return;
      this.keyMap.get(key).off();
    })

  }

  bind(key, callback) {
    this.keyMap.set(key, callback);
    return this;
  }
}