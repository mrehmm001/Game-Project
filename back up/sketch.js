/*

The Game Project 5 - Bring it all together

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

function setup()
{
    r = height * 4;//This console the sun/moon distance from the centre
    
	createCanvas(1024, 576);
    staticObjects();//This variable will keep the mountains, trees, clouds and the star count the same everytime, is only changed if the game is refreshed by the browser.
	startGame();
 
}

function draw()
{
	dayNightCycle() // I decided to add a day-night cycle to my game because why not?

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
    
    
    pop();   
        
	// Draw game character.
	noStroke();
	drawGameChar();
    
    
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
            if (gameChar_y>floorPos_y){
                gameChar_y=floorPos_y;
                velocity=jumpHeight;
                isFalling=false;
            }
		}
		else
		{
            jumpingRight();
            gameChar_y-=velocity;
            velocity-=gravity;
            scrollPos -= 1;
            if (gameChar_y>floorPos_y){
                gameChar_y=floorPos_y;
                velocity=jumpHeight;
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
            if (gameChar_y>floorPos_y){
                gameChar_y=floorPos_y;
                velocity=jumpHeight;
                isFalling=false;
            }

		}
		else
		{
            jumpingLeft();
            gameChar_y-=velocity;
            velocity-=gravity;
            scrollPos += 1;
            if (gameChar_y>floorPos_y){
                gameChar_y=floorPos_y;
                velocity=jumpHeight;
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
        if (gameChar_y>floorPos_y){
            gameChar_y=floorPos_y;
            velocity=jumpHeight;
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
        //Pivot is 857 , 337
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
    for (var j=0;j<4;j++){
        emptyHeart(j)
    }
    stroke(0);
    fill(0)
    strokeWeight(1);
    textSize(20);
    text("SCORE: "+game_score,10,30);
    text("LIVES: ",10,65);
    for (var i=0;i<lives;i++){
        heart(i); 
        if(gameChar_y==602){
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
    fill(0,0,100);
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
    fill(0,0,100);
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
    //rect(gameChar_x+7.5,gameChar_y-50,2.5,15);
    
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
    fill(0,0,100);
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
    fill(0,0,100);
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
    fill(0,0,100);
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
    fill(0,0,100);
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
    ellipse(-x, -y, 130);
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
    
    
    canyons=[{x_pos:300,width:140},{x_pos:600,width:240},{x_pos:1200,width:140},{x_pos:1800,width:240},{x_pos:2200,width:240},{x_pos:2653,width:170},{x_pos:3089,width:200},{x_pos:3508,width:190},{x_pos:3991,width:230},{x_pos:4468,width:220},{x_pos:4855,width:220},{x_pos:5450,width:50},{x_pos:5530,width:50},{x_pos:5610,width:50},{x_pos:5690,width:50},{x_pos:5900,width:230},{x_pos:6200,width:230},{x_pos:6500,width:230},{x_pos:6800,width:230},{x_pos:7100,width:230},{x_pos:7500,width:140},{x_pos:7800,width:140}];
    

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