//need as child to character controler:
//camera
//wings
//object with glide sound
//object with air dash sound

var cam : GameObject; 
var glideSound : GameObject;
var screamSound : GameObject;
var dashSound : GameObject;
static var gliding : boolean = false;

var speed = 100.0; //movment speed
var gravity = 1.5; // more mean faster diving
var dashSpeed = 1000; //how long and fast supposed be dash;
var allowDash = true; //if dash is allowed
var doubleTab =0.3;
var dashProtector = 50; //Time needed before next dash
var maxHeight = 1000;
var minHeight = 3;

private var screamSoundFlag = false;

private var cameraShake;
private var gravityAddonalSpeed = 0.0;

//cam = transform.Find("Main Camera").gameObject.GetComponent(Camera);
private var ButtonCooler : float = doubleTab;
private var ButtonCount : int = 0;

static var ForwardDash=0;
static var BackwardDash=0;
static var LeftDash=0;
static var RightDash=0;
private var dashFlag = false;

private var dashProtectorTemp = dashProtector;
private var moveDirection : Vector3;

//glideSound = GameObject.Find("glide sound");
private var glideSoundFlag = false;
glideSound.audio.volume = 0;

function FixedUpdate() {
		//dash support
		
		if (allowDash)
		{
			if (ForwardDash>0) //mean also that forward dash is activated
			{
				ForwardDash -= dashSpeed/20; //more in denominator mean shorter dash;
			
				if (ForwardDash<0) //reset
				{
					ForwardDash = 0;
				}
			}
			if (BackwardDash>0) //mean also that backward dash is activated
			{
				BackwardDash -= dashSpeed/20; //more in denominator mean shorter dash;
			
				if (BackwardDash<0) //reset
				{
					BackwardDash = 0;
					
				}
			}
			if (LeftDash>0) //mean also that backward dash is activated
			{
				LeftDash -= dashSpeed/20; //more in denominator mean shorter dash;
			
				if (LeftDash<0) //reset
				{
					LeftDash = 0;
				}
			}
			if (RightDash>0) //mean also that backward dash is activated
			{
				RightDash -= dashSpeed/20; //more in denominator mean shorter dash;
			
				if (RightDash<0) //reset
				{
					RightDash = 0;
				}
			}
		}
		//Camera Shake
		if (cam.transform.eulerAngles.x<=270 && cam.transform.eulerAngles.x>=20)
			cameraShake = CameraShake.CameraShake(gravityAddonalSpeed);
		else
			cameraShake = Vector3(0,0,0);
	    //act of move
	    
	    //sinking in lava
		Debug.Log(LavaTrigger.lavaDeath);
		if (LavaTrigger.lavaDeath == true)
		{
			if (screamSoundFlag==false)
			{
				screamSound.audio.Play();
				screamSoundFlag = true;
			}
			if (transform.position.y>22)
				transform.position.y -= 0.1;
			screamSound.audio.volume -=0.005;
		}
	    if (SpecjalBehaviour.movement == true)
	    {
		    //compute some glide
			
			if (glideSoundFlag == false && glideSound.audio.volume > 0)
			{
			  	glideSound.audio.Play();
			   	glideSoundFlag = true;
			}
			if (glideSound.audio.volume <= 0)
			{
			  	glideSoundFlag = false;
			}
		    if (Input.GetAxis("Vertical")>0)
		    {
		    	if (gravityAddonalSpeed < Mathf.Sin(cam.transform.eulerAngles.x* Mathf.PI/180)*speed && Input.GetAxis("UpDown")<=0)
		    	{
		    		// audio glide support
					gravityAddonalSpeed += gravity;
					glideSound.audio.volume = gravityAddonalSpeed/speed;
					gliding = true;
					
				}
				else 
				{	
					if (gravityAddonalSpeed>0)
						gravityAddonalSpeed -= gravity*Mathf.Abs(Mathf.Sin(cam.transform.eulerAngles.x* Mathf.PI/180));
					else
						gliding = false;
					glideSound.audio.volume = gravityAddonalSpeed/speed;
					
				}
		    }
		   	else
		   	{
		   		gravityAddonalSpeed = 0;
		   		glideSound.audio.volume = 0;
		   		gliding = false;
		   	}	    
		   	
		    moveDirection = cam.transform.TransformDirection(Vector3.forward);  
			
			//forward and backward
			moveDirection.z =Input.GetAxis("Vertical")*(speed+gravityAddonalSpeed)+ForwardDash/2-BackwardDash/2;
			//left and right
			moveDirection.x =Input.GetAxis("Horizontal")*(speed+gravityAddonalSpeed)+RightDash-LeftDash;
			moveDirection.x += cameraShake.x;
			//up and down
			if(transform.position.y<=maxHeight && transform.position.y>=minHeight)
		   	{
				moveDirection.y *=Input.GetAxis("Vertical")*(speed+gravityAddonalSpeed)+ForwardDash/2-BackwardDash/2;
				moveDirection.y +=Input.GetAxis("UpDown")*speed;
				moveDirection.y += cameraShake.y;
				//tu gdzies opadaie w lavie
			}
			else
			{
				moveDirection.y = -50;
			}
		    moveDirection = transform.TransformDirection(moveDirection);
		 }
		 else //disabling movement 
		 {
		 	moveDirection.y =0;
		 	
		 	if (moveDirection.x >=-5 && moveDirection.x <=5)
		 		moveDirection.x = 0;
		 	else if (moveDirection.x>5)
		 		moveDirection.x -=5;
		 	else if (moveDirection.x <-5 )
		 		moveDirection.x +=5;
		 	
		 	if (moveDirection.z >=-5 && moveDirection.z <=5)
		 		moveDirection.z = 0;
		 	else if (moveDirection.z>5)
		 		moveDirection.z -=5;
		 	else if (moveDirection.z <-5 )
		 		moveDirection.z +=5;
		 		
		 	cam.transform.eulerAngles.x = cam.transform.eulerAngles.x; //disabling cam
		 	
		 	glideSound.audio.Stop();
		 }
         var controller : CharacterController = GetComponent(CharacterController);
		 var flags = controller.Move(moveDirection * Time.deltaTime);
		
		
		//dash detector
		
		//protection from to fast dashing after last dash
		if (dashProtectorTemp>0) 
	   		dashProtectorTemp -= 1 * Time.deltaTime ;
	   	//protection from uncontrol dash
	   	if (Input.GetKeyUp(KeyCode.A) || Input.GetKeyUp(KeyCode.W) || Input.GetKeyUp(KeyCode.S) || Input.GetKeyUp(KeyCode.D))
	   	{
	   		dashFlag = true;
	   	}
		   		
	    if (allowDash && dashProtectorTemp<=0)
		{
			//forward dash
		    if (Input.GetKeyDown(KeyCode.W))
		    {
		    	if (dashFlag && ButtonCooler > 0 && ButtonCount == 1/*Number of Taps you want Minus One*/)
		    	{
		    		//forward dash is activated
		    		dashProtectorTemp = dashProtector;
		    		ForwardDash=dashSpeed;
		    		dashSound.audio.Play();
		    		dashFlag = false;
		      	}
		      	else
		      	{
		        	ButtonCooler = doubleTab; 
		        	ButtonCount += 1 ;
		      	}
		   	}
		   	//backward dash
		    if (Input.GetKeyDown(KeyCode.S))
		    {
		    	if (dashFlag && ButtonCooler > 0 && ButtonCount == 1/*Number of Taps you want Minus One*/)
		    	{
		    		//backward dash is activated
		    		dashProtectorTemp = dashProtector;
		    		BackwardDash=dashSpeed;
		    		dashSound.audio.Play();
		    		dashFlag = false;
		      	}
		      	else
		      	{
		        	ButtonCooler = doubleTab ; 
		        	ButtonCount += 1 ;
		      	}
		   	}
		   	//left dash
		   	if (Input.GetKeyDown(KeyCode.A))
		    {
		    	if (dashFlag && ButtonCooler > 0 && ButtonCount == 1/*Number of Taps you want Minus One*/)
		    	{
		    		//backward dash is activated
		    		dashProtectorTemp = dashProtector;
		    		LeftDash=dashSpeed;
		    		dashSound.audio.Play();
		    		dashFlag = false;
		      	}
		      	else
		      	{
		        	ButtonCooler = doubleTab ; 
		        	ButtonCount += 1 ;
		      	}
		   	}
		   	//right dash
		   	if (Input.GetKeyDown(KeyCode.D))
		    {
		    	if (dashFlag && ButtonCooler > 0 && ButtonCount == 1/*Number of Taps you want Minus One*/)
		    	{
		    		//backward dash is activated
		    		dashProtectorTemp = dashProtector;
		    		RightDash=dashSpeed;
		    		dashSound.audio.Play();
		    		dashFlag = false;
		      	}
		      	else
		      	{
		        	ButtonCooler = doubleTab ; 
		        	ButtonCount += 1 ;
		      	}
		   	}
		   	
		    if (ButtonCooler>0) //double tab reset
		   		ButtonCooler -= 1 * Time.deltaTime ;
		    else
		    {
		    	dashFlag = false;
		   		ButtonCount = 0 ;
		   	}
		} 
	        
}

@script RequireComponent(CharacterController)