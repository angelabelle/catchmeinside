let video;
let poseNet;
let pose;
let skeleton;
let mask;
var virusAmount = 50;
var sprayBottle;
let virusGroup;
let eyeR;
let eyeL;
let wristR;
let wristL;
let d;
let sprayAnim;
let implodeAnim;
let direction = 45;
let covid;
let clean = 0;
let count = 0;

function preload() {
    mask = loadImage('images/mask.png');
    sprayAnim = loadAnimation('images/spray1.png', 'images/spray2.png', 'images/spray3.png');
    implodeAnim = loadAnimation('images/COVIDx1.png', 'images/COVIDx2.png', 'images/COVIDx3.png', 'images/COVIDx4.png', 'images/COVIDx5.png');
    covidRotAnim = loadAnimation('images/COVID2.png', 'images/COVID3.png', 'images/COVID4.png', 'images/COVID5.png')
    //implodeAnim.playing = false;
}


function setup() {
    createCanvas(640, 520);

    frameRate(60);
    video = createCapture(VIDEO);
    video.hide();
    poseNet = ml5.poseNet(video, modelLoaded);
    //creates an array of data with this function, and runs it through the
    //gotPoses function to store it
    poseNet.on('pose', gotPoses);

    virusGroup = new Group();

    sprayBottle = createSprite(600, 200);
    sprayBottle.addAnimation('normal', sprayAnim);
    sprayBottle.setCollider('rectangle', -10, -10, 50, 50);

}

//"poses" is the new array
function gotPoses(poses) {
    //console.log(poses);
    if (poses.length > 0) {
        //stores the always refreshing pose to a variable
        pose = poses[0].pose;
        skeleton = poses[0].skeleton;
    }
}

function modelLoaded() {
    console.log('poseNet ready');
    select('#status').html('Now sanitize the room!');
}

function draw() {
    background(0);
    translate(video.width, 0);
    scale(-1, 1);
    image(video, 0, 0, video.width, video.height);

    if (pose) {

        eyeR = pose.rightEye;
        eyeL = pose.leftEye;
        wristR = pose.rightWrist;
        wristL = pose.leftWrist;
        d = dist(eyeR.x, eyeR.y, eyeL.x, eyeL.y);
        direction += 2;

        drawMask();
        drawVirus();
        drawBottle();
        drawSprites();
        setText();


    }

    // virusGroup[1].debug = mouseIsPressed;
    //sprayBottle.debug = mouseIsPressed;

    //console.log(virusGroup.length);

}

function setText()
{
    let timeLapsed = millis();
    //console.log(timeLapsed);
    if (virusGroup.length <= 0 && timeLapsed > 10000)
    {
        push();
        scale(-1,1);
        translate(-video.width, 0);
        let s = 'You sanitized '+ clean +' out of ' + virusAmount + ' viruses detected';
        fill(50);
        textSize(25);
        fill(255);
        text(s, 10, height-35, width, height);
        pop();
    }
}
function drawBottle()
{
        sprayBottle.position.x = wristR.x;
        sprayBottle.position.y = wristR.y;
        sprayBottle.overlap(virusGroup, sanitize);
}

function drawVirus()
{

    if (frameCount % 10 == 0 && count < virusAmount) {
        covid = createSprite(random(0, width), random(0, height));
        covid.addAnimation('normal', covidRotAnim);
        covid.addAnimation('implode', implodeAnim)
        covid.setCollider('circle', 0, 0, 50);
        covid.changeAnimation('normal');
        covid.life = 700;
        covid.setSpeed(3, direction);
        virusGroup.add(covid);
        count++;
    }
    for(let i = 0; i<virusGroup.length; i++)
    {
        let covidA = virusGroup[i];

        if (covidA.position.x>=width || covidA.position.x<=0)
        {
            covidA.setSpeed(-3,direction);
        }
        else if(covidA.position.y>=height||covidA.position.y<=0)
        {
            covidA.setSpeed(-3,direction);
        }

    }
}

function drawMask()
{
    fill(255, 0, 0);
    //mask is relative to distance
    image(mask, pose.nose.x - ((d * 1.75) / 2), pose.nose.y - d / 2, d * 1.75, d * 1.75)
}

function sanitize(bottle, sanitized) {

    sanitized.changeAnimation('implode');
    if (sanitized.animation.getFrame() == sanitized.animation.getLastFrame()) {
        virusGroup.remove(sanitized);
        sanitized.remove();
        clean += 1;
    }

}
