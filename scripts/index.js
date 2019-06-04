// Tinto, a tool for creating colour palettes
// Author: John Lynch
// Date: June 2019
// File: tinto/scripts/index.js 

// get a random integer in range [0, n]
let randInt = n => Math.floor(n * Math.random());

const [W, H] = [8, 8];
let [hue, sat, lig] = [0, 0, 0];
let [R, G, B] = [0, 0, 0];
let [minLightness, maxLightness] = [16, 80]
// Temporary colours for the squares so I can distinguish them until I've
// written the code to colour them properly
const sq_cols = [`#1ac3ff`, `#c41a77`];

const grid = document.getElementById("cgrid");

/*
    Create a block of coloured squares, varying two of hue, saturation and lightness
    in the two dimensions while keeping the third constant
*/
initCells((i, j) => sq_cols[(i + j) % 2])

document.getElementById("tbtn-hue").addEventListener('click', function() {
    // set hue; for now, a random value
    hue = randInt(360);
    console.log(`Hue set to ${hue}`);
    cells.forEach(cell => cell.style.backgroundColor =  
        `hsl(${hue}, ${cell.x * 36 / (W - 1) + 64}%, ${cell.y * maxLightness / (H - 1) + minLightness}%)`);
});

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

