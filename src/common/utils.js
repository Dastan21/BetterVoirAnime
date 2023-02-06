import * as storage from './storage'

export const BASE_URL = 'https://voiranime.com/'

export const NEED_REFRESH = ['episode']

export const defaultTheme = window.matchMedia?.('(prefers-color-scheme: dark)').matches === true ? 'dark' : 'light'

export const SEARCH_OPTIONS_TYPES = {
  CHECKBOX: 'checkbox',
  SELECT: 'select',
  SWITCH: 'switch',
  INPUT: 'input'
}

export function getCurrentSection (title = window.title) {
  const bvaRoot = document.getElementById('bva-root')
  let section = bvaRoot.getAttribute('bva-section')
  if (section != null && title == null) return section
  title = title.toLowerCase()
  if (document.body.classList.contains('no-js')) section = 'cloudflare'
  else if (title.startsWith('liste d\'animes')) section = 'anime-list'
  else if (title.startsWith('you searched for')) section = 'search'
  else if (title.endsWith('archives - voiranime') || title.includes('archives - page ')) section = 'genre-list'
  else if (title.startsWith('regarder gratuitement')) section = 'anime'
  else if (title.includes('#1 de l\'anime en france')) {
    const sectionName = window.body.querySelector('.c-blog__heading > .h4').textContent.replace(/\s/gi, '').toLowerCase()
    section = {
      encours: 'home',
      nouveau: 'new',
      prochainement: 'soon'
    }[sectionName]
  } else section = 'episode'

  bvaRoot.setAttribute('bva-section', section)

  return section
}

export function buildTitle (page) {
  return `${page} - VoirAnime`
}

export function translateTheme (theme) {
  return {
    light: 'clair',
    dark: 'sombre'
  }[theme] ?? theme
}

export function getDate (str) {
  return {
    absolute: parseDate(str),
    relative: parseRelativeDate(str)
  }
}

export function parseDate (str) {
  if (!str.includes('ago')) return new Date(str)

  const [value, unit] = str.split(' ')
  const date = new Date()
  if (unit.includes('second')) date.setSeconds(-Number(value))
  else if (['min', 'mins', 'minute'].includes(unit)) date.setMinutes(-Number(value))
  else if (unit.includes('hour')) date.setHours(-Number(value))
  else if (unit.includes('day')) date.setDate(-Number(value))

  return date
}

export function parseRelativeDate (str) {
  let value, unit
  if (str.includes('ago')) [value, unit] = str.split(' ')
  else {
    const diff = (Date.now() - new Date(str)) / 1000
    if (diff <= 60) {
      unit = 'seconds'
      value = diff
    } else if (diff <= 60 * 60) {
      unit = 'minutes'
      value = diff / 60
    } else if (diff <= 60 * 60 * 24) {
      unit = 'hours'
      value = diff / (60 * 60)
    } else return parseDate(str).toLocaleString('fr', { dateStyle: 'medium' })
  }
  const formatter = new Intl.RelativeTimeFormat('fr', { numeric: 'always', style: 'long' })
  return formatter.format(-value, unit.includes('min') ? 'minutes' : unit)
}

export function toLocaleDate (date) {
  return new Date(date).toLocaleString('fr', { dateStyle: 'long' })
}

export function translateQuickNavigation (type) { return type === 'prev' ? 'précédent' : 'suivant' }

export function translateGenre (genre) {
  return {
    adventure: 'aventure',
    chinese: 'chinois',
    comedy: 'comédie',
    drama: 'drame',
    fantasy: 'fantaisie',
    horror: 'horreur',
    music: 'musique',
    mystery: 'mystère',
    psychological: 'psychologie',
    sports: 'sport',
    supernatural: 'supernaturel',
    'mahou shoujo': 'shōjo',
    'sci-fi': 'science-fiction'
  }[genre.toLowerCase()] ?? genre
}

export function translateStatus (status) {
  return {
    completed: 'terminé',
    ongoing: 'en cours',
    canceled: 'abandonné',
    'on hold': 'prochainement'
  }[status.toLowerCase()] ?? status
}

export function capitalize (str = '') { return str.charAt(0).toUpperCase() + str.slice(1, str.length).toLowerCase() }

export function getPagination (root = window.body) { return root.querySelector('.wp-pagenavi > .pages')?.textContent.trim().match(/\d+/gm).map(Number) ?? [] }

/**
 * Parse elements string
 * @param {string | HTMLCollection | HTMLElement} el
 * @returns {HTMLCollection | HTMLElement | null}
 */
export function createDOM (el) {
  const dp = new DOMParser()
  let $el = el
  if (typeof el === 'string') {
    if (/<.+>((.*)<\/.+>)*/gs.test(el) === false) el = `<div>${el}</div>`
    $el = dp.parseFromString(el, 'text/html')
    $el = [...$el.head.children, ...$el.body.children]
  } else if (el.tagName != null) $el = [el]
  else $el = collectionToArray(el)
  return $el.length <= 1 ? $el[0] : $el
}

/**
 * Attach element(s) to another one.
 * @param {HTMLCollection | HTMLElement | string} el
 * @param {HTMLCollection | HTMLElement} $dom
 * @param {string} [selector]
 * @param {boolean} [append]
 */
