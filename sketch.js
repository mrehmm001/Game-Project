let colour="#0000c8";
let renderFractalTree = true;
document.querySelector("#body").addEventListener("change",(e)=>{
    colour= e.target.value.toString();
})
document.querySelector("#fractaltree").addEventListener("change",(e)=>{
    renderFractalTree=e.target.checked;
})
let branchMovementOffset=0;
let angle = 0.5;
let branchLengthChange = 0.7;
let strokeThicknessChange = 5;


/*

The Game Project 5 - Bring it all together

*/

/*
Name: Muneeb Rehman
For my extension, I have added a main menu which consists of two options, “Start game” and “How to play”, I thought this would’ve been a unique addition as most games have a main menu. The “How to play” option is a useful feature as it gives instructions to whom ever is playing the game straight away which is good as it avoids having them spending some time figuring out the controls, albeit, the game is fairly simple, so controls are fairly simple as well. 

I have also added sound effects to the game, e.g when you’re jumping, landing. The addition of sound really does add atmosphere to the game, and enhances the overall gameplay feeling.

I then added enemies to the mix to spice up the game difficulty, these enemies are sentinels, they originated from an unknown galaxy to invade to Earth, it’s best t avoid them otherwise they’ll kill your game character! 

To add even more atmosphere to the game, I decided to add a dynamic day night cycle to the game. The cycle’s duration is approximately 5 minutes. When it gets dark, I’ve added a layer that darkens all the colours of the background including the character, so gameplay during the nighttime is a bit daunting as visibility is significantly decreased.

Overall, with the addition of this extension helped me more knowledge about P5JS. I learnt and understood how to load sound and play them. I also got a more depth understanding on object oriented programming.
*/

var gameChar_x;
var gameChar_y;
var floorPos_y;
var trees_x;
var treePos_y;
var isLeft=false;
var isRight=false;
var isFalling=false;
var isPlumeting=false;

var collectable;
var canyon;
var mountain;
var cloud;
var landscape;
var landscapeColour;

var gravity=0.5;
var jumpHeight=10;
var velocity=jumpHeight;


var x=3;
var angleA=0;
var DirA=0.03;
var DirB=-0.03;
var angleB=0;


/*Day night cylce variables*/
var theta;
var speed;
var lowest=0;
var highest=0;
var y=0;

var stars=[];
var canyons=[];
var collectables=[];
var clouds=[];

/*Game mechanic variabls*/
var game_score=0;
var lives=5;
var flagpole;
var death=false;
var helpMenu=false;
var playGame=false;

/*Sound variables*/
var jumpSound;
var backgroundSound;
var backgroundMusic;
var landOnFloorSound;

/*Enemy variables*/

var enemy_angleA=0;
var enemyDirA=0.01;
var enemyDirB=-0.01;
var enemy_angleB=0;

var socket;


var enemyX=[{x:1080,walkRange:1000, walkRangeB:1000},{x:4467,walkRange:200, walkRangeB:200},{x:5297,walkRange:400, walkRangeB:400},{x:7490,walkRange:200, walkRangeB:200},{x:8177,walkRange:500, walkRangeB:500},{x:7490,walkRange:200, walkRangeB:200},{x:3989,walkRange:500, walkRangeB:500},{x:3047,walkRange:500, walkRangeB:500}];


let onlinePlayers = {};
let hash = (Math.random()*100).toString(32);
heartSymbol=null;

function preload()
{
    soundFormats('mp3','wav');    
    //load your sounds here
    jumpSound = loadSound('assets/jump.wav');
    jumpSound.setVolume(0.1);
    
    landOnFloorSound=loadSound('assets/landing.wav');
    landOnFloorSound.setVolume(0.1);

    heartSymbol = loadImage('assets/hearts.png');
    
}



function setup()
{
    r = height * 4;//This console the sun/moon distance from the centre
    
	createCanvas(1024, 576);
    staticObjects();//This variable will keep the mountains, trees, clouds and the star count the same everytime, is only changed if the game is refreshed by the browser.
	startGame();
    textFont("VT323");
    socket = io();
 
}

function draw()
{
    heartSymbol.resize(20,20);   
	dayNightCycle() // I decided to add a day-night cycle to my game because why not?
    
    mainMenu();
    
    noStroke();
	// Draw happy little clouds. //
    drawCloud();

	// Draw mountains.
    drawMountain();
    
    // draw some ground
    drawGround();
    
    //To show lives and score
    drawLives();
    
    
    
    push();
    translate(scrollPos,0);
	// Draw happy little trees.
    drawTree()
    if(renderFractalTree){
        drawFractalTree(512,431);
    }

   
    //Flag
    renderFlagPole();
    
    
	// Draw canyons.
    for (var i=0;i<canyons.length;i++){
        drawCanyon(canyons[i]);
        checkCanyon(canyons[i]);
    }
 

	// Draw collectable items.
    for (var i=0; i<collectables.length;i++){
        drawCollectable(collectables[i]);
        checkCollectable(collectables[i]);
    }
    
    noStroke();
    for(var i=0; i<enemyX.length;i++){
        var enemyMob= new enemy(enemyX[i].x, floorPos_y,i);
        enemyMob.rotation();
        enemyMob.drawEnemy(enemyX[i].walkRange);
        
        if (dist(gameChar_world_x,gameChar_y,enemyX[i].x,floorPos_y)<=20){
            death=true;
            break; 
        }
    }
    

    
    

    
    
    pop();       
	// Draw game character.
	noStroke();
	drawGameChar();
    //constructor(x,y,moveLeft,moveRight,jumping)
    socket.emit("renderPlayer",{ID:hash,x:gameChar_x-scrollPos,y:gameChar_y,isMovingLeft:isLeft,isMovingRight:isRight,isJumping:isFalling,shirtColour:colour});
    socket.on("renderPlayers",({ID,x,y,isMovingLeft,isMovingRight,isJumping,shirtColour})=>{
        onlinePlayers[ID] = {x:x,y:y,isMovingLeft:isMovingLeft,isMovingRight:isMovingRight,isJumping:isJumping,shirtColour:shirtColour};
    })

    for(let player in onlinePlayers){
        let {x,y,isMovingLeft,isMovingRight,isJumping,shirtColour} = onlinePlayers[player];
        onlinePlayer = new gameChar(x+scrollPos,y,isMovingLeft,isMovingRight,isJumping,shirtColour);
        onlinePlayer.renderCharacter();
    }


    socket.on("clearAllPlayers",()=>{
        onlinePlayers={};
    });
    

    
    var MenuOptions=new mainMenu;
    MenuOptions.gameMenu();
    
    //Game over
    gameOver();
   
    
    //Game won
    gameWon();



	// Logic to make the game character move or the background scroll.
	if(isLeft)
	{
		if(gameChar_x > width * 0.2)
		{
			gameChar_x -= 5;
		}
		else
		{
			scrollPos += 5;
		}
	}

	if(isRight)
	{
		if(gameChar_x < width * 0.8)
		{
			gameChar_x  += 5;
		}
		else
		{
			scrollPos -= 5; // negative for moving against the background
		}
	}


	// Update real position of gameChar for collision detection.
	gameChar_world_x = gameChar_x - scrollPos;
    
    
    //Adds a dark overlay for night times
    fill(0,0,0,map(y,-224.9998269069373,224.9999990513131,100,0));
    rect(0,0,width,height);
    

}

// ---------------------
// Key control functions
// ---------------------

function keyPressed()
{   
    if(flagpole.isReached && key == ' ')
    {
        nextLevel();
        return
    }
    else if(lives == 0 && key == ' ')
    {
        returnToStart();
        return
    }
    
    
	if (keyCode==39|| keyCode==68){
        isRight=true;
    }
    if (keyCode==37|| keyCode==65){
        isLeft=true;
    }
    if (keyCode==32 && gameChar_y==floorPos_y|| keyCode==38&& gameChar_y==floorPos_y||keyCode==87&& gameChar_y==floorPos_y){
        isFalling=true;
        jumpSound.play();
    }
    
}

function keyReleased()
{
     
	if (keyCode==39 || keyCode==68){
        isRight=false;
    }
    if (keyCode==37 || keyCode==65){
        isLeft=false;
    }
    
    
}

// ------------------------------
// Game character render function
// ------------------------------

