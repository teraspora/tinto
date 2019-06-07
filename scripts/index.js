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

// Values set randomly or by user for R, G, B, H, S, L respectively
let values = [0, 0, 0, 0, 0, 0];
let names = [`Red`, `Green`, `Blue`, `Hue`, `Saturation`, `Lightness`];
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

const sliderWrappers = document.getElementsByClassName(`wrapper`);
const switches = document.getElementsByClassName(`switch`);
for(let w of sliderWrappers) {
    w.addEventListener('click', _ => {
        setSliderOpacity(1); 
        setRadioOpacity(0.5);});
}
// -1: none active; 0: red active; 1: green active ... blue 2, hue 3, sat 4, lig 5
let activeSlider = -1
// and the grid of coloured squares
const colourGrid = document.getElementById("colour-grid");
// and the status indicator
const status = document.getElementById("status");

// Range slider code, adapted from A PEN BY Marine Piette
// at https://codepen.io/mayuMPH/pen/ZjxGEY
const rangeSliders = [];
const rangeBullets = [];
for (let i = 0; i < 6; i++) {
    rangeSliders[i] = document.getElementById("rs-range-line-" + i);
    rangeSliders[i].addEventListener("input", showSliderValue, false);
    rangeBullets[i] = document.getElementById("rs-bullet-" + i);
}

function showSliderValue() {
  setSliderOpacity(1);
  setRadioOpacity(0.5);
  activeSlider = Number(this.id.substr(-1));
  let slider = rangeSliders[activeSlider];
  let bullet = rangeBullets[activeSlider];
  values[activeSlider] = slider.value;
  bullet.innerHTML = values[activeSlider];
  let bulletPosition = (values[activeSlider] / slider.max);
  bullet.style.left = (bulletPosition * slider.clientWidth) + "px";
  setStatus(`${names[activeSlider]}: ${values[activeSlider]}`);
  resetRgbRadios();
  resetHslRadios();
}

function highlightSlider(currentSlider) {
    currentSlider.style.transform = `scale(1.1)`;
    currentSlider.style.filter = `invert(100%)`;
}

function unHighlightSlider(currentSlider) {
    currentSlider.style.transform = ``;
    currentSlider.style.filter = ``;
}


// ==========================================================================

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
    activeSlider = -1;
    setRadioOpacity(1);
    setSliderOpacity(0.5);
});

redOffRadio.addEventListener('change', function() {
    fixRed = false;
    activeSlider = -1;
    setRadioOpacity(1);
    setSliderOpacity(0.5);
});

greenOnRadio.addEventListener('change', function() {
    [fixRed, fixGreen, fixBlue] = [false, true, false];
    [redOffRadio.checked, redOnRadio.checked, blueOffRadio.checked, blueOnRadio.checked]
        = [true, false, true, false];
    resetHslRadios();
    activeSlider = -2;
    setRadioOpacity(1);
    setSliderOpacity(0.5);
});

greenOffRadio.addEventListener('change', function() {
    fixGreen = false;
    activeSlider = -2;
    setRadioOpacity(1);
    setSliderOpacity(0.5);
});

blueOnRadio.addEventListener('change', function() {
    [fixRed, fixGreen, fixBlue] = [false, false, true];
    [redOffRadio.checked, redOnRadio.checked, greenOffRadio.checked, greenOnRadio.checked]
        = [true, false, true, false];
    resetHslRadios();
    setRadioOpacity(1);
    activeSlider = -3;
    setSliderOpacity(0.5);
});

blueOffRadio.addEventListener('change', function() {
    fixBlue = false;
    setRadioOpacity(1);
    activeSlider = -3;
    setSliderOpacity(0.5);
});

// =======================================================================================

hueOnRadio.addEventListener('change', function() {
    [fixHue, fixSaturation, fixLightness] = [true, false, false];
    [saturationOffRadio.checked, saturationOnRadio.checked, lightnessOffRadio.checked, lightnessOnRadio.checked]
        = [true, false, true, false];
    resetRgbRadios();
    setRadioOpacity(1);
    activeSlider = -4;
    setSliderOpacity(0.5);
});

hueOffRadio.addEventListener('change', function() {
    fixHue = false;
    activeSlider = -4;
    setRadioOpacity(1);
    setSliderOpacity(0.5);
});

saturationOnRadio.addEventListener('change', function() {
    [fixHue, fixSaturation, fixLightness] = [false, true, false];
    [hueOffRadio.checked, hueOnRadio.checked, lightnessOffRadio.checked, lightnessOnRadio.checked]
        = [true, false, true, false];
    resetRgbRadios();
    activeSlider = -5;
    setRadioOpacity(1);
    setSliderOpacity(0.5);
});

saturationOffRadio.addEventListener('change', function() {
    fixSaturation = false;
    activeSlider = -5;
    setRadioOpacity(1);
    setSliderOpacity(0.5);
});

