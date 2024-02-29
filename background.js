//!  ---  UTILS  ---  !//
function addCommasToNumber(number) {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

//!  ---  GET TAB ID  ---  !//
let currentTabId;
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.active && tab.url.startsWith('https://open.spotify.com/')) {
        currentTabId = tabId;
    }
});

//!  ---  INTERCEPT NETWORK REQUESTS  ---  !//
let url;

chrome.webRequest.onBeforeRequest.addListener(
    function(details) {
        if (details.url.includes('https://api-partner.spotify.com/pathfinder/v1/query?operationName=getAlbum')) {
            url = details.url;
        }
    },
    {urls: ["<all_urls>"]}
);

chrome.webRequest.onBeforeSendHeaders.addListener(
    async function(details) {
        try {
            if (details.url.includes('https://api-partner.spotify.com/pathfinder/v1/query?operationName=getAlbum')) {
                const headers = details.requestHeaders;
                const authorization = headers[2].value;
                const clientToken = headers[5].value;

                const streamCounts = await getStreamCount(url, authorization, clientToken);
                chrome.tabs.sendMessage(currentTabId, { message: 'stream-counts', data: streamCounts });
            }
        } catch (error) {
            if (error != "TypeError: Cannot read properties of undefined (reading 'value')" && error != "TypeError: Error in invocation of tabs.sendMessage(integer tabId, any message, optional object options, optional function callback): No matching signature.") {
                console.log(`Error getting stream count: ${error}`);
            }
        }
    },
    {urls: ["<all_urls>"]},
    ["requestHeaders"]
);

async function getStreamCount(url, authorization, clientToken) {
    try {
        const response = await fetch(url, {headers: {
            'Authorization': authorization,
            'Client-Token': clientToken
        }});
        const data = await response.json();
        const trackList = data.data.albumUnion.tracks.items;
        const streamCounts = trackList.map(track => addCommasToNumber(track.track.playcount));
        return streamCounts;
    } catch (error) {
        console.log(`Error getting stream count: ${error}`);
    }
}

//!  ---  LISTENER  ---  !//
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {

    if (request.message === 'scraped-data') {
        console.log(request.message, request.data);
    }

});
