var soundclip : AudioClip;

var TextObject : GameObject;

function Start () 
{
	// Let's wait for the sytem to finsh loading...
	yield WaitForSeconds (2);
	while ( true ) // This is an endless loop, bu we want it this way for the demo...
	{
		var lines_of_data = new Array();
		
		// Okay, let's start animating the skeleton.  While this is not a part of MetaMorph, it
		// 		does show how skeletal animation and mesh deformation can work together.
		animation.Play("Sing", PlayMode.StopAll);
		
		// Let's start a Morph animation from an exported blender ShapeKey animation file.
		// We run these by name.
			Display_Text(lines_of_data, "Playing 0 Seconds.......................");
			Display_Text(lines_of_data, "Example of running an animation synched to bones and music...");
			
			var aanimation = "Charon Sing";
			mm_Animate_Play( aanimation, 1.0, 0 );
		
		// Why are we waiting if MetaMorph can synch?  Sound does not always synch the same between systems.
		// 		In this case, there seems to be a 0.2 second differance between blender playing the song, and Unity
		// 		It may not always be this large of a gap, or might be larger.  
		yield WaitForSeconds (0.2);
		
		// Play the sound file "I'm your Moon" by Jonathan Coulton
		// 		http://www.jonathancoulton.com/2006/08/25/thing-a-week-47-im-your-moon/
		// 		Thanks for the demo song!  In exchange, I now share a Charon MoonMon model,
		//		the MetaMorph codebase, and anything else in this Unity Pak...
		audio.PlayOneShot(soundclip);
		
		// Let's let the Bones, Morph, and Sound play out...
		yield WaitForSeconds (10);
			Display_Text(lines_of_data, "Playing 10 Seconds.......................");
			Display_Text(lines_of_data, "Example of running a morph while an animation is running: Smile!");
			mm_Morph_Add( "Charon-Smile", 0.0, 1.0, 1.0); 
			
		yield WaitForSeconds (10);
			Display_Text(lines_of_data, "Playing 20 Seconds.......................");
			Display_Text(lines_of_data, "Example of running multiple morphs while an animation is running: Wink!");
			mm_Morph_Add( "Charon-Left Eye Close", 0.0, 1.0, 0.1); 
			mm_Morph_Add( "Charon-Cheek Up Left", 0.0, 1.0, 0.1); 
			mm_Morph_Add( "Charon-Brow-Left", 0.0, 1.0, 0.1); 
		yield WaitForSeconds (1);
			Display_Text(lines_of_data, "And kill the morphs to unwink...");
			mm_Morph_Remove( "Charon-Left Eye Close", 0.3); 
			mm_Morph_Remove( "Charon-Cheek Up Left", 0.3); 
			mm_Morph_Remove( "Charon-Brow-Left", 0.3); 
			
		yield WaitForSeconds (9);
			Display_Text(lines_of_data, "Playing 30 Seconds.......................");
			yield WaitForSeconds (1);
			Display_Text(lines_of_data, "In a few moments, that animation we started a while back will do something...");
			yield WaitForSeconds (1);
			Display_Text(lines_of_data, "(Yes, not only is it still going, it staying synched with the bones 35 seconds later)");
			yield WaitForSeconds (1);
			Display_Text(lines_of_data, "And let's turn off the smile for this...");
			mm_Morph_Remove( "Charon-Smile", 0.5); 
			
		yield WaitForSeconds (7);
			Display_Text(lines_of_data, "Playing 40 Seconds.......................");
			yield WaitForSeconds (1);
			Display_Text(lines_of_data, "See?  Nice huh?  Some day I may finish this lipsynch.  Maybe...");
			yield WaitForSeconds (1);
			Display_Text(lines_of_data, "It still shows that long morph animations can be used with bones for character work...");
			yield WaitForSeconds (1);
		yield WaitForSeconds (7);
			Display_Text(lines_of_data, "Playing 40 Seconds.......................");
			yield WaitForSeconds (1);
			Display_Text(lines_of_data, "Time to clean up...  Killing bone animation, song, and any the animation is still running (which it is not.)");
			// Let's clean up after ourselves, shall we?
			yield WaitForSeconds (1);
			// Stop the audio
			audio.Stop();	
			
			// Stop the bones
			animation.Stop("Sing");
			
			// And an example of how to check is an animation is still running and kill it if it is...
			result = mm_Animate_Frame( aanimation );
			// Why return an array?  For nulls.  Null means it's no longer playing.
			// zero just means it may be on the first frame.
			if (result == null)
			{
				Display_Text(lines_of_data, "Charon Sing is done!");
			}
			else
			{
				Display_Text(lines_of_data, "Charon Sing still playing at: " + result[0]);
				Display_Text(lines_of_data, "Stopping "+aanimation);
				mm_Animate_Stop( aanimation, 1 );
			}
		
		yield WaitForSeconds (10);
			Display_Text(lines_of_data, "Okay, At the bottom of the script PlayMoon.js is a basic API manual.  You have a lot of options...");
			yield WaitForSeconds (1);
			Display_Text(lines_of_data, "Feel free to use this script to try them out and see how they work...");
			yield WaitForSeconds (1);
			Display_Text(lines_of_data, "The MetaMorph.js is the actual program that does the morph work...");
			yield WaitForSeconds (1);
			Display_Text(lines_of_data, "Everything is commented, so be sure to have a look around... ");
			yield WaitForSeconds (1);
			Display_Text(lines_of_data, "Modding this for your own use is why we gave away the source code.");
			yield WaitForSeconds (1);
			Display_Text(lines_of_data, "Be sure to thank Rezzable.com and Heritage-Key.com for allowing this code to go public.");
		
			yield WaitForSeconds (5);
			Display_Text(lines_of_data, "And now for something totally wierd...");
			yield WaitForSeconds (3);
			animation.Play("Melt", PlayMode.StopAll);
			mm_Animate_Play( "Charon Melt", 1.0, 1 );
			yield WaitForSeconds (5);			
			
			Display_Text(lines_of_data, "Looping Demo in 10 seconds...");
		
		yield WaitForSeconds (8);
			animation.Play("Sing", PlayMode.StopAll);
			mm_Animate_Stop( "Charon Melt", 0.0 );
			yield WaitForSeconds (0.1);
			animation.Stop();
		yield WaitForSeconds (2);
			mm_SetShape_Reset( );
		
		//And loop...
	}
}


