// Tinto, a tool for creating colour palettes
// Author: John Lynch
// Date: June 2019
// File: tinto/scripts/index.js 

// get a random integer in range [0, n]
let randInt = n => Math.floor(n * Math.random());

const [W, H] = [8, 8];
const hueFactor = 360 / (W * H - 1);
const rgbFactor = 255 / (W - 1);  // if W != H will need separate factors
const [minLightness, maxLightness] = [16, 80]

// Values set randomly or by user for R, G, B, H, S, L respectively
let values = [0, 0, 0, 0, 0, 0];
let names = [`Red`, `Green`, `Blue`, `Hue`, `Saturation`, `Lightness`];
let showHex = false;    // user button to toggle this
// Start somewhere different on the hue circle each time
let hueOffset = randInt(360);   

// Get refs to all switches (radio buttons)
const onSwitches = [];
const offSwitches = [];
// Event listeners for the 'VARY/FIX' radio buttons
for (let i = 0; i < 6; i++) {
    onSwitches[i] = document.getElementById(`on-${i}`);
    offSwitches[i] = document.getElementById(`off-${i}`);
    onSwitches[i].addEventListener('change', function() {
        simulateSliderInput(i);
    });
    offSwitches[i].addEventListener('change', function() {
        activeSliders.remove(i);
        setSliderOpacity();
        generate();
    });                        
}

// Get refs to all slider wrappers
const sliderWrappers = document.getElementsByClassName(`wrapper`);
// Event listeners for the sliders
for (let i = 0; i < 6; i++) {
    sliderWrappers[i].addEventListener('click', _ => {
        simulateSliderInput(i);
    });
}

// Get refs to the switch-holders
const switchboxes = document.getElementsByClassName(`switch`);

// Need this class to keep track of which sliders are active
class GroupedTwoElementQueue {
    constructor() {
        this._first = -1;
        this._second = -1;
        this._activeCount = 0;
    }
    get first() {
        return this._first;
    }
    set first(value) {
        this._first = value;
    }
    get second() {
        return this._second;
    }
    set second(value) {
        this._second = value;
    }
    get activeCount() {
        return this._activeCount;
    }
    set activeCount(value) {
        this._activeCount = value;
    }
    
    static siblings(sliderA, sliderB) {
        if (sliderA < 0 || sliderB < 0) {
            return false;
        }
        return (sliderA - 2.5) *  (sliderB - 2.5) > 0;    // test if both in same group (RGB or HSL)
    }

    clear() {
        this._first = -1;
        this._second = -1;
        this._activeCount = 0;
    }

    has(slider) {
        return this._first == slider || this._second == slider;
    }

    push(slider) {
        if (this.has(slider)) {
            if (this._first == slider && this._second != -1) {
                this._first = this._second;
                this._second = slider; 
            }
        }
        else if (this._first == -1) { // if both are unset
            this._first = slider;
            this._activeCount = 1;
        }
        else if (this._second == -1) {   // if only first is set
            if (this.constructor.siblings(this._first, slider)) {    // if new one in same group, append 
                this._second = slider;
                this._activeCount = 2;
            }
            else {  // if new one in different group, overwrite first, starting anew
                this._first = slider;
                this._second = -1;
                this._activeCount = 1;
            }
        }
        else if (this.constructor.siblings(this._second, slider)) {  // if new one in same group, push down
            this._first = this._second;
            this._second = slider;
            this._activeCount = 2;
        }
        else {  // if new one in different group, overwrite first, starting anew
            this._first = slider;
            this._second = -1;
                this._activeCount = 1;
        }
    }

    remove(slider) {
        if (this.has(slider)) {
            if (this._first == slider) {
                if (this._second == -1) {   // now all are turned off
                    this._first = -1;
                    this._activeCount = 0; 
                }
                else {                      // shift second to first and turn off second
                    this._first = this._second;
                    this._second = -1;
                    this._activeCount = 1;  
                }
            }
            else {                          // just turn off second, leaving first
                this._second = -1;
                this._activeCount = 1;
            }
        }
    }
}

