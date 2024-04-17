import invariant from 'tiny-invariant'
import { ITEM_RECIPE, ItemRecipe } from './recipe.js'
import { Item, ItemType, State } from './state.js'

export function tick(state: State): void {
  state.tick += 1

  let items = new Array(...iterateItems(state))

  for (const { item } of items) {
    item.count += item.production

    item.production = 0
    item.consumption = 0
    item.satisfaction = 0
  }

  items = items.filter(({ item }) => item.machines > 0)

  for (const { recipe, item } of items) {
    let satisfaction = 1
    // find the bottleneck ingredient
    for (const ingredient of iterateRecipe(
      recipe.input,
      state,
    )) {
      satisfaction = Math.min(
        satisfaction,
        (ingredient.count * item.machines) /
          ingredient.item.count,
      )
    }

    // consumption is determined by the bottleneck ingredient
    for (const ingredient of iterateRecipe(
      recipe.input,
      state,
    )) {
      ingredient.item.consumption +=
        ingredient.count * item.machines * satisfaction
    }
  }

  for (const { item } of items) {
    if (item.consumption === 0) {
      continue
    }
    item.satisfaction = item.count / item.consumption
  }

  for (const { recipe, item } of items) {
    let satisfaction = 1
    for (const ingredient of iterateRecipe(
      recipe.input,
      state,
    )) {
      satisfaction = Math.min(
        satisfaction,
        item.satisfaction,
      )
    }

    invariant(satisfaction <= 1)
    invariant(satisfaction >= 0)
  }

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

function* iterateRecipe(
  ingredients: ItemRecipe['input'] | ItemRecipe['output'],
  state: State,
): Generator<{
  type: ItemType
  count: number
  item: Item
}> {
  for (const [key, count] of Object.entries(ingredients)) {
    const type = key as ItemType
    const item = state.items[type]
    yield { type, count, item }
  }
}
