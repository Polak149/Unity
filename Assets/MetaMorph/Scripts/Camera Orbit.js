//orbital camera script 
#pragma strict 

var sens = 0.02; //mouse sensitivity 
var target : Transform; //camera target 

var camdistance : float = 5.0; //distance of the camera 
var camdistanceProper : float = 5.0; 

var camdistanceMin : float = 1.0; 
var camdistanceMax : float = 10.0; 

var camgapfromwall : float = 1.0; 

private var x : float = 0.0; 
private var y : float = 0.0; 
var minX : float = -75; //vertical limit x-axis 
var maxX : float = 75; //vertical limit x-axis 
private var camera1 : Transform; 
private var point : Vector3; 

@script AddComponentMenu("Camera Config/Orbital Camera") 

function Start()
{ 
	var angleX = gameObject.transform.eulerAngles; 
	x = angleX.y = 0; 
	y = angleX.x = 180; 
	camera1 = gameObject.transform; 
} 

function LateUpdate () 
{ 
   if(target)
   { 
		y += Input.GetAxis("Mouse X") * sens * 250; 
		x -= Input.GetAxis("Mouse Y") * sens* 120; 
		x = VerticalLimit(x, minX, maxX); 
		y = VerticalLimit(y, -360, 360); 
	  
		if (Input.GetAxis("Mouse ScrollWheel") < 0) // back
		{
			camdistanceProper = Mathf.Clamp(camdistanceProper + .5,camdistanceMin,camdistanceMax);
		}
		if (Input.GetAxis("Mouse ScrollWheel") > 0) // forward
		{
			camdistanceProper = Mathf.Clamp(camdistanceProper - .5,camdistanceMin,camdistanceMax);
		}

       
      var rotation = Quaternion.Euler(x,y,0); //camera rotation based on mouse movement 
      //updates camera position to orbit the target 
      var position = rotation * Vector3(0.0, 0.0, - camdistance) + target.position; 
	  
       
      //applies the rotation and position values 
      camera1.rotation = rotation; 
      camera1.position = position; 
	  
      var hit : RaycastHit; // raycasthit 
      //raycast between the camera and the target 
      //if (Physics.Linecast (target.position, camera1.position, hit))
      if (Physics.Linecast (target.position, rotation * Vector3(0.0, 0.0, - camdistanceProper) + target.position, hit))
	  { 
         camdistance = hit.distance - camgapfromwall; //makes the camera come forth 
         point = hit.point; //last position of the raycast hit. 
         Debug.Log(hit.transform.name); 
      //makes the camera move back when the distance from the last hit and camera are greater than 0.3 
      } else if(Vector3.Distance(camera1.position, point)  > camgapfromwall)
	  { 
         //smooth movement back to 5m 
		 //camdistance = Mathf.Lerp(camdistance, camdistanceProper, Time.time);
         camdistance += 20 * Time.deltaTime; 
		 
         //keeps the distance at a max of 5m 
         camdistance = Mathf.Clamp(camdistance, 0, camdistanceProper); 
      }
       
   }    
     
} 


//vertical angle limitation function 
function VerticalLimit (angle : float, minimum : float, maximum : float){ 
   if (angle < -360) 
   { 
      angle += 360; 
   } 
   if (angle > 360)
   { 
      angle -= 360; 
   } 
   return Mathf.Clamp(angle, minimum, maximum); 
}