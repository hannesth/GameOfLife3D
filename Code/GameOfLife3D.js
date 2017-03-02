/////////////////////////////////////////////////////////////////
//    Verkefni 2 í Tölvugrafík
//    Game of Life in 3D
/////////////////////////////////////////////////////////////////


//
// Global Variables
//

var canvas;
var gl;

var numVertices  = 36;

var points = [];
var colors = [];

var height = 0.0;

var movement = false;     // Do we rotate?
var spinX = -45;
var spinY = -45;
var origX;
var origY;

//number of boxes in each direction, i.e. n x n x n boxes.
var n = 20;

//size of cell for box.

var lengthCell = 2.0/n;

//size of box.

var lengthBox = lengthCell/1.1;

// Size of view Box
var lengthViewBox = 1.7;

var near = -lengthViewBox;
var far = lengthViewBox;
var left = -lengthViewBox;
var right = lengthViewBox;
var ytop = lengthViewBox;
var bottom = -lengthViewBox;

var modelViewMatrix, projectionMatrix;
var modelViewMatrixLoc, projectionMatrixLoc;

var previousState, currentState;
var numberOfNeighbours;
var lifeState;



var consoleCount = 0;

var isChangeStateCompleted = true;



var growthDecayFactor = 0.25;

var numberOfSteps = 1/growthDecayFactor; //Should be an integer





//
// init function:
//


window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    colorCube();

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.0, 0.0, 0.0, 1.0 );
    
    gl.enable(gl.DEPTH_TEST);

    //
    //  Load shaders and initialize attribute buffers
    //
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    
    var cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW );

    var vColor = gl.getAttribLocation( program, "vColor" );
    gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColor );

    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );

    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    modelViewMatrixLoc = gl.getUniformLocation( program, "modelViewMatrix" );
    projectionMatrixLoc = gl.getUniformLocation( program, "projectionMatrix" );

    
    // Preallocate n x n x n arrays previousState , currentState,  numberOfNeighbours and lifeState:

    previousState = new Array(n).fill(0);

    previousState = previousState.map( function(x) {
        return new Array(n).fill(0);
    });

    previousState = previousState.map( function(x) {
        return x.map( function(x) {
            return new Array(n).fill(0);
        });
    });


    currentState = new Array(n).fill(0);

    currentState = currentState.map( function(x) {
        return new Array(n).fill(0);
    });

    currentState = currentState.map( function(x) {
        return x.map( function(x) {
            return new Array(n).fill(0);
        });
    });

    numberOfNeighbours = new Array(n).fill(0);

    numberOfNeighbours = numberOfNeighbours.map( function(x) {
        return new Array(n).fill(0);
    });

    numberOfNeighbours = numberOfNeighbours.map( function(x) {
        return x.map( function(x) {
            return new Array(n).fill(0);
        });
    });

    lifeState = new Array(n).fill(0);

    lifeState = lifeState.map( function(x) {
        return new Array(n).fill(0);
    });

    lifeState = lifeState.map( function(x) {
        return x.map( function(x) {
            return new Array(n).fill(0);
        });
    });



    // Initialize previousState (1 means the box is alive, 0 means that it is dead)

    for(var i = 0; i < n; i++){
        for(var j = 0; j < n; j++){
            for(var k = 0; k < n; k++){
                previousState[i][j][k] = Math.round(0.62*Math.random());

            }
        }
    }



    // Event listener for keys up and down (zooming in and out)

    //Event listener for keyboard
    window.addEventListener("keydown", function(e){
        switch( e.keyCode ) {
            case 38: //efri ör
                if(lengthViewBox > 0.5) {
                    lengthViewBox *= 0.9;
                }
                break;
            case 40: //neðri ör
                lengthViewBox *= 1.1;
                break;
            default:
                lengthViewBox *= 1.0;

        }
    });




    //event listeners for mouse
    canvas.addEventListener("mousedown", function(e){
        movement = true;
        origX = e.offsetX;
        origY = e.offsetY;
        e.preventDefault();         // Disable drag and drop
    } );

    canvas.addEventListener("mouseup", function(e){
        movement = false;
    } );

    canvas.addEventListener("mousemove", function(e){
        if(movement) {
    	    spinY = ( spinY + (e.offsetX - origX) ) % 360;
            spinX = ( spinX + (e.offsetY - origY) ) % 360;
            origX = e.offsetX;
            origY = e.offsetY;
        }
    } );
    
    render();
}












//
// Several helper functions:
//

function isInsideBounds(i,j,k)
{
	if( i>=0 && i<n && j>=0 && j<n && k>=0 && k<n ) {
		return true
	}
	else {
		return false
	}
}

function countNumberOfNeighbours(x,y,z)
{

	var count = 0;

	for(var i = -1; i <= 1; i++) {
		for(var j = -1; j<= 1; j++) {
			for(var k = -1; k <= 1; k++) {
				
				if(isInsideBounds(x+i,y+j,z+k)){
        			count = count + previousState[x+i][y+j][z+k];
    			}


			}
		}
	}

	count = count - previousState[x][y][z];
	return count;
}




function changeState(){
    isChangeStateCompleted = false;

        setTimeout(function() {
            
            for(var i = 0; i < n; i++){
                for(var j = 0; j < n; j++){
                    for(var k = 0; k < n; k++){
                        previousState[i][j][k] = currentState[i][j][k];
                    }
                }
            }

            isChangeStateCompleted = true;
        }, 1000)

}




