private var x = 0.0;
private var y = 0.0;
private var z = 0.0;

//AIR FLOAT VAR

private static var i=0;
private static var flag = false;
private static var restartFlag = true;
static var flapSound;
flapSound = GameObject.Find("flap sound");
//MOVEMENT
var disableMovementButton = false;
var enableMovementButton = false;
static var movement = true;

//OTHER
var lavaDisableResetButton = false;


//!!!!BEHAVIOURS!!!!!\\

//---MOVEMENT---\\
static function EnableMovement()
{
	movement = true;
}
static function DisableMovement()
{
	movement = false;
}

function Update () {
		//Enable Movement
		if (enableMovementButton == true && movement == false)
		{
			EnableMovement();
			enableMovementButton = false;
		}
		
		if (disableMovementButton == true && movement == true)
		{
			DisableMovement();
			disableMovementButton = false;
		}
		
		//Lava disable reset
		if (lavaDisableResetButton == true)
		{
			EnableMovement();
			transform.position.y +=100;
			lavaDisableResetButton = false;
		}
} 