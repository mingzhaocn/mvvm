import {Watcher} from './watcher.js'

class Compile {
  constructor(el, vm) {
    this.$vm = vm;
    this.$el = this.isElementNode(el) ? el : document.querySelector(el)
    if (this.$el) {
      this.$fragment = this.nodeToFragment(this.$el);
      this.init();
      this.$el.appendChild(this.$fragment)
    }
  }

  init() {
    this.compileElement(this.$fragment);
  }

  compileElement(el) {
    const childNodes = el.childNodes;
    Array.from(childNodes).forEach(node => {
      const text = node.textContent;
      const reg = /\{\{(.*)\}\}/;

      if (this.isElementNode(node)) {
        this.compile(node);
      } else if (this.isTextNode(node) && reg.test(text)) {
        this.compileText(node, RegExp.$1)
      }
      if (node.childNodes && node.childNodes.length) {
        this.compileElement(node);
      }
    })
  }

  nodeToFragment(el) {
    //TODO: why
    const fragment = document.createDocumentFragment();
    let child;
    // 将原生节点拷贝到fragment
    while (child = el.firstChild) {
      fragment.appendChild(child);
    }
    return fragment;
  }

  compile(node) {
    const nodeAttrs = node.attributes;
    Array.from(nodeAttrs).forEach(attr => {
      const attrName = attr.name;
      if (this.isDirective(attrName)) {
        const exp = attr.value;
        const dir = attrName.substring(2);
        if (this.isEventDirective(dir)) {//事件指令
          compileUtil.eventHandler(node, this.$vm, exp, dir);
        } else {//普通指令
          compileUtil[dir] && compileUtil[dir](node, this.$vm, exp);
        }
        node.removeAttribute(attrName);
      }
    })
  }

  compileText(node, exp) {
    compileUtil.text(node, this.$vm, exp);
  }

  isDirective(attr) {
    return attr.indexOf('v-') == 0;
  }

  isElementNode(node) {
    return node.nodeType === 1;
  }

  isTextNode(node) {
    return node.nodeType == 3;
  }

  isEventDirective(dir) {
    return dir.indexOf('on') === 0;
  }

}

// 指令处理集合
const compileUtil = {
  text: function (node, vm, exp) {
    this.bind(node, vm, exp, 'text');
  },

  html: function (node, vm, exp) {
    this.bind(node, vm, exp, 'html');
  },

  model: function (node, vm, exp) {
    this.bind(node, vm, exp, 'model');

    var me = this,
      val = this._getVMVal(vm, exp);
    node.addEventListener('input', function (e) {
      var newValue = e.target.value;
      if (val === newValue) {
        return;
      }

      me._setVMVal(vm, exp, newValue);
      val = newValue;
    });
  },

  class: function (node, vm, exp) {
    this.bind(node, vm, exp, 'class');
  },

  bind: function (node, vm, exp, dir) {
    var updaterFn = updater[dir + 'Updater'];

    updaterFn && updaterFn(node, this._getVMVal(vm, exp));

    new Watcher(vm, exp, function (value, oldValue) {
      updaterFn && updaterFn(node, value, oldValue);
    });
  },

  // 事件处理
  eventHandler: function (node, vm, exp, dir) {
    var eventType = dir.split(':')[1],
      fn = vm.$options.methods && vm.$options.methods[exp];

    if (eventType && fn) {
      node.addEventListener(eventType, fn.bind(vm), false);
    }
  },

  _getVMVal: function (vm, exp) {
    var val = vm;
    exp = exp.split('.');
    exp.forEach(function (k) {
      val = val[k];
    });
    return val;
  },

  _setVMVal: function (vm, exp, value) {
    var val = vm;
    exp = exp.split('.');
    exp.forEach(function (k, i) {
      // 非最后一个key，更新val的值
      if (i < exp.length - 1) {
        val = val[k];
      } else {
        val[k] = value;
      }
    });
  }
};

const updater = {
  textUpdater: function (node, value) {
    node.textContent = typeof value == 'undefined' ? '' : value;
  },

  htmlUpdater: function (node, value) {
    node.innerHTML = typeof value == 'undefined' ? '' : value;
  },

  classUpdater: function (node, value, oldValue) {
    var className = node.className;
    className = className.replace(oldValue, '').replace(/\s$/, '');

    var space = className && String(value) ? ' ' : '';

    node.className = className + space + value;
  },

  modelUpdater: function (node, value, oldValue) {
    node.value = typeof value == 'undefined' ? '' : value;
  }
};

export {
  Compile
}