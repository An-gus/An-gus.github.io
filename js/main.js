let circuit
let sideBar, ioButton, settingsButton
let wireDrag = false
let compFrom
let boolType = "logic"
let inpMap
let inputNames
let errCir = false
let clockImgOn, clockImgOff
let zoom = 0
let zoomSF = 0.001

//define which menus are open
let menu = null

//define colours such that user can edit them
let highColor = "#0000ff"
let lowColor = "#ffffff"
let dragColor = "#969696"
let bgColor = "#333333"
let sbColor = "#aabbcc"

//define a regex of gate types
let gateRX = /AND|OR|XOR|NAND|NOR|XNOR|NOT/g
let symRX = /·|∧|\*|\.|\^|\/\\|x(?![oOnN])|×|&|\+|∨|\\\/|v|\||⊕|⊻|¬|-|!/gi
//deifne hash map of gate type to symbol
let wrtToExp = new Map()
let expToWrt = new Map()

function preload() {
  //load images for gates
  gateImg.set("AND", loadImage("/images/gates/AND.png"))
  gateImg.set("OR", loadImage("/images/gates/OR.png"))
  gateImg.set("XOR", loadImage("/images/gates/XOR.png"))
  gateImg.set("NAND", loadImage("/images/gates/NAND.png"))
  gateImg.set("NOR", loadImage("/images/gates/NOR.png"))
  gateImg.set("XNOR", loadImage("/images/gates/XNOR.png"))
  gateImg.set("NOT", loadImage("/images/gates/NOT.png"))

  //set default settings
  document.getElementById("sandBoxCol").value = bgColor
  document.getElementById("sideBarCol").value = sbColor
  document.getElementById("highCol").value = highColor
  document.getElementById("lowCol").value = lowColor
  document.getElementById("dragCol").value = dragColor

  //check if a cookie is present, if so get the colour scheme from it
  if(document.cookie != ''){
    try{
      //split cookie into colour vairables and remove whitespace
      const result = document.cookie.replace(/\s/g, '').split(';').slice(0,6)
      //set colours from cookie
      highColor = result[0].slice(3)
      lowColor = result[1].slice(3)
      dragColor = result[2].slice(3)
      bgColor = result[3].slice(3)
      sbColor = result[4].slice(3)
      boolType = result[5].slice(3)
      setHTML()
    }catch (error){
      console.log(error)
      //set colours to default if not in cookies
      highColor = "#0000ff"
      lowColor = "#ffffff"
      dragColor = "#969696"
      bgColor = "#333333"
      sbColor = "#aabbcc"
      boolType = "logic"
      setHTML()
    }
  }

  //get referance to clock images and set the colours
  clockImgOff = loadImage("/images/clock.png", img => swapCol(img, color(255), color(lowColor)))
  clockImgOn = loadImage("/images/clock.png", img => swapCol(img, color(255), color(highColor)))

  //deifne operations for parser
  jsep.addUnaryOp("NOT")
  jsep.addBinaryOp("AND",2)
  jsep.addBinaryOp("NAND",2)
  jsep.addBinaryOp("OR",1)
  jsep.addBinaryOp("NOR",1)
  jsep.addBinaryOp("XOR",1)
  jsep.addBinaryOp("XNOR",1)

  //define a string for the name of inputs
  fetch("/data/inputNames.txt").then(res => res.text()).then(txt => inputNames=txt.split("\r\n"))

  //fill in wrtToExp
  wrtToExp.set("AND", ["·", "∧"])
  wrtToExp.set("OR", ["+", "∨"])
  wrtToExp.set("XOR", ["⊕", "⊻"])
  wrtToExp.set("NOT", ["'", "¬"])
  //fill in expToWrt
  expToWrt.set("∧", " AND ")
  expToWrt.set("·", " AND ")
  expToWrt.set(".", " AND ")
  expToWrt.set("*", " AND ")
  expToWrt.set("^", " AND ")
  expToWrt.set("×", " AND ")
  expToWrt.set("x", " AND ")
  expToWrt.set("/\\", " AND ")
  expToWrt.set("&", " AND ")
  expToWrt.set("∨", " OR ")
  expToWrt.set("+", " OR ")
  expToWrt.set("\\/", " OR ")
  expToWrt.set("v", " OR ")
  expToWrt.set("|", " OR ")
  expToWrt.set("⊕", " XOR ")
  expToWrt.set("⊻", " XOR ")
  expToWrt.set("¬", " NOT ")
  expToWrt.set("-", " NOT ")
  expToWrt.set("!", " NOT ")
}

