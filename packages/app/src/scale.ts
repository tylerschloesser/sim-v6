import invariant from 'tiny-invariant'
import { MAX_ZOOM, MIN_ZOOM } from './const.js'

export function getMinScale(
  vx: number,
  vy: number,
): number {
  const vmin = Math.min(vx, vy)
  const minScale = vmin * 0.025
  return minScale
}

export function getMaxScale(
  vx: number,
  vy: number,
): number {
  const vmin = Math.min(vx, vy)
  const maxScale = vmin * 0.1
  return maxScale
}

export function getScale(
  zoom: number,
  vx: number,
  vy: number,
): number {
  invariant(zoom >= MIN_ZOOM)
  invariant(zoom <= MAX_ZOOM)

  const minScale = getMinScale(vx, vy)
  const maxScale = getMaxScale(vx, vy)
  return minScale + (maxScale - minScale) * zoom
}
