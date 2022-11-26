import './assets/styles/main.css'

import { attachDOM, defaultTheme, getCurrentSection } from './common/utils'
import { changePage, setupLinks } from './common/api'
import * as storage from './common/storage'

import { buildHeader } from './common/header'
import { buildCloudflarePage } from './pages/cloudflare'
import { buildSearchPage } from './pages/search'
import { buildAnimesPage } from './pages/anime'
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

function buildPage (section) {
  buildHeader()
  switch (section) {
    case 'search': buildSearchPage(); break
    case 'anime': buildAnimesPage(); break
    case 'episode': buildEpisodePage(); break
    default: buildHomePage()
  }
}
const section = getCurrentSection()
if (section === 'cloudflare') buildCloudflarePage()
else buildPage(section)

// buttons focus
document.querySelectorAll('bva-button, bva-button-icon').forEach($el => $el.setAttribute('tabindex', 0))
// refresh
addEventListener('bva-refresh', () => {
  buildPage(document.getElementById('bva-root').getAttribute('bva-section'))
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
