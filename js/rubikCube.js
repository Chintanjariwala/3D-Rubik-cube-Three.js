var camera, scene, renderer;
var n = 3;
var mesh;

var mouseLeftDown = false;
var mouseMidDown = false;
var mouseRightDown = false;
var lastMouseX;
var lastMouseY;
var rotMatrix = new THREE.Matrix4();
var faces;	// 0 = back, 1 = front, 2 = left, 3 = right, 4 = bottom, 5 = top
var nCubes;
var cubes;
var count = 0;
var maxCount = 45;
var currentFace = -1;
var currentAngle = 90;
var currentLevel = 'novice';

// previous clicked cubes...
var lastCubeClicked = null;

var LEFT1 = 2, LEFT2 = 3, RIGHT1 = 0, RIGHT2 = 1, BOTTOM1=6, BOTTOM2 = 7, TOP1 = 4, TOP2 = 5, BACK1 = 10, BACK2 = 11, FRONT1 = 8, FRONT2 = 9;
				


init();
animate();


function rotateObject(e, axis, degrees)
{
	var center = [e.position.x, e.position.y, e.position.z];
	var r = new THREE.Matrix4();
	switch (axis)
	{
		case 'x': center[1] = center[2] = 0; r.makeRotationX(3.14159265359*(degrees/180.0)); break;
		case 'y': center[0] = center[2] = 0; r.makeRotationY(3.14159265359*(degrees/180.0)); break;
		case 'z': center[0] = center[1] = 0; r.makeRotationZ(3.14159265359*(degrees/180.0)); break;
	}
	var t1 = new THREE.Matrix4();
	t1.makeTranslation(-center[0], -center[1], -center[2]);
	var t2 = new THREE.Matrix4();
	t2.makeTranslation(center[0], center[1], center[2]);
	
	t2.multiply(r);
	t2.multiply(t1);
	t2.multiply(e.matrix);
	
	e.matrix = t2;
}

function rotateObjects(f, degrees)
{
	var  m = 0;
	for(var c=0; c<nCubes; c++)
	{
		if (f < n)
		{
			if (cubes[c].index[2] == f) 
			{
				rotateObject(cubes[c], 'z', degrees);
				m++;
			}
		}
		else if (f < 2*n)
		{
			if (cubes[c].index[0] == (f % n)) 
			{
				rotateObject(cubes[c], 'x', degrees); 
				m++;
			}
		}
		else if (f < 3*n)
		{
			if (cubes[c].index[1] == (f % n)) 
			{
				rotateObject(cubes[c], 'y', degrees); 
				m++;
			}
		}
	}
	//console.log("rotated" + m);
}

function updatePos(e)
{
	if (n==2)
	{
		e.position.x = (e.index[0]==0) ? -1.1 : 1.1;
		e.position.y = (e.index[1]==0) ? -1.1 : 1.1;
		e.position.z = (e.index[2]==0) ? -1.1 : 1.1;
	}
	else if (n==3)
	{
		e.position.x = (e.index[0]-1)*1.1;
		e.position.y = (e.index[1]-1)*1.1;
		e.position.z = (e.index[2]-1)*1.1;
	}							
	else
	{
		e.position.x = e.index[0]*1 - 1.5;
		e.position.y = e.index[1]*1 - 1.5;
		e.position.z = e.index[2]*1 - 1.5;
	}
	e.matrix.makeTranslation(e.position.x, e.position.y, e.position.z);
}

