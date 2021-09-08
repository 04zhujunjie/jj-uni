import Vue from 'vue'
import piechart from "./piechart/index.js"

// 组件集合，用于遍历
const components = [piechart];

// console.log({ components });

// 定义 install 方法
const install = function(Vue) {
  if (install.installed) return;
  // 遍历注册全局组件
  components.map((component) => Vue.component(component.name, component));
};

// 判断是否是直接引入文件
if (typeof window !== "undefined" && window.Vue) {
  install(window.Vue);
}

export {
  // install,
  piechart, 
};

export default {
  // install, 
  piechart, 
};
