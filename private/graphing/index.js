import {boxplot, lineplot} from "/private/graphing/module.graphing.graphs.js";

let canvas = null;
let ctx = null;

const canvasTypes = {

}

function onGraphingLoad() {
    lineplot([9,9,9])
    //boxplot()
}

function graphLinePlot() {
    //lineplot([1,2,3,4,5,5,6,7,8,8,9,10,10,10,10,10,11]);
}

function graphBoxPlot() {

}

window.graphLinePlot = graphLinePlot;
window.graphBoxPlot = graphBoxPlot;
window.onGraphingLoad = onGraphingLoad;