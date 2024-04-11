import { sum } from 'lodash-es'
import invariant from 'tiny-invariant'
import {
  BranchNode,
  EntityId,
  EntityType,
  NodeType,
  ResourceEntity,
  ResourceType,
  RootNode,
  TownEntity,
  World,
  ZodVec2,
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
      position: { x: 0, y: 0 },

      population: 10,
      averageAge: 20,
      nextChildTicks: 10 * 60,

      houses: 0,
      storage: {
        food: 100,
        wood: 10,
        stone: 0,
      },
      priority: {
        food: 0,
        wood: 0,
        stone: 0,
        build: 0,
        research: 0,
      },
      builds: [],
      researchQueue: [],
      technologies: {},
    }
    entities[entity.id] = entity
  }

  addResourceEntity(
    entities,
    `${nextEntityId++}`,
    { x: 1, y: 0 },
    ResourceType.enum.Food,
  )

  addResourceEntity(
    entities,
    `${nextEntityId++}`,
    { x: 1, y: 1 },
    ResourceType.enum.Wood,
  )

  addResourceEntity(
    entities,
    `${nextEntityId++}`,
    { x: 2, y: 3 },
    ResourceType.enum.Stone,
  )

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

export function getNormalizedPriority(
  priority: TownEntity['priority'],
): TownEntity['priority'] {
  const total = sum(Object.values(priority))
  if (total === 0) {
    return priority
  }
  invariant(total > 0)
  const normalized: TownEntity['priority'] = { ...priority }
  for (const key of Object.keys(
    normalized,
  ) as (keyof TownEntity['priority'])[]) {
    normalized[key] /= total
    invariant(normalized[key] >= 0)
    invariant(normalized[key] <= 1)
  }
  return normalized
}

export function getCurrentYield(
  entity: ResourceEntity,
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

export const HOUSE_BUILD_WOOD = 8

export function canBuildHouse(entity: TownEntity): boolean {
  return entity.storage.wood >= HOUSE_BUILD_WOOD
}

function addResourceEntity(
  entities: World['entities'],
  id: EntityId,
  position: ZodVec2,
  resourceType: ResourceType,
): void {
  const entity: ResourceEntity = {
    id,
    type: EntityType.enum.Resource,
    connections: {},
    position,

    resourceType,

    minYield: 0.5,
    maxYield: 1,
    maxYieldTicks: 10 * 60,
    tick: 0,
  }
  entities[entity.id] = entity
}