// Function to draw the game character.
function drawGameChar()
{
	// draw game character
    if(isRight && isFalling){
        if(gameChar_x < width * 0.8)
		{

			jumpingRight();
            gameChar_y-=velocity;
            velocity-=gravity;            
            gameChar_x+=1
            if (gameChar_y>floorPos_y && death==false){
                gameChar_y=floorPos_y;
                velocity=jumpHeight;
                if(!isPlumeting){
                    landOnFloorSound.play();
                }
                isFalling=false;
            }
		}
		else
		{
            jumpingRight();
            gameChar_y-=velocity;
            velocity-=gravity;
            scrollPos -= 1;
            if (gameChar_y>floorPos_y && death==false){
                gameChar_y=floorPos_y;
                velocity=jumpHeight;
                if(!isPlumeting){
                    landOnFloorSound.play();
                }
                isFalling=false;
            }
			
		}
             
    }else if(isLeft && isFalling){
        if(gameChar_x > width * 0.2)
		{
            jumpingLeft();
            gameChar_y-=velocity;
            velocity-=gravity;
            gameChar_x-=1;
            if (gameChar_y>floorPos_y && death==false){
                gameChar_y=floorPos_y;
                velocity=jumpHeight;
                if(!isPlumeting){
                    landOnFloorSound.play();
                }
                isFalling=false;
            }

		}
		else
		{
            jumpingLeft();
            gameChar_y-=velocity;
            velocity-=gravity;
            scrollPos += 1;
            if (gameChar_y>floorPos_y && death==false){
                gameChar_y=floorPos_y;
                velocity=jumpHeight;
                if(!isPlumeting){
                    landOnFloorSound.play();
                }
                isFalling=false;
            }
			
		}
             
    }else if(isLeft && gameChar_y==floorPos_y){
        push();
        walkingAnimation();
        pop();
        rotation();
        characterMovingLeft();
	}

	else if(isRight && gameChar_y==floorPos_y)
	{
        push();
        walkingAnimation();
        pop();
        rotation();
        characterMovingRight();
     
        
    }else if(isFalling){
        jumpingFaceForward();
        gameChar_y-=velocity;
        velocity-=gravity
        if (gameChar_y>floorPos_y && death==false){
            gameChar_y=floorPos_y;
            velocity=jumpHeight;
            if(!isPlumeting){
                landOnFloorSound.play();
            }
            isFalling=false;
            isPlumeting=false;
        }
    
    }else{
        if(gameChar_y==floorPos_y){
            characterFacingForward();
        }
    }
    if (isPlumeting==true){
        isLeft=false;
        isRight=false;
        jumpingFaceForward();
        gameChar_y+=10;
        if(gameChar_y-50>height && lives>0){
            if (scrollPos<0){
                scrollPos+=20;
                if(scrollPos>=0){
                    isFalling=true;
                    death=false;
                    gameChar_y=-50;
                    gameChar_x=512;
            }
            }else{
                if(lives>0){
                    scrollPos-=20;
                }
                if(scrollPos<=0){
                    isFalling=true;
                    gameChar_y=-50;
                    gameChar_x=512;
            }
            }
        }
        
    }
    
    if(death){
        isFalling=true;
        isLeft=false;
        isRight=false;
        if (gameChar_y>height){
            print(gameChar_y);
            isPlumeting=true;
        }
    }

}

function drawGround(){
    fill(0,155,0);
    rect(0, floorPos_y, width, height - floorPos_y);
    fill(122, 85, 37);
	rect(0, floorPos_y+15, width, height - floorPos_y);
    fill(102, 65, 17);
	rect(0, floorPos_y+35, width, height - floorPos_y);
    fill(82, 45, 0);
	rect(0, floorPos_y+55, width, height - floorPos_y);
    fill(62, 25, 0);
	rect(0, floorPos_y+75, width, height - floorPos_y);
    fill(42, 5, 0);
	rect(0, floorPos_y+100, width, height - floorPos_y);
    fill(12, 0, 0);
	rect(0, floorPos_y+125, width, height - floorPos_y);
}

// ---------------------------
// Background render functions
// ---------------------------

// Function to draw cloud objects.
function drawCloud(s=1){
    push();
    translate(scrollPos*0.2,0);
    for(var i=0; i<clouds.length;i++){
        fill(150);
        rect(clouds[i].x_pos-74*s , clouds[i].y_pos-18*s,150*s,50*s,30*s);
        fill(255);
        rect(clouds[i].x_pos-69*s , clouds[i].y_pos-23*s,150*s,50*s,30*s);//cloud 1
        ellipse(clouds[i].x_pos-26*s,clouds[i].y_pos-26*s,70*s,70*s);
        ellipse(clouds[i].x_pos+24*s,clouds[i].y_pos-26*s,50*s,50*s);
       //Pivot is 226,106          
        clouds[i].x_pos+=0.2;
        if (clouds[i].x_pos-50>10024){
            
            clouds[i].x_pos=-50;
        }
    }
    pop(); 
    
}

// Function to draw mountains objects.
function drawMountain(){
    push();
    translate(scrollPos*0.5,0);
    for(var i=0; i< mountains.length;i++){
        //Mountains layer 1
    
        //MOUNTAIN A1
        fill(125, 116, 116);
        triangle(mountains[i].x_pos+512,mountains[i].mountainHeight[0],mountains[i].x_pos+206,mountains[i].y_pos,mountains[i].x_pos+840,mountains[i].y_pos);

        fill(190); 
        triangle(mountains[i].x_pos+512,mountains[i].mountainHeight[0],mountains[i].x_pos+512+((mountains[i].x_pos+206)-(mountains[i].x_pos+512))/4,mountains[i].mountainHeight[0]+(mountains[i].y_pos-mountains[i].mountainHeight[0])/4,mountains[i].x_pos+512+((mountains[i].x_pos+840)-(mountains[i].x_pos+512))/4,mountains[i].mountainHeight[0]+(mountains[i].y_pos-mountains[i].mountainHeight[0])/4);   


        fill(102, 94, 94,100);
        triangle(mountains[i].x_pos+512,mountains[i].mountainHeight[0],mountains[i].x_pos+206,mountains[i].y_pos,mountains[i].x_pos+400,mountains[i].y_pos);

        //MOUNTAIN A2
        fill(125, 116, 116);
        triangle(mountains[i].x_pos+601,mountains[i].mountainHeight[1],mountains[i].x_pos+357,mountains[i].y_pos,mountains[i].x_pos+850,mountains[i].y_pos);

        fill(190);
        triangle(mountains[i].x_pos+601,mountains[i].mountainHeight[1],mountains[i].x_pos+601+(mountains[i].x_pos+357-(mountains[i].x_pos+601))/4,mountains[i].mountainHeight[1]+(mountains[i].y_pos-mountains[i].mountainHeight[1])/4,mountains[i].x_pos+601+(mountains[i].x_pos+850-(mountains[i].x_pos+601))/4,mountains[i].mountainHeight[1]+(mountains[i].y_pos-mountains[i].mountainHeight[1])/4);

        fill(102, 94, 94,100);
        triangle(mountains[i].x_pos+601,mountains[i].mountainHeight[1],mountains[i].x_pos+357,mountains[i].y_pos,mountains[i].x_pos+520,mountains[i].y_pos);

        //MOUNTAIN A3
        fill(125, 116, 116);
        triangle(mountains[i].x_pos+764,mountains[i].mountainHeight[2],mountains[i].x_pos+489,mountains[i].y_pos,mountains[i].x_pos+1060,mountains[i].y_pos); 

        fill(190);
        triangle(mountains[i].x_pos+764,mountains[i].mountainHeight[2],mountains[i].x_pos+764+(mountains[i].x_pos+489-(mountains[i].x_pos+764))/4,mountains[i].mountainHeight[2]+(mountains[i].y_pos-mountains[i].mountainHeight[2])/4,mountains[i].x_pos+764+(mountains[i].x_pos+1060-(mountains[i].x_pos+764))/4,mountains[i].mountainHeight[2]+(mountains[i].y_pos-mountains[i].mountainHeight[2])/4); 

        fill(102, 94, 94,100);
        triangle(mountains[i].x_pos+764,mountains[i].mountainHeight[2],mountains[i].x_pos+489,mountains[i].y_pos,mountains[i].x_pos+700,mountains[i].y_pos);



        //Mountain layer 2

        //MOUNTAIN B1
        fill(143, 133, 133);
        triangle(mountains[i].x_pos+834,mountains[i].mountainHeight[3],mountains[i].x_pos+643,mountains[i].y_pos,mountains[i].x_pos+1060,mountains[i].y_pos);

        fill(200);
        triangle(mountains[i].x_pos+834,mountains[i].mountainHeight[3],mountains[i].x_pos+834+(mountains[i].x_pos+643-(mountains[i].x_pos+834))/4,mountains[i].mountainHeight[3]+(mountains[i].y_pos-mountains[i].mountainHeight[3])/4,mountains[i].x_pos+834+(mountains[i].x_pos+1060-(mountains[i].x_pos+834))/4,mountains[i].mountainHeight[3]+(mountains[i].y_pos-mountains[i].mountainHeight[3])/4);

        fill(112, 107, 107,100); 
        triangle(mountains[i].x_pos+834,mountains[i].mountainHeight[3],mountains[i].x_pos+643,mountains[i].y_pos,mountains[i].x_pos+784,mountains[i].y_pos);

        //MOUNTAIN B2
        fill(143, 133, 133);
        triangle(mountains[i].x_pos+408,mountains[i].mountainHeight[4],mountains[i].x_pos+181,mountains[i].y_pos,mountains[i].x_pos+692,mountains[i].y_pos);

        fill(200);
        triangle(mountains[i].x_pos+408,mountains[i].mountainHeight[4],mountains[i].x_pos+408+(mountains[i].x_pos+181-(mountains[i].x_pos+408))/4,mountains[i].mountainHeight[4]+(mountains[i].y_pos-mountains[i].mountainHeight[4])/4,mountains[i].x_pos+408+(mountains[i].x_pos+692-(mountains[i].x_pos+408))/4,mountains[i].mountainHeight[4]+(mountains[i].y_pos-mountains[i].mountainHeight[4])/4);

        fill(112, 107, 107,100);
        triangle(mountains[i].x_pos+408,mountains[i].mountainHeight[4],mountains[i].x_pos+181,mountains[i].y_pos,mountains[i].x_pos+330,mountains[i].y_pos);

        //MOUNTAIN B3
        fill(143, 133, 133);
        triangle(mountains[i].x_pos+683,mountains[i].mountainHeight[5],mountains[i].x_pos+426,mountains[i].y_pos,mountains[i].x_pos+990,mountains[i].y_pos);

        fill(200);  
        triangle(mountains[i].x_pos+683,mountains[i].mountainHeight[5],(mountains[i].x_pos+683)+((mountains[i].x_pos+426)-(mountains[i].x_pos+683))/4,mountains[i].mountainHeight[5]+(mountains[i].y_pos-mountains[i].mountainHeight[5])/4,mountains[i].x_pos+683+((mountains[i].x_pos+990)-(mountains[i].x_pos+683))/4,mountains[i].mountainHeight[5]+(mountains[i].y_pos-mountains[i].mountainHeight[5])/4);   

        fill(112, 107, 107,100);
        triangle(mountains[i].x_pos+683,mountains[i].mountainHeight[5],mountains[i].x_pos+426,mountains[i].y_pos,mountains[i].x_pos+623,mountains[i].y_pos);



        //MOUNTAIN B4
        fill(143, 133, 133);
        triangle(mountains[i].x_pos+525,mountains[i].mountainHeight[6],mountains[i].x_pos+290,mountains[i].y_pos,mountains[i].x_pos+776,mountains[i].y_pos);

        fill(200);
        triangle(mountains[i].x_pos+525,mountains[i].mountainHeight[6],mountains[i].x_pos+525+(mountains[i].x_pos+290-(mountains[i].x_pos+525))/4,mountains[i].mountainHeight[6]+(mountains[i].y_pos-mountains[i].mountainHeight[6])/4,mountains[i].x_pos+525+(mountains[i].x_pos+776-(mountains[i].x_pos+525))/4,mountains[i].mountainHeight[6]+(mountains[i].y_pos-mountains[i].mountainHeight[6])/4);

        fill(112, 107, 107,100);
        triangle(mountains[i].x_pos+525,mountains[i].mountainHeight[6],mountains[i].x_pos+290,mountains[i].y_pos,mountains[i].x_pos+465,mountains[i].y_pos);
    
    }
    pop();
    
    push();
    translate(scrollPos*0.8,0);
    for(var i=0; i<landscape.length;i++){
        fill(landscape[i].col-50,landscape[i].col,0);
        ellipse(landscape[i].x_pos,floorPos_y+120,1500,420);

    }
    pop();
    
}

