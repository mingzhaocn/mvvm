/**
 * 观察者
 */
class Observer {
  /**
   * 构造函数
   * @param data 被观察数据
   */
  constructor(data) {
    this.data = data;
    this.walk(data);
  }

  /**
   * 启动函数
   * @param data
   */
  walk(data) {
    Object.keys(data).forEach(key => {
      this.convert(key, data[key]);
    })
  }

  convert(key, val) {
    this.defineReactive(this.data, key, val);
  }

  defineReactive(data, key, val) {
    const dep = new Dep();
    let childObj = observe(val);
    Object.defineProperty(data, key, {
      enumerable: true,
      configurable: false,
      get() {
        //TODO: 不明白
        if (Dep.target) {
          dep.depend();
        }
        return val;
      },
      set(newVal) {
        if (newVal === val) {
          return;
        }
        val = newVal;
        childObj = observe(val);
        dep.notify();
      }
    })
  }
}

/**
 *
 * @param value
 * @param vm TODO:什么用？
 * @returns {*}
 */
function observe(value, vm) {
  if (!value || typeof value !== 'object') {
    return;
  }
  return new Observer(value)
}

/**
 * 订阅器
 */
class Dep {
  constructor() {
    this.id = Dep.uid++;
    /**
     * 订阅者
     * @type {Array}
     */
    this.subs = [];
  }

  addSub(sub) {
    this.subs.push(sub)
  }

  /**
   * TODO: 不明白这个作用
   */
  depend() {
    Dep.target.addDep(this)
  }

  removeSub(sub) {
    const index = this.subs.indexOf(sub);
    if (index !== -1)
      this.subs.splice(index, 1);
  }

  notify() {
    this.subs.forEach(sub => {
      sub.update();
    })
  }
}

Dep.uid = 0;
Dep.target = null;

// module.exports = Observer;
export {
  Observer,
  observe,
  Dep
};