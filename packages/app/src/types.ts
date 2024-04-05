import * as z from 'zod'
import { Vec2 } from './vec2.js'

export type PointerId = number

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

export const World = z.strictObject({
  tick: z.number().int().positive(),
  nodes: z.record(NodeId, Node),
  rootNodeId: NodeId,
  nextNodeId: z.number(),
})
export type World = z.infer<typeof World>