function updateIndexes(f,deggrees)
{
	if (deggrees == 90)	for(var c=0; c<nCubes; c++) 
	{
		//cubes[c].normalsNeedUpdate = true;
		if (f < n)
		{
			if (cubes[c].index[2] == f) // change i,j
			{
				var i = cubes[c].index[0];
				var j = cubes[c].index[1];
				cubes[c].index = [n-1-j, i, cubes[c].index[2]];
				var faces = [];
				for (var i=0; i<12; i++)
					faces[i] = cubes[c].geometry.faces[i].color.getHex();
				// swap 
				cubes[c].geometry.faces[LEFT1].color.setHex(faces[TOP1]);
				cubes[c].geometry.faces[LEFT2].color.setHex(faces[TOP2]);
				cubes[c].geometry.faces[TOP1].color.setHex(faces[RIGHT1]);
				cubes[c].geometry.faces[TOP2].color.setHex(faces[RIGHT2]);
				cubes[c].geometry.faces[RIGHT1].color.setHex(faces[BOTTOM1]);
				cubes[c].geometry.faces[RIGHT2].color.setHex(faces[BOTTOM2]);
				cubes[c].geometry.faces[BOTTOM1].color.setHex(faces[LEFT1]);
				cubes[c].geometry.faces[BOTTOM2].color.setHex(faces[LEFT2]);
				cubes[c].geometry.colorsNeedUpdate = true;
				updatePos(cubes[c]);
			}
			else
				cubes[c].geometry.colorsNeedUpdate = false;

		}
		else if (f < 2*n)	// change j,k
		{
			if (cubes[c].index[0] == (f % n)) 
			{
				var j = cubes[c].index[1];
				var k = cubes[c].index[2];
				cubes[c].index = [cubes[c].index[0], n-1-k, j];
				
				var faces = [];
				for (var i=0; i<12; i++)
					faces[i] = cubes[c].geometry.faces[i].color.getHex();
				// swap 
				cubes[c].geometry.faces[TOP1].color.setHex(faces[BACK1]);
				cubes[c].geometry.faces[TOP2].color.setHex(faces[BACK2]);
				cubes[c].geometry.faces[FRONT1].color.setHex(faces[TOP1]);
				cubes[c].geometry.faces[FRONT2].color.setHex(faces[TOP2]);
				cubes[c].geometry.faces[BOTTOM1].color.setHex(faces[FRONT1]);
				cubes[c].geometry.faces[BOTTOM2].color.setHex(faces[FRONT2]);
				cubes[c].geometry.faces[BACK1].color.setHex(faces[BOTTOM1]);
				cubes[c].geometry.faces[BACK2].color.setHex(faces[BOTTOM2]);				
				cubes[c].geometry.colorsNeedUpdate = true;
				updatePos(cubes[c]);
			}
			else
				cubes[c].geometry.colorsNeedUpdate = false;
		}
		else if (f < 3*n)	// change i,k
		{
			if (cubes[c].index[1] == (f % n)) 
			{
				var i = cubes[c].index[0];
				var k = cubes[c].index[2];
				cubes[c].index = [k, cubes[c].index[1], n-1-i];

				var faces = [];
				for (var i=0; i<12; i++)
					faces[i] = cubes[c].geometry.faces[i].color.getHex();
				// swap 
				cubes[c].geometry.faces[LEFT1].color.setHex(faces[BACK1]);
				cubes[c].geometry.faces[LEFT2].color.setHex(faces[BACK2]);
				cubes[c].geometry.faces[BACK1].color.setHex(faces[RIGHT1]);
				cubes[c].geometry.faces[BACK2].color.setHex(faces[RIGHT2]);					
				cubes[c].geometry.faces[RIGHT1].color.setHex(faces[FRONT1]);
				cubes[c].geometry.faces[RIGHT2].color.setHex(faces[FRONT2]);
				cubes[c].geometry.faces[FRONT1].color.setHex(faces[LEFT1]);
				cubes[c].geometry.faces[FRONT2].color.setHex(faces[LEFT2]);
				cubes[c].geometry.colorsNeedUpdate = true;
				updatePos(cubes[c]);
			}
			else
				cubes[c].geometry.colorsNeedUpdate = false;
			
		}
	}	
	else for(var c=0; c<nCubes; c++)
	{
		if (f < n)
		{
			if (cubes[c].index[2] == f) // change i,j
			{
				var i = cubes[c].index[0];
				var j = cubes[c].index[1];
				cubes[c].index[0] = j;
				cubes[c].index[1] = n-1-i;
				var faces = [];
				for (var i=0; i<12; i++)
					faces[i] = cubes[c].geometry.faces[i].color.getHex();
				// swap 
				cubes[c].geometry.faces[LEFT1].color.setHex(faces[BOTTOM1]);
				cubes[c].geometry.faces[LEFT2].color.setHex(faces[BOTTOM2]);
				cubes[c].geometry.faces[TOP1].color.setHex(faces[LEFT1]);
				cubes[c].geometry.faces[TOP2].color.setHex(faces[LEFT2]);
				cubes[c].geometry.faces[RIGHT1].color.setHex(faces[TOP1]);
				cubes[c].geometry.faces[RIGHT2].color.setHex(faces[TOP2]);
				cubes[c].geometry.faces[BOTTOM1].color.setHex(faces[RIGHT1]);
				cubes[c].geometry.faces[BOTTOM2].color.setHex(faces[RIGHT2]);
				cubes[c].geometry.colorsNeedUpdate = true;
				updatePos(cubes[c]);
			}
			else
				cubes[c].geometry.colorsNeedUpdate = false;
			
		}
		else if (f < 2*n)	// change j,k
		{
			if (cubes[c].index[0] == (f % n)) 
			{
				var j = cubes[c].index[1];
				var k = cubes[c].index[2];
				cubes[c].index[1] = k;
				cubes[c].index[2] = n-1-j;
				
				var faces = [];
				for (var i=0; i<12; i++)
					faces[i] = cubes[c].geometry.faces[i].color.getHex();
				// swap 
				cubes[c].geometry.faces[TOP1].color.setHex(faces[FRONT1]);
				cubes[c].geometry.faces[TOP2].color.setHex(faces[FRONT2]);
				cubes[c].geometry.faces[BACK1].color.setHex(faces[TOP1]);
				cubes[c].geometry.faces[BACK2].color.setHex(faces[TOP2]);
				cubes[c].geometry.faces[BOTTOM1].color.setHex(faces[BACK1]);
				cubes[c].geometry.faces[BOTTOM2].color.setHex(faces[BACK2]);
				cubes[c].geometry.faces[FRONT1].color.setHex(faces[BOTTOM1]);
				cubes[c].geometry.faces[FRONT2].color.setHex(faces[BOTTOM2]);					
				cubes[c].geometry.colorsNeedUpdate = true;
				updatePos(cubes[c]);
			}
			else
				cubes[c].geometry.colorsNeedUpdate = false;
		}
		else if (f < 3*n)	// change i,k
		{
			if (cubes[c].index[1] == (f % n)) 
			{
				var i = cubes[c].index[0];
				var k = cubes[c].index[2];
				cubes[c].index[0] = n-1-k;
				cubes[c].index[2] = i;

				var faces = [];
				for (var i=0; i<12; i++)
					faces[i] = cubes[c].geometry.faces[i].color.getHex();
				// swap 
				cubes[c].geometry.faces[LEFT1].color.setHex(faces[FRONT1]);
				cubes[c].geometry.faces[LEFT2].color.setHex(faces[FRONT2]);
				cubes[c].geometry.faces[BACK1].color.setHex(faces[LEFT1]);
				cubes[c].geometry.faces[BACK2].color.setHex(faces[LEFT2]);					
				cubes[c].geometry.faces[RIGHT1].color.setHex(faces[BACK1]);
				cubes[c].geometry.faces[RIGHT2].color.setHex(faces[BACK2]);
				cubes[c].geometry.faces[FRONT1].color.setHex(faces[RIGHT1]);
				cubes[c].geometry.faces[FRONT2].color.setHex(faces[RIGHT2]);
				cubes[c].geometry.colorsNeedUpdate = true;
				updatePos(cubes[c]);
			}
			else
				cubes[c].geometry.colorsNeedUpdate = false;
		}
	}
	
	// here, we check if cube is already well sorted
	var colorPerFace = [null,null,null,null,null,null];
	var c = 0;
	for (; c<n*n*n; c++)
	{
		if (cubes[c].index[0] == 0)	// left face
		{
			if (colorPerFace[0] == null)
				colorPerFace[0] = cubes[c].geometry.faces[LEFT1].color;
			else if (colorPerFace[0].equals(cubes[c].geometry.faces[LEFT1].color) == false)
				break;
		}
		else if (cubes[c].index[0] == n-1)	// right face
		{
			if (colorPerFace[1] == null)
				colorPerFace[1] = cubes[c].geometry.faces[RIGHT1].color;
			else if (colorPerFace[1].equals(cubes[c].geometry.faces[RIGHT1].color) == false)
				break;
		}
		
		if (cubes[c].index[1] == 0)	// bottom face
		{
			if (colorPerFace[2] == null)
				colorPerFace[2] = cubes[c].geometry.faces[BOTTOM1].color;
			else if (colorPerFace[2].equals(cubes[c].geometry.faces[BOTTOM1].color) == false)
				break;
		}
		else if (cubes[c].index[1] == n-1)	//top face
		{
			if (colorPerFace[3] == null)
				colorPerFace[3] = cubes[c].geometry.faces[BOTTOM1].color;
			else if (colorPerFace[3].equals(cubes[c].geometry.faces[BOTTOM1].color) == false)
				break;
		}

		if (cubes[c].index[2] == 0)	// back face
		{
			if (colorPerFace[4] == null)
				colorPerFace[4] = cubes[c].geometry.faces[BACK1].color;
			else if (colorPerFace[4].equals(cubes[c].geometry.faces[BACK1].color) == false)
				break;
		}
		else if (cubes[c].index[2] == n-1)	//top face
		{
			if (colorPerFace[5] == null)
				colorPerFace[5] = cubes[c].geometry.faces[BACK1].color;
			else if (colorPerFace[5].equals(cubes[c].geometry.faces[BACK1].color) == false)
				break;
		}
	}
	if (c==n*n*n)
	{
		document.getElementById("scores").style.visibility='visible';
		document.getElementById("scores").innerHTML = "You have completed the cube!";
		onRestart(n, currentLevel);
	}
}

