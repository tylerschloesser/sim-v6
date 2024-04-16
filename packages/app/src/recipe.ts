import { ItemType } from './state.js'

export type MachineRecipe = Partial<
  Record<ItemType, number>
>

export const MINER_RECIPE: MachineRecipe = {
  [ItemType.IronPlate]: 10,
  [ItemType.Brick]: 10,
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

  [ItemType.Brick]: FURNACE_RECIPE,
  [ItemType.IronPlate]: FURNACE_RECIPE,
}
