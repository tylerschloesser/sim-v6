import React, { useEffect, useRef } from 'react'
import invariant from 'tiny-invariant'
import { Cursor, PointerId } from './types.js'
import { Vec2 } from './vec2.js'

export function usePointerEvents(
  root: React.RefObject<SVGElement>,
  scale: number,
  setCursor: React.Dispatch<React.SetStateAction<Cursor>>,
): void {
  const scaleRef = useRef(scale)
  useEffect(() => {
    scaleRef.current = scale
  }, [scale])

  useEffect(() => {
    const cache = new Map<PointerId, PointerEvent>()

    const controller = new AbortController()
    const options: AddEventListenerOptions = {
      signal: controller.signal,
      passive: false,
    }
    invariant(root.current)

    root.current.addEventListener(
      'pointermove',
      (ev) => {
        const prev = cache.get(ev.pointerId)
        cache.set(ev.pointerId, ev)
        if (!ev.buttons || !prev?.buttons) {
          return
        }
        const next = ev

        const scale = scaleRef.current
        invariant(scale > 0)
        const dx = (next.clientX - prev.clientX) / scale
        const dy = (next.clientY - prev.clientY) / scale
        if (dx === 0 && dy === 0) {
          return
        }
        setCursor(({ position, zoom }) => ({
          position: position.add(new Vec2(-dx, dy)),
          zoom,
        }))
      },
      options,
    )

    return () => {
      controller.abort()
    }
  }, [])
}
