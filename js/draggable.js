//This will be a top level class that all components that have drag and drop capabilities will inherit from

class Draggable{
  
  constructor(x,y,w,h){
    this.pos = createVector(x,y) // a vector of the position
    this.w = w // the width of the comp
    this.h = h // the height of the comp
    this.offset = createVector(0,0) // the intital offset is 0
    this.dragging = false
  }
  
  //a function that returns a bool dependant on whether the mouse is over the comp
  mouseOver(){
    let {x,y} = transformMouse()
    return x > this.pos.x && x < this.pos.x + this.w && y > this.pos.y && y < this.pos.y + this.h
  }
  
  //a function that is run each frame and updates the position of the comp
  updatePos(){
    if (this.dragging){
      let {x,y} = transformMouse()
      let s = 1/(1+zoom*zoomSF)
      
      //copy the value of the position if we need to reset it
      var oldPos = Object.assign({}, this.pos)
      
      this.pos.x = this.offset.x + x
      this.pos.y = this.offset.y + y
      
      //check if component is overlapping any others
      for (let compB of [...circuit.gates,...circuit.inputs,...circuit.outputs]){
        if(overlap(this, compB) && compB!=this){this.pos = Object.assign({}, oldPos)}
      }
      
      //ensure the component doesnt go off-screen
      if (this.pos.x < (1-s)*width*0.5){this.pos.x = (1-s)*width*0.5}
      if (this.pos.y < (1-s)*height*0.5){this.pos.y = (1-s)*height*0.5}
      if (this.pos.x + this.w > (1+s)*width*0.5){this.pos.x = (1+s)*width*0.5 - this.w}
      if (this.pos.y + this.h > (1+s)*height*0.5){this.pos.y = (1+s)*height*0.5 - this.h}
    }
  }
  
  //a function run when the component is clicked on
  pressed(){
    if (this.mouseOver()){
      let {x,y} = transformMouse()
      //set the offset to the position the mouse is over the comp
      this.offset.x = this.pos.x - x
      this.offset.y = this.pos.y - y
      this.dragging = true
    }
  }
  
  //a function run when the mouse is depressed
  released(){
    this.dragging = false
  }
}

//a function to translate the mouse position to the zoomed position
function transformMouse(){
  var s = 1/(1+zoom*zoomSF) //define the scale factor
  var x = s*(mouseX-width/2) + width/2
  var y = s*(mouseY-height/2) + height/2
  return {x,y}
}