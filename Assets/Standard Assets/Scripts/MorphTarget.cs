using UnityEngine;
using System.Collections;

[System.Serializable]
public class MorphTarget {
	
	public string morphName = "?";
	public bool expandedEdit = false;
	
	public Mesh morph;
	
	public float percent = 0;
	public float min = -1;
	public float max = 2;
	public float randomActivationChance = 1;
	
	protected float lastPercent = 0;
	/// <summary>
	/// Optimization should help the speed some, instead of recalculating the offsets
	/// each time anything changes in any of them.
	/// </summary>
	protected Vector3[] offVert, offNorm;
	
	public void Regenerate(MorphMaster master) {
		Debug.Log ("Generating offset data for morph " + morphName + " on " + master.name);
		Mesh baseMesh = master.baseMesh;
		offVert = new Vector3[baseMesh.vertexCount];
		offNorm = new Vector3[baseMesh.vertexCount];
		
		for (int a=0; a < baseMesh.vertices.Length; a++)
		{
			
			offVert[a] = morph.vertices[a] - baseMesh.vertices[a];
			offNorm[a] = morph.normals[a] - baseMesh.normals[a];
		}
		master.ApplyMorphs();
	}
	
	public void ApplyMorph(MorphMaster master, ref Vector3[] verts, ref Vector3[] normals) {
		Debug.Log("Applying morph " + morphName + " at " + percent);
		if ((offVert == null) || (offVert.Length == 0))
		{
			Regenerate (master);
		}
		
		for (int a=0; a < verts.Length ; a++)
		{
			verts[a] += offVert[a] * percent;
			normals[a] = (normals[a] + offNorm[a] * percent).normalized;
		}
		lastPercent = percent;
	}
	
	public void SetRandomly() {
		if (Random.value > randomActivationChance) 
		{
			percent = 0;
			return;
		}
		
		percent = Random.value * (max - min);
		percent += min;
	}
}
