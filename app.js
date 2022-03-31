// Global selectors

const colorDivs = document.querySelectorAll(".color");
const generateBtn = document.querySelector(".generate");
const sliders = document.querySelectorAll(`input[type="range"]`);
const currentHexes = document.querySelectorAll(`.color h2`);
const popup = document.querySelector('.copy-container');
const adjustBtn = document.querySelectorAll('.adjust');
const lockBtn = document.querySelectorAll('.lock');
const closeAdjustments = document.querySelectorAll('.close-adjustment');
const sliderContainer = document.querySelectorAll('.sliders');
let initialColors;

// Local Storage
let savedpalette = [];


// EventListeners

sliders.forEach(slider => {
    slider.addEventListener('input', hslControls);
});

colorDivs.forEach((div, index)=>{
    div.addEventListener('change', ()=>{
        updateTextUI(index);
    });
}); 

currentHexes.forEach(hex => {
    hex.addEventListener('click', () => {
        copyToClipBoard(hex);
    });
});

popup.addEventListener('transitionend', ()=>{
    const popupChild = popup.children[0];
    popupChild.classList.remove('active');
    popup.classList.remove('active');
});

adjustBtn.forEach((btn, index) =>{
    btn.addEventListener('click', ()=>{
        openAdjustmentPanel(index);
    });
});

closeAdjustments.forEach((btn, index)=>{
    btn.addEventListener('click', ()=>{
        CloseAdjustmentPanel(index);
    })
})

generateBtn.addEventListener('click', randomColors);

lockBtn.forEach((btn, index) => {
    btn.addEventListener('click', (e)=> {
        lockpalette(e, index);
    });
});




// Functions

function generateHex(){
    const hexcolor = chroma.random();
    return hexcolor;
}

function randomColors(){

    initialColors = [];

    colorDivs.forEach((div, index) =>{
        const hexText = div.children[0];
        const randomColor = generateHex();

        // push each color into the initial color array
        if(div.classList.contains('locked')){
            initialColors.push(hexText.innerText);
            div.style.backgroundColor = hexText.innerText;
            hexText.innerText = hexText.innerText;
            return;
        }else{
            initialColors.push(randomColor.hex());
            div.style.backgroundColor = randomColor;
        hexText.innerText = randomColor;
        }

        // div.style.backgroundColor = randomColor;
        // hexText.innerText = randomColor;

        
        
        // console.log(initialColors)

        // cehck for contrast
        checkContrast(randomColor, hexText);

        // initial colorize
        const color = chroma(randomColor);
        const sliders = div.querySelectorAll(".sliders input");
        const hue = sliders[0];
        const brightness = sliders[1];
        const saturation = sliders[2];

        colorizeSlider(color, hue, brightness, saturation);
    });

    // reset slide input
    resetInput();
    // check for contrast on the icons
    adjustBtn.forEach((btn, index) => {
        checkContrast(initialColors[index], btn);
        checkContrast(initialColors[index], lockBtn[index])
    })
}

function checkContrast(color, text){
    const lum = chroma(color).luminance();

    if (lum > 0.5){
        text.style.color = "black";
    }else{
        text.style.color = "White";
    }
}

function colorizeSlider(color, hue, brightness, saturation){
    // sacale saturation
    const noSat = color.set('hsl.s', 0);
    const fullSat = color.set('hsl.s', 1);
    const scaleSat = chroma.scale([noSat, color, fullSat]);
    // scale Brightness
    const midBright = color.set('hsl.l', 0.5);
    const scaleBright = chroma.scale(["black", midBright, "white"]);

    // update input background colors
    saturation.style.backgroundImage = `linear-gradient(to right, ${scaleSat(0)}, ${scaleSat(1)})`;
    brightness.style.backgroundImage = `linear-gradient(to right, ${scaleBright(0)}, ${midBright}, ${scaleBright(1)})`;
    // hue.style.backgroundImage = `linear-gradient(to right, ${chroma.scale('Spectral').domain([0,1])})`;
    hue.style.backgroundImage = `linear-gradient(to right, rgb(204,75,75),rgb(204,204,75),rgb(75,204,75),rgb(75,204,204),rgb(75,75,204),rgb(204,75,204),rgb(204,75,75))`;
}

