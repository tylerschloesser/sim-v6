import { clamp } from 'lodash-es'
import { useEffect, useMemo, useState } from 'react'
import React from 'react'
import { BehaviorSubject, tap } from 'rxjs'
import invariant from 'tiny-invariant'
import { MAX_ZOOM, MIN_ZOOM } from './const.js'
import { dist } from './math.js'
import {
  clampScale,
  getScale,
  scaleToZoom,
} from './scale.js'
import { Cursor, ZodCursor } from './types.js'
import { PointerId, Viewport } from './types.js'
import { Vec2 } from './vec2.js'

export function useCursor(
  root: React.RefObject<SVGElement>,
  viewport$: BehaviorSubject<Viewport>,
): [Cursor, BehaviorSubject<Cursor>] {
  const initial = useInitialCursor()
  const [cursor, setCursor] = useState<Cursor>(initial)
  const cursor$ = useMemo(
    () => new BehaviorSubject(cursor),
    [],
  )

  useEffect(() => {
    const sub = cursor$
      .pipe(
        tap((value) => {
          console.log(value.position)
        }),
      )
      .subscribe(setCursor)
    return () => {
      sub.unsubscribe()
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('cursor', JSON.stringify(cursor))
  }, [cursor])

  useEffect(() => {
    const cache = new Map<PointerId, PointerEvent>()

    const controller = new AbortController()
    const options: AddEventListenerOptions = {
      signal: controller.signal,
      passive: false,
    }
    invariant(root.current)

    // prettier-ignore
    {
      const listener = (ev: PointerEvent) => {
        handlePointerEvent(ev, cache, cursor$, viewport$)
      }
      root.current.addEventListener('pointerdown', listener, options)
      root.current.addEventListener('pointerenter', listener, options)
      root.current.addEventListener('pointerout', listener, options)
      root.current.addEventListener('pointerleave', listener, options)
      root.current.addEventListener('pointercancel', listener, options)
      root.current.addEventListener('pointermove', listener, options)
    }

    root.current.addEventListener(
      'wheel',
      (ev) => {
        handleWheelEvent(ev, cursor$, viewport$)
      },
      options,
    )

    return () => {
      controller.abort()
    }
  }, [])

  return [cursor, cursor$]
}

function useInitialCursor() {
  return useMemo(() => {
    const value = localStorage.getItem('cursor')
    if (value) {
      const zodCursor = ZodCursor.parse(JSON.parse(value))
      return {
        position: new Vec2(zodCursor.position),
        zoom: zodCursor.zoom,
      }
    }
    return {
      position: new Vec2(0, 0),
      zoom: 0.5,
    }
  }, [])
}

function handlePointerEvent(
  ev: PointerEvent,
  cache: Map<number, PointerEvent>,
  cursor$: BehaviorSubject<Cursor>,
  viewport$: BehaviorSubject<Viewport>,
): void {
  switch (ev.type) {
    case 'pointerout':
    case 'pointerleave':
    case 'pointercancel': {
      cache.delete(ev.pointerId)
      break
    }
    case 'pointerdown':
    case 'pointerenter': {
      cache.set(ev.pointerId, ev)
      break
    }
    case 'pointermove': {
      const prev = cache.get(ev.pointerId)
      cache.set(ev.pointerId, ev)
      if (!ev.buttons || !prev?.buttons) {
        break
      }
      switch (cache.size) {
        case 1: {
          handleOneFingerDrag(prev, ev, cursor$, viewport$)
          break
        }
        case 2: {
          const other = Array.from(cache.values()).find(
            ({ pointerId }) => ev.pointerId !== pointerId,
          )
          // we only expect this to happen on mobile
          invariant(other?.buttons)
          handleTwoFingerDrag(
            prev,
            ev,
            other,
            cursor$,
            viewport$,
          )
          break
        }
      }
      break
    }
  }
}

function handleOneFingerDrag(
  prev: PointerEvent,
  next: PointerEvent,
  cursor$: BehaviorSubject<Cursor>,
  viewport$: BehaviorSubject<Viewport>,
): void {
  const cursor = cursor$.value
  const { x: vx, y: vy } = viewport$.value
  const scale = getScale(cursor.zoom, vx, vy)

  const dx = -(next.clientX - prev.clientX) / scale
  const dy = -(next.clientY - prev.clientY) / scale
  if (dx === 0 && dy === 0) {
    return
  }
  cursor$.next({
    position: cursor.position.add(new Vec2(dx, dy)),
    zoom: cursor.zoom,
  })
}

function handleTwoFingerDrag(
  prev: PointerEvent,
  next: PointerEvent,
  other: PointerEvent,
  cursor$: BehaviorSubject<Cursor>,
  viewport$: BehaviorSubject<Viewport>,
): void {
  const ox = other.clientX
  const oy = other.clientY
  const px = prev.clientX
  const py = prev.clientY
  const nx = next.clientX
  const ny = next.clientY

  // center of the line between both pointers
  const pcx = ox + (px - ox) / 2
  const pcy = oy + (py - oy) / 2
  const ncx = ox + (nx - ox) / 2
  const ncy = oy + (ny - oy) / 2

  // distance between both pointers
  const pd = dist(px, py, ox, oy)
  const nd = dist(nx, ny, ox, oy)

  const { x: vx, y: vy } = viewport$.value
  const prevScale = getScale(cursor$.value.zoom, vx, vy)
  // prettier-ignore
  const nextScale = clampScale(prevScale * (nd / pd), vx, vy)

  // how far did the center move, aka how much to move
  // the camera in addition to the change in tile size
  const dcx = ncx - pcx
  const dcy = ncy - pcy

  // the point, relative to the center of the screen,
  // at which the change in position due to change
  // in tile size
  const rx = ncx - vx / 2
  const ry = ncy - vy / 2

  // final camera movement
  const dx = rx / prevScale - (rx + dcx) / nextScale
  const dy = ry / prevScale - (ry + dcy) / nextScale

  cursor$.next({
    position: new Vec2({
      x: cursor$.value.position.x + dx,
      y: cursor$.value.position.y + dy,
    }),
    zoom: scaleToZoom(nextScale, vx, vy),
  })
}

function handleWheelEvent(
  ev: WheelEvent,
  cursor$: BehaviorSubject<Cursor>,
  viewport$: BehaviorSubject<Viewport>,
): void {
  const prevZoom = cursor$.value.zoom
  const nextZoom = clamp(
    prevZoom + -ev.deltaY / 1000,
    MIN_ZOOM,
    MAX_ZOOM,
  )

  if (prevZoom === nextZoom) {
    return
  }

  const { x: vx, y: vy } = viewport$.value
  const prevScale = getScale(prevZoom, vx, vy)
  const nextScale = getScale(nextZoom, vx, vy)

  // TODO does this work if canvas is not the full page?
  const rx = ev.clientX - vx / 2
  const ry = ev.clientY - vy / 2

  const dx = rx / prevScale - rx / nextScale
  const dy = ry / prevScale - ry / nextScale

  cursor$.next({
    position: new Vec2(
      cursor$.value.position.x + dx,
      cursor$.value.position.y + dy,
    ),
    zoom: nextZoom,
  })
}
