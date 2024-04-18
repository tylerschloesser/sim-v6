import { ItemType } from './state.js'

export type MachineRecipe = Partial<
  Record<ItemType, number>
>

export const MINER_RECIPE: MachineRecipe = {
  [ItemType.enum.IronPlate]: 10,
  [ItemType.enum.Brick]: 10,
}

export const GENERATOR_RECIPE: MachineRecipe = {
  [ItemType.enum.Brick]: 20,
  [ItemType.enum.IronPlate]: 20,
}

export const FURNACE_RECIPE: MachineRecipe = {
  [ItemType.enum.Stone]: 20,
}

export const MACHINE_RECIPES: Record<
  ItemType,
  Partial<Record<ItemType, number>>
> = {
  [ItemType.enum.Stone]: MINER_RECIPE,
  [ItemType.enum.Coal]: MINER_RECIPE,
  [ItemType.enum.IronOre]: MINER_RECIPE,

  [ItemType.enum.Power]: GENERATOR_RECIPE,

  [ItemType.enum.Brick]: FURNACE_RECIPE,
  [ItemType.enum.IronPlate]: FURNACE_RECIPE,
}

export type ItemRecipe = {
  input: Partial<Record<ItemType, number>>
  output: Partial<Record<ItemType, number>>
}

export const ITEM_RECIPE: Record<ItemType, ItemRecipe> = {
  [ItemType.enum.Stone]: {
    input: {
      [ItemType.enum.Power]: 1 * 0.1,
    },
    output: {
      [ItemType.enum.Stone]: 1 * 0.1,
    },
  },
  [ItemType.enum.Coal]: {
    input: {
      [ItemType.enum.Power]: 1 * 0.1,
    },
    output: {
      [ItemType.enum.Coal]: 1 * 0.1,
    },
  },
  [ItemType.enum.IronOre]: {
    input: {
      [ItemType.enum.Power]: 1 * 0.1,
    },
    output: {
      [ItemType.enum.IronOre]: 1 * 0.1,
    },
  },
  [ItemType.enum.Power]: {
    input: {
      [ItemType.enum.Coal]: 1 * 0.1,
    },
    output: {
      [ItemType.enum.Power]: 10 * 0.1,
    },
  },
  [ItemType.enum.Brick]: {
    input: {
      [ItemType.enum.Stone]: 2 * 0.1,
      [ItemType.enum.Coal]: 0.1 * 0.1,
    },
    output: {
      [ItemType.enum.Brick]: 1 * 0.1,
    },
  },
  [ItemType.enum.IronPlate]: {
    input: {
      [ItemType.enum.IronOre]: 2 * 0.1,
      [ItemType.enum.Coal]: 0.1 * 0.1,
    },
    output: {
      [ItemType.enum.IronPlate]: 1 * 0.1,
    },
  },
}
