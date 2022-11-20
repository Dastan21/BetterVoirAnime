import { attachDOM, createDOM, getPagination, onTrigger, querySelectorList, toLocaleDate, isEmpty, onClickOutside, innerDOM, collectionToArray } from '../common/utils'
import { createEmptyDataMessage, createRating, createSwitch, createTabulation } from '../common/components'
import { parseAnimeList } from '../common/parser'
import { changePage, fetchAnimes, setupLinks } from '../common/api'

import vfMarkIcon from '../assets/icons/vf-mark.svg'
import searchIcon from '../assets/icons/search.svg'
import loadingIcon from '../assets/icons/loading.svg'

export function buildHomePage () {
  document.title = '#1 de l\'anime en france - VoirAnime'
  const $main = document.getElementById('bva-main')

  // Extract data
  const animes = parseAnimeList()
  console.log(animes)

  const buildAnimes = (animes, root) => {
    if (animes.length > 0) {
      innerDOM(createAnimeList(animes), $home, '.bva-content-container')
      attachDOM(createPagination(...getPagination(root)), $home, '.bva-content-container')
    } else {
      innerDOM(createEmptyDataMessage(), $home, '.bva-content-container')
    }
  }

  const getLanguageTabs = () => {
    return collectionToArray(window.body.querySelectorAll('.c-tabs-content a')).map(($a) => ({
      name: $a.textContent.trim(),
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
        <bva-link class="bva-item" href="${res.link}" data-section="anime">
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

  const createGenreList = () => {
    return createDOM(Array.from(window.body.querySelectorAll('.sub-nav_list .menu-item-type-taxonomy')).map((el) => `
      <bva-link class="bva-genre" href="${el.firstElementChild.getAttribute('href')}" title="${el.textContent}" data-section="genre-list">
        ${el.textContent}
      </bva-link>
    `).join('\n'))
  }

  const getPageUrl = (page = 1) => {
    return `${page > 1 ? `/page/${page}` : ''}/${location.search}`
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
    return episodes.map((ep) => `
      <bva-link class="bva-item-episode" href="${ep.url}" data-section="episode">
        <div class="bva-item-episode-hover"></div>
        <div class="bva-item-episode-number" title="${!ep.number.startsWith('(') ? 'Épisode ' : ''}${ep.number}">${isNaN(ep.number) ? '#' : ep.number}</div>
        <span class="bva-item-episode-date" title="${toLocaleDate(ep.date.absolute)}">${ep.date.relative}</span>
      </bva-link>
    `).join('\n')
  }

  const createAnimeList = (animes) => {
    const $animeItems = createDOM(animes.map((item) => {
      const $item = createDOM(`
        <div class="bva-item">
          <div class="bva-item-thumb">
            <bva-link href="${item.url}" data-section="anime"><img class="bva-item-thumbnail" src="${item.image}" title="${item.title}"></bva-link>
            ${item.vf === true ? `<div class="bva-item-vf" title="VF">${vfMarkIcon}</div>` : ''}
          </div>
          <div class="bva-item-infos">
            <bva-link href="${item.url}" class="bva-item-title" title="${item.title}" data-section="anime">${item.title}</bva-link>
            <div class="bva-item-episodes"></div>
          </div>
        </div>
      `)
      attachDOM(createRating(item.rating), $item, '.bva-item-thumb')
      attachDOM(createEpisodeList(item.episodes), $item, '.bva-item-episodes')

      return $item
    }))

    const $animeList = createDOM('<div class="bva-animes-container"></div>')
    attachDOM($animeItems, $animeList, '.bva-animes-container')

    return $animeList
  }

  const $home = createDOM(`
    <div class="bva-animes-search-container"></div>
    <div class="bva-genre-container">
      <div class="bva-genre-subcontainer"></div>
    </div>
    <div class="bva-content-wrapper">
      <div class="bva-content-container"></div>
    </div>
  `)
  attachDOM(createAnimeSearch(), $home, '.bva-animes-search-container')
  attachDOM(createSearchLanguage(), $home, '.bva-animes-search-container')
  attachDOM(createGenreList(), $home, '.bva-genre-subcontainer')
  attachDOM(createTabulation(getLanguageTabs()), $home, '.bva-content-wrapper', true)
  buildAnimes(animes)

  innerDOM($home, $main)
}
