var target1 : Transform;
var target2 : Transform;
var damping1 = 6.0;
var damping2 = 6.0;
var smooth = true;
var waitTime = 10.0;

private var rotation;
private var timer : float = 0;

function LateUpdate () {
	if (LavaTrigger.lavaDeath==true)
	{
		if (target1 && target2) {
			if (timer < waitTime)
			{
				if (smooth)
				{
					// Look at and dampen the rotation
					rotation = Quaternion.LookRotation(target1.position - transform.position);
					transform.rotation = Quaternion.Slerp(transform.rotation, rotation, Time.deltaTime * damping1);
				}
				else
				{
					// Just lookat
				    transform.LookAt(target1);
				}
			}
			else
			{
				if (smooth)
				{
					// Look at and dampen the rotation
					rotation = Quaternion.LookRotation(target2.position - transform.position);
					transform.rotation = Quaternion.Slerp(transform.rotation, rotation, Time.deltaTime * damping2);
				}
				else
				{
					// Just lookat
				    transform.LookAt(target2);
				}
			}
			Debug.Log(timer);
			timer += Time.deltaTime;
		}
	}
}

function Start () {
	// Make the rigid body not change rotation
   	if (rigidbody)
		rigidbody.freezeRotation = true;
}