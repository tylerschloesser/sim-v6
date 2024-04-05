import { Cursor } from './types.js'
import { Vec2 } from './vec2.js'

export function useCamera(cursor: Cursor): Vec2 {
  return cursor.position
}
