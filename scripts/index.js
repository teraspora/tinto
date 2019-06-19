// Tinto, a tool for creating colour palettes
// Author: John Lynch
// Date: June 2019
// File: tinto/scripts/index.js 

// get a random integer in range [0, n]
let randInt = n => Math.floor(n * Math.random());

const BLACK = `#000000`;
const WHITE = `#ffffff`;
const NULL_STR = ``;
const NBSP = `\xa0`;
const NEWLINE = `\n`;
const SEMICOLON = `;`;

const [W, H] = [8, 8];
const hueFactor = 360 / (W * H - 1);
const rgbFactor = 256 / (W - 1);  // if W != H will need separate factors
const rgb1dFactor = 256 / (W * H - 1);
const slFactor = 100 / (W * H - 1);
const [minLightness, maxLightness] = [16, 80]

// Values set randomly or by user for R, G, B, H, S, L respectively
const values = [0, 0, 0, 0, 0, 0];
const names = [`Red`, `Green`, `Blue`, `Hue`, `Saturation`, `Lightness`];
let showHex = false;    // user button to toggle this
let showLum = false;    // user button to toggle this

// Start somewhere different on the hue circle each time
let hueOffset = randInt(360);   
let randomMode = `hsl`;
const selectedColours = [];

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

// Colour palette - set up, and supply fns to append colours
// to and remove colours from it.
const palette = Array.from(document.getElementsByClassName(`palette`));
let index = 0;

function getRemoveIcon(paletteSlot) {
    return paletteSlot.nextElementSibling.firstChild;
}

palette.forEach(paletteSlot => {
    paletteSlot.isActive = false;
    getRemoveIcon(paletteSlot).addEventListener(`click`, ev => {    // Target 'Remove' buttons
        let index = palette.findIndex(slot => slot == ev.target.parentElement.previousElementSibling);
        removeFromPalette(index);
    });
    paletteSlot.style.backgroundColor = BLACK;
    paletteSlot.index = index++;
    paletteSlot.addEventListener(`click`, ev => {
        let index = ev.target.index;
        selectPaletteColour(index);
    });
});

let paletteSize = 0;    // up to 6, inclusive
const showCode = document.getElementById(`show-code`);

function appendPalette(colour) {
    if (paletteSize == 6) return;
    let i;
    for (i = 0; i < 6; i++) {
        if (!palette[i].isActive) break;    // Find the first empty slot
    }
    palette[i].isActive = true;
    ++paletteSize;
    palette[i].style.backgroundColor = colour;
    getRemoveIcon(palette[i]).style.opacity = 1;
    let lum = getLuminance(colour);
    let conj = showHex && showLum ? ` / ` : NBSP;
    palette[i].innerText = `${showHex ? rgb2Hex(colour) : NBSP}${conj}${showLum ? lum.toFixed(2) : NBSP}`;
    palette[i].style.color = lum > 0.3 ? BLACK : WHITE;
    // If modal is currently being displayed, trigger a refresh.
    if (![`none`, NULL_STR].includes(modal.style.display)) simulateMouseEvent(showCode, `click`);    
}

function removeFromPalette(index) {
    if (!palette[index].isActive) return;
    palette[index].isActive = false;
    --paletteSize;
    palette[index].style.backgroundColor = `inherit`;
    getRemoveIcon(palette[index]).style.opacity = 0;
    palette[index].innerText = NBSP;
    palette[index].style.border = `1px solid var(--bright-col)`;
    if (isSelected(index)) {    // then unselect it
        if (index == selectedColours[0]) {
            selectedColours.shift();
        }
        else {
            selectedColours.pop();
        }
        palette[index].style.border = `1px solid var(--bright-col)`;
    }
    
    // If modal is currently being displayed, trigger a refresh.
    if (![`none`, NULL_STR].includes(modal.style.display)) simulateMouseEvent(showCode, `click`);
}

// Code to select palette colour for contrast ratio comparison
function isSelected(paletteSlotIndex) {
    return selectedColours.includes(paletteSlotIndex);
}

