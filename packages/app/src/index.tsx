import { enableMapSet, enablePatches } from 'immer'
import { createRoot } from 'react-dom/client'
import invariant from 'tiny-invariant'
import { ZodError } from 'zod'
import { App } from './app.js'
import './index.scss'
import { loadWorld } from './world.js'

if (localStorage.getItem('reset') === 'true') {
  console.debug('reset')
  localStorage.clear()
}

await tryLoadWorld()

enablePatches()
enableMapSet()

const container = document.getElementById('root')
invariant(container)

createRoot(container).render(<App />)

async function tryLoadWorld() {
  try {
    loadWorld()
  } catch (e) {
    if (e instanceof ZodError) {
      if (self.confirm('Failed to parse world. Reset?')) {
        localStorage.clear()
        self.location.reload()
        await new Promise(() => {})
      }
    }
    throw e
  }
}
