import { ItemType } from './state.js'

export type MachineRecipe = Partial<
  Record<ItemType, number>
>

export const MINER_RECIPE: MachineRecipe = {
  [ItemType.IronPlate]: 10,
  [ItemType.Brick]: 10,
}

export const GENERATOR_RECIPE: MachineRecipe = {
  [ItemType.Brick]: 20,
  [ItemType.IronPlate]: 20,
}

export const FURNACE_RECIPE: MachineRecipe = {
  [ItemType.Stone]: 20,
}

export const MACHINE_RECIPES: Record<
  ItemType,
  Partial<Record<ItemType, number>>
> = {
  [ItemType.Stone]: MINER_RECIPE,
  [ItemType.Coal]: MINER_RECIPE,
  [ItemType.IronOre]: MINER_RECIPE,

  [ItemType.Power]: GENERATOR_RECIPE,

  [ItemType.Brick]: FURNACE_RECIPE,
  [ItemType.IronPlate]: FURNACE_RECIPE,
}

export type ItemRecipe = {
  input: Partial<Record<ItemType, number>>
  output: Partial<Record<ItemType, number>>
}

export const ITEM_RECIPE: Record<ItemType, ItemRecipe> = {
  [ItemType.Stone]: {
    input: {},
    output: {
      [ItemType.Stone]: 1 * 0.1,
    },
  },
  [ItemType.Coal]: {
    input: {},
    output: {
      [ItemType.Coal]: 1 * 0.1,
    },
  },
  [ItemType.IronOre]: {
    input: {},
    output: {
      [ItemType.IronOre]: 1 * 0.1,
    },
  },
  [ItemType.Power]: {
    input: {
      [ItemType.Coal]: 1 * 0.1,
    },
    output: {
      [ItemType.Power]: 10 * 0.1,
    },
  },
  [ItemType.Brick]: {
    input: {
      [ItemType.Stone]: 2 * 0.1,
      [ItemType.Coal]: 0.1 * 0.1,
    },
    output: {
      [ItemType.Brick]: 1 * 0.1,
    },
  },
  [ItemType.IronPlate]: {
    input: {
      [ItemType.IronOre]: 2 * 0.1,
      [ItemType.Coal]: 0.1 * 0.1,
    },
    output: {
      [ItemType.IronPlate]: 1 * 0.1,
    },
  },
}
