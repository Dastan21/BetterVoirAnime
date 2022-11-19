import { innerDOM } from '../common/utils'
import { parseAnimeList } from '../common/parser'

import wip from '../common/wip'

export function buildAnimeListPage () {
  const $main = document.getElementById('bva-main')

  const data = parseAnimeList()
  console.log(data)

  innerDOM(wip, $main)
}
