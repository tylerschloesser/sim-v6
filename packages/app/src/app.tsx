import { useEffect, useMemo } from 'react'
import { createBrowserRouter } from 'react-router-dom'
import { Updater, useImmer } from 'use-immer'
import { AppContext, IAppContext } from './app-context.js'
import { RenderRoot } from './render-root.js'
import { World } from './types.js'
import { initWorld, loadWorld, saveWorld } from './world.js'

const router = createBrowserRouter([
  {
    index: true,
  },
])

export function App() {
  const [world, setWorld] = useWorld()
  useTickWorld(setWorld)

  const context: IAppContext = useMemo(
    () => ({ world }),
    [world],
  )

  return (
    <AppContext.Provider value={context}>
      <RenderRoot />
    </AppContext.Provider>
  )
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
