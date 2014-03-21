using UnityEngine;
using System.Collections;
using UnityEditor;


[CustomEditor(typeof(MorphMaster))]
class MorphInspector : Editor {
    public override void OnInspectorGUI () {
		
		
		MorphMaster master = (MorphMaster)target;
		
	
		EditorGUILayout.BeginVertical();
		GUILayout.Label ("   Morphs: ");
		
		for (int a = 0; a < master.morphs.Count; a++)
		{
			EditorGUILayout.Space();
			
			MorphTarget morph = master.morphs[a];
			if (! morph.morph)
				morph.expandedEdit = true;
			EditorGUILayout.BeginHorizontal();
			string nn = EditorGUILayout.TextField(morph.morphName);
			if (nn != morph.morphName)
				morph.morphName = nn;
			if (morph.expandedEdit)
			{
				if (morph.morph)
				{
					if (GUILayout.Button ("(delete)"))
					{
						master.morphs.RemoveAt(a);
						a--;
					}
				
					if (GUILayout.Button ("(Shrink)"))
						morph.expandedEdit = false;
				}
				else
				{
					if (GUILayout.Button ("(delete)"))
					{
						master.morphs.RemoveAt(a);
						a--;
					}
				}
				
			}
			else
			{
				if (GUILayout.Button ("(Details)"))
					morph.expandedEdit = true;
				
			}
			EditorGUILayout.EndHorizontal();
			EditorGUILayout.BeginHorizontal();
			
			float val = EditorGUILayout.Slider(morph.percent, Mathf.Min(morph.percent, morph.min), Mathf.Max (morph.percent, morph.max));
			if (val != morph.percent)
			{
				morph.percent = val;
				master.Regenerate();
			}
			if (GUILayout.Button("rand"))
			{
				morph.SetRandomly();
				master.ApplyMorphs();
			}
			EditorGUILayout.EndHorizontal();
			
			if (morph.expandedEdit)
			{
				string label = "Mesh:";
				if (! morph.morph)
					label = "MESH NEEDED ----->";
				
				Mesh newmesh = (Mesh)EditorGUILayout.ObjectField(label, morph.morph, typeof(Mesh), true);
				if (newmesh != morph.morph)
				{
					morph.morph = newmesh;
					morph.Regenerate(master);
				}
				val = EditorGUILayout.FloatField("Min:", morph.min);
				if (val != morph.min) morph.min = val;
				
				val = EditorGUILayout.FloatField("Max:", morph.max);
				if (val != morph.max) morph.max = val;
				
				GUILayout.Label ("Randomization Info:");			
				
				
				EditorGUILayout.BeginHorizontal();
				GUILayout.Label ("% Chance: ");			
				val = EditorGUILayout.Slider(morph.randomActivationChance, 0, 1);
				if (val != morph.randomActivationChance)
					morph.randomActivationChance = val;
				EditorGUILayout.EndHorizontal();
			}
			EditorGUILayout.Space();
			
			
		}
		
		if (GUILayout.Button("Add Morph"))
			master.morphs.Add(new MorphTarget());
		
		
		EditorGUILayout.Space();
		EditorGUILayout.BeginHorizontal();
		GUILayout.Label ("   Master Controls: ");
		if (GUILayout.Button("Randomize All"))
		{
			master.Randomize();
		}
		EditorGUILayout.EndHorizontal();
				
		EditorGUILayout.ObjectField("Mesh:", master.baseMesh, typeof(Mesh), true);
		EditorGUILayout.BeginHorizontal();
				
		if (GUILayout.Button("Regenerate"))
			master.Regenerate();
		if (GUILayout.Button("Delete and regenerate"))
		{
			master.baseMesh = null;
			master.Regenerate();
		}
		EditorGUILayout.EndHorizontal();
		GUILayout.EndVertical();
        
    }
}
