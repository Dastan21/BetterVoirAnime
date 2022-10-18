
if (indexedDB == null) {
  console.error("Votre navigateur ne supporte pas une version stable d'indexedDB. Quelques fonctionnalités ne seront pas disponibles.")
} else {
  const request = indexedDB.open('bvanimeDB', 3)

  request.onerror = () => {
    console.error("Pourquoi ne permettez-vous pas à ma web app d'utiliser IndexedDB?!")
  }
  request.onupgradeneeded = (event) => {
    const db = event.target.result

    const objectStore = db.createObjectStore('animes', { keyPath: 'ssn' })

    objectStore.createIndex('title', 'title', { unique: true })
    objectStore.createIndex('url', 'url', { unique: true })
    objectStore.createIndex('image', 'image', { unique: false })
    objectStore.createIndex('date', 'date', { unique: false })
  }
  request.onsuccess = (event) => {
    event.target.result.onerror = function (event) {
      console.error('Database error: ' + event.target.errorCode)
    }
  }
}
