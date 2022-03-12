//define a class for input components
class Input extends Draggable{
  constructor(x,y,w,h,type){
    super(x,y,w,h) //initialse the draggable class
    this.outputs = [] //define an array for the outputs
    this.type = type //defines the type of the input
    this.state = 0 //define the state of the input
    this.calcState = null
    this.delay = 0
  }
  
  //update the state of the button
  updateState(){
    //update for push buttons
    if (this.type == "push"){
      this.state = (this.dragging) ? 1 : 0
    //update for toggle buttons
    }else if(this.delay<=0){
      this.state = (this.dragging) ? +!this.state : this.state
      this.delay = +this.dragging*40
    }
    this.calcState = this.state
  }
  
  //add a wire from this input to another comp
  wireFrom(){
    let {x,y} = transformMouse()
    if (!wireDrag && (x-(this.pos.x+this.w+R))**2 + (y-(this.pos.y+this.h/2))**2 <= R*R){
      wireDrag = true
      compFrom = this
    }
  }
  
  //a function called on right clicking
  rightMouse(){
    if (this.mouseOver()){circuit.delInput(this)}
  }
    
  show(){
    textAlign(CENTER,CENTER)
    fill(255)
    rect(this.pos.x, this.pos.y, this.w, this.h)
    circle(this.pos.x+this.w+R, this.pos.y+this.h/2, 2*R)
    fill(0)
    stroke(5)
    text(this.state,this.pos.x+this.w/2,this.pos.y+this.h/2)
  }
  
  update(){
    this.delay--
    this.updatePos()
    this.show()
    this.calcState = null
  }
}