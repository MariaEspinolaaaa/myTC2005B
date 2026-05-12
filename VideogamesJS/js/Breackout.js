/*
 * Simple implementation of the PONG game
 *
 * María Espínola
 * 2026-03-13
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
        this.velocity.x= 0;
        this.velocity.y=0;

    }

    serve() {
        let angle = Math.PI / 4 + Math.random() * Math.PI / 2;
        
        this.velocity = new Vector(Math.cos(angle), Math.sin(angle));
        ballSpeed = inicialspeed;

        if (Math.random() > 0.5) {
            this.velocity.x *= -1;
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
            left: {
                axis: "x",
                sign: -paddleSpeed,
            },
            right: {
                axis: "x",
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

        this.score = 0;
        this.level = 1;
        this.lives = 3;
        this.initObjects();

        //Escribe el score 
        this.scorelabel = new TextLabel(canvasWidth/6, canvasHeight-10 ,"12px Arial", "black");
        this.levellabel = new TextLabel(canvasWidth/6 +canvasWidth/6,canvasHeight-10,"12px Arial","black");
        this.liveslabel = new TextLabel(canvasWidth/6 + canvasWidth/6 *2,canvasHeight-10,"12px Arial","black");

        this.timelabel = new TextLabel(canvasWidth/6 + canvasWidth/6 *3,canvasHeight-10,"12px Arial","black");

        this.timeactual =0;
        this.intplay = false;

        this.finishlabel = new TextLabel(canvasWidth/5,canvasHeight/2,"80px Arial","red");

        this.ping=document.createElement("audio");
        this.ping.src = "../assets/audio/4387__noisecollector__pongblipe4.wav";
        this.fall=document.createElement("audio");
        this.fall.src = "../assets/audio/350980__cabled_mess__lose_c_08.wav"
        
    }

    // Create the objects in the game
    initObjects() {
        let colorBloque;
        if (this.level == 1) {
            colorBloque = "green";
        } else if (this.level == 2) {
            colorBloque = "orange";
        } else if (this.level == 3) {
            colorBloque = "red";
        }

        this.paddle = new Paddle(new Vector(canvasWidth /2, canvasHeight-50), 100, 10, "purple");
        //level 1
        this.block1= new Block(new Vector(canvasWidth/2,40),80,20,colorBloque);
        this.block2= new Block(new Vector(canvasWidth/2 +100,40),80,20,colorBloque);
        this.block3= new Block(new Vector(canvasWidth/2 +200,40),80,20,colorBloque);
        this.block4= new Block(new Vector(canvasWidth/2 +300,40),80,20,colorBloque);
        this.block5= new Block(new Vector(canvasWidth/2 -100,40),80,20,colorBloque);
        this.block6= new Block(new Vector(canvasWidth/2 -200,40),80,20,colorBloque);
        this.block7= new Block(new Vector(canvasWidth/2 -300,40),80,20,colorBloque);

        this.block1_1= new Block(new Vector(canvasWidth/2,80),80,20,colorBloque);
        this.block2_1= new Block(new Vector(canvasWidth/2 +100,80),80,20,colorBloque);
        this.block3_1= new Block(new Vector(canvasWidth/2 +200,80),80,20,colorBloque);
        this.block4_1= new Block(new Vector(canvasWidth/2 +300,80),80,20,colorBloque);
        this.block5_1= new Block(new Vector(canvasWidth/2 -100,80),80,20,colorBloque);
        this.block6_1= new Block(new Vector(canvasWidth/2 -200,80),80,20,colorBloque);
        this.block7_1= new Block(new Vector(canvasWidth/2 -300,80),80,20,colorBloque);

        this.block1_2= new Block(new Vector(canvasWidth/2,120),80,20,colorBloque);
        this.block2_2= new Block(new Vector(canvasWidth/2 +100,120),80,20,colorBloque);
        this.block3_2= new Block(new Vector(canvasWidth/2 +200,120),80,20,colorBloque);
        this.block4_2= new Block(new Vector(canvasWidth/2 +300,120),80,20,colorBloque);
        this.block5_2= new Block(new Vector(canvasWidth/2 -100,120),80,20,colorBloque);
        this.block6_2= new Block(new Vector(canvasWidth/2 -200,120),80,20,colorBloque);
        this.block7_2= new Block(new Vector(canvasWidth/2 -300,120),80,20,colorBloque);

        //level 2
        this.block1_3= new Block(new Vector(canvasWidth/2,160),80,20,colorBloque);
        this.block2_3= new Block(new Vector(canvasWidth/2 +100,160),80,20,colorBloque);
        this.block3_3= new Block(new Vector(canvasWidth/2 +200,160),80,20,colorBloque);
        this.block4_3= new Block(new Vector(canvasWidth/2 +300,160),80,20,colorBloque);
        this.block5_3= new Block(new Vector(canvasWidth/2 -100,160),80,20,colorBloque);
        this.block6_3= new Block(new Vector(canvasWidth/2 -200,160),80,20,colorBloque);
        this.block7_3= new Block(new Vector(canvasWidth/2 -300,160),80,20,colorBloque);

        //level 3
        this.block1_4= new Block(new Vector(canvasWidth/2,200),80,20,colorBloque);
        this.block2_4= new Block(new Vector(canvasWidth/2 +100,200),80,20,colorBloque);
        this.block3_4= new Block(new Vector(canvasWidth/2 +200,200),80,20,colorBloque);
        this.block4_4= new Block(new Vector(canvasWidth/2 +300,200),80,20,colorBloque);
        this.block5_4= new Block(new Vector(canvasWidth/2 -100,200),80,20,colorBloque);
        this.block6_4= new Block(new Vector(canvasWidth/2 -200,200),80,20,colorBloque);
        this.block7_4= new Block(new Vector(canvasWidth/2 -300,200),80,20,colorBloque);

        this.ball = new Ball(new Vector(canvasWidth / 2 , canvasHeight / 2 +80), 15, 15, "slategrey");

        this.borderTop = new Border(new Vector(canvasWidth/2,0),canvasWidth, 20,"black");
        this.borderBottom = new Border (new Vector(canvasWidth /2, canvasHeight),canvasWidth,10,"black");
        this.borderLeft = new Border (new Vector(0,canvasHeight / 2),20,canvasHeight,"black");
        this.borderRight = new Border (new Vector(canvasWidth,canvasHeight / 2),20,canvasHeight,"black");

        this.actors = [
            this.paddle,
            this.ball,
            this.borderTop,
            this.borderBottom,
            this.borderLeft,
            this.borderRight,

            this.block1,
            this.block2,
            this.block3,
            this.block4,
            this.block5,
            this.block6,
            this.block7,

            this.block1_1,
            this.block2_1,
            this.block3_1,
            this.block4_1,
            this.block5_1,
            this.block6_1,
            this.block7_1,

            this.block1_2,
            this.block2_2,
            this.block3_2,
            this.block4_2,
            this.block5_2,
            this.block6_2,
            this.block7_2,

        ];

        if (this.level == 2){
            this.actors.push(
                this.block1_3,
                this.block2_3,
                this.block3_3,
                this.block4_3,
                this.block5_3,
                this.block6_3,
                this.block7_3,
            )
        }
        if (this.level == 3){
            this.actors.push( 
                this.block1_4,
                this.block2_4,
                this.block3_4,
                this.block4_4,
                this.block5_4,
                this.block6_4,
                this.block7_4,
            )
        }
    }

    draw(ctx) {

        this.scorelabel.draw(ctx, `Blocks:${this.score}`);
        this.levellabel.draw(ctx,`Level:${this.level}`);
        this.liveslabel.draw(ctx,`Lives:${this.lives}`);

        let mins = Math.floor(this.timeactual/ 1000 /60);
        let secs = Math.floor(this.timeactual /1000 % 60 );
        this.timelabel.draw(ctx, `Time in game ${mins}:${secs}`);

        for (let actor of this.actors) {
            actor.draw(ctx);    
        }
    }

    update(deltaTime) {
        //para que termine el juego cuando se acabe el tiempo
        if (this.lives <= 0){
            this.timeactual =0;
            this.finishlabel.draw(ctx,`GAME OVER`);
        }

        if (boxOverlap(this.borderBottom, this.ball) ) {
            this.fall.play();
        }

        this.paddle.update(deltaTime);
        this.ball.update(deltaTime);

        if (this.intplay) {
            this.timeactual += deltaTime;
        }

        // Check collision against other objects
        if (boxOverlap(this.paddle, this.ball) ) {
            this.ball.velocity.x += (Math.random() - 0.5) * 0.5;
            this.ball.velocity.y *= -1;
            ballSpeed *= speedIncrease;
            this.ping.play();
        } 

        if (boxOverlap(this.borderTop, this.ball)) {
            this.ball.velocity.x *= -1;
            this.ball.velocity.y *= -1;
            ballSpeed *= speedIncrease;
            this.ping.play();
        } 

        if (boxOverlap(this.borderLeft, this.ball)|| boxOverlap(this.borderRight, this.ball)) {
            this.ball.velocity.x *= -1;
            ballSpeed *= speedIncrease;
            this.ping.play();
        } 

        if (boxOverlap(this.borderBottom,this.ball)){
            this.ball.reset();
            this.intplay = false;
            this.lives -=1;
        }

        for (let i = 0; i < this.actors.length; i++) {
            let actor = this.actors[i];
            
            if (actor.type == "block") {
                actor.update(deltaTime);
                
                if (boxOverlap(actor, this.ball)) {
                    this.ball.velocity.y *= -1;
                    this.score++;
                    this.ping.play();

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
            this.ball.reset();
            this.intplay = false;
            this.initObjects(); 
        }
            
    }

    createEventListeners() {
        window.addEventListener('keydown', (event) => {
             if (event.key == 'a') {
                this.addKey('left', this.paddle);
            } if (event.key == 'd') {
                this.addKey('right', this.paddle);
            }
            
            if(event.key == ' '){
                if (!this.intplay){
                    this.ball.serve();
                    this.intplay = true;
                }
            }
            
        });

        window.addEventListener('keyup', (event) => {
            if (event.key == 'a') {
                this.delKey('left', this.paddle);
            } if (event.key == 'd') {
                this.delKey('right', this.paddle);
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
    let deltaTime = newTime - oldTime;

    // Clean the canvas so we can draw everything again
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    game.update(deltaTime);

    game.draw(ctx);

    oldTime = newTime;
    requestAnimationFrame(drawScene);
}