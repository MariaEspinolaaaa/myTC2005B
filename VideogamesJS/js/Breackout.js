"use strict";

const canvasWidth = 800;
const canvasHeight = 600;

let ctx;
let game;
let oldTime = 0;

let inicialspeed = 0.2;
let ballSpeed = 0.2;
let paddleSpeed = 0.5;
let speedIncrease = 1.05;

class Block extends GameObject{
    constructor(position, width, height, color, sheetCols) {
        super(position, width, height, color, "block", sheetCols);
        this.velocity = new Vector(0, 0);
    }
    update(deltaTime){
        this.updateCollider();
    }
}

class Ball extends GameObject{
    constructor(position, width, height, color, sheetCols) {
        super(position, width, height, color, "Ball", sheetCols);
        this.velocity = new Vector(0, 0);
    }
    update(deltaTime){
        this.position = this.position.plus(this.velocity.times(ballSpeed).times(deltaTime));
        this.updateCollider();
    }
    reset(){
        this.position.x = canvasWidth/2;
        this.position.y = canvasHeight/2;
        this.velocity.x = 0;
        this.velocity.y = 0;
    }
    serve() {
        let angle = Math.PI / 4 + Math.random() * Math.PI / 2;
        this.velocity = new Vector(Math.cos(angle), -Math.sin(angle));
        ballSpeed = inicialspeed;
        if (Math.random() > 0.5) {
            this.velocity.x *= -1;
        }
    }
}

class Paddle extends GameObject {
    constructor(position, width, height, color, sheetCols) {
        super(position, width, height, color, "paddle", sheetCols);
        this.velocity = new Vector(0, 0);
        this.motion = {
            left: { axis: "x", sign: -paddleSpeed },
            right: { axis: "x", sign: paddleSpeed },
        }
        this.keys = [];
    }
    update(deltaTime) {
        this.velocity.x = 0;
        this.velocity.y = 0;
        for (const direction of this.keys) {
            const axis = this.motion[direction].axis;
            const sign = this.motion[direction].sign;
            this.velocity[axis] += sign;
        }
        this.position = this.position.plus(this.velocity.times(deltaTime));
        this.clampWithinCanvas();
        this.updateCollider();
    }
    clampWithinCanvas() {
        if (this.position.y < 0) {
            this.position.y = 0;
        } else if (this.position.y + this.height > canvasHeight) {
            this.position.y = canvasHeight - this.height;
        } else if (this.position.x < 0) {
            this.position.x = 0;
        } else if (this.position.x + this.width > canvasWidth) {
            this.position.x = canvasWidth - this.width;
        }
    }
}

class Border extends GameObject{
    constructor(position, width, height, color, sheetCols) {
        super(position, width, height, color, "Ball", sheetCols);
    }
    update(deltaTime){
        this.updateCollider();
        this.clampWithinCanvas();
    }
}

class Game {
    constructor() {
        this.createEventListeners();
        this.score = 0;
        this.level = 1;
        this.lives = 3;
        this.initObjects();

        this.scorelabel = new TextLabel(canvasWidth/6, canvasHeight-10, "12px Arial", "black");
        this.levellabel = new TextLabel(canvasWidth/6 + canvasWidth/6, canvasHeight-10, "12px Arial", "black");
        this.liveslabel = new TextLabel(canvasWidth/6 + canvasWidth/6 * 2, canvasHeight-10, "12px Arial", "black");
        this.timelabel = new TextLabel(canvasWidth/6 + canvasWidth/6 * 3, canvasHeight-10, "12px Arial", "black");

        this.timeactual = 0;
        this.intplay = false;

        this.finishlabel = new TextLabel(canvasWidth/5, canvasHeight/2, "80px Arial", "red");

        this.ping = document.createElement("audio");
        this.ping.src = "../assets/audio/4387__noisecollector__pongblipe4.wav";
        this.fall = document.createElement("audio");
        this.fall.src = "../assets/audio/350980__cabled_mess__lose_c_08.wav";
    }

