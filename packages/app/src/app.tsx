import { useEffect, useMemo } from 'react'
import { Updater, useImmer } from 'use-immer'
import { RenderRoot } from './render-root.js'
import { World } from './types.js'
import { initWorld, loadWorld, saveWorld } from './world.js'

export function App() {
  const [world, setWorld] = useWorld()
  useTickWorld(setWorld)
  return <RenderRoot world={world} />
}

function useWorld(): [World, Updater<World>] {
  const initial = useMemo(() => {
    return loadWorld() ?? initWorld()
  }, [])

  const [world, setWorld] = useImmer(initial)

  useEffect(() => {
    saveWorld(world)
  }, [world])

  return [world, setWorld]
}

function useTickWorld(setWorld: Updater<World>): void {
  useEffect(() => {
    const intervalId = self.setInterval(() => {
      setWorld((world) => {
        world.tick += 1
      })
    }, 100)
    return () => {
      self.clearInterval(intervalId)
    }
  }, [])
}
