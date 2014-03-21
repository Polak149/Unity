private static var angle;
private static var x;
private static var y;
private static var moveDirection;

static function CameraShake (r) {
	if (r>0)
	{
		angle = Random.Range(0.0,360.0)* Mathf.PI/180;
		x = Mathf.Cos(angle)*r;
		y = Mathf.Sin(angle)*r;
	
		return Vector3(x,y,0);
	}
	else
	{
		return Vector3(0,0,0);
	}
}