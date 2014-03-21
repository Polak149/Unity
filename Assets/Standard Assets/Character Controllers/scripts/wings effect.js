var player : boolean;
var firstPersonCharacter : GameObject;
var body : GameObject;
var flapSound : GameObject;
var wings : GameObject;
//var udo_L : GameObject;

var sound : boolean;
var floating : boolean;
var randomizeFloatingBegin : boolean;
var floatingSpeed : float;
var floatingTimeDelay : float;

private var moveDirection;
private var timerFloating : float;
private var timerFlaping : float;
private var random : float;
private var acc = false;
private var dec = false;
private var end = false;

//list of animation when flap sound suppose to play.
var flaping : AnimationState;
var flapingTimeDelay : float;



function Start()
{
	moveDirection = Vector3(0,0,0);
	flaping = animation["Flaping"];
	timerFloating = floatingTimeDelay;
	timerFlaping  = flapingTimeDelay;
	if (randomizeFloatingBegin == true)
	{
		random = Random.Range(0.0,1.5);
		yield  WaitForSeconds(random);
		body.animation.Play("Idle");
		wings.animation.Play("Flaping");
	}
}

function Update () {
	acc = false;
	dec = false;
	end = false;
	if (wings.animation.IsPlaying("Flaping"))
	{	
		//timing
		if(flaping.time>flaping.length)
		{
			flaping.time = 0;
		}
			
		if(flaping.time >= flapingTimeDelay && flaping.time < flapingTimeDelay+0.01)
		{
			if (sound );
				flapSound.audio.Play();
		}
		if (floating==true)
			{		
					//timer
					if (timerFloating < flaping.length)
						timerFloating += Time.deltaTime;
					else
						timerFloating = flaping.time-floatingTimeDelay;
					//accelerating
					if (timerFloating < flaping.length/5)
					{
						acc = true;
						moveDirection.y = floatingSpeed * 5*timerFloating/flaping.length;
						
					}
					//deceleration						
					if (timerFloating < flaping.length/2)
					{
						dec = true;
						moveDirection.y = floatingSpeed * (flaping.length/2-timerFloating);				
					}
					//falling
					if (timerFloating >= flaping.length/2)
					{
						moveDirection.y = -floatingSpeed *(timerFloating-flaping.length/2)/flaping.length*2 +floatingTimeDelay*(floatingSpeed/1.43);
						end = true;
					}
					if (player == true)
			 			firstPersonCharacter.transform.Translate(moveDirection * Time.deltaTime);
			 		else 
			 			body.transform.Translate(moveDirection * Time.deltaTime);
			 		
			}
	}
}
/*private var speed = 2;

private var movUdoR = 0;
private var movUdoL = 0;
private var movGolenR = 0;
private var movGolenL = 0;
private var movRamieR = 0;
private var movRamieL = 0;
private var movPrzedramieR = 0;
private var movPrzedramieL = 0;

private var direction = 0;

function LateUpdate () {
	if (acc == true)
	{	// ropoznawanie kierunku
		if (udo_L.transform.eulerAngles.x>180 && udo_L.transform.eulerAngles.x<360 && direction == 0) 
			direction = 1;
		else if (udo_L.transform.eulerAngles.x<180 && udo_L.transform.eulerAngles.x>0 && direction == 0)
			direction = 2;
		
		if (udo_L.transform.eulerAngles.x>180 && udo_L.transform.eulerAngles.x<360 && direction == 1)
			{
				
				if (udo_L.transform.eulerAngles.x + movUdoL + speed < 360)
					movUdoL += speed;
				udo_L.transform.eulerAngles.x += movUdoL;
			}
		else if (udo_L.transform.eulerAngles.x<180 && udo_L.transform.eulerAngles.x>0  && direction == 2)
			{
				if (udo_L.transform.eulerAngles.x - movUdoL - speed > 0)
					movUdoL += speed;
				udo_L.transform.eulerAngles.x -= movUdoL;
			}
	}
	
	if (dec == true)
	{
		Debug.Log(movUdoL);
		if (movUdoL-speed>=0)
			movUdoL -= speed;
		udo_L.transform.eulerAngles.x -= movUdoL;
	}
	if (end == true)
	{	//reset values
		movUdoL = 0;
		direction = 0;
	}
	
}

//acc - obnizać gwałtownie (w kilku klatkach) kąt o 10? stopni max do 90 i czekać w obniżonej pozycji do końca kroku przyspieszania
//dec - podnieść gwałtownie (w kilku klatkach) kąt o tyle ile się obniżyło.

//dla uda to x
//dla goleni to y

//animacja moze przechodzic pomiedzy 180 stopni. wymysl cos */