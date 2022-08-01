let activate;
chrome.storage.sync.get(['style_activation'], (res) => {
  if (res != undefined) {
    activate = res.style_activation
    if (activate) {
      let elements = document.querySelectorAll("*");
      elements.forEach(el => {
        if (el.tagName === "LINK" || el.tagName === "STYLE") el.remove();
        else el.removeAttribute("style");
      });
      document.body.classList.remove('home')
      document.body.classList.remove('single-wp-manga')
      document.body.classList.add('page-template')
      document.getElementsByTagName('html')[0].classList.add('dark')
      calcElements(true)
    } else {
      document.body.classList.remove('home')
      document.body.classList.remove('single-wp-manga')
      calcElements(false)
    }
  }
})

chrome.storage.onChanged.addListener((changes, namespace) => {
  if (changes.style_activation != undefined) {
    location.reload();
  }
})