function selectPaletteColour(index) {
    console.log(`********** Colour ${index} clicked!`);
    if (!palette[index].isActive) return;
    if (isSelected(index)) {    // then unselect it
        if (index == selectedColours[0]) {
            selectedColours.shift();
        }
        else {
            selectedColours.pop();
        }
        palette[index].style.border = `1px solid var(--bright-col)`;
    }
    else {
        selectedColours.push(index);
        if (selectedColours.length == 3) {
            const indexToRemove = selectedColours.shift();
            palette[indexToRemove].style.border = `1px solid var(--bright-col)`;
        }
        // Highlight it by thickening the border and using the inverse colour for the border.
        const rgb = rgb2NumericComponents(palette[index].style.backgroundColor);
        const invertedRgb = rgb.map(component => 255 - component);
        const rgbString = `rgb(${invertedRgb[0]},${invertedRgb[1]},${invertedRgb[2]})`
        palette[index].style.border = `4px ridge ${rgbString}`;
        if (selectedColours.length == 2) {
            displayContrastInfo();
        }
    }
}
const contrastInfo = document.getElementById(`contrast-info`);
const col0Box = document.getElementById(`contrast-col0`);
const col1Box = document.getElementById(`contrast-col1`);
const contrastDetails = document.getElementById(`contrast-details`);

function displayContrastInfo() {
    dragBar.innerText = `Contrast Info`;
    const col0 = palette[selectedColours[0]].style.backgroundColor;
    const col1 = palette[selectedColours[1]].style.backgroundColor;
    col0Box.style.backgroundColor = col0;
    col1Box.style.backgroundColor = col1;
    col0Box.style.color = getLuminance(col0) > 0.3 ? BLACK : WHITE;
    col1Box.style.color = getLuminance(col1) > 0.3 ? BLACK : WHITE;
    col0Box.innerText = rgb2Hex(col0);
    col1Box.innerText = rgb2Hex(col1);
    contrastDetails.innerText = `Contrast ratio = ${contrastRatio(col0, col1).toFixed(2)}`;
    modal.replaceChild(contrastInfo, modal.lastElementChild);
    modal.style.display = `block`;
    modal.style.left = `calc(50% - ${modal.clientWidth / 2}px)`;
    modal.style.top = `calc(50% - ${modal.clientHeight / 2}px)`;
}



// Modal dialog - let user dismiss it by clicking in the body
// but not on buttons obviously; should be intuitive.
const codeBlock = document.getElementById(`code-block`);
const modal = document.getElementById(`modal`);
document.addEventListener('click', ev => {
    if (modal.style.display = `block` 
        && !Array.from(modal.querySelectorAll("*")).includes(ev.target)
        && ev.target != modal 
        // && ev.target != codeBlock
        && !Array.from(document.getElementById(`controls`).querySelectorAll("*")).includes(ev.target)
        && ev.target != showCode
        && !ev.target.classList.contains(`hex-colour`) 
        && !ev.target.classList.contains(`cell`)) {
            modal.style.display = `none`;
    }
});

// The following code to make the modal draggable adapted frpm
// https://www.w3schools.com/howto/tryit.asp?filename=tryhow_js_draggable
const dragBar = document.getElementById(`modal-drag-bar`);
dragModal();   // make modal draggable 

function dragModal() {
    let [x0, y0, x1, y1] = [0, 0, 0, 0];
    dragBar.onmousedown = dragMouseDown; 

    function dragMouseDown(ev) {
        ev = ev || window.event;
        ev.preventDefault();
        // get the mouse cursor position at startup:
        x1 = ev.clientX;
        y1 = ev.clientY;
        document.onmouseup = closeDragElement;
        // call a function whenever the cursor moves:
        document.onmousemove = elementDrag;
    }

    function elementDrag(ev) {
        ev = ev || window.event;
        ev.preventDefault();
        // calculate the new cursor position:
        x0 = x1 - ev.clientX;
        y0 = y1 - ev.clientY;
        x1 = ev.clientX;
        y1 = ev.clientY;
        // set the element's new position:
        modal.style.top = (modal.offsetTop - y0) + "px";
        modal.style.left = (modal.offsetLeft - x0) + "px";
    }

    function closeDragElement() {
        /* stop moving when mouse button is released:*/
        document.onmouseup = null;
        document.onmousemove = null;
    }
}

// Code to populate code block display of palette as 
// CSS vars and an array of hex colours as strings.
const varSlots = codeBlock.getElementsByClassName(`code-list-item`);
const varArray = document.getElementById(`code-item`);
showCode.addEventListener('click', _ => {
    let colours = palette.filter(slot => slot.isActive).map(paletteSlot => paletteSlot.style.backgroundColor);
    // show colours as a block of CSS custom properties ("CSS vars") ready to be pasted into a CSS file
    let varList = getCssVarList(colours);
    let i = 0;
    // Populate the code slots
    for (let item of varList) {
        varSlots[i++].innerText = item;
    }
    // Empty out the residue
    for (let j = i; j < 6; j++) {
        varSlots[i++].innerText = NULL_STR;
    }
    // show as a Javascript list; insert a space after each comma to follow best practice
    varArray.innerText = (`[\"` + colours.map(col => rgb2Hex(col)) + `\"]`).replace(/,/g, `\", \"`);
    dragBar.innerText = `Palette Code`;
    modal.replaceChild(codeBlock, modal.lastElementChild);
    modal.style.display = `block`;
    modal.style.left = `calc(50% - ${modal.clientWidth / 2}px)`;
    modal.style.top = `calc(50% - ${modal.clientHeight / 2}px)`;
});

