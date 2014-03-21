var character : GameObject;
var wings : GameObject;

var idle : AnimationState;
idle = animation["Idle"];

private var movement : int = 0;

function Update () {

//wings
	if (FPSFlyer.gliding==true)
		wings.animation.CrossFade("Gliding");
	else if (LavaTrigger.lava==true && LavaTrigger.lavaDeath==false)
		wings.animation.CrossFade("InLava");
	else if (LavaTrigger.lavaDeath==true)
		wings.animation.CrossFade("Burning");
	else
		wings.animation.CrossFade("Flaping");

//body
	if (LavaTrigger.lavaDeath==true)
	{
		character.animation.CrossFade("Sinking");
		return null;
	}
		
	if (FPSFlyer.gliding==true)
	{
		character.animation.CrossFade("Gliding", 2);
		return null;
	}
	if (FPSFlyer.RightDash >0)
	{
		character.animation.CrossFade("RightDash");
		return null;
	}
	if (FPSFlyer.LeftDash >0)
	{
		character.animation.CrossFade("LeftDash");
		return null;
	}
	if (FPSFlyer.BackwardDash >0)
	{
		character.animation.CrossFade("BackwardDash");
		return null;
	}
	if (FPSFlyer.ForwardDash >0)
	{
		character.animation.CrossFade("ForwardDash");
		return null;
	}
//////////////////////////////
	if (Input.GetAxis("Vertical")>0.1)
		character.animation.CrossFade("Forward");
	
	else if (Input.GetAxis("Vertical")<=-0.1)
		character.animation.CrossFade("Backward");
	
	else if (Input.GetAxis("Horizontal")<=-0.1)
		character.animation.CrossFade("Left");
		
	else if (Input.GetAxis("Horizontal")>0.1)
		character.animation.CrossFade("Right");
	
	else
		character.animation.CrossFade("Idle");
}