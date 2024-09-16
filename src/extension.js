import './assets/styles/main.css'

import { changePage, setupLinks } from './common/api'
import * as storage from './common/storage'
import { attachDOM, defaultTheme, getCurrentSection } from './common/utils'

import { buildHeader } from './common/header'
import { buildAnimesPage } from './pages/anime'
import { buildCloudflarePage } from './pages/cloudflare'
import { buildEpisodePage } from './pages/episode'
import { buildHomePage } from './pages/home'

const $html = document.querySelector('html')
// lang
$html.setAttribute('lang', 'fr')
// theme
storage.get('bva-theme').then((theme = defaultTheme) => $html.setAttribute('data-theme', theme))
// page animation
document.body.classList.add('transition')

window.body = document.body
window.title = document.title
window.cache.set(location.href, { body: window.body, title: document.title })
attachDOM(`
  <div id="bva-root">
    <header id="bva-header" class="bva-header-container"></header>
    <main id="bva-main" class="bva-main-container"></main>
    <footer id="bva-footer" class="bva-footer-container"></footer>
  </div>
`, document.body)

async function buildPage (section) {
  buildHeader()
  switch (section) {
    case 'anime': await buildAnimesPage(); break
    case 'episode': await buildEpisodePage(); break
    default: await buildHomePage()
  }
}
const section = getCurrentSection()

async function build () {  
  if (section === 'cloudflare') await buildCloudflarePage()
  else await buildPage(section)
}

build().then(() => {
  // footer
  attachDOM(document.querySelector('footer.site-footer'), document.getElementById('bva-footer'))
  // buttons focus
  document.querySelectorAll('bva-button, bva-button-icon').forEach($el => $el.setAttribute('tabindex', 0))
  // refresh
  addEventListener('bva-refresh', async () => {
    await buildPage(document.getElementById('bva-root').getAttribute('bva-section'))
    setupLinks()
  }, false)
  // links
  setupLinks()
  // history
  history.replaceState([], null, location.href)
  addEventListener('popstate', () => {
    changePage(location.href)
  })
  // requests controller
  window.requestController = new Map()
})
