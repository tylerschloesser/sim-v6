import React from 'react'
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
  return <g data-inspect="world"></g>
})