function rotate(degrees)
{
	if (count == 0)
		return;
	rotateObjects(currentFace,degrees/maxCount);
	count ++;
	if (count <= maxCount+1)
		return;
	count = 0;
	updateIndexes(currentFace,degrees);
}

function createCube(size)
{
	var colors = 
	[
		new THREE.Color(1, 0, 0), 
		new THREE.Color(0, 1, 0), 
		new THREE.Color(0, 0, 1), 
		new THREE.Color(1, 1, 0), 
		new THREE.Color(0, 1, 1), 
		new THREE.Color(1, 0, 1), 
	];
	n = size;
	nCubes = 0;
	cubes = new Array(n*n*n);
	// each face has a virtual color between 0 and 5
	faces = new Array(6);
	for (var f = 0; f < 6; f++) 
	{
		faces[f] = new Array(n);
		for (var i = 0; i < n; i++) 
		{
			faces[f][i] = new Array(n);
			for (var j = 0; j < n; j++) 
				faces[f][i][j] = f;
		}
	}
	
	var mesh = new Array(n);
	for (var i = 0; i < n; i++) 
	{
		mesh[i] = new Array(n);
		for (var j = 0; j < n; j++) 
		{
			mesh[i][j] = new Array(n);
			
			for (var k = 0; k < n; k++) 
			{
				var geometry;
				if (n==2)
					geometry = new THREE.CubeGeometry( 1, 1, 1 );
				else if (n==3)
					geometry = new THREE.CubeGeometry( 1, 1, 1 );
				else
					geometry = new THREE.CubeGeometry(0.9, 0.9, 0.9 );
				var material = new THREE.MeshBasicMaterial( { color: 0xffffff, vertexColors: THREE.FaceColors } );
				var e = new THREE.Mesh( geometry, material );
				
				e.matrixAutoUpdate = false;
				e.rotationAutoUpdate = false;
				e.matrixAutoUpdate = false;
				
				e.index = [i,j,k];
				updatePos(e);
				
				// gray by default
				for (var l=0; l<12; l++)
					geometry.faces[l].color = new THREE.Color(0x555555); 
				scene.add(e);
				
				cubes[nCubes] = e;
				nCubes++;
				// adjusting the face colors
				
				if (i==0)	// left face = green
				{
					geometry.faces[2].color = new THREE.Color(0x00FF00); //Left 1
					geometry.faces[3].color = new THREE.Color(0x00FF00); //Left 2
				}
				if (i==n-1)	// right face = red
				{
					geometry.faces[0].color = new THREE.Color(0xFF0000); //Right 1
					geometry.faces[1].color = new THREE.Color(0xFF0000); //Right 2
				}
				if (j == 0)	// bottom face = yellow
				{
					geometry.faces[6].color = new THREE.Color(0xFFFF00); //Bottom 1
					geometry.faces[7].color = new THREE.Color(0xFFFF00); //Bottom 2
				}
				if (j == n-1)	// top face = blue
				{
					geometry.faces[4].color = new THREE.Color(0x0000FF); //Top 1
					geometry.faces[5].color = new THREE.Color(0x0000FF); //Top 2
				}
				if (k == 0)	// back face = gray
				{
					geometry.faces[10].color = new THREE.Color(0x999966); //back 1
					geometry.faces[11].color = new THREE.Color(0x999966); //back 2
				}
				if (k == n-1)	// front face = orange
				{
					geometry.faces[8].color = new THREE.Color(0xFF4500); //Front 1
					geometry.faces[9].color = new THREE.Color(0xFF4500); //Front 2
				}
				
			}
		}
	}
}

