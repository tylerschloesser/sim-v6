import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import invariant from 'tiny-invariant'
import { Updater, useImmer } from 'use-immer'
import styles from './app.module.scss'
import { getScale } from './const.js'
import { RenderGrid } from './render-grid.js'
import {
  CellType,
  Drag,
  Input,
  InputType,
  World,
} from './types.js'
import { useCamera } from './use-camera.js'
import { useCursor } from './use-cursor.js'
import { useInput } from './use-input.js'
import { usePointerEvents } from './use-pointer-events.js'
import { svgTransform, svgTranslate } from './util.js'
import { Vec2 } from './vec2.js'
import { initWorld } from './world.js'

function useWorld(): [World, Updater<World>] {
  const initial = useMemo(() => {
    const value = localStorage.getItem('world')
    if (value) {
      return World.parse(JSON.parse(value))
    }
    return initWorld()
  }, [])
  const [world, setWorld] = useImmer(initial)
  useEffect(() => {
    localStorage.setItem('world', JSON.stringify(world))
  }, [world])
  return [world, setWorld]
}

function useScale(
  viewport: Vec2 | null,
): [number | null, React.MutableRefObject<number>] {
  const scale = useMemo(
    () => getScale(viewport),
    [viewport],
  )
  const scaleRef = useRef(1)
  useEffect(() => {
    if (typeof scale === 'number') {
      invariant(scale > 0)
      scaleRef.current = scale
    }
  }, [scale])
  return [scale, scaleRef]
}

function useViewport(
  root: React.RefObject<Element>,
): Vec2 | null {
  const [viewport, setViewport] = useState<Vec2 | null>(
    null,
  )
  useEffect(() => {
    invariant(root.current)
    const ro = new ResizeObserver((entries) => {
      invariant(entries.length === 1)
      const { contentRect: rect } = entries.at(0)!
      setViewport(new Vec2(rect.width, rect.height))
    })
    ro.observe(root.current)
    return () => {
      ro.disconnect()
    }
  }, [])
  return viewport
}

function useViewBox(
  viewport: Vec2 | null,
): string | undefined {
  return useMemo(
    () =>
      viewport
        ? `0 0 ${viewport.x} ${viewport.y}`
        : undefined,
    [viewport],
  )
}

export function App() {
  const svg = useRef<SVGSVGElement>(null)
  const viewport = useViewport(svg)
  const [scale, scaleRef] = useScale(viewport)
  const [world] = useWorld()
  const [drag] = useImmer<Drag | null>(null)
  const input = useInput(scale, drag)
  const [cursor, setCursor] = useCursor()
  const camera = useCamera(cursor)
  const viewBox = useViewBox(viewport)

  usePointerEvents(svg, setCursor, scaleRef)
  usePreventDefaults(svg)

  return (
    <svg
      ref={svg}
      viewBox={viewBox}
      className={styles.app}
      data-scale={scale}
    >
      {viewport && scale && (
        <>
          <RenderGrid
            viewport={viewport}
            camera={camera}
            scale={scale}
          />
          <g
            transform={svgTransform({
              translate: viewport
                .div(2)
                .sub(
                  new Vec2(camera.x, camera.y * -1).mul(
                    scale,
                  ),
                ),
              scale: new Vec2(1, -1),
            })}
          >
            <RenderCells scale={scale} world={world} />
          </g>

          <RenderDrag drag={drag} viewport={viewport} />
          <RenderInput input={input} scale={scale} />
        </>
      )}
    </svg>
  )
}

function* iterateCells(world: World): Generator<{
  id: string
  type: CellType
  x: number
  y: number
  color: string
}> {
  for (const [key, value] of Object.entries(world.cells)) {
    const match = key.match(/^(-?\d+)\.(-?\d+)$/)
    invariant(match?.length === 3)
    const x = parseInt(match.at(1)!)
    const y = parseInt(match.at(2)!)
    const { color, type } = value
    const id = key
    yield { id, type, x, y, color }
  }
}