// Function to draw trees objects.
function drawTree(){
    
	for(var i=0;i<trees_x.length;i++){
        noStroke();
        fill(89, 71, 20);
        rect(trees_x[i]-5, 331,10,101);
        fill(20, 89, 38);
        triangle(trees_x[i], 279,trees_x[i]-45,399,trees_x[i]+45 , 399);
        fill(26, 120, 51);
        triangle(trees_x[i],279,trees_x[i]+37,364,trees_x[i]-37,364);
        fill(31, 148, 62);
        triangle(trees_x[i],279,trees_x[i]-28,331,trees_x[i]+28,331);
        // Pivot is 857 , 337
    }

        
    
}


function drawFractalTree(x, y) {
    push();
    branchMovementOffset += 0.005 % 360;
    angle = noise(branchMovementOffset);
    stroke(48, 24, 1);
    translate(x, y);
    strokeWeight(100 / strokeThicknessChange);
    line(0, 0, 0, -100);
    push();
    translate(0, -100);
    branch(100);
    pop();
    pop();
  
    function branch(len) {
      strokeWeight(len / strokeThicknessChange);
      line(0, 0, 0, -len);
      translate(0, -len);
      if (len * branchLengthChange < 4) {
        stroke(0, 255, 0);
      }
      if (len > 2) {
        push();
        rotate(angle * 2);
        branch(len * branchLengthChange);
        pop();
        push();
        rotate(-angle * 2);
        branch(len * branchLengthChange);
        pop();
      }
    }
  }

// ---------------------------------
// Canyon render and check functions
// ---------------------------------

// Function to draw canyon objects.

function drawCanyon(t_canyon)
{   
    fill(82, 66, 47);
    rect(t_canyon.x_pos, 431, t_canyon.width, 144);
    fill(72, 56, 37);
    rect(t_canyon.x_pos, 452, t_canyon.width, 144);
    fill(62, 46, 27);
    rect(t_canyon.x_pos, 472, t_canyon.width, 144);
    fill(52, 36, 17);
    rect(t_canyon.x_pos, 492, t_canyon.width, 144);
    fill(42, 26, 7);
    rect(t_canyon.x_pos, 512, t_canyon.width, 144);
    fill(32, 16, 0);
    rect(t_canyon.x_pos, 532, t_canyon.width, 144);
    fill(22, 6, 0);
    rect(t_canyon.x_pos, 552, t_canyon.width, 144);
    fill(0, 0, 0);
    rect(t_canyon.x_pos, 572, t_canyon.width, 144);
    

}
//Function to draw lives
function drawLives(){
    // for (var j=0;j<4;j++){
    //     emptyHeart(j)
    // }
    stroke("white");
    fill("white")
    strokeWeight(1);
    textSize(20);
    text("SCORE: "+game_score,10,30);
    text("LIVES: ",10,65);
    for (var i=0;i<lives;i++){
        // heart(i); 
        image(heartSymbol, (i*25)+60, 50);
        if(gameChar_y==602 || gameChar_y==591){
            startGame();
            break;
        }
    }
}

// Function to check character is over a canyon.

function checkCanyon(t_canyon)
{
    if (gameChar_world_x-10>t_canyon.x_pos && gameChar_world_x+10<t_canyon.x_pos+t_canyon.width && gameChar_y ==floorPos_y){
        isPlumeting=true;
    }   
}

// ----------------------------------
// Collectable items render and check functions
// ----------------------------------

// Function to draw collectable objects.

function drawCollectable(t_collectable,s=0.6)
{
    if(t_collectable.isFound==false){
        fill(210,105,30);
        rect(t_collectable.x_pos-23*s,t_collectable.y_pos-23*s,50*s,50*s);
        fill(205,133,63);
        stroke(205,133,63);
        strokeWeight(10*s);
        line(t_collectable.x_pos-23*s,t_collectable.y_pos+25*s,t_collectable.x_pos+26*s,t_collectable.y_pos+25*s);
        line(t_collectable.x_pos-23*s,t_collectable.y_pos-25*s,t_collectable.x_pos-23*s,t_collectable.y_pos+25*s);
        line(t_collectable.x_pos-23*s,t_collectable.y_pos-25*s,t_collectable.x_pos+26*s,t_collectable.y_pos-25*s);
        line(t_collectable.x_pos+27*s,t_collectable.y_pos-25*s,t_collectable.x_pos+27*s,t_collectable.y_pos+25*s);
        line(t_collectable.x_pos+27*s,t_collectable.y_pos-25*s,t_collectable.x_pos-23*s,t_collectable.y_pos+25*s);
        line(t_collectable.x_pos-23*s,t_collectable.y_pos-25*s,t_collectable.x_pos+27*s,t_collectable.y_pos+25*s);
        //Pivot is 473 , 401
    }
    

}

// Function to check character has collected an item.

function checkCollectable(t_collectable)
{
    if(dist(gameChar_world_x,gameChar_y,t_collectable.x_pos,t_collectable.y_pos)<18){
        if (t_collectable.isFound==false){
            game_score+=1;
        }
        t_collectable.isFound=true;
            
    }

}



