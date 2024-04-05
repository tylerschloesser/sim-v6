import * as z from 'zod'
import { Vec2 } from './vec2.js'

export type PointerId = number
export type Cursor = Vec2

export const World = z.strictObject({
  tick: z.number().int().positive(),
})
export type World = z.infer<typeof World>
