// Scott Gordon
// paint.js

var controlPressed = false;
var currentFunction = "newShape";
var mouseDown = false;
var clickX = 0;
var clickY = 0;
var currentX = 0;
var currentY = 0;
var releaseX = 0;
var releaseY = 0;

var shapes = [];
var centers = [];
var colors = [];

var curves = [];
var curveCenters = [];
var curveColors = [];

var polyLines = [];
var polyLineCenters = [];
var polyLineColors = [];

var color = "#364e96";
var currShape = 0;

// var startTransfromX;
// var startTransfromY;
var transformAdjustX = 0;
var transformAdjustY = 0;
var scaleAdjust = 1;

// to hold ellipse rotation info
let ellipseMap = new Map();

// [[shapes, index, action, transform matrix]]
var actions = [];

var tempCurve = [];
var tempCurveCenter = [0, 0];
var tempPolyLine = [];
var tempPolyLineCenter = [0, 0];
var tempPolygon = [];
var tempPolygonCenter = [0, 0];

var copyShape = [];
var copyCenter = [];
var copyPolyLine = [];
var copyPolyLineCenter = [];
var copyCurve = [];
var copyCurveCenter = [];
var copyColor;

// having a single object before load fixes some bugs
// placed a line way off screen
lCenter = [-3000, -3000]
mLine = [
	[-50, 0],
	[50, 0]];
shapes.push(mLine);
centers.push(lCenter);
colors.push("#000000");

var can = document.getElementById("can");
var parent = can.parentElement;

can.width = parent.clientWidth;
can.height = 500;

var ctx = can.getContext("2d");
var cRect = can.getBoundingClientRect();
 
window.onload = function() {
	currentShape = "line";
	currentFunction = "newShape";
	
	// draw the shapes to start
	drawShapes();
}

// change the current shape when one is selected with drop down menu
var mySelect = document.getElementById('shapes');
mySelect.onchange = function() {
	var x = document.getElementById("shapes").value;
	currentShape = x;
   
	tempCurve = [];
	tempCurveCenter = [0, 0];
	tempPolyLine = [];
	tempPolyLineCenter = [0, 0];
	tempPolygon = [];
	tempPolygonCenter = [0, 0];
		
	drawShapes();
	outline(shapes[currShape], centers[currShape], currShape);
}

// change the current functin on radio button change
var radios = document.forms["functions"].elements["function"];
for(var i = 0, max = radios.length; i < max; i++) {
    radios[i].onclick = function() {
		tempCurve = [];
		tempCurveCenter = [0, 0];
		tempPolyLine = [];
		tempPolyLineCenter = [0, 0];
		tempPolygon = [];
		tempPolygonCenter = [0, 0];
		
		drawShapes();
		
		currentFunction = this.value;
		outline(shapes[currShape], centers[currShape], currShape);
    }
}
var myColor = document.getElementById('sColor');
myColor.onchange = function() {
	var x = document.getElementById("sColor").value;
	color = x;
}
var myNewButton = document.getElementById('newButton');
myNewButton.onclick = function(){
	clearEverything();
};
function clearEverything(){
	shapes = [mLine];
	centers = [lCenter];
	colors = ["#000000"];

	curves = [];
	curveCenters = [];
	curveColors = [];

	polyLines = [];
	polyLineCenters = [];
	polyLineColors = [];

	tempCurve = [];
	tempCurveCenter = [0, 0];
	tempPolyLine = [];
	tempPolyLineCenter = [0, 0];
	tempPolygon = [];
	tempPolygonCenter = [0, 0];

	currShape = 0;
	
	var actions = [];
	drawShapes();
}
var myLoadButton = document.getElementById('loadButton');
myLoadButton.onclick = function(){
	let element = document.createElement("div");
	element.innerHTML = '<input type="file">';
	var fileInput = element.firstChild;

	fileInput.addEventListener("change", function () {
		var file = fileInput.files[0];

		if (file.name.match(/\.(txt|json)$/)) {
			var reader = new FileReader();

			reader.onload = function () {
			let jsonObj = JSON.parse(reader.result);
			clearEverything();

			shapes = jsonObj.shapes;
			centers = jsonObj.centers;
			colors = jsonObj.colors;

			curves = jsonObj.curves;
			curveCenters = jsonObj.curveCenters;
			curveColors = jsonObj.curveColors;

			polyLines = jsonObj.polyLines;
			polyLineCenters = jsonObj.polyLineCenters;
			polyLineColors = jsonObj.polyLineColors;

			color = jsonObj.color;
			currShape = jsonObj.currShape;
			
			// work needs to be done to convert to map
			ellipseMap.clear();
			ellipseMapObj = jsonObj.ellipseMap;
			ellipseMap = new Map(Object.entries(ellipseMapObj));
			let tempArray = [];
			for( [key, value] of ellipseMap.entries()){
				keyI = parseInt(key);
				tempArray.push([keyI, value]);
			}
			ellipseMap.clear();
			for(var i = 0; i < tempArray.length; i++){
				ellipseMap[tempArray[i][0]] = tempArray[i][1];
			}
			
			actions = jsonObj.actions;
			
			drawShapes();
			};

			reader.readAsText(file);
		} else {
			alert("File not supported --- .json files only");
		}
	});
	fileInput.click();
}
var mySaveButton = document.getElementById('saveButton');
mySaveButton.onclick = function(){
	var jsonObj = {
		  "shapes"  		: shapes,
		  "centers" 		: centers,
		  "colors"			: colors,
		  "curves"			: curves,
		  "curveCenters"	: curveCenters,
		  "curveColors"		: curveColors,
		  "polyLines"		: polyLines,
		  "polyLineCenters"	: polyLineCenters,
		  "polyLineColors"	: polyLineColors,
		  "color"			: color,
		  "currShape"		: currShape,
		  "ellipseMap"		: ellipseMap,
		  "actions"			: actions
	}
	jsonStr = JSON.stringify(jsonObj);
	download("artwork.json", jsonStr);
}
function download(filename, text) {
  let element = document.createElement("a");
  element.setAttribute(
    "href",
    "data:text/plain;charset=utf-8," + encodeURIComponent(text)
  );
  element.setAttribute("download", filename);
  element.style.display = "none";
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}