// All of my functions
function characterMovingRight()
{
    //Walking, turned right
    //head
    fill(0);
    rect(gameChar_x-8,gameChar_y-67,16,25,4);
    
    fill(200,0,0);
    rect(gameChar_x,gameChar_y-62,8,6.5);
    rect(gameChar_x-1,gameChar_y-62,5,6.5,4);
    fill(0);
    ellipse(gameChar_x+5,gameChar_y-59,3,3);//eyes
    fill(80,0,0);
    rect(gameChar_x-8,gameChar_y-67,16,6,4);
    fill(100,0,0);
    rect(gameChar_x-9,gameChar_y-63,18,4,4);
    
    //Left arm
    fill(0,0,60);
    armAnimation(angleB);
    
    //BackPack
    fill(110, 16, 9);
    rect(gameChar_x-13,gameChar_y-50,5,30,2);
    rect(gameChar_x-15,gameChar_y-50,5,15,2);
    fill(0,0,100);
    
    //Leg
    fill(0);
    push();
    walkingAnimation();
    pop();
    
    
    //Torso
    fill(colour);
    rect(gameChar_x-8,gameChar_y-50,16,30);
    
   //Left arm
    fill(0,0,60);
    stroke(130, 21, 13);
    strokeWeight(3);
    line(gameChar_x,gameChar_y-50,gameChar_x+6,gameChar_y-39);
    line(gameChar_x+5,gameChar_y-39,gameChar_x-7,gameChar_y-39);
    strokeWeight(1);
    noStroke();
    armAnimation(angleA);
    //Backpack straps
    stroke(130, 21, 13);
    strokeWeight(3);
    line(gameChar_x-7,gameChar_y-50,gameChar_x,gameChar_y-50);
    strokeWeight(1);
    
    //minor details
    fill(0);
    noStroke();
    triangle(gameChar_x+2,gameChar_y-50,gameChar_x+8,gameChar_y-50,gameChar_x+8,gameChar_y-45);

    
}
function characterMovingLeft()
{
    //Walking, turned left
	//Add your code here ...
    //head
    fill(0);
    rect(gameChar_x-8,gameChar_y-67,16,25,4);
    
    fill(200,0,0);
    rect(gameChar_x-1,gameChar_y-62,-7,6.5);
    rect(gameChar_x-4,gameChar_y-62,5,6.5,4);
    fill(0);
    ellipse(gameChar_x-4.8,gameChar_y-59,3,3);//eyes
    fill(80,0,0);
    rect(gameChar_x-8,gameChar_y-67,16,6,4);
    fill(100,0,0);
    rect(gameChar_x-9,gameChar_y-63,18,4,4);
    
    //Right arm
    fill(0,0,60);
    armAnimation(angleB);
    
    //BackPack
    fill(110, 16, 9);
    rect(gameChar_x+8,gameChar_y-50,5,30,2);
    rect(gameChar_x+10,gameChar_y-50,5,15,2);
    fill(0,0,100);
    
    //Leg
    fill(0);
    push();
    walkingAnimation();
    pop();
    
    //Torso
    fill(colour);
    rect(gameChar_x-8,gameChar_y-50,16,30);
    
    
   //Left arm
    fill(0,0,60);
    stroke(130, 21, 13);
    strokeWeight(3);
    line(gameChar_x-1,gameChar_y-50,gameChar_x-7,gameChar_y-39);
    line(gameChar_x-5,gameChar_y-39,gameChar_x+7,gameChar_y-39);
    strokeWeight(1);
    noStroke();
    armAnimation(angleA);
    //Backpack straps
    stroke(130, 21, 13);
    strokeWeight(3);
    line(gameChar_x+7,gameChar_y-50,gameChar_x,gameChar_y-50);
    strokeWeight(1);
    
    //minor details
    fill(0);
    noStroke();
    triangle(gameChar_x-2,gameChar_y-50,gameChar_x-8,gameChar_y-50,gameChar_x-8,gameChar_y-45);
    
    
}


function characterFacingForward(s=1)
{
    //Standing, facing frontwards
    //head
    fill(0);
    rect(gameChar_x-10*s,gameChar_y-67*s,20*s,25*s,4*s);
    
    fill(200,0,0);
    rect(gameChar_x-8*s,gameChar_y-62*s,16*s,6.5*s,4*s);
    fill(0);
    ellipse(gameChar_x-3*s,gameChar_y-59*s,3*s,3*s);//eyes
    ellipse(gameChar_x+3*s,gameChar_y-59*s,3*s,3*s);//eyes
    fill(80,0,0);
    rect(gameChar_x-10*s,gameChar_y-67*s,20*s,6*s,4*s);
    fill(100,0,0);
    rect(gameChar_x-11*s,gameChar_y-63*s,22*s,4*s,4*s);
    
    
    
    //BackPack
    fill(110, 16, 9);
    rect(gameChar_x-13*s,gameChar_y-50*s,26*s,30*s,2*s);
    fill(colour);
    //Torso
    rect(gameChar_x-10*s,gameChar_y-50*s,20*s,30*s);
    
    fill(0,0,60);
    //Left arm
    triangle(gameChar_x-10*s,gameChar_y-50*s,gameChar_x-10*s,gameChar_y-40*s,gameChar_x-18*s,gameChar_y-40*s);
    triangle(gameChar_x-18*s,gameChar_y-40*s,gameChar_x-11*s,gameChar_y-40*s,gameChar_x-11*s,gameChar_y-20*s);
    
    //right arm
    triangle(gameChar_x+10*s,gameChar_y-50*s,gameChar_x+10*s,gameChar_y-40*s,gameChar_x+18*s,gameChar_y-40*s);
    triangle(gameChar_x+18*s,gameChar_y-40*s,gameChar_x+11*s,gameChar_y-40*s,gameChar_x+11*s,gameChar_y-20*s);
    
    //left leg
    fill(0);
    triangle(gameChar_x-10*s,gameChar_y-20*s,gameChar_x-1*s,gameChar_y-20*s,gameChar_x-10*s,gameChar_y+3*s);
    
    //right leg
    triangle(gameChar_x+10*s,gameChar_y-20*s,gameChar_x+1*s,gameChar_y-20*s,gameChar_x+10*s,gameChar_y+3*s);
    
    //Backpack straps
    fill(130, 21, 13);
    rect(gameChar_x-10*s,gameChar_y-50*s,2.5*s,15*s);
    rect(gameChar_x+7.5*s,gameChar_y-50*s,2.5*s,15*s);
    
    //minor details
    fill(0);
    triangle(gameChar_x-10*s,gameChar_y-50*s,gameChar_x+10*s,gameChar_y-50*s,gameChar_x,gameChar_y-40*s);
    
    
}

function jumpingFaceForward(s=1){
    //Jumping facing forwards
    //head
    fill(0);
    rect(gameChar_x-10*s,gameChar_y-67*s,20*s,25*s,4*s);
    
    fill(200,0,0);
    rect(gameChar_x-8*s,gameChar_y-62*s,16*s,6.5*s,4*s);
    fill(0);
    ellipse(gameChar_x-3*s,gameChar_y-59*s,3*s,3*s);//eyes
    ellipse(gameChar_x+3*s,gameChar_y-59*s,3*s,3*s);//eyes
    fill(80,0,0);
    rect(gameChar_x-10*s,gameChar_y-67*s,20*s,6*s,4*s);
    fill(100,0,0);
    rect(gameChar_x-11*s,gameChar_y-63*s,22*s,4*s,4*s);
    
    
    
    //BackPack
    fill(110, 16, 9);
    rect(gameChar_x-13*s,gameChar_y-50*s,26*s,30*s,2*s);
    fill(colour);
    //Torso
    rect(gameChar_x-10*s,gameChar_y-50*s,20*s,30*s);
    
    fill(0,0,60);
    //Left arm
    triangle(gameChar_x-10*s,gameChar_y-50*s,gameChar_x-10*s,gameChar_y-40*s,gameChar_x-18*s,gameChar_y-50*s);
    triangle(gameChar_x-18*s,gameChar_y-50*s,gameChar_x-11*s,gameChar_y-50*s,gameChar_x-18*s,gameChar_y-70*s);
    
    //right arm
    triangle(gameChar_x+10*s,gameChar_y-50*s,gameChar_x+10*s,gameChar_y-40*s,gameChar_x+18*s,gameChar_y-50*s);
    triangle(gameChar_x+18*s,gameChar_y-50*s,gameChar_x+11*s,gameChar_y-50*s,gameChar_x+18*s,gameChar_y-70*s);
    
    //left leg
    fill(0);
    triangle(gameChar_x-10*s,gameChar_y-20*s,gameChar_x-1*s,gameChar_y-20*s,gameChar_x-10*s,gameChar_y+3*s);
    
    //right leg
    triangle(gameChar_x+10*s,gameChar_y-20*s,gameChar_x+1*s,gameChar_y-20*s,gameChar_x+10*s,gameChar_y+3*s);
    
    //Backpack straps
    fill(130, 21, 13);
    rect(gameChar_x-10*s,gameChar_y-50*s,2.5*s,15*s);
    rect(gameChar_x+7.5*s,gameChar_y-50*s,2.5*s,15*s);
    
    //minor details
    fill(0);
    triangle(gameChar_x-10*s,gameChar_y-50*s,gameChar_x+10*s,gameChar_y-50*s,gameChar_x,gameChar_y-40*s);


}
function jumpingRight(){
    //Jumping right
     //Left Arm
    fill(0,0,60);
    push();
    translate(gameChar_x,gameChar_y-47);
    rotate(-2.5);
    triangle(0,0,+5,+8,-5,+8);
    triangle(-5,+8,+5,+8,0,+25);
    pop();
    
    //head
    fill(0);
    rect(gameChar_x-8,gameChar_y-67,16,25,4);
    
    fill(200,0,0);
    rect(gameChar_x,gameChar_y-62,8,6.5);
    rect(gameChar_x-1,gameChar_y-62,5,6.5,4);
    fill(0);
    ellipse(gameChar_x+5,gameChar_y-59,3,3);//eyes
    fill(80,0,0);
    rect(gameChar_x-8,gameChar_y-67,16,6,4);
    fill(100,0,0);
    rect(gameChar_x-9,gameChar_y-63,18,4,4);
    
    //BackPack
    fill(110, 16, 9);
    rect(gameChar_x-13,gameChar_y-50,5,30,2);
    rect(gameChar_x-15,gameChar_y-50,5,15,2);
    fill(0,0,100);
    
    //Left Leg
    push();
    translate(gameChar_x,gameChar_y-20);
    fill(0,0,50);
    rotate(0.6);
    triangle(-6,-4,+6,-4,0,+22);
    pop();
    //Right Leg
    push();
    translate(gameChar_x,gameChar_y-20);
    fill(0);
    rotate(-0.6);
    triangle(-6,-4,+6,-4,0,+22);
    pop();
    
    
    //Torso
    fill(colour);
    rect(gameChar_x-8,gameChar_y-50,16,30);
        
   
    //Backpack straps
    stroke(130, 21, 13);
    strokeWeight(3);
    line(gameChar_x-7,gameChar_y-50,gameChar_x,gameChar_y-50);
    strokeWeight(1);
    
    //Right arm
    fill(0,0,60);
    stroke(130, 21, 13);
    strokeWeight(3);
    line(gameChar_x,gameChar_y-50,gameChar_x+6,gameChar_y-39);
    line(gameChar_x+5,gameChar_y-39,gameChar_x-7,gameChar_y-39);
    strokeWeight(1);
    noStroke();
    push();
    translate(gameChar_x,gameChar_y-47);
    rotate(-3.2);
    triangle(0,0,+5,+8,-5,+8);
    triangle(-5,+8,+5,+8,0,+25);
    pop();
    
    //minor details
    fill(0);
    noStroke();
    triangle(gameChar_x+2,gameChar_y-50,gameChar_x+8,gameChar_y-50,gameChar_x+8,gameChar_y-45);

}

