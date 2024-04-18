import * as z from 'zod'

export const ItemType = z.enum([
  'Stone',
  'Coal',
  'Brick',
  'Power',
  'IronOre',
  'IronPlate',
])
export type ItemType = z.infer<typeof ItemType>

export const Item = z.strictObject({
  count: z.number().nonnegative(),
  machines: z.number().int().nonnegative(),
  buffer: z.record(ItemType, z.number().nonnegative()),

  // per tick
  production: z.number().nonnegative(),
  consumption: z.number().nonnegative(),
  satisfaction: z.number().nonnegative(),
  efficiency: z.number().nonnegative(),
})
export type Item = z.infer<typeof Item>

export const State = z.strictObject({
  tick: z.number().nonnegative().int(),
  level: z.number().nonnegative().int(),
  selected: ItemType,

  items: z.strictObject({
    [ItemType.enum.Stone]: Item,
    [ItemType.enum.Coal]: Item,
    [ItemType.enum.Brick]: Item,
    [ItemType.enum.Power]: Item,
    [ItemType.enum.IronOre]: Item,
    [ItemType.enum.IronPlate]: Item,
  }),
})
export type State = z.infer<typeof State>
