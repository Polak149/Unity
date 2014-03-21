var maxX : float;
var minX : float;
var maxZ : float;
var minZ : float;
var maxY : float;
var minY : float;
var bobbles : int; // createt boobles per frame
var bubbleObject : GameObject;
private var call:boolean = true;
private var bobbleArray = new Array();
private var i;

function Start()
{
	bobbleArray.length = bobbles;
	for (i = 0; i<bobbleArray.length; i++)
	{
		bobbleArray[i] = Instantiate(bubbleObject, Vector3(Random.Range(minX,maxX),Random.Range(minY,maxY),Random.Range(minZ,maxZ)),  transform.rotation);
		bobbleArray[i].animation["sinking"].wrapMode = WrapMode.Loop;
		bobbleArray[i].animation.Play ("sinking");
        bobbleArray[i].audio.Play();
	}
}

function Update ()
{
for (i = 0; i<bobbleArray.length; i++)
	{
		bobbleArray[i] = Instantiate(bubbleObject, Vector3(Random.Range(minX,maxX),Random.Range(minY,maxY),Random.Range(minZ,maxZ)),  transform.rotation);
		bobbleArray[i].animation.Play ("sinking");
        bobbleArray[i].audio.Play();
        Destroy(bobbleArray[i], bobbleArray[i].animation["sinking"].length);
	}
} 