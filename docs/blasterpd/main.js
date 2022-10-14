title = "BLASTER POINT DEFENSE";

description = ` Shoot down the missiles!
`;

characters = [
`
  ll
  ll
ccllcc
ccllcc
ccllcc
cc  cc
`,`
  y
 yyy
 lll
 lll
 lll
 rrr
`

];

// Game design variable container
const G = {
  WIDTH: 150,
	HEIGHT: 150,
  PLAYER_FIRE_RATE: 12,
  FBULLET_SPEED: 2,
  MISSILE_MIN_BASE_SPEED: 0.1,
  MISSILE_MAX_BASE_SPEED: 0.15
};

options = {
  viewSize: {x: G.WIDTH, y: G.HEIGHT},
  isCapturing: true,
  isCapturingGameCanvasOnly: true,
  captureCanvasScale: 2,
  seed: 8,
  isPlayingBgm: true,
  isReplayEnabled: true
};

/**
 * @typedef {{
 * pos: Vector,
 * firingCooldown: number,
 * angle: number,
 * rotation: number,
 * rotationSpeed: number
 * }} Player
 */

/**
 * @type { Player }
 */
let player;

/**
 * @typedef {{
 * pos: Vector,
 * angle: number
 * }} FBullet
 */

/**
 * @type { FBullet [] }
 */
let fBullets;

/**
 * @typedef {{
 * pos: Vector
 * }} Missile
 */

/**
 * @type { Missile [] }
 */
let missiles;

/**
 * @type { number }
 */
 let currentMissileSpeed;

 /**
  * @type { number }
  */
 let waveCount;

 /**
  * @type { number }
  */
  let damage;

  /**
  * @type { number }
  */
   let blastSize;

   /**
  * @type { number }
  */
    let chargePower;

function update() {
  if (!ticks) {
    player = {
      pos: vec(G.WIDTH * 0.5, G.HEIGHT * 0.9),
      firingCooldown: G.PLAYER_FIRE_RATE,
      angle: 0,
      rotation: 0,
      rotationSpeed: 0.01
  };

  fBullets = [];
  missiles =[];

  damage = 0;
  blastSize = 0;
  chargePower = 0;
  waveCount = 0;
  }


  if (missiles.length === 0) {
    currentMissileSpeed =
        rnd(G.MISSILE_MIN_BASE_SPEED, G.MISSILE_MAX_BASE_SPEED) * difficulty;
    for (let i = 0; i < 9; i++) {
        const posX = rnd(0, G.WIDTH);
        const posY = -rnd(i * G.HEIGHT * 0.1);
        missiles.push({
            pos: vec(posX, posY), 
        });
    }

    waveCount++; // Increase the tracking variable by one
}

  // Cooling down for the next shot
  player.firingCooldown--;
  //Charging shot
  if (player.firingCooldown <= 0 && input.isPressed) {
    chargePower += 0.1;
    color("red");
    text("CHARGING", G.WIDTH * 0.1, G.HEIGHT * 0.9);
  }
  // Time to fire the next shot
  if (player.firingCooldown <= 0 && input.isJustReleased) {
      blastSize = 2 + chargePower;
      chargePower = 0;
      // Create the bullet
      fBullets.push({
          pos: vec(player.pos.x, player.pos.y),
          angle: player.rotation*PI/2 - PI/2
      });
      // Reset the firing cooldown
      player.firingCooldown = G.PLAYER_FIRE_RATE;

      color("red");
      play("laser");
      // Generate particles
      particle(
          player.pos.x, // x coordinate
          player.pos.y, // y coordinate
          4, // The number of particles
          1, // The speed of the particles
          player.rotation*PI/2 - PI/2, // The emitting angle
          PI/4  // The emitting width
      );
  }

  // Updating and drawing bullets
  fBullets.forEach((fb) => {
    // Move the bullets in the direction of player rotation
    const velocityVector = vec(G.FBULLET_SPEED, 0).rotate(fb.angle);
        fb.pos.add(velocityVector);
    
    // Drawing
    color("red");
    box(fb.pos, blastSize);
});

remove(missiles, (m) => {
  m.pos.y += currentMissileSpeed;

  color("black");
  // Interaction from enemies to fBullets
  // Shorthand to check for collision against another specific type
  // Also draw the sprites
  const isCollidingWithFBullets = char("b", m.pos).isColliding.rect.red;
  color("yellow");
      // Generate particles
      particle(
          m.pos.x, // x coordinate
          m.pos.y, // y coordinate
          1, // The number of particles
          1, // The speed of the particles
          -PI/2, // The emitting angle
          PI/4  // The emitting width
      );
  
  if (isCollidingWithFBullets) {
      color("yellow");
      particle(m.pos);
      play("explosion");
      addScore(10 * waveCount, m.pos);
  }

  //Check if missile has passed player
  if (m.pos.y > G.HEIGHT) {
    damage++;
    color("yellow");
      particle(m.pos);
      play("explosion");
    if(damage > 4) {
      //End game
      end();
    }
  }
  
  // Also another condition to remove the object
  return (isCollidingWithFBullets || m.pos.y > G.HEIGHT);
});

remove(fBullets, (fb) => {
  // Interaction from fBullets to enemies, after enemies have been drawn
  color("red");
  const isCollidingWithEnemies = box(fb.pos, blastSize).isColliding.char.b;
  return (isCollidingWithEnemies || fb.pos.y < 0);
});

  if(player.rotation > 1 || player.rotation < -1){
    player.rotationSpeed *= -1;
  }
  player.rotation += player.rotationSpeed;
  color ("black");
  char("a", player.pos, {rotation: player.rotation});
}
