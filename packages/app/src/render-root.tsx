import { useContext, useRef } from 'react'
import { AppContext } from './app-context.js'
import styles from './app.module.scss'
import { RenderGrid } from './render-grid.js'
import { RenderWorld } from './render-world.js'
import { World } from './types.js'
import { useCamera } from './use-camera.js'
import { useCursor } from './use-cursor.js'
import { usePreventDefaults } from './use-prevent-defaults.js'
import { useViewport } from './use-viewport.js'

export function RenderRoot() {
  const { world } = useContext(AppContext)
  const svg = useRef<SVGSVGElement>(null)
  const [viewport, viewport$] = useViewport(svg)
  // eslint-disable-next-line
  const [_cursor, cursor$] = useCursor(svg, viewport$)
  const camera = useCamera(cursor$, viewport$)

  const viewBox = `0 0 ${viewport.x} ${viewport.y}`

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
