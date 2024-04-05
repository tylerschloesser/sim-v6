import React from 'react'
import { svgTransform } from './util.js'
import { Vec2 } from './vec2.js'

export interface RenderWorldProps {
  viewport: Vec2
  camera: Vec2
  scale: number
}

export const RenderWorld = React.memo(function RenderWorld({
  viewport,
  camera,
  scale,
}: RenderWorldProps) {
  const transform = svgTransform({
    translate: viewport
      .div(2)
      .sub(new Vec2(camera.x, camera.y * -1).mul(scale)),
    scale: new Vec2(1, -1),
  })
  return (
    <g data-inspect="world">
      <g transform={transform}></g>
    </g>
  )
})
