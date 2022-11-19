/* global chrome */

export async function set (key, value) {
  return chrome.storage.sync.set({ [key]: value }).catch(console.error)
}

export async function get (key) {
  return chrome.storage.sync.get([key]).then((result) => result[key]).catch(console.error)
}
