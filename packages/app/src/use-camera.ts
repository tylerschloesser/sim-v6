import { useEffect, useRef, useState } from 'react'
import { ENABLE_SMOOTH_CAMERA, smooth } from './const.js'
import { Cursor } from './types.js'
import { Vec2 } from './vec2.js'

export function useCamera(cursor: Cursor): Vec2 {
  const [camera, setCamera] = useState(cursor)
  const cursorRef = useRef(cursor)

  useEffect(() => {
    if (ENABLE_SMOOTH_CAMERA) {
      cursorRef.current = cursor
    } else {
      setCamera(cursor)
    }
  }, [cursor])

  useEffect(() => {
    if (!ENABLE_SMOOTH_CAMERA) {
      return
    }
    let handle: number
    let lastStep = self.performance.now()
    function step() {
      const now = self.performance.now()
      const elapsed = (now - lastStep) / 1000
      lastStep = now
      setCamera((prev) => {
        if (prev === cursorRef.current) {
          return prev
        }
        const d = cursorRef.current.sub(prev)
        if (d.len() < 1e-3) {
          return cursorRef.current
        }
        return prev.add(
          d.norm().mul(smooth(d.len()) * elapsed),
        )
      })
      handle = self.requestAnimationFrame(step)
    }
    handle = self.requestAnimationFrame(step)
    return () => {
      self.cancelAnimationFrame(handle)
    }
  }, [])

  return camera
}
