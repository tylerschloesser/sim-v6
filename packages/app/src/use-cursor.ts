import { useEffect, useMemo, useState } from 'react'
import * as z from 'zod'
import { Cursor } from './types.js'
import { Vec2 } from './vec2.js'

export function useCursor(): [
  Cursor,
  React.Dispatch<React.SetStateAction<Cursor>>,
] {
  const initial = useMemo(() => {
    const value = localStorage.getItem('cursor')
    if (value) {
      return new Vec2(
        z
          .strictObject({
            x: z.number(),
            y: z.number(),
          })
          .parse(JSON.parse(value)),
      )
    }
    return new Vec2(0, 0)
  }, [])
  const [cursor, setCursor] = useState<Cursor>(initial)
  useEffect(() => {
    localStorage.setItem('cursor', JSON.stringify(cursor))
  }, [cursor])
  return [cursor, setCursor]
}
