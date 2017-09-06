import {observe} from './observer.js';
import {Watcher} from './watcher.js';
import {Compile} from './compile.js';

class MVVM {
  constructor(options = {}) {
    this.$options = options;
    const data = this._data = this.$options.data;
    //数据代理
    //实现 vm.xxx -> vm._data.xxx
    Object.keys(data).forEach(key => {
      this._proxyData(key);
    })

    observe(data, this);

    this.$compile = new Compile(options.el, this)

  }

  $watch(key, cb, options) {
    new Watcher(this, key, cb);
  }

  _proxyData(key, setter, getter) {
    setter = setter ||
      Object.defineProperty(this, key, {
        configurable: false,
        enumerable: true,
        get() {
          return this._data[key]
        },
        set(newVal) {
          this._data[key] = newVal;
        }
      })
  }

}

export {
  MVVM
};