function walkingAnimation(){
    push();
    translate(gameChar_x,gameChar_y-20);
    push();
    fill(0,0,50);
    rotate(angleA);
    triangle(-6,-4,+6,-4,0,+22);
    pop();
    fill(0);
    push();
    rotate(angleB);
    triangle(-6,-4,+6,-4,0,+22);
    pop();
}
function jumpingLeft(){
    //Jumping to the left
    //Left Arm
    fill(0,0,60);
    push();
    translate(gameChar_x,gameChar_y-47);
    rotate(+2.5);
    triangle(0,0,+5,+8,-5,+8);
    triangle(-5,+8,+5,+8,0,+25);
    pop();
    
    //head
    fill(0);
    rect(gameChar_x-8,gameChar_y-67,16,25,4);
    
    fill(200,0,0);
    rect(gameChar_x-1,gameChar_y-62,-7,6.5);
    rect(gameChar_x-4,gameChar_y-62,5,6.5,4);
    fill(0);
    ellipse(gameChar_x-4.8,gameChar_y-59,3,3);//eyes
    fill(80,0,0);
    rect(gameChar_x-8,gameChar_y-67,16,6,4);
    fill(100,0,0);
    rect(gameChar_x-9,gameChar_y-63,18,4,4);
    
    
    //BackPack
    fill(110, 16, 9);
    rect(gameChar_x+8,gameChar_y-50,5,30,2);
    rect(gameChar_x+10,gameChar_y-50,5,15,2);
    fill(0,0,100);
    
    //Left Leg
    push();
    translate(gameChar_x,gameChar_y-20);
    fill(0,0,50);
    rotate(-0.6);
    triangle(-6,-4,+6,-4,0,+22);
    pop();
    //Right Leg
    push();
    translate(gameChar_x,gameChar_y-20);
    fill(0);
    rotate(0.6);
    triangle(-6,-4,+6,-4,0,+22);
    pop();
    
    
    //Torso
    fill(colour);
    rect(gameChar_x-8,gameChar_y-50,16,30);
        
   
     //Backpack straps
    stroke(130, 21, 13);
    strokeWeight(3);
    line(gameChar_x+7,gameChar_y-50,gameChar_x,gameChar_y-50);
    strokeWeight(1);
    
    //Right arm
    fill(0,0,60);
    stroke(130, 21, 13);
    strokeWeight(3);
    line(gameChar_x-1,gameChar_y-50,gameChar_x-7,gameChar_y-39);
    line(gameChar_x-5,gameChar_y-39,gameChar_x+7,gameChar_y-39);
    strokeWeight(1);
    noStroke();
    push();
    translate(gameChar_x,gameChar_y-47);
    rotate(+3.2);
    triangle(0,0,+5,+8,-5,+8);
    triangle(-5,+8,+5,+8,0,+25);
    pop();
    
    //minor details
    fill(0);
    noStroke();
    triangle(gameChar_x-2,gameChar_y-50,gameChar_x-8,gameChar_y-50,gameChar_x-8,gameChar_y-45);

}
//This function is made to make the arm wave whilst walking
function armAnimation(a){
    push();
    translate(gameChar_x,gameChar_y-47);
    rotate(a);
    triangle(0,0,+5,+8,-5,+8);
    triangle(-5,+8,+5,+8,0,+25);
    pop();
    
}


//This function is basically to make the arms and legs move
function rotation(){
    push();
    angleA+=DirA;
    if(angleA>0.6){
        DirA=-0.05;
    }else if(angleA<-0.6){
        DirA=+0.05;
    }
    angleB+=DirB
    if(angleB>0.6){
        DirB=-0.05;
    }else if(angleB<-0.6){
        DirB=+0.05;
    }
    pop();
    
    
}

var num=0;
function dayNightCycle(){
    push();
    background(0,map(y,-224.9998269069373,224.9999990513131,0,100),map(y,-224.9998269069373,224.9999990513131,0,255));
    stroke(255,255,0,map(y,-224.9998269069373,224.9999990513131,255,0));
    
    push();
    translate(width/2,height/2)
    for(var i=0;i<stars.length;i++){  
        strokeWeight(random(1,5));     
        point(stars[i].x,stars[i].y);
        if (num>1<1.5){
          rotate(500)  
        }
        num+=1;
        rotate(theta*0.001)
        
        
        
        
    }
    
    
    pop();

    
    
    noStroke();
    translate(width/2, height/2);
    x = r * cos(theta);
    y = r * sin(theta);
    ellipseMode(CENTER);
    fill("yellow");
    ellipse(-x, -y, 150);
    fill("white");
    ellipse(x, y, 80);
    
    theta += speed;
    pop();

    
}
function renderFlagPole(){
    fill("black");
    rect(flagpole.x_pos+8552 ,flagpole.y_pos,5,-190);

    checkFlagPole();
}
function checkFlagPole(){
    if(dist(gameChar_world_x,gameChar_y,flagpole.x_pos+8557,flagpole.y_pos)<25){
        flagpole.isReached=true;
    }
    if(flagpole.isReached==true){
        isLeft=false;
        isFalling=false;
        isRight=false;
        fill("red")
        triangle(flagpole.x_pos+8557,floorPos_y-190,flagpole.x_pos+8622,floorPos_y-170,flagpole.x_pos+8557,floorPos_y-140);
       
    }
}

function heart(i){
    
    
    //heart
    noStroke();
    fill("red");
    ellipse(90+i*30,50,15);
    ellipse(90+i*30+10,50,15);
    triangle(90+i*30-8.5,50,(90+i*30+10)+8.5,50,(90+i*30-7.5+(90+i*30+10)+7.5)/2,50+20)
    noFill();
    
    
    
  
}
function emptyHeart(j){
        //heart
        noStroke();
        fill("darkRed");
        ellipse(90+j*30,50,15);
        ellipse(90+j*30+10,50,15);
        triangle(90+j*30-8.5,50,(90+j*30+10)+8.5,50,(90+j*30-7.5+(90+j*30+10)+7.5)/2,50+20)
        noFill();        
        
}


