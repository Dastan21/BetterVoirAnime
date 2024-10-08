import { createBreadcrumb, createSelect, createTabulation } from '../common/components'
import { parseBreadcrumb, parseEpisode } from '../common/parser'
import * as storage from '../common/storage'
import { attachDOM, buildTitle, capitalize, collectionToArray, createDOM, innerDOM, observe, onTrigger, translateGenre, translateQuickNavigation } from '../common/utils'

import arrowIcon from '../assets/icons/arrow.svg'
import downloadIcon from '../assets/icons/download.svg'
import { changePage } from '../common/api'

function setEpisodeClass () {
  const query = '.entry-content, .entry-content_wrap, .read-container, .reading-content, .chapter-video-frame, .chapter-video-frame > *'
  document.querySelectorAll(query).forEach(($el) => $el.classList.toggle('bva-episode-video-full', true))
}

function getSelectEpisodes () {
  return collectionToArray(document.querySelectorAll('#manga-reading-nav-head .single-chapter-select option')).map(($o) => {
    const ep = $o.textContent.trim()
    return {
      label: ep,
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
  return parseBreadcrumb().map(($l) => {
    const label = $l.textContent.trim()
    return {
      label: label === 'Home' ? 'Accueil' : capitalize(translateGenre(label)),
      attrs: {
        href: $l.firstElementChild?.getAttribute('href'),
        title: label
      }
    }
  })
}

function getHostTabs (hosts, episode, players) {
  const $hostSelect = document.querySelector('#manga-reading-nav-head .host-select')

  const tabs = hosts.map((h) => ({
    label: h,
    selected: h === $hostSelect?.value?.replace('LECTEUR ', '') && players.length <= 0,
    attrs: {
      title: `Lecteur ${h}`,
      value: `LECTEUR ${h}`
    }
  }))

  const customTabs = players.map((tab, i) => ({
    label: tab.name,
    selected: i === 0,
    attrs: {
      title: tab.name,
      value: tab.id
    },
    select: () => {
      document.querySelector('.entry-content .reading-content .chapter-video-frame').innerHTML = `
        <iframe
          src="${tab.url.replace('$id', episode.id)}"
          loading="lazy"
          frameBorder="0"
          scrolling="no"
          frameborder="0"
          width="100%"
          height="100%"
          allowfullscreen="true"
          webkitallowfullscreen="true"
          mozallowfullscreen="true"
        >
      `
    }
  }))
  tabs.unshift(...customTabs)

  onSelectTab(tabs[0])

  return tabs
}

function onSelectTab (tab) {
  const $hostSelect = document.querySelector('#manga-reading-nav-head .host-select')
  if ($hostSelect == null) return

  $hostSelect.value = tab.attrs.value

  if (typeof tab.select !== 'function') {
    $hostSelect.dispatchEvent(new Event('change', { bubbles: true }))
  } else {
    tab.select()
  }

  setEpisodeClass()
}

export async function buildEpisodePage () {
  const $main = document.getElementById('bva-main')

  const episode = parseEpisode()
  storage.set('bva-episode', location.href)
  document.title = buildTitle(episode.title)

  const players = await fetch(chrome.runtime.getURL('public/players.json')).then((r) => r.json()).catch((err) => {
    console.error(err)
    return []
  })

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

  const episodeDownloader = (title, number) => {
    const torrentsUrl = `https://nyaa.si/?f=0&c=0_0&q=%221080p%22%20VOSTFR%7CFR+${encodeURI(`"${title.replace(' ', '+')}"+"${number} "`)}`
    const $button = createDOM(`<bva-button-icon class="bva-button" title="Télécharger l'épisode" data-sort="down">${downloadIcon}</bva-button-icon>`)
    onTrigger($button, () => {
      open(torrentsUrl, '_blank')
    })
    return $button
  }

  const $episodeContainer = createDOM(`
    <div class="bva-content-wrapper">
      <div class="bva-content-container">
        <div class="bva-episode-container">
          <div class="bva-episode-navigation">
            <div class="bva-episode-list"></div>
          </div>
          <div class="bva-episode-video"></div>
        </div>
      </div>
    </div>
  `)
  const selectEpisodes = getSelectEpisodes()
  const $videoValidator = document.querySelector('.entry-content')
  attachDOM(createTabulation(getHostTabs(episode.hosts, episode, players), onSelectTab), $episodeContainer, true)
  attachDOM(createBreadcrumb(getBreadcrumbItems()), $episodeContainer, '.bva-episode-navigation', true)
  if (selectEpisodes.length > 1) attachDOM(createSelect({ options: selectEpisodes }, onSelectEpisode), $episodeContainer, '.bva-episode-list')
  attachDOM(episodeDownloader(episode.title.split(' - ')[0], selectEpisodes.find(e => e.selected).value), $episodeContainer, '.bva-episode-list', true)
  attachDOM(createQuickNavigation(), $episodeContainer, '.bva-episode-navigation')
  attachDOM($videoValidator, $episodeContainer, '.bva-episode-video')

  // display captcha puzzle
  let checkingCaptcha = false
  observe('body', () => {
    const $captchas = document.querySelectorAll('body > div > div > iframe[src*="recaptcha"]')
    if ($captchas.length <= 0) return
    $captchas.forEach(($c) => $c.parentElement.parentElement.classList.toggle('bva-captcha-puzzle', true))

    if (checkingCaptcha) return
    checkingCaptcha = true
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
