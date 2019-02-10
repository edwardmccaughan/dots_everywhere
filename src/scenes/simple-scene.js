import { MidiController } from '../midi'
import { RealKeyboard } from '../real_keyboard'

class Line {
  constructor(dot_a, dot_b) {
    this.start_ttl = 350
    this.dot_a = dot_a
    this.dot_b = dot_b
  }

  active(){
    this.ttl = this.start_ttl
  }

  update() {
    if(this.ttl > 0){
      window.scene.graphics.lineStyle(1, 0xffffff, 1 * (this.ttl / this.start_ttl));
      window.scene.graphics.beginPath();
      window.scene.graphics.moveTo(this.dot_a.physics_object.x, this.dot_a.physics_object.y);
      window.scene.graphics.lineTo(this.dot_b.physics_object.x, this.dot_b.physics_object.y);
      window.scene.graphics.closePath();
      window.scene.graphics.strokePath();
      
      this.ttl--
    }

  }

}

class LinesManager {
  constructor() {
    this.lines = {}
  }

  set_line_active(dot_a, dot_b) {
    const keyname = [dot_a.key_number, dot_b.key_number].sort().toString()

    this.lines[keyname] = new Line(dot_a,dot_b)
    this.lines[keyname].active()
    // this.lines[keyname] = {
    //   dot_a: dot_a,
    //   dot_b: dot_b,
    //   ttl: this.start_ttl
    // }
  }

  update() {
    Object.keys(this.lines).forEach((key) => { 
      const line = this.lines[key]
     line.update()
      // if(line.ttl > 0){
      //   window.scene.graphics.lineStyle(1, 0xffffff, 1 * (line.ttl / this.start_ttl));
      //   window.scene.graphics.beginPath();
      //   window.scene.graphics.moveTo(line.dot_a.physics_object.x, line.dot_a.physics_object.y);
      //   window.scene.graphics.lineTo(line.dot_b.physics_object.x, line.dot_b.physics_object.y);
      //   window.scene.graphics.closePath();
      //   window.scene.graphics.strokePath();
        
      //   line.ttl--
      // }
    })
  }


}


class KeyDot {
  constructor(key_number, scene) {
    this.key_number = key_number

    this.radius = 4

    this.physics_object = scene.physics.add.image(
      Math.random() * window.innerWidth,
      Math.random() * window.innerHeight,
      'red_dot'
    );
    this.physics_object.setCircle(this.radius);
    this.physics_object.setCollideWorldBounds(true);
    this.physics_object.setBounce(1);
    this.physics_object.setVelocity( // technically I want everything going at the same speed, but in a random direction?
      0 + Math.random() * 30,
      0 + Math.random() * 30
    );

    this.physics_object.setVisible(false)

  }

  update(){
    this.find_closest_neighbours()
    window.scene.graphics.fillStyle(0x00ffff, 1);
    window.scene.graphics.fillCircle(this.physics_object.x, this.physics_object.y, this.radius)
  }



  distance_to(other_dot){

    return Phaser.Math.Distance.Squared(
        this.physics_object.x,
        this.physics_object.y, 
        other_dot.physics_object.x,
        other_dot.physics_object.y
      )
  }

  find_closest_neighbours() {
    this.sorted_dots = scene.key_data.slice().sort((dot_a, dot_b) => {
      return this.distance_to(dot_a) - this.distance_to(dot_b)
    })

    // this means we're drawing each line twice
    // which also means we draw over the dot a bit
    // maybe a better way is to create a big list of pairs and then draw them all at the end
    // maybe then links could also have a fadeout
    this.sorted_dots.slice(1, 5).forEach((dot) =>{
      window.scene.lines_manager.set_line_active(this, dot)
    })
  }

  draw() {
  }
}


export class SimpleScene extends Phaser.Scene {
  preload() {
    this.load.image('red_dot', 'assets/red_dot.png');
    this.load.image('blue_dot', 'assets/blue_dot.png');

  }

  create() {
    window.scene = this
    this.graphics = this.add.graphics()
    this.pressed_keys = []
    this.prefill_key_data()

    this.lines_manager = new LinesManager()

    new MidiController( (key) => { this.key_down(key) }, (key) => { this.key_up(key)} )
    new RealKeyboard( (key) => { this.key_down(key) }, (key) => { this.key_up(key)} )
  }

  update() {
    this.graphics.clear()
    
    this.lines_manager.update()
    this.key_data.forEach(key => key.update())
  }


  prefill_key_data(){
    this.key_data = []
    // window.key_data = this.key_data
    for(var n=0; n< 127; n++) {
    // for(var n=0; n< 15; n++) {
      this.key_data.push(new KeyDot(n, this))
    }
    // window.first_dot = this.key_data[0]
  }

  key_down(key) { 
    this.key_data[key].pressed()

    this.pressed_keys.push(key)
    console.log(this.pressed_keys)
  }

  key_up(key) {
    this.key_data[key].released()
    this.pressed_keys = this.pressed_keys.filter(item => item !== key)
    console.log(this.pressed_keys)
  }
}