function startGame(){
    


    flagpole={
        x_pos:0,
        y_pos:floorPos_y,
        isReached:false,
    }

	
	// Variable to store the real position of the gameChar in the game
	// world. Needed for collision detection.
	gameChar_world_x = gameChar_x - scrollPos;

	// Boolean variables to control the movement of the game character.
	isLeft = false;
	isRight = false;
	isFalling = false;
	isPlummeting = false;

	// Initialise arrays of scenery objects.
    collectable={
        x_pos:100,
        y_pos:417,
        isFound:false,
    }
    collectables=[{x_pos:100,y_pos:417,isFound:false},{x_pos:892,y_pos:417,isFound:false},{x_pos:1110,y_pos:417,isFound:false},{x_pos:1465,y_pos:417,isFound:false},{x_pos:1705,y_pos:417,isFound:false},{x_pos:2163,y_pos:417,isFound:false},{x_pos:2918,y_pos:417,isFound:false},{x_pos:3017,y_pos:417,isFound:false},{x_pos:3760,y_pos:417,isFound:false},{x_pos:3369,y_pos:417,isFound:false},{x_pos:4323,y_pos:417,isFound:false},{x_pos:4800,y_pos:417,isFound:false},{x_pos:5200,y_pos:417,isFound:false},{x_pos:5569,y_pos:417,isFound:false},{x_pos:6138,y_pos:417,isFound:false},{x_pos:6740,y_pos:417,isFound:false},{x_pos:7437,y_pos:417,isFound:false},{x_pos:5569,y_pos:417,isFound:false},{x_pos:7268,y_pos:417,isFound:false},{x_pos:8043 ,y_pos:417,isFound:false},{x_pos:8056 ,y_pos:417,isFound:false},{x_pos:8113 ,y_pos:417,isFound:false},{x_pos:8171 ,y_pos:417,isFound:false},{x_pos:8276 ,y_pos:417,isFound:false},{x_pos:8385 ,y_pos:417,isFound:false},{x_pos:8494 ,y_pos:417,isFound:false}];
    
    
    canyons=[{x_pos:300,width:140},{x_pos:600,width:240},{x_pos:1200,width:140},{x_pos:1800,width:240},{x_pos:2200,width:240},{x_pos:2653,width:170},{x_pos:3089,width:200},{x_pos:3508,width:190},{x_pos:3991,width:230},{x_pos:4468,width:220},{x_pos:4855,width:220},{x_pos:5450,width:50},{x_pos:5530,width:50},{x_pos:5610,width:50},{x_pos:5690,width:50},{x_pos:5900,width:230},{x_pos:6200,width:230},{x_pos:6500,width:230},{x_pos:6800,width:230},{x_pos:7100,width:100},{x_pos:7500,width:140},{x_pos:7800,width:140}];
    

    //for loops
    
     
    //This prevents trees from generating within Canyons
    for(var i=0; i< trees_x.length;i++){
        for(var j=0;j<canyons.length;j++){
                if(trees_x[i]>=canyons[j].x_pos && trees_x[i]<= canyons[j].x_pos+canyons[j].width){
                    trees_x.splice(trees_x.indexOf(trees_x[i]),1,0);
                }

        }
    } 
    
    
    game_score=0;
    lives-=1;
    
}


function staticObjects(){
    theta = 0;
    speed =0.0005;
    floorPos_y = height * 3/4;
	gameChar_x = width/2;
	gameChar_y = floorPos_y;
    
    mountains=[{x_pos:0,y_pos:500, mountainHeight:[random(248,188),random(238,178),random(256,196),random(276,216),random(270,210),random(225,165),random(273,213)]},{x_pos:500,y_pos:500, mountainHeight:[random(248,188),random(238,178),random(256,196),random(276,216),random(270,210),random(225,165),random(273,213)]},{x_pos:1000,y_pos:500, mountainHeight:[random(248,188),random(238,178),random(256,196),random(276,216),random(270,210),random(225,165),random(273,213)]},{x_pos:1500,y_pos:500, mountainHeight:[random(248,188),random(238,178),random(256,196),random(276,216),random(270,210),random(225,165),random(273,213)]},{x_pos:2000,y_pos:500, mountainHeight:[random(248,188),random(238,178),random(256,196),random(276,216),random(270,210),random(225,165),random(273,213)]},{x_pos:2500,y_pos:500, mountainHeight:[random(248,188),random(238,178),random(256,196),random(276,216),random(270,210),random(225,165),random(273,213)]},{x_pos:4000,y_pos:500, mountainHeight:[random(248,188),random(238,178),random(256,196),random(276,216),random(270,210),random(225,165),random(273,213)]},{x_pos:4500,y_pos:500, mountainHeight:[random(248,188),random(238,178),random(256,196),random(276,216),random(270,210),random(225,165),random(273,213)]},{x_pos:6000,y_pos:500, mountainHeight:[random(248,188),random(238,178),random(256,196),random(276,216),random(270,210),random(225,165),random(273,213)]},{x_pos:6500,y_pos:500, mountainHeight:[random(248,188),random(238,178),random(256,196),random(276,216),random(270,210),random(225,165),random(273,213)]},{x_pos:7000,y_pos:500, mountainHeight:[random(248,188),random(238,178),random(256,196),random(276,216),random(270,210),random(225,165),random(273,213)]}]
    
    landscape=[{x_pos:0,col:random(100,200)},{x_pos:900,col:random(100,200)},{x_pos:1800,col:random(100,200)},{x_pos:2700,col:random(100,200)},{x_pos:3600,col:random(100,200)},{x_pos:4500,col:random(100,200)},{x_pos:5400,col:random(100,200)},{x_pos:6300,col:random(100,200)},{x_pos:7200,col:random(100,200)},{x_pos:8100,col:random(100,200)},{x_pos:9000,col:random(100,200)}]
    
     //Generates trees
    trees_x=[];
    for (var i=0;i<10024;i+=random(90,140)){
        trees_x.push(i);
        
    }
    
    // Variable to control the background scrolling.
	scrollPos = 0;

    
    
    cloud={
        x_pos:[],
        y_pos:[],
        width:150,
        height:50
    }
    for (var i=0; i<20;i++){
        cloud.x_pos=i*500;
        cloud.y_pos=i+floor(random(90,150));
        clouds.push(Object.assign({},cloud));
    }
    
    //Even though there are billions of stars in our universe, I can only add 900 (so sad)-no one.
    for(var i=0;i<900;i++){
        stars.push({x:random(0,width),y:random(0,height)})
    }
}

function gameOver(){
    if(lives<1){
        textSize(50);
        isLeft=false;
        isRight=false;
        isPlumeting=false;
        isFalling=false;
        return text("GAME OVER! Press space to continue",width/10,height/2);
        
        
    }
}
function gameWon(){
    if(dist(gameChar_world_x,gameChar_y,flagpole.x_pos+8557,flagpole.y_pos)<25){
        textSize(50);
        isLeft=false;
        isRight=false;
        isPlumeting=false;
        isFalling=false;   
        return text("Level Complete! Press space to continue",50,height/2);
        
    }
    
}


function mousePressed(){
    console.log(floor(mouseX),floor(mouseY));
}




/*enemies*/




var enemyDir=-1;
function enemy(x,y,i){
    this.drawEnemy=function(range){
        if(enemyDir==-1){
            this.enemyWalkingLeft();
            x-=1;
            enemyX[i].x=x;
            range-=1;
            enemyX[i].walkRange=range;
            if(range==0){
                enemyDir=1;
            }
        
        }else{
            this.enemyWalkingRight();
            enemyDir=1;
            x+=1;
            enemyX[i].x=x;
            range+=1;
            enemyX[i].walkRange=range;
            if(range==enemyX[i].walkRangeB){
                enemyDir=-1;
            }
        
        }
    }

    this.enemyWalkingLeft=function(){
        //Walking, turned left
        push();
        //Right arm
        fill(117, 110, 42);
        this.enemyArmAnimation(enemy_angleB-200);


        //Leg
        fill(0);
        push();
        this.enemyWalkingAnimation();
        pop();

        //Torso
        fill(191, 176, 36);
        rect(x-8,y-50,16,30);

        //head
        fill(191, 176, 36);
        rect(x-8,y-67,16,25,4);

        fill(191, 176, 36);
        rect(x-1,y-62,-7,6.5);
        rect(x-4,y-62,5,6.5,4);
        fill('red');
        ellipse(x-4.8,y-59,5,5);//eyes

       //Left arm
        fill(117, 110, 42);
        stroke(130, 21, 13);
        strokeWeight(3);
        strokeWeight(1);
        noStroke();
        this.enemyArmAnimation(enemy_angleA-200);

        pop();
        
        
    }
    
    this.enemyWalkingRight=function(){
        //Walking, turned right
        push();
        fill(191, 176, 36);
        rect(x,y-62,8,6.5);
        rect(x-1,y-62,5,6.5,4);

        //Left arm
        fill(117, 110, 42);
        this.enemyArmAnimation(enemy_angleB+200);

            //head
        fill(191, 176, 36);
        rect(x-8,y-67,16,25,4);

        fill('red');
        ellipse(x+5,y-59,5,5);//eyes




        //Leg
        fill(0);
        push();
        this.enemyWalkingAnimation();
        pop();


        //Torso
        fill(191, 176, 36);
        rect(x-8,y-50,16,30);

       //Left arm
        fill(117, 110, 42);
        stroke(130, 21, 13);
        strokeWeight(3);
        strokeWeight(1);
        noStroke();
        this.enemyArmAnimation(enemy_angleA+200);
        pop();
        
        
    }
    
    
    
    this.enemyWalkingAnimation=function(){
        push();
        translate(x,y-20);
        push();
        fill(117, 110, 42);
        rotate(enemy_angleA);
        triangle(-6,-4,+6,-4,0,+22);
        pop();
        push();
       // rotate(0.5);
        fill(117, 110, 42);
        push();
        rotate(enemy_angleB);
        triangle(-6,-4,+6,-4,0,+22);
        pop();
        pop();
        pop();
        
    }
    
    this.enemyArmAnimation=function(a){
        push();
        translate(x,y-47);
        rotate(a);
        triangle(0,0,+5,+8,-5,+8);
        triangle(-5,+8,+5,+8,0,+25);
        pop();
        
    }
    this.rotation=function(){
        push();
        enemy_angleA+=enemyDirA;
        if(enemy_angleA>0.6){
            enemyDirA=-0.01;
        }else if(enemy_angleA<-0.6){
            enemyDirA=+0.01;
        }
       // rotate(0.5);
        enemy_angleB+=enemyDirB
        if(enemy_angleB>0.6){
            enemyDirB=-0.01;
        }else if(enemy_angleB<-0.6){
            enemyDirB=+0.01;
        }
        pop();
        
        
        
    }
    
    

    
    
    
    
    
    
    
    
}