var mySaveAsImageButton = document.getElementById('saveAsImageButton');
mySaveAsImageButton.onclick = function(){
	// redirect to copy function so I can use ctrl s too
	saveAsImage();
};
function saveAsImage() {
	clearOutline();
	let link = document.createElement("a");
	link.download = "image.jpeg";
	link.href = can.toDataURL();
	link.click();
	link.delete;
}
var myCopyButton = document.getElementById('copyButton');
myCopyButton.onclick = function(){
	// redirect to copy function so I can use ctrl c too
	copy();
};
function copy(){
	if(shapes.length > 1){
		copyShape = shapes[currShape];
		copyCenter = centers[currShape];
		copyColor = colors[currShape];
		
		if(shapes[currShape].length == 1){
			if(shapes[currShape][0][0] == 0 && shapes[currShape][0][1] == 0){
				// polyline
				copyPolyLine = polyLines[centers[currShape][1]];
				copyPolyLineCenter  = polyLineCenters[centers[currShape][1]];
			} else if(shapes[currShape][0][0] == 0 && shapes[currShape][0][1] == 1){
				// curve
				copyCurve = curves[centers[currShape][1]];
				copyCurveCenter = curveCenters[centers[currShape][1]];
			}
		}
	}
	console.log("copy complete");
	return;
}
var myPasteButton = document.getElementById('pasteButton');
myPasteButton.onclick = function(){
	// redirect to copy function so I can use ctr c too
	paste();
};
function paste(){
	if(currShape > 0){
		// take care of actions later in function
		shapes.push(copyShape);
		colors.push(copyColor);
		if(copyShape.length != 1){
			// all other shapes
			centers.push([copyCenter[0] + 10, copyCenter[1] - 10]);
			actions.push(["newShape", "shape"]);
		} else if(copyShape[0][0] != 0 && copyShape[0][1] == 0){
			// circle
			centers.push([copyCenter[0] + 10, copyCenter[1] - 10]);
			actions.push(["newShape", "shape"]);
		} else if(copyShape[0][0] != 0 && copyShape[0][1] != 0){
			// ellipse
			centers.push([copyCenter[0] + 10, copyCenter[1] - 10]);
			ellipseMap[shapes.length - 1] = 0;
			actions.push(["newShape", "ellipse"]);
		}
		
		if(copyShape.length == 1){
			if(copyShape[0][0] == 0 && copyShape[0][1] == 0){
				// polyline
				centers.push([0, polyLineCenters.length]);
				actions.push(["newShape", "polyLine"]);
				
				polyLines.push(copyPolyLine);
				polyLineCenters.push([copyPolyLineCenter[0] + 10, copyPolyLineCenter[1] - 10]);
				polyLineColors.push(copyColor);
			} else if(copyShape[0][0] == 0 && copyShape[0][1] == 1){
				// curve
				centers.push([0, curveCenters.length]);
				actions.push(["newShape", "curve"]);
				
				curves.push(copyCurve);
				curveCenters.push([copyCurveCenter[0] + 10, copyCurveCenter[1] - 10]);
				curveColors.push(copyColor);
			}
		}
		currShape = shapes.length - 1;
		copy();
	}
	drawShapes();
	return;
}
var myUndoButton = document.getElementById('undoButton');
myUndoButton.onclick = function(){
	undo();
};
function undo(){
	tempPolyLine = [];
	tempPolyLineCenter = [];
	tempPolygon = [];
	tempPolygonCenter = [];
	if(actions.length > 0){
		var act = actions.pop();
		
		switch(act[0]){
			case "newShape" :
				undoShape = shapes[shapes.length - 1];
				if(act[1] == "polyLine"){
					// Poly-Line
					polyLines.pop();
					polyLineCenters.pop();
					polyLineColors.pop();
				}else if(act[1] == "curve"){
					// curve
					curves.pop();
					curveCenters.pop();
					curveColors.pop();
				} else if(act[1] == "ellipse"){
					// ellipse
					ellipseMap.delete(shapes.length - 1);
				}
				shapes.pop();
				centers.pop();
				colors.pop();
				currShape = shapes.length - 1;
				break;
			case "translate" :
				if(act[1] == "polyLine"){
					// Poly-Line
					// actions.push(["translate", stringShape, currShape, transformAdjustX, transformAdjustY]);
					translate(polyLineCenters[centers[act[2]][1]], act[3], act[4]);
				}else if(act[1] == "curve"){
					// curve
					translate(curveCenters[centers[act[2]][1]], act[3], act[4]);
				} else if(act[1] == "ellipse"){
					// ellipse
					translate(centers[act[2]], act[3], act[4]);
				} else {
					console.log("undo translation", act[3], act[4]);
					translate(centers[act[2]], act[3], act[4]);
				}
				break;
			case "scale" :
				if(act[1] == "polyLine"){
					// Poly-Line
					polyLines[centers[act[2]][1]] = scale(polyLines[centers[act[2]][1]], (1/act[3]), (1/act[4]));
				}else if(act[1] == "curve"){
					// curve
					curves[centers[act[2]][1]] = scale(curves[centers[act[2]][1]], (1/act[3]), (1/act[4]));
				} else if(act[1] == "ellipse"){
					// ellipse
					shapes[act[2]] = scale(shapes[act[2]], (1/act[3]), (1/act[4]));
				} else {
					shapes[act[2]] = scale(shapes[act[2]], (1/act[3]), (1/act[4]));
				}
				break;
			case "rotate" : 
				if(act[1] == "polyLine"){
					// Poly-Line
					polyLines[centers[act[2]][1]] = rotate(polyLines[centers[act[2]][1]], act[3], act[4]);
				}else if(act[1] == "curve"){
					// curve
					curves[centers[act[2]][1]] = rotate(curves[centers[act[2]][1]], act[3], act[4]);
				} else if(act[1] == "ellipse"){
					// ellipse
					ellipseMap[act[2]] = ellipseMap[act[2]] + act[3];
				} else {
					shapes[act[2]] = rotate(shapes[act[2]], act[3], act[4]);
				}
				break;
		}
	}
	drawShapes();
}

