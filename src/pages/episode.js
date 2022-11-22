import { createBreadcrumb, createSelect, createTabulation } from '../common/components'
import { attachDOM, innerDOM, capitalize, collectionToArray, createDOM, observe, translateGenre, translateQuickNavigation, buildTitle } from '../common/utils'
import { parseEpisode } from '../common/parser'
import * as storage from '../common/storage'

import arrowIcon from '../assets/icons/arrow.svg'
import { changePage } from '../common/api'

function setEpisodeClass () {
  const query = '.entry-content, .entry-content_wrap, .read-container, .reading-content, .chapter-video-frame, .chapter-video-frame > *'
  document.querySelectorAll(query).forEach(($el) => $el.classList.toggle('bva-episode-video-full', true))
}

function getSelectEpisodes () {
  return collectionToArray(document.querySelectorAll('#manga-reading-nav-head .single-chapter-select option')).map(($o) => {
    const ep = $o.textContent.trim()
    return {
      name: ep,
      value: ep,
      selected: location.href === $o.getAttribute('data-redirect'),
      attrs: {
        title: `Épisode ${ep}`,
        href: $o.getAttribute('data-redirect')
      }
    }
  })
}

function onSelectEpisode (item) {
  const href = item.attrs?.href
  if (href == null) return
  changePage(href)
}

function getBreadcrumbItems () {
  return collectionToArray(document.querySelectorAll('.breadcrumb > li')).map(($l) => {
    const name = $l.textContent.trim()
    return {
      name: name === 'Home' ? 'Accueil' : capitalize(translateGenre(name)),
      attrs: {
        href: $l.firstElementChild?.getAttribute('href'),
        title: name
      }
    }
  })
}

function getHostTabs (hosts) {
  return hosts.map((h) => ({
    name: h,
    selected: h === document.querySelector('#manga-reading-nav-head .host-select')?.value?.replace('LECTEUR ', ''),
    attrs: {
      title: `Lecteur ${h}`,
      value: `LECTEUR ${h}`
    }
  }))
}

function onSelectTab (tab) {
  const $hostSelect = document.querySelector('#manga-reading-nav-head .host-select')
  if ($hostSelect == null) return
  $hostSelect.value = tab.attrs.value
  $hostSelect.dispatchEvent(new Event('change', { bubbles: true }))
  setEpisodeClass()
}

export function buildEpisodePage () {
  const $main = document.getElementById('bva-main')

  const episode = parseEpisode()
  storage.set('bva-episode', location.href)
  console.log(episode)
  document.title = buildTitle(episode.title)

  const createQuickNavigation = () => {
    const createQuickBtn = (type) => {
      const $a = document.querySelector(`#manga-reading-nav-head .nav-links a.${type}_page`)
      if ($a == null) return null
      return createDOM(`
        <bva-link class="bva-button" href="${$a.getAttribute('href')}" title="Épisode ${$a.getAttribute('title')}">
          ${type === 'prev' ? `<div class="bva-icon">${arrowIcon}</div>` : ''}
          <span>${capitalize(translateQuickNavigation(type))}</span>
          ${type === 'next' ? `<div class="bva-icon bva-icon-180">${arrowIcon}</div>` : ''}
        </bva-link>
      `)
    }
    const $prevBtn = createQuickBtn('prev') ?? createDOM('<span></span>')
    const $nextBtn = createQuickBtn('next') ?? createDOM('<span></span>')

    const $quickNavigation = createDOM('<div class="bva-quick-navigation"></div>')
    attachDOM($prevBtn, $quickNavigation)
    attachDOM(`<div class="bva-title" title="${episode.title}">${episode.title}</div>`, $quickNavigation)
    attachDOM($nextBtn, $quickNavigation)
    return $quickNavigation
  }

  const $episodeContainer = createDOM(`
    <div class="bva-content-wrapper">
      <div class="bva-content-container">
        <div class="bva-episode-container">
          <div class="bva-episode-navigation"></div>
          <div class="bva-episode-video"></div>
        </div>
      </div>
    </div>
  `)
  const selectEpisodes = getSelectEpisodes()
  const $videoValidator = document.querySelector('.entry-content')
  attachDOM(createTabulation(getHostTabs(episode.hosts), onSelectTab), $episodeContainer, true)
  attachDOM(createBreadcrumb(getBreadcrumbItems()), $episodeContainer, '.bva-episode-navigation')
  if (selectEpisodes.length > 1) attachDOM(createSelect(selectEpisodes, onSelectEpisode), $episodeContainer, '.bva-episode-navigation')
  attachDOM(createQuickNavigation(), $episodeContainer, '.bva-episode-navigation')
  attachDOM($videoValidator, $episodeContainer, '.bva-episode-video')

  // display captcha puzzle
  let checkingCaptcha = false
  observe('body', () => {
    const $captchas = document.querySelectorAll('body > div > div > iframe[title*="reCAPTCHA"]')
    if ($captchas.length <= 0) return
    $captchas.forEach(($c) => $c.parentElement.parentElement.classList.toggle('bva-captcha-puzzle', true))

    if (checkingCaptcha) return
    checkingCaptcha = true
    document.getElementById('wp-manga-current-chap')?.remove()
    setEpisodeClass()
    // auto valid video
    observe('#chapter-video-captcha-validator .btn[type="submit"]', ($btn) => {
      if ($btn.hasAttribute('disabled')) return
      $btn.click()
    }, { keep: true, attributes: true, childList: false })
  }, { keep: true })

  observe('.chapter-video-frame', ($el) => {
    const $iframe = $el.querySelector('p > iframe')
    if ($iframe == null) return
    $iframe.setAttribute('width', '100%')
    $iframe.setAttribute('height', '100%')

    setEpisodeClass()
  }, { keep: true })

  innerDOM($episodeContainer, $main)
}
