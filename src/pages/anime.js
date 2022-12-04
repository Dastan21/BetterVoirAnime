import { createBreadcrumb, createRating } from '../common/components'
import { attachDOM, innerDOM, capitalize, createDOM, onTrigger, toLocaleDate, translateGenre, buildTitle } from '../common/utils'
import { parseAnime, parseBreadcrumb } from '../common/parser'

import sortUpIcon from '../assets/icons/sort_up.svg'
import sortDownIcon from '../assets/icons/sort_down.svg'

function getBreadcrumbItems () {
  return parseBreadcrumb().map(($l) => {
    const text = $l.textContent.trim()
    return {
      text: text === 'Home' ? 'Accueil' : capitalize(translateGenre(text)),
      attrs: {
        href: $l.firstElementChild?.getAttribute('href'),
        title: text
      }
    }
  })
}

export function buildAnimesPage () {
  const $main = document.getElementById('bva-main')

  const anime = parseAnime()
  console.log(anime)
  document.title = buildTitle(anime.title)

  const getInfos = () => {
    const infosOrder = ['title_vo', 'title_vf', 'type', 'status', 'studios', 'start_date', 'end_date', 'genres']
    return Object.entries(anime).map(([key, value]) => {
      if (value == null || !infosOrder.includes(key)) return null
      const ret = {
        key,
        label: capitalize(key),
        content: value,
        title: value
      }
      if (key === 'title_vo') ret.label = 'Titre original'
      else if (key === 'title_vf') ret.label = 'Titre français'
      else if (key === 'status') ret.label = 'Statut'
      else if (key === 'genres') {
        ret.content = value.map((genre) => `<bva-link href="${genre.url}" title="${genre.name}">${genre.name}</bva-link>`).join(', \n')
        ret.title = ''
      } else if (key === 'start_date') {
        ret.content = toLocaleDate(value)
        ret.value = toLocaleDate(value)
        ret.label = 'Date de début'
      } else if (key === 'end_date') {
        ret.content = toLocaleDate(value)
        ret.value = toLocaleDate(value)
        ret.label = 'Date de fin'
      }

      return ret
    }).filter(d => d != null).sort((a, b) => infosOrder.indexOf(a.key) - infosOrder.indexOf(b.key))
  }

  const createAnimeInfos = () => {
    const $animeInfos = createDOM('<div class="bva-anime-infos"></div>')

    const $infos = createDOM(getInfos().map((info) => `
      <div class="bva-anime-info">
        <div class="bva-anime-info-label" title="${info.label}">${info.label}</div>
        <div class="bva-anime-info-value" title="${info.title}">${info.content}</div>
      </div>
    `).join('\n'))
    attachDOM($infos, $animeInfos)

    if (document.getElementById('trailer') != null) {
      const $trailerButton = createDOM('<bva-button class="bva-anime-trailer bva-secondary" title="Voir la bande-annonce">Voir la bande-annonce</bva-button>')
      $trailerButton.onclick = () => document.querySelector('.play-trailer-btn').click()
      attachDOM($trailerButton, $animeInfos)
    }

    if (anime.episodes.length > 0) {
      const $firstLastEp = createDOM(`
        <div class="bva-anime-firstlast">
          <bva-link class="bva-button bva-secondary" href="${anime.episodes[anime.episodes.length - 1].url}" title="Premier épisode">Premier épisode</bva-link>
          <bva-link class="bva-button bva-secondary" href="${anime.episodes[0].url}" title="Dernier épisode">Dernier épisode</bva-link>
        </div>
      `)
      attachDOM($firstLastEp, $animeInfos)
    }

    return $animeInfos
  }

  const createEpisodeList = () => {
    const $episodeList = createDOM(`
      <div class="bva-anime-episode-list bva-item">
        <div class="bva-anime-episodes"></div>
      </div>
    `)
    const $animeEpisodes = $episodeList.querySelector('.bva-anime-episodes')

    const $orderButton = createDOM(`<bva-button-icon class="bva-anime-episodes-sort bva-icon" title="Changer l'ordre des épisodes" data-sort="down">${sortDownIcon}</bva-button>`)
    onTrigger($orderButton, () => {
      const sort = $orderButton.getAttribute('data-sort') === 'up' ? 'down' : 'up'
      $orderButton.setAttribute('data-sort', sort)
      $orderButton.innerHTML = sort === 'up' ? sortUpIcon : sortDownIcon
      $animeEpisodes.append(...Array.from($animeEpisodes.childNodes).reverse())
    })
    attachDOM($orderButton, $episodeList, true)

    const $episodes = createDOM(anime.episodes.map((ep) => `
      <div class="bva-anime-episode">
        <bva-link class="bva-anime-episode-link" href="${ep.url}" title="${!ep.title.startsWith('(') ? 'Épisode ' : ''}${ep.title}">${ep.title}</bva-link>
        <span class="bva-anime-episode-date" title="${toLocaleDate(ep.date.absolute)}">${ep.date.relative}</span>
      </div>
    `).join('\n'))
    attachDOM($episodes, $episodeList, '.bva-anime-episodes')

    if (anime.episodes.length <= 30) {
      $animeEpisodes.toggleAttribute('data-show-all', true)
    } else {
      const $moreButton = createDOM('<bva-button class="bva-anime-episodes-show-all bva-secondary">Afficher tout</bva-button>')
      onTrigger($moreButton, (_, source) => {
        $animeEpisodes.toggleAttribute('data-show-all', true)
        $moreButton.remove()
        if (source === 'keyboard') $episodes[19].firstElementChild.focus()
      })
      attachDOM($moreButton, $episodeList)
    }

    if (anime.episodes.length < 1) {
      innerDOM('<span>Aucun épisode disponible pour le moment :(</span>', $episodeList)
    }

    return $episodeList
  }

  const $animeContainer = createDOM(`
    <div class="bva-content-wrapper">
      <div class="bva-content-container">
        <div class="bva-anime-container">
          <div class="bva-anime-title bva-item" title="${anime.title}">
            <div class="bva-title">${anime.title}</div>
            <div class="bva-subtitle">${anime.synopsis}</div>
          </div>
          <div class="bva-anime-infos-container bva-item">
            <div class="bva-anime-thumb">
              <img class="bva-anime-thumbnail" src="${anime.image}" title="${anime.title}">
            </div>
          </div>
          <hr class="bva-separator">
        </div>
      </div>
    </div>
  `)
  attachDOM(createBreadcrumb(getBreadcrumbItems()), $animeContainer, '.bva-content-container', true)
  attachDOM(createRating(anime.rating), $animeContainer, '.bva-anime-thumb')
  attachDOM(createAnimeInfos(), $animeContainer, '.bva-anime-infos-container')
  attachDOM(document.getElementById('trailer'), $animeContainer, '.bva-anime-container')
  attachDOM(createEpisodeList(), $animeContainer, '.bva-anime-container')
  innerDOM($animeContainer, $main)
}
