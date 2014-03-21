// -----------------------------------------------------------------------
// Classes and variables for MetaMorph
// -----------------------------------------------------------------------

// MetaMorph_Settings stores key settings for the MetaMorph Toolkit. 
var MetaMorph_Settings : MetaMorph_Setting_class;

class MetaMorph_Setting_class
{
	var MM_Mesh_Object : GameObject; // This is the pointer to the mesh this script should be effecting.
	var MM_Is_Boned : boolean = true; // If true, then this mesh has bones.  false is used for meshes with no bones, 
	var MM_UV_Layer_One : boolean = true; // If true, use the first UV layer.  Otherwise use the second.
	var MM_Recalculate_Normals : boolean = false;  // This decides if "mesh.RecalculateNormals()" is run each frame the mesh is changed.  Expensive, so don't use it unless you have to.
	var MM_Only_When_Visible : boolean = true; // This sets if MetaMorph animates meshes that are not currently being seen.
	var MM_Verbose : int = 0; // 0 = quiet, 1 = notices, 2 = streaming data.
}

// Diff_Maps store the Diff Map textures that each represent a shapekey from blender.
var Diff_Maps : Diff_Map_class[];

class Diff_Map_class
{
	var Name : String; // This name acts as the ID for a shapekey item.  It needs to be the same name as the shapekey in blender.
	var DM_Image : Texture2D; // This is the DiffMap texture used to reshape the mesh
	var DM_Multiplier : float = 0.0; // This multiplier should be the same as in the animation textfiles.
	var DM_Scale : Vector3 = Vector3(1,1,1); // This allows adjustment of the shape on xyz scales.  Not normally needed.
}

// Animation_Recordings store the text files that allow keyframed shapekeys to be used from blender.
var Animation_Recordings : Animation_Recording_class[];

class Animation_Recording_class
{
	var Name : String;  // This name acts as the ID for a shapekey animation set.
	var AR_Text : TextAsset; // This is the textfile with the animation data.
}




// -----------------------------------------------------------------------
// Global variables
// -----------------------------------------------------------------------

private var Is_Visible = false; // Internal check so see if the mesh is currently visible.
private var Is_Ready = false; // Internal check so see if the mesh is finished loading data.
private var MeshChanged = 0; // Internal check so see if the mesh has changed.

private var mesh : Mesh; // Link to the mesh object.
private var Base_Mesh = new Array (); // This mesh data is the original set.  it is NEVER modified.  Backup copy for resets.
private var Mod_Mesh = new Array (); // This mesh data is used for modding and morphing.

// Storage for seam stitcher data.  This data stores the information needed to reconnect the UV seams on the mesh after a morph.
private var Seam_Verts = new Array ();
private var Seam_NextSameVert = new Array ();

// Storage for the shapes taken from Diff_Maps.  This is a paired array set.  That means they are used at the same time, and have to use the same array pointer to be useful.
// The reason the morphs use this trick to store data, is if it stored the whole mesh set from Base_Mesh, it would take to long to process every frame.  
// This way, you only pay for what is being morphed.
private var Morph_Shapes_Data = new Array (); // This data is an array of an array[Diffmap number][vector3 vert data].  It only stores the verys being moved, using Morph_Shapes_Links below to know what's relative to Base_Mesh.
private var Morph_Shapes_Links = new Array (); // This data is an array of an array[Diffmap number][links to verts in Base_Mesh].  The order of this array is relative to  Morph_Shapes_Data above.

private var Morph_Animation_Data = new Array (); // This data is an array of [animation number][line number / frame +3][individual data for each Diffmap number]. 

private var Playing_Animations = new Array (); // array [Animation_Recording#] [line] [single-entry]




// -----------------------------------------------------------------------
// Main Functions
// -----------------------------------------------------------------------

function Start()
{
	// Let's load all the animations and morphs...
	Init_MetaMorph();
}

function Update ()
{
	// Process all Morph animations...
	// Note this neat trick where we only process animations every other frame.  For facial morphs, this can be a serious saver
	// Remove it if you want...
	if (Time.frameCount % 2 == 0)
		Apply_Morphs();
}

function OnBecameInvisible () 
{
	// We need a Mehs render for this to work.  You may need to either place this script in the mesh itself, or place a mesh renderer component into the object this script is in.
	// If not, then turn off MetaMorph_Settings.MM_Only_When_Visible.
	if (MetaMorph_Settings.MM_Only_When_Visible)
	{
		Is_Visible = false;
	}
}

function OnBecameVisible() 
{
	// We need a Mehs render for this to work.  You may need to either place this script in the mesh itself, or place a mesh renderer component into the object this script is in.
	// If not, then turn off MetaMorph_Settings.MM_Only_When_Visible.
	Is_Visible = true;
}