export function attachDOM (el, $dom, selector, append = false) {
  if (el == null) return
  if (typeof selector === 'boolean') { append = selector; selector = null }
  if (typeof el === 'string') el = createDOM(el)
  if (!Array.isArray(el)) el = [el]
  if (!Array.isArray($dom)) $dom = [$dom]
  else $dom = collectionToArray($dom)
  let $el = $dom[0]
  if (selector != null) $el = querySelectorList($dom, selector)
  if (!append) $el?.append(...el)
  else el.reverse().forEach((e) => $el.insertBefore(e, $el?.firstElementChild))
  if ($el == null) console.warn('DOM element not found', { el, $dom, selector })
}

/**
 * Replace element content by other element(s).
 * @param {HTMLCollection | HTMLElement | string} el
 * @param {HTMLCollection | HTMLElement} $dom
 * @param {string} [selector]
 * @param {boolean} [append]
 */
export function innerDOM (el, $dom, selector, append) {
  let $el = $dom
  if (selector != null) $el = querySelectorList($el, selector)
  $el.innerHTML = ''
  attachDOM(el, $dom, selector, append)
}

/**
 * Returns the first element that is a descendant of node that matches selectors.
 * @param {HTMLCollection} $domList
 * @param {string} selector
 * @returns {HTMLElement | null}
 */
export function querySelectorList ($domList, selector) {
  for (const $dom of $domList) {
    const $ret = $dom.querySelector(selector)
    if ($ret != null) return $ret
    if ($dom.matches?.(selector) || $dom.matchesSelector?.(selector)) return $dom
  }
  return null
}

/**
 * Convert HTMLCollection to Array.
 * @param {HTMLCollection | HTMLElement} $col
 */
export function collectionToArray ($col) {
  if ($col == null || ($col.length != null && $col.length < 1)) return []
  if ($col.length == null) return [$col]
  return [...$col]
}

/**
 * Observe DOM mutations.
 * @param {string} selector
 * @param {($el: HTMLElement, instance: MutationObserver) => void} callback
 * @param {MutationObserverInit & { keep: boolean }} options
 * @param {HTMLElement} root
 * @returns
 */
export function observe (selector, callback, options = {}, root = document) {
  if (typeof options.append === 'function') {
    root = options
    options = {}
  }
  const observer = new MutationObserver((_, instance) => {
    const el = root.querySelector(selector) || root.matches?.(selector) || root.matchesSelector?.(selector)
    if (el == null) return
    callback?.(el, instance)
    if (!options.keep) instance.disconnect()
  })
  observer.observe(root, { childList: true, subtree: true, ...options })
  return observer
}

/**
 * Apply attributes to an element
 * @param {HTMLElement} $el
 * @param {any} attrs
 */
export function applyAttrs ($el, attrs = {}) {
  if ($el == null || Array.isArray($el)) return
  const entries = Object.entries(attrs)
  if (entries == null || entries < 1) return

  entries.forEach(([k, v]) => {
    if (typeof v === 'boolean') $el.toggleAttribute(k, v)
    else $el.setAttribute(k, v)
  })
}

export function maxClientWidth ($list) {
  if (!Array.isArray($list) || $list.length < 1) return 0
  return $list.reduce((m, $l) => Math.max($l.clientWidth || $l.offsetWidth, m), 0)
}

export function changeTheme (theme) {
  document.querySelector('html').setAttribute('data-theme', theme)
  storage.set('bva-theme', theme)
}

/**
 * Listen to click/keyboard events.
 * @param {HTMLElement} $el
 * @param {(e: Event, source: 'mouse | 'keyboard', ...data: any[]) => void} callback
 * @param {any} [data]
 */
export function onTrigger ($el, callback, ...data) {
  $el.onclick = (e) => {
    callback?.(e, 'mouse', ...data)
  }
  $el.onkeydown = (e) => {
    if (!['Enter', 'NumpadEnter'].includes(e.code)) return
    e.preventDefault()
    e.stopPropagation()
    callback?.(e, 'keyboard', ...data)
  }
}

/**
 *
 * @param {HTMLElement} $el
 * @param {(e: Event) => void} callback
 */
export function onClickOutside ($el, callback) {
  if ($el.__clickoutside) return

  const clickFunction = (e) => {
    if (!e.composedPath()?.some(($e) => {
      if ($e.tagName == null) return false
      return $el.isEqualNode($e)
    })) return
    orig?.(e)
    e.stopPropagation()
  }

  $el.__clickoutside = true
  const orig = $el.onclick
  $el.onclick = clickFunction
  if (document.__onclicks == null) {
    document.__onclicks = []
    document.onclick = (e) => document.__onclicks.forEach((c) => c(e))
    document.clickOutside = clickFunction
  }
  document.__onclicks.push(callback)
}

/**
 * Wether a variable is empty or null
 * @param {any} val
 * @returns boolean
 */
export function isEmpty (val) {
  return val == null || val === ''
}

export function getChildIndex ($el) {
  return Array.from($el.parentNode.children).indexOf($el)
}

export function unescapeHTML (html) {
  return html
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, '\'')
}

export function queryByXPath (root, xpath) {
  if (typeof root === 'string') {
    xpath = root
    root = document
  }
  try {
    return document.evaluate(xpath, root).iterateNext()
  } catch (_) {
    return null
  }
}
