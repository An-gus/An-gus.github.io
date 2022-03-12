let defaultPause = 100
let minSpeed = 10
//a class for clocks, as clocks will be used as inputs they extend the input class
class Clock extends Input{

    constructor(x,y,w,h){
      super(x,y,w,h,'')
      this.type = 'clock'
      this.pause = defaultPause
    }

  //update the state of the clock
  updateState(){
    if (this.calcState == null){
      this.state = (frameCount%this.pause==0) ? +!this.state : this.state
      this.calcState = this.state
    }
  } 

  //display the clock
  show(){
    fill(255)
    rect(this.pos.x, this.pos.y, this.w, this.h)
    circle(this.pos.x+this.w+R, this.pos.y+this.h/2, 2*R)

    var img = (this.state==1) ? clockImgOn : clockImgOff
    
    image(img, this.pos.x, this.pos.y, this.w, this.h)
  }

  //called when centre mouse button is pressed on the clock
  centreMouse(){
    if (this.mouseOver()){
      //prompt user for speed and remove any non-digits
      let nSpeed = prompt('Set clock speed',''+this.pause).replace(/[^0-9]/g,'')
      //set the clocks pause to the new speed if its valid
      this.pause = (nSpeed == null || nSpeed == "" || +nSpeed<minSpeed) ? this.pause : +nSpeed
    }
  }

}