function OnDisable()
{
	//This code resets the mesh back to normal after you quit out of the game.
	// Not sure why it doesn't reset on it's own, but there you have it.
	Mod_Mesh = Base_Mesh;
	mesh.vertices = Base_Mesh.ToBuiltin(Vector3);
	RecalcNorms();
}

// -----------------------------------------------------------------------
// Init Functions (These are called by Start, and are run only ONCE)
// -----------------------------------------------------------------------

function Init_MetaMorph()
{
	// Here we load all the data into the MetaMorph system.
	// Unti it finishes loading, commands will not really work.
	Load_Mesh_Data();
	Load_Mesh_Seams();
	Load_Diff_Maps();
	Load_Animation_Recordings();
	
	// Everything is loaded.  Let the morphing BEGIN!!!
	// Or at least become available.
	Is_Ready = true;
	
	// Oh and let seen if it is visible.
	// And or if MetaMorph_Settings.MM_Only_When_Visible is true...
	if (MetaMorph_Settings.MM_Mesh_Object.renderer.isVisible || !MetaMorph_Settings.MM_Only_When_Visible)
	{
		Is_Visible = true;
	}	
}

function Load_Mesh_Data()
{
	Report("Loading Mesh Data", 1);
	// setup mesh based on type of object.
	if (MetaMorph_Settings.MM_Is_Boned == true)
	{
		mesh = MetaMorph_Settings.MM_Mesh_Object.GetComponent(SkinnedMeshRenderer).sharedMesh ;
	} else {
		mesh = MetaMorph_Settings.MM_Mesh_Object.GetComponent(MeshFilter).mesh ;
	}
	
	Base_Mesh = mesh.vertices; // This data is for restoring the original mesh.
	Mod_Mesh = mesh.vertices;  // And this is for modding.
}

function Load_Mesh_Seams()
{
	Report("Loading Mesh Seams", 1);
	//This function finds inital overlapping verts and treats them so they ALWAYS overlap.
	// This means your mesh should never have overlapping verts that are NOT along a UV seam.
	
	// Setup the builtin array for fast data processing.
	var FastMesh : Vector3[] = Base_Mesh.ToBuiltin(Vector3);
	
	// We're going to go though every vert, and see if any other verts are 
	for ( var vert=0 ; vert<FastMesh.length ; vert++ )
	{
		Seam_NextSameVert.Add(  -1 );
		
		for ( var findvert=vert+1 ; findvert<FastMesh.length ; findvert++ )
		{
			if (FastMesh[vert] == FastMesh[findvert])
			{
				Seam_NextSameVert[vert] = findvert;
				Seam_Verts.Add(vert);
				findvert = FastMesh.length;
			}
		}
	}
	Report("Found " + Seam_Verts.length + " seam verts...",1);
}

function Load_Diff_Maps()
{
	Report("Loading Diff Maps", 1);
	
	// First, get the UV data from the mesh...
	var Base_uvs : Vector2[];	
	if (MetaMorph_Settings.MM_UV_Layer_One == true)
	{
		Base_uvs = mesh.uv;
	} else {
		Base_uvs = mesh.uv2;
	}
	
	// let's cycle through all the diff maps in Diff_Maps.
	var Diff_Map_Loop_Max : int = Diff_Maps.length;	
	for ( var Diff_Map_Loop=0 ; Diff_Map_Loop<Diff_Map_Loop_Max ; Diff_Map_Loop++ )
	{
		// Temporary variables for building 
		var Load_Diff_Map = new Array ();   
		var Load_Diff_Map_L = new Array ();
		
		if (Diff_Maps[Diff_Map_Loop].DM_Scale == Vector3(0,0,0))
		{
			Diff_Maps[Diff_Map_Loop].DM_Scale = Vector3(1,1,1);
		}
		
		// Set the name if it was not alreay set...
		if (Diff_Maps[Diff_Map_Loop].Name == "")
		{
			Diff_Maps[Diff_Map_Loop].Name = Diff_Maps[Diff_Map_Loop].DM_Image.name;
		}
		
		// Grab the Diff Map data...
		var A_Diff_Map :  Diff_Map_class = Diff_Maps[Diff_Map_Loop];
				
		// And get the parts of it we need for processing...
		var Diff_Map_Image : Texture2D = A_Diff_Map.DM_Image; 
				
		var Diff_Map_Scale : Vector3 = A_Diff_Map.DM_Scale;
				
		// We now read the mesh, uv, and Diff Map to get the shape data. and store it.
		for (var vert=0;vert<Base_uvs.length;vert++)
		{
			var UV_x : int = Base_uvs[vert].x * Diff_Map_Image.width;
			var UV_y : int = Base_uvs[vert].y * Diff_Map_Image.height;
			
			// These 
			var test_x : int = (Diff_Map_Image.GetPixel(UV_x, UV_y).r - 0.5) * 255;
			var test_y : int = (Diff_Map_Image.GetPixel(UV_x, UV_y).g - 0.5) * 255;
			var test_z : int = (Diff_Map_Image.GetPixel(UV_x, UV_y).b - 0.5) * 255;
			
			if ( !(test_x == 0 && test_y == 0 && test_z == 0) )
			{
				// Okay, now we grab the color data for the pixel under the UV point for this vert.  We then convert it to a number from -1.0 to 1.0, and multiply it by Diff_Map_Scale.
				var UVC_r : float = ((Diff_Map_Image.GetPixel(UV_x, UV_y).r / 0.5)  - 1 ) * -1 * Diff_Map_Scale.x; // Why -1?  Because the relation to blender is reversed for some reason...
				var UVC_g : float = ((Diff_Map_Image.GetPixel(UV_x, UV_y).g / 0.5)  - 1 ) * Diff_Map_Scale.y;
				var UVC_b : float = ((Diff_Map_Image.GetPixel(UV_x, UV_y).b / 0.5)  - 1 ) * Diff_Map_Scale.z;
				
				var vert_xyz_shift = Vector3 (   UVC_r, UVC_g, UVC_b);
				
				Load_Diff_Map.Add(  vert_xyz_shift );
				Load_Diff_Map_L.Add( vert);
			}
		}
		Report("Object "+name+": Diff Map '"+Diff_Map_Image.name+"' changes " + Load_Diff_Map_L.length + " out of " + Base_Mesh.length + " verts...", 2);
		
		// This part stores not only the mesh modifications for this shape, but also the indexes of the array that are being changes in the mesh.
		// This data allows us to cycle through only the mesh points that will be changed, instead of running though all of points of the mesh. 
		// Massive speed increase:  You only pay for the points you morph.
		
		Morph_Shapes_Data.Add (Load_Diff_Map); // We're storing an array into an array here.
		Morph_Shapes_Links.Add (Load_Diff_Map_L); // We're storing an array into an array here.
	}
}

