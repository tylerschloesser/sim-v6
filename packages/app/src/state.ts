export enum ItemType {
  Stone = 'stone',
  Coal = 'coal',
  Brick = 'brick',

  Power = 'power',

  IronOre = 'iron-ore',
  IronPlate = 'iron-plate',
}

export interface Item {
  count: number
  machines: number
}

export interface State {
  tick: number
  level: number
  selected: ItemType
  items: Record<ItemType, Item>
}
