import { useEffect, useMemo, useState } from 'react'
import { BehaviorSubject, combineLatest } from 'rxjs'
import { smooth } from './const.js'
import { getScale } from './scale.js'
import { Camera, Cursor, Viewport } from './types.js'

type Target = Camera & { wheel: boolean }

export function useCamera(
  cursor$: BehaviorSubject<Cursor>,
  viewport$: BehaviorSubject<Viewport>,
): Camera {
  const target$ = useTarget$(cursor$, viewport$)
  const camera$ = useMemo(
    () => new BehaviorSubject<Camera>(target$.value),
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
  target$: BehaviorSubject<Target>,
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
      if (!target.wheel) {
        const d = target.position.sub(camera.position)
        if (d.len() > 1e-3) {
          const speed = smooth(d.len(), 3)
          position = camera.position.add(
            d.norm().mul(speed * elapsed),
          )
        }
      }

      let scale = target.scale
      if (!target.wheel) {
        const d = target.scale - camera.scale
        if (Math.abs(d) > 1e-3) {
          const speed =
            smooth(Math.abs(d), 3) * Math.sign(d)
          scale = camera.scale + speed * elapsed
        }
      }

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
): BehaviorSubject<Target> {
  const target$ = useMemo(
    () =>
      new BehaviorSubject({
        position: cursor$.value.position,
        scale: getScale(
          cursor$.value.zoom,
          viewport$.value.x,
          viewport$.value.y,
        ),
        wheel: cursor$.value.wheel,
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
        wheel: cursor.wheel,
      })
    })
    return () => {
      sub.unsubscribe()
    }
  }, [])

  return target$
}