function Load_Animation_Recordings()
{
	Report("Loading Animation Recordings", 1);
	
	var fileloop : int;
	for ( fileloop = 0 ; fileloop <  Animation_Recordings.length ; fileloop++)
	{
		var My_Animation_Recording :  Animation_Recording_class = Animation_Recordings[fileloop];
				
		var Animation_Array : Array = ReadAnimationFile(My_Animation_Recording.AR_Text);
		
		// Okay, we have the data for this animation kit...
		// Let's store it!
		Morph_Animation_Data.Add(Animation_Array);
		// Now it's stored in the format: Morph_Sequence_Data[animationset][frame1-xxx][name/amountmorph]
	}
}

function ReadAnimationFile(datafile : TextAsset) : Array
{
	// This read blender 3d ShapeKeys that have been exported with the diffmap.
	// It's a good idea for each animation to contained in it's own file under it's own name.
	Report("Loading Animation Recording: " + datafile.name, 2);
	var Animation_Array = new Array();
	//var Total_String = datafile.text;
		
	var Total_Array = new Array();
	Total_Array = datafile.text.Split("\n"[0]);
	
	var line : int;
	for ( line = 0 ; line<Total_Array.length ; line=line+1 )
	{
		var Line_String : String = Total_Array[line];
		
		// parse out all the crap.
		var boo = Regex.Match(Line_String,"(\\[|\\])");
		if (boo.Success)
		{
			Line_String = Regex.Replace(Line_String,"(\n|\r|\f)","");
			Line_String = Regex.Replace(Line_String,"(\\[|\\])","");
			Line_String = Regex.Replace(Line_String,"\\s*(,)\\s*","|");
			Line_String = Regex.Replace(Line_String,"'","");
			
			var Line_Array = new Array();
			Line_Array = Line_String.Split("|"[0]);
			
			var item : int;
			
			// We really want the floating point numbers to be stored as floating points, and not strings...
			if (Animation_Array.length == 0)
			{
				Animation_Array.Add(Line_Array);
				
				var Line_Array2 = new Array();
				for ( item = 0 ; item<Animation_Array[0].length ; item=item+1 )
				{
					var Found : int = FindName( Diff_Maps, [Animation_Array[0][item]] );
					if ( Found != -1)
					{
						Line_Array2.Add(Found); // Writing line two, the diff map indexes.  Faster than name lookups per frame.
					} else {
						Report("ERROR: Morph not found" + Animation_Array[0][item], 0);
						Debug.Break();
					}
				}
				Animation_Array.Add(Line_Array2);
				
			}
			else
			{
				for ( item = 0 ; item<Line_Array.length ; item=item+1 )
				{
					Line_Array[item] = parseFloat(Line_Array[item]);
					
					var Found2 : int = FindName( Diff_Maps, [Animation_Array[0][item]] );
					if ( Found2 != -1)
					{
						if (Animation_Array.length == 2 && Diff_Maps[Found2].DM_Multiplier == 0)
						{
							Diff_Maps[Found2].DM_Multiplier = parseFloat(Line_Array[item]);
						}
					}
				}
				Animation_Array.Add(Line_Array);
			}
		}
	}
	
	return Animation_Array;
}

