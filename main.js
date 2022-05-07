let canvas, gl, image;

function initializeWebGL() {

    canvas = document.querySelector('canvas');
    gl = canvas.getContext('webgl2');

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  
    gl.viewport(0,0,window.innerWidth, window.innerHeight);

    gl.clearColor(0.85, 0.85, 0.85, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    image = new Image();
    image.src = './test.jpg';
    image.onload = runMainFlow;
}

function runMainFlow() {

    let vertexShaderText = `#version 300 es
        precision mediump float;

        in vec2 vertexPosition;
        in vec2 vShader_texCoord;

        out vec2 fShader_texCoord;

        void main() {

            fShader_texCoord = vShader_texCoord;
            gl_Position = vec4(vertexPosition.xy, 0.0, 1.0);
        }
    `;

    let fragmentShaderText = `#version 300 es
        precision highp float;

        uniform sampler2D image;

        in vec2 fShader_texCoord;

        out vec4 pixelColor;

        void main() {

            pixelColor = texture(image, fShader_texCoord);
        }
    `;

    const program = createProgramFromShaders(vertexShaderText, fragmentShaderText);

    const vertices = [
        -0.9, 0.9,
        -0.9, -0.9,
        0.9, -0.9,
        
        -0.9, 0.9,
        0.9, -0.9,
        0.9, 0.9,
    ];

    const verticesTexCoords = [
        0, 1,
        0, 0,
        1, 0,

        0, 1,
        1, 0,
        1, 1,
    ]

    let vao = gl.createVertexArray();
    gl.bindVertexArray(vao);

    const verticesBufferObject = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, verticesBufferObject);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW)
    const positionAttribLocation = gl.getAttribLocation(program, 'vertexPosition');
    gl.enableVertexAttribArray(positionAttribLocation);
    gl.vertexAttribPointer(
        positionAttribLocation, //Attribute location
        2, //number of elements per attribute (2 because vertexPosition is vec2)
        gl.FLOAT, //type of elements
        gl.FALSE, //is data normalized
        0, //size of an individual vertex (2 because 2 numbers and 4 is size of float)
        0 //offset from the beginning of a single vertex to this attribute
    );

    const verticesTexCoordsBufferObject = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, verticesTexCoordsBufferObject);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verticesTexCoords), gl.STATIC_DRAW)
    const texCoordAttribLocation = gl.getAttribLocation(program, 'vShader_texCoord');
    gl.enableVertexAttribArray(texCoordAttribLocation);
    gl.vertexAttribPointer(
        texCoordAttribLocation, //Attribute location
        2, //number of elements per attribute (3 because vertexPosition is vec3)
        gl.FLOAT, //type of elements
        gl.FALSE, //is data normalized
        0, //size of an individual vertex (2 because 2 numbers and 4 is size of float)
        0 //offset from the beginning of a single vertex to this attribute
    );

    let imageLocation = gl.getUniformLocation(program, "image");

    let texture = gl.createTexture();

    gl.activeTexture(gl.TEXTURE0 + 0);

    gl.bindTexture(gl.TEXTURE_2D, texture);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

    gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        image
    );

    // gl.uniform2f(resolutionLocation, gl.canvas.width, gl.canvas.height);

    gl.uniform1i(imageLocation, 0);

    // ----------------------------- MAIN RENDER LOOP GOES HERE ---------------------------------

    gl.useProgram(program);
    gl.drawArrays(gl.TRIANGLES, 0, triangleVertices.length/2) //uses active buffer, second parameter is how many verticies to skip and third is how many verticies there are to draw
}

function createProgramFromShaders(vertexShaderText, fragmentShaderText) {
    
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

    let program = gl.createProgram();
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

    return program;
}

function drawImage({image, srcX = 0, srcY = 0, srcWidth = 0, srcHeight = 0, x = 0, y = 0, width, height}) {

    if (image == undefined || width == undefined || height == undefined) throw 'error, undefined values in drawImage';

    console.log({image, srcX, srcY, srcWidth, srcHeight, x, y, width, height})
}
  
initializeWebGL();