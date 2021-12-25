export class gameChar{
    constructor(x,y,moveLeft,moveRight,jumpRight,jumpLeft,standing,jumpingFacingForward){
        this.charX =x;
        this.charY =y;
        this.moveLeft=moveLeft;
        this.moveRight=moveRight;
        this.jumpRight=jumpRight;
        this.jumpLeft=jumpLeft;
        this.standing=standing;
        this.jumpingFacingForward=jumpingFacingForward;
        this.angleA=0;
        this.DirA=0.03;
        this.DirB=-0.03;
        this.angleB=0;
        this.renderCharacter();
    }
    renderCharacter(){
        rotation();
        if(this.moveRight){
            this.characterMovingRight();
        }else if(this.moveLeft){
            this.characterMovingLeft();
        }else if(this.jumpRight){
            this.jumpingRight()
        }else if(this.jumpLeft){
            this.jumpingLeft();
        }else if(this.jumpingFacingForward){
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
    armAnimation(this.angleB);
    
    //BackPack
    fill(110, 16, 9);
    rect(this.charX-13,this.charY-50,5,30,2);
    rect(this.charX-15,this.charY-50,5,15,2);
    fill(0,0,100);
    
    //Leg
    fill(0);
    push();
    walkingAnimation();
    pop();
    
    
    //Torso
    fill(0,0,100);
    rect(this.charX-8,this.charY-50,16,30);
    
   //Left arm
    fill(0,0,60);
    stroke(130, 21, 13);
    strokeWeight(3);
    line(this.charX,this.charY-50,this.charX+6,this.charY-39);
    line(this.charX+5,this.charY-39,this.charX-7,this.charY-39);
    strokeWeight(1);
    noStroke();
    armAnimation(this.angleA);
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
    armAnimation(this.angleB);
    
    //BackPack
    fill(110, 16, 9);
    rect(this.charX+8,this.charY-50,5,30,2);
    rect(this.charX+10,this.charY-50,5,15,2);
    fill(0,0,100);
    
    //Leg
    fill(0);
    push();
    walkingAnimation();
    pop();
    
    //Torso
    fill(0,0,100);
    rect(this.charX-8,this.charY-50,16,30);
    
    
   //Left arm
    fill(0,0,60);
    stroke(130, 21, 13);
    strokeWeight(3);
    line(this.charX-1,this.charY-50,this.charX-7,this.charY-39);
    line(this.charX-5,this.charY-39,this.charX+7,this.charY-39);
    strokeWeight(1);
    noStroke();
    armAnimation(this.angleA);
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
    fill(0,0,100);
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
    fill(0,0,100);
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
    fill(0,0,100);
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
    fill(0,0,100);
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