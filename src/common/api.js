import { BASE_URL, getCurrentSection, NEED_REFRESH, onTrigger } from './utils'
import { parseHTML, parseFormData } from './parser'

export const API_URL = `${BASE_URL}wp-admin/admin-ajax.php`
export const API_OPTIONS = 'current_page_id=15&qtranslate_lang=0&filters_changed=0&filters_initial=1&asp_gen%5B%5D=title&asp_gen%5B%5D=content&asp_gen%5B%5D=excerpt&customset%5B%5D=wp-manga&aspf%5Bvf__1%5D=vf'

window.cache = new Map()

/**
 * Fetch polyfill.
 * @param {string} url
 * @param {any} [data]
 * @returns {Promise<Response>}
 */
export async function request (url, data) {
  if (url == null) url = BASE_URL
  if (!url.startsWith('http')) url = BASE_URL + url.replace(/^\//, '')
  let key = url
  try {
    if (data != null) key = url + `#${encodeURI(JSON.stringify(data))}`
  } catch (_) { /**/ }

  if (data?.abortPrevious) {
    window.requestController.get(url)?.abort()
    window.requestController.set(url, new AbortController())
  }

  const value = window.cache.get(key)
  if (value != null) return value

  return fetch(url, {
    method: data?.method ?? 'GET',
    body: data?.body && parseFormData(data?.body ?? {}),
    signal: window.requestController.get(url)?.signal
  }).then(async (res) => {
    if (res.status === 503) location.href = String(location.href)
    if (!res.ok) throw new Error('Failed to fetch data')
    res = await res.text()
    try {
      res = JSON.parse(res)
    } catch (_) { /**/ }
    if (typeof res === 'string' && /^<\s*[^>]*>/.test(res)) res = parseHTML(res)
    window.cache.set(key, res)
    return res
  })
}

/**
 * Get video iframe.
 * @param {number} manga
 * @param {number} chapter
 * @param {string} host
 * @param {string} grecaptcha
 * @returns {Promise<string>}
 */
export async function getVideo (manga, chapter, host, grecaptcha) {
  if (grecaptcha == null) throw new Error('Invalid captcha')
  return request(API_URL, {
    method: 'POST',
    body: {
      action: 'get_video_chapter_content',
      grecaptcha,
      manga,
      chapter,
      host
    }
  }).then((data) => {
    if (data === 0) throw new Error('Failed to fetch video')
    return data.data
  })
}

/**
 * Search animes.
 * @param {string} search
 * @param {'VOSTFR'|'VF'} language
 * @returns {Promise<string>}
 */
export async function fetchAnimes (search, language) {
  const languageCode = language === 'VF' ? 3 : 4
  return request(API_URL, {
    method: 'POST',
    body: {
      action: 'ajaxsearchpro_search',
      aspp: search,
      asid: languageCode,
      asp_inst_id: `${languageCode}_2`,
      options: API_OPTIONS
    }
  }).then(async (data) => {
    data = data.replace(/\n/gm, '').match(/!!ASPSTART_DATA!!(.*)!!ASPEND_DATA!!/)?.[1] ?? []
    try {
      data = JSON.parse(data)
    } catch (error) {
      throw new Error('Failed to fetch animes')
    }
    return data
  })
}

/**
 * Get autocomplete keywords.
 * @param {string} search
 * @param {'VOSTFR'|'VF'} language
 * @returns {Promise<string>}
 */
export async function getAutocomplete (search, language) {
  const languageCode = language === 'VF' ? 3 : 4
  return request(API_URL, {
    method: 'POST',
    body: {
      action: 'ajaxsearchpro_autocomplete',
      sauto: search,
      asid: languageCode,
      asp_inst_id: `${languageCode}_2`,
      options: API_OPTIONS
    }
  })
}

/**
 * Change current page.
 * @param {string} url
 */
export function changePage (url) {
  history.pushState({}, null, url)
  request(location.href).then((html) => {
    window.body = html.body
    window.title = html.title
    const section = getCurrentSection(html.title)
    if (NEED_REFRESH.includes(section)) { location.href = url; return }
    dispatchEvent(new Event('bva-refresh'))
  }).catch(console.error)
}

export function setupLinks () {
  const openTab = (url) => {
    open(url, '_blank')
  }

  document.querySelectorAll('bva-link').forEach(($link) => {
    $link.onmousedown = (e) => {
      if (e.which !== 2) return
      e.preventDefault()
      e.stopPropagation()
    }
    $link.onmouseup = (e) => {
      if (e.which !== 2) return
      e.preventDefault()
      e.stopPropagation()
      const url = e.currentTarget.getAttribute('href')
      openTab(url)
    }

    $link.setAttribute('tabindex', 0)
    onTrigger($link, (e) => {
      const url = e.currentTarget.getAttribute('href')
      if (e.type === 'keydown' && e.ctrlKey) return openTab(url)
      changePage(url)
    })
  })
}
