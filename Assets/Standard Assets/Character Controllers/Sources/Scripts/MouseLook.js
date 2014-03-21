enum RotationAxes {MouseX, MouseY, MouseXandY};
var axes : RotationAxes;
private var MouseX = RotationAxes.MouseX;
private var MouseY = RotationAxes.MouseY;
private var MouseXandY = RotationAxes.MouseXandY;
private var angleX;
private var y;
private var x;
private var positionY;
private var positionX;
private var rotationX;



var sensitivityX : float = 15F;
var sensitivityY : float = 15F;
var minimumX : float = -360F;
var maximumX : float = 360F;
var minimumY : float= -60F;
var maximumY : float = 60F;
var rotationY : float = 0F;
var spineLength : float = 0F;
 
function Update ()
{
    if (SpecjalBehaviour.movement == true)
    {
	    if (axes == MouseXandY)
	    {
	       var rotationX : float = transform.localEulerAngles.y + Input.GetAxis("Mouse X") * sensitivityX;
	       rotationY += Input.GetAxis("Mouse Y") * sensitivityY;
	       rotationY = Mathf.Clamp (rotationY, minimumY, maximumY);
	       transform.localEulerAngles = Vector3(-rotationY, rotationX, 0);
	    }
	 
	    else if (axes == MouseX)
	    {
	       transform.Rotate(0, Input.GetAxis("Mouse X") * sensitivityX, 0);
	    }
	 
	    else
	    {
	  	 	if (transform.localEulerAngles.y!=90)
				transform.localEulerAngles.y = 90;
		//	if (transform.localEulerAngles.z!=90)
		//		transform.localEulerAngles.z = 90;
	       rotationY += Input.GetAxis("Mouse Y") * sensitivityY;
	       rotationY = Mathf.Clamp (rotationY, minimumY, maximumY);
	       transform.localEulerAngles = new Vector3(-rotationY, transform.localEulerAngles.y, 0);
	       
	       angleX = rotationX - transform.eulerAngles.x * Mathf.PI/180;
		   y = -spineLength*Mathf.Cos(angleX);
		   x = spineLength*Mathf.Sin(angleX);
		
		   transform.localPosition.x = positionX + x;
		   transform.localPosition.y = positionY + y;
	    }
	 }
//	 transform.localEulerAngles.z+=90;
}
 
function Start ()
{
	positionY = transform.localPosition.y;
	positionX = transform.localPosition.x;
	rotationX = transform.eulerAngles.x * Mathf.PI/180;
    // Make the rigid body not change rotation
    if (rigidbody)
       rigidbody.freezeRotation = true;
}