function faceToNormal(f)
{
	switch (f)
	{
		case 0:
		case 1: return new THREE.Vector3(1,0,0); break;

		case 2:
		case 3: return new THREE.Vector3(-1,0,0); break;
		
		case 4:
		case 5: return new THREE.Vector3(0,1,0); break;

		case 6:
		case 7: return new THREE.Vector3(0,-1,0); break;
		
		case 8:
		case 9: return new THREE.Vector3(0,0,1); break;
		
		case 10:
		case 11: return new THREE.Vector3(0,0,-1); break;
		
	}
	return new THREE.Vector3(0,0,0);
}

function randomMovements()
{
	var nMovements = 1;
	switch (currentLevel)
	{
		case 'Novice':	nMovements = 2; break;
		case 'Meduim':	nMovements = 5; break;
		case 'Expert':	nMovements = 10; break;
	}
	for (var i=0; i<nMovements; i++)
		updateIndexes(Math.floor(Math.random() * n*3), (Math.random() > 0.5) ? 90 : -90);		
}

function onStart(size,level)
{
	scene = new THREE.Scene();
	camera.position.z = 7;
	rotMatrix = new THREE.Matrix4();
	currentLevel = level;
	createCube(size);
	randomMovements(currentLevel);
	count = 0;
	currentFace = -1;
	document.getElementById("scores").style.visibility='hidden';
	
}
function onExit(size)
{
	scene = new THREE.Scene();
	camera.position.z = 7;
	rotMatrix = new THREE.Matrix4();
	createCube(size);
	document.getElementById("scores").style.visibility='hidden';
}
var Control = function() 
			{
			  this.SIZE = 3;
			  this.LEVEL = 'Novice';
			  this.START = function() 
			  { 
				onStart(parseInt(this.SIZE), this.LEVEL); 
			  };
			   this.EXIT = function() 
			  { 
				onExit(parseInt(this.SIZE)); 
			  };
			};

			
			var text = new Control();
			var gui = new dat.GUI();
			 
			gui.add(text, 'LEVEL', [ 'Novice', 'Meduim', 'Expert'] );

			
			
			var sizeControl = gui.add(text, 'SIZE', { 3: 3, 4: 4 } );
			
			gui.add(text, 'START');
			gui.add(text, 'EXIT');
		

