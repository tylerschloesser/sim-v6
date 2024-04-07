import {
  BranchNode,
  EntityType,
  FoodSourceEntity,
  NodeType,
  RootNode,
  TownEntity,
  World,
} from './types.js'

export function initWorld(): World {
  const tick = 1

  let nextNodeId = 0

  const rootNode: RootNode = {
    type: NodeType.enum.Root,
    id: `${nextNodeId++}`,
    childIds: [],
  }

  const initialBranchNode: BranchNode = {
    type: NodeType.enum.Branch,
    id: `${nextNodeId++}`,
    parentId: rootNode.id,
    childIds: [],
    position: { x: 0, y: 0 },
    radius: 1.5,
  }
  rootNode.childIds.push(initialBranchNode.id)

  const nodes: World['nodes'] = {
    [rootNode.id]: rootNode,
    [initialBranchNode.id]: initialBranchNode,
  }

  let nextEntityId: number = 0
  const entities: World['entities'] = {}

  {
    const entity: TownEntity = {
      id: `${nextEntityId++}`,
      type: EntityType.enum.Town,
      population: 10,
    }
    entities[entity.id] = entity
  }

  {
    const entity: FoodSourceEntity = {
      id: `${nextEntityId++}`,
      type: EntityType.enum.FoodSource,
    }
    entities[entity.id] = entity
  }

  return {
    tick,
    nodes,
    rootNodeId: rootNode.id,
    nextNodeId,
    entities,
    nextEntityId,
  }
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
