import { useEffect, useMemo, useState } from 'react'
import { BehaviorSubject } from 'rxjs'
import invariant from 'tiny-invariant'
import { Viewport } from './types.js'
import { Vec2 } from './vec2.js'

export function useViewport(
  root: React.RefObject<Element>,
): [Viewport, BehaviorSubject<Viewport>] {
  const initial = useInitialViewport()
  // prettier-ignore
  const [viewport, setViewport] = useState<Viewport>(initial)
  // prettier-ignore
  const viewport$ = useMemo(() => new BehaviorSubject(viewport), [])

  invariant(viewport.x > 0)
  invariant(viewport.y > 0)

  useEffect(() => {
    invariant(root.current)
    const ro = new ResizeObserver((entries) => {
      invariant(entries.length === 1)
      const { contentRect: rect } = entries.at(0)!
      viewport$.next(new Vec2(rect.width, rect.height))
    })
    ro.observe(root.current)
    return () => {
      ro.disconnect()
    }
  }, [])

  useEffect(() => {
    const sub = viewport$.subscribe(setViewport)
    return () => {
      sub.unsubscribe()
    }
  }, [])

  return [viewport, viewport$]
}

function useInitialViewport(): Vec2 {
  return useMemo(() => {
    return new Vec2(window.innerWidth, window.innerHeight)
  }, [])
}