function setup() {
  //store referance to the side bar DOM element
  sideBar = select("#sideBar")
  sideBar.style('background-color:'+sbColor)

  //store referance to menu buttons
  ioButton = select("#ioButton")
  settingsButton = select("#settingsButton")
  clearButton = select("#clearSandbox")
  
  //initialise canvas
  var canv = createCanvas(windowWidth-sideBar.width,windowHeight);
  canv.parent("canv")

  ioButton.position(windowWidth-settingsButton.width-ioButton.width,0)
  settingsButton.position(windowWidth-settingsButton.width,0)
  
  //initialise circuit
  circuit = new Circuit()
}

function draw() {
  //zoom to current level
  translate(width/2,height/2)
  scale(1+zoom*zoomSF)
  translate(-width/2, -height/2)

  //draw background
  background(bgColor);
  
  //update the state of the comps in the circuit
  circuit.gates.forEach(gate => gate.updateState())
  circuit.inputs.forEach(input => input.updateState())
  circuit.outputs.forEach(output => output.updateState())
  
  //update the position etc of the comps in the circuit
  circuit.wires.forEach(displayWire)
  circuit.gates.forEach(gate => gate.update())
  circuit.inputs.forEach(input => input.update())
  circuit.outputs.forEach(output => output.update())
  
  if (wireDrag){
    let {x,y} = transformMouse()
    push()
    stroke(dragColor)
    strokeWeight(5)
    line(compFrom.pos.x+compFrom.w+R, compFrom.pos.y+compFrom.h/2, x, y)
    pop()
  } 
}

//ensures the canvas is always the size of the window
function windowResized() {
  resizeCanvas(windowWidth-sideBar.width, windowHeight);
  ioButton.position(windowWidth-settingsButton.width-ioButton.width,0)
  settingsButton.position(windowWidth-settingsButton.width,0)
}
//called when the mouse is pressed
function mousePressed(){
  if (mouseButton==LEFT){
  circuit.gates.forEach(gate => gate.pressed()) //calls the pressed function for all the gates
  circuit.inputs.forEach(input => input.pressed()) //calls the pressed function for all the inputs
  circuit.outputs.forEach(output => output.pressed()) //calls the pressed function for all the outputs 
  
  circuit.gates.forEach(gate => gate.wireFrom())
  circuit.inputs.forEach(inp => inp.wireFrom())
  }else if (mouseButton==RIGHT){
    circuit.gates.forEach(gate => gate.rightMouse()) //calls the rightMouse function for all the gates
    circuit.inputs.forEach(input => input.rightMouse()) //calls the rightMouse function for all the inputs
    circuit.outputs.forEach(output => output.rightMouse()) //calls the rightMouse function for all the outputs
  }else if (mouseButton==CENTER){
    circuit.inputs.forEach(inp=>{if (inp.type=="clock"){inp.centreMouse()}}) //calls centre mouse function on clocks
  }
}
//called when the mouse is released
function mouseReleased(){
  circuit.gates.forEach(gate => gate.released()) //calls the released function for all the gates
  circuit.inputs.forEach(input => input.released()) //calls the released function for all the inputs
  circuit.outputs.forEach(output => output.released()) //calls the released function for all the outputs
  
  circuit.gates.forEach(gate => gate.wireTo())
  circuit.outputs.forEach(out => out.wireTo())
  
  wireDrag = false
}
//called on mouse scroll
function mouseWheel(event){
  if (mouseX>0 && menu==null){
    zoom = (zoom-event.delta<=-1/zoomSF) ? zoom : zoom - event.delta
  }
}

//Called when the elements in the sideBar are pressed

