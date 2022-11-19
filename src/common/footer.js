import { attachDOM, createDOM, translateTheme, defaultTheme } from './utils'
import * as storage from './storage'

import settingsIcon from '../assets/icons/settings.svg'
import crossIcon from '../assets/icons/cross.svg'
import lightModeIcon from '../assets/icons/light_mode.svg'
import darkModeIcon from '../assets/icons/dark_mode.svg'
import randomIcon from '../assets/icons/random.svg'
import resumeIcon from '../assets/icons/resume.svg'
import statsIcon from '../assets/icons/stats.svg'

const $html = document.querySelector('html')

function getActionIcon (name) {
  return {
    settings: settingsIcon,
    cross: crossIcon,
    light_mode: lightModeIcon,
    dark_mode: darkModeIcon,
    random: randomIcon,
    resume: resumeIcon,
    stats: statsIcon
  }[name]
}

function updateAction (action) {
  const $action = document.getElementById(`action-${action.id}`)
  if ($action == null) return
  if (action.text != null) $action.querySelector('.bva-action-tooltip').textContent = action.text
  if (action.icon != null) $action.querySelector('svg').outerHTML = getActionIcon(action.icon)
}

function changeTheme () {
  storage.get('bva-theme').then((theme = defaultTheme) => {
    console.log(theme)
    // if (toggle) theme = theme === 'light' ? 'dark' : 'light'
    $html.setAttribute('data-theme', theme)
    // updateAction({ id: 'theme', text: `Mode ${translateTheme(theme)}`, icon: `${theme}_mode` })
    updateAction({ id: 'theme', text: `Mode ${translateTheme(theme)}` })
    storage.set('bva-theme', theme)
  })
}

const actions = [
  {
    id: 'theme',
    text: 'Mode clair',
    icon: 'light_mode',
    action: changeTheme
  },
  {
    id: 'resume',
    text: 'Reprendre',
    icon: 'resume',
    action: () => {
      console.log('resuming last anime')
    },
    disabled: true
  },
  {
    id: 'random',
    text: 'Animé Aléatoire',
    icon: 'random',
    action: () => {
      console.log('going to random anime')
    },
    disabled: true
  },
  {
    id: 'stats',
    text: 'Statistiques',
    icon: 'stats',
    action: () => {
      console.log('opening stats')
    },
    disabled: true
  }
]

export function buildFooter () {
  const $footer = document.getElementById('bva-footer')

  const createActionList = () => {
    return createDOM(actions.filter(a => !a.disabled).map((action) => {
      const $action = createDOM(`
        <div id="action-${action.id}" class="bva-action-btn">
          <div class="bva-action-tooltip">${action.text}</div>
          ${getActionIcon(action.icon)}
        </div>
      `)
      $action.onclick = action.action

      return $action
    }))
  }

  const $actions = createDOM(`
    <div class="bva-actions-toggle">
      <div id="action-settings" class="bva-action-btn">
        <div class="bva-action-tooltip">Options</div>
        ${getActionIcon('settings')}
      </div>
      <div class="bva-actions-container">
        <div class="bva-actions-separator"></div>
      </div>
    </div>
  `)
  attachDOM(createActionList(), $actions, '.bva-actions-container')

  const $actionSettings = document.getElementById('action-settings')
  $actionSettings.onclick = () => {
    const isOpen = $actionSettings.parentElement.getAttribute('data-toggle') === ''
    $actionSettings.parentElement.toggleAttribute('data-toggle', !isOpen)
    updateAction({ id: 'settings', text: !isOpen ? 'Fermer' : 'Options', icon: !isOpen ? 'cross' : 'settings' })
  }

  attachDOM($actions, $footer)
  changeTheme()
}
