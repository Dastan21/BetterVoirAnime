import { attachDOM, createDOM, getPagination, onTrigger, querySelectorList, toLocaleDate, isEmpty, onClickOutside, innerDOM, collectionToArray, getCurrentSection, buildTitle, capitalize, translateGenre } from '../common/utils'
import { createEmptyDataMessage, createRating, createSwitch, createTabulation, createUnorderedList } from '../common/components'
import { parseAnimeList, parseGenreList, parseTabs } from '../common/parser'
import { changePage, fetchAnimes, setupLinks } from '../common/api'

import vfMarkIcon from '../assets/icons/vf_mark.svg'
import searchIcon from '../assets/icons/search.svg'
import loadingIcon from '../assets/icons/loading.svg'

export function buildHomePage () {
  document.title = '#1 de l\'anime en france - VoirAnime'
  const $main = document.getElementById('bva-main')
  const section = getCurrentSection()
  if (section === 'genre-list') {
    const genre = window.body.querySelector('.entry-header .item-title').textContent.trim().toLowerCase()
    document.title = buildTitle(capitalize(translateGenre(genre)))
  } else if (section === 'anime-list') {
    document.title = buildTitle('Liste d\'animés')
  }

  // Extract data
  const animes = parseAnimeList()
  console.log(animes)

  const genreList = parseGenreList().map(($s) => {
    const text = capitalize(translateGenre($s.textContent.trim()))
    return {
      text,
      attrs: {
        title: text,
        href: $s.getAttribute('href')
      }
    }
  })

  const sortList = collectionToArray(window.body.querySelectorAll('#manga-filte-alphabeta-bar > a')).map(($s) => {
    const text = capitalize($s.textContent.trim())
    const href = $s.getAttribute('href')
    return {
      text: text === 'All' ? 'Tous' : text,
      attrs: {
        title: text === 'All' ? 'Tous' : `Commençant par ${text}`,
        href: text === '#' ? href.replace('#', 'non-char') : href
      }
    }
  })

  const buildAnimes = (animes, size) => {
    if (animes.length > 0) {
      innerDOM(createAnimeList(animes, size), $home, '.bva-content-container')
      attachDOM(createPagination(...getPagination()), $home, '.bva-content-container')
    } else {
      innerDOM(createEmptyDataMessage(), $home, '.bva-content-container')
    }
  }

  const getTabs = () => {
    return parseTabs().map(($a) => ({
      text: $a.textContent.trim(),
      selected: $a.parentElement.classList.contains('active'),
      attrs: {
        title: $a.textContent.trim(),
        href: $a.getAttribute('href')
      }
    }))
  }

  const createAnimeSearch = () => {
    const SEARCH_DELAY = 500

    const $animeSearch = createDOM(`
      <label class="bva-animes-search-input-container" data-language="VOSTFR">
        <div class="bva-animes-search-inputs"></div>
        <bva-icon class="bva-icon" title="Chercher">${searchIcon}</bva-button-icon>
        <div class="bva-animes-search-results"></div>
      </label>
    `)

    const createSearchResults = (data, vf) => {
      if (!Array.isArray(data.results) || data.results.length < 1) return '<div>Aucun résultat :(</div>'
      const results = `<span class="bva-animes-search-results-total">Résultats : <strong>${data.full_results_count}</strong></span>`
      const animes = data.results.map((res) => `
        <bva-link class="bva-item" href="${res.link.replace('http://', 'https://')}">
          <div class="bva-item-thumb">
            <img class="bva-item-thumbnail" src="${res.image}" title="${res.title}">
            ${vf ? `<div class="bva-item-vf" title="VF">${vfMarkIcon}</div>` : ''}
          </div>
          <div class="bva-item-infos">
            <div class="bva-title" title="${res.title}">${res.title}</div>
            <div class="bva-subtitle" title="${res.content}">${res.content}</div>
          </div>
        </bva-link>
      `).join('\n')
      return createDOM([results, animes].join('\n'))
    }

    const searchAnimes = () => {
      if (isEmpty($input.value) || $input.value.length < 2) return

      setupLinks()

      const $results = $animeSearch.querySelector('.bva-animes-search-results')
      $results.toggleAttribute('data-hide', false)
      onClickOutside($results, () => {
        $results.toggleAttribute('data-hide', true)
      })

      const dataSearch = $results.getAttribute('data-search')
      const dataLanguage = $animeSearch.getAttribute('data-language')
      if (dataSearch === $input.value && $results.getAttribute('data-language') === dataLanguage) return

      $results.innerHTML = `<div class="bva-loading bva-icon">${loadingIcon}</div>`
      $results.setAttribute('data-search', $input.value)
      $results.setAttribute('data-language', dataLanguage)

      fetchAnimes($input.value, dataLanguage).then((animes) => {
        $results.innerHTML = ''
        attachDOM(createSearchResults(animes, dataLanguage === 'VF'), $results)
        setupLinks()
      }).catch(console.error)
    }

    const $input = createDOM('<input class="bva-animes-search-input" type="text" placeholder="Rechercher des animés en VOSTFR">')
    let to
    $input.oninput = () => {
      clearTimeout(to)
      if (isEmpty($input.value)) return
      to = setTimeout(searchAnimes, SEARCH_DELAY)
    }
    $input.onkeydown = (e) => {
      if (!['Enter', 'NumpadEnter'].includes(e.code)) return

      searchAnimes()
    }
    attachDOM($input, $animeSearch, '.bva-animes-search-inputs')

    return $animeSearch
  }

  const createSearchLanguage = () => {
    const $searchLanguage = createDOM('<div class="bva-animes-search-language"></div>')
    const $animeSearch = querySelectorList($home, '.bva-animes-search-input-container')

    const onLanguageChange = (checked) => {
      $switch.toggleAttribute('data-active', checked)
      const $input = $animeSearch.querySelector('.bva-animes-search-input')
      const language = checked ? 'VF' : 'VOSTFR'
      $animeSearch.setAttribute('data-language', language)
      $input.setAttribute('placeholder', `Rechercher des animés en ${language}`)
    }

    const $switch = createSwitch(onLanguageChange)
    const $results = $animeSearch.querySelector('.bva-animes-search-results')
    $switch.onfocus = () => {
      $results.toggleAttribute('data-hide', true)
    }
    onTrigger($switch, (e) => {
      if (e.pointerType === 'mouse') return
      $switch.click()
    })

    attachDOM('<span title="VOSTFR">VOSTFR</span>', $searchLanguage)
    attachDOM($switch, $searchLanguage)
    attachDOM('<span title="VF">VF</span>', $searchLanguage)

    return $searchLanguage
  }

  const getPageUrl = (page = 1) => {
    return `${page > 1 ? `${location.pathname.replace(/page\/\d*\//, '')}page/${page}` : ''}/${location.search}`
  }

  const createPagination = (currentPage, lastPage) => {
    const createPageNumbers = (currentPage, lastPage) => {
      const firstPage = 1
      const edgesWidth = 1
      const centerWidth = Math.min(3, lastPage)
      const gap = Math.floor(centerWidth / 2)
      const $pageNumbers = []
      for (let page = 1; page <= lastPage; page++) {
        const showPage = Math.abs(page - currentPage) <= gap ||
          (page === firstPage || page === lastPage) ||
          (currentPage === firstPage && page <= firstPage + edgesWidth + gap) ||
          (currentPage === lastPage && page >= lastPage - edgesWidth - gap)
        const showLinking = (page > firstPage && page <= firstPage + edgesWidth) || (page < lastPage && page >= lastPage - edgesWidth)

        if (showPage) {
          const $pageNumber = createDOM(`<bva-link href="${getPageUrl(page)}" class="bva-page" title="Page ${page}">${page}</bva-link>`)
          if (page === currentPage) $pageNumber.toggleAttribute('data-active', true)
          $pageNumbers.push($pageNumber)
        } else if (showLinking) $pageNumbers.push(createDOM('<div class="bva-page bva-page-dots">. . .</div>'))
      }

      $pageNumbers.forEach(($p) => {
        const page = $p.textContent.trim()
        if (!isNaN(page)) $p.setAttribute('title', `Page ${page}`)
        if (page === String(currentPage)) $p.toggleAttribute('data-active', true)
      })
      return $pageNumbers
    }

    if (currentPage == null || lastPage == null || currentPage > lastPage) return null
    const $pagination = createDOM(`
      <div class="bva-animes-pagination">
        <div class="bva-animes-page-container"></div>
        <div class="bva-animes-page-search" title="Aller à une page précise">
          <div class="bva-page-search bva-page">
            <input type="number" placeholder="Page" min="1" max="${lastPage}">
            <bva-icon class="bva-icon">${searchIcon}</bva-button-icon>
          </div>
        </div>
      </div>
    `)

    const searchAnimePage = () => {
      const page = $searchPageInput.value
      if (isNaN(page) || page === '') {
        $searchPageInput.focus()
        return
      }
      $searchPageInput.value = null
      $searchPageInput.toggleAttribute('disabled', true)
      changePage(getPageUrl(page))
    }

    const selectPage = (page) => {
      if (page === '') page = ''
      else if (isNaN(page)) page = previousSelectPage
      else if (page !== '') page = Math.min(Math.max(Number(page), 1), lastPage)
      $searchPageInput.value = page
      previousSelectPage = page
    }

    // input & change page
    let previousSelectPage = ''
    const $searchPageInput = $pagination.querySelector('.bva-page-search > input')
    $searchPageInput.oninput = () => selectPage($searchPageInput.value)
    $searchPageInput.onkeyup = (e) => {
      if (['Enter', 'NumpadEnter'].includes(e.code)) searchAnimePage()
      else if (e.code === 'Escape') selectPage('')
    }
    const $pageSearch = $pagination.querySelector('.bva-page-search')
    $pageSearch.onclick = () => $searchPageInput.focus()

    attachDOM(createPageNumbers(currentPage, lastPage), $pagination, '.bva-animes-page-container')

    return $pagination
  }

  const createEpisodeList = (episodes) => {
    if (episodes.length <= 0) return null
    const $episodesWrapper = createDOM('<div class="bva-item-episodes"></div>')
    const $episodesList = createDOM(episodes.map((ep) => `
      <bva-link class="bva-item-episode" href="${ep.url}">
        <div class="bva-item-episode-hover"></div>
        <div class="bva-item-episode-number" title="${!ep.number.startsWith('(') ? 'Épisode ' : ''}${ep.number}">${isNaN(ep.number) ? '#' : ep.number}</div>
        <span class="bva-item-episode-date" title="${toLocaleDate(ep.date.absolute)}">${ep.date.relative}</span>
      </bva-link>
    `).join('\n'))
    attachDOM($episodesList, $episodesWrapper)

    return $episodesWrapper
  }

  const createSynopsis = (synopsis) => {
    if (synopsis == null) return null
    return createDOM(`<div class="bva-item-synopsis">${synopsis}</div>`)
  }

  const createAnimeList = (animes, size = 'multiple') => {
    const $animeItems = createDOM(animes.map((anime) => {
      const $anime = createDOM(`
        <div class="bva-item">
          <div class="bva-item-thumb">
            <bva-link href="${anime.url}"><img class="bva-item-thumbnail" src="${anime.image}" title="${anime.title}"></bva-link>
            ${anime.vf === true ? `<div class="bva-item-vf" title="VF">${vfMarkIcon}</div>` : ''}
          </div>
          <div class="bva-item-infos">
            <bva-link href="${anime.url}" class="bva-item-title" title="${anime.title}">${anime.title}</bva-link>
          </div>
        </div>
      `)
      attachDOM(createRating(anime.rating), $anime, '.bva-item-thumb')
      attachDOM(createSynopsis(anime.synopsis), $anime, '.bva-item-infos')
      attachDOM(createEpisodeList(anime.episodes), $anime, '.bva-item-infos')

      return $anime
    }))

    const $animeList = createDOM(`<div class="bva-animes-container" data-size="${size}"></div>`)
    attachDOM($animeItems, $animeList, '.bva-animes-container')

    return $animeList
  }

  const $home = createDOM(`
    <div class="bva-animes-search-container"></div>
    <div class="bva-content-header"></div>
    <div class="bva-content-wrapper">
      <div class="bva-content-container"></div>
    </div>
  `)
  attachDOM(createAnimeSearch(), $home, '.bva-animes-search-container')
  attachDOM(createSearchLanguage(), $home, '.bva-animes-search-container')
  attachDOM(createUnorderedList('genre', genreList), $home, '.bva-content-header')
  attachDOM(createUnorderedList('sort', sortList), $home, '.bva-content-header')
  attachDOM(createTabulation(getTabs()), $home, '.bva-content-wrapper', true)
  buildAnimes(animes, section === 'search' ? 'single' : 'multiple')

  innerDOM($home, $main)
}
