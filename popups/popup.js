var el = document.getElementById('active')

chrome.storage.sync.get(['style_activation'], (res) => {
    if (res != undefined) {
        if (res.style_activation === false) {
            el.innerHTML = 'OFF'
            chrome.browserAction.setBadgeText({
                text: 'OFF'
            })
        } else {
            el.innerHTML = 'ON'
            chrome.browserAction.setBadgeText({
                text: 'ON'
            })
        }
    } else {
        el.innerHTML = 'ON'
        chrome.storage.sync.set({'style_activation': true}, () => {
            chrome.browserAction.setBadgeText({
                text: 'ON'
            })
        })
    }
})

el.onclick = () => {
    if (el.innerHTML === 'ON') {
        el.innerHTML = 'OFF'
        chrome.storage.sync.set({'style_activation': false}, () => {
            chrome.browserAction.setBadgeText({
                text: 'OFF'
            })
        })
    } else {
        el.innerHTML = 'ON'
        chrome.storage.sync.set({'style_activation': true}, () => {
            chrome.browserAction.setBadgeText({
                text: 'ON'
            })
        })
    }
}