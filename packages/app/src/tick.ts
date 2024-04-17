import invariant from 'tiny-invariant'
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

  // production
  //
  for (const { item, recipe } of items) {
    let satisfaction = 1
    for (const ingredient of iterateRecipe(
      recipe.input,
      state,
    )) {
      invariant(
        typeof item.buffer[ingredient.type] === 'number',
      )

      if (item.machines === 0) {
        satisfaction = 0
        break
      } else {
        invariant(ingredient.count > 0)
        satisfaction = Math.min(
          satisfaction,
          item.buffer[ingredient.type]! /
            (ingredient.count * item.machines),
        )
      }
    }

    if (satisfaction === 0) {
      continue
    }

    for (const ingredient of iterateRecipe(
      recipe.input,
      state,
    )) {
      const consumption =
        ingredient.count * item.machines * satisfaction
      invariant(
        typeof item.buffer[ingredient.type] === 'number',
      )
      item.buffer[ingredient.type]! -= consumption
      ingredient.item.consumption += consumption
    }
    for (const ingredient of iterateRecipe(
      recipe.output,
      state,
    )) {
      const production =
        ingredient.count * item.machines * satisfaction
      invariant(production > 0)
      state.items[ingredient.type].count += production
      state.items[ingredient.type].production = production
    }
  }

  // consumption
  //
  const consumption: Record<ItemType, number> = {
    [ItemType.Brick]: 0,
    [ItemType.Coal]: 0,
    [ItemType.Stone]: 0,
    [ItemType.Power]: 0,
    [ItemType.IronOre]: 0,
    [ItemType.IronPlate]: 0,
  }
  for (const { item, recipe } of items) {
    for (const ingredient of iterateRecipe(
      recipe.input,
      state,
    )) {
      invariant(
        typeof item.buffer[ingredient.type] === 'number',
      )

      const desired = Math.max(
        item.machines * ingredient.count -
          item.buffer[ingredient.type]!,
        0,
      )
      consumption[ingredient.type] += desired
    }
  }
  const satisfaction: Record<ItemType, number> = {
    [ItemType.Brick]: 1,
    [ItemType.Coal]: 1,
    [ItemType.Stone]: 1,
    [ItemType.Power]: 1,
    [ItemType.IronOre]: 1,
    [ItemType.IronPlate]: 1,
  }
  for (const { item, type } of items) {
    if (consumption[type] === 0) {
      continue
    }
    satisfaction[type] = Math.min(
      1,
      item.count / consumption[type],
    )
  }

  for (const { item, recipe } of items) {
    for (const ingredient of iterateRecipe(
      recipe.input,
      state,
    )) {
      invariant(
        typeof item.buffer[ingredient.type] === 'number',
      )

      const desired = Math.max(
        item.machines * ingredient.count -
          item.buffer[ingredient.type]!,
        0,
      )
      const actual = desired * satisfaction[ingredient.type]

      ingredient.item.count -= actual

      invariant(
        ingredient.item.count > Number.EPSILON * -1e10,
      )
      // prettier-ignore
      ingredient.item.count = Math.max(ingredient.item.count, 0)

      item.buffer[ingredient.type]! += actual
    }
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
