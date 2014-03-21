var movieSpeed : float = 0.1;
var movieFrame : Texture[];
var redPlain : Texture;
var steamSound : GameObject;
static var lava : boolean = false;
private var i=0;
private var startFlag = false;
private var alphaValue : float = 0.0;
private var alphaValuePlain : float = 0.0;
private var guiEffectStart : float = 1000;
private var guiEffectEnd : float = 700;
private var burningScaling : float;
private var animationWidth;
private var animationHeight;

static var lavaDeath : boolean = false;

var burningDamage : float = 2;
var life = 0;
function Start()
{
	animationHeight = Screen.height+guiEffectStart;
	animationWidth = Screen.width+guiEffectStart;
}

function OnTriggerEnter()
{
	Debug.Log("wpadl do lawy");
	lava = true;
}
function OnTriggerExit()
{
	Debug.Log("wyszedł z lawy");
	lava = false;
}
function LateUpdate()
{
if (lava == true)
	{
		
		if (!startFlag)
		{
			steamSound.audio.volume = 1;
		    steamSound.audio.Play();
			startFlag = true;
			if (burningScaling<30)
				burningScaling = guiEffectStart*burningDamage/(life+0.1);
		}
		if (alphaValue <= 1)
			alphaValue += 0.05; //and assign the value of it to a variable
		
		if (animationWidth-burningScaling>Screen.width+guiEffectEnd)
			animationWidth -= burningScaling;
		if (animationHeight-burningScaling>Screen.height+guiEffectEnd)
			animationHeight -= burningScaling;
		if (life>0)
			life -=burningDamage;
		else
		{
			SpecjalBehaviour.movement = false;
			lavaDeath = true;
		}
	}
else
	{
		if (alphaValue > 0)
			alphaValue -= 0.02; //and assign the value of it to a variable
		
		if (animationWidth+burningScaling<=Screen.width+guiEffectStart+guiEffectEnd)
			animationWidth += burningScaling/2;
		if (animationHeight+burningScaling<=Screen.height+guiEffectStart+guiEffectEnd)
			animationHeight += burningScaling/2;
		if(steamSound.audio.volume <= 0)
			steamSound.audio.Stop();
		else
			steamSound.audio.volume -= 0.1;
			
		startFlag = false;
	}
}

function OnGUI () {
	var colPreviousGUIColor : Color = GUI.color; //assign variable to current GUI color (just in case you're using a different value other than default)
	GUI.color = new Color(colPreviousGUIColor.r, colPreviousGUIColor.g, colPreviousGUIColor.b, alphaValue); //Assign new color to GUI, only affecting the alpha channel
	if (alphaValue>0)//burning animation support
	{
		if (i>=movieFrame.length-1)
			i=0;
		else
			i++;
		wait(movieSpeed);
		GUI.DrawTexture(new Rect((animationWidth-Screen.width)/-2,(animationHeight-Screen.height)/-2, animationWidth, animationHeight), movieFrame[i]); //exist until visible
		
	}
	GUI.color = colPreviousGUIColor; //Reset alpha and color.
	DrawWithoutAlpha();
} 
function DrawWithoutAlpha()
{
    var colPreviousGUIColor : Color = GUI.color; //assign variable to current GUI color (just in case you're using a different value other than default)
	GUI.color = new Color(colPreviousGUIColor.r, colPreviousGUIColor.g, colPreviousGUIColor.b, alphaValuePlain); //Assign new color to GUI, only affecting the alpha channel
	if (lavaDeath)
	{
		alphaValuePlain+=0.0035;
		GUI.DrawTexture(new Rect (0, 0, animationWidth, animationHeight), redPlain); //exist until visible
	}
}

function wait(time)
{
	yield WaitForSeconds(time);
}