// Activate the 'random' buttons.
document.getElementById("random-hsl").addEventListener('click', _ => {randomMode = `hsl`; reset();});
document.getElementById("random-rgb").addEventListener('click', _ => {randomMode = `rgb`; reset();});

document.getElementById("show-lum").addEventListener('click', function() {
    showLum = !showLum;
    this.innerText = showLum ? "HIDE LUMINANCE" : "SHOW LUMINANCE";
    for (let paletteSlot of palette) {
        let lum = getLuminance(paletteSlot.style.backgroundColor);
        let conj = showHex && showLum ? ` / ` : NBSP;
        paletteSlot.innerText = paletteSlot.isActive ? 
            `${showHex ? rgb2Hex(colour) : NULL_STR}${conj}${showLum ? lum.toFixed(2) : NULL_STR}` : NBSP;        
    }
    generate();
});

// Need this class to keep track of which sliders are active
class GroupedTwoElementQueue {
    constructor() {
        this._first = -1;
        this._second = -1;
        this._activeCount = 0;
        this._group = -1;
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
    
    get group() {
        return this._group;
    }
    set group(value) {  // -1: none active; 0: RGB; 1: HSL
        this._group = value > 0 ? 1 : value < 0 ? -1 : 0;
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
        this._group = -1;
    }

    has(slider) {
        return this._first == slider || this._second == slider;
    }

    push(slider) {
        if (slider < 0 || slider > 5) return;

        this._group = Math.trunc(slider / 3);   // 0, 1, 2 => (0 - RGB); 3, 4, 5 => (1 - HSL)

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
                    this._group = -1; 
                }
                else {                      // shift second to first and turn off second
                    this._first = this._second;
                    this._second = -1;
                    this._activeCount = 1;
                    // group stays the same  
                }
            }
            else {                          // just turn off second, leaving first
                this._second = -1;
                this._activeCount = 1;
                // group stays the same
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
  values[currentSlider] = Number(slider.value);
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
    cell.addEventListener('click', handleClickOnCell);
    cell.classList.add('cell');
    let span = document.createElement(`SPAN`);  // default opacity 0 for hex colours
    span.style.lineHeight = window.getComputedStyle(cell).height;   // centre it on y axis
    span.classList.add(`hex-colour`)
    cell.appendChild(span);
});

// =================================================================================================

// Status indicator
const status = document.getElementById("status");

// Listener for 'Show Hex' button
document.getElementById("show-hex").addEventListener('click', function() {
    showHex = !showHex;
    this.innerText = showHex ? "HIDE HEX" : "SHOW HEX";
    for (let paletteSlot of palette) {
        let colour = paletteSlot.style.backgroundColor;
        let lum = getLuminance(colour);
        paletteSlot.innerText = paletteSlot.isActive  && showLum ? `${lum.toFixed(2)}` : NBSP;    // == &nbsp;
        let conj = showHex && showLum ? ` / ` : NBSP;
        paletteSlot.innerText = paletteSlot.isActive ?
            `${showHex ? rgb2Hex(colour) : NULL_STR}${conj}${showLum ? lum.toFixed(2) : NULL_STR}` : NBSP;
    }
    generate();
});

// =================================================================================================

function reset() {
    activeSliders.clear();
    setSliderOpacity();
    setSwitches();
    generate();
}