function init() 
{
	
	
	camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 1000 );
	camera.position.z = 7;
	scene = new THREE.Scene();
	
	createCube(n);
	
	renderer = new THREE.WebGLRenderer({antialias : true, preserveDrawingBuffer: true});
	renderer.gammaInput = true;
	renderer.gammaOutput = true;	// required for readPixels
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );
	renderer.setClearColor(0x000000, 1.0);
	document.body.appendChild( renderer.domElement );
	
	window.addEventListener('resize',    onWindowResize,  false);
	window.addEventListener("mousedown", handleMouseDown, false);
	window.addEventListener("mouseup",   handleMouseUp,   false);
	window.addEventListener("mousemove", handleMouseMove, false);
	// IE9, Chrome, Safari, Opera
	window.addEventListener("mousewheel", onMouseWheel, false);
	// Firefox
	window.addEventListener("DOMMouseScroll", onMouseWheel, false);			
	count = 0;
	currentFace = Math.floor(Math.random() * n*3);
}

function onWindowResize() 
{
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize( window.innerWidth, window.innerHeight );
}

function animate() 
{
	requestAnimationFrame( animate );
	rotate(currentAngle);
	scene.quaternion.setFromRotationMatrix(rotMatrix);
	renderer.render( scene, camera );
}