// -----------------------------------------------------------------------
// Update Mesh Functions (These are called by Update)
// -----------------------------------------------------------------------

function Apply_Morphs()
{
	// This is where the magic happens.  All of the morphs and animations ar added together, and then applied to the mesh.
	var Morph_Array = new Array ();
	
	Morph_Array = Group_Morphs(Morph_Array);
	Morph_Array = Group_Animations(Morph_Array);
	
	// And if the mesh has changed since the last frame, we apply it.	
	if ( MeshChanged > 0 && Is_Visible == true )
	{
		// We have mesh changes!
		var Work_Mesh : Vector3[] = Mod_Mesh.ToBuiltin(Vector3);
		
		for (var Morph_Item_loop = 0 ; Morph_Item_loop < Morph_Array.length ; Morph_Item_loop++ )
		{
			// okay, we are now going to apply each animation at the proper precentage to the model.
			var Shape_Morph : Vector3[] = Morph_Array[Morph_Item_loop][0].ToBuiltin(Vector3);
			var Shape_Link : int[] = Morph_Array[Morph_Item_loop][1].ToBuiltin(int);
			var Shape_Power : float = Morph_Array[Morph_Item_loop][2];
						
			for (var Morph_Verts=0;Morph_Verts<Shape_Link.length;Morph_Verts++)
			{
				// In this case, we're only looping the vertices that MOVE.  All the rest are ignored, and this runs faster that way. 
				// You only pay for the parts you morph.
				Work_Mesh[Shape_Link[Morph_Verts]] += Shape_Morph[Morph_Verts] * Shape_Power;
					
			}
		}
		
		// but you know what?  We have verts that need to be stiched back together along the UV seams.
		// Actually, we just re-overlap any overlapping vert positions from the initial mesh shape, but that's good enough!
		var SeamVerts_BIA : int[] = Seam_Verts.ToBuiltin(int);
		var NextSameVert_BIA : int[] = Seam_NextSameVert.ToBuiltin(int);
		
		for ( var h=0 ; h<SeamVerts_BIA.length ; h++ )
		{
			Work_Mesh[NextSameVert_BIA[SeamVerts_BIA[h]]] = Work_Mesh[SeamVerts_BIA[h]];
		}
		
		mesh.vertices = Work_Mesh;
		
		// And recald the normals if needed.
		// Trust me, you want to leave this off.  It rarely works well.
		// Try it and see!
		RecalcNorms();
		
		// And the mesh is ready for the next frame.
		MeshChanged = MeshChanged - 1;
		if (MeshChanged < 0)
		{
			MeshChanged = 0;
		}
	}
}

// We group all the arrays into 
function Group_Morphs(Morph_Array : Array) : Array
{
	// Here is where we make the list of morphs to apply to the mesh from the Morphs currently active.
	for(var CAM_Loop: int ; CAM_Loop < Currently_Active_Morphs.length ; CAM_Loop++)
	{
		var Morph_Number : int = Currently_Active_Morphs[CAM_Loop].Link;
		
		// How much should we morph it?
		var Time_Spot :float = Mathf.InverseLerp(	Currently_Active_Morphs[CAM_Loop].CAM_Start_Time, 
																			Currently_Active_Morphs[CAM_Loop].CAM_Start_Time + Currently_Active_Morphs[CAM_Loop].CAM_TimeFrame, 
																			Time.realtimeSinceStartup );
		var Morph_Shapes_Power = Mathf.Lerp(		Currently_Active_Morphs[CAM_Loop].CAM_Start_Level, 
																			Currently_Active_Morphs[CAM_Loop].CAM_End_Level, 
																			Time_Spot );
		
		if ( Mathf.Approximately( Morph_Shapes_Power, 0.0 ) )
		{
			if (Currently_Active_Morphs[CAM_Loop].CAM_End == true)
			{
				Currently_Active_Morphs.RemoveAt(CAM_Loop);  	// Watch this!  Make sure the for loop is actually looking at the length attribute or you could wander straight into null territory.
				CAM_Loop--; 													// Oh, and back it up one, we just deleted an entry, so we need to look at this slot number again.  
				MeshChanged = 2;
			}			
		} 
		else 
		{
			Morph_Shapes_Power = Morph_Shapes_Power * Diff_Maps[Morph_Number].DM_Multiplier;
			// group up the data for the morph into an morph item array.
			var Morph_Item = new Array ();
				Morph_Item.Add(Morph_Shapes_Data[Morph_Number]);	// section 0
				Morph_Item.Add(Morph_Shapes_Links[Morph_Number]);	// section 1
				Morph_Item.Add(Morph_Shapes_Power);						// section 2
			
			Morph_Array.Add(Morph_Item);
			MeshChanged = 2;
		}
	}
	return Morph_Array;
}

