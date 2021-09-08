import Vue from 'vue'
import piechart from "./piechart.vue"

piechart.install = function (Vue){
	Vue.component(piechart.name,piechart)
};
export default piechart