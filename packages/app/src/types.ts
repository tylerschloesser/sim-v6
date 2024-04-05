import * as z from 'zod'
import { Vec2 } from './vec2.js'

export type PointerId = number
export type Cursor = Vec2

export const NodeType = z.enum(['Root', 'Branch', 'Leaf'])
export type NodeType = z.infer<typeof NodeType>

export const NodeId = z.string()
export type NodeId = z.infer<typeof NodeId>

export const LeafNode = z.strictObject({
  id: NodeId,
  type: z.literal(NodeType.enum.Leaf),
})
export type LeafNode = z.infer<typeof LeafNode>

export const BranchNode = z.strictObject({
  id: NodeId,
  type: z.literal(NodeType.enum.Branch),
  childIds: NodeId.array(),
})
export type BranchNode = z.infer<typeof BranchNode>

export const RootNode = z.strictObject({
  id: NodeId,
  type: z.literal(NodeType.enum.Root),
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
