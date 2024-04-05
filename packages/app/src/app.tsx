import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import invariant from 'tiny-invariant'
import { Updater, useImmer } from 'use-immer'
import styles from './app.module.scss'
import { RenderGrid } from './render-grid.js'
import { RenderWorld } from './render-world.js'
import { World } from './types.js'
import { useCamera } from './use-camera.js'
import { useCursorEvents } from './use-cursor-events.js'
import { useCursor } from './use-cursor.js'
import { usePreventDefaults } from './use-prevent-defaults.js'
import { Vec2 } from './vec2.js'
import { initWorld, loadWorld, saveWorld } from './world.js'

export function App() {
  const svg = useRef<SVGSVGElement>(null)
  const viewport = useViewport(svg)
  const [world, setWorld] = useWorld()
  const [cursor, setCursor] = useCursor()
  const camera = useCamera(cursor, viewport)
  const viewBox = useViewBox(viewport)

  useTickWorld(setWorld)
  useCursorEvents(
    svg,
    camera.scale,
    viewport ?? Vec2.ZERO,
    setCursor,
  )
  usePreventDefaults(svg)

  return (
    <svg ref={svg} viewBox={viewBox} className={styles.app}>
      {viewport && (
        <>
          <RenderGrid viewport={viewport} camera={camera} />
          <RenderWorld
            viewport={viewport}
            camera={camera}
            world={world}
          />
        </>
      )}
      <text>{world.tick}</text>
    </svg>
  )
}

function useWorld(): [World, Updater<World>] {
  const initial = useMemo(() => {
    return loadWorld() ?? initWorld()
  }, [])
  const [world, setWorld] = useImmer(initial)
  useEffect(() => {
    saveWorld(world)
  }, [world])
  return [world, setWorld]
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

function useTickWorld(setWorld: Updater<World>): void {
  useEffect(() => {
    const intervalId = self.setInterval(() => {
      setWorld((world) => {
        world.tick += 1
      })
    }, 100)
    return () => {
      self.clearInterval(intervalId)
    }
  }, [])
}
