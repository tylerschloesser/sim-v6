import { clamp } from 'lodash-es'
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

export function clampScale(
  scale: number,
  vx: number,
  vy: number,
): number {
  const minScale = getMinScale(vx, vy)
  const maxScale = getMaxScale(vx, vy)
  return clamp(scale, minScale, maxScale)
}

export function scaleToZoom(
  scale: number,
  vx: number,
  vy: number,
): number {
  const minScale = getMinScale(vx, vy)
  const maxScale = getMaxScale(vx, vy)
  const zoom = (scale - minScale) / (maxScale - minScale)
  return clampZoom(zoom)
}

export function clampZoom(zoom: number): number {
  return clamp(zoom, 0, 1)
}
