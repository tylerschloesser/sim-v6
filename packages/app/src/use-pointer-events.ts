import React, { useEffect } from 'react'
import invariant from 'tiny-invariant'
import { PointerId } from './types.js'

export function usePointerEvents(
  svg: React.RefObject<SVGSVGElement>,
): void {
  useEffect(() => {
    const cache = new Map<PointerId, PointerEvent>()

    const controller = new AbortController()
    const options: AddEventListenerOptions = {
      signal: controller.signal,
      passive: false,
    }
    invariant(svg.current)

    svg.current.addEventListener(
      'pointermove',
      (ev) => {
        const prev = cache.get(ev.pointerId)
        cache.set(ev.pointerId, ev)
      },
      options,
    )
  }, [])
}
