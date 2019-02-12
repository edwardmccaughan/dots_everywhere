import { MidiController } from '../midi'
import { RealKeyboard } from '../real_keyboard'
import { Dot } from './dot'
import { LinesManager } from './lines_manager'

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
    
    // TODO: figure out how to have lines and dots never draw on top of eachother :-/
    this.lines_manager.update()
    this.key_data.forEach(key => key.update())
  }


  prefill_key_data(){
    const number_of_keys = 127
    this.key_data = []
    // TODO: I think I only need 88. Although maybe extras look nice
    for(var n=0; n< number_of_keys; n++) {
      this.key_data.push(new Dot(n, this))
    }
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