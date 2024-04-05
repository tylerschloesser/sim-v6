export const RESET_LOCAL_STORAGE: boolean = false
export const SHOW_GRID: boolean = true

export const GRID_LINE_COLOR: string = 'hsl(0, 0%, 50%)'
export const NODE_BORDER_COLOR = GRID_LINE_COLOR

export function getScale(
  zoom: number,
  vx: number,
  vy: number,
) {
  const vmin = Math.min(vx, vy)
  return vmin * (1 / 8)
}

export function smooth(k: number, n = 2.5): number {
  return (k + 1) ** n - 1
}
