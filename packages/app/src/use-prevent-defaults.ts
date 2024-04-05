import { useEffect } from 'react'
import invariant from 'tiny-invariant'

export function usePreventDefaults(
  root: React.RefObject<Element>,
): void {
  useEffect(() => {
    const controller = new AbortController()
    const options: AddEventListenerOptions = {
      signal: controller.signal,
      passive: false,
    }
    function listener(ev: Event) {
      ev.preventDefault()
    }
    invariant(root.current)
    // prettier-ignore
    {
      // disable the bounce on desktop
      root.current.addEventListener('wheel', listener, options)

      // disable the swipe back/forward navigation on mobile
      root.current.addEventListener('touchcancel', listener, options)
      root.current.addEventListener('touchend', listener, options)
      root.current.addEventListener('touchstart', listener, options)
    }
    return () => {
      controller.abort()
    }
  }, [])
}
