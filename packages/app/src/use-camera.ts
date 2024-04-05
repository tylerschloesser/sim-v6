import { useEffect, useMemo, useState } from 'react'
import { getScale } from './scale.js'
import { Camera, Cursor } from './types.js'
import { Vec2 } from './vec2.js'

export function useCamera(
  cursor: Cursor,
  viewport: Vec2,
): Camera {
  const initial = useInitialCamera(cursor, viewport)
  const [camera, setCamera] = useState(initial)

  useEffect(() => {
    setCamera({
      position: cursor.position,
      scale: getScale(cursor.zoom, viewport.x, viewport.y),
    })
  }, [cursor, viewport])

  return camera
}

function useInitialCamera(cursor: Cursor, viewport: Vec2) {
  return useMemo(
    () => ({
      position: cursor.position,
      scale: getScale(cursor.zoom, viewport.x, viewport.y),
    }),
    [],
  )
}
