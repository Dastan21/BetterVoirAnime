import { buildTitle, capitalize, innerDOM, translateGenre } from '../common/utils'
import { parseGenreList } from '../common/parser'

import wip from '../common/wip'

export function buildGenreListPage () {
  const genre = window.body.querySelector('.entry-header .item-title').textContent.trim().toLowerCase()
  document.title = buildTitle(capitalize(translateGenre(genre)))
  const $main = document.getElementById('bva-main')

  const data = parseGenreList()
  console.log(data)

  innerDOM(wip, $main)
}
