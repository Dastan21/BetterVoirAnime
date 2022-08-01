chrome.storage.sync.get(['style_activation'], (res) => {
    if (res != undefined) {
        if (res.style_activation === false) {
            chrome.browserAction.setBadgeText({
                text: 'OFF'
            })
        } else {
            chrome.browserAction.setBadgeText({
                text: 'ON'
            })
        }
    } else {
        chrome.storage.sync.set({'style_activation': true})
        chrome.browserAction.setBadgeText({
            text: 'ON'
        })
    }
})

if (!window.indexedDB) {
    window.alert("Votre navigateur ne supporte pas une version stable d'indexedDB. Quelques fonctionnalités ne seront pas disponibles.")
} else {
    var db;
    var request = window.indexedDB.open('bvanimeDB', 3)

    request.onerror = (event) => {
        alert("Pourquoi ne permettez-vous pas à ma web app d'utiliser IndexedDB?!");
    }
    request.onupgradeneeded = (event) => {
        var db = event.target.result;

        var objectStore = db.createObjectStore("animes", { keyPath: "ssn" });

        objectStore.createIndex("title", "title", {unique: true})
        objectStore.createIndex("url", "url", {unique: true})
        objectStore.createIndex("image", "image", {unique: false})
        objectStore.createIndex("date", "date", {unique: false})
    }
    request.onsuccess = (event) => {
        db = event.target.result;

        db.onerror = function(event) {
            // Gestionnaire d'erreur générique pour toutes les erreurs de requêtes de cette base
            alert("Database error: " + event.target.errorCode);
        };
    }
}