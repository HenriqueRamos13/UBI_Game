import p5Types from "p5";

const images: {
  [key: string]: string;
} = {
  wall: "assets/images/wall.png",
};

const loadedImages: {
  [key: string]: p5Types.Image | null;
} = {
  wall: null,
};

const keys = {
  s: 83,
  z: 90,
  x: 88,
  c: 67,
  space: 32,
  left: 37,
  up: 38,
  right: 39,
  down: 40,
};

class Power {
  p5: p5Types;
  x: number = 0;
  y: number = 0;
  width: number = 16;
  height: number = 16;
  powerSpeed: number = 3;
  color: string = "red";
  moved: number = 0;
  maxMoved: number = 150;
  lastDirection: string = "up";

  constructor(p5: p5Types, x: number, y: number) {
    this.p5 = p5;
    this.x = x;
    this.y = y;
  }

  draw(p5: p5Types) {
    if (this.moved >= this.maxMoved) {
      power = null;
      return;
    }

    // the power always move to the top
    // if the arrow key is pressed, the power will move to the direction and still moving to the same way

    if (
      p5.keyIsDown(keys.up) ||
      p5.keyIsDown(keys.down) ||
      p5.keyIsDown(keys.left) ||
      p5.keyIsDown(keys.right)
    ) {
      if (p5.keyIsDown(keys.up)) {
        this.y -= this.powerSpeed;
        this.lastDirection = "up";
      } else if (p5.keyIsDown(keys.down)) {
        this.y += this.powerSpeed;
        this.lastDirection = "down";
      } else if (p5.keyIsDown(keys.left)) {
        this.x -= this.powerSpeed;
        this.lastDirection = "left";
      } else if (p5.keyIsDown(keys.right)) {
        this.x += this.powerSpeed;
        this.lastDirection = "right";
      }
    } else {
      // Se nenhuma tecla for pressionada, o movimento continuará na mesma direção
      if (this.lastDirection === "up") {
        this.y -= this.powerSpeed;
      } else if (this.lastDirection === "down") {
        this.y += this.powerSpeed;
      } else if (this.lastDirection === "left") {
        this.x -= this.powerSpeed;
      } else if (this.lastDirection === "right") {
        this.x += this.powerSpeed;
      }
    }

    this.moved += this.powerSpeed;

    // draw an circle to represent the power
    //  do not change the player color, only the power color
    p5.fill(this.color);
    p5.circle(this.x, this.y, this.width);
  }
}

class Player {
  p5: p5Types;
  playerSpeed: number = 16;
  movementDelay: number = 150;
  lastMoveTime: number = 0;
  x: number = 0;
  y: number = 0;
  width: number = 16;
  height: number = 16;

  constructor(p5: p5Types, x: number, y: number) {
    this.p5 = p5;
    this.x = x;
    this.y = y;
  }

  handleMovement = (p5: p5Types, key: number, dx: number, dy: number) => {
    if (
      p5.keyIsDown(key) &&
      p5.millis() - this.lastMoveTime > this.movementDelay
    ) {
      if (!verifyCollision(p5, this.x + dx, this.y + dy)) {
        this.x += dx;
        this.y += dy;
        this.lastMoveTime = p5.millis();
      }
    }
  };

  draw(p5: p5Types) {
    this.handleMovement(p5, keys.z, -this.playerSpeed, 0);
    this.handleMovement(p5, keys.c, this.playerSpeed, 0);
    this.handleMovement(p5, keys.s, 0, -this.playerSpeed);
    this.handleMovement(p5, keys.x, 0, this.playerSpeed);

    if (p5.keyIsDown(keys.space)) {
      if (!power) {
        launchPower(p5);
      }
    }

    p5.fill("blue");
    p5.rect(this.x, this.y, this.width, this.height);
  }
}

let player: Player | null = null;

const verifyCollision = (p5: p5Types, x: number, y: number) => {
  // verify if the char in inside the canvas

  if (x < 0 || x > p5.width - player!.width) {
    return true;
  }

  if (y < 0 || y > p5.height - player!.height) {
    return true;
  }

  return false;
};

var power: Power | null = null;

const launchPower = (p5: p5Types) => {
  power = new Power(p5, player!.x, player!.y);
};

const draw = (p5: p5Types) => {
  p5.background(100);
  if (Object.keys(images).find((key) => !loadedImages[key])) {
    Object.keys(images).forEach((key) => {
      const image = images[key];
      loadedImages[key] = p5.loadImage(image);
    });
  }

  if (player) {
    player.draw(p5);
  } else {
    player = new Player(p5, 16, 16);
  }

  if (power) {
    power.draw(p5);
  }
};

export default draw;
