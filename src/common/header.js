import { applyAttrs, attachDOM, BASE_URL, buildTitle, changeTheme, collectionToArray, createDOM, getChildIndex, getCurrentSection, innerDOM, onClickOutside, onTrigger } from './utils'
import { changePage, request } from './api'
import * as storage from '../common/storage'

import vaLogo from '../assets/icons/va_logo.svg'
import menuIcon from '../assets/icons/menu.svg'
import closeIcon from '../assets/icons/cross.svg'
import themeIcon from '../assets/icons/dark_mode.svg'
import arrowIcon from '../assets/icons/arrow.svg'
import dotIcon from '../assets/icons/dot.svg'
import randomIcon from '../assets/icons/random.svg'
import resumeIcon from '../assets/icons/resume.svg'

const headerItems = [
  {
    id: 'home',
    label: 'Accueil',
    title: 'Accueil',
    path: '/',
    icon: 'home'
  },
  {
    id: 'anime-list',
    label: 'Liste',
    title: 'Liste des animés',
    path: '/liste-danimes/',
    icon: 'list'
  },
  {
    id: 'new',
    label: 'Nouveau',
    title: 'Nouveaux ajouts',
    path: '/nouveaux-ajouts/',
    icon: 'new'
  },
  {
    id: 'soon',
    label: 'Prochainement',
    title: 'Prochainement',
    path: '/prochainement/',
    icon: 'soon'
  },
  {
    id: 'search',
    label: 'Recherche avancée',
    title: 'Recherche avancée',
    path: '/?s=&amp;post_type=wp-manga',
    icon: 'a_search'
  }
]

const menuTab = {
  items: [
    {
      id: 'theme',
      label: 'Thème',
      icon: themeIcon,
      attrs: {
        title: 'Thème'
      },
      items: [
        {
          label: 'Clair',
          icon: dotIcon,
          attrs: {
            title: 'Thème clair',
            'data-color-theme': 'light'
          },
          action: () => changeTheme('light')
        },
        {
          label: 'Sombre',
          icon: dotIcon,
          attrs: {
            title: 'Thème sombre',
            'data-color-theme': 'dark'
          },
          action: () => changeTheme('dark')
        },
        {
          label: 'Nord',
          icon: dotIcon,
          attrs: {
            title: 'Thème nord',
            'data-color-theme': 'nord'
          },
          action: () => changeTheme('nord')
        }
      ]
    },
    {
      label: 'Animé aléatoire',
      icon: randomIcon,
      attrs: {
        title: 'Découvrir un animé'
      },
      action: () => {
        request(`${BASE_URL}liste-danimes/`).then((res) => {
          const totalPages = res.body.querySelector('.wp-pagenavi .last').getAttribute('href').match(/(\d*)\/$/)?.[1]
          const page = Math.floor((Math.random() * totalPages)) + 1
          request(`${BASE_URL}liste-danimes/page/${page}/`, { abortPrevious: true }).then((res) => {
            const animes = collectionToArray(res.body.querySelectorAll('.page-listing-item .item-thumb a'))
            const randomAnimeUrl = animes[~~(Math.random() * animes.length)].getAttribute('href')
            changePage(randomAnimeUrl)
          })
        }).catch(console.error)
      }
    },
    {
      label: 'Reprendre',
      icon: resumeIcon,
      attrs: {
        title: 'Reprendre au dernier épisode'
      },
      action: () => {
        storage.get('bva-episode').then((url) => {
          changePage(url)
        })
      },
      mounted: (target) => {
        storage.get('bva-episode').then((url) => {
          target.toggleAttribute('data-disabled', !url)
        })
      }
    }
  ]
}