var screenPos={
    x:-2000,
    y:-1400,
    scale:4.5
}

function mainMenu(){
    translate(screenPos.x,screenPos.y);
        
    scale(screenPos.scale);
    if(playGame==false){     
        
        isLeft=false;
        isRight=false;
        isFalling=false;
    }
    
    this.gameMenu=function(){
        fill("white");
        textSize(3);
        if(playGame==false){
            if(keyCode!=72 && helpMenu==false || keyCode==27){
                helpMenu=false;
                text("Spacebar: START GAME",gameChar_x+55, gameChar_y-45);
                text("H: HOW TO PLAY",gameChar_x+55, gameChar_y-35);
            }
            if(keyCode==72 || helpMenu==true){
                helpMenu=true;
                text("HOW TO PLAY",gameChar_x+55, gameChar_y-46);
                textSize(1);
                text("Use W A S D or Arrow keys to move",gameChar_x+55, gameChar_y-40);
                text("Use Space bar, up arrow or 'W' to jump",gameChar_x+55, gameChar_y-38);
                text("You have 4 lives, avoid enemies or falling. Try to get to the end!",gameChar_x+55, gameChar_y-36);
                text("ESC: Back",gameChar_x+55, gameChar_y-25);

            }
        }
        if(keyCode==32){
            playGame=true;
        }
        if(playGame==true){
            if (screenPos.x!=0){
                screenPos.x+=50;
            }
            if(screenPos.y!=0){
                screenPos.y+=50;
            }
            if(screenPos.scale>1.000000000000008){
                screenPos.scale-=0.05;
            }else{
                screenPos.scale=1;
            }
        }

        
        
    }
    
    
    
}

function mouseOver(){
    
    
}






