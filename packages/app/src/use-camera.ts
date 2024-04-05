import { useMemo } from 'react'
import { getScale } from './const.js'
import { Camera, Cursor } from './types.js'
import { Vec2 } from './vec2.js'

export function useCamera(
  cursor: Cursor,
  viewport: Vec2 | null,
): Camera {
  return useMemo(() => {
    const position = cursor.position
    const scale = viewport
      ? getScale(cursor.zoom, viewport.x, viewport.y)
      : 1
    return { position, scale }
  }, [cursor, viewport])
}
