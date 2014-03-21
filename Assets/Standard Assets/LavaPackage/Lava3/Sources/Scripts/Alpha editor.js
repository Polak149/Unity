var alpha = 0.1;

private var originalColour;
originalColour = renderer.material.color;

renderer.material.color = new Color(originalColour.r, originalColour.g, originalColour.b, alpha);