var myEndPolygonButton = document.getElementById('endPolygon');
myEndPolygonButton.onclick = function(){
	drawShapes();
	if(tempPolygon.length >= 2){
		ctx.closePath();
		var centerX;
		var centerY;
		
		var counter = 0;
		var tempx = 0;
		var tempy = 0;
		for(var i = 0; i < tempPolygon.length; i++){
			tempx += tempPolygon[i][0];
			tempy += tempPolygon[i][1];
			counter++;
		}
		// center of new polygon for rotation and scaling
		centerX = tempx / counter;
		centerY = tempy / counter;
		
		// move the points to the correct format around the center
		for(var i = 0; i < tempPolygon.length; i++){
			translate(tempPolygon[i], -centerX, -centerY);
			//console.log("new point: x: " + tempPolygon[i][0] + ", y: " + tempPolygon[i][1]);
		}
		// add to shapes, draw new polygon, and clear temp
		actions.push(["newShape", "shape"]);
		shapes.push(tempPolygon);
		centers.push([centerX, centerY]);
		colors.push(color);
		
		currShape = shapes.length - 1;
	}
	drawShapes();
	tempPolyLine = [];
	tempPolyLineCenter = [];
	tempPolygon = [];
	tempPolygonCenter = [];
};
var myEndPolyLineButton = document.getElementById('endPolyLine');
myEndPolyLineButton.onclick = function(){
	if(tempPolyLine.length >= 2){
		ctx.closePath();
		var centerX;
		var centerY;
		
		var counter = 0;
		var tempx = 0;
		var tempy = 0;
		for(var i = 0; i < tempPolyLine.length; i++){
			tempx += tempPolyLine[i][0];
			tempy += tempPolyLine[i][1];
			counter++;
		}
		// center of new polyLine for rotation and scaling
		centerX = tempx / counter;
		centerY = tempy / counter;
		
		// move the points to the correct format around the center
		for(var i = 0; i < tempPolyLine.length; i++){
			translate(tempPolyLine[i], -centerX, -centerY);
		}
		
		// add to array, draw new polyLine, and clear temp
		actions.push(["newShape", "polyLine"]);
		shapes.push([[0, 0]])
		centers.push([0, polyLines.length]);
		colors.push(color);
		polyLines.push(tempPolyLine);
		polyLineCenters.push([centerX, centerY]);
		
		currShape = shapes.length - 1;
	}
	tempPolyLine = [];
	tempPolyLineCenter = [];
	tempPolygon = [];
	tempPolygonCenter = [];
	drawShapes();
};

