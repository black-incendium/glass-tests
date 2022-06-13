const vertexShaderSrc = `#version 300 es

layout(location = 0) in vec2 vShader_Position;
layout(location = 1) in vec2 vShader_TexCoordLoc;

out vec2 fShader_TexCoordLoc;

void main()
{
    fShader_TexCoordLoc = vShader_TexCoordLoc;
    gl_Position = vec4(vShader_Position, 0.0, 1.0);
}`;

const fragmentShaderSrc = `#version 300 es

precision highp float;

uniform sampler2D uniform_pixelSampler;
uniform sampler2D uniform_imageSampler;

in vec2 fShader_TexCoordLoc;

out vec4 fragColor;

void main()
{
    fragColor = texture(uniform_pixelSampler, fShader_TexCoordLoc) * texture(uniform_imageSampler, fShader_TexCoordLoc);
}`;

const canvas = document.querySelector('canvas');
const gl = canvas.getContext('webgl2');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

gl.viewport(0,0,window.innerWidth, window.innerHeight);

const program = gl.createProgram();

{
    const vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, vertexShaderSrc);
    gl.compileShader(vertexShader);
    gl.attachShader(program, vertexShader);

    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, fragmentShaderSrc);
    gl.compileShader(fragmentShader);
    gl.attachShader(program, fragmentShader);

    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.log(gl.getShaderInfoLog(vertexShader));
        console.log(gl.getShaderInfoLog(fragmentShader));
    }
}

gl.useProgram(program);



const verticesNumber = 6;

const verticesPositionsBufferData32Arr = new Float32Array([
    -1, 1,
    -1, -1,
    1, -1,
    -1, 1,
    1, -1,
    1, 1,
]);

const verticesTexCoordsBufferData32Arr = new Float32Array([
    0, 1,
    0, 0,
    1, 0,
    0, 1,
    1, 0,
    1, 1,
])

const pixelsData8Arr = new Uint8Array([
    255,0,255,    0,0,255,    255,0,0,     255,255,255,
    0,0,0,        0,255,255,  255,255,0,   0,255,0,
    255,0,255,    0,0,255,    255,0,0,     255,255,255,
    0,0,0,        0,255,255,  255,255,0,   0,255,0, 
])

const vShader_PositionLoc = 0;
const vShader_TexCoordLoc = 1;


const verticesPositionsBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, verticesPositionsBuffer);
gl.bufferData(gl.ARRAY_BUFFER, verticesPositionsBufferData32Arr, gl.STATIC_DRAW);
gl.vertexAttribPointer(
    vShader_PositionLoc,                    // location
    2,                                      // size
    gl.FLOAT,                               // type
    false,                                  // normalized
    verticesPositionsBufferData32Arr.length/verticesNumber * Float32Array.BYTES_PER_ELEMENT,     // size of one vertex
    0 * Float32Array.BYTES_PER_ELEMENT      // attribute offset
);
gl.enableVertexAttribArray(vShader_PositionLoc);


const verticesTexCoordsBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, verticesTexCoordsBuffer);
gl.bufferData(gl.ARRAY_BUFFER, verticesTexCoordsBufferData32Arr, gl.STATIC_DRAW);
gl.vertexAttribPointer(
    vShader_TexCoordLoc,                    // location
    2,                                      // size
    gl.FLOAT,                               // type
    false,                                  // normalized
    verticesTexCoordsBufferData32Arr.length/verticesNumber * Float32Array.BYTES_PER_ELEMENT,     // size of one vertex
    0 * Float32Array.BYTES_PER_ELEMENT      // attribute offset
);
gl.enableVertexAttribArray(vShader_TexCoordLoc);

let image = new Image();
image.src = './ryba.png';
image.addEventListener('load', ()=>{

    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true)


    const pixelTextureUnit = 0;
    const imageTextureUnit = 2;

    gl.uniform1i(gl.getUniformLocation(program, 'uniform_pixelSampler'), pixelTextureUnit);
    gl.uniform1i(gl.getUniformLocation(program, 'uniform_imageSampler'), imageTextureUnit);

    const pixelTexture = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0 + pixelTextureUnit);
    gl.bindTexture(gl.TEXTURE_2D, pixelTexture);
    gl.texImage2D(
        gl.TEXTURE_2D,       // target
        0,                   // level (mipmap)
        gl.RGB,              // internalFormat 
        4,                   // width
        4,                   // height
        0,                   // border (must be 0)
        gl.RGB,              // format 
        gl.UNSIGNED_BYTE,    // type
        pixelsData8Arr       // source
    );
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)

    const imageTexture = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0 + imageTextureUnit);
    gl.bindTexture(gl.TEXTURE_2D, imageTexture);
    gl.texImage2D(
        gl.TEXTURE_2D,       // target
        0,                   // level (mipmap)
        gl.RGB,              // internalFormat 
        474,                 // width (optional if browser can find it)
        474,                 // height (optional if browser can find it)
        0,                   // border (must be 0) (optional if browser can find it)
        gl.RGB,              // format 
        gl.UNSIGNED_BYTE,    // type
        image                // source
    );
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)

    gl.drawArrays(gl.TRIANGLES, 0, verticesNumber);
})



function getRandomPointData() {

    let pos = {
        x: Math.random()*1.8-0.9,
        y: Math.random()*1.8-0.9,
    }

    let colors = [
        {
            r: 1,
            g: 1,
            b: 1
        },
        {
            r: 0,
            g: 1,
            b: 1
        },
        {
            r: 1,
            g: 0,
            b: 1
        },
        {
            r: 1,
            g: 1,
            b: 0
        },
        {
            r: 0,
            g: 0,
            b: 1
        },
        {
            r: 0,
            g: 1,
            b: 0
        },
        {
            r: 1,
            g: 0,
            b: 0
        },
        {
            r: 0,
            g: 0,
            b: 0
        },
    ]

    let colorIndex = Math.floor(Math.random()*colors.length)

    return [
        pos.x,
        pos.y,
        Math.random()*9+1,
        colors[colorIndex].r,
        colors[colorIndex].g,
        colors[colorIndex].b,
        1,
    ]
}