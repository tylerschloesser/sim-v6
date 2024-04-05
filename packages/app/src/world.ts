import { NodeType, RootNode, World } from './types.js'

export function initWorld(): World {
  const tick = 1

  let nextNodeId = 0

  const rootNodeId = `${nextNodeId++}`
  const rootNode: RootNode = {
    type: NodeType.enum.Root,
    id: rootNodeId,
    childIds: [],
  }

  const nodes: World['nodes'] = {
    [rootNode.id]: rootNode,
  }

  return { tick, nodes, rootNodeId, nextNodeId }
}

export function loadWorld(): World | null {
  const item = localStorage.getItem('world')
  if (item) {
    return World.parse(JSON.parse(item))
  }
  return null
}

export function saveWorld(world: World): void {
  localStorage.setItem('world', JSON.stringify(world))
}
