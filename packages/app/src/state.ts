export enum ItemType {
  Stone = 'stone',
  Coal = 'coal',
  Brick = 'brick',

  IronOre = 'iron-ore',
  IronPlate = 'iron-plate',
}

export interface Item {
  count: number
  machines: number
}

export interface State {
  level: number
  selected: ItemType
  items: Record<ItemType, Item>
}
