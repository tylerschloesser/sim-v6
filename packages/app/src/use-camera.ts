import { useEffect, useMemo, useState } from 'react'
import { BehaviorSubject, combineLatest } from 'rxjs'
import { ENABLE_SMOOTH_CAMERA, smooth } from './const.js'
import { getScale } from './scale.js'
import { Camera, Cursor, Viewport } from './types.js'
import { Vec2 } from './vec2.js'
import { Vec3 } from './vec3.js'

export function useCamera(
  cursor$: BehaviorSubject<Cursor>,
  viewport$: BehaviorSubject<Viewport>,
): Camera {
  const target$ = useTarget$(cursor$, viewport$)

  const source$ = useMemo(
    () => new BehaviorSubject<Vec3>(target$.value),
    [],
  )
  const [camera, setCamera] = useState<Camera>({
    position: new Vec2(source$.value.x, source$.value.y),
    scale: source$.value.z,
  })

  useTransition({ source$, target$ })

  useEffect(() => {
    const sub = (
      ENABLE_SMOOTH_CAMERA ? source$ : target$
    ).subscribe((value) => {
      setCamera({
        position: new Vec2(value.x, value.y),
        scale: value.z,
      })
    })
    return () => {
      sub.unsubscribe()
    }
  }, [])

  return camera
}

function useTransition({
  source$,
  target$,
}: {
  source$: BehaviorSubject<Vec3>
  target$: BehaviorSubject<Vec3>
}): void {
  useEffect(() => {
    if (!ENABLE_SMOOTH_CAMERA) {
      return
    }
    let handle: number
    let lastStep = self.performance.now()
    function step() {
      const now = self.performance.now()
      const elapsed = (now - lastStep) / 1000
      lastStep = now
      handle = self.requestAnimationFrame(step)

      const source = source$.value
      const target = target$.value

      if (source === target) {
        return
      }

      const d = target.sub(source)
      if (d.len() < 1e-3) {
        source$.next(target)
        return
      }

      const speed = smooth(d.len())
      source$.next(
        source.add(d.norm().mul(speed * elapsed)),
      )
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
): BehaviorSubject<Vec3> {
  const target$ = useMemo(
    () =>
      new BehaviorSubject<Vec3>(
        new Vec3(
          cursor$.value.position.x,
          cursor$.value.position.y,
          getScale(
            cursor$.value.zoom,
            viewport$.value.x,
            viewport$.value.y,
          ),
        ),
      ),
    [],
  )

  useEffect(() => {
    const sub = combineLatest([
      cursor$,
      viewport$,
    ]).subscribe(([cursor, viewport]) => {
      target$.next(
        new Vec3(
          cursor.position.x,
          cursor.position.y,
          getScale(cursor.zoom, viewport.x, viewport.y),
        ),
      )
    })
    return () => {
      sub.unsubscribe()
    }
  }, [])

  return target$
}
