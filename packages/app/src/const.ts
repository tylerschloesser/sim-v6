import { Vec2 } from './vec2.js'

export const RESET_LOCAL_STORAGE: boolean = true
export const SHOW_GRID: boolean = true
export const ENABLE_SMOOTH_CAMERA: boolean = false

export const GRID_LINE_COLOR: string = 'hsl(0, 0%, 50%)'
export const NODE_BORDER_COLOR = GRID_LINE_COLOR

export function getScale(viewport: Vec2) {
  const vmin = Math.min(viewport.x, viewport.y)
  return vmin * (1 / 8)
}

export function smooth(k: number, n = 2.5): number {
  return (k + 1) ** n - 1
}
