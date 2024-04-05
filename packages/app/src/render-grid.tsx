import React, { useMemo } from 'react'
import { GRID_LINE_COLOR, SHOW_GRID } from './const.js'
import { Camera } from './types.js'
import { svgTranslate } from './util.js'
import { Vec2 } from './vec2.js'

export interface RenderGridProps {
  viewport: Vec2
  camera: Camera
}

export const RenderGrid = React.memo(function RenderGrid({
  viewport,
  camera,
}: RenderGridProps) {
  const { scale } = camera
  const gridLines = useMemo(
    () => Array.from(iterateGridLines(viewport, scale)),
    [viewport, scale],
  )
  const transform = svgTranslate(
    viewport
      .div(2)
      .sub(
        camera.position
          .map(({ x, y }) => ({ x, y: -y }))
          .mul(scale),
      )
      .mod(scale)
      .sub(scale),
  )
  return (
    <g data-inspect="grid">
      <g
        visibility={SHOW_GRID ? undefined : 'hidden'}
        transform={transform}
        strokeWidth={2}
        stroke={GRID_LINE_COLOR}
      >
        <RenderGridLines gridLines={gridLines} />
      </g>
    </g>
  )
})

interface GridLine {
  key: string
  x1: number
  y1: number
  x2: number
  y2: number
}

interface RenderGridLinesProps {
  gridLines: GridLine[]
}

/* eslint-disable react/prop-types */
const RenderGridLines = React.memo(
  function RenderGridLines({
    gridLines,
  }: RenderGridLinesProps) {
    return gridLines.map(({ key, x1, y1, x2, y2 }) => (
      <line
        key={key}
        x1={x1.toFixed(2)}
        y1={y1.toFixed(2)}
        x2={x2.toFixed(2)}
        y2={y2.toFixed(2)}
      />
    ))
  },
)
/* eslint-enable react/prop-types */

function* iterateGridLines(
  viewport: Vec2,
  scale: number,
): Generator<GridLine> {
  const rows = Math.ceil(viewport.y / scale) + 1
  const cols = Math.ceil(viewport.x / scale) + 1

  let key = 0

  for (let row = 0; row <= rows; row++) {
    const x1 = 0
    const y1 = row * scale
    const x2 = cols * scale
    const y2 = y1
    // prettier-ignore
    yield { key: `${key++}`, x1, y1, x2, y2 }
  }

  for (let col = 0; col <= cols; col++) {
    const x1 = col * scale
    const y1 = 0
    const x2 = x1
    const y2 = rows * scale
    // prettier-ignore
    yield { key: `${key++}`, x1, y1, x2, y2 }
  }
}
