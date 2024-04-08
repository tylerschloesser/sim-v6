import { sum } from 'lodash-es'
import invariant from 'tiny-invariant'
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
      connections: {},
      population: 10,
      storage: {
        food: {
          count: 100,
          delta: 0,
        },
        wood: {
          count: 10,
          delta: 0,
        },
      },
      priority: {
        food: 1,
        wood: 1,
        build: 1,
      },
      builds: [],
    }
    entities[entity.id] = entity
  }

  {
    const entity: FoodSourceEntity = {
      id: `${nextEntityId++}`,
      type: EntityType.enum.FoodSource,
      connections: {},

      minYield: 0.5,
      maxYield: 1,
      maxYieldTicks: 10 * 60,
      tick: 0,
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

export function getFinalPriority(
  key: keyof TownEntity['priority'],
  entity: TownEntity,
): number {
  const totalPriority = sum(Object.values(entity.priority))

  if (totalPriority === 0) {
    return 0
  }

  const finalPriority = entity.priority[key] / totalPriority

  invariant(finalPriority >= 0)
  invariant(finalPriority <= 1)

  return finalPriority
}

export function getCurrentYield(
  entity: FoodSourceEntity,
): number {
  invariant(entity.tick <= entity.maxYieldTicks)
  const progress = entity.tick
    ? entity.tick / entity.maxYieldTicks
    : 0

  invariant(entity.minYield <= entity.maxYield)
  const currentYield =
    entity.minYield +
    (entity.maxYield - entity.minYield) * progress

  invariant(currentYield >= 0)
  invariant(currentYield <= 1)

  return currentYield
}