class gameChar{
    constructor(x,y,moveLeft,moveRight,jumping,shirtColour){
        this.charX =x;
        this.charY =y;
        this.moveLeft=moveLeft;
        this.moveRight=moveRight;
        this.jumping=jumping;
        this.angleA=0;
        this.angleB=0;
        this.DirA=0.01;
        this.DirB=-0.01;
        this.shirtColour=shirtColour;
    }
    renderCharacter(){
        if(this.moveRight && this.jumping){
            this.jumpingRight()
        }else if(this.moveRight){
            push();
            this.walkingAnimation();
            pop();
            this.rotation();
            this.characterMovingRight();
        }else if(this.moveLeft && this.jumping){
            this.jumpingLeft();
        }else if(this.moveLeft){
            push();
            this.walkingAnimation();
            pop();
            this.rotation();
            this.characterMovingLeft();
        }else if(this.jumping){
            this.jumpingFaceForward();
        }else{
            this.characterFacingForward();
        }
    }
    // All of my functions
characterMovingRight()
{
    //Walking, turned right
    //head
    fill(0);
    rect(this.charX-8,this.charY-67,16,25,4);
    
    fill(200,0,0);
    rect(this.charX,this.charY-62,8,6.5);
    rect(this.charX-1,this.charY-62,5,6.5,4);
    fill(0);
    ellipse(this.charX+5,this.charY-59,3,3);//eyes
    fill(80,0,0);
    rect(this.charX-8,this.charY-67,16,6,4);
    fill(100,0,0);
    rect(this.charX-9,this.charY-63,18,4,4);
    
    //Left arm
    fill(0,0,60);
    this.armAnimation(this.angleB);
    
    //BackPack
    fill(110, 16, 9);
    rect(this.charX-13,this.charY-50,5,30,2);
    rect(this.charX-15,this.charY-50,5,15,2);
    fill(0,0,100);
    
    //Leg
    fill(0);
    push();
    this.walkingAnimation();
    pop();
    
    
    //Torso
    fill(this.shirtColour);
    rect(this.charX-8,this.charY-50,16,30);
    
   //Left arm
    fill(0,0,60);
    stroke(130, 21, 13);
    strokeWeight(3);
    line(this.charX,this.charY-50,this.charX+6,this.charY-39);
    line(this.charX+5,this.charY-39,this.charX-7,this.charY-39);
    strokeWeight(1);
    noStroke();
    this.armAnimation(this.angleA);
    //Backpack straps
    stroke(130, 21, 13);
    strokeWeight(3);
    line(this.charX-7,this.charY-50,this.charX,this.charY-50);
    strokeWeight(1);
    
    //minor details
    fill(0);
    noStroke();
    triangle(this.charX+2,this.charY-50,this.charX+8,this.charY-50,this.charX+8,this.charY-45);

    
}
characterMovingLeft()
{
    //Walking, turned left
	//Add your code here ...
    //head
    fill(0);
    rect(this.charX-8,this.charY-67,16,25,4);
    
    fill(200,0,0);
    rect(this.charX-1,this.charY-62,-7,6.5);
    rect(this.charX-4,this.charY-62,5,6.5,4);
    fill(0);
    ellipse(this.charX-4.8,this.charY-59,3,3);//eyes
    fill(80,0,0);
    rect(this.charX-8,this.charY-67,16,6,4);
    fill(100,0,0);
    rect(this.charX-9,this.charY-63,18,4,4);
    
    //Right arm
    fill(0,0,60);
    this.armAnimation(this.angleB);
    
    //BackPack
    fill(110, 16, 9);
    rect(this.charX+8,this.charY-50,5,30,2);
    rect(this.charX+10,this.charY-50,5,15,2);
    fill(0,0,100);
    
    //Leg
    fill(0);
    push();
    this.walkingAnimation();
    pop();
    
    //Torso
    fill(this.shirtColour);
    rect(this.charX-8,this.charY-50,16,30);
    
    
   //Left arm
    fill(0,0,60);
    stroke(130, 21, 13);
    strokeWeight(3);
    line(this.charX-1,this.charY-50,this.charX-7,this.charY-39);
    line(this.charX-5,this.charY-39,this.charX+7,this.charY-39);
    strokeWeight(1);
    noStroke();
    this.armAnimation(this.angleA);
    //Backpack straps
    stroke(130, 21, 13);
    strokeWeight(3);
    line(this.charX+7,this.charY-50,this.charX,this.charY-50);
    strokeWeight(1);
    
    //minor details
    fill(0);
    noStroke();
    triangle(this.charX-2,this.charY-50,this.charX-8,this.charY-50,this.charX-8,this.charY-45);
    
    
}


characterFacingForward(s=1)
{
    //Standing, facing frontwards
    //head
    fill(0);
    rect(this.charX-10*s,this.charY-67*s,20*s,25*s,4*s);
    
    fill(200,0,0);
    rect(this.charX-8*s,this.charY-62*s,16*s,6.5*s,4*s);
    fill(0);
    ellipse(this.charX-3*s,this.charY-59*s,3*s,3*s);//eyes
    ellipse(this.charX+3*s,this.charY-59*s,3*s,3*s);//eyes
    fill(80,0,0);
    rect(this.charX-10*s,this.charY-67*s,20*s,6*s,4*s);
    fill(100,0,0);
    rect(this.charX-11*s,this.charY-63*s,22*s,4*s,4*s);
    
    
    
    //BackPack
    fill(110, 16, 9);
    rect(this.charX-13*s,this.charY-50*s,26*s,30*s,2*s);
    fill(this.shirtColour);
    //Torso
    rect(this.charX-10*s,this.charY-50*s,20*s,30*s);
    
    fill(0,0,60);
    //Left arm
    triangle(this.charX-10*s,this.charY-50*s,this.charX-10*s,this.charY-40*s,this.charX-18*s,this.charY-40*s);
    triangle(this.charX-18*s,this.charY-40*s,this.charX-11*s,this.charY-40*s,this.charX-11*s,this.charY-20*s);
    
    //right arm
    triangle(this.charX+10*s,this.charY-50*s,this.charX+10*s,this.charY-40*s,this.charX+18*s,this.charY-40*s);
    triangle(this.charX+18*s,this.charY-40*s,this.charX+11*s,this.charY-40*s,this.charX+11*s,this.charY-20*s);
    
    //left leg
    fill(0);
    triangle(this.charX-10*s,this.charY-20*s,this.charX-1*s,this.charY-20*s,this.charX-10*s,this.charY+3*s);
    
    //right leg
    triangle(this.charX+10*s,this.charY-20*s,this.charX+1*s,this.charY-20*s,this.charX+10*s,this.charY+3*s);
    
    //Backpack straps
    fill(130, 21, 13);
    rect(this.charX-10*s,this.charY-50*s,2.5*s,15*s);
    rect(this.charX+7.5*s,this.charY-50*s,2.5*s,15*s);
    
    //minor details
    fill(0);
    triangle(this.charX-10*s,this.charY-50*s,this.charX+10*s,this.charY-50*s,this.charX,this.charY-40*s);
    
    
}

jumpingFaceForward(s=1){
    //Jumping facing forwards
    //head
    fill(0);
    rect(this.charX-10*s,this.charY-67*s,20*s,25*s,4*s);
    
    fill(200,0,0);
    rect(this.charX-8*s,this.charY-62*s,16*s,6.5*s,4*s);
    fill(0);
    ellipse(this.charX-3*s,this.charY-59*s,3*s,3*s);//eyes
    ellipse(this.charX+3*s,this.charY-59*s,3*s,3*s);//eyes
    fill(80,0,0);
    rect(this.charX-10*s,this.charY-67*s,20*s,6*s,4*s);
    fill(100,0,0);
    rect(this.charX-11*s,this.charY-63*s,22*s,4*s,4*s);
    
    
    
    //BackPack
    fill(110, 16, 9);
    rect(this.charX-13*s,this.charY-50*s,26*s,30*s,2*s);
    fill(this.shirtColour);
    //Torso
    rect(this.charX-10*s,this.charY-50*s,20*s,30*s);
    
    fill(0,0,60);
    //Left arm
    triangle(this.charX-10*s,this.charY-50*s,this.charX-10*s,this.charY-40*s,this.charX-18*s,this.charY-50*s);
    triangle(this.charX-18*s,this.charY-50*s,this.charX-11*s,this.charY-50*s,this.charX-18*s,this.charY-70*s);
    
    //right arm
    triangle(this.charX+10*s,this.charY-50*s,this.charX+10*s,this.charY-40*s,this.charX+18*s,this.charY-50*s);
    triangle(this.charX+18*s,this.charY-50*s,this.charX+11*s,this.charY-50*s,this.charX+18*s,this.charY-70*s);
    
    //left leg
    fill(0);
    triangle(this.charX-10*s,this.charY-20*s,this.charX-1*s,this.charY-20*s,this.charX-10*s,this.charY+3*s);
    
    //right leg
    triangle(this.charX+10*s,this.charY-20*s,this.charX+1*s,this.charY-20*s,this.charX+10*s,this.charY+3*s);
    
    //Backpack straps
    fill(130, 21, 13);
    rect(this.charX-10*s,this.charY-50*s,2.5*s,15*s);
    rect(this.charX+7.5*s,this.charY-50*s,2.5*s,15*s);
    
    //minor details
    fill(0);
    triangle(this.charX-10*s,this.charY-50*s,this.charX+10*s,this.charY-50*s,this.charX,this.charY-40*s);


}
jumpingRight(){
    //Jumping right
     //Left Arm
    fill(0,0,60);
    push();
    translate(this.charX,this.charY-47);
    rotate(-2.5);
    triangle(0,0,+5,+8,-5,+8);
    triangle(-5,+8,+5,+8,0,+25);
    pop();
    
    //head
    fill(0);
    rect(this.charX-8,this.charY-67,16,25,4);
    
    fill(200,0,0);
    rect(this.charX,this.charY-62,8,6.5);
    rect(this.charX-1,this.charY-62,5,6.5,4);
    fill(0);
    ellipse(this.charX+5,this.charY-59,3,3);//eyes
    fill(80,0,0);
    rect(this.charX-8,this.charY-67,16,6,4);
    fill(100,0,0);
    rect(this.charX-9,this.charY-63,18,4,4);
    
    //BackPack
    fill(110, 16, 9);
    rect(this.charX-13,this.charY-50,5,30,2);
    rect(this.charX-15,this.charY-50,5,15,2);
    fill(0,0,100);
    
    //Left Leg
    push();
    translate(this.charX,this.charY-20);
    fill(0,0,50);
    rotate(0.6);
    triangle(-6,-4,+6,-4,0,+22);
    pop();
    //Right Leg
    push();
    translate(this.charX,this.charY-20);
    fill(0);
    rotate(-0.6);
    triangle(-6,-4,+6,-4,0,+22);
    pop();
    
    
    //Torso
    fill(this.shirtColour);
    rect(this.charX-8,this.charY-50,16,30);
        
   
    //Backpack straps
    stroke(130, 21, 13);
    strokeWeight(3);
    line(this.charX-7,this.charY-50,this.charX,this.charY-50);
    strokeWeight(1);
    
    //Right arm
    fill(0,0,60);
    stroke(130, 21, 13);
    strokeWeight(3);
    line(this.charX,this.charY-50,this.charX+6,this.charY-39);
    line(this.charX+5,this.charY-39,this.charX-7,this.charY-39);
    strokeWeight(1);
    noStroke();
    push();
    translate(this.charX,this.charY-47);
    rotate(-3.2);
    triangle(0,0,+5,+8,-5,+8);
    triangle(-5,+8,+5,+8,0,+25);
    pop();
    
    //minor details
    fill(0);
    noStroke();
    triangle(this.charX+2,this.charY-50,this.charX+8,this.charY-50,this.charX+8,this.charY-45);

}

walkingAnimation(){
    push();
    translate(this.charX,this.charY-20);
    push();
    fill(0,0,50);
    rotate(this.angleA);
    triangle(-6,-4,+6,-4,0,+22);
    pop();
    fill(0);
    push();
    rotate(this.angleB);
    triangle(-6,-4,+6,-4,0,+22);
    pop();
}
jumpingLeft(){
    //Jumping to the left
    //Left Arm
    fill(0,0,60);
    push();
    translate(this.charX,this.charY-47);
    rotate(+2.5);
    triangle(0,0,+5,+8,-5,+8);
    triangle(-5,+8,+5,+8,0,+25);
    pop();
    
    //head
    fill(0);
    rect(this.charX-8,this.charY-67,16,25,4);
    
    fill(200,0,0);
    rect(this.charX-1,this.charY-62,-7,6.5);
    rect(this.charX-4,this.charY-62,5,6.5,4);
    fill(0);
    ellipse(this.charX-4.8,this.charY-59,3,3);//eyes
    fill(80,0,0);
    rect(this.charX-8,this.charY-67,16,6,4);
    fill(100,0,0);
    rect(this.charX-9,this.charY-63,18,4,4);
    
    
    //BackPack
    fill(110, 16, 9);
    rect(this.charX+8,this.charY-50,5,30,2);
    rect(this.charX+10,this.charY-50,5,15,2);
    fill(0,0,100);
    
    //Left Leg
    push();
    translate(this.charX,this.charY-20);
    fill(0,0,50);
    rotate(-0.6);
    triangle(-6,-4,+6,-4,0,+22);
    pop();
    //Right Leg
    push();
    translate(this.charX,this.charY-20);
    fill(0);
    rotate(0.6);
    triangle(-6,-4,+6,-4,0,+22);
    pop();
    
    
    //Torso
    fill(this.shirtColour);
    rect(this.charX-8,this.charY-50,16,30);
        
   
     //Backpack straps
    stroke(130, 21, 13);
    strokeWeight(3);
    line(this.charX+7,this.charY-50,this.charX,this.charY-50);
    strokeWeight(1);
    
    //Right arm
    fill(0,0,60);
    stroke(130, 21, 13);
    strokeWeight(3);
    line(this.charX-1,this.charY-50,this.charX-7,this.charY-39);
    line(this.charX-5,this.charY-39,this.charX+7,this.charY-39);
    strokeWeight(1);
    noStroke();
    push();
    translate(this.charX,this.charY-47);
    rotate(+3.2);
    triangle(0,0,+5,+8,-5,+8);
    triangle(-5,+8,+5,+8,0,+25);
    pop();
    
    //minor details
    fill(0);
    noStroke();
    triangle(this.charX-2,this.charY-50,this.charX-8,this.charY-50,this.charX-8,this.charY-45);

}
//This function is made to make the arm wave whilst walking
armAnimation(a){
    push();
    translate(this.charX,this.charY-47);
    rotate(a);
    triangle(0,0,+5,+8,-5,+8);
    triangle(-5,+8,+5,+8,0,+25);
    pop();
    
}


//This function is basically to make the arms and legs move
rotation(){
    push();
    this.angleA+=this.DirA;
    if(this.angleA>0.6){
        this.DirA=-0.05;
    }else if(this.angleA<-0.6){
        this.DirA=+0.05;
    }
    this.angleB+=this.DirB
    if(this.angleB>0.6){
        this.DirB=-0.05;
    }else if(this.angleB<-0.6){
        this.DirB=+0.05;
    }
    pop();
    
    
}


    

}

