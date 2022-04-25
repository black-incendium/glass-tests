let canvas, gl;

function initializeWebGL() {

    canvas = document.querySelector('canvas');
    gl = canvas.getContext('webgl');

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  
    gl.viewport(0,0,window.innerWidth, window.innerHeight);

    gl.clearColor(0.85, 0.85, 0.85, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    runMainFlow();
}

function runMainFlow() {

    let vertexShaderText = `
        precision mediump float;

        attribute vec2 vertexPosition;
        attribute vec3 vertexColor;

        varying vec3 fragColor;

        void main() {

            fragColor = vertexColor;
            gl_Position = vec4(vertexPosition.xy, 0.0, 1.0);
        }
    `;

    let fragmentShaderText = `
        precision mediump float;

        varying vec3 fragColor;

        void main() {

            gl_FragColor = vec4(fragColor, 1.0);
        }
    `;

    let vertexShader = gl.createShader(gl.VERTEX_SHADER);
    let fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);

    gl.shaderSource(vertexShader, vertexShaderText);
    gl.shaderSource(fragmentShader, fragmentShaderText);

    gl.compileShader(vertexShader);
    if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
        console.error('error compiling vertex shader', '\n', gl.getShaderInfoLog(vertexShader));
        return;
    }

    gl.compileShader(fragmentShader);
    if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
        console.error('error compiling fragment shader', '\n', gl.getShaderInfoLog(fragmentShader));
        return;
    }

    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error('error linking program', '\n', gl.getProgramInfoLog(program));
        return;
    }

    gl.validateProgram(program);
    if (!gl.getProgramParameter(program, gl.VALIDATE_STATUS)) {
        console.error('error validating program', '\n', gl.getProgramInfoLog(program));
        return;
    }

    let color = {
        r:50,
        g:90,
        b:255
    }

    let gapSize = 1 *2/canvas.width;

    const triangleVertices = [
        -1.0, 0.0, color.r, color.g, color.b,
        0.0, 0.9, color.r, color.g, color.b,
        0.0, -0.9, color.r, color.g, color.b,
        0.0+gapSize, 0.9, color.r, color.g, color.b,
        0.0+gapSize, -0.9, color.r, color.g, color.b,
        1.0, 0.0, color.r, color.g, color.b,
    ]

    const triangleVerticesBufferObject = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, triangleVerticesBufferObject);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(triangleVertices), gl.STATIC_DRAW)

    let positionAttribLocation = gl.getAttribLocation(program, 'vertexPosition');
    let colorAttribLocation = gl.getAttribLocation(program, 'vertexColor');
    gl.vertexAttribPointer(
        positionAttribLocation, //Attribute location
        2, //number of elements per attribute (2 because vertexPosition is vec2)
        gl.FLOAT, //type of elements
        gl.FALSE, //is data normalized
        5 * Float32Array.BYTES_PER_ELEMENT, //size of an individual vertex (2 because 2 numbers and 4 is size of float)
        0 //offset from the beginning of a single vertex to this attribute
    );

    gl.vertexAttribPointer(
        colorAttribLocation, //Attribute location
        3, //number of elements per attribute (2 because vertexPosition is vec2)
        gl.FLOAT, //type of elements
        gl.FALSE, //is data normalized
        5 * Float32Array.BYTES_PER_ELEMENT, //size of an individual vertex (2 because 2 numbers and 4 is size of float)
        2 * Float32Array.BYTES_PER_ELEMENT //offset from the beginning of a single vertex to this attribute
    );

    gl.enableVertexAttribArray(positionAttribLocation);
    gl.enableVertexAttribArray(colorAttribLocation);

    // ----------------------------- MAIN RENDER LOOP GOES HERE ---------------------------------

    gl.useProgram(program);
    gl.drawArrays(gl.TRIANGLES, 0, triangleVertices.length/5) //uses active buffer, second parameter is how many verticies to skip and third is how many verticies there are to draw
}
  
initializeWebGL();