function handleClickOnCell() {
    appendPalette(this.style.backgroundColor);
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

// We only want the two most recent, or one if user changed between RGB and HSL groups.
function setSwitches() {
    for (let i = 0; i < 6; i++) {
        let sliderIsActive = activeSliders.has(i);
        onSwitches[i].checked = sliderIsActive;
        offSwitches[i].checked = !sliderIsActive;
        switchboxes[i].style.opacity = activeSliders.group == Math.trunc(i / 3) ? 1 : 0.3;
    }     
}

// As above, we only want the two most recent, or one if user changed between RGB and HSL groups.
function setSliderOpacity() {
    for (let i = 0; i < 6; i++) {
        sliderWrappers[i].style.opacity = activeSliders.has(i) ? 1 : 0.3;
    }
}

// Main function to generate a new colour block and render it.
function generate() {
    switch (activeSliders.group) {
        case -1:    // If no sliders fixed, generate a grid of random colours
            setStatus(`Random ${randomMode.toUpperCase()}`);
            cells.forEach(cell => {
                cell.style.backgroundColor = randomMode == `hsl` ?
                    `hsl(${randInt(360)}, ${randInt(101)}%, ${randInt(101)}%)`
                    : `rgb(${randInt(256)}, ${randInt(256)}, ${randInt(256)})`;
            });
            break;
        case 0:     // Handle RGB cases
            switch (activeSliders.activeCount) {
                case 1: 
                    setStatus(`${names[activeSliders.first]}:  ${values[activeSliders.first]}`);
                    cells.forEach(cell => {
                        let rgb = activeSliders.has(0) ? [values[0], rgbFactor * cell.x, rgbFactor * cell.y]
                            : (activeSliders.has(1) ? [rgbFactor * cell.x, values[1], rgbFactor * cell.y]
                            : [rgbFactor * cell.x, rgbFactor * cell.y, values[2]]);
                        cell.style.backgroundColor = `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
                    });
                    break;
                case 2:
                    setStatus(`${names[activeSliders.first]}:  ${values[activeSliders.first]}, ${names[activeSliders.second]}:  ${values[activeSliders.second]}`);
                    cells.forEach(cell => {
                        let rgb = activeSliders.has(1) && activeSliders.has(2) ?
                            [(cell.y * W + cell.x) * rgb1dFactor, values[1], values[2]]
                            : (activeSliders.has(0) && activeSliders.has(2) ?
                            [values[0], (cell.y * W + cell.x) * rgb1dFactor, values[2]]
                            : [values[0], values[1], (cell.y * W + cell.x) * rgb1dFactor]);
                        cell.style.backgroundColor = `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
                    });
                    break;
            }   // END switch 
            break;      // not needed at present; leave for safety in case more code added above          
        case 1:     // Handle HSL cases
            switch (activeSliders.activeCount) {
                case 1: 
                    setStatus(`${names[activeSliders.first]}:  ${values[activeSliders.first]} `);
                    cells.forEach(cell => {
                        let hsl = activeSliders.has(3) ? [values[3], cell.x * 100 / W, cell.y * maxLightness / (H - 1) + minLightness]
                            : (activeSliders.has(4) ? [cell.x * 360 / W, values[4], cell.y * maxLightness / (H - 1) + minLightness]
                            : [cell.x * 360 / W, cell.y * 100 / H, values[5]]);
                        cell.style.backgroundColor = `hsl(${hsl[0]}, ${hsl[1]}%, ${hsl[2]}%)`;
                    });
                    break;
                case 2:
                    setStatus(`${names[activeSliders.first]}:  ${values[activeSliders.first]}, ${names[activeSliders.second]}:  ${values[activeSliders.second]}`);
                    cells.forEach(cell => {
                        let hsl = activeSliders.has(4) && activeSliders.has(5) ?
                            [(cell.y * W + cell.x) * hueFactor, values[4], values[5]]
                            : (activeSliders.has(3) && activeSliders.has(5) ?
                            [values[3], (cell.y * W + cell.x) * slFactor, values[5]]
                            : [values[3], values[4], (cell.y * W + cell.x) * slFactor]);
                        cell.style.backgroundColor = `hsl(${hsl[0]}, ${hsl[1]}%, ${hsl[2]}%)`;
                    });
                    break;
            }   // END switch
            break;   // not needed at present; leave for safety in case more code added above
    }   // END outermost switch 
    cells.forEach(cell => {
        let span = cell.firstChild;
        colour = cell.style.backgroundColor;
        hex = rgb2Hex(colour);
        span.innerText = showLum ? `${getLuminance(colour).toFixed(2)}` : (showHex ? hex : NBSP);
        // span.style.opacity = showHex ? 1 : 0;
        span.style.color = getLuminance(cell.style.backgroundColor) > 0.3 ? BLACK : WHITE;
    });
}   // END generate()

function setStatus(text) {
    status.innerHTML = `<pre><code>${text}</code></pre>`;
}

function simulateSliderInput(slider) {
    simulateMouseEvent(rangeSliders[slider], `input`);
}

function getCssVarList(colours) {
    let prefix = `--col-`;
    let i = -1;
    let varList = [];
    for (let col of colours) {
        varList[++i] = prefix + i + `: ` + rgb2Hex(col) + SEMICOLON;  
    }
    return varList;
}

// https://developer.mozilla.org/samples/domref/dispatchEvent.html
function simulateMouseEvent(target, eventType) {
    let ev = document.createEvent("MouseEvents");
    ev.initMouseEvent(eventType, true, true, window,
      0, 0, 0, 0, 0, false, false, false, false, 0, null);
    target.dispatchEvent(ev);
}