function clickGate(type){
  var maxInputs
  if(type=="NOT"){maxInputs = 1}
  var accept = true
  let s = 1/(1+zoom*zoomSF)
  //try 50 times to add the gate
  for(let i=0; i<50; i++){
    var pos = createVector(random((1-s)*0.5*width,(1+s)*0.5*width),random((1-s)*0.5*height,(1+s)*0.5*height))
    //check if gate is overlapping another component
    for(let comp of [...circuit.gates,...circuit.inputs,...circuit.outputs]){
      if(overlap({pos:pos, w:50, h:50}, comp)){accept=false; break}
    }
      //if accepted add the gate
    if(accept){circuit.addGate(pos.x,pos.y,50,50,type,maxInputs);return}
  }
}
function clickInp(type){
  var accept = true
  let s = 1/(1+zoom*zoomSF)
  //try 50 times to add the input
  for(let i=0; i<50; i++){
    var pos = createVector(random((1-s)*0.5*width,(1+s)*0.5*width),random((1-s)*0.5*height,(1+s)*0.5*height))
    //check if input is overlapping another component
    for(let comp of [...circuit.gates,...circuit.inputs,...circuit.outputs]){
      if(overlap({pos:pos, w:50, h:50}, comp)){accept=false; break}
    }
      //if accepted add the input
    if(accept){circuit.addInput(pos.x,pos.y,50,50,type);return}
  }
}
function clickClock(){
  var accept = true
  let s = 1/(1+zoom*zoomSF)
  //try 50 times to add the clock
  for(let i=0; i<50; i++){
    var pos = createVector(random((1-s)*0.5*width,(1+s)*0.5*width),random((1-s)*0.5*height,(1+s)*0.5*height))
    //check if clock is overlapping another component
    for(let comp of [...circuit.gates,...circuit.inputs,...circuit.outputs]){
      if(overlap({pos:pos, w:50, h:50}, comp)){accept=false; break}
    }
      //if accepted add the clock
    if(accept){circuit.addClock(pos.x,pos.y,50,50);return}
  }
}
function clickOut(){
  var accept = true
  let s = 1/(1+zoom*zoomSF)
  //try 50 times to add the output
  for(let i=0; i<50; i++){
    var pos = createVector(random((1-s)*0.5*width,(1+s)*0.5*width),random((1-s)*0.5*height,(1+s)*0.5*height))
    //check if output is overlapping another component
    for(let comp of [...circuit.gates,...circuit.inputs,...circuit.outputs]){
      if(overlap({pos:pos, w:50, h:50}, comp)){accept=false; break}
    }
      //if accepted add the output
    if(accept){circuit.addOutput(pos.x,pos.y,50,50);return}
  }
}

//open an auxillary menu
function openMenu(id){
  document.getElementById(id).style.zIndex=1
  document.getElementById(id).style.display="block"
  menu=id
  noLoop()
}

//close an auxillary menu
function closeMenu(id){
  document.getElementById(id).style.zIndex=-1
  document.getElementById(id).style.display="none"
  menu=null
  loop()
}

//set the colour upon changing in settings
function setColour(id){
  //get the new colour
  var col = document.getElementById(id).value
  //store the new colour and update element if necessary
  switch(id){
    case "sandBoxCol":
      bgColor = col
      break
    case "sideBarCol":
      sbColor = col
      sideBar.style('background-color:'+sbColor)
      break
    case "highCol":
      clockImgOn = loadImage("/images/clock.png", img => swapCol(img, color(255), color(col)))
      highColor = col
      break
    case "lowCol":
      clockImgOff = loadImage("/images/clock.png", img => swapCol(img, color(255), color(col)))
      lowColor = col
      break
    case "dragCol":
      dragColor = col
      break
  }
  setCookie()
}

//set the boolean type
function setBoolType(){
  boolType = document.getElementById("boolGrams").value
  setCookie()
}

function genBool(){
  //get the user input expression
  var exp = document.getElementById("boolExpIn").value
  exp = exp.replace(symRX, x=>expToWrt.get(x)) //replace symbols with written 
  circuit = new Circuit()
  inpMap = new Map()
  circuit.addOutput(random(sideBar.width+50,width-sideBar.width-50), random(height-50), 50, 50)
  try{
    var tree = jsep(exp)
    buildTree(tree, circuit.outputs[0])
    closeMenu("IO")
  }catch(error){alert("Invalid Expression")}
  
}

function buildTree(exp, output){
  if(exp.type == "UnaryExpression"){
    circuit.addGate(random(sideBar.width+50,width-sideBar.width-50), random(height-50), 50, 50, exp.operator)
    circuit.addWire(circuit.gates.at(-1), output)
    buildTree(exp.argument, circuit.gates.at(-1))
  }else if(exp.type == "BinaryExpression"){
    circuit.addGate(random(sideBar.width+50,width-sideBar.width-50), random(height-50), 50, 50, exp.operator)
    var newGate = circuit.gates.at(-1)
    circuit.addWire(newGate, output)
    buildTree(exp.left, newGate)
    buildTree(exp.right, newGate)
  }else if(exp.type == "Identifier"){
    if(!inpMap.has(exp.name)){
      //new input
      if(exp.name.slice(0,3).toUpperCase()=='CLK'){
        circuit.addClock(random(sideBar.width+50,width-sideBar.width-50), random(height-50), 50, 50)
      }else{
        circuit.addInput(random(sideBar.width+50,width-sideBar.width-50), random(height-50), 50, 50, "toggel")
      }
      inpMap.set(exp.name, circuit.inputs.at(-1))
      circuit.addWire(circuit.inputs.at(-1), output)
      return
    }else{
      //existing input
      circuit.addWire(inpMap.get(exp.name), output)
      return
    }
  }
}