// --------------------------------------------------------------------------------------------------------------------------------------------
// METAMORPH LINK CODE.  API INFORMATION FOLLOWS.
// --------------------------------------------------------------------------------------------------------------------------------------------

// ----------------------------------------------------------------------
// The following code allows easy relay to the metamorph script.  
// You can just call directly instead of relaying, but this was
// Added for ease-of-use.
// ----------------------------------------------------------------------

var MetaMorphScriptObject : GameObject;  // This is the object the MetaMorph Script is in.  You could assign this by code of Inspector...

// Used for function mm_Animate_Play below.
private var Animation_Style_End : int = 0;
private var Animation_Style_Freeze : int = 1;
private var Animation_Style_Loop : int = 2;
private var Animation_Style_PingPong : int = 3;


// Morph Functions

function mm_Morph_Add( Morph_Name : String, Start_Level : float, End_Level : float, TimeFrame : float )
{
	// Morph_Name: this is the name of the morph, as designated in Diff_Maps.Name
	// Start_Level: sets the starting morph level.  normally, you would use zero to start
	// End_Level: The morph level you want to end up at.
	// TimeFrame: How long to take to fade from start to end.
	
	// Keep in mind, even when the morph has finished timeframe, it's still morphing the mesh every frame until stopped by mm_Morph_Remove.
	// If you want to have a morph be added 'permanenty' to the mesh, use mm_SetShape_Set.
	// These work with mm_Animate_Play, allowing you to use morphs while animations are running.
	// This is good for things like randomized blinking, for example.
	
	// morph effects are additive, meaning that two morphs with overlapping effects do not average, they add to each other.

	link = test_MetaMorph_Link(MetaMorphScriptObject);
	link.GetComponent(MetaMorph).mm_Morph_Add( Morph_Name, Start_Level, End_Level, TimeFrame );
}

function mm_Morph_Remove(Morph_Name : String, TimeFrame : float)
{
	// Morph_Name: this is the name of the morph to stop effecting the mesh.
	// TimeFrame: is how long it takes for the morph to fade out.

	link = test_MetaMorph_Link(MetaMorphScriptObject);
	link.GetComponent(MetaMorph).mm_Morph_Remove( Morph_Name, TimeFrame );
}

function mm_Morph_Level( Morph_Name : String ) : Array // [float]
{
	// Morph_Name: this is the name of the morph you are questing information on.
	// If the returned array is null, then the morph is not active.  Otherwise, array[0] is a float of how much the morph is effecting the mesh.

	link = test_MetaMorph_Link(MetaMorphScriptObject);
	return (link.GetComponent(MetaMorph).mm_Morph_Level( Morph_Name ));
}

function mm_Morph_Playing(  ) : Array // strings
{
	// Morph_Name: this is the name of the morph you are questing information on.
	
	// returns an array of all the morphs (not animations or Setshapes) effecting the mesh. 
	
	link = test_MetaMorph_Link(MetaMorphScriptObject);
	return (link.GetComponent(MetaMorph).mm_Morph_Playing( ));
}