export function buildHeader () {
  const $header = document.getElementById('bva-header')

  const createHeaderList = () => {
    return createDOM(headerItems.filter(i => !i.disabled).map((item) => {
      const $item = createDOM(`
        <bva-link class="bva-header-item" href="${item.path}" title="${item.title}">
          <span>${item.label}</span>
        </bva-link>
      `)
      const active = item.id === getCurrentSection()
      $item.toggleAttribute('data-active', active)
      if (active) document.title = buildTitle(item.label)

      return $item
    }))
  }

  const createHeaderMenu = () => {
    const $headerMenu = createDOM('<div class="bva-header-menu"></div>')
    const $headerMenuContainer = createDOM('<div class="bva-header-menu-container"></div>')
    attachDOM($headerMenuContainer, $headerMenu)

    const toggleMenu = (e, force) => {
      const active = $menuButton.toggleAttribute('data-active', force)
      $menuButton.innerHTML = active ? closeIcon : menuIcon
      $headerMenu.toggleAttribute('data-tab', false)
      createHeaderTab(menuTab)
      e.stopPropagation()
    }

    const $menuButton = createDOM(`<div class="bva-header-menu-toggle" tabindex="0">${menuIcon}</div>`)
    onTrigger($menuButton, (e, _, ...data) => toggleMenu(e, ...data))
    attachDOM($menuButton, $headerMenu, true)

    const createHeaderTab = (tab) => {
      $headerMenuContainer.innerHTML = ''

      const triggerItem = (e, _, item) => {
        const target = e.currentTarget
        if (target.hasAttribute('data-disabled')) return
        if (item.items != null && item.items.length > 0) {
          $headerMenu.setAttribute('data-tab', item.id ?? item.label)
          attachDOM(createHeaderTab(item), $headerMenu)
        } else {
          item.action?.(e, target)
        }

        e.stopPropagation()
      }

      const $headerMenuTab = createDOM(`
        <div class="bva-header-menu-tab">
          <span class="bva-header-menu-tab-name">${tab.label}<span>
        </div>
      `)
      const $headerMenuTabBack = createDOM(`<div class="bva-header-menu-tab-back bva-icon" tabindex="0">${arrowIcon}</div>`)
      onTrigger($headerMenuTabBack, triggerItem, menuTab)
      attachDOM($headerMenuTabBack, $headerMenuTab, true)
      if (tab.id != null) $headerMenuTab.setAttribute('data-tab-id', tab.id)
      else $headerMenu.toggleAttribute('data-tab', false)

      const $headerMenuItems = createDOM('<div class="bva-header-menu-items"></div>')
      const $headerMenuItemList = createDOM(tab.items.map((item) => {
        const $item = createDOM(`
          <div class="bva-header-menu-item" tabindex="0">
            <div class="bva-icon">${item.icon ?? ''}</div>
            <span class="bva-header-menu-item-text">${item.label}</span>
            <div class="bva-icon bva-icon-180">${item.items != null && item.items.length > 0 ? arrowIcon : ''}</div>
          </div>
        `)
        applyAttrs($item, item.attrs)
        onTrigger($item, triggerItem, item)
        item.mounted?.($item)

        return $item
      }))
      $headerMenuItems.onkeydown = (e) => {
        if (!['ArrowUp', 'ArrowDown'].includes(e.code)) return
        e.preventDefault()
        e.stopPropagation()
        const nextIndex = Math.min($headerMenuItems.childElementCount - 1, Math.max(0, getChildIndex(document.activeElement) + (e.code === 'ArrowUp' ? -1 : 1)))
        $headerMenuItems.children[nextIndex].focus()
      }
      attachDOM($headerMenuItemList, $headerMenuItems)
      attachDOM($headerMenuTab, $headerMenuContainer)
      attachDOM($headerMenuItems, $headerMenuContainer)
    }

    attachDOM(createHeaderTab(menuTab), $headerMenu)
    onClickOutside($headerMenu, (e) => toggleMenu(e, false))
    document.onkeydown = (e) => {
      if (e.code === 'Escape') toggleMenu(e, false)
    }

    return $headerMenu
  }

  const $headerItems = createDOM(`
    <bva-link class="bva-header-logo" href="${BASE_URL}" title="Voiranime">${vaLogo}</bva-link>
    <div class="bva-header-subcontainer"></div>
  `)
  attachDOM(createHeaderList(), $headerItems, '.bva-header-subcontainer')
  innerDOM($headerItems, $header)
  attachDOM(createHeaderMenu(), $header)
}
