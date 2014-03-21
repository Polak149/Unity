var cam : GameObject;
var arm : GameObject;
private var angle;

private var r = 20;
private var angleX;
private var z;
private var y;
private var positionZ;
positionZ = cam.transform.localPosition.z;
private var positionY;
positionY = cam.transform.localPosition.y;

function LateUpdate () {

if (LavaTrigger.lavaDeath==false)
{
	angle = cam.transform.localEulerAngles.x;
	if (angle < 270)
		angle += 360;
	if (angle >270*3/4)
		angle = angle *3/4;

		arm.transform.eulerAngles.x -= angle+160;
}

}
