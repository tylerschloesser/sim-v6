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

export const EntityType = z.enum(['Town', 'FoodSource'])
export type EntityType = z.infer<typeof EntityType>

export const StorageValue = z.strictObject({
  count: z.number().nonnegative(),
  delta: z.number(),
})
export type StorageValue = z.infer<typeof StorageValue>

export const TownEntity = z.strictObject({
  id: EntityId,
  type: z.literal(EntityType.enum.Town),
  connections: z.record(EntityId, z.literal(true)),
  population: z.number().nonnegative(),
  storage: z.strictObject({
    food: StorageValue,
    wood: StorageValue,
  }),
  priority: z.strictObject({
    food: z.number().min(0).max(1),
    wood: z.number().min(0).max(1),
  }),
})
export type TownEntity = z.infer<typeof TownEntity>

export const FoodSourceEntity = z.strictObject({
  id: EntityId,
  connections: z.record(EntityId, z.literal(true)),
  type: z.literal(EntityType.enum.FoodSource),
})
export type FoodSourceEntity = z.infer<
  typeof FoodSourceEntity
>

export const Entity = z.discriminatedUnion('type', [
  TownEntity,
  FoodSourceEntity,
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