lightnessOnRadio.addEventListener('change', function() {
    [fixHue, fixSaturation, fixLightness] = [false, false, true];
    [hueOffRadio.checked, hueOnRadio.checked, saturationOffRadio.checked, saturationOnRadio.checked]
        = [true, false, true, false];
    resetRgbRadios();
    activeSlider = -6;
    setRadioOpacity(1);
    setSliderOpacity(0.5);
});

lightnessOffRadio.addEventListener('change', function() {
    fixLightness = false;
    activeSlider = -6;
    setRadioOpacity(1);
    setSliderOpacity(0.5);
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

function setSliderOpacity(opacity) {
    for (let w of sliderWrappers) {
        w.style.opacity = opacity;
    }
}

function dimOtherSliders() {
    for (let i = 0; i < 6; i++) {
        if (i != activeSlider) {
            sliderWrappers[i].style.opacity = 0.3;
        }
    }
}

function setRadioOpacity(opacity) {
    for (let s of switches) {
        s.style.opacity = opacity;
    }
}

function dimOtherSwitches() {
    for (let i = 0; i < 6; i++) {
        if (i + 1 != -activeSlider) {
            switches[i].style.opacity = 0.3;
        }
    }
}

function generate() {
    if (activeSlider < 0) {
        dimOtherSwitches();
        if (fixRed) {
            values[0] = randInt(256);
            setStatus(`Red: ${values[0]}`);
            cells.forEach(cell => cell.style.backgroundColor =  
                `rgb(${values[0]}, ${rgbFactor * cell.x}, ${rgbFactor * cell.y})`);
        }
        else if (fixGreen) {
            values[1] = randInt(256);
            setStatus(`Green: ${values[1]}`);
            cells.forEach(cell => cell.style.backgroundColor =  
                `rgb(${rgbFactor * cell.x}, ${values[1]}, ${rgbFactor * cell.y})`);
        }
        else if (fixBlue) {
            values[2] = randInt(256);
            setStatus(`Blue: ${values[2]}`);
            cells.forEach(cell => cell.style.backgroundColor =  
                `rgb(${rgbFactor * cell.x}, ${rgbFactor * cell.y}, ${values[2]})`);       
        }
        else if (fixHue) {
            values[3] = randInt(360);
            setStatus(`Hue: ${values[3]}`);
            cells.forEach(cell => cell.style.backgroundColor =  
                `hsl(${values[3]}, ${cell.x * 100 / W}%, ${cell.y * maxLightness / (H - 1) + minLightness}%)`);
        }
        else if (fixSaturation) {
            values[4] = randInt(101);
            setStatus(`Saturation: ${values[4]}`);
            cells.forEach(cell => cell.style.backgroundColor =  
                `hsl(${cell.x * 360 / W}, ${values[4]}%, ${cell.y * maxLightness / (H - 1) + minLightness}%)`);
        }
        else if (fixLightness) {
            values[5] = randInt(101);
            setStatus(`Lightness: ${values[5]}`);
            cells.forEach(cell => cell.style.backgroundColor =  
                `hsl(${cell.x * 360 / W}, ${(H - cell.y) * 100 / W}%, ${values[5]}%)`);
        }
    }
    else {
        setStatus(`${names[activeSlider]}: ${values[activeSlider]}`);
        dimOtherSliders();
        switch (activeSlider) {
            case 0: 
                cells.forEach(cell => cell.style.backgroundColor =  
                `rgb(${values[0]}, ${rgbFactor * cell.x}, ${rgbFactor * cell.y})`);
                break;
            case 1: 
                cells.forEach(cell => cell.style.backgroundColor =  
                `rgb(${rgbFactor * cell.x}, ${values[1]}, ${rgbFactor * cell.y})`);
                break;          
            case 2: 
                cells.forEach(cell => cell.style.backgroundColor =  
                `rgb(${rgbFactor * cell.x}, ${rgbFactor * cell.y}, ${values[2]})`);
                break;          
            case 3: 
                cells.forEach(cell => cell.style.backgroundColor =  
                `hsl(${values[3]}, ${cell.x * 100 / W}%, ${cell.y * maxLightness / (H - 1) + minLightness}%)`);
                break;          
            case 4: 
                cells.forEach(cell => cell.style.backgroundColor =  
                `hsl(${cell.x * 360 / W}, ${values[4]}%, ${cell.y * maxLightness / (H - 1) + minLightness}%)`);
                break;          
            case 5: 
                cells.forEach(cell => cell.style.backgroundColor =  
                `hsl(${cell.x * 360 / W}, ${(H - cell.y) * 100 / W}%, ${values[5]}%)`);
                break;
        }            
    }
}

function setStatus(text) {
    status.innerText = text;
}