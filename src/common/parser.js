import { BASE_URL, capitalize, collectionToArray, createDOM, getDate, queryByXPath, SEARCH_OPTIONS_TYPES, translateGenre, translateStatus, unescapeHTML } from './utils'

/**
 * Parse string to HTML
 * @param {string} html
 * @returns {HTMLElement}
 */
export function parseHTML (html = document.documentElement.innerHTML) {
  const body = matchTag(html, 'body')
  return {
    title: unescapeHTML(matchTag(html, 'title')),
    body: body && createDOM(body)[0]
  }
}

export function matchTag (html = document, tag = 'html') {
  return html.match(new RegExp(`<\\s*${tag}[^>]*>([\\s\\S]*)<\\s*\\/\\s*${tag}\\s*>`))?.[1]
}

/**
 * Convert object to FormData.
 * @param {any} data
 * @returns {FormData}
 */
export function parseFormData (data = {}) {
  if (data == null) return null
  const formData = new FormData()
  for (const key in data) formData.append(key, data[key])
  return formData
}

export function parseAnime (root = window.body) {
  const anime = {
    id: root.querySelector('.rating-post-id')?.value,
    title: root.querySelector('.post-title')?.textContent?.trim(),
    title_vo: undefined,
    title_vf: undefined,
    synopsis: root.querySelector('.summary__content, .post-summary')?.textContent?.trim(),
    url: root.querySelector('.c-image-hover a')?.getAttribute('href') ?? location.href,
    type: undefined,
    status: undefined,
    image: root.querySelector('.summary_image img, .c-image-hover img')?.getAttribute('src'),
    start_date: undefined,
    end_date: undefined,
    studios: undefined,
    genres: [],
    rating: Number(root.querySelector('.post-total-rating > .score')?.textContent?.trim()),
    vf: root.querySelector('.manga-vf-flag') != null,
    episodes: collectionToArray(root.querySelectorAll('.chapter-item, .wp-manga-chapter')).map((ep) => ({
      number: ep.querySelector('.btn-link')?.textContent?.trim() ?? ep.firstElementChild?.textContent?.trim()?.match(/\d*$/)[0],
      title: ep.firstElementChild?.textContent?.replace(/\n/g, '')?.trim(),
      date: getDate(ep.children?.[1]?.textContent?.trim()),
      url: ep.querySelector('a').getAttribute('href')
    }))
  }

  collectionToArray(root.querySelectorAll('.post-content > .post-content_item')).forEach(($item) => {
    const key = $item.firstElementChild.textContent.trim().toLowerCase()
    const value = $item.lastElementChild.textContent.trim()
    if (key === 'native') anime.title_vo = value
    if (key === 'english') anime.title_vf = value
    if (key === 'french') anime.title_vf = value
    if (key === 'type') anime.type = value
    if (key === 'status') anime.status = capitalize(value)
    if (key === 'start date') anime.start_date = new Date(value)
    if (key === 'end date') anime.end_date = new Date(value)
    if (key === 'studios') anime.studios = value
    if (key === 'alternative') {
      const values = value.split(',').map(v => v.trim())
      anime.title_vo = values[0] || undefined
      anime.title_vf = values[2] || undefined
    }
    if (key === 'genre(s)' || key === 'genres') {
      anime.genres = value.toLowerCase().split(', ').map((genre) => ({
        label: capitalize(translateGenre(genre)),
        url: `${BASE_URL}anime-genre/${encodeURI(genre)}`
      }))
    }
  })

  return anime
}

export function parseAnimeList (root = window.body) {
  return collectionToArray(root.querySelectorAll('.page-item-detail, .c-tabs-item__content')).map((item) => parseAnime(item))
}

export function parseEpisode (root = window.body) {
  const $ids = root.querySelector('.wp-manga-action-button')
  const $nav = root.querySelector('#manga-reading-nav-head')
  const title = root.querySelector('.breadcrumb > li.active').textContent.trim()
  return {
    id: $ids.getAttribute('data-chapter'),
    title,
    hosts: collectionToArray($nav.querySelectorAll('.host-select > option')).map((o) => o.value.replace('LECTEUR ', '')),
    anime: {
      id: $ids.getAttribute('data-post'),
      title: title.split(' - ')[0]
    }
  }
}

export function parseTabs (root = window.body) {
  return collectionToArray(root.querySelectorAll('.c-tabs-content a'))
}

export function parseGenreList (root = window.body) {
  return collectionToArray(root.querySelectorAll('.sub-nav_list .menu-item-type-taxonomy a'))
}

