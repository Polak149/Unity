using UnityEngine;
using System.Collections;
using System.Collections.Generic;


/// <summary>
/// Using Morph Master allows you to use Blender Shape Keys in Unity. Setup: you must save
/// a distinct blender file with each shape key in turn, as well as the fundamental file
/// you plan to use as your baseline. Drag your rigged entity (rigging optional) onto the
/// scene view, then add Morph Master, and one Morph Target for each shape key file.
/// </summary>
public class MorphMaster : MonoBehaviour {
		
	
	public List<MorphTarget> morphs = new List<MorphTarget>();
	
	/// <summary>
	/// The active mesh within the mesh filter.
	/// </summary>
	protected Mesh activeMesh;
	
	/// <summary>
	/// This is the original sharedMesh.
	/// </summary>
	public Mesh baseMesh;
	
	
	// Use this for initialization
	void Start () {
		Regenerate ();
	}

	// Update is called once per frame
	void Update () {
	}
	
	public void Regenerate() {
		bool resetSource = baseMesh != null;
		if (resetSource)
			Debug.Log ("Our Shared Mesh is a custom mesh, so we'll reset it to the original shared mesh.");
		else
			Debug.Log ("We are presuming our Shared Mesh is the source mesh, and saving it as an original.");
		
		MeshFilter filter = GetComponent<MeshFilter>();
		if (filter)
		{
			if (resetSource)
				filter.sharedMesh = baseMesh;
			else
				baseMesh = filter.sharedMesh;
				
			activeMesh = (Mesh)Mesh.Instantiate(baseMesh);
			activeMesh.name = "MORPH CLONE VARIANT ON " + activeMesh.name;
			filter.sharedMesh = activeMesh;
		}
		else
		{
			SkinnedMeshRenderer smr = GetComponent<SkinnedMeshRenderer>();
			if (smr)
			{
				if (resetSource)
					smr.sharedMesh = baseMesh;
				else
					baseMesh = smr.sharedMesh;
			
				activeMesh = (Mesh)Mesh.Instantiate(baseMesh);
				activeMesh.name = "MORPH CLONE VARIANT ON " + activeMesh.name;
				smr.sharedMesh = activeMesh;
			}
			else
			{
				Debug.LogError("I couldn't find a mesh rendering class!");
				return;
			}
		}
		
		ApplyMorphs ();
	}
	public void Randomize() {
		for (int a = 0; a < morphs.Count; a++)
			morphs[a].SetRandomly();
		ApplyMorphs ();
	}
	public void ApplyMorphs() {
		if (! activeMesh) Regenerate();
		
		Vector3[] verts = baseMesh.vertices;
		Vector3[] normals = baseMesh.normals;
		
		for (int a = 0; a < morphs.Count; a++)
		{
			morphs[a].ApplyMorph(this, ref verts, ref normals);
		}
		activeMesh.vertices = verts;
		activeMesh.normals = normals;
		activeMesh.RecalculateBounds();
		
	}

}