function hslControls(e){
    const index = e.target.getAttribute('data-bright') || e.target.getAttribute('data-sat') || e.target.getAttribute('data-hue');
    let sliders = e.target.parentElement.querySelectorAll("input[type='range']");
    const hue = sliders[0];
    const brightness = sliders[1];
    const saturation = sliders[2];

    const bgColor = initialColors[index];

    let color = chroma(bgColor)
    .set('hsl.s', saturation.value)
    .set('hsl.l', brightness.value)
    .set('hsl.h', hue.value);

    // set the background color
    colorDivs[index].style.backgroundColor = color;

    // colorize sliders
    colorizeSlider(color, hue, brightness, saturation);
}

function updateTextUI(index){
    const activeDiv = colorDivs[index];
    const color = chroma(activeDiv.style.backgroundColor);
    const textHex = activeDiv.querySelector('h2');
    const icons = activeDiv.querySelectorAll('.controls button');

    textHex.innerText = color.hex();
    // check contrast
    checkContrast(color, textHex);
    for (icon of icons){
        checkContrast(color, icon);
    }
}

function resetInput(){
    const slider = document.querySelectorAll('.sliders input');
    sliders.forEach(slider=>{
        if(slider.name === 'hue'){
            const hueColor = initialColors[slider.getAttribute('data-hue')];
            const hueValue = chroma(hueColor).hsl()[0];

            slider.value = Math.floor(hueValue);
        }
        if(slider.name === 'brightness'){
            const brightColor = initialColors[slider.getAttribute('data-bright')];
            const brightValue = chroma(brightColor).hsl()[2];

            slider.value = Math.floor(brightValue * 100)/100;
        }
        if(slider.name === 'saturation'){
            const satColor = initialColors[slider.getAttribute('data-sat')];
            const satValue = chroma(satColor).hsl()[1];

            slider.value = Math.floor(satValue * 100)/100;
        }
    })
}

function copyToClipBoard(hex){
    const el = document.createElement('textarea');
    el.value = hex.innerText;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
    // call animation after copy
    const popupChild = popup.children[0];
    popupChild.classList.add('active');
    popup.classList.add('active')
}

function openAdjustmentPanel(index){
    sliderContainer[index].classList.toggle('active');
}

function CloseAdjustmentPanel(index){
    sliderContainer[index].classList.remove('active');
}

function lockpalette(e, index){
    const lockSVG = e.target.children[0];
    const activeBg = colorDivs[index];
    activeBg.classList.toggle("locked");
  
    if (lockSVG.classList.contains("fa-lock-open")) {
      e.target.innerHTML = '<i class="fas fa-lock"></i>';
    } else {
      e.target.innerHTML = '<i class="fas fa-lock-open"></i>';
    }
}

// local storage and save palette
const saveBtn = document.querySelector('.save');
const submitSave = document.querySelector('.submit-save');
const closeSave = document.querySelector('.close-save');
const saveContainer = document.querySelector('.save-container');
const saveInput = document.querySelector('.save-container input');
const libraryContainer = document.querySelector('.library-container');
const closeLibraryBtn = document.querySelector('.close-library');
const libraryBtn = document.querySelector('.library');

// Event Listeners
saveBtn.addEventListener('click', openPalette);
closeSave.addEventListener('click', closePalette);
submitSave.addEventListener('click', savePalette);
libraryBtn.addEventListener('click', openLibrary);
closeLibraryBtn.addEventListener('click', closeLibrary);



// functions
function openPalette(e){
    const popup = saveContainer.children[0];
    saveContainer.classList.add('active');
    popup.classList.add('active');
}

function openLibrary(e){
    const popup = libraryContainer.children[0];
    libraryContainer.classList.add('active');
    popup.classList.add('active');
}

function closePalette(){
    const popup = saveContainer.children[0];
    saveContainer.classList.remove('active');
    popup.classList.remove('active');
}

function closeLibrary(e){
    const popup = libraryContainer.children[0];
    libraryContainer.classList.remove('active');
    popup.classList.remove('active');
}

