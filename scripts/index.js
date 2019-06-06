// Tinto, a tool for creating colour palettes
// Author: John Lynch
// Date: June 2019
// File: tinto/scripts/index.js 

// get a random integer in range [0, n]
let randInt = n => Math.floor(n * Math.random());

const [W, H] = [8, 8];
const hueFactor = 360 / (W * H);
const rgbFactor = 255 / W;  // if W != H will need separate factors
const [minLightness, maxLightness] = [16, 80]

let [hue, saturation, lightness] = [0, 0, 0];
let [redValue, greenValue, blueValue] = [0, 0, 0];

let random = true;
// Start somewhere different on the hue circle each time
let hueOffset = randInt(360);   
let [fixRed, fixGreen, fixBlue] = [false, false, false];
let [fixHue, fixSaturation, fixLightness] = [false, false, false];

// Get refs to all radio buttons
const redOffRadio = document.getElementById(`red-off`);
const redOnRadio = document.getElementById(`red-on`);
const greenOffRadio = document.getElementById(`green-off`);
const greenOnRadio = document.getElementById(`green-on`);
const blueOffRadio = document.getElementById(`blue-off`);
const blueOnRadio = document.getElementById(`blue-on`);

const hueOffRadio = document.getElementById(`hue-off`);
const hueOnRadio = document.getElementById(`hue-on`);
const saturationOffRadio = document.getElementById(`saturation-off`);
const saturationOnRadio = document.getElementById(`saturation-on`);
const lightnessOffRadio = document.getElementById(`lightness-off`);
const lightnessOnRadio = document.getElementById(`lightness-on`);
// and the grid of coloured squares
const colourGrid = document.getElementById("colour-grid");
// and the status indicator
const status = document.getElementById("status");
/*
    Create a block of coloured squares
*/
initCells((i, j) => `hsl(${((j * W + i) * hueFactor + hueOffset) % 360}, 100%, 48%)`)

let cells = Array.from(colourGrid.children);
cells.forEach(cell => cell.addEventListener('click', showVariants));

// Event listeners for the 'VARY/FIX' radio buttons
redOnRadio.addEventListener('change', function() {
    [fixRed, fixGreen, fixBlue] = [true, false, false];
    [greenOffRadio.checked, greenOnRadio.checked, blueOffRadio.checked, blueOnRadio.checked]
        = [true, false, true, false];
    resetHslRadios();
});

redOffRadio.addEventListener('change', function() {
    fixRed = false;
});

greenOnRadio.addEventListener('change', function() {
    [fixRed, fixGreen, fixBlue] = [false, true, false];
    [redOffRadio.checked, redOnRadio.checked, blueOffRadio.checked, blueOnRadio.checked]
        = [true, false, true, false];
    resetHslRadios();
});

greenOffRadio.addEventListener('change', function() {
    fixGreen = false;
});

blueOnRadio.addEventListener('change', function() {
    [fixRed, fixGreen, fixBlue] = [false, false, true];
    [redOffRadio.checked, redOnRadio.checked, greenOffRadio.checked, greenOnRadio.checked]
        = [true, false, true, false];
    resetHslRadios();
});

blueOffRadio.addEventListener('change', function() {
    fixBlue = false;
});

// =======================================================================================

hueOnRadio.addEventListener('change', function() {
    [fixHue, fixSaturation, fixLightness] = [true, false, false];
    [saturationOffRadio.checked, saturationOnRadio.checked, lightnessOffRadio.checked, lightnessOnRadio.checked]
        = [true, false, true, false];
    resetRgbRadios();
});

hueOffRadio.addEventListener('change', function() {
    fixHue = false;
});

saturationOnRadio.addEventListener('change', function() {
    [fixHue, fixSaturation, fixLightness] = [false, true, false];
    [hueOffRadio.checked, hueOnRadio.checked, lightnessOffRadio.checked, lightnessOnRadio.checked]
        = [true, false, true, false];
    resetRgbRadios();
});

saturationOffRadio.addEventListener('change', function() {
    fixSaturation = false;
});

lightnessOnRadio.addEventListener('change', function() {
    [fixHue, fixSaturation, fixLightness] = [false, false, true];
    [hueOffRadio.checked, hueOnRadio.checked, saturationOffRadio.checked, saturationOnRadio.checked]
        = [true, false, true, false];
    resetRgbRadios();
});

lightnessOffRadio.addEventListener('change', function() {
    fixLightness = false;
});
// =================================================================================================

// Listener for 'Generate' button
document.getElementById("generate").addEventListener('click', generate);

// =================================================================================================

function showVariants() {
    // will show a block of 16 variants of the clicked colour
    // clicking one of these adds it to the palette,
    // gracefully, fades the block and goes back to the previous view;
    console.log(`cell (${this.x}, ${this.y}) clicked -\n    Show a block of 16 variants of the clicked colour`);
    // temporarily, just turn the cell black
    // so I can see something's happened
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
            colourGrid.appendChild(cell);
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

function resetRgbRadios() {
    [fixRed, fixGreen, fixBlue] = [false, false, false];
    redOffRadio.checked = true; 
    redOnRadio.checked = false; 
    greenOffRadio.checked = true;
    greenOnRadio.checked = false; 
    blueOffRadio.checked = true; 
    blueOnRadio.checked = false; 
}

function generate() {
    if (fixRed) {
        redValue = randInt(256);
        status.innerText = `Red: ${redValue}`
        cells.forEach(cell => cell.style.backgroundColor =  
            `rgb(${redValue}, ${rgbFactor * cell.x}, ${rgbFactor * cell.y})`);
    }
    else if (fixGreen) {
        greenValue = randInt(256);
        status.innerText = `Green: ${greenValue}`
        cells.forEach(cell => cell.style.backgroundColor =  
            `rgb(${rgbFactor * cell.x}, ${greenValue}, ${rgbFactor * cell.y})`);
    }
    else if (fixBlue) {
        blueValue = randInt(256);
        status.innerText = `Blue: ${blueValue}`
        cells.forEach(cell => cell.style.backgroundColor =  
            `rgb(${rgbFactor * cell.x}, ${rgbFactor * cell.y}, ${blueValue})`);       
    }
    else if (fixHue) {
        hue = randInt(360);
        status.innerText = `Hue: ${hue}`;
        cells.forEach(cell => cell.style.backgroundColor =  
            `hsl(${hue}, ${cell.x * 36 / (W - 1) + 64}%, ${cell.y * maxLightness / (H - 1) + minLightness}%)`);
    }
    else if (fixSaturation) {
        saturation = randInt(101);
        status.innerText = `Saturation: ${saturation}`;
        cells.forEach(cell => cell.style.backgroundColor =  
            `hsl(${cell.x * 360 / W}, ${saturation}%, ${cell.y * maxLightness / (H - 1) + minLightness}%)`);
    }
    else if (fixLightness) {
        lightness = randInt(101);
        status.innerText = `Lightness: ${lightness}`;
        cells.forEach(cell => cell.style.backgroundColor =  
            `hsl(${cell.x * 360 / W}, ${cell.y * 36 / (H - 1) + 64}%, ${lightness}%)`);
    }
}