//a circuit class that stores data about all of the components
class Circuit {
  constructor() {
    this.gates = []; //stores all the gates in the circuit
    this.inputs = []; //stores all the inputs in the circuit
    this.outputs = []; //stores all the outputs in the circuit
    this.wires = []; //stores all the wires in the circuit

    //this.clocks = []; //store all the clocks in the circuit
  }

  //add a new gate to the circuit by creating a gate and addding it to the gate list
  addGate(x, y, w, h, type, maxInputs=10) {
    this.gates.push(new Gate(x, y, w, h, type, maxInputs));
  }

  //add a new output to the circuit
  addOutput(x, y, w, h) {
    this.outputs.push(new Output(x, y, w, h));
  }

  //add a new output to the circuit
  addInput(x, y, w, h, type) {
    this.inputs.push(new Input(x, y, w, h, type));
  }

  //add a new clock to the circut
  addClock(x,y,w,h){
    this.inputs.push(new Clock(x,y,w,h))
    //this.clocks.push(this.inputs.at(-1))
  }

  //add wires between compnents
  addWire(compA, compB) {
    if (!compB.maxInputs || compB.inputs.length < compB.maxInputs){
      this.wires.push([compA, compB]); //add the wire to the list of wires
      compA.outputs.push(compB); //add compB as an output of compA
      compB.inputs.push(compA); //add compA as an input of compB
    }
  }
  
  //delete a gate
  delGate(gate){
    
    //remove any wires which include the gate
    for (var i=0; i<this.wires.length; i++){
      if (this.wires[i].includes(gate)){
        this.wires.splice(i,1)
        i--
      }
    }
    
    //remove the gate from all its inputs and the correspnding wires
    gate.inputs.forEach(comp => comp.outputs.splice(comp.outputs.indexOf(gate),1))
    
    //remove the gate from all its outputs and corresponding wires
    gate.outputs.forEach(comp => comp.inputs.splice(comp.inputs.indexOf(gate),1))
    
    //remove gate from the circuit
    this.gates.splice(this.gates.indexOf(gate),1)
  }
  
  //delete a input
  delInput(inp){
    
    //remove any wires which include the input
    for (var i=0; i<this.wires.length; i++){
      if (this.wires[i].includes(inp)){
        this.wires.splice(i,1)
        i--
      }
    }    
    //remove the input from all its outputs and corresponding wires
    inp.outputs.forEach(comp => comp.inputs.splice(comp.inputs.indexOf(inp),1))
    
    //remove gate from the circuit
    this.inputs.splice(this.inputs.indexOf(inp),1)
  }
  
  //delete a gate
  delOutput(out){
    
    //remove any wires which include the gate
    for (var i=0; i<this.wires.length; i++){
      if (this.wires[i].includes(out)){
        this.wires.splice(i,1)
        i--
      }
    }
    
    //remove the gate from all its inputs and the correspnding wires
    out.inputs.forEach(comp => comp.outputs.splice(comp.outputs.indexOf(out),1))

    //remove output from the circuit
    this.outputs.splice(this.outputs.indexOf(out),1)
  }
}

//display wires on the screen
function displayWire(wire) {
  push();
  var col = (wire[0].state == 1) ? highColor : lowColor
  strokeWeight(5);
  stroke(col);
  line(
    wire[0].pos.x + wire[0].w + R,
    wire[0].pos.y + wire[0].h / 2,
    wire[1].pos.x - R,
    wire[1].pos.y + wire[1].h / 2
  );
  pop();
}

function overlap(compA, compB) {
  return !(
    compA.pos.x > compB.pos.x + compB.w ||
    compA.pos.x + compA.w < compB.pos.x ||
    compA.pos.y > compB.pos.y + compB.h ||
    compA.pos.y + compA.h < compB.pos.y
  );
}
