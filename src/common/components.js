import { attachDOM, createDOM, applyAttrs, collectionToArray, maxClientWidth, onClickOutside } from './utils'

import arrowIcon from '../assets/icons/arrow_big.svg'
import starFullIcon from '../assets/icons/star_full.svg'
import starHalfIcon from '../assets/icons/star_half.svg'
import starEmptyIcon from '../assets/icons/star_empty.svg'

/**
 * Select item.
 * @typedef {object} SelectItem
 * @property {string} SelectItem.name
 * @property {string} SelectItem.value
 * @property {boolean} [SelectItem.selected]
 * @property {any} [SelectItem.attrs]
 *
 * Create select input.
 * @param {SelectItem[]} items
 * @param {(item: SelectItem) => void)} [change]
 * @returns {HTMLElement}
 */
export function createSelect (items, change) {
  const toggleSelect = (force) => {
    $selectLabel.toggleAttribute('data-active', force)
    hoverItem(selectedItemIndex)
  }

  const hoverItem = (index = -1) => {
    if (index < 0 || index >= items.length) return
    hoveredItemIndex = index
    collectionToArray($selectOptions.children).forEach(($o, i) => {
      const selected = i === hoveredItemIndex
      $o.toggleAttribute('data-selected', selected)
      if (selected) $o.scrollIntoViewIfNeeded(false)
    })
  }

  const selectItem = () => {
    if (!$selectLabel.hasAttribute('data-active')) return
    const item = items[hoveredItemIndex]
    $selectLabel.toggleAttribute('data-active', false)
    if (hoveredItemIndex === selectedItemIndex) return
    $selectLabel.querySelector('span').textContent = item.name
    change?.(item)
  }

  const handleSelectEvent = (e, click = false) => {
    e.stopPropagation()
    if (click) return toggleSelect()
    const isActive = $selectLabel.hasAttribute('data-active')
    if (isActive && ['Enter', 'NumpadEnter', 'Tab'].includes(e.code)) {
      e.preventDefault()
      e.stopPropagation()
      selectItem()
    } else if (e.code === 'Escape') {
      e.preventDefault()
      toggleSelect(false)
    } else if (!isActive && ['Enter', 'NumpadEnter', 'Space'].includes(e.code)) {
      toggleSelect(true)
    } else if (['ArrowUp', 'ArrowDown'].includes(e.code)) {
      e.preventDefault()
      e.stopPropagation()
      hoverItem(hoveredItemIndex + (e.code === 'ArrowUp' ? -1 : 1))
      selectItem()
    }
    $selectLabel.querySelectorAll('.bva-select-item').forEach(($i) => $i.setAttribute('tabindex', !isActive ? '0' : '-1'))
  }

  let hoveredItemIndex = Math.max(items.findIndex(i => i.selected), 0)
  const selectedItemIndex = hoveredItemIndex

  const $selectLabel = createDOM(`
    <label class="bva-select-label" tabindex="0">
      <span>${items[hoveredItemIndex].name}</span>
      <div class="bva-icon bva-icon-270">${arrowIcon}</div>
    </label>
  `)
  $selectLabel.onclick = (e) => handleSelectEvent(e, true)
  $selectLabel.onkeydown = handleSelectEvent

  const $selectOptions = createDOM('<bva-select-options></bva-select-options>')
  $selectOptions.onmouseover = (e) => hoverItem(items.findIndex(i => i.value === e.target.getAttribute('value')))
  const $selectOptionsList = createDOM(items.map((item) => {
    const $item = createDOM(`<bva-select-item value="${item.value}" tabindex="0"><span>${item.name}</span></bva-select-item>`)
    applyAttrs($item, item.attrs)
    $item.toggleAttribute('data-selected', item.selected)
    $item.onclick = () => selectItem()
    return $item
  }))
  attachDOM($selectOptionsList, $selectOptions)
  attachDOM($selectOptions, $selectLabel)

  const $select = createDOM('<bva-select></bva-select>')
  attachDOM($selectLabel, $select)

  onClickOutside($select, () => toggleSelect(false))
  setTimeout(() => {
    $selectLabel.firstElementChild.style.width = Math.max($selectLabel.firstElementChild.clientWidth, maxClientWidth(collectionToArray($selectOptionsList).map($o => $o.firstElementChild))) + 'px'
  }, 1)

  return $select
}

/**
 * Breadcrumb item.
 * @typedef {object} BreadcrumbItem
 * @property {string} BreadcrumbItem.name
 * @property {any} [BreadcrumbItem.attrs]
 *
 * Create breadcrumb.
 * @param {BreadcrumbItem[]} items
 * @returns {HTMLElement}
 */
export function createBreadcrumb (items = []) {
  const $breadcrumbItems = createDOM(items.map((item) => {
    const $itemContainer = createDOM('<li class="bva-breadcrumb-item"></li>')
    const $item = createDOM(item.attrs?.href != null ? `<bva-link>${item.name}</bva-link>` : `<span>${item.name}</span>`)
    applyAttrs($item, item.attrs)
    attachDOM($item, $itemContainer)

    return $itemContainer
  }))

  const $breadcrumb = createDOM('<ul class="bva-breadcrumb"></ul>')
  attachDOM($breadcrumbItems, $breadcrumb)

  return $breadcrumb
}

