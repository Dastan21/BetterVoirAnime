import '../assets/styles/cloudflare.css'
import { attachDOM } from '../common/utils'

export function buildCloudflarePage () {
  window.body.toggleAttribute('data-cloudflare')
  attachDOM(`
    <div id="loader">
      <div class="loading">
        <div class="shadow"></div>
        <div class="box"></div>
      </div>
      <h4 class="load-text">Vérification de votre navigateur...</span></h4>
    </div>
  `, window.body)
}
