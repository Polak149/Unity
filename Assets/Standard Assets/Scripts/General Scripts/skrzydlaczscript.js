var speed : float;
var radius : float;
var rotationOffset : float;
var randomAngle : boolean;
var changeDirection : boolean;
private var angle;
private var x;
private var z;
private var oryginalX;
private var oryginalZ;
private var rotationAngle;

function Start()
{
	//randomize starting angle and setting object rotation
	if (randomAngle)
	{
		angle = Random.Range(0.0,360.0)* Mathf.PI/180;
		transform.eulerAngles.y = angle*180/Mathf.PI + rotationOffset;
	}
	else
		angle = rotationOffset;

	// saving oryginal position 
	oryginalX = transform.position.x;
	oryginalZ = transform.position.z;
}

function Update () {
		if (!changeDirection)
		{
			angle += speed*Mathf.PI/180;
			transform.eulerAngles.y = -angle*180/Mathf.PI + rotationOffset;
		}
		else
		{
			angle -= speed*Mathf.PI/180;
			transform.eulerAngles.y = -angle*180/Mathf.PI - rotationOffset;
		}
		
		if (angle>2*Mathf.PI)
		{
			angle -=2*Mathf.PI;
		}
		
		x = Mathf.Cos(angle)*radius;
		z = Mathf.Sin(angle)*radius;

	    transform.position.x = oryginalX + x;
	    transform.position.z = oryginalZ + z;
	    
}