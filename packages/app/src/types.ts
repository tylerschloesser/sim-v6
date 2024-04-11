import * as z from 'zod'
import { Vec2 } from './vec2.js'

export type PointerId = number

export type Viewport = Vec2

export const ZodVec2 = z.strictObject({
  x: z.number(),
  y: z.number(),
})
export type ZodVec2 = z.infer<typeof ZodVec2>

export interface Cursor {
  position: Vec2
  zoom: number
}

export const ZodCursor = z.strictObject({
  position: ZodVec2,
  zoom: z.number().min(0).max(1),
})
export type ZodCursor = z.infer<typeof ZodCursor>

export interface Camera {
  position: Vec2
  scale: number
}

const NodeRadius = z.number().positive()

export const NodeType = z.enum(['Root', 'Branch', 'Leaf'])
export type NodeType = z.infer<typeof NodeType>

export const NodeId = z.string()
export type NodeId = z.infer<typeof NodeId>

export const LeafNode = z.strictObject({
  type: z.literal(NodeType.enum.Leaf),
  id: NodeId,
  parentId: NodeId,

  position: ZodVec2,
  radius: NodeRadius,
})
export type LeafNode = z.infer<typeof LeafNode>

export const BranchNode = z.strictObject({
  type: z.literal(NodeType.enum.Branch),
  id: NodeId,
  parentId: NodeId,
  childIds: NodeId.array(),

  position: ZodVec2,
  radius: NodeRadius,
})
export type BranchNode = z.infer<typeof BranchNode>

export const RootNode = z.strictObject({
  type: z.literal(NodeType.enum.Root),
  id: NodeId,
  childIds: NodeId.array(),
})
export type RootNode = z.infer<typeof RootNode>

export const Node = z.discriminatedUnion('type', [
  LeafNode,
  BranchNode,
  RootNode,
])
export type Node = z.infer<typeof Node>

export const EntityId = z.string()
export type EntityId = z.infer<typeof EntityId>

export const ResourceType = z.enum([
  'Food',
  'Wood',
  'Stone',
])
export type ResourceType = z.infer<typeof ResourceType>

export const EntityType = z.enum(['Town', 'Resource'])
export type EntityType = z.infer<typeof EntityType>

export const BuildType = z.enum(['House'])
export type BuildType = z.infer<typeof BuildType>

export const HouseBuild = z.strictObject({
  type: z.literal(BuildType.enum.House),
  entityId: EntityId,
  progress: z.number().gte(0).lt(1),
})
export type HouseBuild = z.infer<typeof HouseBuild>

export const Build = z.discriminatedUnion('type', [
  HouseBuild,
])
export type Build = z.infer<typeof Build>

export const Technology = z.enum(['StoneTools'])
export type Technology = z.infer<typeof Technology>

export const Research = z.strictObject({
  technology: Technology,
  progress: z.number().gte(0).lt(1),
})
export type Research = z.infer<typeof Research>

export const TownEntity = z.strictObject({
  id: EntityId,
  type: z.literal(EntityType.enum.Town),
  connections: z.record(EntityId, z.literal(true)),
  position: ZodVec2,

  population: z.number().nonnegative(),
  averageAge: z.number().nonnegative(),

  nextChildTicks: z.number().positive(),

  houses: z.number().int().nonnegative(),
  storage: z.strictObject({
    food: z.number().nonnegative(),
    wood: z.number().nonnegative(),
    stone: z.number().nonnegative(),
  }),
  priority: z.strictObject({
    food: z.number().min(0).max(1),
    wood: z.number().min(0).max(1),
    stone: z.number().min(0).max(1),
    build: z.number().min(0).max(1),
    research: z.number().min(0).max(1),
  }),
  builds: Build.array(),
  researchQueue: Research.array(),
  technologies: z.record(Technology, z.literal(true)),
})
export type TownEntity = z.infer<typeof TownEntity>

export const ResourceEntity = z.strictObject({
  id: EntityId,
  type: z.literal(EntityType.enum.Resource),
  connections: z.record(EntityId, z.literal(true)),
  position: ZodVec2,

  resourceType: ResourceType,

  minYield: z.number().min(0).max(1),
  maxYield: z.number().min(0).max(1),

  maxYieldTicks: z.number().nonnegative(),
  tick: z.number().nonnegative(),
})
export type ResourceEntity = z.infer<typeof ResourceEntity>

export const Entity = z.discriminatedUnion('type', [
  TownEntity,
  ResourceEntity,
])
export type Entity = z.infer<typeof Entity>

export const World = z.strictObject({
  tick: z.number().int().positive(),
  nodes: z.record(NodeId, Node),
  rootNodeId: NodeId,
  nextNodeId: z.number(),

  entities: z.record(EntityId, Entity),
  nextEntityId: z.number(),
})
export type World = z.infer<typeof World>
