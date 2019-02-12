import { Line } from './line'

export class LinesManager {
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
    this.lines[this.keyname(dot_a,dot_b)].active()
  }

  update() {
    Object.keys(this.lines).forEach((key) => this.lines[key].update())
  }

}