can.onmousedown = function(mDown) {
	clickX = Math.round(mDown.clientX - cRect.left);
	clickY = Math.round(mDown.clientY - cRect.top);
	switch(currentFunction){
		case "newShape":
			switch(currentShape){
				case "line":
					newLine = [
						[-50, 0],
						[50, 0]];
						actions.push(["newShape", "shape"]);
						shapes.push(newLine);
						centers.push([clickX, clickY]);
						colors.push(color);
						currShape = shapes.length - 1;
						drawShapes();
					break;
				case "triangle":
					newTriangle = [
						[-60, 32],
						[60, 32],
						[0, -68]];
						actions.push(["newShape", "shape"]);
						shapes.push(newTriangle);
						centers.push([clickX, clickY]);
						colors.push(color);
						currShape = shapes.length - 1;
						drawShapes();
					break;
				case "square":
					newSquare = [
						[-50, 50],
						[-50, -50],
						[50, -50],
						[50, 50]];
						actions.push(["newShape", "shape"]);
						shapes.push(newSquare);
						centers.push([clickX, clickY]);
						colors.push(color);
						currShape = shapes.length - 1;
						drawShapes();
					break;
				case "rectangle":
					newRectangle = [
						[-80, 50],
						[-80, -50],
						[80, -50],
						[80, 50]];
						actions.push(["newShape", "shape"]);
						shapes.push(newRectangle);
						centers.push([clickX, clickY]);
						colors.push(color);
						currShape = shapes.length - 1;
						drawShapes();
					break;
				case "circle":
					newCircle = [
						[50, 0]];
						actions.push(["newShape", "shape"]);
						shapes.push(newCircle);
						centers.push([clickX, clickY]);
						colors.push(color);
						currShape = shapes.length - 1;
						drawShapes();
					break;
				case "ellipse":
					newEllipse = [
						[50, 100]];
						actions.push(["newShape", "ellipse"]);
						shapes.push(newEllipse);
						centers.push([clickX, clickY]);
						colors.push(color);
						ellipseMap[shapes.length - 1] = 0;
						currShape = shapes.length - 1;
						drawShapes();
					break;
				case "curve":
					tempCurve.push([clickX, clickY]);
					if(tempCurve.length == 4){
						createCurve();
					}
					break;
				case "polyLine":
					// setup points for polygon as well as draw guide lines to points
					if(tempPolyLine.length == 0){
						tempPolyLineCenter = [clickX, clickY];
						ctx.beginPath();
						ctx.strokeStyle = color;
						ctx.moveTo(clickX, clickY);
					} else {
						ctx.lineTo(clickX, clickY);
						ctx.stroke();
					}
					tempPolyLine.push([clickX, clickY]);
					break;
				case "polygon":
					// setup points for polygon as well as draw guide lines to points
					if(tempPolygon.length == 0){
						tempPolygonCenter = [clickX, clickY];
						ctx.beginPath();
						ctx.strokeStyle = color;
						ctx.moveTo(clickX, clickY);
					} else {
						ctx.lineTo(clickX, clickY);
						ctx.stroke();
					}
					tempPolygon.push([clickX, clickY]);
					break;
			}
			break;
		case "select":
			for (let i = 0; i < shapes.length; i++) {
				if (isMouseOver(shapes[i], centers[i], clickX, clickY)) {
					console.log("got one, its: " + i);
					currShape = i;
					drawShapes();
					outline(shapes[i], centers[i], i);
					return;
				}
			}
			clearOutline();
			break;
		// case "translate":
			// mouseDown = true;
			// startTransfromX = clickX;
			// startTransfromY = clickY;
			// break;
		// case "scale":
			// mouseDown = true;
			// break;
		// case "rotate":
			// mouseDown = true;
			// break;
		default:
			mouseDown = true;
			// startTransfromX = clickX;
			// startTransfromY = clickY;
			break;
	}
}
can.onmouseup = function(mUp) {
	mouseDown = false;
	releaseX = Math.round(mUp.clientX - cRect.left);
	releaseY = Math.round(mUp.clientY - cRect.top);
	
	//if(shapes.length >= 1){
		// var temp;
		// for (var i = 0, length = radios.length; i < length; i++) {
			// if (radios[i].checked) {
			// temp = radios[i].value;
			// // only one radio can be logically checked, don't check the rest
			// break;
			// }
		// }
	if(shapes.length > 1){
		var stringShape = "shape";
		if(shapes[currShape].length == 1){
			if(shapes[currShape][0][0] == 0 && shapes[currShape][0][1] == 0){
				// Poly-Line
				stringShape = "polyLine";
			}else if(shapes[currShape][0][0] == 0 && shapes[currShape][0][1] == 1){
				// curve
				stringShape = "curve";
			} else {
				if(shapes[currShape][0][1] == 0){
					// draw the circle
					stringShape = "circle";
				} else {
					// draw the ellipse
					stringShape = "ellipse";
				}
			}
		}
		switch(currentFunction){
			case "translate":
				console.log(["translate", stringShape, currShape, transformAdjustX, transformAdjustY]);
				actions.push(["translate", stringShape, currShape, transformAdjustX, transformAdjustY]);
				transformAdjustX = 0;
				transformAdjustY = 0;
				break;
			case "scale":
				actions.push(["scale", stringShape, currShape, scaleAdjust, scaleAdjust]);
				scaleAdjust = 1;
				scaleAdjust = 1;
				break;
			case "rotate":
				actions.push(["rotate", stringShape, currShape, transformAdjustX, transformAdjustY]);
				transformAdjustX = 0;
				transformAdjustY = 0;
				break;
		}
	}
}