function Group_Animations(Morph_Array : Array) : Array
{	
	// Here is where we make the list of morphs to apply to the mesh from the Animations currently active.
	for(var CAA_Loop: int = 0; CAA_Loop < Currently_Active_Animations.length ; CAA_Loop++)
	{
		var removeanimation : boolean = false;
		var Animation_Recording_class_Index : int = Currently_Active_Animations[CAA_Loop].Link;
		
		var Frame : int = Time2Frame( Time.realtimeSinceStartup - Currently_Active_Animations[CAA_Loop].CAA_Start_Time, Currently_Active_Animations[CAA_Loop].CAA_Speed );
		
		var End_Frame = Morph_Animation_Data[Animation_Recording_class_Index].length - 4;
				
		// Remember Animation styles?  This is where we process them.
		if (Frame > End_Frame )
		{
			var Style = Currently_Active_Animations[CAA_Loop].CAA_Style;
			if (Style == Animation_Style_End)
			{
				Currently_Active_Animations[CAA_Loop].CAA_End_Time = Time.realtimeSinceStartup - 0.002;
				Currently_Active_Animations[CAA_Loop].CAA_Fade_Time = Time.realtimeSinceStartup - 0.001;
				Frame = End_Frame;
			}
			else if (Style == Animation_Style_Freeze)
			{
				Frame = End_Frame;
			}
			else if (Style == Animation_Style_Loop)
			{
				Frame = 0;
				Currently_Active_Animations[CAA_Loop].CAA_Start_Time = Time.realtimeSinceStartup;
			}
			else if (Style == Animation_Style_PingPong)
			{
				if (Frame > End_Frame * 2)
				{
					Frame = 0;
					Currently_Active_Animations[CAA_Loop].CAA_Start_Time = Time.realtimeSinceStartup;
				}
				Frame = Mathf.Round(Mathf.PingPong (Frame, End_Frame) );
			}
		}
				
		// And the code for stopping an animatio and fading out over time while doing so.
		var Fade_out = 1.0;
		if (Currently_Active_Animations[CAA_Loop].CAA_End_Time > 0)
		{
			Fade_out = Mathf.InverseLerp (Currently_Active_Animations[CAA_Loop].CAA_Fade_Time, Currently_Active_Animations[CAA_Loop].CAA_End_Time, Time.realtimeSinceStartup);
			if(Time.realtimeSinceStartup>Currently_Active_Animations[CAA_Loop].CAA_Fade_Time)
			{
				removeanimation = true;
			}
		}
		
		// Grabbing the data for adding to the morph list...
		var Morph_Animation_Data_Indexes : Array = Morph_Animation_Data[Animation_Recording_class_Index][1]; // Indexes of the Diffmaps we're using.
		var Morph_Animation_Data_Powers : Array = Morph_Animation_Data[Animation_Recording_class_Index][2]; // frames start on line 3 (from line 0)...
		var Morph_Animation_Data_Levels : Array = Morph_Animation_Data[Animation_Recording_class_Index][Frame+3]; // frames start on line 3 (from line 0)...
				
		for(var MAD_Loop: int ; MAD_Loop < Morph_Animation_Data_Indexes.length ; MAD_Loop++)
		{
			var Morph_Power : float = Morph_Animation_Data_Powers[MAD_Loop] * Morph_Animation_Data_Levels[MAD_Loop] * Fade_out;
						
			if ( !Mathf.Approximately( Morph_Power, 0.0 ) )
			{
				var Morph_Item = new Array ();
					Morph_Item.Add(Morph_Shapes_Data[Morph_Animation_Data_Indexes[MAD_Loop]]);									// section 0
					Morph_Item.Add(Morph_Shapes_Links[Morph_Animation_Data_Indexes[MAD_Loop]]);									// section 1
					Morph_Item.Add(Morph_Power);		// section 2
				Morph_Array.Add(Morph_Item);	
				MeshChanged = 2;
			}
		}
		
		// Oh, if an animation is done, we take care of it here...
		if(removeanimation == true)
		{
			Currently_Active_Animations.RemoveAt(CAA_Loop);  	// Watch this!  Make sure the for loop is actually looking at the length attribute or you could wander straight into null territory.
			CAA_Loop--; 
			MeshChanged = 2;
			Frame = 0;
		}
		
	}
	
	// Well, were done with the array.  return it.
	return Morph_Array;
}




// -----------------------------------------------------------------------
// Morph Global Datastores and Functions that can be called from outside
// -----------------------------------------------------------------------

// Variables...

