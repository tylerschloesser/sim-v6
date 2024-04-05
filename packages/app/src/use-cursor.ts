import { useEffect, useMemo, useState } from 'react'
import { Cursor, ZodCursor } from './types.js'
import { Vec2 } from './vec2.js'

export function useCursor(): [
  Cursor,
  React.Dispatch<React.SetStateAction<Cursor>>,
] {
  const initial = useMemo(() => {
    const value = localStorage.getItem('cursor')
    if (value) {
      const zodCursor = ZodCursor.parse(JSON.parse(value))
      return {
        position: new Vec2(zodCursor.position),
        zoom: zodCursor.zoom,
      }
    }
    return {
      position: new Vec2(0, 0),
      zoom: 0.5,
    }
  }, [])
  const [cursor, setCursor] = useState<Cursor>(initial)
  useEffect(() => {
    localStorage.setItem('cursor', JSON.stringify(cursor))
  }, [cursor])
  return [cursor, setCursor]
}
