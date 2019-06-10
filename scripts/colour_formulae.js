// colour_formulae.js



function getLuminance(rgbColour) {
    // Using formula from https://www.w3.org/TR/WCAG20-TECHS/G17.html and
    // https://www.w3.org/TR/2008/REC-WCAG20-20081211/#relativeluminancedef
    // Normalised so black => 0 and white => 1
    let srgb = sRgbTriple(rgbColour);
    let [R, G, B] = srgb.map(x => x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4);
    return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

function sRgbTriple(rgbColour) {
    return rgb2NumericComponents(rgbColour).map(component => component / 255);
}

function rgb2NumericComponents(rgbColour) {
    let rgb = rgbColour.slice(4,-1).split(`,`);
    return [Number(rgb[0]), Number(rgb[1]), Number(rgb[2])];
}

function rgb2Hex(rgbColour) {
    let rgb = rgbColour.slice(4,-1).split(`,`);
    return `#`
      + (`0` + Number(rgb[0]).toString(16)).slice(-2)
      + (`0` + Number(rgb[1]).toString(16)).slice(-2)
      + (`0` + Number(rgb[2]).toString(16)).slice(-2);
}

function rgb2HexStringComponents(rgbColour) {
    let rgb = rgbColour.slice(4,-1).split(`,`);
    return [
        (`0` + Number(rgb[0]).toString(16)).slice(-2),
        (`0` + Number(rgb[1]).toString(16)).slice(-2),
        (`0` + Number(rgb[2]).toString(16)).slice(-2)
    ];
}

function rgbComponentSum(rgbColour) {
    return rgb2NumericComponents(rgbColour).reduce((x, y) => x + y);
}

function contrastRatio(rgbColour_0, rgbColour_1) {
    let [lum_0, lum_1] = [rgbColour_0, rgbColour_1].map(col => getLuminance(col));
    let ratio = (lum_0 + 0.05) / (lum_1 + 0.05);
    return lum_0 > lum_1 ? ratio : 1. / ratio;
}
