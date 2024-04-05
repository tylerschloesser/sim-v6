import { useEffect, useMemo, useState } from 'react'
import { BehaviorSubject, combineLatest } from 'rxjs'
import { smooth } from './const.js'
import { getScale } from './scale.js'
import { Camera, Cursor, Viewport } from './types.js'

export function useCamera(
  cursor$: BehaviorSubject<Cursor>,
  viewport$: BehaviorSubject<Viewport>,
): Camera {
  const target$ = useTarget$(cursor$, viewport$)
  const camera$ = useMemo(
    () => new BehaviorSubject(target$.value),
    [],
  )
  const [camera, setCamera] = useState(camera$.value)

  useTransition(target$, camera$)

  useEffect(() => {
    const sub = camera$.subscribe(setCamera)
    return () => {
      sub.unsubscribe()
    }
  }, [])

  return camera
}

function useTransition(
  target$: BehaviorSubject<Camera>,
  camera$: BehaviorSubject<Camera>,
): void {
  useEffect(() => {
    let handle: number
    let lastStep = self.performance.now()
    function step() {
      const now = self.performance.now()
      const elapsed = (now - lastStep) / 1000
      lastStep = now
      handle = self.requestAnimationFrame(step)

      const target = target$.value
      const camera = camera$.value

      if (target === camera) {
        return
      }

      let position = target.position
      {
        const d = target.position.sub(camera.position)
        if (d.len() > 1e-3) {
          const speed = smooth(d.len(), 3)
          position = camera.position.add(
            d.norm().mul(speed * elapsed),
          )
        }
      }

      // const dScale = target$.value.scale - prev.scale
      const scale = target$.value.scale

      if (
        position === target.position &&
        scale === target.scale
      ) {
        camera$.next(target)
      } else {
        camera$.next({ position, scale })
      }
    }
    handle = self.requestAnimationFrame(step)
    return () => {
      self.cancelAnimationFrame(handle)
    }
  }, [])
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
