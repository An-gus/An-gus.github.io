//define a output class
class Output extends Draggable{
  constructor(x,y,w,h){
    super(x,y,w,h)
    this.state = 0 //the state of the output
    this.inputs = [] //the list of inputs to the output
  }
  
  //update the state of the output
  updateState(){
    //initially loop through each node that inputs to it and update its state
    let inps = []
    for (let i=0; i<this.inputs.length; i++){
      
      if (this.inputs[i].calcState != null){
        inps.push(this.inputs[i].calcState)
      }
      else{
        this.inputs[i].updateState()
        inps.push(this.inputs[i].state)
      }
    }
    //then update this node using the states of its inputs
    this.state = (this.inputs.length>0) ? funcs.get("OR")(inps) : 0
  }
  
  //a function called on right clicking
  rightMouse(){
    if (this.mouseOver()){circuit.delOutput(this)}
  }
  
  
  //add wire to this output from another comp
  wireTo(){
    let {x,y} = transformMouse()
    if (wireDrag && (x-(this.pos.x-R))**2 + (y-(this.pos.y+this.h/2))**2 <= R*R){
      wireDrag = false
      circuit.addWire(compFrom, this)
      compFrom = null
    }
  }
  
  //display the output
  show(){
    textAlign(CENTER,CENTER)
    fill(255)
    rect(this.pos.x, this.pos.y, this.w, this.h)
    circle(this.pos.x-R, this.pos.y+this.h/2, 2*R)
    fill(0)
    stroke(5)
    text(this.state,this.pos.x+this.w/2,this.pos.y+this.h/2)
  }
  
  //the function called each frame that updates all parts of the output
  update(){
    this.updatePos()
    this.show()
  }
}