    initObjects() {
        let colorBloque;
        if (this.level == 1) {
            colorBloque = "green";
        } else if (this.level == 2) {
            colorBloque = "orange";
        } else if (this.level == 3) {
            colorBloque = "red";
        }

        this.ball2activa = false;

        this.paddle = new Paddle(new Vector(canvasWidth/2, canvasHeight-50), 100, 10, "purple");

        this.blockraro = new Block(new Vector(canvasWidth/2, 40), 80, 20, "yellow");
        this.block2 = new Block(new Vector(canvasWidth/2 + 100, 40), 80, 20, colorBloque);
        this.block3 = new Block(new Vector(canvasWidth/2 + 200, 40), 80, 20, colorBloque);
        this.block4 = new Block(new Vector(canvasWidth/2 + 300, 40), 80, 20, colorBloque);
        this.block5 = new Block(new Vector(canvasWidth/2 - 100, 40), 80, 20, colorBloque);
        this.block6 = new Block(new Vector(canvasWidth/2 - 200, 40), 80, 20, colorBloque);
        this.block7 = new Block(new Vector(canvasWidth/2 - 300, 40), 80, 20, colorBloque);

        this.block1_1 = new Block(new Vector(canvasWidth/2, 80), 80, 20, colorBloque);
        this.block2_1 = new Block(new Vector(canvasWidth/2 + 100, 80), 80, 20, colorBloque);
        this.block3_1 = new Block(new Vector(canvasWidth/2 + 200, 80), 80, 20, colorBloque);
        this.block4_1 = new Block(new Vector(canvasWidth/2 + 300, 80), 80, 20, colorBloque);
        this.block5_1 = new Block(new Vector(canvasWidth/2 - 100, 80), 80, 20, colorBloque);
        this.block6_1 = new Block(new Vector(canvasWidth/2 - 200, 80), 80, 20, colorBloque);
        this.block7_1 = new Block(new Vector(canvasWidth/2 - 300, 80), 80, 20, colorBloque);

        this.block1_2 = new Block(new Vector(canvasWidth/2, 120), 80, 20, colorBloque);
        this.block2_2 = new Block(new Vector(canvasWidth/2 + 100, 120), 80, 20, colorBloque);
        this.block3_2 = new Block(new Vector(canvasWidth/2 + 200, 120), 80, 20, colorBloque);
        this.block4_2 = new Block(new Vector(canvasWidth/2 + 300, 120), 80, 20, colorBloque);
        this.block5_2 = new Block(new Vector(canvasWidth/2 - 100, 120), 80, 20, colorBloque);
        this.block6_2 = new Block(new Vector(canvasWidth/2 - 200, 120), 80, 20, colorBloque);
        this.block7_2 = new Block(new Vector(canvasWidth/2 - 300, 120), 80, 20, colorBloque);

        this.block1_3 = new Block(new Vector(canvasWidth/2, 160), 80, 20, colorBloque);
        this.block2_3 = new Block(new Vector(canvasWidth/2 + 100, 160), 80, 20, colorBloque);
        this.block3_3 = new Block(new Vector(canvasWidth/2 + 200, 160), 80, 20, colorBloque);
        this.block4_3 = new Block(new Vector(canvasWidth/2 + 300, 160), 80, 20, colorBloque);
        this.block5_3 = new Block(new Vector(canvasWidth/2 - 100, 160), 80, 20, colorBloque);
        this.block6_3 = new Block(new Vector(canvasWidth/2 - 200, 160), 80, 20, colorBloque);
        this.block7_3 = new Block(new Vector(canvasWidth/2 - 300, 160), 80, 20, colorBloque);

        this.block1_4 = new Block(new Vector(canvasWidth/2, 200), 80, 20, colorBloque);
        this.block2_4 = new Block(new Vector(canvasWidth/2 + 100, 200), 80, 20, colorBloque);
        this.block3_4 = new Block(new Vector(canvasWidth/2 + 200, 200), 80, 20, colorBloque);
        this.block4_4 = new Block(new Vector(canvasWidth/2 + 300, 200), 80, 20, colorBloque);
        this.block5_4 = new Block(new Vector(canvasWidth/2 - 100, 200), 80, 20, colorBloque);
        this.block6_4 = new Block(new Vector(canvasWidth/2 - 200, 200), 80, 20, colorBloque);
        this.block7_4 = new Block(new Vector(canvasWidth/2 - 300, 200), 80, 20, colorBloque);

        this.ball = new Ball(new Vector(canvasWidth/2, canvasHeight/2 + 80), 15, 15, "slategrey");
        this.ball2 = new Ball(new Vector(canvasWidth/2, canvasHeight/2 + 80), 15, 15, "orange");

        this.borderTop = new Border(new Vector(canvasWidth/2, 0), canvasWidth, 20, "black");
        this.borderBottom = new Border(new Vector(canvasWidth/2, canvasHeight), canvasWidth, 10, "black");
        this.borderLeft = new Border(new Vector(0, canvasHeight/2), 20, canvasHeight, "black");
        this.borderRight = new Border(new Vector(canvasWidth, canvasHeight/2), 20, canvasHeight, "black");

        this.actors = [
            this.paddle,
            this.ball,
            this.borderTop,
            this.borderBottom,
            this.borderLeft,
            this.borderRight,
            this.blockraro,
            this.block2, this.block3, this.block4, this.block5, this.block6, this.block7,
            this.block1_1, this.block2_1, this.block3_1, this.block4_1, this.block5_1, this.block6_1, this.block7_1,
            this.block1_2, this.block2_2, this.block3_2, this.block4_2, this.block5_2, this.block6_2, this.block7_2,
        ];

        if (this.level >= 2) {
            this.actors.push(
                this.block1_3, this.block2_3, this.block3_3, this.block4_3, this.block5_3, this.block6_3, this.block7_3
            );
        }
        if (this.level >= 3) {
            this.actors.push(
                this.block1_4, this.block2_4, this.block3_4, this.block4_4, this.block5_4, this.block6_4, this.block7_4
            );
        }
    }

