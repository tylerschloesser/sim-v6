import { World } from './types.js'

export function initWorld(): World {
  const tick = 1
  const cells: World['cells'] = {}
  return { tick, cells }
}

export function loadWorld(): World | null {
  const item = localStorage.getItem('world')
  if (item) {
    return World.parse(JSON.parse(item))
  }
  return null
}

export function saveWorld(world: World): void {
  localStorage.setItem('world', JSON.stringify(world))
}