// All Morphs that are currently running.
		private var Currently_Active_Morphs = new Array (); // array [Animation_Recording#] [line] [single-entry]

		class Currently_Active_Morphs_class
		{
			var Name : String;  // relates directly to Diff_Map_class.AR_Name
			var Link : int; // link to array Diff_Map_class[] (speed up loops)
			
			var CAM_Start_Time : float;
			var CAM_TimeFrame : float; 
			
			var CAM_Start_Level : float; // The time of the animation being started, using Time.realtimeSinceStartup
			var CAM_End_Level : float;
			
			var CAM_End : boolean;
		}

// Functions...

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
	
	var Found_morph : int = FindName( Diff_Maps, [Morph_Name] );
	if ( Found_morph != -1)
	{
		if (TimeFrame < 0.001)
		{
			// No such thing as zero time.  zero does not give useful data.
			TimeFrame = 0.001;
		}
	
		var This_Morph = new Currently_Active_Morphs_class();
			This_Morph.Name 					= Morph_Name;
			This_Morph.Link						= Found_morph;
			This_Morph.CAM_Start_Time 		= Time.realtimeSinceStartup;
			This_Morph.CAM_TimeFrame 		= TimeFrame;
			This_Morph.CAM_Start_Level 	= Start_Level;
			This_Morph.CAM_End_Level 		= End_Level;
			This_Morph.CAM_End 				= false;
		
		// Find the morph.
		var Found : int = FindName( Currently_Active_Morphs, [Morph_Name] );
		if ( Found != -1)
		{
			// Found it.  Replace it!
			Currently_Active_Morphs[Found] = This_Morph;
		} 
		else 
		{
			//The morph does not exist.  Make it!
			Currently_Active_Morphs.Add(This_Morph);
		}
	}
	else 
	{
		Report("ERROR: Morph not found" + Morph_Name, 0);
	}
}

function mm_Morph_Remove(Morph_Name : String, TimeFrame : float)
{
	// Morph_Name: this is the name of the morph to stop effecting the mesh.
	// TimeFrame: is how long it takes for the morph to fade out.
	
	var Found : int = FindName( Currently_Active_Morphs, [Morph_Name] );
	if ( Found != -1)
	{
		// Found it.  Set it to fade and die.
				
		if (TimeFrame < 0.001)
		{
			// No such thing as zero time.  zero does not give useful data.
			TimeFrame = 0.001;
		}
				
		var Time_Spot :float = Mathf.InverseLerp(	Currently_Active_Morphs[Found].CAM_Start_Time, 
																			Currently_Active_Morphs[Found].CAM_Start_Time + Currently_Active_Morphs[Found].CAM_TimeFrame, 
																			Time.realtimeSinceStartup );
		var New_Start_Level : float = (Mathf.Lerp(	Currently_Active_Morphs[Found].CAM_Start_Level, 
														Currently_Active_Morphs[Found].CAM_End_Level, 
														Time_Spot ));	
		
		// This line is checking data that later lines change.  DO THIS FIRST!
		Currently_Active_Morphs[Found].CAM_Start_Level = New_Start_Level; // what is the current morph level at this moment?  No need for error checking, since we know it exists...
		Currently_Active_Morphs[Found].CAM_Start_Time	= Time.realtimeSinceStartup;
		Currently_Active_Morphs[Found].CAM_TimeFrame	= TimeFrame;
		Currently_Active_Morphs[Found].CAM_End_Level	= 0.0;
		Currently_Active_Morphs[Found].CAM_End			= true;		
	}
}

function mm_Morph_Level( Morph_Name : String ) : Array // [float]
{
	// Morph_Name: this is the name of the morph you are questing information on.
	// If the returned array is null, then the morph is not active.  Otherwise, array[0] is a float of how much the morph is effecting the mesh.
	
	var Current_Morph_Level = new Array ();
	
	var Found : int = FindName( Currently_Active_Morphs, [Morph_Name] );
	if ( Found != -1)
	{
		var Time_Spot :float = Mathf.InverseLerp(	Currently_Active_Morphs[Found].CAM_Start_Time, 
																			Currently_Active_Morphs[Found].CAM_Start_Time + Currently_Active_Morphs[Found].CAM_TimeFrame, 
																			Time.realtimeSinceStartup );
		Current_Morph_Level.Add(Mathf.Lerp(	Currently_Active_Morphs[Found].CAM_Start_Level, 
														Currently_Active_Morphs[Found].CAM_End_Level, 
														Time_Spot ));
		return Current_Morph_Level;
	}
	else
	{
		return null;
	}
}

function mm_Morph_Playing( ) : Array // strings
{
	// Morph_Name: this is the name of the morph you are questing information on.
	
	// returns an array of all the morphs (not animations or Setshapes) effecting the mesh. 
	
	var listing = new Array ();
	
	var listrange : int = Currently_Active_Morphs.length;
	for (var listitem = 0 ; listitem < listrange ; listitem++)
	{
		listing.Add(Currently_Active_Morphs[listitem].Name);
	}
	
	return listing;
}