function savePalette(e){
    saveContainer.classList.remove('active');
    popup.classList.remove('active');
    const paletteName = saveInput.value;
    const colors = [];
    saveInput.value = "";

    currentHexes.forEach(hex => {
        colors.push(hex.innerText)
    });

    
    let paletteNr;
    const paletteObjects = JSON.parse(localStorage.getItem('palettes'));
    if(paletteObjects){
        paletteNr = paletteObjects.length;
    }else{
        paletteNr = savedpalette.length; 
    }

    // Generate Object
    const paletteObj = {paletteName, colors, nr: paletteNr};
    savedpalette.push(paletteObj);
    // save to local storage
    saveToLocal(paletteObj);

    // generate palette for the library
    // 
    const palette = document.createElement('div')
    palette.classList.add('custom-palette');
    // 
    const title = document.createElement('h4');
    title.innerText = paletteObj.paletteName;
    // 
    const preview = document.createElement('div');
    preview.classList.add('small-preview');
    // loop through to get each color into the preview
    paletteObj.colors.forEach(color => {
        const div = document.createElement('div');
        div.classList.add('preview-color');
        div.style.background = color;
        preview.appendChild(div);
    })
    // 
    const paletteBtn = document.createElement('button');
    paletteBtn.classList.add('pick-palette-btn');
    paletteBtn.classList.add(paletteObj.nr);
    paletteBtn.innerText = 'Select';

    // attach event to btn
    paletteBtn.addEventListener('click', e => {
        closeLibrary();

        initialColors = []

        const paletteIndex = e.target.classList[1];
        savedpalette[paletteIndex].colors.forEach((color, index) => {
            initialColors.push(color);
            colorDivs[index].style.backgroundColor = color;
            const text = colorDivs[index].children[0];
            checkContrast(color,text)
            updateTextUI(index)
        })

        resetInput();
    });

    // append to library
    palette.appendChild(title);
    palette.appendChild(preview);
    palette.appendChild(paletteBtn);
    // 
    libraryContainer.children[0].appendChild(palette);
}

function saveToLocal(paletteObj){
    let localPalettes;
    if (localStorage.getItem('palettes') == null){
        localPalettes = [];
    }else{
        localPalettes = JSON.parse(localStorage.getItem('palettes'));
    }

    localPalettes.push(paletteObj);
    localStorage.setItem('palettes', JSON.stringify(localPalettes));
}

function getLocal(){
    if(localStorage.getItem('palettes') === null){
        localPalettes = [];
    }else{
        const paletteObjects = JSON.parse(localStorage.getItem('palettes'));
        paletteObjects.forEach(paletteObj => {
        // generate palette for the library
        // 
        const palette = document.createElement('div')
        palette.classList.add('custom-palette');
        // 
        const title = document.createElement('h4');
        title.innerText = paletteObj.paletteName;
        // 
        const preview = document.createElement('div');
        preview.classList.add('small-preview');
        // loop through to get each color into the preview
        paletteObj.colors.forEach(color => {
            const div = document.createElement('div');
            div.classList.add('preview-color');
            div.style.background = color;
            preview.appendChild(div);
        })
        // 
        const paletteBtn = document.createElement('button');
        paletteBtn.classList.add('pick-palette-btn');
        paletteBtn.classList.add(paletteObj.nr);
        paletteBtn.innerText = 'Select';

        // attach event to btn
        paletteBtn.addEventListener('click', e => {
            closeLibrary();

            initialColors = []

            const paletteIndex = e.target.classList[1];
            paletteObjects[paletteIndex].colors.forEach((color, index) => {
                initialColors.push(color);
                colorDivs[index].style.backgroundColor = color;
                const text = colorDivs[index].children[0];
                checkContrast(color,text)
                updateTextUI(index)
            })

            resetInput();
        });

        // append to library
        palette.appendChild(title);
        palette.appendChild(preview);
        palette.appendChild(paletteBtn);
        // 
        libraryContainer.children[0].appendChild(palette);
        })
    }
}




// 
getLocal();
randomColors();