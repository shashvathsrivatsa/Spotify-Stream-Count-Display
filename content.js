//!  ---  INITIALIZE  ---  !//
let streamCountData = [];

function renderPlaysLabel() {
    const header = document.querySelector('.gvLrgQXBFVW6m9MscfFA');
    const playsLabelElement = document.createElement('div');
    playsLabelElement.innerHTML = 'Plays';
    playsLabelElement.classList.add('plays-label');
    header.append(playsLabelElement);

    header.style.display = 'flex';
    header.style.justifyContent = 'space-between';
    playsLabelElement.style.marginRight = '200px';
}

//!  ---  SCRAPER  ---  !//
function scrapeContent() {
    try {
        const contents = document.querySelector('.jEMA2gVoLgPQqAFrPhFw');
        const container = contents.querySelector('.JUa6JJNj7R_Y3i4P8YUX');
        const playlist = container.children[1];

        let elementsList = [];

        for (let i = 0; i < playlist.children.length; i++) {
            const song = playlist.children[i];
            const data = song.children[0];
            const leftPart = data.children[1]

            const streamCountElement = document.createElement('div');
            streamCountElement.innerHTML = '243M';
            streamCountElement.classList.add('play-count');
            leftPart.append(streamCountElement);
            elementsList.push(streamCountElement);

            leftPart.style.display = 'flex';
            leftPart.style.justifyContent = 'space-between';
            streamCountElement.style.marginRight = '200px';
        }

        return elementsList;
    } catch (error) {
        console.error('Error scraping content', error);
        return;
    }
}

//!  ---  RENDER STREAM COUNTS  ---  !//
function renderStreamCounts(elements, data) {
    elements.forEach((element, i) => {
        element.innerHTML = data[i];
    });
}

//!  ---  WAIT UNTIL LOADED  ---  !//
let ifLoadedInterval = setInterval(() => {
    let contents = document.querySelector('.jEMA2gVoLgPQqAFrPhFw');
    if (contents) {
        clearInterval(ifLoadedInterval);
        setTimeout(async () => {
            
            renderPlaysLabel();
            const streamCountElementsList = await scrapeContent();
            renderStreamCounts(streamCountElementsList, streamCountData);
            
        }, 1000);
    }
}, 100);

//!  ---  LISTENER  ---  !//
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {

    if (request.message === 'stream-counts') {
        streamCountData = request.data;
    }

});
