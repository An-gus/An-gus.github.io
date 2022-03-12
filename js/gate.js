//define hashmap for the gate images
let gateImg = new Map()
//define radius of wire circle
let R=5
//define the function of each gate
let funcs = new Map()
funcs.set("AND",(inps)=>{return inps.reduce((a,b)=>a&b)})
funcs.set("OR",(inps)=>{return inps.reduce((a,b)=>a|b)})
funcs.set("XOR",(inps)=>{return inps.reduce((a,b)=>a^b)})
funcs.set("NOT",(inps)=>{return +!inps[0]})
funcs.set("NAND",(inps)=>{return +!inps.reduce((a,b)=>a&b)})
funcs.set("NOR",(inps)=>{return +!inps.reduce((a,b)=>a|b)})
funcs.set("XNOR",(inps)=>{return +!inps.reduce((a,b)=>a^b)})


//a general class for gate components
class Gate extends Draggable{
  constructor(x, y, w, h, type, maxInputs=10){
    super(x,y,w,h) //initialise the draggable object
    this.inputs = [] //create an array for inputs to the gate
    this.outputs = [] //create an array for outputs to the gate
    this.maxInputs = maxInputs //have a maximum num of inputs such as 1 for NOT
    this.type = type //define the gate type such as "AND"
    this.state = 0 //set the state of the gate to 0 (low)
    this.calcState = null //store the calculated state so it doesnt need to be re calculated in the same frame
  }
  
  //update the state of the gate depending on the inputs to it and its type
  updateState(){
    if (this.calcState == null){
      
      //initailly set calcState to the current state to allow for multi-comp short circuits
      this.calcState = this.state
      
      //first update all of the input nodes
      let inps = []
      for (let i=0; i<this.inputs.length; i++){
        if (this.inputs[i]!=this){
        
          if (this.inputs[i].calcState != null){
            inps.push(this.inputs[i].calcState)
          }
          else{
            this.inputs[i].updateState()
            inps.push(this.inputs[i].state)
          }
        
        }else{inps.push(this.state)}
      }
      //then update this node using the states of its inputs
      this.state = (this.inputs.length>0) ? funcs.get(this.type)(inps) : this.state
      this.calcState = this.state
    }
  }
  
  //add a wire from this gate to another
  wireFrom(){
    let {x,y} = transformMouse()
    if (!wireDrag && (x-(this.pos.x+this.w+R))**2 + (y-(this.pos.y+this.h/2))**2 <= R*R){
      wireDrag = true
      compFrom = this
    }
  }
  
  //add wire to this gate from another
  wireTo(){
    let {x,y} = transformMouse()
    if (wireDrag && (x-(this.pos.x-R))**2 + (y-(this.pos.y+this.h/2))**2 <= R*R && this.inputs.length < this.maxInputs){
      wireDrag = false
      circuit.addWire(compFrom, this)
      compFrom = null
    }
  }
  
  //a function called on right clicking
  rightMouse(){
    if (this.mouseOver()){circuit.delGate(this)}
  }
  
  //display the gate
  show(){
    image(gateImg.get(this.type), this.pos.x, this.pos.y, this.w, this.h)
    fill(255)
    circle(this.pos.x-R, this.pos.y+this.h/2, 2*R)
    circle(this.pos.x+this.w+R, this.pos.y+this.h/2, 2*R)
  }
  
  //the function called each frame that updates all parts of the gate
  update(){
    this.updatePos()
    this.show()
    this.calcState = null
  }
}