/**
 * Tabulation item.
 * @typedef {object} TabulationItem
 * @property {string} TabulationItem.name
 * @property {boolean} [TabulationItem.selected]
 * @property {string} [TabulationItem.attrs]
 *
 * Create tabulation.
 * @param {TabulationItem[]} tabs
 * @param {(tab: TabulationItem) => void} [change]
 * @returns {HTMLElement}
 */
export function createTabulation (tabs = [], change) {
  const $tabList = createDOM(tabs.map((tab) => {
    const isLink = tab.attrs?.href != null
    const $tab = createDOM(`<${isLink ? 'bva-link' : 'button'} class="bva-tab">${tab.name}</${!isLink ? 'bva-link' : 'button'}>`)
    $tab.onclick = (e) => {
      if (e.currentTarget.hasAttribute('data-active')) return
      collectionToArray($tabList).forEach(($t) => $t.toggleAttribute('data-active', false))
      $tab.toggleAttribute('data-active', true)
      change?.(tab)
    }
    applyAttrs($tab, tab.attrs)
    $tab.toggleAttribute('data-active', tab.selected)

    return $tab
  }))

  const $tabsContainer = createDOM('<nav class="bva-tabs-container"></nav>')
  attachDOM($tabList, $tabsContainer)

  return $tabsContainer
}

/**
 * Create rating tooltip.
 * @param {number} rating
 * @returns {HTMLCollection}
 */
export function createRating (rating) {
  const $rating = createDOM(`
    <div class="bva-rating">
      <div class="bva-rating-tooltip">${rating} / 5 ★</div>
      <div class="bva-rating-stars"></div>
    </div>
  `)
  const score = (Math.round(rating * 2) / 2)
  let el = ''
  for (let i = 0; i < 5; i++) {
    let icon = starEmptyIcon
    if (score === i + 0.5) icon = starHalfIcon
    else if (score > i + 0.5) icon = starFullIcon
    el += icon
  }
  attachDOM(el, $rating, '.bva-rating-stars')

  return $rating
}

/**
 * Create empty results message.
 * @returns {HTMLElement}
 */
export function createEmptyDataMessage () {
  return createDOM(`
    <div class="bva-animes-empty">
      <div class="bva-animes-empty-title bva-title">Aucun résultat</div>
      <p class="bva-animes-empty-message">Nous n'avons pas réussi à trouver ce que tu cherchais :(</p>
    </div>
  `)
}

/**
 * Create switch input.
 * @param {(checked: boolean) => void} [change]
 * @returns {HTMLElement}
 */
export function createSwitch (change) {
  const $switch = createDOM(`
    <label class="bva-switch" tabindex="0">
      <input type="checkbox">
      <span class="bva-switch-slider"></span>
    </label>
  `)
  $switch.querySelector('input').onchange = (e) => change?.(e.target.checked)

  return $switch
}

/**
 * Dropdown item.
 * @typedef {object} DropdownItem
 * @property {string} DropdownItem.name
 * @property {(e: Event) => void} DropdownItem.action
 * @property {string} [DropdownItem.attrs]
 * @property {DropdownItem[]} [DropdownItem.children]
 *
 * Create dropdown.
 * @param {HTMLElement} $trigger
 * @param {DropdownItem[]} items
 */
export function createDropdown ($trigger, items = []) {
  if ($trigger == null) return

  const $dropdown = createDOM('<div class="bva-dropdown"></div>')

  const $triggerContainer = createDOM('<div class="bva-dropdown-trigger"></div>')
  $trigger.onclick = () => {
    const active = $triggerContainer.toggleAttribute('data-active')
    if (!active) return
    const $root = document.getElementById('bva-root')
    const { x: xTrigger, y: yTrigger } = $triggerContainer.getBoundingClientRect()
    const hPos = (xTrigger + $itemsContainer.clientWidth > $root.clientWidth) ? 'right' : 'left'
    const vPos = (yTrigger + $itemsContainer.clientHeight > $root.clientHeight) ? 'top' : 'bottom'
    $itemsContainer.setAttribute('data-position', `${vPos}-${hPos}`)
  }
  attachDOM($trigger, $triggerContainer)
  attachDOM($triggerContainer, $dropdown)

  const $itemsContainer = createDOM('<div class="bva-dropdown-items"></div>')
  const $dropdownItems = createDOM(items.map((item) => {
    const $item = createDOM('<div class="bva-dropdown-item"></div>')
    $item.onclick = item.action
    let $itemContent = createDOM(`<div class="bva-dropdown-item">${item.name}</div>`)
    applyAttrs($itemContent, item.attrs)
    if (item.children != null) $itemContent = createDropdown($itemContent, item.children)
    attachDOM($itemContent, $item)
    return $item
  }))
  attachDOM($dropdownItems, $itemsContainer)
  attachDOM($itemsContainer, $dropdown)

  return $dropdown
}
