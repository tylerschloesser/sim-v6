import invariant from 'tiny-invariant'
import { ITEM_RECIPE, ItemRecipe } from './recipe.js'
import { ItemType, State } from './state.js'

export function tick(state: State): void {
  state.tick += 1

  for (const [key, item] of Object.entries(state.items)) {
    if (item.machines === 0) {
      continue
    }

    const type = key as ItemType

    const recipe = ITEM_RECIPE[type]
    const satisfaction = getSatisfaction(
      recipe,
      item.machines,
      state.items,
    )

    if (satisfaction === 0) {
      continue
    }

    produce(
      recipe,
      item.machines,
      state.items,
      satisfaction,
    )
  }
}

function getSatisfaction(
  recipe: ItemRecipe,
  machines: number,
  items: State['items'],
): number {
  if (Object.keys(recipe.input).length === 0) {
    return 1
  }

  let satisfaction = Number.POSITIVE_INFINITY
  for (const [key, value] of Object.entries(recipe.input)) {
    const type = key as ItemType
    satisfaction = Math.min(
      satisfaction,
      items[type].count / (value * machines),
    )
  }

  invariant(satisfaction !== Number.POSITIVE_INFINITY)
  invariant(satisfaction >= 0)

  return Math.min(satisfaction, 1)
}

function produce(
  recipe: ItemRecipe,
  machines: number,
  items: State['items'],
  satisfaction: number,
): void {
  invariant(satisfaction > 0)
  invariant(satisfaction <= 1)

  for (const [key, value] of Object.entries(recipe.input)) {
    const type = key as ItemType
    items[type].count -= value * machines * satisfaction

    invariant(items[type].count >= -Number.EPSILON)
    items[type].count = Math.max(items[type].count, 0)
  }

  for (const [key, value] of Object.entries(
    recipe.output,
  )) {
    const type = key as ItemType
    items[type].count += value * machines * satisfaction
  }
}