// -1: none active; 0: red; 1: green ... , 5: lig
const activeSliders = new GroupedTwoElementQueue();

// Range slider code, adapted from A PEN BY Marine Piette
// at https://codepen.io/mayuMPH/pen/ZjxGEY
const rangeSliders = [];
const rangeBullets = [];
for (let i = 0; i < 6; i++) {
    rangeSliders[i] = document.getElementById("rs-range-line-" + i);
    rangeSliders[i].addEventListener("input", handleSliderValueChange, false);
    rangeBullets[i] = document.getElementById("rs-bullet-" + i);
}

function handleSliderValueChange() {
  let currentSlider = Number(this.id.substr(-1));
  activeSliders.push(currentSlider);
  setSliderOpacity();
  setSwitches();
  let slider = rangeSliders[currentSlider];
  let bullet = rangeBullets[currentSlider];
  values[currentSlider] = slider.value;
  bullet.innerHTML = values[currentSlider];
  let bulletPosition = (values[currentSlider] / slider.max);
  bullet.style.left = (bulletPosition * slider.clientWidth) + "px";
  setStatus(`${names[currentSlider]}: ${values[currentSlider]}`);
  generate();
}

// ==========================================================================

// Grid of coloured squares
const colourGrid = document.getElementById("colour-grid");

initCells((i, j) => `hsl(${((j * W + i) * hueFactor + hueOffset) % 360}, 100%, 48%)`)

let cells = Array.from(colourGrid.children);
cells.forEach(cell => {
    cell.addEventListener('click', showVariants);
    cell.classList.add('cell');
    let span = document.createElement(`SPAN`);  // default opacity 0 for hex colours
    span.style.lineHeight = window.getComputedStyle(cell).height;   // centre it on y axis
    span.classList.add(`hexColour`)
    cell.appendChild(span);
});

// =================================================================================================

// Status indicator
const status = document.getElementById("status");

// Listener for 'Show Hex' button
document.getElementById("show-hex").addEventListener('click', function() {
    showHex = !showHex;
    this.innerText = showHex ? "HIDE HEX" : "SHOW HEX";
    generate();
});

// =================================================================================================

function showVariants() {
    // will show a block of 16 variants of the clicked colour
    // clicking one of these adds it to the palette,
    // gracefully, fades the block and goes back to the previous view;
    console.log(`cell (${this.x}, ${this.y}) clicked -\n    Show a block of 16 variants of the clicked colour`);
    // temporarily, just turn the cell black
    // so I can see something's happened
    // this.style.backgroundColor = `#000000`;
    document.getElementById(`modal`).style.display = `block`;
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

function setSwitches() {
    for (let i = 0; i < 6; i++) {
        let sliderIsActive = activeSliders.has(i);
        onSwitches[i].checked = sliderIsActive;
        offSwitches[i].checked = !sliderIsActive;
    }
     
}

function setSliderOpacity() {
    for (let i = 0; i < 6; i++) {
        sliderWrappers[i].style.opacity = activeSliders.has(i) ? 1 : 0.3;
    }
}

function generate() {
    if (activeSlider < 0) {
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
    cells.forEach(cell => {
        let span = cell.firstChild;
        span.innerText = rgb2Hex(cell.style.backgroundColor);
        span.style.opacity = showHex ? 1 : 0;
    });
}   // END generate()

function setStatus(text) {
    status.innerText = text;
}

function rgb2Hex(colour) {
    let rgb = colour.slice(4,-1).split(`,`);
    return `#`
      + (`0` + Number(rgb[0]).toString(16)).slice(-2)
      + (`0` + Number(rgb[1]).toString(16)).slice(-2)
      + (`0` + Number(rgb[2]).toString(16)).slice(-2);
}

// Code for this function modified from
// https://developer.mozilla.org/samples/domref/dispatchEvent.html
function simulateSliderInput(slider) {
  let ev = document.createEvent("MouseEvents");
  let target = rangeSliders[slider]
  ev.initMouseEvent("input", true, true, window,
    0, 0, 0, 0, 0, false, false, false, false, 0, null);
  target.dispatchEvent(ev);  
}