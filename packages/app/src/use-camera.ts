import { useEffect, useMemo, useState } from 'react'
import { BehaviorSubject, combineLatest } from 'rxjs'
import { getScale } from './scale.js'
import { Camera, Cursor, Viewport } from './types.js'
import { Vec2 } from './vec2.js'

export function useCamera(
  cursor$: BehaviorSubject<Cursor>,
  viewport$: BehaviorSubject<Viewport>,
): Camera {
  const initial = useInitialCamera(
    cursor$.value,
    viewport$.value,
  )
  const [camera, setCamera] = useState(initial)

  useEffect(() => {
    const sub = combineLatest([
      cursor$,
      viewport$,
    ]).subscribe(([cursor, viewport]) => {
      setCamera({
        position: cursor.position,
        scale: getScale(
          cursor.zoom,
          viewport.x,
          viewport.y,
        ),
      })
    })
    return () => {
      sub.unsubscribe()
    }
  }, [])

  useEffect(() => {
    let handle: number
    function step() {
      handle = self.requestAnimationFrame(step)
    }
    handle = self.requestAnimationFrame(step)
    return () => {
      self.cancelAnimationFrame(handle)
    }
  }, [])

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
