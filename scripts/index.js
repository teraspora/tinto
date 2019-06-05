// Tinto, a tool for creating colour palettes
// Author: John Lynch
// Date: June 2019
// File: tinto/scripts/index.js 

// get a random integer in range [0, n]
let randInt = n => Math.floor(n * Math.random());

const [W, H] = [8, 8];
const hueFactor = 360 / (W * H);
const rgbFactor = 255 / W;  // if W != H will need separate factors
let [hue, saturation, lightness] = [0, 0, 0];
let [R, G, B] = [0, 0, 0];
let [minLightness, maxLightness] = [16, 80]
let random = true;
let hueOffset = randInt(360);

let [fixRed, fixGreen, fixBlue] = [false, false, false];
let [fixHue, fixSaturation, fixLightness] = [false, false, false];

// Get refs to all radio buttons
let redOffRadio = document.getElementById(`red-off`);
let redOnRadio = document.getElementById(`red-on`);
let greenOffRadio = document.getElementById(`green-off`);
let greenOnRadio = document.getElementById(`green-on`);
let blueOffRadio = document.getElementById(`blue-off`);
let blueOnRadio = document.getElementById(`blue-on`);

let hueOffRadio = document.getElementById(`hue-off`);
let hueOnRadio = document.getElementById(`hue-on`);
let saturationOffRadio = document.getElementById(`saturation-off`);
let saturationOnRadio = document.getElementById(`saturation-on`);
let lightnessOffRadio = document.getElementById(`lightness-off`);
let lightnessOnRadio = document.getElementById(`lightness-on`);



// Temporary colours for the squares so I can distinguish them until I've
// written the code to colour them properly
const sq_cols = [`#1ac3ff`, `#c41a77`];

const grid = document.getElementById("cgrid");

/*
    Create a block of coloured squares, varying two of hue, saturation and lightness
    in the two dimensions while keeping the third constant
*/
initCells((i, j) => `hsl(${((j * W + i) * hueFactor + hueOffset) % 360}, 100%, 48%)`)

// document.getElementById("tbtn-hue").addEventListener('click', function() {
//     // set hue; for now, a random value
//     hue = randInt(360);
//     cells.forEach(cell => cell.style.backgroundColor =  
//         `hsl(${hue}, ${cell.x * 36 / (W - 1) + 64}%, ${cell.y * maxLightness / (H - 1) + minLightness}%)`);
// });

// document.getElementById("tbtn-red").addEventListener('click', function() {
//     redValue = randInt(360);
//     cells.forEach(cell => cell.style.backgroundColor =  
//         `rgb(${redValue}, ${rgbFactor * cell.x}, ${rgbFactor * cell.y})`);
// });

// document.getElementById("tbtn-green").addEventListener('click', function() {
//     greenValue = randInt(360);
//     cells.forEach(cell => cell.style.backgroundColor =  
//         `rgb(${rgbFactor * cell.x}, ${greenValue}, ${rgbFactor * cell.y})`);
// });

// document.getElementById("tbtn-blue").addEventListener('click', function() {
//     blueValue = randInt(360);
//     cells.forEach(cell => cell.style.backgroundColor =  
//         `rgb(${rgbFactor * cell.x}, ${rgbFactor * cell.y}, ${blueValue})`);
// });

document.getElementById("red-on").addEventListener('change', function() {
    console.log(`Red-on: ${this.checked}`);
    [fixRed, fixGreen, fixBlue] = [true, false, false];
    [greenOffRadio.checked, greenOnRadio.checked, blueOffRadio.checked, blueOnRadio.checked]
        = [true, false, true, false];
    resetHslRadios();
});

document.getElementById("red-off").addEventListener('change', function() {
    console.log(`Red-off: ${this.checked}`);
    fixRed = false;
});

document.getElementById("green-on").addEventListener('change', function() {
    console.log(`Green-on: ${this.checked}`);
    [fixRed, fixGreen, fixBlue] = [false, true, false];
    [redOffRadio.checked, redOnRadio.checked, blueOffRadio.checked, blueOnRadio.checked]
        = [true, false, true, false];
    resetHslRadios();
});

document.getElementById("green-off").addEventListener('change', function() {
    console.log(`Green-off: ${this.checked}`);
    fixGreen = false;
});

document.getElementById("blue-on").addEventListener('change', function() {
    console.log(`Blue-on: ${this.checked}`);
    [fixRed, fixGreen, fixBlue] = [false, false, true];
    [redOffRadio.checked, redOnRadio.checked, greenOffRadio.checked, greenOnRadio.checked]
        = [true, false, true, false];
    resetHslRadios();
});

document.getElementById("blue-off").addEventListener('change', function() {
    console.log(`Blue-off: ${this.checked}`);
    fixBlue = false;
});





document.getElementById("generate").addEventListener('click', generate);




let cells = Array.from(grid.children);
cells.forEach(cell => cell.addEventListener('click', showVariants));


function showVariants() {
    // show a block of 16 variants of the clicked colour
    // clicking one of these adds it to the palette,
    // gracefully, fades the block and goes back to the previous view;
    console.log(`cell (${this.x}, ${this.y}) clicked -\n    Show a block of 16 variants of the clicked colour`);
    this.style.backgroundColor = `#000000`;
}

function initCells(setCellColour) {
    for (let j = 0; j < H; j++) {
        for (let i = 0; i < W; i++) {
            let cell = document.createElement("div");
            cell.x = i;
            cell.y = j;
            // Set some initial colours for the cells... 
            cell.style.backgroundColor =  setCellColour(i, j);
            cgrid.appendChild(cell);
        }   
    }
}

function resetHslRadios() {
    [fixHue, fixSaturation, fixLightness] = [false, false, false];
    hueOffRadio.checked = true; 
    hueOnRadio.checked = false; 
    saturationOffRadio.checked = true; 
    saturationOnRadio.checked = false; 
    lightnessOffRadio.checked = true; 
    lightnessOnRadio.checked = false; 
}

function generate() {
    console.log("Generate button clicked!");
    if (fixRed) {
        redValue = randInt(256);
        cells.forEach(cell => cell.style.backgroundColor =  
            `rgb(${redValue}, ${rgbFactor * cell.x}, ${rgbFactor * cell.y})`);
    }
    else if (fixGreen) {
        greenValue = randInt(256);
        cells.forEach(cell => cell.style.backgroundColor =  
            `rgb(${rgbFactor * cell.x}, ${greenValue}, ${rgbFactor * cell.y})`);
    }
    else if (fixBlue) {
        blueValue = randInt(256);
        cells.forEach(cell => cell.style.backgroundColor =  
            `rgb(${rgbFactor * cell.x}, ${rgbFactor * cell.y}, ${blueValue})`);       
    }
    else if (fixHue) {
        hue = randInt(360);
        cells.forEach(cell => cell.style.backgroundColor =  
            `hsl(${hue}, ${cell.x * 36 / (W - 1) + 64}%, ${cell.y * maxLightness / (H - 1) + minLightness}%)`);
    }
    else if (fixSaturation) {
        saturation = randInt(101);
        cells.forEach(cell => cell.style.backgroundColor =  
            `hsl(${cell.x * 360 / W}, ${saturation}%, ${cell.y * maxLightness / (H - 1) + minLightness}%)`);
    }
    else if (fixLightness) {
        lightness = randInt(101);
        cells.forEach(cell => cell.style.backgroundColor =  
            `hsl(${cell.x * 360 / W}, ${cell.x * 36 / (W - 1) + 64}%, ${lightness}%)`);
    }

}