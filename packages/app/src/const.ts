import { Vec2 } from './vec2.js'

export const SHOW_GRID: boolean = true
export const SHOW_PATH: boolean = true
export const SHOW_CURSOR: boolean = true

export const ENABLE_SMOOTH_CAMERA: boolean = false

export const MAX_SPEED = Infinity

// How far ahead (in seconds) to simulate the path.
// The time step cannot be greater than this.
export const PATH_TIME = 0.5

export function getScale(viewport: Vec2) {
  const vmin = Math.min(viewport.x, viewport.y)
  return vmin / 8
}

export function smooth(k: number, n = 2.5): number {
  return (k + 1) ** n - 1
}
