export class Dot {
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

    // something is weird with how the image, the setCircle and the x/y coords work. 
    this.physics_object.setScale(0.1)

    this.color = Phaser.Display.Color.HSLToColor(Math.random(),0.75,0.4).color;

  }

  update(){
    this.find_closest_neighbours()

    if(!this.is_pressed && this.recentness > 0 ){
      this.recentness--
    }
    if(this.recentness > 0) {
      window.scene.graphics.fillStyle(this.color, 1);
    } else {  
      window.scene.graphics.fillStyle(0x444444, 1);
    }
    window.scene.graphics.fillCircle(this.physics_object.x, this.physics_object.y, this.radius)
  }

  pressed() {
    this.is_pressed = true
    this.recentness = 6
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
}