    draw(ctx) {
        this.scorelabel.draw(ctx, `Blocks:${this.score}`);
        this.levellabel.draw(ctx, `Level:${this.level}`);
        this.liveslabel.draw(ctx, `Lives:${this.lives}`);

        let mins = Math.floor(this.timeactual / 1000 / 60);
        let secs = Math.floor(this.timeactual / 1000 % 60);
        this.timelabel.draw(ctx, `Time in game ${mins}:${secs}`);

        for (let actor of this.actors) {
            actor.draw(ctx);
        }
    }

    update(deltaTime) {
        if (this.lives <= 0) {
            this.timeactual = 0;
            this.finishlabel.draw(ctx, `GAME OVER`);
            return;
        }

        this.paddle.update(deltaTime);
        this.ball.update(deltaTime);

        if (this.ball2activa) {
            this.ball2.update(deltaTime);
        }

        if (this.intplay) {
            this.timeactual += deltaTime;
        }

        if (boxOverlap(this.paddle, this.ball)) {
            this.ball.velocity.x += (Math.random() - 0.5) * 0.5;
            this.ball.velocity.y *= -1;
            ballSpeed *= speedIncrease;
            this.ping.play();
        }
        if (boxOverlap(this.borderTop, this.ball)) {
            this.ball.velocity.x *= -1;
            this.ball.velocity.y *= -1;
            this.ping.play();
        }
        if (boxOverlap(this.borderLeft, this.ball) || boxOverlap(this.borderRight, this.ball)) {
            this.ball.velocity.x *= -1;
            this.ping.play();
        }
        if (boxOverlap(this.borderBottom, this.ball)) {
            this.fall.play();
            this.ball.reset();
            this.intplay = false;
            this.lives -= 1;
        }

        if (this.ball2activa) {
            if (boxOverlap(this.paddle, this.ball2)) {
                this.ball2.velocity.x += (Math.random() - 0.5) * 0.5;
                this.ball2.velocity.y *= -1;
                this.ping.play();
            }
            if (boxOverlap(this.borderTop, this.ball2)) {
                this.ball2.velocity.x *= -1;
                this.ball2.velocity.y *= -1;
                this.ping.play();
            }
            if (boxOverlap(this.borderLeft, this.ball2) || boxOverlap(this.borderRight, this.ball2)) {
                this.ball2.velocity.x *= -1;
                this.ping.play();
            }
            if (boxOverlap(this.borderBottom, this.ball2)) {
                this.ball2.reset();
                this.ball2activa = false;
                let newActors = [];
                for (let j = 0; j < this.actors.length; j++) {
                    if (this.actors[j] !== this.ball2) {
                        newActors.push(this.actors[j]);
                    }
                }
                this.actors = newActors;
            }
        }

        for (let i = 0; i < this.actors.length; i++) {
            let actor = this.actors[i];
            if (actor.type == "block") {
                actor.update(deltaTime);

                let golpeo = false;
                let balaQueGolpeo = null;

                if (boxOverlap(actor, this.ball)) {
                    golpeo = true;
                    balaQueGolpeo = this.ball;
                } else if (this.ball2activa && boxOverlap(actor, this.ball2)) {
                    golpeo = true;
                    balaQueGolpeo = this.ball2;
                }

                if (golpeo) {
                    balaQueGolpeo.velocity.y *= -1;
                    this.score++;
                    this.ping.play();

                    if (actor === this.blockraro && !this.ball2activa) {
                        this.ball2activa = true;
                        this.ball2.serve();
                        this.actors.push(this.ball2);
                    }

                    let newActors = [];
                    for (let j = 0; j < this.actors.length; j++) {
                        if (this.actors[j] !== actor) {
                            newActors.push(this.actors[j]);
                        }
                    }
                    this.actors = newActors;
                    break;
                }
            }
        }

        let bloquesSobrantes = 0;
        for (let i = 0; i < this.actors.length; i++) {
            if (this.actors[i].type == "block") {
                bloquesSobrantes++;
            }
        }

        if (bloquesSobrantes == 0) {
            this.level++;
            if (this.level > 3) {
                this.finishlabel.draw(ctx, "YOU WIN");
                return;
            }
            this.ball.reset();
            this.intplay = false;
            this.initObjects();
        }
    }

    createEventListeners() {
        window.addEventListener('keydown', (event) => {
            if (event.key == 'a') { this.addKey('left', this.paddle); }
            if (event.key == 'd') { this.addKey('right', this.paddle); }
            if (event.key == ' ') {
                if (!this.intplay) {
                    this.ball.serve();
                    this.intplay = true;
                }
            }
        });

        window.addEventListener('keyup', (event) => {
            if (event.key == 'a') { this.delKey('left', this.paddle); }
            if (event.key == 'd') { this.delKey('right', this.paddle); }
        });
    }

    addKey(direction, object) {
        if (!object.keys.includes(direction)) {
            object.keys.push(direction);
        }
    }

    delKey(direction, object) {
        if (object.keys.includes(direction)) {
            object.keys.splice(object.keys.indexOf(direction), 1);
        }
    }
}

function main() {
    const canvas = document.getElementById('canvas');
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    ctx = canvas.getContext('2d');
    game = new Game();
    drawScene(0);
}

function drawScene(newTime) {
    let deltaTime = newTime - oldTime;
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    game.update(deltaTime);
    game.draw(ctx);
    oldTime = newTime;
    requestAnimationFrame(drawScene);
}