// -----------------------------------------------------------------------
// Animation Global Datastores and Functions that can be called from outside
// -----------------------------------------------------------------------

// Variables...

// All animations that are currently running...
		private var Currently_Active_Animations = new Array (); // array [Animation_Recording#] [line] [single-entry]

		class Currently_Active_Animations_class
		{
			var Name : String;  // relates directly to Animation_Recording_class.AR_Name
			var Link : int; // link to array Animation_Recording_class[] (speed up loops)
			
			var CAA_Start_Time : float; // The time of the animation being started, using Time.realtimeSinceStartup
			var CAA_End_Time : float; 
			var CAA_Fade_Time : float; 
			
			var CAA_Speed : float;
			
			var CAA_Effect_Level : float; 
			
			var CAA_Style : int; 
		}

// Functions...

function mm_Animate_Play( Morph_Animation_Name : String, Speed_Multiple : float, Style : int )
{
	// Morph_Animation_Name: The name of the animation you are starting from Animation_Recordings.Name
	// Speed_Multiple: This allows you to speed up and slow down an animation.  1.0 is normal.  Higher is faster.  Lower is slower.
	// Style: Animation_Style_End = 0, Animation_Style_Freeze = 1, Animation_Style_Loop 2, Animation_Style_PingPong = 3
	
	// These are NOT morphs, though they use Morph data.  They are datastreams of morph levels stored by frame.
	// They are use to play back complex animation from Blender 3d made with shapekeys.
	
	// Starts playing an animation.
		
	var Found_animation : int = FindName( Animation_Recordings, [Morph_Animation_Name] );
	if ( Found_animation != -1)
	{
		var This_Animation = new Currently_Active_Animations_class();
			This_Animation.Name 					= Morph_Animation_Name;
			This_Animation.Link						= Found_animation;
			This_Animation.CAA_Start_Time 		= Time.realtimeSinceStartup;
			This_Animation.CAA_End_Time 		= -1;
			This_Animation.CAA_Fade_Time 		= -1;
			This_Animation.CAA_Speed 			= Speed_Multiple;
			This_Animation.CAA_Style 			= Style;
		
		// Find the morph.
		var Found : int = FindName( Currently_Active_Animations, [Morph_Animation_Name] );
		if ( Found != -1)
		{
			// Found it.  Replace it!
			Currently_Active_Animations[Found] = This_Animation;
		} 
		else 
		{
			//The morph does not exist.  Make it!
			Currently_Active_Animations.Add(This_Animation);
		}
		
	}
	else
	{
		Report("ERROR: Morph Animation not found" + Morph_Animation_Name, 0);
	}
}

function mm_Animate_Stop( Morph_Animation_Name : String, Ease_Out : float )
{
	// Morph_Animation_Name: Name of the animation to stop.
	// Ease_Out: How long to take easing out of the animation running.

	// stops an animation by fading it out.  To fade it out instantly, use and ease_out of zero.
	
	var Found : int = FindName( Currently_Active_Animations, [Morph_Animation_Name] );
	if ( Found != -1)
	{
		if (Ease_Out < 0.001)
		{
			// No such thing as zero time.  zero does not give useful data.
			Ease_Out = 0.001;
		}
	
		// Found it.  Set it to fade and die.
		Currently_Active_Animations[Found].CAA_End_Time	= Time.realtimeSinceStartup;  // start fading from now...
		Currently_Active_Animations[Found].CAA_Fade_Time	= Time.realtimeSinceStartup + Ease_Out;  // when we reach this time, remove the morph.
	}
}

function mm_Animate_Frame( Morph_Animation_Name : String ) : Array // [int]
{
	// Morph_Animation_Name: Name of the animation to get the current frame from.
	// returns the current frame of the animation.
	
	// returns the current frame being played of the named animation.
	
	var Current_Animation_Frame = new Array ();
	
	var Found : int = FindName( Currently_Active_Animations, [Morph_Animation_Name] );
	if ( Found != -1)
	{
		var frame : int = Time2Frame( Time.realtimeSinceStartup - Currently_Active_Animations[Found].CAA_Start_Time , Currently_Active_Animations[Found].CAA_Speed );
		return [frame];
	} 
	else 
	{	
		return null;
	}
}

function mm_Animate_Playing( ) : Array // strings
{
	// returns a list of the names of currently playing animations.
	
	var listing = new Array ();
	
	var listrange : int = Currently_Active_Animations.length;
	for (var listitem = 0 ; listitem < listrange ; listitem++)
	{
		listing.Add(Currently_Active_Animations[listitem].Name);
	}
	
	return listing;
}


// -----------------------------------------------------------------------
// SetShape Functions (These can be called from outside)
// -----------------------------------------------------------------------

