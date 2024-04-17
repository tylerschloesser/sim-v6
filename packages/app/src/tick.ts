import { ITEM_RECIPE, ItemRecipe } from './recipe.js'
import { Item, ItemType, State } from './state.js'

export function tick(state: State): void {
  state.tick += 1

  const items = new Array(...iterateItems(state))

  for (const { item } of items) {
    item.production = 0
    item.consumption = 0
    item.satisfaction = 0
  }
}

function* iterateItems(state: State): Generator<{
  type: ItemType
  recipe: ItemRecipe
  item: Item
}> {
  for (const [key, item] of Object.entries(state.items)) {
    const type = key as ItemType
    const recipe = ITEM_RECIPE[type]
    yield { type, recipe, item }
  }
}