can.onmousemove = function(mMove) {
	currentX = Math.round(mMove.clientX - cRect.left);
	currentY = Math.round(mMove.clientY - cRect.top);
	
	var polyLineBool = false;
	var curveBool = false;
	
	if(shapes.length >= 1){
		if(shapes[currShape][0][0] == 0 && shapes[currShape][0][1] == 0){
			// polyline
			polyLineBool = true;
		} else if(shapes[currShape][0][0] == 0 && shapes[currShape][0][1] == 1){
			// curve
			curveBool = true;
		} else {
			polyLineBool = false;
			curveBool = false;
		}
	}
	
	if(tempCurve.length == 2){
		var x1 = tempCurve[0][0];
		var y1 = tempCurve[0][1];
		var x2 = tempCurve[1][0];
		var y2 = tempCurve[1][1];
		
		var cx1 = currentX;
		var cy1 = currentY;
		var cx2 = currentX;
		var cy2 = currentY;
	
		ctx.clearRect(0, 0, 600, 600);
		drawShapes();
		
		ctx.beginPath();
		ctx.strokeStyle = color;
		ctx.moveTo(x1, y1);
		ctx.bezierCurveTo(cx1, cy1, cx2, cy2, x2, y2);
		ctx.stroke();
	} else if (tempCurve.length == 3){
		var x1 = tempCurve[0][0];
		var y1 = tempCurve[0][1];
		var x2 = tempCurve[1][0];
		var y2 = tempCurve[1][1];
		
		var cx1 = tempCurve[2][0];
		var cy1 = tempCurve[2][1];
		var cx2 = currentX;
		var cy2 = currentY;
	
		ctx.clearRect(0, 0, 600, 600);
		drawShapes();
		
		ctx.beginPath();
		ctx.strokeStyle = color;
		ctx.moveTo(x1, y1);
		ctx.bezierCurveTo(cx1, cy1, cx2, cy2, x2, y2);
		ctx.stroke();
	}
	
	if(mouseDown){
		if(shapes.length >= 1){
			switch(currentFunction){
				case "translate":
					// clear the old shape
					ctx.clearRect(0, 0, 600, 600);
					
					transformAdjustX -= (currentX - clickX);
					transformAdjustY -= (currentY - clickY);
					// translate then draw
					if(polyLineBool){
						// polyline
						translate(polyLineCenters[centers[currShape][1]], (currentX - clickX), (currentY - clickY));
					} else if(curveBool){
						// curve
						translate(curveCenters[centers[currShape][1]], (currentX - clickX), (currentY - clickY));
					} else {
						translate(centers[currShape], (currentX - clickX), (currentY - clickY));
					}
					drawShapes();
					break;
				case "scale":
					// clear the old shape
					ctx.clearRect(0, 0, 600, 600);
					
					if(currentX > clickX){
						scaleAdjust*=1.05;
					} else {
						scaleAdjust*=0.95;
					}
					// scale then draw
					if(polyLineBool){
						// polyline
						if(currentX > clickX){
							polyLines[centers[currShape][1]] = scale(polyLines[centers[currShape][1]], 1.05, 1.05);
						} else {
							polyLines[centers[currShape][1]] = scale(polyLines[centers[currShape][1]], .95, .95);
						}
					} else if(curveBool){
						// curve
						if(currentX > clickX){
							curves[centers[currShape][1]] = scale(curves[centers[currShape][1]], 1.05, 1.05);
						} else {
							curves[centers[currShape][1]] = scale(curves[centers[currShape][1]], .95, .95);
						}
					} else {
						// all others are easy
						if(currentX > clickX){
							shapes[currShape] = scale(shapes[currShape], 1.05, 1.05);
						} else {
							shapes[currShape] = scale(shapes[currShape], .95, .95);
						}
					}
					drawShapes();
					break;
				case "rotate":
					// clear the old shape
					ctx.clearRect(0, 0, 600, 600);
					
					if(currentX > clickX){
						transformAdjustX -= 0.06;
						transformAdjustY -= 0.06;
					} else {
						transformAdjustX += 0.06;
						transformAdjustY += 0.06;
					}
					if(polyLineBool){
						// polyline
						if(currentX > clickX){
							polyLines[centers[currShape][1]] = rotate(polyLines[centers[currShape][1]], .06, .06);
						} else {
							polyLines[centers[currShape][1]] = rotate(polyLines[centers[currShape][1]], -.06, -.06);
						}
					} else if(curveBool){
						// curve
						if(currentX > clickX){
							curves[centers[currShape][1]] = rotate(curves[centers[currShape][1]], .06, .06);
						} else {
							curves[centers[currShape][1]] = rotate(curves[centers[currShape][1]], -.06, -.06);
						}
					} else if(shapes[currShape].length == 1 && shapes[currShape][0][0] != 0 && shapes[currShape][0][1] != 0){
						//rotating an ellipse
						if(currentX > clickX){
							ellipseMap[currShape] = ellipseMap[currShape] + .06;
						} else {
							ellipseMap[currShape] = ellipseMap[currShape] - .06;
						}
					} else {
						// all others are easy
						if(currentX > clickX){
							shapes[currShape] = rotate(shapes[currShape], .06, .06);
						} else {
							shapes[currShape] = rotate(shapes[currShape], -.06, -.06);
						}
					}
					drawShapes();
					break;
			}
		}
		clickX = currentX;
		clickY = currentY;
		drawShapes();
	}
}