function usePreventDefaults(
  svg: React.RefObject<SVGSVGElement>,
): void {
  useEffect(() => {
    const controller = new AbortController()
    const options: AddEventListenerOptions = {
      signal: controller.signal,
      passive: false,
    }
    function listener(ev: Event) {
      ev.preventDefault()
    }
    invariant(svg.current)
    // prettier-ignore
    {
      // disable the bounce on desktop
      svg.current.addEventListener('wheel', listener, options)

      // disable the swipe back/forward navigation on mobile
      svg.current.addEventListener('touchcancel', listener, options)
      svg.current.addEventListener('touchend', listener, options)
      svg.current.addEventListener('touchstart', listener, options)
    }
    return () => {
      controller.abort()
    }
  }, [])
}

interface RenderCellsProps {
  scale: number
  world: World
}
function RenderCells({ scale, world }: RenderCellsProps) {
  return (
    <g>
      {Array.from(iterateCells(world)).map(
        ({ id, x, y, color }) => (
          <rect
            key={id}
            x={x * scale}
            y={y * scale}
            width={scale}
            height={scale}
            fill={color}
          />
        ),
      )}
    </g>
  )
}

interface SmoothRectProps {
  scale: number
  translate: Vec2
  x: number
  y: number
  width: number
  height: number
}

function useMemoizedTranslate(
  props: Pick<SmoothRectProps, 'translate'>,
): Vec2 {
  const translate = useRef<Vec2>(props.translate)
  if (!translate.current.equals(props.translate)) {
    translate.current = props.translate
  }
  return translate.current
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function SmoothRect({
  scale,
  x,
  y,
  width,
  height,
  ...props
}: SmoothRectProps) {
  // memoize translate to simplify the effect below
  const translate = useMemoizedTranslate(props)
  const [current, setCurrent] = useState(translate)

  const lastStep = useRef<number>(self.performance.now())
  useEffect(() => {
    let handle: number
    function step() {
      const now = self.performance.now()
      const elapsed = (now - lastStep.current) / 1000
      lastStep.current = now

      setCurrent((prev) => {
        if (prev === translate) {
          return prev
        }

        const dir = translate.sub(prev)

        const speed = Math.max(
          (dir.len() * 0.25 + 1) ** 1.25 - 1,
          // need some min speed threshold so that we eventually stop
          1e-6,
        )

        const velocity = dir.norm().mul(scale * speed)
        const delta = velocity.mul(elapsed)

        if (delta.len() >= dir.len()) {
          return translate
        }

        return prev.add(delta)
      })
      handle = self.requestAnimationFrame(step)
    }
    handle = self.requestAnimationFrame(step)
    return () => {
      self.cancelAnimationFrame(handle)
    }
  }, [translate, scale])

  return (
    <rect
      transform={svgTranslate(current)}
      x={x}
      y={y}
      width={width}
      height={height}
    />
  )
}

interface RenderInputProps {
  input: Input | null
  scale: number
}
function RenderInput({ input, scale }: RenderInputProps) {
  if (input === null) {
    return null
  }

  const angle = input.v.angle()

  return (
    <>
      {input.type === InputType.Move && (
        <text
          fontSize={16}
          fontFamily="system-ui"
          fill="white"
          x="100%"
          y="16"
          textAnchor="end"
        >
          {`speed: ${input.v.len().toFixed(2)}`}
        </text>
      )}
      <g
        stroke="red"
        fill="transparent"
        transform={`translate(${scale} ${scale})`}
      >
        <circle cx={0} cy={0} r={scale / 2} />
        <circle
          cx={0}
          cy={0}
          transform={`rotate(${angle}) translate(${scale / 2 + (scale / 10) * 2} 0)`}
          r={scale / 10}
        />
      </g>
    </>
  )
}

interface RenderDragProps {
  drag: Drag | null
  viewport: Vec2
}
function RenderDrag({ drag, viewport }: RenderDragProps) {
  if (drag === null || drag.end === null) {
    return null
  }
  const {
    start: { position: start },
    end: { position: end },
  } = drag
  const vmin = Math.min(viewport.x, viewport.y)
  const r = vmin / 20
  if (!start) return null
  return (
    <>
      <g stroke="blue" fill="transparent">
        {end && (
          <line
            x1={start.x}
            y1={start.y}
            x2={end.x}
            y2={end.y}
          />
        )}
        <circle cx={start.x} cy={start.y} r={r} />
        {end && <circle cx={end.x} cy={end.y} r={r} />}
      </g>
    </>
  )
}
