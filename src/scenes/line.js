export class Line {
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
      if(this.dot_a.physics_object.x > this.dot_a.physics_object.x) {
        window.scene.graphics.lineGradientStyle(3, this.dot_a.color, this.dot_b.color, this.dot_a.color, this.dot_b.color)
      } else {
        window.scene.graphics.lineGradientStyle(3, this.dot_b.color, this.dot_a.color, this.dot_b.color, this.dot_a.color)
      }

      window.scene.graphics.beginPath();
      window.scene.graphics.moveTo(this.dot_a.physics_object.x, this.dot_a.physics_object.y);
      window.scene.graphics.lineTo(this.dot_b.physics_object.x, this.dot_b.physics_object.y);
      window.scene.graphics.closePath();
      window.scene.graphics.strokePath();
      this.pressed_fadeout_time--
    }


  }

}