function getClickedCube()
{
	var x = (event.clientX / window.innerWidth)  * 2 -1;
	var y = ((window.innerHeight-1-event.clientY) / window.innerHeight) * 2 -1;

	var vector = new THREE.Vector3(x, y, 0.5);
	vector = vector.unproject(camera);
    var raycaster = new THREE.Raycaster(camera.position, vector.sub(camera.position).normalize());
    var intersects = raycaster.intersectObjects(cubes);
	if (intersects.length > 0) 
	{
		var dMin = intersects[0].distance;
		var i = 0;
		for (var j=1; j<intersects.length; j++)
			if (dMin > intersects[j].distance)
			{
				dMin = intersects[j].distance;
				i = j;
			}
		return intersects[i];
	}
	return null;

}

function handleMouseDown(event) 
{
	if (event.button == 0)
		mouseLeftDown = true;
	if (event.button == 1)
		mouseMidDown = true;
	lastMouseX = event.clientX;
	lastMouseY = event.clientY;
	if (count == 0)
		lastCubeClicked = getClickedCube();
	else
		lastCubeClicked = null;
}

function handleMouseUp(event) 
{
	if (event.button == 0)
		mouseLeftDown = false;
	if (event.button == 1)
		mouseMidDown = false;
	if (count ==0 && lastCubeClicked != null)
	{
		// let´s see where the user has released the mouse
		var currentCubeUp = getClickedCube();
		if (currentCubeUp != null)
		{
			// we can compute the difference, if not the same
			if (lastCubeClicked.object != currentCubeUp.object)
			{
				// only one different axis is allowed
				var diff = new THREE.Vector3
				(
					currentCubeUp.object.index[0]-lastCubeClicked.object.index[0], 
					currentCubeUp.object.index[1]-lastCubeClicked.object.index[1], 
					currentCubeUp.object.index[2]-lastCubeClicked.object.index[2] 
				);
				var counter = 0;
				for (var i=0; i<3; i++)
					if (diff.getComponent(i) != 0) 
						counter++;
				if (counter==1)	// only one coordinate, eureka, good movement!
				{
					// now we have to compute the normal of the clicked polygons
					// they should be the same normal, otherwise, no actions
					var a = faceToNormal(lastCubeClicked.faceIndex);
					var b = faceToNormal(currentCubeUp.faceIndex);
					if (a.x == b.x && a.y == b.y && a.z == b.z)
					{
						var normal = a.cross(diff).normalize();
						count = 1;
						if (normal.x == 0.0 && normal.y == 0.0)
						{
							currentFace = currentCubeUp.object.index[2];
							currentAngle= (normal.z >= 0.0) ? 90.0:-90.0;
						}
						else if (normal.y == 0.0 && normal.z == 0.0)
						{
							currentFace = n + currentCubeUp.object.index[0];
							currentAngle= (normal.x >= 0.0) ? 90.0:-90.0;
						}
						else
						{
							currentFace = 2*n + currentCubeUp.object.index[1];
							currentAngle= (normal.y >= 0.0) ? 90.0:-90.0;
						}
					}
					
				}
			}
		}
	}
	
}

function onMouseWheel(event) 
{
	var delta = 0;
	if (!event) // For IE. 
		event = window.event;
	if (event.wheelDelta) 	// IE/Opera. 
	{ 
		delta = event.wheelDelta/120;
	} 
	else if (event.detail) 	// Mozilla case. 
	{ 
		delta = -event.detail/3;
	}
	if (delta)
		handleScroll(delta);
	if (event.preventDefault)
		event.preventDefault();
	event.returnValue = false;
}

function handleScroll(delta) 
{
	camera.position.z += delta * 0.5;
	if (camera.position.z > 40)
		camera.position.z = 40;
	else if (camera.position.z < 6)
		camera.position.z = 6;
}		

function handleMouseMove(event) 
{
	var newX = event.clientX;
	var newY = event.clientY;
	var deltaX = newX - lastMouseX;
	var deltaY = newY - lastMouseY;
	// do something with delta
	if (mouseLeftDown) 	
	{
		if (lastCubeClicked == null && (deltaX !=0 || deltaY!=0))
		{
			var angle = 0.01 * Math.sqrt(deltaX*deltaX+deltaY*deltaY);
			var r = new THREE.Matrix4();
			var axis = new THREE.Vector3(deltaY, deltaX, 0.0);
			axis.normalize();
			r.makeRotationAxis(axis, angle);
			rotMatrix.multiplyMatrices(r, rotMatrix);
		}
	}
	
	lastMouseX = newX
	lastMouseY = newY;
}	
	