function drawShapes(outL = true){
	// clear the canvas
	ctx.fillStyle="#FFFFFF";
	ctx.fillRect(0, 0, can.width, can.height);
	
	// outline the canvas for clarity
	var temp = ctx.strokeStyle;
	ctx.strokeStyle ="#000000";
	ctx.strokeRect(0, 0, can.width, can.height);
	
	// draw the shapes
	for(var i = 0; i < shapes.length; i++){
		drawShape(shapes[i], centers[i], colors[i], i);
	}
	if(outL){
		outline(shapes[currShape], centers[currShape], currShape);
	}
}

function drawShape(shape, center, shapeColor, index){
	
	ctx.fillStyle = shapeColor;
	ctx.strokeStyle = shapeColor;
	
	if(shape.length == 1){
		if(shape[0][0] == 0 && shape[0][1] == 0){
			// Poly-Line
			drawPolyLine(center[1], polyLineCenters[center[1]], polyLineColors[center[1]]);
			return;
		}else if(shape[0][0] == 0 && shape[0][1] == 1){
			// curve
			drawCurve(center[1], curveCenters[center[1]], curveColors[center[1]]);
			return;
		} else {
			if(shape[0][1] == 0){
				// draw the circle
				ctx.beginPath();
				ctx.arc(center[0], center[1], shape[0][0], 0, 2 * Math.PI);
				ctx.closePath();
				ctx.fill();
			} else {
				// draw the ellipse
				ctx.beginPath();
				ctx.ellipse(center[0], center[1], shape[0][0], shape[0][1], ellipseMap[index], 0, 2 * Math.PI);
				ctx.closePath();
				ctx.fill();
			}
			return;
		}
	} else if(shape.length == 2){
		// draw the line
		ctx.beginPath();
		ctx.moveTo((center[0] + shape[0][0]), (center[1] + shape[0][1]));
		ctx.lineTo((center[0] + shape[1][0]), (center[1] + shape[1][1]));
		ctx.stroke();
		ctx.closePath();
		return;
	}
	
	// draw any other shape
	ctx.beginPath();
	ctx.moveTo(center[0] + shape[0][0], center[1] + shape[0][1]);
	for(var i = 0; i < shape.length; i++){
		ctx.lineTo(center[0] + shape[i][0], center[1] + shape[i][1]);
	}
	ctx.closePath();
	ctx.fill();
}

