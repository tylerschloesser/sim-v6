import { useEffect, useMemo, useRef } from 'react'
import { Updater, useImmer } from 'use-immer'
import styles from './app.module.scss'
import { RenderGrid } from './render-grid.js'
import { RenderWorld } from './render-world.js'
import { World } from './types.js'
import { useCamera } from './use-camera.js'
import { useCursor } from './use-cursor.js'
import { usePreventDefaults } from './use-prevent-defaults.js'
import { useViewport } from './use-viewport.js'
import { initWorld, loadWorld, saveWorld } from './world.js'

export function App() {
  const svg = useRef<SVGSVGElement>(null)
  const [viewport, viewport$] = useViewport(svg)
  const [world, setWorld] = useWorld()
  const cursor = useCursor(svg, viewport$)
  const camera = useCamera(cursor, viewport)

  const viewBox = `0 0 ${viewport.x} ${viewport.y}`

  useTickWorld(setWorld)
  usePreventDefaults(svg)

  return (
    <svg ref={svg} viewBox={viewBox} className={styles.app}>
      <>
        <RenderGrid viewport={viewport} camera={camera} />
        <RenderWorld
          viewport={viewport}
          camera={camera}
          world={world}
        />
      </>
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
