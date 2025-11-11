// TODO: The following won't work unless you use a roll up to bundle the script (eg. Vite)
// Reverting to inlining the necessary component here till then
//import { ViewPortBlocker } from './ViewPortBlocker.js'

function requestTopUpForAccess() {
    const request = { type: 'CS_REQUEST_TOPUP' }
    chrome.runtime.sendMessage(request, (response) => {
    })
}

const ViewPortBlocker = () => {
    // Create the viewPortBlocker element
    let viewPortBlocker = document.createElement('div');
    viewPortBlocker.id = 'thadai-viewport-blocker';
    viewPortBlocker.style.cssText = 'position: fixed !important; top: 0 !important; left: 0 !important; width: 100% !important; height: 100% !important; z-index: 9999 !important;';

    // Attach shadow root
    // Shadow DOM is a browser feature that allows you to attach a hidden, encapsulated DOM tree to an element. Styles and markup inside the shadow root are isolated from the rest of the page, preventing outside CSS from affecting your UI and vice versa.
    // This is ideal for browser extensions that inject UI into arbitrary websites.
    const shadow = viewPortBlocker.attachShadow({ mode: 'open' });

    // Create the container for content
    const container = document.createElement('div');
    container.style.cssText = 'width: 100%; height: 100%; background: black; display: flex; flex-direction: column; justify-content: center; align-items: center;';

    // Create the text content
    const textContent = document.createElement('div');
    textContent.style.cssText = 'color: white; font-size: 24px; text-align: center; margin-bottom: 20px;';
    textContent.textContent = 'This website is blocked to improve your productivity! Pay up if you still want to access.';
    textContent.appendChild(document.createElement('br'));

    // Create the button
    const unblockButton = document.createElement('button');
    unblockButton.id = 'thadai-viewport-blocker-unblock-button';
    unblockButton.textContent = 'Alright, I\'ll pay';
    unblockButton.style.cssText = 'margin-top: 20px; padding: 10px 20px; font-size: 16px; cursor: pointer; background: white; color: black; border-radius: 5px; border: none; box-shadow: 0 2px 6px rgba(0,0,0,0.15);';

    unblockButton.onclick = () => {
        document.body.style.overflow = '';
        const viewPortBlocker = document.getElementById('thadai-viewport-blocker');
        if (viewPortBlocker) {
            requestTopUpForAccess()
        }
    };

    textContent.appendChild(unblockButton);
    container.appendChild(textContent);
    shadow.appendChild(container);

    return viewPortBlocker;
}

//-----------------------------------------------------------------------------

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type == 'BGW_ON_ACCESS_ALLOWED') {
        sendResponse({ success: true })
        unblockViewPort()
    }
})

function processViewPortBlock() {
    const request = { type: 'CS_IS_ACCESS_ALLOWED' }
    chrome.runtime.sendMessage(request, (response) => {
        if (response && response.accessAllowed) {
            unblockViewPort()
        } else {
            blockViewPort()
        }
    })
}

function blockViewPort() {
    let viewPortBlocker = ViewPortBlocker();
    document.body.style.overflow = 'hidden';
    document.body.appendChild(viewPortBlocker);
}

function unblockViewPort() {
    const viewPortBlocker = document.getElementById('thadai-viewport-blocker');
    if (viewPortBlocker) {
        viewPortBlocker.remove();
    }
}

const websitesToBlock = [
    'www.facebook.com',
    'www.instagram.com',
    'www.reddit.com',
    'www.youtube.com'
]

function isWebsiteBlocked(hostname) {
    return websitesToBlock.includes(hostname)
}

//-----------------------------------------------------------------------------

if (isWebsiteBlocked(window.location.hostname)) {
    processViewPortBlock()
}