function colorCube()
{
    quad( 1, 0, 3, 2 );
    quad( 2, 3, 7, 6 );
    quad( 3, 0, 4, 7 );
    quad( 6, 5, 1, 2 );
    quad( 4, 5, 6, 7 );
    quad( 5, 4, 0, 1 );
}

function quad(a, b, c, d) 
{
    var vertices = [
        vec3( -0.5, -0.5,  0.5 ),
        vec3( -0.5,  0.5,  0.5 ),
        vec3(  0.5,  0.5,  0.5 ),
        vec3(  0.5, -0.5,  0.5 ),
        vec3( -0.5, -0.5, -0.5 ),
        vec3( -0.5,  0.5, -0.5 ),
        vec3(  0.5,  0.5, -0.5 ),
        vec3(  0.5, -0.5, -0.5 )
    ];

    var vertexColors = [
        [ 0.0, 0.0, 0.0, 1.0 ],  // black
        [ 1.0, 0.0, 0.0, 1.0 ],  // red
        [ 1.0, 1.0, 0.0, 1.0 ],  // yellow
        [ 0.0, 1.0, 0.0, 1.0 ],  // green
        [ 0.0, 0.0, 1.0, 1.0 ],  // blue
        [ 0.5, 0.0, 0.5, 1.0 ],  // purple
        [ 1.0, 1.0, 1.0, 1.0 ]   // white
        [ 0.0, 0.0, 0.0, 1.0 ],  // black   
    ];

    // We need to parition the quad into two triangles in order for
    // WebGL to be able to render it.  In this case, we create two
    // triangles from the quad indices
    
    //vertex color assigned by the index of the vertex
    
    var indices = [ a, b, c, a, c, d ];

    for ( var i = 0; i < indices.length; ++i ) {
        points.push( vertices[indices[i]] );
        colors.push(vertexColors[indices[0]]);
        
    }
}
















//
// render function:
//

function render()
{
    setTimeout(function() {
        window.requestAnimFrame(render);
        gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

       

        //  Projection Matrix   
        near = -lengthViewBox;
        far = lengthViewBox;
        left = -lengthViewBox;
        right = lengthViewBox;
        ytop = lengthViewBox;
        bottom = -lengthViewBox; 
        projectionMatrix = ortho(left, right, bottom, ytop, near, far);
        gl.uniformMatrix4fv( projectionMatrixLoc, false, flatten(projectionMatrix) );

        


        // Calculate for each cell: 
        //
        // numberOfNeighbours using previousState
        // currentState using previousState and numberOfNeighbours
        // lifeState using previousState and currentState

        for(var i = 0; i < n; i++){
            for(var j = 0; j < n; j++){
                for(var k = 0; k < n; k++){

                    //Calculate numberOfNeighbours for each cell
				    numberOfNeighbours[i][j][k] = countNumberOfNeighbours(i,j,k);

                    //Calculate currentState for each cell
                    if(previousState[i][j][k] == 1)
                    {
                       if(numberOfNeighbours[i][j][k] >= 5 && numberOfNeighbours[i][j][k] <= 7){
                          currentState[i][j][k] = 1;
                       }
                       else {
                          currentState[i][j][k] = 0;
                       }
                    }

                    if(previousState[i][j][k] == 0 ) {
                       if(numberOfNeighbours[i][j][k] == 6){
                          currentState[i][j][k] = 1;
                       }
                       else {
                          currentState[i][j][k] = 0;
                       }
                    }

                    //Calculate lifeState for each cell

                    if(previousState[i][j][k] == 1 && currentState[i][j][k] == 0){
                        console.log("Dying")
                        lifeState[i][j][k] = -1; // dying
                       }
                    else if(previousState[i][j][k] == 0 && currentState[i][j][k] == 1) {
                        console.log("Cloning")
                        lifeState[i][j][k] = 1; // cloning
                       }
                    else {
                        lifeState[i][j][k] = 0; // staying alive or dead
                    }

                }
            }
        }



        // View rotations
        var ctm = mat4();
        ctm = mult( ctm, rotateX(spinX) );
        ctm = mult( ctm, rotateY(spinY) ) ;

        


        // Draw boxes according to currentState
        // Initial displacement
        var initDelta = -1.0 + lengthCell/2.0;
        var deltaX = 0;
        var deltaY = 0;
        var deltaZ = 0;

        for (var k = 0; k < n; k++) {
            for(var j = 0; j< n; j++) {
                for(var i = 0; i < n; i++){
                    
                    deltaX = initDelta + i*lengthCell;
                    deltaY = initDelta + j*lengthCell;
                    deltaZ = initDelta + k*lengthCell;


                    if(currentState[i][j][k] == 1){
                        ctm = mult( ctm, translate( deltaX, deltaY, deltaZ ));
                        ctm = mult( ctm, scalem( lengthBox, lengthBox, lengthBox ) );
                        gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(ctm));
                        gl.drawArrays( gl.TRIANGLES, 0, numVertices );
                    }

                    ctm = mat4();
                    ctm = mult( ctm, rotateX(spinX) );
                    ctm = mult( ctm, rotateY(spinY) ) ;

                }
            }
        }




        //Set previousState equal to currentState,
        // so that it calculates a new currentState, every 1 second
        if(isChangeStateCompleted){
            changeState();
        }


    }, 100)
}

