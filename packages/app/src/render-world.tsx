import React, { useMemo } from 'react'
import invariant from 'tiny-invariant'
import { NODE_BORDER_COLOR } from './const.js'
import { Camera, NodeType, World } from './types.js'
import { svgTransform } from './util.js'
import { Vec2 } from './vec2.js'

export interface RenderWorldProps {
  viewport: Vec2
  camera: Camera
  world: World
}

export function RenderWorld({
  viewport,
  camera,
  world,
}: RenderWorldProps) {
  const transform = useMemo(
    () =>
      svgTransform({
        translate: viewport
          .div(2)
          .sub(
            camera.position
              .map(({ x, y }) => ({ x, y: -y }))
              .mul(camera.scale),
          ),
        scale: new Vec2(1, -1),
      }),
    [viewport, camera],
  )

  return (
    <g data-inspect="world">
      <g transform={transform}>
        <RenderNodes
          nodes={world.nodes}
          rootNodeId={world.rootNodeId}
          scale={camera.scale}
        />
      </g>
    </g>
  )
}

interface RenderNodesProps {
  nodes: World['nodes']
  rootNodeId: World['rootNodeId']
  scale: number
}

const RenderNodes = React.memo(function RenderNodes({
  nodes,
  rootNodeId,
  scale,
}: RenderNodesProps) {
  const rootNode = nodes[rootNodeId]
  invariant(rootNode?.type === NodeType.enum.Root)

  const children = rootNode.childIds.map((id) => {
    const node = nodes[id]
    invariant(
      node?.type === NodeType.enum.Branch ||
        node?.type === NodeType.enum.Leaf,
    )
    return node
  })

  return (
    <g data-inspect="nodes">
      {children.map((node) => (
        <circle
          key={node.id}
          cx={node.position.x * scale}
          cy={node.position.y * scale}
          r={node.radius * scale}
          fill="red"
          strokeWidth={2}
          stroke={NODE_BORDER_COLOR}
        />
      ))}
    </g>
  )
})
