import { World } from './types.js'

export function tickWorld(world: World): void {
  world.tick += 1
}