export function parseBreadcrumb (root = window.body) {
  return collectionToArray(root.querySelectorAll('.breadcrumb > li'))
}

export function parseSearchOptions (root = window.body) {
  const $searchAdvanced = root.querySelector('#search-advanced')

  const genreOptions = collectionToArray(root.querySelectorAll('.form-group.checkbox-group input'))
  const statusOptions = collectionToArray(queryByXPath(root, '//span[text()="Status"]').parentElement.querySelectorAll('input'))
  const typeOptions = collectionToArray(queryByXPath(root, '//span[text()="Format"]').parentElement.querySelectorAll('option'))

  return [
    {
      type: SEARCH_OPTIONS_TYPES.INPUT,
      attrs: {
        name: 's',
        placeholder: 'Rechercher...'
      },
      value: $searchAdvanced.querySelector('[name="s"]').value
    },
    {
      type: SEARCH_OPTIONS_TYPES.CHECKBOX,
      label: 'Genres',
      attrs: {
        name: 'genre'
      },
      value: genreOptions.filter($o => $o.hasAttribute('checked')).map($o => $o.value),
      options: genreOptions.map(($o) => ({
        label: capitalize(translateGenre($o.parentElement.textContent.trim())),
        value: $o.value
      }))
    }, {
      type: SEARCH_OPTIONS_TYPES.SWITCH,
      label: 'Condition des genres',
      attrs: {
        name: 'op'
      },
      value: queryByXPath(root, '//span[text()="Genres condition"]').nextElementSibling.value,
      options: [{
        label: 'Ou',
        value: 0,
        attrs: {
          title: 'Ou (au moins un genre)'
        }
      }, {
        label: 'Et',
        value: 1,
        attrs: {
          title: 'Et (tous les genres)'
        }
      }]
    }, {
      type: SEARCH_OPTIONS_TYPES.INPUT,
      label: 'Auteur',
      attrs: {
        name: 'author',
        placeholder: 'Auteur'
      },
      value: $searchAdvanced.querySelector('[name="author"]').value
    }, {
      type: SEARCH_OPTIONS_TYPES.INPUT,
      label: 'Artiste',
      attrs: {
        name: 'artist',
        placeholder: 'Artiste'
      },
      value: $searchAdvanced.querySelector('[name="artist"]').value
    }, {
      type: SEARCH_OPTIONS_TYPES.INPUT,
      label: 'Année de sortie',
      attrs: {
        name: 'release',
        placeholder: 'Année de sortie'
      },
      value: $searchAdvanced.querySelector('[name="release"]').value
    }, {
      type: SEARCH_OPTIONS_TYPES.SWITCH,
      label: 'Contenu pour adulte',
      attrs: {
        name: 'adult'
      },
      value: queryByXPath(root, '//span[text()="Adult content"]').nextElementSibling.value,
      options: [{
        label: 'Non',
        value: 0,
        attrs: {
          title: 'Non'
        }
      }, {
        label: 'Oui',
        value: 1,
        attrs: {
          title: 'Oui'
        }
      }]
    }, {
      type: SEARCH_OPTIONS_TYPES.CHECKBOX,
      label: 'Statut',
      attrs: {
        name: 'status'
      },
      value: statusOptions.filter($o => $o.hasAttribute('checked')).map($o => $o.value),
      options: statusOptions.map(($o) => ({
        label: capitalize(translateStatus($o.nextElementSibling.textContent.trim())),
        value: $o.value
      }))
    }, {
      type: SEARCH_OPTIONS_TYPES.SELECT,
      label: 'Types',
      attrs: {
        name: 'type'
      },
      value: queryByXPath(root, '//span[text()="Format"]').nextElementSibling.value,
      options: typeOptions.map(($o) => {
        const label = $o.textContent.trim()
        return {
          label: label === 'ALL' ? 'Tous' : label,
          value: $o.value
        }
      })
    }, {
      type: SEARCH_OPTIONS_TYPES.SWITCH,
      label: 'Langue',
      attrs: {
        name: 'language'
      },
      value: queryByXPath(root, '//span[text()="Language"]').parentElement.querySelector('[name="language"][checked]').value,
      options: [{
        label: 'VOSTFR',
        value: 'vostfr',
        attrs: {
          title: 'VOSTFR'
        }
      }, {
        label: 'VF',
        value: 'vf',
        attrs: {
          title: 'VF'
        }
      }]
    }
  ]
}
