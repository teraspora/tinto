// Tinto, a tool for creating colour palettes
// Author: John Lynch
// Date: June 2019
// File: tinto/scripts/index.js 

const W = 8;
const H = 8;

// Temporary colours for the squares so I can distinguish them until I've
// written the code to colour them properly
const sq_cols = [`#1ac3ff`, `#c41a77`];

const grid = document.getElementById("cgrid");

/*
    Create a block of coloured squares, varying hue and lightness
    in the two dimensions while keeping saturation constant
*/
for (let j = 0; j < H; j++) {
    for (let i = 0; i < W; i++) {
        let cell = document.createElement("div");
        cell.x = i;
        cell.y = j;
        cell.state = 0;
        cell.flip = false;
        cell.style.backgroundColor =  sq_cols[(i + j) % 2];
        cgrid.appendChild(cell);
    }   
}

let cells = Array.from(grid.children);
cells.forEach(cell => cell.addEventListener('click', showVariants));


function showVariants() {
    // show a block of 16 variants of the clicked colour
    // clicking one of these adds it to the palette,
    // gracefully, fades the block and goes back to the previous view;
    console.log(`cell (${cell.x}, ${cell.y} clicked -\n    Show a block of 16 variants of the clicked colour`);
}