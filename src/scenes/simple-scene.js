import { MidiController } from '../midi'
import { RealKeyboard } from '../real_keyboard'

class Line {
  constructor(dot_a, dot_b) {
    this.fade_out_duration = 350
    this.fade_in_duration = 50
    this.pressed_fadeout_duration = 10 
    this.dot_a = dot_a
    this.dot_b = dot_b

    this.fade_in_time = 0
    this.fade_out_time = 0
    this.pressed_fadeout_time = 0
  }

  active(){
    if(this.fade_out_time == 0) {
      this.fade_in_time = this.fade_in_duration     
    }
    this.fade_out_time = this.fade_out_duration


    
  }

  update() {
    // TODO: de-duplicate this...
    if(this.fade_in_time > 0) {
      window.scene.graphics.lineStyle(1, 0x444444, 1 - 1 * (this.fade_in_time / this.fade_in_duration));
      window.scene.graphics.beginPath();
      window.scene.graphics.moveTo(this.dot_a.physics_object.x, this.dot_a.physics_object.y);
      window.scene.graphics.lineTo(this.dot_b.physics_object.x, this.dot_b.physics_object.y);
      window.scene.graphics.closePath();
      window.scene.graphics.strokePath();

      this.fade_in_time--
    } else if(this.fade_out_time > 0){
      window.scene.graphics.lineStyle(1, 0x444444, 1 * (this.fade_out_time / this.fade_out_duration));
      window.scene.graphics.beginPath();
      window.scene.graphics.moveTo(this.dot_a.physics_object.x, this.dot_a.physics_object.y);
      window.scene.graphics.lineTo(this.dot_b.physics_object.x, this.dot_b.physics_object.y);
      window.scene.graphics.closePath();
      window.scene.graphics.strokePath();
      
      this.fade_out_time--
    }

    if((this.dot_a.recentness > 0) && (this.dot_b.recentness > 0)) {
      this.pressed_fadeout_time = this.pressed_fadeout_duration     
    }

    if(this.pressed_fadeout_time > 0){
      window.scene.graphics.lineStyle(1, 0xff0000, 1 * (this.pressed_fadeout_time / this.pressed_fadeout_duration));
      window.scene.graphics.beginPath();
      window.scene.graphics.moveTo(this.dot_a.physics_object.x, this.dot_a.physics_object.y);
      window.scene.graphics.lineTo(this.dot_b.physics_object.x, this.dot_b.physics_object.y);
      window.scene.graphics.closePath();
      window.scene.graphics.strokePath();
      this.pressed_fadeout_time--
    }


  }

}

class LinesManager {
  constructor() {
    this.lines = {}

    this.prefill_lines()
  }

  prefill_lines(){
    const dots = window.scene.key_data
    for(var x=0; x< dots.length; x++) {
      for(var y= x+1; y< dots.length; y++){
        const dot_a = dots[x]
        const dot_b = dots[y]
        const keyname = [x,y].sort().toString()
        this.lines[keyname] = new Line(dot_a,dot_b)
      }
    }
  }

  keyname(dot_a, dot_b) {
    return [dot_a.key_number, dot_b.key_number].sort().toString()
  }

  set_line_active(dot_a, dot_b) {
    // if(this.lines[keyname] == undefined) {
    //   this.lines[keyname] = new Line(dot_a,dot_b)
    // }
    this.lines[this.keyname(dot_a,dot_b)].active()
  }

  update() {
    Object.keys(this.lines).forEach((key) => this.lines[key].update())
  }

}


class Dot {
  constructor(key_number, scene) {
    this.key_number = key_number
    
    this.is_pressed = false
    this.recentness = 0

    this.radius = 4

    this.physics_object = scene.physics.add.image(
      Math.random() * window.innerWidth,
      Math.random() * window.innerHeight,
      'red_dot'
    );
    this.physics_object.setCircle(this.radius);
    this.physics_object.setCollideWorldBounds(true);
    this.physics_object.setBounce(1);
    this.physics_object.setVelocity(
      0 + (Math.random() - 0.5) * 30,
      0 + (Math.random() - 0.5) * 30
    );

    this.physics_object.setVisible(false)

  }

  update(){
    this.find_closest_neighbours()

    if(!this.is_pressed && this.recentness > 0 ){
      this.recentness--
      // console.log(this.recentness)
    }
    if(this.is_pressed) {
      window.scene.graphics.fillStyle(0xff0000, 1);
    } else {  
      window.scene.graphics.fillStyle(0x00ffff, 1);
    }
    window.scene.graphics.fillCircle(this.physics_object.x, this.physics_object.y, this.radius)
  }

  pressed() {
    this.is_pressed = true
    this.recentness = 10 //100
    // console.log('pressed', this.key_number, this.point.x)
  }

  released() {
    this.is_pressed = false
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

    this.lines_manager = new LinesManager(this.key_data.length)

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
      this.key_data.push(new Dot(n, this))
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