function outTT(){

  //set the css of the table
  document.getElementById("outputTruthTable").setAttribute("style", "display:block;")
  var elementStyle = "overflow-y: auto;"
  var style = document.getElementById("ttOut").currentStyle || window.getComputedStyle(document.getElementById("ttOut"))
  elementStyle += " padding: 0 "+style.marginLeft+";"
  elementStyle += " margin: 0;"
  document.getElementById("ttOut").style = elementStyle
  //define referance to the table
  var tab = document.getElementById("outputTruthTable").firstElementChild
  for (var i=tab.rows.length-1; i>0; i--){tab.deleteRow(i)}
  //set the colspan of the input and output headers
  tab.rows[0].firstElementChild.setAttribute("colspan", circuit.inputs.length)
  tab.rows[0].lastElementChild.setAttribute("colspan", circuit.outputs.length)

  //create truth table
  for (var i = 0; i<2**circuit.inputs.length; i++){

    var out = []
    for (var n=0; n<circuit.inputs.length; n++){
      circuit.inputs[n].calcState = ((i>>(circuit.inputs.length-n-1))&1)
    }

    circuit.gates.forEach(gate => gate.updateState())
    circuit.outputs.forEach(output => output.updateState())

    circuit.outputs.forEach(output => out.push(output.state))

    circuit.gates.forEach(gate => gate.update())
    circuit.outputs.forEach(output => output.update())

    //create a table row
    var row = tab.insertRow(tab.rows.length)
    //add the input values to the row
    for (var n=0; n<circuit.inputs.length; n++){
      row.insertCell(n).innerHTML=((i>>(circuit.inputs.length-n-1))&1)
    }
    //add the output values to the row
    for (var n=0; n<circuit.outputs.length; n++){
      row.insertCell(n+circuit.inputs.length).innerHTML=out[n]
    }
  }
}


function genTT(){
  //set the css of the table
  document.getElementById("inputTruthTable").setAttribute("style", "display:block;")
  document.getElementById("ttIn").setAttribute("style", "overflow-y: auto;")
  //define referance to the table
  var tab = document.getElementById("inputTruthTable").firstElementChild
  for (var i=tab.rows.length-1; i>0; i--){tab.deleteRow(i)}

  var inputs = +document.getElementById("ttInps").value
  var outputs = +document.getElementById("ttOuts").value
  //set the colspan of the input and output headers
  tab.rows[0].firstElementChild.setAttribute("colspan", inputs)
  tab.rows[0].lastElementChild.setAttribute("colspan", outputs)

  for (var i = 0; i<2**inputs; i++){
    //create a table row
    var row = tab.insertRow(tab.rows.length)
    //add the input values to the row
    for (var n=0; n<inputs; n++){
      row.insertCell(n).innerHTML = ((i>>(inputs-n-1))&1)
    }
    //add the output values to the row
    for (var n=0; n<outputs; n++){
      var inp = document.createElement("input")
      inp.setAttribute("type", "number")
      inp.setAttribute("max", 1)
      inp.setAttribute("min", 0)
      //restrict values between 0 and 1
      inp.setAttribute("onchange", "this.value = this.value % 2")

      row.insertCell(n+inputs).innerHTML = inp.outerHTML
    }
  }
}

