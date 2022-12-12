import { attachDOM, createDOM, applyAttrs, collectionToArray, maxClientWidth, onClickOutside, SEARCH_OPTIONS_TYPES, onTrigger } from './utils'

import arrowIcon from '../assets/icons/arrow_big.svg'
import starFullIcon from '../assets/icons/star_full.svg'
import starHalfIcon from '../assets/icons/star_half.svg'
import starEmptyIcon from '../assets/icons/star_empty.svg'
import { changePage } from './api'

/**
 * Select option.
 * @typedef {object} SelectOption
 * @property {string} SelectOption.label
 * @property {string} SelectOption.value
 * @property {boolean} [SelectOption.selected]
 * @property {any} [SelectOption.attrs]
 *
 * Select input.
 * @typedef {object} SelectInput
 * @property {SelectOption[]} SelectInput.options
 * @property {any} [SelectInput.value]
 * @property {boolean} [SelectInput.multiple]
 * @property {any} [SelectInput.attrs]
 *
 * Create select input.
 * @param {SelectInput} input
 * @param {(item: SelectOption) => void)} [change]
 * @returns {HTMLElement}
 */
export function createSelect (input, change) {
  const toggleSelect = (e, force) => {
    document.clickOutside?.(e)
    hoverItem(selectedItemsIndex)

    if ($selectLabel.hasAttribute('data-active') && input.multiple && force == null) return
    $selectLabel.toggleAttribute('data-active', force)
  }

  const hoverItem = (index = -1) => {
    if (index < 0 || index >= input.options.length) return
    hoveredItemIndex = index
    collectionToArray($selectOptions.children).forEach(($o, i) => {
      const selected = i === hoveredItemIndex
      $o.toggleAttribute('data-selected', selected)
      if (selected) $o.scrollIntoViewIfNeeded(false)
    })
  }

  const getItemLabel = () => {
    if (!input.multiple) return input.options.find(o => o.value === $input.value)?.label

    let arr = []
    try {
      arr = JSON.parse($input.value)
    } catch (_) {}
    return input.options.filter(o => arr.includes(o.value)).map(o => o.label).join(', ')
  }

  const setSelectLabel = () => {
    const $label = $selectLabel.querySelector('span')
    $label.textContent = getItemLabel()
    $label.setAttribute('title', getItemLabel())
  }

  const selectItem = (close = false) => {
    const item = input.options[hoveredItemIndex]
    if (item == null) return

    if (close && !input.multiple) $selectLabel.toggleAttribute('data-active', false)
    if (!input.multiple && hoveredItemIndex === selectedItemsIndex) return

    selectedItemsIndex = hoveredItemIndex
    if (input.multiple) {
      let inputValue = []
      try {
        inputValue = JSON.parse($input.value)
      } catch (_) {}

      const checked = inputValue.includes(item.value)
      if (checked) inputValue = inputValue.filter(v => v !== item.value)
      else inputValue.push(item.value)

      $input.value = JSON.stringify(inputValue)
      $select.querySelector('bva-select-item[data-selected] input[type="checkbox"]').checked = !checked
    } else {
      $input.value = item.value
    }
    setSelectLabel()
    change?.(item)
  }

  // native select replication
  const handleSelectEvent = (e, click = false) => {
    if (click) return toggleSelect(e)
    const isActive = $selectLabel.hasAttribute('data-active')
    if (isActive && ['Enter', 'NumpadEnter', 'Tab'].includes(e.code)) {
      e.preventDefault()
      e.stopPropagation()
      selectItem(true)
    } else if (e.code === 'Escape') {
      e.preventDefault()
      toggleSelect(e, false)
    } else if (!isActive && ['Enter', 'NumpadEnter', 'Space'].includes(e.code)) {
      toggleSelect(e, true)
      e.preventDefault()
    } else if (['ArrowUp', 'ArrowDown'].includes(e.code)) {
      e.preventDefault()
      e.stopPropagation()
      hoverItem(hoveredItemIndex + (e.code === 'ArrowUp' ? -1 : 1))
      if (!input.multiple) selectItem()
    } else if (e.code === 'Space') {
      e.preventDefault()
    }
    $selectLabel.querySelectorAll('.bva-select-item').forEach(($i) => $i.setAttribute('tabindex', !isActive ? '0' : '-1'))
  }

  let hoveredItemIndex = Math.max(input.options.findIndex(i => i.selected), 0)
  let selectedItemsIndex = []

  const $selectLabel = createDOM(`
    <bva-select-label tabindex="0">
      <span>${!input.multiple ? input.options[hoveredItemIndex].label : ''}</span>
      <div class="bva-icon bva-icon-270">${arrowIcon}</div>
    </bva-select-label>
  `)
  $selectLabel.onclick = (e) => handleSelectEvent(e, true)
  $selectLabel.onkeydown = handleSelectEvent

  const $selectOptions = createDOM('<bva-select-options></bva-select-options>')
  $selectOptions.onmouseover = (e) => hoverItem(input.options.findIndex(i => i.value === e.target.getAttribute('value')))
  const $selectOptionsList = createDOM(input.options.map((item) => {
    const $item = createDOM(`
      <bva-select-item value="${item.value}" tabindex="0">
        <bva-select-item-label><span>${item.label}</span></bva-select-item-label>
      </bva-select-item>
    `)
    applyAttrs($item, item.attrs)
    $item.toggleAttribute('data-selected', item.selected)
    $item.onclick = () => selectItem()

    if (input.multiple) {
      const $checkbox = createDOM('<input type="checkbox">')
      $checkbox.onclick = (e) => e.stopPropagation()
      attachDOM($checkbox, $item, 'bva-select-item-label', true)
    }

    return $item
  }))
  attachDOM($selectOptionsList, $selectOptions)
  attachDOM($selectOptions, $selectLabel)

  const $select = createDOM('<bva-select></bva-select>')
  const $input = createDOM('<input type="hidden">')
  $input.toggleAttribute('multiple', input.multiple ?? false)
  applyAttrs($input, input.attrs)
  attachDOM($input, $select)
  attachDOM($selectLabel, $select)

  onClickOutside($select, (e) => toggleSelect(e, false))
  setTimeout(() => {
    $selectLabel.firstElementChild.style.width = Math.max(
      $selectLabel.firstElementChild.clientWidth,
      maxClientWidth(collectionToArray($selectOptionsList).map($o => $o.firstElementChild))
    ) + 'px'
    const value = input.value
    if (input.multiple) {
      $input.value = value == null ? [] : JSON.stringify(value)
      const $inputs = collectionToArray($select.querySelectorAll('bva-select-item')).filter(($i) => value.includes($i.getAttribute('value')))
      $inputs.forEach(($i) => { $i.firstElementChild.firstElementChild.checked = true })
      setSelectLabel()
    } else {
      $input.value = value
      hoveredItemIndex = input.options.findIndex((i) => i.value === input.value)
      selectItem()
    }
  }, 1)

  return $select
}

