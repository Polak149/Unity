var enableUnderlavaEffect = true;
var lavaLevel = 20;
var enableDeathLavaAnimation = true;

var playerObject : GameObject;
var steamSound : GameObject;
var screamSound : GameObject;
var cameraObject : GameObject; 
var lightObject : GameObject;

private var steamFlag = false;
private var i = 0.0;
private var originalColour;
originalColour = renderer.material.color;
private var playerPos:Vector3;
playerPos = playerObject.transform.position;

private var RotZ;
RotZ = transform.eulerAngles.z;
private var x;
private var y;
private var z;
private var r;
r = transform.localPosition.z;
private var angleX;
private var angleY;
private var positionZ;
positionZ = transform.localPosition.z;
private var positionY;
positionY = transform.localPosition.y;
private var positionX;
positionX = transform.localPosition.x;

function FixedUpdate() {
	
	//rotating and moving object as camera is looking
	angleX = cameraObject.transform.eulerAngles.x* Mathf.PI/180;
	angleY = cameraObject.transform.eulerAngles.y* Mathf.PI/180;
	playerPos = playerObject.transform.position;

	//rotating Underlava plain as camera goes
	transform.eulerAngles = new Vector3((-1)*cameraObject.transform.eulerAngles.x+90, playerObject.transform.eulerAngles.y+180, RotZ);
	//moving Underlava plain as camera goes
	angleX = cameraObject.transform.eulerAngles.x * Mathf.PI/180;
	y = r*Mathf.Sin(angleX);
	z = r-r*Mathf.Cos(angleX);
		
	transform.localPosition.z = positionZ - z;
	transform.localPosition.y = positionY - y;
	
	//main function
	if(playerPos.y<lavaLevel+12 && enableUnderlavaEffect == true)
	{
		if (i<=1 && i>=0)
			i+=0.01;
		
		renderer.renderer.material.color = new Color(originalColour.r, originalColour.g, originalColour.b, i);
		lightObject.light.intensity = 8;
		if (enableDeathLavaAnimation==true)
		{
			//Disabling any movement
		
			SpecjalBehaviour.DisableMovement();
			
			// camera rotation
			if (cameraObject.transform.eulerAngles.x>0 && cameraObject.transform.eulerAngles.x<=90)
				cameraObject.transform.eulerAngles.x -=5;
			if (cameraObject.transform.eulerAngles.x<360 && cameraObject.transform.eulerAngles.x>=270)
				cameraObject.transform.eulerAngles.x +=5;
			
			//sinking
			if (playerObject.transform.position.y >22)
				playerObject.transform.position.y -= 0.1;
			
			//sound of burning in lava
			if (steamFlag == false)
			{
				screamSound.audio.Play();
				steamSound.audio.Play();				
				steamFlag = true;
			}
		}
	}
	else
	{
		i=0;
		steamFlag = false;
		renderer.material.color = new Color(originalColour.r, originalColour.g, originalColour.b, i);
		lightObject.light.intensity = 0;
	}
	
}