function mm_SetShape_Set(	Morph_Name : String, Morph_Level : float )
{
	// Morph_Name: Name of the morph to apply.
	// Morph_Level: How much to apply it. 1.0 is fully.

	// With this, you can set a morph shape into the default mesh.
	// This means no FPS cost for it to be visible, but a large cost to set it.
	// Do NOT call this per frame.  Use the mm_Morph set of functions to animate getting to a shape, and then kill the morph while setting the shape.
	// It stacks, so each new shape added is added to all the previous ones.
	
	var Found : int = FindName( Diff_Maps, [Morph_Name] );
	if ( Found != -1)
	{
		// group up the data for the morph into an morph item array.
		var Morph_Item = new Array ();
		Morph_Item.Add(Morph_Shapes_Data[Found]);	// section 0
		Morph_Item.Add(Morph_Shapes_Links[Found]);	// section 1
		Morph_Item.Add(Morph_Level);						// section 2
		
		// And drop it into slot zero...
		var Morph_Array = new Array ();
		Morph_Array.Add(Morph_Item); // slot 0
		
		mesh.vertices = Morph(Mod_Mesh, Morph_Array);
		RecalcNorms();
	}
}
					
function mm_SetShape_Reset( )
{
	// This function resets the modded mesh back to the default.
	// Again, this is for SetShape, and does not effect morphs or animations.
	
	Mod_Mesh = Base_Mesh;
	mesh.vertices = Base_Mesh.ToBuiltin(Vector3);
	RecalcNorms();
}

// -----------------------------------------------------------------------
// Tool Values
// -----------------------------------------------------------------------

// Style variables to easier set Animation Style options.
private var Animation_Style_End : int = 0;
private var Animation_Style_Freeze : int = 1;
private var Animation_Style_Loop : int = 2;
private var Animation_Style_PingPong : int = 3;

// -----------------------------------------------------------------------
// Tool Functions
// -----------------------------------------------------------------------

// This function does not actually change the mesh, it just edits the arrays and returns what can be USED as a new mesh.
// We don't use this for live fps animation, since is slows down rendering heavily.
function Morph(Starting_Mesh : Array, Morph_Array : Array) : Vector3[]
{
	// The incoming variable is a special array, containing a lot of data.
	// Morph_Array [grouping number] 	[0] = morph array
	//										[1] = link array
	//										[2] = power level applied.
	
	var Work_Mesh : Vector3[] = Starting_Mesh.ToBuiltin(Vector3);
	
	for (var Morph_Item = 0 ;Morph_Item < Morph_Array.length ; Morph_Item++ )
	{
		// okay, we are now going to apply each animation at the proper precentage to the model.
		
		var Shape_Morph : Vector3[] = Morph_Array[Morph_Item][0].ToBuiltin(Vector3);
		var Shape_Link : int[] = Morph_Array[Morph_Item][1].ToBuiltin(int);
		var Shape_Power : float = Morph_Array[Morph_Item][2];
					
		for (var Morph_Verts=0;Morph_Verts<Shape_Link.length;Morph_Verts++)
		{
			// In this case, we're only looping the vertices that MOVE.  All the rest are ignored, and this runs faster that way. 
			// You only pay for the parts you morph.
			Work_Mesh[Shape_Link[Morph_Verts]] += Shape_Morph[Morph_Verts] * Shape_Power;
		}
	}
	// And here we have the final builtin array with the mesh shape we want!
	return Work_Mesh;
}

// If true, then recalc the norms.
// Avoid this unless you REALLY need it for reflections and shines.
function RecalcNorms()
{
	// The below recalulates the normal faces, but is not needed for most morphs.		
	if (MetaMorph_Settings.MM_Recalculate_Normals == true)
	{
		mesh.RecalculateNormals();
	}
}

// simple function to translate seconds of animation to frames assuming 30 fps
function Time2Frame( timefromzero : float, speedmultiplier : float ) : int
{
	return Mathf.Round( (timefromzero * speedmultiplier) * 30.0 );  // All Unity animations need to be at 30 fps.  bones, morphs, everything.  
}

// Error checking function. 
// Avoid it in fps loops, even when the level of the debug is low.  Still takes time to check.
function Report(message : String, level : int)
{
	if (level <= MetaMorph_Settings.MM_Verbose)
	{
		Debug.Log   (message);
	}
}

// Simple way to find the name in arrays.
// For the love of god, DON'T use this in fps functions.  You'll slow to a crawl.  
// If you need this data, presave it in an array or something.
function FindName( searchabledata : Array, requesteddata : Array ) : int
{
	// This does need the searchabledata array to be a class with .Name attached.
	var found : int = -1;
	
	var searchrange : int = searchabledata.length;
	for (var search = 0 ; search < searchrange ; search++)
	{
		if (requesteddata[0] == searchabledata[search].Name)
		{
			found = search;
			search = searchrange;
		}
	}
	return found;
}