/**
 * Breadcrumb item.
 * @typedef {object} BreadcrumbItem
 * @property {string} BreadcrumbItem.label
 * @property {any} [BreadcrumbItem.attrs]
 *
 * Create breadcrumb.
 * @param {BreadcrumbItem[]} items
 * @returns {HTMLElement}
 */
export function createBreadcrumb (items = []) {
  const $breadcrumbItems = createDOM(items.map((item) => {
    const $itemContainer = createDOM('<li class="bva-breadcrumb-item"></li>')
    const $item = createDOM(item.attrs?.href != null ? `<bva-link>${item.label}</bva-link>` : `<span>${item.label}</span>`)
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
 * @property {string} TabulationItem.label
 * @property {boolean} [TabulationItem.selected]
 * @property {any} [TabulationItem.attrs]
 *
 * Create tabulation.
 * @param {TabulationItem[]} tabs
 * @param {(tab: TabulationItem) => void} [change]
 * @returns {HTMLElement}
 */
export function createTabulation (tabs = [], change) {
  const $tabList = createDOM(tabs.map((tab) => {
    const isLink = tab.attrs?.href != null
    const $tab = createDOM(`<${isLink ? 'bva-link' : 'button'} class="bva-tab">${tab.label}</${!isLink ? 'bva-link' : 'button'}>`)
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
 * @returns {HTMLCollection | null}
 */
export function createRating (rating) {
  if (rating == null) return
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
 * Switch input.
 * @typedef {object} SwitchInput
 * @property {[string, string]} [SwitchInput.options]
 * @property {any} [SwitchInput.value]
 * @property {any} [SwitchInput.attrs]
 *
 * Create switch input.
 * @param {SwitchInput} [input]
 * @param {(checked: boolean) => void} [change]
 * @returns {HTMLElement}
 */
export function createSwitch (input, change) {
  if (typeof input === 'function') {
    change = input
    input = {}
  }
  const $switch = createDOM(`
    <label class="bva-switch" tabindex="0">
      <span class="bva-switch-slider"></span>
    </label>
  `)
  const $checkbox = createDOM('<input type="checkbox">')
  attachDOM($checkbox, $switch, '.bva-switch', true)
  $switch.querySelector('input').onchange = (e) => {
    $checkbox.value = input.options?.[Number($checkbox.checked)] ?? $checkbox.checked
    change?.(e.target.checked)
  }
  $checkbox.value = input.value ?? input.options?.[0] ?? 'false'
  $checkbox.checked = input.value === String(input.options?.[1]) || false
  applyAttrs($checkbox, input.attrs)

  return $switch
}

/**
 * Dropdown item.
 * @typedef {object} DropdownItem
 * @property {string} DropdownItem.label
 * @property {(e: Event) => void} DropdownItem.action
 * @property {any} [DropdownItem.attrs]
 * @property {DropdownItem[]} [DropdownItem.children]
 *
 * Create dropdown.
 * @param {HTMLElement} $trigger
 * @param {DropdownItem[]} items
 * @returns {HTMLElement}
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
    let $itemContent = createDOM(`<div class="bva-dropdown-item">${item.label}</div>`)
    applyAttrs($itemContent, item.attrs)
    if (item.children != null) $itemContent = createDropdown($itemContent, item.children)
    attachDOM($itemContent, $item)
    return $item
  }))
  attachDOM($dropdownItems, $itemsContainer)
  attachDOM($itemsContainer, $dropdown)

  return $dropdown
}

/**
 * List item.
 * @typedef {object} ListItem
 * @property {string} ListItem.label
 * @property {any} [ListItem.attrs]
 *
 * Create unordered list.
 * @param {string} name
 * @param {ListItem[]} list
 */
export function createUnorderedList (name, list = []) {
  const $wrapper = createDOM(`<div class="bva-${name}-container"></div>`)
  const $list = createDOM(list.map((item) => {
    const $item = createDOM(`
      <bva-link class="bva-genre">
        ${item.label}
      </bva-link>
    `)
    applyAttrs($item, item.attrs)

    return $item
  }))
  attachDOM($list, $wrapper)

  return $wrapper
}

export function createForm (inputs) {
  const $form = createDOM(`
    <div class="bva-item">
      <bva-form></bva-form>
    </div>
  `)

  const createInput = (input) => {
    const $input = createDOM(`<input name="${input.name}">`)
    $input.value = input.value
    applyAttrs($input, input.attrs)
    return $input
  }

  const $inputs = inputs.map((input) => {
    const noLabel = input.label == null
    const $formGroup = createDOM(noLabel
      ? `<div class="bva-input" data-type="${input.type}"></div>`
      : `
      <div class="bva-anime-info">
        <div class="bva-anime-info-label" title="${input.label}">${input.label}</div> 
        <div class="bva-anime-info-value bva-input" data-type="${input.type}"></div>
      </div>
    `)
    let $input
    if (input.type === SEARCH_OPTIONS_TYPES.SELECT) $input = createSelect(input)
    else if (input.type === SEARCH_OPTIONS_TYPES.CHECKBOX) $input = createSelect({ ...input, multiple: true })
    else if (input.type === SEARCH_OPTIONS_TYPES.INPUT) $input = createInput(input)
    else if (input.type === SEARCH_OPTIONS_TYPES.SWITCH) {
      $input = [
        createDOM(`<span>${input.options[0].label}</span>`),
        createSwitch({ ...input, options: input.options.map(o => o.value) }),
        createDOM(`<span>${input.options[1].label}</span>`)
      ]
      applyAttrs($input[0], input.options[0].attrs)
      applyAttrs($input[2], input.options[1].attrs)
    }

    attachDOM($input, $formGroup, noLabel ? '.bva-input' : '.bva-anime-info-value')
    return $formGroup
  })
  attachDOM($inputs, $form, 'bva-form')

  const $actions = createDOM('<div class="bva-form-actions"></div>')
  const $submit = createDOM('<bva-button class="bva-anime-trailer bva-primary" title="Rechercher des animés">Rechercher</bva-button>')
  onTrigger($submit, () => {
    const INPUTS_SELECTOR = '.bva-input input[name]:first-of-type'
    const $inputs = collectionToArray($form.querySelectorAll(INPUTS_SELECTOR))
    const data = $inputs.reduce((t, $i) => {
      let value = $i.value
      try {
        value = JSON.parse(value)
      } catch (_) {}
      if ($i.hasAttribute('multiple') && value?.length <= 0) return t
      return { ...t, [$i.getAttribute('name')]: value }
    }, { post_type: 'wp-manga' })
    const search = new URLSearchParams()
    Object.entries(data).forEach(([k, v]) => {
      if (Array.isArray(v)) v.forEach(v => search.append(`${k}[]`, v))
      else search.set(k, v)
    })
    changePage(`${location.origin}/?${search}`)
  })

  attachDOM($submit, $actions)
  attachDOM($actions, $form, 'bva-form')

  return $form
}