//build the circuit from user truth table
function buildTT(){
 //set referance to table
  var tab = document.getElementById("inputTruthTable").firstElementChild
  var inputs = +tab.rows[0].firstElementChild.outerHTML.match(/colspan=\"(\d+)\"/)[1]
  var outputs = +tab.rows[0].lastElementChild.outerHTML.match(/colspan=\"(\d+)\"/)[1]

  var tt = []
  //loop through each row
  for (var i=1; i<tab.rows.length; i++){
    var out =  []
    //loop through eeach col
    for (var j=inputs; j<inputs+outputs; j++){
      if (tab.rows[i].children[j].firstElementChild.value != ''){
        out.push(+tab.rows[i].children[j].firstElementChild.value)
      }else{
        alert("Please fill in all inputs")
        return
      }        
    }
    tt.push(out)
  }
  tableToCir(tt)
  closeMenu("IO")
}

function tableToCir(tt){
  circuit = new Circuit()
  //add inputs and NOT gates
  for (var i=0; i<Math.log2(tt.length); i++){
    circuit.addInput(random(sideBar.width+50,width-sideBar.width-50), random(height-50), 50, 50, "toggle")
    circuit.addGate(random(sideBar.width+50,width-sideBar.width-50), random(height-50), 50, 50, "NOT")
    circuit.addWire(circuit.inputs.at(-1), circuit.gates.at(-1))
  }
  //add outputs
  for (var i=0; i<tt[0].length; i++){
    circuit.addOutput(random(sideBar.width+50,width-sideBar.width-50), random(height-50), 50, 50)
  }
  //loop through truth table
  for (var i=0; i<tt.length; i++){
    for (var j=0; j<tt[i].length; j++){
      if (tt[i][j] == 1){
        //add AND gate if output is high
        circuit.addGate(random(sideBar.width+50,width-sideBar.width-50), random(height-50), 50, 50, "AND")
        var andGate = circuit.gates.at(-1)
        circuit.addWire(andGate, circuit.outputs[j])
        //connect wire between either Input or NOT and AND gate
        for (var n=0; n<Math.log2(tt.length); n++){
          if((i>>(Math.log2(tt.length)-n-1))&1 == 1){
            circuit.addWire(circuit.inputs[n], andGate)
          }else{
            circuit.addWire(circuit.gates[n], andGate)
          }
        }
      }
    }
  }
}

function outWrt(){

  //define an array of trees
  var trees = []
  //loop through each output
  for (const out of circuit.outputs){
    try{
      errCir = false
      //skip outputs with no inputs
      if(out.inputs.length<1){
        continue
      //for outputs with one input
      }else if(out.inputs.length==1){
        var tree = cirToTree(out.inputs[0])
      //for outputs with >1 inputs
      }else{
        //create a dummy OR gate as for the output
        var tree = cirToTree({type:"OR", inputs:out.inputs})
      }
    }catch(RangeError){
      errCir = true
      alert("Cyclic circuit was skipped")
    }
    //add tree to array if no errors are present in the circuit
    if (!errCir){trees.push(tree)}
  }
  var exp = ""
  for(var tree of trees){exp += ", "+inputNames[trees.indexOf(tree)].toUpperCase()+"="+inOrder(tree)}
  document.getElementById("boolWrtOut").setAttribute("value", exp.slice(2))
}

function outExp(){
  //define an array of trees
  var trees = []
  //loop through each output
  for (const out of circuit.outputs){
    try{
      errCir = false
      //skip outputs with no inputs
      if(out.inputs.length<1){
        continue
      //for outputs with one input
      }else if(out.inputs.length==1){
        var tree = cirToTree(out.inputs[0])
      //for outputs with >1 inputs
      }else{
        //create a dummy OR gate as for the output
        var tree = cirToTree({type:"OR", inputs:out.inputs})
      }
    }catch(RangeError){
      errCir = true
      alert("Cyclic circuit was skipped")
    }
    //add tree to array if no errors are present in the circuit
    if (!errCir){trees.push(tree)}
  }
  
  var exp = ""
  for(var tree of trees){
    exp += ", "+inputNames[trees.indexOf(tree)].toUpperCase()+"="
    if (boolType == "wrt"){exp+=inOrder(pureBool(tree))}
    else{
      exp+=inOrder_symbolic(pureBool(tree))
      i = (boolType=="mech") ? 0:1
      exp = exp.replace(gateRX, x=>wrtToExp.get(x)[i])
    }
  }
  document.getElementById("boolExpOut").setAttribute("value", exp.slice(2))
}

function cirToTree(comp){

  //Unary operators
  if (comp.type == "NOT"){
    return {type:"Unary", comp:comp.type, child:cirToTree(comp.inputs[0])}

  //Binary operators
  }else if (["AND", "OR", "XOR", "NAND", "NOR", "XNOR"].includes(comp.type)){

    //invalid circuit if gate has less than two inputs
    if(comp.inputs.length < 2){
      errCir = true; return

    //for 2 inputs call recursively
    }else if(comp.inputs.length == 2){
      return {type:"Binary", comp:comp.type, left:cirToTree(comp.inputs[0]), right:cirToTree(comp.inputs[1])}

    //for >2 inputs, call recursively with first input and a dummy gate with remaining inputs
    }else{
      var leftNode = cirToTree(comp.inputs[0])
      //create dummy gate
      var compCopy = Object.assign({}, comp)
      //remove first input
      compCopy.inputs.shift()
      return {type:"Binary", comp:comp.type, left:leftNode, right:cirToTree(compCopy)}
    }

  //inputs
  }else{
    //set the type to clock or input depending on component
    const type = (comp.type == 'clock') ? 'Clock' : 'Input' 
    return {type:type, id:circuit.inputs.indexOf(comp)}
  }
}

function inOrder(node){
  if(node.type=="Input"){
    return inputNames[node.id]
  }else if(node.type=="Clock"){
    return 'clk_'+inputNames[node.id]
  }else if(node.type=="Unary"){
    return "("+node.comp+" "+inOrder(node.child)+")"
  }else{
    return "("+inOrder(node.left)+" "+node.comp+" "+inOrder(node.right)+")"
  }
}

function pureBool(node){
  if(node.type=="Input" || node.type=="Clock"){return node}

  if(node.type=="Binary"){
    node.left = pureBool(node.left)
    node.right = pureBool(node.right)

    if(["NAND", "NOR", "XNOR"].includes(node.comp)){
      var nodeCopy = Object.assign({}, node)
      nodeCopy.comp = nodeCopy.comp.replace(/N/, '')
      node.type = "Unary"
      node.comp = "NOT"
      node.child = nodeCopy
    }
    return node
  }

  if(node.type=="Unary"){
    node.child = pureBool(node.child)
    return node
  }
}

function inOrder_symbolic(node){
  //get index of symbol in array from hashmap
  const index = (boolType == "mech") ? 0:1

  if(node.type=="Input"){
    return inputNames[node.id]
  }else if(node.type=="Clock"){
    return 'clk_'+inputNames[node.id]
  }else if(node.type=="Unary"){
    if(index==0){
      //mechanics notation a'
      return inOrder_symbolic(node.child)+node.comp
    }else{
      //logical notation ¬a
      return node.comp+inOrder_symbolic(node.child)
    }
  }else{
    return "("+inOrder_symbolic(node.left)+node.comp+inOrder_symbolic(node.right)+")"
  }
}

function swapCol(img, find, rep){
  img.loadPixels()
  //loop through each pixel
  for(let y=0; y<img.height; y++){
    for(let x=0; x<img.width; x++){
      if(img.get(x,y)[0]==find.levels[0] && img.get(x,y)[1]==find.levels[2] && img.get(x,y)[2]==find.levels[2]){img.set(x,y,rep)}
   }
  }
  img.updatePixels()
}


function setCookie(){
  if(document.cookie != ''){deleteCookies()}
  //create a cookie for the users colour scheme and boolean algebra type
  var c = 'hc='+highColor+';'
  document.cookie = c
  c = 'lc='+lowColor+';'
  document.cookie = c
  c = 'dg='+dragColor+';'
  document.cookie = c
  c = 'bg='+bgColor+';'
  document.cookie = c
  c = 'sb='+sbColor+';'
  document.cookie = c
  c = 'ba='+boolType+';'
  document.cookie = c
}

//a helper function to delete current cookies
function deleteCookies(){
  const cookies = document.cookie.split(';') //set var to array of each part of the cookie
  for(const cookie of cookies){ //loop through array
    const name = (cookie.indexOf("=")>-1) ? cookie.substring(0, cookie.indexOf("=")) : cookie
    //set experation date to epoch so it is removed
    document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT"
  }
}

function defaultSettings(){
  //get temp value of high/low colours
  const _low = lowColor
  const _high = highColor
  //set the default colours
  highColor = "#0000ff"
  lowColor = "#ffffff"
  dragColor = "#969696"
  bgColor = "#333333"
  sbColor = "#aabbcc"
  swapCol(clockImgOff, color(_low), color(lowColor))
  swapCol(clockImgOn, color(_high), color(highColor))
  //set the boolean type
  boolType = "logic"
  //set the HTML values
  setHTML()
  setCookie()
}
//set the html elements to the current expected values
function setHTML(){
  document.getElementById('boolGrams').value = boolType
  document.getElementById('sandBoxCol').value = bgColor
  document.getElementById('highCol').value = highColor
  document.getElementById('lowCol').value = lowColor
  document.getElementById('sideBarCol').value = sbColor
  document.getElementById('sideBar').style.backgroundColor = sbColor
  document.getElementById('dragCol').value = dragColor
}
