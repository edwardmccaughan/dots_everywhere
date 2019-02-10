import { MidiController } from '../midi'
import { RealKeyboard } from '../real_keyboard'

class KeyDot {
  constructor(key_number, scene) {
    this.key_number = key_number
    // this.point = new Phaser.Math.Vector2(
    //   Math.random() * window.innerWidth,
    //   Math.random() * window.innerHeight)
    //this.direction = Math.random() * 360

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
    // this.point.add(new Phaser.Math.Vector2(0,0).setToPolar(Phaser.Math.DegToRad(this.direction), this.speed))
    

    var t0 = performance.now();
    this.find_closest_neighbours()
    var t1 = performance.now();
    // console.log("Call tooko doSomething took " + (t1 - t0) + " milliseconds.")

    window.scene.graphics.fillStyle(0x00ffff, 1);
    window.scene.graphics.fillCircle(this.physics_object.x, this.physics_object.y, this.radius)
  }

  link_within_radius() {


  }


  find_closest_neighbours() {
    var self = this
    this.sorted_dots = scene.key_data.slice().sort((dot_a, dot_b) => {
      const dist_to_a = Phaser.Math.Distance.Squared(
        self.physics_object.x,
        self.physics_object.y, 
        dot_a.physics_object.x,
        dot_a.physics_object.y
      )
      const dist_to_b =  Phaser.Math.Distance.Squared(
        self.physics_object.x,
        self.physics_object.y, 
        dot_b.physics_object.x,
        dot_b.physics_object.y
        )
      // console.log(dist_to_a - dist_to_b)
      return (dist_to_a - dist_to_b)
      // return (dist_to_b - dist_to_a)
      // return (this.key_number - dot_a.key_number) - (this.key_number - dot_b.key_number)
    })

    this.sorted_dots.slice(1, 5).forEach((dot) =>{
      window.scene.graphics.lineStyle(1, 0x222222, 1);

      window.scene.graphics.beginPath();
      window.scene.graphics.moveTo(this.physics_object.x, this.physics_object.y);
      window.scene.graphics.lineTo(dot.physics_object.x, dot.physics_object.y);
      window.scene.graphics.closePath();
      window.scene.graphics.strokePath();
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

    


    new MidiController( (key) => { this.key_down(key) }, (key) => { this.key_up(key)} )
    new RealKeyboard( (key) => { this.key_down(key) }, (key) => { this.key_up(key)} )
  }

  update() {
    this.graphics.clear()
    
    this.key_data.forEach(key => key.update())

    // window.first_dot.find_closest_neighbours()
    // this.draw_dots()
  }


  prefill_key_data(){
    this.key_data = []
    window.key_data = this.key_data
    for(var n=0; n< 127; n++) {
    // for(var n=0; n< 15; n++) {
      this.key_data.push(new KeyDot(n, this))
    }
    window.first_dot = this.key_data[0]
  }

  // draw_dots() {
  //   this.graphics.lineStyle(1, 0x00ffff, 1);
  //   this.key_data.forEach((key) => { 
  //     this.graphics.strokeCircle(key.point.x, key.point.y, 4)
  //   })

  // }

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