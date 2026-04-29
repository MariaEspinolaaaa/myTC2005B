/*
 * Simple implementation of the PONG game
 *
 * María Espínola
 * 2025-03-13
 */

"use strict";

// Global variables
const canvasWidth = 800;
const canvasHeight = 600;

// Context of the Canvas
let ctx;

// A variable to store the game object
let game;

// Variable to store the time at the previous frame
let oldTime = 0;


let inicialspeed = 0.5;
let ballSpeed = 0.5;

let paddleSpeed = 0.5;
let speedIncrease = 1.05;

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
        this.velocity.x= 0;
        this.velocity.y=0;

    }

    serve(){
        let angle = Math.random() * Math.PI /2 - Math.PI  /4;
        this.velocity = new Vector (Math.cos(angle),Math.sin(angle));
        ballSpeed = inicialspeed;

        if(Math.random() > 0.5){
            this.velocity.x *=-1;
        }
        console.log(this.velocity);
    }
}

// Class for the main character in the game
class Paddle extends GameObject {
    constructor(position, width, height, color, sheetCols) {
        super(position, width, height, color, "paddle", sheetCols);
        this.velocity = new Vector(0, 0);

        // Structure with the directions the object can move
        this.motion = {
            up: {
                axis: "y",
                sign: -paddleSpeed,
            },
            down: {
                axis: "y",
                sign: paddleSpeed,
            },
        }

        // Keys pressed to move the player
        this.keys = [];
    }

    update(deltaTime) {
        // Restart the velocity
        this.velocity.x = 0;
        this.velocity.y = 0;
        // Modify the velocity according to the directions pressed
        for (const direction of this.keys) {
            const axis = this.motion[direction].axis;
            const sign = this.motion[direction].sign;
            this.velocity[axis] += sign;
        }
        // TODO: Normalize the velocity to avoid greater speed on diagonals

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

// Class to keep track of all the events and objects in the game
class Game {
    constructor() {
        this.createEventListeners();
        this.initObjects();
        this.scoreleft = 0;
        this.scoreright = 0;

        //Escribe el score 
        this.scorelabelleft = new TextLabel(canvasWidth/4, 100,"40px Arial", "purple");
        this.scorelabelright = new TextLabel(canvasWidth/4 * 3, 100,"40px Arial", "Royalblue");

        this.timelabel = new TextLabel(canvasWidth /2 -30 ,100,"40px Arial", "black")

        //Detect if the game is over 
        this.intplay = false;

        //time limit, minute and a half, is in miliseconds
        this.timeRemeinig = 90000;
    }

    // Create the objects in the game
    initObjects() {
        this.paddleLeft = new Paddle(new Vector(50, canvasHeight / 2), 40, 100, "purple");
        this.paddleRight = new Paddle(new Vector(canvasWidth - 50, canvasHeight / 2), 40, 100, "Royalblue");

        this.ball = new Ball(new Vector(canvasWidth / 2, canvasHeight / 2), 20, 20, "slategrey");

        this.borderTop = new Border(new Vector(canvasWidth/2,0),canvasWidth, 20,"black");
        this.borderBottom = new Border (new Vector(canvasWidth /2, canvasHeight),canvasWidth,20,"black");
        this.borderLeft = new Border (new Vector(0,canvasHeight / 2),20,canvasHeight,"black");
        this.borderRight = new Border (new Vector(canvasWidth,canvasHeight / 2),20,canvasHeight,"black");

        this.actors = [
            this.paddleLeft,
            this.paddleRight,
            this.ball,
            this.borderTop,
            this.borderBottom,
            this.borderLeft,
            this.borderRight
        ];
    }

    draw(ctx) {
        this.scorelabelleft.draw(ctx, `${this.scoreleft}`);
        this.scorelabelright.draw(ctx, `${this.scoreright}`);

        let mins = Math.floor(this.timeRemeinig / 1000 /60);
        let secs = Math.floor(this.timeRemeinig /1000 % 60 );
        this.timelabel.draw(ctx, `${mins}:${secs}`)

        for (let actor of this.actors) {
            actor.draw(ctx);    
        }
    }

    update(deltaTime) {
        //para que termine el juego cuando se acabe el tiempo
        if (this.intplay){
        this.timeRemeinig -= deltaTime;
        if (this.timeRemeinig <= 0){
            this.timeRemeinig =0;
            return;
        }
        }
        // Move the paddles
        this.paddleLeft.update(deltaTime);
        this.paddleRight.update(deltaTime);
        this.ball.update(deltaTime);

        // Check collision against other objects
        if (boxOverlap(this.paddleLeft, this.ball) || boxOverlap(this.paddleRight, this.ball)) {
            this.ball.velocity.x *= -1;
            ballSpeed *= speedIncrease;
        } 

        if (boxOverlap(this.borderTop, this.ball) || boxOverlap(this.borderBottom, this.ball)) {
            this.ball.velocity.y *= -1;
            ballSpeed *= speedIncrease;
        } 

        if (boxOverlap(this.borderLeft,this.ball)){
            this.scoreright += 1;
            this.ball.reset();
            this.intplay = false;
        }

        if (boxOverlap(this.borderRight,this.ball)){
            this.scoreleft += 1;
            this.ball.reset();
            this.intplay = false;
        }
    }

    createEventListeners() {
        window.addEventListener('keydown', (event) => {
            if (event.key == 'w') {
                this.addKey('up', this.paddleLeft);
            } if (event.key == 's') {
                this.addKey('down', this.paddleLeft);
            } if (event.key == 'ArrowUp') {
                this.addKey('up', this.paddleRight);
            } if (event.key == 'ArrowDown') {
                this.addKey('down', this.paddleRight);
            }
            if(event.key == ' '){
                if (!this.intplay){
                    this.ball.serve();
                    this.intplay = true;
                }
            }
        });

        window.addEventListener('keyup', (event) => {
            if (event.key == 'w') {
                this.delKey('up', this.paddleLeft);
            } if (event.key == 's') {
                this.delKey('down', this.paddleLeft);
            } if (event.key == 'ArrowUp') {
                this.delKey('up', this.paddleRight);
            } if (event.key == 'ArrowDown') {
                this.delKey('down', this.paddleRight);
            }
        });
    }

    // Add the key pressed to the 'keys' array of the object sent
    addKey(direction, object) {
        if (!object.keys.includes(direction)) {
            object.keys.push(direction);
        }
    }

    // Remove the key pressed from the 'keys' array of the object sent
    delKey(direction, object) {
        if (object.keys.includes(direction)) {
            object.keys.splice(object.keys.indexOf(direction), 1);
        }
    }
}


// Starting function that will be called from the HTML page
function main() {
    // Get a reference to the object with id 'canvas' in the page
    const canvas = document.getElementById('canvas');
    // Resize the element
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    // Get the context for drawing in 2D
    ctx = canvas.getContext('2d');

    // Create the game object
    game = new Game();

    drawScene(0);
}


// Main loop function to be called once per frame
function drawScene(newTime) {
    // Compute the time elapsed since the last frame, in milliseconds
    let deltaTime = newTime -oldTime;

    // Clean the canvas so we can draw everything again
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    game.update(deltaTime);

    game.draw(ctx);

    oldTime = newTime;
    requestAnimationFrame(drawScene);
}
