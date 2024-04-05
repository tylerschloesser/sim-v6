import { World } from './types.js'

export function initWorld(): World {
  const cells: World['cells'] = {}
  return { cells }
}