// Animation Functions

function mm_Animate_Play( Morph_Animation_Name : String, Speed_Multiple : float, Style : int )
{
	// Morph_Animation_Name: The name of the animation you are starting from Animation_Recordings.Name
	// Speed_Multiple: This allows you to speed up and slow down an animation.  1.0 is normal.  Higher is faster.  Lower is slower.
	// Style: Animation_Style_End = 0, Animation_Style_Freeze = 1, Animation_Style_Loop 2, Animation_Style_PingPong = 3
	
	// These are NOT morphs, though they use Morph data.  They are datastreams of morph levels stored by frame.
	// They are use to play back complex animation from Blender 3d made with shapekeys.
	
	// Starts playing an animation.
	
	link = test_MetaMorph_Link(MetaMorphScriptObject);
	link.GetComponent(MetaMorph).mm_Animate_Play( Morph_Animation_Name, Speed_Multiple, Style );
}

function mm_Animate_Stop( Morph_Animation_Name : String, Ease_Out : float )
{
	// Morph_Animation_Name: Name of the animation to stop.
	// Ease_Out: How long to take easing out of the animation running.

	// stops an animation by fading it out.  To fade it out instantly, use and ease_out of zero.
	
	link = test_MetaMorph_Link(MetaMorphScriptObject);
	link.GetComponent(MetaMorph).mm_Animate_Stop( Morph_Animation_Name, Ease_Out );
}

function mm_Animate_Frame( Morph_Animation_Name : String ) : Array // [int]
{	
	// Morph_Animation_Name: Name of the animation to get the current frame from.
	// returns the current frame of the animation.
	
	// returns the current frame being played of the named animation.
	
	link = test_MetaMorph_Link(MetaMorphScriptObject);
	return (link.GetComponent(MetaMorph).mm_Animate_Frame( Morph_Animation_Name ));
}

// gives a list of the names of currently playing animations.
function mm_Animate_Playing( ) : Array // strings
{
	// returns a list of the names of currently playing animations.
	
	link = test_MetaMorph_Link(MetaMorphScriptObject);
	return (link.GetComponent(MetaMorph).mm_Animate_Playing( ));
}

// ----------------------------------------------------------------------
// SetShape Functions
// ----------------------------------------------------------------------

function mm_SetShape_Set(	Morph_Name : String, Morph_Level : float )
{
	// Morph_Name: Name of the morph to apply.
	// Morph_Level: How much to apply it. 1.0 is fully.

	// With this, you can set a morph shape into the default mesh.
	// This means no FPS cost for it to be visible, but a large cost to set it.
	// Do NOT call this per frame.  Use the mm_Morph set of functions to animate getting to a shape, and then kill the morph while setting the shape.
	// It stacks, so each new shape added is added to all the previous ones.
	link = test_MetaMorph_Link(MetaMorphScriptObject);
	link.GetComponent(MetaMorph).mm_Animate_Play( Morph_Name, Morph_Level,0 );
}

function mm_SetShape_Reset( )
{

	// This function resets the modded mesh back to the default.
	// Again, this is for SetShape, and does not effect morphs or animations.

	link = test_MetaMorph_Link(MetaMorphScriptObject);
	link.GetComponent(MetaMorph).mm_SetShape_Reset( );
}

// ----------------------------------------------------------------------
// Tool Functions
// ----------------------------------------------------------------------

// This is a debug function.
// It's not needed, but tries to find the metamorph script in the MetaMorphScriptObject, then the same object, and then just complains and quits...
function test_MetaMorph_Link(MetaMorphObj : GameObject)
{
	var ActualMetaMorphObj : GameObject;
	if(MetaMorphObj.GetComponent(MetaMorph))
	{
		ActualMetaMorphObj = MetaMorphObj;
	} 
	else if (!gameObject.GetComponent(MetaMorph))
	{
		ActualMetaMorphObj = gameObject;
	} 
	else 
	{
		Debug.Log("Cannot find Object with MetaMorph Script.");
		Debug.Break();
	}
	
	return ActualMetaMorphObj;
}

// This tool just outputs the text to the debug window and text mesh...
function Display_Text(lines_of_data : Array , textdata : String) : Array
{

	lines_of_data.Add(textdata);
	
	if (lines_of_data.length > 8)
	{
		lines_of_data.RemoveAt(0);
	}
	
	var textbox : String = "";
	
	for (var x : int = 0 ; x < lines_of_data.length ; x++)
	{
		textbox = textbox + lines_of_data[x] + "\n";
	}
	
	TextObject.GetComponent(TextMesh).text = textbox;
	print (textdata);
		
	return lines_of_data;
}
