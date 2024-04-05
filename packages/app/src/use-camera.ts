import { useEffect, useMemo, useState } from 'react'
import { BehaviorSubject, combineLatest } from 'rxjs'
import { getScale } from './scale.js'
import { Camera, Cursor, Viewport } from './types.js'

export function useCamera(
  cursor$: BehaviorSubject<Cursor>,
  viewport$: BehaviorSubject<Viewport>,
): Camera {
  const target$ = useTarget$(cursor$, viewport$)
  const [camera, setCamera] = useState(target$.value)

  useEffect(() => {
    let handle: number
    function step() {
      setCamera((prev) => {
        if (target$.value === prev) {
          return prev
        }
        return target$.value
      })

      handle = self.requestAnimationFrame(step)
    }
    handle = self.requestAnimationFrame(step)
    return () => {
      self.cancelAnimationFrame(handle)
    }
  }, [])

  return camera
}

function useTarget$(
  cursor$: BehaviorSubject<Cursor>,
  viewport$: BehaviorSubject<Viewport>,
): BehaviorSubject<Camera> {
  const target$ = useMemo(
    () =>
      new BehaviorSubject({
        position: cursor$.value.position,
        scale: getScale(
          cursor$.value.zoom,
          viewport$.value.x,
          viewport$.value.y,
        ),
      }),
    [],
  )

  useEffect(() => {
    const sub = combineLatest([
      cursor$,
      viewport$,
    ]).subscribe(([cursor, viewport]) => {
      target$.next({
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

  return target$
}