function drawPolyLine(index, center, shapeColor){
	var shape = polyLines[index];
	ctx.strokeStyle = shapeColor;
	
	ctx.beginPath();
	ctx.moveTo(center[0] + shape[0][0], center[1] + shape[0][1]);
	for(var i = 1; i < shape.length; i ++){
		ctx.lineTo(center[0] + shape[i][0], center[1] + shape[i][1]);
		ctx.stroke();
	}
	ctx.closePath();
}

function drawCurve(index, center, shapeColor){
	var shape = curves[index];
	ctx.strokeStyle = shapeColor;
	
	var x1 = center[0] + shape[0][0];
	var y1 = center[1] + shape[0][1];
	var x2 = center[0] + shape[1][0];
	var y2 = center[1] + shape[1][1];
	
	var cx1 = center[0] + shape[2][0];
	var cy1 = center[1] + shape[2][1];
	var cx2 = center[0] + shape[3][0];
	var cy2 = center[1] + shape[3][1];
	
	//console.log("drawing bezier curve " + index + " at: x1: " + x1 + ", y1: " + y1 + ", x2: " + x2);
	ctx.beginPath();
	ctx.moveTo(x1, y1);
	ctx.bezierCurveTo(cx1, cy1, cx2, cy2, x2, y2);
	ctx.stroke();
	ctx.closePath();
}

function createCurve(){
	var centerX;
	var centerY;
	
	var tempx = tempCurve[0][0] + tempCurve[1][0];
	var tempy = tempCurve[0][1] + tempCurve[3][1];
	
	// center of new curve for rotation and scaling
	centerX = tempx / 2;
	centerY = tempy / 2;
	
	// move the points to the correct format around the center
	for(var i = 0; i < tempCurve.length; i++){
		translate(tempCurve[i], -centerX, -centerY);
	}
	
	// add to array, draw new curve, and clear temp
	actions.push(["newShape", "curve"]);
	shapes.push([[0, 1]])
	centers.push([0, curves.length]);
	colors.push(color);
	
	curves.push(tempCurve);
	curveCenters.push([centerX, centerY]);
	curveColors.push(color);
	
	tempCurve = [];
	tempCurveCenter = [];
	
	currShape = shapes.length - 1;
	drawShapes();
}

// translate the given structure
function translate(temp, dx, dy){
	temp[0] += dx;
	temp[1] += dy;
}

// scale the given structure
function scale(temp, dx, dy) {
	mScale = [
		[dx, 0],
		[0, dx]];
		
	return (multiply(temp, mScale));
}

// rotate the given structure
function rotate(temp, dx, dy) {
	if(temp.length == 1){
		return temp;
	}
	mRotate = [
		[Math.cos(dx), Math.sin(dx)],
		[-Math.sin(dx), Math.cos(dx)]];
		
	return (multiply(temp, mRotate));
}

// simply multiply matrices function
// throws an error if input is invalid
function multiply(a, b){
   if (!Array.isArray(a) || !Array.isArray(b) || !a.length || !b.length) {
      throw new Error('arguments should be in 2-dimensional array format');
   }
   let x = a.length,
   z = a[0].length,
   y = b[0].length;
   if (b.length !== z) {
      // XxZ & ZxY => XxY
      throw new Error('number of columns in the first matrix should be the same as the number of rows in the second');
   }
   let productRow = Array.apply(null, new Array(y)).map(Number.prototype.valueOf, 0);
   let product = new Array(x);
   for (let p = 0; p < x; p++) {
      product[p] = productRow.slice();
   }
   for (let i = 0; i < x; i++) {
      for (let j = 0; j < y; j++) {
         for (let k = 0; k < z; k++) {
            product[i][j] += a[i][k] * b[k][j];
         }
      }
   }
   return product;
}

