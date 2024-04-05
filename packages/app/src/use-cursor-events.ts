import { clamp } from 'lodash-es'
import React, { useEffect, useRef } from 'react'
import invariant from 'tiny-invariant'
import { MAX_ZOOM, MIN_ZOOM } from './const.js'
import { getScale } from './scale.js'
import { Cursor, PointerId, Viewport } from './types.js'
import { Vec2 } from './vec2.js'

export function useCursorEvents(
  root: React.RefObject<SVGElement>,
  scale: number,
  viewport: Viewport,
  setCursor: React.Dispatch<React.SetStateAction<Cursor>>,
): void {
  const scaleRef = useRef(scale)
  useEffect(() => {
    scaleRef.current = scale
  }, [scale])

  const viewportRef = useRef(viewport)
  useEffect(() => {
    viewportRef.current = viewport
  }, [viewport])

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
        handlePointerEvent(ev, cache, scaleRef, setCursor)
      },
      options,
    )

    root.current.addEventListener(
      'wheel',
      (ev) => {
        handleWheel(ev, viewportRef, setCursor)
      },
      options,
    )

    return () => {
      controller.abort()
    }
  }, [])
}

function handlePointerEvent(
  ev: PointerEvent,
  cache: Map<number, PointerEvent>,
  scaleRef: React.MutableRefObject<number>,
  setCursor: React.Dispatch<React.SetStateAction<Cursor>>,
): void {
  switch (ev.type) {
    case 'pointermove': {
      const prev = cache.get(ev.pointerId)
      cache.set(ev.pointerId, ev)
      if (!ev.buttons || !prev?.buttons) {
        break
      }
      handleOneFingerDrag(prev, ev, scaleRef, setCursor)
      break
    }
  }
}

function handleOneFingerDrag(
  prev: PointerEvent,
  next: PointerEvent,
  scaleRef: React.MutableRefObject<number>,
  setCursor: React.Dispatch<React.SetStateAction<Cursor>>,
): void {
  setCursor((cursor) => {
    const scale = scaleRef.current
    invariant(scale > 0)
    const dx = -(next.clientX - prev.clientX) / scale
    const dy = -(next.clientY - prev.clientY) / scale
    if (dx === 0 && dy === 0) {
      return cursor
    }
    return {
      position: cursor.position.add(new Vec2(dx, dy)),
      zoom: cursor.zoom,
    }
  })
}

function handleWheel(
  ev: WheelEvent,
  viewportRef: React.MutableRefObject<Viewport>,
  setCursor: React.Dispatch<React.SetStateAction<Cursor>>,
): void {
  setCursor((cursor) => {
    const prevZoom = cursor.zoom
    const nextZoom = clamp(
      prevZoom + -ev.deltaY / 1000,
      MIN_ZOOM,
      MAX_ZOOM,
    )

    if (prevZoom === nextZoom) {
      return cursor
    }

    const { x: vx, y: vy } = viewportRef.current
    const prevScale = getScale(prevZoom, vx, vy)
    const nextScale = getScale(nextZoom, vx, vy)

    // TODO does this work if canvas is not the full page?
    const rx = ev.clientX - vx / 2
    const ry = ev.clientY - vy / 2

    const dx = rx / prevScale - rx / nextScale
    const dy = ry / prevScale - ry / nextScale

    return {
      position: new Vec2(
        cursor.position.x + dx,
        cursor.position.y + dy,
      ),
      zoom: nextZoom,
    }
  })
}