function isMouseOver(shape, center, x, y){
	
	var lowx;
	var highx;
	var lowy;
	var highy;
	
	var needMore = true;
	
	if(shape.length == 1){
		if(shape[0][0] == 0 && shape[0][1] == 0){
			// Poly-Line
			shape = polyLines[center[1]];
			center = polyLineCenters[center[1]];
		}else if(shape[0][0] == 0 && shape[0][1] == 1){
			// curve
			shape = curves[center[1]];
			center = curveCenters[center[1]];
		} else {
			if(shape[0][1] == 0){
				// circle coords
				lowx = center[0] - shape[0][0];
				highx = center[0] + shape[0][0];
				lowy = center[1] - shape[0][0];
				highy = center[1] + shape[0][0];
				needMore = false;
			} else {
				// ellipse coords
				lowx = center[0] - shape[0][0];
				highx = center[0] + shape[0][0];
				lowy = center[1] - shape[0][1];
				highy = center[1] + shape[0][1];
				needMore = false;
			}
		}
	}
	
	
	
	if(needMore){
		for(var i = 0; i < shape.length; i++){
			if(i == 0){
				lowx = center[0] + shape[i][0];
				lowy = center[1] + shape[i][1];
				highx = center[0] + shape[i][0];
				highy = center[1] + shape[i][1];
			}
			if(center[0] + shape[i][0] < lowx){
				lowx = center[0] + shape[i][0];
			}
			if(center[1] + shape[i][1] < lowy){
				lowy = center[1] + shape[i][1];
			}
			if(center[0] + shape[i][0] > highx){
				highx = center[0] + shape[i][0];
			}
			if(center[1] + shape[i][1] > highy){
				highy = center[1] + shape[i][1];
			}
		}
	}
	
	if(shape.length == 2){
		// line coords
		lowx -= 5;
		highx += 5;
		lowy -= 5;
		highy += 5;
	}
	
	return(	x >= lowx &&
			x <= highx &&
			y >= lowy &&
			y <= highy)
}
function clearOutline(){
	//console.log(ellipseMap);
	drawShapes(false);
}
function outline(shape, center, index, b = true){
	
	ctx.strokeStyle = "#FF0000";
	var temp = ctx.lineWidth;
	ctx.lineWidth = 3;
	
	if(shape.length == 1){
		if(shape[0][0] == 0 && shape[0][1] == 0){
			// Poly-Line
			outline(polyLines[center[1]], polyLineCenters[center[1]], center[1], false);
			ctx.lineWidth = temp;
			return;
		}else if(shape[0][0] == 0 && shape[0][1] == 1){
			// curve
			ctx.beginPath();
			drawCurve(center[1], curveCenters[center[1]], "FF0000");
			ctx.closePath();
			
			// reset values for regular use
			ctx.lineWidth = temp;
			return;
		} else {
			if(shape[0][1] == 0){
				// draw the circle
				ctx.beginPath();
				ctx.arc(center[0], center[1], shape[0][0], 0, 2 * Math.PI);
				ctx.stroke();
			} else {
				// draw the ellipse
				ctx.beginPath();
				ctx.ellipse(center[0], center[1], shape[0][0], shape[0][1], ellipseMap[index], 0, 2 * Math.PI);
				ctx.stroke();
			}
		}
	}
	
	ctx.beginPath();
	ctx.moveTo(center[0] + shape[0][0], center[1] + shape[0][1]);
	for(var i = 1; i < shape.length; i++){
		ctx.lineTo(center[0] + shape[i][0], center[1] + shape[i][1]);
		ctx.stroke();
	}
	if(b){
		ctx.lineTo(center[0] + shape[0][0], center[1] + shape[0][1]);
		ctx.stroke();
		ctx.closePath();
	}
	
	// reset values for regular use
	ctx.lineWidth = temp;
}
document.onkeydown = (event) => {
  // control c, control v, and control z
  // for respective commands
  if (event.key === "Control") {
    controlPressed = true;
  } else if (event.key === "c" && controlPressed) {
    copy();
  } else if (event.key === "v" && controlPressed) {
    paste();
  } else if (event.key === "z" && controlPressed) {
    undo();
  }
};
document.onkeyup = (event) => {
  if (event.key === "Control") {
    controlPressed = false;
  }
};
